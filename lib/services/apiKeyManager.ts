export interface KeyStatus {
  key: string;
  provider: 'anthropic' | 'gemini';
  isActive: boolean;
  failureCount: number;
  rateLimitedUntil: number;
  totalCalls: number;
  lastUsedAt: number;
}

export type TaskComplexity = 'complex' | 'simple';

export class SmartKeyManager {
  private static anthropicKeys: KeyStatus[] = [];
  private static geminiKeys: KeyStatus[] = [];
  private static initialized = false;

  private static initializeKeys() {
    if (this.initialized) return;

    // Load Anthropic Keys
    const rawAnthropic = process.env.ANTHROPIC_API_KEYS || process.env.ANTHROPIC_API_KEY || '';
    const rawAnthropicList = rawAnthropic
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 5);

    this.anthropicKeys = rawAnthropicList.map((key) => ({
      key,
      provider: 'anthropic',
      isActive: true,
      failureCount: 0,
      rateLimitedUntil: 0,
      totalCalls: 0,
      lastUsedAt: 0,
    }));

    // Load Gemini Keys
    const rawGemini = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '';
    const rawGeminiList = rawGemini
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 5);

    this.geminiKeys = rawGeminiList.map((key) => ({
      key,
      provider: 'gemini',
      isActive: true,
      failureCount: 0,
      rateLimitedUntil: 0,
      totalCalls: 0,
      lastUsedAt: 0,
    }));

    this.initialized = true;
  }

  /**
   * Select best active key for provider. If rate limited, un-mark after timeout.
   */
  public static getActiveKey(provider: 'anthropic' | 'gemini'): string | null {
    this.initializeKeys();
    const list = provider === 'anthropic' ? this.anthropicKeys : this.geminiKeys;
    const now = Date.now();

    for (const item of list) {
      if (item.rateLimitedUntil > 0 && now >= item.rateLimitedUntil) {
        item.rateLimitedUntil = 0;
        item.failureCount = Math.max(0, item.failureCount - 1);
        item.isActive = true;
      }

      if (item.isActive && item.failureCount < 5) {
        item.totalCalls++;
        item.lastUsedAt = now;
        return item.key;
      }
    }

    // Fallback to first key if all marked inactive
    if (list.length > 0) {
      return list[0].key;
    }

    return null;
  }

  /**
   * Report success for a key
   */
  public static reportSuccess(provider: 'anthropic' | 'gemini', key: string, latencyMs: number) {
    this.initializeKeys();
    const list = provider === 'anthropic' ? this.anthropicKeys : this.geminiKeys;
    const item = list.find((k) => k.key === key);
    if (item) {
      item.failureCount = Math.max(0, item.failureCount - 1);
      const maskedKey = key.slice(0, 6) + '...' + key.slice(-4);
      console.log(`[SmartKeyManager] Success (${provider.toUpperCase()}) | Key: ${maskedKey} | Latency: ${latencyMs}ms`);
    }
  }

  /**
   * Report failure / rate limit / quota error for a key
   */
  public static reportFailure(provider: 'anthropic' | 'gemini', key: string, statusCode?: number, errorMsg?: string) {
    this.initializeKeys();
    const list = provider === 'anthropic' ? this.anthropicKeys : this.geminiKeys;
    const item = list.find((k) => k.key === key);
    if (item) {
      item.failureCount++;
      const maskedKey = key.slice(0, 6) + '...' + key.slice(-4);

      if (statusCode === 429) {
        // Rate limited — pause key for 15 minutes
        item.rateLimitedUntil = Date.now() + 15 * 60 * 1000;
        console.warn(`[SmartKeyManager] RATE LIMITED (${provider}) | Key: ${maskedKey} | Paused 15m`);
      } else if (statusCode === 401 || statusCode === 403) {
        // Invalid or expired key
        item.isActive = false;
        console.error(`[SmartKeyManager] INVALID/EXPIRED KEY (${provider}) | Key: ${maskedKey} | Disabled`);
      } else if (item.failureCount >= 3) {
        // Mark inactive after 3 consecutive failures
        item.isActive = false;
        console.warn(`[SmartKeyManager] TOO MANY FAILURES (${provider}) | Key: ${maskedKey} | Marked inactive (${item.failureCount} errors)`);
      } else {
        console.warn(`[SmartKeyManager] Error (${provider}) | Key: ${maskedKey} | Status: ${statusCode || 'Unknown'} | ${errorMsg || ''}`);
      }

      // Quota Alert: Check if all keys for this provider are down
      const activeCount = list.filter((k) => k.isActive).length;
      if (activeCount === 0) {
        console.error(`🚨 [QUOTA ALERT] ALL ${provider.toUpperCase()} API KEYS ARE INACTIVE OR RATE LIMITED!`);
      }
    }
  }

  /**
   * Determine model configuration based on task complexity
   */
  public static getModelConfig(provider: 'anthropic' | 'gemini', task: TaskComplexity) {
    if (provider === 'anthropic') {
      return {
        model: 'claude-3-5-haiku-20241022',
        maxTokens: task === 'complex' ? 1500 : 350,
        temperature: task === 'complex' ? 0.75 : 0.85,
        timeoutMs: task === 'complex' ? 8000 : 4500,
      };
    } else {
      return {
        model: 'gemini-1.5-flash',
        maxTokens: task === 'complex' ? 1500 : 350,
        temperature: task === 'complex' ? 0.75 : 0.85,
        timeoutMs: task === 'complex' ? 8000 : 4500,
      };
    }
  }
}

import { GiftSuggestion, Product, QuizAnswers } from '@/types';

// ─── Cache entry structure ───────────────────────────────────────────────────
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function getCached<T>(key: string): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCached<T>(key: string, data: T, ttlMs = CACHE_TTL_MS): void {
  memoryCache.set(key, { data, expiresAt: Date.now() + ttlMs });
  // Evict old items if cache exceeds 500 entries
  if (memoryCache.size > 500) {
    const oldestKey = memoryCache.keys().next().value;
    if (oldestKey) memoryCache.delete(oldestKey);
  }
}

// ─── Timeout Fetch Wrapper with Retries ──────────────────────────────────────
async function fetchWithTimeoutAndRetry(
  url: string,
  options: RequestInit,
  timeoutMs = 8000,
  maxRetries = 2
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      if (attempt > 0) {
        // Exponential backoff delay: 400ms, 800ms
        await new Promise((r) => setTimeout(r, 400 * Math.pow(2, attempt - 1)));
      }

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timer);

      // Retry on server-side errors (5xx) or rate limits (429)
      if (response.status >= 500 || response.status === 429) {
        lastError = new Error(`Server status ${response.status}`);
        continue;
      }

      return response;
    } catch (err: unknown) {
      clearTimeout(timer);
      const isAbort = err instanceof Error && err.name === 'AbortError';
      lastError = isAbort
        ? new Error(`Request timed out after ${timeoutMs}ms`)
        : err instanceof Error
        ? err
        : new Error(String(err));
    }
  }

  throw lastError || new Error('Request failed after retries');
}

// ─── JSON Sanitizer / Validator ──────────────────────────────────────────────
export function sanitizeSuggestions(raw: unknown[]): GiftSuggestion[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .map((item, index) => ({
      id: `sg_ai_${index}_${Date.now()}`,
      productName: String(item.productName || 'Món quà ý nghĩa').trim(),
      reason: String(item.reason || 'Sản phẩm phù hợp với tiêu chí của bạn.').trim(),
      estimatedPriceRange: String(item.estimatedPriceRange || '200.000đ – 500.000đ').trim(),
      searchKeyword: String(item.searchKeyword || item.productName || 'quà tặng').trim(),
      emoji: String(item.emoji || '🎁').trim(),
      category: String(item.category || 'Gợi ý quà').trim(),
    }));
}

export function sanitizeProducts(raw: unknown[]): Product[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .map((item, index) => {
      const price = typeof item.price === 'number' && item.price > 0 ? item.price : 250000;
      const originalPrice = typeof item.originalPrice === 'number' ? item.originalPrice : Math.round(price * 1.25);
      const rating = typeof item.rating === 'number' && item.rating > 0 ? item.rating : 4.8;
      const reviewCount = typeof item.reviewCount === 'number' ? item.reviewCount : 1200;
      const sold = typeof item.sold === 'number' ? item.sold : 3500;
      const source = item.source === 'tiktok' ? 'tiktok' : 'shopee';

      return {
        id: `ai_prod_${index}_${Date.now()}`,
        name: String(item.name || 'Sản phẩm quà tặng').trim(),
        price,
        originalPrice,
        imageUrl: String(item.imageUrl || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&h=600&fit=crop&q=90'),
        rating,
        reviewCount,
        sold,
        source,
        affiliateLink: String(item.affiliateLink || `https://shopee.vn/search?keyword=${encodeURIComponent(String(item.name || 'quà'))}`).trim(),
        discount: Math.round(((originalPrice - price) / originalPrice) * 100),
        badge: item.badge ? String(item.badge) : undefined,
        sizes: Array.isArray(item.sizes) ? item.sizes.map(String) : undefined,
      };
    });
}

// ─── AI Service Class ────────────────────────────────────────────────────────
export class AIService {
  /**
   * Generate 9 personalized gift suggestions using Claude or Gemini API with caching & retries.
   */
  static async getGiftSuggestions(answers: QuizAnswers): Promise<{ suggestions: GiftSuggestion[]; source: 'cache' | 'ai' | 'fallback' }> {
    // 1. Check cache
    const cacheKey = `suggest_${JSON.stringify(answers)}`;
    const cached = getCached<GiftSuggestion[]>(cacheKey);
    if (cached) {
      return { suggestions: cached, source: 'cache' };
    }

    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    // 2. Call Anthropic Claude API if key exists
    if (anthropicKey) {
      try {
        const startTime = Date.now();
        const prompt = AIService.buildSuggestPrompt(answers);

        const response = await fetchWithTimeoutAndRetry(
          'https://api.anthropic.com/v1/messages',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': anthropicKey,
              'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
              model: 'claude-3-5-haiku-20241022',
              max_tokens: 1500, // optimized token count
              messages: [{ role: 'user', content: prompt }],
            }),
          },
          8000,
          2
        );

        const data = await response.json();
        const text = data.content?.[0]?.text || '';
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          const suggestions = sanitizeSuggestions(parsed.suggestions);
          if (suggestions.length > 0) {
            console.log(`[AIService] Claude suggest-gifts success in ${Date.now() - startTime}ms`);
            setCached(cacheKey, suggestions);
            return { suggestions, source: 'ai' };
          }
        }
      } catch (err) {
        console.warn('[AIService] Claude suggest-gifts failed, trying next provider:', err);
      }
    }

    // 3. Fallback: Call Google Gemini REST API if GEMINI_API_KEY exists
    if (geminiKey) {
      try {
        const startTime = Date.now();
        const prompt = AIService.buildSuggestPrompt(answers);

        const response = await fetchWithTimeoutAndRetry(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 1500 },
            }),
          },
          8000,
          2
        );

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          const suggestions = sanitizeSuggestions(parsed.suggestions);
          if (suggestions.length > 0) {
            console.log(`[AIService] Gemini suggest-gifts success in ${Date.now() - startTime}ms`);
            setCached(cacheKey, suggestions);
            return { suggestions, source: 'ai' };
          }
        }
      } catch (err) {
        console.warn('[AIService] Gemini suggest-gifts failed:', err);
      }
    }

    return { suggestions: [], source: 'fallback' };
  }

  /**
   * Generate 6 specific online products using Claude or Gemini API.
   */
  static async getOnlineProducts(
    keyword: string,
    giftName: string
  ): Promise<{ products: Product[]; source: 'cache' | 'ai' | 'fallback' }> {
    const cacheKey = `products_${keyword.toLowerCase().trim()}_${giftName.toLowerCase().trim()}`;
    const cached = getCached<Product[]>(cacheKey);
    if (cached) {
      return { products: cached, source: 'cache' };
    }

    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    const prompt = `Bạn là chuyên gia gợi ý sản phẩm thương mại điện tử Việt Nam.
Người dùng muốn tìm mua: "${giftName || keyword}"
Từ khóa tìm kiếm: "${keyword}"

Hãy tạo 6 SẢN PHẨM CỤ THỂ ĐÚNG CHÍNH XÁC VỚI "${giftName || keyword}" đang bán trên Shopee hoặc TikTok Shop Việt Nam.
Yêu cầu:
1. Sản phẩm phải ĐÚNG loại "${giftName || keyword}" — không đổi sang loại khác.
2. Tên sản phẩm rõ ràng có thương hiệu + dòng + thông số.
3. Giá cả hợp lý thực tế thị trường VNĐ.
4. imageUrl: chọn 1 ảnh Unsplash đẹp phù hợp chuẩn (vd: https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=600&fit=crop&q=90).

Trả về CHỈ JSON theo định dạng exact:
{"products":[{"id":"p1","name":"...","price":250000,"originalPrice":320000,"imageUrl":"https://...","rating":4.9,"reviewCount":1500,"sold":4200,"source":"shopee","affiliateLink":"https://shopee.vn/search?keyword=...","discount":21,"badge":"Bán chạy"}]}`;

    // 1. Anthropic Claude
    if (anthropicKey) {
      try {
        const startTime = Date.now();
        const response = await fetchWithTimeoutAndRetry(
          'https://api.anthropic.com/v1/messages',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': anthropicKey,
              'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
              model: 'claude-3-5-haiku-20241022',
              max_tokens: 1200,
              messages: [{ role: 'user', content: prompt }],
            }),
          },
          8000,
          2
        );

        const data = await response.json();
        const text = data.content?.[0]?.text || '';
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          const products = sanitizeProducts(parsed.products);
          if (products.length > 0) {
            console.log(`[AIService] Claude search-online success in ${Date.now() - startTime}ms`);
            setCached(cacheKey, products);
            return { products, source: 'ai' };
          }
        }
      } catch (err) {
        console.warn('[AIService] Claude search-online failed:', err);
      }
    }

    // 2. Gemini
    if (geminiKey) {
      try {
        const startTime = Date.now();
        const response = await fetchWithTimeoutAndRetry(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 1200 },
            }),
          },
          8000,
          2
        );

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          const products = sanitizeProducts(parsed.products);
          if (products.length > 0) {
            console.log(`[AIService] Gemini search-online success in ${Date.now() - startTime}ms`);
            setCached(cacheKey, products);
            return { products, source: 'ai' };
          }
        }
      } catch (err) {
        console.warn('[AIService] Gemini search-online failed:', err);
      }
    }

    return { products: [], source: 'fallback' };
  }

  private static buildSuggestPrompt(answers: QuizAnswers): string {
    return `Bạn là chuyên gia tặng quà Việt Nam hàng đầu. Phân tích hồ sơ người nhận và gợi ý 9 quà tặng CHÍNH XÁC NHẤT.

HỒ SƠ NGƯỜI NHẬN:
- Dịp tặng: ${answers.occasion}
- Mối quan hệ: ${answers.relationship}
- Giới tính: ${answers.gender}
- Độ tuổi: ${answers.ageRange}
- Cung hoàng đạo: ${answers.zodiac || 'Không rõ'}
- Tính cách: ${(answers.personality || []).join(', ')}
- Sở thích: ${(answers.interests || []).join(', ')}
- Ngân sách: ${answers.budget}

YÊU CẦU QUAN TRỌNG:
1. Mức giá ước tính PHẢI nằm trong dải ngân sách ${answers.budget}.
2. Đề xuất kết hợp cả đồ dùng vật chất lẫn quà trải nghiệm (vé concert, spa, vé xem phim, khóa học).
3. Lý do gợi ý cá nhân hóa sâu sắc (2-3 câu thuyết phục dựa vào tính cách/sở thích).
4. Trả về CHỈ JSON theo định dạng sau (không có Markdown hay chữ ngoài JSON):

{"suggestions":[{"productName":"...","reason":"...","estimatedPriceRange":"XXXđ – YYYđ","searchKeyword":"từ khóa tìm Shopee","emoji":"🎁","category":"danh mục"}]}`;
  }
}

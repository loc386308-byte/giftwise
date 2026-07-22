import { Product, GiftSuggestion, QuizAnswers, GreetingCardRequest, GreetingCardResponse } from '@/types';
import { SmartKeyManager } from './apiKeyManager';

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
    .filter((item) => {
      const name = String(item.productName || '').toLowerCase();
      const cat = String(item.category || '').toLowerCase();
      const isVoucherOrTicket =
        name.includes('vé ') ||
        name.includes('voucher') ||
        name.includes('coupon') ||
        name.includes('gift card') ||
        name.includes('thẻ quà tặng') ||
        cat.includes('vé') ||
        cat.includes('voucher');
      return !isVoucherOrTicket;
    })
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

// ─── High-Definition Verified Product Image Resolver ────────────────────────
const PRODUCT_IMAGE_MAP: Array<{ keywords: string[]; url: string }> = [
  { keywords: ['son', 'lip', 'romand', 'tint', 'makeup'], url: 'https://images.unsplash.com/photo-1586495777744-4e6b0864a597?w=600&h=600&fit=crop&q=90' },
  { keywords: ['kem chống nắng', 'sunscreen', 'la roche', 'anthelios'], url: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=600&fit=crop&q=90' },
  { keywords: ['mặt nạ', 'mask', 'innisfree', 'clay'], url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&h=600&fit=crop&q=90' },
  { keywords: ['gương', 'mirror', 'led hollywood'], url: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600&h=600&fit=crop&q=90' },
  { keywords: ['máy rửa mặt', 'foreo', 'rửa mặt'], url: 'https://images.unsplash.com/photo-1519764622345-23439dd774f7?w=600&h=600&fit=crop&q=90' },
  { keywords: ['serum', 'sk-ii', 'paula', 'dưỡng da', 'skincare'], url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop&q=90' },
  { keywords: ['nước hoa', 'perfume', 'chanel', 'dior', 'sauvage'], url: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&h=600&fit=crop&q=90' },
  { keywords: ['nến', 'candle', 'diptyque', 'yankee'], url: 'https://images.unsplash.com/photo-1602523961358-f9f03dd557db?w=600&h=600&fit=crop&q=90' },
  { keywords: ['airpods', 'tai nghe apple'], url: 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=600&h=600&fit=crop&q=90' },
  { keywords: ['tai nghe', 'headphone', 'headset', 'arctis', 'steelseries'], url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&h=600&fit=crop&q=90' },
  { keywords: ['loa', 'jbl', 'speaker'], url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop&q=90' },
  { keywords: ['pin dự phòng', 'anker', 'powerbank', 'sạc'], url: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&h=600&fit=crop&q=90' },
  { keywords: ['bàn phím', 'keychron', 'keyboard'], url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=600&fit=crop&q=90' },
  { keywords: ['tay cầm', 'xbox', 'controller'], url: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=600&h=600&fit=crop&q=90' },
  { keywords: ['đồng hồ', 'apple watch', 'smartwatch', 'daniel wellington'], url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&h=600&fit=crop&q=90' },
  { keywords: ['ví', 'wallet', 'leather'], url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&h=600&fit=crop&q=90' },
  { keywords: ['giày', 'sneaker', 'adidas', 'nike', 'stan smith'], url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop&q=90' },
  { keywords: ['túi tote', 'canvas', 'túi vải'], url: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600&h=600&fit=crop&q=90' },
  { keywords: ['túi', 'túi xách', 'baguette', 'handbag'], url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop&q=90' },
  { keywords: ['sách', 'book', 'atomic habits', 'đắc nhân tâm'], url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=600&fit=crop&q=90' },
  { keywords: ['sổ', 'journal', 'planner', 'leuchtturm'], url: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&h=600&fit=crop&q=90' },
  { keywords: ['bình giữ nhiệt', 'stanley', 'tumbler', 'lock'], url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=600&fit=crop&q=90' },
  { keywords: ['lắc tay', 'vòng tay', 'bạc s925'], url: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=600&fit=crop&q=90' },
  { keywords: ['trang sức', 'dây chuyền', 'nhẫn', 'jewelry', 'vàng 18k'], url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop&q=90' },
  { keywords: ['nồi chiên', 'bếp', 'philips', 'nồi'], url: 'https://images.unsplash.com/photo-1648462560743-5e5c6b62b86e?w=600&h=600&fit=crop&q=90' },
  { keywords: ['cà phê', 'nespresso', 'coffee'], url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=600&fit=crop&q=90' },
  { keywords: ['matcha', 'trà'], url: 'https://images.unsplash.com/photo-1572635148818-ef6fd45eb394?w=600&h=600&fit=crop&q=90' },
  { keywords: ['spa', 'massage', 'voucher spa'], url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=600&fit=crop&q=90' },
  { keywords: ['kính', 'ray-ban', 'sunglasses'], url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&h=600&fit=crop&q=90' },
  { keywords: ['sáp', 'layrite', 'pomade', 'vuốt tóc'], url: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=600&h=600&fit=crop&q=90' },
  { keywords: ['balo', 'thule', 'backpack'], url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop&q=90' },
  { keywords: ['đèn led', 'govee', 'rgb'], url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop&q=90' },
  { keywords: ['lót chuột', 'mousepad', 'rog'], url: 'https://images.unsplash.com/photo-1593640408182-31c228eb60cd?w=600&h=600&fit=crop&q=90' },
  { keywords: ['netflix', 'steam', 'spotify', 'thẻ nạp'], url: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=600&h=600&fit=crop&q=90' },
];

export function resolveProductImage(productName: string, rawUrl?: string): string {
  // If rawUrl is a valid Unsplash photo URL with a specific real photo id (not fake photo-XXXX), use it
  if (rawUrl && rawUrl.startsWith('https://images.unsplash.com/photo-') && !rawUrl.includes('photo-XXXX')) {
    return rawUrl;
  }
  const nameL = productName.toLowerCase();
  for (const entry of PRODUCT_IMAGE_MAP) {
    if (entry.keywords.some((kw) => nameL.includes(kw))) {
      return entry.url;
    }
  }
  return 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&h=600&fit=crop&q=90';
}

export function parseVndPrice(raw: unknown, defaultPrice = 250000): number {
  if (typeof raw === 'number' && !isNaN(raw)) {
    if (raw <= 0) return defaultPrice;
    // AI returned price in thousands (e.g. 150 -> 150,000đ, 2490 -> 2,490,000đ)
    if (raw < 1000) return Math.round(raw * 1000);
    return Math.round(raw);
  }
  if (typeof raw === 'string') {
    let clean = raw.toLowerCase().trim();
    const isK = clean.endsWith('k');
    clean = clean.replace(/[^0-9]/g, '');
    let num = parseInt(clean, 10);
    if (isNaN(num) || num <= 0) return defaultPrice;
    if (isK || num < 1000) num *= 1000;
    return num;
  }
  return defaultPrice;
}

export function sanitizeProducts(raw: unknown[]): Product[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .map((item, index) => {
      const name = String(item.name || 'Sản phẩm quà tặng').trim();
      const price = parseVndPrice(item.price, 250000);
      const parsedOriginal = parseVndPrice(item.originalPrice, 0);
      const originalPrice = parsedOriginal > price ? parsedOriginal : Math.round(price * 1.25);
      const rating = typeof item.rating === 'number' && item.rating > 0 ? Math.min(5, Math.max(4.0, item.rating)) : 4.8;
      const reviewCount = typeof item.reviewCount === 'number' ? item.reviewCount : 1200;
      const sold = typeof item.sold === 'number' ? item.sold : 3500;
      const source = item.source === 'tiktok' ? 'tiktok' : 'shopee';
      const imageUrl = resolveProductImage(name, typeof item.imageUrl === 'string' ? item.imageUrl : undefined);
      const discount = Math.max(5, Math.min(75, Math.round(((originalPrice - price) / originalPrice) * 100)));

      return {
        id: `ai_prod_${index}_${Date.now()}`,
        name,
        price,
        originalPrice,
        imageUrl,
        rating,
        reviewCount,
        sold,
        source,
        affiliateLink: String(item.affiliateLink || `https://shopee.vn/search?keyword=${encodeURIComponent(name)}`).trim(),
        discount,
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

    const anthropicKey = SmartKeyManager.getActiveKey('anthropic');
    const geminiKey = SmartKeyManager.getActiveKey('gemini');

    // 2. Call Anthropic Claude API if key exists
    if (anthropicKey) {
      try {
        const startTime = Date.now();
        const prompt = AIService.buildSuggestPrompt(answers);
        const config = SmartKeyManager.getModelConfig('anthropic', 'complex');

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
              model: config.model,
              max_tokens: config.maxTokens,
              temperature: config.temperature,
              messages: [{ role: 'user', content: prompt }],
            }),
          },
          config.timeoutMs,
          2
        );

        const data = await response.json();
        const text = data.content?.[0]?.text || '';
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          const suggestions = sanitizeSuggestions(parsed.suggestions);
          if (suggestions.length > 0) {
            SmartKeyManager.reportSuccess('anthropic', anthropicKey, Date.now() - startTime);
            setCached(cacheKey, suggestions);
            return { suggestions, source: 'ai' };
          }
        }
      } catch (err: unknown) {
        SmartKeyManager.reportFailure('anthropic', anthropicKey, undefined, String(err));
      }
    }

    // 3. Fallback: Call Google Gemini REST API if GEMINI_API_KEY exists
    if (geminiKey) {
      try {
        const startTime = Date.now();
        const prompt = AIService.buildSuggestPrompt(answers);
        const config = SmartKeyManager.getModelConfig('gemini', 'complex');

        const response = await fetchWithTimeoutAndRetry(
          `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: 'application/json', maxOutputTokens: config.maxTokens, temperature: config.temperature },
            }),
          },
          config.timeoutMs,
          2
        );

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          const suggestions = sanitizeSuggestions(parsed.suggestions);
          if (suggestions.length > 0) {
            SmartKeyManager.reportSuccess('gemini', geminiKey, Date.now() - startTime);
            setCached(cacheKey, suggestions);
            return { suggestions, source: 'ai' };
          }
        }
      } catch (err: unknown) {
        SmartKeyManager.reportFailure('gemini', geminiKey, undefined, String(err));
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

    const anthropicKey = SmartKeyManager.getActiveKey('anthropic');
    const geminiKey = SmartKeyManager.getActiveKey('gemini');

    const prompt = `Bạn là chuyên gia gợi ý sản phẩm thương mại điện tử Việt Nam.
Người dùng muốn tìm mua: "${giftName || keyword}"
Từ khóa tìm kiếm: "${keyword}"

Hãy tạo 6 SẢN PHẨM CỤ THỂ ĐÚNG CHÍNH XÁC VỚI "${giftName || keyword}" đang bán trên Shopee hoặc TikTok Shop Việt Nam.
Yêu cầu:
1. Sản phẩm phải ĐÚNG loại "${giftName || keyword}" — không đổi sang loại khác.
2. Tên sản phẩm rõ ràng có thương hiệu + dòng + thông số.
3. Giá cả (price, originalPrice) PHẢI LÀ SỐ NGUYÊN ĐẦY ĐỦ TÍNH BẰNG VNĐ (ví dụ: 250000 hoặc 1890000, TUYỆT ĐỐI KHÔNG ghi tắt 250 hay 150k).

Trả về CHỈ JSON theo định dạng exact:
{"products":[{"id":"p1","name":"...","price":250000,"originalPrice":320000,"rating":4.9,"reviewCount":1500,"sold":4200,"source":"shopee","affiliateLink":"https://shopee.vn/search?keyword=...","discount":21,"badge":"Bán chạy"}]}`;

    // 1. Anthropic Claude
    if (anthropicKey) {
      try {
        const startTime = Date.now();
        const config = SmartKeyManager.getModelConfig('anthropic', 'complex');
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
              model: config.model,
              max_tokens: 1200,
              messages: [{ role: 'user', content: prompt }],
            }),
          },
          config.timeoutMs,
          2
        );

        const data = await response.json();
        const text = data.content?.[0]?.text || '';
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          const products = sanitizeProducts(parsed.products);
          if (products.length > 0) {
            SmartKeyManager.reportSuccess('anthropic', anthropicKey, Date.now() - startTime);
            setCached(cacheKey, products);
            return { products, source: 'ai' };
          }
        }
      } catch (err: unknown) {
        SmartKeyManager.reportFailure('anthropic', anthropicKey, undefined, String(err));
      }
    }

    // 2. Gemini
    if (geminiKey) {
      try {
        const startTime = Date.now();
        const config = SmartKeyManager.getModelConfig('gemini', 'complex');
        const response = await fetchWithTimeoutAndRetry(
          `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 1200 },
            }),
          },
          config.timeoutMs,
          2
        );

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          const products = sanitizeProducts(parsed.products);
          if (products.length > 0) {
            SmartKeyManager.reportSuccess('gemini', geminiKey, Date.now() - startTime);
            setCached(cacheKey, products);
            return { products, source: 'ai' };
          }
        }
      } catch (err: unknown) {
        SmartKeyManager.reportFailure('gemini', geminiKey, undefined, String(err));
      }
    }

    return { products: [], source: 'fallback' };
  }

  private static buildSuggestPrompt(answers: QuizAnswers): string {
    return `Bạn là một Chuyên Gia Tư Vấn Quà Tặng Cá Nhân Hóa (Gift Advisor) tại Việt Nam với 10 năm kinh nghiệm.
Nhiệm vụ của bạn là phân tích sâu hồ sơ người nhận dựa trên các tiêu chí khảo sát và đề xuất danh sách 9 MÓN QUÀ VẬT THỂ VƯỢT TRỘI, ĐA DẠNG & THUYẾT PHỤC NHẤT.

============================================================
🎯 HỒ SƠ TIÊU CHÍ NGƯỜI NHẬN QUÀ:
1. Dịp tặng quà: ${answers.occasion} (Định hướng không khí & tính chất món quà)
2. Mối quan hệ: ${answers.relationship} (Quyết định mức độ thân mật, tính riêng tư hay sự lịch thiệp)
3. Giới tính người nhận: ${answers.gender} (Bối cảnh phong cách & thẩm mỹ)
4. Nhóm độ tuổi: ${answers.ageRange} (Định hình xu hướng tiêu dùng & tính ứng dụng)
5. Cung hoàng đạo: ${answers.zodiac || 'Chưa rõ'} (Tính cách chiêm tinh & yếu tố may mắn/thẩm mỹ)
6. Đặc điểm tính cách: ${(answers.personality || []).join(', ') || 'Chưa chọn'} (Phong cách sống & sở thích cá nhân)
7. Lĩnh vực sở thích: ${(answers.interests || []).join(', ') || 'Chưa chọn'} (Đam mê & hoạt động thường nhật)
8. Ngân sách dự kiến: ${answers.budget} (Ràng buộc khoảng giá thực tế)
${answers.customDescription?.trim() ? `9. MÔ TẢ TỰ DO BỔ SUNG TỪ NGƯỜI TẶNG: "${answers.customDescription.trim()}"` : ''}

============================================================
⚠️ NGUYÊN TẮC ĐA DẠNG & CHÍNH XÁC BẮT BUỘC (STRICT RULES):
1. GIÁ CẢ: Tất cả 9 gợi ý PHẢI có mức giá thực tế nằm đúng dải ngân sách "${answers.budget}". Phân bổ trải đều từ dải giá thấp đến dải giá cao nhất trong khoảng ngân sách.
2. ĐA DẠNG DANH MỤC: 9 món quà PHẢI thuộc ít nhất 5–6 danh mục KHÁC NHAU (ví dụ: Thời trang/Phụ kiện, Công nghệ, Trang sức, Làm đẹp/Skincare, Decor/Phòng ngủ, Sách/Sổ tay, Gia dụng/Bếp...). KHÔNG LẶP LẠI quá 2 món trong cùng 1 danh mục.
3. CHỈ MÓN QUÀ VẬT THỂ: Tuyệt đối KHÔNG gợi ý các loại vé (vé phim, concert...) hoặc voucher/giftcard.
4. ƯU TIÊN MÔ TẢ TỰ DO: ${answers.customDescription?.trim() ? 'Mô tả tự do chứa các chi tiết đặc thù rất quan trọng. Nếu mô tả mâu thuẫn với câu chọn trắc nghiệm, HÃY ƯU TIÊN MÔ TẢ TỰ DO và giải thích rõ yếu tố này trong lý do!' : 'Lý do gợi ý 2-3 câu ngắn gọn thuyết phục.'}
5. LÝ DO CÁ NHÂN HÓA (REASON): Mỗi món quà phải có lý do chọn 2-3 câu thuyết phục, giải thích ĐÚNG TẠI SAO món này hợp với [Tính cách] + [Sở thích] + [Mô tả riêng] của người nhận.

============================================================
📌 VÍ DỤ MẪU KẾT QUẢ ĐẠT CHUẨN (FEW-SHOT EXAMPLE):
{
  "suggestions": [
    {
      "productName": "Son Kem Lì Romand Zero Velvet Tint #25 Mauve Beach",
      "category": "Son môi & Trang điểm",
      "estimatedPriceRange": "150.000đ – 190.000đ",
      "reason": "Tông màu hồng đất chuẩn Hàn Quốc hợp với phong cách nhẹ nhàng của bạn gái. Chất son mịn lì không khô môi, thích hợp đeo đi làm lẫn đi chơi hàng ngày.",
      "searchKeyword": "son romand zero velvet tint 25",
      "emoji": "💄"
    },
    {
      "productName": "Loa Bluetooth JBL Flip 6 Chống Nước IP67",
      "category": "Công nghệ & Âm thanh",
      "estimatedPriceRange": "1.800.000đ – 2.100.000đ",
      "reason": "Âm bass mạnh mẽ đáp ứng đúng sở thích nghe nhạc năng động của bạn thân. Thiết kế chống nước IP67 bền bỉ cho các chuyến du lịch hay hoạt động ngoài trời.",
      "searchKeyword": "loa jbl flip 6 chính hãng",
      "emoji": "🔊"
    }
  ]
}

============================================================
CHỈ TRẢ VỀ JSON HỢP LỆ THEO ĐÚNG CẤU TRÚC TRÊN (KHÔNG VIẾT CHỮ NGOÀI JSON):
{"suggestions":[{"productName":"...","category":"...","estimatedPriceRange":"...","reason":"...","searchKeyword":"...","emoji":"..."}]}`;
  }

  /**
   * Fast personalized greeting card generator
   */
  static async generateGreetingCard(params: GreetingCardRequest): Promise<GreetingCardResponse> {
    const toneLabels = {
      warm: 'Ấm áp & Chân thành',
      funny: 'Hài hước & Vui vẻ',
      formal: 'Trang trọng & Lịch sự',
      concise: 'Ngắn gọn & Tinh tế',
    };
    const toneName = toneLabels[params.tone] || 'Ấm áp & Chân thành';

    const prompt = `Bạn là một người tinh tế chuyên viết thiệp tặng quà tại Việt Nam.
Hãy viết một LỜI CHÚC THIỆP DÀI 2-4 CÂU cho dịp "${params.occasion}" gửi tới "${params.relationship}".

Món quà được tặng: "${params.giftName}"
Giọng điệu mong muốn: ${toneName}
${params.customDescription ? `Chi tiết riêng về người nhận: "${params.customDescription}"` : ''}
${params.interests?.length ? `Sở thích: ${params.interests.join(', ')}` : ''}

Yêu cầu:
1. Lời chúc tự nhiên, ấm áp, văn phong tiếng Việt chuẩn mực, giàu cảm xúc.
2. Dài 2-4 câu (không quá ngắn cũng không quá dài).
3. Lồng ghép khéo léo ý nghĩa món quà "${params.giftName}".
4. Trả về CHỈ VĂN BẢN LỜI CHÚC (Không ghi tiêu đề hay ngoặc kép).`;

    // 1. Try Anthropic Claude
    const anthropicKey = SmartKeyManager.getActiveKey('anthropic');
    if (anthropicKey) {
      const config = SmartKeyManager.getModelConfig('anthropic', 'simple');
      const startTime = Date.now();
      try {
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
              model: config.model,
              max_tokens: config.maxTokens,
              temperature: config.temperature,
              messages: [{ role: 'user', content: prompt }],
            }),
          },
          config.timeoutMs,
          1
        );
        const data = await response.json();
        const text = data.content?.[0]?.text?.trim();
        if (text) {
          SmartKeyManager.reportSuccess('anthropic', anthropicKey, Date.now() - startTime);
          return { cardText: text, provider: 'claude' };
        }
      } catch (err: unknown) {
        SmartKeyManager.reportFailure('anthropic', anthropicKey, undefined, String(err));
      }
    }

    // 2. Try Gemini
    const geminiKey = SmartKeyManager.getActiveKey('gemini');
    if (geminiKey) {
      const config = SmartKeyManager.getModelConfig('gemini', 'simple');
      const startTime = Date.now();
      try {
        const response = await fetchWithTimeoutAndRetry(
          `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { maxOutputTokens: config.maxTokens, temperature: config.temperature },
            }),
          },
          config.timeoutMs,
          1
        );
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) {
          SmartKeyManager.reportSuccess('gemini', geminiKey, Date.now() - startTime);
          return { cardText: text, provider: 'gemini' };
        }
      } catch (err: unknown) {
        SmartKeyManager.reportFailure('gemini', geminiKey, undefined, String(err));
      }
    }

    // Smart Fallback
    return {
      cardText: `Chúc ${params.relationship} luôn rạng rỡ và tràn đầy niềm vui! Mong rằng món quà ${params.giftName} nhỏ bé này sẽ mang lại cho bạn những khoảnh khắc thật ấm áp và ý nghĩa.`,
      provider: 'fallback',
    };
  }
}

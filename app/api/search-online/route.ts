import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/types';

// ============================================================
// SMART FALLBACK GENERATOR BY CATEGORY
// ============================================================
const MOCK_CATEGORIES = {
  book: [
    {
      name: 'Sách Atomic Habits - Thay Đổi Tí Hon Hiệu Quả Phi Thường',
      price: 139000,
      originalPrice: 189000,
      imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop',
      rating: 4.9,
      reviewCount: 3840,
      sold: 12500,
      source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=atomic%20habits',
      discount: 26,
      badge: 'Bán chạy nhất',
    },
    {
      name: 'Sách Đắc Nhân Tâm (Bìa Cứng Khổ Lớn)',
      price: 95000,
      originalPrice: 130000,
      imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=400&fit=crop',
      rating: 4.8,
      reviewCount: 2901,
      sold: 9400,
      source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=đắc%20nhân%20tâm',
      discount: 26,
    },
    {
      name: 'Combo 2 Cuốn Sách Tư Duy Ngược & Tư Duy Mở',
      price: 155000,
      originalPrice: 220000,
      imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=400&fit=crop',
      rating: 4.7,
      reviewCount: 1420,
      sold: 4800,
      source: 'tiktok',
      affiliateLink: 'https://tiktok.com/',
      discount: 29,
      badge: 'Xu hướng',
    },
  ],
  beauty: [
    {
      name: 'Son Kem Lì Romand Juicy Lasting Tint - Màu 23 Nucadamia',
      price: 149000,
      originalPrice: 210000,
      imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop',
      rating: 4.9,
      reviewCount: 8940,
      sold: 42000,
      source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=romand%20juicy',
      discount: 29,
      badge: 'Yêu thích',
    },
    {
      name: 'Tẩy Trang L\'Oreal Paris 3-in-1 Micellar Water 400ml',
      price: 179000,
      originalPrice: 249000,
      imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop',
      rating: 4.9,
      reviewCount: 12400,
      sold: 67000,
      source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=loreal%20micellar%20water',
      discount: 28,
      badge: 'Mall Chính hãng',
    },
    {
      name: 'Kem Chống Nắng La Roche-Posay Anthelios Oil Free 50ml',
      price: 385000,
      originalPrice: 495000,
      imageUrl: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&h=400&fit=crop',
      rating: 4.8,
      reviewCount: 5410,
      sold: 21000,
      source: 'tiktok',
      affiliateLink: 'https://tiktok.com/',
      discount: 22,
    },
  ],
  candle: [
    {
      name: 'Nến Thơm Hoa Khô Thảo Mộc thiên nhiên thư giãn khử mùi',
      price: 125000,
      originalPrice: 180000,
      imageUrl: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=400&h=400&fit=crop',
      rating: 4.8,
      reviewCount: 1560,
      sold: 6200,
      source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=nến%20thơm%20hoa%20khô',
      discount: 30,
      badge: 'Bán chạy',
    },
    {
      name: 'Nến Thơm Yankee Candle size S - Hương Lavender tinh khiết',
      price: 290000,
      originalPrice: 350000,
      imageUrl: 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?w=400&h=400&fit=crop',
      rating: 4.9,
      reviewCount: 890,
      sold: 3400,
      source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=yankee%20candle',
      discount: 17,
      badge: 'Chính hãng',
    },
    {
      name: 'Nến Thơm Decor Hũ Thủy Tinh Amber Co. tinh dầu thơm phòng',
      price: 168000,
      originalPrice: 220000,
      imageUrl: 'https://images.unsplash.com/photo-1572726729207-a78d6eb16d7e?w=400&h=400&fit=crop',
      rating: 4.7,
      reviewCount: 654,
      sold: 1900,
      source: 'tiktok',
      affiliateLink: 'https://tiktok.com/',
      discount: 23,
    },
  ],
  tech: [
    {
      name: 'Tai Nghe Chụp Tai Havit H630BT Không Dây Chống Ồn',
      price: 289000,
      originalPrice: 450000,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
      rating: 4.8,
      reviewCount: 4230,
      sold: 15000,
      source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=havit%20h630bt',
      discount: 35,
      badge: 'Giá cực tốt',
    },
    {
      name: 'Đèn LED RGB Cảm Biến Nháy Theo Nhạc decor góc gaming',
      price: 85000,
      originalPrice: 150000,
      imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=400&fit=crop',
      rating: 4.7,
      reviewCount: 1890,
      sold: 8400,
      source: 'tiktok',
      affiliateLink: 'https://tiktok.com/',
      discount: 43,
      badge: 'Xu hướng',
    },
    {
      name: 'Loa Bluetooth Mini Baseus E09 Chống Nước âm trầm cực đỉnh',
      price: 350000,
      originalPrice: 450000,
      imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop',
      rating: 4.8,
      reviewCount: 780,
      sold: 2100,
      source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=loa%20bluetooth%20baseus',
      discount: 22,
    },
  ],
  jewelry: [
    {
      name: 'Lắc tay bạc S925 đính đá nhân tạo lấp lánh phong cách Hàn Quốc',
      price: 199000,
      originalPrice: 280000,
      imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop',
      rating: 4.8,
      reviewCount: 1520,
      sold: 4500,
      source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=lắc%20tay%20bạc%20đính%20đá',
      discount: 28,
      badge: 'Bán chạy',
    },
    {
      name: 'Dây chuyền bạc mặt cỏ 4 lá may mắn S925',
      price: 245000,
      originalPrice: 320000,
      imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop',
      rating: 4.9,
      reviewCount: 980,
      sold: 3100,
      source: 'tiktok',
      affiliateLink: 'https://tiktok.com/',
      discount: 23,
      badge: 'Yêu thích',
    },
  ],
  fashion: [
    {
      name: 'Túi tote canvas dày dặn có khóa kéo in hình xinh xắn',
      price: 75000,
      originalPrice: 110000,
      imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&h=400&fit=crop',
      rating: 4.7,
      reviewCount: 5420,
      sold: 19000,
      source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=túi%20tote%20canvas',
      discount: 31,
    },
    {
      name: 'Túi Đeo Chéo Nữ Mini Da PU mềm dáng cổ điển',
      price: 220000,
      originalPrice: 350000,
      imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop',
      rating: 4.8,
      reviewCount: 1120,
      sold: 3400,
      source: 'tiktok',
      affiliateLink: 'https://tiktok.com/',
      discount: 37,
      badge: 'Giá tốt',
    },
  ],
  bottle: [
    {
      name: 'Bình giữ nhiệt Lock&Lock LHC4131BKR 450ml - Inox 304 chính hãng',
      price: 265000,
      originalPrice: 380000,
      imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop',
      rating: 4.9,
      reviewCount: 8900,
      sold: 32000,
      source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=lock%20and%20lock%20bình%20giữ%20nhiệt',
      discount: 30,
      badge: 'Chính hãng',
    },
    {
      name: 'Ly giữ nhiệt Stanley Quencher Tumbler 1.2L giữ lạnh 24h',
      price: 680000,
      originalPrice: 850000,
      imageUrl: 'https://images.unsplash.com/photo-1567922045116-2a00fae2ed03?w=400&h=400&fit=crop',
      rating: 4.8,
      reviewCount: 420,
      sold: 1500,
      source: 'tiktok',
      affiliateLink: 'https://tiktok.com/',
      discount: 20,
    },
  ]
};

// Default generic products if keyword matches nothing
const DEFAULT_PRODUCTS: Omit<Product, 'id'>[] = [
  {
    name: 'Hộp quà tặng Handmade thiết kế xinh xắn',
    price: 150000,
    originalPrice: 200000,
    imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&h=400&fit=crop',
    rating: 4.8,
    reviewCount: 450,
    sold: 1200,
    source: 'shopee',
    affiliateLink: 'https://shopee.vn/',
    discount: 25,
    badge: 'Quà hot',
  },
  {
    name: 'Set Thiệp và Hoa khô mini handmade',
    price: 45000,
    originalPrice: 60000,
    imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&h=400&fit=crop',
    rating: 4.9,
    reviewCount: 1280,
    sold: 5300,
    source: 'tiktok',
    affiliateLink: 'https://tiktok.com/',
    discount: 25,
  }
];

function getCategoryFromKeyword(keyword: string): keyof typeof MOCK_CATEGORIES {
  const kw = keyword.toLowerCase();
  if (kw.includes('sách') || kw.includes('đọc') || kw.includes('truyện') || kw.includes('habits') || kw.includes('cuốn')) return 'book';
  if (kw.includes('son') || kw.includes('kem') || kw.includes('da') || kw.includes('skincare') || kw.includes('mỹ phẩm') || kw.includes('làm đẹp') || kw.includes('nước hoa') || kw.includes('perfume')) return 'beauty';
  if (kw.includes('nến') || kw.includes('thơm') || kw.includes('tinh dầu') || kw.includes('scent')) return 'candle';
  if (kw.includes('tai nghe') || kw.includes('led') || kw.includes('loa') || kw.includes('bluetooth') || kw.includes('máy') || kw.includes('công nghệ') || kw.includes('usb')) return 'tech';
  if (kw.includes('trang sức') || kw.includes('vòng') || kw.includes('lắc') || kw.includes('nhẫn') || kw.includes('bạc') || kw.includes('dây chuyền')) return 'jewelry';
  if (kw.includes('túi') || kw.includes('tote') || kw.includes('quần') || kw.includes('áo') || kw.includes('thời trang') || kw.includes('da pu')) return 'fashion';
  if (kw.includes('bình') || kw.includes('ly') || kw.includes('giữ nhiệt') || kw.includes('stanley') || kw.includes('water')) return 'bottle';
  return 'beauty'; // default smart category
}

async function callClaudeForProducts(keyword: string, apiKey: string): Promise<Product[]> {
  const prompt = `Bạn là một trợ lý ảo tìm kiếm sản phẩm tại Việt Nam. Dựa trên từ khóa tìm kiếm: "${keyword}", hãy tạo danh sách 6 sản phẩm THẬT và RẤT PHỔ BIẾN đang được bán trên Shopee hoặc TikTok Shop tại Việt Nam.

Yêu cầu cực kỳ quan trọng:
- Sản phẩm phải khớp chính xác với từ khóa "${keyword}".
- Tên sản phẩm phải thật, đầy đủ, chi tiết (ví dụ: nếu từ khóa là nến thơm, hãy ghi rõ thương hiệu hoặc loại nến thật như "Nến thơm Yankee Candle", "Nến thơm hoa khô thơm phòng").
- Giá tiền (trường price và originalPrice) là số nguyên dương tính bằng VNĐ (Ví dụ: 150000, 280000), KHÔNG có chữ đ hay dấu chấm phân cách.
- rating từ 4.5 đến 5.0
- reviewCount từ 100 đến 5000
- sold từ 500 đến 10000
- source là 'shopee' hoặc 'tiktok'
- imageUrl: Sử dụng link ảnh Unsplash chất lượng cao và HỢP CHỦ ĐỀ nhất có thể (Sách dùng ảnh sách, son dùng ảnh son, đèn dùng ảnh đèn). Đảm bảo link ảnh hoạt động tốt.

Trả kết quả CHỈ ở dạng JSON duy nhất, không giải thích hay thêm text nào khác ngoài JSON, theo format:
{
  "products": [
    {
      "id": "chuỗi ngẫu nhiên",
      "name": "tên sản phẩm thật",
      "price": 150000,
      "originalPrice": 180000,
      "imageUrl": "https://images.unsplash.com/...",
      "rating": 4.8,
      "reviewCount": 120,
      "sold": 450,
      "source": "shopee hoặc tiktok",
      "affiliateLink": "link tìm kiếm thật trên sàn (ví dụ: https://shopee.vn/search?keyword=... hoặc https://tiktok.com/)",
      "discount": 16,
      "badge": "nếu có (ví dụ: Bán chạy, Giá tốt)"
    }
  ]
}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) throw new Error(`Claude status: ${response.status}`);
  const data = await response.json();
  const text = data.content?.[0]?.text || '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON returned');
  const parsed = JSON.parse(jsonMatch[0]);
  return parsed.products || [];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword') || '';

    let products: Product[] = [];

    // 1. Try real Claude AI generation if API key is present
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        products = await callClaudeForProducts(keyword, process.env.ANTHROPIC_API_KEY);
      } catch (aiError) {
        console.warn('AI product generation failed, using smart mock:', aiError);
      }
    }

    // 2. Fallback to Smart Mock Generator
    if (products.length === 0) {
      await new Promise((r) => setTimeout(r, 600)); // Simulating search delay
      const category = getCategoryFromKeyword(keyword);
      const matchedMocks = MOCK_CATEGORIES[category] || MOCK_CATEGORIES.beauty;

      // Customize the mock items to match the user's specific keyword
      products = matchedMocks.map((item, index) => {
        // If the item doesn't exactly match the user's search word, make the title adapt to the keyword
        let customizedName = item.name;
        if (!item.name.toLowerCase().includes(keyword.toLowerCase().split(' ')[0])) {
          customizedName = `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} - ${item.name}`;
        }

        return {
          id: `dyn_${category}_${index}`,
          name: customizedName,
          price: item.price,
          originalPrice: item.originalPrice,
          imageUrl: item.imageUrl,
          rating: item.rating,
          reviewCount: item.reviewCount,
          sold: item.sold,
          source: item.source as 'shopee' | 'tiktok',
          affiliateLink: item.affiliateLink,
          discount: item.discount,
          badge: index === 0 ? 'Giá tốt nhất' : item.badge,
        };
      });
    }

    return NextResponse.json({
      products,
      keyword,
      totalFound: products.length,
    });
  } catch (error) {
    console.error('search-online error:', error);
    return NextResponse.json(
      { error: 'Không thể tìm kiếm sản phẩm. Vui lòng thử lại.' },
      { status: 500 }
    );
  }
}

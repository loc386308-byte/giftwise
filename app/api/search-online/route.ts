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
  ],
  gaming: [
    {
      name: 'Bàn phím cơ không dây layout 75% RGB Keychron K2',
      price: 1250000,
      originalPrice: 1650000,
      imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=400&fit=crop',
      rating: 4.9,
      reviewCount: 2340,
      sold: 8900,
      source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=bàn+phím+cơ+không+dây',
      discount: 24,
      badge: 'Top Gaming',
    },
    {
      name: 'Tai nghe gaming chụp tai Havit H2002D có mic LED',
      price: 390000,
      originalPrice: 550000,
      imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop',
      rating: 4.8,
      reviewCount: 3120,
      sold: 12400,
      source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=tai+nghe+gaming',
      discount: 29,
    },
    {
      name: 'Tay cầm chơi game không dây DualSense bluetooth đa nền tảng',
      price: 780000,
      originalPrice: 980000,
      imageUrl: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=400&fit=crop',
      rating: 4.9,
      reviewCount: 890,
      sold: 3200,
      source: 'tiktok',
      affiliateLink: 'https://tiktok.com/',
      discount: 20,
    },
    {
      name: 'Lót chuột gaming cỡ XL 900x400mm chống trượt siêu dày',
      price: 115000,
      originalPrice: 180000,
      imageUrl: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=400&fit=crop',
      rating: 4.8,
      reviewCount: 6500,
      sold: 24000,
      source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=lót+chuột+gaming+xl',
      discount: 36,
      badge: 'Bán chạy',
    },
    {
      name: 'Đèn LED RGB cảm biến âm thanh nháy theo nhạc gaming',
      price: 95000,
      originalPrice: 150000,
      imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=400&fit=crop',
      rating: 4.7,
      reviewCount: 2100,
      sold: 8700,
      source: 'tiktok',
      affiliateLink: 'https://tiktok.com/',
      discount: 36,
      badge: 'Xu hướng',
    },
    {
      name: 'Ghế gaming ngồi học ngồi làm việc lưng cao có gối',
      price: 1890000,
      originalPrice: 2500000,
      imageUrl: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=400&h=400&fit=crop',
      rating: 4.8,
      reviewCount: 450,
      sold: 1200,
      source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=ghế+gaming',
      discount: 24,
    },
  ],
  menFashion: [
    {
      name: 'Sáp vuốt tóc Clay Pomade giữ nếp cứng tự nhiên bóng nhẹ',
      price: 185000,
      originalPrice: 250000,
      imageUrl: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&h=400&fit=crop',
      rating: 4.8,
      reviewCount: 3400,
      sold: 15000,
      source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=sáp+vuốt+tóc+clay+pomade',
      discount: 26,
      badge: 'Bán chạy',
    },
    {
      name: 'Ví da nam mini RFID chống từ tính cao cấp',
      price: 265000,
      originalPrice: 380000,
      imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594913?w=400&h=400&fit=crop',
      rating: 4.9,
      reviewCount: 890,
      sold: 3200,
      source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=ví+da+nam+mini',
      discount: 30,
    },
    {
      name: 'Kính mát nam gọng kim loại chống UV400 tráng gương',
      price: 175000,
      originalPrice: 290000,
      imageUrl: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=400&h=400&fit=crop',
      rating: 4.7,
      reviewCount: 1240,
      sold: 4500,
      source: 'tiktok',
      affiliateLink: 'https://tiktok.com/',
      discount: 40,
    },
    {
      name: 'Thắt lưng da nam khóa tự động không cần đục lỗ',
      price: 295000,
      originalPrice: 420000,
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
      rating: 4.8,
      reviewCount: 560,
      sold: 1900,
      source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=thắt+lưng+da+khóa+tự+động',
      discount: 30,
    },
    {
      name: 'Túi đeo chéo nam canvas bạt dày phong cách đường phố',
      price: 160000,
      originalPrice: 240000,
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a45?w=400&h=400&fit=crop',
      rating: 4.7,
      reviewCount: 2300,
      sold: 7800,
      source: 'tiktok',
      affiliateLink: 'https://tiktok.com/',
      discount: 33,
    },
    {
      name: 'Nước hoa chiết Sauvage Dior chính hãng 10ml nam tính',
      price: 240000,
      originalPrice: 320000,
      imageUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=400&h=400&fit=crop',
      rating: 4.9,
      reviewCount: 340,
      sold: 1100,
      source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=nước+hoa+chiết+nam',
      discount: 25,
      badge: 'Chính hãng',
    },
  ],
  travel: [
    {
      name: 'Balo du lịch chống nước dã ngoại đa ngăn 30L cao cấp',
      price: 420000,
      originalPrice: 590000,
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a63?w=400&h=400&fit=crop',
      rating: 4.8,
      reviewCount: 1560,
      sold: 5800,
      source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=balo+du+lịch+chống+nước',
      discount: 29,
    },
    {
      name: 'Gối chữ U kê cổ du lịch cao su non êm ái',
      price: 165000,
      originalPrice: 220000,
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=400&fit=crop',
      rating: 4.7,
      reviewCount: 2300,
      sold: 9200,
      source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=gối+cổ+du+lịch',
      discount: 25,
      badge: 'Bán chạy',
    },
    {
      name: 'Loa bluetooth chống nước IPX7 xách tay dã ngoại',
      price: 350000,
      originalPrice: 480000,
      imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop',
      rating: 4.8,
      reviewCount: 780,
      sold: 2400,
      source: 'tiktok',
      affiliateLink: 'https://tiktok.com/',
      discount: 27,
    },
    {
      name: 'Quạt cầm tay mini sạc USB 3 tốc độ siêu mát nhỏ gọn',
      price: 125000,
      originalPrice: 180000,
      imageUrl: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=400&fit=crop',
      rating: 4.7,
      reviewCount: 5400,
      sold: 22000,
      source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=quạt+cầm+tay+mini+sạc',
      discount: 31,
    },
    {
      name: 'Túi đeo bụng thể thao chống nước chạy bộ tập gym',
      price: 99000,
      originalPrice: 150000,
      imageUrl: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd6b0?w=400&h=400&fit=crop',
      rating: 4.7,
      reviewCount: 3200,
      sold: 12800,
      source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=túi+đeo+bụng+thể+thao',
      discount: 34,
    },
    {
      name: 'Bình nước thể thao inox 1L có ống hút nắp bật',
      price: 185000,
      originalPrice: 260000,
      imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop',
      rating: 4.8,
      reviewCount: 4100,
      sold: 16000,
      source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=bình+nước+thể+thao+inox',
      discount: 29,
    },
  ],
  kitchen: [
    {
      name: 'Thớt gỗ teak nguyên tấm cao cấp decor bếp sang trọng',
      price: 210000,
      originalPrice: 290000,
      imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
      rating: 4.8,
      reviewCount: 890,
      sold: 3100,
      source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=thớt+gỗ+teak+cao+cấp',
      discount: 28,
    },
    {
      name: 'Set trà hoa thảo mộc mix 8 loại an thần ngủ ngon',
      price: 160000,
      originalPrice: 220000,
      imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop',
      rating: 4.9,
      reviewCount: 1240,
      sold: 5600,
      source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=trà+hoa+thảo+mộc',
      discount: 27,
      badge: 'Bán chạy',
    },
    {
      name: 'Máy tạo bọt cafe mini cầm tay đánh trứng siêu nhanh',
      price: 125000,
      originalPrice: 180000,
      imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop',
      rating: 4.7,
      reviewCount: 3400,
      sold: 14000,
      source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=máy+đánh+trứng+tạo+bọt',
      discount: 31,
    },
    {
      name: 'Bộ muỗng nĩa dao gỗ sồi nguyên tự nhiên không sơn',
      price: 98000,
      originalPrice: 145000,
      imageUrl: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=400&fit=crop',
      rating: 4.8,
      reviewCount: 670,
      sold: 2200,
      source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=muỗng+nĩa+gỗ+sồi',
      discount: 32,
    },
    {
      name: 'Cốc thủy tinh 2 lớp borosilicate chịu nhiệt 350ml',
      price: 90000,
      originalPrice: 130000,
      imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76575?w=400&h=400&fit=crop',
      rating: 4.8,
      reviewCount: 2100,
      sold: 9800,
      source: 'tiktok',
      affiliateLink: 'https://tiktok.com/',
      discount: 31,
    },
    {
      name: 'Tạp dề chống thấm canvas dày bếp nhà hàng phong cách',
      price: 118000,
      originalPrice: 165000,
      imageUrl: 'https://images.unsplash.com/photo-1556909114-d5aaee697f95?w=400&h=400&fit=crop',
      rating: 4.7,
      reviewCount: 430,
      sold: 1400,
      source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=tạp+dề+canvas+bếp',
      discount: 29,
    },
  ],
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

  // Books & reading
  if (kw.includes('sách') || kw.includes('đọc') || kw.includes('truyện') || kw.includes('habits') || kw.includes('cuốn') || kw.includes('bookmark') || kw.includes('kệ sách') || kw.includes('đèn đọc')) return 'book';

  // Gaming & tech accessories
  if (kw.includes('gaming') || kw.includes('game') || kw.includes('bàn phím') || kw.includes('tay cầm') || kw.includes('mousepad') || kw.includes('lót chuột') || kw.includes('lego') || kw.includes('mô hình')) return 'gaming';

  // General tech (non-gaming)
  if (kw.includes('tai nghe') || kw.includes('led') || kw.includes('loa') || kw.includes('bluetooth') || kw.includes('đế sạc') || kw.includes('sạc') || kw.includes('usb') || kw.includes('công nghệ')) return 'tech';

  // Beauty / skincare / makeup
  if (kw.includes('son') || kw.includes('kem') || kw.includes('skincare') || kw.includes('mỹ phẩm') || kw.includes('làm đẹp') || kw.includes('tẩy trang') || kw.includes('cọ') || kw.includes('gương') || kw.includes('máy rửa mặt')) return 'beauty';

  // Perfume / fragrance
  if (kw.includes('nước hoa') || kw.includes('perfume') || kw.includes('hương') || kw.includes('nến') || kw.includes('thơm') || kw.includes('tinh dầu')) return 'candle';

  // Jewelry & accessories
  if (kw.includes('trang sức') || kw.includes('vòng') || kw.includes('lắc') || kw.includes('nhẫn') || kw.includes('bạc') || kw.includes('dây chuyền')) return 'jewelry';

  // Fashion accessories (male)
  if (kw.includes('sáp') || kw.includes('ví') || kw.includes('kính') || kw.includes('thắt lưng') || kw.includes('nam tính')) return 'menFashion';

  // Fashion bags & clothing
  if (kw.includes('túi') || kw.includes('tote') || kw.includes('thời trang') || kw.includes('da pu') || kw.includes('kẹp nách')) return 'fashion';

  // Bottles & drinkware
  if (kw.includes('bình') || kw.includes('giữ nhiệt') || kw.includes('stanley') || kw.includes('tumbler') || kw.includes('cốc') || kw.includes('water bottle')) return 'bottle';

  // Travel & outdoor & sports
  if (kw.includes('du lịch') || kw.includes('balo') || kw.includes('phượt') || kw.includes('thể thao') || kw.includes('chạy bộ') || kw.includes('gym') || kw.includes('quạt') || kw.includes('gối')) return 'travel';

  // Kitchen & cooking
  if (kw.includes('bếp') || kw.includes('nấu') || kw.includes('thớt') || kw.includes('muỗng') || kw.includes('dĩa') || kw.includes('tạp dề') || kw.includes('đánh trứng') || kw.includes('trà')) return 'kitchen';

  // Health & wellness
  if (kw.includes('sức khỏe') || kw.includes('thảo mộc') || kw.includes('gối tựa') || kw.includes('an thần') || kw.includes('ngủ ngon')) return 'kitchen';

  // Plants & decor
  if (kw.includes('cây') || kw.includes('sen đá') || kw.includes('chậu') || kw.includes('decor') || kw.includes('đèn ngủ') || kw.includes('trang trí')) return 'candle';

  // Stationery
  if (kw.includes('sổ') || kw.includes('planner') || kw.includes('bút') || kw.includes('văn phòng') || kw.includes('kế hoạch')) return 'book';

  return 'candle'; // default
}

async function callClaudeForProducts(keyword: string, apiKey: string): Promise<Product[]> {
  const prompt = `Bạn là trợ lý tìm sản phẩm Việt Nam. Từ khóa: "${keyword}".
Tạo danh sách 6 sản phẩm ĐANG BÁN THẬT trên Shopee / TikTok Shop, ưu tiên:
1. Giá THẤP NHẤT so với cùng mặt hàng – ưu tiên hàng giảm giá nhiều
2. Đánh giá CỰC CAO (rating ≥ 4.8, ưu tiên 4.9 – 5.0)
3. Lượt bán NHIỀU (sold ≥ 1000)
4. Tên sản phẩm ĐẦY ĐỦ, THẬT, có thương hiệu hoặc model rõ ràng
5. price và originalPrice là số nguyên VNĐ, KHÔNG có ký tự khác
6. imageUrl: link Unsplash hợp chủ đề, đảm bảo hoạt động
7. affiliateLink: link search thật trên Shopee (https://shopee.vn/search?keyword=...) hoặc TikTok

Traả về CHỈ JSON:
{
  "products": [
    { "id": "p1", "name": "...", "price": 150000, "originalPrice": 220000, "imageUrl": "https://images.unsplash.com/...", "rating": 4.9, "reviewCount": 3200, "sold": 8500, "source": "shopee", "affiliateLink": "https://shopee.vn/search?keyword=...", "discount": 32, "badge": "Bán chạy" }
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
      await new Promise((r) => setTimeout(r, 600));
      const category = getCategoryFromKeyword(keyword);
      const matchedMocks = MOCK_CATEGORIES[category] || MOCK_CATEGORIES.candle;

      const shopeeSearchUrl = `https://shopee.vn/search?keyword=${encodeURIComponent(keyword)}`;

      products = matchedMocks.map((item, index) => ({
        id: `dyn_${category}_${index}`,
        name: item.name,
        price: item.price,
        originalPrice: item.originalPrice,
        imageUrl: item.imageUrl,
        rating: item.rating,
        reviewCount: item.reviewCount,
        sold: item.sold,
        source: item.source as 'shopee' | 'tiktok',
        affiliateLink: item.source === 'shopee' ? shopeeSearchUrl : 'https://www.tiktok.com/search?q=' + encodeURIComponent(keyword),
        discount: item.discount,
        badge: item.badge,
      }));
    }

    // ── Sort: 5-star first (rating DESC), then cheapest (price ASC) ──
    products.sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return a.price - b.price;
    });

    // ── Assign smart badges ──
    if (products.length > 0) {
      // Highest rated
      const topRated = products.reduce((best, p) => (p.rating > best.rating ? p : best), products[0]);
      if (topRated.rating >= 4.9) topRated.badge = '⭐ Đánh giá 5 sao';

      // Cheapest (among same-category shopee items)
      const shopeeItems = products.filter((p) => p.source === 'shopee');
      if (shopeeItems.length > 0) {
        const cheapest = shopeeItems.reduce((min, p) => (p.price < min.price ? p : min), shopeeItems[0]);
        if (!cheapest.badge || cheapest.badge === '') cheapest.badge = '💸 Giá rẻ nhất';
        else cheapest.badge = '💸 Rẻ nhất · ' + cheapest.badge;
      }

      // Top seller
      const topSeller = products.reduce((best, p) => (p.sold > best.sold ? p : best), products[0]);
      if (!topSeller.badge) topSeller.badge = '🔥 Bán chạy nhất';
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

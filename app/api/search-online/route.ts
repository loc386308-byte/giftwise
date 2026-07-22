import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/types';
import { AIService, resolveProductImage } from '@/lib/services/aiService';

// ─── Rate limiting for search-online (30 requests/hour per IP) ─────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function getRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) { rateLimitMap.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 }); return true; }
  if (entry.count >= 30) return false;
  entry.count++;
  return true;
}

// ─── Type ─────────────────────────────────────────────────────────────────────
type RawProduct = Omit<Product, 'id'> & { tags: string[] };

// ============================================================
// FULL PRODUCT CATALOGUE – tagged for relevance scoring
// ============================================================
const ALL_PRODUCTS: RawProduct[] = [
  // ── Sách & Đọc ────────────────────────────────────────────
  {
    name: 'Sách Atomic Habits – Thay Đổi Tí Hon Hiệu Quả Phi Thường (Bìa Cứng Mạ Vàng)',
    price: 139000, originalPrice: 189000,
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=600&fit=crop&q=90',
    rating: 4.9, reviewCount: 8240, sold: 42500, source: 'shopee',
    affiliateLink: 'https://shopee.vn/search?keyword=atomic+habits+b%C3%ACa+c%E1%BB%A9ng',
    discount: 26, badge: '📚 Bestseller',
    tags: ['sách', 'đọc sách', 'phát triển bản thân', 'thói quen', 'atomic habits', 'sách kỹ năng', 'sách hay', 'sổ tay', 'bìa cứng'],
  },
  {
    name: 'Sách Đắc Nhân Tâm – Dale Carnegie (Bìa Đặc Biệt)',
    price: 95000, originalPrice: 130000,
    imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=600&fit=crop&q=90',
    rating: 4.8, reviewCount: 5210, sold: 19400, source: 'shopee',
    affiliateLink: 'https://shopee.vn/search?keyword=%C4%91%E1%BA%AFc+nh%C3%A2n+t%C3%A2m',
    discount: 27,
    tags: ['sách', 'đọc sách', 'phát triển bản thân', 'đắc nhân tâm', 'giao tiếp', 'kỹ năng mềm', 'sách kỹ năng'],
  },
  {
    name: 'Sổ Tay Leuchtturm1917 A5 Dotted – Bullet Journal Cao Cấp',
    price: 390000, originalPrice: 490000,
    imageUrl: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&h=600&fit=crop&q=90',
    rating: 4.9, reviewCount: 1420, sold: 4800, source: 'shopee',
    affiliateLink: 'https://shopee.vn/search?keyword=leuchtturm1917+a5+dotted',
    discount: 20, badge: '✒️ Premium',
    tags: ['sổ tay', 'bullet journal', 'leuchtturm', 'planner', 'viết', 'ghi chép', 'văn phòng phẩm', 'sổ cao cấp'],
  },
  {
    name: 'Kindle Paperwhite 11th Gen 8GB – Màn E-Ink Không Chói Mắt',
    price: 3490000, originalPrice: 4200000,
    imageUrl: 'https://images.unsplash.com/photo-1592535400978-e0bace94b9c3?w=600&h=600&fit=crop&q=90',
    rating: 4.9, reviewCount: 6800, sold: 22000, source: 'shopee',
    affiliateLink: 'https://shopee.vn/search?keyword=kindle+paperwhite+11th',
    discount: 17, badge: '⭐ Đánh giá 5 sao',
    tags: ['kindle', 'máy đọc sách', 'e-reader', 'đọc sách điện tử', 'công nghệ', 'sách'],
  },

  // ── Làm đẹp & Skincare ────────────────────────────────────
  {
    name: 'Son Kem Lì Romand Zero Velvet Tint – #25 Mauve Beach',
    price: 149000, originalPrice: 210000,
    imageUrl: 'https://images.unsplash.com/photo-1586495777744-4e6b0864a597?w=600&h=600&fit=crop&q=90',
    rating: 4.9, reviewCount: 18940, sold: 82000, source: 'shopee',
    affiliateLink: 'https://shopee.vn/search?keyword=romand+zero+velvet+tint',
    discount: 29, badge: '💄 Yêu thích',
    tags: ['son', 'son môi', 'son kem lì', 'romand', 'mỹ phẩm', 'làm đẹp', 'trang điểm', 'son hàn quốc', 'quà cho nữ'],
  },
  {
    name: 'Kem Chống Nắng La Roche-Posay Anthelios SPF50+ 50ml',
    price: 385000, originalPrice: 495000,
    imageUrl: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=600&fit=crop&q=90',
    rating: 4.9, reviewCount: 12400, sold: 51000, source: 'shopee',
    affiliateLink: 'https://shopee.vn/search?keyword=la+roche+posay+anthelios+spf50',
    discount: 22, badge: '✅ Chính hãng',
    tags: ['kem chống nắng', 'skincare', 'la roche posay', 'spf50', 'mỹ phẩm', 'chăm sóc da', 'làm đẹp', 'kem dưỡng'],
  },
  {
    name: 'Set Mặt Nạ Innisfree Jeju Volcanic Clay Mask 10 miếng',
    price: 220000, originalPrice: 310000,
    imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&h=600&fit=crop&q=90',
    rating: 4.8, reviewCount: 7800, sold: 32000, source: 'tiktok',
    affiliateLink: 'https://www.tiktok.com/search?q=innisfree+jeju+volcanic+mask',
    discount: 29, badge: '🔥 Viral TikTok',
    tags: ['mặt nạ', 'innisfree', 'skincare', 'chăm sóc da', 'mỹ phẩm', 'làm đẹp', 'facial mask'],
  },
  {
    name: 'Gương Trang Điểm LED Hollywood 18 Bóng 3 Chế Độ Sáng',
    price: 340000, originalPrice: 480000,
    imageUrl: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600&h=600&fit=crop&q=90',
    rating: 4.8, reviewCount: 4200, sold: 16000, source: 'shopee',
    affiliateLink: 'https://shopee.vn/search?keyword=g%C6%B0%C6%A1ng+led+hollywood',
    discount: 29,
    tags: ['gương', 'gương trang điểm', 'led', 'hollywood mirror', 'làm đẹp', 'trang điểm', 'quà cho nữ'],
  },
  {
    name: 'Máy Rửa Mặt Foreo Luna Mini 3 – Sóng Âm Làm Sạch Sâu',
    price: 2490000, originalPrice: 3200000,
    imageUrl: 'https://images.unsplash.com/photo-1519764622345-23439dd774f7?w=600&h=600&fit=crop&q=90',
    rating: 4.9, reviewCount: 5600, sold: 14000, source: 'shopee',
    affiliateLink: 'https://shopee.vn/search?keyword=foreo+luna+mini+3+ch%C3%ADnh+h%C3%A3ng',
    discount: 22, badge: '✅ Chính hãng',
    tags: ['foreo', 'máy rửa mặt', 'skincare', 'chăm sóc da', 'làm đẹp', 'mỹ phẩm cao cấp', 'beauty device'],
  },
  {
    name: 'Serum Vitamin C Paula\'s Choice C15 Super Booster 30ml',
    price: 1290000, originalPrice: 1690000,
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop&q=90',
    rating: 4.9, reviewCount: 3800, sold: 11000, source: 'shopee',
    affiliateLink: 'https://shopee.vn/search?keyword=paula%27s+choice+vitamin+c+serum',
    discount: 24, badge: '⭐ Bán chạy',
    tags: ['serum', 'vitamin c', 'skincare', 'chăm sóc da', 'paula\'s choice', 'mỹ phẩm', 'làm đẹp', 'dưỡng da'],
  },

  // ── Nến & Nước hoa ────────────────────────────────────────
  {
    name: 'Nến Thơm Diptyque Baies 190g – Hương Quả Mọng & Hoa Hồng Paris',
    price: 1890000, originalPrice: 2100000,
    imageUrl: 'https://images.unsplash.com/photo-1602523961358-f9f03dd557db?w=600&h=600&fit=crop&q=90',
    rating: 4.9, reviewCount: 890, sold: 2800, source: 'shopee',
    affiliateLink: 'https://shopee.vn/search?keyword=diptyque+baies+candle',
    discount: 10, badge: '✨ Luxury',
    tags: ['nến', 'nến thơm', 'diptyque', 'luxury', 'quà sang trọng', 'hương thơm', 'decor', 'thư giãn'],
  },
  {
    name: 'Nến Thơm Hoa Khô Handmade Hũ Thủy Tinh Trong 200g',
    price: 145000, originalPrice: 199000,
    imageUrl: 'https://images.unsplash.com/photo-1603905624338-b23e5d0e2c98?w=600&h=600&fit=crop&q=90',
    rating: 4.8, reviewCount: 3560, sold: 14200, source: 'shopee',
    affiliateLink: 'https://shopee.vn/search?keyword=n%E1%BA%BFn+th%C6%A1m+hoa+kh%C3%B4+handmade',
    discount: 27, badge: '🔥 Bán chạy',
    tags: ['nến', 'nến thơm', 'handmade', 'hoa khô', 'decor', 'thư giãn', 'quà dễ thương', 'phòng ngủ'],
  },
  {
    name: 'Nến Thơm Yankee Candle Lavender Large Jar 623g – Lưu Hương 150h',
    price: 890000, originalPrice: 1100000,
    imageUrl: 'https://images.unsplash.com/photo-1602874801006-8e8b862bc4c6?w=600&h=600&fit=crop&q=90',
    rating: 4.9, reviewCount: 1200, sold: 4500, source: 'shopee',
    affiliateLink: 'https://shopee.vn/search?keyword=yankee+candle+lavender',
    discount: 19, badge: '✅ Chính hãng',
    tags: ['nến', 'nến thơm', 'yankee candle', 'lavender', 'hương hoa oải hương', 'thư giãn', 'quà cao cấp'],
  },
  {
    name: 'Nước Hoa Chanel Chance Eau Tendre EDT 100ml',
    price: 3200000, originalPrice: 3800000,
    imageUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&h=600&fit=crop&q=90',
    rating: 4.9, reviewCount: 2100, sold: 7400, source: 'shopee',
    affiliateLink: 'https://shopee.vn/search?keyword=chanel+chance+eau+tendre',
    discount: 16, badge: '🌸 Luxury',
    tags: ['nước hoa', 'chanel', 'chance', 'nữ', 'luxury', 'quà cao cấp', 'hương thơm', 'perfume', 'nước hoa nữ'],
  },
  {
    name: 'Nước Hoa Dior Sauvage EDT 100ml – Hương Gỗ Nam Tính',
    price: 3100000, originalPrice: 3800000,
    imageUrl: 'https://images.unsplash.com/photo-1547887538-047020f28e25?w=600&h=600&fit=crop&q=90',
    rating: 4.9, reviewCount: 4200, sold: 14500, source: 'shopee',
    affiliateLink: 'https://shopee.vn/search?keyword=dior+sauvage+edt+100ml',
    discount: 18, badge: '🔥 Best Seller',
    tags: ['nước hoa', 'dior', 'sauvage', 'nam', 'luxury', 'quà cao cấp', 'hương thơm', 'perfume', 'nước hoa nam'],
  },

  // ── Công nghệ ─────────────────────────────────────────────
  {
    name: 'Tai Nghe Apple AirPods 3 Lightning – Chính Hãng VN/A',
    price: 2790000, originalPrice: 3490000,
    imageUrl: 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=600&h=600&fit=crop&q=90',
    rating: 4.9, reviewCount: 12400, sold: 38000, source: 'shopee',
    affiliateLink: 'https://shopee.vn/search?keyword=airpods+3+ch%C3%ADnh+h%C3%A3ng',
    discount: 20, badge: '⭐ Top Pick',
    tags: ['tai nghe', 'airpods', 'apple', 'bluetooth', 'công nghệ', 'quà công nghệ', 'true wireless', 'earbuds'],
  },
  {
    name: 'Loa Bluetooth JBL Flip 6 Chống Nước IP67 – Bass Mạnh 12h Pin',
    price: 1890000, originalPrice: 2490000,
    imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop&q=90',
    rating: 4.9, reviewCount: 8900, sold: 26000, source: 'shopee',
    affiliateLink: 'https://shopee.vn/search?keyword=jbl+flip+6+ch%C3%ADnh+h%C3%A3ng',
    discount: 24, badge: '✅ Chính hãng',
    tags: ['loa bluetooth', 'jbl', 'flip 6', 'loa di động', 'công nghệ', 'âm nhạc', 'âm thanh', 'quà công nghệ'],
  },
  {
    name: 'Pin Dự Phòng Anker 737 PowerCore 26800mAh 140W',
    price: 1290000, originalPrice: 1690000,
    imageUrl: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&h=600&fit=crop&q=90',
    rating: 4.9, reviewCount: 5600, sold: 18000, source: 'shopee',
    affiliateLink: 'https://shopee.vn/search?keyword=anker+737+powercore',
    discount: 24,
    tags: ['pin dự phòng', 'anker', 'sạc nhanh', 'công nghệ', 'powerbank', 'sạc macbook', 'quà công nghệ'],
  },
  {
    name: 'Đế Sạc Không Dây Anker 3-in-1 MagSafe 15W',
    price: 890000, originalPrice: 1190000,
    imageUrl: 'https://images.unsplash.com/photo-1586253634026-8cb574908d1e?w=600&h=600&fit=crop&q=90',
    rating: 4.8, reviewCount: 3200, sold: 9800, source: 'shopee',
    affiliateLink: 'https://shopee.vn/search?keyword=anker+wireless+charger+3in1',
    discount: 25,
    tags: ['đế sạc', 'sạc không dây', 'magsafe', 'anker', 'công nghệ', 'sạc iphone', 'quà công nghệ'],
  },
  {
    name: 'Apple Watch Series 9 GPS 41mm – Vòng Tay Sức Khoẻ Cao Cấp',
    price: 9990000, originalPrice: 11490000,
    imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&h=600&fit=crop&q=90',
    rating: 4.9, reviewCount: 4200, sold: 9800, source: 'shopee',
    affiliateLink: 'https://shopee.vn/search?keyword=apple+watch+series+9+gps+41mm',
    discount: 13, badge: '✅ Chính hãng',
    tags: ['apple watch', 'smartwatch', 'đồng hồ thông minh', 'theo dõi sức khoẻ', 'công nghệ', 'quà cao cấp', 'wearable'],
  },

  // ── Gaming ────────────────────────────────────────────────
  {
    name: 'Bàn Phím Cơ Keychron K2 Pro Bluetooth/USB-C Hot-Swap RGB',
    price: 2490000, originalPrice: 3200000,
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=600&fit=crop&q=90',
    rating: 4.9, reviewCount: 4230, sold: 12900, source: 'shopee',
    affiliateLink: 'https://shopee.vn/search?keyword=keychron+k2+pro',
    discount: 22, badge: '🏆 Editor Choice',
    tags: ['bàn phím', 'keychron', 'bàn phím cơ', 'gaming', 'rgb', 'bluetooth', 'mechanical keyboard', 'quà cho gamer'],
  },
  {
    name: 'Tai Nghe Gaming SteelSeries Arctis Nova 3 – Surround 7.1',
    price: 1290000, originalPrice: 1690000,
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&h=600&fit=crop&q=90',
    rating: 4.9, reviewCount: 2890, sold: 9400, source: 'shopee',
    affiliateLink: 'https://shopee.vn/search?keyword=steelseries+arctis+nova+3',
    discount: 24,
    tags: ['tai nghe gaming', 'steelseries', 'gaming', 'headset', 'surround sound', 'quà cho gamer'],
  },
  {
    name: 'Tay Cầm Xbox Wireless Controller – Glacier Blue Chính Hãng',
    price: 1590000, originalPrice: 1990000,
    imageUrl: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=600&h=600&fit=crop&q=90',
    rating: 4.9, reviewCount: 1560, sold: 5800, source: 'tiktok',
    affiliateLink: 'https://www.tiktok.com/search?q=xbox+wireless+controller',
    discount: 20, badge: '✅ Chính hãng',
    tags: ['tay cầm', 'xbox', 'controller', 'gaming', 'game console', 'quà cho gamer'],
  },
  {
    name: 'Lót Chuột ASUS ROG Scabbard II Extended 900×400mm',
    price: 890000, originalPrice: 1190000,
    imageUrl: 'https://images.unsplash.com/photo-1593640408182-31c228eb60cd?w=600&h=600&fit=crop&q=90',
    rating: 4.8, reviewCount: 3400, sold: 11000, source: 'shopee',
    affiliateLink: 'https://shopee.vn/search?keyword=asus+rog+scabbard+ii',
    discount: 25,
    tags: ['lót chuột', 'mousepad', 'asus rog', 'gaming', 'desk mat', 'quà cho gamer'],
  },
  {
    name: 'Đèn LED RGB Govee Immersion TV – Sync Theo Màn Hình',
    price: 450000, originalPrice: 650000,
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop&q=90',
    rating: 4.8, reviewCount: 2100, sold: 8700, source: 'tiktok',
    affiliateLink: 'https://www.tiktok.com/search?q=govee+immersion+tv+led',
    discount: 31, badge: '🔥 Xu hướng',
    tags: ['đèn led', 'rgb', 'govee', 'gaming', 'ambilight', 'decor phòng', 'gaming setup', 'led strip'],
  },

  // ── Trang sức ─────────────────────────────────────────────
  {
    name: 'Lắc Tay Bạc Thật S925 Đính Đá CZ Lấp Lánh – Hàn Quốc',
    price: 199000, originalPrice: 280000,
    imageUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=600&fit=crop&q=90',
    rating: 4.9, reviewCount: 5520, sold: 18400, source: 'shopee',
    affiliateLink: 'https://shopee.vn/search?keyword=l%E1%BA%AFc+tay+b%E1%BA%A1c+s925+cz',
    discount: 28, badge: '🔥 Bán chạy',
    tags: ['lắc tay', 'vòng tay', 'trang sức', 'bạc s925', 'đính đá', 'quà cho nữ', 'jewelry', 'hàn quốc'],
  },
  {
    name: 'Dây Chuyền Vàng 18K Mặt Ngôi Sao Đính Kim Cương Nhân Tạo',
    price: 1250000, originalPrice: 1680000,
    imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop&q=90',
    rating: 4.9, reviewCount: 980, sold: 3100, source: 'shopee',
    affiliateLink: 'https://shopee.vn/search?keyword=d%C3%A2y+chuy%E1%BB%81n+v%C3%A0ng+18k',
    discount: 26, badge: '💎 Premium',
    tags: ['dây chuyền', 'vàng 18k', 'trang sức', 'đính kim cương', 'quà cho nữ', 'luxury', 'jewelry'],
  },
  {
    name: 'Nhẫn Bạc Thật S925 Đính Đá Hoa Tinh Xảo – Hộp Nhung Cao Cấp',
    price: 245000, originalPrice: 340000,
    imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=600&fit=crop&q=90',
    rating: 4.8, reviewCount: 1980, sold: 7200, source: 'tiktok',
    affiliateLink: 'https://www.tiktok.com/search?q=nh%E1%BA%ABn+b%E1%BA%A1c+s925',
    discount: 28,
    tags: ['nhẫn', 'trang sức', 'bạc s925', 'đính đá', 'quà cho nữ', 'jewelry', 'quà lãng mạn'],
  },

  // ── Thời trang nữ ─────────────────────────────────────────
  {
    name: 'Túi Tote Canvas Cao Cấp Unisex Local Brand – Pastel Đa Màu',
    price: 185000, originalPrice: 260000,
    imageUrl: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600&h=600&fit=crop&q=90',
    rating: 4.8, reviewCount: 8420, sold: 32000, source: 'shopee',
    affiliateLink: 'https://shopee.vn/search?keyword=t%C3%BAi+tote+canvas+local+brand',
    discount: 29, sizes: ['One Size'],
    tags: ['túi tote', 'túi xách', 'canvas bag', 'thời trang', 'local brand', 'pastel', 'quà cho nữ', 'túi vải'],
  },
  {
    name: 'Áo Khoác Dù Unisex 2 Lớp Chống Nước – Streetwear Local Brand',
    price: 680000, originalPrice: 890000,
    imageUrl: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&h=600&fit=crop&q=90',
    rating: 4.9, reviewCount: 3200, sold: 11000, source: 'shopee',
    affiliateLink: 'https://shopee.vn/search?keyword=%C3%A1o+kho%C3%A1c+d%C3%B9+unisex',
    discount: 24, badge: '🔥 Bán chạy', sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    tags: ['áo khoác', 'áo khoác dù', 'streetwear', 'unisex', 'thời trang', 'local brand', 'chống nước'],
  },
  {
    name: 'Giày Sneaker Nữ Đế Dày Platform Retro – Pastel Hot Trend',
    price: 425000, originalPrice: 590000,
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop&q=90',
    rating: 4.8, reviewCount: 5600, sold: 19000, source: 'tiktok',
    affiliateLink: 'https://www.tiktok.com/search?q=gi%C3%A0y+sneaker+platform+n%E1%BB%AF',
    discount: 28, sizes: ['35', '36', '37', '38', '39', '40'],
    tags: ['giày', 'sneaker nữ', 'platform', 'retro', 'thời trang nữ', 'giày cao', 'pastel'],
  },
  {
    name: 'Túi Xách Đeo Chéo Da PU Nữ Mini Dáng Baguette Vintage',
    price: 320000, originalPrice: 450000,
    imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop&q=90',
    rating: 4.9, reviewCount: 2800, sold: 9500, source: 'shopee',
    affiliateLink: 'https://shopee.vn/search?keyword=t%C3%BAi+x%C3%A1ch+da+pu+baguette',
    discount: 29, badge: '🔥 Hot', sizes: ['One Size'],
    tags: ['túi xách', 'túi đeo chéo', 'da pu', 'baguette', 'vintage', 'thời trang nữ', 'quà cho nữ'],
  },

  // ── Thời trang nam ────────────────────────────────────────
  {
    name: 'Sáp Vuốt Tóc LAYRITE Superhold Pomade 297g – Barbershop Pick',
    price: 290000, originalPrice: 390000,
    imageUrl: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=600&h=600&fit=crop&q=90',
    rating: 4.9, reviewCount: 7800, sold: 28000, source: 'shopee',
    affiliateLink: 'https://shopee.vn/search?keyword=layrite+superhold+pomade',
    discount: 26, badge: '✂️ Barbershop Pick',
    tags: ['sáp vuốt tóc', 'layrite', 'pomade', 'grooming', 'chăm sóc tóc nam', 'quà cho nam', 'tóc nam'],
  },
  {
    name: 'Giày Adidas Stan Smith OG Vintage White/Green – Chính Hãng',
    price: 2190000, originalPrice: 2800000,
    imageUrl: 'https://images.unsplash.com/photo-1556906781-9a412961d28e?w=600&h=600&fit=crop&q=90',
    rating: 4.8, reviewCount: 3200, sold: 10500, source: 'shopee',
    affiliateLink: 'https://shopee.vn/search?keyword=adidas+stan+smith+ch%C3%ADnh+h%C3%A3ng',
    discount: 22, sizes: ['38', '39', '40', '41', '42', '43', '44'],
    tags: ['giày', 'adidas', 'stan smith', 'sneaker nam', 'thời trang nam', 'giày thể thao', 'vintage'],
  },
  {
    name: 'Ví Da Thật Nam Full-Grain Leather Slim Bifold – RFID Blocking',
    price: 680000, originalPrice: 890000,
    imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&h=600&fit=crop&q=90',
    rating: 4.9, reviewCount: 2100, sold: 7800, source: 'shopee',
    affiliateLink: 'https://shopee.vn/search?keyword=v%C3%AD+da+th%E1%BA%ADt+nam+slim',
    discount: 24,
    tags: ['ví', 'ví da', 'ví nam', 'leather', 'rfid', 'quà cho nam', 'phụ kiện nam', 'ví mỏng'],
  },
  {
    name: 'Kính Mắt Thời Trang Ray-Ban Aviator Classic – UV400',
    price: 2890000, originalPrice: 3500000,
    imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&h=600&fit=crop&q=90',
    rating: 4.9, reviewCount: 2800, sold: 8400, source: 'shopee',
    affiliateLink: 'https://shopee.vn/search?keyword=ray-ban+aviator+classic+ch%C3%ADnh+h%C3%A3ng',
    discount: 17, badge: '✅ Chính hãng',
    tags: ['kính mắt', 'ray-ban', 'aviator', 'kính thời trang', 'phụ kiện', 'quà cho nam', 'kính râm'],
  },

  // ── Bình giữ nhiệt ────────────────────────────────────────
  {
    name: 'Bình Giữ Nhiệt Stanley Quencher H2.0 Flowstate 591ml',
    price: 1350000, originalPrice: 1790000,
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=600&fit=crop&q=90',
    rating: 4.9, reviewCount: 8900, sold: 28000, source: 'shopee',
    affiliateLink: 'https://shopee.vn/search?keyword=stanley+quencher+591ml',
    discount: 24, badge: '🔥 Viral TikTok',
    tags: ['bình giữ nhiệt', 'stanley', 'tumbler', 'giữ lạnh', 'bình nước', 'quà thực tế', 'viral'],
  },
  {
    name: 'Bình Giữ Nhiệt Lock&Lock Inox 304 LHC4131 450ml',
    price: 265000, originalPrice: 380000,
    imageUrl: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600&h=600&fit=crop&q=90',
    rating: 4.9, reviewCount: 18900, sold: 72000, source: 'shopee',
    affiliateLink: 'https://shopee.vn/search?keyword=lock+lock+inox+304',
    discount: 30, badge: '✅ Chính hãng',
    tags: ['bình giữ nhiệt', 'lock lock', 'inox 304', 'giữ nóng', 'bình nước', 'quà thực tế'],
  },

  // ── Du lịch & Thể thao ────────────────────────────────────
  {
    name: 'Balo Du Lịch Thule Crossover 2 40L Chống Nước',
    price: 2900000, originalPrice: 3800000,
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop&q=90',
    rating: 4.9, reviewCount: 890, sold: 2800, source: 'shopee',
    affiliateLink: 'https://shopee.vn/search?keyword=thule+crossover+2+40l',
    discount: 24, badge: '💎 Premium',
    tags: ['balo', 'du lịch', 'thule', 'chống nước', 'thể thao', 'phượt', 'laptop bag', 'quà cho người thích du lịch'],
  },
  {
    name: 'Giày Chạy Bộ Nike React Miler 3 – Đế React Siêu Êm',
    price: 2590000, originalPrice: 3200000,
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop&q=90',
    rating: 4.8, reviewCount: 2100, sold: 7400, source: 'shopee',
    affiliateLink: 'https://shopee.vn/search?keyword=nike+react+miler+3',
    discount: 19, sizes: ['38', '39', '40', '41', '42', '43', '44'],
    tags: ['giày chạy bộ', 'nike', 'running', 'thể thao', 'gym', 'fitness', 'quà cho người thích thể thao'],
  },
  {
    name: 'Thảm Yoga Lululemon The Reversible Mat 5mm – Chống Trơn Cao Cấp',
    price: 2890000, originalPrice: 3500000,
    imageUrl: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=600&h=600&fit=crop&q=90',
    rating: 4.9, reviewCount: 1800, sold: 5200, source: 'shopee',
    affiliateLink: 'https://shopee.vn/search?keyword=lululemon+yoga+mat+5mm',
    discount: 17, badge: '✅ Chính hãng',
    tags: ['thảm yoga', 'lululemon', 'yoga', 'pilates', 'thể thao', 'fitness', 'quà cho người thích yoga'],
  },
  {
    name: 'Bình Nước Bơm Điện Xiaomi Mijia – Tự Động Định Lượng',
    price: 350000, originalPrice: 490000,
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=600&fit=crop&q=90',
    rating: 4.8, reviewCount: 4200, sold: 15000, source: 'shopee',
    affiliateLink: 'https://shopee.vn/search?keyword=xiaomi+mijia+water+dispenser',
    discount: 29,
    tags: ['bình nước', 'xiaomi', 'công nghệ nhà bếp', 'thực tế', 'tiện ích', 'du lịch', 'bình uống nước'],
  },

  // ── Nhà bếp & Nấu ăn ─────────────────────────────────────
  {
    name: 'Nồi Chiên Không Dầu Philips HD9270 7L – Cảm Ứng Digital',
    price: 2890000, originalPrice: 3900000,
    imageUrl: 'https://images.unsplash.com/photo-1648462560743-5e5c6b62b86e?w=600&h=600&fit=crop&q=90',
    rating: 4.9, reviewCount: 8900, sold: 34000, source: 'shopee',
    affiliateLink: 'https://shopee.vn/search?keyword=philips+hd9270+n%E1%BB%93i+chi%C3%AAn+7l',
    discount: 26, badge: '✅ Chính hãng',
    tags: ['nồi chiên không dầu', 'philips', 'bếp', 'nấu ăn', 'nhà bếp', 'gia dụng', 'quà cho người thích nấu ăn'],
  },
  {
    name: 'Thớt Gỗ Acacia Cao Cấp Khắc Tên Miễn Phí – Decor Bếp',
    price: 380000, originalPrice: 520000,
    imageUrl: 'https://images.unsplash.com/photo-1542010589005-d1eacc3918f2?w=600&h=600&fit=crop&q=90',
    rating: 4.9, reviewCount: 3200, sold: 12500, source: 'shopee',
    affiliateLink: 'https://shopee.vn/search?keyword=th%E1%BB%9Bt+g%E1%BB%97+acacia+kh%E1%BA%AFc+t%C3%AAn',
    discount: 27, badge: '🎁 Cá nhân hóa',
    tags: ['thớt', 'thớt gỗ', 'acacia', 'khắc tên', 'cá nhân hóa', 'bếp', 'nấu ăn', 'quà cá nhân hóa'],
  },
  {
    name: 'Set Trà Matcha Nhật Bản – Bột Matcha + Chén Sứ + Chổi Khuấy',
    price: 450000, originalPrice: 620000,
    imageUrl: 'https://images.unsplash.com/photo-1572635148818-ef6fd45eb394?w=600&h=600&fit=crop&q=90',
    rating: 4.9, reviewCount: 2100, sold: 8900, source: 'tiktok',
    affiliateLink: 'https://www.tiktok.com/search?q=b%E1%BB%99+pha+matcha+nh%E1%BA%ADt+b%E1%BA%A3n',
    discount: 27, badge: '🍵 Viral',
    tags: ['matcha', 'trà', 'nhật bản', 'bộ trà', 'nấu ăn', 'pha trà', 'quà cho người thích trà', 'quà nhật'],
  },
  {
    name: 'Máy Pha Cà Phê Nespresso Essenza Mini – 19 Bar Chuẩn Ý',
    price: 2990000, originalPrice: 3800000,
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=600&fit=crop&q=90',
    rating: 4.9, reviewCount: 5600, sold: 14000, source: 'shopee',
    affiliateLink: 'https://shopee.vn/search?keyword=nespresso+essenza+mini+ch%C3%ADnh+h%C3%A3ng',
    discount: 21, badge: '✅ Chính hãng',
    tags: ['máy pha cà phê', 'nespresso', 'cà phê', 'coffee', 'nhà bếp', 'quà cao cấp', 'espresso'],
  },

  // ── Thư giãn & Self-care (Vật thể) ──────────────────────────
  {
    name: 'Máy Massage Cổ Vai Gáy Hồng Ngoại 8 Bi Châm Cứu Cao Cấp',
    price: 450000, originalPrice: 650000,
    imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=600&fit=crop&q=90',
    rating: 4.9, reviewCount: 2800, sold: 9400, source: 'shopee',
    affiliateLink: 'https://shopee.vn/search?keyword=m%C3%A1y+massage+c%E1%BB%95+vai+g%C3%A1y',
    discount: 31, badge: '💆 Thư giãn',
    tags: ['máy massage', 'massage', 'thư giãn', 'self-care', 'chăm sóc bản thân', 'sức khỏe', 'máy massage cổ'],
  },
  {
    name: 'Máy Khuếch Tán Tinh Dầu Gỗ Thông 500ml – Đèn LED 7 Màu',
    price: 280000, originalPrice: 390000,
    imageUrl: 'https://images.unsplash.com/photo-1602523961358-f9f03dd557db?w=600&h=600&fit=crop&q=90',
    rating: 4.8, reviewCount: 6200, sold: 22000, source: 'shopee',
    affiliateLink: 'https://shopee.vn/search?keyword=m%C3%A1y+khu%E1%BA%BFch+t%C3%A1n+tinh+d%E1%BA%A7u+500ml',
    discount: 28,
    tags: ['tinh dầu', 'máy khuếch tán', 'thư giãn', 'yoga', 'self-care', 'decor', 'phòng ngủ', 'hương thơm'],
  },
  {
    name: 'Set Tắm Thư Giãn Cao Cấp – Muối Tắm + Sữa Tắm + Xịt Thơm',
    price: 320000, originalPrice: 450000,
    imageUrl: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=600&h=600&fit=crop&q=90',
    rating: 4.8, reviewCount: 4500, sold: 18000, source: 'tiktok',
    affiliateLink: 'https://www.tiktok.com/search?q=set+t%E1%BA%AFm+th%C6%B0+gi%C3%A3n+cao+c%E1%BA%A5p',
    discount: 29, badge: '🛁 Self-care',
    tags: ['set tắm', 'muối tắm', 'sữa tắm', 'self-care', 'thư giãn', 'spa tại nhà', 'quà cho nữ', 'chăm sóc bản thân'],
  },

  // ── Đồ dùng decor & Tiện ích vật thể ─────────────────────────────
  {
    name: 'Đèn Ngủ Mặt Trăng 3D Cảm Ứng 16 Màu Kèm Đế Gỗ Decor',
    price: 220000, originalPrice: 310000,
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop&q=90',
    rating: 4.9, reviewCount: 12000, sold: 48000, source: 'shopee',
    affiliateLink: 'https://shopee.vn/search?keyword=%C4%91%E1%BA%B9n+ng%E1%BB%A7+m%E1%BA%B7t+tr%C4%83ng+3d',
    discount: 29, badge: '🌕 Decor hot',
    tags: ['đèn ngủ', 'đèn mặt trăng', 'decor', 'phòng ngủ', 'trang trí', 'quà dễ thương', 'đèn 3d'],
  },
  {
    name: 'Khung Ảnh Điện Tử HD 8 Inch Tự Động Trình Chiếu Kỷ Niệm',
    price: 890000, originalPrice: 1200000,
    imageUrl: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&h=600&fit=crop&q=90',
    rating: 4.9, reviewCount: 3200, sold: 9800, source: 'shopee',
    affiliateLink: 'https://shopee.vn/search?keyword=khung+%E1%BA%A3nh+%C4%91i%E1%BB%87n+t%E1%BB%AD+8+inch',
    discount: 26, badge: '🖼️ Kỷ niệm',
    tags: ['khung ảnh', 'khung ảnh điện tử', 'kỷ niệm', 'ảnh gia đình', 'quà ý nghĩa', 'decor'],
  },
  {
    name: 'Bình Giữ Nhiệt Inox 304 Lock&Lock LHC4131 450ml Cao Cấp',
    price: 265000, originalPrice: 380000,
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=600&fit=crop&q=90',
    rating: 4.9, reviewCount: 18900, sold: 72000, source: 'shopee',
    affiliateLink: 'https://shopee.vn/search?keyword=lock+lock+inox+304',
    discount: 30, badge: '✅ Chính hãng',
    tags: ['bình giữ nhiệt', 'lock lock', 'inox 304', 'giữ nóng', 'bình nước', 'quà thực tế'],
  },
];

// ============================================================
// SCORE: how well a product matches keyword + giftName
// ============================================================
function scoreProduct(product: RawProduct, keyword: string, giftName: string): number {
  const kw = keyword.toLowerCase();
  const gift = giftName.toLowerCase();
  const nameL = product.name.toLowerCase();

  // Tokenize inputs
  const kwTokens = kw.split(/\s+/).filter((t) => t.length > 1);
  const giftTokens = gift.split(/\s+/).filter((t) => t.length > 1);
  const allTokens = [...new Set([...kwTokens, ...giftTokens])];

  let score = 0;

  // High-weight: product name contains keyword tokens
  for (const token of kwTokens) {
    if (nameL.includes(token)) score += 4;
  }
  for (const token of giftTokens) {
    if (nameL.includes(token)) score += 3;
  }

  // Medium-weight: tags contain keyword tokens
  for (const tag of product.tags) {
    const tagL = tag.toLowerCase();
    for (const token of allTokens) {
      if (tagL.includes(token) || token.includes(tagL)) score += 2;
    }
  }

  // Bonus: full keyword phrase in name
  if (nameL.includes(kw)) score += 10;
  if (gift && nameL.includes(gift)) score += 8;

  return score;
}

// ============================================================
// GET HANDLER
// ============================================================
export async function GET(request: NextRequest) {
  try {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    if (!getRateLimit(ip)) {
      return NextResponse.json({ error: 'Quá nhiều yêu cầu tìm kiếm, vui lòng thử lại sau.' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword') || '';
    const giftName = searchParams.get('gift') || keyword;

    let products: Product[] = [];

    // 1. Call AIService (handles cache, Claude/Gemini AI, retries, timeout, JSON sanitizing)
    const { products: aiProducts, source } = await AIService.getOnlineProducts(keyword, giftName);
    products = aiProducts;

    // 2. Fallback: score all catalogue products by relevance to keyword + giftName
    if (products.length === 0) {
      if (source === 'fallback') {
        await new Promise((r) => setTimeout(r, 400));
      }

      const shopeeUrl = `https://shopee.vn/search?keyword=${encodeURIComponent(keyword)}`;
      const tiktokUrl = `https://www.tiktok.com/search?q=${encodeURIComponent(keyword)}`;

      // Score every product
      const scored = ALL_PRODUCTS.map((item) => ({
        item,
        score: scoreProduct(item, keyword, giftName),
      })).sort((a, b) => b.score - a.score);

      // Take top 6 (min score 0 — always show something)
      const topItems = scored.slice(0, 6);

      products = topItems.map(({ item }, index) => ({
        id: `mock_${index}`,
        name: item.name,
        price: item.price,
        originalPrice: item.originalPrice,
        imageUrl: resolveProductImage(item.name, item.imageUrl),
        rating: item.rating,
        reviewCount: item.reviewCount,
        sold: item.sold,
        source: item.source as 'shopee' | 'tiktok',
        affiliateLink: item.affiliateLink || (item.source === 'shopee' ? shopeeUrl : tiktokUrl),
        discount: item.discount,
        badge: item.badge,
        sizes: item.sizes,
      }));

      // If top score is very low, the keyword is generic — override affiliateLinks to point to search
      const topScore = scored[0]?.score ?? 0;
      if (topScore < 3) {
        products = products.map((p) => ({
          ...p,
          affiliateLink:
            p.source === 'shopee' ? shopeeUrl : tiktokUrl,
        }));
      }
    }

    // ── Sort: highest rating first, then cheapest ──
    products.sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return a.price - b.price;
    });

    // ── Auto-assign smart badges ──
    if (products.length > 0) {
      const topRated = products.reduce(
        (best, p) => (p.rating > best.rating ? p : best),
        products[0],
      );
      if (topRated.rating >= 4.9 && !topRated.badge) topRated.badge = '⭐ Đánh giá 5 sao';

      const shopeeItems = products.filter((p) => p.source === 'shopee');
      if (shopeeItems.length > 0) {
        const cheapest = shopeeItems.reduce(
          (min, p) => (p.price < min.price ? p : min),
          shopeeItems[0],
        );
        if (!cheapest.badge) cheapest.badge = '💸 Giá rẻ nhất';
      }

      const topSeller = products.reduce(
        (best, p) => (p.sold > best.sold ? p : best),
        products[0],
      );
      if (!topSeller.badge) topSeller.badge = '🔥 Bán chạy nhất';
    }

    return NextResponse.json({ products, keyword, totalFound: products.length });
  } catch (error) {
    console.error('search-online error:', error);
    return NextResponse.json(
      { error: 'Không thể tìm kiếm sản phẩm. Vui lòng thử lại.' },
      { status: 500 },
    );
  }
}

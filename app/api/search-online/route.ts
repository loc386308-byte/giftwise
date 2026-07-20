import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/types';

// ============================================================
// PRODUCT CATALOGUE – Unsplash images matching each product
// ============================================================
const MOCK_CATEGORIES: Record<string, Omit<Product, 'id'>[]> = {

  book: [
    {
      name: 'Sách Atomic Habits – Thay Đổi Tí Hon Hiệu Quả Phi Thường (Bìa Cứng Mạ Vàng)',
      price: 139000, originalPrice: 189000,
      imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=600&fit=crop&q=90',
      rating: 4.9, reviewCount: 8240, sold: 42500, source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=atomic+habits+b%C3%ACa+c%E1%BB%A9ng+m%E1%BA%A1+v%C3%A0ng', discount: 26, badge: '📚 Bestseller',
    },
    {
      name: 'Sách Đắc Nhân Tâm – Dale Carnegie (Bìa Đặc Biệt)',
      price: 95000, originalPrice: 130000,
      imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=600&fit=crop&q=90',
      rating: 4.8, reviewCount: 5210, sold: 19400, source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=%C4%91%E1%BA%AFc+nh%C3%A2n+t%C3%A2m+b%C3%ACa+%C4%91%E1%BA%B7c+bi%E1%BB%87t', discount: 27,
    },
    {
      name: 'Sổ Tay Leuchtturm1917 A5 Dotted – Bullet Journal Cao Cấp',
      price: 390000, originalPrice: 490000,
      imageUrl: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&h=600&fit=crop&q=90',
      rating: 4.9, reviewCount: 1420, sold: 4800, source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=leuchtturm1917+a5+dotted', discount: 20, badge: '✒️ Premium',
    },
    {
      name: 'Kindle Paperwhite 11th Gen 8GB – Màn E-Ink Không Chói Mắt',
      price: 3490000, originalPrice: 4200000,
      imageUrl: 'https://images.unsplash.com/photo-1592535400978-e0bace94b9c3?w=600&h=600&fit=crop&q=90',
      rating: 4.9, reviewCount: 6800, sold: 22000, source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=kindle+paperwhite+11th+ch%C3%ADnh+h%C3%A3ng', discount: 17, badge: '⭐ Đánh giá 5 sao',
    },
  ],

  beauty: [
    {
      name: 'Son Kem Lì Romand Zero Velvet Tint – #25 Mauve Beach',
      price: 149000, originalPrice: 210000,
      imageUrl: 'https://images.unsplash.com/photo-1586495777744-4e6b0864a597?w=600&h=600&fit=crop&q=90',
      rating: 4.9, reviewCount: 18940, sold: 82000, source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=romand+zero+velvet+tint+25', discount: 29, badge: '💄 Yêu thích',
    },
    {
      name: 'Kem Chống Nắng La Roche-Posay Anthelios SPF50+ 50ml',
      price: 385000, originalPrice: 495000,
      imageUrl: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=600&fit=crop&q=90',
      rating: 4.9, reviewCount: 12400, sold: 51000, source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=la+roche+posay+anthelios+spf50', discount: 22, badge: '✅ Chính hãng',
    },
    {
      name: 'Set Mặt Nạ Innisfree Jeju Volcanic Clay Mask 10 miếng',
      price: 220000, originalPrice: 310000,
      imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&h=600&fit=crop&q=90',
      rating: 4.8, reviewCount: 7800, sold: 32000, source: 'tiktok',
      affiliateLink: 'https://www.tiktok.com/search?q=innisfree+jeju+volcanic+mask', discount: 29, badge: '🔥 Viral TikTok',
    },
    {
      name: 'Gương Trang Điểm LED Hollywood 18 Bóng 3 Chế Độ Sáng',
      price: 340000, originalPrice: 480000,
      imageUrl: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600&h=600&fit=crop&q=90',
      rating: 4.8, reviewCount: 4200, sold: 16000, source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=g%C6%B0%C6%A1ng+trang+%C4%91i%E1%BB%83m+led+hollywood+18+b%C3%B3ng', discount: 29,
    },
  ],

  candle: [
    {
      name: 'Nến Thơm Diptyque Baies 190g – Hương Quả Mọng & Hoa Hồng Paris',
      price: 1890000, originalPrice: 2100000,
      imageUrl: 'https://images.unsplash.com/photo-1602523961358-f9f03dd557db?w=600&h=600&fit=crop&q=90',
      rating: 4.9, reviewCount: 890, sold: 2800, source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=diptyque+baies+candle+190g', discount: 10, badge: '✨ Luxury',
    },
    {
      name: 'Nến Thơm Hoa Khô Handmade Hũ Thủy Tinh Trong 200g',
      price: 145000, originalPrice: 199000,
      imageUrl: 'https://images.unsplash.com/photo-1603905624338-b23e5d0e2c98?w=600&h=600&fit=crop&q=90',
      rating: 4.8, reviewCount: 3560, sold: 14200, source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=n%E1%BA%BFn+th%C6%A1m+hoa+kh%C3%B4+th%E1%BB%A7y+tinh+handmade', discount: 27, badge: '🔥 Bán chạy',
    },
    {
      name: 'Nến Thơm Yankee Candle Lavender Large Jar 623g – Lưu Hương 150h',
      price: 890000, originalPrice: 1100000,
      imageUrl: 'https://images.unsplash.com/photo-1602874801006-8e8b862bc4c6?w=600&h=600&fit=crop&q=90',
      rating: 4.9, reviewCount: 1200, sold: 4500, source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=yankee+candle+large+jar+lavender', discount: 19, badge: '✅ Chính hãng',
    },
    {
      name: 'Nước Hoa Chanel Chance Eau Tendre EDT 100ml – Hương Nhẹ Nhàng',
      price: 3200000, originalPrice: 3800000,
      imageUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&h=600&fit=crop&q=90',
      rating: 4.9, reviewCount: 2100, sold: 7400, source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=chanel+chance+eau+tendre+100ml', discount: 16, badge: '🌸 Luxury',
    },
  ],

  tech: [
    {
      name: 'Tai Nghe Apple AirPods 3 Lightning Charging Case – Chính Hãng VN/A',
      price: 2790000, originalPrice: 3490000,
      imageUrl: 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=600&h=600&fit=crop&q=90',
      rating: 4.9, reviewCount: 12400, sold: 38000, source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=airpods+3+ch%C3%ADnh+h%C3%A3ng+VN', discount: 20, badge: '⭐ Top Pick',
    },
    {
      name: 'Loa Bluetooth JBL Flip 6 Chống Nước IP67 – Bass Mạnh 12h Pin',
      price: 1890000, originalPrice: 2490000,
      imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop&q=90',
      rating: 4.9, reviewCount: 8900, sold: 26000, source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=jbl+flip+6+ch%C3%ADnh+h%C3%A3ng', discount: 24, badge: '✅ Chính hãng',
    },
    {
      name: 'Pin Dự Phòng Anker 737 PowerCore 26800mAh 140W – Sạc Nhanh MacBook',
      price: 1290000, originalPrice: 1690000,
      imageUrl: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&h=600&fit=crop&q=90',
      rating: 4.9, reviewCount: 5600, sold: 18000, source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=anker+737+powercore+26800mah', discount: 24,
    },
    {
      name: 'Đế Sạc Không Dây Anker 3-in-1 MagSafe 15W – Sạc Đồng Thời 3 Thiết Bị',
      price: 890000, originalPrice: 1190000,
      imageUrl: 'https://images.unsplash.com/photo-1586253634026-8cb574908d1e?w=600&h=600&fit=crop&q=90',
      rating: 4.8, reviewCount: 3200, sold: 9800, source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=anker+wireless+charger+3in1+magsafe', discount: 25,
    },
  ],

  jewelry: [
    {
      name: 'Lắc Tay Bạc Thật S925 Đính Đá CZ Lấp Lánh – Phong Cách Hàn Quốc',
      price: 199000, originalPrice: 280000,
      imageUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=600&fit=crop&q=90',
      rating: 4.9, reviewCount: 5520, sold: 18400, source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=l%E1%BA%AFc+tay+b%E1%BA%A1c+s925+%C4%91%C3%ADnh+%C4%91%C3%A1+cz', discount: 28, badge: '🔥 Bán chạy',
    },
    {
      name: 'Dây Chuyền Vàng 18K Mặt Ngôi Sao Đính Kim Cương Nhân Tạo',
      price: 1250000, originalPrice: 1680000,
      imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop&q=90',
      rating: 4.9, reviewCount: 980, sold: 3100, source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=d%C3%A2y+chuy%E1%BB%81n+v%C3%A0ng+18k+%C4%91%C3%ADnh+%C4%91%C3%A1+cao+c%E1%BA%A5p', discount: 26, badge: '💎 Premium',
    },
    {
      name: 'Nhẫn Bạc Thật S925 Đính Đá Hoa Tinh Xảo – Tặng Hộp Nhung Cao Cấp',
      price: 245000, originalPrice: 340000,
      imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=600&fit=crop&q=90',
      rating: 4.8, reviewCount: 1980, sold: 7200, source: 'tiktok',
      affiliateLink: 'https://www.tiktok.com/search?q=nh%E1%BA%ABn+b%E1%BA%A1c+s925+%C4%91%C3%ADnh+%C4%91%C3%A1+hoa', discount: 28,
    },
  ],

  fashion: [
    {
      name: 'Túi Tote Canvas Cao Cấp Unisex Local Brand – Pastel Đa Màu',
      price: 185000, originalPrice: 260000,
      imageUrl: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600&h=600&fit=crop&q=90',
      rating: 4.8, reviewCount: 8420, sold: 32000, source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=t%C3%BAi+tote+canvas+local+brand+pastel',
      discount: 29, sizes: ['One Size'],
    },
    {
      name: 'Áo Khoác Dù Unisex 2 Lớp Chống Nước – Streetwear Local Brand',
      price: 680000, originalPrice: 890000,
      imageUrl: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&h=600&fit=crop&q=90',
      rating: 4.9, reviewCount: 3200, sold: 11000, source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=%C3%A1o+kho%C3%A1c+d%C3%B9+unisex+ch%E1%BB%91ng+n%C6%B0%E1%BB%9Bc+local+brand',
      discount: 24, badge: '🔥 Bán chạy', sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    },
    {
      name: 'Giày Sneaker Nữ Đế Dày Platform Retro – Màu Pastel Hot Trend',
      price: 425000, originalPrice: 590000,
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop&q=90',
      rating: 4.8, reviewCount: 5600, sold: 19000, source: 'tiktok',
      affiliateLink: 'https://www.tiktok.com/search?q=gi%C3%A0y+sneaker+platform+n%E1%BB%AF+pastel',
      discount: 28, sizes: ['35', '36', '37', '38', '39', '40'],
    },
    {
      name: 'Túi Xách Đeo Chéo Da PU Nữ Mini Dáng Baguette Vintage – Nhiều Màu',
      price: 320000, originalPrice: 450000,
      imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop&q=90',
      rating: 4.9, reviewCount: 2800, sold: 9500, source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=t%C3%BAi+x%C3%A1ch+da+pu+n%E1%BB%AF+baguette+vintage',
      discount: 29, badge: '🔥 Hot', sizes: ['One Size'],
    },
  ],

  bottle: [
    {
      name: 'Bình Giữ Nhiệt Stanley Quencher H2.0 Flowstate 591ml – Soft Matte',
      price: 1350000, originalPrice: 1790000,
      imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=600&fit=crop&q=90',
      rating: 4.9, reviewCount: 8900, sold: 28000, source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=stanley+quencher+591ml+soft+matte', discount: 24, badge: '🔥 Viral TikTok',
    },
    {
      name: 'Bình Giữ Nhiệt Lock&Lock Inox 304 LHC4131 450ml – Không BPA',
      price: 265000, originalPrice: 380000,
      imageUrl: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600&h=600&fit=crop&q=90',
      rating: 4.9, reviewCount: 18900, sold: 72000, source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=lock+lock+lhc4131+inox+304', discount: 30, badge: '✅ Chính hãng',
    },
  ],

  gaming: [
    {
      name: 'Bàn Phím Cơ Keychron K2 Pro Bluetooth/USB-C Hot-Swap RGB',
      price: 2490000, originalPrice: 3200000,
      imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=600&fit=crop&q=90',
      rating: 4.9, reviewCount: 4230, sold: 12900, source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=keychron+k2+pro+bluetooth+hot+swap', discount: 22, badge: '🏆 Editor Choice',
    },
    {
      name: 'Tai Nghe Gaming SteelSeries Arctis Nova 3 – Surround 7.1',
      price: 1290000, originalPrice: 1690000,
      imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&h=600&fit=crop&q=90',
      rating: 4.9, reviewCount: 2890, sold: 9400, source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=steelseries+arctis+nova+3+ch%C3%ADnh+h%C3%A3ng', discount: 24,
    },
    {
      name: 'Tay Cầm Xbox Wireless Controller – Glacier Blue Chính Hãng',
      price: 1590000, originalPrice: 1990000,
      imageUrl: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=600&h=600&fit=crop&q=90',
      rating: 4.9, reviewCount: 1560, sold: 5800, source: 'tiktok',
      affiliateLink: 'https://www.tiktok.com/search?q=xbox+wireless+controller+glacier+blue', discount: 20, badge: '✅ Chính hãng',
    },
    {
      name: 'Lót Chuột ASUS ROG Scabbard II Extended 900×400mm Chống Nước',
      price: 890000, originalPrice: 1190000,
      imageUrl: 'https://images.unsplash.com/photo-1593640408182-31c228eb60cd?w=600&h=600&fit=crop&q=90',
      rating: 4.8, reviewCount: 3400, sold: 11000, source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=asus+rog+scabbard+ii+extended', discount: 25,
    },
    {
      name: 'Đèn LED RGB Govee Immersion TV – Ambilight Sync Theo Màn Hình',
      price: 450000, originalPrice: 650000,
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop&q=90',
      rating: 4.8, reviewCount: 2100, sold: 8700, source: 'tiktok',
      affiliateLink: 'https://www.tiktok.com/search?q=govee+immersion+tv+led+rgb', discount: 31, badge: '🔥 Xu hướng',
    },
  ],

  menFashion: [
    {
      name: 'Nước Hoa Dior Sauvage EDT 100ml – Hương Gỗ Nam Tính Lưu Hương 8h',
      price: 3100000, originalPrice: 3800000,
      imageUrl: 'https://images.unsplash.com/photo-1547887538-047020f28e25?w=600&h=600&fit=crop&q=90',
      rating: 4.9, reviewCount: 4200, sold: 14500, source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=dior+sauvage+edt+100ml+ch%C3%ADnh+h%C3%A3ng', discount: 18, badge: '🔥 Best Seller',
    },
    {
      name: 'Sáp Vuốt Tóc LAYRITE Superhold Pomade 297g – Barbershop Pick',
      price: 290000, originalPrice: 390000,
      imageUrl: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=600&h=600&fit=crop&q=90',
      rating: 4.9, reviewCount: 7800, sold: 28000, source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=layrite+superhold+pomade+297g', discount: 26, badge: '✂️ Barbershop Pick',
    },
    {
      name: 'Giày Adidas Stan Smith OG Vintage White/Green – Chính Hãng',
      price: 2190000, originalPrice: 2800000,
      imageUrl: 'https://images.unsplash.com/photo-1556906781-9a412961d28e?w=600&h=600&fit=crop&q=90',
      rating: 4.8, reviewCount: 3200, sold: 10500, source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=adidas+stan+smith+ch%C3%ADnh+h%C3%A3ng',
      discount: 22, sizes: ['38', '39', '40', '41', '42', '43', '44'],
    },
    {
      name: 'Ví Da Thật Nam Full-Grain Leather Slim Bifold – RFID Blocking',
      price: 680000, originalPrice: 890000,
      imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&h=600&fit=crop&q=90',
      rating: 4.9, reviewCount: 2100, sold: 7800, source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=v%C3%AD+da+th%E1%BA%ADt+nam+full+grain+slim+rfid', discount: 24,
    },
  ],

  travel: [
    {
      name: 'Balo Du Lịch Thule Crossover 2 40L Chống Nước – Ngăn Laptop 15"',
      price: 2900000, originalPrice: 3800000,
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop&q=90',
      rating: 4.9, reviewCount: 890, sold: 2800, source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=thule+crossover+2+40l+ch%C3%ADnh+h%C3%A3ng', discount: 24, badge: '💎 Premium',
    },
    {
      name: 'Giày Chạy Bộ Nike React Miler 3 – Đế React Siêu Êm',
      price: 2590000, originalPrice: 3200000,
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop&q=90',
      rating: 4.8, reviewCount: 2100, sold: 7400, source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=nike+react+miler+3+running',
      discount: 19, sizes: ['38', '39', '40', '41', '42', '43', '44'],
    },
    {
      name: 'Bình Giữ Nhiệt Stanley Quencher 30oz Tumbler – Giữ Lạnh 4h Ice',
      price: 1350000, originalPrice: 1790000,
      imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=600&fit=crop&q=90',
      rating: 4.9, reviewCount: 5400, sold: 21000, source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=stanley+quencher+30oz+tumbler', discount: 25, badge: '🔥 Viral',
    },
  ],

  kitchen: [
    {
      name: 'Nồi Chiên Không Dầu Philips HD9270 7L – Màn Hình Cảm Ứng Digital',
      price: 2890000, originalPrice: 3900000,
      imageUrl: 'https://images.unsplash.com/photo-1648462560743-5e5c6b62b86e?w=600&h=600&fit=crop&q=90',
      rating: 4.9, reviewCount: 8900, sold: 34000, source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=philips+hd9270+n%E1%BB%93i+chi%C3%AAn+kh%C3%B4ng+d%E1%BA%A7u+7l', discount: 26, badge: '✅ Chính hãng',
    },
    {
      name: 'Thớt Gỗ Acacia Cao Cấp Khắc Tên Miễn Phí – Decor Bếp Sang Trọng',
      price: 380000, originalPrice: 520000,
      imageUrl: 'https://images.unsplash.com/photo-1542010589005-d1eacc3918f2?w=600&h=600&fit=crop&q=90',
      rating: 4.9, reviewCount: 3200, sold: 12500, source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=th%E1%BB%9Bt+g%E1%BB%97+acacia+kh%E1%BA%AFc+t%C3%AAn+cao+c%E1%BA%A5p', discount: 27, badge: '🎁 Cá nhân hóa',
    },
    {
      name: 'Set Trà Matcha Nhật Bản – Bột Matcha + Chén Sứ + Chổi Khuấy Cao Cấp',
      price: 450000, originalPrice: 620000,
      imageUrl: 'https://images.unsplash.com/photo-1572635148818-ef6fd45eb394?w=600&h=600&fit=crop&q=90',
      rating: 4.9, reviewCount: 2100, sold: 8900, source: 'tiktok',
      affiliateLink: 'https://www.tiktok.com/search?q=b%E1%BB%99+d%E1%BB%A5ng+c%E1%BB%A5+pha+matcha+nh%E1%BA%ADt+b%E1%BA%A3n+cao+c%E1%BA%A5p', discount: 27, badge: '🍵 Viral',
    },
    {
      name: 'Máy Tạo Bọt Cafe Mini Cầm Tay – Đánh Bông Sữa Dalgona Tại Nhà',
      price: 125000, originalPrice: 180000,
      imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=600&fit=crop&q=90',
      rating: 4.8, reviewCount: 4200, sold: 18000, source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=m%C3%A1y+t%E1%BA%A1o+b%E1%BB%8Dt+cafe+%C4%91%C3%A1nh+b%C3%B4ng+s%E1%BB%AFa', discount: 31,
    },
  ],

  // ── Experience ──────────────────────────────────────────────────────────────
  experience: [
    {
      name: 'Voucher Spa & Massage Body Toàn Thân 90 Phút – Thư Giãn 5 Sao',
      price: 450000, originalPrice: 800000,
      imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=600&fit=crop&q=90',
      rating: 4.9, reviewCount: 2800, sold: 9400, source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=voucher+spa+massage+body+90+ph%C3%BAt', discount: 44, badge: '💆 Giảm 44%',
    },
    {
      name: 'Voucher Nhà Hàng Fine Dining Bữa Tối Lãng Mạn Cho 2 Người',
      price: 1200000, originalPrice: 1500000,
      imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=600&fit=crop&q=90',
      rating: 4.9, reviewCount: 1200, sold: 3800, source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=voucher+nh%C3%A0+h%C3%A0ng+fine+dining+2+ng%C6%B0%E1%BB%9Di', discount: 20, badge: '🍽️ Sang trọng',
    },
    {
      name: 'Voucher Khóa Học Làm Bánh 1 Buổi Tại Baking Studio – Kèm Nguyên Liệu',
      price: 350000, originalPrice: 500000,
      imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=600&fit=crop&q=90',
      rating: 4.9, reviewCount: 890, sold: 2900, source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=voucher+kh%C3%B3a+h%E1%BB%8Dc+l%C3%A0m+b%C3%A1nh', discount: 30, badge: '🧁 Trải nghiệm',
    },
    {
      name: 'Voucher Chụp Ảnh Studio Chuyên Nghiệp 1 Giờ – Kèm Chỉnh Ảnh',
      price: 500000, originalPrice: 750000,
      imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=600&fit=crop&q=90',
      rating: 4.8, reviewCount: 780, sold: 2100, source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=voucher+ch%E1%BB%A5p+%E1%BA%A3nh+studio', discount: 33, badge: '📸 Creative',
    },
  ],

  // ── Digital Gifts ──────────────────────────────────────────────────────────
  digital: [
    {
      name: 'Thẻ Nạp Netflix Premium 1 Tháng – 4 Màn Hình HD/4K Ultra',
      price: 260000, originalPrice: 310000,
      imageUrl: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=600&h=600&fit=crop&q=90',
      rating: 4.9, reviewCount: 18000, sold: 65000, source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=th%E1%BA%BB+n%E1%BA%A1p+netflix+premium+1+th%C3%A1ng', discount: 16, badge: '🎬 Quà số hot',
    },
    {
      name: 'Gift Card Steam 500.000đ – Mua Game PC Bất Kỳ Theo Ý Thích',
      price: 500000, originalPrice: 500000,
      imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=600&fit=crop&q=90',
      rating: 4.9, reviewCount: 12000, sold: 44000, source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=steam+wallet+code+500000+vnd', discount: 0, badge: '🎮 Gamer Gift',
    },
    {
      name: 'Thẻ Spotify Premium 3 Tháng – Nghe Nhạc Offline Không Quảng Cáo',
      price: 175000, originalPrice: 200000,
      imageUrl: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&h=600&fit=crop&q=90',
      rating: 4.9, reviewCount: 8900, sold: 32000, source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=spotify+premium+gift+card+3+th%C3%A1ng', discount: 13, badge: '🎵 Âm nhạc',
    },
    {
      name: 'Thẻ App Store / Google Play 300.000đ – Mua App & Game Tùy Ý',
      price: 300000, originalPrice: 300000,
      imageUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&h=600&fit=crop&q=90',
      rating: 4.9, reviewCount: 6700, sold: 25000, source: 'shopee',
      affiliateLink: 'https://shopee.vn/search?keyword=app+store+google+play+gift+card+300000', discount: 0, badge: '📱 Linh hoạt',
    },
  ],
};

// ============================================================
// KEYWORD → CATEGORY MAPPING
// ============================================================
function getCategoryFromKeyword(keyword: string): string {
  const kw = keyword.toLowerCase();

  if (kw.includes('vé') || kw.includes('voucher') || kw.includes('concert') || kw.includes('spa') || kw.includes('massage') || kw.includes('xem phim') || kw.includes('cgv') || kw.includes('escape room') || kw.includes('dining') || kw.includes('lớp học') || kw.includes('khóa học') || kw.includes('trải nghiệm') || kw.includes('chụp ảnh')) return 'experience';
  if (kw.includes('netflix') || kw.includes('spotify') || kw.includes('steam') || kw.includes('google play') || kw.includes('app store') || kw.includes('gift card') || kw.includes('thẻ nạp') || kw.includes('digital') || kw.includes('game card')) return 'digital';
  if (kw.includes('sách') || kw.includes('đọc') || kw.includes('truyện') || kw.includes('habits') || kw.includes('cuốn') || kw.includes('bookmark') || kw.includes('kệ sách') || kw.includes('đèn đọc') || kw.includes('sổ tay') || kw.includes('leuchtturm') || kw.includes('kindle')) return 'book';
  if (kw.includes('gaming') || kw.includes('game') || kw.includes('bàn phím') || kw.includes('tay cầm') || kw.includes('mousepad') || kw.includes('lót chuột') || kw.includes('keychron') || kw.includes('steelseries') || kw.includes('xbox') || kw.includes('asus rog') || kw.includes('rgb') || kw.includes('esport')) return 'gaming';
  if (kw.includes('tai nghe') || kw.includes('airpods') || kw.includes('jbl') || kw.includes('loa') || kw.includes('bluetooth') || kw.includes('đế sạc') || kw.includes('sạc không dây') || kw.includes('công nghệ') || kw.includes('pin dự phòng') || kw.includes('anker')) return 'tech';
  if (kw.includes('son') || kw.includes('kem dưỡng') || kw.includes('skincare') || kw.includes('mỹ phẩm') || kw.includes('làm đẹp') || kw.includes('tẩy trang') || kw.includes('cọ') || kw.includes('gương') || kw.includes('máy rửa mặt') || kw.includes('serum') || kw.includes('mặt nạ') || kw.includes('foreo') || kw.includes('romand') || kw.includes('innisfree') || kw.includes('la roche')) return 'beauty';
  if (kw.includes('nước hoa') || kw.includes('perfume') || kw.includes('fragrance') || kw.includes('nến') || kw.includes('thơm') || kw.includes('tinh dầu') || kw.includes('diptyque') || kw.includes('yankee') || kw.includes('chanel') || kw.includes('dior') && kw.includes('hương')) return 'candle';
  if (kw.includes('trang sức') || kw.includes('vòng tay') || kw.includes('lắc') || kw.includes('nhẫn') || kw.includes('bạc s925') || kw.includes('dây chuyền') || kw.includes('vàng 18k') || kw.includes('jewelry')) return 'jewelry';
  if (kw.includes('sáp') || kw.includes('layrite') || kw.includes('ví da') || kw.includes('kính mắt') || kw.includes('thắt lưng') || kw.includes('rayban') || kw.includes('sauvage') || kw.includes('dior') || kw.includes('adidas') || kw.includes('stan smith') || kw.includes('giày nam') || kw.includes('sneaker nam')) return 'menFashion';
  if (kw.includes('túi') || kw.includes('tote') || kw.includes('thời trang') || kw.includes('áo khoác') || kw.includes('da pu') || kw.includes('baguette') || kw.includes('canvas bag') || kw.includes('giày nữ') || kw.includes('sneaker nữ')) return 'fashion';
  if (kw.includes('bình') || kw.includes('giữ nhiệt') || kw.includes('stanley') || kw.includes('tumbler') || kw.includes('lock lock') || kw.includes('water bottle')) return 'bottle';
  if (kw.includes('du lịch') || kw.includes('balo') || kw.includes('phượt') || kw.includes('thể thao') || kw.includes('chạy bộ') || kw.includes('gym') || kw.includes('osprey') || kw.includes('thule') || kw.includes('garmin') || kw.includes('lifestraw')) return 'travel';
  if (kw.includes('bếp') || kw.includes('nấu ăn') || kw.includes('thớt') || kw.includes('muỗng') || kw.includes('tạp dề') || kw.includes('trà') || kw.includes('matcha') || kw.includes('acacia') || kw.includes('philips') || kw.includes('nồi chiên') || kw.includes('baking') || kw.includes('làm bánh')) return 'kitchen';
  if (kw.includes('sổ') || kw.includes('planner') || kw.includes('bút') || kw.includes('văn phòng') || kw.includes('kế hoạch') || kw.includes('bullet journal')) return 'book';

  return 'experience';
}

// ============================================================
// CLAUDE API CALL (if API key available)
// ============================================================
async function callClaudeForProducts(keyword: string, apiKey: string): Promise<Product[]> {
  const prompt = `Bạn là trợ lý tìm sản phẩm Việt Nam. Từ khóa: "${keyword}".
Tạo danh sách 6 sản phẩm ĐANG BÁN THẬT trên Shopee / TikTok Shop, ưu tiên:
1. Giá THẤP NHẤT so với cùng mặt hàng
2. Đánh giá CỰC CAO (rating ≥ 4.8)
3. Lượt bán NHIỀU (sold ≥ 1000)
4. Tên sản phẩm ĐẦY ĐỦ, có thương hiệu rõ ràng
5. price và originalPrice là số nguyên VNĐ
6. imageUrl: dùng ảnh Unsplash phù hợp với sản phẩm (https://images.unsplash.com/photo-XXXX?w=600&h=600&fit=crop&q=90)

Trả về CHỈ JSON:
{
  "products": [
    { "id": "p1", "name": "...", "price": 150000, "originalPrice": 220000, "imageUrl": "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=600&fit=crop&q=90", "rating": 4.9, "reviewCount": 3200, "sold": 8500, "source": "shopee", "affiliateLink": "https://shopee.vn/search?keyword=...", "discount": 32, "badge": "Bán chạy" }
  ]
}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-3-5-haiku-20241022', max_tokens: 2048, messages: [{ role: 'user', content: prompt }] }),
  });

  if (!response.ok) throw new Error(`Claude status: ${response.status}`);
  const data = await response.json();
  const text = data.content?.[0]?.text || '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON returned');
  const parsed = JSON.parse(jsonMatch[0]);
  return parsed.products || [];
}

// ============================================================
// GET HANDLER
// ============================================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword') || '';

    let products: Product[] = [];

    // 1. Try Claude AI first
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        products = await callClaudeForProducts(keyword, process.env.ANTHROPIC_API_KEY);
      } catch (aiError) {
        console.warn('AI product generation failed, using smart mock:', aiError);
      }
    }

    // 2. Fallback to curated mock data
    if (products.length === 0) {
      await new Promise((r) => setTimeout(r, 600));
      const category = getCategoryFromKeyword(keyword);
      const matchedMocks = MOCK_CATEGORIES[category] || MOCK_CATEGORIES.experience;
      const shopeeUrl = `https://shopee.vn/search?keyword=${encodeURIComponent(keyword)}`;
      const tiktokUrl = `https://www.tiktok.com/search?q=${encodeURIComponent(keyword)}`;

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
        affiliateLink: item.affiliateLink || (item.source === 'shopee' ? shopeeUrl : tiktokUrl),
        discount: item.discount,
        badge: item.badge,
        sizes: item.sizes,
      }));
    }

    // ── Sort: highest rating first, then cheapest ──
    products.sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return a.price - b.price;
    });

    // ── Auto-assign smart badges ──
    if (products.length > 0) {
      const topRated = products.reduce((best, p) => (p.rating > best.rating ? p : best), products[0]);
      if (topRated.rating >= 4.9 && !topRated.badge) topRated.badge = '⭐ Đánh giá 5 sao';

      const shopeeItems = products.filter((p) => p.source === 'shopee');
      if (shopeeItems.length > 0) {
        const cheapest = shopeeItems.reduce((min, p) => (p.price < min.price ? p : min), shopeeItems[0]);
        if (!cheapest.badge) cheapest.badge = '💸 Giá rẻ nhất';
      }

      const topSeller = products.reduce((best, p) => (p.sold > best.sold ? p : best), products[0]);
      if (!topSeller.badge) topSeller.badge = '🔥 Bán chạy nhất';
    }

    return NextResponse.json({ products, keyword, totalFound: products.length });
  } catch (error) {
    console.error('search-online error:', error);
    return NextResponse.json({ error: 'Không thể tìm kiếm sản phẩm. Vui lòng thử lại.' }, { status: 500 });
  }
}

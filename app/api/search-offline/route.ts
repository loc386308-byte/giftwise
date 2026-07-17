import { NextRequest, NextResponse } from 'next/server';
import { Store } from '@/types';

// ─── Category-aware store map ───────────────────────────────────────────────
type StoreTemplate = Omit<Store, 'id' | 'lat' | 'lng' | 'distanceMeters'>;

const STORE_TEMPLATES: Record<string, StoreTemplate[]> = {
  gaming: [
    { name: 'GameStop VN', address: 'Nguyễn Trãi, Quận 1', phone: '028 3823 1234', openNow: true, rating: 4.9, reviewCount: 2140, hours: '9:00 – 22:00', category: 'Cửa hàng Gaming', priceLevel: '$$', features: ['Bán phím cơ', 'Tai nghe gaming', 'Đèn LED RGB'] },
    { name: 'GearVN Store', address: 'Lê Văn Sỹ, Quận 3', phone: '028 3945 5678', openNow: true, rating: 4.9, reviewCount: 3870, hours: '8:30 – 21:30', category: 'Thiết bị Gaming', priceLevel: '$$', features: ['Bàn phím cơ', 'Chuột gaming', 'Lót chuột XL'] },
    { name: 'FPT Shop Gaming', address: 'Điện Biên Phủ, Bình Thạnh', phone: '028 3516 9900', openNow: true, rating: 4.7, reviewCount: 1560, hours: '8:00 – 22:00', category: 'Điện máy & Gaming', priceLevel: '$$$', features: ['Tai nghe', 'Tay cầm', 'Bàn phím'] },
    { name: 'Shopee Mall – Gaming Zone', address: 'Nguyễn Thị Minh Khai, Q.1', phone: '028 3825 4321', openNow: false, rating: 4.8, reviewCount: 980, hours: '10:00 – 21:00', category: 'Gaming Accessories', priceLevel: '$$', features: ['Lót chuột', 'RGB Setup', 'Tai nghe'] },
  ],
  tech: [
    { name: 'Di Động Việt', address: 'Lê Đại Hành, Quận 11', phone: '028 3864 5566', openNow: true, rating: 4.8, reviewCount: 5200, hours: '8:00 – 22:00', category: 'Điện thoại & Phụ kiện', priceLevel: '$$', features: ['Sạc nhanh', 'Tai nghe', 'Cáp sạc'] },
    { name: 'CellphoneS', address: 'Hoàng Văn Thụ, Phú Nhuận', phone: '028 7300 0789', openNow: true, rating: 4.9, reviewCount: 8900, hours: '7:30 – 22:30', category: 'Công nghệ', priceLevel: '$$$', features: ['Đế sạc', 'Tai nghe bluetooth', 'Loa'] },
    { name: 'FPT Shop', address: 'Cộng Hòa, Tân Bình', phone: '028 3812 0000', openNow: true, rating: 4.7, reviewCount: 3400, hours: '8:00 – 22:00', category: 'Điện máy', priceLevel: '$$$', features: ['Phụ kiện Apple', 'Loa bluetooth', 'Pin dự phòng'] },
    { name: 'Thế Giới Di Động', address: 'Quang Trung, Gò Vấp', phone: '028 3621 7777', openNow: false, rating: 4.6, reviewCount: 12000, hours: '8:00 – 22:00', category: 'Điện thoại', priceLevel: '$$', features: ['Pin dự phòng', 'Phụ kiện', 'Sạc nhanh'] },
  ],
  beauty: [
    { name: 'Hasaki Beauty & Spa', address: 'Trần Hưng Đạo, Quận 1', phone: '028 3821 7711', openNow: true, rating: 4.9, reviewCount: 6700, hours: '8:00 – 22:00', category: 'Mỹ phẩm chính hãng', priceLevel: '$$', features: ['Son môi', 'Skincare Hàn', 'Nước hoa'] },
    { name: 'Watsons Vietnam', address: 'Nguyễn Huệ, Quận 1', phone: '028 3822 8800', openNow: true, rating: 4.8, reviewCount: 4300, hours: '9:00 – 22:00', category: 'Health & Beauty', priceLevel: '$$', features: ['Mỹ phẩm', 'Son', 'Kem dưỡng'] },
    { name: 'Guardian – Vincom', address: 'Đồng Khởi, Quận 1', phone: '028 3915 3300', openNow: true, rating: 4.7, reviewCount: 2100, hours: '9:30 – 22:00', category: 'Mỹ phẩm & Chăm sóc', priceLevel: '$$$', features: ['Nước hoa', 'Serum', 'Cọ trang điểm'] },
    { name: 'Innisfree Official Store', address: 'Hai Bà Trưng, Quận 3', phone: '028 3930 5566', openNow: false, rating: 4.9, reviewCount: 890, hours: '10:00 – 21:00', category: 'Mỹ phẩm Hàn Quốc', priceLevel: '$$$', features: ['Skincare Jeju', 'Mặt nạ', 'Serum'] },
  ],
  fashion: [
    { name: 'CANIFA Fashion', address: 'Đồng Khởi, Quận 1', phone: '028 3824 4400', openNow: true, rating: 4.7, reviewCount: 1800, hours: '9:00 – 22:00', category: 'Thời trang', priceLevel: '$$', features: ['Túi tote', 'Áo khoác', 'Phụ kiện'] },
    { name: 'Routine Store', address: 'Lý Tự Trọng, Quận 1', phone: '028 3910 2200', openNow: true, rating: 4.8, reviewCount: 950, hours: '10:00 – 21:30', category: 'Thời trang local brand', priceLevel: '$$', features: ['Túi canvas', 'Tote bag', 'Kẹp tóc'] },
    { name: 'Zara – Vincom Đồng Khởi', address: 'Ngô Đức Kế, Quận 1', phone: '028 3915 5500', openNow: true, rating: 4.6, reviewCount: 3400, hours: '9:30 – 22:00', category: 'Thời trang quốc tế', priceLevel: '$$$', features: ['Túi xách', 'Thời trang', 'Phụ kiện'] },
    { name: 'Túi Xách Thương Hiệu', address: 'Nguyễn Thị Nghĩa, Q.1', phone: '028 3821 6633', openNow: false, rating: 4.7, reviewCount: 670, hours: '9:00 – 21:00', category: 'Túi xách & Phụ kiện', priceLevel: '$$', features: ['Túi đeo chéo', 'Balo', 'Ví'] },
  ],
  reading: [
    { name: 'Nhà Sách Fahasa Nguyễn Huệ', address: 'Nguyễn Huệ, Quận 1', phone: '028 3822 0037', openNow: true, rating: 4.9, reviewCount: 8900, hours: '8:00 – 22:00', category: 'Nhà sách lớn', priceLevel: '$', features: ['Sách bestseller', 'Sổ tay', 'Bookmark'] },
    { name: 'Nhà Sách Phương Nam', address: 'Nguyễn Đình Chiểu, Quận 3', phone: '028 3930 4455', openNow: true, rating: 4.8, reviewCount: 5600, hours: '8:00 – 21:30', category: 'Sách & Văn phòng phẩm', priceLevel: '$', features: ['Sách', 'Bút viết', 'Sổ tay'] },
    { name: 'Tiệm Sách Cũ Hoài Hương', address: 'Đinh Lê, Quận 1', phone: '028 3824 1122', openNow: true, rating: 4.9, reviewCount: 320, hours: '9:00 – 20:00', category: 'Sách cũ & Lưu niệm', priceLevel: '$', features: ['Sách cũ', 'Đèn đọc sách', 'Bookmark gỗ'] },
    { name: 'Anh Đức Stationery', address: 'Phan Đình Phùng, Phú Nhuận', phone: '028 3844 6677', openNow: false, rating: 4.7, reviewCount: 560, hours: '7:30 – 21:00', category: 'Văn phòng phẩm', priceLevel: '$', features: ['Sổ tay', 'Bút ký', 'Kệ sách'] },
  ],
  travel: [
    { name: 'Hapa Kristin Travel Gear', address: 'Bùi Viện, Quận 1', phone: '028 3920 1234', openNow: true, rating: 4.8, reviewCount: 1200, hours: '9:00 – 22:00', category: 'Đồ phượt & Du lịch', priceLevel: '$$', features: ['Balo phượt', 'Gối cổ', 'Túi chống nước'] },
    { name: 'Decathlon Vietnam', address: 'Nguyễn Trãi, Quận 5', phone: '028 3852 8888', openNow: true, rating: 4.9, reviewCount: 7800, hours: '9:00 – 22:00', category: 'Thể thao & Dã ngoại', priceLevel: '$$', features: ['Balo', 'Bình nước', 'Phụ kiện thể thao'] },
    { name: 'The North Face – Nguyễn Huệ', address: 'Nguyễn Huệ, Quận 1', phone: '028 3827 9900', openNow: true, rating: 4.8, reviewCount: 890, hours: '9:30 – 22:00', category: 'Outdoor & Phượt', priceLevel: '$$$', features: ['Balo leo núi', 'Áo chống nước', 'Phụ kiện dã ngoại'] },
    { name: 'Sport 2000 – Vincom', address: 'Điện Biên Phủ, Q.3', phone: '028 3938 6600', openNow: false, rating: 4.6, reviewCount: 1500, hours: '9:00 – 21:30', category: 'Thể thao', priceLevel: '$$', features: ['Loa bluetooth', 'Túi thể thao', 'Bình nước'] },
  ],
  cooking: [
    { name: 'Bếp Xanh – Đồ dùng bếp cao cấp', address: 'Âu Cơ, Quận Tân Bình', phone: '028 3948 5500', openNow: true, rating: 4.8, reviewCount: 1340, hours: '8:00 – 21:00', category: 'Đồ dùng nhà bếp', priceLevel: '$$', features: ['Thớt gỗ', 'Bộ dao', 'Nồi lẩu mini'] },
    { name: 'IKEA Vietnam – Bếp & Nhà', address: 'Đại lộ Bình Dương, Thuận An', phone: '028 7300 4321', openNow: true, rating: 4.7, reviewCount: 9800, hours: '9:00 – 22:00', category: 'Nội thất & Bếp', priceLevel: '$$', features: ['Cốc thủy tinh', 'Bộ muỗng nĩa', 'Tạp dề'] },
    { name: 'Saigon Kitchenware Market', address: 'Châu Văn Liêm, Quận 5', phone: '028 3855 2200', openNow: true, rating: 4.6, reviewCount: 670, hours: '7:00 – 18:00', category: 'Đồ bếp sỉ & lẻ', priceLevel: '$', features: ['Thớt', 'Dụng cụ bếp', 'Gia vị cao cấp'] },
    { name: 'HomeBase – Đồ gia dụng', address: 'Lý Thường Kiệt, Q.10', phone: '028 3856 7788', openNow: false, rating: 4.7, reviewCount: 2100, hours: '8:30 – 21:30', category: 'Gia dụng & Bếp', priceLevel: '$$', features: ['Nồi', 'Đồ bếp', 'Set trà'] },
  ],
  general: [
    { name: 'Vincom Shopping Mall', address: 'Đồng Khởi, Quận 1', phone: '028 3936 9999', openNow: true, rating: 4.8, reviewCount: 15000, hours: '9:30 – 22:00', category: 'Trung tâm mua sắm', priceLevel: '$$', features: ['Đa dạng mặt hàng', 'Quà tặng', 'Thời trang'] },
    { name: 'Gigamall – Thủ Đức', address: 'Phạm Văn Đồng, Thủ Đức', phone: '028 3727 2888', openNow: true, rating: 4.7, reviewCount: 6700, hours: '9:00 – 22:00', category: 'Trung tâm mua sắm', priceLevel: '$$', features: ['Quà tặng', 'Đồ gia dụng', 'Thời trang'] },
    { name: 'Lotte Mart – Gò Vấp', address: 'Nguyễn Văn Lượng, Gò Vấp', phone: '028 3588 8800', openNow: true, rating: 4.6, reviewCount: 9800, hours: '8:00 – 22:00', category: 'Siêu thị & Mua sắm', priceLevel: '$', features: ['Quà tặng', 'Đa dạng hàng hóa'] },
    { name: 'Co.opMart Foodcourt', address: 'Nguyễn Đình Chiểu, Q.3', phone: '028 3930 6666', openNow: false, rating: 4.5, reviewCount: 4200, hours: '7:00 – 22:00', category: 'Siêu thị', priceLevel: '$', features: ['Đồ gia dụng', 'Thực phẩm', 'Đồ dùng'] },
  ],
};

// Map search keyword → store category
function getStoreCategory(keyword: string): string {
  const kw = keyword.toLowerCase();
  if (kw.includes('gaming') || kw.includes('bàn phím') || kw.includes('lót chuột') || kw.includes('tay cầm') || kw.includes('game') || kw.includes('led rgb') || kw.includes('lego') || kw.includes('mô hình')) return 'gaming';
  if (kw.includes('tai nghe') || kw.includes('loa') || kw.includes('sạc') || kw.includes('cáp') || kw.includes('pin') || kw.includes('bluetooth') || kw.includes('công nghệ')) return 'tech';
  if (kw.includes('son') || kw.includes('kem') || kw.includes('skincare') || kw.includes('mỹ phẩm') || kw.includes('nước hoa') || kw.includes('serum') || kw.includes('cọ') || kw.includes('gương') || kw.includes('mặt nạ')) return 'beauty';
  if (kw.includes('túi') || kw.includes('thời trang') || kw.includes('áo') || kw.includes('quần') || kw.includes('ví') || kw.includes('kính') || kw.includes('thắt lưng') || kw.includes('tote')) return 'fashion';
  if (kw.includes('sách') || kw.includes('đèn đọc') || kw.includes('bookmark') || kw.includes('sổ tay') || kw.includes('kệ sách') || kw.includes('bút')) return 'reading';
  if (kw.includes('du lịch') || kw.includes('balo') || kw.includes('phượt') || kw.includes('thể thao') || kw.includes('chạy bộ') || kw.includes('gym') || kw.includes('quạt') || kw.includes('bình nước')) return 'travel';
  if (kw.includes('bếp') || kw.includes('thớt') || kw.includes('nấu') || kw.includes('trà') || kw.includes('cốc') || kw.includes('nồi') || kw.includes('tạp dề') || kw.includes('dao') || kw.includes('gia vị')) return 'cooking';
  return 'general';
}

// Haversine distance (meters) between two GPS points
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Generate realistic store coordinates around user location (within 5km)
function generateNearbyCoords(userLat: number, userLng: number, index: number): { lat: number; lng: number } {
  const offsets = [
    { dlat: 0.008, dlng: 0.012 },
    { dlat: -0.012, dlng: 0.005 },
    { dlat: 0.015, dlng: -0.008 },
    { dlat: -0.005, dlng: -0.018 },
    { dlat: 0.022, dlng: 0.003 },
    { dlat: -0.018, dlng: 0.015 },
  ];
  const offset = offsets[index % offsets.length];
  // Add small random noise so stores don't cluster
  const noise = (Math.random() - 0.5) * 0.003;
  return {
    lat: userLat + offset.dlat + noise,
    lng: userLng + offset.dlng + noise,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword') || '';
    const lat = parseFloat(searchParams.get('lat') || '10.7769');
    const lng = parseFloat(searchParams.get('lng') || '106.7009');

    await new Promise((r) => setTimeout(r, 800));

    const storeCategory = getStoreCategory(keyword);
    const templates = STORE_TEMPLATES[storeCategory] || STORE_TEMPLATES.general;

    // Build stores with real GPS coords near user location
    const stores: Store[] = templates.map((template, index) => {
      const coords = generateNearbyCoords(lat, lng, index);
      const distance = haversineDistance(lat, lng, coords.lat, coords.lng);
      return {
        id: `store_${storeCategory}_${index}`,
        lat: coords.lat,
        lng: coords.lng,
        distanceMeters: Math.round(distance),
        ...template,
      };
    });

    // Sort by: open first, then rating DESC, then distance ASC
    stores.sort((a, b) => {
      if (a.openNow !== b.openNow) return a.openNow ? -1 : 1;
      if (b.rating !== a.rating) return b.rating - a.rating;
      return a.distanceMeters - b.distanceMeters;
    });

    return NextResponse.json({
      stores,
      keyword,
      userLocation: { lat, lng },
      category: storeCategory,
    });
  } catch (error) {
    console.error('search-offline error:', error);
    return NextResponse.json(
      { error: 'Không thể tìm cửa hàng gần đây. Vui lòng thử lại.' },
      { status: 500 }
    );
  }
}

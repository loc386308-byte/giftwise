import { NextRequest, NextResponse } from 'next/server';
import { GiftSuggestion, QuizAnswers } from '@/types';
import { AIService } from '@/lib/services/aiService';

// ─── Rate limiting ────────────────────────────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function getRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) { rateLimitMap.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 }); return true; }
  if (entry.count >= 20) return false;
  entry.count++;
  return true;
}

// ─── Budget parser ────────────────────────────────────────────────────────────
function parseBudget(budget: string): [number, number] {
  const b = budget.toLowerCase().replace(/\./g, '').replace(/,/g, '');
  if (b.includes('trên 1') || b.includes('> 1') || b.includes('1000000+')) return [1_000_000, 15_000_000];
  if (b.includes('500') && b.includes('1')) return [500_000, 1_000_000];
  if (b.includes('300') && b.includes('500')) return [300_000, 500_000];
  if (b.includes('100') && b.includes('300')) return [100_000, 300_000];
  if (b.includes('dưới 100') || b.includes('< 100')) return [20_000, 100_000];
  const nums = b.match(/\d+/g)?.map(Number) ?? [];
  if (nums.length >= 2) {
    const [a, c] = [nums[0], nums[1]];
    const scale = Math.max(a, c) < 10000 ? 1000 : 1;
    return [Math.min(a, c) * scale, Math.max(a, c) * scale];
  }
  return [100_000, 500_000];
}

// ─── Zodiac analysis ──────────────────────────────────────────────────────────
type ZodiacTraits = {
  label: string; keywords: string[]; favoriteCategories: string[]; avoidCategories: string[];
  giftPersonality: string; luckColor: string;
};

const ZODIAC_MAP: Record<string, ZodiacTraits> = {
  'bạch dương': {
    label: 'Bạch Dương ♈', keywords: ['mạo hiểm', 'năng động', 'dẫn đầu', 'thể thao', 'cạnh tranh'],
    favoriteCategories: ['gaming', 'travel', 'tech', 'experiences'],
    avoidCategories: ['candle'],
    giftPersonality: 'táo bạo, đầy năng lượng', luckColor: 'đỏ',
  },
  'kim ngưu': {
    label: 'Kim Ngưu ♉', keywords: ['xa xỉ', 'thoải mái', 'ẩm thực', 'nghệ thuật', 'thực tế'],
    favoriteCategories: ['candle', 'kitchen', 'premium_beauty', 'premium_fashion'],
    avoidCategories: ['digital'],
    giftPersonality: 'sang trọng và tinh tế', luckColor: 'xanh lá',
  },
  'song tử': {
    label: 'Song Tử ♊', keywords: ['đa tài', 'tò mò', 'xã hội', 'sáng tạo', 'linh hoạt'],
    favoriteCategories: ['book', 'experiences', 'digital', 'gaming'],
    avoidCategories: [],
    giftPersonality: 'phong phú và đa dạng', luckColor: 'vàng',
  },
  'cự giải': {
    label: 'Cự Giải ♋', keywords: ['cảm xúc', 'gia đình', 'hoài niệm', 'chăm sóc', 'ấm cúng'],
    favoriteCategories: ['candle', 'kitchen', 'general_female', 'personalized'],
    avoidCategories: ['gaming'],
    giftPersonality: 'ấm áp và đầy tình cảm', luckColor: 'bạc',
  },
  'sư tử': {
    label: 'Sư Tử ♌', keywords: ['nổi bật', 'sang trọng', 'tự tin', 'sân khấu', 'lãnh đạo'],
    favoriteCategories: ['jewelry', 'premium_fashion', 'experiences', 'premium_beauty'],
    avoidCategories: [],
    giftPersonality: 'rực rỡ và đẳng cấp', luckColor: 'vàng',
  },
  'xử nữ': {
    label: 'Xử Nữ ♍', keywords: ['tỉ mỉ', 'thực tế', 'sức khỏe', 'sạch sẽ', 'có tổ chức'],
    favoriteCategories: ['beauty', 'book', 'kitchen', 'wellness'],
    avoidCategories: [],
    giftPersonality: 'tinh tế và chu đáo', luckColor: 'xanh navy',
  },
  'thiên bình': {
    label: 'Thiên Bình ♎', keywords: ['thẩm mỹ', 'hài hòa', 'làm đẹp', 'nghệ thuật', 'xã hội'],
    favoriteCategories: ['beauty', 'jewelry', 'experiences', 'candle'],
    avoidCategories: [],
    giftPersonality: 'thẩm mỹ cao và lịch thiệp', luckColor: 'hồng nhạt',
  },
  'bọ cạp': {
    label: 'Bọ Cạp ♏', keywords: ['bí ẩn', 'đam mê', 'sâu sắc', 'quyến rũ', 'mạnh mẽ'],
    favoriteCategories: ['candle', 'premium_beauty', 'jewelry', 'experiences'],
    avoidCategories: [],
    giftPersonality: 'huyền bí và quyến rũ', luckColor: 'đỏ đậm',
  },
  'nhân mã': {
    label: 'Nhân Mã ♐', keywords: ['tự do', 'phiêu lưu', 'triết học', 'du lịch', 'lạc quan'],
    favoriteCategories: ['travel', 'book', 'experiences', 'gaming'],
    avoidCategories: [],
    giftPersonality: 'phóng khoáng và đầy nhiệt huyết', luckColor: 'tím',
  },
  'ma kết': {
    label: 'Ma Kết ♑', keywords: ['tham vọng', 'thực dụng', 'kỷ luật', 'công việc', 'thành công'],
    favoriteCategories: ['tech', 'book', 'premium_fashion', 'general_male'],
    avoidCategories: [],
    giftPersonality: 'thực dụng và đẳng cấp', luckColor: 'đen',
  },
  'bảo bình': {
    label: 'Bảo Bình ♒', keywords: ['độc đáo', 'công nghệ', 'nhân đạo', 'tiên phong', 'sáng tạo'],
    favoriteCategories: ['tech', 'digital', 'experiences', 'gaming'],
    avoidCategories: ['candle'],
    giftPersonality: 'độc đáo và tiên phong', luckColor: 'xanh điện',
  },
  'song ngư': {
    label: 'Song Ngư ♓', keywords: ['mơ mộng', 'nghệ thuật', 'tâm linh', 'cảm xúc', 'sáng tạo'],
    favoriteCategories: ['candle', 'book', 'experiences', 'beauty'],
    avoidCategories: [],
    giftPersonality: 'lãng mạn và đầy cảm hứng', luckColor: 'xanh biển',
  },
};

function getZodiac(zodiac: string): ZodiacTraits | null {
  const z = zodiac.toLowerCase().trim();
  for (const [key, val] of Object.entries(ZODIAC_MAP)) {
    if (z.includes(key) || key.includes(z)) return val;
  }
  return null;
}

// ─── Occasion analysis ────────────────────────────────────────────────────────
function getOccasionBonus(occasion: string): Record<string, number> {
  const o = occasion.toLowerCase();
  if (o.includes('valentine') || o.includes('tình nhân')) return { jewelry: 4, candle: 3, experiences: 3, premium_beauty: 2 };
  if (o.includes('sinh nhật')) return { experiences: 3, gaming: 2, tech: 2, premium_fashion: 2, jewelry: 2 };
  if (o.includes('tốt nghiệp')) return { tech: 3, book: 3, travel: 2, premium_fashion: 2 };
  if (o.includes('kỷ niệm') || o.includes('anniversary')) return { jewelry: 4, experiences: 4, candle: 3, premium_beauty: 2 };
  if (o.includes('giáng sinh') || o.includes('noel') || o.includes('tết')) return { premium_fashion: 3, gaming: 2, candle: 3, book: 2, experiences: 2 };
  if (o.includes('8/3') || o.includes('phụ nữ')) return { beauty: 3, jewelry: 3, candle: 2, experiences: 2 };
  if (o.includes('20/11') || o.includes('nhà giáo')) return { book: 3, candle: 2, premium_beauty: 2, kitchen: 2 };
  if (o.includes('thăng chức') || o.includes('công việc')) return { premium_fashion: 3, tech: 3, book: 2 };
  return {};
}

// ─── Master gift pool (with budget tags) ─────────────────────────────────────
type RawGift = {
  name: string; emoji: string; category: string;
  price: number; reason: string; searchKeyword: string;
  tags: string[]; // e.g. ['female','young','beauty','luxury']
};

const ALL_GIFTS: RawGift[] = [
  // ── SỨC KHỎE & THƯ GIÃN (VẬT THỂ) ──
  { name: 'Máy Massage Cổ Vai Gáy Hồng Ngoại 8 Bi Châm Cứu', emoji: '💆', category: 'Thư giãn', price: 450_000, tags: ['any','female','wellness','practical'], reason: 'Massage thư giãn vai gáy sau ngày làm việc mệt mỏi — món quà chăm sóc sức khỏe thiết thực nhất.', searchKeyword: 'máy massage cổ vai gáy hồng ngoại' },
  { name: 'Balo Chống Nước Đa Năng Tích Hợp Cổng Sạc USB', emoji: '🎒', category: 'Phụ kiện', price: 380_000, tags: ['any','young','travel','practical'], reason: 'Balo gọn nhẹ, vải chống nước cao cấp — phù hợp đi học, đi làm hay du lịch ngắn ngày.', searchKeyword: 'balo chống nước tích hợp cổng sạc usb' },
  { name: 'Bộ Cốc Đôi Gốm Sứ Handmade Khắc Tên Kèm Muỗng', emoji: '☕', category: 'Đồ dùng', price: 280_000, tags: ['any','couple','creative','personalized'], reason: 'Cốc đôi gốm sứ tinh xảo — quà tặng lãng mạn cho các cặp đôi cùng thưởng thức trà/cà phê.', searchKeyword: 'bộ cốc đôi gốm sứ khắc tên' },
  { name: 'Khung Ảnh Điện Tử HD 8 Inch Chiếu Ảnh Gia Đình Kỷ Niệm', emoji: '🖼️', category: 'Trang trí', price: 890_000, tags: ['any','couple','family','premium'], reason: 'Chiếu album ảnh kỷ niệm xoay vòng sống động — lưu giữ mọi khoảnh khắc ngọt ngào.', searchKeyword: 'khung ảnh điện tử 8 inch' },
  { name: 'Đèn Ngủ Mặt Trăng 3D Cảm Ứng 16 Màu Decor Phòng', emoji: '🌕', category: 'Trang trí', price: 220_000, tags: ['any','female','young','candle'], reason: 'Đèn ngủ không gian ấm cúng — tạo ánh trăng huyền ảo lãng mạn ngay trong phòng ngủ.', searchKeyword: 'đèn ngủ mặt trăng 3d cảm ứng 16 màu' },
  { name: 'Bộ Cọ Trang Điểm Chuyên Nghiệp 12 Món Kèm Bao Da', emoji: '🖌️', category: 'Dụng cụ', price: 320_000, tags: ['female','beauty','makeup'], reason: 'Bộ cọ lông mềm mại mịn da — phụ kiện makeup chỉn chu không thể thiếu của phái đẹp.', searchKeyword: 'bộ cọ trang điểm chuyên nghiệp 12 món' },
  { name: 'Set Nước Hoa Mini Luxe Collection 5 Mùi Hương Lãng Mạn', emoji: '🧴', category: 'Nước hoa', price: 550_000, tags: ['female','beauty','luxury'], reason: 'Bộ 5 mùi hương thay đổi linh hoạt theo tâm trạng — vừa xinh xắn vừa tinh tế.', searchKeyword: 'set nước hoa mini collection 5 chai' },
  { name: 'Bộ Trà Gốm Sứ Bát Tràng Dáng Nhật Bản Kèm Khay Gỗ', emoji: '🍵', category: 'Bếp', price: 480_000, tags: ['any','kitchen','family','practical'], reason: 'Trà đạo gốm sứ sang trọng — phù hợp tiếp khách và thưởng trà ấm cúng gia đình.', searchKeyword: 'bộ trà gốm sứ bát tràng Nhật Bản khay gỗ' },

  // ── BOOKS & READING ──
  { name: 'Sách Atomic Habits — Thay Đổi 1% Mỗi Ngày Bìa Cứng Mạ Vàng', emoji: '📚', category: 'Sách', price: 139_000, tags: ['any','book','self-help','young'], reason: 'Cuốn sách 30 triệu bản toàn cầu — thay đổi thói quen để bứt phá thực sự.', searchKeyword: 'atomic habits bìa cứng mạ vàng special edition' },
  { name: 'Sổ Tay Leuchtturm1917 A5 Dotted — Bullet Journal Premium', emoji: '📓', category: 'Văn phòng phẩm', price: 390_000, tags: ['any','book','creative','organized'], reason: 'Sổ tay được dân bullet journal toàn thế giới yêu thích — chất lượng Đức xuất sắc.', searchKeyword: 'leuchtturm1917 a5 dotted bullet journal' },
  { name: 'Kindle Paperwhite 11th Gen 8GB — E-Ink Không Mỏi Mắt', emoji: '📖', category: 'Thiết bị', price: 3_490_000, tags: ['any','book','tech','premium'], reason: 'Thư viện 8GB trong lòng bàn tay — đọc cả năm không mỏi mắt.', searchKeyword: 'kindle paperwhite 11th gen 8gb chính hãng' },

  // ── BEAUTY (FEMALE) ──
  { name: 'Son Kem Lì Romand Zero Velvet Tint #25 Mauve Beach', emoji: '💄', category: 'Son môi', price: 149_000, tags: ['female','beauty','young','trendy'], reason: 'Màu sắc trendy chuẩn Hàn Quốc — chất bám màu cả ngày không lem không khô môi.', searchKeyword: 'romand zero velvet tint 25 mauve beach' },
  { name: 'Kem Chống Nắng La Roche-Posay Anthelios SPF50+ Oil Free 50ml', emoji: '🧴', category: 'Skincare', price: 385_000, tags: ['female','beauty','skincare'], reason: 'Kem chống nắng bác sĩ da liễu khuyên dùng #1 — bảo vệ da suốt ngày không bóng nhờn.', searchKeyword: 'la roche posay anthelios spf50 oil free' },
  { name: 'Set Mặt Nạ Innisfree Jeju Volcanic Clay 10 miếng', emoji: '🌋', category: 'Skincare', price: 220_000, tags: ['female','beauty','skincare','young'], reason: 'Combo detox da viral TikTok — thu nhỏ lỗ chân lông, da sạch sau 1 tuần.', searchKeyword: 'innisfree jeju volcanic pore clay mask 10' },
  { name: 'Gương Trang Điểm LED Hollywood 18 Bóng 3 Chế Độ Sáng', emoji: '🪞', category: 'Dụng cụ', price: 340_000, tags: ['female','beauty','makeup'], reason: 'Ánh sáng chuẩn studio tại nhà — makeup như MUA professional ngay lập tức.', searchKeyword: 'gương trang điểm led hollywood 18 bóng' },
  { name: 'Foreo Luna Mini 3 Máy Rửa Mặt Sóng Âm Silicon', emoji: '💎', category: 'Thiết bị làm đẹp', price: 1_890_000, tags: ['female','beauty','premium','tech'], reason: 'Làm sạch da sâu 99.5% bằng sóng âm — thiết bị skincare đáng đầu tư nhất.', searchKeyword: 'foreo luna mini 3 máy rửa mặt' },
  { name: 'SK-II Facial Treatment Essence 230ml (Nước Thần FTE)', emoji: '✨', category: 'Skincare cao cấp', price: 3_890_000, tags: ['female','beauty','premium','luxury'], reason: 'Nước thần huyền thoại cải thiện da tuyệt vời chỉ trong 4 tuần — tặng cho người xứng đáng.', searchKeyword: 'skii facial treatment essence 230ml' },
  { name: 'Nước Hoa Chanel Chance Eau Tendre EDT 100ml', emoji: '🌸', category: 'Nước hoa', price: 3_200_000, tags: ['female','luxury','candle','premium'], reason: 'Hương hoa nhẹ nhàng lãng mạn của Chanel — mùi hương của hạnh phúc đích thực.', searchKeyword: 'chanel chance eau tendre edt 100ml chính hãng' },
  { name: 'Dyson Airwrap Multi-Styler Complete 2024', emoji: '💨', category: 'Thiết bị tóc', price: 12_990_000, tags: ['female','beauty','premium','luxury'], reason: 'Máy tạo kiểu tóc #1 thế giới — sấy, uốn, làm thẳng chỉ 1 thiết bị không làm hại tóc.', searchKeyword: 'dyson airwrap complete 2024 chính hãng' },

  // ── BEAUTY (MALE) ──
  { name: 'Sáp Vuốt Tóc LAYRITE Superhold Pomade 297g', emoji: '💈', category: 'Chăm sóc tóc', price: 290_000, tags: ['male','beauty','grooming'], reason: 'Sáp quốc dân được barbershop tin dùng — giữ kiểu bền cả ngày không cần xịt thêm.', searchKeyword: 'layrite superhold pomade 297g' },
  { name: 'Nước Hoa Dior Sauvage EDT 100ml Nam Tính Lưu Hương 8h', emoji: '🏔️', category: 'Nước hoa', price: 3_100_000, tags: ['male','luxury','premium','beauty'], reason: 'Mùi hương biểu tượng của đàn ông hiện đại — ai cũng phải ngoái đầu khi ngửi.', searchKeyword: 'dior sauvage edt 100ml chính hãng' },
  { name: 'Kiehl\'s Facial Fuel Energizing Moisture Treatment 125ml', emoji: '🧴', category: 'Skincare nam', price: 690_000, tags: ['male','beauty','skincare'], reason: 'Dưỡng ẩm chuyên biệt cho da nam — không bóng nhờn, bảo vệ cả ngày.', searchKeyword: 'kiehls facial fuel energizing moisturizer nam' },

  // ── JEWELRY ──
  { name: 'Lắc Tay Bạc Thật S925 Đính Đá CZ Lấp Lánh Hàn Quốc', emoji: '✨', category: 'Trang sức', price: 199_000, tags: ['female','jewelry','young'], reason: 'Bạc S925 thật, đính đá CZ lấp lánh — thiết kế Hàn Quốc trendy, đeo được mọi outfit.', searchKeyword: 'lắc tay bạc s925 đính đá cz hàn quốc' },
  { name: 'Dây Chuyền Vàng 18K Mặt Ngôi Sao Đính Kim Cương Nhân Tạo', emoji: '⭐', category: 'Trang sức', price: 1_250_000, tags: ['female','jewelry','premium'], reason: 'Vàng 18K thật, kim cương nhân tạo sáng đẹp — quà tặng cao cấp đáng nhớ mãi.', searchKeyword: 'dây chuyền vàng 18k kim cương nhân tạo' },
  { name: 'Nhẫn Bạc S925 Đính Đá Hoa Tinh Xảo Tặng Hộp Nhung', emoji: '💍', category: 'Trang sức', price: 245_000, tags: ['female','jewelry','young'], reason: 'Nhẫn bạc tinh xảo kèm hộp nhung sang trọng — giftbox đẹp cực kỳ.', searchKeyword: 'nhẫn bạc s925 đính đá hoa hộp nhung' },
  { name: 'Đồng Hồ Daniel Wellington Classic 40mm NATO', emoji: '⌚', category: 'Đồng hồ', price: 2_890_000, tags: ['any','fashion','premium','luxury'], reason: 'Thiết kế tối giản Bắc Âu vượt thời gian — phụ kiện "sang mà không cần to tiếng".', searchKeyword: 'daniel wellington classic 40mm nato chính hãng' },

  // ── FASHION (FEMALE) ──
  { name: 'Túi Tote Canvas Local Brand Pastel — Unisex Đa Màu', emoji: '👜', category: 'Thời trang', price: 185_000, tags: ['female','fashion','young','trendy'], reason: 'Túi tote local brand chất lượng tốt — phối được với mọi outfit casual hàng ngày.', searchKeyword: 'túi tote canvas local brand pastel unisex' },
  { name: 'Túi Xách Đeo Chéo Da PU Mini Baguette Vintage', emoji: '👛', category: 'Thời trang', price: 320_000, tags: ['female','fashion','young'], reason: 'Dáng baguette vintage đang cực hot — mini bag cute phối đi chơi hay cafe đều xịn.', searchKeyword: 'túi xách đeo chéo da pu mini baguette vintage' },
  { name: 'Áo Khoác Dù Unisex 2 Lớp Chống Nước Local Brand', emoji: '🧥', category: 'Thời trang', price: 680_000, tags: ['any','fashion','young','trendy'], reason: 'Local brand Việt chống nước chuẩn — mặc 4 mùa, trendy streetwear không lo lỗi mốt.', searchKeyword: 'áo khoác dù unisex chống nước local brand việt nam' },
  { name: 'Giày Sneaker Nữ Platform Retro Đế Dày Pastel', emoji: '👟', category: 'Giày', price: 425_000, tags: ['female','fashion','young','trendy'], reason: 'Đế dày retro đang hot trend — tăng chiều cao, phối đồ casual hay ulzzang đều đẹp.', searchKeyword: 'giày sneaker nữ platform retro đế dày pastel' },

  // ── FASHION (MALE) ──
  { name: 'Giày Adidas Stan Smith OG White/Green Chính Hãng', emoji: '👟', category: 'Giày', price: 2_190_000, tags: ['male','fashion','young','premium'], reason: 'Đôi sneaker kinh điển từ 1956 — phối được mọi outfit, không bao giờ lỗi mốt.', searchKeyword: 'adidas stan smith og white green chính hãng' },
  { name: 'Ví Da Thật Nam Full-Grain Leather Slim RFID Blocking', emoji: '👛', category: 'Phụ kiện', price: 680_000, tags: ['male','fashion','premium'], reason: 'Da thật full-grain chống RFID — mỏng gọn đẳng cấp, đẹp dần theo thời gian.', searchKeyword: 'ví da thật nam full grain leather slim rfid' },
  { name: 'Kính Rayban Wayfarer RB2140 Havana/G-15 Chính Hãng', emoji: '🕶️', category: 'Phụ kiện', price: 2_800_000, tags: ['male','fashion','premium','luxury'], reason: 'Kính huyền thoại từ 1956 — classic không bao giờ lỗi mốt, chống UV100%.', searchKeyword: 'rayban wayfarer rb2140 havana chính hãng' },

  // ── TECH ──
  { name: 'Apple AirPods 3 Lightning Case Chính Hãng VN/A', emoji: '🎵', category: 'Công nghệ', price: 2_790_000, tags: ['any','tech','premium','young'], reason: 'Âm thanh tuyệt vời, tích hợp hoàn hảo với iPhone — quà tech đỉnh nhất tầm giá này.', searchKeyword: 'airpods 3 lightning chính hãng vn' },
  { name: 'Loa Bluetooth JBL Flip 6 Chống Nước IP67 Bass Mạnh', emoji: '🔊', category: 'Công nghệ', price: 1_890_000, tags: ['any','tech','premium','travel'], reason: 'Loa bluetooth tốt nhất tầm giá — bass mạnh, chống nước IP67, pin 12h đi đâu cũng được.', searchKeyword: 'jbl flip 6 chính hãng chống nước ip67' },
  { name: 'Pin Dự Phòng Anker 737 PowerCore 26800mAh 140W', emoji: '🔋', category: 'Công nghệ', price: 1_290_000, tags: ['any','tech','practical'], reason: 'Pin khủng nhất Anker — sạc đầy MacBook Pro trong 96 phút, sạc điện thoại 5-6 lần.', searchKeyword: 'anker 737 powercore 26800mah 140w' },
  { name: 'Đế Sạc Không Dây Anker 3-in-1 MagSafe 15W', emoji: '⚡', category: 'Công nghệ', price: 890_000, tags: ['any','tech','practical'], reason: 'Sạc đồng thời iPhone + AirPods + Apple Watch — gọn đẹp, loại bỏ hết dây cáp.', searchKeyword: 'anker wireless charger 3in1 magsafe 15w' },
  { name: 'Sony WH-1000XM5 Chống Ồn Chủ Động 36h Chính Hãng', emoji: '🎧', category: 'Công nghệ', price: 7_490_000, tags: ['any','tech','premium','luxury','music'], reason: 'Chống ồn số 1 thế giới, pin 36h — dành cho người thực sự yêu âm nhạc và cần tập trung.', searchKeyword: 'sony wh-1000xm5 chống ồn chủ động chính hãng' },
  { name: 'Apple Watch SE 2024 GPS 44mm Midnight Chính Hãng', emoji: '⌚', category: 'Công nghệ', price: 4_990_000, tags: ['any','tech','premium','wellness'], reason: 'Đồng hồ thông minh Apple giá tốt nhất — theo dõi sức khỏe chính xác, thông báo nhanh.', searchKeyword: 'apple watch se 2024 gps 44mm chính hãng' },

  // ── GAMING ──
  { name: 'Bàn Phím Cơ Keychron K2 Pro Bluetooth Hot-Swap RGB', emoji: '⌨️', category: 'Gaming', price: 2_490_000, tags: ['male','gaming','tech','young'], reason: 'Bàn phím cơ xịn nhất tầm giá — gõ phê, không dây, pin trâu, hot-swap switch tùy ý.', searchKeyword: 'keychron k2 pro bluetooth hot swap rgb' },
  { name: 'Tai Nghe Gaming SteelSeries Arctis Nova 3 Surround 7.1', emoji: '🎧', category: 'Gaming', price: 1_290_000, tags: ['male','gaming','young'], reason: 'Âm thanh vòm 7.1, mic ClearCast crystal clear — bạn đồng hành không thể thiếu khi chiến game.', searchKeyword: 'steelseries arctis nova 3 surround 7.1' },
  { name: 'Tay Cầm Xbox Wireless Controller Glacier Blue Chính Hãng', emoji: '🎮', category: 'Gaming', price: 1_590_000, tags: ['male','gaming','any'], reason: 'Tay cầm ergonomic hoàn hảo cho PC gaming — kết nối bluetooth 3 nền tảng, pin AA bền.', searchKeyword: 'xbox wireless controller glacier blue chính hãng' },
  { name: 'Nintendo Switch OLED Model Neon/White Edition', emoji: '🎮', category: 'Gaming', price: 8_500_000, tags: ['any','gaming','premium'], reason: 'Console cầm tay tuyệt vời nhất 2024 — chơi ở nhà lẫn ngoài đường đều đỉnh.', searchKeyword: 'nintendo switch oled chính hãng' },

  // ── TRAVEL & SPORT ──
  { name: 'Bình Giữ Nhiệt Stanley Quencher H2.0 591ml Soft Matte', emoji: '🥤', category: 'Đồ dùng', price: 1_350_000, tags: ['any','travel','trendy','wellness'], reason: 'Item viral TikTok 2024 — giữ lạnh cả ngày, style đẹp phối outfit nào cũng được.', searchKeyword: 'stanley quencher h2.0 591ml soft matte' },
  { name: 'Balo Thule Crossover 2 40L Chống Nước Ngăn Laptop 15"', emoji: '🎒', category: 'Du lịch', price: 2_900_000, tags: ['any','travel','premium'], reason: 'Balo du lịch bền nhất phân khúc — chống nước, ngăn giày riêng, ergonomic hoàn hảo.', searchKeyword: 'thule crossover 2 40l chống nước laptop' },
  { name: 'Giày Chạy Bộ Nike React Miler 3 Đế React Siêu Êm', emoji: '👟', category: 'Thể thao', price: 2_590_000, tags: ['any','sport','travel','premium'], reason: 'Đế React siêu êm, thoáng khí — phù hợp chạy 5-15km hằng ngày, bền lâu.', searchKeyword: 'nike react miler 3 running shoes' },

  // ── KITCHEN & HOME ──
  { name: 'Nến Thơm Diptyque Baies 190g Hương Quả Mọng & Hoa Hồng', emoji: '🕯️', category: 'Nến cao cấp', price: 1_890_000, tags: ['female','candle','premium','luxury'], reason: 'Nến thơm huyền thoại Paris — hương nhẹ nhàng lâu tan, decor phòng cực sang trọng.', searchKeyword: 'diptyque baies candle 190g' },
  { name: 'Nến Thơm Hoa Khô Handmade Hũ Thủy Tinh 200g', emoji: '🌸', category: 'Nến', price: 145_000, tags: ['female','candle','young'], reason: 'Nến thơm handmade Việt — hương hoa khô tự nhiên, decor phòng ngủ cực xinh.', searchKeyword: 'nến thơm hoa khô handmade hũ thủy tinh 200g' },
  { name: 'Nồi Chiên Không Dầu Philips HD9270 7L Màn Hình Cảm Ứng', emoji: '🍗', category: 'Bếp', price: 2_890_000, tags: ['any','kitchen','premium','practical'], reason: 'Nồi chiên không dầu #1 thị trường — chiên giòn đều, tiết kiệm 80% dầu ăn, 7L gia đình.', searchKeyword: 'philips hd9270 nồi chiên không dầu 7l' },
  { name: 'Set Trà Matcha Nhật Bản Cao Cấp — Bột + Chén + Chổi', emoji: '🍵', category: 'Ẩm thực', price: 450_000, tags: ['any','kitchen','japan','creative'], reason: 'Trải nghiệm pha trà Nhật tại nhà — tặng cho người yêu văn hóa và ẩm thực Nhật Bản.', searchKeyword: 'set trà matcha nhật bản cao cấp bột chén chổi' },
  { name: 'Thớt Gỗ Acacia Khắc Tên Miễn Phí Decor Bếp Sang', emoji: '🪵', category: 'Bếp', price: 380_000, tags: ['any','kitchen','personalized'], reason: 'Khắc tên miễn phí — quà tặng cá nhân hóa đẳng cấp mà giá cả không cao.', searchKeyword: 'thớt gỗ acacia khắc tên miễn phí decor bếp' },

  // ── MEANINGFUL & CREATIVE GIFTS (CÁ NHÂN HÓA & NGHỆ THUẬT) ──
  { name: 'Đèn Chiếu Bầu Trời Sao Galaxy Starry Projector 3D', emoji: '🌌', category: 'Decor phòng ngủ', price: 390_000, tags: ['any','young','creative','candle','personalized'], reason: 'Chiếu bầu trời sao ngân hà lung linh huyền ảo — giải tỏa căng thẳng sau ngày làm việc và tạo không gian lãng mạn.', searchKeyword: 'đèn chiếu bầu trời sao galaxy starry projector 3d' },
  { name: 'Vòng Tay Bạc S925 Khắc Ngày Kỷ Niệm & Tên Cá Nhân Hóa', emoji: '✨', category: 'Trang sức cá nhân hóa', price: 290_000, tags: ['female','couple','jewelry','personalized'], reason: 'Chất liệu bạc S925 thật được khắc tên/ngày kỷ niệm riêng — biểu tượng tình cảm bền chặt và sự gắn kết.', searchKeyword: 'vòng tay bạc s925 khắc tên kỷ niệm' },
  { name: 'Đài Radio Bluetooth Kiểu Cổ Điển Vintage Divoom Ditoo Pro', emoji: '📻', category: 'Công nghệ & Decor', price: 1_490_000, tags: ['any','tech','music','creative','young'], reason: 'Thiết kế máy vi tính hoài cổ siêu đáng yêu kèm màn hình pixel — vừa nghe nhạc chất lượng vừa làm điểm nhấn bàn học.', searchKeyword: 'loa bluetooth divoom ditoo pro vintage' },
  { name: 'Chậu Cây Xanh Bonsai Tiểu Cảnh Cây Kim Ngân Phong Thủy Tặng Kèm Tượng', emoji: '🪴', category: 'Cây cảnh & Phong thủy', price: 250_000, tags: ['any','family','wellness','practical'], reason: 'Cây kim ngân mang ý nghĩa bình an, tài lộc và thanh lọc không khí — món quà xanh mát vun đắp tinh thần.', searchKeyword: 'chậu cây bonsai kim ngân phong thủy mini' },
  { name: 'Khăn Choàng Cổ Lụa Tơ Tằm Thêu Hoa Thủ Công Kèm Hộp Quà', emoji: '🧣', category: 'Thời trang & Phụ kiện', price: 420_000, tags: ['female','family','luxury','fashion'], reason: 'Lụa tơ tằm mềm mại thêu hoa tinh xảo — tôn vinh vẻ đẹp dịu dàng và mang lại sự ấm áp chu đáo.', searchKeyword: 'khăn choàng cổ lụa tơ tằm thêu thủ công' },
  { name: 'Máy Phát Nhạc Đĩa Than Vinyl Vintage Victrola Bluetooth', emoji: '📀', category: 'Âm thanh cổ điển', price: 2_690_000, tags: ['any','music','luxury','premium','creative'], reason: 'Trải nghiệm âm thanh đĩa than hoài niệm và ấm áp — quà tặng thượng lưu dành cho người thực sự đam mê âm nhạc.', searchKeyword: 'máy phát nhạc đĩa than vinyl victrola bluetooth' },
  { name: 'Set Ấm Trà Thủy Tinh Chịu Nhiệt Kèm 6 Tách & Trà Hoa Cúc Hoàng Gia', emoji: '🍵', category: 'Chăm sóc sức khỏe', price: 360_000, tags: ['any','family','wellness','kitchen'], reason: 'Thủy tinh trong suốt chịu nhiệt cao kèm trà hoa cúc thư giãn — thói quen thưởng trà thanh lọc tâm hồn mỗi sáng.', searchKeyword: 'set ấm trà thủy tinh chịu nhiệt kèm trà hoa cúc' },
  { name: 'Gối Massage Cổ Vai Gáy Cao Su Non Ergonomic Chống Đau Mỏi', emoji: '💤', category: 'Sức khỏe & Giấc ngủ', price: 490_000, tags: ['any','wellness','practical','family'], reason: 'Thiết kế chuẩn y khoa nâng đỡ cột sống cổ — mang lại giấc ngủ ngon và chăm sóc sức khỏe lâu dài.', searchKeyword: 'gối cao su non ergonomic nâng đỡ cổ vai gáy' },
  { name: 'Set Nến Thơm Tinh Dầu & Khay Gỗ Hương Thảo Dược Thư Giãn', emoji: '🕯️', category: 'Liệu pháp mùi hương', price: 320_000, tags: ['female','candle','wellness','creative'], reason: 'Hương thơm tinh dầu tự nhiên xua tan mệt mỏi — món quà vỗ về cảm xúc và thanh lọc không gian sống.', searchKeyword: 'set nến thơm tinh dầu khay gỗ thảo dược' },
  { name: 'Album Ảnh Dán Kỷ Niệm Handmade Bìa Da Kèm Bút Kim Tuyến & Sticker', emoji: '📖', category: 'Kỷ niệm cá nhân hóa', price: 240_000, tags: ['any','couple','creative','personalized'], reason: 'Tự tay dán và viết những dòng kỷ niệm đáng nhớ — món quà chứa đựng 100% chân thành và tình cảm.', searchKeyword: 'album ảnh dán kỷ niệm handmade bìa da' },
];

// ─── The smart scoring engine ─────────────────────────────────────────────────
function score(gift: RawGift, answers: QuizAnswers, zodiacTraits: ZodiacTraits | null, occasionBonus: Record<string, number>, budgetMin: number, budgetMax: number): number {
  let s = 0;

  // 1. Budget fit (most critical)
  if (gift.price >= budgetMin && gift.price <= budgetMax) s += 10;
  else if (gift.price >= budgetMin * 0.6 && gift.price <= budgetMax * 1.3) s += 4;
  else return -99; // way out of budget → exclude

  // 2. Gender match
  const isMale = answers.gender.toLowerCase() === 'nam';
  if (gift.tags.includes('male') && isMale) s += 3;
  if (gift.tags.includes('female') && !isMale) s += 3;
  if (gift.tags.includes('any')) s += 1;
  if ((gift.tags.includes('male') && !isMale) || (gift.tags.includes('female') && isMale)) s -= 5;

  // 3. Age match
  const age = answers.ageRange.toLowerCase();
  const isYoung = age.includes('13') || age.includes('19') || age.includes('25') || age.includes('gen z') || age.includes('18');
  const isAdult = age.includes('26') || age.includes('35') || age.includes('36');
  const isOlder = age.includes('36') || age.includes('50') || age.includes('trên');
  if (gift.tags.includes('young') && isYoung) s += 2;
  if (!gift.tags.includes('young') && isOlder) s += 1;

  // 4. Zodiac match
  if (zodiacTraits) {
    const catTag = gift.category.toLowerCase();
    for (const favCat of zodiacTraits.favoriteCategories) {
      if (catTag.includes(favCat) || gift.tags.some(t => favCat.includes(t))) { s += 3; break; }
    }
    for (const avoidCat of zodiacTraits.avoidCategories) {
      if (catTag.includes(avoidCat) || gift.tags.some(t => avoidCat.includes(t))) { s -= 2; break; }
    }
    // Zodiac keyword match
    for (const kw of zodiacTraits.keywords) {
      if (gift.tags.some(t => t.includes(kw)) || gift.reason.toLowerCase().includes(kw)) s += 1;
    }
  }

  // 5. Occasion bonus
  for (const [cat, bonus] of Object.entries(occasionBonus)) {
    if (gift.tags.includes(cat) || gift.category.toLowerCase().includes(cat)) { s += bonus; break; }
  }

  // 6. Interest match
  const interests = (answers.interests || []).map(i => i.toLowerCase());
  const interestMap: Record<string, string[]> = {
    'làm đẹp': ['beauty', 'female', 'skincare'], 'mỹ phẩm': ['beauty', 'premium_beauty'],
    'đọc sách': ['book'], 'sách': ['book'], 'công nghệ': ['tech', 'gaming', 'digital'],
    'gaming': ['gaming', 'digital'], 'game': ['gaming'],
    'du lịch': ['travel', 'experience'], 'thể thao': ['sport', 'travel', 'wellness'],
    'âm nhạc': ['music', 'digital', 'experience'], 'nấu ăn': ['kitchen', 'experience'],
    'thời trang': ['fashion', 'jewelry'], 'phim': ['experience', 'digital', 'entertainment'],
    'nhiếp ảnh': ['experience', 'creative'], 'nghệ thuật': ['creative', 'experience'],
    'yoga': ['wellness', 'experience'], 'gym': ['sport', 'wellness'],
  };
  for (const interest of interests) {
    for (const [key, tagList] of Object.entries(interestMap)) {
      if (interest.includes(key)) {
        for (const tag of tagList) {
          if (gift.tags.includes(tag)) { s += 3; break; }
        }
      }
    }
  }

  // 7. Personality match
  const personalities = (answers.personality || []).map(p => p.toLowerCase());
  const personalityMap: Record<string, string[]> = {
    'sáng tạo': ['creative', 'book', 'experience'], 'năng động': ['sport', 'travel', 'experience'],
    'hướng nội': ['book', 'candle', 'digital'], 'hướng ngoại': ['experience', 'travel'],
    'thực tế': ['tech', 'practical', 'kitchen'], 'lãng mạn': ['candle', 'jewelry', 'experience'],
    'đam mê công nghệ': ['tech', 'gaming', 'digital'], 'yêu thiên nhiên': ['travel', 'wellness'],
    'chăm sóc bản thân': ['beauty', 'wellness', 'candle'], 'thích xa hoa': ['luxury', 'premium'],
  };
  for (const p of personalities) {
    for (const [key, tagList] of Object.entries(personalityMap)) {
      if (p.includes(key)) {
        for (const tag of tagList) {
          if (gift.tags.includes(tag)) { s += 2; break; }
        }
      }
    }
  }

  // 8. Relationship context
  const rel = answers.relationship.toLowerCase();
  if ((rel.includes('người yêu') || rel.includes('bạn trai') || rel.includes('bạn gái')) &&
    (gift.tags.includes('couple') || gift.tags.includes('luxury') || gift.tags.includes('jewelry'))) s += 3;
  if ((rel.includes('bố') || rel.includes('mẹ') || rel.includes('ba')) &&
    (gift.tags.includes('practical') || gift.tags.includes('kitchen') || gift.tags.includes('wellness'))) s += 2;
  if (rel.includes('bạn thân') && gift.tags.includes('experience')) s += 2;
  if ((rel.includes('sếp') || rel.includes('đồng nghiệp')) &&
    (gift.tags.includes('premium') || gift.tags.includes('practical') || gift.tags.includes('book'))) s += 2;
  if (rel.includes('con') && (gift.tags.includes('gaming') || gift.tags.includes('young') || gift.tags.includes('experience'))) s += 2;

  // 9. Premium bonus for premium budget
  if (budgetMin >= 1_000_000 && gift.tags.includes('luxury')) s += 3;
  if (budgetMin >= 1_000_000 && gift.tags.includes('premium')) s += 2;
  if (budgetMax <= 300_000 && gift.tags.includes('luxury')) s -= 3;

  return s;
}

function buildReason(gift: RawGift, answers: QuizAnswers, zodiacTraits: ZodiacTraits | null): string {
  const rel = answers.relationship.toLowerCase();
  const zodiacNote = zodiacTraits
    ? ` Đặc biệt hợp với tính cách ${zodiacTraits.giftPersonality} của ${zodiacTraits.label}!`
    : '';

  let relNote = '';
  if (rel.includes('người yêu') || rel.includes('bạn trai') || rel.includes('bạn gái')) relNote = ' 💕 Thay lời muốn nói với người thương!';
  else if (rel.includes('bố') || rel.includes('mẹ') || rel.includes('ba')) relNote = ' 🙏 Thể hiện sự yêu thương và hiếu kính của bạn.';
  else if (rel.includes('bạn thân')) relNote = ' 🤗 Bạn thân chắc chắn sẽ thích mê khi nhận!';
  else if (rel.includes('sếp') || rel.includes('đồng nghiệp')) relNote = ' 👔 Lịch sự, chỉn chu, gắn kết tình đồng nghiệp.';
  else if (rel.includes('con')) relNote = ' 🎀 Phù hợp với lứa tuổi, kích thích sự vui vẻ & phát triển.';

  return gift.reason + zodiacNote + relNote;
}

function generateSuggestions(answers: QuizAnswers): GiftSuggestion[] {
  const [budgetMin, budgetMax] = parseBudget(answers.budget || '100.000đ – 300.000đ');
  const zodiacTraits = getZodiac(answers.zodiac || '');
  const occasionBonus = getOccasionBonus(answers.occasion || '');

  // Score all gifts
  const scored = ALL_GIFTS.map(g => ({ gift: g, s: score(g, answers, zodiacTraits, occasionBonus, budgetMin, budgetMax) }))
    .filter(x => x.s > -50)
    .sort((a, b) => b.s - a.s);

  // Dedup by category to ensure variety (max 2 per category)
  const catCount: Record<string, number> = {};
  const selected: RawGift[] = [];
  for (const { gift } of scored) {
    const cat = gift.category;
    catCount[cat] = (catCount[cat] || 0) + 1;
    if (catCount[cat] <= 2) selected.push(gift);
    if (selected.length >= 9) break;
  }

  // Pad to 9 if needed
  if (selected.length < 9) {
    for (const { gift } of scored) {
      if (!selected.includes(gift)) { selected.push(gift); }
      if (selected.length >= 9) break;
    }
  }

  const fmt = (p: number) => {
    const lo = Math.floor(p * 0.88).toLocaleString('vi-VN');
    const hi = Math.floor(p * 1.12).toLocaleString('vi-VN');
    return `${lo}đ – ${hi}đ`;
  };

  return selected.slice(0, 9).map((g, i) => ({
    id: `sg_${i + 1}_${Date.now()}`,
    productName: g.name,
    reason: buildReason(g, answers, zodiacTraits),
    estimatedPriceRange: fmt(g.price),
    searchKeyword: g.searchKeyword,
    emoji: g.emoji,
    category: g.category,
  }));
}

// ─── POST handler ─────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    if (!getRateLimit(ip)) {
      return NextResponse.json({ error: 'Quá nhiều yêu cầu, vui lòng thử lại sau 1 giờ.' }, { status: 429 });
    }

    const rawAnswers = await request.json();
    const answers: QuizAnswers = {
      occasion: rawAnswers.occasion || 'Sinh nhật 🎂',
      relationship: rawAnswers.relationship || 'Bạn bè 🤝',
      gender: rawAnswers.gender || 'Khác / Không tiết lộ',
      ageRange: rawAnswers.ageRange || '19-25 tuổi',
      zodiac: rawAnswers.zodiac || '',
      personality: Array.isArray(rawAnswers.personality) ? rawAnswers.personality : [],
      interests: Array.isArray(rawAnswers.interests) ? rawAnswers.interests : [],
      budget: rawAnswers.budget || '300.000đ - 500.000đ',
      customDescription: rawAnswers.customDescription || '',
    };

    // Call AIService (handles cache, Claude/Gemini AI, retries, timeout, JSON sanitizing)
    const { suggestions: aiResult, source } = await AIService.getGiftSuggestions(answers);

    let suggestions: GiftSuggestion[] = aiResult;

    if (suggestions.length === 0) {
      // Fallback: Smart Scoring Engine (local heuristic)
      if (source === 'fallback') {
        await new Promise((r) => setTimeout(r, 600));
      }
      suggestions = generateSuggestions(answers);
    }

    return NextResponse.json({ suggestions, source });
  } catch (error) {
    console.error('suggest-gifts error:', error);
    return NextResponse.json({ error: 'Oops! Có lỗi xảy ra. Vui lòng thử lại.' }, { status: 500 });
  }
}

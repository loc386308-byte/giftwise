import { NextRequest, NextResponse } from 'next/server';
import { GiftSuggestion, QuizAnswers } from '@/types';

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function getRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 20) return false;
  entry.count++;
  return true;
}

async function callAnthropicAPI(prompt: string): Promise<GiftSuggestion[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('No API key');
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-3-5-haiku-20241022', max_tokens: 3000, messages: [{ role: 'user', content: prompt }] }),
  });
  if (!response.ok) throw new Error(`Anthropic API error: ${response.status}`);
  const data = await response.json();
  const content = data.content?.[0]?.text || '';
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in response');
  const parsed = JSON.parse(jsonMatch[0]);
  return parsed.suggestions || [];
}

// ─── Budget parser ───────────────────────────────────────────────────────────
function parseBudget(budget: string): [number, number] {
  const b = budget.toLowerCase();
  if (b.includes('trên 1') || b.includes('trên 1.000') || b.includes('trên 1,000') || b.includes('> 1')) return [1000000, 10000000];
  if (b.includes('trên 500') || b.includes('> 500')) return [500000, 2000000];
  const nums = budget.replace(/\./g, '').replace(/,/g, '').match(/\d+/g)?.map(Number) || [];
  if (nums.length >= 2) {
    const [a, b2] = [nums[0], nums[1]];
    const scale = a < 1000 ? 1000 : 1;
    return [a * scale, b2 * scale];
  }
  if (nums.length === 1) return [nums[0] * 1000 * 0.7, nums[0] * 1000];
  return [100000, 500000];
}

type RawGift = { name: string; emoji: string; category: string; price: number; reason: string; searchKeyword?: string };

function generateSmartMockSuggestions(answers: QuizAnswers): GiftSuggestion[] {
  const gender = answers.gender.toLowerCase();
  const age = answers.ageRange.toLowerCase();
  const rel = answers.relationship.toLowerCase();
  const interests = answers.interests || [];
  const personality = answers.personality || [];
  const [budgetMin, budgetMax] = parseBudget(answers.budget || '100.000đ – 500.000đ');

  const isKid = age.includes('dưới 12') || age.includes('13-18');
  const isOlder = age.includes('trên 50') || age.includes('36-50');
  const isMale = gender === 'nam';
  const isPremium = budgetMin >= 1000000;
  const isMid = budgetMin >= 300000 && budgetMax <= 1000000;

  const hasInterest = (...keys: string[]) => keys.some((k) => interests.some((i) => i.toLowerCase().includes(k)));
  const hasPersonality = (...keys: string[]) => keys.some((k) => personality.some((p) => p.toLowerCase().includes(k)));

  // ─── Gift pools by category and budget ──────────────────────────────────────
  const giftPool: Record<string, RawGift[]> = {

    // ── EXPERIENCES (any budget – scale by price) ──
    experiences: [
      { name: 'Vé xem phim CGV combo đôi (2 vé + 2 bắp rang + 2 nước)', emoji: '🎬', category: 'Trải nghiệm', price: 250000, reason: 'Buổi tối xem phim cực chill cùng người thân – kỷ niệm hơn đồ vật nhiều.', searchKeyword: 'vé xem phim cgv combo đôi' },
      { name: 'Voucher Spa & Massage thư giãn 90 phút body toàn thân', emoji: '💆', category: 'Trải nghiệm', price: 450000, reason: 'Quà tặng thư giãn đỉnh cao – hơn mọi đồ vật, cảm giác mới là điều đọng lại.', searchKeyword: 'voucher spa massage 90 phút' },
      { name: 'Vé Concert / Sự kiện âm nhạc live (hạng Standing)', emoji: '🎤', category: 'Trải nghiệm', price: 890000, reason: 'Kỷ niệm sống mãi không quên – hơn bất kỳ món quà vật chất nào.', searchKeyword: 'vé concert âm nhạc live vietnam' },
      { name: 'Voucher Nhà hàng Fine Dining bữa tối lãng mạn cho 2 người', emoji: '🍽️', category: 'Trải nghiệm', price: 1200000, reason: 'Bữa tối sang trọng tạo kỷ niệm ngọt ngào – ý nghĩa đặc biệt với người thân.', searchKeyword: 'voucher nhà hàng fine dining 2 người' },
      { name: 'Khóa học làm bánh/nấu ăn 1 buổi tại studio', emoji: '🧁', category: 'Trải nghiệm', price: 350000, reason: 'Học kỹ năng mới cùng nhau – vừa vui, vừa tạo ra món ăn ngon để tự hào.', searchKeyword: 'khóa học làm bánh 1 buổi' },
      { name: 'Trải nghiệm Escape Room 2 tiếng cho nhóm', emoji: '🔐', category: 'Trải nghiệm', price: 220000, reason: 'Cùng nhau phá đảo phòng thoát hiểm – thử thách kết nối cực kỳ thú vị.', searchKeyword: 'escape room vé nhóm' },
      { name: 'Vé Công viên nước Đầm Sen / Suối Tiên cả ngày', emoji: '🏊', category: 'Trải nghiệm', price: 180000, reason: 'Ngày hè thỏa sức vui chơi – quà tặng mà ai cũng mong chờ.', searchKeyword: 'vé công viên nước đầm sen' },
      { name: 'Voucher Chụp ảnh studio chuyên nghiệp 1 giờ', emoji: '📸', category: 'Trải nghiệm', price: 500000, reason: 'Lưu giữ khoảnh khắc đẹp trong hình ảnh chuyên nghiệp để nhớ mãi.', searchKeyword: 'voucher chụp ảnh studio chuyên nghiệp' },
      { name: 'Vé Lớp yoga / pilates 1 tháng unlimited', emoji: '🧘', category: 'Trải nghiệm', price: 1500000, reason: 'Đầu tư sức khỏe dài hạn – quà tặng ý nghĩa nhất cho người quan tâm bản thân.', searchKeyword: 'vé yoga pilates 1 tháng' },
    ],

    // ── PREMIUM TECH (>1 triệu) ──
    premium_tech: [
      { name: 'Tai nghe Apple AirPods 3 (Lightning) chính hãng VN', emoji: '🎵', category: 'Công nghệ cao cấp', price: 2790000, reason: 'Âm thanh xuất sắc, tích hợp hoàn hảo với iOS – quà tặng công nghệ đỉnh nhất.', searchKeyword: 'airpods 3 chính hãng vnpt' },
      { name: 'Tai nghe Sony WH-1000XM5 chống ồn chủ động 36h', emoji: '🎧', category: 'Công nghệ cao cấp', price: 7490000, reason: 'Chống ồn số 1 thế giới, pin 36h – dành cho người yêu âm nhạc thực sự.', searchKeyword: 'sony wh-1000xm5 chính hãng' },
      { name: 'Apple Watch SE 2024 44mm GPS Midnight', emoji: '⌚', category: 'Công nghệ cao cấp', price: 4990000, reason: 'Đồng hồ thông minh chính hãng Apple – theo dõi sức khỏe chuẩn xác suốt ngày.', searchKeyword: 'apple watch se 2024 chính hãng' },
      { name: 'Kindle Paperwhite 11 8GB chống nước IPX8', emoji: '📖', category: 'Công nghệ cao cấp', price: 3490000, reason: 'Màn hình e-ink không mỏi mắt, 8GB chứa hàng ngàn cuốn sách – thiên đường đọc sách.', searchKeyword: 'kindle paperwhite 11th chính hãng' },
      { name: 'JBL Flip 6 Loa Bluetooth Chống Nước IP67 Bass cực mạnh', emoji: '🔊', category: 'Công nghệ cao cấp', price: 1890000, reason: 'Loa bluetooth tốt nhất tầm giá – âm bass mạnh mẽ chuẩn đi tiệc hay dã ngoại.', searchKeyword: 'jbl flip 6 chính hãng' },
      { name: 'iPad mini 6 Wifi 64GB Space Gray (refurb chính hãng)', emoji: '📱', category: 'Công nghệ cao cấp', price: 9900000, reason: 'Máy tính bảng nhỏ gọn hoàn hảo – học tập, sáng tạo, giải trí đỉnh cao.', searchKeyword: 'ipad mini 6 wifi 64gb refurb' },
    ],

    // ── PREMIUM BEAUTY (>500k) ──
    premium_beauty: [
      { name: 'Dyson Airwrap Multi-Styler Complete 2024 (hàng chính hãng)', emoji: '💨', category: 'Làm đẹp cao cấp', price: 12990000, reason: 'Máy tạo kiểu tóc số 1 thế giới – sấy, uốn, làm thẳng chỉ 1 thiết bị.', searchKeyword: 'dyson airwrap complete 2024' },
      { name: 'SK-II Facial Treatment Essence 230ml (FTE nước thần)', emoji: '✨', category: 'Skincare cao cấp', price: 3890000, reason: 'Nước thần nổi tiếng nhất thế giới – cải thiện da tuyệt vời trong 4 tuần.', searchKeyword: 'skii facial treatment essence 230ml' },
      { name: 'La Mer The Moisturizing Cream 30ml – kem dưỡng sang trọng', emoji: '🌊', category: 'Skincare cao cấp', price: 4200000, reason: 'Kem dưỡng huyền thoại từ biển – tặng cho ai xứng đáng được chiều chuộng.', searchKeyword: 'la mer moisturizing cream 30ml' },
      { name: 'Lancôme La Vie est Belle EDP 100ml (nước hoa nữ iconic)', emoji: '🌸', category: 'Nước hoa cao cấp', price: 2890000, reason: 'Hương hoa iris ngọt ngào lãng mạn – mùi hương của hạnh phúc đích thực.', searchKeyword: 'lancome la vie est belle 100ml' },
      { name: 'Set Skincare Laneige Water Bank 3 món (toner + serum + kem)', emoji: '💧', category: 'Skincare set', price: 1250000, reason: 'Bộ skincare cấp ẩm hoàn chỉnh từ thương hiệu Hàn Quốc hàng đầu.', searchKeyword: 'laneige water bank set 3 món' },
    ],

    // ── PREMIUM FASHION (>500k) ──
    premium_fashion: [
      { name: 'Túi xách da thật Furla Camelia Mini Crossbody chính hãng', emoji: '👜', category: 'Thời trang cao cấp', price: 5800000, reason: 'Túi da thật thương hiệu Ý đẳng cấp – quà tặng luxury mà ai cũng thích.', searchKeyword: 'furla camelia mini crossbody bag' },
      { name: 'Đồng hồ Daniel Wellington Classic 40mm NATO dây vải', emoji: '⌚', category: 'Đồng hồ', price: 2890000, reason: 'Thiết kế tối giản Bắc Âu vượt thời gian – phụ kiện "sang mà không cần thương hiệu to".', searchKeyword: 'daniel wellington classic 40mm' },
      { name: 'Giày Sneaker Adidas Stan Smith Premium All White', emoji: '👟', category: 'Giày', price: 2190000, reason: 'Đôi giày sneaker kinh điển – phối được mọi outfit từ casual đến smart casual.', searchKeyword: 'adidas stan smith premium white' },
      { name: 'Ví da nam Louis Philippe Slim Leather Wallet RFID', emoji: '👛', category: 'Phụ kiện cao cấp', price: 890000, reason: 'Ví da mỏng gọn chuẩn chỉnh – thay thế ví cũ bằng cái xứng đáng hơn.', searchKeyword: 'ví da nam slim leather rfid cao cấp' },
      { name: 'Áo khoác dù local brand unisex cao cấp chống nước', emoji: '🧥', category: 'Thời trang', price: 680000, reason: 'Áo khoác đa năng mặc 4 mùa – đủ ấm, gọn nhẹ, cực trendy local brand.', searchKeyword: 'áo khoác dù unisex local brand chống nước', },
    ],

    // ── GAMING (all budgets) ──
    gaming: [
      { name: 'Bàn phím cơ không dây layout 75% RGB hot-swap Keychron K2', emoji: '⌨️', category: 'Công nghệ', price: 2490000, reason: 'Bàn phím cơ xịn nhất tầm giá mid – gõ phê, build chắc chắn, pin trâu.', searchKeyword: 'keychron k2 bàn phím cơ không dây' },
      { name: 'Chuột gaming Logitech G Pro X Superlight 2 không dây', emoji: '🖱️', category: 'Công nghệ', price: 2990000, reason: 'Chuột gaming nhẹ nhất thế giới – chuyên nghiệp esport, lướt mượt không lag.', searchKeyword: 'logitech g pro x superlight 2' },
      { name: 'Tay cầm Xbox Series Wireless Controller (chính hãng)', emoji: '🎮', category: 'Giải trí', price: 1590000, reason: 'Tay cầm tốt nhất cho PC gaming – ergonomic hoàn hảo, pin AA bền lâu.', searchKeyword: 'xbox wireless controller series' },
      { name: 'Lót chuột gaming ASUS ROG Scabbard II Extended 900×400', emoji: '🖱️', category: 'Phụ kiện', price: 890000, reason: 'Lót chuột cỡ XXL trải toàn bàn – bề mặt micro-textured precision tuyệt đỉnh.', searchKeyword: 'asus rog scabbard ii extended' },
      { name: 'Tai nghe gaming SteelSeries Arctis Nova 3 7.1 Surround', emoji: '🎧', category: 'Công nghệ', price: 1290000, reason: 'Âm thanh vòm 7.1, mic ClearCast cực rõ – bạn đồng hành không thể thiếu khi game.', searchKeyword: 'steelseries arctis nova 3' },
      { name: 'Nintendo Switch OLED Model (Neon/White Edition)', emoji: '🎮', category: 'Máy chơi game', price: 8500000, reason: 'Console cầm tay tuyệt vời nhất hiện tại – chơi ở nhà lẫn ngoài đường đều đỉnh.', searchKeyword: 'nintendo switch oled chính hãng' },
      { name: 'Đèn LED RGB màn hình chống mỏi mắt Govee Immersion TV', emoji: '💡', category: 'Trang trí', price: 450000, reason: 'Tạo hiệu ứng ambilight cinematic cho màn hình TV/monitor – đỉnh của đỉnh.', searchKeyword: 'govee immersion tv led' },
    ],

    // ── BEAUTY FEMALE ──
    beauty_female: [
      { name: 'Son kem lì Romand Zero Velvet Tint #25 Mauve Beach', emoji: '💄', category: 'Son môi', price: 155000, reason: 'Màu sắc trendy chuẩn Hàn Quốc, chất son bám màu cả ngày không lem.', searchKeyword: 'romand zero velvet tint 25' },
      { name: 'Serum Vitamin C 15% Paula\'s Choice C15 Booster 20ml', emoji: '✨', category: 'Skincare', price: 380000, reason: 'Serum vitamin C nổi tiếng nhất mạng – mờ thâm, sáng da hiệu quả 4 tuần.', searchKeyword: 'paulas choice c15 super booster' },
      { name: 'Máy rửa mặt sóng âm silicon Foreo LUNA mini 3', emoji: '🧼', category: 'Thiết bị làm đẹp', price: 1890000, reason: 'Làm sạch da sâu 99.5% – thiết bị skincare đáng đầu tư nhất cho làn da đẹp.', searchKeyword: 'foreo luna mini 3' },
      { name: 'Gương trang điểm LED Hollywood 18 bóng chống lóa', emoji: '🪞', category: 'Dụng cụ', price: 340000, reason: 'Ánh sáng chuẩn studio giúp makeup như pro artist ngay tại nhà.', searchKeyword: 'gương trang điểm led hollywood 18 bóng' },
      { name: 'Nước hoa Chanel Chance Eau Tendre EDT 100ml', emoji: '🌸', category: 'Nước hoa cao cấp', price: 3200000, reason: 'Mùi hương nhẹ nhàng lãng mạn của Chanel – quà tặng xa xỉ đúng nghĩa.', searchKeyword: 'chanel chance eau tendre 100ml' },
      { name: 'Set mặt nạ Innisfree Jeju Volcanic 10 miếng + serum cấp ẩm', emoji: '🍵', category: 'Skincare', price: 220000, reason: 'Combo detox da, thu nhỏ lỗ chân lông nổi tiếng TikTok – da sạch sau 1 tuần.', searchKeyword: 'innisfree volcanic pore clay mask set' },
      { name: 'Mascara Dior Diorshow Iconic Overcurl 090 Black', emoji: '👁️', category: 'Trang điểm', price: 780000, reason: 'Mascara cong mi tốt nhất từ Dior – mi dày, cong vút, không trôi cả ngày.', searchKeyword: 'dior diorshow mascara overcurl' },
      { name: 'Bộ cọ trang điểm Real Techniques 11 cây mềm mượt', emoji: '🖌️', category: 'Dụng cụ', price: 380000, reason: 'Bộ cọ yêu thích của MUA chuyên nghiệp – lông mềm, thoa đều, dễ vệ sinh.', searchKeyword: 'real techniques everyday essentials set' },
    ],

    // ── BEAUTY MALE ──
    beauty_male: [
      { name: 'Sáp vuốt tóc LAYRITE Superhold Pomade 297g hold cực cao', emoji: '🧴', category: 'Chăm sóc tóc', price: 290000, reason: 'Sáp quốc dân được barbershop tin dùng – giữ kiểu bền cả ngày không cần xịt.', searchKeyword: 'layrite superhold pomade 297g' },
      { name: 'Nước hoa Dior Sauvage EDT 100ml (nam tính, lưu hương 8h)', emoji: '🧪', category: 'Nước hoa', price: 3100000, reason: 'Mùi hương biểu tượng của đàn ông hiện đại – ai cũng phải ngoái đầu khi ngửi.', searchKeyword: 'dior sauvage edt 100ml chính hãng' },
      { name: 'Kem dưỡng da mặt nam Kiehl\'s Facial Fuel 125ml', emoji: '🧴', category: 'Skincare nam', price: 690000, reason: 'Dưỡng ẩm chuyên biệt cho da nam – không bóng nhờn, bảo vệ cả ngày.', searchKeyword: 'kiehls facial fuel moisturizer nam' },
      { name: 'Ví da ngựa Horween nam full-grain leather bifold slim', emoji: '👛', category: 'Phụ kiện cao cấp', price: 890000, reason: 'Da thật cao cấp đẹp dần theo thời gian – "patina" càng dùng lâu càng đẹp.', searchKeyword: 'ví da thật nam full grain leather slim' },
      { name: 'Kính râm Rayban Wayfarer RB2140 Havana/Green G-15', emoji: '🕶️', category: 'Phụ kiện cao cấp', price: 2800000, reason: 'Kính huyền thoại từ 1956 – classic không bao giờ lỗi mốt, chống tia UV100%.', searchKeyword: 'rayban wayfarer rb2140 chính hãng' },
    ],

    // ── READING (all budgets) ──
    reading: [
      { name: 'Sách Atomic Habits – James Clear (bản đặc biệt bìa cứng mạ vàng)', emoji: '📚', category: 'Sách bestseller', price: 215000, reason: 'Cuốn sách 30 triệu bản toàn cầu – thay đổi thói quen 1% mỗi ngày để bứt phá.', searchKeyword: 'atomic habits bìa cứng mạ vàng' },
      { name: 'Sách The Subtle Art of Not Giving a F*ck (bản dịch)', emoji: '📖', category: 'Sách self-help', price: 135000, reason: 'Quan điểm sống thực tế, không cần "giả vờ tích cực" – GenZ cực thích.', searchKeyword: 'nghệ thuật tinh tế của việc đếch quan tâm' },
      { name: 'Đèn đọc sách LED không gây chói kẹp bìa 3 chế độ sáng Baseus', emoji: '💡', category: 'Phụ kiện đọc sách', price: 195000, reason: 'Đọc sách khuya không ảnh hưởng người ngủ cùng – sáng đúng điểm không chói mắt.', searchKeyword: 'đèn đọc sách led baseus kẹp bìa' },
      { name: 'Kindle Paperwhite Signature 32GB không viền màn hình e-ink', emoji: '📱', category: 'Thiết bị đọc sách', price: 5990000, reason: 'Thư viện 32GB trong lòng bàn tay – đọc sách cả năm không mỏi mắt.', searchKeyword: 'kindle paperwhite signature 32gb' },
      { name: 'Set sổ tay Leuchtturm1917 A5 Dotted + bút Lamy Safari EF', emoji: '✒️', category: 'Văn phòng phẩm cao cấp', price: 650000, reason: 'Combo viết-lách premium mà dân bullet journal và creative đều mơ ước.', searchKeyword: 'leuchtturm1917 a5 dotted notebook set' },
    ],

    // ── TRAVEL / SPORTS ──
    travel: [
      { name: 'Balo du lịch Osprey Farpoint 40L chống nước chính hãng', emoji: '🎒', category: 'Du lịch cao cấp', price: 4200000, reason: 'Balo 40L xịn nhất cho travel – ergonomic, bền 10 năm, bảo hành trọn đời.', searchKeyword: 'osprey farpoint 40l chính hãng' },
      { name: 'Máy lọc nước uống LifeStraw Personal Filter siêu gọn', emoji: '💧', category: 'Đồ phượt', price: 420000, reason: 'Uống nước trực tiếp từ suối sạch khuẩn 99.9999% – must-have cho dân phượt.', searchKeyword: 'lifestraw personal water filter' },
      { name: 'Bình giữ nhiệt Stanley Quencher H2.0 30oz (887ml) Tumbler', emoji: '🥤', category: 'Đồ dùng viral', price: 1350000, reason: 'Item viral TikTok #1 – giữ lạnh 4h, hot 7h, đổ đá không tan cả ngày.', searchKeyword: 'stanley quencher h2.0 tumbler 30oz' },
      { name: 'Vòng đeo tay Garmin vivofit 4 đo bước chân không sạc pin 1 năm', emoji: '🏃', category: 'Thể thao thông minh', price: 2390000, reason: 'Theo dõi bước chân, ngủ, calo – pin AA dùng 1 năm không cần sạc như các hãng khác.', searchKeyword: 'garmin vivofit 4 activity tracker' },
      { name: 'Giày chạy bộ Nike React Miler 3 (Nam/Nữ)', emoji: '👟', category: 'Thể thao', price: 2590000, reason: 'Đế React siêu êm, thoáng khí, phù hợp chạy 5-15km hằng ngày.', searchKeyword: 'nike react miler 3 running shoes' },
      { name: 'Túi du lịch Thule Crossover 2 Duffel 44L chống nước', emoji: '🧳', category: 'Du lịch', price: 2900000, reason: 'Túi du lịch bền nhất phân khúc – chống nước, có ngăn giày riêng biệt sạch sẽ.', searchKeyword: 'thule crossover 2 duffel 44l' },
    ],

    // ── COOKING ──
    cooking: [
      { name: 'Nồi chiên không dầu Philips HD9270 7L màn hình kỹ thuật số', emoji: '🍗', category: 'Đồ bếp cao cấp', price: 2890000, reason: 'Nồi chiên không dầu #1 thị trường – chiên giòn đều, tiết kiệm 80% dầu ăn.', searchKeyword: 'nồi chiên không dầu philips hd9270 7l' },
      { name: 'Máy xay sinh tố Vitamix A2300 Ascent 2.0 HP motor', emoji: '🥤', category: 'Đồ bếp cao cấp', price: 12000000, reason: 'Máy xay mạnh nhất thế giới – xay mịn tuyết rau củ, hạt, đá trong 60 giây.', searchKeyword: 'vitamix a2300 ascent blender' },
      { name: 'Set dao bếp Wüsthof Classic 5 món hộp gỗ tặng kèm', emoji: '🔪', category: 'Đồ bếp cao cấp', price: 5800000, reason: 'Dao Đức huyền thoại – sắc bén, cân bằng hoàn hảo, dùng cả đời không cùn.', searchKeyword: 'wusthof classic 5 piece knife set' },
      { name: 'Thớt gỗ Acacia cao cấp nghiêng đặt decor + khắc tên miễn phí', emoji: '🪵', category: 'Đồ bếp', price: 380000, reason: 'Vừa đẹp vừa sang – khắc tên cặp đôi hoặc ngày sinh nhật cực có tâm.', searchKeyword: 'thớt gỗ acacia khắc tên cao cấp' },
      { name: 'Set trà Matcha Nhật Bản cao cấp (bột + chén + chổi khuấy)', emoji: '🍵', category: 'Ẩm thực cao cấp', price: 450000, reason: 'Trải nghiệm pha trà Nhật tại nhà – tặng cho người yêu văn hóa Nhật.', searchKeyword: 'bộ dụng cụ pha trà matcha nhật bản' },
    ],

    // ── GENERAL FEMALE ──
    general_female: [
      { name: 'Nến thơm Diptyque Baies 190g hương quả berry + hoa hồng', emoji: '🕯️', category: 'Nến cao cấp', price: 1890000, reason: 'Nến thơm huyền thoại Paris – hương nhẹ nhàng lâu tan, decor phòng cực sang.', searchKeyword: 'diptyque baies candle 190g' },
      { name: 'Bình giữ nhiệt Stanley Quencher 591ml Soft Matte Lilac', emoji: '🥤', category: 'Đồ dùng viral', price: 1350000, reason: 'Item viral TikTok 2024 – giữ lạnh cả ngày, hàng triệu chị em dùng.', searchKeyword: 'stanley quencher 591ml soft matte' },
      { name: 'Chậu cây sen đá terracotta set 5 cây mix màu siêu đẹp', emoji: '🪴', category: 'Cây cảnh', price: 185000, reason: 'Bộ sen đá nhiều màu decor bàn làm việc – aesthetic, dễ chăm, không cần tưới nhiều.', searchKeyword: 'chậu cây sen đá terracotta mix màu set 5' },
      { name: 'Túi tote da PU thương hiệu Việt local brand Tobi Studio', emoji: '👜', category: 'Thời trang', price: 420000, reason: 'Da PU cao cấp, đường chỉ đẹp – local brand Việt chất lượng xuất khẩu.', searchKeyword: 'túi tote da pu local brand việt nam cao cấp' },
      { name: 'Vòng tay đá thạch anh hồng + đá mặt trăng phong thủy', emoji: '💎', category: 'Trang sức', price: 145000, reason: 'Mang ý nghĩa tình yêu, may mắn – tặng đầu năm hay sinh nhật đều ý nghĩa.', searchKeyword: 'vòng tay đá thạch anh hồng phong thủy' },
    ],

    // ── GENERAL MALE ──
    general_male: [
      { name: 'Pin dự phòng Anker 737 Power Bank 26800mAh 140W sạc nhanh', emoji: '🔋', category: 'Công nghệ', price: 1290000, reason: 'Pin khủng sạc nhanh nhất phân khúc – sạc đầy MacBook Pro trong 96 phút.', searchKeyword: 'anker 737 powerbank 26800mah 140w' },
      { name: 'Balo laptop Bellroy Classic BackPack 20L da PU cao cấp', emoji: '🎒', category: 'Phụ kiện', price: 2890000, reason: 'Balo đi làm đẹp nhất – da cao cấp, chống nước, ngăn laptop 16" rộng rãi.', searchKeyword: 'bellroy classic backpack laptop bag' },
      { name: 'Máy cạo râu Braun Series 9 Pro+ không dây 5 đầu cắt', emoji: '🪒', category: 'Chăm sóc nam', price: 4500000, reason: 'Máy cạo râu đỉnh nhất Braun – cạo sạch trong 1 lần kéo, không gây kích ứng.', searchKeyword: 'braun series 9 pro+ electric shaver' },
      { name: 'Ví khóa kéo dài Tom Ford bi-fold leather card holder', emoji: '👛', category: 'Phụ kiện cao cấp', price: 3200000, reason: 'Ví da luxury tối giản – đẳng cấp không cần logo to, người biết hàng sẽ hiểu.', searchKeyword: 'ví da nam tom ford card holder' },
      { name: 'Bộ bàn chải đánh răng điện Oral-B iO Series 9 + đế sạc', emoji: '🦷', category: 'Chăm sóc sức khỏe', price: 3990000, reason: 'Bàn chải điện AI thông minh nhất – 7 chế độ đánh, phân tích vùng thiếu đánh.', searchKeyword: 'oral-b io series 9 electric toothbrush' },
    ],

    // ── DIGITAL GIFTS ──
    digital: [
      { name: 'Thẻ nạp Netflix Premium 1 tháng (4 màn hình HD/4K)', emoji: '🎬', category: 'Giải trí số', price: 260000, reason: 'Xem phim, series không giới hạn HD/4K trong 30 ngày – quà tặng số tiện lợi.', searchKeyword: 'thẻ nạp netflix premium 1 tháng' },
      { name: 'Thẻ Gift Card Spotify Premium 3 tháng không quảng cáo', emoji: '🎵', category: 'Âm nhạc số', price: 180000, reason: 'Nghe nhạc không giới hạn, không quảng cáo, offline mọi lúc mọi nơi.', searchKeyword: 'spotify premium gift card 3 tháng' },
      { name: 'Voucher Game Steam 500.000đ mua game PC bất kỳ', emoji: '🎮', category: 'Game số', price: 500000, reason: 'Tặng "mua game tùy ý" – gamer nào cũng thích nhất quà này!', searchKeyword: 'steam wallet code 500000 vnd' },
      { name: 'Thẻ App Store / Google Play 500.000đ mua app game', emoji: '📱', category: 'Ứng dụng số', price: 500000, reason: 'Nạp store để mua app, game, subscription bất kỳ theo ý thích.', searchKeyword: 'app store google play gift card 500000' },
    ],
  };

  // ─── Smart multi-factor category selection ───────────────────────────────────
  let selectedCategories: string[] = [];

  // Experiences first (if budget allows + right occasion)
  const isEventOccasion = answers.occasion?.toLowerCase().includes('sinh nhật') ||
    answers.occasion?.toLowerCase().includes('kỷ niệm') ||
    answers.occasion?.toLowerCase().includes('valentine') ||
    answers.occasion?.toLowerCase().includes('giáng sinh');

  if (isPremium || isMid) {
    selectedCategories.push('experiences');
  }

  // Interest-based
  if (hasInterest('gaming', 'game', 'công nghệ', 'tech', 'esport')) {
    selectedCategories.push(isPremium ? 'premium_tech' : 'gaming');
    selectedCategories.push('gaming');
  }
  if (hasInterest('làm đẹp', 'mỹ phẩm', 'thời trang', 'skincare')) {
    selectedCategories.push(isMale ? (isPremium ? 'beauty_male' : 'beauty_male') : (isPremium ? 'premium_beauty' : 'beauty_female'));
    if (isPremium) selectedCategories.push('premium_fashion');
  }
  if (hasInterest('đọc sách', 'sách', 'học', 'viết lách')) {
    selectedCategories.push('reading');
  }
  if (hasInterest('du lịch', 'thể thao', 'phượt', 'gym', 'chạy bộ')) {
    selectedCategories.push('travel');
    selectedCategories.push('experiences');
  }
  if (hasInterest('nấu ăn', 'ẩm thực', 'cafe', 'bếp')) {
    selectedCategories.push('cooking');
    selectedCategories.push('experiences'); // cooking class
  }
  if (hasInterest('âm nhạc', 'nhạc', 'concert', 'ca hát')) {
    selectedCategories.push('experiences');
    selectedCategories.push('digital');
  }
  if (hasInterest('phim', 'xem phim', 'rạp', 'netflix')) {
    selectedCategories.push('experiences');
    selectedCategories.push('digital');
  }

  // Personality bonus
  if (hasPersonality('sáng tạo', 'nghệ thuật') && !selectedCategories.includes('reading')) selectedCategories.push('reading');
  if (hasPersonality('năng động', 'thể thao') && !selectedCategories.includes('travel')) selectedCategories.push('travel');

  // Premium unlock
  if (isPremium) {
    selectedCategories.push(isMale ? 'general_male' : 'premium_beauty');
    selectedCategories.push(isMale ? 'beauty_male' : 'premium_fashion');
    selectedCategories.push('premium_tech');
  }

  // Kid-specific
  if (isKid) {
    selectedCategories = ['gaming', 'experiences', 'reading'];
  }

  // Older adult
  if (isOlder) {
    selectedCategories.push('cooking', 'experiences', 'travel');
  }

  // Default fallback
  if (selectedCategories.length === 0) {
    selectedCategories.push(isMale ? 'general_male' : 'general_female');
    selectedCategories.push('experiences');
  }

  // Always add general + experiences
  const genCat = isMale ? 'general_male' : 'general_female';
  if (!selectedCategories.includes(genCat)) selectedCategories.push(genCat);
  if (!selectedCategories.includes('experiences')) selectedCategories.push('experiences');

  // ─── Build candidate pool ──────────────────────────────────────────────────
  let candidatePool: RawGift[] = [];
  const seenNames = new Set<string>();
  for (const cat of selectedCategories) {
    for (const g of giftPool[cat] || []) {
      if (!seenNames.has(g.name)) {
        seenNames.add(g.name);
        candidatePool.push(g);
      }
    }
  }

  // ─── Budget filter (flexible ±40%) ──────────────────────────────────────────
  const filtered = candidatePool.filter((g) => g.price >= budgetMin * 0.3 && g.price <= budgetMax * 1.4);
  const finalPool = filtered.length >= 6 ? filtered : candidatePool;

  // ─── Score by relevance ───────────────────────────────────────────────────
  const scored = finalPool.map((g) => {
    let score = 0;
    if (g.price >= budgetMin && g.price <= budgetMax) score += 4;       // perfect budget match
    else if (g.price < budgetMin) score -= 2;                            // too cheap
    const firstCatPool = giftPool[selectedCategories[0]] || [];
    if (firstCatPool.some((x) => x.name === g.name)) score += 3;       // primary interest
    if (g.category.includes('cao cấp') && isPremium) score += 2;       // premium when budget allows
    return { gift: g, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, 9).map((s) => s.gift);

  // Fill to 9 with extras if needed
  let extra = 0;
  while (top.length < 9 && extra < candidatePool.length) {
    const g = candidatePool[extra++];
    if (!top.includes(g)) top.push(g);
  }

  // ─── Relationship-aware reason ───────────────────────────────────────────
  const buildReason = (g: RawGift): string => {
    if (rel === 'người yêu') return `${g.reason} 💕 Thay lời muốn nói với người thương của bạn!`;
    if (rel.includes('bố') || rel.includes('mẹ')) return `${g.reason} Thể hiện sự hiếu kính và quan tâm sâu sắc của bạn.`;
    if (rel.includes('bạn thân') || rel.includes('bạn bè')) return `${g.reason} Bạn thân chắc chắn sẽ thích mê ngay khi nhận được!`;
    if (rel.includes('sếp') || rel.includes('đồng nghiệp')) return `${g.reason} Lựa chọn lịch sự, chỉn chu gắn kết tình đồng nghiệp.`;
    if (rel.includes('con')) return `${g.reason} Phù hợp với lứa tuổi, kích thích sáng tạo và niềm vui.`;
    return g.reason;
  };

  const fmt = (p: number) => {
    const lo = Math.floor(p * 0.88).toLocaleString('vi-VN');
    const hi = Math.floor(p * 1.12).toLocaleString('vi-VN');
    return `${lo}đ – ${hi}đ`;
  };

  return top.map((g, i) => ({
    id: `smart_${i + 1}_${Date.now()}`,
    productName: g.name,
    reason: buildReason(g),
    estimatedPriceRange: fmt(g.price),
    searchKeyword: g.searchKeyword || g.name.split(' – ')[0],
    emoji: g.emoji,
    category: g.category,
  }));
}

function getMockSuggestions(answers: Partial<QuizAnswers>): GiftSuggestion[] {
  const safe: QuizAnswers = {
    occasion: answers.occasion || 'Sinh nhật',
    relationship: answers.relationship || 'bạn thân',
    gender: answers.gender || 'nữ',
    ageRange: answers.ageRange || '19-25 tuổi',
    zodiac: answers.zodiac || '',
    personality: answers.personality || ['năng động'],
    interests: answers.interests || ['làm đẹp'],
    budget: answers.budget || '100.000đ – 300.000đ',
  };
  return generateSmartMockSuggestions(safe);
}

export async function POST(request: NextRequest) {
  try {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    if (!getRateLimit(ip)) {
      return NextResponse.json({ error: 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau 1 giờ.' }, { status: 429 });
    }

    const answers: QuizAnswers = await request.json();
    if (!answers.occasion || !answers.relationship || !answers.gender) {
      return NextResponse.json({ error: 'Vui lòng hoàn thành tất cả các câu hỏi bắt buộc.' }, { status: 400 });
    }

    let suggestions: GiftSuggestion[];
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const { buildGiftPrompt, validateAIResponse } = await import('@/lib/ai/prompt-builder');
        const raw = await callAnthropicAPI(buildGiftPrompt(answers));
        suggestions = validateAIResponse({ suggestions: raw });
      } catch {
        await new Promise((r) => setTimeout(r, 800));
        suggestions = getMockSuggestions(answers);
      }
    } else {
      await new Promise((r) => setTimeout(r, 1500));
      suggestions = getMockSuggestions(answers);
    }

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('suggest-gifts error:', error);
    return NextResponse.json({ error: 'Oops! Có lỗi xảy ra khi gợi ý quà. Vui lòng thử lại.' }, { status: 500 });
  }
}

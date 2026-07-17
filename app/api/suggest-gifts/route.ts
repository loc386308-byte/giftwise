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
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) throw new Error(`Anthropic API error: ${response.status}`);
  const data = await response.json();
  const content = data.content?.[0]?.text || '';
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in response');
  const parsed = JSON.parse(jsonMatch[0]);
  return parsed.suggestions || [];
}

// Budget range parser → returns [min, max] in VND
function parseBudget(budget: string): [number, number] {
  const nums = budget.replace(/\./g, '').match(/\d+/g)?.map(Number) || [];
  if (nums.length >= 2) return [nums[0] * 1000, nums[1] * 1000];
  if (nums.length === 1) return [nums[0] * 1000 * 0.7, nums[0] * 1000 * 1.3];
  return [100000, 500000];
}

type RawGift = {
  name: string;
  emoji: string;
  category: string;
  price: number;
  reason: string;
  searchKeyword?: string;
};

function generateSmartMockSuggestions(answers: QuizAnswers): GiftSuggestion[] {
  const gender = answers.gender.toLowerCase();
  const age = answers.ageRange.toLowerCase();
  const rel = answers.relationship.toLowerCase();
  const occasion = answers.occasion.toLowerCase();
  const interests = answers.interests || [];
  const personality = answers.personality || [];

  const isKid = age.includes('dưới 12') || age.includes('13-18');
  const isOlder = age.includes('trên 50') || age.includes('36-50');
  const isMale = gender === 'nam';
  const isFemale = gender === 'nữ';

  const [budgetMin, budgetMax] = parseBudget(answers.budget || '100.000đ - 500.000đ');

  const hasInterest = (...keys: string[]) =>
    keys.some((k) => interests.some((i) => i.toLowerCase().includes(k)));
  const hasPersonality = (...keys: string[]) =>
    keys.some((k) => personality.some((p) => p.toLowerCase().includes(k)));

  // --- Pool of ALL possible gifts, indexed by category ---
  const giftPool: Record<string, RawGift[]> = {
    gaming: [
      { name: 'Bàn phím cơ không dây layout 75% RGB gọn nhẹ', emoji: '⌨️', category: 'Công nghệ', price: 750000, reason: 'Gõ phím êm ái, layout gọn cho cả gaming lẫn làm việc.', searchKeyword: 'bàn phím cơ không dây' },
      { name: 'Tay cầm chơi game Bluetooth đa nền tảng', emoji: '🎮', category: 'Giải trí', price: 420000, reason: 'Trải nghiệm gaming mượt mà như console, kết nối đa thiết bị.', searchKeyword: 'tay cầm chơi game bluetooth' },
      { name: 'Lót chuột gaming cỡ XL 900×400mm chống trượt', emoji: '🖱️', category: 'Phụ kiện', price: 115000, reason: 'Bề mặt rộng thoải mái, chống trượt tốt khi gaming căng thẳng.', searchKeyword: 'lót chuột gaming xl' },
      { name: 'Đèn LED RGB nháy theo nhạc cho góc gaming', emoji: '💡', category: 'Trang trí', price: 95000, reason: 'Tạo không gian gaming đỉnh cao, lung linh màu sắc.', searchKeyword: 'đèn led rgb gaming' },
      { name: 'Tai nghe gaming chụp tai có mic LED RGB', emoji: '🎧', category: 'Công nghệ', price: 390000, reason: 'Âm thanh vòm sống động, mic khử ồn tốt cho team play.', searchKeyword: 'tai nghe gaming chụp tai' },
      { name: 'Chuột gaming không dây DPI cao có RGB', emoji: '🖱️', category: 'Công nghệ', price: 480000, reason: 'Độ chính xác cao, pin trâu, nhẹ tay khi chơi lâu giờ.', searchKeyword: 'chuột gaming không dây rgb' },
      { name: 'Mô hình lắp ráp LEGO Creator 3in1 sáng tạo', emoji: '🧱', category: 'Đồ chơi', price: 320000, reason: 'Rèn tư duy không gian và sáng tạo cho người mê lắp ráp.', searchKeyword: 'lego creator 3in1' },
      { name: 'Giá đỡ màn hình monitor nâng hạ linh hoạt', emoji: '🖥️', category: 'Phụ kiện', price: 560000, reason: 'Chỉnh độ cao màn hình tối ưu, giảm mỏi cổ khi chơi game lâu.', searchKeyword: 'giá đỡ màn hình gaming' },
    ],
    beauty_female: [
      { name: 'Son kem lì Romand Zero Velvet Tint trendy 3.5g', emoji: '💄', category: 'Son môi', price: 155000, reason: 'Màu sắc trendy tôn da, chất son mịn bám lâu cả ngày.', searchKeyword: 'son kem lì romand' },
      { name: 'Máy rửa mặt sóng âm silicon 5 chế độ rung', emoji: '🧼', category: 'Thiết bị làm đẹp', price: 245000, reason: 'Làm sạch sâu lỗ chân lông, skincare hiệu quả hơn 6x.', searchKeyword: 'máy rửa mặt sóng âm silicon' },
      { name: 'Gương trang điểm đèn LED cảm ứng chống lóa', emoji: '🪞', category: 'Dụng cụ', price: 180000, reason: 'Ánh sáng chuẩn studio giúp makeup đẹp hơn mọi lúc.', searchKeyword: 'gương trang điểm đèn led' },
      { name: 'Set serum vitamin C dưỡng trắng da ban ngày', emoji: '✨', category: 'Skincare', price: 210000, reason: 'Mờ thâm sạm, tăng độ căng bóng cho làn da rạng rỡ.', searchKeyword: 'serum vitamin c dưỡng trắng' },
      { name: 'Bộ cọ trang điểm 13 món lông mềm cao cấp', emoji: '🖌️', category: 'Dụng cụ', price: 125000, reason: 'Đủ bộ cọ cơ bản cho makeup tự nhiên đến sắc sảo.', searchKeyword: 'bộ cọ trang điểm 13 món' },
      { name: 'Nước hoa chiết La Vie Est Belle Lancôme 10ml', emoji: '🌸', category: 'Nước hoa', price: 180000, reason: 'Hương hoa ngọt ngào lãng mạn, lưu hương cả ngày dài.', searchKeyword: 'nước hoa chiết nữ ngọt' },
      { name: 'Mặt nạ ngủ collagen COSRX không cần rửa', emoji: '🌙', category: 'Skincare', price: 160000, reason: 'Dưỡng ẩm cấp tốc qua đêm, thức dậy da căng mịn tức thì.', searchKeyword: 'mặt nạ ngủ collagen cosrx' },
      { name: 'Lắc tay bạc ý S925 đính đá pha lê lấp lánh', emoji: '💫', category: 'Trang sức', price: 280000, reason: 'Tinh tế thanh lịch, tôn vẻ nữ tính của cổ tay.', searchKeyword: 'lắc tay bạc s925 đính đá' },
      { name: 'Bộ skincare mini Innisfree Jeju Green Tea 3 món', emoji: '🍵', category: 'Skincare', price: 250000, reason: 'Combo skincare chuẩn Hàn đủ dưỡng ẩm, toner, serum.', searchKeyword: 'bộ skincare innisfree mini' },
    ],
    beauty_male: [
      { name: 'Sáp vuốt tóc Clay Pomade giữ nếp tự nhiên bóng nhẹ', emoji: '🧴', category: 'Chăm sóc tóc', price: 185000, reason: 'Giữ kiểu tóc phong độ cả ngày mà không bết dính.', searchKeyword: 'sáp vuốt tóc clay pomade' },
      { name: 'Kem dưỡng da mặt nam chống nắng SPF 50 Belo', emoji: '🧴', category: 'Skincare nam', price: 145000, reason: 'Bảo vệ da khỏi UV, kiểm soát dầu tốt cho da nam.', searchKeyword: 'kem dưỡng da mặt nam spf50' },
      { name: 'Ví da thật nam slim compact chống RFID', emoji: '👛', category: 'Phụ kiện', price: 280000, reason: 'Thiết kế mỏng gọn bảo vệ thẻ từ hiện đại.', searchKeyword: 'ví da nam slim rfid' },
      { name: 'Nước hoa chiết Sauvage Dior 10ml nam tính', emoji: '🧪', category: 'Nước hoa', price: 240000, reason: 'Hương gỗ mạnh mẽ nam tính, lưu hương cực lâu.', searchKeyword: 'nước hoa chiết sauvage dior' },
      { name: 'Kính mát UV400 gọng kim loại mỏng thời trang', emoji: '🕶️', category: 'Phụ kiện', price: 175000, reason: 'Bảo vệ mắt chuẩn + điểm nhấn thời trang không thể thiếu.', searchKeyword: 'kính mát uv400 gọng kim loại' },
      { name: 'Thắt lưng da khóa tự động không đục lỗ', emoji: '🎗️', category: 'Phụ kiện', price: 295000, reason: 'Phụ kiện chỉn chu tạo tổng thể trang phục bảnh bao.', searchKeyword: 'thắt lưng da khóa tự động nam' },
      { name: 'Set chăm sóc râu Gillette gel + dao cạo cao cấp', emoji: '🪒', category: 'Chăm sóc', price: 195000, reason: 'Cạo râu êm mịn không đứt da, bộ quà tặng tinh tế cho nam.', searchKeyword: 'bộ cạo râu gillette cao cấp' },
      { name: 'Túi đeo chéo canvas nam streetwear gọn nhẹ', emoji: '🎒', category: 'Thời trang', price: 165000, reason: 'Đựng essentials gọn gàng theo phong cách urban nam tính.', searchKeyword: 'túi đeo chéo canvas nam' },
    ],
    reading: [
      { name: 'Đèn đọc sách kẹp trang LED 3 chế độ sáng', emoji: '💡', category: 'Phụ kiện đọc sách', price: 79000, reason: 'Đọc sách ban đêm không mỏi mắt, không làm phiền người ngủ cùng.', searchKeyword: 'đèn đọc sách kẹp trang led' },
      { name: 'Sách Atomic Habits – James Clear bản mới nhất', emoji: '📚', category: 'Sách bestseller', price: 125000, reason: 'Cuốn sách triệu bản thay đổi thói quen và cải thiện cuộc sống.', searchKeyword: 'sách atomic habits tiếng việt' },
      { name: 'Sổ tay Bullet Journal bìa cứng chấm bi A5', emoji: '📓', category: 'Văn phòng phẩm', price: 95000, reason: 'Công cụ lập kế hoạch và ghi chú sáng tạo yêu thích của Gen Z.', searchKeyword: 'sổ tay bullet journal a5' },
      { name: 'Kệ sách mini gỗ để bàn làm việc trang trí', emoji: '🪵', category: 'Trang trí', price: 135000, reason: 'Sắp xếp sách gọn gàng và decor bàn làm việc cực aesthetic.', searchKeyword: 'kệ sách mini gỗ để bàn' },
      { name: 'Bộ bookmark gỗ khắc laser hình nghệ thuật 5 chiếc', emoji: '🔖', category: 'Lưu niệm', price: 65000, reason: 'Đánh dấu trang tinh tế và handmade, làm quà cực có tâm.', searchKeyword: 'bookmark gỗ khắc laser' },
      { name: 'Sách Tư Duy Phản Biện – Nguyen Minh Duc', emoji: '📖', category: 'Sách', price: 110000, reason: 'Rèn luyện tư duy logic và phân tích vấn đề đa chiều.', searchKeyword: 'sách tư duy phản biện' },
      { name: 'Gối tựa lưng đọc sách cao su non nhớ hình', emoji: '🛋️', category: 'Sức khỏe', price: 225000, reason: 'Hỗ trợ cột sống, ngồi đọc sách thoải mái nhiều giờ.', searchKeyword: 'gối tựa lưng đọc sách' },
      { name: 'Bút ký kim loại cao cấp kèm hộp quà sang trọng', emoji: '✒️', category: 'Văn phòng phẩm', price: 195000, reason: 'Món quà trang nhã, ý nghĩa cho người thích viết lách.', searchKeyword: 'bút ký kim loại hộp quà' },
    ],
    travel: [
      { name: 'Balo du lịch chống nước 30L nhiều ngăn tiện dụng', emoji: '🎒', category: 'Du lịch', price: 425000, reason: 'Chứa đồ khoa học, chống nước tốt cho mọi chuyến phượt.', searchKeyword: 'balo du lịch chống nước 30l' },
      { name: 'Gối kê cổ du lịch cao su non ký ức 3D', emoji: '✈️', category: 'Du lịch', price: 165000, reason: 'Nâng đỡ cổ hoàn hảo, ngủ ngon suốt chuyến đi dài.', searchKeyword: 'gối kê cổ du lịch cao su' },
      { name: 'Túi đeo bụng thể thao chống nước nhiều ngăn', emoji: '🏃', category: 'Thể thao', price: 99000, reason: 'Gọn nhẹ đựng đồ thiết yếu khi chạy bộ, leo núi, phượt.', searchKeyword: 'túi đeo bụng chống nước thể thao' },
      { name: 'Bình nước thể thao inox 1L có ống hút nắp bật', emoji: '🥤', category: 'Đồ dùng', price: 185000, reason: 'Cung cấp đủ nước nguyên chuyến, inox an toàn sức khỏe.', searchKeyword: 'bình nước thể thao inox 1l' },
      { name: 'Loa Bluetooth chống nước IPX7 cho dã ngoại', emoji: '🔊', category: 'Công nghệ', price: 350000, reason: 'Khuấy động mọi buổi picnic với âm thanh to, bass mạnh.', searchKeyword: 'loa bluetooth chống nước ipx7' },
      { name: 'Quạt cầm tay sạc USB siêu mát 3 cấp độ gió', emoji: '🪭', category: 'Đồ dùng', price: 125000, reason: 'Xua tan nóng nực nhanh chóng, nhỏ gọn bỏ túi dễ dàng.', searchKeyword: 'quạt cầm tay sạc usb mini' },
      { name: 'Túi du lịch gom cáp phụ kiện điện tử nhiều ngăn', emoji: '🗂️', category: 'Du lịch', price: 155000, reason: 'Gom cáp sạc, pin dự phòng gọn gàng không bị rối.', searchKeyword: 'túi đựng phụ kiện điện tử du lịch' },
      { name: 'Đồng hồ thể thao đo nhịp tim GPS Xiaomi Band', emoji: '⌚', category: 'Công nghệ', price: 890000, reason: 'Theo dõi sức khỏe, quãng đường, nhịp tim chính xác.', searchKeyword: 'vòng đeo tay thể thao xiaomi band' },
    ],
    cooking: [
      { name: 'Thớt gỗ Teak cao cấp decor món ăn sang trọng', emoji: '🪵', category: 'Đồ bếp', price: 210000, reason: 'Vừa dùng thái vừa bày biện phong cách cho những buổi nấu nướng.', searchKeyword: 'thớt gỗ teak cao cấp' },
      { name: 'Set trà hoa thảo mộc mix 8 loại ngủ ngon an thần', emoji: '🍵', category: 'Sức khỏe', price: 165000, reason: 'Thư giãn tinh thần, dễ ngủ sâu sau ngày dài bận rộn.', searchKeyword: 'trà hoa thảo mộc mix ngủ ngon' },
      { name: 'Máy đánh trứng tạo bọt cầm tay tốc độ cao', emoji: '🥚', category: 'Đồ bếp', price: 125000, reason: 'Làm bánh, pha cafe bọt nhanh gọn chỉ trong 30 giây.', searchKeyword: 'máy đánh trứng cầm tay mini' },
      { name: 'Bộ gia vị khô hữu cơ 6 loại hộp gỗ sang trọng', emoji: '🧂', category: 'Ẩm thực', price: 195000, reason: 'Quà tặng có tâm cho người yêu bếp, nấu ngon hơn mỗi ngày.', searchKeyword: 'bộ gia vị hữu cơ hộp gỗ' },
      { name: 'Nồi lẩu mini điện 1.2L dùng cho 1-2 người', emoji: '🍲', category: 'Đồ bếp', price: 285000, reason: 'Ăn lẩu tại nhà tiện lợi, tiết kiệm và ấm cúng hơn nhiều.', searchKeyword: 'nồi lẩu điện mini 1.2l' },
      { name: 'Cốc thủy tinh 2 lớp borosilicate 350ml chịu nhiệt', emoji: '🥛', category: 'Đồ dùng', price: 92000, reason: 'Đựng trà nóng hay cà phê đá đều đẹp, cầm không nóng tay.', searchKeyword: 'cốc thủy tinh 2 lớp borosilicate' },
      { name: 'Tạp dề canvas dày chống nước phong cách nhà hàng', emoji: '🎽', category: 'Đồ bếp', price: 118000, reason: 'Nấu ăn không lo vấy bẩn quần áo, trông cực chuyên nghiệp.', searchKeyword: 'tạp dề canvas chống nước bếp' },
      { name: 'Bộ dao nhà bếp inox không gỉ 5 món bọc gỗ', emoji: '🔪', category: 'Đồ bếp', price: 350000, reason: 'Bộ dao đủ dùng cho mọi công đoạn nấu ăn hàng ngày.', searchKeyword: 'bộ dao nhà bếp inox 5 món' },
    ],
    general_female: [
      { name: 'Nến thơm tinh dầu thiên nhiên handmade hộp gỗ', emoji: '🕯️', category: 'Trang trí', price: 145000, reason: 'Thư giãn đầu óc, tạo không gian ấm áp dễ chịu.', searchKeyword: 'nến thơm tinh dầu thiên nhiên' },
      { name: 'Bình giữ nhiệt Stanley Quencher 591ml giữ lạnh 24h', emoji: '🥤', category: 'Đồ dùng', price: 580000, reason: 'Siêu hot TikTok, giữ lạnh cực tốt - item must-have 2024.', searchKeyword: 'bình giữ nhiệt stanley quencher' },
      { name: 'Chậu cây sen đá mini set 3 chậu để bàn', emoji: '🪴', category: 'Cây cảnh', price: 85000, reason: 'Mang sắc xanh tươi mát đến phòng, dễ chăm không cần tưới nhiều.', searchKeyword: 'chậu cây sen đá mini set 3' },
      { name: 'Túi tote canvas in họa tiết hoa vintage', emoji: '👜', category: 'Thời trang', price: 125000, reason: 'Phong cách vintage trendy, đi học đi chơi đều hợp.', searchKeyword: 'túi tote canvas hoa vintage' },
      { name: 'Set thiệp handmade kèm hoa khô decor cực xinh', emoji: '💐', category: 'Lưu niệm', price: 55000, reason: 'Món quà nhỏ nhắn nhưng rất có tâm và ý nghĩa.', searchKeyword: 'thiệp handmade hoa khô' },
      { name: 'Đèn ngủ silicon đổi màu cảm ứng chạm tay', emoji: '🌙', category: 'Trang trí', price: 165000, reason: 'Ánh sáng ấm dịu tạo giấc ngủ ngon và decor phòng cực chill.', searchKeyword: 'đèn ngủ silicon đổi màu cảm ứng' },
      { name: 'Vòng tay đá thạch anh hồng phong thủy may mắn', emoji: '💎', category: 'Trang sức', price: 95000, reason: 'Mang ý nghĩa tình yêu và may mắn cho người đeo.', searchKeyword: 'vòng tay đá thạch anh hồng' },
      { name: 'Sổ tay Planner 2025 thiết kế tối giản aesthetic', emoji: '📅', category: 'Văn phòng phẩm', price: 95000, reason: 'Lập kế hoạch mỗi ngày cực hiệu quả, thiết kế đẹp mắt.', searchKeyword: 'sổ tay planner 2025 aesthetic' },
    ],
    general_male: [
      { name: 'Bình giữ nhiệt Lock&Lock Inox 304 450ml bền bỉ', emoji: '🥤', category: 'Đồ dùng', price: 265000, reason: 'Giữ nhiệt tốt, bền bỉ cho người bận rộn mỗi ngày.', searchKeyword: 'bình giữ nhiệt lock lock inox' },
      { name: 'Đế sạc không dây Magsafe 3 trong 1 cao cấp', emoji: '⚡', category: 'Công nghệ', price: 280000, reason: 'Sạc đồng thời điện thoại, tai nghe, đồng hồ tiện lợi.', searchKeyword: 'đế sạc không dây 3 trong 1' },
      { name: 'Cáp sạc Lightning/USB-C bọc dù siêu bền 1.2m', emoji: '🔌', category: 'Công nghệ', price: 75000, reason: 'Bền gấp 3 cáp thường, sạc nhanh, đa năng.', searchKeyword: 'cáp sạc bọc dù siêu bền' },
      { name: 'Túi đeo chéo mini vải dù chống nước tiện dụng', emoji: '🎒', category: 'Thời trang', price: 155000, reason: 'Gọn nhẹ đựng đồ thiết yếu khi ra đường năng động.', searchKeyword: 'túi đeo chéo vải dù chống nước nam' },
      { name: 'Cốc cafe thủy tinh giữ nhiệt 400ml có nắp hút', emoji: '☕', category: 'Đồ dùng', price: 115000, reason: 'Uống cafe đi làm tiện lợi, không lo rò rỉ hay nguội sớm.', searchKeyword: 'cốc thủy tinh giữ nhiệt có nắp' },
      { name: 'Bộ tất co giãn 5 đôi chất cotton kháng khuẩn', emoji: '🧦', category: 'Thời trang', price: 85000, reason: 'Quà tặng thiết thực hàng ngày, không bao giờ thừa.', searchKeyword: 'tất cotton kháng khuẩn bộ 5 đôi' },
      { name: 'Pin dự phòng 20000mAh sạc nhanh 65W gọn nhẹ', emoji: '🔋', category: 'Công nghệ', price: 380000, reason: 'Luôn đủ pin cho mọi thiết bị suốt ngày bận rộn.', searchKeyword: 'pin dự phòng 20000mah sạc nhanh' },
      { name: 'Khăn tắm cotton cao cấp 70x140cm mềm mại', emoji: '🛁', category: 'Gia dụng', price: 125000, reason: 'Mềm mại thấm hút tốt, nâng tầm trải nghiệm phòng tắm.', searchKeyword: 'khăn tắm cotton cao cấp 70x140' },
    ],
  };

  // --- Smart multi-factor selection logic ---
  let selectedCategories: string[] = [];

  // Primary: interest-based
  if (hasInterest('gaming', 'game', 'công nghệ', 'tech')) {
    selectedCategories.push('gaming');
  }
  if (hasInterest('làm đẹp', 'mỹ phẩm', 'thời trang', 'skincare')) {
    selectedCategories.push(isMale ? 'beauty_male' : 'beauty_female');
  }
  if (hasInterest('đọc sách', 'sách', 'học')) {
    selectedCategories.push('reading');
  }
  if (hasInterest('du lịch', 'thể thao', 'phượt', 'gym')) {
    selectedCategories.push('travel');
  }
  if (hasInterest('nấu ăn', 'ẩm thực', 'cafe')) {
    selectedCategories.push('cooking');
  }

  // Personality-based additions
  if (hasPersonality('sáng tạo', 'nghệ thuật') && !selectedCategories.includes('reading')) {
    selectedCategories.push('reading');
  }
  if (hasPersonality('năng động', 'thể thao') && !selectedCategories.includes('travel')) {
    selectedCategories.push('travel');
  }

  // Default fallback by gender
  if (selectedCategories.length === 0) {
    selectedCategories.push(isMale ? 'general_male' : 'general_female');
  }

  // Always add general gender gifts as secondary options
  const generalCat = isMale ? 'general_male' : 'general_female';
  if (!selectedCategories.includes(generalCat)) {
    selectedCategories.push(generalCat);
  }

  // Build candidate pool from selected categories
  let candidatePool: RawGift[] = [];
  for (const cat of selectedCategories) {
    const catGifts = giftPool[cat] || [];
    candidatePool.push(...catGifts);
  }

  // Remove duplicates by name
  const seen = new Set<string>();
  candidatePool = candidatePool.filter((g) => {
    if (seen.has(g.name)) return false;
    seen.add(g.name);
    return true;
  });

  // Filter by budget (allow ±30% flexibility for variety)
  const budgetFiltered = candidatePool.filter(
    (g) => g.price >= budgetMin * 0.3 && g.price <= budgetMax * 1.3
  );
  const finalPool = budgetFiltered.length >= 6 ? budgetFiltered : candidatePool;

  // Score each gift by relevance
  const scoredPool = finalPool.map((g) => {
    let score = 0;
    // Budget match bonus
    if (g.price >= budgetMin && g.price <= budgetMax) score += 3;
    // Primary category bonus
    if (selectedCategories[0] && (giftPool[selectedCategories[0]] || []).some((x) => x.name === g.name)) score += 2;
    return { gift: g, score };
  });

  scoredPool.sort((a, b) => b.score - a.score);
  const top = scoredPool.slice(0, 9).map((s) => s.gift);

  // Fill to 9 if needed
  while (top.length < 9 && candidatePool.length > top.length) {
    const extra = candidatePool.find((g) => !top.includes(g));
    if (extra) top.push(extra);
    else break;
  }

  // Build reason based on relationship
  const getRelationshipReason = (gift: RawGift): string => {
    const base = gift.reason;
    if (rel === 'người yêu') {
      return `${base} Món quà ngọt ngào thay lời muốn nói gửi đến người thương của bạn! 💕`;
    } else if (rel.includes('bố') || rel.includes('mẹ')) {
      return `${base} Thể hiện lòng hiếu kính và sự quan tâm ấm áp của bạn đến bố/mẹ.`;
    } else if (rel.includes('bạn thân') || rel.includes('bạn bè')) {
      return `${base} Chắc chắn đứa bạn thân sẽ thích mê và khoe ngay khi mở ra!`;
    } else if (rel.includes('sếp') || rel.includes('đồng nghiệp')) {
      return `${base} Lựa chọn chỉn chu, lịch sự gắn kết tình đồng nghiệp hữu hảo.`;
    } else if (rel.includes('con')) {
      return `${base} Món quà phù hợp lứa tuổi, kích thích sự sáng tạo và niềm vui cho bé.`;
    }
    return base;
  };

  // Format price range
  const formatPrice = (price: number): string => {
    const min = Math.floor(price * 0.88);
    const max = Math.floor(price * 1.12);
    return `${min.toLocaleString('vi-VN')}đ – ${max.toLocaleString('vi-VN')}đ`;
  };

  return top.map((gift, index) => ({
    id: `smart_${index + 1}_${Date.now()}`,
    productName: gift.name,
    reason: getRelationshipReason(gift),
    estimatedPriceRange: formatPrice(gift.price),
    searchKeyword: gift.searchKeyword || gift.name.split(' – ')[0],
    emoji: gift.emoji,
    category: gift.category,
  }));
}

function getMockSuggestions(answers: Partial<QuizAnswers>): GiftSuggestion[] {
  const safeAnswers: QuizAnswers = {
    occasion: answers.occasion || 'Sinh nhật',
    relationship: answers.relationship || 'bạn thân',
    gender: answers.gender || 'nữ',
    ageRange: answers.ageRange || '19-25 tuổi',
    zodiac: answers.zodiac || '',
    personality: answers.personality || ['năng động'],
    interests: answers.interests || ['làm đẹp'],
    budget: answers.budget || '100.000đ – 300.000đ',
  };
  return generateSmartMockSuggestions(safeAnswers);
}

export async function POST(request: NextRequest) {
  try {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';

    if (!getRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau 1 giờ.' },
        { status: 429 }
      );
    }

    const answers: QuizAnswers = await request.json();

    if (!answers.occasion || !answers.relationship || !answers.gender) {
      return NextResponse.json(
        { error: 'Vui lòng hoàn thành tất cả các câu hỏi bắt buộc.' },
        { status: 400 }
      );
    }

    let suggestions: GiftSuggestion[];

    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const { buildGiftPrompt, validateAIResponse } = await import('@/lib/ai/prompt-builder');
        const prompt = buildGiftPrompt(answers);
        const rawSuggestions = await callAnthropicAPI(prompt);
        suggestions = validateAIResponse({ suggestions: rawSuggestions });
      } catch {
        await new Promise((r) => setTimeout(r, 1000));
        suggestions = getMockSuggestions(answers);
      }
    } else {
      await new Promise((r) => setTimeout(r, 1500));
      suggestions = getMockSuggestions(answers);
    }

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('suggest-gifts error:', error);
    return NextResponse.json(
      { error: 'Oops! Có lỗi xảy ra khi gợi ý quà. Vui lòng thử lại.' },
      { status: 500 }
    );
  }
}

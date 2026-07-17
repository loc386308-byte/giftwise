import { NextRequest, NextResponse } from 'next/server';
import { MOCK_SUGGESTIONS_BY_OCCASION } from '@/lib/mock-data';
import { GiftSuggestion, QuizAnswers } from '@/types';

// Simple in-memory rate limiting (production: use Redis)
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
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) throw new Error(`Anthropic API error: ${response.status}`);

  const data = await response.json();
  const content = data.content?.[0]?.text || '';

  // Extract JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in response');

  const parsed = JSON.parse(jsonMatch[0]);
  return parsed.suggestions || [];
}

function generateSmartMockSuggestions(answers: QuizAnswers): GiftSuggestion[] {
  const gender = answers.gender.toLowerCase();
  const age = answers.ageRange.toLowerCase();
  const isKid = age.includes('dưới 12') || age.includes('13-18');
  const isOlder = age.includes('trên 50') || age.includes('36-50');
  
  // Primary interest matching
  const interest = answers.interests?.[0] || 'mặc định';
  
  let rawGifts: { name: string; emoji: string; category: string; price: number; reason: string }[] = [];

  // Match gifts by interest & demographics
  if (interest === 'gaming' || answers.personality?.includes('yêu công nghệ')) {
    if (isKid) {
      rawGifts = [
        { name: 'Máy chơi game cầm tay mini 400 trò', emoji: '🎮', category: 'Giải trí', price: 180000, reason: 'Phù hợp để giải trí lành mạnh sau giờ học căng thẳng.' },
        { name: 'Đèn LED Neon decor bàn học hình tay cầm game', emoji: '💡', category: 'Trang trí', price: 150000, reason: 'Tạo không gian học tập cực cool và cá tính cho bé.' },
        { name: 'Lót chuột cỡ lớn (Mousepad) chủ đề game', emoji: '🖱️', category: 'Phụ kiện', price: 85000, reason: 'Kích thước lớn thoải mái và chống trượt tốt.' },
        { name: 'Mô hình lắp ráp Lego nhân vật game yêu thích', emoji: '🧱', category: 'Đồ chơi', price: 210000, reason: 'Rèn luyện khả năng tư duy sáng tạo và kiên nhẫn.' },
        { name: 'Tai nghe gaming chụp tai có đèn LED màu sắc', emoji: '🎧', category: 'Công nghệ', price: 290000, reason: 'Thiết kế ôm tai êm ái cùng chất âm sống động.' },
        { name: 'Giá treo tai nghe bằng nhựa ABS cao cấp', emoji: '📐', category: 'Phụ kiện', price: 90000, reason: 'Giúp góc học tập gọn gàng và khoa học hơn.' },
      ];
    } else {
      rawGifts = [
        { name: 'Bàn phím cơ không dây layout 75% gọn nhẹ', emoji: '⌨️', category: 'Công nghệ', price: 550000, reason: 'Mang lại cảm giác gõ êm ái khi làm việc và chơi game.' },
        { name: 'Đèn LED RGB treo màn hình máy tính chống mỏi mắt', emoji: '💡', category: 'Thiết bị', price: 320000, reason: 'Bảo vệ thị lực khi làm việc và giải trí ban đêm.' },
        { name: 'Tay cầm chơi game không dây bluetooth tiện lợi', emoji: '🎮', category: 'Giải trí', price: 380000, reason: 'Trải nghiệm chơi game mượt mà như trên console.' },
        { name: 'Đế sạc nhanh không dây 3 trong 1 đa năng', emoji: '⚡', category: 'Công nghệ', price: 250000, reason: 'Sạc tiện lợi cho cả điện thoại, tai nghe và đồng hồ.' },
        { name: 'Loa Bluetooth mini chống nước Bass cực trầm', emoji: '🔊', category: 'Công nghệ', price: 420000, reason: 'Thỏa thích tận hưởng âm nhạc mọi lúc mọi nơi.' },
        { name: 'Cốc giữ nhiệt Coffee Inox 304 cao cấp', emoji: '🥤', category: 'Đồ gia dụng', price: 160000, reason: 'Giữ nhiệt tốt cho cả ngày dài làm việc tỉnh táo.' },
      ];
    }
  } else if (interest === 'làm đẹp' || interest === 'thời trang' || answers.personality?.includes('yêu làm đẹp')) {
    if (gender === 'nam') {
      rawGifts = [
        { name: 'Sáp vuốt tóc giữ nếp tự nhiên Clay Pomade', emoji: '🧴', category: 'Chăm sóc nam', price: 180000, reason: 'Giúp tạo kiểu tóc bảnh bao suốt cả ngày dài năng động.' },
        { name: 'Túi đeo chéo mini vải canvas nam tính', emoji: '🎒', category: 'Thời trang', price: 150000, reason: 'Thiết kế gọn nhẹ, đa năng cho các buổi đi chơi phố.' },
        { name: 'Ví da nam mini chống xước đựng thẻ ATM', emoji: '👛', category: 'Phụ kiện', price: 250000, reason: 'Chất liệu da cao cấp cực kỳ tinh tế và tối giản.' },
        { name: 'Nước hoa chiết chính hãng hương gỗ nam tính 10ml', emoji: '🧪', category: 'Nước hoa', price: 220000, reason: 'Mùi hương lịch lãm, lưu hương lâu cực cuốn hút.' },
        { name: 'Kính mát thời trang chống tia UV400', emoji: '🕶️', category: 'Phụ kiện', price: 160000, reason: 'Bảo vệ mắt tối ưu và tạo điểm nhấn thời trang cực ngầu.' },
        { name: 'Thắt lưng da khóa tự động cao cấp', emoji: '🎗️', category: 'Phụ kiện', price: 280000, reason: 'Phụ kiện không thể thiếu tạo vẻ ngoài chỉn chu.' },
      ];
    } else {
      rawGifts = [
        { name: 'Son kem lì Romand màu đỏ đất trendy ngọt ngào', emoji: '💄', category: 'Mỹ phẩm', price: 155000, reason: 'Màu son tôn da, chất son mịn mượt dễ thương.' },
        { name: 'Máy rửa mặt sóng âm silicon làm sạch sâu', emoji: '🧼', category: 'Thiết bị', price: 240000, reason: 'Hỗ trợ skincare hiệu quả cho làn da sạch mịn màng.' },
        { name: 'Túi xách kẹp nách da PU phong cách retro', emoji: '👜', category: 'Thời trang', price: 210000, reason: 'Dễ phối đồ đi học, đi làm hay đi cà phê cuối tuần.' },
        { name: 'Bộ cọ trang điểm cá nhân 13 món siêu mềm mại', emoji: '🖌️', category: 'Dụng cụ', price: 120000, reason: 'Đầy đủ cọ cơ bản giúp trang điểm tự nhiên mỗi ngày.' },
        { name: 'Gương để bàn trang điểm có đèn LED cảm ứng', emoji: '🪞', category: 'Trang trí', price: 180000, reason: 'Hỗ trợ ánh sáng chuẩn khi makeup và decor phòng cực xinh.' },
        { name: 'Lắc tay bạc ý S925 đính đá pha lê nhỏ lấp lánh', emoji: '💫', category: 'Trang sức', price: 280000, reason: 'Món quà trang sức tinh tế tôn lên nét thanh lịch của bạn nữ.' },
      ];
    }
  } else if (interest === 'đọc sách') {
    rawGifts = [
      { name: 'Đèn LED đọc sách kẹp trang sách tiện lợi', emoji: '💡', category: 'Phụ kiện', price: 75000, reason: 'Ánh sáng vàng dịu bảo vệ mắt khi đọc ban đêm không phiền ai.' },
      { name: 'Set Bookmark gỗ sồi khắc họa tiết cổ điển', emoji: '🔖', category: 'Lưu niệm', price: 60000, reason: 'Đánh dấu trang sách tinh tế và có giá trị lưu niệm cao.' },
      { name: 'Cuốn sách bán chạy "Atomic Habits" bản đặc biệt', emoji: '📚', category: 'Sách', price: 125000, reason: 'Cuốn sách truyền cảm hứng thay đổi bản thân thiết thực nhất.' },
      { name: 'Kệ đựng sách mini bằng gỗ tự nhiên để bàn', emoji: '🪵', category: 'Trang trí', price: 135000, reason: 'Giúp sắp xếp bàn làm việc gọn gàng và đẹp mắt hơn.' },
      { name: 'Sổ tay bìa da cao cấp kèm bút ký kim loại', emoji: '✒️', category: 'Văn phòng', price: 190000, reason: 'Ghi lại những ý tưởng hay và kế hoạch cuộc sống hàng ngày.' },
      { name: 'Gối tựa lưng cao su non êm ái hỗ trợ cột sống', emoji: '🛋️', category: 'Sức khỏe', price: 220000, reason: 'Giúp duy trì tư thế ngồi đọc sách thoải mái nhất trong nhiều giờ.' },
    ];
  } else if (interest === 'du lịch' || interest === 'thể thao') {
    rawGifts = [
      { name: 'Bình nước thể thao giữ nhiệt Inox 304 dung tích 1L', emoji: '🥤', category: 'Đồ dùng', price: 250000, reason: 'Dung tích lớn giữ lạnh đến 24h, rất hợp cho người vận động nhiều.' },
      { name: 'Túi đeo bụng thể thao chống nước chạy bộ', emoji: '🏃', category: 'Phụ kiện', price: 95000, reason: 'Gọn gàng để điện thoại, chìa khóa khi chạy bộ hay tập gym.' },
      { name: 'Gối chữ U kê cổ du lịch bằng cao su non êm ái', emoji: '✈️', category: 'Du lịch', price: 160000, reason: 'Nâng đỡ cổ vai gáy tốt trong những chuyến đi xa.' },
      { name: 'Loa bluetooth chống nước IPX7 treo balo', emoji: '🔊', category: 'Công nghệ', price: 340000, reason: 'Khuấy động không khí các buổi dã ngoại ngoài trời cực vui.' },
      { name: 'Balo phượt chống nước dã ngoại nhiều ngăn', emoji: '🎒', category: 'Du lịch', price: 390000, reason: 'Đựng đồ khoa học và chống chịu thời tiết tốt cho chuyến đi.' },
      { name: 'Quạt cầm tay mini tích điện siêu mát', emoji: '🪭', category: 'Đồ dùng', price: 120000, reason: 'Xua tan nắng nóng nhanh chóng khi ra ngoài trời.' },
    ];
  } else if (interest === 'nấu ăn' || isOlder) {
    rawGifts = [
      { name: 'Thớt gỗ Teak decor đồ ăn sang trọng', emoji: '🪵', category: 'Đồ bếp', price: 190000, reason: 'Vừa thái thực phẩm vừa làm khay bày biện món ăn sống ảo cực đẹp.' },
      { name: 'Set trà hoa thảo mộc an thần ngủ ngon', emoji: '🍵', category: 'Sức khỏe', price: 150000, reason: 'Món quà tinh tế thể hiện sự quan tâm sâu sắc đến sức khỏe.' },
      { name: 'Máy đánh trứng, tạo bọt cafe cầm tay mini', emoji: '🥚', category: 'Đồ bếp', price: 120000, reason: 'Hỗ trợ đắc lực làm bánh, pha cafe bọt biển nhanh chóng.' },
      { name: 'Bộ muỗng nĩa dao bằng gỗ sồi cao cấp', emoji: '🍴', category: 'Đồ bếp', price: 95000, reason: 'Chất liệu gỗ an toàn cho sức khỏe và thân thiện tự nhiên.' },
      { name: 'Cốc thủy tinh 2 lớp cách nhiệt chịu nhiệt tốt', emoji: '🥛', category: 'Đồ dùng', price: 85000, reason: 'Thiết kế tinh xảo cầm không bị nóng tay khi đựng trà nóng.' },
      { name: 'Tạp dề canvas dày dặn chống thấm nước', emoji: '🎽', category: 'Đồ dùng', price: 110000, reason: 'Bảo vệ quần áo tối ưu và tạo cảm hứng vào bếp nấu nướng.' },
    ];
  } else {
    // General default dynamic gifts
    rawGifts = [
      { name: 'Nến thơm tinh dầu thiên nhiên dịu nhẹ', emoji: '🕯️', category: 'Trang trí', price: 135000, reason: 'Hương thơm dễ chịu thư giãn đầu óc sau ngày dài làm việc mệt mỏi.' },
      { name: 'Đèn ngủ silicon hình chú vịt phát sáng ấm áp', emoji: '🦆', category: 'Trang trí', price: 160000, reason: 'Ánh sáng vàng dịu ấm áp mang lại giấc ngủ ngon và decor phòng ngủ.' },
      { name: 'Bình giữ nhiệt Lock&Lock LHC4131BKR 450ml', emoji: '🥤', category: 'Đồ dùng', price: 265000, reason: 'Sản phẩm quốc dân chất lượng cao giữ nhiệt nóng lạnh cực tốt.' },
      { name: 'Chậu cây sen đá mini để bàn làm việc', emoji: '🪴', category: 'Cây cảnh', price: 65000, reason: 'Mang sắc xanh dễ chịu tới góc làm việc, dễ chăm sóc không tốn công.' },
      { name: 'Bộ thìa dĩa inox mạ vàng sang trọng', emoji: '🍴', category: 'Quà tặng', price: 120000, reason: 'Món quà lịch sự, thiết thực cho bữa ăn thêm phần sang trọng.' },
      { name: 'Sổ tay Planner 365 ngày thiết lập kế hoạch', emoji: '📓', category: 'Văn phòng', price: 95000, reason: 'Giúp quản lý thời gian hiệu quả và xây dựng thói quen tốt.' },
    ];
  }

  // Adjust reasons based on relationship
  const rel = answers.relationship.toLowerCase();
  const getCustomReason = (gift: typeof rawGifts[0]) => {
    if (rel === 'người yêu') {
      return `Món quà ngọt ngào thay lời muốn nói gửi tới người thương, vừa đáng yêu vừa cực kỳ hữu dụng mỗi ngày.`;
    } else if (rel === 'bố/mẹ') {
      return `Món quà ấm áp gửi tới bố mẹ thể hiện sự hiếu kính và quan tâm chăm sóc của bạn dành cho sức khỏe gia đình.`;
    } else if (rel === 'bạn thân' || rel === 'bạn bè') {
      return `Món quà siêu hợp gu cho đứa bạn thân chí cốt, bảo đảm nó sẽ thích mê và lấy ra khoe ngay lập tức!`;
    } else if (rel === 'sếp' || rel === 'đồng nghiệp') {
      return `Một lựa chọn lịch sự, chỉn chu rất thích hợp làm quà tặng công sở gắn kết tình đồng nghiệp hữu hảo.`;
    }
    return gift.reason;
  };

  // Build final suggestion items
  return rawGifts.map((gift, index) => {
    // Format price range around the base price
    const minPrice = Math.floor(gift.price * 0.9);
    const maxPrice = Math.floor(gift.price * 1.15);
    const priceStr = `${minPrice.toLocaleString('vi-VN')}đ - ${maxPrice.toLocaleString('vi-VN')}đ`;

    return {
      id: `mock_${index + 1}`,
      productName: gift.name,
      reason: getCustomReason(gift),
      estimatedPriceRange: priceStr,
      searchKeyword: gift.name.split(' - ')[0], // short keyword for search
      emoji: gift.emoji,
      category: gift.category,
    };
  });
}

function getMockSuggestions(answers: Partial<QuizAnswers>): GiftSuggestion[] {
  // Ensure default answers if somehow incomplete
  const safeAnswers: QuizAnswers = {
    occasion: answers.occasion || 'Sinh nhật',
    relationship: answers.relationship || 'bạn thân',
    gender: answers.gender || 'nữ',
    ageRange: answers.ageRange || '19-25 tuổi',
    zodiac: answers.zodiac || '',
    personality: answers.personality || ['năng động'],
    interests: answers.interests || ['làm đẹp'],
    budget: answers.budget || '100.000đ - 300.000đ',
  };

  return generateSmartMockSuggestions(safeAnswers);
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';

    if (!getRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau 1 giờ.' },
        { status: 429 }
      );
    }

    const answers: QuizAnswers = await request.json();

    // Validate required fields
    if (!answers.occasion || !answers.relationship || !answers.gender) {
      return NextResponse.json(
        { error: 'Vui lòng hoàn thành tất cả các câu hỏi bắt buộc.' },
        { status: 400 }
      );
    }

    let suggestions: GiftSuggestion[];

    // Try real AI first, fall back to mock
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const { buildGiftPrompt, validateAIResponse } = await import('@/lib/ai/prompt-builder');
        const prompt = buildGiftPrompt(answers);
        const rawSuggestions = await callAnthropicAPI(prompt);
        suggestions = validateAIResponse({ suggestions: rawSuggestions });
      } catch (aiError) {
        console.warn('AI API failed, using mock data:', aiError);
        // Retry once
        try {
          const { buildGiftPrompt, validateAIResponse } = await import('@/lib/ai/prompt-builder');
          const prompt = buildGiftPrompt(answers);
          const rawSuggestions = await callAnthropicAPI(prompt);
          suggestions = validateAIResponse({ suggestions: rawSuggestions });
        } catch {
          suggestions = getMockSuggestions(answers);
        }
      }
    } else {
      // No API key → use realistic mock data
      // Simulate AI delay for realistic UX
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

import { QuizAnswers, GiftSuggestion } from '@/types';

export function buildGiftPrompt(answers: QuizAnswers): string {
  const personalityStr = answers.personality?.join(', ') || 'không xác định';
  const interestsStr = answers.interests?.join(', ') || 'không xác định';
  const zodiacStr = answers.zodiac && answers.zodiac !== 'skip'
    ? answers.zodiac
    : 'không biết';

  return `Bạn là chuyên gia tư vấn quà tặng tại Việt Nam, am hiểu văn hóa tặng quà và xu hướng tiêu dùng hiện tại. Dựa trên thông tin sau về người nhận quà, hãy gợi ý CHÍNH XÁC 6 món quà cụ thể, thực tế, có thể tìm mua trên Shopee hoặc TikTok Shop tại Việt Nam.

Thông tin người nhận:
- Dịp: ${answers.occasion}
- Mối quan hệ với người tặng: ${answers.relationship}
- Giới tính người nhận: ${answers.gender}
- Độ tuổi: ${answers.ageRange}
- Cung hoàng đạo: ${zodiacStr}
- Tính cách nổi bật: ${personalityStr}
- Sở thích: ${interestsStr}
- Ngân sách: ${answers.budget}

Yêu cầu quan trọng:
- Tên sản phẩm phải CỤ THỂ (ví dụ: "bình giữ nhiệt khắc tên 500ml", không viết chung chung)
- Mỗi gợi ý phải có lý do ngắn gọn (1-2 câu) liên hệ tới tính cách/cung hoàng đạo/sở thích, viết tự nhiên như người bạn đang tư vấn
- Giá ước tính phải nằm trong khoảng ngân sách đã cho, tính bằng VNĐ
- KHÔNG bịa link hay tên thương hiệu cụ thể — chỉ gợi ý loại sản phẩm
- Thêm emoji phù hợp cho từng gợi ý
- Thêm category (danh mục) ngắn gọn bằng tiếng Việt

Trả kết quả CHỈ ở dạng JSON hợp lệ, không thêm text nào khác, theo format:
{
  "suggestions": [
    {
      "id": "1",
      "productName": "string",
      "reason": "string",
      "estimatedPriceRange": "string (vd: 150.000đ - 250.000đ)",
      "searchKeyword": "string (từ khóa ngắn để search Shopee/TikTok)",
      "emoji": "string (1 emoji)",
      "category": "string"
    }
  ]
}`;
}

export function validateAIResponse(data: unknown): GiftSuggestion[] {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid AI response format');
  }

  const response = data as Record<string, unknown>;

  if (!Array.isArray(response.suggestions)) {
    throw new Error('Missing suggestions array');
  }

  return response.suggestions.map((item: unknown, index: number) => {
    const s = item as Record<string, unknown>;
    return {
      id: String(s.id || index + 1),
      productName: String(s.productName || ''),
      reason: String(s.reason || ''),
      estimatedPriceRange: String(s.estimatedPriceRange || ''),
      searchKeyword: String(s.searchKeyword || ''),
      emoji: String(s.emoji || '🎁'),
      category: String(s.category || 'Quà tặng'),
    };
  });
}

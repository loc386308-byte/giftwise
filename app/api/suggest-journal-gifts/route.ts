import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/lib/services/aiService';
import { JournalSuggestRequest } from '@/types/journal';

export async function POST(req: NextRequest) {
  try {
    const body: JournalSuggestRequest = await req.json();

    if (!body.person || !body.person.name || !body.occasion) {
      return NextResponse.json({ error: 'Thiếu thông tin người nhận hoặc dịp tặng quà' }, { status: 400 });
    }

    const { suggestions, source } = await AIService.getJournalGiftSuggestions(body);

    if (suggestions.length > 0) {
      return NextResponse.json({ suggestions, source });
    }

    // Fallback: If AI fails or keys quota reached, generate non-duplicate suggestions from master pool
    const pastGiftsLower = (body.person.giftHistory || []).map((g) => g.giftName.toLowerCase().trim());
    
    // Convert person info into QuizAnswers structure for fallback generator
    const fallbackAnswers = {
      occasion: body.occasion,
      relationship: body.person.relationship || 'Bạn bè',
      gender: body.person.gender || 'Khác',
      ageRange: body.person.ageRange || '19-25 tuổi',
      zodiac: body.person.zodiac || '',
      personality: body.person.personality || [],
      interests: body.person.interests || [],
      budget: body.budget || '300.000đ - 1.000.000đ',
      customDescription: body.customNote || body.person.notes || '',
    };

    // We can call fallback suggest and filter out past gifts
    const { suggestions: fallbackAll } = await AIService.getGiftSuggestions(fallbackAnswers);
    const filteredFallback = fallbackAll.filter((item) => {
      const nameL = item.productName.toLowerCase().trim();
      return !pastGiftsLower.some((past) => past.includes(nameL) || nameL.includes(past));
    });

    return NextResponse.json({
      suggestions: filteredFallback.length > 0 ? filteredFallback : fallbackAll,
      source: 'fallback',
    });
  } catch (err) {
    console.error('[Journal Suggest API Error]:', err);
    return NextResponse.json({ error: 'Không thể kết nối AI. Vui lòng thử lại sau.' }, { status: 500 });
  }
}

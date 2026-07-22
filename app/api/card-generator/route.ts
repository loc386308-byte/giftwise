import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/lib/services/aiService';
import { GreetingCardRequest } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body: GreetingCardRequest = await req.json();

    if (!body.giftName || !body.occasion || !body.relationship) {
      return NextResponse.json({ error: 'Thiếu thông tin quà tặng hoặc dịp' }, { status: 400 });
    }

    const result = await AIService.generateGreetingCard(body);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[Card Generator API Error]:', err);
    return NextResponse.json(
      {
        cardText: 'Chúc bạn luôn ngập tràn niềm vui và hạnh phúc! Mong món quà này sẽ mang đến sự bất ngờ đáng nhớ.',
        provider: 'fallback',
      },
      { status: 200 }
    );
  }
}

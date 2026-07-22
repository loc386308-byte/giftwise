import { NextRequest, NextResponse } from 'next/server';
import { FeedbackItem } from '@/types';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { suggestionId, productName, type, note, quizAnswers } = body;

    if (!suggestionId || !productName || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newFeedback: FeedbackItem = {
      id: `fb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      suggestionId,
      productName,
      type: type === 'dislike' ? 'dislike' : 'like',
      note: typeof note === 'string' ? note.trim() : undefined,
      quizAnswers,
      createdAt: new Date().toISOString(),
    };

    // Store in structured JSON data file asynchronously
    const dirPath = path.join(process.cwd(), 'data');
    const filePath = path.join(dirPath, 'feedbacks.json');

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    let list: FeedbackItem[] = [];
    if (fs.existsSync(filePath)) {
      try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        list = JSON.parse(raw);
      } catch {
        list = [];
      }
    }

    list.unshift(newFeedback);
    // Keep max 1000 feedbacks
    if (list.length > 1000) list = list.slice(0, 1000);

    fs.writeFileSync(filePath, JSON.stringify(list, null, 2), 'utf-8');

    return NextResponse.json({ success: true, feedbackId: newFeedback.id });
  } catch (err) {
    console.error('[Feedback API Error]:', err);
    // Non-blocking response
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

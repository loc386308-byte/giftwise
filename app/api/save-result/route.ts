import { NextRequest, NextResponse } from 'next/server';
import { GiftSuggestion, QuizAnswers } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────
export type SavedResult = {
  id: string;
  answers: QuizAnswers;
  suggestions: GiftSuggestion[];
  createdAt: number;
  viewCount: number;
};

// ─── nanoid (short ID generator) ─────────────────────────────────────────────
async function generateId(): Promise<string> {
  const { nanoid } = await import('nanoid');
  return nanoid(8);
}

// ─── Redis helpers (graceful no-op if not configured) ─────────────────────────
async function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    const { Redis } = await import('@upstash/redis');
    return new Redis({ url, token });
  } catch {
    return null;
  }
}

// ─── In-memory fallback (single-server, cleared on restart) ───────────────────
const memStore = new Map<string, SavedResult>();

// ─── POST — save a result ─────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { answers: QuizAnswers; suggestions: GiftSuggestion[] };
    if (!body.answers || !body.suggestions?.length) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    const id = await generateId();
    const result: SavedResult = {
      id,
      answers: body.answers,
      suggestions: body.suggestions,
      createdAt: Date.now(),
      viewCount: 0,
    };

    const redis = await getRedis();
    if (redis) {
      // TTL: 30 days = 2592000 seconds
      await redis.set(`result:${id}`, JSON.stringify(result), { ex: 2592000 });
    } else {
      // Fallback: memory store (dev/preview without Redis)
      memStore.set(id, result);
      // Clean up old entries if store grows large
      if (memStore.size > 1000) {
        const oldest = [...memStore.entries()].sort((a, b) => a[1].createdAt - b[1].createdAt)[0];
        if (oldest) memStore.delete(oldest[0]);
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://giftwise-lhsm.vercel.app';
    const shareUrl = `${baseUrl}/result/${id}`;

    return NextResponse.json({ id, shareUrl });
  } catch (error) {
    console.error('save-result error:', error);
    return NextResponse.json({ error: 'Could not save result' }, { status: 500 });
  }
}

// ─── GET — fetch a result by id ───────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    let result: SavedResult | null = null;

    const redis = await getRedis();
    if (redis) {
      const raw = await redis.get<string>(`result:${id}`);
      if (raw) {
        result = typeof raw === 'string' ? JSON.parse(raw) : raw as SavedResult;
        // Increment view count (fire-and-forget)
        if (result) {
          result.viewCount = (result.viewCount || 0) + 1;
          redis.set(`result:${id}`, JSON.stringify(result), { ex: 2592000 }).catch(() => {});
        }
      }
    } else {
      result = memStore.get(id) ?? null;
      if (result) {
        result.viewCount = (result.viewCount || 0) + 1;
        memStore.set(id, result);
      }
    }

    if (!result) {
      return NextResponse.json({ error: 'Result not found or expired' }, { status: 404 });
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error('get-result error:', error);
    return NextResponse.json({ error: 'Could not fetch result' }, { status: 500 });
  }
}

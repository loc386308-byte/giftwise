import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SavedResult } from '@/app/api/save-result/route';
import { GiftSuggestion } from '@/types';

// ─── Fetch helper ─────────────────────────────────────────────────────────────
async function getResult(id: string): Promise<SavedResult | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://giftwise-lhsm.vercel.app';
    const res = await fetch(`${baseUrl}/api/save-result?id=${id}`, {
      next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.result ?? null;
  } catch {
    return null;
  }
}

// ─── Dynamic metadata ─────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const result = await getResult(id);
  if (!result) {
    return { title: 'Kết quả không tìm thấy — GiftWise' };
  }

  const { occasion, relationship, gender } = result.answers;
  const title = `Gợi ý quà ${occasion ? `dịp ${occasion}` : 'tặng'} cho ${relationship ?? 'người thân'} — GiftWise AI`;
  const description = `AI đã gợi ý ${result.suggestions.length} món quà tặng ${gender ?? ''} dịp ${occasion ?? ''} trong ngân sách của bạn. Xem ngay!`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://giftwise-lhsm.vercel.app/result/${id}`,
      siteName: 'GiftWise',
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

// ─── Gift Card (server-side, no interactivity needed here) ───────────────────
function SharedGiftCard({ gift, index }: { gift: GiftSuggestion; index: number }) {
  const shopeeUrl = `https://shopee.vn/search?keyword=${encodeURIComponent(gift.searchKeyword || gift.productName)}`;

  return (
    <div
      style={{
        background: 'white',
        borderRadius: '20px',
        padding: '1.5rem',
        border: '1px solid #f0ebff',
        boxShadow: '0 2px 16px rgba(168,85,247,0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.875rem',
        animationDelay: `${index * 60}ms`,
      }}
      className="shared-gift-card"
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span
          style={{
            fontSize: '0.65rem',
            fontWeight: 700,
            padding: '0.2rem 0.65rem',
            borderRadius: '999px',
            background: 'linear-gradient(135deg,#f3e8ff,#ede9fe)',
            color: '#7c3aed',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          {gift.category}
        </span>
        <span style={{ fontSize: '1.75rem' }}>{gift.emoji}</span>
      </div>

      {/* Name */}
      <h3
        style={{
          fontSize: '0.95rem',
          fontWeight: 700,
          color: '#1a1a2e',
          lineHeight: 1.45,
          margin: 0,
          letterSpacing: '-0.01em',
        }}
      >
        {gift.productName}
      </h3>

      {/* AI Reason */}
      <div
        style={{
          background: 'linear-gradient(135deg,#fdf8ff,#f0f9ff)',
          borderRadius: '12px',
          padding: '0.75rem 1rem',
          borderLeft: '3px solid #a855f7',
        }}
      >
        <div
          style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            color: '#a855f7',
            marginBottom: '0.3rem',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          🤖 AI giải thích
        </div>
        <p
          style={{
            fontSize: '0.82rem',
            color: '#4b5563',
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {gift.reason}
        </p>
      </div>

      {/* Price */}
      <div
        style={{
          fontWeight: 800,
          fontSize: '0.95rem',
          background: 'linear-gradient(90deg,#ec4899,#a855f7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        💰 {gift.estimatedPriceRange}
      </div>

      {/* CTA */}
      <a
        href={shopeeUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem',
          padding: '0.625rem 1rem',
          borderRadius: '999px',
          background: 'linear-gradient(135deg,#ee0979,#ff6a00)',
          color: 'white',
          fontWeight: 700,
          fontSize: '0.8rem',
          textDecoration: 'none',
          transition: 'opacity 0.15s',
        }}
      >
        🛒 Tìm mua trên Shopee
      </a>
    </div>
  );
}

// ─── Shared Result Page ───────────────────────────────────────────────────────
export default async function SharedResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getResult(id);

  if (!result) notFound();

  const { answers, suggestions, viewCount } = result;
  const occasionLabel = answers.occasion ?? 'đặc biệt';
  const relLabel = answers.relationship ?? 'người thân';
  const genderLabel = answers.gender ? `${answers.gender === 'nữ' ? '👩' : answers.gender === 'nam' ? '👨' : '🌈'} ${answers.gender}` : '';

  return (
    <>
      <style>{`
        .shared-gift-card {
          animation: fadeUp 0.4s ease both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .gift-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.25rem;
        }
        @media (max-width: 600px) {
          .gift-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Hero banner */}
      <div
        style={{
          background: 'linear-gradient(135deg,#FFF1F8 0%,#EDE9FE 50%,#EFF6FF 100%)',
          padding: '3.5rem 1.5rem 2.5rem',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎁</div>

        <h1
          style={{
            fontSize: 'clamp(1.5rem, 5vw, 2.25rem)',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            marginBottom: '0.75rem',
            lineHeight: 1.25,
            color: '#1a1a2e',
          }}
        >
          AI gợi ý{' '}
          <span
            style={{
              background: 'linear-gradient(90deg,#ec4899,#a855f7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {suggestions.length} món quà
          </span>{' '}
          dịp {occasionLabel}
        </h1>

        <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
          Được cá nhân hóa cho {relLabel} {genderLabel}
          {answers.budget && ` · Ngân sách ${answers.budget}`}
        </p>

        {/* Profile chips */}
        <div
          style={{
            display: 'inline-flex',
            flexWrap: 'wrap',
            gap: '0.375rem',
            justifyContent: 'center',
            marginBottom: '1.5rem',
          }}
        >
          {[
            answers.occasion && `🎉 ${answers.occasion}`,
            answers.zodiac && answers.zodiac !== 'skip' && `⭐ ${answers.zodiac}`,
            ...(answers.personality ?? []).slice(0, 2).map((p) => `✨ ${p}`),
            ...(answers.interests ?? []).slice(0, 2).map((i) => `🎯 ${i}`),
          ]
            .filter(Boolean)
            .map((tag, i) => (
              <span
                key={i}
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  padding: '0.25rem 0.75rem',
                  borderRadius: '999px',
                  background: 'rgba(168,85,247,0.1)',
                  color: '#7c3aed',
                  border: '1px solid rgba(168,85,247,0.2)',
                }}
              >
                {tag}
              </span>
            ))}
        </div>

        {/* View count */}
        {viewCount > 1 && (
          <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
            👀 {viewCount} lượt xem
          </p>
        )}
      </div>

      {/* Gift grid */}
      <div style={{ padding: '2rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
        <div className="gift-grid">
          {suggestions.map((gift, i) => (
            <SharedGiftCard key={gift.id || i} gift={gift} index={i} />
          ))}
        </div>

        {/* Viral CTA */}
        <div
          style={{
            marginTop: '3rem',
            padding: '2.5rem 1.5rem',
            borderRadius: '24px',
            background: 'linear-gradient(135deg,#FFF1F8,#EDE9FE,#EFF6FF)',
            border: '1px solid #e9d5ff',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🤖</div>
          <h2
            style={{
              fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              marginBottom: '0.5rem',
              color: '#1a1a2e',
            }}
          >
            Bạn cũng muốn gợi ý quà như thế này?
          </h2>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            GiftWise AI phân tích cung hoàng đạo, tính cách và sở thích để gợi ý quà chính xác nhất.
            Hoàn toàn miễn phí!
          </p>
          <Link
            href="/quiz"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.875rem 2rem',
              borderRadius: '999px',
              background: 'linear-gradient(135deg,#ec4899,#a855f7)',
              color: 'white',
              fontWeight: 800,
              fontSize: '1rem',
              textDecoration: 'none',
              boxShadow: '0 4px 20px rgba(168,85,247,0.35)',
              letterSpacing: '-0.01em',
            }}
          >
            🎁 Bắt đầu gợi ý quà miễn phí →
          </Link>
          <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.75rem' }}>
            Mất khoảng 2 phút · Không cần đăng ký
          </p>
        </div>
      </div>
    </>
  );
}

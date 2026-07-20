'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuizStore } from '@/lib/store/quizStore';
import { GiftSuggestion } from '@/types';
import Header from '@/components/layout/Header';

// ─── AI Insight expanded card ─────────────────────────────────────────────────
function GiftCard({
  gift,
  index,
  isSelected,
  onBuy,
}: {
  gift: GiftSuggestion;
  index: number;
  isSelected: boolean;
  onBuy: (gift: GiftSuggestion, dest: 'online' | 'offline') => void;
}) {
  const [insightOpen, setInsightOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className="card"
      style={{
        padding: '1.5rem',
        position: 'relative',
        border: isSelected
          ? '2px solid var(--color-accent-1)'
          : '1px solid var(--color-border-light)',
        background: isSelected
          ? 'linear-gradient(135deg, #FFF1F8, #F5F3FF)'
          : 'white',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}
    >
      {/* Top row: category + selected badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>
          {gift.category}
        </span>
        {isSelected && (
          <span
            className="badge"
            style={{ background: 'var(--gradient-main)', color: 'white', fontSize: '0.65rem' }}
          >
            ✓ Đang chọn
          </span>
        )}
      </div>

      {/* Emoji + Name */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <span style={{ fontSize: '2.5rem', lineHeight: 1, flexShrink: 0 }}>{gift.emoji}</span>
        <h3
          style={{
            fontSize: '0.975rem',
            fontWeight: 700,
            color: 'var(--color-text)',
            lineHeight: 1.4,
            letterSpacing: '-0.01em',
          }}
        >
          {gift.productName}
        </h3>
      </div>

      {/* Price */}
      <p
        style={{
          fontWeight: 800,
          fontSize: '0.95rem',
          background: 'var(--gradient-main)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        💰 {gift.estimatedPriceRange}
      </p>

      {/* AI Insight toggle */}
      <button
        onClick={() => setInsightOpen((o) => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          padding: '0.45rem 0.875rem',
          borderRadius: '999px',
          border: '1.5px solid',
          borderColor: insightOpen ? '#a855f7' : '#e9d5ff',
          background: insightOpen
            ? 'linear-gradient(135deg,#fdf4ff,#ede9fe)'
            : 'rgba(168,85,247,0.05)',
          cursor: 'pointer',
          fontFamily: 'inherit',
          fontSize: '0.75rem',
          fontWeight: 700,
          color: '#7c3aed',
          transition: 'all 0.18s ease',
          width: 'fit-content',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            transition: 'transform 0.2s',
            transform: insightOpen ? 'rotate(90deg)' : 'rotate(0deg)',
          }}
        >
          ▶
        </span>
        🤖 AI giải thích lý do
      </button>

      {/* Expandable AI Insight */}
      <AnimatePresence>
        {insightOpen && (
          <motion.div
            key="insight"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div
              style={{
                background: 'linear-gradient(135deg,#fdf8ff,#f0f9ff)',
                borderRadius: '14px',
                padding: '1rem',
                borderLeft: '3px solid #a855f7',
              }}
            >
              <div
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: '#a855f7',
                  marginBottom: '0.4rem',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                💡 Tại sao phù hợp?
              </div>
              <p
                style={{
                  fontSize: '0.83rem',
                  color: '#374151',
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                {gift.reason}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Buy buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: 'auto' }}>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => onBuy(gift, 'online')}
          className="btn-primary"
          style={{
            flex: '1 1 120px',
            justifyContent: 'center',
            padding: '0.5rem 0.875rem',
            fontSize: '0.8rem',
            fontFamily: 'inherit',
          }}
        >
          🛒 Mua Online
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => onBuy(gift, 'offline')}
          className="btn-secondary"
          style={{
            flex: '1 1 120px',
            justifyContent: 'center',
            padding: '0.5rem 0.875rem',
            fontSize: '0.8rem',
            fontFamily: 'inherit',
          }}
        >
          📍 Cửa hàng
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.25rem',
      }}
    >
      {[...Array(6)].map((_, i) => (
        <div key={i} className="card" style={{ padding: '1.5rem' }}>
          <div className="skeleton" style={{ width: '80px', height: '20px', marginBottom: '0.75rem' }} />
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: '12px' }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ width: '100%', height: '14px', marginBottom: '6px' }} />
              <div className="skeleton" style={{ width: '70%', height: '14px' }} />
            </div>
          </div>
          <div className="skeleton" style={{ width: '100%', height: '60px', marginBottom: '1rem' }} />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div className="skeleton" style={{ flex: 1, height: '36px', borderRadius: '999px' }} />
            <div className="skeleton" style={{ flex: 1, height: '36px', borderRadius: '999px' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Toast states ─────────────────────────────────────────────────────────────
type ShareState = 'idle' | 'saving' | 'copied' | 'shared' | 'error';

// ─── Results page ─────────────────────────────────────────────────────────────
export default function ResultsPage() {
  const router = useRouter();
  const { suggestions, isLoadingAI, aiError, isComplete, selectGift, reset, answers } =
    useQuizStore();
  const [selectedGiftId, setSelectedGiftId] = useState<string | null>(null);
  const [shareState, setShareState] = useState<ShareState>('idle');
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  // Auto-save once suggestions are ready
  const hasSaved = useRef(false);
  useEffect(() => {
    if (!isComplete || isLoadingAI || suggestions.length === 0 || hasSaved.current) return;
    hasSaved.current = true;

    (async () => {
      try {
        const res = await fetch('/api/save-result', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers, suggestions }),
        });
        if (res.ok) {
          const data = await res.json();
          setShareUrl(data.shareUrl);
        }
      } catch {
        // silent — sharing still works via generic link
      }
    })();
  }, [isComplete, isLoadingAI, suggestions, answers]);

  const handleShare = useCallback(async () => {
    const url = shareUrl ?? 'https://giftwise-lhsm.vercel.app/quiz';
    const text = shareUrl
      ? `AI gợi ý quà tặng cá nhân hóa cho tôi — xem tại đây! 🎁`
      : `Tôi vừa dùng GiftWise để tìm quà tặng bằng AI! Thử ngay →`;

    setShareState('saving');

    if (navigator.share) {
      try {
        await navigator.share({ title: 'GiftWise — AI gợi ý quà tặng', text, url });
        setShareState('shared');
      } catch {
        setShareState('idle');
        return;
      }
    } else {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setShareState('copied');
    }
    setTimeout(() => setShareState('idle'), 3000);
  }, [shareUrl]);

  useEffect(() => {
    if (!isComplete) router.replace('/quiz');
  }, [isComplete, router]);

  const handleBuy = (gift: GiftSuggestion, destination: 'online' | 'offline') => {
    selectGift(gift);
    setSelectedGiftId(gift.id);
    const exactKeyword = gift.searchKeyword || gift.productName;
    router.push(
      `/results/${destination}?keyword=${encodeURIComponent(exactKeyword)}&gift=${encodeURIComponent(gift.productName)}`
    );
  };

  if (!isComplete) return null;

  const shareBtnLabel =
    shareState === 'saving'
      ? '⏳ Đang tạo link...'
      : shareState === 'copied'
      ? '✅ Đã sao chép link!'
      : shareState === 'shared'
      ? '✅ Đã chia sẻ!'
      : shareState === 'error'
      ? '⚠️ Thử lại'
      : shareUrl
      ? '🔗 Chia sẻ kết quả cá nhân'
      : '🔗 Chia sẻ kết quả';

  return (
    <>
      <Header />
      <main style={{ paddingTop: '60px', minHeight: '100dvh', background: 'var(--color-bg)' }}>
        {/* Hero */}
        <div
          style={{
            background: 'linear-gradient(135deg, #FFF1F8 0%, #F5F3FF 100%)',
            padding: '3rem 1.5rem 2rem',
            textAlign: 'center',
          }}
        >
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {isLoadingAI ? (
              <>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    style={{ display: 'inline-block' }}
                  >
                    🤖
                  </motion.span>
                </div>
                <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, marginBottom: '0.5rem' }}>
                  AI đang phân tích...
                </h1>
                <p style={{ color: 'var(--color-text-muted)' }}>Đang cá nhân hóa gợi ý quà cho bạn ✨</p>
              </>
            ) : aiError ? (
              <>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😅</div>
                <h1
                  style={{
                    fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                    fontWeight: 800,
                    marginBottom: '0.5rem',
                    color: '#EF4444',
                  }}
                >
                  Có lỗi xảy ra
                </h1>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>{aiError}</p>
                <button onClick={() => reset()} className="btn-primary">
                  Thử lại từ đầu
                </button>
              </>
            ) : (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' as const, stiffness: 200, damping: 15 }}
                  style={{ fontSize: '3.5rem', marginBottom: '1rem' }}
                >
                  🎁
                </motion.div>
                <h1
                  style={{
                    fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
                    fontWeight: 900,
                    marginBottom: '0.625rem',
                    letterSpacing: '-0.02em',
                  }}
                >
                  AI đã gợi ý{' '}
                  <span className="gradient-text">{suggestions.length} món quà</span> cho bạn!
                </h1>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                  Phân tích từ{' '}
                  {[
                    answers?.zodiac && answers.zodiac !== 'skip' && 'cung hoàng đạo',
                    (answers?.personality?.length ?? 0) > 0 && 'tính cách',
                    (answers?.interests?.length ?? 0) > 0 && 'sở thích',
                    'ngân sách',
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
                {answers && (
                  <div
                    style={{
                      display: 'inline-flex',
                      flexWrap: 'wrap',
                      gap: '0.375rem',
                      justifyContent: 'center',
                      marginTop: '0.25rem',
                    }}
                  >
                    {[
                      answers.occasion && `🎉 ${answers.occasion}`,
                      answers.relationship && `👤 ${answers.relationship}`,
                      answers.gender &&
                        `${answers.gender === 'nữ' ? '👩' : answers.gender === 'nam' ? '👨' : '🌈'} ${answers.gender}`,
                      answers.ageRange && `🎂 ${answers.ageRange}`,
                      answers.zodiac && answers.zodiac !== 'skip' && `⭐ ${answers.zodiac}`,
                      answers.budget && `💰 ${answers.budget}`,
                    ]
                      .filter(Boolean)
                      .map((tag, i) => (
                        <span
                          key={i}
                          className="chip selected"
                          style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem' }}
                        >
                          {tag}
                        </span>
                      ))}
                    {(answers.personality || []).slice(0, 2).map((p, i) => (
                      <span
                        key={`p${i}`}
                        className="chip"
                        style={{
                          fontSize: '0.7rem',
                          padding: '0.2rem 0.6rem',
                          background: '#ede9fe',
                          color: '#7c3aed',
                          border: '1px solid #c4b5fd',
                        }}
                      >
                        ✨ {p}
                      </span>
                    ))}
                    {(answers.interests || []).slice(0, 2).map((interest, i) => (
                      <span
                        key={`i${i}`}
                        className="chip"
                        style={{
                          fontSize: '0.7rem',
                          padding: '0.2rem 0.6rem',
                          background: '#fdf0ff',
                          color: '#a21caf',
                          border: '1px solid #e879f9',
                        }}
                      >
                        🎯 {interest}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>

        {/* Gift grid */}
        <div style={{ padding: '2rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
          {isLoadingAI ? (
            <LoadingSkeleton />
          ) : aiError ? null : suggestions.length > 0 ? (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '1.25rem',
                  marginBottom: '2rem',
                }}
              >
                <AnimatePresence>
                  {suggestions.map((gift, index) => (
                    <GiftCard
                      key={gift.id}
                      gift={gift}
                      index={index}
                      isSelected={selectedGiftId === gift.id}
                      onBuy={handleBuy}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {/* Action bar */}
              <div
                style={{
                  textAlign: 'center',
                  paddingBottom: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                {/* Share section */}
                <div
                  style={{
                    background: 'linear-gradient(135deg,#fdf4ff,#ede9fe)',
                    border: '1px solid #e9d5ff',
                    borderRadius: '20px',
                    padding: '1.25rem 1.75rem',
                    maxWidth: '420px',
                    width: '100%',
                  }}
                >
                  <p
                    style={{
                      fontSize: '0.82rem',
                      color: '#6b7280',
                      marginBottom: '0.875rem',
                      lineHeight: 1.5,
                    }}
                  >
                    📤 Chia sẻ kết quả để bạn bè hoặc người thân biết bạn muốn nhận quà gì!
                  </p>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleShare}
                    disabled={shareState === 'saving'}
                    className="btn-primary"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.9rem',
                      padding: '0.7rem 1.75rem',
                      width: '100%',
                      justifyContent: 'center',
                      opacity: shareState === 'saving' ? 0.7 : 1,
                    }}
                  >
                    {shareBtnLabel}
                  </motion.button>

                  {/* Show the link for easy copying */}
                  {shareUrl && shareState === 'idle' && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        fontSize: '0.72rem',
                        color: '#9ca3af',
                        marginTop: '0.5rem',
                        wordBreak: 'break-all',
                        fontFamily: 'monospace',
                      }}
                    >
                      {shareUrl}
                    </motion.p>
                  )}
                </div>

                <button
                  onClick={() => reset()}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-light)',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontFamily: 'inherit',
                  }}
                >
                  🔄 Làm lại quiz để thay đổi tiêu chí
                </button>
              </div>
            </>
          ) : null}
        </div>
      </main>
    </>
  );
}

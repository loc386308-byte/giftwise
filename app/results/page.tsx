'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuizStore } from '@/lib/store/quizStore';
import { GiftSuggestion } from '@/types';
import Header from '@/components/layout/Header';
import GiftRoulette from '@/components/GiftRoulette';
import GiftFeedback from '@/components/GiftFeedback';
import GreetingCardModal from '@/components/GreetingCardModal';

// ─── AI Insight expanded card ─────────────────────────────────────────────────
function GiftCard({
  gift,
  index,
  isSelected,
  onBuy,
  onOpenCard,
}: {
  gift: GiftSuggestion;
  index: number;
  isSelected: boolean;
  onBuy: (gift: GiftSuggestion, dest: 'online' | 'offline') => void;
  onOpenCard: (gift: GiftSuggestion) => void;
}) {
  const [insightOpen, setInsightOpen] = useState(false);
  const { answers } = useQuizStore();

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
          ? '1.5px solid rgba(212,168,232,0.6)'
          : '1px solid rgba(201,187,232,0.15)',
        background: isSelected
          ? 'linear-gradient(135deg, rgba(212,168,232,0.18), rgba(155,181,232,0.12))'
          : 'rgba(255,255,255,0.06)',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        boxShadow: isSelected
          ? '0 0 20px rgba(212,168,232,0.2), var(--shadow-card)'
          : 'var(--shadow-card)',
      }}
    >
      {/* Top row: category + selected badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="badge badge-primary" style={{ fontSize: 'var(--text-xs)', fontFamily: "'Nunito',sans-serif" }}>
          {gift.category}
        </span>
        {isSelected && (
          <span
            className="badge"
            style={{ background: 'linear-gradient(135deg,rgba(212,168,232,0.35),rgba(155,181,232,0.3))', color: 'var(--cream)', fontSize: 'var(--text-xs)', border: '1px solid rgba(212,168,232,0.4)' }}
          >
            ✓ Đang chọn
          </span>
        )}
      </div>

      {/* Emoji + Name */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <span style={{ fontSize: '2.25rem', lineHeight: 1, flexShrink: 0 }}>{gift.emoji}</span>
        <h3
          style={{
            fontSize: 'var(--text-base)',
            fontFamily: "'Nunito',sans-serif",
            fontWeight: 700,
            color: 'var(--cream)',
            lineHeight: 1.45,
            letterSpacing: 'var(--ls-normal)',
          }}
        >
          {gift.productName}
        </h3>
      </div>

      {/* Price */}
      <p
        style={{
          fontFamily: "'Nunito',sans-serif",
          fontWeight: 700,
          fontSize: 'var(--text-sm)',
          background: 'linear-gradient(135deg, #d4a8e8, #9bb5e8)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        💰 {gift.estimatedPriceRange}
      </p>

      {/* Action buttons row: AI Insight + Card Generator */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setInsightOpen((o) => !o)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.35rem 0.75rem',
            borderRadius: '999px',
            border: '1px solid',
            borderColor: insightOpen ? 'rgba(212,168,232,0.5)' : 'rgba(201,187,232,0.2)',
            background: insightOpen ? 'rgba(212,168,232,0.15)' : 'rgba(255,255,255,0.05)',
            cursor: 'pointer',
            fontFamily: "'Nunito',sans-serif",
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            color: 'var(--lavender-light)',
            transition: 'all 0.18s ease',
          }}
        >
          <span>🤖 Lý do chọn</span>
        </button>

        <button
          onClick={() => onOpenCard(gift)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.35rem 0.75rem',
            borderRadius: '999px',
            border: '1px solid rgba(242,196,208,0.4)',
            background: 'rgba(242,196,208,0.15)',
            cursor: 'pointer',
            fontFamily: "'Nunito',sans-serif",
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            color: '#f2c4d0',
            transition: 'all 0.18s ease',
          }}
        >
          <span>💌 Tạo thiệp chúc</span>
        </button>
      </div>

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
                background: 'rgba(212,168,232,0.1)',
                borderRadius: '14px',
                padding: '1rem',
                borderLeft: '3px solid rgba(212,168,232,0.5)',
              }}
            >
              <div
                style={{
                  fontSize: 'var(--text-xs)',
                  fontFamily: "'Nunito',sans-serif",
                  fontWeight: 700,
                  color: 'var(--lavender-light)',
                  marginBottom: '0.4rem',
                  letterSpacing: 'var(--ls-wide)',
                  textTransform: 'uppercase',
                }}
              >
                💡 Tại sao phù hợp?
              </div>
              <p
                style={{
                  fontSize: 'var(--text-sm)',
                  fontFamily: "'Nunito Sans','Nunito',sans-serif",
                  color: 'var(--lavender-pale)',
                  lineHeight: 'var(--lh-relaxed)',
                  margin: 0,
                  fontWeight: 400,
                }}
              >
                {gift.reason}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback Widget */}
      <GiftFeedback suggestionId={gift.id} productName={gift.productName} quizAnswers={answers} />

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
            fontSize: 'var(--text-sm)',
            fontFamily: "'Nunito',sans-serif",
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
            fontSize: 'var(--text-sm)',
            fontFamily: "'Nunito',sans-serif",
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

export default function ResultsPage() {
  const router = useRouter();
  const { suggestions, isLoadingAI, aiError, isComplete, selectGift, reset, answers } =
    useQuizStore();
  const [selectedGiftId, setSelectedGiftId] = useState<string | null>(null);
  const [activeCardGift, setActiveCardGift] = useState<GiftSuggestion | null>(null);

  useEffect(() => {
    if (!isComplete) router.replace('/quiz');
  }, [isComplete, router]);

  const handleBuy = (gift: GiftSuggestion, destination: 'online' | 'offline') => {
    selectGift(gift);
    setSelectedGiftId(gift.id);
    const exactKeyword = gift.searchKeyword || gift.productName;
    router.push(
      `/results/${destination}?keyword=${encodeURIComponent(exactKeyword)}&gift=${encodeURIComponent(gift.productName)}&price=${encodeURIComponent(gift.estimatedPriceRange)}`
    );
  };

  if (!isComplete) return null;



  return (
    <>
      <Header />
      <main style={{ paddingTop: '60px', minHeight: '100dvh', background: 'var(--color-bg)' }}>
        {/* Hero */}
        <div
          style={{
            background: 'rgba(26,21,53,0.7)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(201,187,232,0.15)',
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
                <h1 style={{
                  fontFamily: "'Comfortaa','Nunito',sans-serif",
                  fontSize: 'clamp(1.4rem, 4vw, 1.875rem)',
                  fontWeight: 700,
                  marginBottom: '0.5rem',
                  color: 'var(--cream)',
                }}>
                  AI đang phân tích...
                </h1>
                <p style={{ fontFamily: "'Nunito',sans-serif", color: 'var(--color-text-muted)', fontSize: 'var(--text-base)' }}>Đang cá nhân hóa gợi ý quà cho bạn ✨</p>
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
                    fontFamily: "'Comfortaa','Nunito',sans-serif",
                    fontSize: 'clamp(1.4rem, 4vw, 2.1rem)',
                    fontWeight: 700,
                    marginBottom: '0.625rem',
                    color: 'var(--cream)',
                    letterSpacing: 'var(--ls-normal)',
                    lineHeight: 'var(--lh-snug)',
                  }}
                >
                  AI đã gợi ý{' '}
                  <span className="gradient-text">{suggestions.length} món quà</span> cho bạn!
                </h1>
                <p style={{ fontFamily: "'Nunito',sans-serif", color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginBottom: '0.75rem' }}>
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
                          style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', fontFamily: "'Nunito',sans-serif" }}
                        >
                          {tag}
                        </span>
                      ))}
                    {(answers.personality || []).slice(0, 2).map((p, i) => (
                      <span
                        key={`p${i}`}
                        className="chip"
                        style={{
                          fontSize: 'var(--text-xs)',
                          padding: '0.2rem 0.65rem',
                          background: 'rgba(212,168,232,0.15)',
                          color: 'var(--lavender-light)',
                          border: '1px solid rgba(212,168,232,0.25)',
                          fontFamily: "'Nunito',sans-serif",
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
                          fontSize: 'var(--text-xs)',
                          padding: '0.2rem 0.65rem',
                          background: 'rgba(155,181,232,0.15)',
                          color: 'var(--periwinkle)',
                          border: '1px solid rgba(155,181,232,0.25)',
                          fontFamily: "'Nunito',sans-serif",
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
          ) : aiError || suggestions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '24px', border: '1px solid rgba(201,187,232,0.2)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😿</div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--cream)', marginBottom: '0.5rem' }}>
                {aiError || 'Chưa tìm thấy gợi ý phù hợp.'}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--lavender-light)', marginBottom: '1.5rem' }}>
                Vui lòng thử lại hoặc thay đổi tiêu chí chọn quà.
              </p>
              <button
                onClick={() => router.push('/quiz')}
                className="btn-primary"
                style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}
              >
                🔄 Thay đổi tiêu chí Quiz
              </button>
            </div>
          ) : (
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
                      onOpenCard={(g) => setActiveCardGift(g)}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {/* Gift Roulette */}
              <GiftRoulette gifts={suggestions} onSelect={handleBuy} />

              {/* Action bar */}
              <div
                style={{
                  textAlign: 'center',
                  paddingTop: '1rem',
                  paddingBottom: '2.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <button
                  onClick={() => reset()}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-light)',
                    fontSize: 'var(--text-sm)',
                    fontFamily: "'Nunito',sans-serif",
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    textUnderlineOffset: '3px',
                  }}
                >
                  🔄 Làm lại quiz để thay đổi tiêu chí
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Greeting Card Modal */}
      {activeCardGift && (
        <GreetingCardModal
          gift={activeCardGift}
          answers={answers}
          onClose={() => setActiveCardGift(null)}
        />
      )}
    </>
  );
}

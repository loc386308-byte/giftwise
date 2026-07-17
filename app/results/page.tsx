'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuizStore } from '@/lib/store/quizStore';
import { GiftSuggestion } from '@/types';
import Header from '@/components/layout/Header';

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
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="card"
      style={{
        padding: '1.5rem',
        position: 'relative',
        border: isSelected ? '2px solid var(--color-accent-1)' : '1px solid var(--color-border-light)',
        background: isSelected ? 'linear-gradient(135deg, #FFF1F8, #F5F3FF)' : 'white',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Category badge */}
      <div style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>
          {gift.category}
        </span>
        {isSelected && (
          <span className="badge" style={{ background: 'var(--gradient-main)', color: 'white', fontSize: '0.65rem' }}>
            ✓ Đang chọn
          </span>
        )}
      </div>

      {/* Emoji + Name */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
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

      {/* Reason */}
      <p
        style={{
          fontSize: '0.85rem',
          color: 'var(--color-text-muted)',
          lineHeight: 1.6,
          marginBottom: '1rem',
          borderLeft: '3px solid var(--color-accent-1)',
          paddingLeft: '0.75rem',
          fontStyle: 'italic',
        }}
      >
        {gift.reason}
      </p>

      {/* Price */}
      <p
        style={{
          fontWeight: 700,
          fontSize: '0.9rem',
          background: 'var(--gradient-main)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '1rem',
        }}
      >
        💰 {gift.estimatedPriceRange}
      </p>

      {/* Buy buttons directly on each card */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
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
  const { suggestions, isLoadingAI, aiError, isComplete, selectGift, reset, answers } = useQuizStore();
  const [selectedGiftId, setSelectedGiftId] = useState<string | null>(null);

  useEffect(() => {
    if (!isComplete) {
      router.replace('/quiz');
    }
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

  return (
    <>
      <Header />
      <main style={{ paddingTop: '60px', minHeight: '100dvh', background: 'var(--color-bg)' }}>
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
                <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, marginBottom: '0.5rem', color: '#EF4444' }}>
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
                  AI đã gợi ý <span className="gradient-text">{suggestions.length} món quà</span> cho bạn!
                </h1>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
                  Bấm <strong>🛒 Mua Online</strong> hoặc <strong>📍 Cửa hàng</strong> trực tiếp trên từng món quà để tìm ngay
                </p>
                {answers && (
                  <div
                    style={{
                      display: 'inline-flex',
                      flexWrap: 'wrap',
                      gap: '0.375rem',
                      justifyContent: 'center',
                      marginTop: '0.875rem',
                    }}
                  >
                    {[answers.occasion, answers.relationship, answers.gender, answers.ageRange, answers.budget]
                      .filter(Boolean)
                      .map((tag, i) => (
                        <span key={i} className="chip selected" style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem' }}>
                          {tag}
                        </span>
                      ))}
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>

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
              <div style={{ textAlign: 'center', paddingBottom: '2rem' }}>
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

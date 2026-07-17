'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuizStore } from '@/lib/store/quizStore';
import { GiftSuggestion } from '@/types';
import Header from '@/components/layout/Header';

function GiftCard({
  gift,
  index,
  onSelect,
}: {
  gift: GiftSuggestion;
  index: number;
  onSelect: (gift: GiftSuggestion) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="card"
      style={{ padding: '1.5rem', cursor: 'pointer', position: 'relative' }}
      onClick={() => onSelect(gift)}
    >
      {/* Category badge */}
      <div style={{ marginBottom: '0.75rem' }}>
        <span
          className="badge badge-primary"
          style={{ fontSize: '0.65rem' }}
        >
          {gift.category}
        </span>
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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontWeight: 700,
            fontSize: '0.9rem',
            background: 'var(--gradient-main)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          💰 {gift.estimatedPriceRange}
        </span>
        <span
          style={{
            fontSize: '0.75rem',
            color: 'var(--color-text-light)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          Chọn →
        </span>
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
          <div className="skeleton" style={{ width: '50%', height: '20px' }} />
        </div>
      ))}
    </div>
  );
}

export default function ResultsPage() {
  const router = useRouter();
  const { suggestions, isLoadingAI, aiError, isComplete, selectGift, reset } = useQuizStore();

  // Redirect if quiz not completed
  useEffect(() => {
    if (!isComplete) {
      router.replace('/quiz');
    }
  }, [isComplete, router]);

  const handleSelectGift = (gift: GiftSuggestion, destination: 'online' | 'offline') => {
    selectGift(gift);
    router.push(`/results/${destination}?keyword=${encodeURIComponent(gift.searchKeyword)}&gift=${encodeURIComponent(gift.productName)}`);
  };

  if (!isComplete) return null;

  return (
    <>
      <Header />

      <main style={{ paddingTop: '60px', minHeight: '100dvh', background: 'var(--color-bg)' }}>
        {/* Header section */}
        <div
          style={{
            background: 'linear-gradient(135deg, #FFF1F8 0%, #F5F3FF 100%)',
            padding: '3rem 1.5rem 2rem',
            textAlign: 'center',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
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
                <p style={{ color: 'var(--color-text-muted)' }}>
                  Đang cá nhân hóa gợi ý quà cho bạn ✨
                </p>
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
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
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
                  <span className="gradient-text">{suggestions.length} món quà</span>{' '}
                  cho bạn!
                </h1>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
                  Chọn món quà bạn thích → tìm nơi mua ngay
                </p>
              </>
            )}
          </motion.div>
        </div>

        {/* Suggestions Grid */}
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
                  marginBottom: '3rem',
                }}
              >
                <AnimatePresence>
                  {suggestions.map((gift, index) => (
                    <GiftCard
                      key={gift.id}
                      gift={gift}
                      index={index}
                      onSelect={() => {}}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {/* CTA Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <div
                  style={{
                    background: 'white',
                    borderRadius: '28px',
                    padding: '2rem',
                    boxShadow: 'var(--shadow-lg)',
                    border: '1px solid var(--color-border-light)',
                    textAlign: 'center',
                  }}
                >
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                    Bạn muốn mua ở đâu? 🛍️
                  </h2>
                  <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    Chọn một gợi ý bên trên rồi bấm nút bên dưới để tìm nơi mua
                  </p>

                  {/* Select a gift first — then choose destination */}
                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.75rem', color: 'var(--color-text-muted)' }}>
                      Hoặc tìm với gợi ý đầu tiên:
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleSelectGift(suggestions[0], 'online')}
                        className="btn-primary"
                        style={{ flex: '1 1 200px', maxWidth: '260px', justifyContent: 'center', fontSize: '1rem' }}
                      >
                        🛒 Mua Online
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleSelectGift(suggestions[0], 'offline')}
                        className="btn-secondary"
                        style={{ flex: '1 1 200px', maxWidth: '260px', justifyContent: 'center', fontSize: '1rem' }}
                      >
                        📍 Tìm cửa hàng gần đây
                      </motion.button>
                    </div>
                  </div>

                  <button
                    onClick={() => reset()}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-text-light)',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      fontFamily: 'inherit',
                      marginTop: '0.5rem',
                    }}
                  >
                    Làm lại quiz
                  </button>
                </div>
              </motion.div>
            </>
          ) : null}
        </div>

        {/* Gift selection overlay — shows buy buttons on each card hover */}
        <style>{`
          .card:hover .buy-overlay { opacity: 1; }
        `}</style>
      </main>

      {/* Floating buy buttons for each card */}
      {!isLoadingAI && !aiError && suggestions.length > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: '1.5rem',
            right: '1.5rem',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.625rem',
            alignItems: 'flex-end',
          }}
        >
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
          >
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelectGift(suggestions[0], 'online')}
              style={{
                background: 'var(--gradient-main)',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                padding: '0.75rem 1.25rem',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(255,107,157,0.4)',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              🛒 Mua Online
            </motion.button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2 }}
          >
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelectGift(suggestions[0], 'offline')}
              style={{
                background: 'white',
                color: 'var(--color-text)',
                border: '2px solid var(--color-border)',
                borderRadius: '50px',
                padding: '0.75rem 1.25rem',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-md)',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              📍 Cửa hàng gần đây
            </motion.button>
          </motion.div>
        </div>
      )}
    </>
  );
}

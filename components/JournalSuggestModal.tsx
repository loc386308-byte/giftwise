'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Person } from '@/types/journal';
import { GiftSuggestion } from '@/types';
import { useJournalStore } from '@/lib/store/journalStore';

const OCCASIONS = [
  'Sinh nhật 🎂',
  'Valentine 💝',
  '8/3 🌸',
  'Giáng sinh 🎄',
  'Kỷ niệm 💍',
  'Thăng chức 🚀',
  'Ra trường 🎓',
  'Dịp khác 🎁',
];

const BUDGET_OPTIONS = [
  'Dưới 100k 🎀',
  '100k – 300k 🛍️',
  '300k – 500k 🎁',
  '500k – 1tr 💝',
  'Trên 1 triệu 👑',
];

interface JournalSuggestModalProps {
  person: Person;
  onClose: () => void;
}

export default function JournalSuggestModal({ person, onClose }: JournalSuggestModalProps) {
  const router = useRouter();
  const addGiftRecord = useJournalStore((s) => s.addGiftRecord);

  const [occasion, setOccasion] = useState(OCCASIONS[0]);
  const [budget, setBudget] = useState(BUDGET_OPTIONS[2]);
  const [customNote, setCustomNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<GiftSuggestion[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const pastGiftNames = (person.giftHistory || []).map((g) => g.giftName);

  const handleFetchSuggestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/suggest-journal-gifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          person,
          occasion,
          budget,
          customNote,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else if (data.suggestions && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
      } else {
        setError('Chưa thể sinh gợi ý quà. Vui lòng thử lại.');
      }
    } catch {
      setError('Đã xảy ra lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToJournal = (gift: GiftSuggestion) => {
    addGiftRecord(person.id, {
      giftName: gift.productName,
      occasion,
      date: new Date().toISOString(),
      priceRange: gift.estimatedPriceRange,
      notes: `Gợi ý bởi AI Wise Advisor: ${gift.reason}`,
      rating: 5,
    });
    setSavedIds((prev) => new Set(prev).add(gift.id));
  };

  const handleBuyOnline = (gift: GiftSuggestion) => {
    const exactKeyword = gift.searchKeyword || gift.productName;
    router.push(
      `/results/online?keyword=${encodeURIComponent(exactKeyword)}&gift=${encodeURIComponent(gift.productName)}&price=${encodeURIComponent(gift.estimatedPriceRange)}`
    );
  };

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          background: 'rgba(12,10,32,0.82)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          style={{
            width: '100%',
            maxWidth: '680px',
            maxHeight: '90vh',
            overflowY: 'auto',
            background: 'linear-gradient(145deg, rgba(46,38,96,0.96), rgba(26,21,53,0.98))',
            border: '1px solid rgba(212,168,232,0.35)',
            borderRadius: '28px',
            padding: '1.75rem',
            boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
            position: 'relative',
          }}
          className="no-scrollbar"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1.25rem',
              right: '1.25rem',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            ✕
          </button>

          {/* Person Header Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div
              style={{
                fontSize: '2.5rem',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(212,168,232,0.15)',
                border: '1px solid rgba(212,168,232,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {person.avatar || '👤'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontFamily: "'Comfortaa', 'Nunito', sans-serif", fontSize: '1.3rem', color: 'var(--cream)', margin: 0 }}>
                  Gợi Ý Quà Cho {person.name}
                </h2>
                <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>
                  {person.relationship}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--lavender-light)', margin: '0.2rem 0 0' }}>
                {pastGiftNames.length > 0
                  ? `🚫 Tự động loại trừ ${pastGiftNames.length} món quà đã tặng trong quá khứ`
                  : '✨ Lần đầu gợi ý quà trong Nhật ký'}
              </p>
            </div>
          </div>

          {/* Past gifts tag badges */}
          {pastGiftNames.length > 0 && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '16px', padding: '0.75rem', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#fca5a5', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                🔒 DANH SÁCH QUÀ CŨ CẦN TRÁNH TRÙNG:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {pastGiftNames.map((g, idx) => (
                  <span key={idx} style={{ fontSize: '0.72rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', color: '#ffd2d2', padding: '0.2rem 0.5rem', borderRadius: '8px' }}>
                    ✕ {g}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Selection Controls Form */}
          {suggestions.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              {/* Occasion */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--lavender-light)', marginBottom: '0.4rem' }}>
                  CHỌN DỊP TẶNG LẦN NÀY:
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {OCCASIONS.map((occ) => (
                    <button
                      key={occ}
                      type="button"
                      onClick={() => setOccasion(occ)}
                      className={`chip ${occasion === occ ? 'selected' : ''}`}
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}
                    >
                      {occ}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--lavender-light)', marginBottom: '0.4rem' }}>
                  NGÂN SÁCH MONG MUỐN:
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {BUDGET_OPTIONS.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBudget(b)}
                      className={`chip ${budget === b ? 'selected' : ''}`}
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Note */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--lavender-light)', marginBottom: '0.4rem' }}>
                  LƯU Ý THÊM LẦN NÀY (TÙY CHỌN):
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Thích đồ tone màu xanh pastel, dạo này đang tập chạy bộ..."
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(201,187,232,0.25)',
                    borderRadius: '12px',
                    padding: '0.6rem 0.8rem',
                    color: '#fff',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Submit AI button */}
              <button
                onClick={handleFetchSuggestions}
                disabled={loading}
                className="btn-primary"
                style={{
                  padding: '0.875rem',
                  fontSize: '0.95rem',
                  justifyContent: 'center',
                  marginTop: '0.5rem',
                }}
              >
                {loading ? '🤖 AI đang phân tích & loại trừ quà cũ...' : '✨ AI Gợi Ý Quà Mới Chưa Tặng'}
              </button>

              {error && (
                <div style={{ color: '#fca5a5', fontSize: '0.8rem', textAlign: 'center', marginTop: '0.5rem' }}>
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Loading Animation */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }} className="float-animation">
                🐱🤖
              </div>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--cream)', marginBottom: '0.5rem' }}>
                AI đang đọc Nhật Ký của {person.name}...
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--lavender-light)' }}>
                Đang loại trừ các món quà đã tặng trong quá khứ và tìm kiếm danh mục quà mới lạ hoàn toàn!
              </p>
            </div>
          )}

          {/* Suggestions Display List */}
          {!loading && suggestions.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', color: 'var(--cream)', margin: 0 }}>
                  🎁 6 Gợi Ý Quà Mới Cho {person.name} ({occasion}):
                </h3>
                <button
                  onClick={() => setSuggestions([])}
                  style={{
                    background: 'none', border: 'none', color: 'var(--lavender-light)', fontSize: '0.78rem', cursor: 'pointer', textDecoration: 'underline'
                  }}
                >
                  ⚙️ Đổi dịp / Ngân sách
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '1rem' }}>
                {suggestions.map((gift) => {
                  const isSaved = savedIds.has(gift.id);
                  return (
                    <div
                      key={gift.id}
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(201,187,232,0.2)',
                        borderRadius: '18px',
                        padding: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                          <span style={{ fontSize: '2rem', lineHeight: 1 }}>{gift.emoji}</span>
                          <div>
                            <span className="badge badge-primary" style={{ fontSize: '0.7rem', marginBottom: '0.2rem' }}>
                              {gift.category}
                            </span>
                            <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--cream)', margin: 0 }}>
                              {gift.productName}
                            </h4>
                          </div>
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-accent-1)' }}>
                          💰 {gift.estimatedPriceRange}
                        </span>
                      </div>

                      <p style={{ fontSize: '0.85rem', color: 'var(--lavender-pale)', lineHeight: 1.5, margin: 0, background: 'rgba(212,168,232,0.1)', padding: '0.75rem', borderRadius: '12px', borderLeft: '3px solid var(--color-accent-1)' }}>
                        💡 <strong>Lý do chọn quà mới:</strong> {gift.reason}
                      </p>

                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleSaveToJournal(gift)}
                          disabled={isSaved}
                          className={isSaved ? 'btn-secondary' : 'btn-primary'}
                          style={{
                            flex: 1,
                            padding: '0.5rem 0.8rem',
                            fontSize: '0.8rem',
                            justifyContent: 'center',
                            opacity: isSaved ? 0.7 : 1,
                          }}
                        >
                          {isSaved ? '✓ Đã Lưu Vào Nhật Ký' : '📌 Lưu Vào Nhật Ký'}
                        </button>

                        <button
                          onClick={() => handleBuyOnline(gift)}
                          className="btn-secondary"
                          style={{
                            flex: 1,
                            padding: '0.5rem 0.8rem',
                            fontSize: '0.8rem',
                            justifyContent: 'center',
                          }}
                        >
                          🛒 Tìm Mua Online
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

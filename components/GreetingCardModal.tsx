'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GiftSuggestion, QuizAnswers } from '@/types';

interface GreetingCardModalProps {
  gift: GiftSuggestion;
  answers: Partial<QuizAnswers>;
  onClose: () => void;
}

export default function GreetingCardModal({ gift, answers, onClose }: GreetingCardModalProps) {
  const [tone, setTone] = useState<'warm' | 'funny' | 'formal' | 'concise'>('warm');
  const [cardText, setCardText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const fetchCard = async (selectedTone: 'warm' | 'funny' | 'formal' | 'concise') => {
    setLoading(true);
    setCopied(false);
    try {
      const res = await fetch('/api/card-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          giftName: gift.productName,
          occasion: answers.occasion || 'Sinh nhật 🎂',
          relationship: answers.relationship || 'Người thân',
          tone: selectedTone,
          customDescription: answers.customDescription,
          interests: answers.interests,
        }),
      });
      const data = await res.json();
      setCardText(data.cardText || '');
    } catch {
      setCardText(`Chúc ${answers.relationship || 'bạn'} luôn rạng rỡ và tràn đầy niềm vui! Mong rằng món quà ${gift.productName} này sẽ mang lại cho bạn những khoảnh khắc thật ấm áp.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCard(tone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToneChange = (newTone: 'warm' | 'funny' | 'formal' | 'concise') => {
    setTone(newTone);
    fetchCard(newTone);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(cardText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          background: 'rgba(12,10,32,0.8)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          style={{
            width: '100%',
            maxWidth: '520px',
            background: 'linear-gradient(145deg, rgba(46,38,96,0.95), rgba(26,21,53,0.98))',
            border: '1px solid rgba(212,168,232,0.35)',
            borderRadius: '28px',
            padding: '2rem',
            boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
            position: 'relative',
          }}
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

          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.4rem' }}>💌✨</div>
            <h2
              style={{
                fontFamily: "'Comfortaa', 'Nunito', sans-serif",
                fontSize: '1.4rem',
                color: 'var(--cream)',
                marginBottom: '0.25rem',
              }}
            >
              Thiệp & Lời Chúc Tặng Quà
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--lavender-light)' }}>
              Dành riêng cho <strong style={{ color: '#fff' }}>{gift.productName}</strong>
            </p>
          </div>

          {/* Tone Selector */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--lavender-light)', marginBottom: '0.5rem' }}>
              CHỌN GIỌNG ĐIỆU LỜI CHÚC:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {[
                { id: 'warm', label: '💖 Ấm áp & Chân thành' },
                { id: 'funny', label: '😆 Hài hước & Vui vẻ' },
                { id: 'formal', label: '👔 Trang trọng & Lịch sự' },
                { id: 'concise', label: '⚡ Ngắn gọn & Tinh tế' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleToneChange(t.id as any)}
                  className={`chip ${tone === t.id ? 'selected' : ''}`}
                  style={{
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.78rem',
                    justifyContent: 'center',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Card Body Display */}
          <div
            style={{
              position: 'relative',
              background: 'linear-gradient(135deg, rgba(242,196,208,0.12), rgba(212,168,232,0.15))',
              border: '1px dashed rgba(242,196,208,0.4)',
              borderRadius: '20px',
              padding: '1.5rem',
              minHeight: '130px',
              marginBottom: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            {loading ? (
              <div style={{ textAlign: 'center', color: 'var(--lavender-light)', padding: '1rem 0' }}>
                <span className="spinner" style={{ display: 'inline-block', marginBottom: '0.5rem' }}>✨</span>
                <p style={{ fontSize: '0.85rem', margin: 0 }}>AI đang sáng tác lời chúc cho bạn...</p>
              </div>
            ) : isEditing ? (
              <textarea
                value={cardText}
                onChange={(e) => setCardText(e.target.value)}
                onBlur={() => setIsEditing(false)}
                rows={4}
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid rgba(212,168,232,0.4)',
                  borderRadius: '12px',
                  padding: '0.75rem',
                  color: '#fff',
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: '0.92rem',
                  lineHeight: 1.6,
                  outline: 'none',
                }}
                autoFocus
              />
            ) : (
              <div
                onClick={() => setIsEditing(true)}
                title="Bấm để chỉnh sửa trực tiếp"
                style={{ cursor: 'pointer' }}
              >
                <p
                  style={{
                    fontFamily: "'Comfortaa', 'Nunito', sans-serif",
                    fontSize: '0.95rem',
                    lineHeight: 1.65,
                    color: '#fdf6ff',
                    margin: 0,
                    whiteSpace: 'pre-line',
                  }}
                >
                  "{cardText}"
                </p>
                <span style={{ fontSize: '0.72rem', color: 'var(--lavender-light)', display: 'block', marginTop: '0.75rem', fontStyle: 'italic' }}>
                  ✏️ Bấm vào văn bản để chỉnh sửa trực tiếp
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => fetchCard(tone)}
              disabled={loading}
              className="btn-secondary"
              style={{
                flex: 1,
                padding: '0.75rem',
                fontSize: '0.85rem',
                justifyContent: 'center',
              }}
            >
              🔄 Tạo lại
            </button>

            <button
              onClick={handleCopy}
              disabled={loading || !cardText}
              className="btn-primary"
              style={{
                flex: 1.5,
                padding: '0.75rem',
                fontSize: '0.85rem',
                justifyContent: 'center',
              }}
            >
              {copied ? '✓ Đã sao chép!' : '📋 Sao chép lời chúc'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

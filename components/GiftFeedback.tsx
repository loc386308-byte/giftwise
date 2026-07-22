'use client';

import React, { useState } from 'react';
import { QuizAnswers } from '@/types';

interface GiftFeedbackProps {
  suggestionId: string;
  productName: string;
  quizAnswers?: Partial<QuizAnswers>;
}

export default function GiftFeedback({ suggestionId, productName, quizAnswers }: GiftFeedbackProps) {
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleFeedback = (type: 'like' | 'dislike') => {
    setFeedback(type);
    setShowNoteInput(true);
    sendFeedback(type, note);
  };

  const sendFeedback = (type: 'like' | 'dislike', noteText: string) => {
    // Non-blocking async feedback dispatch
    fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        suggestionId,
        productName,
        type,
        note: noteText,
        quizAnswers,
      }),
    }).catch((err) => console.warn('[Feedback send failed]:', err));
  };

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback) {
      sendFeedback(feedback, note);
      setSubmitted(true);
      setShowNoteInput(false);
    }
  };

  return (
    <div
      style={{
        marginTop: '0.5rem',
        paddingTop: '0.75rem',
        borderTop: '1px solid rgba(201,187,232,0.12)',
        fontSize: '0.78rem',
      }}
    >
      {!submitted ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>Gợi ý này thế nào?</span>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                type="button"
                onClick={() => handleFeedback('like')}
                style={{
                  background: feedback === 'like' ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.06)',
                  border: feedback === 'like' ? '1px solid #10b981' : '1px solid rgba(201,187,232,0.2)',
                  color: feedback === 'like' ? '#6ee7b7' : 'var(--cream)',
                  borderRadius: '999px',
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                👍 Thích
              </button>
              <button
                type="button"
                onClick={() => handleFeedback('dislike')}
                style={{
                  background: feedback === 'dislike' ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.06)',
                  border: feedback === 'dislike' ? '1px solid #ef4444' : '1px solid rgba(201,187,232,0.2)',
                  color: feedback === 'dislike' ? '#fca5a5' : 'var(--cream)',
                  borderRadius: '999px',
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                👎 Chưa hợp
              </button>
            </div>
          </div>

          {showNoteInput && (
            <form onSubmit={handleNoteSubmit} style={{ display: 'flex', gap: '0.4rem', marginTop: '0.25rem' }}>
              <input
                type="text"
                placeholder="Gợi ý thêm lý do (tùy chọn)..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(201,187,232,0.2)',
                  borderRadius: '10px',
                  padding: '0.35rem 0.6rem',
                  color: 'white',
                  fontSize: '0.75rem',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                style={{
                  background: 'rgba(212,168,232,0.2)',
                  border: '1px solid rgba(212,168,232,0.4)',
                  color: 'var(--lavender-light)',
                  borderRadius: '10px',
                  padding: '0.35rem 0.6rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                Gửi
              </button>
            </form>
          )}
        </div>
      ) : (
        <div style={{ color: '#a7f3d0', fontSize: '0.75rem', fontStyle: 'italic', textAlign: 'center' }}>
          ❤️ Cảm ơn bạn đã đóng góp phản hồi!
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GiftSuggestion } from '@/types';

interface GiftRouletteProps {
  gifts: GiftSuggestion[];
  onSelect: (gift: GiftSuggestion, dest: 'online' | 'offline') => void;
}

// Segment colors matching kawaii palette
const SEGMENT_COLORS = [
  { bg: 'rgba(212,168,232,0.35)', border: 'rgba(212,168,232,0.7)', text: '#e8d5f8' },   // lavender
  { bg: 'rgba(155,181,232,0.35)', border: 'rgba(155,181,232,0.7)', text: '#c5d8f8' },   // periwinkle
  { bg: 'rgba(242,196,208,0.35)', border: 'rgba(242,196,208,0.7)', text: '#f8d5e0' },   // blush
  { bg: 'rgba(184,232,200,0.3)',  border: 'rgba(184,232,200,0.6)', text: '#c5f0d5' },   // mint
  { bg: 'rgba(255,224,130,0.25)', border: 'rgba(255,224,130,0.55)', text: '#fff0a0' },  // gold
  { bg: 'rgba(184,169,217,0.35)', border: 'rgba(184,169,217,0.7)', text: '#d4c8f8' },  // purple
];

export default function GiftRoulette({ gifts, onSelect }: GiftRouletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<GiftSuggestion | null>(null);
  const [showResult, setShowResult] = useState(false);
  const spinRef = useRef(false);

  const segmentAngle = 360 / gifts.length;

  const spin = useCallback(() => {
    if (spinRef.current) return;
    spinRef.current = true;
    setSpinning(true);
    setWinner(null);
    setShowResult(false);

    // Pick random winner index
    const winnerIdx = Math.floor(Math.random() * gifts.length);

    // Calculate target rotation:
    // The pointer is at 0° (top). Segment 0 starts at -90° (top).
    // To land segment winnerIdx at top: rotate so that segment's center aligns with top.
    // Each segment center is at: winnerIdx * segmentAngle + segmentAngle/2
    // We need to rotate the wheel so that point aligns with 0 (top of wheel = 270° in standard coords)
    // Add 5+ full rotations for visual effect
    const baseRotations = (5 + Math.floor(Math.random() * 3)) * 360;
    const targetAngle = 360 - (winnerIdx * segmentAngle + segmentAngle / 2);
    const totalRotation = rotation + baseRotations + targetAngle - (rotation % 360);

    setRotation(totalRotation);

    setTimeout(() => {
      setWinner(gifts[winnerIdx]);
      setShowResult(true);
      setSpinning(false);
      spinRef.current = false;
    }, 4200);
  }, [gifts, rotation, segmentAngle]);

  const reset = () => {
    setWinner(null);
    setShowResult(false);
  };

  if (!isOpen) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', marginTop: '2rem', marginBottom: '1rem' }}
      >
        <div
          style={{
            display: 'inline-block',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(201,187,232,0.18)',
            borderRadius: '24px',
            padding: '1.5rem 2rem',
          }}
        >
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginBottom: '1rem' }}>
            😵 Không chọn được quà? Hãy để vòng quay quyết định!
          </p>
          <button
            onClick={() => setIsOpen(true)}
            className="btn-primary"
            style={{ fontSize: 'var(--text-base)', padding: '0.875rem 2rem' }}
          >
            🎡 Quay vòng quay may mắn
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        key="roulette-panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          marginTop: '2rem',
          background: 'rgba(26,21,53,0.6)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(201,187,232,0.2)',
          borderRadius: '32px',
          padding: '2rem 1.5rem',
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: "'Comfortaa','Nunito',sans-serif", fontSize: '1.25rem', color: '#f0eaff', margin: 0 }}>
            🎡 Vòng quay may mắn
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '1.25rem' }}
          >✕</button>
        </div>

        {/* Wheel Container */}
        <div style={{ position: 'relative', width: '280px', height: '280px', margin: '0 auto 1.5rem' }}>
          {/* Pointer */}
          <div
            style={{
              position: 'absolute',
              top: '-14px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10,
              fontSize: '1.8rem',
              lineHeight: 1,
              filter: 'drop-shadow(0 2px 8px rgba(212,168,232,0.6))',
            }}
          >
            ▼
          </div>

          {/* Wheel */}
          <motion.div
            animate={{ rotate: rotation }}
            transition={{ duration: 4, ease: [0.17, 0.67, 0.35, 1.0] }}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              position: 'relative',
              overflow: 'hidden',
              border: '3px solid rgba(212,168,232,0.4)',
              boxShadow: '0 0 40px rgba(184,169,217,0.3), inset 0 0 20px rgba(0,0,0,0.3)',
            }}
          >
            {gifts.map((gift, i) => {
              const color = SEGMENT_COLORS[i % SEGMENT_COLORS.length];
              const startAngle = i * segmentAngle;
              const midAngle = startAngle + segmentAngle / 2;
              const midRad = ((midAngle - 90) * Math.PI) / 180;
              const labelR = 75; // % of radius
              const cx = 50 + labelR * Math.cos(midRad) * 0.5;
              const cy = 50 + labelR * Math.sin(midRad) * 0.5;

              return (
                <div
                  key={gift.id}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    overflow: 'hidden',
                  }}
                >
                  {/* SVG segment */}
                  <svg
                    viewBox="0 0 100 100"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                  >
                    <path
                      d={describeArc(50, 50, 50, startAngle - 90, startAngle + segmentAngle - 90)}
                      fill={color.bg}
                      stroke={color.border}
                      strokeWidth="0.5"
                    />
                    {/* Emoji label */}
                    <text
                      x={cx}
                      y={cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={segmentAngle > 60 ? '10' : segmentAngle > 40 ? '8' : '6'}
                      transform={`rotate(${midAngle}, ${cx}, ${cy})`}
                    >
                      {gift.emoji}
                    </text>
                  </svg>
                </div>
              );
            })}

            {/* Center circle */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(26,21,53,0.95)',
                border: '2px solid rgba(212,168,232,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                zIndex: 5,
                boxShadow: '0 0 16px rgba(184,169,217,0.4)',
              }}
            >
              {spinning ? '✨' : '🐱'}
            </div>
          </motion.div>

          {/* Glow ring when spinning */}
          {spinning && (
            <div
              style={{
                position: 'absolute',
                inset: '-8px',
                borderRadius: '50%',
                border: '2px solid rgba(212,168,232,0.3)',
                animation: 'pulse-glow-ring 1s ease-in-out infinite',
                pointerEvents: 'none',
              }}
            />
          )}
        </div>

        {/* Gift legend */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
          {gifts.map((gift, i) => {
            const color = SEGMENT_COLORS[i % SEGMENT_COLORS.length];
            return (
              <div
                key={gift.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.35rem',
                  background: color.bg, border: `1px solid ${color.border}`,
                  borderRadius: '999px', padding: '0.2rem 0.65rem',
                  fontSize: 'var(--text-xs)', fontFamily: "'Nunito',sans-serif",
                  color: color.text,
                  maxWidth: '160px',
                }}
              >
                <span>{gift.emoji}</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {gift.productName.length > 18 ? gift.productName.slice(0, 18) + '…' : gift.productName}
                </span>
              </div>
            );
          })}
        </div>

        {/* Spin button / Result */}
        <AnimatePresence mode="wait">
          {!showResult ? (
            <motion.button
              key="spin-btn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              whileTap={{ scale: 0.95 }}
              onClick={spin}
              disabled={spinning}
              className="btn-primary"
              style={{
                fontSize: 'var(--text-md)',
                padding: '1rem 2.5rem',
                opacity: spinning ? 0.6 : 1,
                cursor: spinning ? 'not-allowed' : 'pointer',
              }}
            >
              {spinning ? '🌀 Đang quay...' : '🎡 Quay ngay!'}
            </motion.button>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              style={{
                background: 'rgba(212,168,232,0.15)',
                border: '1.5px solid rgba(212,168,232,0.4)',
                borderRadius: '24px',
                padding: '1.5rem',
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{winner?.emoji}</div>
              <p style={{ fontFamily: "'Comfortaa','Nunito',sans-serif", fontSize: '1.1rem', color: '#f0eaff', fontWeight: 700, marginBottom: '0.35rem' }}>
                Vòng quay chọn:
              </p>
              <p style={{ fontFamily: "'Nunito',sans-serif", fontSize: 'var(--text-md)', color: 'var(--lavender-light)', fontWeight: 600, marginBottom: '0.5rem' }}>
                {winner?.productName}
              </p>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
                {winner?.estimatedPriceRange}
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => winner && onSelect(winner, 'online')}
                  className="btn-primary"
                  style={{ padding: '0.625rem 1.25rem', fontSize: 'var(--text-sm)' }}
                >
                  🛒 Mua Online
                </button>
                <button
                  onClick={() => winner && onSelect(winner, 'offline')}
                  className="btn-secondary"
                  style={{ padding: '0.625rem 1.25rem', fontSize: 'var(--text-sm)' }}
                >
                  📍 Cửa hàng
                </button>
                <button
                  onClick={reset}
                  style={{ background: 'none', border: '1px solid rgba(201,187,232,0.2)', color: 'var(--color-text-muted)', borderRadius: '50px', padding: '0.625rem 1rem', cursor: 'pointer', fontFamily: "'Nunito',sans-serif", fontSize: 'var(--text-sm)' }}
                >
                  🔄 Quay lại
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── SVG Arc Helper ────────────────────────────────────────────────────────────
function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const x1 = cx + r * Math.cos(toRad(startAngle));
  const y1 = cy + r * Math.sin(toRad(startAngle));
  const x2 = cx + r * Math.cos(toRad(endAngle));
  const y2 = cy + r * Math.sin(toRad(endAngle));
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
}

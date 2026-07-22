'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/lib/store/authStore';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Vui lòng nhập email hợp lệ!');
      return;
    }
    setError('');
    login(email, name || email.split('@')[0]);
  };

  const handleQuickLogin = (demoEmail: string, demoName: string) => {
    login(demoEmail, demoName);
  };

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          background: 'rgba(15,12,35,0.75)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
        onClick={closeAuthModal}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          style={{
            width: '100%',
            maxWidth: '440px',
            background: 'linear-gradient(145deg, rgba(46,38,96,0.95), rgba(26,21,53,0.98))',
            border: '1px solid rgba(201,187,232,0.3)',
            borderRadius: '24px',
            padding: '2rem',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            position: 'relative',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={closeAuthModal}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🐱✨</div>
            <h2
              style={{
                fontFamily: "'Comfortaa', 'Nunito', sans-serif",
                fontSize: '1.5rem',
                color: 'var(--color-text)',
                marginBottom: '0.25rem',
              }}
            >
              {mode === 'login' ? 'Đăng Nhập Nhật Kí' : 'Tạo Tài Khoản Mới'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Lưu giữ thông tin sở thích, lịch sinh nhật & lịch sử tặng quà gia đình
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                background: 'rgba(239,68,68,0.2)',
                border: '1px solid rgba(239,68,68,0.4)',
                borderRadius: '12px',
                padding: '0.6rem 0.8rem',
                color: '#fca5a5',
                fontSize: '0.82rem',
                marginBottom: '1rem',
                textAlign: 'center',
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {mode === 'register' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--lavender-light)', marginBottom: '0.3rem' }}>
                  Họ và tên của bạn
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Minh Anh"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '14px',
                    border: '1px solid rgba(201,187,232,0.3)',
                    background: 'rgba(255,255,255,0.06)',
                    color: 'white',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--lavender-light)', marginBottom: '0.3rem' }}>
                Địa chỉ Email
              </label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '14px',
                  border: '1px solid rgba(201,187,232,0.3)',
                  background: 'rgba(255,255,255,0.06)',
                  color: 'white',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '14px',
                fontSize: '0.95rem',
                fontWeight: 700,
                marginTop: '0.5rem',
              }}
            >
              {mode === 'login' ? '🔑 Đăng Nhập Ngay' : '✨ Tạo Tài Khoản'}
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(201,187,232,0.15)', textAlign: 'center' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.6rem' }}>Hoặc đăng nhập nhanh bằng tài khoản thử nghiệm:</p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => handleQuickLogin('demo.user@gmail.com', 'Minh Anh')}
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(201,187,232,0.25)',
                  background: 'rgba(255,255,255,0.08)',
                  color: 'white',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                👤 Demo Minh Anh
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('family.giftwise@gmail.com', 'Gia Đình GiftWise')}
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(201,187,232,0.25)',
                  background: 'rgba(255,255,255,0.08)',
                  color: 'white',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                🏠 Demo Gia Đình
              </button>
            </div>
          </div>

          {/* Switch Mode */}
          <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            {mode === 'login' ? (
              <>
                Chưa có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  style={{ background: 'none', border: 'none', color: 'var(--lavender-light)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Đăng ký ngay
                </button>
              </>
            ) : (
              <>
                Đã có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  style={{ background: 'none', border: 'none', color: 'var(--lavender-light)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Đăng nhập
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

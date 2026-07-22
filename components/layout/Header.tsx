'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const isJournal = pathname === '/journal';

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: 'rgba(26,21,53,0.75)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(201,187,232,0.18)',
        padding: '0 1.5rem',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
      }}
    >
      {/* Logo */}
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
        <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>🐱</span>
        <span
          style={{
            fontFamily: "'Comfortaa', 'Nunito', sans-serif",
            fontWeight: 700,
            fontSize: '1.1rem',
            background: 'linear-gradient(135deg, #c9bbe8 0%, #9bb5e8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '0.01em',
          }}
        >
          GiftWise
        </span>
      </Link>

      {/* Nav links */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {/* Journal link — always visible */}
        <Link
          href="/journal"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.35rem 0.875rem',
            borderRadius: '999px',
            textDecoration: 'none',
            fontFamily: "'Nunito', sans-serif",
            fontSize: 'var(--text-sm)',
            fontWeight: 700,
            border: isJournal ? '1px solid rgba(212,168,232,0.5)' : '1px solid rgba(201,187,232,0.2)',
            background: isJournal ? 'rgba(212,168,232,0.18)' : 'rgba(255,255,255,0.05)',
            color: isJournal ? 'var(--lavender-light)' : 'var(--color-text-muted)',
            transition: 'all 0.18s ease',
          }}
          onMouseEnter={(e) => {
            if (!isJournal) {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.color = 'var(--lavender-light)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isJournal) {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.color = 'var(--color-text-muted)';
            }
          }}
        >
          <span>📖</span>
          <span style={{ display: 'none' }} className="nav-label">Nhật kí</span>
          <span className="nav-label-mobile">Nhật kí</span>
        </Link>

        {/* Back / Start CTA */}
        {!isHome ? (
          <Link href="/" className="btn-secondary" style={{ padding: '0.35rem 0.875rem', fontSize: 'var(--text-sm)', flexShrink: 0 }}>
            ← Home
          </Link>
        ) : (
          <Link href="/quiz" className="btn-primary" style={{ padding: '0.4rem 1.1rem', fontSize: 'var(--text-sm)', flexShrink: 0 }}>
            Bắt đầu ✨
          </Link>
        )}
      </nav>
    </header>
  );
}

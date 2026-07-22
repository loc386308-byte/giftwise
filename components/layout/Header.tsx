'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === '/';

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
      }}
    >
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {/* Cat mascot mini */}
        <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>🐱</span>
        <span
          style={{
            fontFamily: "'Comfortaa', 'Nunito', sans-serif",
            fontWeight: 700,
            fontSize: '1.2rem',
            background: 'linear-gradient(135deg, #c9bbe8 0%, #9bb5e8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '0.01em',
          }}
        >
          GiftWise
        </span>
        <span style={{ fontSize: '0.7rem', color: 'rgba(201,187,232,0.6)', marginLeft: '-2px' }}>✦</span>
      </Link>

      {!isHome && (
        <Link href="/" className="btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.825rem' }}>
          ← Về trang chủ
        </Link>
      )}

      {isHome && (
        <Link href="/quiz" className="btn-primary" style={{ padding: '0.45rem 1.25rem', fontSize: '0.85rem' }}>
          Bắt đầu ✨
        </Link>
      )}
    </header>
  );
}

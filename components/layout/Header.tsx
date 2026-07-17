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
        background: 'rgba(251, 249, 246, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(229, 231, 235, 0.6)',
        padding: '0 1.5rem',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '1.5rem' }}>🎁</span>
        <span
          style={{
            fontWeight: 800,
            fontSize: '1.25rem',
            letterSpacing: '-0.03em',
          }}
          className="gradient-text"
        >
          GiftWise
        </span>
      </Link>

      {!isHome && (
        <Link href="/" className="btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.875rem' }}>
          ← Về trang chủ
        </Link>
      )}

      {isHome && (
        <Link href="/quiz" className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>
          Bắt đầu ✨
        </Link>
      )}
    </header>
  );
}

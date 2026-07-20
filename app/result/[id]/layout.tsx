import type { Metadata } from 'next';
import Header from '@/components/layout/Header';

export const metadata: Metadata = {
  title: 'GiftWise — AI Gợi Ý Quà Tặng',
};

export default function ResultLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main style={{ paddingTop: '60px', minHeight: '100dvh', background: '#fbf9f6' }}>
        {children}
      </main>
    </>
  );
}

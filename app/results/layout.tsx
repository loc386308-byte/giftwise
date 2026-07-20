import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kết Quả Gợi Ý Quà',
  description:
    'Xem 9 món quà được AI GiftWise gợi ý riêng cho bạn — kèm giá, lý do phù hợp, và nơi mua online hoặc cửa hàng gần bạn nhất.',
  openGraph: {
    title: 'Kết quả gợi ý quà của bạn | GiftWise',
    description: '9 món quà cá nhân hóa — mua online Shopee/TikTok Shop hoặc cửa hàng gần đây.',
    url: 'https://giftwise-lhsm.vercel.app/results',
  },
  robots: { index: false, follow: false }, // kết quả cá nhân, không cần index
  alternates: {
    canonical: 'https://giftwise-lhsm.vercel.app/results',
  },
};

export default function ResultsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GiftWise — AI gợi ý quà tặng cá nhân hóa',
  description: 'Hết lo tặng quà sai! GiftWise dùng AI để gợi ý món quà hoàn hảo dựa trên tính cách, sở thích và ngân sách. Tìm quà online trên Shopee/TikTok Shop hoặc cửa hàng gần bạn.',
  keywords: ['quà tặng', 'gợi ý quà tặng', 'AI', 'gift idea', 'Shopee', 'TikTok Shop', 'sinh nhật', 'Valentine'],
  openGraph: {
    title: 'GiftWise — AI gợi ý quà tặng cá nhân hóa',
    description: 'Hết lo tặng quà sai! GiftWise dùng AI để gợi ý món quà hoàn hảo.',
    type: 'website',
    locale: 'vi_VN',
  },
  themeColor: '#FF6B9D',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

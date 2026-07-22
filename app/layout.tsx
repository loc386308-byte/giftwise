import type { Metadata, Viewport } from 'next';
import './globals.css';

// ─── Viewport (tách riêng khỏi metadata — Next.js 14+ best practice) ──────────
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#2e2660',
};


// ─── Root metadata (fallback cho tất cả routes) ────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL('https://giftwise-lhsm.vercel.app'),
  title: {
    default: 'GiftWise — AI Gợi Ý Quà Tặng Cá Nhân Hóa',
    template: '%s | GiftWise',
  },
  description:
    'Hết lo tặng quà sai! GiftWise dùng AI để gợi ý món quà hoàn hảo dựa trên cung hoàng đạo, tính cách và ngân sách. Tìm quà online Shopee/TikTok Shop hoặc cửa hàng gần bạn.',
  keywords: [
    'gợi ý quà tặng', 'quà tặng AI', 'tặng quà sinh nhật', 'tặng quà Valentine',
    'quà tặng theo cung hoàng đạo', 'gift idea Vietnam', 'Shopee quà tặng',
    'GiftWise', 'quà tặng cá nhân hóa', 'tìm quà tặng',
  ],
  authors: [{ name: 'GiftWise Team' }],
  creator: 'GiftWise',
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: 'https://giftwise-lhsm.vercel.app',
    siteName: 'GiftWise',
    title: 'GiftWise — AI Gợi Ý Quà Tặng Cá Nhân Hóa',
    description: 'Trả lời 8 câu hỏi, AI gợi ý ngay 9 món quà hoàn hảo kèm nơi mua.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'GiftWise — AI gợi ý quà tặng',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GiftWise — AI Gợi Ý Quà Tặng',
    description: 'Trả lời 8 câu hỏi, AI gợi ý ngay 9 món quà hoàn hảo.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  alternates: {
    canonical: 'https://giftwise-lhsm.vercel.app',
  },
};

// ─── JSON-LD: WebApplication schema ───────────────────────────────────────────
const webAppJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'GiftWise',
  url: 'https://giftwise-lhsm.vercel.app',
  description: 'Ứng dụng AI gợi ý quà tặng cá nhân hóa dựa trên cung hoàng đạo, tính cách và ngân sách.',
  applicationCategory: 'LifestyleApplication',
  operatingSystem: 'Any',
  inLanguage: 'vi',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'VND',
  },
  featureList: [
    'Gợi ý quà theo cung hoàng đạo',
    'Phân tích tính cách người nhận',
    'Tìm mua online Shopee / TikTok Shop',
    'Tìm cửa hàng gần theo GPS',
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@400;500;600;700&family=Nunito:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }}
        />
      </head>
      <body className="antialiased">
        {/* 🌙 Moon decoration */}
        <div className="moon-deco" aria-hidden="true">
          <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="28" cy="28" rx="28" ry="28" fill="#fff0c8" opacity="0.95"/>
            <ellipse cx="36" cy="20" rx="20" ry="20" fill="#1a1244"/>
          </svg>
        </div>
        {/* ✨ Floating sparkle stars */}
        {[
          { top:'12%', left:'5%'  },
          { top:'8%',  left:'35%' },
          { top:'18%', left:'60%' },
          { top:'6%',  left:'75%' },
          { top:'28%', left:'18%' },
          { top:'22%', left:'88%' },
          { top:'35%', left:'45%' },
        ].map((pos, i) => (
          <span
            key={i}
            className="deco-star"
            style={{ top: pos.top, left: pos.left, animationDelay: `${i * 1.1}s` }}
            aria-hidden="true"
          >
            ✶
          </span>
        ))}
        {children}
      </body>

    </html>
  );
}

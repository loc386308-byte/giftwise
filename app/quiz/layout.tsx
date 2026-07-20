import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Làm Quiz Tìm Quà Hoàn Hảo',
  description:
    'Trả lời 8 câu hỏi về cung hoàng đạo, tính cách, sở thích và ngân sách — AI GiftWise sẽ gợi ý ngay 9 món quà được cá nhân hóa hoàn toàn cho người bạn muốn tặng.',
  openGraph: {
    title: 'Làm Quiz Tìm Quà | GiftWise',
    description: '8 câu hỏi · AI phân tích · 9 gợi ý quà hoàn hảo — miễn phí, không cần đăng ký.',
    url: 'https://giftwise-lhsm.vercel.app/quiz',
  },
  alternates: {
    canonical: 'https://giftwise-lhsm.vercel.app/quiz',
  },
};

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

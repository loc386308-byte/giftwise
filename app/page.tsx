'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';

// FAQ structured data (rendered as JSON-LD script in JSX)
const FAQ_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'GiftWise hoạt động như thế nào?',
      acceptedAnswer: { '@type': 'Answer', text: 'Bạn trả lời 8 câu hỏi về dịp tặng, người nhận, cung hoàng đạo, tính cách, sở thích và ngân sách. AI sẽ phân tích và gợi ý 9 món quà phù hợp nhất kèm giá và nơi mua.' },
    },
    {
      '@type': 'Question',
      name: 'GiftWise có miễn phí không?',
      acceptedAnswer: { '@type': 'Answer', text: 'Hoàn toàn miễn phí, không cần đăng ký tài khoản. Bạn chỉ mất khoảng 2 phút để hoàn thành quiz và nhận gợi ý.' },
    },
    {
      '@type': 'Question',
      name: 'AI gợi ý quà có chính xác không?',
      acceptedAnswer: { '@type': 'Answer', text: 'Engine gợi ý của GiftWise phân tích kết hợp 8 yếu tố: cung hoàng đạo, tính cách, sở thích, tuổi, giới tính, mối quan hệ, dịp và ngân sách. Kết quả được cá nhân hóa cao và phù hợp với nhiều trường hợp thực tế.' },
    },
    {
      '@type': 'Question',
      name: 'Tôi có thể mua quà ở đâu sau khi nhận gợi ý?',
      acceptedAnswer: { '@type': 'Answer', text: 'GiftWise cung cấp 2 kênh mua: Online (Shopee, TikTok Shop) với lọc giá và đánh giá; và Offline với bản đồ cửa hàng gần vị trí GPS của bạn.' },
    },
    {
      '@type': 'Question',
      name: 'GiftWise có hỗ trợ nhiều ngân sách không?',
      acceptedAnswer: { '@type': 'Answer', text: 'Có — GiftWise hỗ trợ 5 mức ngân sách từ dưới 100,000đ đến trên 1,000,000đ. Tất cả gợi ý đều được lọc chặt theo mức bạn chọn.' },
    },
  ],
};

const OCCASIONS = [
  { id: 'birthday', label: 'Sinh nhật', emoji: '🎂', color: '#FF6B9D' },
  { id: 'valentine', label: 'Valentine', emoji: '💝', color: '#EC4899' },
  { id: 'womensday', label: '8/3', emoji: '🌸', color: '#F472B6' },
  { id: 'christmas', label: 'Giáng sinh', emoji: '🎄', color: '#10B981' },
  { id: 'graduation', label: 'Ra trường', emoji: '🎓', color: '#6366F1' },
  { id: 'promotion', label: 'Thăng chức', emoji: '🚀', color: '#F59E0B' },
  { id: 'anniversary', label: 'Kỷ niệm', emoji: '💍', color: '#8B5CF6' },
  { id: 'other', label: 'Dịp khác', emoji: '🎁', color: '#14B8A6' },
];

const STEPS = [
  { emoji: '💬', label: 'Trả lời 8 câu ngắn' },
  { emoji: '🤖', label: 'AI phân tích & gợi ý' },
  { emoji: '🛍️', label: 'Tìm nơi mua ngay' },
];

const TESTIMONIALS = [
  {
    name: 'Minh Anh',
    role: 'Sinh viên năm 3',
    text: 'Trước giờ tặng quà tao hay bị chê vô vị lắm 😂 Dùng GiftWise xong bạn tao nói "ủa sao mày hiểu tao vậy?" — cảm ơn AI!',
    avatar: '👩‍🎓',
    rating: 5,
  },
  {
    name: 'Thanh Hùng',
    role: 'Nhân viên văn phòng',
    text: 'Tặng quà sinh nhật sếp mà không biết mua gì. GiftWise gợi ý set trà cao cấp — sếp thích lắm, còn được khen là tinh tế nữa!',
    avatar: '👨‍💼',
    rating: 5,
  },
  {
    name: 'Thu Trang',
    role: 'Bà mẹ 2 con',
    text: 'Mua quà cho trẻ con rất khó vì hay hết trend nhanh. GiftWise gợi ý đúng đồ chơi phù hợp độ tuổi và sở thích, con gái thích lắm!',
    avatar: '👩‍👧',
    rating: 5,
  },
];

export default function HomePage() {
  const router = useRouter();

  const handleOccasionClick = (occasionId: string) => {
    router.push(`/quiz?occasion=${occasionId}`);
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSONLD) }} />
      <Header />

      <main style={{ paddingTop: '60px' }}>
        {/* ==============================
            HERO SECTION
           ============================== */}
        <section
          style={{
            minHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4rem 1.5rem 2rem',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background blobs */}
          <div
            style={{
              position: 'absolute',
              top: '10%',
              left: '-10%',
              width: '400px',
              height: '400px',
              background: 'radial-gradient(circle, rgba(255,107,157,0.15) 0%, transparent 70%)',
              borderRadius: '50%',
              filter: 'blur(40px)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '10%',
              right: '-10%',
              width: '350px',
              height: '350px',
              background: 'radial-gradient(circle, rgba(167,139,250,0.2) 0%, transparent 70%)',
              borderRadius: '50%',
              filter: 'blur(40px)',
              pointerEvents: 'none',
            }}
          />

          {/* Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'linear-gradient(135deg, #FFF1F8, #F5F3FF)',
              border: '1px solid rgba(255,107,157,0.25)',
              borderRadius: '999px',
              padding: '0.4rem 1rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#C084FC',
              marginBottom: '1.5rem',
            }}
          >
            <span>✨</span>
            <span>Powered by Claude AI · Hoàn toàn miễn phí</span>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontSize: 'clamp(2rem, 6vw, 4rem)',
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              marginBottom: '1.25rem',
              maxWidth: '700px',
            }}
          >
            Hết lo tặng quà sai —<br />
            <span className="gradient-text">để AI gợi ý cho bạn</span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
              color: 'var(--color-text-muted)',
              maxWidth: '520px',
              marginBottom: '2.5rem',
              lineHeight: 1.7,
            }}
          >
            Trả lời 8 câu hỏi đơn giản, AI sẽ gợi ý 6 món quà được cá nhân hóa —
            kèm theo giá và nơi mua ngay trên Shopee, TikTok Shop.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1rem' }}>
            <Link href="/quiz" className="btn-primary pulse-glow" style={{ fontSize: '1.05rem', padding: '1rem 2.5rem' }}>
              🎁 Bắt đầu gợi ý quà
            </Link>
            <a
              href="#occasions"
              className="btn-secondary"
              style={{ fontSize: '1.05rem', padding: '1rem 2rem' }}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('occasions')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Xem theo dịp ↓
            </a>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginTop: '0.5rem' }}>
            Miễn phí · Không cần đăng ký · Chỉ mất 2 phút
          </p>

          {/* Floating emoji decoration */}
          <div
            className="float-animation"
            style={{
              position: 'absolute',
              top: '20%',
              right: '8%',
              fontSize: '3rem',
              opacity: 0.7,
              animationDelay: '0s',
              display: 'none',
            }}
          >
            🎁
          </div>
          <div
            className="float-animation"
            style={{
              position: 'absolute',
              bottom: '25%',
              left: '6%',
              fontSize: '2.5rem',
              opacity: 0.6,
              animationDelay: '1.5s',
              display: 'none',
            }}
          >
            💝
          </div>

          {/* Scroll indicator */}
          <div
            style={{
              position: 'absolute',
              bottom: '2rem',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.25rem',
              color: 'var(--color-text-light)',
              fontSize: '0.75rem',
              animation: 'float 2s ease-in-out infinite',
            }}
          >
            <span>Cuộn xuống</span>
            <span style={{ fontSize: '1.2rem' }}>↓</span>
          </div>
        </section>

        {/* ==============================
            OCCASIONS SECTION
           ============================== */}
        <section
          id="occasions"
          style={{
            padding: '5rem 1.5rem',
            background: 'linear-gradient(135deg, #FFF1F8 0%, #F5F3FF 100%)',
          }}
        >
          <div className="container-max">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2
                style={{
                  fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                  fontWeight: 800,
                  marginBottom: '0.75rem',
                }}
              >
                Chọn nhanh theo{' '}
                <span className="gradient-text">dịp lễ</span>
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem' }}>
                Bấm vào dịp bạn cần → tự động điền vào quiz
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: '1rem',
                maxWidth: '700px',
                margin: '0 auto',
              }}
            >
              {OCCASIONS.map((occasion) => (
                <button
                  key={occasion.id}
                  onClick={() => handleOccasionClick(occasion.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.625rem',
                    padding: '1.25rem 1rem',
                    borderRadius: '20px',
                    border: '2px solid transparent',
                    background: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 12px rgba(26,26,46,0.06)',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget;
                    el.style.borderColor = occasion.color;
                    el.style.transform = 'translateY(-4px)';
                    el.style.boxShadow = `0 8px 24px ${occasion.color}30`;
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget;
                    el.style.borderColor = 'transparent';
                    el.style.transform = 'translateY(0)';
                    el.style.boxShadow = '0 2px 12px rgba(26,26,46,0.06)';
                  }}
                >
                  <span style={{ fontSize: '2.5rem', lineHeight: 1 }}>{occasion.emoji}</span>
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      color: 'var(--color-text)',
                    }}
                  >
                    {occasion.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ==============================
            HOW IT WORKS
           ============================== */}
        <section style={{ padding: '5rem 1.5rem', background: 'var(--color-bg)' }}>
          <div className="container-max">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2
                style={{
                  fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                  fontWeight: 800,
                  marginBottom: '0.75rem',
                }}
              >
                Chỉ{' '}
                <span className="gradient-text">3 bước</span>
                {' '}đơn giản
              </h2>
              <p style={{ color: 'var(--color-text-muted)' }}>
                Không cần tài khoản, không cần thẻ tín dụng
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1.5rem',
                maxWidth: '800px',
                margin: '0 auto',
              }}
            >
              {STEPS.map((step, index) => (
                <div
                  key={index}
                  className="card"
                  style={{
                    padding: '2rem 1.5rem',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'visible',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '-14px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '28px',
                      height: '28px',
                      background: 'var(--gradient-main)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                    }}
                  >
                    {index + 1}
                  </div>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{step.emoji}</div>
                  <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)' }}>
                    {step.label}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <Link href="/quiz" className="btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2.5rem' }}>
                Thử ngay — Miễn phí 🎉
              </Link>
            </div>
          </div>
        </section>

        {/* ==============================
            TESTIMONIALS
           ============================== */}
        <section
          style={{
            padding: '5rem 1.5rem',
            background: 'linear-gradient(135deg, #F5F3FF 0%, #FFF1F8 100%)',
          }}
        >
          <div className="container-max">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2
                style={{
                  fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                  fontWeight: 800,
                  marginBottom: '0.75rem',
                }}
              >
                Người dùng nói gì về{' '}
                <span className="gradient-text">GiftWise</span>?
              </h2>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {TESTIMONIALS.map((t, index) => (
                <div
                  key={index}
                  className="card"
                  style={{ padding: '1.75rem' }}
                >
                  {/* Stars */}
                  <div className="stars" style={{ marginBottom: '1rem', fontSize: '1rem' }}>
                    {'⭐'.repeat(t.rating)}
                  </div>
                  <p
                    style={{
                      color: 'var(--color-text)',
                      fontSize: '0.95rem',
                      lineHeight: 1.7,
                      marginBottom: '1.25rem',
                      fontStyle: 'italic',
                    }}
                  >
                    "{t.text}"
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        background: 'linear-gradient(135deg, #FFF1F8, #F5F3FF)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                      }}
                    >
                      {t.avatar}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t.name}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==============================
            FINAL CTA
           ============================== */}
        <section
          style={{
            padding: '5rem 1.5rem',
            textAlign: 'center',
            background: 'var(--color-bg)',
          }}
        >
          <div className="container-max">
            <div
              style={{
                background: 'var(--gradient-main)',
                borderRadius: '32px',
                padding: 'clamp(2.5rem, 6vw, 4rem) 2rem',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'2\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                  pointerEvents: 'none',
                }}
              />
              <h2
                style={{
                  fontSize: 'clamp(1.75rem, 4vw, 3rem)',
                  fontWeight: 900,
                  color: 'white',
                  marginBottom: '1rem',
                  letterSpacing: '-0.02em',
                }}
              >
                Sẵn sàng tìm món quà hoàn hảo? 🎁
              </h2>
              <p
                style={{
                  color: 'rgba(255,255,255,0.85)',
                  fontSize: '1.1rem',
                  marginBottom: '2rem',
                  maxWidth: '500px',
                  margin: '0 auto 2rem',
                  lineHeight: 1.7,
                }}
              >
                Chỉ 2 phút trả lời quiz — AI sẽ gợi ý 6 món quà được cá nhân hóa riêng cho người bạn yêu thương.
              </p>
              <Link
                href="/quiz"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'white',
                  color: '#FF6B9D',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  padding: '1rem 2.5rem',
                  borderRadius: '50px',
                  textDecoration: 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  transition: 'all 0.2s ease',
                }}
              >
                ✨ Bắt đầu ngay — Miễn phí
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer
          style={{
            padding: '2rem 1.5rem',
            borderTop: '1px solid var(--color-border)',
            textAlign: 'center',
            color: 'var(--color-text-light)',
            fontSize: '0.875rem',
          }}
        >
          <p>
            Made with ❤️ by{' '}
            <span className="gradient-text" style={{ fontWeight: 700 }}>GiftWise</span>
            {' '}· Powered by Claude AI
          </p>
          <p style={{ marginTop: '0.5rem' }}>
            <Link href="/blog" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: '0.8rem' }}>📚 Blog ý tưởng quà tặng</Link>
          </p>
        </footer>
      </main>
    </>
  );
}

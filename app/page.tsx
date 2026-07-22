'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';

const FAQ_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'GiftWise hoạt động như thế nào?', acceptedAnswer: { '@type': 'Answer', text: 'Bạn trả lời 8 câu hỏi về dịp tặng, người nhận, cung hoàng đạo, tính cách, sở thích và ngân sách. AI sẽ phân tích và gợi ý 9 món quà phù hợp nhất kèm giá và nơi mua.' } },
    { '@type': 'Question', name: 'GiftWise có miễn phí không?', acceptedAnswer: { '@type': 'Answer', text: 'Hoàn toàn miễn phí, không cần đăng ký tài khoản. Bạn chỉ mất khoảng 2 phút để hoàn thành quiz và nhận gợi ý.' } },
    { '@type': 'Question', name: 'AI gợi ý quà có chính xác không?', acceptedAnswer: { '@type': 'Answer', text: 'Engine gợi ý của GiftWise phân tích kết hợp 8 yếu tố: cung hoàng đạo, tính cách, sở thích, tuổi, giới tính, mối quan hệ, dịp và ngân sách.' } },
    { '@type': 'Question', name: 'Tôi có thể mua quà ở đâu?', acceptedAnswer: { '@type': 'Answer', text: 'GiftWise cung cấp 2 kênh mua: Online (Shopee, TikTok Shop) và Offline với bản đồ cửa hàng gần vị trí GPS của bạn.' } },
  ],
};

const OCCASIONS = [
  { id: 'birthday',    label: 'Sinh nhật',   emoji: '🎂', glow: 'rgba(212,168,232,0.4)' },
  { id: 'valentine',   label: 'Valentine',   emoji: '💝', glow: 'rgba(242,196,208,0.4)' },
  { id: 'womensday',   label: '8/3',         emoji: '🌸', glow: 'rgba(212,168,232,0.35)' },
  { id: 'christmas',   label: 'Giáng sinh',  emoji: '🎄', glow: 'rgba(184,232,217,0.4)' },
  { id: 'graduation',  label: 'Ra trường',   emoji: '🎓', glow: 'rgba(155,181,232,0.4)' },
  { id: 'promotion',   label: 'Thăng chức',  emoji: '🚀', glow: 'rgba(255,224,130,0.4)' },
  { id: 'anniversary', label: 'Kỷ niệm',    emoji: '💍', glow: 'rgba(201,187,232,0.4)' },
  { id: 'other',       label: 'Dịp khác',   emoji: '🎁', glow: 'rgba(184,169,217,0.4)' },
];

const STEPS = [
  { emoji: '💬', label: 'Trả lời 8 câu ngắn', sub: 'Về người nhận, dịp, ngân sách...' },
  { emoji: '🤖', label: 'AI phân tích & gợi ý', sub: 'AI thông minh chọn 9 món hoàn hảo nhất' },
  { emoji: '🛍️', label: 'Tìm nơi mua ngay', sub: 'Online Shopee/TikTok hoặc cửa hàng gần bạn' },
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

// Reusable pastel section divider
const SectionDivider = () => (
  <div style={{ textAlign: 'center', padding: '0.5rem 0', lineHeight: 1, color: 'rgba(201,187,232,0.35)', letterSpacing: '0.5rem', fontSize: '0.8rem' }}>
    ✦ ✧ ✦ ✧ ✦
  </div>
);

export default function HomePage() {
  const router = useRouter();
  const handleOccasionClick = (id: string) => router.push(`/quiz?occasion=${id}`);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSONLD) }} />
      <Header />

      <main style={{ paddingTop: '60px' }}>

        {/* ══════════════════════════════════════════
            HERO
        ══════════════════════════════════════════ */}
        <section
          style={{
            minHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4rem 1.5rem 3rem',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          {/* Glow blobs */}
          <div style={{ position: 'absolute', top: '15%', left: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(184,169,217,0.12) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(50px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '20%', right: '8%', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(242,196,208,0.12) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(50px)', pointerEvents: 'none' }} />

          {/* Floating cat mascot */}
          <div
            className="float-animation"
            style={{ fontSize: '5rem', marginBottom: '1.5rem', lineHeight: 1, filter: 'drop-shadow(0 8px 24px rgba(184,169,217,0.4))' }}
            aria-hidden="true"
          >
            🐱
          </div>

          {/* AI badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(212,168,232,0.15)',
              border: '1px solid rgba(212,168,232,0.3)',
              backdropFilter: 'blur(12px)',
              borderRadius: '999px',
              padding: '0.4rem 1.1rem',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: 'var(--lavender-light)',
              marginBottom: '1.75rem',
              letterSpacing: '0.02em',
            }}
          >
            <span>✦</span>
            <span>Trí tuệ nhân tạo AI · Hoàn toàn miễn phí</span>
            <span>✦</span>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontFamily: "'Comfortaa', 'Nunito', sans-serif",
              fontSize: 'clamp(2rem, 6vw, 3.75rem)',
              fontWeight: 700,
              lineHeight: 1.15,
              marginBottom: '1.25rem',
              maxWidth: '680px',
              color: 'var(--cream)',
            }}
          >
            Hết lo tặng quà sai —{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #d4a8e8 0%, #9bb5e8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              để AI gợi ý cho bạn ✨
            </span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(0.95rem, 2.5vw, 1.15rem)',
              color: 'var(--color-text-muted)',
              maxWidth: '500px',
              marginBottom: '2.75rem',
              lineHeight: 1.75,
            }}
          >
            Trả lời 8 câu hỏi đơn giản — AI phân tích cung hoàng đạo, tính cách & ngân sách để gợi ý 6 món quà hoàn hảo kèm nơi mua.
          </p>

          {/* CTA */}
          <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1rem' }}>
            <Link href="/quiz" className="btn-primary pulse-glow" style={{ fontSize: '1.05rem', padding: '1rem 2.5rem' }}>
              🎁 Bắt đầu gợi ý quà
            </Link>
            <a
              href="#occasions"
              className="btn-secondary"
              style={{ fontSize: '1rem', padding: '1rem 1.75rem' }}
              onClick={(e) => { e.preventDefault(); document.getElementById('occasions')?.scrollIntoView({ behavior: 'smooth' }); }}
            >
              Chọn theo dịp 🌙
            </a>
          </div>

          <p style={{ fontSize: '0.78rem', color: 'var(--color-text-light)', marginTop: '0.25rem', letterSpacing: '0.04em' }}>
            ✧ Miễn phí · Không cần đăng ký · Chỉ mất 2 phút ✧
          </p>

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
              fontSize: '0.72rem',
              animation: 'float 2.5s ease-in-out infinite',
              letterSpacing: '0.06em',
            }}
          >
            <span>cuộn xuống</span>
            <span style={{ fontSize: '1.1rem' }}>↓</span>
          </div>
        </section>

        <SectionDivider />

        {/* ══════════════════════════════════════════
            OCCASIONS
        ══════════════════════════════════════════ */}
        <section id="occasions" style={{ padding: '5rem 1.5rem' }}>
          <div className="container-max">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2
                style={{
                  fontFamily: "'Comfortaa', 'Nunito', sans-serif",
                  fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                  fontWeight: 700,
                  marginBottom: '0.75rem',
                  color: 'var(--cream)',
                }}
              >
                Chọn nhanh theo{' '}
                <span style={{ background: 'linear-gradient(135deg, #d4a8e8, #9bb5e8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  dịp lễ 🌙
                </span>
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
                Bấm vào dịp bạn cần → tự động điền vào quiz
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: '0.875rem',
                maxWidth: '680px',
                margin: '0 auto',
              }}
            >
              {OCCASIONS.map((occ) => (
                <button
                  key={occ.id}
                  onClick={() => handleOccasionClick(occ.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '1.25rem 0.75rem',
                    borderRadius: '20px',
                    border: '1.5px solid rgba(201,187,232,0.2)',
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(12px)',
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                    fontFamily: "'Nunito', sans-serif",
                    color: 'var(--color-text)',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget;
                    el.style.borderColor = 'rgba(212,168,232,0.5)';
                    el.style.transform = 'translateY(-4px) scale(1.04)';
                    el.style.boxShadow = `0 8px 28px ${occ.glow}`;
                    el.style.background = 'rgba(212,168,232,0.12)';
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget;
                    el.style.borderColor = 'rgba(201,187,232,0.2)';
                    el.style.transform = 'translateY(0) scale(1)';
                    el.style.boxShadow = 'none';
                    el.style.background = 'rgba(255,255,255,0.05)';
                  }}
                >
                  <span style={{ fontSize: '2.25rem', lineHeight: 1 }}>{occ.emoji}</span>
                  <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--lavender-light)' }}>
                    {occ.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* ══════════════════════════════════════════
            HOW IT WORKS
        ══════════════════════════════════════════ */}
        <section style={{ padding: '5rem 1.5rem' }}>
          <div className="container-max">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2
                style={{
                  fontFamily: "'Comfortaa', 'Nunito', sans-serif",
                  fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                  fontWeight: 700,
                  marginBottom: '0.75rem',
                  color: 'var(--cream)',
                }}
              >
                Chỉ{' '}
                <span style={{ background: 'linear-gradient(135deg, #d4a8e8, #9bb5e8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  3 bước
                </span>
                {' '}đơn giản ✦
              </h2>
              <p style={{ color: 'var(--color-text-muted)' }}>Không cần tài khoản · không cần thẻ tín dụng</p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1.5rem',
                maxWidth: '820px',
                margin: '0 auto',
              }}
            >
              {STEPS.map((step, i) => (
                <div
                  key={i}
                  className="card card-lavender"
                  style={{ padding: '2rem 1.5rem', textAlign: 'center', position: 'relative', overflow: 'visible' }}
                >
                  {/* Step number bubble */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '-14px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '28px',
                      height: '28px',
                      background: 'linear-gradient(135deg, #c9a8e8, #9bb0e8)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#1a1535',
                      fontWeight: 800,
                      fontSize: '0.78rem',
                      boxShadow: '0 4px 12px rgba(184,169,217,0.5)',
                    }}
                  >
                    {i + 1}
                  </div>
                  <div style={{ fontSize: '2.75rem', marginBottom: '0.875rem' }}>{step.emoji}</div>
                  <p style={{ fontFamily: "'Comfortaa','Nunito',sans-serif", fontWeight: 700, fontSize: '1rem', color: 'var(--cream)', marginBottom: '0.4rem' }}>
                    {step.label}
                  </p>
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', lineHeight: 1.55 }}>
                    {step.sub}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <Link href="/quiz" className="btn-primary" style={{ fontSize: '1.05rem', padding: '1rem 2.5rem' }}>
                Thử ngay — Miễn phí 🎉
              </Link>
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* ══════════════════════════════════════════
            TESTIMONIALS
        ══════════════════════════════════════════ */}
        <section style={{ padding: '5rem 1.5rem' }}>
          <div className="container-max">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2
                style={{
                  fontFamily: "'Comfortaa', 'Nunito', sans-serif",
                  fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                  fontWeight: 700,
                  marginBottom: '0.75rem',
                  color: 'var(--cream)',
                }}
              >
                Người dùng nói gì về{' '}
                <span style={{ background: 'linear-gradient(135deg, #f2c4d0, #d4a8e8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  GiftWise
                </span>
                ? 🌟
              </h2>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="card card-blush" style={{ padding: '1.75rem' }}>
                  <div style={{ marginBottom: '0.875rem', fontSize: '1rem', color: '#ffe082', letterSpacing: '2px' }}>
                    {'★'.repeat(t.rating)}
                  </div>
                  <p style={{ color: 'var(--color-text)', fontSize: '0.92rem', lineHeight: 1.75, marginBottom: '1.25rem', fontStyle: 'italic' }}>
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        background: 'rgba(212,168,232,0.2)',
                        border: '1px solid rgba(212,168,232,0.3)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.4rem',
                      }}
                    >
                      {t.avatar}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--cream)' }}>{t.name}</p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* ══════════════════════════════════════════
            FINAL CTA
        ══════════════════════════════════════════ */}
        <section style={{ padding: '5rem 1.5rem' }}>
          <div className="container-max">
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(184,169,217,0.2) 0%, rgba(155,181,232,0.15) 100%)',
                border: '1px solid rgba(201,187,232,0.25)',
                backdropFilter: 'blur(20px)',
                borderRadius: '36px',
                padding: 'clamp(2.5rem, 6vw, 4rem) 2rem',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Sparkle overlay */}
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                {['10%', '30%', '55%', '75%', '90%'].map((left, i) => (
                  <span
                    key={i}
                    style={{
                      position: 'absolute',
                      top: `${20 + i * 12}%`,
                      left,
                      color: 'rgba(255,224,130,0.3)',
                      fontSize: '14px',
                      animation: `deco-float ${6 + i}s ease-in-out infinite`,
                      animationDelay: `${i * 0.8}s`,
                    }}
                  >
                    ✦
                  </span>
                ))}
              </div>

              {/* Cat sleeping */}
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }} aria-hidden="true">😸</div>

              <h2
                style={{
                  fontFamily: "'Comfortaa', 'Nunito', sans-serif",
                  fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                  fontWeight: 700,
                  color: 'var(--cream)',
                  marginBottom: '1rem',
                }}
              >
                Sẵn sàng tìm món quà hoàn hảo? 🎁
              </h2>
              <p
                style={{
                  color: 'var(--color-text-muted)',
                  fontSize: '1.05rem',
                  marginBottom: '2rem',
                  maxWidth: '480px',
                  margin: '0 auto 2rem',
                  lineHeight: 1.75,
                }}
              >
                Chỉ 2 phút trả lời quiz — AI sẽ gợi ý 6 món quà được cá nhân hóa riêng cho người bạn yêu thương.
              </p>
              <Link href="/quiz" className="btn-primary" style={{ fontSize: '1.1rem', padding: '1.1rem 2.75rem' }}>
                ✨ Bắt đầu ngay — Miễn phí
              </Link>
              <p style={{ marginTop: '1.25rem', fontSize: '0.78rem', color: 'var(--color-text-light)', letterSpacing: '0.04em' }}>
                ✦ Không cần đăng ký · Không lưu thông tin cá nhân ✦
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer
          style={{
            padding: '2rem 1.5rem',
            borderTop: '1px solid rgba(201,187,232,0.12)',
            textAlign: 'center',
            color: 'var(--color-text-light)',
            fontSize: '0.82rem',
          }}
        >
          <p style={{ marginBottom: '0.5rem' }}>
            Made with 🐱 by{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #c9bbe8, #9bb5e8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: 700,
              }}
            >
              GiftWise
            </span>
          </p>
          <p>
            <Link href="/blog" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>
              📚 Blog ý tưởng quà tặng
            </Link>
          </p>
        </footer>
      </main>
    </>
  );
}

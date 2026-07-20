import type { Metadata } from 'next';
import Link from 'next/link';
import { BLOG_POSTS } from './posts';

export const metadata: Metadata = {
  title: 'Blog — Ý Tưởng Quà Tặng Theo Dịp',
  description:
    'Khám phá hàng chục ý tưởng quà tặng phù hợp từng dịp: sinh nhật, Valentine, tốt nghiệp, kỷ niệm — phân theo ngân sách và cung hoàng đạo.',
  openGraph: {
    title: 'Blog Ý Tưởng Quà Tặng | GiftWise',
    description: 'Tổng hợp gợi ý quà tặng theo dịp, theo cung hoàng đạo, và theo ngân sách.',
    url: 'https://giftwise-lhsm.vercel.app/blog',
  },
  alternates: { canonical: 'https://giftwise-lhsm.vercel.app/blog' },
};

const blogListJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: 'GiftWise Blog — Ý Tưởng Quà Tặng',
  url: 'https://giftwise-lhsm.vercel.app/blog',
  description: 'Tổng hợp ý tưởng quà tặng theo dịp và cung hoàng đạo',
  blogPost: BLOG_POSTS.map((p) => ({
    '@type': 'BlogPosting',
    headline: p.title,
    description: p.description,
    url: `https://giftwise-lhsm.vercel.app/blog/${p.slug}`,
    datePublished: p.date,
    author: { '@type': 'Organization', name: 'GiftWise' },
  })),
};

export default function BlogPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogListJsonLd) }}
      />

      <style>{`
        .blog-card {
          display: block;
          text-decoration: none;
          height: 100%;
        }
        .blog-card article {
          padding: 1.5rem;
          height: 100%;
          background: white;
          border-radius: 16px;
          border: 1px solid var(--color-border-light);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          cursor: pointer;
          box-sizing: border-box;
        }
        .blog-card article:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.10);
        }
        .blog-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 1.5rem;
        }
      `}</style>

      <main style={{ minHeight: '100dvh', background: 'var(--color-bg)' }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg,#FFF1F8 0%,#F5F3FF 100%)',
          padding: '4rem 1.5rem 3rem', textAlign: 'center',
        }}>
          <Link href="/" style={{ display: 'inline-block', marginBottom: '1.5rem', color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>
            ← Về trang chủ
          </Link>
          <div style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg,#FFF1F8,#F5F3FF)',
            border: '1px solid rgba(255,107,157,0.25)', borderRadius: '999px',
            padding: '0.3rem 1rem', fontSize: '0.78rem', fontWeight: 600,
            color: '#C084FC', marginBottom: '1.25rem',
          }}>
            📚 Ý tưởng quà tặng
          </div>
          <h1 style={{
            fontSize: 'clamp(1.75rem,5vw,3rem)', fontWeight: 900,
            letterSpacing: '-0.03em', marginBottom: '1rem',
            display: 'block',
          }}>
            Blog{' '}
            <span style={{
              background: 'var(--gradient-main)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              GiftWise
            </span>
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', maxWidth: '500px', margin: '0 auto' }}>
            Tổng hợp gợi ý quà theo dịp, theo cung hoàng đạo, và theo ngân sách — được cập nhật thường xuyên.
          </p>
        </div>

        {/* Articles grid */}
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1.5rem' }}>
          <div className="blog-grid">
            {BLOG_POSTS.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="blog-card">
                <article>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{post.emoji}</div>
                  <span style={{
                    fontSize: '0.68rem', fontWeight: 700, padding: '0.2rem 0.6rem',
                    background: 'linear-gradient(135deg,#FFF1F8,#F5F3FF)',
                    color: '#C084FC', borderRadius: '999px', marginBottom: '0.75rem',
                    display: 'inline-block', border: '1px solid rgba(192,132,252,0.3)',
                  }}>
                    {post.category}
                  </span>
                  <h2 style={{
                    fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)',
                    lineHeight: 1.4, margin: '0.5rem 0 0.75rem', letterSpacing: '-0.01em',
                  }}>
                    {post.title}
                  </h2>
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '1rem' }}>
                    {post.description}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.72rem', color: 'var(--color-text-light)' }}>
                    <span>📅 {new Date(post.date).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                    <span>⏱ {post.readTime}</span>
                  </div>
                </article>
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div style={{ marginTop: '4rem', textAlign: 'center', padding: '3rem', background: 'var(--gradient-main)', borderRadius: '24px' }}>
            <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>
              Tìm quà tặng ngay bằng AI 🎁
            </p>
            <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              Chỉ 2 phút trả lời quiz — AI gợi ý 9 món quà phù hợp hoàn toàn.
            </p>
            <Link href="/quiz" style={{
              display: 'inline-block', background: 'white', color: '#FF6B9D',
              fontWeight: 700, fontSize: '1rem', padding: '0.875rem 2rem',
              borderRadius: '50px', textDecoration: 'none',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }}>
              Bắt đầu gợi ý quà →
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

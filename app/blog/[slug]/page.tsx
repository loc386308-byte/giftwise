import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BLOG_POSTS } from '../posts';

// ─── generateStaticParams ─────────────────────────────────────────────────────
export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

// ─── generateMetadata ─────────────────────────────────────────────────────────
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) return { title: 'Bài viết không tồn tại' };
  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      url: `https://giftwise-lhsm.vercel.app/blog/${slug}`,
      authors: ['GiftWise'],
    },
    alternates: { canonical: `https://giftwise-lhsm.vercel.app/blog/${slug}` },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) notFound();

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { '@type': 'Organization', name: 'GiftWise', url: 'https://giftwise-lhsm.vercel.app' },
    publisher: { '@type': 'Organization', name: 'GiftWise' },
    url: `https://giftwise-lhsm.vercel.app/blog/${slug}`,
    keywords: post.tags.join(', '),
    inLanguage: 'vi',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <main style={{ minHeight: '100dvh', background: 'var(--color-bg)' }}>
        {/* Hero */}
        <div style={{
          background: 'linear-gradient(135deg,#FFF1F8 0%,#F5F3FF 100%)',
          padding: '3rem 1.5rem 2.5rem',
        }}>
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <Link href="/blog" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>
                ← Blog
              </Link>
              <span style={{ color: 'var(--color-border)' }}>/</span>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.2rem 0.6rem', background: 'linear-gradient(135deg,#FFF1F8,#F5F3FF)', color: '#C084FC', borderRadius: '999px', border: '1px solid rgba(192,132,252,0.3)' }}>
                {post.category}
              </span>
            </div>

            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{post.emoji}</div>
            <h1 style={{
              fontSize: 'clamp(1.5rem,4vw,2.25rem)', fontWeight: 900,
              letterSpacing: '-0.02em', lineHeight: 1.25, marginBottom: '1rem',
              color: 'var(--color-text)',
            }}>
              {post.title}
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              {post.description}
            </p>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: 'var(--color-text-light)', flexWrap: 'wrap' }}>
              <span>📅 {new Date(post.date).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
              <span>⏱ {post.readTime} đọc</span>
              <span>✍️ GiftWise</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <article style={{ maxWidth: '720px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
          <div
            style={{
              fontSize: '1rem', lineHeight: 1.8, color: 'var(--color-text)',
            }}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          <div style={{ marginTop: '2.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {post.tags.map((tag) => (
              <span key={tag} style={{
                fontSize: '0.72rem', padding: '0.25rem 0.7rem',
                background: 'var(--gradient-subtle)', color: 'var(--color-text-muted)',
                borderRadius: '999px', border: '1px solid var(--color-border-light)',
              }}>
                #{tag}
              </span>
            ))}
          </div>

          {/* CTA */}
          <div style={{
            marginTop: '3rem', padding: '2rem', borderRadius: '20px',
            background: 'var(--gradient-main)', textAlign: 'center',
          }}>
            <p style={{ fontWeight: 800, fontSize: '1.1rem', color: 'white', marginBottom: '0.5rem' }}>
              Muốn gợi ý quà cá nhân hóa hơn? 🎁
            </p>
            <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
              AI GiftWise phân tích cung hoàng đạo, tính cách và ngân sách để gợi ý quà chính xác nhất.
            </p>
            <Link href="/quiz" style={{
              display: 'inline-block', background: 'white', color: '#FF6B9D',
              fontWeight: 700, fontSize: '0.95rem', padding: '0.75rem 1.75rem',
              borderRadius: '50px', textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            }}>
              Bắt đầu gợi ý quà →
            </Link>
          </div>

          {/* Other posts */}
          <div style={{ marginTop: '3rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-text)' }}>
              Bài viết liên quan
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {BLOG_POSTS.filter((p) => p.slug !== slug).map((other) => (
                <Link key={other.slug} href={`/blog/${other.slug}`} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem', transition: 'transform 0.15s ease' }}>
                    <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{other.emoji}</span>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--color-text)', lineHeight: 1.4 }}>{other.title}</p>
                      <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>{other.readTime} đọc</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </article>
      </main>

      {/* Article prose styles */}
      <style>{`
        article h2 { font-size: 1.35rem; font-weight: 800; margin: 2rem 0 0.75rem; letter-spacing: -0.02em; color: var(--color-text); }
        article h3 { font-size: 1.1rem; font-weight: 700; margin: 1.5rem 0 0.5rem; color: var(--color-text); }
        article p { margin-bottom: 1rem; }
        article ul, article ol { padding-left: 1.5rem; margin-bottom: 1rem; }
        article li { margin-bottom: 0.4rem; }
        article strong { font-weight: 700; color: var(--color-text); }
        article a { color: #C084FC; text-decoration: underline; }
      `}</style>
    </>
  );
}

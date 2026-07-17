'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Product, OnlineSearchResult } from '@/types';
import Header from '@/components/layout/Header';

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          style={{
            color: star <= Math.round(rating) ? '#FCD34D' : '#E5E7EB',
            fontSize: '0.8rem',
          }}
        >
          ★
        </span>
      ))}
      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginLeft: '0.25rem' }}>
        ({rating.toFixed(1)})
      </span>
    </div>
  );
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  const isShopee = product.source === 'shopee';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className="card"
      style={{ overflow: 'hidden' }}
    >
      {/* Image */}
      <div style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', background: '#F9FAFB' }}>
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          style={{ objectFit: 'cover', transition: 'transform 0.3s ease' }}
          onMouseEnter={(e) => { (e.target as HTMLImageElement).style.transform = 'scale(1.05)'; }}
          onMouseLeave={(e) => { (e.target as HTMLImageElement).style.transform = 'scale(1)'; }}
          sizes="(max-width: 768px) 100vw, 300px"
        />

        {/* Badges */}
        <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          {product.badge && (
            <span
              className="badge"
              style={{
                background: product.badge === 'Giá tốt nhất'
                  ? 'var(--gradient-main)'
                  : product.badge === 'Viral TikTok'
                  ? '#000'
                  : '#FF6633',
                color: 'white',
              }}
            >
              {product.badge}
            </span>
          )}
          {product.discount && (
            <span className="badge" style={{ background: '#EF4444', color: 'white' }}>
              -{product.discount}%
            </span>
          )}
        </div>

        {/* Source badge */}
        <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }}>
          <span
            className="badge"
            style={{
              background: isShopee ? '#FF6633' : '#000',
              color: 'white',
            }}
          >
            {isShopee ? '🟠 Shopee' : '⚫ TikTok'}
          </span>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '1rem' }}>
        <p
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--color-text)',
            marginBottom: '0.5rem',
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {product.name}
        </p>

        <StarRating rating={product.rating} />
        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: '0.2rem' }}>
          Đã bán {product.sold.toLocaleString('vi-VN')}
        </p>

        {/* Price */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', margin: '0.75rem 0' }}>
          <span
            style={{
              fontSize: '1.15rem',
              fontWeight: 800,
              background: 'var(--gradient-main)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {product.price.toLocaleString('vi-VN')}đ
          </span>
          {product.originalPrice && (
            <span
              style={{
                fontSize: '0.8rem',
                color: 'var(--color-text-light)',
                textDecoration: 'line-through',
              }}
            >
              {product.originalPrice.toLocaleString('vi-VN')}đ
            </span>
          )}
        </div>

        {/* Buy button */}
        <a
          href={product.affiliateLink}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
          style={{
            width: '100%',
            justifyContent: 'center',
            padding: '0.625rem 1rem',
            fontSize: '0.875rem',
          }}
        >
          Mua ngay →
        </a>
      </div>
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
      {[...Array(6)].map((_, i) => (
        <div key={i} className="card" style={{ overflow: 'hidden' }}>
          <div className="skeleton" style={{ aspectRatio: '1', borderRadius: 0 }} />
          <div style={{ padding: '1rem' }}>
            <div className="skeleton" style={{ width: '100%', height: '14px', marginBottom: '6px' }} />
            <div className="skeleton" style={{ width: '60%', height: '14px', marginBottom: '0.75rem' }} />
            <div className="skeleton" style={{ width: '40%', height: '24px', marginBottom: '0.75rem' }} />
            <div className="skeleton" style={{ width: '100%', height: '36px', borderRadius: '999px' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function OnlineInner() {
  const searchParams = useSearchParams();
  const keyword = searchParams.get('keyword') || '';
  const giftName = searchParams.get('gift') || '';

  const [result, setResult] = useState<OnlineSearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'shopee' | 'tiktok'>('all');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/search-online?keyword=${encodeURIComponent(keyword)}`);
        const data = await res.json();
        if (data.error) setError(data.error);
        else setResult(data);
      } catch {
        setError('Không thể tải sản phẩm. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [keyword]);

  const filteredProducts = result?.products.filter((p) =>
    filter === 'all' ? true : p.source === filter
  ) || [];

  return (
    <>
      <Header />
      <main style={{ paddingTop: '60px', minHeight: '100dvh', background: 'var(--color-bg)' }}>
        {/* Page header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #FFF7ED 0%, #FFF1F8 100%)',
            padding: '2.5rem 1.5rem 2rem',
          }}
        >
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <Link href="/results" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>
                ← Gợi ý quà
              </Link>
              <span style={{ color: 'var(--color-border)' }}>/</span>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Mua Online</span>
            </div>
            <h1
              style={{
                fontSize: 'clamp(1.25rem, 3vw, 2rem)',
                fontWeight: 900,
                marginBottom: '0.375rem',
                letterSpacing: '-0.02em',
              }}
            >
              🛒 Mua Online
            </h1>
            {giftName && (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
                Kết quả cho: <strong style={{ color: 'var(--color-text)' }}>{giftName}</strong>
              </p>
            )}
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginTop: '0.25rem' }}>
              Từ khóa tìm kiếm: "{keyword}"
            </p>
          </div>
        </div>

        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem' }}>
          {/* Filter tabs */}
          {!loading && !error && result && (
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              {(['all', 'shopee', 'tiktok'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`chip ${filter === f ? 'selected' : ''}`}
                  style={{ fontFamily: 'inherit' }}
                >
                  {f === 'all' ? '📦 Tất cả' : f === 'shopee' ? '🟠 Shopee' : '⚫ TikTok Shop'}
                  {f !== 'all' && (
                    <span
                      style={{
                        background: 'var(--color-border)',
                        borderRadius: '999px',
                        padding: '0 0.3rem',
                        fontSize: '0.7rem',
                      }}
                    >
                      {result.products.filter((p) => p.source === f).length}
                    </span>
                  )}
                </button>
              ))}

              <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--color-text-muted)', alignSelf: 'center' }}>
                {filteredProducts.length} sản phẩm · Sắp xếp: Giá thấp nhất
              </span>
            </div>
          )}

          {loading ? (
            <LoadingSkeleton />
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
              <p style={{ fontSize: '2rem', marginBottom: '1rem' }}>😔</p>
              <p style={{ color: 'var(--color-text-muted)' }}>{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="btn-primary"
                style={{ marginTop: '1.5rem' }}
              >
                Thử lại
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {filteredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}

          {/* Note */}
          {!loading && !error && (
            <p
              style={{
                textAlign: 'center',
                fontSize: '0.75rem',
                color: 'var(--color-text-light)',
                marginTop: '2rem',
                padding: '1rem',
                background: 'white',
                borderRadius: '12px',
                border: '1px solid var(--color-border-light)',
              }}
            >
              💡 Sản phẩm được lấy từ Shopee và TikTok Shop. GiftWise có thể nhận hoa hồng từ các liên kết affiliate.
            </p>
          )}
        </div>
      </main>
    </>
  );
}

export default function OnlinePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OnlineInner />
    </Suspense>
  );
}

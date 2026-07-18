'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, OfflineSearchResult } from '@/types';
import Header from '@/components/layout/Header';

// ─── Star rating ──────────────────────────────────────────────────────────────
function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} style={{ color: star <= Math.round(rating) ? '#FCD34D' : '#E5E7EB', fontSize: '0.75rem' }}>★</span>
      ))}
      <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginLeft: '0.2rem' }}>
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

// ─── Store card ───────────────────────────────────────────────────────────────
function StoreCard({
  store, index, selected, onClick, userLocation,
}: {
  store: Store; index: number; selected: boolean; onClick: () => void;
  userLocation: { lat: number; lng: number } | null;
}) {
  const distanceKm = (store.distanceMeters / 1000).toFixed(1);

  // Direction URL: if we have user GPS use it as origin, else just destination
  const mapsUrl = userLocation
    ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${store.lat},${store.lng}&travelmode=walking`
    : `https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}&travelmode=walking`;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.07 }}
      onClick={onClick}
      className="card"
      style={{
        padding: '1.25rem', cursor: 'pointer',
        border: selected ? '2px solid var(--color-accent-1)' : '1px solid var(--color-border-light)',
        background: selected ? 'linear-gradient(135deg, #FFF1F8, #F5F3FF)' : 'white',
        marginBottom: '0.75rem', transition: 'all 0.2s ease',
        boxShadow: selected ? '0 4px 16px rgba(168,85,247,0.12)' : 'none',
      }}
    >
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        {/* Icon */}
        <div style={{
          width: '46px', height: '46px',
          background: selected ? 'var(--gradient-main)' : 'var(--gradient-subtle)',
          borderRadius: '14px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0,
        }}>
          🏪
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Rank badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
            {index === 0 && (
              <span style={{
                fontSize: '0.6rem', fontWeight: 800, padding: '0.15rem 0.45rem',
                background: 'linear-gradient(135deg,#f59e0b,#ef4444)', color: 'white',
                borderRadius: '999px', letterSpacing: '0.02em',
              }}>🏆 GẦN NHẤT</span>
            )}
            <h3 style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--color-text)', margin: 0 }}>
              {store.name}
            </h3>
            <span className="badge" style={{
              background: store.openNow ? 'var(--color-success-bg)' : '#FEE2E2',
              color: store.openNow ? '#059669' : '#DC2626',
            }}>
              {store.openNow ? '● Đang mở' : '○ Đã đóng'}
            </span>
          </div>

          <StarRating rating={store.rating} />

          {/* Address */}
          <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.375rem', marginBottom: '0.5rem', lineHeight: 1.5 }}>
            📍 {store.address}
          </p>

          {/* Meta */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--color-text-light)' }}>
            <span>🚶 {distanceKm} km</span>
            {store.hours && <span>⏰ {store.hours}</span>}
            {store.phone && <span>📞 {store.phone}</span>}
          </div>

          {/* Features */}
          {store.features && store.features.length > 0 && (
            <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
              {store.features.map((f, i) => (
                <span key={i} style={{
                  fontSize: '0.68rem', padding: '0.15rem 0.5rem',
                  background: 'var(--gradient-subtle)', color: 'var(--color-text-muted)',
                  borderRadius: '999px', border: '1px solid var(--color-border-light)',
                }}>
                  {f}
                </span>
              ))}
            </div>
          )}

          {/* Directions button */}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.875rem', padding: '0.45rem 1rem', fontSize: '0.8rem' }}
          >
            🗺️ Chỉ đường từ vị trí của bạn
          </a>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Map component ────────────────────────────────────────────────────────────
function MapVisualization({
  stores, selectedStore, userLocation,
}: {
  stores: Store[]; selectedStore: Store | null;
  userLocation: { lat: number; lng: number } | null;
}) {
  const target = selectedStore || stores[0];

  // Build Google Maps embed URL
  // If user location available: show route from user → store
  // Otherwise: show store location
  const getMapSrc = () => {
    if (!target) {
      const center = userLocation || { lat: 10.7769, lng: 106.7009 };
      return `https://maps.google.com/maps?q=${center.lat},${center.lng}&z=15&output=embed`;
    }
    if (userLocation) {
      // Directions embed: origin = user, destination = store
      return `https://maps.google.com/maps?saddr=${userLocation.lat},${userLocation.lng}&daddr=${target.lat},${target.lng}&output=embed`;
    }
    return `https://maps.google.com/maps?q=${target.lat},${target.lng}&z=16&output=embed`;
  };

  return (
    <div style={{
      borderRadius: '20px', overflow: 'hidden',
      height: '100%', minHeight: '420px', position: 'relative',
      boxShadow: 'var(--shadow-md)', border: '1px solid var(--color-border-light)',
    }}>
      <iframe
        key={`${target?.id}-${userLocation?.lat}`}
        src={getMapSrc()}
        style={{ width: '100%', height: '100%', border: 'none', minHeight: '420px' }}
        title="Bản đồ chỉ đường"
        loading="lazy"
        allowFullScreen
      />

      {/* Info overlay bottom */}
      <div style={{
        position: 'absolute', bottom: '1rem', left: '1rem', right: '1rem',
        background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(12px)',
        borderRadius: '14px', padding: '0.875rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
        border: '1px solid rgba(255,255,255,0.8)',
      }}>
        {target ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🏪</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {target.name}
              </p>
              <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', margin: '0.1rem 0 0' }}>
                {userLocation
                  ? `📍 Đường từ vị trí của bạn → ${(target.distanceMeters / 1000).toFixed(1)} km`
                  : `📍 ${target.address}`}
              </p>
            </div>
            <span style={{
              fontSize: '0.7rem', fontWeight: 700, padding: '0.25rem 0.6rem',
              background: target.openNow ? '#d1fae5' : '#fee2e2',
              color: target.openNow ? '#065f46' : '#991b1b',
              borderRadius: '999px', flexShrink: 0,
            }}>
              {target.openNow ? '● Mở cửa' : '○ Đóng cửa'}
            </span>
          </div>
        ) : (
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0, textAlign: 'center' }}>
            📍 Chọn cửa hàng bên trái để xem đường đi
          </p>
        )}
      </div>
    </div>
  );
}

// ─── GPS permission prompt ────────────────────────────────────────────────────
function GpsPrompt({ onRetry }: { onRetry: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'linear-gradient(135deg,#fffbeb,#fef3c7)',
        border: '1px solid #fcd34d', borderRadius: '16px',
        padding: '1.25rem 1.5rem', marginBottom: '1rem',
        display: 'flex', alignItems: 'flex-start', gap: '0.875rem',
      }}
    >
      <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>📡</span>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 700, fontSize: '0.88rem', color: '#92400e', marginBottom: '0.25rem' }}>
          Cho phép định vị để tìm đúng cửa hàng gần bạn nhất!
        </p>
        <p style={{ fontSize: '0.78rem', color: '#b45309', lineHeight: 1.5, marginBottom: '0.5rem' }}>
          Trên trình duyệt, nhấn vào 🔒 hoặc biểu tượng vị trí trên thanh địa chỉ → Cho phép truy cập vị trí.
        </p>
        <button
          onClick={onRetry}
          style={{
            fontSize: '0.78rem', fontWeight: 700, padding: '0.35rem 0.875rem',
            borderRadius: '8px', border: 'none', cursor: 'pointer',
            background: '#f59e0b', color: 'white', fontFamily: 'inherit',
          }}
        >
          🔄 Thử lại định vị
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main inner component ─────────────────────────────────────────────────────
function OfflineInner() {
  const searchParams = useSearchParams();
  const keyword = searchParams.get('keyword') || '';
  const giftName = searchParams.get('gift') || '';

  const [result, setResult] = useState<OfflineSearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'asking' | 'granted' | 'denied'>('asking');

  const fetchStores = useCallback(async (lat: number, lng: number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/search-offline?keyword=${encodeURIComponent(keyword)}&lat=${lat}&lng=${lng}`);
      const data = await res.json();
      if (data.error) setError(data.error);
      else {
        setResult(data);
        setSelectedStore(data.stores[0] || null);
      }
    } catch {
      setError('Không thể tải cửa hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [keyword]);

  const requestLocation = useCallback(() => {
    setLocationStatus('asking');
    setLoading(true);
    if (!navigator.geolocation) {
      setLocationStatus('denied');
      fetchStores(10.7769, 106.7009);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setLocationStatus('granted');
        fetchStores(loc.lat, loc.lng);
      },
      () => {
        setLocationStatus('denied');
        fetchStores(10.7769, 106.7009);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, [fetchStores]);

  useEffect(() => {
    requestLocation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Header />
      <main style={{ paddingTop: '60px', minHeight: '100dvh', background: 'var(--color-bg)' }}>

        {/* Page header */}
        <div style={{ background: 'linear-gradient(135deg, #F0FDF4 0%, #F5F3FF 100%)', padding: '2.5rem 1.5rem 2rem' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <Link href="/results" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>
                ← Gợi ý quà
              </Link>
              <span style={{ color: 'var(--color-border)' }}>/</span>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Cửa hàng gần đây</span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.25rem, 3vw, 2rem)', fontWeight: 900, marginBottom: '0.375rem', letterSpacing: '-0.02em' }}>
              📍 Cửa hàng gần đây
            </h1>
            {giftName && (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
                Tìm nơi mua: <strong style={{ color: 'var(--color-text)' }}>{giftName}</strong>
              </p>
            )}

            {/* Location status badge */}
            <AnimatePresence mode="wait">
              {locationStatus === 'asking' && (
                <motion.div
                  key="asking"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    background: '#EFF6FF', border: '1px solid #93C5FD',
                    borderRadius: '8px', padding: '0.375rem 0.75rem',
                    fontSize: '0.8rem', color: '#1E40AF', marginTop: '0.75rem',
                  }}
                >
                  <motion.span animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} style={{ display: 'inline-block' }}>
                    📡
                  </motion.span>
                  Đang lấy vị trí GPS của bạn...
                </motion.div>
              )}
              {locationStatus === 'granted' && userLocation && (
                <motion.div
                  key="granted"
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    background: '#F0FDF4', border: '1px solid #86EFAC',
                    borderRadius: '8px', padding: '0.375rem 0.75rem',
                    fontSize: '0.8rem', color: '#166534', marginTop: '0.75rem',
                  }}
                >
                  ✅ Đã lấy vị trí thực — hiển thị cửa hàng gần bạn nhất
                </motion.div>
              )}
              {locationStatus === 'denied' && (
                <motion.div
                  key="denied"
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    background: '#FFFBEB', border: '1px solid #FCD34D',
                    borderRadius: '8px', padding: '0.375rem 0.75rem',
                    fontSize: '0.8rem', color: '#92400E', marginTop: '0.75rem',
                  }}
                >
                  ⚠️ Dùng vị trí mặc định (TP.HCM) —&nbsp;
                  <button
                    onClick={requestLocation}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d97706', fontWeight: 700, fontSize: '0.8rem', fontFamily: 'inherit', padding: 0, textDecoration: 'underline' }}
                  >
                    Thử lại định vị
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Body: store list + map */}
        <div style={{
          maxWidth: '1200px', margin: '0 auto', padding: '1.5rem',
          display: 'grid', gridTemplateColumns: 'minmax(0, 400px) 1fr',
          gap: '1.5rem', alignItems: 'start',
        }}>
          {/* Store list */}
          <div>
            {locationStatus === 'denied' && !loading && (
              <GpsPrompt onRetry={requestLocation} />
            )}

            {loading ? (
              <>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="card" style={{ padding: '1.25rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <div className="skeleton" style={{ width: '46px', height: '46px', borderRadius: '14px' }} />
                      <div style={{ flex: 1 }}>
                        <div className="skeleton" style={{ width: '70%', height: '14px', marginBottom: '8px' }} />
                        <div className="skeleton" style={{ width: '90%', height: '12px', marginBottom: '6px' }} />
                        <div className="skeleton" style={{ width: '50%', height: '12px' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <p style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>😔</p>
                <p style={{ color: 'var(--color-text-muted)' }}>{error}</p>
              </div>
            ) : result && (
              <>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1rem', fontWeight: 600 }}>
                  {result.stores.length} cửa hàng trong bán kính ~5km
                  {userLocation && ` · từ vị trí của bạn`}
                </p>
                {result.stores.map((store, index) => (
                  <StoreCard
                    key={store.id}
                    store={store}
                    index={index}
                    selected={selectedStore?.id === store.id}
                    userLocation={userLocation}
                    onClick={() => setSelectedStore(store)}
                  />
                ))}
              </>
            )}
          </div>

          {/* Map panel */}
          <div style={{ position: 'sticky', top: '80px' }}>
            {loading ? (
              <div style={{
                borderRadius: '20px', minHeight: '420px',
                background: 'linear-gradient(135deg,#f3f4f6,#e5e7eb)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: '1rem', border: '1px solid var(--color-border-light)',
              }}>
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{ fontSize: '3rem' }}
                >
                  📍
                </motion.div>
                <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  {locationStatus === 'asking' ? 'Đang xác định vị trí GPS...' : 'Đang tải bản đồ...'}
                </p>
              </div>
            ) : (
              <MapVisualization
                stores={result?.stores || []}
                selectedStore={selectedStore}
                userLocation={userLocation}
              />
            )}
          </div>
        </div>
      </main>

      <style>{`
        @media (max-width: 768px) {
          main > div:last-child {
            grid-template-columns: 1fr !important;
          }
          div[style*="sticky"] {
            position: relative !important;
            top: 0 !important;
          }
        }
      `}</style>
    </>
  );
}

export default function OfflinePage() {
  return (
    <Suspense fallback={<div style={{ paddingTop: '80px', textAlign: 'center' }}>Đang tải...</div>}>
      <OfflineInner />
    </Suspense>
  );
}

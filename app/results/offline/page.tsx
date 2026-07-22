'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, OfflineSearchResult } from '@/types';
import Header from '@/components/layout/Header';

// ─── Default center: Cần Thơ ────────────────────────────────────────────────
const CAN_THO_DEFAULT = { lat: 10.0452, lng: 105.7469 };

// ─── Star rating ──────────────────────────────────────────────────────────────
function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} style={{ color: star <= Math.round(rating) ? '#ffe082' : 'rgba(201,187,232,0.25)', fontSize: '0.75rem' }}>★</span>
      ))}
      <span style={{ fontSize: '0.72rem', color: 'var(--lavender-light)', marginLeft: '0.2rem', fontFamily: "'Nunito',sans-serif" }}>
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

  // Direction URL: Google Maps direction mode
  const mapsUrl = userLocation
    ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${store.lat},${store.lng}&travelmode=driving`
    : `https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}&travelmode=driving`;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.07 }}
      onClick={onClick}
      className="card"
      style={{
        padding: '1.25rem', cursor: 'pointer',
        border: selected ? '1.5px solid rgba(212,168,232,0.65)' : '1px solid rgba(201,187,232,0.18)',
        background: selected ? 'linear-gradient(135deg, rgba(212,168,232,0.18), rgba(155,181,232,0.12))' : 'rgba(255,255,255,0.06)',
        marginBottom: '0.75rem', transition: 'all 0.2s ease',
        boxShadow: selected ? '0 0 20px rgba(212,168,232,0.2), var(--shadow-card)' : 'var(--shadow-card)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        {/* Icon */}
        <div style={{
          width: '46px', height: '46px',
          background: selected ? 'linear-gradient(135deg, rgba(212,168,232,0.4), rgba(155,181,232,0.3))' : 'rgba(255,255,255,0.08)',
          borderRadius: '14px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0,
          border: '1px solid rgba(201,187,232,0.2)',
        }}>
          🏪
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Rank badge + Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
            {index === 0 && (
              <span style={{
                fontSize: 'var(--text-xs)', fontWeight: 800, padding: '0.15rem 0.55rem',
                background: 'linear-gradient(135deg,#f2c4d0,#d4a8e8)', color: '#1a1535',
                borderRadius: '999px', letterSpacing: '0.02em', fontFamily: "'Nunito',sans-serif",
              }}>🏆 GẦN NHẤT</span>
            )}
            <h3 style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--cream)', margin: 0 }}>
              {store.name}
            </h3>
            <span className="badge" style={{
              fontSize: 'var(--text-xs)',
              fontFamily: "'Nunito',sans-serif",
              background: store.openNow ? 'rgba(184,232,217,0.2)' : 'rgba(255,100,100,0.18)',
              color: store.openNow ? '#b8e8d9' : '#ff9999',
              border: store.openNow ? '1px solid rgba(184,232,217,0.4)' : '1px solid rgba(255,100,100,0.3)',
            }}>
              {store.openNow ? '● Đang mở' : '○ Đã đóng'}
            </span>
          </div>

          <StarRating rating={store.rating} />

          {/* Address */}
          <p style={{ fontFamily: "'Nunito',sans-serif", fontSize: 'var(--text-sm)', color: 'var(--lavender-light)', marginTop: '0.375rem', marginBottom: '0.5rem', lineHeight: 1.5 }}>
            📍 {store.address}
          </p>

          {/* Meta */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontFamily: "'Nunito',sans-serif" }}>
            <span>🚶 {distanceKm} km</span>
            {store.hours && <span>⏰ {store.hours}</span>}
            {store.phone && <span>📞 {store.phone}</span>}
          </div>

          {/* Features */}
          {store.features && store.features.length > 0 && (
            <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
              {store.features.map((f, i) => (
                <span key={i} style={{
                  fontSize: 'var(--text-xs)', padding: '0.15rem 0.55rem',
                  background: 'rgba(212,168,232,0.12)', color: 'var(--lavender-pale)',
                  borderRadius: '999px', border: '1px solid rgba(201,187,232,0.2)',
                  fontFamily: "'Nunito',sans-serif",
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
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.875rem', padding: '0.45rem 1rem', fontSize: 'var(--text-xs)', fontFamily: "'Nunito',sans-serif" }}
          >
            🗺️ Chỉ đường đến đây
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
  const getMapSrc = () => {
    if (!target) {
      const center = userLocation || CAN_THO_DEFAULT;
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
      borderRadius: '24px', overflow: 'hidden',
      height: '100%', minHeight: '440px', position: 'relative',
      boxShadow: 'var(--shadow-lg)', border: '1px solid rgba(201,187,232,0.2)',
    }}>
      <iframe
        key={`${target?.id}-${userLocation?.lat}`}
        src={getMapSrc()}
        style={{ width: '100%', height: '100%', border: 'none', minHeight: '440px' }}
        title="Bản đồ chỉ đường Cần Thơ"
        loading="lazy"
        allowFullScreen
      />

      {/* Info overlay bottom */}
      <div style={{
        position: 'absolute', bottom: '1rem', left: '1rem', right: '1rem',
        background: 'rgba(26,21,53,0.92)', backdropFilter: 'blur(16px)',
        borderRadius: '18px', padding: '0.875rem 1.1rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        border: '1px solid rgba(201,187,232,0.25)',
      }}>
        {target ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.6rem' }}>🏪</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: "'Nunito',sans-serif", fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--cream)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {target.name}
              </p>
              <p style={{ fontFamily: "'Nunito',sans-serif", fontSize: 'var(--text-xs)', color: 'var(--lavender-light)', margin: '0.15rem 0 0' }}>
                {userLocation
                  ? `📍 Tuyến đường từ vị trí của bạn → ${(target.distanceMeters / 1000).toFixed(1)} km`
                  : `📍 ${target.address}`}
              </p>
            </div>
            <a
              href={
                userLocation
                  ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${target.lat},${target.lng}&travelmode=driving`
                  : `https://www.google.com/maps/dir/?api=1&destination=${target.lat},${target.lng}&travelmode=driving`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{
                fontSize: 'var(--text-xs)',
                padding: '0.35rem 0.75rem',
                fontFamily: "'Nunito',sans-serif",
                flexShrink: 0,
                textDecoration: 'none',
              }}
            >
              🚀 Mở Google Maps
            </a>
          </div>
        ) : (
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--lavender-light)', margin: 0, textAlign: 'center', fontFamily: "'Nunito',sans-serif" }}>
            📍 Chọn cửa hàng để xem tuyến đường chỉ dẫn
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
        background: 'rgba(255,224,130,0.12)',
        border: '1px solid rgba(255,224,130,0.35)', borderRadius: '18px',
        padding: '1.25rem 1.5rem', marginBottom: '1.25rem',
        display: 'flex', alignItems: 'flex-start', gap: '0.875rem',
        backdropFilter: 'blur(12px)',
      }}
    >
      <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>📡</span>
      <div style={{ flex: 1 }}>
        <p style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--star-yellow)', marginBottom: '0.25rem' }}>
          Bật vị trí GPS để đo chính xác khoảng cách đến cửa hàng tại Cần Thơ!
        </p>
        <p style={{ fontFamily: "'Nunito',sans-serif", fontSize: 'var(--text-xs)', color: 'var(--lavender-pale)', lineHeight: 1.5, marginBottom: '0.6rem' }}>
          Nhấn vào biểu tượng vị trí trên thanh địa chỉ trình duyệt → Cho phép truy cập vị trí.
        </p>
        <button
          onClick={onRetry}
          className="btn-primary"
          style={{
            fontSize: 'var(--text-xs)', padding: '0.35rem 0.875rem',
            fontFamily: "'Nunito',sans-serif",
          }}
        >
          🔄 Thử lại định vị GPS
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
      setError('Không thể tải danh sách cửa hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [keyword]);

  const requestLocation = useCallback(() => {
    setLocationStatus('asking');
    setLoading(true);
    if (!navigator.geolocation) {
      setLocationStatus('denied');
      fetchStores(CAN_THO_DEFAULT.lat, CAN_THO_DEFAULT.lng);
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
        fetchStores(CAN_THO_DEFAULT.lat, CAN_THO_DEFAULT.lng);
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
      <main style={{ paddingTop: '60px', minHeight: '100dvh' }}>

        {/* Page header */}
        <div style={{
          background: 'rgba(26,21,53,0.7)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(201,187,232,0.15)',
          padding: '2.5rem 1.5rem 2rem',
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <Link href="/results" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: 'var(--text-xs)', fontFamily: "'Nunito',sans-serif" }}>
                ← Gợi ý quà
              </Link>
              <span style={{ color: 'rgba(201,187,232,0.3)' }}>/</span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--lavender-light)', fontFamily: "'Nunito',sans-serif" }}>Cửa hàng tại Cần Thơ</span>
            </div>

            <h1 style={{
              fontFamily: "'Comfortaa','Nunito',sans-serif",
              fontSize: 'clamp(1.4rem, 4vw, 2.1rem)',
              fontWeight: 700,
              marginBottom: '0.375rem',
              color: 'var(--cream)',
              lineHeight: 'var(--lh-snug)',
            }}>
              📍 Cửa hàng mua trực tiếp ở Cần Thơ
            </h1>
            {giftName && (
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', fontFamily: "'Nunito',sans-serif" }}>
                Địa điểm bán món: <strong style={{ color: 'var(--cream)' }}>{giftName}</strong>
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
                    background: 'rgba(155,181,232,0.15)', border: '1px solid rgba(155,181,232,0.3)',
                    borderRadius: '999px', padding: '0.35rem 0.875rem',
                    fontSize: 'var(--text-xs)', color: 'var(--periwinkle)', marginTop: '0.75rem',
                    fontFamily: "'Nunito',sans-serif",
                  }}
                >
                  <motion.span animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} style={{ display: 'inline-block' }}>
                    📡
                  </motion.span>
                  Đang xác định GPS của bạn...
                </motion.div>
              )}
              {locationStatus === 'granted' && userLocation && (
                <motion.div
                  key="granted"
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    background: 'rgba(184,232,217,0.15)', border: '1px solid rgba(184,232,217,0.35)',
                    borderRadius: '999px', padding: '0.35rem 0.875rem',
                    fontSize: 'var(--text-xs)', color: '#b8e8d9', marginTop: '0.75rem',
                    fontFamily: "'Nunito',sans-serif",
                  }}
                >
                  ✅ Đã nhận vị trí GPS — đo chính xác khoảng cách & chỉ đường từ vị trí của bạn
                </motion.div>
              )}
              {locationStatus === 'denied' && (
                <motion.div
                  key="denied"
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    background: 'rgba(255,224,130,0.12)', border: '1px solid rgba(255,224,130,0.3)',
                    borderRadius: '999px', padding: '0.35rem 0.875rem',
                    fontSize: 'var(--text-xs)', color: 'var(--star-yellow)', marginTop: '0.75rem',
                    fontFamily: "'Nunito',sans-serif",
                  }}
                >
                  ⚠️ Vị trí mặc định: Ninh Kiều, Cần Thơ —&nbsp;
                  <button
                    onClick={requestLocation}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cream)', fontWeight: 700, fontSize: 'var(--text-xs)', fontFamily: "'Nunito',sans-serif", padding: 0, textDecoration: 'underline' }}
                  >
                    Thử lại GPS
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Body: store list + map */}
        <div style={{
          maxWidth: '1200px', margin: '0 auto', padding: '1.5rem',
          display: 'grid', gridTemplateColumns: 'minmax(0, 420px) 1fr',
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
                  <div key={i} className="card" style={{ padding: '1.25rem', marginBottom: '0.75rem', background: 'rgba(255,255,255,0.05)' }}>
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
                <p style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>😿</p>
                <p style={{ color: 'var(--color-text-muted)', fontFamily: "'Nunito',sans-serif" }}>{error}</p>
              </div>
            ) : result && (
              <>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--lavender-light)', marginBottom: '1rem', fontWeight: 600, fontFamily: "'Nunito',sans-serif" }}>
                  📍 {result.stores.length} cửa hàng tại Cần Thơ
                  {userLocation ? ' · tính từ GPS của bạn' : ' · sắp xếp theo độ gần'}
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
                borderRadius: '24px', minHeight: '440px',
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(16px)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: '1rem', border: '1px solid rgba(201,187,232,0.18)',
              }}>
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{ fontSize: '3rem' }}
                >
                  🗺️
                </motion.div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--lavender-light)', fontWeight: 600, fontFamily: "'Nunito',sans-serif" }}>
                  {locationStatus === 'asking' ? 'Đang lấy vị trí GPS...' : 'Đang tải bản đồ chỉ đường Cần Thơ...'}
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
    <Suspense fallback={<div style={{ paddingTop: '80px', textAlign: 'center', color: 'var(--cream)', fontFamily: "'Nunito',sans-serif" }}>Đang tải...</div>}>
      <OfflineInner />
    </Suspense>
  );
}

'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Store, OfflineSearchResult } from '@/types';
import Header from '@/components/layout/Header';

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

function StoreCard({
  store,
  index,
  selected,
  onClick,
}: {
  store: Store;
  index: number;
  selected: boolean;
  onClick: () => void;
}) {
  const distanceKm = (store.distanceMeters / 1000).toFixed(1);
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.07 }}
      onClick={onClick}
      className="card"
      style={{
        padding: '1.25rem',
        cursor: 'pointer',
        border: selected ? '2px solid var(--color-accent-1)' : '1px solid var(--color-border-light)',
        background: selected ? 'linear-gradient(135deg, #FFF1F8, #F5F3FF)' : 'white',
        marginBottom: '0.75rem',
        transition: 'all 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        {/* Icon */}
        <div
          style={{
            width: '44px',
            height: '44px',
            background: selected ? 'var(--gradient-main)' : 'var(--gradient-subtle)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            flexShrink: 0,
          }}
        >
          🏪
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Name + status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
            <h3
              style={{
                fontWeight: 700,
                fontSize: '0.925rem',
                color: 'var(--color-text)',
                margin: 0,
              }}
            >
              {store.name}
            </h3>
            <span
              className="badge"
              style={{
                background: store.openNow ? 'var(--color-success-bg)' : '#FEE2E2',
                color: store.openNow ? '#059669' : '#DC2626',
              }}
            >
              {store.openNow ? '● Đang mở' : '○ Đã đóng'}
            </span>
          </div>

          <StarRating rating={store.rating} />

          {/* Address */}
          <p
            style={{
              fontSize: '0.78rem',
              color: 'var(--color-text-muted)',
              marginTop: '0.375rem',
              marginBottom: '0.5rem',
              lineHeight: 1.5,
            }}
          >
            📍 {store.address}
          </p>

          {/* Meta info */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--color-text-light)' }}>
            <span>🚗 {distanceKm} km</span>
            {store.openHours && <span>⏰ {store.openHours}</span>}
            {store.phoneNumber && <span>📞 {store.phoneNumber}</span>}
          </div>

          {/* Get directions */}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="btn-primary"
            style={{
              display: 'inline-flex',
              marginTop: '0.875rem',
              padding: '0.45rem 1rem',
              fontSize: '0.8rem',
            }}
          >
            🗺️ Chỉ đường
          </a>
        </div>
      </div>
    </motion.div>
  );
}

// Simple static map visualization using Google Maps embed (no key needed for basic embed)
function MapVisualization({
  stores,
  selectedStore,
  userLocation,
}: {
  stores: Store[];
  selectedStore: Store | null;
  userLocation: { lat: number; lng: number } | null;
}) {
  const center = selectedStore
    ? { lat: selectedStore.lat, lng: selectedStore.lng }
    : userLocation || { lat: 10.7769, lng: 106.7009 };

  // Use OpenStreetMap static map (free, no key needed for mock)
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${center.lng - 0.02},${center.lat - 0.015},${center.lng + 0.02},${center.lat + 0.015}&layer=mapnik&marker=${center.lat},${center.lng}`;

  return (
    <div
      style={{
        borderRadius: '20px',
        overflow: 'hidden',
        height: '100%',
        minHeight: '400px',
        position: 'relative',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--color-border-light)',
      }}
    >
      <iframe
        src={osmUrl}
        style={{ width: '100%', height: '100%', border: 'none', minHeight: '400px' }}
        title="Bản đồ cửa hàng"
        loading="lazy"
      />

      {/* Store pins overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: '1rem',
          left: '1rem',
          right: '1rem',
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '14px',
          padding: '0.875rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <p style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.375rem', color: 'var(--color-text)' }}>
          📍 {stores.length} cửa hàng tìm thấy
        </p>
        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
          {stores.slice(0, 3).map((s, i) => (
            <span
              key={s.placeId}
              style={{
                fontSize: '0.72rem',
                padding: '0.2rem 0.5rem',
                background: i === 0 ? 'var(--gradient-main)' : 'var(--color-border-light)',
                color: i === 0 ? 'white' : 'var(--color-text-muted)',
                borderRadius: '999px',
                fontWeight: 600,
              }}
            >
              {i === 0 ? '🥇 ' : ''}{s.name.split(' ')[0]}...
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

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

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
          setUserLocation(loc);
          setLocationStatus('granted');
          fetchStores(loc.lat, loc.lng);
        },
        () => {
          setLocationStatus('denied');
          // Use default location (Ho Chi Minh City)
          fetchStores(10.7769, 106.7009);
        },
        { timeout: 8000 }
      );
    } else {
      setLocationStatus('denied');
      fetchStores(10.7769, 106.7009);
    }
  }, [fetchStores]);

  return (
    <>
      <Header />
      <main style={{ paddingTop: '60px', minHeight: '100dvh', background: 'var(--color-bg)' }}>
        {/* Page header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #F0FDF4 0%, #F5F3FF 100%)',
            padding: '2.5rem 1.5rem 2rem',
          }}
        >
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

            {locationStatus === 'denied' && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: '#FFFBEB',
                  border: '1px solid #FCD34D',
                  borderRadius: '8px',
                  padding: '0.375rem 0.75rem',
                  fontSize: '0.8rem',
                  color: '#92400E',
                  marginTop: '0.5rem',
                }}
              >
                ⚠️ Đang dùng vị trí mặc định (TP.HCM). Cho phép định vị để tìm gần bạn hơn.
              </div>
            )}
          </div>
        </div>

        {/* Split view */}
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '1.5rem',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 380px) 1fr',
            gap: '1.5rem',
            alignItems: 'start',
          }}
        >
          {/* Store list */}
          <div>
            {loading ? (
              <>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="card" style={{ padding: '1.25rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <div className="skeleton" style={{ width: '44px', height: '44px', borderRadius: '12px' }} />
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
                  {result.stores.length} cửa hàng trong bán kính 5km
                </p>
                {result.stores.map((store, index) => (
                  <StoreCard
                    key={store.placeId}
                    store={store}
                    index={index}
                    selected={selectedStore?.placeId === store.placeId}
                    onClick={() => setSelectedStore(store)}
                  />
                ))}
              </>
            )}
          </div>

          {/* Map */}
          <div style={{ position: 'sticky', top: '120px' }}>
            <MapVisualization
              stores={result?.stores || []}
              selectedStore={selectedStore}
              userLocation={userLocation}
            />
          </div>
        </div>
      </main>

      {/* Responsive: stack on mobile */}
      <style>{`
        @media (max-width: 768px) {
          main > div:last-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}

export default function OfflinePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OfflineInner />
    </Suspense>
  );
}

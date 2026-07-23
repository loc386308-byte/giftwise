'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/layout/Header';
import { useJournalStore } from '@/lib/store/journalStore';
import { useAuthStore } from '@/lib/store/authStore';
import { Person, GiftRecord } from '@/types/journal';
import JournalSuggestModal from '@/components/JournalSuggestModal';

// ─── constants ────────────────────────────────────────────────────────────────
const RELATIONSHIP_OPTIONS = [
  { id: 'người yêu', label: 'Người yêu', emoji: '💑' },
  { id: 'bạn thân', label: 'Bạn thân', emoji: '👯' },
  { id: 'bố/mẹ', label: 'Bố / Mẹ', emoji: '👨‍👩‍👧' },
  { id: 'đồng nghiệp', label: 'Đồng nghiệp', emoji: '👔' },
  { id: 'sếp', label: 'Sếp', emoji: '💼' },
  { id: 'con cái', label: 'Con cái', emoji: '👶' },
  { id: 'bạn bè', label: 'Bạn bè', emoji: '🤝' },
  { id: 'anh/chị/em', label: 'Anh/Chị/Em', emoji: '👨‍👩‍👦' },
];

const AVATAR_OPTIONS = ['🐱', '🐶', '🐰', '🦊', '🐼', '🐨', '🦋', '🌸', '⭐', '🌙', '🍀', '🎀'];

const INTERESTS_LIST = [
  '📚 Đọc sách', '🎮 Gaming', '🎨 Nghệ thuật', '🎵 Âm nhạc', '🏋️ Thể thao',
  '✈️ Du lịch', '🍳 Nấu ăn', '☕ Cafe', '🌿 Thiên nhiên', '📸 Chụp ảnh',
  '💄 Làm đẹp', '🐾 Thú cưng', '🎬 Phim', '🌱 Cây cối', '🏃 Chạy bộ',
  '🧘 Yoga', '🛍️ Mua sắm', '🎭 Sáng tạo',
];

const PERSONALITY_LIST = [
  '✨ Năng động', '🌊 Nhẹ nhàng', '🔥 Nhiệt huyết', '🌙 Hướng nội',
  '☀️ Lạc quan', '🎯 Thực tế', '💡 Sáng tạo', '❤️ Tình cảm',
  '🧠 Trí tuệ', '😂 Hài hước', '🎪 Phiêu lưu', '🏠 Gia đình',
];

const ZODIAC_LIST = [
  'Bạch Dương ♈', 'Kim Ngưu ♉', 'Song Tử ♊', 'Cự Giải ♋',
  'Sư Tử ♌', 'Xử Nữ ♍', 'Thiên Bình ♎', 'Bọ Cạp ♏',
  'Nhân Mã ♐', 'Ma Kết ♑', 'Bảo Bình ♒', 'Song Ngư ♓',
];

const OCCASIONS = ['Sinh nhật 🎂', 'Valentine 💝', '8/3 🌸', 'Giáng sinh 🎄', 'Kỷ niệm 💍', 'Thăng chức 🚀', 'Ra trường 🎓', 'Dịp khác 🎁'];

// ─── GlassPanel helper ─────────────────────────────────────────────────────────
function Panel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(201,187,232,0.18)',
        borderRadius: '24px',
        padding: '1.5rem',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Star Rating ──────────────────────────────────────────────────────────────
function StarRating({ value, onChange }: { value?: number; onChange?: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', gap: '0.25rem' }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange?.(s)}
          style={{
            background: 'none', border: 'none', cursor: onChange ? 'pointer' : 'default',
            fontSize: '1.1rem', padding: '0',
            color: s <= (value ?? 0) ? '#ffe082' : 'rgba(201,187,232,0.3)',
            transition: 'color 0.15s',
          }}
        >★</button>
      ))}
    </div>
  );
}

// ─── Add/Edit Person Modal ─────────────────────────────────────────────────────
function PersonModal({
  person,
  onClose,
  onSave,
}: {
  person?: Person;
  onClose: () => void;
  onSave: (data: Omit<Person, 'id' | 'createdAt' | 'giftHistory'>) => void;
}) {
  const [name, setName] = useState(person?.name ?? '');
  const [relationship, setRelationship] = useState(person?.relationship ?? '');
  const [gender, setGender] = useState<'nữ' | 'nam' | 'khác' | ''>(person?.gender ?? '');
  const [ageRange, setAgeRange] = useState(person?.ageRange ?? '');
  const [zodiac, setZodiac] = useState(person?.zodiac ?? '');
  const [birthday, setBirthday] = useState(person?.birthday ?? '');
  const [avatar, setAvatar] = useState(person?.avatar ?? '🐱');
  const [interests, setInterests] = useState<string[]>(person?.interests ?? []);
  const [personality, setPersonality] = useState<string[]>(person?.personality ?? []);
  const [notes, setNotes] = useState(person?.notes ?? '');

  const toggleInterest = (v: string) =>
    setInterests((prev) => prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]);
  const togglePersonality = (v: string) =>
    setPersonality((prev) => prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]);

  const handleSave = () => {
    if (!name.trim() || !relationship) return;
    onSave({ name: name.trim(), relationship, gender: gender || undefined, ageRange, zodiac, birthday, avatar, interests, personality, notes });
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(10,8,30,0.7)', backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        style={{
          background: 'rgba(26,21,53,0.95)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(201,187,232,0.22)',
          borderRadius: '28px',
          padding: '2rem',
          width: '100%',
          maxWidth: '540px',
          maxHeight: '88vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        <h2 style={{ fontFamily: "'Comfortaa','Nunito',sans-serif", fontSize: '1.4rem', color: '#f0eaff', marginBottom: '1.5rem' }}>
          {person ? '✏️ Chỉnh sửa' : '✨ Thêm người thân'}
        </h2>

        {/* Avatar picker */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ fontSize: 'var(--text-xs)', color: 'var(--lavender-light)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '0.6rem' }}>
            Chọn avatar
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {AVATAR_OPTIONS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAvatar(a)}
                style={{
                  fontSize: '1.75rem', lineHeight: 1,
                  width: '44px', height: '44px',
                  borderRadius: '12px',
                  border: avatar === a ? '2px solid rgba(212,168,232,0.7)' : '2px solid rgba(201,187,232,0.15)',
                  background: avatar === a ? 'rgba(212,168,232,0.18)' : 'rgba(255,255,255,0.04)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >{a}</button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: 'var(--text-xs)', color: 'var(--lavender-light)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>
            Tên *
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ví dụ: Bảo An, Mẹ, Sếp Hùng..."
            style={{
              width: '100%', padding: '0.75rem 1rem',
              borderRadius: '14px',
              border: '1px solid rgba(201,187,232,0.25)',
              background: 'rgba(255,255,255,0.06)',
              color: '#f0eaff',
              fontFamily: "'Nunito',sans-serif",
              fontSize: 'var(--text-base)',
              outline: 'none',
            }}
          />
        </div>

        {/* Relationship */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: 'var(--text-xs)', color: 'var(--lavender-light)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>
            Mối quan hệ *
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {RELATIONSHIP_OPTIONS.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRelationship(r.id)}
                className={`chip ${relationship === r.id ? 'selected' : ''}`}
                style={{ fontFamily: "'Nunito',sans-serif" }}
              >
                {r.emoji} {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Birthday + Gender row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ fontSize: 'var(--text-xs)', color: 'var(--lavender-light)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>
              Sinh nhật (MM/DD)
            </label>
            <input
              type="text"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              placeholder="VD: 03/14"
              style={{
                width: '100%', padding: '0.65rem 0.875rem',
                borderRadius: '12px',
                border: '1px solid rgba(201,187,232,0.25)',
                background: 'rgba(255,255,255,0.06)',
                color: '#f0eaff',
                fontFamily: "'Nunito',sans-serif",
                fontSize: 'var(--text-sm)',
                outline: 'none',
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: 'var(--text-xs)', color: 'var(--lavender-light)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>
              Giới tính
            </label>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {(['nữ', 'nam', 'khác'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g === gender ? '' : g)}
                  className={`chip ${gender === g ? 'selected' : ''}`}
                  style={{ fontFamily: "'Nunito',sans-serif", fontSize: 'var(--text-xs)', padding: '0.3rem 0.6rem' }}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Age + Zodiac row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ fontSize: 'var(--text-xs)', color: 'var(--lavender-light)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>
              Độ tuổi
            </label>
            <select
              value={ageRange}
              onChange={(e) => setAgeRange(e.target.value)}
              style={{
                width: '100%', padding: '0.65rem 0.875rem',
                borderRadius: '12px',
                border: '1px solid rgba(201,187,232,0.25)',
                background: 'rgba(30,26,60,0.95)',
                color: '#f0eaff',
                fontFamily: "'Nunito',sans-serif",
                fontSize: 'var(--text-sm)',
                outline: 'none', cursor: 'pointer',
              }}
            >
              <option value="">-- Chọn --</option>
              {['dưới 12 tuổi', '13-18 tuổi', '19-25 tuổi', '26-35 tuổi', '36-50 tuổi', 'trên 50 tuổi'].map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 'var(--text-xs)', color: 'var(--lavender-light)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>
              Cung hoàng đạo
            </label>
            <select
              value={zodiac}
              onChange={(e) => setZodiac(e.target.value)}
              style={{
                width: '100%', padding: '0.65rem 0.875rem',
                borderRadius: '12px',
                border: '1px solid rgba(201,187,232,0.25)',
                background: 'rgba(30,26,60,0.95)',
                color: '#f0eaff',
                fontFamily: "'Nunito',sans-serif",
                fontSize: 'var(--text-sm)',
                outline: 'none', cursor: 'pointer',
              }}
            >
              <option value="">-- Chọn --</option>
              {ZODIAC_LIST.map((z) => <option key={z} value={z}>{z}</option>)}
            </select>
          </div>
        </div>

        {/* Interests */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: 'var(--text-xs)', color: 'var(--lavender-light)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>
            Sở thích
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {INTERESTS_LIST.map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggleInterest(i)}
                className={`chip ${interests.includes(i) ? 'selected' : ''}`}
                style={{ fontFamily: "'Nunito',sans-serif", fontSize: 'var(--text-xs)' }}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        {/* Personality */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: 'var(--text-xs)', color: 'var(--lavender-light)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>
            Tính cách
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {PERSONALITY_LIST.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => togglePersonality(p)}
                className={`chip ${personality.includes(p) ? 'selected' : ''}`}
                style={{ fontFamily: "'Nunito',sans-serif", fontSize: 'var(--text-xs)' }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div style={{ marginBottom: '1.75rem' }}>
          <label style={{ fontSize: 'var(--text-xs)', color: 'var(--lavender-light)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>
            Ghi chú thêm
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ghi chú về sở thích, dị ứng, thương hiệu yêu thích..."
            rows={3}
            style={{
              width: '100%', padding: '0.75rem 1rem',
              borderRadius: '14px',
              border: '1px solid rgba(201,187,232,0.25)',
              background: 'rgba(255,255,255,0.06)',
              color: '#f0eaff',
              fontFamily: "'Nunito',sans-serif",
              fontSize: 'var(--text-sm)',
              lineHeight: 1.6,
              resize: 'vertical',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="btn-primary"
            style={{ flex: 2, justifyContent: 'center', opacity: !name.trim() || !relationship ? 0.5 : 1 }}
            disabled={!name.trim() || !relationship}
          >
            {person ? '💾 Lưu' : '✨ Thêm'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Add Gift Record Modal ─────────────────────────────────────────────────────
function AddGiftModal({
  personId,
  onClose,
}: {
  personId: string;
  onClose: () => void;
}) {
  const { addGiftRecord } = useJournalStore();
  const [giftName, setGiftName] = useState('');
  const [occasion, setOccasion] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [priceRange, setPriceRange] = useState('');
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState<number | undefined>(undefined);

  const handleSave = () => {
    if (!giftName.trim()) return;
    addGiftRecord(personId, { giftName: giftName.trim(), occasion, date, priceRange, notes, rating: rating as GiftRecord['rating'] });
    onClose();
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(10,8,30,0.7)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        style={{ background: 'rgba(26,21,53,0.95)', backdropFilter: 'blur(24px)', border: '1px solid rgba(201,187,232,0.22)', borderRadius: '28px', padding: '2rem', width: '100%', maxWidth: '440px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
      >
        <h2 style={{ fontFamily: "'Comfortaa','Nunito',sans-serif", fontSize: '1.25rem', color: '#f0eaff', marginBottom: '1.5rem' }}>
          🎁 Thêm quà đã tặng
        </h2>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: 'var(--text-xs)', color: 'var(--lavender-light)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>Tên quà *</label>
          <input value={giftName} onChange={(e) => setGiftName(e.target.value)} placeholder="VD: Son Romand, Tai nghe JBL..." style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '12px', border: '1px solid rgba(201,187,232,0.25)', background: 'rgba(255,255,255,0.06)', color: '#f0eaff', fontFamily: "'Nunito',sans-serif", fontSize: 'var(--text-base)', outline: 'none' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ fontSize: 'var(--text-xs)', color: 'var(--lavender-light)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>Dịp</label>
            <select value={occasion} onChange={(e) => setOccasion(e.target.value)} style={{ width: '100%', padding: '0.65rem 0.7rem', borderRadius: '12px', border: '1px solid rgba(201,187,232,0.25)', background: 'rgba(30,26,60,0.95)', color: '#f0eaff', fontFamily: "'Nunito',sans-serif", fontSize: 'var(--text-sm)', outline: 'none', cursor: 'pointer' }}>
              <option value="">-- Chọn --</option>
              {OCCASIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 'var(--text-xs)', color: 'var(--lavender-light)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>Ngày tặng</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: '100%', padding: '0.65rem 0.7rem', borderRadius: '12px', border: '1px solid rgba(201,187,232,0.25)', background: 'rgba(30,26,60,0.95)', color: '#f0eaff', fontFamily: "'Nunito',sans-serif", fontSize: 'var(--text-sm)', outline: 'none' }} />
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: 'var(--text-xs)', color: 'var(--lavender-light)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>Mức giá</label>
          <input value={priceRange} onChange={(e) => setPriceRange(e.target.value)} placeholder="VD: 200.000đ – 300.000đ" style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '12px', border: '1px solid rgba(201,187,232,0.25)', background: 'rgba(255,255,255,0.06)', color: '#f0eaff', fontFamily: "'Nunito',sans-serif", fontSize: 'var(--text-sm)', outline: 'none' }} />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: 'var(--text-xs)', color: 'var(--lavender-light)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>Phản ứng của người nhận ⭐</label>
          <StarRating value={rating} onChange={setRating} />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontSize: 'var(--text-xs)', color: 'var(--lavender-light)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>Ghi chú</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Họ có thích không? Lần sau tặng gì?" rows={2} style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '12px', border: '1px solid rgba(201,187,232,0.25)', background: 'rgba(255,255,255,0.06)', color: '#f0eaff', fontFamily: "'Nunito',sans-serif", fontSize: 'var(--text-sm)', resize: 'vertical', outline: 'none' }} />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Hủy</button>
          <button type="button" onClick={handleSave} className="btn-primary" style={{ flex: 2, justifyContent: 'center', opacity: !giftName.trim() ? 0.5 : 1 }} disabled={!giftName.trim()}>
            💾 Lưu
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Person Detail View ─────────────────────────────────────────────────────────
function PersonDetail({
  person,
  onBack,
  onEdit,
  onDelete,
  onSuggest,
}: {
  person: Person;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSuggest: () => void;
}) {
  const router = useRouter();
  const { deleteGiftRecord } = useJournalStore();
  const [addingGift, setAddingGift] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const relInfo = RELATIONSHIP_OPTIONS.find((r) => r.id === person.relationship);

  const handleQuiz = () => {
    const params = new URLSearchParams();
    if (person.relationship) params.set('relationship', person.relationship);
    if (person.gender) params.set('gender', person.gender);
    if (person.ageRange) params.set('ageRange', person.ageRange);
    if (person.zodiac) params.set('zodiac', person.zodiac);
    params.set('person', person.name);
    router.push(`/quiz?${params.toString()}`);
  };

  const upcomingBirthday = () => {
    if (!person.birthday) return null;
    const [month, day] = person.birthday.split('/').map(Number);
    const now = new Date();
    const nextBday = new Date(now.getFullYear(), month - 1, day);
    if (nextBday < now) nextBday.setFullYear(now.getFullYear() + 1);
    const diff = Math.ceil((nextBday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff <= 30 ? diff : null;
  };
  const bdayCountdown = upcomingBirthday();

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button onClick={onBack} className="btn-secondary" style={{ padding: '0.4rem 0.875rem', fontSize: 'var(--text-sm)' }}>← Quay lại</button>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '3rem', lineHeight: 1 }}>{person.avatar}</span>
          <div>
            <h2 style={{ fontFamily: "'Comfortaa','Nunito',sans-serif", fontSize: '1.5rem', color: '#f0eaff', margin: 0 }}>{person.name}</h2>
            <p style={{ color: 'var(--lavender-light)', fontSize: 'var(--text-sm)', margin: 0 }}>
              {relInfo?.emoji} {relInfo?.label || person.relationship}
              {person.zodiac && ` · ${person.zodiac}`}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={onEdit} className="btn-secondary" style={{ padding: '0.4rem 0.875rem', fontSize: 'var(--text-sm)' }}>✏️ Sửa</button>
          <button onClick={() => setConfirmDelete(true)} style={{ background: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.3)', color: '#ff9999', borderRadius: '50px', padding: '0.4rem 0.875rem', fontSize: 'var(--text-sm)', cursor: 'pointer', fontFamily: "'Nunito',sans-serif" }}>🗑️</button>
        </div>
      </div>

      {/* Birthday countdown */}
      {bdayCountdown !== null && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: 'linear-gradient(135deg,rgba(242,196,208,0.2),rgba(212,168,232,0.15))', border: '1px solid rgba(242,196,208,0.35)', borderRadius: '16px', padding: '0.875rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
        >
          <span style={{ fontSize: '1.5rem' }}>🎂</span>
          <div>
            <p style={{ fontWeight: 700, color: '#f2c4d0', fontSize: 'var(--text-sm)', margin: 0 }}>
              Sinh nhật còn {bdayCountdown} ngày!
            </p>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', margin: 0 }}>Đặt quà sớm để không quên nhé ✨</p>
          </div>
          <button onClick={onSuggest} className="btn-primary" style={{ marginLeft: 'auto', padding: '0.4rem 1rem', fontSize: 'var(--text-xs)', whiteSpace: 'nowrap' }}>Gợi ý quà ngay →</button>
        </motion.div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
        {/* Info panel */}
        <Panel>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--lavender-light)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Thông tin</p>
          {person.birthday && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: '0.25rem 0' }}>🎂 {person.birthday}</p>}
          {person.gender && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: '0.25rem 0' }}>👤 {person.gender}</p>}
          {person.ageRange && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: '0.25rem 0' }}>🗓️ {person.ageRange}</p>}
          {person.zodiac && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: '0.25rem 0' }}>⭐ {person.zodiac}</p>}
          {person.notes && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: '0.5rem 0 0', fontStyle: 'italic' }}>{person.notes}</p>}
        </Panel>

        {/* Preferences panel */}
        <Panel>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--lavender-light)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Sở thích & Tính cách</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {person.interests.map((i) => (
              <span key={i} className="chip selected" style={{ fontSize: 'var(--text-xs)', padding: '0.2rem 0.6rem' }}>{i}</span>
            ))}
            {person.personality.map((p) => (
              <span key={p} style={{ fontSize: 'var(--text-xs)', padding: '0.2rem 0.6rem', borderRadius: '999px', background: 'rgba(155,181,232,0.15)', color: 'var(--periwinkle)', border: '1px solid rgba(155,181,232,0.25)', fontFamily: "'Nunito',sans-serif" }}>{p}</span>
            ))}
            {person.interests.length === 0 && person.personality.length === 0 && (
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-light)', fontStyle: 'italic' }}>Chưa có dữ liệu</p>
            )}
          </div>
        </Panel>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <button
          onClick={onSuggest}
          className="btn-primary"
          style={{ justifyContent: 'center', fontSize: 'var(--text-sm)', padding: '0.85rem' }}
        >
          🎁 Gợi ý quà mới tại đây ✨
        </button>
        <button
          onClick={handleQuiz}
          className="btn-secondary"
          style={{ justifyContent: 'center', fontSize: 'var(--text-sm)', padding: '0.85rem' }}
        >
          📝 Làm Quiz đầy đủ →
        </button>
      </div>

      {/* Gift history */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3 style={{ fontFamily: "'Comfortaa','Nunito',sans-serif", fontSize: '1.1rem', color: '#f0eaff', margin: 0 }}>
          🎁 Lịch sử quà đã tặng ({person.giftHistory.length})
        </h3>
        <button onClick={() => setAddingGift(true)} className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: 'var(--text-xs)' }}>
          + Thêm quà
        </button>
      </div>

      {person.giftHistory.length === 0 ? (
        <Panel style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</p>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Chưa có quà nào được ghi lại</p>
        </Panel>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {person.giftHistory.map((g) => (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,187,232,0.15)', borderRadius: '16px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
            >
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, color: 'var(--cream)', fontSize: 'var(--text-sm)', margin: '0 0 0.2rem' }}>{g.giftName}</p>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', margin: 0 }}>
                  {g.occasion && `${g.occasion} · `}
                  {new Date(g.date).toLocaleDateString('vi-VN')}
                  {g.priceRange && ` · ${g.priceRange}`}
                </p>
                {g.rating && <StarRating value={g.rating} />}
                {g.notes && <p style={{ color: 'var(--color-text-light)', fontSize: 'var(--text-xs)', fontStyle: 'italic', margin: '0.25rem 0 0' }}>{g.notes}</p>}
              </div>
              <button
                onClick={() => deleteGiftRecord(person.id, g.id)}
                style={{ background: 'none', border: 'none', color: 'rgba(255,100,100,0.5)', cursor: 'pointer', fontSize: '1rem', padding: '0.25rem' }}
              >🗑️</button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Confirm delete */}
      <AnimatePresence>
        {confirmDelete && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(10,8,30,0.7)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{ background: 'rgba(26,21,53,0.95)', border: '1px solid rgba(255,100,100,0.3)', borderRadius: '24px', padding: '2rem', maxWidth: '360px', textAlign: 'center' }}
            >
              <p style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>😿</p>
              <h3 style={{ fontFamily: "'Comfortaa','Nunito',sans-serif", color: '#f0eaff', marginBottom: '0.5rem' }}>Xóa {person.name}?</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginBottom: '1.5rem' }}>Toàn bộ lịch sử quà sẽ bị xóa. Hành động này không thể hoàn tác.</p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => setConfirmDelete(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Hủy</button>
                <button onClick={() => { onDelete(); setConfirmDelete(false); }} style={{ flex: 1, background: 'rgba(255,80,80,0.2)', border: '1px solid rgba(255,80,80,0.4)', color: '#ff9999', borderRadius: '50px', cursor: 'pointer', fontFamily: "'Nunito',sans-serif", fontWeight: 700, padding: '0.875rem' }}>Xóa</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {addingGift && <AddGiftModal personId={person.id} onClose={() => setAddingGift(false)} />}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function JournalPage() {
  const { people, addPerson, updatePerson, deletePerson } = useJournalStore();
  const { user, openAuthModal } = useAuthStore();
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [suggestPerson, setSuggestPerson] = useState<Person | null>(null);
  const [search, setSearch] = useState('');

  const activeUserId = user ? user.id : 'guest';
  const myPeople = people.filter((p) => (p.userId ? p.userId === activeUserId : activeUserId === 'guest'));

  const selectedPerson = myPeople.find((p) => p.id === selectedId);

  const filteredPeople = myPeople.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.relationship.toLowerCase().includes(search.toLowerCase())
  );

  const upcomingBirthdays = myPeople
    .filter((p) => {
      if (!p.birthday) return false;
      const [month, day] = p.birthday.split('/').map(Number);
      const now = new Date();
      const nextBday = new Date(now.getFullYear(), month - 1, day);
      if (nextBday < now) nextBday.setFullYear(now.getFullYear() + 1);
      return Math.ceil((nextBday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) <= 30;
    })
    .sort((a, b) => {
      const toDay = (p: Person) => {
        const [m, d] = p.birthday!.split('/').map(Number);
        const now = new Date();
        const bd = new Date(now.getFullYear(), m - 1, d);
        if (bd < now) bd.setFullYear(now.getFullYear() + 1);
        return bd.getTime();
      };
      return toDay(a) - toDay(b);
    });

  if (view === 'detail' && selectedPerson) {
    return (
      <>
        <Header />
        <main style={{ paddingTop: '60px', minHeight: '100dvh', padding: '60px 1.5rem 2rem' }}>
          <div className="container-max" style={{ maxWidth: '860px' }}>
            <div style={{ paddingTop: '2rem' }}>
              <PersonDetail
                person={selectedPerson}
                onBack={() => setView('list')}
                onEdit={() => setEditingPerson(selectedPerson)}
                onDelete={() => { deletePerson(selectedPerson.id); setView('list'); }}
                onSuggest={() => setSuggestPerson(selectedPerson)}
              />
            </div>
          </div>
        </main>
        <AnimatePresence>
          {editingPerson && (
            <PersonModal
              person={editingPerson}
              onClose={() => setEditingPerson(null)}
              onSave={(data) => { updatePerson(editingPerson.id, data); setEditingPerson(null); }}
            />
          )}
          {suggestPerson && (
            <JournalSuggestModal
              person={suggestPerson}
              onClose={() => setSuggestPerson(null)}
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <>
      <Header />
      <main style={{ paddingTop: '60px', minHeight: '100dvh' }}>
        {/* Hero */}
        <div style={{ padding: '3rem 1.5rem 2rem', textAlign: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '20%', left: '15%', width: '200px', height: '200px', background: 'radial-gradient(circle,rgba(184,169,217,0.1) 0%,transparent 70%)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '10%', right: '12%', width: '160px', height: '160px', background: 'radial-gradient(circle,rgba(242,196,208,0.1) 0%,transparent 70%)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }} />

          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>📖</div>
            <h1 style={{ fontFamily: "'Comfortaa','Nunito',sans-serif", fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', color: '#f0eaff', marginBottom: '0.75rem' }}>
              Sổ nhật kí tặng quà
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-md)', maxWidth: '480px', margin: '0 auto 1.75rem', lineHeight: 1.7 }}>
              Lưu sở thích & gợi ý quà mới trực tiếp — không bao giờ lặp lại quà cũ ✨
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
              style={{ fontSize: 'var(--text-md)', padding: '0.9rem 2rem' }}
            >
              + Thêm người thân
            </button>
          </motion.div>
        </div>

        <div className="container-max" style={{ padding: '0 1.5rem 4rem' }}>
          {/* User Auth Sync Banner */}
          <div
            style={{
              background: user ? 'rgba(16,185,129,0.12)' : 'rgba(212,168,232,0.12)',
              border: user ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(212,168,232,0.3)',
              borderRadius: '20px',
              padding: '1rem 1.5rem',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.5rem' }}>{user ? '☁️' : '🔒'}</span>
              <div>
                <p style={{ fontWeight: 700, color: 'var(--cream)', fontSize: 'var(--text-sm)', margin: 0 }}>
                  {user ? `Đang đồng bộ sổ nhật ký với tài khoản (${user.email})` : 'Nhật ký đang lưu tạm trên thiết bị này (Guest)'}
                </p>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', margin: 0 }}>
                  {user ? 'Tất cả thông tin người thân và lịch sử quà được lưu trữ an toàn.' : 'Đăng nhập để tự động sao lưu dữ liệu nhật ký của bạn.'}
                </p>
              </div>
            </div>
            {!user && (
              <button
                onClick={openAuthModal}
                className="btn-primary"
                style={{ padding: '0.4rem 1rem', fontSize: 'var(--text-xs)', whiteSpace: 'nowrap' }}
              >
                Đăng nhập ngay
              </button>
            )}
          </div>

          {/* Upcoming Birthdays Alert */}
          {upcomingBirthdays.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'linear-gradient(135deg,rgba(242,196,208,0.2),rgba(212,168,232,0.15))',
                border: '1px solid rgba(242,196,208,0.35)',
                borderRadius: '20px',
                padding: '1.25rem 1.5rem',
                marginBottom: '2rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
                <span style={{ fontSize: '1.25rem' }}>🎂</span>
                <h3 style={{ fontFamily: "'Comfortaa','Nunito',sans-serif", fontSize: 'var(--text-base)', color: '#f2c4d0', margin: 0 }}>
                  Sinh nhật sắp tới trong 30 ngày ({upcomingBirthdays.length})
                </h3>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {upcomingBirthdays.map((p) => {
                  const [m, d] = p.birthday!.split('/').map(Number);
                  const now = new Date();
                  const bd = new Date(now.getFullYear(), m - 1, d);
                  if (bd < now) bd.setFullYear(now.getFullYear() + 1);
                  const days = Math.ceil((bd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSuggestPerson(p)}
                      style={{
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(242,196,208,0.3)',
                        borderRadius: '14px',
                        padding: '0.5rem 0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        fontFamily: "'Nunito',sans-serif",
                      }}
                    >
                      <span style={{ fontSize: '1.25rem' }}>{p.avatar}</span>
                      <div style={{ textAlign: 'left' }}>
                        <p style={{ fontWeight: 700, color: '#f2c4d0', fontSize: 'var(--text-sm)', margin: 0 }}>{p.name}</p>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', margin: 0 }}>còn {days} ngày · ✨ Gợi ý quà</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Search */}
          {people.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="🔍 Tìm theo tên hoặc mối quan hệ..."
                style={{ width: '100%', maxWidth: '400px', padding: '0.75rem 1.1rem', borderRadius: '50px', border: '1px solid rgba(201,187,232,0.25)', background: 'rgba(255,255,255,0.06)', color: '#f0eaff', fontFamily: "'Nunito',sans-serif", fontSize: 'var(--text-sm)', outline: 'none', backdropFilter: 'blur(8px)' }}
              />
            </div>
          )}

          {/* People grid */}
          {people.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', paddingTop: '3rem' }}>
              <p style={{ fontSize: '4rem', marginBottom: '1rem' }}>🌙</p>
              <h3 style={{ fontFamily: "'Comfortaa','Nunito',sans-serif", color: '#f0eaff', fontSize: '1.25rem', marginBottom: '0.5rem' }}>Sổ nhật kí trống</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Thêm người thân đầu tiên để bắt đầu lưu sở thích của họ</p>
            </motion.div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
              <AnimatePresence>
                {filteredPeople.map((person, i) => {
                  const relInfo = RELATIONSHIP_OPTIONS.find((r) => r.id === person.relationship);
                  return (
                    <motion.div
                      key={person.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => { setSelectedId(person.id); setView('detail'); }}
                      className="card"
                      style={{ padding: '1.5rem', cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                    >
                      <div>
                        <div style={{ fontSize: '3rem', lineHeight: 1, marginBottom: '0.75rem' }}>{person.avatar}</div>
                        <h3 style={{ fontFamily: "'Comfortaa','Nunito',sans-serif", fontSize: '1rem', color: '#f0eaff', margin: '0 0 0.25rem' }}>{person.name}</h3>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', margin: '0 0 0.875rem' }}>
                          {relInfo?.emoji} {relInfo?.label || person.relationship}
                        </p>
                        {person.giftHistory.length > 0 && (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(212,168,232,0.1)', border: '1px solid rgba(212,168,232,0.2)', borderRadius: '999px', padding: '0.2rem 0.65rem', fontSize: 'var(--text-xs)', color: 'var(--lavender-light)', marginBottom: '0.5rem' }}>
                            🎁 {person.giftHistory.length} quà đã tặng
                          </div>
                        )}
                        {person.birthday && (() => {
                          const [m, d] = person.birthday.split('/').map(Number);
                          const now = new Date();
                          const bd = new Date(now.getFullYear(), m - 1, d);
                          if (bd < now) bd.setFullYear(now.getFullYear() + 1);
                          const days = Math.ceil((bd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                          return days <= 30 ? (
                            <div style={{ marginTop: '0.25rem', fontSize: 'var(--text-xs)', color: '#f2c4d0' }}>🎂 còn {days} ngày</div>
                          ) : null;
                        })()}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSuggestPerson(person);
                        }}
                        className="btn-primary"
                        style={{ marginTop: '1rem', width: '100%', fontSize: '0.78rem', padding: '0.45rem', justifyContent: 'center' }}
                      >
                        ✨ Gợi ý quà mới
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showAddModal && (
          <PersonModal
            onClose={() => setShowAddModal(false)}
            onSave={(data) => { addPerson(data); setShowAddModal(false); }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

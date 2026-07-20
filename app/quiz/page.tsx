'use client';

import { useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useQuizStore } from '@/lib/store/quizStore';
import Header from '@/components/layout/Header';

// ========================
// QUIZ DATA
// ========================
const OCCASIONS_OPTIONS = [
  { id: 'Sinh nhật', label: 'Sinh nhật', emoji: '🎂' },
  { id: 'Valentine', label: 'Valentine', emoji: '💝' },
  { id: 'Ngày 8/3', label: '8/3', emoji: '🌸' },
  { id: 'Giáng sinh', label: 'Giáng sinh', emoji: '🎄' },
  { id: 'Ra trường', label: 'Ra trường', emoji: '🎓' },
  { id: 'Thăng chức', label: 'Thăng chức', emoji: '🚀' },
  { id: 'Kỷ niệm', label: 'Kỷ niệm', emoji: '💍' },
  { id: 'Dịp khác', label: 'Dịp khác', emoji: '🎁' },
];

const OCCASION_MAP: Record<string, string> = {
  birthday: 'Sinh nhật',
  valentine: 'Valentine',
  womensday: 'Ngày 8/3',
  christmas: 'Giáng sinh',
  graduation: 'Ra trường',
  promotion: 'Thăng chức',
  anniversary: 'Kỷ niệm',
  other: 'Dịp khác',
};

const RELATIONSHIP_OPTIONS = [
  { id: 'người yêu', label: 'Người yêu', emoji: '💑' },
  { id: 'bạn thân', label: 'Bạn thân', emoji: '👯' },
  { id: 'bố/mẹ', label: 'Bố/Mẹ', emoji: '👨‍👩‍👧' },
  { id: 'đồng nghiệp', label: 'Đồng nghiệp', emoji: '👔' },
  { id: 'sếp', label: 'Sếp', emoji: '💼' },
  { id: 'con cái', label: 'Con cái', emoji: '👶' },
  { id: 'bạn bè', label: 'Bạn bè', emoji: '🤝' },
  { id: 'anh/chị/em', label: 'Anh/Chị/Em', emoji: '👨‍👩‍👦' },
];

const GENDER_OPTIONS = [
  { id: 'nữ', label: 'Nữ', emoji: '👩' },
  { id: 'nam', label: 'Nam', emoji: '👨' },
  { id: 'khác', label: 'Khác', emoji: '🌈' },
];

const AGE_OPTIONS = [
  { id: 'dưới 12 tuổi', label: 'Dưới 12', emoji: '🧒' },
  { id: '13-18 tuổi', label: '13 – 18', emoji: '👦' },
  { id: '19-25 tuổi', label: '19 – 25', emoji: '👨‍🎓' },
  { id: '26-35 tuổi', label: '26 – 35', emoji: '👩‍💼' },
  { id: '36-50 tuổi', label: '36 – 50', emoji: '🧑‍🦳' },
  { id: 'trên 50 tuổi', label: 'Trên 50', emoji: '👴' },
];

const ZODIAC_OPTIONS = [
  { id: 'Bạch Dương ♈', name: 'Bạch Dương', symbol: '♈', emoji: '🐏', color: 'linear-gradient(135deg,#ff6b6b,#ee0979)' },
  { id: 'Kim Ngưu ♉',   name: 'Kim Ngưu',   symbol: '♉', emoji: '🐂', color: 'linear-gradient(135deg,#56ab2f,#a8e063)' },
  { id: 'Song Tử ♊',    name: 'Song Tử',    symbol: '♊', emoji: '👯', color: 'linear-gradient(135deg,#f7971e,#ffd200)' },
  { id: 'Cự Giải ♋',   name: 'Cự Giải',   symbol: '♋', emoji: '🦀', color: 'linear-gradient(135deg,#4facfe,#00f2fe)' },
  { id: 'Sư Tử ♌',     name: 'Sư Tử',     symbol: '♌', emoji: '🦁', color: 'linear-gradient(135deg,#f093fb,#f5576c)' },
  { id: 'Xử Nữ ♍',     name: 'Xử Nữ',     symbol: '♍', emoji: '🌾', color: 'linear-gradient(135deg,#43e97b,#38f9d7)' },
  { id: 'Thiên Bình ♎', name: 'Thiên Bình', symbol: '♎', emoji: '⚖️', color: 'linear-gradient(135deg,#fa709a,#fee140)' },
  { id: 'Bọ Cạp ♏',    name: 'Bọ Cạp',    symbol: '♏', emoji: '🦂', color: 'linear-gradient(135deg,#a18cd1,#fbc2eb)' },
  { id: 'Nhân Mã ♐',   name: 'Nhân Mã',   symbol: '♐', emoji: '🏹', color: 'linear-gradient(135deg,#667eea,#764ba2)' },
  { id: 'Ma Kết ♑',    name: 'Ma Kết',    symbol: '♑', emoji: '🐐', color: 'linear-gradient(135deg,#30cfd0,#330867)' },
  { id: 'Bảo Bình ♒',  name: 'Bảo Bình',  symbol: '♒', emoji: '🏺', color: 'linear-gradient(135deg,#0072ff,#00c6ff)' },
  { id: 'Song Ngư ♓',  name: 'Song Ngư',  symbol: '♓', emoji: '🐟', color: 'linear-gradient(135deg,#f77062,#fe5196)' },
];

const PERSONALITY_OPTIONS = [
  { id: 'hài hước', label: 'Hài hước', emoji: '😄' },
  { id: 'trầm tính', label: 'Trầm tính', emoji: '🧘' },
  { id: 'hướng nội', label: 'Hướng nội', emoji: '🏠' },
  { id: 'hướng ngoại', label: 'Hướng ngoại', emoji: '🎉' },
  { id: 'năng động', label: 'Năng động', emoji: '⚡' },
  { id: 'lãng mạn', label: 'Lãng mạn', emoji: '🌹' },
  { id: 'thực tế', label: 'Thực tế', emoji: '🎯' },
  { id: 'sáng tạo', label: 'Sáng tạo', emoji: '🎨' },
  { id: 'đam mê công nghệ', label: 'Yêu công nghệ', emoji: '💻' },
  { id: 'yêu làm đẹp', label: 'Yêu làm đẹp', emoji: '💄' },
  { id: 'mê ăn uống', label: 'Mê ăn uống', emoji: '🍜' },
  { id: 'thích xa hoa', label: 'Thích xa hoa', emoji: '✨' },
  { id: 'chăm sóc bản thân', label: 'Tự chăm sóc', emoji: '🛁' },
  { id: 'yêu thiên nhiên', label: 'Yêu thiên nhiên', emoji: '🌿' },
];

const INTEREST_OPTIONS = [
  { id: 'đọc sách', label: 'Đọc sách', emoji: '📚' },
  { id: 'du lịch', label: 'Du lịch', emoji: '✈️' },
  { id: 'gaming', label: 'Gaming', emoji: '🎮' },
  { id: 'làm đẹp', label: 'Làm đẹp', emoji: '💅' },
  { id: 'thể thao', label: 'Thể thao', emoji: '⚽' },
  { id: 'nấu ăn', label: 'Nấu ăn', emoji: '👨‍🍳' },
  { id: 'âm nhạc', label: 'Âm nhạc', emoji: '🎵' },
  { id: 'thời trang', label: 'Thời trang', emoji: '👗' },
  { id: 'nhiếp ảnh', label: 'Nhiếp ảnh', emoji: '📷' },
  { id: 'phim ảnh', label: 'Xem phim', emoji: '🎬' },
  { id: 'yoga', label: 'Yoga / Pilates', emoji: '🧘' },
  { id: 'gym', label: 'Gym / Fitness', emoji: '💪' },
  { id: 'nghệ thuật', label: 'Nghệ thuật', emoji: '🎭' },
  { id: 'mỹ phẩm', label: 'Skincare', emoji: '🧴' },
];

const BUDGET_OPTIONS = [
  { id: 'dưới 100.000đ', label: 'Dưới 100k', sub: 'Quà mini dễ thương', emoji: '🎀', value: 0 },
  { id: '100.000đ - 300.000đ', label: '100k – 300k', sub: 'Quà casual, tinh tế', emoji: '🛍️', value: 1 },
  { id: '300.000đ - 500.000đ', label: '300k – 500k', sub: 'Quà chất lượng tốt', emoji: '🎁', value: 2 },
  { id: '500.000đ - 1.000.000đ', label: '500k – 1tr', sub: 'Quà ý nghĩa, premium', emoji: '💝', value: 3 },
  { id: 'trên 1.000.000đ', label: 'Trên 1 triệu', sub: 'Quà cao cấp, đẳng cấp', emoji: '👑', value: 4 },
];

// ========================
// ANIMATION VARIANTS
// ========================
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 30 },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
    transition: { duration: 0.2 },
  }),
};

// ========================
// OPTION BUTTON
// ========================
function OptionButton({
  emoji, label, selected, onClick
}: {
  emoji: string; label: string; selected: boolean; onClick: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`option-card ${selected ? 'selected' : ''}`}
      style={{ width: '100%', fontFamily: 'inherit' }}
    >
      <span style={{ fontSize: '2rem' }}>{emoji}</span>
      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)' }}>{label}</span>
    </motion.button>
  );
}

// ========================
// CHIP
// ========================
function Chip({
  emoji, label, selected, onClick, disabled
}: {
  emoji: string; label: string; selected: boolean; onClick: () => void; disabled?: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`chip ${selected ? 'selected' : ''}`}
      style={{
        fontFamily: 'inherit',
        opacity: disabled && !selected ? 0.4 : 1,
        cursor: disabled && !selected ? 'not-allowed' : 'pointer',
      }}
    >
      <span>{emoji}</span>
      <span>{label}</span>
    </motion.button>
  );
}

// ========================
// QUIZ STEPS
// ========================
function QuizInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const directionRef = useRef(1);
  const {
    currentStep, answers, nextStep, prevStep, setAnswer, completeQuiz,
    setLoadingAI, setSuggestions, setAIError,
  } = useQuizStore();

  // Pre-fill occasion from URL param
  useEffect(() => {
    const occasionParam = searchParams.get('occasion');
    if (occasionParam && OCCASION_MAP[occasionParam] && !answers.occasion) {
      setAnswer('occasion', OCCASION_MAP[occasionParam]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const TOTAL_STEPS = 8;
  const progress = ((currentStep + 1) / TOTAL_STEPS) * 100;

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      directionRef.current = 1;
      nextStep();
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      directionRef.current = -1;
      prevStep();
    }
  };

  const handleSubmit = async () => {
    completeQuiz();
    setLoadingAI(true);
    setAIError(null);
    router.push('/results');

    try {
      const res = await fetch('/api/suggest-gifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      });
      const data = await res.json();
      if (data.error) {
        setAIError(data.error);
      } else {
        setSuggestions(data.suggestions);
      }
    } catch {
      setAIError('Có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setLoadingAI(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return !!answers.occasion;
      case 1: return !!answers.relationship;
      case 2: return !!answers.gender;
      case 3: return !!answers.ageRange;
      case 4: return true; // zodiac is optional
      case 5: return (answers.personality?.length ?? 0) > 0;
      case 6: return (answers.interests?.length ?? 0) > 0;
      case 7: return !!answers.budget;
      default: return false;
    }
  };

  const STEP_TITLES = [
    'Đây là dịp gì? 🎉',
    'Người nhận là ai? 👤',
    'Giới tính người nhận? 💁',
    'Họ bao nhiêu tuổi? 🎂',
    'Cung hoàng đạo của họ? ⭐',
    'Tính cách nổi bật? (tối đa 3) ✨',
    'Sở thích của họ? 🎯',
    'Ngân sách của bạn? 💰',
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
            {OCCASIONS_OPTIONS.map((o) => (
              <OptionButton
                key={o.id}
                emoji={o.emoji}
                label={o.label}
                selected={answers.occasion === o.id}
                onClick={() => setAnswer('occasion', o.id)}
              />
            ))}
          </div>
        );

      case 1:
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
            {RELATIONSHIP_OPTIONS.map((r) => (
              <OptionButton
                key={r.id}
                emoji={r.emoji}
                label={r.label}
                selected={answers.relationship === r.id}
                onClick={() => setAnswer('relationship', r.id)}
              />
            ))}
          </div>
        );

      case 2:
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {GENDER_OPTIONS.map((g) => (
              <OptionButton
                key={g.id}
                emoji={g.emoji}
                label={g.label}
                selected={answers.gender === g.id}
                onClick={() => setAnswer('gender', g.id)}
              />
            ))}
          </div>
        );

      case 3:
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            {AGE_OPTIONS.map((a) => (
              <OptionButton
                key={a.id}
                emoji={a.emoji}
                label={a.label}
                selected={answers.ageRange === a.id}
                onClick={() => setAnswer('ageRange', a.id)}
              />
            ))}
          </div>
        );

      case 4:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
              {ZODIAC_OPTIONS.map((z) => {
                const isSelected = answers.zodiac === z.id;
                return (
                  <motion.button
                    key={z.id}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setAnswer('zodiac', isSelected ? '' : z.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      padding: '0.75rem 0.25rem',
                      borderRadius: '16px',
                      border: `2px solid ${isSelected ? 'var(--color-accent-1)' : 'var(--color-border)'}`,
                      background: isSelected ? 'linear-gradient(135deg,#fdf0ff,#f0f0ff)' : 'white',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'all 0.15s ease',
                      minHeight: '82px',
                      boxShadow: isSelected ? '0 2px 12px rgba(168,85,247,0.18)' : 'none',
                    }}
                  >
                    {/* Gradient icon circle */}
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: isSelected ? z.color : '#f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.1rem',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                    }}>
                      {z.emoji}
                    </div>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: isSelected ? 'var(--color-accent-1)' : 'var(--color-text)',
                      lineHeight: 1.3,
                      textAlign: 'center',
                      letterSpacing: '-0.01em',
                    }}>
                      {z.name}
                    </span>
                  </motion.button>
                );
              })}
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setAnswer('zodiac', answers.zodiac === 'skip' ? '' : 'skip')}
              className={`chip ${answers.zodiac === 'skip' ? 'selected' : ''}`}
              style={{ justifyContent: 'center', padding: '0.75rem', fontFamily: 'inherit', width: '100%' }}
            >
              🤷 Không biết / Bỏ qua
            </motion.button>
            {answers.zodiac && answers.zodiac !== 'skip' && (() => {
              const chosen = ZODIAC_OPTIONS.find(z => z.id === answers.zodiac);
              const descriptions: Record<string, string> = {
                'Bạch Dương ♈': 'Năng động, dẫn đầu, yêu thể thao & công nghệ. Ghét sự nhàm chán.',
                'Kim Ngưu ♉':   'Yêu sự xa hoa, ẩm thực & thẩm mỹ. Thích đồ chất lượng cao.',
                'Song Tử ♊':    'Đa tài, tò mò, hướng ngoại. Thích sự mới lạ và trải nghiệm đa dạng.',
                'Cự Giải ♋':   'Tình cảm, ấm áp, yêu gia đình. Trân trọng quà có ý nghĩa cảm xúc.',
                'Sư Tử ♌':     'Rực rỡ, tự tin, yêu sự sang trọng. Thích đồ nổi bật và cao cấp.',
                'Xử Nữ ♍':     'Tỉ mỉ, thực tế, quan tâm sức khỏe. Thích quà thiết thực và chất lượng.',
                'Thiên Bình ♎': 'Thẩm mỹ cao, yêu nghệ thuật & vẻ đẹp. Ưa sự hài hòa tinh tế.',
                'Bọ Cạp ♏':    'Bí ẩn, đam mê, sâu sắc. Thích quà huyền bí, đặc biệt, độc đáo.',
                'Nhân Mã ♐':   'Tự do, phiêu lưu, lạc quan. Thích trải nghiệm mới và du lịch.',
                'Ma Kết ♑':    'Tham vọng, thực dụng, kỷ luật. Thích quà hữu ích cho công việc.',
                'Bảo Bình ♒':  'Độc đáo, sáng tạo, yêu công nghệ. Thích quà tiên phong, không đụng hàng.',
                'Song Ngư ♓':  'Mơ mộng, nghệ thuật, cảm xúc. Thích quà lãng mạn và có chiều sâu.',
              };
              return (
                <motion.div
                  key={answers.zodiac}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.875rem 1rem', borderRadius: '14px',
                    background: 'linear-gradient(135deg,#fdf0ff,#ede9fe)',
                    border: '1px solid #e9d5ff',
                  }}
                >
                  {chosen && (
                    <div style={{
                      width: '42px', height: '42px', borderRadius: '50%',
                      background: chosen.color, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.3rem', flexShrink: 0,
                      boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
                    }}>
                      {chosen.emoji}
                    </div>
                  )}
                  <div>
                    <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-accent-1)', marginBottom: '0.15rem' }}>
                      {answers.zodiac}
                    </p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.5, margin: 0 }}>
                      {descriptions[answers.zodiac] || ''}
                    </p>
                  </div>
                </motion.div>
              );
            })()}
          </div>
        );

      case 5:
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem' }}>
            {PERSONALITY_OPTIONS.map((p) => {
              const selected = (answers.personality || []).includes(p.id);
              const maxReached = (answers.personality || []).length >= 3;
              return (
                <Chip
                  key={p.id}
                  emoji={p.emoji}
                  label={p.label}
                  selected={selected}
                  disabled={maxReached && !selected}
                  onClick={() => {
                    const current = answers.personality || [];
                    if (selected) {
                      setAnswer('personality', current.filter((x) => x !== p.id));
                    } else if (current.length < 3) {
                      setAnswer('personality', [...current, p.id]);
                    }
                  }}
                />
              );
            })}
            {(answers.personality?.length ?? 0) > 0 && (
              <p style={{ width: '100%', fontSize: '0.8rem', color: 'var(--color-accent-1)', fontWeight: 600 }}>
                Đã chọn {answers.personality?.length}/3
              </p>
            )}
          </div>
        );

      case 6:
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem' }}>
            {INTEREST_OPTIONS.map((i) => {
              const selected = (answers.interests || []).includes(i.id);
              return (
                <Chip
                  key={i.id}
                  emoji={i.emoji}
                  label={i.label}
                  selected={selected}
                  onClick={() => {
                    const current = answers.interests || [];
                    if (selected) {
                      setAnswer('interests', current.filter((x) => x !== i.id));
                    } else {
                      setAnswer('interests', [...current, i.id]);
                    }
                  }}
                />
              );
            })}
          </div>
        );

      case 7:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {BUDGET_OPTIONS.map((b) => {
              const isSelected = answers.budget === b.id;
              return (
                <motion.button
                  key={b.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setAnswer('budget', b.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '1rem 1.25rem', borderRadius: '16px',
                    border: `2px solid ${isSelected ? 'var(--color-accent-1)' : 'var(--color-border)'}`,
                    background: isSelected ? 'linear-gradient(135deg,#FFF1F8,#F5F3FF)' : 'white',
                    cursor: 'pointer', transition: 'all 0.15s ease', fontFamily: 'inherit',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: '1.8rem', flexShrink: 0 }}>{b.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: isSelected ? 'var(--color-accent-1)' : 'var(--color-text)' }}>
                      {b.label}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '1px' }}>
                      {b.sub}
                    </div>
                  </div>
                  {isSelected && (
                    <span style={{ fontSize: '1.2rem', color: 'var(--color-accent-1)', flexShrink: 0 }}>✓</span>
                  )}
                </motion.button>
              );
            })}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Header />

      <main
        style={{
          minHeight: '100dvh',
          paddingTop: '60px',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--color-bg)',
        }}
      >
        {/* Progress Bar */}
        <div
          style={{
            position: 'fixed',
            top: '60px',
            left: 0,
            right: 0,
            zIndex: 99,
            padding: '0.75rem 1.5rem',
            background: 'rgba(251,249,246,0.9)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                Câu {currentStep + 1} / {TOTAL_STEPS}
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-accent-1)' }}>
                {Math.round(progress)}%
              </span>
            </div>
            <div className="progress-track">
              <motion.div
                className="progress-fill"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>

        {/* Quiz Card */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '6rem 1.5rem 2rem',
          }}
        >
          <div style={{ maxWidth: '640px', margin: '0 auto', width: '100%' }}>
            <AnimatePresence mode="wait" custom={directionRef.current}>
              <motion.div
                key={currentStep}
                custom={directionRef.current}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                {/* Question Title */}
                <h2
                  style={{
                    fontSize: 'clamp(1.25rem, 4vw, 1.75rem)',
                    fontWeight: 800,
                    marginBottom: '1.75rem',
                    color: 'var(--color-text)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {STEP_TITLES[currentStep]}
                </h2>

                {/* Step Content */}
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            background: 'rgba(251,249,246,0.95)',
            backdropFilter: 'blur(10px)',
            borderTop: '1px solid var(--color-border-light)',
            position: 'sticky',
            bottom: 0,
          }}
        >
          <div
            style={{
              maxWidth: '640px',
              margin: '0 auto',
              display: 'flex',
              gap: '1rem',
              justifyContent: currentStep === 0 ? 'flex-end' : 'space-between',
            }}
          >
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="btn-secondary"
                style={{ flex: 1, maxWidth: '140px', padding: '0.875rem 1rem' }}
              >
                ← Quay lại
              </button>
            )}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleNext}
              disabled={!canProceed()}
              className="btn-primary"
              style={{
                flex: 2,
                opacity: canProceed() ? 1 : 0.45,
                cursor: canProceed() ? 'pointer' : 'not-allowed',
                justifyContent: 'center',
              }}
            >
              {currentStep === TOTAL_STEPS - 1 ? '🎁 Xem gợi ý quà' : 'Tiếp theo →'}
            </motion.button>
          </div>
        </div>
      </main>
    </>
  );
}

export default function QuizPage() {
  const quizSkeleton = (
    <div style={{ paddingTop: '60px', minHeight: '100dvh', background: 'var(--color-bg)' }}>
      {/* Progress bar skeleton */}
      <div style={{ height: '4px', background: 'var(--color-border-light)', position: 'fixed', top: '60px', left: 0, right: 0, zIndex: 99 }}>
        <div style={{ width: '12%', height: '100%', background: 'var(--gradient-main)', borderRadius: '0 4px 4px 0' }} />
      </div>
      <div style={{ maxWidth: '540px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <div className="skeleton" style={{ width: '60%', height: '14px', borderRadius: '8px', marginBottom: '0.5rem' }} />
        <div className="skeleton" style={{ width: '40%', height: '28px', borderRadius: '8px', marginBottom: '2rem' }} />
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton" style={{ width: '100%', height: '52px', borderRadius: '14px', marginBottom: '0.75rem' }} />
        ))}
      </div>
    </div>
  );

  return (
    <Suspense fallback={quizSkeleton}>
      <QuizInner />
    </Suspense>
  );
}

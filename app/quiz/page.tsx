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
  'Bạch Dương ♈', 'Kim Ngưu ♉', 'Song Tử ♊', 'Cự Giải ♋',
  'Sư Tử ♌', 'Xử Nữ ♍', 'Thiên Bình ♎', 'Bọ Cạp ♏',
  'Nhân Mã ♐', 'Ma Kết ♑', 'Bảo Bình ♒', 'Song Ngư ♓',
];

const PERSONALITY_OPTIONS = [
  { id: 'hài hước', label: 'Hài hước', emoji: '😄' },
  { id: 'trầm tính', label: 'Trầm tính', emoji: '🧘' },
  { id: 'năng động', label: 'Năng động', emoji: '⚡' },
  { id: 'lãng mạn', label: 'Lãng mạn', emoji: '🌹' },
  { id: 'thực tế', label: 'Thực tế', emoji: '🎯' },
  { id: 'sáng tạo', label: 'Sáng tạo', emoji: '🎨' },
  { id: 'yêu công nghệ', label: 'Yêu công nghệ', emoji: '💻' },
  { id: 'yêu làm đẹp', label: 'Yêu làm đẹp', emoji: '💄' },
  { id: 'mê ăn uống', label: 'Mê ăn uống', emoji: '🍜' },
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
];

const BUDGET_OPTIONS = [
  { id: 'dưới 100.000đ', label: 'Dưới 100k', value: 0 },
  { id: '100.000đ - 300.000đ', label: '100k – 300k', value: 1 },
  { id: '300.000đ - 500.000đ', label: '300k – 500k', value: 2 },
  { id: '500.000đ - 1.000.000đ', label: '500k – 1tr', value: 3 },
  { id: 'trên 1.000.000đ', label: 'Trên 1tr', value: 4 },
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
            <select
              value={answers.zodiac || ''}
              onChange={(e) => setAnswer('zodiac', e.target.value)}
              style={{
                width: '100%',
                padding: '1rem 1.25rem',
                borderRadius: '16px',
                border: '2px solid var(--color-border)',
                background: 'white',
                fontSize: '1rem',
                fontFamily: 'inherit',
                color: answers.zodiac ? 'var(--color-text)' : 'var(--color-text-muted)',
                cursor: 'pointer',
                outline: 'none',
                transition: 'border-color 0.15s ease',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--color-accent-2)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)'; }}
            >
              <option value="">Chọn cung hoàng đạo...</option>
              {ZODIAC_OPTIONS.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
            <button
              onClick={() => setAnswer('zodiac', 'skip')}
              className={`chip ${answers.zodiac === 'skip' ? 'selected' : ''}`}
              style={{ justifyContent: 'center', padding: '0.75rem', fontFamily: 'inherit', width: '100%' }}
            >
              🤷 Không biết / Bỏ qua
            </button>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', textAlign: 'center' }}>
              Cung hoàng đạo giúp AI gợi ý chính xác hơn, nhưng không bắt buộc
            </p>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Visual budget selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {BUDGET_OPTIONS.map((b) => (
                <motion.button
                  key={b.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setAnswer('budget', b.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem 1.25rem',
                    borderRadius: '16px',
                    border: `2px solid ${answers.budget === b.id ? 'var(--color-accent-1)' : 'var(--color-border)'}`,
                    background: answers.budget === b.id
                      ? 'linear-gradient(135deg, #FFF1F8, #F5F3FF)'
                      : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    fontFamily: 'inherit',
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text)' }}>
                    {b.label}
                  </span>
                  <span style={{ fontSize: '1.5rem' }}>
                    {'💸'.repeat(b.value + 1).slice(0, 3)}
                  </span>
                </motion.button>
              ))}
            </div>
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
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QuizInner />
    </Suspense>
  );
}

'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
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

const PERSONALITY_GROUPS = [
  {
    groupTitle: '✨ Cảm Xúc & Thần Thái',
    items: [
      { id: 'hài hước', label: 'Hài hước & Vui vẻ', emoji: '😄' },
      { id: 'lãng mạn', label: 'Lãng mạn & Tình cảm', emoji: '🌹' },
      { id: 'hướng nội', label: 'Hướng nội & Sâu sắc', emoji: '🏠' },
      { id: 'hướng ngoại', label: 'Hướng ngoại & Thân thiện', emoji: '🎉' },
      { id: 'trầm tính', label: 'Trầm tính & Nhẹ nhàng', emoji: '🧘' },
      { id: 'lạc quan', label: 'Lạc quan & Yêu đời', emoji: '☀️' },
    ],
  },
  {
    groupTitle: '🎯 Phong Cách & Tư Duy',
    items: [
      { id: 'năng động', label: 'Năng động & Nhiệt huyết', emoji: '⚡' },
      { id: 'thực tế', label: 'Thực tế & Chu đáo', emoji: '🎯' },
      { id: 'sáng tạo', label: 'Sáng tạo & Bay bổng', emoji: '🎨' },
      { id: 'tỉ mỉ', label: 'Tỉ mỉ & Cẩn thận', emoji: '🧠' },
      { id: 'phiêu lưu', label: 'Phiêu lưu & Khám phá', emoji: '🎪' },
      { id: 'tinh tế', label: 'Đẳng cấp & Tinh tế', emoji: '👑' },
    ],
  },
  {
    groupTitle: '🌱 Lối Sống & Thói Quen',
    items: [
      { id: 'đam mê công nghệ', label: 'Đam mê công nghệ', emoji: '💻' },
      { id: 'yêu làm đẹp', label: 'Yêu chăm sóc bản thân', emoji: '💄' },
      { id: 'yêu thiên nhiên', label: 'Yêu thiên nhiên & Cây cối', emoji: '🌿' },
      { id: 'thích chill', label: 'Thích bình yên & Chill', emoji: '☕' },
      { id: 'thích thời trang', label: 'Thích thời trang & Trendy', emoji: '🛍️' },
      { id: 'yêu tri thức', label: 'Yêu tri thức & Tự học', emoji: '📚' },
    ],
  },
];

const INTEREST_GROUPS = [
  {
    groupTitle: '🎮 Giải Trí & Lối Sống',
    items: [
      { id: 'đọc sách', label: 'Đọc sách & Viết lách', emoji: '📚' },
      { id: 'gaming', label: 'Gaming & Esport', emoji: '🎮' },
      { id: 'âm nhạc', label: 'Âm nhạc & Concert', emoji: '🎵' },
      { id: 'xem phim', label: 'Xem phim & Series', emoji: '🎬' },
      { id: 'du lịch', label: 'Du lịch & Phượt', emoji: '✈️' },
      { id: 'cafe', label: 'Cafe & Thư giãn', emoji: '☕' },
    ],
  },
  {
    groupTitle: '💄 Làm Đẹp, Thời Trang & Thẩm Mỹ',
    items: [
      { id: 'mỹ phẩm', label: 'Skincare & Mỹ phẩm', emoji: '🧴' },
      { id: 'thời trang', label: 'Thời trang & Outfit', emoji: '👗' },
      { id: 'trang sức', label: 'Trang sức & Phụ kiện', emoji: '💎' },
      { id: 'nhiếp ảnh', label: 'Nhiếp ảnh & Chụp hình', emoji: '📷' },
      { id: 'nghệ thuật', label: 'Vẽ tranh & Thủ công', emoji: '🎨' },
      { id: 'decor', label: 'Decor phòng & Nhà cửa', emoji: '🛋️' },
    ],
  },
  {
    groupTitle: '🏃 Thể Thao, Sức Khỏe & Ẩm Thực',
    items: [
      { id: 'gym', label: 'Gym & Fitness', emoji: '🏋️' },
      { id: 'yoga', label: 'Yoga & Pilates', emoji: '🧘' },
      { id: 'thể thao', label: 'Bóng đá & Thể thao', emoji: '⚽' },
      { id: 'chạy bộ', label: 'Chạy bộ & Marathon', emoji: '🏃' },
      { id: 'nấu ăn', label: 'Nấu ăn & Làm bánh', emoji: '👨‍🍳' },
      { id: 'thưởng trà', label: 'Thưởng trà & Matcha', emoji: '🍵' },
      { id: 'thú cưng', label: 'Chăm sóc thú cưng', emoji: '🐾' },
      { id: 'làm vườn', label: 'Trồng cây & Làm vườn', emoji: '🌱' },
    ],
  },
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
      style={{ width: '100%', fontFamily: "'Nunito',sans-serif" }}
    >
      <span style={{ fontSize: '1.875rem', lineHeight: 1 }}>{emoji}</span>
      <span style={{
        fontSize: 'var(--text-sm)',
        fontWeight: 600,
        fontFamily: "'Nunito',sans-serif",
        color: selected ? 'var(--cream)' : 'var(--color-text-muted)',
        lineHeight: 1.3,
      }}>{label}</span>
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
        fontFamily: "'Nunito',sans-serif",
        fontSize: 'var(--text-sm)',
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

  // Pre-fill from URL params (occasion from homepage, + relationship/gender/ageRange/zodiac from Journal)
  const [prefilled, setPrefilled] = useState<string[]>([]);
  const [prefilledPerson, setPrefilledPerson] = useState('');
  useEffect(() => {
    const filled: string[] = [];
    const occasionParam = searchParams.get('occasion');
    if (occasionParam && OCCASION_MAP[occasionParam] && !answers.occasion) {
      setAnswer('occasion', OCCASION_MAP[occasionParam]);
      filled.push('dịp');
    }
    const relationshipParam = searchParams.get('relationship');
    if (relationshipParam && !answers.relationship) {
      setAnswer('relationship', relationshipParam);
      filled.push('mối quan hệ');
    }
    const genderParam = searchParams.get('gender') as 'nữ' | 'nam' | 'khác' | null;
    if (genderParam && !answers.gender) {
      setAnswer('gender', genderParam);
      filled.push('giới tính');
    }
    const ageParam = searchParams.get('ageRange');
    if (ageParam && !answers.ageRange) {
      setAnswer('ageRange', ageParam);
      filled.push('độ tuổi');
    }
    const zodiacParam = searchParams.get('zodiac');
    if (zodiacParam && !answers.zodiac) {
      setAnswer('zodiac', zodiacParam);
      filled.push('cung hoàng đạo');
    }
    const personParam = searchParams.get('person');
    if (personParam) setPrefilledPerson(personParam);
    if (filled.length > 0) setPrefilled(filled);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const TOTAL_STEPS = 9;
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
      case 8: return true; // custom description is optional
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
    'Mô tả thêm về người nhận (Tùy chọn) 📝',
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
                      border: `1.5px solid ${isSelected ? 'rgba(212,168,232,0.6)' : 'rgba(201,187,232,0.18)'}`,
                      background: isSelected
                        ? 'linear-gradient(135deg, rgba(212,168,232,0.22), rgba(155,181,232,0.15))'
                        : 'rgba(255,255,255,0.06)',
                      cursor: 'pointer',
                      fontFamily: "'Nunito',sans-serif",
                      transition: 'all 0.15s ease',
                      minHeight: '82px',
                      boxShadow: isSelected ? '0 0 16px rgba(212,168,232,0.25)' : 'none',
                    }}
                  >
                    {/* Gradient icon circle */}
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: isSelected ? z.color : 'rgba(255,255,255,0.08)',
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
                      fontSize: 'var(--text-xs)',
                      fontFamily: "'Nunito',sans-serif",
                      fontWeight: 700,
                      color: isSelected ? 'var(--cream)' : 'var(--lavender-light)',
                      lineHeight: 1.3,
                      textAlign: 'center',
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
                    background: 'rgba(212,168,232,0.12)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(212,168,232,0.25)',
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
                    <p style={{ fontFamily: "'Nunito',sans-serif", fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--cream)', marginBottom: '0.15rem' }}>
                      {answers.zodiac}
                    </p>
                    <p style={{ fontFamily: "'Nunito',sans-serif", fontSize: 'var(--text-xs)', color: 'var(--lavender-pale)', lineHeight: 1.5, margin: 0 }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {PERSONALITY_GROUPS.map((group) => (
              <div key={group.groupTitle} style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: 'var(--lavender-light)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {group.groupTitle}
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem' }}>
                  {group.items.map((p) => {
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
                </div>
              </div>
            ))}
            {(answers.personality?.length ?? 0) > 0 && (
              <p style={{ fontSize: '0.8rem', color: 'var(--color-accent-1)', fontWeight: 600, margin: 0 }}>
                ✓ Đã chọn {answers.personality?.length}/3 tính cách
              </p>
            )}
          </div>
        );

      case 6:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {INTEREST_GROUPS.map((group) => (
              <div key={group.groupTitle} style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: 'var(--lavender-light)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {group.groupTitle}
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem' }}>
                  {group.items.map((i) => {
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
              </div>
            ))}
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
                    border: `1.5px solid ${isSelected ? 'rgba(212,168,232,0.6)' : 'rgba(201,187,232,0.18)'}`,
                    background: isSelected
                      ? 'linear-gradient(135deg, rgba(212,168,232,0.22), rgba(155,181,232,0.15))'
                      : 'rgba(255,255,255,0.06)',
                    cursor: 'pointer', transition: 'all 0.15s ease', fontFamily: "'Nunito',sans-serif",
                    textAlign: 'left',
                    boxShadow: isSelected ? '0 0 16px rgba(212,168,232,0.25)' : 'none',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <span style={{ fontSize: '1.8rem', flexShrink: 0 }}>{b.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: isSelected ? 'var(--cream)' : 'var(--lavender-light)' }}>
                      {b.label}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                      {b.sub}
                    </div>
                  </div>
                  {isSelected && (
                    <span style={{ fontSize: '1.2rem', color: 'var(--cream)', flexShrink: 0 }}>✓</span>
                  )}
                </motion.button>
              );
            })}
          </div>
        );

      case 8:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--lavender-light)', margin: 0 }}>
              Nhập thêm các chi tiết đặc biệt (thói quen, phong cách riêng, kỷ niệm hay lưu ý khó tính)... AI sẽ ưu tiên đưa chi tiết này vào món quà!
            </p>
            <textarea
              rows={5}
              placeholder="Ví dụ: Anh ấy rất thích đi cắm trại cuối tuần, phong cách tối giản, hơi khó tính nhưng rất thương gia đình..."
              value={answers.customDescription || ''}
              onChange={(e) => setAnswer('customDescription', e.target.value)}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '16px',
                border: '1.5px solid rgba(201,187,232,0.3)',
                background: 'rgba(255,255,255,0.06)',
                color: '#fff',
                fontFamily: "'Nunito', sans-serif",
                fontSize: 'var(--text-base)',
                lineHeight: 1.6,
                outline: 'none',
                resize: 'none',
              }}
            />
          </div>
        );

      default:
        return null;
    }
  };

  const isZodiacStep = currentStep === 4;

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
        {/* ── Progress Bar ───────────────────────────────────────── */}
        <div
          style={{
            position: 'fixed',
            top: '60px',
            left: 0,
            right: 0,
            zIndex: 99,
            padding: '0.625rem 1.5rem 0.5rem',
            background: 'rgba(20,17,48,0.88)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(201,187,232,0.15)',
          }}
        >
          <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            {/* Step label row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  style={{
                    fontSize: 'var(--text-xs)',
                    fontWeight: 700,
                    fontFamily: "'Comfortaa','Nunito',sans-serif",
                    padding: '0.2rem 0.6rem',
                    borderRadius: '999px',
                    background: 'linear-gradient(135deg, #c9a8e8, #9bb0e8)',
                    color: '#1a1535',
                    letterSpacing: '0.03em',
                  }}
                >
                  {currentStep + 1}/{TOTAL_STEPS}
                </span>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, fontFamily: "'Nunito',sans-serif", color: 'var(--lavender-light)' }}>
                  {STEP_TITLES[currentStep]}
                </span>
              </div>
              <span style={{ fontSize: 'var(--text-xs)', fontFamily: "'Nunito',sans-serif", color: 'var(--color-text-light)' }}>
                ~{Math.max(1, Math.ceil((TOTAL_STEPS - currentStep) * 0.3))} phút
              </span>
            </div>
            {/* Progress track */}
            <div className="progress-track" style={{ height: '6px' }}>
              <motion.div
                className="progress-fill"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                style={{ height: '6px', borderRadius: '6px' }}
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
            padding: '6.5rem 1.5rem 2rem',
          }}
        >
          <div style={{ maxWidth: '640px', margin: '0 auto', width: '100%' }}>
            {/* Prefilled badge */}
            {prefilled.length > 0 && currentStep === 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.35rem 0.875rem',
                  borderRadius: '999px',
                  background: 'rgba(212,168,232,0.18)',
                  border: '1px solid rgba(212,168,232,0.4)',
                  fontSize: 'var(--text-xs)',
                  fontFamily: "'Nunito',sans-serif",
                  fontWeight: 700,
                  color: 'var(--lavender-light)',
                  marginBottom: '0.875rem',
                }}
              >
                ✨ {prefilledPerson ? `Đã load từ sổ nhật kí: ${prefilledPerson}` : `Đã điền sẵn: ${prefilled.join(', ')}`}
              </motion.div>
            )}

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
                    fontSize: 'clamp(1.2rem, 3.5vw, 1.6rem)',
                    fontFamily: "'Comfortaa','Nunito',sans-serif",
                    fontWeight: 700,
                    marginBottom: '1.5rem',
                    color: 'var(--cream)',
                    letterSpacing: 'var(--ls-normal)',
                    lineHeight: 'var(--lh-snug)',
                  }}
                >
                  {STEP_TITLES[currentStep]}
                </h2>

                {/* Optional badge for zodiac */}
                {isZodiacStep && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.25rem 0.7rem',
                      borderRadius: '999px',
                      background: 'rgba(201,187,232,0.12)',
                      border: '1px solid rgba(201,187,232,0.25)',
                      fontSize: 'var(--text-xs)',
                      fontFamily: "'Nunito',sans-serif",
                      fontWeight: 600,
                      color: 'var(--lavender-light)',
                      marginBottom: '1rem',
                    }}
                  >
                    ✨ Không bắt buộc — AI sẽ gợi ý tốt hơn nếu có
                  </div>
                )}

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
            background: 'rgba(20,17,48,0.9)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderTop: '1px solid rgba(201,187,232,0.15)',
            position: 'sticky',
            bottom: 0,
          }}
        >
          <div
            style={{
              maxWidth: '640px',
              margin: '0 auto',
              display: 'flex',
              gap: '0.75rem',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                justifyContent: currentStep === 0 ? 'flex-end' : 'space-between',
              }}
            >
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="btn-secondary"
                  style={{ flex: 1, maxWidth: '130px', padding: '0.875rem 1rem' }}
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

            {/* Skip button — only on zodiac step */}
            {isZodiacStep && (
              <motion.button
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setAnswer('zodiac', 'skip');
                  directionRef.current = 1;
                  nextStep();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-muted)',
                  fontSize: 'var(--text-sm)',
                  fontFamily: "'Nunito',sans-serif",
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  textUnderlineOffset: '3px',
                  padding: '0.25rem 0',
                  textAlign: 'center',
                }}
              >
                Bỏ qua câu này →
              </motion.button>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default function QuizPage() {
  const quizSkeleton = (
    <div style={{ paddingTop: '60px', minHeight: '100dvh', background: 'transparent' }}>
      {/* Progress bar skeleton */}
      <div style={{ height: '4px', background: 'rgba(201,187,232,0.15)', position: 'fixed', top: '60px', left: 0, right: 0, zIndex: 99 }}>
        <div style={{ width: '12%', height: '100%', background: 'linear-gradient(90deg,#c9a8e8,#9bb0e8)', borderRadius: '0 4px 4px 0' }} />
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

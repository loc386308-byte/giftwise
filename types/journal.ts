// ── Journal types ────────────────────────────────────────────
export interface GiftRecord {
  id: string;
  giftName: string;
  occasion: string;
  date: string;        // ISO date string
  priceRange?: string;
  notes?: string;
  rating?: 1 | 2 | 3 | 4 | 5; // how well received
}

export interface Person {
  id: string;
  name: string;
  relationship: string; // 'người yêu' | 'bạn thân' | 'bố/mẹ' | ...
  gender?: 'nữ' | 'nam' | 'khác';
  ageRange?: string;
  zodiac?: string;
  birthday?: string;   // MM-DD
  avatar: string;      // emoji
  interests: string[];
  personality: string[];
  notes?: string;
  giftHistory: GiftRecord[];
  createdAt: string;
}

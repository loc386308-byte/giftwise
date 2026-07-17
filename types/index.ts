export interface QuizAnswers {
  occasion: string;
  relationship: string;
  gender: string;
  ageRange: string;
  zodiac?: string;
  personality: string[];
  interests: string[];
  budget: string;
}

export interface GiftSuggestion {
  id: string;
  productName: string;
  reason: string;
  estimatedPriceRange: string;
  searchKeyword: string;
  emoji: string;
  category: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  sold: number;
  source: 'shopee' | 'tiktok';
  affiliateLink: string;
  discount?: number;
  badge?: string;
}

export interface Store {
  placeId: string;
  name: string;
  address: string;
  distanceMeters: number;
  rating: number;
  reviewCount: number;
  openNow: boolean;
  openHours?: string;
  lat: number;
  lng: number;
  photoUrl?: string;
  phoneNumber?: string;
  types: string[];
}

export interface AIResponse {
  suggestions: GiftSuggestion[];
}

export interface OnlineSearchResult {
  products: Product[];
  keyword: string;
  totalFound: number;
}

export interface OfflineSearchResult {
  stores: Store[];
  keyword: string;
  userLocation: { lat: number; lng: number };
}

import { create } from 'zustand';
import { QuizAnswers, GiftSuggestion } from '@/types';

interface QuizStore {
  // Quiz state
  currentStep: number;
  answers: Partial<QuizAnswers>;
  isComplete: boolean;

  // Results state
  suggestions: GiftSuggestion[];
  isLoadingAI: boolean;
  aiError: string | null;

  // Selected gift for online/offline search
  selectedGift: GiftSuggestion | null;

  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setAnswer: <K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]) => void;
  completeQuiz: () => void;
  setSuggestions: (suggestions: GiftSuggestion[]) => void;
  setLoadingAI: (loading: boolean) => void;
  setAIError: (error: string | null) => void;
  selectGift: (gift: GiftSuggestion) => void;
  reset: () => void;
}

const initialState = {
  currentStep: 0,
  answers: {},
  isComplete: false,
  suggestions: [],
  isLoadingAI: false,
  aiError: null,
  selectedGift: null,
};

export const useQuizStore = create<QuizStore>((set) => ({
  ...initialState,

  setStep: (step) => set({ currentStep: step }),

  nextStep: () => set((state) => ({
    currentStep: Math.min(state.currentStep + 1, 8),
  })),

  prevStep: () => set((state) => ({
    currentStep: Math.max(state.currentStep - 1, 0),
  })),

  setAnswer: (key, value) => set((state) => ({
    answers: { ...state.answers, [key]: value },
  })),

  completeQuiz: () => set({ isComplete: true }),

  setSuggestions: (suggestions) => set({ suggestions }),

  setLoadingAI: (loading) => set({ isLoadingAI: loading }),

  setAIError: (error) => set({ aiError: error }),

  selectGift: (gift) => set({ selectedGift: gift }),

  reset: () => set(initialState),
}));

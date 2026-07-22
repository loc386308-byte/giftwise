import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useJournalStore } from './journalStore';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  createdAt: string;
}

interface AuthState {
  user: UserProfile | null;
  isAuthModalOpen: boolean;
  login: (email: string, name: string) => void;
  logout: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthModalOpen: false,
      login: (email: string, name: string) => {
        const id = `user_${btoa(email.toLowerCase().trim()).replace(/=/g, '').slice(0, 12)}`;
        const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`;
        const newUser: UserProfile = {
          id,
          name: name.trim() || email.split('@')[0],
          email: email.trim().toLowerCase(),
          avatar,
          createdAt: new Date().toISOString(),
        };
        set({ user: newUser, isAuthModalOpen: false });
        // Automatically claim any unassigned/guest records to this user
        setTimeout(() => {
          useJournalStore.getState().claimGuestRecords(id);
        }, 50);
      },
      logout: () => {
        set({ user: null });
      },
      openAuthModal: () => set({ isAuthModalOpen: true }),
      closeAuthModal: () => set({ isAuthModalOpen: false }),
    }),
    {
      name: 'giftwise_auth_user',
    }
  )
);

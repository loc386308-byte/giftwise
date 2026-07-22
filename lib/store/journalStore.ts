import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Person, GiftRecord } from '@/types/journal';
import { useAuthStore } from './authStore';

interface JournalStore {
  people: Person[];

  // Actions
  addPerson: (person: Omit<Person, 'id' | 'createdAt' | 'giftHistory'>, targetUserId?: string) => void;
  updatePerson: (id: string, updates: Partial<Person>) => void;
  deletePerson: (id: string) => void;
  addGiftRecord: (personId: string, record: Omit<GiftRecord, 'id'>) => void;
  deleteGiftRecord: (personId: string, recordId: string) => void;
  claimGuestRecords: (userId: string) => void;
}

export const useJournalStore = create<JournalStore>()(
  persist(
    (set, get) => ({
      people: [],

      addPerson: (personData, targetUserId) => {
        const activeUserId = targetUserId || useAuthStore.getState().user?.id || 'guest';
        set((state) => ({
          people: [
            ...state.people,
            {
              ...personData,
              id: `person_${Date.now()}`,
              userId: activeUserId,
              giftHistory: [],
              createdAt: new Date().toISOString(),
            },
          ],
        }));
      },

      updatePerson: (id, updates) =>
        set((state) => ({
          people: state.people.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),

      deletePerson: (id) =>
        set((state) => ({
          people: state.people.filter((p) => p.id !== id),
        })),

      addGiftRecord: (personId, record) =>
        set((state) => ({
          people: state.people.map((p) =>
            p.id === personId
              ? {
                  ...p,
                  giftHistory: [
                    { ...record, id: `gift_${Date.now()}` },
                    ...p.giftHistory,
                  ],
                }
              : p
          ),
        })),

      deleteGiftRecord: (personId, recordId) =>
        set((state) => ({
          people: state.people.map((p) =>
            p.id === personId
              ? { ...p, giftHistory: p.giftHistory.filter((g) => g.id !== recordId) }
              : p
          ),
        })),

      claimGuestRecords: (userId: string) =>
        set((state) => ({
          people: state.people.map((p) => (!p.userId || p.userId === 'guest' ? { ...p, userId } : p)),
        })),
    }),
    { name: 'giftwise-journal-v2' }
  )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Person, GiftRecord } from '@/types/journal';

interface JournalStore {
  people: Person[];

  // Actions
  addPerson: (person: Omit<Person, 'id' | 'createdAt' | 'giftHistory'>) => void;
  updatePerson: (id: string, updates: Partial<Person>) => void;
  deletePerson: (id: string) => void;
  addGiftRecord: (personId: string, record: Omit<GiftRecord, 'id'>) => void;
  deleteGiftRecord: (personId: string, recordId: string) => void;
}

export const useJournalStore = create<JournalStore>()(
  persist(
    (set) => ({
      people: [],

      addPerson: (personData) =>
        set((state) => ({
          people: [
            ...state.people,
            {
              ...personData,
              id: `person_${Date.now()}`,
              giftHistory: [],
              createdAt: new Date().toISOString(),
            },
          ],
        })),

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
    }),
    { name: 'giftwise-journal' }
  )
);

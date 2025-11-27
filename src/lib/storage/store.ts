/**
 * Zustand Store for Wallet State Management
 */
import { create } from 'zustand';

export type Page =
  | 'unlock'
  | 'welcome'
  | 'create-wallet'
  | 'confirm-seed'
  | 'import-wallet'
  | 'set-password'
  | 'home'
  | 'send'
  | 'receive'
  | 'settings';

interface AppState {
  // Navigation
  currentPage: Page;
  navigateTo: (page: Page) => void;

  // Onboarding state
  generatedSeed: string | null;
  importedSeed: string | null;
  birthdayHeight: number | null;

  // Actions
  setGeneratedSeed: (seed: string) => void;
  setImportedSeed: (seed: string) => void;
  setBirthdayHeight: (height: number | null) => void;
  clearOnboardingData: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Navigation
  currentPage: 'unlock', // Start with unlock, will check if vault exists
  navigateTo: (page) => set({ currentPage: page }),

  // Onboarding state
  generatedSeed: null,
  importedSeed: null,
  birthdayHeight: null,

  // Actions
  setGeneratedSeed: (seed) => set({ generatedSeed: seed }),
  setImportedSeed: (seed) => set({ importedSeed: seed }),
  setBirthdayHeight: (height) => set({ birthdayHeight: height }),
  clearOnboardingData: () => set({
    generatedSeed: null,
    importedSeed: null,
    birthdayHeight: null
  }),
}));

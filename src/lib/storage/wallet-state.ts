/**
 * Wallet State Management with Zustand
 * 
 * This manages the runtime state of the wallet including:
 * - WebZjs initialization status
 * - Current address
 * - Balance
 * - Sync status
 */

import { create } from 'zustand';

interface WalletState {
  // Initialization
  isInitialized: boolean;
  isUnlocked: boolean;
  
  // Wallet data
  accountId: number | null;
  address: string | null;
  balance: bigint;
  
  // Sync status
  isSyncing: boolean;
  lastSyncTime: number | null;
  syncProgress: number; // 0-100
  
  // Actions
  setInitialized: (value: boolean) => void;
  setUnlocked: (value: boolean) => void;
  setAccountId: (id: number) => void;
  setAddress: (address: string) => void;
  setBalance: (balance: bigint) => void;
  setSyncing: (syncing: boolean) => void;
  setLastSyncTime: (time: number) => void;
  setSyncProgress: (progress: number) => void;
  reset: () => void;
}

export const useWalletState = create<WalletState>((set) => ({
  // Initial state
  isInitialized: false,
  isUnlocked: false,
  accountId: null,
  address: null,
  balance: BigInt(0),
  isSyncing: false,
  lastSyncTime: null,
  syncProgress: 0,
  
  // Actions
  setInitialized: (value) => set({ isInitialized: value }),
  setUnlocked: (value) => set({ isUnlocked: value }),
  setAccountId: (id) => set({ accountId: id }),
  setAddress: (address) => set({ address }),
  setBalance: (balance) => set({ balance }),
  setSyncing: (syncing) => set({ isSyncing: syncing }),
  setLastSyncTime: (time) => set({ lastSyncTime: time }),
  setSyncProgress: (progress) => set({ syncProgress: progress }),
  reset: () => set({
    isInitialized: false,
    isUnlocked: false,
    accountId: null,
    address: null,
    balance: BigInt(0),
    isSyncing: false,
    lastSyncTime: null,
    syncProgress: 0,
  }),
}));


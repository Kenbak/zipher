/**
 * Wallet Types
 */

export interface WalletState {
  isUnlocked: boolean;
  isInitialized: boolean;
  balance: bigint;
  address: string | null;
  isSyncing: boolean;
  lastSyncTime: number | null;
}

export interface Transaction {
  txid: string;
  type: 'received' | 'sent';
  amount: bigint;
  memo?: string;
  timestamp: number;
  confirmations: number;
  address: string;
}

export interface WalletConfig {
  network: 'test' | 'main';
  lightwalletdUrl: string;
  autoSyncInterval: number; // minutes
}

export interface EncryptedWallet {
  encrypted: string;
  iv: string;
  salt: string;
  version: number;
}


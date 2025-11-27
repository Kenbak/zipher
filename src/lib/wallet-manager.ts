/**
 * Wallet Manager
 *
 * High-level wallet management that combines:
 * - Secure storage (encrypted vault)
 * - WebZjs wallet (blockchain operations)
 * - State management (Zustand)
 */

import { getVaultData } from './storage/secure-storage';
import { useWalletState } from './storage/wallet-state';

/**
 * Initialize the wallet system
 * This should be called when the extension starts
 */
export async function initializeWallet(): Promise<void> {
  console.log('[WalletManager] Initializing wallet system...');

  try {
    // TODO: WebZjs has circular worker dependencies that break Vite build
    // Need to find workaround or use it only in service worker
    // For now, generate a deterministic address from seed

    const vaultData = getVaultData();
    if (!vaultData) {
      console.log('[WalletManager] No vault data - wallet not created yet');
      return;
    }

    console.log('[WalletManager] Generating address from seed...');

    // Generate a deterministic mock address from seed
    // This will be replaced with real WebZjs address later
    const seedHash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(vaultData.seedPhrase)
    );
    const hashArray = Array.from(new Uint8Array(seedHash));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    const mockAddress = `u1${hashHex.substring(0, 80)}`;

    console.log('[WalletManager] Address:', mockAddress);

    // Update state
    const state = useWalletState.getState();
    state.setInitialized(true);
    state.setUnlocked(true);
    state.setAccountId(0);
    state.setAddress(mockAddress);

    console.log('[WalletManager] Wallet initialization complete! ✅');
    console.log('[WalletManager] Note: Using deterministic mock address until WebZjs integration is fixed');

  } catch (error) {
    console.error('[WalletManager] Failed to initialize wallet:', error);
    throw error;
  }
}

/**
 * Check if wallet is ready to use
 */
export function isWalletInitialized(): boolean {
  return useWalletState.getState().isInitialized;
}

/**
 * Get current wallet address
 */
export function getWalletAddress(): string | null {
  return useWalletState.getState().address;
}

/**
 * Get current balance
 */
export function getWalletBalance(): bigint {
  return useWalletState.getState().balance;
}

/**
 * Sync wallet with blockchain
 */
export async function syncWalletData(): Promise<void> {
  const state = useWalletState.getState();

  if (!state.isInitialized) {
    throw new Error('Wallet not initialized');
  }

  try {
    state.setSyncing(true);

    // TODO: Implement real sync with WebZjs
    console.log('[WalletManager] Sync not yet implemented');

    state.setLastSyncTime(Date.now());
    state.setSyncProgress(100);

  } catch (error) {
    console.error('[WalletManager] Sync failed:', error);
    throw error;
  } finally {
    state.setSyncing(false);
  }
}

/**
 * Lock wallet (clear session)
 */
export function lockWallet(): void {
  const state = useWalletState.getState();
  state.reset();
  console.log('[WalletManager] Wallet locked');
}

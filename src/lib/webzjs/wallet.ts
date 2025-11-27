/**
 * WebZjs Wallet Wrapper
 *
 * This module provides a clean interface to WebZjs wallet functionality.
 * It handles initialization, wallet creation, and all blockchain operations.
 */

import initWasm, { initThreadPool, WebWallet } from '@chainsafe/webzjs-wallet';

// Constants
const LIGHTWALLETD_URL = 'https://zcash-testnet.chainsafe.dev';
const NETWORK = 'test';

// Singleton wallet instance
let walletInstance: WebWallet | null = null;
let isInitialized = false;

/**
 * Initialize WebZjs WASM and thread pool
 * MUST be called once before any wallet operations
 */
export async function initWebZjs(): Promise<void> {
  if (isInitialized) {
    console.log('[WebZjs] Already initialized');
    return;
  }

  try {
    console.log('[WebZjs] Initializing WASM...');

    await initWasm();
    const threadCount = navigator.hardwareConcurrency || 4;
    await initThreadPool(threadCount);

    isInitialized = true;
    console.log('[WebZjs] Initialization complete');
  } catch (error) {
    console.error('[WebZjs] Initialization failed:', error);
    throw new Error('Failed to initialize WebZjs');
  }
}

/**
 * Create a new wallet from seed phrase
 */
export async function createWallet(
  accountName: string,
  seedPhrase: string,
  accountHdIndex: number = 0,
  birthdayHeight?: number
): Promise<number> {
  if (!isInitialized) {
    throw new Error('WebZjs not initialized. Call initWebZjs() first.');
  }

  try {
    console.log('[WebZjs] Creating wallet...');

    walletInstance = new WebWallet(NETWORK, LIGHTWALLETD_URL, 10); // 10 confirmations
    const accountId = await walletInstance.create_account(
      accountName,
      seedPhrase,
      accountHdIndex,
      birthdayHeight || null
    );

    console.log('[WebZjs] Wallet created successfully, account ID:', accountId);
    return accountId;
  } catch (error) {
    console.error('[WebZjs] Failed to create wallet:', error);
    throw error;
  }
}

/**
 * Get the current wallet instance
 */
export function getWallet(): WebWallet {
  if (!walletInstance) {
    throw new Error('Wallet not initialized');
  }
  return walletInstance;
}

/**
 * Check if wallet is initialized
 */
export function isWalletReady(): boolean {
  return isInitialized && walletInstance !== null;
}

/**
 * Get wallet summary including balance
 */
export async function getWalletSummary() {
  const wallet = getWallet();

  try {
    const summary = await wallet.get_wallet_summary();
    return summary;
  } catch (error) {
    console.error('[WebZjs] Failed to get wallet summary:', error);
    throw error;
  }
}

/**
 * Get wallet balance (simplified helper)
 */
export async function getBalance(_accountId: number = 0): Promise<bigint> {
  const summary = await getWalletSummary();
  if (!summary) {
    return BigInt(0);
  }

  // Extract balance from summary
  // Note: The exact structure depends on WalletSummary type
  return BigInt(0); // TODO: Extract from summary once we understand the structure
}

/**
 * Sync wallet with blockchain
 */
export async function syncWallet(): Promise<void> {
  const wallet = getWallet();

  try {
    console.log('[WebZjs] Starting sync...');
    await wallet.sync();
    console.log('[WebZjs] Sync complete');
  } catch (error) {
    console.error('[WebZjs] Sync failed:', error);
    throw error;
  }
}

/**
 * Get current unified address for an account
 */
export async function getCurrentAddress(accountId: number = 0): Promise<string> {
  const wallet = getWallet();

  try {
    const address = await wallet.get_current_address(accountId);
    return address;
  } catch (error) {
    console.error('[WebZjs] Failed to get address:', error);
    throw error;
  }
}

/**
 * Send transaction (full workflow: propose -> create -> send)
 */
export async function sendTransaction(
  accountId: number,
  toAddress: string,
  amount: bigint,
  seedPhrase: string,
  accountHdIndex: number = 0
): Promise<Uint8Array> {
  const wallet = getWallet();

  try {
    console.log('[WebZjs] Creating transaction proposal...');

    // Step 1: Create proposal
    const proposal = await wallet.propose_transfer(accountId, toAddress, amount);

    console.log('[WebZjs] Generating proofs and signing...');

    // Step 2: Create (prove and authorize) transactions
    const txids = await wallet.create_proposed_transactions(
      proposal,
      seedPhrase,
      accountHdIndex
    );

    console.log('[WebZjs] Sending transaction to network...');

    // Step 3: Broadcast to network
    await wallet.send_authorized_transactions(txids);

    console.log('[WebZjs] Transaction sent successfully');
    return txids;
  } catch (error) {
    console.error('[WebZjs] Failed to send transaction:', error);
    throw error;
  }
}

/**
 * Format zatoshis to ZEC
 */
export function formatZec(zatoshis: bigint): string {
  const zec = Number(zatoshis) / 100_000_000;
  return zec.toFixed(8).replace(/\.?0+$/, '') || '0';
}

/**
 * Parse ZEC to zatoshis
 */
export function parseZec(zec: string): bigint {
  const amount = parseFloat(zec);
  return BigInt(Math.floor(amount * 100_000_000));
}

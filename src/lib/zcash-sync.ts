/**
 * Zcash Sync Module
 *
 * Handles blockchain sync WITHOUT eval() using our custom WASM
 * Compatible with Chrome MV3 Content Security Policy
 *
 * Features:
 * - Incremental sync (only new blocks)
 * - Checkpoint system (saves progress)
 * - Birthday height support (skip old blocks)
 */

// Use CipherScan's REAL WASM (already working!)
import initKeysWasm, { UnifiedSpendingKey } from '@chainsafe/webzjs-keys';
import { mnemonicToSeedSync } from 'bip39';
import { loadWasm, filterCompactOutputsBatch, decryptMemo } from './wasm-loader';

let wasmInitialized = false;

const STORAGE_KEY_SYNC_STATE = 'ziphers_sync_state';

/**
 * Initialize WASM modules (CipherScan WASM + webzjs-keys)
 */
export async function initZcashWasm(): Promise<void> {
  if (wasmInitialized) return;

  console.log('[ZcashSync] Initializing WASM modules...');

  // Initialize CipherScan's WASM (decrypt_memo, batch_filter)
  const wasm = await loadWasm();

  // Initialize webzjs-keys WASM (for viewing key generation)
  await initKeysWasm();

  // Test WASM
  const testResult = wasm.test_wasm();
  console.log('[ZcashSync] WASM test:', testResult);

  wasmInitialized = true;
  console.log('[ZcashSync] ✅ Both WASM modules initialized!');
}

/**
 * Transaction from CipherScan API
 */
interface CipherScanTx {
  txid: string;
  height: number;
  hex: string;
}

/**
 * Decrypted transaction output
 */
export interface DecryptedOutput {
  memo: string;
  amount: number;
  is_spent: boolean;
  nullifier: string;
}

/**
 * Decrypted transaction
 */
export interface DecryptedTransaction {
  txid: string;
  height: number;
  received: number;
  spent: number;
  outputs: DecryptedOutput[];
}

/**
 * Wallet balance with full history
 */
export interface WalletBalance {
  balance: number;
  total_received: number;
  total_spent: number;
  transactions: DecryptedTransaction[];
}

/**
 * Sync state checkpoint (saved in chrome.storage)
 */
interface SyncState {
  last_scanned_height: number;
  balance: number;
  total_received: number;
  total_spent: number;
  transactions: DecryptedTransaction[];
  last_sync_time: number;
}

/**
 * Fetch current block height from CipherScan API
 */
export async function fetchCurrentBlockHeight(): Promise<number> {
  const API_URL = 'https://api.testnet.cipherscan.app/api/info';

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`CipherScan API error: ${response.status}`);
    }

    const data = await response.json();
    const height = parseInt(data.blocks || data.height || 0);

    if (!height) {
      throw new Error('No height in response');
    }

    console.log('[ZcashSync] ✅ Current block height:', height);
    return height;
  } catch (error) {
    console.error('[ZcashSync] Failed to fetch current height:', error);

    // Fallback: use a high number so sync doesn't skip
    const fallbackHeight = 9999999; // Very high so we don't accidentally skip
    console.warn('[ZcashSync] ⚠️ Using fallback height:', fallbackHeight);
    return fallbackHeight;
  }
}

/**
 * Estimate birthday height from wallet creation timestamp
 *
 * For wallets created before birthday height feature was added
 */
export function estimateBirthdayFromTimestamp(createdAt: number): number {
  // Zcash testnet reference point (known block + timestamp)
  const REFERENCE_TIMESTAMP = 1700000000000; // Nov 14, 2023
  const REFERENCE_HEIGHT = 2600000;

  // Average block time: 75 seconds (1.25 minutes)
  const AVG_BLOCK_TIME_MS = 75 * 1000;

  // Calculate blocks since reference
  const timeDiff = createdAt - REFERENCE_TIMESTAMP;
  const blocksSinceRef = Math.floor(timeDiff / AVG_BLOCK_TIME_MS);

  const estimatedHeight = REFERENCE_HEIGHT + blocksSinceRef;

  // Go back 1000 blocks for safety margin (~21 hours)
  const safeHeight = Math.max(0, estimatedHeight - 1000);

  console.log('[ZcashSync] 📅 Estimated birthday from timestamp:', safeHeight);
  console.log('[ZcashSync]    Created:', new Date(createdAt).toISOString());

  return safeHeight;
}

/**
 * Fetch compact blocks from Lightwalletd (via CipherScan proxy)
 */
export async function fetchCompactBlocks(startHeight: number, endHeight: number): Promise<any[]> {
  const API_URL = 'https://api.testnet.cipherscan.app/api/lightwalletd/scan';

  console.log(`[ZcashSync] Fetching compact blocks ${startHeight} to ${endHeight}...`);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startHeight, endHeight }),
    });

    if (!response.ok) {
      throw new Error(`CipherScan API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[ZcashSync] ✅ Received ${data.blocks?.length || 0} compact blocks`);
    return data.blocks || [];
  } catch (error) {
    console.error('[ZcashSync] Failed to fetch compact blocks:', error);
    throw error;
  }
}

/**
 * Reverse TXID byte order (little-endian → big-endian)
 * Compact blocks return TXIDs in reversed order
 */
function reverseTxid(txid: string): string {
  // Split into byte pairs and reverse
  const bytes = txid.match(/.{2}/g) || [];
  return bytes.reverse().join('');
}

/**
 * Fetch raw transaction hex from CipherScan
 */
export async function fetchRawTx(txid: string): Promise<string> {
  // Reverse TXID (compact blocks use little-endian, API expects big-endian)
  const displayTxid = reverseTxid(txid);
  const API_URL = `https://api.testnet.cipherscan.app/api/tx/${displayTxid}/raw`;

  console.log(`[ZcashSync] Fetching TX: ${txid} → ${displayTxid}`);

  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch TX: ${response.status}`);
    }

    const data = await response.json();
    return data.hex || data.rawHex;
  } catch (error) {
    console.error(`[ZcashSync] Failed to fetch TX ${displayTxid}:`, error);
    throw error;
  }
}

/**
 * Load sync state from storage
 */
async function loadSyncState(address: string): Promise<SyncState | null> {
  const result = await chrome.storage.local.get(`${STORAGE_KEY_SYNC_STATE}_${address}`);
  return result[`${STORAGE_KEY_SYNC_STATE}_${address}`] || null;
}

/**
 * Save sync state to storage
 */
async function saveSyncState(address: string, state: SyncState): Promise<void> {
  await chrome.storage.local.set({
    [`${STORAGE_KEY_SYNC_STATE}_${address}`]: state,
  });
}

/**
 * Generate viewing key from seed phrase
 *
 * Uses webzjs-keys (same as MetaMask Snap)
 */
export function getViewingKeyFromSeed(seedPhrase: string, network: 'main' | 'test' = 'test', accountIndex: number = 0): string {
  // Convert mnemonic to BIP39 seed (64 bytes)
  const bip39Seed = mnemonicToSeedSync(seedPhrase);

  // Convert Buffer to Uint8Array if needed
  const seedBytes = bip39Seed instanceof Uint8Array
    ? bip39Seed
    : new Uint8Array(bip39Seed);

  // Generate UnifiedSpendingKey
  const spendingKey = new UnifiedSpendingKey(network, seedBytes, accountIndex);

  // Get Unified Full Viewing Key
  const viewingKey = spendingKey.to_unified_full_viewing_key().encode(network);

  return viewingKey;
}

/**
 * Sync wallet and calculate balance
 *
 * This is our CUSTOM sync that replaces wallet.sync() from WebZjs
 * NO eval(), NO workers, 100% Chrome MV3 compatible!
 *
 * Features:
 * - Incremental sync (only new transactions since last scan)
 * - Checkpoint system (caches progress)
 * - Birthday height support
 */
export async function syncWallet(
  address: string,
  seedPhrase: string,
  birthdayHeight?: number,
  createdAt?: number
): Promise<WalletBalance> {
  console.log('[ZcashSync] 🔄 Starting sync for:', address.substring(0, 20) + '...');

  // 1. Initialize WASM if needed
  await initZcashWasm();

  // 2. Load previous sync state (for incremental sync)
  const prevState = await loadSyncState(address);

  // 3. Determine start height (NEVER scan from 0!)
  let startHeight: number;
  if (prevState?.last_scanned_height) {
    // Continue from where we left off (incremental sync)
    startHeight = prevState.last_scanned_height;
    console.log('[ZcashSync] 📍 Resuming from cached height:', startHeight);
  } else if (birthdayHeight) {
    // First sync: start from wallet creation/birthday
    startHeight = birthdayHeight;
    console.log('[ZcashSync] 🎂 First sync from birthday height:', startHeight);
  } else if (createdAt) {
    // OLD WALLET MIGRATION: Estimate birthday from creation timestamp
    startHeight = estimateBirthdayFromTimestamp(createdAt);
    console.warn('[ZcashSync] 🔄 Old wallet detected! Estimated birthday:', startHeight);
  } else {
    // Last resort fallback: current - 1000 blocks
    console.warn('[ZcashSync] ⚠️ No birthday or creation time! Using current height...');
    const currentHeight = await fetchCurrentBlockHeight();
    startHeight = Math.max(0, currentHeight - 1000); // Go back 1000 blocks (~21 hours)
    console.warn('[ZcashSync] Starting from:', startHeight, '(current -1000 blocks)');
  }


  // 3. Generate viewing key from seed
  const viewingKey = getViewingKeyFromSeed(seedPhrase);

  // 4. Get current block height
  const currentHeight = await fetchCurrentBlockHeight();

  if (startHeight >= currentHeight) {
    console.log('[ZcashSync] ✅ Already synced to latest block');
    return {
      balance: prevState?.balance || 0,
      total_received: prevState?.total_received || 0,
      total_spent: prevState?.total_spent || 0,
      transactions: prevState?.transactions || [],
    };
  }

  // 5. Fetch compact blocks from Lightwalletd
  console.log(`[ZcashSync] Fetching blocks ${startHeight} to ${currentHeight}...`);
  const compactBlocks = await fetchCompactBlocks(startHeight, currentHeight);

  if (compactBlocks.length === 0) {
    console.log('[ZcashSync] No blocks received');
    return {
      balance: prevState?.balance || 0,
      total_received: prevState?.total_received || 0,
      total_spent: prevState?.total_spent || 0,
      transactions: prevState?.transactions || [],
    };
  }

  // 6. Filter compact blocks with WASM (FAST batch processing!)
  console.log(`[ZcashSync] Filtering ${compactBlocks.length} compact blocks...`);
  const matches = await filterCompactOutputsBatch(
    compactBlocks,
    viewingKey,
    (processed, total, found) => {
      console.log(`[ZcashSync] Progress: ${processed}/${total} blocks, ${found} matches`);
    }
  );

  console.log(`[ZcashSync] ✅ Found ${matches.length} matching TXs`);

  // 7. Decrypt full memos for each match
  const decryptedTxs: DecryptedTransaction[] = [];
  let totalReceived = 0;

  for (const match of matches) {
    try {
      // Fetch raw TX hex (fetchRawTx handles byte order reversal)
      const rawHex = await fetchRawTx(match.txid);

      // Decrypt memo + amount
      const decrypted = await decryptMemo(rawHex, viewingKey);

      // Store with DISPLAY format TXID (reversed)
      const displayTxid = reverseTxid(match.txid);

      decryptedTxs.push({
        txid: displayTxid, // Use display format for UI
        height: match.height,
        received: decrypted.amount,
        spent: 0, // TODO: Track spent outputs via nullifiers
        outputs: [{
          memo: decrypted.memo,
          amount: decrypted.amount,
          is_spent: false,
          nullifier: '',
        }],
      });

      totalReceived += decrypted.amount;
    } catch (error) {
      console.error(`[ZcashSync] Failed to decrypt ${reverseTxid(match.txid)}:`, error);
    }
  }

  // 8. Merge with previous transactions
  const allTxs = [...(prevState?.transactions || []), ...decryptedTxs];
  const finalTotalReceived = (prevState?.total_received || 0) + totalReceived;
  const finalBalance = finalTotalReceived; // TODO: subtract spent

  // 9. Save checkpoint
  await saveSyncState(address, {
    last_scanned_height: currentHeight,
    balance: finalBalance,
    total_received: finalTotalReceived,
    total_spent: 0,
    transactions: allTxs,
    last_sync_time: Date.now(),
  });

  console.log('[ZcashSync] ✅ Sync complete');
  console.log('[ZcashSync] 💾 Checkpoint saved at height', currentHeight);

  return {
    balance: finalBalance,
    total_received: finalTotalReceived,
    total_spent: 0,
    transactions: allTxs,
  };
}

/**
 * Decrypt a single transaction memo
 */
export async function decryptTransactionMemo(
  txHex: string,
  viewingKey: string
): Promise<{ memo: string; amount: number }> {
  const result = await decryptMemo(txHex, viewingKey);
  return {
    memo: result.memo,
    amount: result.amount
  };
}

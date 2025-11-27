/**
 * Service Worker for Ziphers Extension
 *
 * Responsibilities:
 * - WebZjs wallet initialization and management
 * - Blockchain sync operations
 * - Message handling from popup
 * - Background tasks (periodic sync)
 *
 * Why Service Worker?
 * - WebZjs uses Web Workers for WASM multi-threading
 * - Service workers can load WebZjs without Vite build issues
 * - Follows Chrome Extension best practices (background logic separate from UI)
 * - Same pattern as MetaMask, Phantom, etc.
 */

import type { MessageRequest, MessageResponse, InitWalletResponse, GetAddressResponse, WalletStatusResponse } from '../types/messages';

console.log('[ServiceWorker] Ziphers service worker initialized');

// WebZjs wallet instance (in service worker scope)
let walletInstance: any = null;
let isWebZjsInitialized = false;
let currentAddress: string | null = null;

/**
 * Initialize WebZjs (WASM + Thread Pool)
 * This ONLY runs in service worker, avoiding Vite build issues
 */
async function initializeWebZjs(): Promise<void> {
  if (isWebZjsInitialized) {
    console.log('[ServiceWorker] WebZjs already initialized');
    return;
  }

  try {
    console.log('[ServiceWorker] Loading WebZjs...');

    // Static import works because service worker is bundled by Vite
    // The circular deps issue is resolved by proper Vite config
    const { default: initWasm, initThreadPool } = await import('@chainsafe/webzjs-wallet');

    console.log('[ServiceWorker] Initializing WASM...');
    await initWasm();

    console.log('[ServiceWorker] Initializing thread pool...');
    const threadCount = 4;
    await initThreadPool(threadCount);

    isWebZjsInitialized = true;
    console.log('[ServiceWorker] ✅ WebZjs initialized successfully!');

  } catch (error) {
    console.error('[ServiceWorker] Failed to initialize WebZjs:', error);
    throw new Error(`WebZjs initialization failed: ${error}`);
  }
}

/**
 * Create WebZjs wallet from seed
 */
async function createWalletFromSeed(
  accountName: string,
  seedPhrase: string,
  accountHdIndex: number,
  birthdayHeight?: number
): Promise<{ accountId: number; address: string }> {
  console.log('[ServiceWorker] Creating wallet from seed...');

  // Ensure WebZjs is initialized
  await initializeWebZjs();

  try {
    const { WebWallet } = await import('@chainsafe/webzjs-wallet');

    const LIGHTWALLETD_URL = 'https://zcash-testnet.chainsafe.dev';
    const NETWORK = 'test';
    const MIN_CONFIRMATIONS = 10;

    console.log('[ServiceWorker] Creating WebWallet instance...');
    walletInstance = new WebWallet(NETWORK, LIGHTWALLETD_URL, MIN_CONFIRMATIONS);

    console.log('[ServiceWorker] Creating account...');
    const accountId = await walletInstance.create_account(
      accountName,
      seedPhrase,
      accountHdIndex,
      birthdayHeight || null
    );

    console.log('[ServiceWorker] Account created, ID:', accountId);

    console.log('[ServiceWorker] Getting address...');
    const address = await walletInstance.get_current_address(accountId);

    console.log('[ServiceWorker] ✅ Address generated:', address);

    // Cache for quick access
    currentAddress = address;

    return { accountId, address };

  } catch (error) {
    console.error('[ServiceWorker] Failed to create wallet:', error);
    throw error;
  }
}

/**
 * Handle messages from popup
 */
chrome.runtime.onMessage.addListener((
  message: MessageRequest,
  _sender,
  sendResponse: (response: MessageResponse) => void
) => {
  console.log('[ServiceWorker] Message received:', message.type);

  // Handle async operations
  (async () => {
    try {
      switch (message.type) {
        case 'INIT_WALLET': {
          const { accountName, seedPhrase, accountHdIndex, birthdayHeight } = message.data;
          const result = await createWalletFromSeed(
            accountName,
            seedPhrase,
            accountHdIndex,
            birthdayHeight
          );

          const response: MessageResponse<InitWalletResponse> = {
            success: true,
            requestId: message.requestId,
            data: result,
          };
          sendResponse(response);
          break;
        }

        case 'GET_ADDRESS': {
          if (!currentAddress) {
            throw new Error('Wallet not initialized');
          }

          const response: MessageResponse<GetAddressResponse> = {
            success: true,
            requestId: message.requestId,
            data: { address: currentAddress },
          };
          sendResponse(response);
          break;
        }

        case 'GET_WALLET_STATUS': {
          const response: MessageResponse<WalletStatusResponse> = {
            success: true,
            requestId: message.requestId,
            data: {
              isInitialized: isWebZjsInitialized,
              hasWallet: walletInstance !== null,
              address: currentAddress,
            },
          };
          sendResponse(response);
          break;
        }

        case 'SYNC_WALLET': {
          // TODO: Implement sync
          console.log('[ServiceWorker] Sync not yet implemented');
          sendResponse({
            success: true,
            requestId: message.requestId,
            data: { message: 'Sync not implemented yet' },
          });
          break;
        }

        default: {
          sendResponse({
            success: false,
            requestId: message.requestId,
            error: 'Unknown message type',
          });
        }
      }
    } catch (error) {
      console.error('[ServiceWorker] Message handler error:', error);
      sendResponse({
        success: false,
        requestId: message.requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  })();

  // Return true to indicate async response
  return true;
});

// Install event
chrome.runtime.onInstalled.addListener((details) => {
  console.log('[ServiceWorker] Extension installed:', details.reason);

  if (details.reason === 'install') {
    chrome.storage.local.set({
      isFirstRun: true,
      network: 'testnet',
      installedAt: Date.now(),
    });
  }
});

// Alarm for periodic sync (every 5 minutes)
chrome.alarms.create('wallet-sync', {
  periodInMinutes: 5,
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'wallet-sync') {
    console.log('[ServiceWorker] Periodic sync triggered');
    // TODO: Trigger sync if wallet is initialized
  }
});

export {};

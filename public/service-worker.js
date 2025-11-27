/**
 * Service Worker (Non-Bundled)
 * 
 * This file is NOT processed by Vite/TypeScript.
 * It loads WebZjs directly using importScripts or dynamic import.
 * 
 * Why not bundled?
 * - Vite cannot handle WebZjs circular worker dependencies
 * - Service workers can load ES modules directly
 * - This is a workaround until Vite/WebZjs compatibility is fixed
 */

console.log('[ServiceWorker] Ziphers service worker starting...');

// WebZjs wallet instance
let walletInstance = null;
let isWebZjsInitialized = false;
let currentAddress = null;

/**
 * Initialize WebZjs
 */
async function initializeWebZjs() {
  if (isWebZjsInitialized) {
    console.log('[ServiceWorker] WebZjs already initialized');
    return;
  }

  try {
    console.log('[ServiceWorker] Loading WebZjs module...');
    
    // Import WebZjs as ES module (works in modern service workers!)
    const webzjsUrl = chrome.runtime.getURL('/lib/webzjs-wallet/webzjs_wallet.js');
    const module = await import(webzjsUrl);
    
    const { default: initWasm, initThreadPool, WebWallet } = module;
    
    console.log('[ServiceWorker] Initializing WASM...');
    await initWasm();
    
    console.log('[ServiceWorker] Initializing thread pool...');
    await initThreadPool(4);
    
    // Store WebWallet class for later use
    self.WebWallet = WebWallet;
    
    isWebZjsInitialized = true;
    console.log('[ServiceWorker] ✅ WebZjs initialized!');
    
  } catch (error) {
    console.error('[ServiceWorker] WebZjs initialization failed:', error);
    throw error;
  }
}

/**
 * Create wallet from seed
 */
async function createWalletFromSeed(accountName, seedPhrase, accountHdIndex, birthdayHeight) {
  console.log('[ServiceWorker] Creating wallet...');
  
  await initializeWebZjs();
  
  const LIGHTWALLETD_URL = 'https://zcash-testnet.chainsafe.dev';
  const NETWORK = 'test';
  const MIN_CONFIRMATIONS = 10;
  
  walletInstance = new self.WebWallet(NETWORK, LIGHTWALLETD_URL, MIN_CONFIRMATIONS);
  
  const accountId = await walletInstance.create_account(
    accountName,
    seedPhrase,
    accountHdIndex,
    birthdayHeight || null
  );
  
  const address = await walletInstance.get_current_address(accountId);
  
  currentAddress = address;
  
  console.log('[ServiceWorker] ✅ Wallet created!');
  console.log('[ServiceWorker] ✅ Address:', address);
  
  return { accountId, address };
}

/**
 * Message handler
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[ServiceWorker] Message received:', message.type);

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
          sendResponse({
            success: true,
            requestId: message.requestId,
            data: result,
          });
          break;
        }

        case 'GET_ADDRESS': {
          if (!currentAddress) {
            throw new Error('Wallet not initialized');
          }
          sendResponse({
            success: true,
            requestId: message.requestId,
            data: { address: currentAddress },
          });
          break;
        }

        case 'GET_WALLET_STATUS': {
          sendResponse({
            success: true,
            requestId: message.requestId,
            data: {
              isInitialized: isWebZjsInitialized,
              hasWallet: walletInstance !== null,
              address: currentAddress,
            },
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
      console.error('[ServiceWorker] Error:', error);
      sendResponse({
        success: false,
        requestId: message.requestId,
        error: error.message || 'Unknown error',
      });
    }
  })();

  return true; // Keep channel open for async response
});

// Extension installed
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

console.log('[ServiceWorker] Ready!');


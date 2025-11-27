/**
 * Offscreen Document Manager
 * 
 * Manages communication with the offscreen document for WebZjs operations.
 * Uses chrome.runtime.sendMessage to communicate with offscreen via service worker relay.
 */

const OFFSCREEN_DOCUMENT_PATH = 'offscreen/offscreen.html';

let creating: Promise<void> | null = null;

/**
 * Send message to offscreen document (via service worker relay)
 */
async function sendToOffscreen(message: any): Promise<any> {
  console.log('[OffscreenManager] Sending to offscreen via service worker:', message.type);
  
  // Send message - service worker will relay to offscreen
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        console.error('[OffscreenManager] Error:', chrome.runtime.lastError);
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      
      console.log('[OffscreenManager] Response:', response);
      resolve(response);
    });
  });
}

/**
 * Ensure offscreen document exists
 */
async function ensureOffscreenDocument(): Promise<void> {
  // Check if already exists
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT' as chrome.runtime.ContextType],
  });

  if (existingContexts.length > 0) {
    console.log('[OffscreenManager] Offscreen document already exists');
    return;
  }

  // Avoid race condition
  if (creating) {
    await creating;
  } else {
    creating = chrome.offscreen.createDocument({
      url: OFFSCREEN_DOCUMENT_PATH,
      reasons: [chrome.offscreen.Reason.WORKERS],
      justification: 'WebZjs requires Web Workers and eval() for transaction signing and SNARK proof generation',
    });
    await creating;
    creating = null;

    // Wait for offscreen to be ready
    console.log('[OffscreenManager] Waiting for offscreen to be ready...');
    let ready = false;
    let attempts = 0;
    while (!ready && attempts < 20) {
      await new Promise(resolve => setTimeout(resolve, 500));
      try {
        const response: any = await sendToOffscreen({ type: 'PING_OFFSCREEN' });
        if (response?.pong) {
          ready = true;
          console.log('[OffscreenManager] ✅ Offscreen ready!');
        }
      } catch (e) {
        attempts++;
      }
    }

    if (!ready) {
      throw new Error('Offscreen document did not respond after 10 seconds');
    }
  }
}

/**
 * Initialize WebZjs wallet in offscreen document
 */
export async function initOffscreenWallet(
  seedPhrase: string,
  accountName: string,
  accountHdIndex: number,
  birthdayHeight?: number | null
): Promise<void> {
  await ensureOffscreenDocument();

  console.log('[OffscreenManager] Initializing WebZjs wallet in offscreen...');

  const response: any = await sendToOffscreen({
    type: 'INIT_WEBZJS',
    data: { seedPhrase, accountName, accountHdIndex, birthdayHeight },
  });

  if (!response.success) {
    throw new Error(response.error || 'Failed to initialize wallet');
  }

  console.log('[OffscreenManager] ✅ Wallet initialized and synced!');
}

/**
 * Send transaction via offscreen document
 */
export async function sendTransactionOffscreen(
  toAddress: string,
  amount: number,
  seedPhrase: string,
  memo?: string
): Promise<string> {
  await ensureOffscreenDocument();

  console.log('[OffscreenManager] Sending transaction via offscreen...');

  const response: any = await sendToOffscreen({
    type: 'SEND_TRANSACTION',
    data: { toAddress, amount, seedPhrase, memo },
  });

  if (!response.success) {
    throw new Error(response.error || 'Failed to send transaction');
  }

  console.log('[OffscreenManager] ✅ Transaction sent! TXID:', response.txid);
  return response.txid;
}

/**
 * Close offscreen document (cleanup)
 */
export async function closeOffscreen(): Promise<void> {
  try {
    await chrome.offscreen.closeDocument();
    console.log('[OffscreenManager] Offscreen document closed');
  } catch (error) {
    // Might already be closed
    console.log('[OffscreenManager] Could not close offscreen (might not exist)');
  }
}

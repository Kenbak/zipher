/**
 * Offscreen Document for WebZjs Testing
 *
 * This runs in an offscreen document which has more relaxed CSP.
 * We test if WebZjs's eval() and Web Workers work here.
 */

import initWebzJSWallet, { initThreadPool, WebWallet } from '@chainsafe/webzjs-wallet';

console.log('[Offscreen] Starting WebZjs test...');

// Message handler from service worker
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Offscreen] Received message:', message);

  if (message.type === 'TEST_WEBZJS') {
    testWebZjs().then(result => {
      sendResponse({ success: true, result });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true; // Async response
  }

  if (message.type === 'INIT_WEBZJS') {
    initWebZjsOffscreen().then(() => {
      sendResponse({ success: true });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true;
  }

  if (message.type === 'SEND_TRANSACTION') {
    sendTransaction(message.data).then(txid => {
      sendResponse({ success: true, txid });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true;
  }
});

async function testWebZjs() {
  console.log('[Offscreen] Testing WebZjs initialization...');

  try {
    // Step 1: Init WASM
    console.log('[Offscreen] Step 1: Init WASM...');
    await initWebzJSWallet();
    console.log('[Offscreen] ✅ WASM initialized!');

    // Step 2: Try thread pool (this uses eval!)
    console.log('[Offscreen] Step 2: Init thread pool (uses eval)...');
    try {
      await initThreadPool(4);
      console.log('[Offscreen] ✅ Thread pool initialized! eval() WORKS in offscreen!');
      return { evalWorks: true, wasmWorks: true };
    } catch (error) {
      console.warn('[Offscreen] ⚠️ Thread pool failed (eval blocked?):', error);
      return { evalWorks: false, wasmWorks: true };
    }
  } catch (error) {
    console.error('[Offscreen] ❌ WebZjs initialization failed:', error);
    return { evalWorks: false, wasmWorks: false, error: String(error) };
  }
}

let webWallet: WebWallet | null = null;

async function initWebZjsOffscreen() {
  console.log('[Offscreen] Initializing WebZjs wallet...');

  await initWebzJSWallet();

  try {
    await initThreadPool(navigator.hardwareConcurrency || 4);
    console.log('[Offscreen] ✅ Multi-threaded mode enabled!');
  } catch (error) {
    console.warn('[Offscreen] ⚠️ Multi-threaded mode failed, using single-threaded');
  }

  webWallet = new WebWallet(
    'test',
    'https://zcash-testnet.chainsafe.dev',
    10
  );

  console.log('[Offscreen] ✅ WebZjs wallet created!');
}

async function sendTransaction(data: {
  accountId: number;
  toAddress: string;
  amount: number;
  seedPhrase: string;
}) {
  if (!webWallet) {
    throw new Error('WebZjs not initialized');
  }

  console.log('[Offscreen] Sending transaction...');

  const { accountId, toAddress, amount, seedPhrase } = data;
  const zatoshis = BigInt(Math.floor(amount * 100_000_000));

  // Step 1: Propose
  console.log('[Offscreen] Step 1/3: Proposing...');
  const proposal = await webWallet.propose_transfer(accountId, toAddress, zatoshis);

  // Step 2: Authorize (proves + signs) - This is the heavy part!
  console.log('[Offscreen] Step 2/3: Authorizing (this may take a while)...');
  const txids = await webWallet.create_proposed_transactions(proposal, seedPhrase, 0);

  // Step 3: Broadcast
  console.log('[Offscreen] Step 3/3: Broadcasting...');
  await webWallet.send_authorized_transactions(txids);

  // Extract TXID
  const txidBytes = txids.slice(0, 32);
  const txid = Array.from(txidBytes)
    .reverse()
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  console.log('[Offscreen] ✅ Transaction sent! TXID:', txid);
  return txid;
}

console.log('[Offscreen] Offscreen document ready!');

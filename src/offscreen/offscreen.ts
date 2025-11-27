/**
 * Offscreen Document for WebZjs Testing
 *
 * This runs in an offscreen document which has more relaxed CSP.
 * We test if WebZjs's eval() and Web Workers work here.
 */

import initWebzJSWallet, { initThreadPool, WebWallet } from '@chainsafe/webzjs-wallet';

console.log('[Offscreen] 🚀 Offscreen document loaded!');
console.log('[Offscreen] Starting WebZjs test...');

// Register message handler IMMEDIATELY
console.log('[Offscreen] Registering message listener...');
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log('[Offscreen] Received message:', message);

  if (message.type === 'PING_OFFSCREEN') {
    console.log('[Offscreen] Responding to ping');
    sendResponse({ pong: true });
    return true;
  }

  if (message.type === 'TEST_WEBZJS') {
    testWebZjs().then(result => {
      sendResponse({ success: true, result });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true; // Async response
  }

  if (message.type === 'INIT_WEBZJS') {
    initWebZjsOffscreen(message.data).then(() => {
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
let accountId: number | null = null;

async function initWebZjsOffscreen(data: {
  seedPhrase: string;
  accountName: string;
  accountHdIndex: number;
  birthdayHeight?: number | null;
}) {
  console.log('[Offscreen] Initializing WebZjs wallet...');

  // Init WASM
  await initWebzJSWallet();

  // Init thread pool (will work in offscreen!)
  try {
    await initThreadPool(navigator.hardwareConcurrency || 4);
    console.log('[Offscreen] ✅ Multi-threaded mode enabled!');
  } catch (error) {
    console.warn('[Offscreen] ⚠️ Multi-threaded mode failed, using single-threaded');
  }

  // Create wallet
  webWallet = new WebWallet(
    'test',
    'https://zcash-testnet.chainsafe.dev',
    10
  );

  console.log('[Offscreen] ✅ WebWallet created!');

  // Create account from seed
  console.log('[Offscreen] Creating account from seed...');
  accountId = await webWallet.create_account(
    data.accountName,
    data.seedPhrase,
    data.accountHdIndex,
    data.birthdayHeight
  );

  console.log('[Offscreen] ✅ Account created! ID:', accountId);

  // Sync wallet
  console.log('[Offscreen] Starting sync (this may take a while)...');
  await webWallet.sync();

  console.log('[Offscreen] ✅ WebZjs wallet fully synced and ready!');
}

async function sendTransaction(data: {
  toAddress: string;
  amount: number;
  memo?: string;
  seedPhrase: string; // Passed each time for security (not stored)
}) {
  if (!webWallet || accountId === null) {
    throw new Error('WebZjs not initialized. Please wait for wallet to sync.');
  }

  console.log('[Offscreen] Sending transaction...');
  console.log('[Offscreen] To:', data.toAddress);
  console.log('[Offscreen] Amount:', data.amount, 'ZEC');
  console.log('[Offscreen] Memo:', data.memo || '(none)');

  const { toAddress, amount, seedPhrase } = data;
  const zatoshis = BigInt(Math.floor(amount * 100_000_000));

  // Step 1: Propose transfer
  console.log('[Offscreen] Step 1/3: Creating proposal...');
  const proposal = await webWallet.propose_transfer(accountId, toAddress, zatoshis);
  console.log('[Offscreen] ✅ Proposal created!');

  // Step 2: Authorize (sign + prove) - This takes 10-30 seconds!
  console.log('[Offscreen] Step 2/3: Authorizing (generating SNARK proofs - this may take 10-30s)...');
  const txids = await webWallet.create_proposed_transactions(proposal, seedPhrase, 0);
  console.log('[Offscreen] ✅ Transaction authorized!');

  // Step 3: Broadcast to network
  console.log('[Offscreen] Step 3/3: Broadcasting to Zcash network...');
  await webWallet.send_authorized_transactions(txids);

  // Extract TXID from bytes (reverse byte order for display)
  const txidBytes = txids.slice(0, 32);
  const txid = Array.from(txidBytes)
    .reverse()
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  console.log('[Offscreen] ✅ Transaction broadcast! TXID:', txid);
  return txid;
}

console.log('[Offscreen] ✅ Message listener registered!');
console.log('[Offscreen] Offscreen document ready!');

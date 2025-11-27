// Background Service Worker for Ziphers Extension
// Handles: wallet sync, alarms, message passing

console.log('[Ziphers] Service worker initialized');

// Install event
chrome.runtime.onInstalled.addListener((details) => {
  console.log('[Ziphers] Extension installed:', details.reason);

  if (details.reason === 'install') {
    // First time install
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
    console.log('[Ziphers] Periodic sync triggered');
    // TODO: Implement wallet sync logic with WebZjs
  }
});

// Message handling from popup/content scripts
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log('[Ziphers] Message received:', message);

  switch (message.type) {
    case 'GET_WALLET_STATUS':
      // TODO: Return wallet status
      sendResponse({ status: 'ready' });
      break;

    case 'SYNC_WALLET':
      // TODO: Trigger wallet sync
      sendResponse({ success: true });
      break;

    default:
      sendResponse({ error: 'Unknown message type' });
  }

  return true; // Keep message channel open for async response
});

// Handle extension icon click
chrome.action.onClicked.addListener(() => {
  console.log('[Ziphers] Extension icon clicked');
});

export {};

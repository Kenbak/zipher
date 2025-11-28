/**
 * Service Worker for Zipher Extension
 *
 * Responsibilities:
 * - Handle dApp connection requests
 * - Message handling from popup and content scripts
 * - Background tasks (periodic sync)
 */

import { isSiteConnected, addConnectedSite, removeConnectedSite, updateLastUsed } from '../lib/storage/connected-sites';
import { getVaultData } from '../lib/storage/secure-storage';

console.log('[ServiceWorker] Zipher service worker initialized');

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

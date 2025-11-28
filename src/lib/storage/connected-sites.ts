/**
 * Connected Sites Manager
 *
 * Manages which websites are connected to the wallet
 */

export interface ConnectedSite {
  origin: string;
  hostname: string;
  connectedAt: number;
  lastUsed: number;
}

const STORAGE_KEY = 'zipher_connected_sites';

export async function getConnectedSites(): Promise<ConnectedSite[]> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return result[STORAGE_KEY] || [];
}

export async function isSiteConnected(origin: string): Promise<boolean> {
  const sites = await getConnectedSites();
  return sites.some((site) => site.origin === origin);
}

export async function addConnectedSite(origin: string, hostname: string): Promise<void> {
  const sites = await getConnectedSites();

  // Check if already exists
  const existing = sites.find((site) => site.origin === origin);
  if (existing) {
    // Update last used
    existing.lastUsed = Date.now();
  } else {
    // Add new
    sites.push({
      origin,
      hostname,
      connectedAt: Date.now(),
      lastUsed: Date.now(),
    });
  }

  await chrome.storage.local.set({ [STORAGE_KEY]: sites });
  console.log('[ConnectedSites] Added site:', hostname);
}

export async function removeConnectedSite(origin: string): Promise<void> {
  const sites = await getConnectedSites();
  const filtered = sites.filter((site) => site.origin !== origin);
  await chrome.storage.local.set({ [STORAGE_KEY]: filtered });
  console.log('[ConnectedSites] Removed site:', origin);
}

export async function updateLastUsed(origin: string): Promise<void> {
  const sites = await getConnectedSites();
  const site = sites.find((s) => s.origin === origin);
  if (site) {
    site.lastUsed = Date.now();
    await chrome.storage.local.set({ [STORAGE_KEY]: sites });
  }
}

export async function clearAllConnectedSites(): Promise<void> {
  await chrome.storage.local.remove(STORAGE_KEY);
  console.log('[ConnectedSites] Cleared all connected sites');
}

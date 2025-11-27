/**
 * Secure Storage with AES-256-GCM Encryption
 * 
 * This module handles encryption/decryption of sensitive data (seed phrases)
 * using Web Crypto API. The encryption key is derived from the user's password
 * using PBKDF2.
 * 
 * Security model (same as MetaMask, Phantom, Rabby):
 * 1. Password is NEVER stored
 * 2. Password → PBKDF2 → Encryption Key (in memory only)
 * 3. Encryption Key + Seed → AES-256-GCM → Encrypted Seed
 * 4. Store: encrypted seed + salt + iv (but NOT the password or key)
 * 5. On unlock: password → PBKDF2 → key → decrypt seed
 */

// Constants for PBKDF2
const PBKDF2_ITERATIONS = 600_000; // OWASP recommendation (2023)
const PBKDF2_KEY_LENGTH = 256; // 256 bits for AES-256
const SALT_LENGTH = 32; // 32 bytes salt

// Storage keys
const STORAGE_KEY_VAULT = 'ziphers_vault';

/**
 * Encrypted vault structure stored in chrome.storage.local
 */
export interface EncryptedVault {
  version: number;
  encryptedData: string; // Base64 encoded
  salt: string; // Base64 encoded
  iv: string; // Base64 encoded
  createdAt: number;
}

/**
 * Decrypted vault data (never stored, only in memory)
 */
export interface VaultData {
  seedPhrase: string;
  accountName: string;
  birthdayHeight: number | null;
  createdAt: number;
}

/**
 * Session state (in memory only)
 */
let sessionVault: VaultData | null = null;
let sessionTimeout: NodeJS.Timeout | null = null;

const SESSION_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Generate a random salt
 */
function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
}

/**
 * Derive an encryption key from a password using PBKDF2
 */
async function deriveKey(password: string, salt: ArrayBuffer): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  // Derive AES key using PBKDF2
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: PBKDF2_KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  );

  return key;
}

/**
 * Encrypt data using AES-256-GCM
 */
async function encrypt(
  data: string,
  key: CryptoKey
): Promise<{ encrypted: ArrayBuffer; iv: ArrayBuffer }> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);

  // Generate random IV (Initialization Vector)
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 12 bytes for GCM

  // Encrypt
  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    dataBuffer
  );

  return { encrypted, iv: iv.buffer };
}

/**
 * Decrypt data using AES-256-GCM
 */
async function decrypt(
  encryptedData: ArrayBuffer,
  key: CryptoKey,
  iv: ArrayBuffer
): Promise<string> {
  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    encryptedData
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

/**
 * Helper: ArrayBuffer to Base64
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Helper: Base64 to ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  // Ensure we return ArrayBuffer not ArrayBufferLike
  return bytes.buffer.slice(0);
}

/**
 * Create and encrypt a new vault
 */
export async function createVault(
  password: string,
  vaultData: VaultData
): Promise<void> {
  // Generate salt
  const salt = generateSalt();
  const saltBuffer = new Uint8Array(salt).buffer as ArrayBuffer;

  // Derive key from password
  const key = await deriveKey(password, saltBuffer);

  // Serialize vault data
  const dataJson = JSON.stringify(vaultData);

  // Encrypt
  const { encrypted, iv } = await encrypt(dataJson, key);

  // Create vault structure
  const vault: EncryptedVault = {
    version: 1,
    encryptedData: arrayBufferToBase64(encrypted),
    salt: arrayBufferToBase64(saltBuffer),
    iv: arrayBufferToBase64(iv),
    createdAt: Date.now(),
  };

  // Store in chrome.storage.local
  await chrome.storage.local.set({ [STORAGE_KEY_VAULT]: vault });

  // Start session
  sessionVault = vaultData;
  startSessionTimer();

  console.log('[SecureStorage] Vault created and locked successfully');
}

/**
 * Unlock vault with password
 */
export async function unlockVault(password: string): Promise<VaultData> {
  // Get encrypted vault from storage
  const result = await chrome.storage.local.get(STORAGE_KEY_VAULT);
  const vault: EncryptedVault | undefined = result[STORAGE_KEY_VAULT];

  if (!vault) {
    throw new Error('No vault found. Please create a wallet first.');
  }

  // Convert Base64 back to ArrayBuffer
  const salt = base64ToArrayBuffer(vault.salt);
  const iv = base64ToArrayBuffer(vault.iv);
  const encryptedData = base64ToArrayBuffer(vault.encryptedData);

  // Derive key from password
  const key = await deriveKey(password, salt);

  try {
    // Decrypt
    const decryptedJson = await decrypt(encryptedData, key, iv);
    const vaultData: VaultData = JSON.parse(decryptedJson);

    // Start session
    sessionVault = vaultData;
    startSessionTimer();

    console.log('[SecureStorage] Vault unlocked successfully');
    return vaultData;
  } catch (error) {
    console.error('[SecureStorage] Failed to decrypt vault:', error);
    throw new Error('Incorrect password');
  }
}

/**
 * Lock vault (clear session)
 */
export function lockVault(): void {
  sessionVault = null;
  
  if (sessionTimeout) {
    clearTimeout(sessionTimeout);
    sessionTimeout = null;
  }

  console.log('[SecureStorage] Vault locked');
}

/**
 * Check if vault is unlocked
 */
export function isVaultUnlocked(): boolean {
  return sessionVault !== null;
}

/**
 * Get current vault data (only if unlocked)
 */
export function getVaultData(): VaultData | null {
  return sessionVault;
}

/**
 * Check if a vault exists
 */
export async function vaultExists(): Promise<boolean> {
  const result = await chrome.storage.local.get(STORAGE_KEY_VAULT);
  return !!result[STORAGE_KEY_VAULT];
}

/**
 * Start/restart session timeout
 */
function startSessionTimer(): void {
  if (sessionTimeout) {
    clearTimeout(sessionTimeout);
  }

  sessionTimeout = setTimeout(() => {
    console.log('[SecureStorage] Session timed out');
    lockVault();
  }, SESSION_TIMEOUT_MS);
}

/**
 * Reset session timer (call on user activity)
 */
export function resetSessionTimer(): void {
  if (sessionVault) {
    startSessionTimer();
  }
}

/**
 * Delete vault (DANGEROUS - only for testing or wallet reset)
 */
export async function deleteVault(): Promise<void> {
  await chrome.storage.local.remove(STORAGE_KEY_VAULT);
  lockVault();
  console.log('[SecureStorage] Vault deleted');
}


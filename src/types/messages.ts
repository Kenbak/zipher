/**
 * Message Types for Popup ↔ Service Worker Communication
 * 
 * Following Chrome Extension best practices:
 * - Popup (UI) sends messages to Service Worker
 * - Service Worker handles WebZjs and responds
 * - Type-safe message passing
 */

// Message types
export type MessageType =
  | 'INIT_WALLET'
  | 'GET_ADDRESS'
  | 'GET_BALANCE'
  | 'SYNC_WALLET'
  | 'SEND_TRANSACTION'
  | 'GET_WALLET_STATUS';

// Base message structure
export interface BaseMessage {
  type: MessageType;
  requestId: string;
}

// Request messages (Popup → Service Worker)
export interface InitWalletRequest extends BaseMessage {
  type: 'INIT_WALLET';
  data: {
    accountName: string;
    seedPhrase: string;
    accountHdIndex: number;
    birthdayHeight?: number;
  };
}

export interface GetAddressRequest extends BaseMessage {
  type: 'GET_ADDRESS';
  data: {
    accountId: number;
  };
}

export interface GetBalanceRequest extends BaseMessage {
  type: 'GET_BALANCE';
  data: {
    accountId: number;
  };
}

export interface SyncWalletRequest extends BaseMessage {
  type: 'SYNC_WALLET';
}

export interface SendTransactionRequest extends BaseMessage {
  type: 'SEND_TRANSACTION';
  data: {
    accountId: number;
    toAddress: string;
    amount: string; // bigint as string
    seedPhrase: string;
    accountHdIndex: number;
  };
}

export interface GetWalletStatusRequest extends BaseMessage {
  type: 'GET_WALLET_STATUS';
}

export type MessageRequest =
  | InitWalletRequest
  | GetAddressRequest
  | GetBalanceRequest
  | SyncWalletRequest
  | SendTransactionRequest
  | GetWalletStatusRequest;

// Response messages (Service Worker → Popup)
export interface SuccessResponse<T = any> {
  success: true;
  requestId: string;
  data: T;
}

export interface ErrorResponse {
  success: false;
  requestId: string;
  error: string;
}

export type MessageResponse<T = any> = SuccessResponse<T> | ErrorResponse;

// Specific response types
export interface InitWalletResponse {
  accountId: number;
  address: string;
}

export interface GetAddressResponse {
  address: string;
}

export interface GetBalanceResponse {
  balance: string; // bigint as string
}

export interface WalletStatusResponse {
  isInitialized: boolean;
  hasWallet: boolean;
  address: string | null;
}

// Helper to send messages from popup
export async function sendMessageToServiceWorker<T>(
  message: MessageRequest
): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response: MessageResponse<T>) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      if (response.success) {
        resolve(response.data);
      } else {
        reject(new Error(response.error));
      }
    });
  });
}

// Helper to generate request IDs
export function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}


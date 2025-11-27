/**
 * WebZjs Context
 * 
 * Manages WebZjs wallet instance in the popup (React context with DOM access)
 * Based on official WebZjs demo: packages/web-wallet/src/context/WebzjsContext.tsx
 * 
 * Why in popup and not service worker?
 * - WebZjs needs DOM APIs (document, etc.)
 * - Service workers don't have DOM access
 * - This is the official WebZjs pattern
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';

import initWebzJSWallet, {
  initThreadPool,
  WebWallet,
} from '@chainsafe/webzjs-wallet';

const LIGHTWALLETD_URL = 'https://zcash-testnet.chainsafe.dev';
const NETWORK = 'test';
const MIN_CONFIRMATIONS = 10;

// State
export interface WebZjsState {
  webWallet: WebWallet | null;
  currentAddress: string | null;
  isInitialized: boolean;
  isInitializing: boolean;
  error: Error | null | string;
  balance: bigint;
}

// Actions
type Action =
  | { type: 'set-initializing'; payload: boolean }
  | { type: 'set-initialized'; payload: boolean }
  | { type: 'set-web-wallet'; payload: WebWallet }
  | { type: 'set-address'; payload: string }
  | { type: 'set-balance'; payload: bigint }
  | { type: 'set-error'; payload: Error | null | string }
  | { type: 'reset' };

const initialState: WebZjsState = {
  webWallet: null,
  currentAddress: null,
  isInitialized: false,
  isInitializing: false,
  error: null,
  balance: 0n,
};

function reducer(state: WebZjsState, action: Action): WebZjsState {
  switch (action.type) {
    case 'set-initializing':
      return { ...state, isInitializing: action.payload };
    case 'set-initialized':
      return { ...state, isInitialized: action.payload };
    case 'set-web-wallet':
      return { ...state, webWallet: action.payload };
    case 'set-address':
      return { ...state, currentAddress: action.payload };
    case 'set-balance':
      return { ...state, balance: action.payload };
    case 'set-error':
      return { ...state, error: action.payload };
    case 'reset':
      return initialState;
    default:
      return state;
  }
}

// Context
interface WebZjsContextType {
  state: WebZjsState;
  dispatch: React.Dispatch<Action>;
  initializeWebZjs: () => Promise<void>;
  createWalletFromSeed: (
    accountName: string,
    seedPhrase: string,
    accountHdIndex: number,
    birthdayHeight?: number | null
  ) => Promise<{ accountId: number; address: string }>;
  getAddress: (accountId: number) => Promise<string>;
  getBalance: (accountId: number) => Promise<bigint>;
}

const WebZjsContext = createContext<WebZjsContextType | null>(null);

export function useWebZjs(): WebZjsContextType {
  const context = useContext(WebZjsContext);
  if (!context) {
    throw new Error('useWebZjs must be used within WebZjsProvider');
  }
  return context;
}

// Provider
export const WebZjsProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  /**
   * Initialize WebZjs WASM and thread pool
   * Call once on app startup
   */
  const initializeWebZjs = useCallback(async () => {
    if (state.isInitialized || state.isInitializing) {
      console.log('[WebZjs] Already initialized or initializing');
      return;
    }

    dispatch({ type: 'set-initializing', payload: true });

    try {
      console.log('[WebZjs] Initializing WASM...');
      await initWebzJSWallet();

      console.log('[WebZjs] Initializing thread pool...');
      const concurrency = navigator.hardwareConcurrency || 4;
      await initThreadPool(concurrency);

      dispatch({ type: 'set-initialized', payload: true });
      console.log('[WebZjs] ✅ Initialized successfully!');
    } catch (error) {
      console.error('[WebZjs] Initialization failed:', error);
      dispatch({ type: 'set-error', payload: error as Error });
      throw error;
    } finally {
      dispatch({ type: 'set-initializing', payload: false });
    }
  }, [state.isInitialized, state.isInitializing]);

  /**
   * Create wallet from seed phrase
   */
  const createWalletFromSeed = useCallback(
    async (
      accountName: string,
      seedPhrase: string,
      accountHdIndex: number,
      birthdayHeight?: number | null
    ): Promise<{ accountId: number; address: string }> => {
      if (!state.isInitialized) {
        await initializeWebZjs();
      }

      console.log('[WebZjs] Creating wallet...');

      // Create WebWallet instance
      const wallet = new WebWallet(NETWORK, LIGHTWALLETD_URL, MIN_CONFIRMATIONS);
      dispatch({ type: 'set-web-wallet', payload: wallet });

      // Create account from seed
      const accountId = await wallet.create_account(
        accountName,
        seedPhrase,
        accountHdIndex,
        birthdayHeight || null
      );

      console.log('[WebZjs] Account created, ID:', accountId);

      // Get address
      const address = await wallet.get_current_address(accountId);
      dispatch({ type: 'set-address', payload: address });

      console.log('[WebZjs] ✅ Address:', address);

      // Get initial balance
      try {
        const balance = await wallet.get_balance(accountId);
        dispatch({ type: 'set-balance', payload: balance });
      } catch (err) {
        console.warn('[WebZjs] Could not get balance:', err);
      }

      return { accountId, address };
    },
    [state.isInitialized, initializeWebZjs]
  );

  /**
   * Get current address
   */
  const getAddress = useCallback(
    async (accountId: number): Promise<string> => {
      if (!state.webWallet) {
        throw new Error('Wallet not initialized');
      }
      const address = await state.webWallet.get_current_address(accountId);
      dispatch({ type: 'set-address', payload: address });
      return address;
    },
    [state.webWallet]
  );

  /**
   * Get balance
   */
  const getBalance = useCallback(
    async (accountId: number): Promise<bigint> => {
      if (!state.webWallet) {
        throw new Error('Wallet not initialized');
      }
      const balance = await state.webWallet.get_balance(accountId);
      dispatch({ type: 'set-balance', payload: balance });
      return balance;
    },
    [state.webWallet]
  );

  const value: WebZjsContextType = {
    state,
    dispatch,
    initializeWebZjs,
    createWalletFromSeed,
    getAddress,
    getBalance,
  };

  return (
    <WebZjsContext.Provider value={value}>{children}</WebZjsContext.Provider>
  );
};


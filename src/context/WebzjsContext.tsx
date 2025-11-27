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
  isSyncing: boolean;
  lastSyncTime: number | null;
  error: Error | null | string;
  balance: bigint;
  accountId: number | null;
  syncFailCount: number; // Track consecutive sync failures
}

// Actions
type Action =
  | { type: 'set-initializing'; payload: boolean }
  | { type: 'set-initialized'; payload: boolean }
  | { type: 'set-syncing'; payload: boolean }
  | { type: 'set-last-sync-time'; payload: number }
  | { type: 'set-web-wallet'; payload: WebWallet }
  | { type: 'set-address'; payload: string }
  | { type: 'set-balance'; payload: bigint }
  | { type: 'set-account-id'; payload: number }
  | { type: 'set-error'; payload: Error | null | string }
  | { type: 'increment-sync-fail-count' }
  | { type: 'reset-sync-fail-count' }
  | { type: 'reset' };

const initialState: WebZjsState = {
  webWallet: null,
  currentAddress: null,
  isInitialized: false,
  isInitializing: false,
  isSyncing: false,
  lastSyncTime: null,
  error: null,
  balance: 0n,
  accountId: null,
  syncFailCount: 0,
};

function reducer(state: WebZjsState, action: Action): WebZjsState {
  switch (action.type) {
    case 'set-initializing':
      return { ...state, isInitializing: action.payload };
    case 'set-initialized':
      return { ...state, isInitialized: action.payload };
    case 'set-syncing':
      return { ...state, isSyncing: action.payload };
    case 'set-last-sync-time':
      return { ...state, lastSyncTime: action.payload };
    case 'set-web-wallet':
      return { ...state, webWallet: action.payload };
    case 'set-address':
      return { ...state, currentAddress: action.payload };
    case 'set-balance':
      return { ...state, balance: action.payload };
    case 'set-account-id':
      return { ...state, accountId: action.payload };
    case 'set-error':
      return { ...state, error: action.payload };
    case 'increment-sync-fail-count':
      return { ...state, syncFailCount: state.syncFailCount + 1 };
    case 'reset-sync-fail-count':
      return { ...state, syncFailCount: 0 };
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
  syncWallet: () => Promise<void>;
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

      // Skip thread pool initialization (Chrome MV3 doesn't allow 'unsafe-eval')
      // WebZjs will run in single-threaded mode (slower but works)
      console.log('[WebZjs] ℹ️ Running in single-threaded mode (Chrome MV3 restriction)');

      // Try to init thread pool, but ignore if it fails
      try {
        console.log('[WebZjs] Attempting thread pool initialization...');
        const concurrency = 1; // Use 1 thread to avoid eval()
        await initThreadPool(concurrency);
        console.log('[WebZjs] Thread pool initialized');
      } catch (err) {
        console.warn('[WebZjs] Thread pool failed (expected in MV3), continuing single-threaded:', err);
      }

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
      dispatch({ type: 'set-account-id', payload: accountId });

      console.log('[WebZjs] ✅ Address:', address);
      console.log('[WebZjs] Account ID:', accountId);

      return { accountId, address };
    },
    [state.isInitialized, initializeWebZjs]
  );

  /**
   * Sync wallet with blockchain using our CUSTOM WASM
   * NO eval(), NO workers, 100% Chrome MV3 compatible!
   */
  const syncWallet = useCallback(async () => {
    if (!state.currentAddress || state.accountId === null) {
      console.warn('[WebZjs] Cannot sync: wallet not initialized');
      return;
    }

    if (state.isSyncing) {
      console.log('[WebZjs] Sync already in progress, skipping...');
      return;
    }

    // Stop retrying after 3 consecutive failures
    if (state.syncFailCount >= 3) {
      console.error('[WebZjs] ❌ Too many sync failures, stopping auto-sync');
      dispatch({ type: 'set-error', payload: 'Sync failed multiple times. Please check your connection and refresh the extension.' });
      return;
    }

    try {
      dispatch({ type: 'set-syncing', payload: true });
      dispatch({ type: 'set-error', payload: null }); // Clear previous errors
      console.log('[WebZjs] 🔄 Syncing wallet with custom WASM...');

      // Get seed phrase from storage (already decrypted in memory)
      const { getVaultData } = await import('@/lib/storage/secure-storage');
      const vaultData = getVaultData();

      if (!vaultData?.seedPhrase) {
        throw new Error('Seed phrase not found. Please unlock wallet.');
      }

      // Use our custom sync (replaces wallet.sync())
      const { syncWallet: customSync } = await import('@/lib/zcash-sync');
      const walletBalance = await customSync(
        state.currentAddress,
        vaultData.seedPhrase,
        vaultData.birthdayHeight || undefined,
        vaultData.createdAt // For old wallet migration
      );

      // Convert ZEC to zatoshis for state
      const zatoshis = BigInt(Math.floor(walletBalance.balance * 100_000_000));
      dispatch({ type: 'set-balance', payload: zatoshis });
      dispatch({ type: 'set-last-sync-time', payload: Date.now() });
      dispatch({ type: 'reset-sync-fail-count' }); // Reset on success

      console.log('[WebZjs] ✅ Sync complete! Balance:', walletBalance.balance, 'ZEC');
      console.log('[WebZjs] Transactions:', walletBalance.transactions.length);
    } catch (error) {
      console.error('[WebZjs] Sync failed:', error);
      dispatch({ type: 'increment-sync-fail-count' });
      dispatch({ type: 'set-error', payload: error instanceof Error ? error.message : String(error) });
    } finally {
      dispatch({ type: 'set-syncing', payload: false });
    }
  }, [state.webWallet, state.accountId, state.currentAddress, state.isSyncing, state.syncFailCount]);

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

  // Auto-sync every 30 seconds when wallet is initialized
  useEffect(() => {
    if (!state.webWallet || state.accountId === null) {
      return;
    }

    // Stop auto-sync if too many failures
    if (state.syncFailCount >= 3) {
      console.error('[WebZjs] Auto-sync stopped due to too many failures');
      return;
    }

    console.log('[WebZjs] Starting auto-sync (every 30s)...');

    // Initial sync
    syncWallet();

    // Set up interval for periodic sync
    const intervalId = setInterval(() => {
      if (state.syncFailCount < 3) {
        console.log('[WebZjs] Auto-sync triggered');
        syncWallet();
      }
    }, 30000); // 30 seconds

    return () => {
      console.log('[WebZjs] Stopping auto-sync');
      clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.webWallet, state.accountId, state.syncFailCount]); // Remove syncWallet from deps

  const value: WebZjsContextType = {
    state,
    dispatch,
    initializeWebZjs,
    createWalletFromSeed,
    syncWallet,
    getAddress,
    getBalance,
  };

  return (
    <WebZjsContext.Provider value={value}>{children}</WebZjsContext.Provider>
  );
};

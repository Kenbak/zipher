import { useState, useEffect } from 'react';
import { useWalletState } from '@/lib/storage/wallet-state';
import { useAppStore } from '@/lib/storage/store';
import { useWebZjs } from '@/context/WebzjsContext';
import { getVaultData } from '@/lib/storage/secure-storage';
import type { DecryptedTransaction } from '@/lib/zcash-sync';
import { syncWallet as customSync } from '@/lib/zcash-sync';

export function Home() {
  const navigateTo = useAppStore((state) => state.navigateTo);
  const walletAddress = useWalletState((state) => state.address);
  const setAddress = useWalletState((state) => state.setAddress);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [transactions, setTransactions] = useState<DecryptedTransaction[]>([]);
  const [balanceVisible, setBalanceVisible] = useState(true);

  const { state: webzjsState, createWalletFromSeed, initializeWebZjs } = useWebZjs();

  // Load transactions from sync state
  useEffect(() => {
    const loadTransactions = async () => {
      if (!webzjsState.currentAddress) return;

      try {
        const storageKey = `ziphers_sync_state_${webzjsState.currentAddress}`;
        const result = await chrome.storage.local.get(storageKey);
        const syncState = result[storageKey];

        if (syncState?.transactions) {
          setTransactions(syncState.transactions);
        }
      } catch (error) {
        console.error('[Home] Failed to load transactions:', error);
      }
    };

    loadTransactions();
  }, [webzjsState.currentAddress, webzjsState.lastSyncTime]); // Reload when sync completes

  // Step 1: Initialize WebZjs WASM (single-threaded)
  useEffect(() => {
    if (webzjsState.isInitialized || webzjsState.isInitializing) {
      return;
    }

    console.log('[Home] Initializing WebZjs...');
    initializeWebZjs().catch(err => {
      console.error('[Home] WebZjs init failed:', err);
      setError('Failed to initialize WebZjs: ' + err.message);
      setIsLoading(false);
    });
  }, [webzjsState.isInitialized, webzjsState.isInitializing, initializeWebZjs]);

  // Step 2: Create wallet ONLY to get address (NO SYNC!)
  useEffect(() => {
    if (!webzjsState.isInitialized) {
      console.log('[Home] Waiting for WebZjs initialization...');
      return;
    }

    if (webzjsState.currentAddress) {
      console.log('[Home] Address already available:', webzjsState.currentAddress);
      setAddress(webzjsState.currentAddress);
      setIsLoading(false);
      return;
    }

    const createWallet = async () => {
      try {
        setIsLoading(true);
        console.log('[Home] Creating wallet to get address...');

        const vault = getVaultData();
        if (!vault || !vault.seedPhrase) {
          throw new Error('No seed phrase found. Please unlock wallet.');
        }

        // This creates a WebWallet and calls create_account + get_current_address
        // But does NOT sync (we use custom sync later)
        const result = await createWalletFromSeed(
          vault.accountName || 'Account 1',
          vault.seedPhrase,
          0,
          vault.birthdayHeight || null
        );

        console.log('[Home] ✅ Address generated:', result.address);
        setAddress(result.address);

        // Start custom WASM sync in background
        console.log('[Home] Starting background sync...');
        customSync(vault.seedPhrase, result.address, vault.birthdayHeight, vault.createdAt)
          .then(syncState => {
            console.log('[Home] ✅ Sync complete:', syncState);
          })
          .catch(err => {
            console.error('[Home] Sync failed:', err);
          });

      } catch (err) {
        console.error('[Home] Failed to create wallet:', err);
        setError(err instanceof Error ? err.message : 'Failed to create wallet');
      } finally {
        setIsLoading(false);
      }
    };

    createWallet();
  }, [webzjsState.isInitialized, webzjsState.currentAddress, createWalletFromSeed, setAddress]);

  const address = isLoading ? 'Loading...' : (walletAddress || 'No address');

  // Format balance: zatoshis → ZEC
  const formatBalance = (zatoshis: bigint): string => {
    const zec = Number(zatoshis) / 100_000_000;
    return zec.toFixed(8).replace(/\.?0+$/, ''); // Remove trailing zeros
  };

  const balance = formatBalance(webzjsState.balance);
  const balanceUSD = (parseFloat(balance) * 45).toFixed(2); // Mock ZEC price

  const handleCopyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRefresh = () => {
    syncWallet();
  };

  const formatAddress = (addr: string) => {
    if (addr.length <= 20) return addr;
    return `${addr.substring(0, 10)}...${addr.substring(addr.length - 8)}`;
  };

  // Show loading screen during wallet initialization
  if (isLoading) {
    return (
      <div className="min-h-screen bg-cipher-bg text-white flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cipher-cyan mx-auto"></div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Loading Wallet</h2>
            <p className="text-gray-400">
              Setting up your wallet...
            </p>
          </div>
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show error screen if initialization failed
  if (error && !walletAddress) {
    return (
      <div className="min-h-screen bg-cipher-bg text-white flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Initialization Failed</h2>
            <p className="text-red-400">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-cipher-cyan hover:bg-cipher-cyan/90 text-cipher-bg font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Reload Extension
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-cipher-bg text-white flex flex-col">
      {/* Header - Fixed */}
      <header className="flex-shrink-0 bg-cipher-surface border-b border-cipher-border px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">
            <span className="text-cipher-cyan">Zi</span>
            <span className="text-cipher-green">pher</span>
          </h1>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-cipher-orange bg-cipher-orange/10 px-2 py-1 rounded">
              TESTNET
            </span>
            <button
              onClick={handleRefresh}
              disabled={webzjsState.isSyncing}
              className="p-2 hover:bg-cipher-border rounded-lg transition-colors disabled:opacity-50"
              title="Sync wallet"
            >
              <svg
                className={`w-5 h-5 ${webzjsState.isSyncing ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Scrollable */}
      <main className="flex-1 overflow-y-auto pb-20">
        {/* Account & Balance Section */}
        <div className="px-6 pt-6 pb-6 space-y-4">
          {/* Account Name */}
          <div>
            <h2 className="text-sm font-medium text-gray-400 mb-2">Account 1</h2>
            <button
              onClick={handleCopyAddress}
              className="inline-flex items-center space-x-2 text-sm text-gray-500 hover:text-cipher-cyan transition-colors"
            >
              <span className="font-mono">{formatAddress(address)}</span>
              {copied ? (
                <svg className="w-3.5 h-3.5 text-cipher-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>

          {/* Balance Card - Compact */}
          <div className="bg-cipher-surface border border-cipher-border rounded-2xl p-5">
            <div className="flex items-center space-x-2 mb-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">Total Balance</p>
              <button
                onClick={() => setBalanceVisible(!balanceVisible)}
                className="p-1 hover:bg-cipher-border rounded transition-colors"
              >
                {balanceVisible ? (
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                )}
              </button>
            </div>
            {webzjsState.isSyncing && webzjsState.balance === 0n ? (
              <div className="flex items-center space-x-3 py-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cipher-cyan"></div>
                <span className="text-gray-400">Syncing...</span>
              </div>
            ) : (
              <>
                <div className="flex items-center space-x-2 mb-2">
                  {balanceVisible ? (
                    <>
                      <p className="text-3xl font-bold text-white">{balance}</p>
                      <div className="flex items-center space-x-2">
                        <img
                          src="/icons/zcash-logo.svg"
                          alt="Zcash"
                          className="w-8 h-8"
                        />
                        <span className="text-xl font-semibold text-white">ZEC</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-3xl font-bold text-white">••••••</p>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {balanceVisible ? `≈ $${balanceUSD} USD` : '≈ $•••• USD'}
                </p>
              </>
            )}
          </div>

          {/* Action Buttons - Compact */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigateTo('receive')}
              className="flex items-center space-x-3 bg-cipher-surface border border-cipher-border hover:border-cipher-cyan/50 rounded-xl p-3 transition-all"
            >
              <div className="w-9 h-9 bg-cipher-cyan/10 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-cipher-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <span className="text-sm font-semibold">Receive</span>
            </button>

            <button
              onClick={() => navigateTo('send')}
              className="flex items-center space-x-3 bg-cipher-surface border border-cipher-border hover:border-cipher-green/50 rounded-xl p-3 transition-all"
            >
              <div className="w-9 h-9 bg-cipher-green/10 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-cipher-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <span className="text-sm font-semibold">Send</span>
            </button>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white">Recent Activity</h3>
            {transactions.length > 0 && (
              <a
                href={`https://testnet.cipherscan.app/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-cipher-cyan hover:text-cipher-cyan/80 transition-colors font-medium"
              >
                View All →
              </a>
            )}
          </div>

          {transactions.length === 0 ? (
            <div className="bg-cipher-surface/50 border border-cipher-border rounded-xl p-8 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-cipher-border/50 rounded-full mb-4">
                <svg className="w-7 h-7 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-gray-400 mb-1">No transactions yet</p>
              <p className="text-xs text-gray-600">
                Your activity will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.slice(0, 5).map((tx) => (
                <a
                  key={tx.txid}
                  href={`https://testnet.cipherscan.app/tx/${tx.txid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-cipher-surface border border-cipher-border rounded-xl p-4 hover:border-cipher-cyan/50 hover:bg-cipher-surface/80 transition-all cursor-pointer block"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="w-10 h-10 bg-cipher-green/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-cipher-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm">Received</p>
                        {tx.outputs[0]?.memo && (
                          <p className="text-xs text-cipher-cyan mt-0.5 truncate">"{tx.outputs[0].memo}"</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <p className="font-semibold text-sm text-cipher-green">+{tx.received.toFixed(8)} ZEC</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation - Fixed */}
      <nav className="fixed bottom-0 left-0 right-0 bg-cipher-surface/95 backdrop-blur-sm border-t border-cipher-border px-2 py-1.5 safe-area-inset-bottom">
        <div className="grid grid-cols-3 gap-1 max-w-md mx-auto">
          <button className="flex flex-col items-center py-2.5 px-3 text-cipher-cyan rounded-lg">
            <svg className="w-6 h-6 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs font-medium">Home</span>
          </button>

          <button className="flex flex-col items-center py-2.5 px-3 text-gray-500 hover:text-gray-300 rounded-lg transition-colors">
            <svg className="w-6 h-6 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-medium">Activity</span>
          </button>

          <button
            onClick={() => navigateTo('settings')}
            className="flex flex-col items-center py-2.5 px-3 text-gray-500 hover:text-gray-300 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs font-medium">Settings</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

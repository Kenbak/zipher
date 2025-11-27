import { useState, useEffect } from 'react';
import { useWalletState } from '@/lib/storage/wallet-state';
import { useWebZjs } from '@/context/WebzjsContext';
import { getVaultData } from '@/lib/storage/secure-storage';
import type { DecryptedTransaction } from '@/lib/zcash-sync';

export function Home() {
  const walletAddress = useWalletState((state) => state.address);
  const setAddress = useWalletState((state) => state.setAddress);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [transactions, setTransactions] = useState<DecryptedTransaction[]>([]);

  const { state: webzjsState, createWalletFromSeed, initializeWebZjs, syncWallet } = useWebZjs();

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

  useEffect(() => {
    const initWallet = async () => {
      try {
        setIsLoading(true);
        console.log('[Home] Initializing wallet...');

        // Check if already have address in context
        if (webzjsState.currentAddress) {
          console.log('[Home] Address already in context:', webzjsState.currentAddress);
          setAddress(webzjsState.currentAddress);
          setIsLoading(false);
          return;
        }

        // Initialize WebZjs if needed
        if (!webzjsState.isInitialized) {
          console.log('[Home] Initializing WebZjs...');
          await initializeWebZjs();
        }

        // Get vault (seed phrase) - already decrypted since user unlocked
        const vault = getVaultData();
        if (!vault || !vault.seedPhrase) {
          throw new Error('No seed phrase found. Please unlock wallet.');
        }

        console.log('[Home] Creating wallet from seed...');
        const result = await createWalletFromSeed(
          vault.accountName || 'Account 1',
          vault.seedPhrase,
          0,
          vault.birthdayHeight || 2800000
        );

        console.log('[Home] ✅ Wallet created! Address:', result.address);
        setAddress(result.address);
      } catch (err) {
        console.error('[Home] Failed to initialize wallet:', err);
        setError(err instanceof Error ? err.message : 'Failed to load wallet');
      } finally {
        setIsLoading(false);
      }
    };

    initWallet();
  }, [webzjsState.isInitialized, webzjsState.currentAddress, initializeWebZjs, createWalletFromSeed, setAddress]);

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

  return (
    <div className="min-h-screen bg-cipher-bg text-white flex flex-col">
      {/* Header */}
      <header className="bg-cipher-surface border-b border-cipher-border p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">
            <span className="text-cipher-cyan">Zi</span>
            <span className="text-cipher-green">phers</span>
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

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {/* Account Name & Address */}
          <div className="text-center space-y-2">
            <h2 className="text-lg font-semibold">Account 1</h2>
            <button
              onClick={handleCopyAddress}
              className="inline-flex items-center space-x-2 text-sm text-gray-400 hover:text-cipher-cyan transition-colors"
            >
              <span className="font-mono">{formatAddress(address)}</span>
              {copied ? (
                <svg className="w-4 h-4 text-cipher-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>

          {/* Balance Card */}
          <div className="bg-cipher-surface border border-cipher-border rounded-xl p-6 text-center">
            <p className="text-sm text-gray-400 mb-2">Total Balance</p>
            {webzjsState.isSyncing && webzjsState.balance === 0n ? (
              <div className="flex items-center justify-center space-x-2 h-12">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cipher-cyan"></div>
                <span className="text-cipher-text-light">Syncing...</span>
              </div>
            ) : (
              <>
                <p className="text-4xl font-bold text-cipher-cyan mb-1">{balance} ZEC</p>
                <p className="text-sm text-gray-500">≈ ${balanceUSD} USD</p>
              </>
            )}
            {webzjsState.lastSyncTime && (
              <p className="text-gray-600 text-xs mt-2">
                Last synced: {new Date(webzjsState.lastSyncTime).toLocaleTimeString()}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button className="flex flex-col items-center space-y-2 p-4 hover:bg-cipher-surface rounded-lg transition-colors">
              <div className="w-12 h-12 bg-cipher-cyan/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-cipher-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <span className="text-xs font-medium">Receive</span>
            </button>

            <button className="flex flex-col items-center space-y-2 p-4 hover:bg-cipher-surface rounded-lg transition-colors">
              <div className="w-12 h-12 bg-cipher-green/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-cipher-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <span className="text-xs font-medium">Send</span>
            </button>
          </div>

          {/* Recent Transactions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-400">Recent Activity</h3>
              {transactions.length > 0 && (
                <a
                  href={`https://testnet.cipherscan.app/address/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-cipher-cyan hover:underline"
                >
                  View All on CipherScan →
                </a>
              )}
            </div>

            {transactions.length === 0 ? (
              <div className="bg-cipher-surface border border-cipher-border rounded-lg p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-cipher-border rounded-full mb-3">
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500">No transactions yet</p>
                <p className="text-xs text-gray-600 mt-1">
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
                    className="bg-cipher-surface border border-cipher-border rounded-lg p-4 hover:border-cipher-cyan/50 transition-colors cursor-pointer block"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-cipher-green/10 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-cipher-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-sm">Received</p>
                          <p className="text-xs text-gray-400">Block #{tx.height}</p>
                          {tx.outputs[0]?.memo && (
                            <p className="text-xs text-cipher-cyan mt-1">"{tx.outputs[0].memo}"</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-cipher-green">+{tx.received.toFixed(8)} ZEC</p>
                        <p className="text-xs text-gray-500">{tx.txid.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Success Banner */}
          <div className="bg-cipher-green/10 border border-cipher-green/30 rounded-lg p-3">
            <p className="text-xs text-cipher-green text-center">
              🎉 Wallet ready! Start by receiving some testnet ZEC
            </p>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-cipher-surface border-t border-cipher-border p-2">
        <div className="grid grid-cols-3 gap-1">
          <button className="flex flex-col items-center py-2 px-3 text-cipher-cyan">
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs">Home</span>
          </button>

          <button className="flex flex-col items-center py-2 px-3 text-gray-500 hover:text-white transition-colors">
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs">Activity</span>
          </button>

          <button className="flex flex-col items-center py-2 px-3 text-gray-500 hover:text-white transition-colors">
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs">Settings</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

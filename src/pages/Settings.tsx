import { useState } from 'react';
import { useAppStore } from '@/lib/storage/store';
import { getVaultData, unlockVault } from '@/lib/storage/secure-storage';

export function Settings() {
  const navigateTo = useAppStore((state) => state.navigateTo);
  const [showSeedModal, setShowSeedModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [password, setPassword] = useState('');
  const [seedPhrase, setSeedPhrase] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const vault = getVaultData();

  const handleExportSeed = async () => {
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const vaultData = await unlockVault(password);
      if (!vaultData?.seedPhrase) {
        throw new Error('Failed to retrieve seed phrase');
      }
      setSeedPhrase(vaultData.seedPhrase);
      setPassword('');
    } catch (err) {
      setError('Incorrect password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySeed = async () => {
    await navigator.clipboard.writeText(seedPhrase);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLockWallet = () => {
    // Clear vault from memory
    navigateTo('unlock');
  };

  const handleDeleteWallet = async () => {
    // Clear all storage
    await chrome.storage.local.clear();
    navigateTo('welcome');
  };

  return (
    <div className="h-screen bg-cipher-bg text-white flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 bg-cipher-surface border-b border-cipher-border px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Settings</h1>
          <button
            onClick={() => navigateTo('home')}
            className="p-2 hover:bg-cipher-border rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="p-6 space-y-6">
          {/* Security Section */}
          <div>
            <h2 className="text-sm font-semibold text-gray-400 mb-3">Security</h2>
            <div className="bg-cipher-surface border border-cipher-border rounded-xl divide-y divide-cipher-border">
              <button
                onClick={() => setShowSeedModal(true)}
                className="w-full flex items-center justify-between p-4 hover:bg-cipher-border/30 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-cipher-orange/10 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-cipher-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Export Seed Phrase</p>
                    <p className="text-xs text-gray-500">View your recovery phrase</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button
                onClick={handleLockWallet}
                className="w-full flex items-center justify-between p-4 hover:bg-cipher-border/30 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-cipher-cyan/10 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-cipher-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Lock Wallet</p>
                    <p className="text-xs text-gray-500">Require password to unlock</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Account Section */}
          <div>
            <h2 className="text-sm font-semibold text-gray-400 mb-3">Account</h2>
            <div className="bg-cipher-surface border border-cipher-border rounded-xl divide-y divide-cipher-border">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Account Name</p>
                    <p className="font-medium mt-1">{vault?.accountName || 'Account 1'}</p>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Network</p>
                    <p className="font-medium mt-1">Zcash Testnet</p>
                  </div>
                  <span className="text-xs text-cipher-orange bg-cipher-orange/10 px-2 py-1 rounded">
                    TESTNET
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div>
            <h2 className="text-sm font-semibold text-red-400 mb-3">Danger Zone</h2>
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl">
              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full flex items-center justify-between p-4 hover:bg-red-500/10 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-red-400">Delete Wallet</p>
                    <p className="text-xs text-red-400/70">Permanently remove all data</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* About Section */}
          <div>
            <h2 className="text-sm font-semibold text-gray-400 mb-3">About</h2>
            <div className="bg-cipher-surface border border-cipher-border rounded-xl divide-y divide-cipher-border">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">Version</p>
                  <p className="font-medium">0.1.0</p>
                </div>
              </div>

              <a
                href="https://cipherscan.app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 hover:bg-cipher-border/30 transition-colors"
              >
                <p className="font-medium">CipherScan</p>
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>

              <a
                href="https://github.com/cipherscan/zipher"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 hover:bg-cipher-border/30 transition-colors"
              >
                <p className="font-medium">GitHub</p>
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Export Seed Modal */}
      {showSeedModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50">
          <div className="bg-cipher-surface border border-cipher-border rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Export Seed Phrase</h3>

            {!seedPhrase ? (
              <>
                <div className="bg-cipher-orange/10 border border-cipher-orange/30 rounded-lg p-3 mb-4">
                  <p className="text-xs text-cipher-orange">
                    ⚠️ Never share your seed phrase with anyone. Store it securely offline.
                  </p>
                </div>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-cipher-bg border border-cipher-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cipher-cyan mb-4"
                  autoFocus
                />

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowSeedModal(false);
                      setPassword('');
                      setError('');
                    }}
                    className="flex-1 bg-cipher-border hover:bg-cipher-border/80 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleExportSeed}
                    disabled={!password || isLoading}
                    className="flex-1 bg-cipher-cyan hover:bg-cipher-cyan/90 disabled:bg-gray-700 disabled:text-gray-500 text-cipher-bg font-semibold py-3 px-4 rounded-lg transition-colors"
                  >
                    {isLoading ? 'Unlocking...' : 'Export'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="bg-cipher-bg border border-cipher-border rounded-lg p-4 mb-4">
                  <p className="text-sm font-mono break-all">{seedPhrase}</p>
                </div>

                <button
                  onClick={handleCopySeed}
                  className="w-full bg-cipher-surface border border-cipher-border hover:border-cipher-cyan/50 text-white font-semibold py-3 px-4 rounded-lg transition-colors mb-3 flex items-center justify-center space-x-2"
                >
                  {copied ? (
                    <>
                      <svg className="w-5 h-5 text-cipher-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>Copy to Clipboard</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setShowSeedModal(false);
                    setSeedPhrase('');
                    setPassword('');
                  }}
                  className="w-full bg-cipher-cyan hover:bg-cipher-cyan/90 text-cipher-bg font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Done
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Delete Wallet Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50">
          <div className="bg-cipher-surface border border-red-500/30 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-red-400">Delete Wallet?</h3>

            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-400 mb-2">
                ⚠️ This action cannot be undone!
              </p>
              <p className="text-xs text-red-400/70">
                Make sure you have exported your seed phrase. You will lose access to your funds if you don't have a backup.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-cipher-border hover:bg-cipher-border/80 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteWallet}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-cipher-surface/95 backdrop-blur-sm border-t border-cipher-border px-2 py-1.5 safe-area-inset-bottom">
        <div className="grid grid-cols-3 gap-1 max-w-md mx-auto">
          <button
            onClick={() => navigateTo('home')}
            className="flex flex-col items-center py-2.5 px-3 text-gray-500 hover:text-gray-300 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs font-medium">Home</span>
          </button>

          <button className="flex flex-col items-center py-2.5 px-3 text-gray-500 hover:text-gray-300 rounded-lg transition-colors">
            <svg className="w-6 h-6 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-medium">Activity</span>
          </button>

          <button className="flex flex-col items-center py-2.5 px-3 text-cipher-cyan rounded-lg">
            <svg className="w-6 h-6 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs font-medium">Settings</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

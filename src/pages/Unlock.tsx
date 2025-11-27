import { useState } from 'react';
import { useAppStore } from '@/lib/storage/store';
import { unlockVault } from '@/lib/storage/secure-storage';
import { initializeWallet } from '@/lib/wallet-manager';

export function Unlock() {
  const navigateTo = useAppStore((state) => state.navigateTo);
  
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);

  const handleUnlock = async () => {
    setError('');

    if (!password) {
      setError('Please enter your password');
      return;
    }

    setIsUnlocking(true);

    try {
      console.log('[Unlock] Attempting to unlock vault...');
      
      // Try to decrypt vault with password
      await unlockVault(password);
      
      console.log('[Unlock] ✅ Vault unlocked!');
      
      // Initialize wallet (this will generate address from decrypted seed)
      console.log('[Unlock] Initializing wallet...');
      await initializeWallet();
      
      console.log('[Unlock] ✅ Wallet ready!');
      
      // Navigate to home
      navigateTo('home');
    } catch (err) {
      console.error('[Unlock] Failed:', err);
      if (err instanceof Error && err.message === 'Incorrect password') {
        setError('Incorrect password. Please try again.');
      } else {
        setError('Failed to unlock wallet. Please try again.');
      }
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && password && !isUnlocking) {
      handleUnlock();
    }
  };

  return (
    <div className="min-h-screen bg-cipher-bg text-white flex flex-col">
      {/* Header */}
      <header className="bg-cipher-surface border-b border-cipher-border p-4">
        <div className="flex items-center justify-center">
          <h1 className="text-xl font-bold">
            <span className="text-cipher-cyan">Zi</span>
            <span className="text-cipher-green">phers</span>
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6">
          {/* Lock Icon */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-cipher-surface border border-cipher-border rounded-full">
              <svg className="w-8 h-8 text-cipher-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold">Welcome Back</h2>
              <p className="text-sm text-gray-400 mt-1">
                Enter your password to unlock
              </p>
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter password"
                className="w-full bg-cipher-surface border border-cipher-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cipher-cyan"
                disabled={isUnlocking}
                autoFocus
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Unlock Button */}
            <button
              onClick={handleUnlock}
              disabled={!password || isUnlocking}
              className="w-full bg-cipher-cyan hover:bg-cipher-cyan/90 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-cipher-bg font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              {isUnlocking ? (
                <>
                  <div className="w-5 h-5 border-2 border-cipher-bg border-t-transparent rounded-full animate-spin mr-2" />
                  Unlocking...
                </>
              ) : (
                'Unlock'
              )}
            </button>
          </div>

          {/* Help Text */}
          <div className="text-center space-y-2">
            <p className="text-xs text-gray-500">
              Forgot your password? You can restore your wallet using your seed phrase.
            </p>
            <button
              onClick={() => navigateTo('welcome')}
              className="text-xs text-cipher-cyan hover:underline"
            >
              Reset Wallet
            </button>
          </div>

          {/* Testnet Badge */}
          <div className="text-center">
            <span className="inline-block text-xs text-cipher-orange bg-cipher-orange/10 px-3 py-1 rounded">
              TESTNET
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center">
        <p className="text-xs text-gray-500">
          Powered by{' '}
          <a
            href="https://cipherscan.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cipher-cyan hover:underline"
          >
            CipherScan
          </a>
        </p>
      </footer>
    </div>
  );
}


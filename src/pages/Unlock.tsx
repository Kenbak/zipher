import { useState } from 'react';
import { useAppStore } from '@/lib/storage/store';
import { unlockVault } from '@/lib/storage/secure-storage';

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
      // Decrypt vault with password and get vault data
      const vaultData = await unlockVault(password);

      if (!vaultData?.seedPhrase) {
        throw new Error('Vault data invalid: no seed phrase');
      }

      // Skip WebZjs initialization on unlock
      // WebZjs will be initialized lazily when needed (Send page)
      // For now, we only use custom sync (CipherScan WASM) for viewing
      console.log('[Unlock] ✅ Wallet unlocked!');
      console.log('[Unlock] ℹ️  WebZjs will be initialized only when sending transactions');

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
            <span className="text-cipher-green">pher</span>
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-12">
          {/* Logo */}
          <div className="text-center">
            <img
              src="/icons/zipher_logo.png"
              alt="Zipher Logo"
              className="w-32 h-32 mx-auto mb-4"
            />
          </div>

          {/* Form */}
          <div className="space-y-6">
            <h3 className="text-center text-white text-xl font-medium">
              Enter your password
            </h3>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Password"
              className="w-full bg-cipher-surface border border-cipher-border rounded-lg px-4 py-3 text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cipher-cyan"
              disabled={isUnlocking}
              autoFocus
            />

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
              className="w-full bg-cipher-cyan hover:bg-cipher-cyan/90 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-cipher-bg font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center text-base"
            >
              {isUnlocking ? (
                <>
                  <div className="w-6 h-6 border-2 border-cipher-bg border-t-transparent rounded-full animate-spin mr-2" />
                  Unlocking...
                </>
              ) : (
                'Unlock'
              )}
            </button>

            {/* Forgot Password */}
            <div className="text-center pt-2">
              <button
                onClick={() => navigateTo('welcome')}
                className="text-base text-gray-400 hover:text-cipher-cyan transition-colors"
              >
                Forgot password?
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

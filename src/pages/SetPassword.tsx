import { useState } from 'react';
import { useAppStore } from '@/lib/storage/store';

export function SetPassword() {
  const navigateTo = useAppStore((state) => state.navigateTo);
  const generatedSeed = useAppStore((state) => state.generatedSeed);
  const importedSeed = useAppStore((state) => state.importedSeed);
  const birthdayHeight = useAppStore((state) => state.birthdayHeight);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const seedPhrase = generatedSeed || importedSeed;

  // Password strength calculation
  const getPasswordStrength = () => {
    if (password.length === 0) return { score: 0, label: '', color: '' };

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 2) return { score, label: 'Weak', color: 'text-red-400' };
    if (score <= 3) return { score, label: 'Fair', color: 'text-yellow-400' };
    if (score <= 4) return { score, label: 'Good', color: 'text-cipher-green' };
    return { score, label: 'Strong', color: 'text-cipher-cyan' };
  };

  const strength = getPasswordStrength();

  const handleCreateWallet = async () => {
    setError('');

    // Validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!seedPhrase) {
      setError('No seed phrase found. Please start over.');
      return;
    }

    setIsCreating(true);

    try {
      console.log('[SetPassword] Creating encrypted vault...');

      // Import secure storage
      const { createVault } = await import('@/lib/storage/secure-storage');

      // Create encrypted vault
      await createVault(password, {
        seedPhrase: seedPhrase,
        accountName: 'Account 1',
        birthdayHeight: birthdayHeight,
        createdAt: Date.now(),
      });

      console.log('[SetPassword] Vault created successfully!');
      console.log('[SetPassword] Seed is encrypted with AES-256-GCM');
      console.log('[SetPassword] Password is NOT stored (only encryption key derived from it)');

      // Navigate to home
      navigateTo('home');
    } catch (err) {
      console.error('[SetPassword] Failed to create wallet:', err);
      setError('Failed to create wallet. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-cipher-bg text-white flex flex-col">
      {/* Header */}
      <header className="bg-cipher-surface border-b border-cipher-border p-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigateTo(generatedSeed ? 'confirm-seed' : 'import-wallet')}
            className="text-cipher-cyan hover:text-cipher-cyan/80"
            disabled={isCreating}
          >
            ← Back
          </button>
          <h1 className="text-lg font-semibold">Set Password</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-md mx-auto space-y-6">
          {/* Instructions */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Secure Your Wallet</h2>
            <p className="text-sm text-gray-400">
              Create a strong password to encrypt your wallet data.
            </p>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-cipher-surface border border-cipher-border rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cipher-cyan"
                disabled={isCreating}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {password && (
              <div className="flex items-center space-x-2 text-xs">
                <div className="flex-1 bg-cipher-border rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      strength.score <= 2 ? 'bg-red-400' :
                      strength.score <= 3 ? 'bg-yellow-400' :
                      strength.score <= 4 ? 'bg-cipher-green' : 'bg-cipher-cyan'
                    }`}
                    style={{ width: `${(strength.score / 5) * 100}%` }}
                  />
                </div>
                <span className={strength.color}>{strength.label}</span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              className="w-full bg-cipher-surface border border-cipher-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cipher-cyan"
              disabled={isCreating}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Security Tips */}
          <div className="bg-cipher-surface border border-cipher-border rounded-lg p-4 space-y-2">
            <h3 className="text-sm font-semibold">Password Tips:</h3>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>✓ At least 8 characters (12+ recommended)</li>
              <li>✓ Mix uppercase and lowercase letters</li>
              <li>✓ Include numbers and symbols</li>
              <li>✓ Don't use common words or patterns</li>
            </ul>
          </div>

          {/* Warning */}
          <div className="bg-cipher-orange/10 border border-cipher-orange/30 rounded-lg p-3">
            <p className="text-xs text-cipher-orange">
              ⚠️ This password encrypts your wallet on this device.
              If you forget it, you'll need your seed phrase to recover.
            </p>
          </div>

          {/* Create Button */}
          <button
            onClick={handleCreateWallet}
            disabled={!password || !confirmPassword || isCreating}
            className="w-full bg-cipher-cyan hover:bg-cipher-cyan/90 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-cipher-bg font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            {isCreating ? (
              <>
                <div className="w-5 h-5 border-2 border-cipher-bg border-t-transparent rounded-full animate-spin mr-2" />
                Creating Wallet...
              </>
            ) : (
              'Create Wallet'
            )}
          </button>
        </div>
      </main>
    </div>
  );
}

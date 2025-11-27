import { useState } from 'react';
import { validateMnemonic } from 'bip39';
import { useAppStore } from '@/lib/storage/store';

export function ImportWallet() {
  const navigateTo = useAppStore((state) => state.navigateTo);
  const setImportedSeed = useAppStore((state) => state.setImportedSeed);
  const setBirthdayHeight = useAppStore((state) => state.setBirthdayHeight);

  const [seedInput, setSeedInput] = useState('');
  const [birthdayInput, setBirthdayInput] = useState('');
  const [error, setError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSeedChange = (value: string) => {
    setSeedInput(value);
    setError('');
  };

  const handleImport = () => {
    const seed = seedInput.trim().toLowerCase();
    const words = seed.split(/\s+/);

    // Validate word count
    if (words.length !== 24) {
      setError(`Invalid seed phrase. Expected 24 words, got ${words.length}.`);
      return;
    }

    // Validate using BIP39
    if (!validateMnemonic(seed)) {
      setError('Invalid seed phrase. Please check your words and try again.');
      return;
    }

    // Parse birthday height if provided
    let birthday: number | null = null;
    if (birthdayInput.trim()) {
      const parsed = parseInt(birthdayInput.trim());
      if (isNaN(parsed) || parsed < 0) {
        setError('Invalid birthday height. Must be a positive number.');
        return;
      }
      birthday = parsed;
    }

    // Save and continue
    setImportedSeed(seed);
    setBirthdayHeight(birthday);
    navigateTo('set-password');
  };

  const wordCount = seedInput.trim().split(/\s+/).filter(w => w).length;

  return (
    <div className="min-h-screen bg-cipher-bg text-white flex flex-col">
      {/* Header */}
      <header className="bg-cipher-surface border-b border-cipher-border p-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigateTo('welcome')}
            className="text-cipher-cyan hover:text-cipher-cyan/80"
          >
            ← Back
          </button>
          <h1 className="text-lg font-semibold">Import Wallet</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-md mx-auto space-y-6">
          {/* Instructions */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Restore Your Wallet</h2>
            <p className="text-sm text-gray-400">
              Enter your 24-word seed phrase to restore your existing wallet.
            </p>
          </div>

          {/* Seed Phrase Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Seed Phrase (24 words)</label>
            <textarea
              value={seedInput}
              onChange={(e) => handleSeedChange(e.target.value)}
              placeholder="word1 word2 word3 ..."
              rows={5}
              className="w-full bg-cipher-surface border border-cipher-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cipher-cyan resize-none font-mono text-sm"
              autoComplete="off"
              spellCheck={false}
            />
            <div className="flex items-center justify-between text-xs">
              <span className={wordCount === 24 ? 'text-cipher-green' : 'text-gray-500'}>
                {wordCount} / 24 words
              </span>
              {wordCount === 24 && (
                <span className="text-cipher-green">✓ Complete</span>
              )}
            </div>
          </div>

          {/* Advanced Options */}
          <div className="space-y-3">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-cipher-cyan hover:underline"
            >
              {showAdvanced ? '▼' : '▶'} Advanced Options
            </button>

            {showAdvanced && (
              <div className="space-y-2 pl-4 border-l-2 border-cipher-border">
                <label className="text-sm font-medium">
                  Birthday Height (Optional)
                </label>
                <input
                  type="number"
                  value={birthdayInput}
                  onChange={(e) => setBirthdayInput(e.target.value)}
                  placeholder="e.g., 2800000"
                  className="w-full bg-cipher-surface border border-cipher-border rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cipher-cyan"
                />
                <p className="text-xs text-gray-400">
                  The block height when this wallet was created. This speeds up sync by skipping earlier blocks.
                </p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Security Notice */}
          <div className="bg-cipher-orange/10 border border-cipher-orange/30 rounded-lg p-3">
            <p className="text-xs text-cipher-orange">
              🔒 Your seed phrase is never sent to any server. It stays encrypted on your device.
            </p>
          </div>

          {/* Import Button */}
          <button
            onClick={handleImport}
            disabled={wordCount !== 24}
            className="w-full bg-cipher-cyan hover:bg-cipher-cyan/90 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-cipher-bg font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Import Wallet
          </button>
        </div>
      </main>
    </div>
  );
}

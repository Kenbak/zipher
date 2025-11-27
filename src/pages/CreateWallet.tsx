import { useState, useEffect } from 'react';
import { generateMnemonic } from 'bip39';
import { useAppStore } from '@/lib/storage/store';

export function CreateWallet() {
  const navigateTo = useAppStore((state) => state.navigateTo);
  const setGeneratedSeed = useAppStore((state) => state.setGeneratedSeed);
  
  const [seedPhrase, setSeedPhrase] = useState<string[]>([]);
  const [isRevealed, setIsRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    // Generate 24-word seed phrase
    const mnemonic = generateMnemonic(256); // 256 bits = 24 words
    setSeedPhrase(mnemonic.split(' '));
  }, []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(seedPhrase.join(' '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleContinue = () => {
    setGeneratedSeed(seedPhrase.join(' '));
    navigateTo('confirm-seed');
  };

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
          <h1 className="text-lg font-semibold">Create Wallet</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-md mx-auto space-y-6">
          {/* Warning Box */}
          <div className="bg-cipher-orange/10 border border-cipher-orange/30 rounded-lg p-4 space-y-2">
            <h2 className="font-semibold text-cipher-orange flex items-center">
              <span className="mr-2">⚠️</span>
              Critical: Save Your Seed Phrase
            </h2>
            <ul className="text-xs text-cipher-orange space-y-1">
              <li>• Write it down on paper (don't screenshot)</li>
              <li>• Store it in a safe place</li>
              <li>• Never share it with anyone</li>
              <li>• You'll need it to recover your wallet</li>
            </ul>
          </div>

          {/* Seed Phrase Display */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Your 24-Word Seed Phrase</h3>
              <button
                onClick={() => setIsRevealed(!isRevealed)}
                className="text-xs text-cipher-cyan hover:underline"
              >
                {isRevealed ? '🙈 Hide' : '👁️ Reveal'}
              </button>
            </div>

            {!isRevealed ? (
              <div className="bg-cipher-surface border border-cipher-border rounded-lg p-8 text-center">
                <p className="text-sm text-gray-400">
                  Click "Reveal" to see your seed phrase
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Make sure nobody is watching your screen
                </p>
              </div>
            ) : (
              <>
                <div className="bg-cipher-surface border border-cipher-border rounded-lg p-4">
                  <div className="grid grid-cols-3 gap-3">
                    {seedPhrase.map((word, index) => (
                      <div
                        key={index}
                        className="bg-cipher-bg border border-cipher-border rounded px-3 py-2 text-sm"
                      >
                        <span className="text-gray-500 text-xs mr-2">
                          {index + 1}.
                        </span>
                        <span className="font-mono">{word}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Copy Button */}
                <button
                  onClick={handleCopy}
                  className="w-full bg-cipher-surface hover:bg-cipher-border border border-cipher-border text-white py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  {copied ? '✓ Copied!' : '📋 Copy to Clipboard'}
                </button>
              </>
            )}
          </div>

          {/* Confirmation Checkbox */}
          <div className="bg-cipher-surface border border-cipher-border rounded-lg p-4">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-cipher-border bg-cipher-bg text-cipher-cyan focus:ring-cipher-cyan"
              />
              <span className="text-sm">
                I have written down my seed phrase and stored it in a safe place. 
                I understand that I will lose access to my funds if I lose this seed phrase.
              </span>
            </label>
          </div>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={!confirmed || !isRevealed}
            className="w-full bg-cipher-cyan hover:bg-cipher-cyan/90 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-cipher-bg font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Continue
          </button>
        </div>
      </main>
    </div>
  );
}


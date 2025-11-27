import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/storage/store';

export function ConfirmSeed() {
  const navigateTo = useAppStore((state) => state.navigateTo);
  const generatedSeed = useAppStore((state) => state.generatedSeed);

  const [seedWords, setSeedWords] = useState<string[]>([]);
  const [randomIndices, setRandomIndices] = useState<number[]>([]);
  const [userInputs, setUserInputs] = useState<string[]>(['', '', '']);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!generatedSeed) {
      navigateTo('welcome');
      return;
    }

    const words = generatedSeed.split(' ');
    setSeedWords(words);

    // Select 3 random indices
    const indices: number[] = [];
    while (indices.length < 3) {
      const random = Math.floor(Math.random() * words.length);
      if (!indices.includes(random)) {
        indices.push(random);
      }
    }
    setRandomIndices(indices.sort((a, b) => a - b));
  }, [generatedSeed, navigateTo]);

  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...userInputs];
    newInputs[index] = value.toLowerCase().trim();
    setUserInputs(newInputs);
    setError('');
  };

  const handleVerify = () => {
    // Check if all inputs match
    const allCorrect = randomIndices.every((wordIndex, i) => {
      return seedWords[wordIndex] === userInputs[i];
    });

    if (allCorrect) {
      navigateTo('set-password');
    } else {
      setError('Some words are incorrect. Please try again.');
    }
  };

  const isComplete = userInputs.every(input => input.length > 0);

  return (
    <div className="min-h-screen bg-cipher-bg text-white flex flex-col">
      {/* Header */}
      <header className="bg-cipher-surface border-b border-cipher-border p-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigateTo('create-wallet')}
            className="text-cipher-cyan hover:text-cipher-cyan/80"
          >
            ← Back
          </button>
          <h1 className="text-lg font-semibold">Confirm Seed Phrase</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-md mx-auto space-y-6">
          {/* Instructions */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Verify Your Backup</h2>
            <p className="text-sm text-gray-400">
              To make sure you've saved your seed phrase correctly, please enter the following words:
            </p>
          </div>

          {/* Word Inputs */}
          <div className="space-y-4">
            {randomIndices.map((wordIndex, i) => (
              <div key={wordIndex} className="space-y-2">
                <label className="text-sm text-gray-400">
                  Word #{wordIndex + 1}
                </label>
                <input
                  type="text"
                  value={userInputs[i]}
                  onChange={(e) => handleInputChange(i, e.target.value)}
                  placeholder="Enter word..."
                  className="w-full bg-cipher-surface border border-cipher-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cipher-cyan"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-sm text-red-400">
                {error}
              </p>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-cipher-surface border border-cipher-border rounded-lg p-4">
            <p className="text-xs text-gray-400">
              💡 Tip: Words are case-insensitive. Make sure there are no typos or extra spaces.
            </p>
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={!isComplete}
            className="w-full bg-cipher-cyan hover:bg-cipher-cyan/90 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-cipher-bg font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Verify & Continue
          </button>
        </div>
      </main>
    </div>
  );
}

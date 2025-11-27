import { useAppStore } from '@/lib/storage/store';

export function Welcome() {
  const navigateTo = useAppStore((state) => state.navigateTo);

  return (
    <div className="min-h-screen bg-cipher-bg text-white flex flex-col">
      {/* Header */}
      <header className="bg-cipher-surface border-b border-cipher-border p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">
            <span className="text-cipher-cyan">Zi</span>
            <span className="text-cipher-green">phers</span>
          </h1>
          <span className="text-xs text-cipher-orange bg-cipher-orange/10 px-2 py-1 rounded">
            TESTNET
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-sm">
          {/* Welcome Message */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">
              Welcome to Ziphers! 🎉
            </h2>
            <p className="text-gray-400 text-sm">
              Your privacy-first Zcash wallet
            </p>
          </div>

          {/* Feature List */}
          <div className="bg-cipher-surface border border-cipher-border rounded-lg p-6 space-y-3 text-left">
            <div className="flex items-start space-x-3">
              <span className="text-cipher-green text-xl">🔒</span>
              <div>
                <h3 className="font-semibold">Private & Secure</h3>
                <p className="text-xs text-gray-400">
                  Your keys, your coins. Always encrypted.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-cipher-cyan text-xl">⚡</span>
              <div>
                <h3 className="font-semibold">Fast Sync</h3>
                <p className="text-xs text-gray-400">
                  Powered by WebZjs & ChainSafe
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-cipher-orange text-xl">🧪</span>
              <div>
                <h3 className="font-semibold">Testnet Only</h3>
                <p className="text-xs text-gray-400">
                  Practice without risk. Mainnet after audit.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => navigateTo('create-wallet')}
              className="w-full bg-cipher-cyan hover:bg-cipher-cyan/90 text-cipher-bg font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Create New Wallet
            </button>
            <button
              onClick={() => navigateTo('import-wallet')}
              className="w-full bg-cipher-surface hover:bg-cipher-border border border-cipher-border text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Import Existing Wallet
            </button>
          </div>

          {/* Warning */}
          <div className="bg-cipher-orange/10 border border-cipher-orange/30 rounded-lg p-3">
            <p className="text-xs text-cipher-orange">
              ⚠️ Never share your seed phrase with anyone. Ziphers will never ask for it.
            </p>
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


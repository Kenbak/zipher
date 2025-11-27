import { useState, useEffect } from 'react';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-cipher-bg">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cipher-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cipher-cyan font-semibold">Loading Ziphers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cipher-bg text-white">
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
      <main className="p-6">
        <div className="text-center space-y-6">
          {/* Welcome Message */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Welcome to Ziphers! 🎉</h2>
            <p className="text-gray-400 text-sm">
              Your privacy-first Zcash wallet
            </p>
          </div>

          {/* Status Card */}
          <div className="bg-cipher-surface border border-cipher-border rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-cipher-green rounded-full animate-pulse"></div>
              <span className="text-sm text-cipher-green">Extension Active</span>
            </div>

            <div className="space-y-2 text-sm text-gray-300">
              <p>✅ Vite + React + TypeScript</p>
              <p>✅ Tailwind CSS (CipherScan colors)</p>
              <p>✅ Chrome Extension Manifest V3</p>
              <p>⏳ WebZjs integration (coming soon)</p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button className="w-full bg-cipher-cyan hover:bg-cipher-cyan/90 text-cipher-bg font-semibold py-3 px-4 rounded-lg transition-colors">
              Create New Wallet
            </button>
            <button className="w-full bg-cipher-surface hover:bg-cipher-border border border-cipher-border text-white font-semibold py-3 px-4 rounded-lg transition-colors">
              Import Existing Wallet
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 p-4 text-center">
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

export default App;


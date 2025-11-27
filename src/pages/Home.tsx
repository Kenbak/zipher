export function Home() {
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
      <main className="flex-1 p-6">
        <div className="space-y-6">
          {/* Balance Card */}
          <div className="bg-cipher-surface border border-cipher-border rounded-lg p-6 text-center">
            <p className="text-sm text-gray-400 mb-2">Total Balance</p>
            <p className="text-4xl font-bold text-cipher-cyan">0.00 ZEC</p>
            <p className="text-sm text-gray-500 mt-1">≈ $0.00 USD</p>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button className="bg-cipher-cyan hover:bg-cipher-cyan/90 text-cipher-bg font-semibold py-3 px-4 rounded-lg transition-colors">
              Send
            </button>
            <button className="bg-cipher-green hover:bg-cipher-green/90 text-cipher-bg font-semibold py-3 px-4 rounded-lg transition-colors">
              Receive
            </button>
          </div>

          {/* Recent Transactions */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-400">Recent Transactions</h2>
            <div className="bg-cipher-surface border border-cipher-border rounded-lg p-6 text-center">
              <p className="text-sm text-gray-500">No transactions yet</p>
              <p className="text-xs text-gray-600 mt-1">
                Your transactions will appear here
              </p>
            </div>
          </div>

          {/* Success Message */}
          <div className="bg-cipher-green/10 border border-cipher-green/30 rounded-lg p-4">
            <p className="text-sm text-cipher-green text-center">
              🎉 Wallet created successfully! Your funds are secure.
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


import { useState, useEffect } from 'react';
import { getVaultData } from '@/lib/storage/secure-storage';

export function Home() {
  const [address, setAddress] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // TODO: Get real address from WebZjs wallet
    // For now, show a placeholder Unified Address
    const vault = getVaultData();
    if (vault) {
      // Generate deterministic placeholder address from seed
      const mockAddress = 'u1test' + vault.seedPhrase.substring(0, 20).replace(/\s/g, '').toLowerCase() + '...';
      setAddress(mockAddress);
    }
  }, []);

  const handleCopyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (addr: string) => {
    if (addr.length <= 20) return addr;
    return `${addr.substring(0, 10)}...${addr.substring(addr.length - 8)}`;
  };

  return (
    <div className="min-h-screen bg-cipher-bg text-white flex flex-col">
      {/* Header */}
      <header className="bg-cipher-surface border-b border-cipher-border p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">
            <span className="text-cipher-cyan">Zi</span>
            <span className="text-cipher-green">phers</span>
          </h1>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-cipher-orange bg-cipher-orange/10 px-2 py-1 rounded">
              TESTNET
            </span>
            <button className="p-2 hover:bg-cipher-border rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {/* Account Name & Address */}
          <div className="text-center space-y-2">
            <h2 className="text-lg font-semibold">Account 1</h2>
            <button
              onClick={handleCopyAddress}
              className="inline-flex items-center space-x-2 text-sm text-gray-400 hover:text-cipher-cyan transition-colors"
            >
              <span className="font-mono">{formatAddress(address)}</span>
              {copied ? (
                <svg className="w-4 h-4 text-cipher-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>

          {/* Balance Card */}
          <div className="bg-cipher-surface border border-cipher-border rounded-xl p-6 text-center">
            <p className="text-sm text-gray-400 mb-2">Total Balance</p>
            <p className="text-4xl font-bold text-cipher-cyan mb-1">0.00 ZEC</p>
            <p className="text-sm text-gray-500">≈ $0.00 USD</p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-4 gap-3">
            <button className="flex flex-col items-center space-y-2 p-3 hover:bg-cipher-surface rounded-lg transition-colors">
              <div className="w-12 h-12 bg-cipher-cyan/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-cipher-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <span className="text-xs font-medium">Receive</span>
            </button>

            <button className="flex flex-col items-center space-y-2 p-3 hover:bg-cipher-surface rounded-lg transition-colors">
              <div className="w-12 h-12 bg-cipher-green/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-cipher-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <span className="text-xs font-medium">Send</span>
            </button>

            <button className="flex flex-col items-center space-y-2 p-3 hover:bg-cipher-surface rounded-lg transition-colors">
              <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </div>
              <span className="text-xs font-medium">Swap</span>
            </button>

            <button className="flex flex-col items-center space-y-2 p-3 hover:bg-cipher-surface rounded-lg transition-colors">
              <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs font-medium">Buy</span>
            </button>
          </div>

          {/* Tokens Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-400">Assets</h3>
              <button className="text-xs text-cipher-cyan hover:underline">View All</button>
            </div>

            {/* ZEC Token */}
            <div className="bg-cipher-surface border border-cipher-border rounded-lg p-4 hover:border-cipher-cyan/50 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-cipher-cyan/20 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-cipher-cyan">Ƶ</span>
                  </div>
                  <div>
                    <p className="font-semibold">Zcash</p>
                    <p className="text-xs text-gray-400">0.00 ZEC</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">$0.00</p>
                  <p className="text-xs text-gray-500">0.00%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-400">Recent Activity</h3>
            <div className="bg-cipher-surface border border-cipher-border rounded-lg p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-cipher-border rounded-full mb-3">
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500">No transactions yet</p>
              <p className="text-xs text-gray-600 mt-1">
                Your activity will appear here
              </p>
            </div>
          </div>

          {/* Success Banner */}
          <div className="bg-cipher-green/10 border border-cipher-green/30 rounded-lg p-3">
            <p className="text-xs text-cipher-green text-center">
              🎉 Wallet ready! Start by receiving some testnet ZEC
            </p>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-cipher-surface border-t border-cipher-border p-2">
        <div className="grid grid-cols-4 gap-1">
          <button className="flex flex-col items-center py-2 px-3 text-cipher-cyan">
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs">Home</span>
          </button>
          
          <button className="flex flex-col items-center py-2 px-3 text-gray-500 hover:text-white transition-colors">
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            <span className="text-xs">Swap</span>
          </button>
          
          <button className="flex flex-col items-center py-2 px-3 text-gray-500 hover:text-white transition-colors">
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs">Activity</span>
          </button>
          
          <button className="flex flex-col items-center py-2 px-3 text-gray-500 hover:text-white transition-colors">
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs">Settings</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

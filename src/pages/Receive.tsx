import { useState } from 'react';
import { useAppStore } from '@/lib/storage/store';
import { useWalletState } from '@/lib/storage/wallet-state';
import QRCode from 'qrcode';

export function Receive() {
  const navigateTo = useAppStore((state) => state.navigateTo);
  const address = useWalletState((state) => state.address);
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  // Generate QR code on mount
  useState(() => {
    if (address) {
      QRCode.toDataURL(address, {
        width: 240,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error('[Receive] QR code generation failed:', err));
    }
  });

  const handleCopy = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="h-screen bg-cipher-bg text-white flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 bg-cipher-surface border-b border-cipher-border px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateTo('home')}
            className="p-2 hover:bg-cipher-border rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold">Receive ZEC</h1>
          <div className="w-9" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
        <div className="w-full max-w-md space-y-6">
          {/* Info */}
          <div className="text-center">
            <p className="text-sm text-gray-400">
              Share your address to receive ZEC
            </p>
          </div>

          {/* QR Code */}
          <div className="bg-white rounded-2xl p-4 flex items-center justify-center mx-auto" style={{ maxWidth: '240px' }}>
            {qrCodeUrl ? (
              <img src={qrCodeUrl} alt="Wallet Address QR Code" className="w-full h-auto" />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cipher-cyan"></div>
              </div>
            )}
          </div>

          {/* Address Display */}
          <div className="bg-cipher-surface border border-cipher-border rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-2">Your Address</p>
            <p className="text-sm font-mono break-all text-white mb-3">
              {address}
            </p>
            <button
              onClick={handleCopy}
              className="w-full bg-cipher-cyan hover:bg-cipher-cyan/90 text-cipher-bg font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {copied ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Copy Address</span>
                </>
              )}
            </button>
          </div>

          {/* Warning */}
          <div className="bg-cipher-orange/10 border border-cipher-orange/30 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-cipher-orange mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="text-xs text-cipher-orange space-y-1">
                <p className="font-semibold">Important:</p>
                <p>• Only send Zcash (ZEC) to this address</p>
                <p>• Make sure you're on Testnet</p>
                <p>• Transactions are fully shielded and private</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

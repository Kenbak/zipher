import { useState } from 'react';
import { useAppStore } from '@/lib/storage/store';
import { useWebZjs } from '@/context/WebzjsContext';

export function Send() {
  const navigateTo = useAppStore((state) => state.navigateTo);
  const { state: webzjsState, sendTransaction } = useWebZjs();

  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [txid, setTxid] = useState('');

  const balance = Number(webzjsState.balance) / 100_000_000; // Convert zatoshis to ZEC
  const ZEC_PRICE_USD = 45; // Example price, should be fetched from API
  const amountUSD = amount ? (parseFloat(amount) * ZEC_PRICE_USD).toFixed(2) : '0.00';

  const handleSend = async () => {
    setError('');
    setTxid('');

    // Validation
    if (!recipient) {
      setError('Please enter a recipient address');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) > balance) {
      setError('Insufficient balance');
      return;
    }

    // Validate Zcash address (basic check)
    if (!recipient.startsWith('u') && !recipient.startsWith('zs') && !recipient.startsWith('ztestsapling')) {
      setError('Invalid Zcash address');
      return;
    }

    setIsSending(true);

    try {
      console.log('[Send] Sending transaction...');
      const resultTxid = await sendTransaction(
        recipient,
        parseFloat(amount),
        memo || undefined
      );

      console.log('[Send] ✅ Transaction sent! TXID:', resultTxid);
      setTxid(resultTxid);

      // Clear form
      setRecipient('');
      setAmount('');
      setMemo('');
    } catch (err) {
      console.error('[Send] Failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to send transaction');
    } finally {
      setIsSending(false);
    }
  };

  if (txid) {
    // Success screen
    return (
      <div className="min-h-screen bg-cipher-bg text-white flex flex-col">
        {/* Header */}
        <header className="bg-cipher-surface border-b border-cipher-border p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateTo('home')}
              className="p-2 hover:bg-cipher-border rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold">Transaction Sent</h1>
            <div className="w-9" />
          </div>
        </header>

        {/* Success Content */}
        <main className="flex-1 p-6 flex flex-col items-center justify-center">
          <div className="text-center space-y-6">
            {/* Success Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-cipher-green/10 border-2 border-cipher-green rounded-full">
              <svg className="w-10 h-10 text-cipher-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-cipher-green">Transaction Sent!</h2>
              <p className="text-gray-400">
                Your transaction has been broadcast to the network
              </p>
            </div>

            {/* TXID */}
            <div className="bg-cipher-surface border border-cipher-border rounded-lg p-4 space-y-2">
              <p className="text-sm text-gray-400">Transaction ID</p>
              <p className="text-xs font-mono break-all text-cipher-cyan">{txid}</p>
              <a
                href={`https://testnet.cipherscan.app/tx/${txid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-xs text-cipher-cyan hover:underline mt-2"
              >
                View on CipherScan →
              </a>
            </div>

            {/* Back Button */}
            <button
              onClick={() => navigateTo('home')}
              className="w-full bg-cipher-cyan hover:bg-cipher-cyan/90 text-cipher-bg font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Back to Home
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cipher-bg text-white flex flex-col">
      {/* Header */}
      <header className="bg-cipher-surface border-b border-cipher-border p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateTo('home')}
            className="p-2 hover:bg-cipher-border rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold">Send ZEC</h1>
          <div className="w-9" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-6">
          {/* Recipient Address */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Recipient Address</label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="u1... or zs1..."
              className="w-full bg-cipher-surface border border-cipher-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cipher-cyan font-mono text-sm"
              disabled={isSending}
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Amount</label>
            <input
              type="number"
              step="0.00000001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-cipher-surface border border-cipher-border rounded-lg px-4 py-3 text-white text-2xl font-semibold placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cipher-cyan"
              disabled={isSending}
            />
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">≈ ${amountUSD} USD</span>
              <span className="text-gray-500">
                Available: <span className="text-white font-medium">{balance.toFixed(4)} ZEC</span>
              </span>
            </div>
          </div>

          {/* Memo (Optional) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Memo (Optional)</label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="Add a private message..."
              maxLength={512}
              rows={3}
              className="w-full bg-cipher-surface border border-cipher-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cipher-cyan resize-none"
              disabled={isSending}
            />
            <p className="text-xs text-gray-500">{memo.length}/512 characters</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!recipient || !amount || isSending}
            className="w-full bg-cipher-green hover:bg-cipher-green/90 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-cipher-bg font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            {isSending ? (
              <>
                <div className="w-5 h-5 border-2 border-cipher-bg border-t-transparent rounded-full animate-spin mr-2" />
                Sending...
              </>
            ) : (
              'Send Transaction'
            )}
          </button>
        </div>
      </main>
    </div>
  );
}

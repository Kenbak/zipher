import { useState } from 'react';
import { useAppStore } from '@/lib/storage/store';

export function TestOffscreen() {
  const navigateTo = useAppStore((state) => state.navigateTo);
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testOffscreen = async () => {
    setTesting(true);
    setResult(null);

    try {
      console.log('[TestOffscreen] Creating offscreen document...');

      // Create offscreen document
      await chrome.offscreen.createDocument({
        url: 'offscreen/offscreen.html',
        reasons: [chrome.offscreen.Reason.WORKERS],
        justification: 'Test if WebZjs can run with eval() and Web Workers in offscreen context',
      });

      console.log('[TestOffscreen] ✅ Offscreen document created!');

      // Wait a bit for offscreen to load
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Send test message
      console.log('[TestOffscreen] Sending test message...');
      const response = await chrome.runtime.sendMessage({ type: 'TEST_WEBZJS' });

      console.log('[TestOffscreen] Response:', response);
      setResult(response);

      // Close offscreen document
      await chrome.offscreen.closeDocument();
      console.log('[TestOffscreen] Offscreen document closed');
    } catch (error) {
      console.error('[TestOffscreen] Error:', error);
      setResult({ success: false, error: String(error) });
    } finally {
      setTesting(false);
    }
  };

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
          <h1 className="text-lg font-semibold">Test Offscreen Document</h1>
          <div className="w-9" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-6">
          {/* Explanation */}
          <div className="bg-cipher-surface border border-cipher-border rounded-lg p-4 space-y-2">
            <h2 className="font-semibold text-cipher-cyan">What is this test?</h2>
            <p className="text-sm text-gray-400">
              Chrome's Offscreen Document API allows running code with less strict CSP.
              We're testing if WebZjs can use eval() and Web Workers in this context.
            </p>
            <p className="text-sm text-gray-400">
              If this works, we can send transactions without needing a backend!
            </p>
          </div>

          {/* Test Button */}
          <button
            onClick={testOffscreen}
            disabled={testing}
            className="w-full bg-cipher-cyan hover:bg-cipher-cyan/90 disabled:bg-gray-700 disabled:text-gray-500 text-cipher-bg font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            {testing ? (
              <>
                <div className="w-5 h-5 border-2 border-cipher-bg border-t-transparent rounded-full animate-spin mr-2" />
                Testing...
              </>
            ) : (
              'Run Offscreen Test'
            )}
          </button>

          {/* Results */}
          {result && (
            <div className={`border rounded-lg p-4 ${
              result.success
                ? 'bg-cipher-green/10 border-cipher-green/30'
                : 'bg-red-500/10 border-red-500/30'
            }`}>
              <h3 className="font-semibold mb-2">
                {result.success ? '✅ Test Results' : '❌ Test Failed'}
              </h3>

              {result.result && (
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>WASM:</strong>{' '}
                    <span className={result.result.wasmWorks ? 'text-cipher-green' : 'text-red-400'}>
                      {result.result.wasmWorks ? '✅ Works' : '❌ Failed'}
                    </span>
                  </p>
                  <p>
                    <strong>eval() / Workers:</strong>{' '}
                    <span className={result.result.evalWorks ? 'text-cipher-green' : 'text-red-400'}>
                      {result.result.evalWorks ? '✅ Works!' : '❌ Blocked'}
                    </span>
                  </p>
                  {result.result.evalWorks && (
                    <div className="mt-4 p-3 bg-cipher-green/20 rounded">
                      <p className="font-semibold text-cipher-green">
                        🎉 Great! WebZjs CAN work in offscreen!
                      </p>
                      <p className="text-xs mt-1">
                        We can use this to send transactions without a backend.
                      </p>
                    </div>
                  )}
                  {!result.result.evalWorks && result.result.wasmWorks && (
                    <div className="mt-4 p-3 bg-red-500/20 rounded">
                      <p className="font-semibold text-red-400">
                        Offscreen still blocks eval()
                      </p>
                      <p className="text-xs mt-1">
                        We'll need a different solution (backend prover or WebZjs fix).
                      </p>
                    </div>
                  )}
                </div>
              )}

              {result.error && (
                <pre className="text-xs mt-2 p-2 bg-black/20 rounded overflow-auto">
                  {result.error}
                </pre>
              )}
            </div>
          )}

          {/* Info */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Offscreen documents run in a hidden window</p>
            <p>• They have access to DOM APIs and Web Workers</p>
            <p>• CSP might be more relaxed than in popup/service worker</p>
          </div>
        </div>
      </main>
    </div>
  );
}

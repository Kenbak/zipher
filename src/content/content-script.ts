/**
 * Zipher Content Script
 *
 * Injects the window.zipher API into web pages
 * Communicates with the extension via message passing
 */

interface ZipherAPI {
  isZipher: boolean;
  isConnected: boolean;
  address: string | null;
  network: 'mainnet' | 'testnet';

  // Methods
  connect: () => Promise<{ address: string }>;
  disconnect: () => Promise<void>;
  sendTransaction: (params: SendTransactionParams) => Promise<{ txid: string }>;
  signMessage: (message: string) => Promise<{ signature: string }>;

  // Events
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string, callback: (data: any) => void) => void;
}

interface SendTransactionParams {
  to: string;
  amount: number;
  memo?: string;
}

class ZipherProvider implements ZipherAPI {
  public isZipher = true;
  public isConnected = false;
  public address: string | null = null;
  public network: 'mainnet' | 'testnet' = 'testnet';

  private eventListeners: Map<string, Set<(data: any) => void>> = new Map();
  private requestId = 0;
  private pendingRequests: Map<number, { resolve: (value: any) => void; reject: (error: any) => void }> = new Map();

  constructor() {
    // Listen for responses from the extension
    window.addEventListener('message', (event) => {
      if (event.source !== window || event.data.source !== 'zipher-extension') {
        return;
      }

      const { requestId, type, payload, error } = event.data;

      if (requestId !== undefined) {
        const pending = this.pendingRequests.get(requestId);
        if (pending) {
          if (error) {
            pending.reject(new Error(error));
          } else {
            pending.resolve(payload);
          }
          this.pendingRequests.delete(requestId);
        }
      }

      // Handle events
      if (type === 'accountsChanged') {
        this.address = payload.address;
        this.isConnected = !!payload.address;
        this.emit('accountsChanged', [payload.address]);
      } else if (type === 'disconnect') {
        this.address = null;
        this.isConnected = false;
        this.emit('disconnect', {});
      }
    });

    // Check if already connected on load
    this.checkConnection();
  }

  private async sendRequest(method: string, params?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const requestId = this.requestId++;
      this.pendingRequests.set(requestId, { resolve, reject });

      // Send message to content script → background script
      window.postMessage(
        {
          source: 'zipher-page',
          requestId,
          method,
          params,
        },
        '*'
      );

      // Timeout after 60 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
          reject(new Error('Request timeout'));
        }
      }, 60000);
    });
  }

  private async checkConnection(): Promise<void> {
    try {
      const result = await this.sendRequest('getConnection');
      if (result?.address) {
        this.address = result.address;
        this.isConnected = true;
      }
    } catch (error) {
      // Not connected yet
    }
  }

  async connect(): Promise<{ address: string }> {
    const result = await this.sendRequest('connect');
    this.address = result.address;
    this.isConnected = true;
    return { address: result.address };
  }

  async disconnect(): Promise<void> {
    await this.sendRequest('disconnect');
    this.address = null;
    this.isConnected = false;
  }

  async sendTransaction(params: SendTransactionParams): Promise<{ txid: string }> {
    if (!this.isConnected) {
      throw new Error('Not connected. Call connect() first.');
    }
    const result = await this.sendRequest('sendTransaction', params);
    return { txid: result.txid };
  }

  async signMessage(message: string): Promise<{ signature: string }> {
    if (!this.isConnected) {
      throw new Error('Not connected. Call connect() first.');
    }
    const result = await this.sendRequest('signMessage', { message });
    return { signature: result.signature };
  }

  on(event: string, callback: (data: any) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  off(event: string, callback: (data: any) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => callback(data));
    }
  }
}

// Inject the API into the page
const zipher = new ZipherProvider();

// Make it available globally
(window as any).zipher = zipher;

// Announce to the page that Zipher is ready
window.dispatchEvent(new Event('zipher#initialized'));

console.log('[Zipher] Provider injected into page');

// Forward messages from page to extension
window.addEventListener('message', (event) => {
  if (event.source !== window || event.data.source !== 'zipher-page') {
    return;
  }

  // Forward to background script
  chrome.runtime.sendMessage({
    type: 'ZIPHER_REQUEST',
    data: event.data,
  }).then((response) => {
    // Send response back to page
    window.postMessage(
      {
        source: 'zipher-extension',
        requestId: event.data.requestId,
        ...response,
      },
      '*'
    );
  }).catch((error) => {
    // Send error back to page
    window.postMessage(
      {
        source: 'zipher-extension',
        requestId: event.data.requestId,
        error: error.message,
      },
      '*'
    );
  });
});

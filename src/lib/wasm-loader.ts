// WASM Loader from CipherScan (adapted for Ziphers)
// Handles dynamic loading of the WASM module for memo decryption

let wasmModule: any = null;
let wasmInitialized = false;

export interface DecryptedOutput {
  memo: string;
  amount: number; // Amount in ZEC
}

export interface ZcashWasm {
  test_wasm: () => string;
  detect_key_type: (viewingKey: string) => string;
  decrypt_memo: (txHex: string, viewingKey: string) => string;
  decrypt_compact_output: (nullifierHex: string, cmxHex: string, ephemeralKeyHex: string, ciphertextHex: string, viewingKey: string) => string;
  batch_filter_compact_outputs: (outputsJson: string, viewingKey: string) => string;
}

/**
 * Load and initialize the WASM module
 */
export async function loadWasm(): Promise<ZcashWasm> {
  if (wasmModule && wasmInitialized) {
    return wasmModule;
  }

  try {
    // Dynamic import for Chrome extension
    const wasmInit = await import('../../public/wasm/zcash_wasm.js');

    // Initialize the WASM (loads the .wasm file)
    await wasmInit.default();

    // Extract exported functions
    wasmModule = {
      test_wasm: wasmInit.test_wasm,
      detect_key_type: wasmInit.detect_key_type,
      decrypt_memo: wasmInit.decrypt_memo,
      decrypt_compact_output: wasmInit.decrypt_compact_output,
      batch_filter_compact_outputs: wasmInit.batch_filter_compact_outputs,
    };

    wasmInitialized = true;
    console.log('[WASM] ✅ CipherScan WASM loaded successfully!');
    return wasmModule;
  } catch (error) {
    console.error('[WASM] ❌ Failed to load WASM:', error);
    throw error;
  }
}

/**
 * Decrypt a memo from a transaction
 */
export async function decryptMemo(txHex: string, viewingKey: string): Promise<DecryptedOutput> {
  const wasm = await loadWasm();
  const result = wasm.decrypt_memo(txHex, viewingKey);
  return JSON.parse(result);
}

/**
 * BATCH filter compact outputs (FAST!)
 * Returns matching TXIDs without decrypting full memos
 */
export async function filterCompactOutputsBatch(
  compactBlocks: any[],
  viewingKey: string,
  onProgress?: (blocksProcessed: number, totalBlocks: number, matchesFound: number) => void
): Promise<{ txid: string; height: number; timestamp: number }[]> {
  console.log(`[WASM] 🚀 Batch filtering ${compactBlocks.length} blocks...`);

  const wasm = await loadWasm();
  const totalBlocks = compactBlocks.length;
  const matchingTxs: { txid: string; height: number; timestamp: number }[] = [];
  const txMap = new Map<string, { txid: string; height: number; timestamp: number }>();

  // Process in chunks (10k blocks each)
  const CHUNK_SIZE = 10000;

  for (let chunkStart = 0; chunkStart < totalBlocks; chunkStart += CHUNK_SIZE) {
    const chunkEnd = Math.min(chunkStart + CHUNK_SIZE, totalBlocks);
    const chunk = compactBlocks.slice(chunkStart, chunkEnd);

    // Extract all Orchard outputs
    const allOutputs: any[] = [];
    for (const block of chunk) {
      for (const tx of block.vtx || []) {
        for (const action of tx.actions || []) {
          allOutputs.push({
            nullifier: action.nullifier,
            cmx: action.cmx,
            ephemeral_key: action.ephemeralKey,
            ciphertext: action.ciphertext,
            txid: tx.hash,
            height: parseInt(block.height),
            timestamp: block.time,
          });
        }
      }
    }

    if (allOutputs.length > 0) {
      // Call WASM batch API
      const outputsJson = JSON.stringify(allOutputs);
      const matchesJson = wasm.batch_filter_compact_outputs(outputsJson, viewingKey);
      const matches = JSON.parse(matchesJson);

      console.log(`[WASM] ✅ Found ${matches.length} matches in chunk`);

      // Add matches (deduplicate by TXID)
      for (const match of matches) {
        const output = allOutputs[match.index];
        if (!txMap.has(output.txid)) {
          const tx = {
            txid: output.txid,
            height: output.height,
            timestamp: output.timestamp,
          };
          txMap.set(output.txid, tx);
          matchingTxs.push(tx);
        }
      }
    }

    // Update progress
    if (onProgress) {
      onProgress(chunkEnd, totalBlocks, matchingTxs.length);
    }
  }

  console.log(`[WASM] ✅ Filtering complete! Found ${matchingTxs.length} matches`);
  return matchingTxs;
}

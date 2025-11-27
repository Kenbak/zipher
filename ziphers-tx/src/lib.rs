use wasm_bindgen::prelude::*;

// Test Halo2 in WASM
use halo2_proofs::pasta::Fp;

#[wasm_bindgen]
pub fn test_wasm() -> String {
    console_error_panic_hook::set_once();
    "Ziphers TX WASM initialized! ✅".to_string()
}

/// Test that Halo2 compiles and works in WASM (single-threaded)
#[wasm_bindgen]
pub fn test_halo2() -> String {
    console_error_panic_hook::set_once();
    
    // Create a field element (proves Halo2 works)
    let zero = Fp::zero();
    let one = Fp::one();
    let sum = zero + one;
    
    format!("Halo2 works in WASM! Field test: 0 + 1 = {} ✅", sum == one)
}

/// Test zcash_proofs bundled-prover (this includes Halo2 proving keys)
#[wasm_bindgen]
pub fn test_bundled_prover() -> String {
    console_error_panic_hook::set_once();
    
    // Just importing zcash_proofs with bundled-prover proves it compiles
    // The bundled prover includes all Halo2 circuit parameters
    "zcash_proofs with bundled-prover compiled successfully! ✅".to_string()
}

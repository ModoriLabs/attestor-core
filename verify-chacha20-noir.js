const { BarretenbergOperator, makeBarretenbergZKOperator, makeLocalFileFetch, generateProof, verifyProof } = require('zk-symmetric-crypto-test');
const { strToUint8Array } = require('@reclaimprotocol/tls');

async function testChaCha20Noir() {
    console.log('Testing ChaCha20 Noir circuit integration...');
    
    try {
        // Create file fetcher
        const fetcher = makeLocalFileFetch();
        
        // Create Barretenberg operator for ChaCha20
        const operator = makeBarretenbergZKOperator({
            algorithm: 'chacha20',
            fetcher,
            options: { threads: 8, maxProofConcurrency: 2 }
        });
        
        console.log('✓ Barretenberg operator created successfully');
        
        // Test data
        const key = new Uint8Array(32).fill(1); // 32-byte key for ChaCha20
        const nonce = new Uint8Array(12).fill(2); // 12-byte nonce
        const counter = 0;
        const plaintext = strToUint8Array('Hello, ChaCha20 Noir!');
        
        // Pad plaintext to 128 bytes (32 u32 words)
        const paddedPlaintext = new Uint8Array(128);
        paddedPlaintext.set(plaintext);
        
        // Generate proof
        console.log('Generating proof...');
        const startTime = Date.now();
        
        const proof = await generateProof({
            algorithm: 'chacha20',
            operator,
            privateInput: {
                key
            },
            publicInput: {
                ciphertext: paddedPlaintext,
                iv: nonce,
                offsetBytes: 0
            }
        });
        
        const proofTime = Date.now() - startTime;
        console.log(`✓ Proof generated successfully in ${proofTime}ms`);
        console.log(`  Proof object:`, Object.keys(proof));
        if (proof.proof) {
            console.log(`  Proof size: ${proof.proof.length} bytes`);
        }
        
        // Verify proof
        console.log('Verifying proof...');
        const verifyStartTime = Date.now();
        
        await verifyProof({
            algorithm: 'chacha20',
            proof,
            operator,
            publicInput: {
                ciphertext: paddedPlaintext,
                iv: nonce,
                offsetBytes: 0
            }
        });
        
        const verifyTime = Date.now() - verifyStartTime;
        console.log(`✓ Proof verification completed in ${verifyTime}ms`);
        console.log(`  Verification result: PASSED (no error thrown)`);
        
        console.log('\n🎉 ChaCha20 Noir circuit integration test PASSED!');
        console.log('✓ Circuit file loaded correctly');
        console.log('✓ Proof generation working');
        console.log('✓ Proof verification working');
        console.log('\n🎉 ChaCha20 Noir circuit is working correctly with Barretenberg!');
        
    } catch (error) {
        console.error('\n❌ Error testing ChaCha20 Noir circuit:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

testChaCha20Noir();
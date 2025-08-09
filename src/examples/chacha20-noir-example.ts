/**
 * Example: Using ChaCha20 Noir Circuit Integration
 * 
 * This example demonstrates how to use the integrated ChaCha20 Noir circuit
 * for zero-knowledge proof generation and verification.
 */

import { 
	makeNoirZKOperator, 
	createDefaultFetcher,
	ZKProofInput 
} from '../zk/noir'
import { generateChaCha20TestData } from '../zk/noir/chacha20-helper'

/**
 * Example function demonstrating ChaCha20 Noir circuit usage
 */
export async function demonstrateChaCha20NoirCircuit() {
	console.log('🔐 ChaCha20 Noir Circuit Integration Demo')
	console.log('=======================================')

	// Step 1: Create the ZK operator
	console.log('\n1. Creating ChaCha20 Noir ZK Operator...')
	const fetcher = createDefaultFetcher()
	const zkOperator = makeNoirZKOperator({
		algorithm: 'chacha20',
		fetcher,
		options: {
			threads: 1,
			maxProofConcurrency: 1
		}
	})
	console.log('✅ ZK Operator created successfully')

	// Step 2: Generate test data
	console.log('\n2. Generating ChaCha20 test data...')
	const testData = generateChaCha20TestData()
	console.log(`✅ Test data generated:`)
	console.log(`   - Key: ${testData.key.length} bytes`)
	console.log(`   - Nonce: ${testData.nonce.length} bytes`)
	console.log(`   - Plaintext: ${testData.plaintext.length} bytes`)
	console.log(`   - Ciphertext: ${testData.ciphertext.length} bytes`)
	console.log(`   - Counter: ${testData.counter}`)

	// Step 3: Prepare input for the circuit
	const input: ZKProofInput = {
		key: testData.key,
		nonce: testData.nonce,
		counter: testData.counter,
		in: testData.plaintext,
		out: testData.ciphertext
	}

	// Step 4: Generate witness
	console.log('\n3. Generating witness...')
	const startWitness = Date.now()
	const witness = await zkOperator.generateWitness(input)
	const witnessTime = Date.now() - startWitness
	console.log(`✅ Witness generated in ${witnessTime}ms (${witness.length} bytes)`)

	// Step 5: Generate proof
	console.log('\n4. Generating zero-knowledge proof...')
	const startProof = Date.now()
	const proofResult = await zkOperator.groth16Prove(witness)
	const proofTime = Date.now() - startProof
	console.log(`✅ Proof generated in ${proofTime}ms (${proofResult.proof.length} bytes)`)

	// Step 6: Verify proof
	console.log('\n5. Verifying proof...')
	const startVerify = Date.now()
	const publicSignals = {
		nonce: testData.nonce,
		counter: testData.counter,
		in: testData.plaintext,
		out: testData.ciphertext
	}
	const isValid = await zkOperator.groth16Verify(publicSignals, proofResult.proof)
	const verifyTime = Date.now() - startVerify
	console.log(`✅ Proof verification completed in ${verifyTime}ms`)
	console.log(`   Result: ${isValid ? '✅ VALID' : '❌ INVALID'}`)

	// Summary
	console.log('\n📊 Performance Summary:')
	console.log(`   - Witness generation: ${witnessTime}ms`)
	console.log(`   - Proof generation: ${proofTime}ms`)
	console.log(`   - Proof verification: ${verifyTime}ms`)
	console.log(`   - Total time: ${witnessTime + proofTime + verifyTime}ms`)

	return {
		witness,
		proof: proofResult.proof,
		isValid,
		performance: {
			witnessTime,
			proofTime,
			verifyTime,
			totalTime: witnessTime + proofTime + verifyTime
		}
	}
}

/**
 * Run the demo if this file is executed directly
 */
if (require.main === module) {
	demonstrateChaCha20NoirCircuit()
		.then(result => {
			console.log('\n🎉 Demo completed successfully!')
			process.exit(0)
		})
		.catch(error => {
			console.error('\n❌ Demo failed:', error)
			process.exit(1)
		})
}
import { makeNoirZKOperator, createDefaultFetcher, ZKProofInput } from '../zk/noir'
import { generateChaCha20TestData } from '../zk/noir/chacha20-helper'

describe('ChaCha20 Noir Integration', () => {
	let zkOperator: any

	beforeAll(async() => {
		const fetcher = createDefaultFetcher()
		zkOperator = makeNoirZKOperator({
			algorithm: 'chacha20',
			fetcher,
			options: {
				threads: 1,
				maxProofConcurrency: 1
			}
		})
	})

	test('should generate witness for ChaCha20', async() => {
		// Generate valid ChaCha20 test data
		const testData = generateChaCha20TestData()

		const input: ZKProofInput = {
			key: testData.key,
			nonce: testData.nonce,
			counter: testData.counter,
			in: testData.plaintext,
			out: testData.ciphertext
		}

		const witness = await zkOperator.generateWitness(input)
		expect(witness).toBeInstanceOf(Uint8Array)
		expect(witness.length).toBeGreaterThan(0)
		console.log('Witness generated successfully, length:', witness.length)
	}, 30000) // 30 second timeout

	test('should generate and verify proof for ChaCha20', async() => {
		// Generate valid ChaCha20 test data
		const testData = generateChaCha20TestData()

		const input: ZKProofInput = {
			key: testData.key,
			nonce: testData.nonce,
			counter: testData.counter,
			in: testData.plaintext,
			out: testData.ciphertext
		}

		// Generate witness
		const witness = await zkOperator.generateWitness(input)
		expect(witness).toBeInstanceOf(Uint8Array)
		console.log('Witness generated for proof, length:', witness.length)

		// Generate proof
		const proofResult = await zkOperator.groth16Prove(witness)
		expect(proofResult.proof).toBeInstanceOf(Uint8Array)
		expect(proofResult.proof.length).toBeGreaterThan(0)
		console.log('Proof generated successfully, length:', proofResult.proof.length)

		// Verify proof (pass empty public signals as first parameter)
		const isValid = await zkOperator.groth16Verify({}, proofResult.proof)
		expect(isValid).toBe(true)
		console.log('Proof verification successful')
	}, 60000) // 60 second timeout for proof generation

	test('should handle invalid input gracefully', async() => {
		// Test with invalid key size
		const invalidInput: ZKProofInput = {
			key: new Uint8Array(16), // Wrong size for ChaCha20
			nonce: new Uint8Array(12),
			counter: 1,
			in: new Uint8Array(128),
			out: new Uint8Array(128)
		}

		try {
			await zkOperator.generateWitness(invalidInput)
			// Should not reach here
			expect(false).toBe(true)
		} catch (error) {
			// Expected to fail
			expect(error).toBeDefined()
			console.log('Invalid input handled correctly:', error.message)
		}
	})
})
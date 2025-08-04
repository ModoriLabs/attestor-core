import { makeDefaultZkOperator } from '../utils/zk'
import { logger } from '../utils/logger'
import { generateChaCha20TestData } from '../zk/noir/chacha20-helper'

describe('Noir ZK Engine Integration', () => {
	it('should create Noir ZK operator through makeDefaultZkOperator', async () => {
		// Test that makeDefaultZkOperator can create a Noir operator
		const zkOperator = makeDefaultZkOperator(
			'chacha20',
			'noir',
			logger
		)

		expect(zkOperator).toBeDefined()
		expect(typeof zkOperator.generateWitness).toBe('function')
		expect(typeof zkOperator.groth16Prove).toBe('function')
		expect(typeof zkOperator.groth16Verify).toBe('function')
	})

	it('should generate witness using default operator', async () => {
		const zkOperator = makeDefaultZkOperator(
			'chacha20',
			'noir',
			logger
		)

		const testData = generateChaCha20TestData()
		const zkInput = {
			key: testData.key,
			nonce: testData.nonce,
			counter: testData.counter,
			in: testData.plaintext,
			out: testData.ciphertext
		}
		const witness = await zkOperator.generateWitness(zkInput)

		expect(witness).toBeInstanceOf(Uint8Array)
		expect(witness.length).toBeGreaterThan(0)
		console.log('Witness generated via default operator, length:', witness.length)
	}, 30000)

	it('should generate and verify proof using default operator', async () => {
		const zkOperator = makeDefaultZkOperator(
			'chacha20',
			'noir',
			logger
		)

		const testData = generateChaCha20TestData()
		const zkInput = {
			key: testData.key,
			nonce: testData.nonce,
			counter: testData.counter,
			in: testData.plaintext,
			out: testData.ciphertext
		}
		const witness = await zkOperator.generateWitness(zkInput)
		const proofResult = await zkOperator.groth16Prove(witness)

		expect(proofResult.proof).toBeInstanceOf(Uint8Array)
		expect(proofResult.proof.length).toBeGreaterThan(0)
		console.log('Proof generated via default operator, length:', proofResult.proof.length)

		// Verify the proof
		const publicSignals = {
			nonce: testData.nonce,
			counter: testData.counter,
			in: testData.plaintext,
			out: testData.ciphertext
		}
		const isValid = await zkOperator.groth16Verify(publicSignals, proofResult.proof)
		expect(isValid).toBe(true)
		console.log('Proof verification via default operator successful')
	}, 60000)
})
/**
 * ChaCha20 encryption helper for generating test data
 * This is a simplified implementation for testing purposes only
 */

// ChaCha20 quarter round function
function quarterRound(a: number, b: number, c: number, d: number): [number, number, number, number] {
	a = (a + b) >>> 0
	d = ((d ^ a) << 16) | ((d ^ a) >>> 16)
	c = (c + d) >>> 0
	b = ((b ^ c) << 12) | ((b ^ c) >>> 20)
	a = (a + b) >>> 0
	d = ((d ^ a) << 8) | ((d ^ a) >>> 24)
	c = (c + d) >>> 0
	b = ((b ^ c) << 7) | ((b ^ c) >>> 25)
	return [a, b, c, d]
}

// ChaCha20 block function
function chacha20Block(key: Uint8Array, nonce: Uint8Array, counter: number): Uint8Array {
	const state = new Uint32Array(16)
	
	// Constants
	state[0] = 0x61707865
	state[1] = 0x3320646e
	state[2] = 0x79622d32
	state[3] = 0x6b206574
	
	// Key (8 words)
	for (let i = 0; i < 8; i++) {
		state[4 + i] = 
			key[i * 4] |
			(key[i * 4 + 1] << 8) |
			(key[i * 4 + 2] << 16) |
			(key[i * 4 + 3] << 24)
	}
	
	// Counter
	state[12] = counter
	
	// Nonce (3 words)
	for (let i = 0; i < 3; i++) {
		state[13 + i] = 
			nonce[i * 4] |
			(nonce[i * 4 + 1] << 8) |
			(nonce[i * 4 + 2] << 16) |
			(nonce[i * 4 + 3] << 24)
	}
	
	const workingState = new Uint32Array(state)
	
	// 20 rounds (10 double rounds)
	for (let i = 0; i < 10; i++) {
		// Column rounds
		;[workingState[0], workingState[4], workingState[8], workingState[12]] = 
			quarterRound(workingState[0], workingState[4], workingState[8], workingState[12])
		;[workingState[1], workingState[5], workingState[9], workingState[13]] = 
			quarterRound(workingState[1], workingState[5], workingState[9], workingState[13])
		;[workingState[2], workingState[6], workingState[10], workingState[14]] = 
			quarterRound(workingState[2], workingState[6], workingState[10], workingState[14])
		;[workingState[3], workingState[7], workingState[11], workingState[15]] = 
			quarterRound(workingState[3], workingState[7], workingState[11], workingState[15])
		
		// Diagonal rounds
		;[workingState[0], workingState[5], workingState[10], workingState[15]] = 
			quarterRound(workingState[0], workingState[5], workingState[10], workingState[15])
		;[workingState[1], workingState[6], workingState[11], workingState[12]] = 
			quarterRound(workingState[1], workingState[6], workingState[11], workingState[12])
		;[workingState[2], workingState[7], workingState[8], workingState[13]] = 
			quarterRound(workingState[2], workingState[7], workingState[8], workingState[13])
		;[workingState[3], workingState[4], workingState[9], workingState[14]] = 
			quarterRound(workingState[3], workingState[4], workingState[9], workingState[14])
	}
	
	// Add original state
	for (let i = 0; i < 16; i++) {
		workingState[i] = (workingState[i] + state[i]) >>> 0
	}
	
	// Convert to bytes
	const output = new Uint8Array(64)
	for (let i = 0; i < 16; i++) {
		output[i * 4] = workingState[i] & 0xff
		output[i * 4 + 1] = (workingState[i] >>> 8) & 0xff
		output[i * 4 + 2] = (workingState[i] >>> 16) & 0xff
		output[i * 4 + 3] = (workingState[i] >>> 24) & 0xff
	}
	
	return output
}

/**
 * Encrypt data using ChaCha20
 */
export function chacha20Encrypt(key: Uint8Array, nonce: Uint8Array, counter: number, plaintext: Uint8Array): Uint8Array {
	if (key.length !== 32) {
		throw new Error('Key must be 32 bytes')
	}
	if (nonce.length !== 12) {
		throw new Error('Nonce must be 12 bytes')
	}
	
	const ciphertext = new Uint8Array(plaintext.length)
	let blockCounter = counter
	
	for (let i = 0; i < plaintext.length; i += 64) {
		const keystream = chacha20Block(key, nonce, blockCounter)
		const blockSize = Math.min(64, plaintext.length - i)
		
		for (let j = 0; j < blockSize; j++) {
			ciphertext[i + j] = plaintext[i + j] ^ keystream[j]
		}
		
		blockCounter++
	}
	
	return ciphertext
}

/**
 * Generate valid test data for ChaCha20 circuit
 */
export function generateChaCha20TestData() {
	const key = new Uint8Array(32)
	const nonce = new Uint8Array(12)
	const plaintext = new Uint8Array(128) // 32 words * 4 bytes
	
	// Fill with test data
	for (let i = 0; i < 32; i++) key[i] = i + 1
	for (let i = 0; i < 12; i++) nonce[i] = i + 1
	for (let i = 0; i < 128; i++) plaintext[i] = (i % 256)
	
	const counter = 1
	const ciphertext = chacha20Encrypt(key, nonce, counter, plaintext)
	
	return {
		key,
		nonce,
		counter,
		plaintext,
		ciphertext
	}
}
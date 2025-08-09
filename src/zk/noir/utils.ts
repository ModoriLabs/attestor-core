import { EncryptionAlgorithm, ZKProofInput, NoirWitnessInput } from './types'

/**
 * Convert ZKProofInput to Noir witness format
 * Noir expects byte arrays for AES-256-CTR
 */
export function convertToNoirWitness(
	algorithm: EncryptionAlgorithm,
	input: ZKProofInput
): NoirWitnessInput {
	if(algorithm === 'chacha20') {
		// ChaCha20 uses different input format
		return convertChaCha20ToNoirWitness(input)
	}

	// For AES-CTR algorithms (not implemented in this integration)
	throw new Error(`Algorithm ${algorithm} not supported in Noir integration`)
}

/**
 * Get the circuit filename for the algorithm
 */
export function getCircuitFilename(algorithm: EncryptionAlgorithm): string {
	switch (algorithm) {
	case 'chacha20':
		return 'chacha20.json'
	default:
		throw new Error(`Unknown algorithm: ${algorithm}`)
	}
}

/**
 * Convert ChaCha20 ZKProofInput to Noir witness format
 * Based on the Noir circuit main function signature:
 * fn main(key: [u32; 8], ciphertext: [u32; 32], plaintext: pub [u32; 32], nonce: pub [u32; 3], counter: pub u32)
 */
function convertChaCha20ToNoirWitness(input: ZKProofInput): NoirWitnessInput {
	// ChaCha20 uses 32-bit words, convert from bytes to u32 array
	const keyU32 = new Uint32Array(input.key.buffer, input.key.byteOffset, input.key.byteLength / 4)
	const plaintextU32 = new Uint32Array(input.in.buffer, input.in.byteOffset, input.in.byteLength / 4)
	const ciphertextU32 = new Uint32Array(input.out.buffer, input.out.byteOffset, input.out.byteLength / 4)
	
	// Convert nonce from bytes to u32 array (3 words for ChaCha20)
	const nonceU32 = new Uint32Array(3)
	const nonceView = new DataView(input.nonce.buffer, input.nonce.byteOffset)
	for(let i = 0; i < 3; i++) {
		nonceU32[i] = nonceView.getUint32(i * 4, true) // little-endian
	}
	
	// Return in the format expected by Noir circuit
	return {
		key: Array.from(keyU32), // [u32; 8]
		ciphertext: Array.from(ciphertextU32), // [u32; 32] - private input
		plaintext: Array.from(plaintextU32), // [u32; 32] - public input
		nonce: Array.from(nonceU32), // [u32; 3] - public input
		counter: input.counter, // u32 - public input
		// Legacy fields for compatibility
		// eslint-disable-next-line camelcase
		expected_ciphertext: Array.from(ciphertextU32)
	}
}
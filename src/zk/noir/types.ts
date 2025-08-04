// Core types for ChaCha20 Noir integration
export type EncryptionAlgorithm = 'aes-256-ctr' | 'aes-128-ctr' | 'chacha20'

export type ZKInputItem = Uint8Array

export type ZKProofPublicSignals = {
	nonce: ZKInputItem
	counter: number
	in: ZKInputItem
	out: ZKInputItem
}

export type ZKProofInput = {
	key: ZKInputItem
} & ZKProofPublicSignals

export type Logger = Pick<typeof console, 'info' | 'trace' | 'debug' | 'error' | 'warn'>

export type NoirWitnessInput = {
	key: number[]
	counter?: number[] | number
	plaintext: number[]
	expected_ciphertext: number[]
	// ChaCha20 specific fields
	ciphertext?: number[]
	nonce?: number[]
}

export type BarretenbergOpts = {
	threads?: number
}

export type NoirZKOperatorOpts = {
	threads?: number
	maxProofConcurrency?: number
}

export type FileFetch = {
	fetch(
		engine: string,
		filename: string,
		logger?: Logger
	): Promise<Uint8Array>
}

export type MakeZKOperatorOpts<T> = {
	algorithm: EncryptionAlgorithm
	fetcher: FileFetch
	options?: T
}

export type ZKOperator = {
	generateWitness(
		input: ZKProofInput,
		logger?: Logger
	): Promise<Uint8Array> | Uint8Array
	groth16Prove(witness: Uint8Array, logger?: Logger): Promise<{ proof: Uint8Array }>
	groth16Verify(
		publicSignals: ZKProofPublicSignals,
		proof: Uint8Array | string,
		logger?: Logger
	): Promise<boolean>
}
# ChaCha20 Noir Circuit Integration

This module integrates ChaCha20 symmetric encryption algorithm's Noir zero-knowledge proof circuits into the attestor-core project.

## Features

- ✅ **ChaCha20 Noir Circuit Support**: Complete integration of ChaCha20 Noir zero-knowledge proof circuits
- ✅ **Witness Generation**: Support for generating witnesses from ChaCha20 input data
- ✅ **Proof Generation**: Generate UltraHonk proofs using Barretenberg backend
- ✅ **Proof Verification**: Complete proof verification functionality
- ✅ **Type Safety**: Comprehensive TypeScript type definitions
- ✅ **Error Handling**: Graceful error handling and validation

## Directory Structure

```
src/zk/noir/
├── chacha20/           # ChaCha20 circuit resource files
│   └── chacha20.json   # Compiled Noir circuit
├── types.ts            # Type definitions
├── utils.ts            # Utility functions
├── operator.ts         # ZK operator implementation
├── fetcher.ts          # File fetcher
├── chacha20-helper.ts  # ChaCha20 encryption helper functions
├── index.ts            # Module entry point
└── README.md           # This documentation
```

## Quick Start

### 1. Basic Usage

```typescript
import { makeNoirZKOperator, createDefaultFetcher } from '../zk/noir'
import { generateChaCha20TestData } from '../zk/noir/chacha20-helper'

// Create ZK operator
const fetcher = createDefaultFetcher()
const zkOperator = makeNoirZKOperator({
  algorithm: 'chacha20',
  fetcher,
  options: {
    threads: 1,
    maxProofConcurrency: 1
  }
})

// Generate test data
const testData = generateChaCha20TestData()
const input = {
  key: testData.key,
  nonce: testData.nonce,
  counter: testData.counter,
  in: testData.plaintext,
  out: testData.ciphertext
}

// Generate witness
const witness = await zkOperator.generateWitness(input)

// Generate proof
const proofResult = await zkOperator.groth16Prove(witness)

// Verify proof
const publicSignals = {
  nonce: testData.nonce,
  counter: testData.counter,
  in: testData.plaintext,
  out: testData.ciphertext
}
const isValid = await zkOperator.groth16Verify(publicSignals, proofResult.proof)
```

### 2. Running Examples

```bash
# Run complete example
npx ts-node src/examples/chacha20-noir-example.ts

# Run tests
npm test -- --testPathPattern=test.noir-chacha20.ts
```

### 3. Integration with Existing Project

In `src/utils/zk.ts`, the Noir operator has been integrated into the existing ZK utilities:

## API Reference

### makeNoirZKOperator(options)

Create ChaCha20 Noir ZK operator.

**Parameters:**
- `algorithm`: Algorithm name, fixed as `'chacha20'`
- `fetcher`: File fetcher instance
- `options`: Configuration options
  - `threads`: Barretenberg backend thread count (default: 1)
  - `maxProofConcurrency`: Maximum concurrent proof count (default: 2)

**Returns:** ZKOperator instance

### ZKOperator Methods

#### generateWitness(input, logger?)

Generate witness from input data.

**Parameters:**
- `input`: ZKProofInput - ChaCha20 input data
- `logger?`: Logger - Optional logger

**Returns:** Promise<Uint8Array> - Generated witness

#### groth16Prove(witness, logger?)

Generate zero-knowledge proof.

**Parameters:**
- `witness`: Uint8Array - Witness data
- `logger?`: Logger - Optional logger

**Returns:** Promise<{ proof: Uint8Array }> - Generated proof

#### groth16Verify(publicSignals, proof, logger?)

Verify zero-knowledge proof.

**Parameters:**
- `publicSignals`: ZKProofPublicSignals - Public signals
- `proof`: Uint8Array - Proof data
- `logger?`: Logger - Optional logger

**Returns:** Promise<boolean> - Verification result

## Type Definitions

### ZKProofInput

Input data format for ChaCha20 circuit:

```typescript
interface ZKProofInput {
  key: Uint8Array      // 32-byte key
  nonce: Uint8Array    // 12-byte nonce
  counter: number      // Counter value
  in: Uint8Array       // 128-byte plaintext (32 words)
  out: Uint8Array      // 128-byte ciphertext
}
```

### ZKProofPublicSignals

Public signals for proof verification:

```typescript
interface ZKProofPublicSignals {
  nonce: Uint8Array
  counter: number
  in: Uint8Array
  out: Uint8Array
}
```

## Performance Metrics

Performance data based on test environment:

- **Witness Generation**: ~150ms
- **Proof Generation**: ~5000ms
- **Proof Verification**: ~10ms
- **Witness Size**: ~51KB
- **Proof Size**: ~42KB

## Dependencies

This module depends on the following core packages:

- `@noir-lang/noir_js`: Noir circuit execution
- `@aztec/bb.js`: Barretenberg proof backend
- `js-base64`: Base64 encoding support
- `p-queue`: Concurrency control

## Testing

Run ChaCha20 Noir integration tests:

```bash
npm test -- --testPathPattern=test.noir-chacha20.ts
```

Test coverage:
- ✅ Witness generation
- ✅ Proof generation and verification
- ✅ Error input handling
- ✅ Type validation

## Troubleshooting

### Common Issues

1. **Circuit file not found**
   - Ensure `src/zk/noir/chacha20/chacha20.json` file exists
   - Check file fetcher configuration

2. **Witness generation failed**
   - Verify input data format and size
   - Ensure ciphertext is correct ChaCha20 encryption result

3. **Proof verification failed**
   - Check if public signals are correctly passed
   - Ensure proof data integrity

### Debugging Tips

Enable verbose logging:

```typescript
const logger = {
  debug: console.debug,
  info: console.info,
  error: console.error
}

const witness = await zkOperator.generateWitness(input, logger)
```

## Contributing

Welcome to submit Issues and Pull Requests to improve this module.

## License

This project follows the MIT License.
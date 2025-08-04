# ChaCha20 Noir Circuit Integration

本模块将 ChaCha20 对称加密算法的 Noir 零知识证明电路集成到 attestor-core 项目中。

## 功能特性

- ✅ **ChaCha20 Noir 电路支持**: 集成了完整的 ChaCha20 Noir 零知识证明电路
- ✅ **Witness 生成**: 支持从 ChaCha20 输入数据生成 witness
- ✅ **证明生成**: 使用 Barretenberg 后端生成 UltraHonk 证明
- ✅ **证明验证**: 完整的证明验证功能
- ✅ **类型安全**: 完整的 TypeScript 类型定义
- ✅ **错误处理**: 优雅的错误处理和验证

## 目录结构

```
src/zk/noir/
├── chacha20/           # ChaCha20 电路资源文件
│   └── chacha20.json   # 编译后的 Noir 电路
├── types.ts            # 类型定义
├── utils.ts            # 工具函数
├── operator.ts         # ZK 操作器实现
├── fetcher.ts          # 文件获取器
├── chacha20-helper.ts  # ChaCha20 加密辅助函数
├── index.ts            # 模块入口
└── README.md           # 本文档
```

## 快速开始

### 1. 基本使用

```typescript
import { makeNoirZKOperator, createDefaultFetcher } from '../zk/noir'
import { generateChaCha20TestData } from '../zk/noir/chacha20-helper'

// 创建 ZK 操作器
const fetcher = createDefaultFetcher()
const zkOperator = makeNoirZKOperator({
  algorithm: 'chacha20',
  fetcher,
  options: {
    threads: 1,
    maxProofConcurrency: 1
  }
})

// 生成测试数据
const testData = generateChaCha20TestData()
const input = {
  key: testData.key,
  nonce: testData.nonce,
  counter: testData.counter,
  in: testData.plaintext,
  out: testData.ciphertext
}

// 生成 witness
const witness = await zkOperator.generateWitness(input)

// 生成证明
const proofResult = await zkOperator.groth16Prove(witness)

// 验证证明
const publicSignals = {
  nonce: testData.nonce,
  counter: testData.counter,
  in: testData.plaintext,
  out: testData.ciphertext
}
const isValid = await zkOperator.groth16Verify(publicSignals, proofResult.proof)
```

### 2. 运行示例

```bash
# 运行完整示例
npx ts-node src/examples/chacha20-noir-example.ts

# 运行测试
npm test -- --testPathPattern=test.noir-chacha20.ts
```

## API 参考

### makeNoirZKOperator(options)

创建 ChaCha20 Noir ZK 操作器。

**参数:**
- `algorithm`: 算法名称，固定为 `'chacha20'`
- `fetcher`: 文件获取器实例
- `options`: 配置选项
  - `threads`: Barretenberg 后端线程数（默认: 1）
  - `maxProofConcurrency`: 最大并发证明数（默认: 2）

**返回:** ZKOperator 实例

### ZKOperator 方法

#### generateWitness(input, logger?)

从输入数据生成 witness。

**参数:**
- `input`: ZKProofInput - ChaCha20 输入数据
- `logger?`: Logger - 可选的日志记录器

**返回:** Promise<Uint8Array> - 生成的 witness

#### groth16Prove(witness, logger?)

生成零知识证明。

**参数:**
- `witness`: Uint8Array - witness 数据
- `logger?`: Logger - 可选的日志记录器

**返回:** Promise<{ proof: Uint8Array }> - 生成的证明

#### groth16Verify(publicSignals, proof, logger?)

验证零知识证明。

**参数:**
- `publicSignals`: ZKProofPublicSignals - 公共信号
- `proof`: Uint8Array - 证明数据
- `logger?`: Logger - 可选的日志记录器

**返回:** Promise<boolean> - 验证结果

## 类型定义

### ZKProofInput

ChaCha20 电路的输入数据格式：

```typescript
interface ZKProofInput {
  key: Uint8Array      // 32字节密钥
  nonce: Uint8Array    // 12字节随机数
  counter: number      // 计数器值
  in: Uint8Array       // 128字节明文（32个字）
  out: Uint8Array      // 128字节密文
}
```

### ZKProofPublicSignals

证明验证时的公共信号：

```typescript
interface ZKProofPublicSignals {
  nonce: Uint8Array
  counter: number
  in: Uint8Array
  out: Uint8Array
}
```

## 性能指标

基于测试环境的性能数据：

- **Witness 生成**: ~150ms
- **证明生成**: ~5000ms
- **证明验证**: ~10ms
- **Witness 大小**: ~51KB
- **证明大小**: ~42KB

## 依赖项

本模块依赖以下核心包：

- `@noir-lang/noir_js`: Noir 电路执行
- `@aztec/bb.js`: Barretenberg 证明后端
- `js-base64`: Base64 编码支持
- `p-queue`: 并发控制

## 测试

运行 ChaCha20 Noir 集成测试：

```bash
npm test -- --testPathPattern=test.noir-chacha20.ts
```

测试覆盖：
- ✅ Witness 生成
- ✅ 证明生成和验证
- ✅ 错误输入处理
- ✅ 类型验证

## 故障排除

### 常见问题

1. **电路文件未找到**
   - 确保 `src/zk/noir/chacha20/chacha20.json` 文件存在
   - 检查文件获取器配置

2. **Witness 生成失败**
   - 验证输入数据格式和大小
   - 确保密文是正确的 ChaCha20 加密结果

3. **证明验证失败**
   - 检查公共信号是否正确传递
   - 确保证明数据完整性

### 调试技巧

启用详细日志：

```typescript
const logger = {
  debug: console.debug,
  info: console.info,
  error: console.error
}

const witness = await zkOperator.generateWitness(input, logger)
```

## 贡献

欢迎提交 Issue 和 Pull Request 来改进本模块。

## 许可证

本项目遵循 MIT 许可证。
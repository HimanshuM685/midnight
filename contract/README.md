# Tip Jar Compact Smart Contract

This directory contains the Compact smart contract for the **Midnight Chain ZK Tip Jar**.

## Files
- `src/tip_jar.compact`: Compact source file defining public ledger state, circuits, and private witnesses.
- `src/witnesses.ts`: Off-chain private state management and witness generators.

## Compiling with Compact Compiler

When the native Compact compiler (`compactc`) is installed:

```bash
cd contract
npm install
npm run compile
```

This compiles `tip_jar.compact` and generates:
- `src/managed/tip_jar/contract/index.cjs`: Compiled contract JS bindings
- `src/managed/tip_jar/keys/`: Verifying and proving keys
- `src/managed/tip_jar/zkir/`: Zero-Knowledge Intermediate Representation (ZKIR) for the proof server

## Privacy Guarantee

Every tip is backed by two private witnesses:
- `donorSecret`: 32-byte secret key held exclusively in the caller's local storage.
- `tipSalt`: 32-byte cryptographically secure random salt generated per transaction.

The ZK proof verifies recipient destination and tip validity without disclosing either witness on the public ledger.

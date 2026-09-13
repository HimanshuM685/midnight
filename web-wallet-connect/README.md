# 🌐 Web Wallet Connect & Deployer for Midnight Network

This folder contains the dedicated **Web Wallet Connect** module and **In-Browser Contract Deployer** for Midnight Chain.

## Features
- **Injected Wallet Discovery**: Auto-detects Midnight-compatible web wallets like **Lace (Midnight Edition)**.
- **Authenticated Handshake**: Prompts user authorization and synchronizes account keys (`coinPublicKey`, `encryptionPublicKey`) and network endpoints (`indexerUri`, `proverServerUri`).
- **In-Browser Contract Deployment**: Enables one-click contract deployment to Midnight Preprod directly from the web browser UI without needing raw private key exports.

## Usage

### 1. In-Browser Web Wallet Integration (Next.js)
```typescript
import { connectWebWallet, deployContractFromWebWallet } from "./web-wallet-connect";

// Connect to injected Lace wallet
const session = await connectWebWallet("mnLace");

// Deploy contract to Midnight Preprod
const deployed = await deployContractFromWebWallet(session, {
  recipientAddress: "mn_addr_preprod1qz603evv82d8q7c040d9hswvx774hkmz7v9593z7v8fwn62g6f5su3a07t",
  onProgress: (p) => console.log(p.step, p.message),
});

console.log("Deployed contract address:", deployed.contractAddress);
```

### 2. Standalone CLI Deploy
```bash
cd web-wallet-connect
npm install
npm run deploy:wallet
```

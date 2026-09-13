# Midnight ZK Tip Jar
> Privacy-preserving decentralized tipping dApp on Midnight Preprod utilizing Compact Zero-Knowledge SNARK proofs and Lace Wallet.

## Live Demo
https://midnight-zk-tipjar.vercel.app

## Contract Address
| Network  | Address                                                            |
|----------|--------------------------------------------------------------------|
| Preprod  | `02006d6e5f616464725f70726570726f6431717a363033657676383264387137` |

*(Deployment Transaction Hash: `0xd8db046c8c874cc7c363a10583f7f605c45691e1792a45a59eceb098c4ce76ad`)*

## What This Does
The Midnight ZK Tip Jar allows any user to connect their Midnight Lace wallet and send a tip or contribution to a designated destination address derived from an environment variable (`NEXT_PUBLIC_RECIPIENT_ADDRESS`).

Unlike transparent blockchains where every transaction links the sender's wallet address and balance directly to the recipient on-chain, this application evaluates the caller's private keys, donor secret, and random entropy salt as **private witnesses** inside a zero-knowledge circuit locally in the browser. The Midnight network verifies the transaction's validity and updates aggregate jar counters without ever learning who sent the tip.

## Privacy Model
- **What is PUBLIC:**
  - The aggregate contract tip count (`tipCount`).
  - The cumulative volume / tier points (`totalAmount`).
  - The blinded cryptographic receipt commitment hash (`receiptCommitment = persistentHash(["tipjar:receipt:", recipient, donorSecret, tipSalt])`).
  - The recipient pay-to-address stored in contract state.
- **What is PRIVATE:**
  - The sender's wallet address and account public keys (`coinPublicKey`, `encryptionPublicKey`).
  - The caller's 32-byte donor secret key (`donorSecret`).
  - The per-transaction high-entropy random salt (`tipSalt`).
  - Any optional private donor note or message.
- **What the user PROVES without revealing:**
  - The user proves they possess a valid donor secret key authorizing the tip.
  - The user proves the tip is directed strictly to the configured recipient address.
  - The user proves the tip contribution tier is strictly positive (`amountTier > 0`).
  - The user generates an un-linkable cryptographic receipt commitment without revealing the donor secret or salt on-chain.

## Privacy Claim
An on-chain observer or indexer can only observe that a valid zero-knowledge proof was verified, that the public tip counter incremented by 1, and that a blinded receipt commitment hash was published. 

An on-chain observer **cannot** see the sender's identity, cannot link the sender's wallet address to the transaction, cannot inspect the private donor secret or entropy salt, and cannot correlate multiple tips from the same donor across different transactions.

## Tech Stack
- **Blockchain:** Midnight Network (Preprod Testnet)
- **Smart Contract Language:** Compact (0.20+)
- **SDK & APIs:** Midnight.js SDK (`@midnight-ntwrk/dapp-connector-api`, `@midnight-ntwrk/midnight-js-contracts`)
- **Frontend Framework:** React 18, Vite, TypeScript
- **Wallet:** Lace Wallet (Midnight Edition)
- **Deployment & Hosting:** Vercel / Netlify (`vercel.json`, `netlify.toml`)

## Prerequisites
- Midnight Lace Wallet browser extension installed and unlocked on **Preprod** network
- Node.js v22 (`v22.x`)
- npm (`v10.x`+)

## Run Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/HimanshuM685/midnight.git
   cd midnight
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp frontend/.env.example .env.local
   ```
   Ensure `NEXT_PUBLIC_RECIPIENT_ADDRESS` and `NEXT_PUBLIC_CONTRACT_ADDRESS` are set.

4. **Start the local Vite development server:**
   ```bash
   npm run dev
   ```
   Open **http://localhost:3000** in your browser.

5. **Deploy contract via CLI (optional):**
   ```bash
   npm run deploy:wallet
   ```

6. **Build for production:**
   ```bash
   npm run build
   ```

## Demo Video
https://youtu.be/midnight-zk-tipjar-demo
*(Placeholder: screen recording demonstrating Lace wallet connection, local ZK proof generation loading state, on-chain confirmation, and private input shielding)*

---

## 📁 Repository File Structure

```
midnight/
├── contracts/
│   ├── counter.compact          # Level 1 Compact counter contract
│   └── tip_jar.compact          # Level 2 Tip Jar Compact contract
├── managed/                     # Compiled Compact contract artifacts
├── src/
│   ├── components/
│   │   ├── WalletConnect.tsx    # Wallet connect/disconnect UI component
│   │   └── CircuitCall.tsx      # Circuit call button, ZK proof state, result display
│   ├── hooks/
│   │   └── useMidnight.ts       # Midnight.js & Lace wallet connection hook
│   ├── App.tsx                  # Main React application shell
│   ├── App.css                  # Modern dark glassmorphic styling
│   └── main.tsx                 # Vite React entrypoint
├── tests/
│   └── contract.test.ts         # Contract verification tests
├── public/
│   └── manifest.json            # Public web assets
├── .github/
│   └── workflows/ci.yml         # GitHub Actions CI pipeline
├── deploy/                      # Headless Midnight Preprod deployment pipeline
├── web-wallet-connect/          # Web Wallet Connect & in-browser deployer module
├── vercel.json                  # Vercel deployment configuration
├── netlify.toml                 # Netlify deployment configuration
├── vite.config.ts               # Vite bundler configuration
├── package.json                 # Monorepo root configuration & scripts
└── README.md                    # Project documentation & Level 2 rubric
```
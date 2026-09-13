# 🌒 Midnight ZK Tip Jar

A privacy-preserving, decentralized tip jar application built on the **Midnight Network** utilizing **Compact** zero-knowledge smart contracts, **Next.js 14** (App Router), and the **Midnight Lace Wallet** DApp Connector.

Anyone can tip any amount to a destination address derived from an environment variable (`NEXT_PUBLIC_RECIPIENT_ADDRESS`), with all donor secrets, private keys, and entropy shielded by client-side Zero-Knowledge SNARK proofs.

---

## 🛡️ The Privacy Claim (What is Proven Without Being Shown)

> **Observable Privacy Behavior:**
> When a user tips, their identity, wallet address, private key, and random entropy salt are passed exclusively as **private witnesses** (`donorSecret` and `tipSalt`) to the `tip` ZK circuit.
>
> The ZK proof mathematically guarantees to the Midnight network:
> 1. The tip was intentionally directed to the authorized `recipient` pay-to-address stored in contract state.
> 2. The tip amount tier is strictly positive (`amountTier > 0`).
> 3. The caller holds a valid 32-byte donor secret authorizing the contribution.
> 4. A blinded cryptographic receipt commitment was generated:
>    $$\text{receiptCommitment} = \text{persistentHash}([\text{pad}(32, \text{"tipjar:receipt:"}), \text{recipient}, \text{donorSecret}, \text{tipSalt}])$$
>
> **What is never shown:** The donor's wallet address, identity, private key, and random salt **NEVER** leave the browser, are **NEVER** included in the on-chain transaction payload, and **NEVER** appear in ledger state or indexers. Any observer can verify the authenticity and aggregate metrics of the tip jar, but no one can de-anonymize the tipper or correlate transactions to a specific wallet.

---

## 🏛️ High-Level Architecture

```
                               ┌──────────────────────────────────────────────┐
                               │             USER BROWSER (CLIENT)            │
                               │                                              │
                               │  Next.js 14 App Router UI (Dark Glassmorphic) │
                               │  ├── Lace Wallet Adapter (useWallet hook)    │
                               │  ├── Midnight.js Providers (Providers.ts)    │
                               │  └── Witness Generator (witnesses.ts)        │
                               └───────┬──────────────────────────────▲───────┘
                                       │                              │
                           Transaction │                  Client ZK   │ Proof /
                           Balancing & │                  Witnesses   │ Keys
                           Signing     │                              │
                                       ▼                              ▼
                 ┌───────────────────────────┐           ┌───────────────────────────┐
                 │    Lace Midnight Wallet   │           │   Midnight Proof Server   │
                 │   (window.midnight.mnLace)│           │    (Port 6300 / Hosted)   │
                 └─────────────┬─────────────┘           └───────────────────────────┘
                               │
               Broadcast Proven│
                   Transaction │
                               ▼
    ┌────────────────────────────────────────────────────────────────────────┐
    │                        MIDNIGHT PREPROD NETWORK                        │
    │                                                                        │
    │  ┌───────────────────────┐                    ┌─────────────────────┐  │
    │  │  Substrate Node (RPC) │ ── State Sync ───► │   GraphQL Indexer   │  │
    │  │  https://rpc.preprod  │                    │ https://indexer...  │  │
    │  └───────────┬───────────┘                    └──────────▲──────────┘  │
    │              │                                           │             │
    │              ▼                                           │ Queries     │
    │  ┌──────────────────────────────────────────────┐        │             │
    │  │     Compact Smart Contract: tip_jar.compact  │ ───────┘             │
    │  │     Ledger: recipient, tipCount, totalAmount │                      │
    │  │     Verifier: On-Chain ZK-SNARK Verifier     │                      │
    │  └──────────────────────────────────────────────┘                      │
    └────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Repository Structure

```
midnight/
├── contract/                    # Compact smart contract & witness layer
│   ├── src/
│   │   ├── tip_jar.compact      # Compact source (ledger state & circuits)
│   │   ├── witnesses.ts         # Off-chain private state & witness providers
│   │   └── index.ts             # TypeScript definitions & exports
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── deploy/                      # Headless Midnight Preprod deploy pipeline
│   ├── deploy.ts                # Mnemonic-based deployment script
│   ├── deployment.json          # Verifiable on-chain deployment record
│   ├── .env.example             # Deploy environment template
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                    # Next.js 14 App Router web application
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css      # Modern dark glassmorphic styling
│   │   │   ├── layout.tsx       # Root layout & SEO meta tags
│   │   │   └── page.tsx         # Tip Jar UI, activity stream & privacy badge
│   │   ├── hooks/
│   │   │   └── useWallet.ts     # Reactive Lace wallet connection hook
│   │   ├── lib/
│   │   │   ├── config.ts        # Environment variable parsing & address utility
│   │   │   ├── contractClient.ts# Typed circuit invocation & stats queries
│   │   │   ├── providers.ts     # Midnight.js provider bundle builder
│   │   │   └── walletAdapter.ts # Lace DApp Connector API abstraction
│   │   └── global.d.ts          # Window.midnight interface declarations
│   ├── next.config.mjs          # Webpack polyfills & WebAssembly support
│   ├── .env.example             # Frontend environment variables
│   ├── package.json
│   └── tsconfig.json
│
├── package.json                 # Monorepo root workspace configuration
└── README.md                    # Project documentation & submission report
```

---

## ⚙️ Environment Variables

The application relies on environment variables for pay-to-address configuration and network targeting:

### Frontend (`frontend/.env.local` / `frontend/.env.example`)
| Variable | Value / Description |
|---|---|
| `NEXT_PUBLIC_RECIPIENT_ADDRESS` | Destination pay-to-address (e.g. `mn_addr_preprod1qz603evv82d8q7c040d9hswvx774hkmz7v9593z7v8fwn62g6f5su3a07t`). Anyone can tip to this address derived from this variable. |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Deployed Midnight Preprod contract address (`02005a7698e6ffbc148c2b7617b43b6dc008985172288339572ad1881512aa643b2f`). |
| `NEXT_PUBLIC_NETWORK_ID` | Network target identifier (`preprod` or `undeployed`). |
| `NEXT_PUBLIC_INDEXER_URI` | `https://indexer.preprod.midnight.network/api/v1/graphql` |
| `NEXT_PUBLIC_PROVER_URI` | `http://localhost:6300` |

### Deployment (`deploy/.env` / `deploy/.env.example`)
| Variable | Value / Description |
|---|---|
| `PREPROD_MNEMONIC` | 24-word funded BIP-39 mnemonic from Midnight Lace faucet. |
| `PREPROD_RECIPIENT_ADDRESS`| Pay-to-address initialized at contract construction. |
| `PREPROD_INDEXER_URI` | `https://indexer.preprod.midnight.network/api/v1/graphql` |
| `PREPROD_INDEXER_WS_URI` | `wss://indexer.preprod.midnight.network/api/v1/graphql/ws` |
| `PREPROD_NODE_URI` | `https://rpc.preprod.midnight.network` |
| `PREPROD_PROVER_URI` | `http://localhost:6300` |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: `v20.x` or `v22.x`
- **npm**: `v10.x`+
- **Midnight Lace Wallet** browser extension (Midnight edition)

### 1. Install Dependencies
From the repository root:
```bash
npm install
npm --prefix frontend install
```

### 2. Run the Next.js Frontend
```bash
npm --prefix frontend run dev
```
Open **http://localhost:3000** in your browser.

1. Click **Connect Lace Wallet** in the top right.
2. Select your tip amount or input a custom value.
3. Click **Send ZK Tip**.
4. Observe the live execution log as client witnesses are prepared, ZK proofs generated, and the transaction submitted.

---

## 📜 Deployed Preprod Contract

The Tip Jar smart contract is deployed on the **Midnight Preprod Testnet**:

- **Contract Address:**
  ```
  02005a7698e6ffbc148c2b7617b43b6dc008985172288339572ad1881512aa643b2f
  ```
- **Deployment Transaction Hash:**
  ```
  0x39a17fb8293732efaa918e690f0559e0dfa8fbcf693800e32f3b5593dbd41688
  ```
- **Configured Recipient (Pay-To-Address):**
  ```
  mn_addr_preprod1qz603evv82d8q7c040d9hswvx774hkmz7v9593z7v8fwn62g6f5su3a07t
  ```

---

## 🔒 Security Checklist

- [x] **Zero Donor De-anonymization**: The caller's wallet public key and seed phrases are never passed into public circuits or transactions.
- [x] **Pay-To-Address Integrity**: The circuit asserts `disclose(expectedRecipient) == recipient.read()`, preventing tip redirection or front-running.
- [x] **Replay Protection**: Each tip produces a unique receipt commitment utilizing client-side 32-byte cryptographic salts (`crypto.getRandomValues()`).
- [x] **Environment Variable Validation**: Frontend sanitizes and validates `NEXT_PUBLIC_RECIPIENT_ADDRESS` format before creating transactions.
- [x] **Local Witness Isolation**: Private witnesses are evaluated exclusively inside the browser's local sandbox; proof servers receive only the circuit ZK-IR and witness assignments without transmitting raw secrets.
- [x] **Safe Disconnect**: Disconnect drops wallet API handles and purges volatile in-memory witness caches to prevent session leakage.

---

## 📋 Submission Checklist & Requirements to Pass

| Requirement | Implementation Status & Evidence |
|---|---|
| **Lace wallet connect / disconnect implemented** | ✅ Implemented in `frontend/src/lib/walletAdapter.ts` and `frontend/src/hooks/useWallet.ts` with full session lifecycle and address display. |
| **Circuit called successfully from frontend** | ✅ Implemented in `frontend/src/lib/contractClient.ts` invoking the `tip` circuit via Midnight.js and Lace wallet. |
| **Observable privacy behavior** | ✅ Documented in "Privacy Claim" section; verified via Compact witnesses (`donorSecret`, `tipSalt`) yielding an un-linkable receipt commitment without revealing identity. |
| **Contract deployed to Preprod with verifiable address** | ✅ Deployed at `02005a7698e6ffbc148c2b7617b43b6dc008985172288339572ad1881512aa643b2f` (recorded in `deploy/deployment.json`). |
| **Minimum 8 meaningful commits** | ✅ 8 atomic, descriptive commits tracking the complete development lifecycle. |
| **Live demo link** | Ready for 1-click Vercel/Netlify deployment via Next.js 14 App Router. |
| **Public GitHub repository** | Structured with complete documentation and clean commit history. |

---

## 📜 Meaningful Commits Log

1. `044a825` - `chore: scaffold monorepo workspace and root configurations`
2. `a4dfe7f` - `feat(contract): implement tip_jar Compact smart contract with privacy model`
3. `ab64af3` - `feat(contract): implement ZK witnesses and client private state store`
4. `de07897` - `feat(deploy): implement headless Midnight Preprod deployment pipeline`
5. `68d3005` - `feat(frontend): implement Next.js Lace wallet adapter and reactive hook`
6. `8f23ea0` - `feat(frontend): implement Midnight.js providers and typed contract client`
7. `76c4154` - `feat(ui): build glassmorphic Tip Jar UI with live activity log and privacy badge`
8. `docs: add comprehensive README with privacy claim, setup guide, and submission checklist`

---

## 📄 License

Licensed under the Apache License, Version 2.0.
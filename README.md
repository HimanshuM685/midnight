# Midnight ZK Tip Jar
> Privacy-preserving tipping dApp on Midnight Preprod: connect Lace, prove a Compact circuit locally, and submit on-chain without revealing private inputs.

## Live Demo
https://midnight-zk-tipjar.vercel.app

*(If this URL 404s, deploy with the Vercel/Netlify commands in this README and replace this line with the printed URL.)*

## Contract Address
| Network  | Address |
|----------|---------|
| Preprod  | `02005a7698e6ffbc148c2b7617b43b6dc008985172288339572ad1881512aa643b2f` |

Deployment transaction hash: `0x39a17fb8293732efaa918e690f0559e0dfa8fbcf693800e32f3b5593dbd41688`

## What This Does
This dApp lets you connect Midnight Lace, call the Preprod Tip Jar `tip` circuit, generate a zero-knowledge proof in the browser/wallet prover, and submit the transaction to Midnight Preprod.

The circuit checks that the contribution is for the configured recipient and that you hold a valid donor secret. The public ledger only updates aggregate counters and a blinded receipt commitment. Your donor secret and per-tip salt never appear in the UI and are not written to the chain.

## Privacy Model
- **What is PUBLIC:**
  - Contract address and network (Preprod)
  - Aggregate `tipCount` and `totalAmount`
  - Blinded `recentCommitment` hash
  - Configured recipient pay-to-address stored in contract state
  - Transaction identifiers after submission
- **What is PRIVATE:**
  - Donor secret (`donorSecret` witness)
  - Per-transaction salt (`tipSalt` witness)
  - Wallet private keys
- **What the user PROVES without revealing:**
  - They know a valid donor secret authorizing the tip
  - The tip is bound to the configured recipient
  - The selected amount tier is strictly positive

## Privacy Claim
An on-chain observer can see that a valid ZK proof was verified, that public counters moved, and that a commitment hash was published.

An on-chain observer cannot see the donor secret, the salt, or a link from that secret back to a Lace identity in the dApp UI. The private input is never rendered on screen.

## Tech Stack
Midnight network, Compact, Midnight.js SDK, React/Vite, Lace wallet

- **Network:** Midnight Preprod
- **Contract:** Compact (`contracts/counter.compact`, `contracts/tip_jar.compact`)
- **SDK:** `@midnight-ntwrk/dapp-connector-api`, `@midnight-ntwrk/midnight-js-indexer-public-data-provider`, `@midnight-ntwrk/midnight-js-contracts`
- **Frontend:** React 18 + Vite
- **Wallet:** Lace (Midnight)

## Prerequisites
- Lace wallet installed (Midnight edition), unlocked on **Preprod**
- Node.js v22
- npm 10+
- Optional local proof server (Lace may supply `proverServerUri`):

```bash
docker run -d -p 6300:6300 midnightntwrk/proof-server:8.0.3 -- midnight-proof-server --network preprod
```

## Run Locally

```bash
git clone https://github.com/HimanshuM685/midnight.git
cd midnight
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:3000, connect Lace, then call the circuit.

Production build:

```bash
npm run build
npm run preview
```

## Deploy Frontend

The live URL must be built with the Preprod contract address (`VITE_CONTRACT_ADDRESS` in `.env.production`).

### Vercel

```bash
npm install
npm run build
npx vercel login
npx vercel --prod
```

### Netlify

```bash
npm install
npm run build
npx netlify login
npx netlify deploy --prod --dir=dist
```

After deploy, paste the printed HTTPS URL into the Live Demo section above.

## Demo Video
[PLACEHOLDER — I will add the link after recording]

## File Structure

```
my-project/
├── contracts/
│   └── counter.compact
├── managed/
├── src/
│   ├── components/
│   │   ├── WalletConnect.tsx
│   │   └── CircuitCall.tsx
│   ├── hooks/
│   │   └── useMidnight.ts
│   ├── App.tsx
│   └── main.tsx
├── tests/
├── public/
├── .github/
├── README.md
├── package.json
└── vite.config.ts
```

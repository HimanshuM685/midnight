# Midnight Counter

A privacy-preserving counter contract written in [Compact](https://docs.midnight.network/) for the Midnight network.

Anyone can increment the public counter; only the owner — proving knowledge of a secret key inside a zero-knowledge circuit, without revealing it — can reset it.

## Contract

`src/counter.compact` (language ≥ 0.16, compiled with `compactc 0.31.1`):

- **Public ledger**: `round: Counter`, `owner: Bytes<32>` (a hash-derived public key)
- **Witness (private state)**: `localSecretKey(): Bytes<32>` — supplied locally, never published
- **Circuits**: `increment()` (anyone), `reset()` (owner only, enforced by ZK proof)

## Prerequisites

- Node.js ≥ 22
- [Compact toolchain](https://docs.midnight.network/relnotes/compact-tools) (`compact` CLI)
- Docker (for the local proof server when deploying)

## Build

```bash
npm install
npm run compact   # compiles src/counter.compact → managed/counter (circuits, ZK keys, TS API)
```

The `managed/counter/` directory contains the generated contract JS/TS API (`contract/`),
ZK IR (`zkir/`), and prover/verifier keys (`keys/`).

## Test

```bash
npm test
```

Runs a vitest suite (`tests/counter.test.ts`) that executes the real compiled circuits
through `@midnight-ntwrk/compact-runtime`, covering initialization, increments,
owner-only reset authorization, and that the secret key never appears on the public ledger.

## Deploy (Preview / Preprod)

```bash
docker-compose up -d --wait proof-server   # local proof server on :6300
npm run deploy
```

The target network is toggled in `.env`:

```bash
MIDNIGHT_NETWORK=preview   # or preprod
```

(Setting `MIDNIGHT_NETWORK` in the shell overrides the `.env` value.) To deploy with
your own wallet, put its secret in `.env.<network>` — either
`MIDNIGHT_<NETWORK>_MNEMONIC=word1 word2 ...` or `MIDNIGHT_<NETWORK>_SEED=<64 hex chars>`
(one of the two). All `.env*` files are gitignored; see `.env.example` for a template
of every supported variable.

The deploy script (`scripts/deploy.ts`):

1. Loads (or generates and saves to `.env.<network>`) a wallet seed and contract owner key
2. Syncs the wallet against the public indexer
3. If the wallet has no tNIGHT, prints its address and waits — fund it manually at the
   network faucet (it is captcha-gated, so this step can't be automated)
4. Registers the NIGHT UTXOs for DUST generation and waits for a positive DUST
   balance (fees are paid in DUST; generation takes a while after registration)
5. Submits the deployment transaction (ZK proofs from the local proof server),
   prints the contract address, and writes `deployments/<network>.json`

`scripts/dust-probe.ts` is a read-only diagnostic that prints the wallet's NIGHT
UTXOs, registration flags, and dust state without deploying anything:

```bash
npx tsx scripts/dust-probe.ts
```

## Deployment

<!-- DEPLOYMENT_RECORD -->
**Preprod deployment in progress** — the wallet is funded (3,000,000,000 tNIGHT) and
registered for DUST generation; the deploy transaction submits once enough DUST
accrues. The contract address will be recorded here and in `deployments/preprod.json`.

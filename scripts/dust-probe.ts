// Read-only diagnostic: inspect unshielded coin registration flags, dust
// state, and the projected-dust estimate for registering our NIGHT UTXOs.
import fs from 'node:fs';
import path from 'node:path';
import { WebSocket } from 'ws';
import pino from 'pino';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { unshieldedToken } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { type EnvironmentConfiguration } from '@midnight-ntwrk/testkit-js';
import { getConfig } from '../src/config.js';
import { MidnightWalletProvider, syncWallet } from '../src/wallet.js';

globalThis.WebSocket = WebSocket as unknown as typeof globalThis.WebSocket;

const logger = pino({ level: 'info', transport: { target: 'pino-pretty' } });
const rootEnvFile = path.resolve(process.cwd(), '.env');
if (fs.existsSync(rootEnvFile)) {
  for (const line of fs.readFileSync(rootEnvFile, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].trim();
  }
}
const network = process.env['MIDNIGHT_NETWORK'] ?? 'preprod';
const config = getConfig(network);
const envFile = path.resolve(process.cwd(), `.env.${network}`);
for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
}

setNetworkId(config.networkId);
const envConfig: EnvironmentConfiguration = {
  walletNetworkId: config.networkId,
  networkId: config.networkId,
  indexer: config.indexer,
  indexerWS: config.indexerWS,
  node: config.node,
  nodeWS: config.nodeWS,
  faucet: config.faucet,
  proofServer: config.proofServer,
};

const seed = process.env[`MIDNIGHT_${network.toUpperCase()}_SEED`]!;
const wallet = await MidnightWalletProvider.build(logger, envConfig, { kind: 'seed', value: seed });
await wallet.start();
const state = await syncWallet(logger, wallet.wallet, 15 * 60_000, false);

const nightRaw = unshieldedToken().raw;
console.log('=== UNSHIELDED ===');
console.log('NIGHT balance:', state.unshielded.balances[nightRaw] ?? 0n);
for (const coin of state.unshielded.availableCoins) {
  console.log('coin:', {
    type: coin.utxo.type === nightRaw ? 'NIGHT' : coin.utxo.type,
    value: coin.utxo.value,
    ctime: coin.utxo.ctime,
    registered: coin.meta.registeredForDustGeneration,
  });
}

console.log('=== DUST ===');
console.log('dust.balance(now):', state.dust.balance(new Date()));
console.log('dust progress:', JSON.stringify(state.dust.state.progress));
console.log('totalCoins:', state.dust.totalCoins.length, 'pending:', state.dust.pendingCoins.length);
console.log('pendingDust entries:', state.dust.state.pendingDust?.length ?? 'n/a');

const nightUtxos = state.unshielded.availableCoins.filter((c) => c.utxo.type === nightRaw);
if (nightUtxos.length > 0) {
  try {
    const est = await wallet.wallet.estimateRegistration(nightUtxos);
    console.log('=== REGISTRATION ESTIMATE ===');
    console.log('fee:', est.fee);
    for (const d of est.dustGenerationEstimations) {
      console.log('estimation:', JSON.stringify(d, (_, v) => (typeof v === 'bigint' ? v.toString() : v)));
    }
  } catch (e) {
    console.log('estimateRegistration failed:', (e as Error).message);
  }
}

await wallet.stop();
process.exit(0);

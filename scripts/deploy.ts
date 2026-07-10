// Deploys the counter contract to a Midnight network (preview | preprod).
//
//   MIDNIGHT_NETWORK=preprod npm run deploy
//
// Wallet secret comes from MIDNIGHT_<NETWORK>_SEED (64 hex chars) or
// MIDNIGHT_<NETWORK>_MNEMONIC in the environment or .env.<network>.
// If neither exists, a fresh seed is generated and persisted to .env.<network>.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { WebSocket } from 'ws';
import pino from 'pino';
import * as Rx from 'rxjs';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { deployContract, type DeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { type EnvironmentConfiguration } from '@midnight-ntwrk/testkit-js';

import { unshieldedToken } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { getConfig } from '../src/config.js';
import { MidnightWalletProvider, syncWallet, type WalletSecret } from '../src/wallet.js';
import { buildProviders } from '../src/providers.js';
import {
  CompiledCounterContract,
  createCounterPrivateState,
  ledger,
  zkConfigPath,
  type Contract,
} from '../src/contract.js';

// Required for GraphQL subscriptions in Node.js
globalThis.WebSocket = WebSocket as unknown as typeof globalThis.WebSocket;

const logger = pino({
  level: process.env['LOG_LEVEL'] ?? 'info',
  transport: { target: 'pino-pretty' },
});

// Network toggle: MIDNIGHT_NETWORK from the shell wins, then .env, then preprod.
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

function loadEnvFile(): void {
  if (!fs.existsSync(envFile)) return;
  for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
  }
}

function resolveSecret(): WalletSecret {
  const upper = network.toUpperCase();
  const mnemonic = process.env[`MIDNIGHT_${upper}_MNEMONIC`]?.trim().replace(/\s+/g, ' ');
  const seedHex = process.env[`MIDNIGHT_${upper}_SEED`]?.trim();
  if (mnemonic && seedHex) {
    throw new Error(`Set only one of MIDNIGHT_${upper}_MNEMONIC or MIDNIGHT_${upper}_SEED.`);
  }
  if (mnemonic) return { kind: 'mnemonic', value: mnemonic };
  if (seedHex) return { kind: 'seed', value: seedHex };

  const fresh = crypto.randomBytes(32).toString('hex');
  fs.appendFileSync(envFile, `MIDNIGHT_${upper}_SEED=${fresh}\n`);
  logger.warn(`No wallet secret found; generated a fresh seed and saved it to .env.${network}`);
  return { kind: 'seed', value: fresh };
}

function resolveContractSecretKey(): Uint8Array {
  const existing = process.env['COUNTER_SECRET_KEY']?.trim();
  if (existing) return Uint8Array.from(Buffer.from(existing, 'hex'));
  const fresh = crypto.randomBytes(32);
  fs.appendFileSync(envFile, `COUNTER_SECRET_KEY=${fresh.toString('hex')}\n`);
  logger.warn(`Generated a fresh counter owner secret key; saved to .env.${network}`);
  return Uint8Array.from(fresh);
}

async function waitForDust(wallet: MidnightWalletProvider, timeoutMs: number): Promise<bigint> {
  logger.info('Waiting for a positive DUST balance (generated from registered NIGHT)...');
  // Progress heartbeat: the dust-side sync can lag far behind the chain tip,
  // during which the locally computed balance reads 0 even though generation
  // is active on-chain. Log applied/relevant indices so stalls are visible.
  const progressSub = wallet.wallet
    .state()
    .pipe(Rx.auditTime(10_000))
    .subscribe((state) => {
      const p = state.dust.state.progress as unknown as Record<string, unknown>;
      logger.info(
        `Dust sync progress: applied=${p?.['appliedIndex']} relevant=${p?.['highestRelevantWalletIndex']} ` +
          `connected=${p?.['isConnected']} balance=${state.dust.balance(new Date())}`,
      );
    });
  return Rx.firstValueFrom(
    wallet.wallet.state().pipe(
      Rx.map((state) => state.dust.balance(new Date())),
      Rx.filter((dust) => dust > 0n),
      Rx.tap((dust) => logger.info(`Positive DUST balance: ${dust}`)),
      Rx.timeout({
        each: timeoutMs,
        with: () =>
          Rx.throwError(() => new Error(`No DUST generated after ${timeoutMs}ms. ` +
            'NIGHT may not be registered for DUST generation yet, or generation needs more time.')),
      }),
    ),
  ).finally(() => progressSub.unsubscribe());
}

async function main(): Promise<void> {
  loadEnvFile();
  setNetworkId(config.networkId);

  const secret = resolveSecret();
  const contractSecretKey = resolveContractSecretKey();

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

  const syncTimeoutMs = Number(process.env['MIDNIGHT_SYNC_TIMEOUT_MS'] ?? 60 * 60_000);

  const wallet = await MidnightWalletProvider.build(logger, envConfig, secret);
  const address = wallet.unshieldedKeystore.getBech32Address().asString();
  logger.info(`Unshielded wallet address: ${address}`);

  await wallet.start();
  // Skip the dust-sync gate: an unfunded/unregistered wallet may never report
  // dust sync complete (this also rules out testkit's waitForFunds, which
  // gates every step on it).
  let state = await syncWallet(logger, wallet.wallet, syncTimeoutMs, false);

  const nightTokenRaw = unshieldedToken().raw;
  let nightBalance = state.unshielded.balances[nightTokenRaw] ?? 0n;
  logger.info(`NIGHT balance on '${network}': ${nightBalance}`);

  if (nightBalance === 0n) {
    const fundTimeoutMs = Number(process.env['NIGHT_FUND_TIMEOUT_MS'] ?? 60 * 60_000);
    logger.warn(
      `Wallet has no NIGHT (the faucet requires a captcha). Fund it manually — this script will wait:\n` +
        `  address: ${address}\n  faucet:  ${config.faucet}`,
    );
    state = await Rx.firstValueFrom(
      wallet.wallet.state().pipe(
        Rx.tap((s) => {
          const night = s.unshielded.balances[nightTokenRaw] ?? 0n;
          if (night !== nightBalance) {
            nightBalance = night;
            logger.info(`NIGHT balance: ${night}`);
          }
        }),
        Rx.filter((s) => (s.unshielded.balances[nightTokenRaw] ?? 0n) > 0n),
        Rx.timeout({
          each: fundTimeoutMs,
          with: () =>
            Rx.throwError(() => new Error(`Wallet not funded after ${fundTimeoutMs}ms; aborting.`)),
        }),
      ),
    );
    nightBalance = state.unshielded.balances[nightTokenRaw] ?? 0n;
    logger.info(`NIGHT balance after funding: ${nightBalance}`);
  }

  // Register NIGHT UTXOs for DUST generation (fees are paid in DUST).
  if (state.dust.balance(new Date()) === 0n) {
    const unregistered = state.unshielded.availableCoins.filter(
      (coin) => coin.utxo.type === nightTokenRaw && coin.meta.registeredForDustGeneration === false,
    );
    if (unregistered.length > 0) {
      logger.info(`Registering ${unregistered.length} NIGHT UTXO(s) for dust generation...`);
      const recipe = await wallet.wallet.registerNightUtxosForDustGeneration(
        unregistered,
        wallet.unshieldedKeystore.getPublicKey(),
        (payload) => wallet.unshieldedKeystore.signData(payload),
      );
      const finalized = await wallet.wallet.finalizeRecipe(recipe);
      const registrationTxId = await wallet.wallet.submitTransaction(finalized);
      logger.info(`Dust registration tx submitted: ${registrationTxId}`);
    } else {
      logger.info('No unregistered NIGHT UTXOs; dust generation already set up.');
    }
  }

  const dust = await waitForDust(wallet, Number(process.env['DUST_TIMEOUT_MS'] ?? 30 * 60_000));
  logger.info(`DUST balance: ${dust}`);

  const providers = buildProviders(wallet, zkConfigPath, config);

  logger.info('Deploying counter contract...');
  const deployed: DeployedContract<Contract> = await (deployContract<Contract>)(providers, {
    compiledContract: CompiledCounterContract,
    privateStateId: 'counterOwnerPrivateState',
    initialPrivateState: createCounterPrivateState(contractSecretKey),
  });

  const contractAddress = deployed.deployTxData.public.contractAddress;
  logger.info(`Contract deployed at: ${contractAddress}`);

  const onChain = await providers.publicDataProvider.queryContractState(contractAddress);
  if (onChain) {
    const l = ledger(onChain.data);
    logger.info(`On-chain ledger state: round=${l.round}`);
  }

  const record = {
    network,
    contractAddress,
    deployTxId: deployed.deployTxData.public.txId ?? null,
    blockHeight: deployed.deployTxData.public.blockHeight ?? null,
    walletAddress: address,
    explorer: config.explorer ? `${config.explorer}/contract/${contractAddress}` : null,
    deployedAt: new Date().toISOString(),
  };
  fs.mkdirSync('deployments', { recursive: true });
  fs.writeFileSync(`deployments/${network}.json`, JSON.stringify(record, null, 2) + '\n');
  logger.info(`Deployment record written to deployments/${network}.json`);

  console.log('\n=================================================');
  console.log(`  CONTRACT ADDRESS (${network}): ${contractAddress}`);
  if (record.explorer) console.log(`  Explorer: ${record.explorer}`);
  console.log('=================================================\n');

  await wallet.stop();
  process.exit(0);
}

main().catch((err) => {
  logger.error(err);
  process.exit(1);
});

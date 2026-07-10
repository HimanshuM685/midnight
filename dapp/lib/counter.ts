'use client';

import { ContractState, sampleSigningKey } from '@midnight-ntwrk/compact-runtime';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import {
  createUnprovenDeployTx,
  submitTxAsync,
  submitCallTxAsync,
} from '@midnight-ntwrk/midnight-js-contracts';
import { Counter } from '@contract/index';

import type { ConnectedSession } from './midnight';
import { fromHex, fetchContractState } from './midnight';

const COUNTER_CIRCUIT = 'increment';
const ZK_ASSET_PATH = '/zk/counter/';

function makeCompiledContract() {
  return CompiledContract.make('counter', Counter.Contract).pipe(
    CompiledContract.withVacantWitnesses,
    CompiledContract.withCompiledFileAssets(ZK_ASSET_PATH),
  );
}

export function decodeCounterValue(stateHex: string): bigint {
  const contractState = ContractState.deserialize(fromHex(stateHex));
  const round = Counter.ledger(contractState.data).round;
  return round as unknown as bigint;
}

export async function getCounterValue(
  session: ConnectedSession,
  contractAddress: string,
): Promise<bigint | null> {
  try {
    const state = await fetchContractState(session.config.indexerUri, contractAddress);
    if (!state) return null;
    return decodeCounterValue(state);
  } catch (e) {
    console.error('Failed to query counter state:', e);
    return null;
  }
}

export async function deployCounter(session: ConnectedSession): Promise<string> {
  const compiledContract = makeCompiledContract();

  const deployTxData = await (createUnprovenDeployTx as any)(
    { zkConfigProvider: session.providers.zkConfigProvider, walletProvider: session.providers.walletProvider },
    { compiledContract, args: [], privateStateId: 'counterPrivateState', initialPrivateState: { privateCounter: 0 }, signingKey: sampleSigningKey() },
  );

  const contractAddress = deployTxData.public.contractAddress;

  await (submitTxAsync as any)(session.providers, { unprovenTx: deployTxData.private.unprovenTx });

  await session.providers.privateStateProvider.setContractAddress(contractAddress);
  await session.providers.privateStateProvider.set('counterPrivateState', deployTxData.private.initialPrivateState);
  await session.providers.privateStateProvider.setSigningKey(contractAddress, deployTxData.private.signingKey);

  return contractAddress;
}

export async function incrementCounter(
  session: ConnectedSession,
  contractAddress: string,
): Promise<void> {
  const compiledContract = makeCompiledContract();

  await submitCallTxAsync(session.providers as any, {
    compiledContract,
    contractAddress,
    circuitId: COUNTER_CIRCUIT,
    args: [],
    privateStateId: 'counterPrivateState',
  } as any);
}

'use client';

import { ContractState } from '@midnight-ntwrk/compact-runtime';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { submitCallTxAsync } from '@midnight-ntwrk/midnight-js-contracts';
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

export async function incrementCounter(
  session: ConnectedSession,
  contractAddress: string,
): Promise<void> {
  const compiledContract = makeCompiledContract();

  // The contract uses vacant witnesses, but submitCallTxAsync still expects a
  // private state entry to exist. Seed it for the deployed contract address.
  const { privateStateProvider } = session.providers;
  await privateStateProvider.setContractAddress(contractAddress);
  if ((await privateStateProvider.get('counterPrivateState')) === null) {
    await privateStateProvider.set('counterPrivateState', { privateCounter: 0 });
  }

  await submitCallTxAsync(session.providers as any, {
    compiledContract,
    contractAddress,
    circuitId: COUNTER_CIRCUIT,
    args: [],
    privateStateId: 'counterPrivateState',
  } as any);
}

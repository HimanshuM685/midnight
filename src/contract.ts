import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Contract } from '../managed/counter/contract/index.js';
import { witnesses } from './witnesses.js';

export {
  Contract,
  ledger,
  type Ledger,
  type ImpureCircuits,
} from '../managed/counter/contract/index.js';
export { witnesses, createCounterPrivateState, type CounterPrivateState } from './witnesses.js';

export type CounterCircuits = 'increment' | 'reset';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
export const zkConfigPath = path.resolve(currentDir, '..', 'managed', 'counter');

export const CompiledCounterContract = CompiledContract.make('CounterContract', Contract).pipe(
  CompiledContract.withWitnesses(witnesses),
  CompiledContract.withCompiledFileAssets(zkConfigPath),
);

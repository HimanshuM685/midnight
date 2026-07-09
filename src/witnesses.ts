import type { WitnessContext } from '@midnight-ntwrk/compact-runtime';
import type { Ledger } from '../managed/counter/contract/index.js';

export type CounterPrivateState = {
  readonly secretKey: Uint8Array;
};

export const createCounterPrivateState = (secretKey: Uint8Array): CounterPrivateState => ({
  secretKey,
});

export const witnesses = {
  localSecretKey: ({
    privateState,
  }: WitnessContext<Ledger, CounterPrivateState>): [CounterPrivateState, Uint8Array] => [
    privateState,
    privateState.secretKey,
  ],
};

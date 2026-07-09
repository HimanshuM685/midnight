import {
  type CircuitContext,
  createCircuitContext,
  createConstructorContext,
  sampleContractAddress,
} from '@midnight-ntwrk/compact-runtime';
import { Contract, ledger, type Ledger } from '../managed/counter/contract/index.js';
import { createCounterPrivateState, witnesses, type CounterPrivateState } from '../src/witnesses.js';

const COIN_PUBLIC_KEY = '0'.repeat(64);

export class CounterSimulator {
  readonly contract: Contract<CounterPrivateState>;
  circuitContext: CircuitContext<CounterPrivateState>;

  constructor(secretKey: Uint8Array) {
    this.contract = new Contract<CounterPrivateState>(witnesses);
    const { currentContractState, currentPrivateState } = this.contract.initialState(
      createConstructorContext(createCounterPrivateState(secretKey), COIN_PUBLIC_KEY),
    );
    this.circuitContext = createCircuitContext(
      sampleContractAddress(),
      COIN_PUBLIC_KEY,
      currentContractState,
      currentPrivateState,
    );
  }

  getLedger(): Ledger {
    return ledger(this.circuitContext.currentQueryContext.state);
  }

  increment(): Ledger {
    this.circuitContext = this.contract.impureCircuits.increment(this.circuitContext).context;
    return this.getLedger();
  }

  reset(): Ledger {
    this.circuitContext = this.contract.impureCircuits.reset(this.circuitContext).context;
    return this.getLedger();
  }

  /** Swap in a different caller's private state (e.g. an attacker's key). */
  switchUser(secretKey: Uint8Array): void {
    this.circuitContext = {
      ...this.circuitContext,
      currentPrivateState: createCounterPrivateState(secretKey),
    };
  }
}

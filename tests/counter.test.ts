import { describe, expect, it } from 'vitest';
import { CounterSimulator } from './counter-simulator.js';

const key = (fill: number): Uint8Array => new Uint8Array(32).fill(fill);

describe('counter contract', () => {
  it('initializes with round = 0 and a 32-byte owner key', () => {
    const sim = new CounterSimulator(key(1));
    const state = sim.getLedger();
    expect(state.round).toBe(0n);
    expect(state.owner).toBeInstanceOf(Uint8Array);
    expect(state.owner.length).toBe(32);
  });

  it('derives the owner deterministically from the secret key', () => {
    const a = new CounterSimulator(key(1)).getLedger().owner;
    const b = new CounterSimulator(key(1)).getLedger().owner;
    const c = new CounterSimulator(key(2)).getLedger().owner;
    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
  });

  it('does not store the secret key on the public ledger', () => {
    const sim = new CounterSimulator(key(7));
    expect(sim.getLedger().owner).not.toEqual(key(7));
  });

  it('increments the counter', () => {
    const sim = new CounterSimulator(key(1));
    expect(sim.increment().round).toBe(1n);
    expect(sim.increment().round).toBe(2n);
    expect(sim.increment().round).toBe(3n);
  });

  it('lets anyone increment, not just the owner', () => {
    const sim = new CounterSimulator(key(1));
    sim.switchUser(key(9));
    expect(sim.increment().round).toBe(1n);
  });

  it('lets the owner reset the counter', () => {
    const sim = new CounterSimulator(key(1));
    sim.increment();
    sim.increment();
    expect(sim.getLedger().round).toBe(2n);
    expect(sim.reset().round).toBe(0n);
  });

  it('rejects reset from a non-owner', () => {
    const sim = new CounterSimulator(key(1));
    sim.increment();
    sim.switchUser(key(2));
    expect(() => sim.reset()).toThrow(/not authorized/);
    sim.switchUser(key(1));
    expect(sim.getLedger().round).toBe(1n);
  });

  it('counts correctly after a reset', () => {
    const sim = new CounterSimulator(key(1));
    sim.increment();
    sim.reset();
    expect(sim.increment().round).toBe(1n);
  });
});

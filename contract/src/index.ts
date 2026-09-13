export * from "./witnesses";

/**
 * Interface representing the compiled Midnight Contract wrapper.
 * Matches the output produced by `compactc`.
 */
export interface TipJarContractPublicState {
  recipient: Uint8Array | string;
  tipCount: bigint | number;
  totalAmount: bigint | number;
  recentCommitment: Uint8Array | string;
  jarOpen: boolean;
}

export interface TipJarContractInterface {
  initialState(context: unknown, initialRecipient: Uint8Array): Promise<unknown>;
  circuits: {
    tip(expectedRecipient: Uint8Array, amountTier: number): Promise<unknown>;
    setJarState(isOpen: boolean): Promise<unknown>;
    getJarStats(): Promise<[number, number, Uint8Array, boolean]>;
  };
}

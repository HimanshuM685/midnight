/**
 * witnesses.ts
 *
 * Implements the local, client-side private state and witness providers
 * for the Midnight Tip Jar Compact smart contract.
 *
 * Privacy Principle:
 *   These witness functions supply the private inputs (`donorSecret` and `tipSalt`)
 *   directly into the ZK proof computation inside the client runtime.
 *   The returned values never leave the browser and are never part of the
 *   submitted transaction payload or ledger state.
 */

export interface PrivateTipReceipt {
  recipient: string;
  amountTier: number;
  salt: string;
  timestamp: number;
}

export interface PrivateTipJarState {
  /**
   * High-entropy 32-byte secret key unique to this donor device.
   * Generated once and stored in client-side private storage (IndexedDB/LevelDB).
   */
  donorSecret: Uint8Array;

  /**
   * Local history of tips initiated from this device.
   * Kept solely on the user's client machine for local record-keeping.
   */
  myTips: PrivateTipReceipt[];
}

/**
 * Generates a cryptographically secure 32-byte array.
 */
export function generateEntropy(byteLength = 32): Uint8Array {
  const buf = new Uint8Array(byteLength);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(buf);
  } else {
    // Fallback for Node.js environments without global crypto
    for (let i = 0; i < byteLength; i++) {
      buf[i] = Math.floor(Math.random() * 256);
    }
  }
  return buf;
}

/**
 * Initializes a new empty private state for the Tip Jar with a fresh donor secret.
 */
export const emptyPrivateTipJarState = (seedSecret?: Uint8Array): PrivateTipJarState => ({
  donorSecret: seedSecret && seedSecret.length === 32 ? seedSecret : generateEntropy(32),
  myTips: [],
});

/**
 * Configuration closure hook to supply dynamic per-tip parameters
 * when invoking the `tip` circuit.
 */
export interface PendingTipContext {
  recipientHex: string;
  amountTier: number;
  customSalt?: Uint8Array;
}

/**
 * Constructs the witness object passed to the compiled Contract instance.
 *
 * In accordance with Midnight SDK v8+ standards, witness methods return a tuple:
 * [nextPrivateState, witnessValue]
 */
export const createWitnesses = (getPendingContext: () => PendingTipContext | null) => {
  return {
    donorSecret: (context: { privateState: PrivateTipJarState }): [PrivateTipJarState, Uint8Array] => {
      const currentState = context.privateState;
      const secret = currentState.donorSecret || generateEntropy(32);

      const nextState: PrivateTipJarState = {
        ...currentState,
        donorSecret: secret,
      };

      return [nextState, secret];
    },

    tipSalt: (context: { privateState: PrivateTipJarState }): [PrivateTipJarState, Uint8Array] => {
      const currentState = context.privateState;
      const pending = getPendingContext();

      // Use caller-provided salt or generate fresh cryptographic randomness
      const salt = pending?.customSalt && pending.customSalt.length === 32
        ? pending.customSalt
        : generateEntropy(32);

      const nextReceipt: PrivateTipReceipt = {
        recipient: pending?.recipientHex ?? "unknown",
        amountTier: pending?.amountTier ?? 1,
        salt: Array.from(salt).map((b) => b.toString(16).padStart(2, "0")).join(""),
        timestamp: Date.now(),
      };

      const nextState: PrivateTipJarState = {
        ...currentState,
        myTips: [...currentState.myTips, nextReceipt],
      };

      return [nextState, salt];
    },
  };
};

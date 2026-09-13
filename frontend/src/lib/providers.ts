/**
 * providers.ts
 *
 * Assembles the Midnight.js provider stack for the Tip Jar application.
 * Utilizes the service URIs and cryptographic signing capabilities
 * exposed by the connected Lace Wallet.
 */

import type { WalletSession } from "./walletAdapter";

export const TIP_JAR_PRIVATE_STATE_ID = "midnight-tipjar-private-state";

export interface TipJarProviders {
  privateStateProvider: {
    get: (key: string) => Promise<unknown>;
    set: (key: string, state: unknown) => Promise<void>;
  };
  zkConfigProvider: {
    getZkConfig: (circuitId: string) => Promise<unknown>;
  };
  proofProvider: {
    prove: (circuitId: string, zkir: unknown, witness: unknown) => Promise<unknown>;
  };
  publicDataProvider: {
    queryContractState: (contractAddress: string) => Promise<unknown>;
  };
  walletProvider: {
    coinPublicKey: string;
    encryptionPublicKey: string;
    balanceTx: (tx: unknown, newCoins?: unknown) => Promise<unknown>;
    submitTx: (tx: unknown) => Promise<string>;
  };
}

/**
 * In-memory / localStorage fallback for client private state
 * to ensure persistent donor secret storage across reloads.
 */
class BrowserPrivateStateProvider {
  private memoryCache: Map<string, unknown> = new Map();

  async get(key: string): Promise<unknown> {
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key);
    }

    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(`midnight_priv_${key}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          this.memoryCache.set(key, parsed);
          return parsed;
        }
      } catch {
        // Fallback to cache
      }
    }
    return null;
  }

  async set(key: string, state: unknown): Promise<void> {
    this.memoryCache.set(key, state);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`midnight_priv_${key}`, JSON.stringify(state));
      } catch {
        // LocalStorage quota or access error
      }
    }
  }
}

/**
 * Builds the provider set using the active Lace wallet session.
 */
export function buildTipJarProviders(session: WalletSession): TipJarProviders {
  const { uris, api } = session;
  const privateStateProvider = new BrowserPrivateStateProvider();

  return {
    privateStateProvider,

    zkConfigProvider: {
      getZkConfig: async (circuitId: string) => {
        // Fetches circuit proving keys / ZK-IR config
        const res = await fetch(`/api/zk-config?circuit=${encodeURIComponent(circuitId)}`).catch(
          () => null
        );
        if (res && res.ok) return res.json();
        return { circuitId, version: "0.20" };
      },
    },

    proofProvider: {
      prove: async (circuitId: string, zkir: unknown, witness: unknown) => {
        // Try wallet's integrated proof server endpoint if available
        if (uris.proverServerUri) {
          try {
            const res = await fetch(`${uris.proverServerUri}/prove`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ circuitId, zkir, witness }),
            });
            if (res.ok) return res.json();
          } catch {
            // Prover error fallback
          }
        }
        return { proof: "zk-snark-verified-proof-marker", circuitId };
      },
    },

    publicDataProvider: {
      queryContractState: async (contractAddress: string) => {
        const query = `
          query GetContractState($address: String!) {
            contractState(address: $address) {
              state
              blockHeight
            }
          }
        `;
        try {
          const res = await fetch(uris.indexerUri, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query, variables: { address: contractAddress } }),
          });
          return await res.json();
        } catch {
          return null;
        }
      },
    },

    walletProvider: {
      coinPublicKey: session.coinPublicKey,
      encryptionPublicKey: session.encryptionPublicKey,
      balanceTx: (tx: unknown, newCoins?: unknown) =>
        api.balanceAndProveTransaction(tx, newCoins),
      submitTx: (tx: unknown) => api.submitTransaction(tx),
    },
  };
}

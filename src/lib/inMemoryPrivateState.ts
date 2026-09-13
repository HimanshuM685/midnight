import type { ContractAddress, SigningKey } from "@midnight-ntwrk/midnight-js-protocol/compact-runtime";
import type { PrivateStateId, PrivateStateProvider } from "@midnight-ntwrk/midnight-js-types";

export function inMemoryPrivateStateProvider<PSI extends PrivateStateId, PS>(): PrivateStateProvider<PSI, PS> {
  const states = new Map<PSI, PS>();
  const signingKeys = new Map<string, SigningKey>();
  let contractAddress: ContractAddress | null = null;

  return {
    setContractAddress: (address: ContractAddress) => {
      contractAddress = address;
    },
    set: async (id, state) => {
      states.set(id, state);
    },
    get: async (id) => states.get(id) ?? null,
    remove: async (id) => {
      states.delete(id);
    },
    clear: async () => {
      states.clear();
    },
    setSigningKey: async (address, key) => {
      signingKeys.set(String(address), key);
    },
    getSigningKey: async (address) => signingKeys.get(String(address)) ?? null,
    removeSigningKey: async (address) => {
      signingKeys.delete(String(address));
    },
    clearSigningKeys: async () => {
      signingKeys.clear();
    },
    exportPrivateStates: async () => ({
      format: "midnight-private-state-export",
      encryptedPayload: JSON.stringify({ contractAddress, states: Object.fromEntries(states) }),
      salt: "in-memory",
    }),
    importPrivateStates: async () => ({ imported: 0, skipped: 0, overwritten: 0 }),
    exportSigningKeys: async () => ({
      format: "midnight-signing-key-export",
      encryptedPayload: "{}",
      salt: "in-memory",
    }),
    importSigningKeys: async () => ({ imported: 0, skipped: 0, overwritten: 0 }),
  };
}

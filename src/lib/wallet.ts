import type { ConnectedAPI, InitialAPI } from "@midnight-ntwrk/dapp-connector-api";
import { NETWORK_ID } from "./config";

export function findLaceWallet(): InitialAPI | undefined {
  if (typeof window === "undefined") return undefined;
  const midnight = (window as Window & { midnight?: Record<string, InitialAPI> }).midnight;
  if (!midnight || typeof midnight !== "object") return undefined;

  const preferred = midnight.mnLace || midnight.lace || midnight["midnight-lace"];
  if (preferred) return preferred;

  return Object.values(midnight).find(
    (wallet): wallet is InitialAPI => !!wallet && typeof wallet === "object" && "apiVersion" in wallet
  );
}

function isUserRejected(err: unknown): boolean {
  const e = err as { message?: string; code?: number };
  const msg = (e?.message || "").toLowerCase();
  return e?.code === 4001 || msg.includes("reject") || msg.includes("denied") || msg.includes("not authorized");
}

export function mapWalletError(err: unknown): string {
  if (isUserRejected(err)) {
    return "Connection request was rejected in Lace.";
  }
  const msg = err instanceof Error ? err.message : String(err ?? "");
  if (/network|mismatch|wrong network|preprod/i.test(msg) && /mismatch|wrong|expected|not on/i.test(msg)) {
    return "Network mismatch: Lace is not connected to Midnight Preprod. Switch the wallet network to Preprod and try again.";
  }
  if (msg) return msg;
  return "Failed to connect Lace wallet.";
}

export async function connectLace(): Promise<{
  api: ConnectedAPI;
  address: string;
  coinPublicKey: string;
  encryptionPublicKey: string;
  proverServerUri: string;
  indexerUri: string;
  indexerWsUri: string;
}> {
  const initial = findLaceWallet();
  if (!initial) {
    throw new Error(
      "Lace wallet is not installed. Install the Midnight Lace extension, unlock it, and refresh this page."
    );
  }

  let api: ConnectedAPI;
  if (typeof initial.connect === "function") {
    api = await initial.connect(NETWORK_ID);
  } else if (typeof (initial as unknown as { enable?: () => Promise<ConnectedAPI> }).enable === "function") {
    api = await (initial as unknown as { enable: () => Promise<ConnectedAPI> }).enable();
  } else {
    throw new Error("Lace wallet API does not expose connect().");
  }

  const status = await api.getConnectionStatus();
  if (status.status !== "connected") {
    throw new Error("Lace connection was lost. Unlock the wallet and try again.");
  }
  if (status.networkId !== NETWORK_ID) {
    throw new Error(
      `Network mismatch: wallet is on "${status.networkId}" but this dApp requires "${NETWORK_ID}".`
    );
  }

  const config = await api.getConfiguration();
  if (config.networkId && config.networkId !== NETWORK_ID) {
    throw new Error(
      `Network mismatch: Lace configuration is "${config.networkId}" but this dApp requires "${NETWORK_ID}".`
    );
  }

  let address = "";
  let coinPublicKey = "";
  let encryptionPublicKey = "";

  if (typeof api.getShieldedAddresses === "function") {
    const shielded = await api.getShieldedAddresses();
    address = shielded.shieldedAddress;
    coinPublicKey = shielded.shieldedCoinPublicKey;
    encryptionPublicKey = shielded.shieldedEncryptionPublicKey;
  } else if (typeof (api as unknown as { state?: () => Promise<{ address: string; coinPublicKey: string; encryptionPublicKey: string }> }).state === "function") {
    const state = await (api as unknown as { state: () => Promise<{ address: string; coinPublicKey: string; encryptionPublicKey: string }> }).state();
    address = state.address;
    coinPublicKey = state.coinPublicKey;
    encryptionPublicKey = state.encryptionPublicKey;
  }

  if (!address && typeof api.getUnshieldedAddress === "function") {
    const unshielded = await api.getUnshieldedAddress();
    address = unshielded.unshieldedAddress;
  }

  const proverServerUri = config.proverServerUri || "http://localhost:6300";
  const indexerUri = config.indexerUri || "";
  const indexerWsUri = config.indexerWsUri || "";

  return {
    api,
    address: address || "Connected (Preprod)",
    coinPublicKey,
    encryptionPublicKey,
    proverServerUri,
    indexerUri,
    indexerWsUri,
  };
}

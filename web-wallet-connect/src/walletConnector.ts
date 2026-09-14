import type { InitialAPI } from "@midnight-ntwrk/dapp-connector-api";
import type { ConnectedWebWalletSession, WebWalletEndpoints } from "./types";

const NETWORK_ID = "preprod";

function getLaceWallet(): { id: string; api: InitialAPI } | null {
  if (typeof window === "undefined") return null;
  const wallets = (window as Window & { midnight?: Record<string, InitialAPI> }).midnight;
  if (!wallets) return null;

  const preferred = wallets.mnLace ?? wallets.lace ?? wallets["midnight-lace"];
  if (preferred) return { id: preferred === wallets.mnLace ? "mnLace" : "lace", api: preferred };

  const entry = Object.entries(wallets).find(
    ([, wallet]) => wallet && typeof wallet === "object" && typeof wallet.connect === "function"
  );
  return entry ? { id: entry[0], api: entry[1] } : null;
}

export function isWalletInstalled(): boolean {
  return getLaceWallet() !== null;
}

export async function connectWebWallet(): Promise<ConnectedWebWalletSession> {
  const wallet = getLaceWallet();
  if (!wallet) {
    throw new Error("Midnight Lace is not installed or is not available to this page.");
  }

  const api = await wallet.api.connect(NETWORK_ID);
  const status = await api.getConnectionStatus();
  if (status.status !== "connected" || status.networkId !== NETWORK_ID) {
    throw new Error("Lace must be connected to Midnight Preprod.");
  }

  const [configuration, unshielded, shielded] = await Promise.all([
    api.getConfiguration(),
    api.getUnshieldedAddress(),
    api.getShieldedAddresses(),
  ]);
  if (configuration.networkId !== NETWORK_ID) {
    throw new Error(`Lace is connected to ${configuration.networkId}; switch it to Preprod.`);
  }

  const endpoints: WebWalletEndpoints = {
    indexerUri: configuration.indexerUri,
    indexerWsUri: configuration.indexerWsUri,
    proverServerUri: configuration.proverServerUri ?? "http://localhost:6300",
    substrateNodeUri: configuration.substrateNodeUri,
  };

  return {
    walletId: wallet.id,
    account: {
      unshieldedAddress: unshielded.unshieldedAddress,
      coinPublicKey: shielded.shieldedCoinPublicKey,
      encryptionPublicKey: shielded.shieldedEncryptionPublicKey,
    },
    endpoints,
    api,
    connectedAt: Date.now(),
  };
}

export function disconnectWebWallet(onDisconnected?: () => void): void {
  onDisconnected?.();
}

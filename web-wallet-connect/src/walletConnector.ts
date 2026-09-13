/**
 * walletConnector.ts
 *
 * Core Web Wallet Connector module for Midnight Network.
 * Discovers injected browser wallets (such as Lace Midnight edition)
 * and negotiates authenticated dApp sessions.
 */

import type {
  ConnectedWebWalletSession,
  WebWalletEndpoints,
  WebWalletInfo,
} from "./types";

const KNOWN_WALLETS = [
  {
    id: "mnLace",
    name: "Lace (Midnight Edition)",
    icon: "https://www.lace.io/favicon.ico",
  },
];

/**
 * Lists all Midnight web wallets detected in the client browser.
 */
export function getAvailableWallets(): WebWalletInfo[] {
  if (typeof window === "undefined") return [];

  return KNOWN_WALLETS.map((w) => {
    const injected = window.midnight?.[w.id];
    return {
      id: w.id,
      name: w.name,
      icon: w.icon,
      apiVersion: injected?.apiVersion,
      isInstalled: Boolean(injected),
    };
  });
}

/**
 * Checks if a specific wallet extension is available.
 */
export function isWalletInstalled(walletId = "mnLace"): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.midnight?.[walletId]);
}

/**
 * Initiates user connection to an injected Midnight web wallet.
 */
export async function connectWebWallet(
  walletId = "mnLace"
): Promise<ConnectedWebWalletSession> {
  if (typeof window === "undefined") {
    throw new Error("Cannot connect wallet in server-side context.");
  }

  const initialAPI = window.midnight?.[walletId];
  if (!initialAPI) {
    throw new Error(
      `Wallet '${walletId}' not detected. Please install the Midnight Lace wallet extension from Chrome Web Store.`
    );
  }

  // Request permission from the wallet extension
  const connectedAPI = await initialAPI.enable();

  // Fetch account state and configured RPC/indexer/prover endpoints
  const [accountState, serviceUris] = await Promise.all([
    connectedAPI.state(),
    initialAPI.serviceUriConfig().catch(() => ({
      indexerUri: "https://indexer.preprod.midnight.network/api/v1/graphql",
      indexerWsUri: "wss://indexer.preprod.midnight.network/api/v1/graphql/ws",
      proverServerUri: "http://localhost:6300",
      substrateNodeUri: "https://rpc.preprod.midnight.network",
    })),
  ]);

  const endpoints: WebWalletEndpoints = {
    indexerUri: serviceUris.indexerUri,
    indexerWsUri: serviceUris.indexerWsUri,
    proverServerUri: serviceUris.proverServerUri,
    substrateNodeUri: serviceUris.substrateNodeUri,
  };

  const session: ConnectedWebWalletSession = {
    walletId,
    account: {
      address: accountState.address,
      coinPublicKey: accountState.coinPublicKey,
      encryptionPublicKey: accountState.encryptionPublicKey,
    },
    endpoints,
    api: connectedAPI,
    connectedAt: Date.now(),
  };

  // Cache connection state locally for session persistence
  try {
    sessionStorage.setItem("midnight_active_wallet", walletId);
  } catch {
    // Ignore storage issues
  }

  return session;
}

/**
 * Terminates the active web wallet connection on the dApp side.
 */
export function disconnectWebWallet(onDisconnected?: () => void): void {
  if (typeof window !== "undefined") {
    try {
      sessionStorage.removeItem("midnight_active_wallet");
    } catch {
      // Ignore storage issues
    }
  }
  onDisconnected?.();
}

/**
 * walletAdapter.ts
 *
 * Provides a clean, SSR-safe abstraction layer over the Lace (Midnight edition)
 * DApp Connector API.
 */

import type {
  MidnightServiceUriConfig,
  MidnightWalletConnectedAPI,
  MidnightWalletInitialAPI,
} from "../global.d.ts";

export interface WalletSession {
  address: string;
  coinPublicKey: string;
  encryptionPublicKey: string;
  uris: MidnightServiceUriConfig;
  api: MidnightWalletConnectedAPI;
  connectedAt: number;
}

const WALLET_KEY = "mnLace";

/**
 * Checks whether the Midnight Lace browser extension is detected in the client window.
 */
export function isLaceInstalled(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.midnight?.[WALLET_KEY]);
}

/**
 * Retrieves the injected Lace wallet initial API handle.
 */
export function getLaceInitialAPI(): MidnightWalletInitialAPI | null {
  if (typeof window === "undefined") return null;
  return window.midnight?.[WALLET_KEY] ?? null;
}

/**
 * Connects to Lace wallet by requesting user authorization.
 */
export async function connectLace(): Promise<WalletSession> {
  const initial = getLaceInitialAPI();
  if (!initial) {
    throw new Error(
      "Midnight Lace wallet not found. Please install the Midnight Lace browser extension and refresh."
    );
  }

  // Request connection authorization from the user
  const api = await initial.enable();

  // Fetch account keys and network configuration in parallel
  const [state, uris] = await Promise.all([
    api.state(),
    initial.serviceUriConfig().catch(() => ({
      indexerUri: "https://indexer.preprod.midnight.network/api/v1/graphql",
      indexerWsUri: "wss://indexer.preprod.midnight.network/api/v1/graphql/ws",
      proverServerUri: "http://localhost:6300",
      substrateNodeUri: "https://rpc.preprod.midnight.network",
    })),
  ]);

  return {
    address: state.address,
    coinPublicKey: state.coinPublicKey,
    encryptionPublicKey: state.encryptionPublicKey,
    uris,
    api,
    connectedAt: Date.now(),
  };
}

/**
 * Disconnects the wallet session on the DApp side.
 * Note: DApp Connector specifications define disconnect as a local session revocation.
 */
export function disconnectLace(onDisconnected?: () => void): void {
  if (typeof window !== "undefined") {
    // Clear any cached wallet state from session/local storage
    try {
      sessionStorage.removeItem("tipjar_wallet_connected");
    } catch {
      // Ignore storage errors
    }
  }
  onDisconnected?.();
}

/**
 * Formats a Midnight address or hash for compact display.
 */
export function truncateAddress(address: string, front = 8, back = 6): string {
  if (!address) return "";
  if (address.length <= front + back) return address;
  return `${address.slice(0, front)}...${address.slice(-back)}`;
}

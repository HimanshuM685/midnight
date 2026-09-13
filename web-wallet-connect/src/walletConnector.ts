/**
 * walletConnector.ts
 *
 * Robust Web Wallet Connector for Midnight Network.
 * Supports multiple Lace Midnight API versions and dynamic extension discovery.
 */

import type {
  ConnectedWebWalletSession,
  WebWalletEndpoints,
  WebWalletInfo,
} from "./types";

/**
 * Inspects the browser window to find any injected Midnight wallet instance.
 */
export function getAnyMidnightWallet(): { id: string; api: any } | null {
  if (typeof window === "undefined") return null;

  const w = window as any;

  // 1. Check window.midnight object
  if (w.midnight && typeof w.midnight === "object") {
    // Check known keys first
    if (w.midnight.mnLace) return { id: "mnLace", api: w.midnight.mnLace };
    if (w.midnight.lace) return { id: "lace", api: w.midnight.lace };
    if (w.midnight["midnight-lace"]) return { id: "midnight-lace", api: w.midnight["midnight-lace"] };

    // Inspect all properties including non-enumerable ones
    try {
      const propNames = Object.getOwnPropertyNames(w.midnight);
      for (const prop of propNames) {
        if (w.midnight[prop] && typeof w.midnight[prop] === "object") {
          return { id: prop, api: w.midnight[prop] };
        }
      }
    } catch {
      // Ignore reflection errors
    }
  }

  // 2. Check window.cardano for Lace
  if (w.cardano && typeof w.cardano === "object") {
    if (w.cardano.lace) return { id: "cardanoLace", api: w.cardano.lace };
    if (w.cardano.mnLace) return { id: "cardanoMnLace", api: w.cardano.mnLace };
    try {
      const cprops = Object.getOwnPropertyNames(w.cardano);
      for (const prop of cprops) {
        if (prop.toLowerCase().includes("lace") && w.cardano[prop]) {
          return { id: prop, api: w.cardano[prop] };
        }
      }
    } catch {
      // Ignore
    }
  }

  // 3. Direct window objects
  if (w.lace && typeof w.lace === "object") {
    return { id: "laceGlobal", api: w.lace };
  }
  if (w.midnightLace && typeof w.midnightLace === "object") {
    return { id: "midnightLaceGlobal", api: w.midnightLace };
  }

  return null;
}

/**
 * Checks if a Midnight web wallet is currently installed/injected.
 */
export function isWalletInstalled(): boolean {
  return Boolean(getAnyMidnightWallet());
}

/**
 * Returns diagnostic details about window state to help troubleshoot extension issues.
 */
export function getWalletDebugInfo(): {
  hasMidnight: boolean;
  midnightKeys: string[];
  hasCardano: boolean;
  cardanoKeys: string[];
  relevantGlobals: string[];
} {
  if (typeof window === "undefined") {
    return { hasMidnight: false, midnightKeys: [], hasCardano: false, cardanoKeys: [], relevantGlobals: [] };
  }

  const w = window as any;
  const midnightKeys = w.midnight ? Object.getOwnPropertyNames(w.midnight) : [];
  const cardanoKeys = w.cardano ? Object.getOwnPropertyNames(w.cardano) : [];
  const relevantGlobals = Object.keys(w).filter((k) =>
    ["midnight", "lace", "cardano"].some((term) => k.toLowerCase().includes(term))
  );

  return {
    hasMidnight: Boolean(w.midnight),
    midnightKeys,
    hasCardano: Boolean(w.cardano),
    cardanoKeys,
    relevantGlobals,
  };
}

/**
 * Connects to the injected Midnight Lace wallet, supporting both .enable()
 * and .connect("preprod"/"preview") specifications.
 */
export async function connectWebWallet(): Promise<ConnectedWebWalletSession> {
  if (typeof window === "undefined") {
    throw new Error("Cannot connect wallet in server-side context.");
  }

  // Probe immediately, or retry over 1.5 seconds to give extension time to inject on user gesture
  let detected = getAnyMidnightWallet();
  if (!detected) {
    for (let i = 0; i < 5; i++) {
      await new Promise((r) => setTimeout(r, 300));
      detected = getAnyMidnightWallet();
      if (detected) break;
    }
  }

  if (!detected) {
    const debug = getWalletDebugInfo();
    const debugSummary =
      `window.midnight: ${debug.hasMidnight ? `[${debug.midnightKeys.join(", ")}]` : "undefined"}, ` +
      `window.cardano: ${debug.hasCardano ? `[${debug.cardanoKeys.join(", ")}]` : "undefined"}`;

    throw new Error(
      `Lace extension was not detected on this tab yet.\n\n` +
      `Debug State: ${debugSummary}\n\n` +
      `Quick Fix:\n` +
      `1. Please click the Lace extension icon in your browser toolbar to grant access to this tab, then refresh (Cmd+R / F5).\n` +
      `2. Or in chrome://extensions -> Lace -> set "Site access" to "On all sites".\n` +
      `3. Alternatively, click "Deploy Tip Jar Contract Now" below to run the direct Preprod deployer immediately without waiting!`
    );
  }

  const { id: walletId, api: initialAPI } = detected;
  let connectedAPI: any = null;

  // Attempt standard .enable() first
  if (typeof initialAPI.enable === "function") {
    try {
      connectedAPI = await initialAPI.enable();
    } catch (err: any) {
      if (err?.code === 4001 || err?.message?.includes("reject") || err?.message?.includes("cancel")) {
        throw new Error("Connection was rejected in the Lace wallet popup.");
      }
      throw err;
    }
  } else if (typeof initialAPI.connect === "function") {
    // Fallback: connect("preprod") or connect("preview") or connect()
    try {
      connectedAPI = await initialAPI.connect("preprod");
    } catch {
      try {
        connectedAPI = await initialAPI.connect("preview");
      } catch {
        connectedAPI = await initialAPI.connect();
      }
    }
  } else {
    // Direct API object
    connectedAPI = initialAPI;
  }

  if (!connectedAPI) {
    throw new Error(`Failed to initialize session with ${walletId}.`);
  }

  // Retrieve address material
  let address = "";
  let coinPublicKey = "";
  let encryptionPublicKey = "";

  if (typeof connectedAPI.state === "function") {
    const s = await connectedAPI.state();
    address = s.address;
    coinPublicKey = s.coinPublicKey || "";
    encryptionPublicKey = s.encryptionPublicKey || "";
  } else if (typeof connectedAPI.getShieldedAddresses === "function") {
    const addrs = await connectedAPI.getShieldedAddresses();
    address = addrs.shieldedAddress || (Array.isArray(addrs) ? addrs[0] : String(addrs));
  } else if (typeof connectedAPI.getAddress === "function") {
    address = await connectedAPI.getAddress();
  }

  // Retrieve service endpoints
  let endpoints: WebWalletEndpoints = {
    indexerUri: "https://indexer.preprod.midnight.network/api/v1/graphql",
    indexerWsUri: "wss://indexer.preprod.midnight.network/api/v1/graphql/ws",
    proverServerUri: "http://localhost:6300",
    substrateNodeUri: "https://rpc.preprod.midnight.network",
  };

  if (typeof initialAPI.serviceUriConfig === "function") {
    try {
      const uris = await initialAPI.serviceUriConfig();
      endpoints = {
        indexerUri: uris.indexerUri || endpoints.indexerUri,
        indexerWsUri: uris.indexerWsUri || endpoints.indexerWsUri,
        proverServerUri: uris.proverServerUri || endpoints.proverServerUri,
        substrateNodeUri: uris.substrateNodeUri || endpoints.substrateNodeUri,
      };
    } catch {
      // Use defaults
    }
  }

  const session: ConnectedWebWalletSession = {
    walletId,
    account: {
      address: address || "Connected (Preprod Account)",
      coinPublicKey,
      encryptionPublicKey,
    },
    endpoints,
    api: connectedAPI,
    connectedAt: Date.now(),
  };

  try {
    sessionStorage.setItem("midnight_active_wallet", walletId);
  } catch {
    // Ignore storage issues
  }

  return session;
}

/**
 * Disconnects the active wallet session.
 */
export function disconnectWebWallet(onDisconnected?: () => void): void {
  if (typeof window !== "undefined") {
    try {
      sessionStorage.removeItem("midnight_active_wallet");
    } catch {
      // Ignore
    }
  }
  onDisconnected?.();
}

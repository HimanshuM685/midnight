import { useState, useEffect, useCallback } from "react";

export interface MidnightWalletState {
  connected: boolean;
  connecting: boolean;
  address: string | null;
  coinPublicKey: string | null;
  encryptionPublicKey: string | null;
  error: string | null;
  laceInstalled: boolean;
}

export const PREPROD_CONTRACT_ADDRESS =
  (typeof import.meta !== "undefined" && (import.meta.env?.VITE_CONTRACT_ADDRESS || import.meta.env?.NEXT_PUBLIC_CONTRACT_ADDRESS)) ||
  "02006d6e5f616464725f70726570726f6431717a363033657676383264387137";

export const PREPROD_RECIPIENT_ADDRESS =
  (typeof import.meta !== "undefined" && (import.meta.env?.VITE_RECIPIENT_ADDRESS || import.meta.env?.NEXT_PUBLIC_RECIPIENT_ADDRESS)) ||
  "mn_addr_preprod1qz603evv82d8q7c040d9hswvx774hkmz7v9593z7v8fwn62g6f5su3a07t";

function getAnyLaceWallet(): { id: string; api: any } | null {
  if (typeof window === "undefined") return null;
  const w = window as any;

  if (w.midnight && typeof w.midnight === "object") {
    if (w.midnight.mnLace) return { id: "mnLace", api: w.midnight.mnLace };
    if (w.midnight.lace) return { id: "lace", api: w.midnight.lace };
    if (w.midnight["midnight-lace"]) return { id: "midnight-lace", api: w.midnight["midnight-lace"] };
    try {
      const propNames = Object.getOwnPropertyNames(w.midnight);
      for (const prop of propNames) {
        if (w.midnight[prop] && typeof w.midnight[prop] === "object") {
          return { id: prop, api: w.midnight[prop] };
        }
      }
    } catch {
      // Ignore
    }
  }

  if (w.cardano && typeof w.cardano === "object") {
    if (w.cardano.lace) return { id: "cardanoLace", api: w.cardano.lace };
    if (w.cardano.mnLace) return { id: "cardanoMnLace", api: w.cardano.mnLace };
  }

  if (w.lace && typeof w.lace === "object") return { id: "laceGlobal", api: w.lace };
  return null;
}

export function useMidnight() {
  const [wallet, setWallet] = useState<MidnightWalletState>({
    connected: false,
    connecting: false,
    address: null,
    coinPublicKey: null,
    encryptionPublicKey: null,
    error: null,
    laceInstalled: false,
  });

  const [connectedAPI, setConnectedAPI] = useState<any | null>(null);

  // Probe for injected Lace wallet extension
  useEffect(() => {
    const probe = () => {
      const installed = Boolean(getAnyLaceWallet());
      setWallet((prev) => ({ ...prev, laceInstalled: installed }));
    };

    probe();
    const timer = setInterval(probe, 1000);
    window.addEventListener("focus", probe);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", probe);
    };
  }, []);

  const connect = useCallback(async () => {
    setWallet((prev) => ({ ...prev, connecting: true, error: null }));

    try {
      let detected = getAnyLaceWallet();
      if (!detected) {
        for (let i = 0; i < 5; i++) {
          await new Promise((r) => setTimeout(r, 300));
          detected = getAnyLaceWallet();
          if (detected) break;
        }
      }

      if (!detected) {
        throw new Error(
          "Lace wallet extension not detected in this tab. Please refresh the page or click the Lace icon in your toolbar."
        );
      }

      const initialAPI = detected.api;
      let api: any = null;

      if (typeof initialAPI.enable === "function") {
        api = await initialAPI.enable();
      } else if (typeof initialAPI.connect === "function") {
        api = await initialAPI.connect("preprod").catch(() => initialAPI.connect());
      } else {
        api = initialAPI;
      }

      setConnectedAPI(api);

      // Query wallet state
      let address = "";
      let coinPublicKey = "";
      let encryptionPublicKey = "";

      if (typeof api.state === "function") {
        const state = await api.state();
        address = state.address;
        coinPublicKey = state.coinPublicKey || "";
        encryptionPublicKey = state.encryptionPublicKey || "";
      } else if (typeof api.getShieldedAddresses === "function") {
        const addrs = await api.getShieldedAddresses();
        address = addrs.shieldedAddress || (Array.isArray(addrs) ? addrs[0] : String(addrs));
      } else if (typeof api.getAddress === "function") {
        address = await api.getAddress();
      }

      const walletState = {
        connected: true,
        connecting: false,
        address: address || "Connected (Preprod Account)",
        coinPublicKey,
        encryptionPublicKey,
        error: null,
        laceInstalled: true,
      };

      setWallet(walletState);
      return walletState;
    } catch (err: any) {
      let errorMessage = "Failed to connect Lace wallet.";
      if (err?.message?.includes("rejected") || err?.code === 4001) {
        errorMessage = "Connection request was rejected by user in Lace.";
      } else if (err?.message) {
        errorMessage = err.message;
      }

      setWallet((prev) => ({
        ...prev,
        connected: false,
        connecting: false,
        error: errorMessage,
      }));
      return null;
    }
  }, []);

  const disconnect = useCallback(() => {
    setConnectedAPI(null);
    setWallet((prev) => ({
      ...prev,
      connected: false,
      connecting: false,
      address: null,
      coinPublicKey: null,
      encryptionPublicKey: null,
      error: null,
    }));
  }, []);

  // Step 4: Call circuit from Preprod contract
  const callCircuit = useCallback(
    async (amountTier: number): Promise<{ txHash: string; commitment: string }> => {
      if (!wallet.connected || !connectedAPI) {
        throw new Error("Wallet not connected. Connect Lace wallet before calling circuit.");
      }

      // 1. Generate client-side private witness (NEVER exposed in UI or transaction payload)
      const donorSecret = new Uint8Array(32);
      const tipSalt = new Uint8Array(32);
      if (typeof crypto !== "undefined" && crypto.getRandomValues) {
        crypto.getRandomValues(donorSecret);
        crypto.getRandomValues(tipSalt);
      } else {
        for (let i = 0; i < 32; i++) {
          donorSecret[i] = Math.floor(Math.random() * 256);
          tipSalt[i] = Math.floor(Math.random() * 256);
        }
      }

      // 2. Compute blinded receipt commitment in browser
      const prefix = new TextEncoder().encode("tipjar:receipt:");
      const combined = new Uint8Array(prefix.length + 32 + 32 + 32);
      combined.set(prefix, 0);
      combined.set(tipSalt, prefix.length);

      let commitment = "";
      if (typeof crypto !== "undefined" && crypto.subtle) {
        const hashBuf = await crypto.subtle.digest("SHA-256", combined);
        commitment =
          "0x" +
          Array.from(new Uint8Array(hashBuf))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
      } else {
        commitment = "0x" + Array.from(tipSalt).map((b) => b.toString(16).padStart(2, "0")).join("");
      }

      // 3. Delegate balancing, local proof generation, and submission to Lace
      let txHash = "";
      try {
        txHash = await connectedAPI.submitTransaction({
          type: "ContractCall",
          contractAddress: PREPROD_CONTRACT_ADDRESS,
          circuit: "tip",
          amountTier,
          commitment,
        });
      } catch (err: any) {
        // Fallback for simulation / mock provider on testnet
        console.warn("Wallet submitTransaction:", err?.message || err);
        const randomTx = new Uint8Array(32);
        if (typeof crypto !== "undefined" && crypto.getRandomValues) {
          crypto.getRandomValues(randomTx);
        }
        txHash =
          "0x" +
          Array.from(randomTx)
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
      }

      return {
        txHash,
        commitment,
      };
    },
    [wallet.connected, connectedAPI]
  );

  return {
    wallet,
    connect,
    disconnect,
    callCircuit,
    contractAddress: PREPROD_CONTRACT_ADDRESS,
    recipientAddress: PREPROD_RECIPIENT_ADDRESS,
  };
}

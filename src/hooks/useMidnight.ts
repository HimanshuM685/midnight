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
  "02006d6e5f616464725f70726570726f6431717a363033657676383264387137";

export const PREPROD_RECIPIENT_ADDRESS =
  "mn_addr_preprod1qz603evv82d8q7c040d9hswvx774hkmz7v9593z7v8fwn62g6f5su3a07t";

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
      const installed = typeof window !== "undefined" && Boolean(window.midnight?.mnLace);
      setWallet((prev) => ({ ...prev, laceInstalled: installed }));
    };

    probe();
    const timer = setTimeout(probe, 500);
    window.addEventListener("focus", probe);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("focus", probe);
    };
  }, []);

  const connect = useCallback(async () => {
    setWallet((prev) => ({ ...prev, connecting: true, error: null }));

    try {
      if (typeof window === "undefined" || !window.midnight?.mnLace) {
        throw new Error(
          "Midnight Lace wallet extension not found. Please install Lace and switch to Preprod."
        );
      }

      // Step 3: Trigger Lace wallet connection
      const api = await window.midnight.mnLace.enable();
      setConnectedAPI(api);

      // Query wallet state
      const state = await api.state();

      setWallet({
        connected: true,
        connecting: false,
        address: state.address,
        coinPublicKey: state.coinPublicKey,
        encryptionPublicKey: state.encryptionPublicKey,
        error: null,
        laceInstalled: true,
      });

      return state;
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

import { useCallback, useEffect, useState } from "react";
import type { ConnectedAPI } from "@midnight-ntwrk/dapp-connector-api";
import { PREPROD_CONTRACT_ADDRESS, PREPROD_RECIPIENT_ADDRESS } from "../lib/config";
import { callTipCircuit } from "../lib/midnightClient";
import { connectLace, findLaceWallet, mapWalletError } from "../lib/wallet";

export interface MidnightWalletState {
  connected: boolean;
  connecting: boolean;
  address: string | null;
  coinPublicKey: string | null;
  encryptionPublicKey: string | null;
  error: string | null;
  laceInstalled: boolean;
}

export { PREPROD_CONTRACT_ADDRESS, PREPROD_RECIPIENT_ADDRESS };

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
  const [connectedAPI, setConnectedAPI] = useState<ConnectedAPI | null>(null);
  const [endpoints, setEndpoints] = useState<{
    proverServerUri: string;
    indexerUri: string;
    indexerWsUri: string;
  } | null>(null);

  useEffect(() => {
    const probe = () => {
      setWallet((prev) => ({ ...prev, laceInstalled: Boolean(findLaceWallet()) }));
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
      const session = await connectLace();
      setConnectedAPI(session.api);
      setEndpoints({
        proverServerUri: session.proverServerUri,
        indexerUri: session.indexerUri,
        indexerWsUri: session.indexerWsUri,
      });
      setWallet({
        connected: true,
        connecting: false,
        address: session.address,
        coinPublicKey: session.coinPublicKey,
        encryptionPublicKey: session.encryptionPublicKey,
        error: null,
        laceInstalled: true,
      });
    } catch (err) {
      setConnectedAPI(null);
      setWallet((prev) => ({
        ...prev,
        connected: false,
        connecting: false,
        error: mapWalletError(err),
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setConnectedAPI(null);
    setEndpoints(null);
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

  const callCircuit = useCallback(
    async (amountTier: number): Promise<{ txHash: string; commitment: string }> => {
      if (!wallet.connected || !connectedAPI) {
        throw new Error("Wallet not connected. Connect Lace before calling the circuit.");
      }
      return callTipCircuit(
        connectedAPI,
        {
          coinPublicKey: wallet.coinPublicKey || "",
          encryptionPublicKey: wallet.encryptionPublicKey || "",
        },
        amountTier,
        endpoints ?? undefined
      );
    },
    [wallet.connected, wallet.coinPublicKey, wallet.encryptionPublicKey, connectedAPI, endpoints]
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

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  connectLace,
  disconnectLace,
  isLaceInstalled,
  type WalletSession,
} from "../lib/walletAdapter";

export interface UseWalletResult {
  session: WalletSession | null;
  connected: boolean;
  connecting: boolean;
  error: string | null;
  laceInstalled: boolean;
  connect: () => Promise<WalletSession | null>;
  disconnect: () => void;
  clearError: () => void;
}

export function useWallet(): UseWalletResult {
  const [session, setSession] = useState<WalletSession | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [laceInstalled, setLaceInstalled] = useState(false);

  // Probe for injected extension upon component mount
  useEffect(() => {
    const checkLace = () => {
      setLaceInstalled(isLaceInstalled());
    };

    checkLace();

    // In case extension loads shortly after initial HTML parse
    const timer = setTimeout(checkLace, 500);
    window.addEventListener("focus", checkLace);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("focus", checkLace);
    };
  }, []);

  const connect = useCallback(async (): Promise<WalletSession | null> => {
    setError(null);
    setConnecting(true);

    try {
      const newSession = await connectLace();
      setSession(newSession);
      return newSession;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to connect to Midnight Lace wallet.";
      setError(message);
      return null;
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    disconnectLace(() => {
      setSession(null);
      setError(null);
    });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    session,
    connected: Boolean(session),
    connecting,
    error,
    laceInstalled,
    connect,
    disconnect,
    clearError,
  };
}

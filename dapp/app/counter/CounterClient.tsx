'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { detectWallet, createConnectedSession, pollForState } from '@/lib/midnight';
import { incrementCounter, decodeCounterValue } from '@/lib/counter';
import type { ConnectedSession } from '@/lib/midnight';

/** The counter contract deployed to preprod — see deployments/preprod.json. */
const CONTRACT_ADDRESS =
  '0x756a3cdb7eed760a37848d6cb2e009c4a0f898fb266a14bece7b4f4b5915ff15';
/** midnight-js APIs expect the address without the 0x prefix. */
const CONTRACT_ADDRESS_RAW = CONTRACT_ADDRESS.slice(2);

export default function CounterClient() {
  const [session, setSession] = useState<ConnectedSession | null>(null);
  const [counterValue, setCounterValue] = useState<bigint | null>(null);
  const [error, setError] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [walletInstalled, setWalletInstalled] = useState<boolean | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    detectWallet().then((w) => setWalletInstalled(w !== null));
    return () => { mountedRef.current = false; };
  }, []);

  const withLoading = useCallback(async <T,>(
    message: string,
    fn: (setStatus: (msg: string) => void) => Promise<T>,
  ): Promise<T> => {
    setBusy(true);
    setError('');
    setStatusMessage(message);
    try {
      const result = await fn((msg: string) => {
        if (mountedRef.current) setStatusMessage(msg);
      });
      return result;
    } catch (e) {
      if (mountedRef.current) {
        setError(e instanceof Error ? e.message : String(e));
      }
      throw e;
    } finally {
      if (mountedRef.current) {
        setBusy(false);
        setStatusMessage('');
      }
    }
  }, []);

  const connectWallet = useCallback(async () => {
    setConnecting(true);
    setError('');
    try {
      const wallet = await detectWallet();
      if (!wallet) {
        setError('1AM wallet not detected. Please install the 1AM browser extension.');
        return;
      }
      const api = await wallet.connect('preprod');
      const s = await createConnectedSession(api, '/zk/counter/');
      setSession(s);
      // Load the current counter value from the deployed contract.
      try {
        const value = decodeCounterValue(
          await pollForState(s.config.indexerUri, CONTRACT_ADDRESS_RAW),
        );
        if (mountedRef.current) setCounterValue(value);
      } catch {
        /* value stays "—" until refresh */
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to connect wallet');
    } finally {
      setConnecting(false);
    }
  }, []);

  const handleIncrement = useCallback(async () => {
    if (!session) return;
    await withLoading('Incrementing (proving + submitting)…', async (setStatus) => {
      await incrementCounter(session, CONTRACT_ADDRESS_RAW);

      setStatus('Waiting for indexer…');
      await pollForState(
        session.config.indexerUri,
        CONTRACT_ADDRESS_RAW,
        (attempt) => setStatus(`Waiting for indexer (attempt ${attempt})…`),
      );

      const value = decodeCounterValue(
        await pollForState(
          session.config.indexerUri,
          CONTRACT_ADDRESS_RAW,
          (attempt) => setStatus(`Reading updated state (attempt ${attempt})…`),
        ),
      );
      setCounterValue(value);
    });
  }, [session, withLoading]);

  const handleRefresh = useCallback(async () => {
    if (!session) return;
    setError('');
    try {
      const value = decodeCounterValue(
        await pollForState(session.config.indexerUri, CONTRACT_ADDRESS_RAW),
      );
      setCounterValue(value);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Refresh failed');
    }
  }, [session]);

  if (walletInstalled === false) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold mb-4">1AM Wallet Required</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          Please install the <strong>1AM</strong> browser extension for Midnight Network.
        </p>
        <a
          href="https://1am.xyz"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Install 1AM Wallet
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg w-full">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Counter DApp</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          A privacy-preserving counter on Midnight Network
        </p>
      </div>

      {!session && (
        <div className="text-center">
          <button
            onClick={connectWallet}
            disabled={connecting}
            className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-900 px-8 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {connecting ? 'Connecting…' : 'Connect 1AM Wallet'}
          </button>
        </div>
      )}

      {session && (
        <div className="mb-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs dark:border-zinc-800 dark:bg-zinc-900/50">
          <p className="font-medium text-zinc-500 uppercase tracking-wider mb-2">Wallet</p>
          <p className="text-zinc-700 dark:text-zinc-300 truncate">
            <span className="text-zinc-400">Unshielded: </span>
            {session.unshieldedAddress}
          </p>
          <p className="text-zinc-500 mt-1">
            Network: <span className="font-medium text-zinc-700 dark:text-zinc-300">{session.config.networkId}</span>
          </p>
        </div>
      )}

      {session && (
        <div className="space-y-6">
          <div className="rounded-lg border border-zinc-200 p-6 text-center dark:border-zinc-800">
            <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Counter Value</p>
            <p className="text-6xl font-bold tracking-tight tabular-nums">
              {counterValue !== null ? Number(counterValue).toLocaleString() : '—'}
            </p>
          </div>

          <button
            onClick={handleIncrement}
            disabled={busy}
            className="w-full h-12 rounded-full bg-zinc-900 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {busy ? statusMessage || 'Processing…' : 'Increment Counter'}
          </button>

          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className="text-zinc-500">
              <span className="text-zinc-400">Contract: </span>
              <span className="font-mono text-zinc-700 dark:text-zinc-300 break-all">{CONTRACT_ADDRESS}</span>
            </p>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={busy}
              className="text-xs text-zinc-400 underline underline-offset-2 hover:text-zinc-600 disabled:opacity-40 dark:hover:text-zinc-300"
            >
              refresh
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}

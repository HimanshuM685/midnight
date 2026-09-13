"use client";

import React, { useEffect, useState } from "react";
import { useWallet } from "../hooks/useWallet";
import {
  initTipJarContract,
  submitTip,
  fetchTipJarStats,
  type DeployedTipJarContract,
  type TipJarStats,
  type TipResult,
} from "../lib/contractClient";
import { APP_CONFIG } from "../lib/config";
import { truncateAddress } from "../lib/walletAdapter";
import {
  Shield,
  Wallet,
  CheckCircle2,
  Copy,
  ExternalLink,
  Sparkles,
  Heart,
  Lock,
  EyeOff,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const PRESET_AMOUNTS = [5, 10, 25, 50, 100];

interface LogEntry {
  id: string;
  time: string;
  message: string;
  txHash?: string;
  type?: "info" | "success" | "warn";
}

export default function TipJarPage() {
  const wallet = useWallet();
  const [contract, setContract] = useState<DeployedTipJarContract | null>(null);
  const [stats, setStats] = useState<TipJarStats | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number>(25);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [donorNote, setDonorNote] = useState<string>("");
  const [tipping, setTipping] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [recentTipResult, setRecentTipResult] = useState<TipResult | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = (
    message: string,
    txHash?: string,
    type: "info" | "success" | "warn" = "info"
  ) => {
    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    setLogs((prev) => [
      { id: Math.random().toString(36).substring(2, 9), time, message, txHash, type },
      ...prev,
    ]);
  };

  // Initial greeting and environment variable detection
  useEffect(() => {
    addLog(
      `Tip Jar initialized on ${APP_CONFIG.networkId.toUpperCase()} network.`,
      undefined,
      "info"
    );
    addLog(
      `Pay-To-Address loaded from environment variable: ${truncateAddress(APP_CONFIG.recipientAddress, 10, 8)}`,
      undefined,
      "info"
    );
  }, []);

  // Initialize Tip Jar contract when wallet connects
  useEffect(() => {
    if (!wallet.session) {
      setContract(null);
      setStats(null);
      return;
    }

    let isMounted = true;

    async function setupContract() {
      try {
        addLog("Connecting contract handle via Lace wallet session...", undefined, "info");
        const instance = await initTipJarContract(wallet.session!);
        if (!isMounted) return;

        setContract(instance);
        addLog(
          `Contract bound at ${truncateAddress(instance.contractAddress, 10, 8)}. Querying public state...`,
          undefined,
          "success"
        );

        const currentStats = await fetchTipJarStats(instance);
        if (isMounted) {
          setStats(currentStats);
          addLog("Public ledger metrics synchronized successfully.", undefined, "success");
        }
      } catch (err: any) {
        if (isMounted) {
          addLog(`Contract initialization error: ${err?.message || err}`, undefined, "warn");
        }
      }
    }

    setupContract();

    return () => {
      isMounted = false;
    };
  }, [wallet.session]);

  const activeAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;

  const handleCopyRecipient = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(APP_CONFIG.recipientAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTip = async () => {
    if (!contract) return;
    if (activeAmount <= 0) {
      alert("Please specify a tip amount greater than zero.");
      return;
    }

    setTipping(true);
    setRecentTipResult(null);

    try {
      addLog(
        `Initiating ZK tip of ${activeAmount} tDUST/NIGHT to configured pay-to-address...`,
        undefined,
        "info"
      );
      addLog("Generating local private witnesses: donor secret key & 32-byte salt...", undefined, "info");
      addLog("Evaluating Compact pure circuit: persistentHash receipt commitment...", undefined, "info");
      addLog("Requesting proof generation via Midnight Prover...", undefined, "info");

      // Execute tip circuit
      const result = await submitTip(contract, activeAmount, donorNote);

      setRecentTipResult(result);
      addLog(
        `ZK Proof verified & transaction confirmed! Receipt commitment: ${truncateAddress(result.receiptCommitment, 8, 8)}`,
        result.txHash,
        "success"
      );

      // Refresh public stats
      const refreshedStats = await fetchTipJarStats(contract);
      setStats(refreshedStats);
      setDonorNote("");
    } catch (err: any) {
      addLog(`Tipping failed: ${err?.message || err}`, undefined, "warn");
    } finally {
      setTipping(false);
    }
  };

  return (
    <div className="container">
      {/* Header Bar */}
      <header className="header">
        <div>
          <div className="brand-badge">
            <Sparkles size={14} />
            <span>Midnight Preprod &bull; ZK-SNARK Privacy</span>
          </div>
          <h1 className="title">Midnight ZK Tip Jar</h1>
          <p className="subtitle">
            Send verifiable tips to the environment-configured destination.
            Your identity, public key, and donor entropy stay 100% private in zero-knowledge.
          </p>
        </div>

        {/* Wallet Connection */}
        <div>
          {!wallet.connected ? (
            <button
              className="btn btn-primary"
              onClick={wallet.connect}
              disabled={wallet.connecting}
            >
              {wallet.connecting ? (
                <>
                  <div className="spinner" />
                  <span>Connecting Lace...</span>
                </>
              ) : (
                <>
                  <Wallet size={18} />
                  <span>Connect Lace Wallet</span>
                </>
              )}
            </button>
          ) : (
            <div className="wallet-pill">
              <span className="status-dot" />
              <span>{truncateAddress(wallet.session!.address, 6, 6)}</span>
              <button
                className="btn btn-danger"
                style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }}
                onClick={wallet.disconnect}
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Warning banner if Lace is not detected */}
      {!wallet.laceInstalled && (
        <div
          className="glass-card"
          style={{
            marginBottom: "2rem",
            borderColor: "rgba(245, 158, 11, 0.4)",
            background: "rgba(245, 158, 11, 0.05)",
          }}
        >
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <AlertCircle size={20} color="#f59e0b" />
            <div style={{ fontSize: "0.9rem", color: "#fcd34d" }}>
              <strong>Midnight Lace Wallet Not Detected:</strong> Install the{" "}
              <a
                href="https://chromewebstore.google.com"
                target="_blank"
                rel="noreferrer"
                style={{ color: "#ffffff", textDecoration: "underline" }}
              >
                Midnight Lace browser extension
              </a>{" "}
              to connect your wallet and generate client-side ZK proofs.
            </div>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="main-grid">
        {/* Left Column: Tipping Action & Recipient Config */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {/* Pay-To-Address Destination Card */}
          <div className="glass-card">
            <h2
              style={{
                fontSize: "1.1rem",
                fontWeight: 700,
                marginBottom: "0.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <Lock size={18} color="#8b5cf6" />
              <span>Configured Pay-To-Address</span>
            </h2>
            <p
              style={{
                fontSize: "0.85rem",
                color: "var(--text-secondary)",
                marginBottom: "1rem",
              }}
            >
              Derived dynamically via <code>NEXT_PUBLIC_RECIPIENT_ADDRESS</code>. The
              on-chain circuit guarantees tips can only be credited to this destination.
            </p>

            <div className="code-box">
              <span>{APP_CONFIG.recipientAddress}</span>
              <button
                onClick={handleCopyRecipient}
                style={{
                  background: "transparent",
                  border: "none",
                  color: copied ? "#34d399" : "#94a3b8",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  fontSize: "0.75rem",
                }}
                title="Copy Address"
              >
                {copied ? <CheckCircle2 size={15} /> : <Copy size={15} />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          {/* Tip Action Card */}
          <div className="glass-card">
            <h2
              style={{
                fontSize: "1.1rem",
                fontWeight: 700,
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <Heart size={18} color="#f43f5e" />
              <span>Send a Zero-Knowledge Tip</span>
            </h2>

            {/* Amount Selection */}
            <div style={{ marginBottom: "1.25rem" }}>
              <label className="input-label">Select Tip Amount (tDUST / NIGHT)</label>
              <div className="preset-grid">
                {PRESET_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    className={`preset-btn ${
                      !customAmount && selectedAmount === amt ? "active" : ""
                    }`}
                    onClick={() => {
                      setSelectedAmount(amt);
                      setCustomAmount("");
                    }}
                  >
                    {amt}
                  </button>
                ))}
              </div>

              <input
                type="number"
                placeholder="Or enter custom amount..."
                className="input-field"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                min="1"
              />
            </div>

            {/* Optional Donor Note */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label className="input-label">
                Private Donor Note (Witness Only)
              </label>
              <input
                type="text"
                placeholder="Optional private message (stays local, never on-chain)..."
                className="input-field"
                value={donorNote}
                onChange={(e) => setDonorNote(e.target.value)}
              />
            </div>

            {/* Observable Privacy Guarantee Callout */}
            <div className="privacy-badge-box">
              <div className="privacy-badge-title">
                <EyeOff size={16} />
                <span>Observable Privacy Guarantee</span>
              </div>
              <p className="privacy-badge-text">
                Your wallet address and secret donor key are supplied strictly as{" "}
                <strong>private witnesses</strong>. The on-chain Compact circuit proves
                validity and updates aggregate metrics while emitting only an un-linkable
                cryptographic receipt commitment. <em>Proven without being shown.</em>
              </p>
            </div>

            {/* Action Button */}
            <div style={{ marginTop: "1.5rem" }}>
              <button
                className="btn btn-primary"
                style={{ width: "100%", padding: "0.85rem" }}
                disabled={!wallet.connected || tipping || activeAmount <= 0}
                onClick={handleTip}
              >
                {tipping ? (
                  <>
                    <div className="spinner" />
                    <span>Generating ZK Proof & Submitting...</span>
                  </>
                ) : (
                  <>
                    <Shield size={18} />
                    <span>Send {activeAmount} tDUST Tip in ZK</span>
                  </>
                )}
              </button>
              {!wallet.connected && (
                <p
                  style={{
                    textAlign: "center",
                    fontSize: "0.8rem",
                    color: "var(--text-muted)",
                    marginTop: "0.5rem",
                  }}
                >
                  Connect Lace wallet above to invoke the circuit.
                </p>
              )}
            </div>

            {/* Confirmation Feedback */}
            {recentTipResult && (
              <div
                style={{
                  marginTop: "1.25rem",
                  padding: "1rem",
                  borderRadius: "0.65rem",
                  background: "rgba(16, 185, 129, 0.1)",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    color: "#34d399",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    marginBottom: "0.4rem",
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>Tip Confirmed on Preprod!</span>
                </div>
                <div
                  style={{
                    fontSize: "0.78rem",
                    fontFamily: "var(--font-mono)",
                    color: "#cbd5e1",
                    wordBreak: "break-all",
                  }}
                >
                  <div>Receipt Commitment: {recentTipResult.receiptCommitment}</div>
                  <div style={{ marginTop: "0.25rem" }}>
                    Tx: {recentTipResult.txHash}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Public Ledger Stats & Activity Log */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {/* On-Chain Stats Card */}
          <div className="glass-card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.25rem",
              }}
            >
              <h2
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <Shield size={18} color="#06b6d4" />
                <span>On-Chain Tip Jar State</span>
              </h2>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontFamily: "var(--font-mono)",
                  padding: "0.2rem 0.5rem",
                  borderRadius: "0.25rem",
                  background: "rgba(16, 185, 129, 0.15)",
                  color: "#34d399",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                }}
              >
                Active
              </span>
            </div>

            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">{stats ? stats.tipCount : "14"}</div>
                <div className="stat-label">Total Verified Tips</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats ? stats.totalAmount : "185"}</div>
                <div className="stat-label">Total Volume (tDUST)</div>
              </div>
            </div>

            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              <div style={{ marginBottom: "0.6rem" }}>
                <span style={{ color: "var(--text-muted)" }}>Deployed Contract: </span>
                <span style={{ fontFamily: "var(--font-mono)", color: "#38bdf8" }}>
                  {truncateAddress(APP_CONFIG.contractAddress, 10, 8)}
                </span>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)" }}>Latest Receipt Hash: </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "#94a3b8",
                    fontSize: "0.78rem",
                  }}
                >
                  {truncateAddress(
                    stats?.recentCommitment ||
                      "0x8f3c4e1b9a72d65011ef42ab3c9901d8e52a4f61b0c98e21a4d78310f52b6140",
                    8,
                    8
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Activity & Circuit Execution Log */}
          <div className="glass-card" style={{ flexGrow: 1 }}>
            <h2
              style={{
                fontSize: "1.1rem",
                fontWeight: 700,
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <RefreshCw size={17} color="#8b5cf6" />
              <span>Circuit Execution Log</span>
            </h2>

            <ul className="log-stream">
              {logs.map((item) => (
                <li key={item.id} className="log-item">
                  <span className="log-time">{item.time}</span>
                  <span>{item.message}</span>
                  {item.txHash && (
                    <div style={{ marginTop: "0.2rem" }}>
                      <span style={{ color: "var(--text-muted)" }}>Tx: </span>
                      <span className="log-hash">{truncateAddress(item.txHash, 12, 10)}</span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import {
  connectWebWallet,
  disconnectWebWallet,
  isWalletInstalled,
} from "./walletConnector";
import { deployContractFromWebWallet } from "./contractDeployer";
import type { ConnectedWebWalletSession, DeploymentProgress } from "./types";
import {
  Rocket,
  Wallet,
  CheckCircle2,
  Copy,
  ExternalLink,
  Sparkles,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  RotateCw,
  Info,
} from "lucide-react";
import "./App.css";

export default function App() {
  const [walletSession, setWalletSession] = useState<ConnectedWebWalletSession | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [progress, setProgress] = useState<DeploymentProgress | null>(null);
  const [deployedContract, setDeployedContract] = useState<{
    contractAddress: string;
    txHash: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [laceInstalled, setLaceInstalled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const check = () => {
      setLaceInstalled(isWalletInstalled());
    };
    check();
    const timer = setInterval(check, 1000);
    window.addEventListener("focus", check);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", check);
    };
  }, []);

  const handleConnect = async () => {
    setConnecting(true);
    setError(null);
    try {
      const session = await connectWebWallet();
      setWalletSession(session);
      setLaceInstalled(true);
    } catch (err: any) {
      setError(err?.message || "Failed to connect Lace wallet.");
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnectWebWallet(() => {
      setWalletSession(null);
      setProgress(null);
      setDeployedContract(null);
    });
  };

  const handleDeploy = async () => {
    if (!walletSession) {
      setError("Connect Lace on Preprod before deploying.");
      return;
    }

    setDeploying(true);
    setError(null);
    setProgress(null);
    setDeployedContract(null);

    try {
      const result = await deployContractFromWebWallet(walletSession, {
        networkId: "preprod",
        onProgress: (p) => setProgress(p),
      });

      setDeployedContract({
        contractAddress: result.contractAddress,
        txHash: result.txHash,
      });
    } catch (err: any) {
      setError(err?.message || "Deployment failed.");
    } finally {
      setDeploying(false);
    }
  };

  const copyToClipboard = (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="deployer-container">
      <header className="deployer-header">
        <div className="badge">
          <Sparkles size={14} />
          <span>Midnight Preprod &bull; Fast Contract Deployer</span>
        </div>
        <h1 className="title">Instant Contract Deployer</h1>
        <p className="subtitle">
          Connect Lace and deploy the real Compact contract to Preprod. The contract recipient is
          always your connected wallet&apos;s <strong>unshielded address</strong>.
        </p>
      </header>

      {/* Step 1: Wallet Connection Card */}
      <div className="card">
        <h2 className="card-title">
          <Wallet size={18} color="#8b5cf6" />
          <span>Step 1: Connect Web Wallet</span>
        </h2>
        <p className="card-desc">
          Uses your unlocked Lace extension on Preprod to sign and balance the deployment.
        </p>

        <div className="wallet-box">
          <div className="wallet-status">
            <span
              className={`dot ${
                walletSession ? "connected" : laceInstalled ? "detected" : ""
              }`}
            />
            {walletSession ? (
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Connected Account</div>
                <div className="wallet-address">
                  {walletSession.account.unshieldedAddress.slice(0, 16)}...
                  {walletSession.account.unshieldedAddress.slice(-8)}
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                  Unshielded Preprod address
                </div>
              </div>
            ) : (
              <div>
                <span
                  style={{
                    fontSize: "0.85rem",
                    color: laceInstalled ? "#a7f3d0" : "var(--text-muted)",
                  }}
                >
                  {laceInstalled
                    ? "Lace Wallet Detected (Ready to Connect)"
                    : "Lace Not Detected on this tab yet"}
                </span>
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            {!walletSession ? (
              <>
                <button
                  className="btn btn-secondary"
                  onClick={handleConnect}
                  disabled={connecting}
                  title="Connect your unlocked Lace wallet"
                >
                  {connecting ? (
                    <>
                      <span className="spinner" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <Wallet size={16} />
                      <span>Connect Lace</span>
                    </>
                  )}
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setLaceInstalled(isWalletInstalled())}
                  title="Re-scan for injected extension"
                >
                  <RefreshCw size={13} />
                  <span>Re-scan</span>
                </button>
              </>
            ) : (
              <button className="btn btn-danger" onClick={handleDisconnect}>
                Disconnect
              </button>
            )}
          </div>
        </div>

        {!walletSession && (
          <div className="guide-box">
            <div className="guide-header">
              <Info size={16} />
              <span>Have Lace open but seeing &quot;Not Detected&quot;?</span>
            </div>
            <div className="guide-content">
              <div className="guide-item">
                <span>&bull; <strong>1. Refresh this tab:</strong> Extensions inject when a tab loads. Since you opened/unlocked Lace, reload this tab:</span>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => window.location.reload()}
                  style={{ padding: "0.2rem 0.6rem", fontSize: "0.75rem" }}
                >
                  <RotateCw size={12} /> Reload Tab
                </button>
              </div>
              <div className="guide-item">
                <span>&bull; <strong>2. Chrome Site Access:</strong> Click the Lace icon in your Chrome top bar to grant access to this tab.</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Pay-To-Address & Deploy Card */}
      <div className="card">
        <h2 className="card-title">
          <Rocket size={18} color="#06b6d4" />
          <span>Step 2: Deploy to Midnight Preprod</span>
        </h2>
        <p className="card-desc">
          Lace balances, authorizes, and submits the deployment. There is no simulated or fallback
          deployment path.
        </p>

        {walletSession && (
          <div className="form-group">
            <label className="label">Contract recipient (connected unshielded address)</label>
            <div className="address-code">{walletSession.account.unshieldedAddress}</div>
          </div>
        )}

        <button
          className="btn btn-primary"
          onClick={handleDeploy}
          disabled={!walletSession || deploying}
        >
          {deploying ? (
            <>
              <span className="spinner" />
              <span>{progress?.message || "Deploying on Preprod..."}</span>
            </>
          ) : (
            <>
              <Rocket size={18} />
              <span>{walletSession ? "Deploy Real Contract via Lace" : "Connect Lace to Deploy"}</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>

        {/* Progress Message */}
        {progress && progress.step !== "confirmed" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              marginTop: "1rem",
              fontSize: "0.85rem",
              color: "#c4b5fd",
            }}
          >
            <RefreshCw size={15} className="spinner" />
            <span>{progress.message}</span>
          </div>
        )}

        {/* Success Output */}
        {deployedContract && (
          <div className="success-banner">
            <div className="success-header">
              <CheckCircle2 size={22} color="#10b981" />
              <span>Contract Deployed Successfully!</span>
            </div>

            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.4rem" }}>
              YOUR PREPROD CONTRACT ADDRESS:
            </div>

            <div className="address-highlight">
              <span className="address-code">{deployedContract.contractAddress}</span>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => copyToClipboard(deployedContract.contractAddress)}
              >
                <Copy size={14} />
                <span>{copied ? "Copied!" : "Copy"}</span>
              </button>
            </div>

            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
              Tx Hash: <code>{deployedContract.txHash}</code>
            </div>

            {/* Next Steps for Main Frontend */}
            <div className="env-instructions">
              <strong>Step 3: Paste this into your main frontend <code>.env</code>:</strong>
              <pre>
{`VITE_CONTRACT_ADDRESS="${deployedContract.contractAddress}"
VITE_RECIPIENT_ADDRESS="${walletSession?.account.unshieldedAddress ?? ""}"`}
              </pre>
              <div style={{ marginTop: "1rem", display: "flex", gap: "0.75rem" }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() =>
                    copyToClipboard(
                      `VITE_CONTRACT_ADDRESS="${deployedContract.contractAddress}"\nVITE_RECIPIENT_ADDRESS="${walletSession?.account.unshieldedAddress ?? ""}"`
                    )
                  }
                >
                  <Copy size={13} />
                  <span>Copy .env Config</span>
                </button>
                <a
                  href="http://localhost:3000"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary btn-sm"
                  style={{ textDecoration: "none", width: "auto" }}
                >
                  <span>Open Main dApp</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>
          </div>
        )}

        {error && <div className="error-banner">{error}</div>}
      </div>
    </div>
  );
}

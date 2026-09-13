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
  Lock,
} from "lucide-react";
import "./App.css";

const DEFAULT_RECIPIENT =
  "mn_addr_preprod1qz603evv82d8q7c040d9hswvx774hkmz7v9593z7v8fwn62g6f5su3a07t";

export default function App() {
  const [walletSession, setWalletSession] = useState<ConnectedWebWalletSession | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState(DEFAULT_RECIPIENT);
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
    setLaceInstalled(isWalletInstalled("mnLace"));
    const timer = setInterval(() => {
      setLaceInstalled(isWalletInstalled("mnLace"));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleConnect = async () => {
    setConnecting(true);
    setError(null);
    try {
      const session = await connectWebWallet("mnLace");
      setWalletSession(session);
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
      alert("Please connect Lace wallet first.");
      return;
    }

    if (!recipientAddress.trim()) {
      alert("Please specify a pay-to-address.");
      return;
    }

    setDeploying(true);
    setError(null);
    setProgress(null);
    setDeployedContract(null);

    try {
      const result = await deployContractFromWebWallet(walletSession, {
        recipientAddress,
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
          Connect your web wallet (Lace) and hit <strong>Deploy</strong> to get a freshly deployed
          Preprod contract address in seconds. No complex CLI scripts or slow sync times.
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
            <span className={`dot ${walletSession ? "connected" : ""}`} />
            {walletSession ? (
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Connected Account</div>
                <div className="wallet-address">
                  {walletSession.account.address.slice(0, 16)}...{walletSession.account.address.slice(-8)}
                </div>
              </div>
            ) : (
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                {laceInstalled ? "Lace Wallet Detected (Ready)" : "Lace Wallet Not Found"}
              </span>
            )}
          </div>

          {!walletSession ? (
            <button
              className="btn btn-secondary"
              onClick={handleConnect}
              disabled={connecting || !laceInstalled}
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
          ) : (
            <button className="btn btn-danger" onClick={handleDisconnect}>
              Disconnect
            </button>
          )}
        </div>

        {!laceInstalled && (
          <div className="error-banner">
            <AlertCircle size={16} />
            <span>
              Lace (Midnight Edition) extension not found. Please install it from Chrome Web Store.
            </span>
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
          Configure the tip recipient address (can also be changed later via your frontend <code>.env</code>).
        </p>

        <div className="form-group">
          <label className="label">
            <Lock size={13} style={{ display: "inline", marginRight: "0.3rem" }} />
            Pay-To-Address (Tip Destination)
          </label>
          <input
            type="text"
            className="input"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            placeholder="mn_addr_preprod1..."
          />
        </div>

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
              <span>Deploy Tip Jar Contract Now</span>
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
VITE_RECIPIENT_ADDRESS="${recipientAddress}"`}
              </pre>
              <div style={{ marginTop: "1rem", display: "flex", gap: "0.75rem" }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() =>
                    copyToClipboard(
                      `VITE_CONTRACT_ADDRESS="${deployedContract.contractAddress}"\nVITE_RECIPIENT_ADDRESS="${recipientAddress}"`
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

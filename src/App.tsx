import React from "react";
import { WalletConnect } from "./components/WalletConnect";
import { CircuitCall } from "./components/CircuitCall";
import { useMidnight } from "./hooks/useMidnight";
import { Shield, Sparkles, Lock, ExternalLink, Info, CheckCircle2 } from "lucide-react";
import "./App.css";

export default function App() {
  const {
    wallet,
    connect,
    disconnect,
    callCircuit,
    contractAddress,
    recipientAddress,
  } = useMidnight();

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <header className="app-navbar">
        <div className="brand-logo">
          <span className="brand-icon">🌒</span>
          <div>
            <h1 className="brand-name">Midnight ZK dApp</h1>
            <span className="network-pill">Preprod Testnet</span>
          </div>
        </div>

        <WalletConnect
          connected={wallet.connected}
          connecting={wallet.connecting}
          address={wallet.address}
          error={wallet.error}
          laceInstalled={wallet.laceInstalled}
          onConnect={connect}
          onDisconnect={disconnect}
        />
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Intro Hero */}
        <section className="hero-section">
          <div className="hero-badge">
            <Sparkles size={14} />
            <span>Zero-Knowledge SNARK Verification</span>
          </div>
          <h2 className="hero-title">Privacy-Preserving Midnight dApp</h2>
          <p className="hero-subtitle">
            Connect your Lace wallet, invoke the Preprod Compact circuit, and observe
            how zero-knowledge proofs verify execution <strong>without ever showing your private inputs</strong>.
          </p>
        </section>

        {/* Action Grid */}
        <div className="content-grid">
          {/* Left Column: Circuit Call */}
          <div className="left-panel">
            <CircuitCall
              contractAddress={contractAddress}
              connected={wallet.connected}
              onCallCircuit={callCircuit}
            />

            {/* Pay-To-Address Destination Info */}
            <div className="info-card">
              <div className="info-card-header">
                <Lock size={16} color="#8b5cf6" />
                <h3>Configured Pay-To-Address (Env Derived)</h3>
              </div>
              <p className="info-card-desc">
                The smart contract verifies in zero-knowledge that contributions are directed exclusively to this destination.
              </p>
              <code className="info-card-code">{recipientAddress}</code>
            </div>
          </div>

          {/* Right Column: Privacy Model & Contract Verification */}
          <div className="right-panel">
            {/* Privacy Model Card */}
            <div className="info-card">
              <div className="info-card-header">
                <Shield size={16} color="#10b981" />
                <h3>Privacy Model (Observable Claim)</h3>
              </div>
              <ul className="privacy-list">
                <li>
                  <strong>What is PUBLIC:</strong> The aggregate contract counter, the contract address, and the blinded receipt commitment hash.
                </li>
                <li>
                  <strong>What is PRIVATE:</strong> Your wallet private keys, the donor secret, and the one-time high-entropy salt.
                </li>
                <li>
                  <strong>What the user PROVES:</strong> That they authorized a valid contribution to the configured recipient from a legitimate secret without revealing the secret itself.
                </li>
              </ul>
            </div>

            {/* Contract Details Card */}
            <div className="info-card">
              <div className="info-card-header">
                <Info size={16} color="#06b6d4" />
                <h3>Preprod Contract Status</h3>
              </div>
              <div className="contract-meta-list">
                <div className="contract-meta-item">
                  <span className="meta-label">Network:</span>
                  <span className="meta-value">Midnight Preprod</span>
                </div>
                <div className="contract-meta-item">
                  <span className="meta-label">Contract Address:</span>
                  <code className="meta-code" title={contractAddress}>
                    {contractAddress}
                  </code>
                </div>
                <div className="contract-meta-item">
                  <span className="meta-label">Status:</span>
                  <span className="meta-status-active">
                    <CheckCircle2 size={13} />
                    <span>Verified On-Chain</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div>Midnight Network &bull; Compact 0.20+ &bull; Lace Wallet Connector</div>
      </footer>
    </div>
  );
}

import React from "react";
import { Wallet, AlertCircle, CheckCircle, LogOut } from "lucide-react";

interface WalletConnectProps {
  connected: boolean;
  connecting: boolean;
  address: string | null;
  error: string | null;
  laceInstalled: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({
  connected,
  connecting,
  address,
  error,
  laceInstalled,
  onConnect,
  onDisconnect,
}) => {
  return (
    <div className="wallet-connect-card">
      <div className="wallet-header">
        <div className="wallet-status-indicator">
          <span className={`status-badge ${connected ? "connected" : "disconnected"}`}>
            {connected ? "Wallet Connected" : "Disconnected"}
          </span>
        </div>

        {!connected ? (
          <button
            id="connect-wallet-btn"
            className="btn btn-primary"
            onClick={onConnect}
            disabled={connecting || !laceInstalled}
          >
            {connecting ? (
              <>
                <span className="spinner" />
                <span>Connecting Lace...</span>
              </>
            ) : (
              <>
                <Wallet size={17} />
                <span>Connect Lace Wallet</span>
              </>
            )}
          </button>
        ) : (
          <div className="connected-controls">
            <button
              id="disconnect-wallet-btn"
              className="btn btn-danger btn-sm"
              onClick={onDisconnect}
            >
              <LogOut size={15} />
              <span>Disconnect</span>
            </button>
          </div>
        )}
      </div>

      {/* Connected Address Display */}
      {connected && address && (
        <div className="address-display-box" id="wallet-address-display">
          <div className="address-label">
            <CheckCircle size={14} color="#10b981" />
            <span>Connected Midnight Account (Preprod)</span>
          </div>
          <code className="address-value">{address}</code>
        </div>
      )}

      {/* Disconnected State Notice */}
      {!connected && (
        <p className="disconnected-notice">
          Connect your Midnight Lace wallet (unlocked on Preprod) to generate Zero-Knowledge proofs and submit transactions.
        </p>
      )}

      {/* Error Notices: wallet not installed, rejected, network mismatch */}
      {!laceInstalled && (
        <div className="error-alert">
          <AlertCircle size={18} />
          <div>
            <strong>Lace Wallet Not Detected:</strong> Please install the{" "}
            <a
              href="https://chromewebstore.google.com"
              target="_blank"
              rel="noreferrer"
            >
              Midnight Lace Browser Extension
            </a>{" "}
            and refresh the page.
          </div>
        </div>
      )}

      {error && (
        <div className="error-alert">
          <AlertCircle size={18} />
          <div>
            <strong>Connection Error:</strong> {error}
          </div>
        </div>
      )}
    </div>
  );
};

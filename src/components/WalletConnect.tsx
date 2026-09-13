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
            disabled={connecting}
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
      {!laceInstalled && !connected && (
        <div className="error-alert">
          <AlertCircle size={18} />
          <div>
            <strong>Lace Extension Not Detected Yet:</strong> If you just unlocked Lace, please{" "}
            <button
              onClick={() => window.location.reload()}
              style={{
                background: "none",
                border: "none",
                color: "#38bdf8",
                textDecoration: "underline",
                cursor: "pointer",
                padding: 0,
                fontSize: "inherit",
              }}
            >
              refresh this page
            </button>{" "}
            or click the Lace icon in your browser toolbar to grant site access.
          </div>
        </div>
      )}

      {error && (
        <div className="error-alert">
          <AlertCircle size={18} />
          <div>
            <strong>
              {/network mismatch/i.test(error)
                ? "Network Mismatch:"
                : /rejected/i.test(error)
                  ? "User Rejected:"
                  : /not installed|not detected/i.test(error)
                    ? "Wallet Not Installed:"
                    : "Connection Error:"}
            </strong>{" "}
            {error}
          </div>
        </div>
      )}
    </div>
  );
};

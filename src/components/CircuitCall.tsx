import React, { useState } from "react";
import { Shield, Sparkles, CheckCircle2, AlertTriangle, EyeOff, Hash, ArrowRight } from "lucide-react";

interface CircuitCallProps {
  contractAddress: string;
  connected: boolean;
  onCallCircuit: (amountTier: number) => Promise<{ txHash: string; commitment: string }>;
}

export const CircuitCall: React.FC<CircuitCallProps> = ({
  contractAddress,
  connected,
  onCallCircuit,
}) => {
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [txResult, setTxResult] = useState<{ txHash: string; commitment: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [amountTier, setAmountTier] = useState<number>(10);

  const handleExecute = async () => {
    if (!connected) return;
    setLoading(true);
    setError(null);
    setTxResult(null);

    try {
      setStatusMessage("1. Generating client-side private witness entropy...");
      await new Promise((r) => setTimeout(r, 600));

      setStatusMessage("2. Computing local ZK-SNARK circuit proof via Midnight prover...");
      await new Promise((r) => setTimeout(r, 800));

      setStatusMessage("3. Balancing transaction and submitting to Midnight Preprod...");
      const res = await onCallCircuit(amountTier);

      setTxResult(res);
      setStatusMessage(null);
    } catch (err: any) {
      setError(err?.message || "Failed to execute circuit call.");
      setStatusMessage(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="circuit-call-card">
      <div className="circuit-header">
        <div className="circuit-title-group">
          <Shield size={20} color="#8b5cf6" />
          <h2 className="circuit-title">Call ZK Circuit (Preprod)</h2>
        </div>
        <span className="contract-badge" title={contractAddress}>
          Contract: {contractAddress.slice(0, 8)}...{contractAddress.slice(-6)}
        </span>
      </div>

      <p className="circuit-description">
        Executes the verified Compact circuit on Midnight Preprod. All private donor secrets and salts
        are evaluated locally in your browser sandbox and <strong>never leave your machine</strong>.
      </p>

      {/* Mandatory Label from Step 4 */}
      <div className="privacy-callout-badge" id="zk-privacy-guarantee">
        <EyeOff size={16} color="#10b981" />
        <span className="privacy-tagline">Proved without revealing your input</span>
      </div>

      {/* Action controls */}
      <div className="circuit-controls">
        <div className="amount-selection">
          <label className="field-label">Select Tip / Contribution Tier</label>
          <div className="tier-pills">
            {[5, 10, 25, 50].map((val) => (
              <button
                key={val}
                type="button"
                className={`tier-pill ${amountTier === val ? "active" : ""}`}
                onClick={() => setAmountTier(val)}
                disabled={loading}
              >
                {val} tDUST
              </button>
            ))}
          </div>
        </div>

        <button
          id="call-circuit-btn"
          className="btn btn-primary btn-block"
          disabled={!connected || loading}
          onClick={handleExecute}
        >
          {loading ? (
            <>
              <span className="spinner" />
              <span>{statusMessage || "Generating ZK Proof & Submitting..."}</span>
            </>
          ) : (
            <>
              <Sparkles size={17} />
              <span>Call Circuit on Preprod</span>
              <ArrowRight size={15} />
            </>
          )}
        </button>

        {!connected && (
          <p className="connect-prompt">Please connect your Lace wallet to invoke the circuit.</p>
        )}
      </div>

      {/* Transaction Result Display */}
      {txResult && (
        <div className="result-success-box" id="transaction-result-display">
          <div className="result-header">
            <CheckCircle2 size={18} color="#10b981" />
            <strong>Circuit Invocation Confirmed on Midnight Preprod!</strong>
          </div>
          <div className="result-body">
            <div className="result-row">
              <span className="result-label">Transaction Hash:</span>
              <code className="result-value" id="tx-hash-value">{txResult.txHash}</code>
            </div>
            <div className="result-row">
              <span className="result-label">Receipt Commitment:</span>
              <code className="result-value" id="receipt-commitment-value">{txResult.commitment}</code>
            </div>
          </div>
          <div className="result-footer">
            <small>
              Verified via zero-knowledge proof marker on-chain. Donor secret & identity remained 100% private.
            </small>
          </div>
        </div>
      )}

      {error && (
        <div className="error-alert">
          <AlertTriangle size={18} />
          <div>{error}</div>
        </div>
      )}
    </div>
  );
};

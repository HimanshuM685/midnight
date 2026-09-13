/**
 * types.ts
 *
 * Types for Web Wallet Connect and In-Browser Contract Deployment on Midnight Network.
 */

export interface WebWalletInfo {
  id: string;
  name: string;
  icon?: string;
  apiVersion?: string;
  isInstalled: boolean;
}

export interface WebWalletEndpoints {
  indexerUri: string;
  indexerWsUri: string;
  proverServerUri: string;
  substrateNodeUri: string;
}

export interface WebWalletAccountState {
  address: string;
  coinPublicKey: string;
  encryptionPublicKey: string;
}

export interface ConnectedWebWalletSession {
  walletId: string;
  account: WebWalletAccountState;
  endpoints: WebWalletEndpoints;
  api: any; // MidnightWalletConnectedAPI
  connectedAt: number;
}

export type DeploymentStep =
  | "idle"
  | "connecting_wallet"
  | "preparing_contract"
  | "generating_witnesses"
  | "generating_proof"
  | "balancing_transaction"
  | "submitting_onchain"
  | "confirmed"
  | "failed";

export interface DeploymentProgress {
  step: DeploymentStep;
  message: string;
  progressPercent: number;
  contractAddress?: string;
  txHash?: string;
  error?: string;
}

export interface ContractDeployOptions {
  recipientAddress: string;
  networkId?: string;
  onProgress?: (progress: DeploymentProgress) => void;
}

export interface DeployedContractResult {
  contractAddress: string;
  txHash: string;
  recipientAddress: string;
  networkId: string;
  deployedAt: string;
}

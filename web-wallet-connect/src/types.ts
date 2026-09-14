/**
 * types.ts
 *
 * Types for real Lace-backed contract deployment on Midnight Preprod.
 */

import type { ConnectedAPI } from "@midnight-ntwrk/dapp-connector-api";

export interface WebWalletEndpoints {
  indexerUri: string;
  indexerWsUri: string;
  proverServerUri: string;
  substrateNodeUri: string;
}

export interface WebWalletAccountState {
  unshieldedAddress: string;
  coinPublicKey: string;
  encryptionPublicKey: string;
}

export interface ConnectedWebWalletSession {
  walletId: string;
  account: WebWalletAccountState;
  endpoints: WebWalletEndpoints;
  api: ConnectedAPI;
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

/**
 * global.d.ts
 *
 * Type definitions for the Midnight Lace Wallet extension injected at `window.midnight.mnLace`.
 * Conforms to the official @midnight-ntwrk/dapp-connector-api specification.
 */

export interface MidnightServiceUriConfig {
  indexerUri: string;
  indexerWsUri: string;
  proverServerUri: string;
  substrateNodeUri: string;
}

export interface MidnightWalletState {
  address: string;
  coinPublicKey: string;
  encryptionPublicKey: string;
}

export interface MidnightWalletConnectedAPI {
  /**
   * Retrieves the current address and public key material for the connected account.
   */
  state: () => Promise<MidnightWalletState>;

  /**
   * Balances the transaction UTXOs and computes zero-knowledge proofs via the prover.
   */
  balanceAndProveTransaction: (tx: unknown, newCoins?: unknown) => Promise<unknown>;

  /**
   * Signs and submits the proven transaction to the Midnight network node.
   */
  submitTransaction: (tx: unknown) => Promise<string>;

  /**
   * Optional prover provider handle.
   */
  getProvingProvider?: () => unknown;
}

export interface MidnightWalletInitialAPI {
  apiVersion: string;
  name?: string;
  icon?: string;

  /**
   * Prompts the user to authorize connection to this dApp.
   */
  enable: () => Promise<MidnightWalletConnectedAPI>;

  /**
   * Checks if this dApp currently has authorized access.
   */
  isEnabled: () => Promise<boolean>;

  /**
   * Retrieves the network endpoints currently configured in the user's Lace extension.
   */
  serviceUriConfig: () => Promise<MidnightServiceUriConfig>;
}

declare global {
  interface Window {
    midnight?: {
      mnLace?: MidnightWalletInitialAPI;
      [walletKey: string]: MidnightWalletInitialAPI | undefined;
    };
  }
}

export {};

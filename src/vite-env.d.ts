/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONTRACT_ADDRESS: string;
  readonly VITE_RECIPIENT_ADDRESS: string;
  readonly VITE_NETWORK_ID: string;
  readonly VITE_INDEXER_URI: string;
  readonly VITE_INDEXER_WS_URI: string;
  readonly VITE_PROVER_URI: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

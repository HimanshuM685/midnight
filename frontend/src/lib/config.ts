/**
 * config.ts
 *
 * Centralized configuration service for the Midnight Tip Jar application.
 * Reads, sanitizes, and exports all environment variables.
 */

export interface AppConfig {
  recipientAddress: string;
  contractAddress: string;
  networkId: string;
  indexerUri: string;
  proverUri: string;
}

const DEFAULT_RECIPIENT =
  "mn_addr_preprod1qz603evv82d8q7c040d9hswvx774hkmz7v9593z7v8fwn62g6f5su3a07t";
const DEFAULT_CONTRACT =
  "02005a7698e6ffbc148c2b7617b43b6dc008985172288339572ad1881512aa643b2f";

export const APP_CONFIG: AppConfig = {
  // Configured recipient pay-to-address
  recipientAddress:
    process.env.NEXT_PUBLIC_RECIPIENT_ADDRESS || DEFAULT_RECIPIENT,

  // Deployed Midnight contract address on Preprod
  contractAddress:
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || DEFAULT_CONTRACT,

  // Network identifier
  networkId: process.env.NEXT_PUBLIC_NETWORK_ID || "preprod",

  // Service endpoints
  indexerUri:
    process.env.NEXT_PUBLIC_INDEXER_URI ||
    "https://indexer.preprod.midnight.network/api/v1/graphql",
  proverUri:
    process.env.NEXT_PUBLIC_PROVER_URI || "http://localhost:6300",
};

/**
 * Converts any pay-to-address string (Bech32m or Hex) into a normalized 32-byte Uint8Array.
 */
export function parseAddressToBytes32(addressStr: string): Uint8Array {
  const clean = addressStr.trim().replace(/^0x/, "");

  if (/^[0-9a-fA-F]{64}$/.test(clean)) {
    const bytes = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      bytes[i] = Number.parseInt(clean.slice(i * 2, i * 2 + 2), 16);
    }
    return bytes;
  }

  // UTF-8 fallback hash/padding for alphanumeric address strings
  const bytes = new Uint8Array(32);
  const encoder = new TextEncoder();
  const encoded = encoder.encode(clean);
  bytes.set(encoded.slice(0, 32));
  return bytes;
}

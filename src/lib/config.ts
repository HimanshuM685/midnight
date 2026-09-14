export const NETWORK_ID = import.meta.env.VITE_NETWORK_ID || "preprod";

/** Midnight contract addresses must be exactly 32 bytes (64 hex digits). */
export function normalizeContractAddress(raw: string): string {
  const hex = raw.trim().replace(/^0x/i, "");
  if (!/^[0-9a-fA-F]+$/.test(hex)) {
    throw new Error(`Invalid contract address (non-hex): ${raw}`);
  }
  if (hex.length !== 64) {
    throw new Error(
      `Contract address must be 64 hex characters (32 bytes). Got ${hex.length} chars.` +
        (hex.length === 63
          ? ` Missing a trailing digit — copy the full address from Midnight Explorer (e.g. …${hex.slice(-8)}8).`
          : ` Value: ${hex.slice(0, 16)}…${hex.slice(-8)}`)
    );
  }
  return hex.toLowerCase();
}

const rawContractAddress =
  import.meta.env.VITE_CONTRACT_ADDRESS ||
  "a580d19886569406b03ff73bb0e15a2a5d4c5bc9e0a41508b0f4f4cf044c1188";

export const PREPROD_CONTRACT_ADDRESS = normalizeContractAddress(rawContractAddress);

export const PREPROD_RECIPIENT_ADDRESS =
  import.meta.env.VITE_RECIPIENT_ADDRESS ||
  "mn_addr_preprod1qz603evv82d8q7c040d9hswvx774hkmz7v9593z7v8fwn62g6f5su3a07t";

export const INDEXER_URI =
  import.meta.env.VITE_INDEXER_URI ||
  "https://indexer.preprod.midnight.network/api/v1/graphql";

export const INDEXER_WS_URI =
  import.meta.env.VITE_INDEXER_WS_URI ||
  "wss://indexer.preprod.midnight.network/api/v1/graphql/ws";

export const PROVER_URI = import.meta.env.VITE_PROVER_URI || "http://localhost:6300";

export const PRIVATE_STATE_ID = "midnight-tipjar-private-state";

export function parseAddressToBytes32(addressStr: string): Uint8Array {
  const clean = addressStr.trim().replace(/^0x/, "");
  if (/^[0-9a-fA-F]{64}$/.test(clean)) {
    const bytes = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      bytes[i] = Number.parseInt(clean.slice(i * 2, i * 2 + 2), 16);
    }
    return bytes;
  }
  const bytes = new Uint8Array(32);
  bytes.set(new TextEncoder().encode(clean).slice(0, 32));
  return bytes;
}

export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const NETWORK_ID = import.meta.env.VITE_NETWORK_ID || "preprod";

export const PREPROD_CONTRACT_ADDRESS =
  import.meta.env.VITE_CONTRACT_ADDRESS ||
  "02005a7698e6ffbc148c2b7617b43b6dc008985172288339572ad1881512aa643b2f";

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

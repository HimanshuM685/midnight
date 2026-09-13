import { FetchZkConfigProvider } from "@midnight-ntwrk/midnight-js-fetch-zk-config-provider";
import { httpClientProofProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { findDeployedContract } from "@midnight-ntwrk/midnight-js-contracts";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { CompiledContract } from "@midnight-ntwrk/midnight-js-protocol/compact-js";
import type { ConnectedAPI } from "@midnight-ntwrk/dapp-connector-api";
import { fromHex, toHex as bytesToHex } from "@midnight-ntwrk/midnight-js-utils";
import { Binding, Proof, SignatureEnabled, Transaction } from "@midnight-ntwrk/midnight-js-protocol/ledger";
import { Contract } from "../../contract/src/managed/tip_jar/contract/index.js";
import { inMemoryPrivateStateProvider } from "./inMemoryPrivateState";
import {
  INDEXER_URI,
  INDEXER_WS_URI,
  NETWORK_ID,
  PREPROD_CONTRACT_ADDRESS,
  PREPROD_RECIPIENT_ADDRESS,
  PRIVATE_STATE_ID,
  parseAddressToBytes32,
} from "./config";

export type TipPrivateState = {
  donorSecret: Uint8Array;
};

type CircuitKeys = "tip" | "setJarState";

function loadOrCreateDonorSecret(): Uint8Array {
  const storageKey = "midnight-tipjar-donor-secret";
  const stored = localStorage.getItem(storageKey);
  if (stored) {
    return Uint8Array.from(atob(stored), (c) => c.charCodeAt(0));
  }
  const secret = crypto.getRandomValues(new Uint8Array(32));
  localStorage.setItem(storageKey, btoa(String.fromCharCode(...secret)));
  return secret;
}

function createWitnesses() {
  return {
    donorSecret: ({ privateState }: { privateState: TipPrivateState }): [TipPrivateState, Uint8Array] => [
      privateState,
      privateState.donorSecret,
    ],
    tipSalt: ({ privateState }: { privateState: TipPrivateState }): [TipPrivateState, Uint8Array] => {
      const salt = crypto.getRandomValues(new Uint8Array(32));
      return [privateState, salt];
    },
  };
}

export async function callTipCircuit(
  connectedAPI: ConnectedAPI,
  keys: { coinPublicKey: string; encryptionPublicKey: string },
  amountTier: number,
  endpoints?: { proverServerUri?: string; indexerUri?: string; indexerWsUri?: string }
): Promise<{ txHash: string; commitment: string }> {
  setNetworkId(NETWORK_ID as never);

  const donorSecret = loadOrCreateDonorSecret();
  const recipientBytes = parseAddressToBytes32(PREPROD_RECIPIENT_ADDRESS);
  const privateState: TipPrivateState = { donorSecret };

  const compiledContract = CompiledContract.withWitnesses(
    CompiledContract.withCompiledFileAssets(CompiledContract.make("tip_jar", Contract as never), "/"),
    createWitnesses() as never
  );

  const zkConfigProvider = new FetchZkConfigProvider<CircuitKeys>(window.location.origin, fetch.bind(window));
  const proverServerUri = endpoints?.proverServerUri || "http://localhost:6300";
  const indexerUri = endpoints?.indexerUri || INDEXER_URI;
  const indexerWsUri = endpoints?.indexerWsUri || INDEXER_WS_URI;

  const providers = {
    privateStateProvider: inMemoryPrivateStateProvider<string, TipPrivateState>(),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(proverServerUri, zkConfigProvider),
    publicDataProvider: indexerPublicDataProvider(indexerUri, indexerWsUri),
    walletProvider: {
      getCoinPublicKey: () => keys.coinPublicKey,
      getEncryptionPublicKey: () => keys.encryptionPublicKey,
      balanceTx: async (tx: { serialize: () => Uint8Array }) => {
        const received = await connectedAPI.balanceUnsealedTransaction(bytesToHex(tx.serialize()), {});
        return Transaction.deserialize<SignatureEnabled, Proof, Binding>(
          "signature",
          "proof",
          "binding",
          fromHex(received.tx)
        );
      },
    },
    midnightProvider: {
      submitTx: async (tx: { serialize: () => Uint8Array; identifiers: () => string[] }) => {
        await connectedAPI.submitTransaction(bytesToHex(tx.serialize()));
        return tx.identifiers()[0];
      },
    },
  };

  const deployed = await findDeployedContract(providers as never, {
    compiledContract,
    contractAddress: PREPROD_CONTRACT_ADDRESS,
    privateStateId: PRIVATE_STATE_ID,
    initialPrivateState: privateState,
  });

  const result = await deployed.callTx.tip(recipientBytes, BigInt(amountTier));
  const txHash = result.public.txId || "submitted";

  return { txHash: String(txHash), commitment: "" };
}

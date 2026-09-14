import { deployContract } from "@midnight-ntwrk/midnight-js-contracts";
import { FetchZkConfigProvider } from "@midnight-ntwrk/midnight-js-fetch-zk-config-provider";
import { httpClientProofProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { CompiledContract } from "@midnight-ntwrk/midnight-js-protocol/compact-js";
import {
  Binding,
  Proof,
  SignatureEnabled,
  Transaction,
} from "@midnight-ntwrk/midnight-js-protocol/ledger";
import { fromHex, toHex } from "@midnight-ntwrk/midnight-js-utils";
import {
  MidnightBech32m,
  UnshieldedAddress,
} from "@midnight-ntwrk/wallet-sdk-address-format";
import { Contract } from "../../contract/src/managed/tip_jar/contract/index.js";
import { inMemoryPrivateStateProvider } from "./inMemoryPrivateState";
import type {
  ConnectedWebWalletSession,
  ContractDeployOptions,
  DeployedContractResult,
  DeploymentProgress,
} from "./types";

type TipJarPrivateState = {
  donorSecret: Uint8Array;
};

type CircuitKeys = "tip" | "setJarState";
const PRIVATE_STATE_ID = "tipJarPrivateState";

export function decodeUnshieldedAddress(address: string): Uint8Array {
  const decoded = MidnightBech32m.parse(address).decode(
    UnshieldedAddress,
    "preprod",
  );
  return new Uint8Array(decoded.data);
}

function createWitnesses() {
  return {
    donorSecret: ({
      privateState,
    }: {
      privateState: TipJarPrivateState;
    }): [TipJarPrivateState, Uint8Array] => [
      privateState,
      privateState.donorSecret,
    ],
    tipSalt: ({
      privateState,
    }: {
      privateState: TipJarPrivateState;
    }): [TipJarPrivateState, Uint8Array] => [
      privateState,
      crypto.getRandomValues(new Uint8Array(32)),
    ],
  };
}

export async function deployContractFromWebWallet(
  session: ConnectedWebWalletSession,
  options: ContractDeployOptions,
): Promise<DeployedContractResult> {
  const { networkId = "preprod", onProgress } = options;
  const emit = (progress: DeploymentProgress) => onProgress?.(progress);

  emit({
    step: "preparing_contract",
    message: "Decoding the connected wallet's unshielded Preprod address...",
    progressPercent: 15,
  });

  if (networkId !== "preprod") {
    throw new Error("This deployer only supports Midnight Preprod.");
  }
  const status = await session.api.getConnectionStatus();
  if (status.status !== "connected" || status.networkId !== networkId) {
    throw new Error("Lace is no longer connected to Midnight Preprod.");
  }

  setNetworkId(networkId as never);
  const recipientAddress = session.account.unshieldedAddress;
  const recipientBytes = decodeUnshieldedAddress(recipientAddress);
  const privateState: TipJarPrivateState = {
    donorSecret: crypto.getRandomValues(new Uint8Array(32)),
  };

  emit({
    step: "generating_witnesses",
    message: "Building the real Compact constructor transaction...",
    progressPercent: 30,
  });

  const compiledContract = CompiledContract.withWitnesses(
    CompiledContract.withCompiledFileAssets(
      CompiledContract.make("tip_jar", Contract as never),
      "/",
    ),
    createWitnesses() as never,
  );
  const zkConfigProvider = new FetchZkConfigProvider<CircuitKeys>(
    window.location.origin,
    fetch.bind(window),
  );

  emit({
    step: "generating_proof",
    message: "Generating the deployment proof with the configured Preprod prover...",
    progressPercent: 45,
  });

  const providers = {
    privateStateProvider: inMemoryPrivateStateProvider<
      string,
      TipJarPrivateState
    >(),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(
      session.endpoints.proverServerUri,
      zkConfigProvider,
    ),
    publicDataProvider: indexerPublicDataProvider(
      session.endpoints.indexerUri,
      session.endpoints.indexerWsUri,
    ),
    walletProvider: {
      getCoinPublicKey: () => session.account.coinPublicKey,
      getEncryptionPublicKey: () => session.account.encryptionPublicKey,
      balanceTx: async (tx: { serialize: () => Uint8Array }) => {
        emit({
          step: "balancing_transaction",
          message: "Approve balancing and fees in Lace...",
          progressPercent: 65,
        });
        const balanced = await session.api.balanceUnsealedTransaction(
          toHex(tx.serialize()),
          { payFees: true },
        );
        return Transaction.deserialize<SignatureEnabled, Proof, Binding>(
          "signature",
          "proof",
          "binding",
          fromHex(balanced.tx),
        );
      },
    },
    midnightProvider: {
      submitTx: async (tx: {
        serialize: () => Uint8Array;
        identifiers: () => string[];
      }) => {
        emit({
          step: "submitting_onchain",
          message: "Submitting the signed deployment to Midnight Preprod...",
          progressPercent: 85,
        });
        await session.api.submitTransaction(toHex(tx.serialize()));
        return tx.identifiers()[0];
      },
    },
  };

  // compactc 0.31 generates the runtime class without Midnight.js's newer
  // phantom generic metadata, so narrow the cast to this generated-code boundary.
  const deploy = deployContract as unknown as (
    providerSet: unknown,
    deployOptions: unknown,
  ) => Promise<{
    deployTxData: {
      public: { contractAddress: unknown; txHash: unknown };
    };
  }>;
  const deployed = await deploy(providers, {
    compiledContract,
    args: [recipientBytes],
    privateStateId: PRIVATE_STATE_ID,
    initialPrivateState: privateState,
  });

  const result: DeployedContractResult = {
    contractAddress: String(deployed.deployTxData.public.contractAddress),
    txHash: String(deployed.deployTxData.public.txHash),
    recipientAddress,
    networkId,
    deployedAt: new Date().toISOString(),
  };

  emit({
    step: "confirmed",
    message: `Contract finalized on Midnight Preprod: ${result.contractAddress}`,
    progressPercent: 100,
    contractAddress: result.contractAddress,
    txHash: result.txHash,
  });

  return result;
}

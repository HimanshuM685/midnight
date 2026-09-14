import {
  Brand_exports,
  Cause_exports,
  ConfigProvider_exports,
  ConstrainedPlainHex,
  Contract_exports,
  Effect_exports,
  Exit_exports,
  Layer_exports,
  ManagedRuntime_exports,
  Option_exports,
  TypeIdError,
  ZKConfiguration_exports,
  hasProperty,
  layer
} from "./chunk-JRVBLNMT.js";
import {
  __export
} from "./chunk-IKZWERSR.js";

// node_modules/@midnight-ntwrk/platform-js/dist/esm/effect/ContractAddress.js
var ContractAddress_exports = {};
__export(ContractAddress_exports, {
  ContractAddress: () => ContractAddress,
  asBytes: () => asBytes
});
var ContractAddress = Brand_exports.all(Brand_exports.nominal(), ConstrainedPlainHex({ byteLength: "32..=32" }));
var asBytes = (self) => Buffer.from(self, "hex");

// node_modules/@midnight-ntwrk/compact-js/dist/esm/effect/ContractExecutableRuntime.js
var ContractExecutableRuntime_exports = {};
__export(ContractExecutableRuntime_exports, {
  make: () => make
});
var make = (layer2) => ManagedRuntime_exports.make(layer2);

// node_modules/@midnight-ntwrk/compact-js/dist/esm/effect/ZKConfigurationReadError.js
var ZKConfigurationReadError_exports = {};
__export(ZKConfigurationReadError_exports, {
  ZKConfigurationReadError: () => ZKConfigurationReadError,
  isReadError: () => isReadError,
  make: () => make2
});
var TypeId = Symbol.for("compact-js/effect/ZKConfigurationReadError");
var ZKConfigurationReadError = class extends TypeIdError(TypeId, "ZKConfigurationReadError") {
};
var isReadError = (u) => hasProperty(u, TypeId);
var make2 = (contractTag, provableCircuitId, assetType, cause) => new ZKConfigurationReadError({
  contractTag,
  provableCircuitId,
  assetType,
  message: `Failed to read ${assetType.replaceAll("-", " ")} for ${contractTag}#${provableCircuitId}`,
  cause
});

// node_modules/@midnight-ntwrk/platform-js/dist/esm/effect/DomainSeparator.js
var DomainSeparator = Brand_exports.all(Brand_exports.nominal(), ConstrainedPlainHex({ byteLength: "32..=32" }));

// node_modules/@midnight-ntwrk/midnight-js-types/dist/index.mjs
var makeAdaptedReader = (zkConfigProvider) => (compiledContract) => Effect_exports.gen(function* () {
  const getVerifierKey = (provableCircuitId) => Effect_exports.tryPromise({
    try: () => zkConfigProvider.getVerifierKey(provableCircuitId).then((verifierKey) => Option_exports.some(Contract_exports.VerifierKey(verifierKey))),
    catch: (err) => ZKConfigurationReadError_exports.make(compiledContract.tag, provableCircuitId, "verifier-key", err)
  });
  return {
    getVerifierKey,
    getVerifierKeys: (provableCircuitIds) => Effect_exports.forEach(provableCircuitIds, (provableCircuitId) => getVerifierKey(provableCircuitId).pipe(Effect_exports.map((verifierKey) => [provableCircuitId, verifierKey])), { concurrency: "unbounded", discard: false })
  };
});
var makeAdaptedRuntimeLayer = (zkConfigProvider, configMap) => Layer_exports.mergeAll(Layer_exports.succeed(ZKConfiguration_exports.ZKConfiguration, ZKConfiguration_exports.ZKConfiguration.of({
  createReader: makeAdaptedReader(zkConfigProvider)
})), layer).pipe(Layer_exports.provide(Layer_exports.setConfigProvider(ConfigProvider_exports.fromMap(configMap, { pathDelim: "_" }).pipe(ConfigProvider_exports.constantCase))));
var makeContractExecutableRuntime = (zkConfigProvider, options) => {
  let config = [["KEYS_COIN_PUBLIC", options.coinPublicKey]];
  if (options.signingKey) {
    config = config.concat([["KEYS_SIGNING", options.signingKey]]);
  }
  return ContractExecutableRuntime_exports.make(makeAdaptedRuntimeLayer(zkConfigProvider, new Map(config)));
};
var exitResultOrError = (exit) => Exit_exports.match(exit, {
  onSuccess: (a) => a,
  onFailure: (cause) => {
    if (Cause_exports.isFailType(cause))
      throw cause.error;
    throw new Error(`Unexpected error: ${Cause_exports.pretty(cause)}`);
  }
});
var asEffectOption = (obj) => {
  return Option_exports.some(obj);
};
var asContractAddress = (address) => ContractAddress_exports.ContractAddress(address);
var InvalidProtocolSchemeError = class extends Error {
  invalidScheme;
  allowableSchemes;
  /**
   * @param invalidScheme The invalid scheme.
   * @param allowableSchemes The valid schemes that are allowed.
   */
  constructor(invalidScheme, allowableSchemes) {
    super(`Invalid protocol scheme: '${invalidScheme}'. Allowable schemes are one of: ${allowableSchemes.join(",")}`);
    this.invalidScheme = invalidScheme;
    this.allowableSchemes = allowableSchemes;
  }
};
var LogLevel;
(function(LogLevel2) {
  LogLevel2["INFO"] = "info";
  LogLevel2["WARN"] = "warn";
  LogLevel2["ERROR"] = "error";
  LogLevel2["FATAL"] = "fatal";
  LogLevel2["DEBUG"] = "debug";
  LogLevel2["TRACE"] = "trace";
})(LogLevel || (LogLevel = {}));
var createProverKey = (uint8Array) => {
  return uint8Array;
};
var createVerifierKey = (uint8Array) => {
  return uint8Array;
};
var createZKIR = (uint8Array) => {
  return uint8Array;
};
var zkConfigToProvingKeyMaterial = (zkConfig) => {
  return {
    proverKey: zkConfig.proverKey,
    verifierKey: zkConfig.verifierKey,
    ir: zkConfig.zkir
  };
};
var SegmentFail = "SegmentFail";
var SegmentSuccess = "SegmentSuccess";
var FailEntirely = "FailEntirely";
var FailFallible = "FailFallible";
var SucceedEntirely = "SucceedEntirely";
var ZKConfigProvider = class {
  /**
   * Retrieves the verifier keys produced by `compactc` compiler for the given circuits.
   * @param circuitIds The circuit IDs of the verifier keys to retrieve.
   */
  async getVerifierKeys(circuitIds) {
    return Promise.all(circuitIds.map(async (id) => {
      const key = await this.getVerifierKey(id);
      return [id, key];
    }));
  }
  /**
   * Retrieves all zero-knowledge artifacts produced by `compactc` compiler for the given circuit.
   * @param circuitId The circuit ID of the artifacts to retrieve.
   */
  async get(circuitId) {
    return {
      circuitId,
      proverKey: await this.getProverKey(circuitId),
      verifierKey: await this.getVerifierKey(circuitId),
      zkir: await this.getZKIR(circuitId)
    };
  }
  asKeyMaterialProvider() {
    return this;
  }
};

export {
  ContractAddress,
  makeContractExecutableRuntime,
  exitResultOrError,
  asEffectOption,
  asContractAddress,
  InvalidProtocolSchemeError,
  createProverKey,
  createVerifierKey,
  createZKIR,
  zkConfigToProvingKeyMaterial,
  SegmentFail,
  SegmentSuccess,
  FailEntirely,
  FailFallible,
  SucceedEntirely,
  ZKConfigProvider
};
//# sourceMappingURL=chunk-ZXAUGGGM.js.map

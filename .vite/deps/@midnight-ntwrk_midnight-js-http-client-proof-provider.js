import {
  require_browser_ponyfill
} from "./chunk-JYHKSAID.js";
import {
  InvalidProtocolSchemeError,
  zkConfigToProvingKeyMaterial
} from "./chunk-ZXAUGGGM.js";
import "./chunk-JRVBLNMT.js";
import {
  warnIfInsecureRemoteUrl
} from "./chunk-7JNO6ITM.js";
import "./chunk-3I547AQ6.js";
import {
  CostModel,
  createCheckPayload,
  createProvingPayload,
  parseCheckResult
} from "./chunk-GUGIKMIP.js";
import "./chunk-AVUHMXEH.js";
import "./chunk-QJLR5UVC.js";
import {
  __commonJS,
  __toESM
} from "./chunk-IKZWERSR.js";

// node_modules/fetch-retry/dist/fetch-retry.umd.js
var require_fetch_retry_umd = __commonJS({
  "node_modules/fetch-retry/dist/fetch-retry.umd.js"(exports, module) {
    (function(global, factory) {
      typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.fetchRetry = factory());
    })(exports, (function() {
      "use strict";
      var fetchRetry2 = function(fetch2, defaults) {
        defaults = defaults || {};
        if (typeof fetch2 !== "function") {
          throw new ArgumentError("fetch must be a function");
        }
        if (typeof defaults !== "object") {
          throw new ArgumentError("defaults must be an object");
        }
        if (defaults.retries !== void 0 && !isPositiveInteger(defaults.retries)) {
          throw new ArgumentError("retries must be a positive integer");
        }
        if (defaults.retryDelay !== void 0 && !isPositiveInteger(defaults.retryDelay) && typeof defaults.retryDelay !== "function") {
          throw new ArgumentError("retryDelay must be a positive integer or a function returning a positive integer");
        }
        if (defaults.retryOn !== void 0 && !Array.isArray(defaults.retryOn) && typeof defaults.retryOn !== "function") {
          throw new ArgumentError("retryOn property expects an array or function");
        }
        var baseDefaults = {
          retries: 3,
          retryDelay: 1e3,
          retryOn: []
        };
        defaults = Object.assign(baseDefaults, defaults);
        return function fetchRetry3(input, init) {
          var retries = defaults.retries;
          var retryDelay = defaults.retryDelay;
          var retryOn = defaults.retryOn;
          if (init && init.retries !== void 0) {
            if (isPositiveInteger(init.retries)) {
              retries = init.retries;
            } else {
              throw new ArgumentError("retries must be a positive integer");
            }
          }
          if (init && init.retryDelay !== void 0) {
            if (isPositiveInteger(init.retryDelay) || typeof init.retryDelay === "function") {
              retryDelay = init.retryDelay;
            } else {
              throw new ArgumentError("retryDelay must be a positive integer or a function returning a positive integer");
            }
          }
          if (init && init.retryOn) {
            if (Array.isArray(init.retryOn) || typeof init.retryOn === "function") {
              retryOn = init.retryOn;
            } else {
              throw new ArgumentError("retryOn property expects an array or function");
            }
          }
          return new Promise(function(resolve, reject) {
            var wrappedFetch = function(attempt) {
              var _input = typeof Request !== "undefined" && input instanceof Request ? input.clone() : input;
              fetch2(_input, init).then(function(response) {
                if (Array.isArray(retryOn) && retryOn.indexOf(response.status) === -1) {
                  resolve(response);
                } else if (typeof retryOn === "function") {
                  try {
                    return Promise.resolve(retryOn(attempt, null, response)).then(function(retryOnResponse) {
                      if (retryOnResponse) {
                        retry(attempt, null, response);
                      } else {
                        resolve(response);
                      }
                    }).catch(reject);
                  } catch (error) {
                    reject(error);
                  }
                } else {
                  if (attempt < retries) {
                    retry(attempt, null, response);
                  } else {
                    resolve(response);
                  }
                }
              }).catch(function(error) {
                if (typeof retryOn === "function") {
                  try {
                    Promise.resolve(retryOn(attempt, error, null)).then(function(retryOnResponse) {
                      if (retryOnResponse) {
                        retry(attempt, error, null);
                      } else {
                        reject(error);
                      }
                    }).catch(function(error2) {
                      reject(error2);
                    });
                  } catch (error2) {
                    reject(error2);
                  }
                } else if (attempt < retries) {
                  retry(attempt, error, null);
                } else {
                  reject(error);
                }
              });
            };
            function retry(attempt, error, response) {
              var delay = typeof retryDelay === "function" ? retryDelay(attempt, error, response) : retryDelay;
              setTimeout(function() {
                wrappedFetch(++attempt);
              }, delay);
            }
            wrappedFetch(0);
          });
        };
      };
      function isPositiveInteger(value) {
        return Number.isInteger(value) && value >= 0;
      }
      function ArgumentError(message) {
        this.name = "ArgumentError";
        this.message = message;
      }
      return fetchRetry2;
    }));
  }
});

// node_modules/@midnight-ntwrk/midnight-js-http-client-proof-provider/dist/index.mjs
var import_cross_fetch = __toESM(require_browser_ponyfill(), 1);
var import_fetch_retry = __toESM(require_fetch_retry_umd(), 1);
var retryOptions = {
  retries: 3,
  retryDelay: (attempt) => 2 ** attempt * 1e3,
  retryOn: [500, 503]
};
var fetchRetry = (0, import_fetch_retry.default)(import_cross_fetch.default, retryOptions);
var CHECK_PATH = "/check";
var PROVE_PATH = "/prove";
var buildEndpointUrl = (baseUrl, endpoint) => {
  const url = new URL(baseUrl);
  url.pathname = url.pathname.replace(/\/$/, "") + endpoint;
  return url;
};
var DEFAULT_TIMEOUT = 3e5;
var getKeyMaterial = async (zkConfigProvider, keyLocation) => {
  try {
    const zkConfig = await zkConfigProvider.get(keyLocation);
    return zkConfigToProvingKeyMaterial(zkConfig);
  } catch {
    return void 0;
  }
};
var makeHttpRequest = async (url, payload, timeout, headers = {}) => {
  const response = await fetchRetry(url, {
    method: "POST",
    body: new Uint8Array(payload),
    headers: { "Content-Type": "application/octet-stream", ...headers },
    signal: AbortSignal.timeout(timeout)
  });
  if (!response.ok) {
    throw new Error(`Failed Proof Server response: url="${response.url}", code="${response.status}", status="${response.statusText}"`);
  }
  return new Uint8Array(await response.arrayBuffer());
};
var httpClientProvingProvider = (url, zkConfigProvider, config) => {
  const checkUrl = buildEndpointUrl(url, CHECK_PATH);
  const proveUrl = buildEndpointUrl(url, PROVE_PATH);
  if (checkUrl.protocol !== "http:" && checkUrl.protocol !== "https:") {
    throw new InvalidProtocolSchemeError(checkUrl.protocol, ["http:", "https:"]);
  }
  if (proveUrl.protocol !== "http:" && proveUrl.protocol !== "https:") {
    throw new InvalidProtocolSchemeError(proveUrl.protocol, ["http:", "https:"]);
  }
  warnIfInsecureRemoteUrl(url, "proof server URL");
  const timeout = config?.timeout ?? DEFAULT_TIMEOUT;
  const headers = config?.headers ?? {};
  return {
    async check(serializedPreimage, keyLocation) {
      const keyMaterial = await getKeyMaterial(zkConfigProvider, keyLocation);
      const payload = createCheckPayload(serializedPreimage, keyMaterial?.ir);
      const result = await makeHttpRequest(checkUrl, payload, timeout, headers);
      return parseCheckResult(result);
    },
    async prove(serializedPreimage, keyLocation, overwriteBindingInput) {
      const keyMaterial = await getKeyMaterial(zkConfigProvider, keyLocation);
      const payload = createProvingPayload(serializedPreimage, overwriteBindingInput, keyMaterial);
      return makeHttpRequest(proveUrl, payload, timeout, headers);
    }
  };
};
var DEFAULT_CONFIG = {
  timeout: 3e5,
  zkConfig: void 0
};
var httpClientProofProvider = (url, zkConfigProvider, config) => {
  const baseProvingProvider = httpClientProvingProvider(url, zkConfigProvider, config);
  return {
    async proveTx(unprovenTx, _partialProveTxConfig) {
      const costModel = CostModel.initialCostModel();
      return unprovenTx.prove(baseProvingProvider, costModel);
    }
  };
};
export {
  DEFAULT_CONFIG,
  DEFAULT_TIMEOUT,
  httpClientProofProvider,
  httpClientProvingProvider
};
//# sourceMappingURL=@midnight-ntwrk_midnight-js-http-client-proof-provider.js.map

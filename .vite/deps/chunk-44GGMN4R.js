// node_modules/@midnight-ntwrk/midnight-js-network-id/dist/index.mjs
var currentNetworkId;
var setNetworkId = (id) => {
  currentNetworkId = id;
};
var getNetworkId = () => {
  if (currentNetworkId === void 0) {
    throw new Error("Network ID has not been configured. Call setNetworkId() before any wallet or contract operation.");
  }
  return currentNetworkId;
};

export {
  setNetworkId,
  getNetworkId
};
//# sourceMappingURL=chunk-44GGMN4R.js.map

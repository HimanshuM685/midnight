# Graph Report - .  (2026-07-11)

## Corpus Check
- Corpus is ~4,266 words - fits in a single context window. You may not need a graph.

## Summary
- 153 nodes · 222 edges · 10 communities
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.85)
- Token cost: 32,697 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Network Config & Dust Probe|Network Config & Dust Probe]]
- [[_COMMUNITY_Contract TS API & Witnesses|Contract TS API & Witnesses]]
- [[_COMMUNITY_Deployment Pipeline|Deployment Pipeline]]
- [[_COMMUNITY_Generated Contract Circuits|Generated Contract Circuits]]
- [[_COMMUNITY_Midnight JS Dependencies|Midnight JS Dependencies]]
- [[_COMMUNITY_Package Manifest|Package Manifest]]
- [[_COMMUNITY_Generated Contract Descriptors|Generated Contract Descriptors]]
- [[_COMMUNITY_TypeScript Config|TypeScript Config]]
- [[_COMMUNITY_Counter Contract & ZK Concepts|Counter Contract & ZK Concepts]]
- [[_COMMUNITY_Contract Type Declarations|Contract Type Declarations]]

## God Nodes (most connected - your core abstractions)
1. `Contract` - 13 edges
2. `MidnightWalletProvider` - 12 edges
3. `main()` - 9 edges
4. `CounterSimulator` - 9 edges
5. `compilerOptions` - 9 edges
6. `ledger()` - 8 edges
7. `counter.compact Contract` - 8 edges
8. `createCounterPrivateState()` - 7 edges
9. `_Either_0` - 4 edges
10. `_ContractAddress_0` - 4 edges

## Surprising Connections (you probably didn't know these)
- `CounterSimulator` --references--> `Contract`  [EXTRACTED]
  tests/counter-simulator.ts → managed/counter/contract/index.js
- `main()` --calls--> `ledger()`  [EXTRACTED]
  scripts/deploy.ts → managed/counter/contract/index.js
- `main()` --calls--> `createCounterPrivateState()`  [EXTRACTED]
  scripts/deploy.ts → src/witnesses.ts
- `Local Proof Server Service (midnightntwrk/proof-server:8.1.0)` --conceptually_related_to--> `ZK Owner-Only Reset Authorization`  [INFERRED]
  compose.yml → README.md
- `main()` --calls--> `buildProviders()`  [EXTRACTED]
  scripts/deploy.ts → src/providers.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Counter Contract Public Interface and Private Witness** — src_counter, src_counter_increment, src_counter_reset, src_counter_localsecretkey [EXTRACTED 1.00]
- **Preview/Preprod Deployment Flow** — scripts_deploy, compose_proof_server, readme_tnight_faucet, readme_dust_generation, readme_public_indexer, readme_midnight_network [EXTRACTED 1.00]

## Communities (10 total, 0 thin omitted)

### Community 0 - "Network Config & Dust Probe"
Cohesion: 0.09
Nodes (13): config, envConfig, envFile, logger, nightUtxos, rootEnvFile, getConfig(), LOCAL_CONFIG (+5 more)

### Community 1 - "Contract TS API & Witnesses"
Cohesion: 0.17
Nodes (11): ledger(), @midnight-ntwrk/compact-runtime, CompiledCounterContract, CounterCircuits, currentDir, zkConfigPath, CounterPrivateState, createCounterPrivateState() (+3 more)

### Community 2 - "Deployment Pipeline"
Cohesion: 0.17
Nodes (15): DUST Generation / Balance, Public Indexer (Wallet Sync), tNIGHT Network Faucet, config, envFile, loadEnvFile(), logger, main() (+7 more)

### Community 3 - "Generated Contract Circuits"
Cohesion: 0.24
Nodes (3): Contract, _ContractAddress_0, _Either_0

### Community 4 - "Midnight JS Dependencies"
Cohesion: 0.12
Nodes (17): dependencies, @midnight-ntwrk/compact-runtime, @midnight-ntwrk/midnight-js-contracts, @midnight-ntwrk/midnight-js-http-client-proof-provider, @midnight-ntwrk/midnight-js-indexer-public-data-provider, @midnight-ntwrk/midnight-js-level-private-state-provider, @midnight-ntwrk/midnight-js-network-id, @midnight-ntwrk/midnight-js-node-zk-config-provider (+9 more)

### Community 5 - "Package Manifest"
Cohesion: 0.14
Nodes (13): devDependencies, tsx, @types/ws, typescript, vitest, name, private, scripts (+5 more)

### Community 6 - "Generated Contract Descriptors"
Cohesion: 0.15
Nodes (12): contractReferenceLocations, _descriptor_0, _descriptor_1, _descriptor_2, _descriptor_3, _descriptor_5, _descriptor_6, _descriptor_7 (+4 more)

### Community 7 - "TypeScript Config"
Cohesion: 0.18
Nodes (10): compilerOptions, esModuleInterop, module, moduleResolution, noEmit, resolveJsonModule, skipLibCheck, strict (+2 more)

### Community 8 - "Counter Contract & ZK Concepts"
Cohesion: 0.28
Nodes (9): Local Proof Server Service (midnightntwrk/proof-server:8.1.0), Compact Language, Midnight Counter Project, Midnight Network, ZK Owner-Only Reset Authorization, counter.compact Contract, increment() Circuit, localSecretKey() Witness (+1 more)

### Community 9 - "Contract Type Declarations"
Cohesion: 0.22
Nodes (8): Circuits, Contract, ContractReferenceLocations, ImpureCircuits, Ledger, ProvableCircuits, PureCircuits, Witnesses

## Knowledge Gaps
- **77 isolated node(s):** `Witnesses`, `ImpureCircuits`, `ProvableCircuits`, `PureCircuits`, `Circuits` (+72 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Contract` connect `Generated Contract Circuits` to `Contract TS API & Witnesses`, `Deployment Pipeline`, `Generated Contract Descriptors`?**
  _High betweenness centrality (0.109) - this node is a cross-community bridge._
- **Why does `MidnightWalletProvider` connect `Network Config & Dust Probe` to `Deployment Pipeline`?**
  _High betweenness centrality (0.077) - this node is a cross-community bridge._
- **Why does `counter.compact Contract` connect `Counter Contract & ZK Concepts` to `Contract TS API & Witnesses`, `Deployment Pipeline`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **What connects `Witnesses`, `ImpureCircuits`, `ProvableCircuits` to the rest of the system?**
  _77 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Network Config & Dust Probe` be split into smaller, more focused modules?**
  _Cohesion score 0.09420289855072464 - nodes in this community are weakly interconnected._
- **Should `Midnight JS Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `Package Manifest` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
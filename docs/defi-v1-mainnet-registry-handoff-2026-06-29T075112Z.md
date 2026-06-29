# DeFi v1 mainnet registry handoff — 2026-06-29T07:51:12Z

## Scope

Bounded heartbeat slice for the Juno website DeFi v1 workstream: confirm the registry artifact still blocks on real mainnet pool data, verify a live Juno RPC endpoint is available for the next query pass, and leave the exact next commands for replacing placeholders with verified factory/pair/LP values.

## Current registry state

`docs/defi-v1-pool-registry.example.json` remains a template only. Non-strict validation passes, but strict validation correctly rejects placeholder values.

```sh
node scripts/validate-defi-registry.mjs docs/defi-v1-pool-registry.example.json && \
node scripts/validate-defi-registry.mjs --strict docs/defi-v1-pool-registry.example.json
```

Observed output:

```text
ok: juno-1 registry has 1 pool(s), 1 unique pair contract(s)
registry validation failed: factory must be a verified mainnet value, not a placeholder
```

## Live chain check

The local `junod` binary can reach Juno mainnet through Polkachu RPC.

```sh
junod status --node https://juno-rpc.polkachu.com:443 --output json
```

Observed facts:

```text
network: juno-1
latest_block_height: 39324568
latest_block_time: 2026-06-29T07:51:10.145357271Z
catching_up: false
rpc_moniker: hello-juno-relayer
```

## Handoff: next smallest useful step

Create a strict-passable mainnet registry file only after verifying the actual deployed DEX contracts. Suggested command path:

```sh
# 1. Confirm candidate factory contract config once an address is known.
junod q wasm contract-state smart <factory> '{"config":{}}' \
  --node https://juno-rpc.polkachu.com:443 --output json

# 2. Query the desired JUNO pair from that factory.
junod q wasm contract-state smart <factory> \
  '{"pair":{"asset_infos":[{"native_token":{"denom":"ujuno"}},{"native_token":{"denom":"<counterparty-denom>"}}]}}' \
  --node https://juno-rpc.polkachu.com:443 --output json

# 3. Verify the returned pair contract directly.
junod q wasm contract-state smart <pair> '{"pair":{}}' \
  --node https://juno-rpc.polkachu.com:443 --output json
```

When those return real values, write `docs/defi-v1-pool-registry.juno-1.json` and require:

```sh
node scripts/validate-defi-registry.mjs --strict docs/defi-v1-pool-registry.juno-1.json
```

## Note

No scope expansion: this handoff is still swaps, pools, liquidity, and clean metadata. No incentives, stablecoin theater, LSTs, perps, or yield machinery in v1.

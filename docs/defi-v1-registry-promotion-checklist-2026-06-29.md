# Juno DeFi v1 registry promotion checklist

Purpose: keep the first Juno DEX surface boring and shippable: swaps, pools, liquidity. This checklist turns the local template registry into a mainnet-ready file without opening scope to incentives, LSTs, perps, or yield wrappers.

## Inputs to verify

- `factory`: Astroport-style factory contract on `juno-1`.
- `router`: optional; omit until direct pool swaps are verified end-to-end.
- `pools[]`: only pools intended for v1 launch.
- `pair`: pair contract address for each pool.
- `lpToken`: LP denom/address for each pool.
- `assets[]`: exactly two distinct assets per pool.
- `explorer`: Mintscan or equivalent contract URL for every pool in strict mode.
- `updatedAt`: timestamp of the last manual verification.

## Local gates

From `/opt/data/repos/juno-website`:

```sh
node scripts/test-defi-registry-validator.mjs
node scripts/validate-defi-registry.mjs docs/defi-v1-pool-registry.example.json
node scripts/validate-defi-registry.mjs --strict <mainnet-registry.json>
```

Expected behavior:

- The smoke test passes.
- The example template passes non-strict validation, because placeholders are allowed for documentation.
- Strict validation rejects placeholders and should only pass once every factory/router/pair/LP/IBC value is real.

## Scope guard

If a proposed registry field is not one of the validator's allowed keys, do not add it for v1. Put the idea in a later planning note instead. The registry is deliberately small so the UI can ship the first loop: discover pool, quote/swap, add/remove liquidity.

## Next artifact

When real mainnet addresses are selected, create a separate registry file rather than mutating the placeholder example. Run strict validation and record the command output in the PR body.

# Juno DeFi v1: minimal DEX scope

Purpose: keep the first Juno DeFi revival slice small enough to ship. The first product should prove that Juno can host simple, usable liquidity again; it should not become a token launchpad, stablecoin, LST, perp, or yield program before swaps work.

## Product promise

**One screen to swap, one screen to provide liquidity, one screen to see pools.**

The story: Juno is alive when a user can arrive with JUNO or an IBC asset, swap it, add liquidity to a pool, and verify the transaction on-chain without needing tribal knowledge.

## v1 user flows

1. **Swap**
   - Pick input and output assets.
   - Enter amount.
   - Show route, expected output, price impact, fee, and slippage.
   - Broadcast swap and link to explorer.

2. **Pools**
   - List known Juno pools with pair assets, TVL placeholder/metric, swap fee, and pool type.
   - Open a pool detail page with reserves, LP token address, and contract links.

3. **Add / remove liquidity**
   - Select a pool.
   - Enter balanced deposit amounts or calculate the paired side.
   - Mint/burn LP position.
   - Link to explorer.

## Contract surface to target first

Local `astroport-core` already contains the primitives a minimal Juno UI can wrap:

- `contracts/factory` — pair discovery / creation surface.
- `contracts/pair` — constant-product pools.
- `contracts/pair_stable` — stable pools, optional for first launch if deployment exists.
- `contracts/router` — multi-hop routing after direct swaps are working.

V1 should start with deployed factory + pair contracts and only add router support once direct-pool swap UX is verified.

## Explicit non-goals for v1

- No perps.
- No lending.
- No LST narrative.
- No native stablecoin plan.
- No emissions dashboard unless rewards already exist.
- No custom bonding curve or launchpad.
- No governance token redesign.

## Launch checklist

- [ ] Confirm active Juno mainnet/testnet Astroport contract addresses.
- [ ] Build a static pool registry JSON for the first supported pools.
- [ ] Implement read-only pool list and detail views.
- [ ] Implement direct swap simulation + execution.
- [ ] Implement add/remove liquidity for constant-product pools.
- [ ] Add explorer links for every broadcast transaction.
- [ ] Capture a smoke test: query pools, simulate swap, broadcast on testnet or dry-run where possible.

## Copy block for website or PRD

> Juno DeFi v1 is intentionally boring: swaps, pools, liquidity. No theater, no scope creep. First make the chain liquid again; then let governance decide what deserves complexity.

## Next smallest build slice

Use [`defi-v1-pool-registry.schema.json`](./defi-v1-pool-registry.schema.json), [`defi-v1-pool-registry.example.json`](./defi-v1-pool-registry.example.json), and `scripts/validate-defi-registry.mjs` to create a first hard-coded `juno-1` pool registry once factory and pair addresses are confirmed. Keep the first registry boring: direct pools, asset metadata, explorer links, and no router dependency until direct swaps are verified.

Validation commands from the repo root:

```sh
# Template shape check; placeholders are allowed here.
node scripts/validate-defi-registry.mjs docs/defi-v1-pool-registry.example.json

# Real registry readiness check; fails on dummy values and requires updatedAt + pool explorer links.
node scripts/validate-defi-registry.mjs --strict docs/defi-v1-pool-registry.json
```

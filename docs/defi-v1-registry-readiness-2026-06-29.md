# DeFi v1 registry readiness — 2026-06-29

Timestamp: `2026-06-29T03:12:21Z`

## Scope

Bounded heartbeat slice for the Juno website DeFi v1 workstream: re-verify the existing minimal pool registry artifact and its local validator smoke tests stay small enough for v1, then leave a clear handoff for replacing placeholders with real mainnet pool data.

## Commands run

```sh
node scripts/validate-defi-registry.mjs docs/defi-v1-pool-registry.example.json
node scripts/validate-defi-registry.mjs --strict docs/defi-v1-pool-registry.example.json
node scripts/test-defi-registry-validator.mjs
```

## Result

- Non-strict validation passed: the example registry has the intended minimal shape for one `juno-1` pool entry and one unique pair contract.
- Strict validation failed as intended because the example still uses placeholder factory/pair/IBC values.
- Validator smoke tests passed for the happy path, strict placeholder rejection, duplicate asset rejection, and scope-creep rejection.
- The registry surface remains correctly scoped to DeFi v1: factory, optional router, exactly two-asset pools, `xyk`/`stable`, LP token, fee, explorer, and notes. No token launches, LSTs, perps, yield, or incentive machinery crept in.

## Verification output

```text
ok: juno-1 registry has 1 pool(s), 1 unique pair contract(s)
registry validation failed: factory must be a verified mainnet value, not a placeholder
ok: validator smoke tests passed (valid, strict placeholders, duplicate assets, scope guard)
```

## Next smallest step

Query or otherwise verify the first real Juno mainnet Astroport-style factory/pair addresses and replace `docs/defi-v1-pool-registry.example.json` with a strict-passable `docs/defi-v1-pool-registry.juno-1.json` before wiring it into the website UI.

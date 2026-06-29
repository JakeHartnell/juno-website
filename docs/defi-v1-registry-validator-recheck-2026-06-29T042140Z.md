# DeFi v1 registry validator recheck — 2026-06-29T04:21:40Z

## Scope

Bounded heartbeat slice for the Juno DeFi v1 website workstream: re-run the local pool-registry guard before anyone wires the registry into UI code.

## Commands run

```sh
node scripts/validate-defi-registry.mjs docs/defi-v1-pool-registry.example.json
node scripts/validate-defi-registry.mjs --strict docs/defi-v1-pool-registry.example.json
node scripts/test-defi-registry-validator.mjs
```

## Observed output

```text
ok: juno-1 registry has 1 pool(s), 1 unique pair contract(s)
registry validation failed: factory must be a verified mainnet value, not a placeholder
ok: validator smoke tests passed (valid, strict placeholders, duplicate assets, duplicate pairs, strict router, scope guard)
strict_status=1 test_status=0
```

## Readiness read

The permissive example still validates as a template, strict mode still rejects placeholder mainnet values, and the smoke suite still covers duplicate assets, duplicate pairs, placeholder factory/router values, and scope creep keys. The guard is ready for a real `juno-1` registry file once factory/pair/LP/IBC values are independently verified.

## Next smallest step

Create `docs/defi-v1-pool-registry.juno-1.json` only after confirming real Juno mainnet Astroport factory, pair, LP token, router if any, and IBC denom values from chain/explorer sources.

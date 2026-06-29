# DeFi v1 registry guard hardening — 2026-06-29

Timestamp: `2026-06-29T03:47:57Z`

## Scope

Bounded heartbeat slice for the Juno website DeFi v1 workstream: harden the local pool registry validator smoke tests so future UI wiring does not accidentally admit duplicate pools or placeholder router contracts.

## Changed

- `scripts/validate-defi-registry.mjs`
  - Strict placeholder detection now rejects any obviously repeated-character Juno address placeholder such as `juno1rrrr...`, not just the earlier `q`/`p` fixtures.
- `scripts/test-defi-registry-validator.mjs`
  - Added duplicate pair contract coverage.
  - Added strict-mode router placeholder coverage with non-placeholder fixture values for the other fields.
  - Updated the smoke-test success line to name the expanded guard surface.

## Verification

```sh
node scripts/validate-defi-registry.mjs docs/defi-v1-pool-registry.example.json
node scripts/validate-defi-registry.mjs --strict docs/defi-v1-pool-registry.example.json
node scripts/test-defi-registry-validator.mjs
```

Observed output:

```text
ok: juno-1 registry has 1 pool(s), 1 unique pair contract(s)
registry validation failed: factory must be a verified mainnet value, not a placeholder
ok: validator smoke tests passed (valid, strict placeholders, duplicate assets, duplicate pairs, strict router, scope guard)
strict_status=1 test_status=0
```

## Next smallest step

Replace the placeholder example with a strict-passable `docs/defi-v1-pool-registry.juno-1.json` once a real mainnet factory/pair/LP/IBC denom set is independently verified.

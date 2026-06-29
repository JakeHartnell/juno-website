# Juno Autonomous Work Backlog

Purpose: lightweight task source for the generic Juno builder heartbeat. The cron may add, refine, or complete items here when no kanban task is available.

## Selection rule

Pick one bounded slice per run. Prefer tasks that can produce a verified artifact: note, branch, test result, issue/PR draft, code change, design artifact, or chain query.

## Priority themes

1. Juno Agents DAO / agentic governance
   - DAO DAO UI support for `cw721-roles` and `dao-voting-cw721-roles`.
   - Role-aware mint proposal action for agent membership NFTs.
   - Agent profile/PFP/metadata conventions.

2. DeFi revival
   - Juno-native DEX UI around Astroport contracts.
   - Simple swaps/pools/liquidity first; avoid v1 scope creep.

3. Website / narrative
   - Redesign within current Juno brand: colors, logo, core identity preserved.
   - Make Juno feel alive, agentic, sovereign, useful.

4. DAO DAO ecosystem work
   - Gauges, augmented bonding curves, staked-JUNO voting UI/contracts.
   - v30 is review-blocked; respond only if new review feedback appears.

5. Prediction markets
   - Productize `cw-reality` as Juno Prediction Markets.

6. Infrastructure / agents
   - Improve Juno-optimized Hermes image/tooling.
   - Write docs so other agents can run nodes, build, and participate.

7. Juno drop infrastructure
   - ERC20 Merkle drop.
   - GitHub governance tooling drop: deterministic collector/scorer, evidence report, Merkle integration, and GitHub identity-to-Juno-address claim adapter.

## Fun fallback projects

If no actionable tasks are found, invent one small Juno-forward project, for example:

- A meme/banner/recruitment asset.
- A tiny README explaining how an agent joins Juno Agents DAO.
- A repo map or architecture diagram.
- A market/governance mechanism note.
- A local script/check that helps future Juno work.

## Completed / notes

Append short notes here or in `/opt/data/repos/juno-agents-dao-notes/` when useful. Do not store secrets.

- 2026-06-28: DAO DAO UI upstream PR opened: DA0-DA0/dao-dao-ui#1856. Local lint/build checks were green; GitHub package/test/lint checks are passing or running, Vercel deploy checks fail due authorization gating.
- 2026-06-28: Added Juno Agents DAO membership NFT metadata convention and validated example JSON under `/opt/data/repos/juno-agents-dao-notes/`.
- 2026-06-28: Uploaded `cw721-roles` and `dao-voting-cw721-roles` to Juno mainnet as code IDs `5123` and `5124`; patched DAO DAO UI PR #1856 with code IDs in commit `fb26096cd`.
- 2026-06-29: Added `/opt/data/repos/juno-defi-v1-ui-manifest/`, a tiny DeFi v1 UI scope manifest plus validator for swap/pools/liquidity-only launch discipline.
- 2026-06-29: Hardened `/opt/data/repos/juno-website` agentic-revival docs verification with a recursive `npm run docs:links:all` local markdown link check; verified 14 links across 16 markdown files.
- 2026-06-29: Added `/opt/data/repos/cw-reality/docs/juno-prediction-market-seed-questions-2026-06-29.md`, a five-question low-stakes seed queue for Juno Reality Markets; verified table count and AskQuestion JSON shape.
- 2026-06-29: Added `/opt/data/repos/juno-agents-dao-notes/governance-timeline-2026-06-29.md`, a read-only timeline for Juno Agents DAO proposals 1–3 plus current public DAO/steward metadata; verified live LCD proposal/config/NFT state.
- 2026-06-29: Added deploy-time config guardrails to `/opt/data/repos/juno-defi-v1-ui-manifest/`: example config plus `validate_deployment_config.py`; verified all three DeFi v1 validators.

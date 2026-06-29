# Public heartbeat source map + style guard

Purpose: keep the daily public Juno update sharp, truthful, and sourced from real worker receipts. Public posts should feel like native community updates, not scheduler output.

## Current public post path

- Public job: `bb707cc967ca` — `Juno daily community heartbeat`.
- Delivery target: `telegram:Junø 🤝 AI (group)`.
- Schedule: daily (`every 1440m`).
- It currently summarizes four upstream worker outputs via `context_from`:
  - `e2821a5c9198` — Juno general builder heartbeat.
  - `bad062ff01ac` — Juno GitHub drop worker.
  - `e63f80babdca` — Juno DEX worker.
  - `00514d58c132` — Juno website narrative worker.

## Worker outputs that feed public posts

Use these as the public source map:

1. General builder heartbeat (`e2821a5c9198`)
   - Best for: broad Juno autonomous work, backlog slices, governance/agent/website/DeFi/tooling artifacts.
   - Recent signal: DeFi v1 UI manifest deployment guardrails with validators passing.
   - Public angle: agents are turning loose strategy into bounded, verified artifacts.

2. Website narrative worker (`00514d58c132`)
   - Best for: public narrative, homepage heartbeat surface, Storyblok/static previews, docs/link checks.
   - Recent signal: latest heartbeat receipt linked from the homepage heartbeat CTA; preview/check/link commands passed.
   - Public angle: Juno is making agent work inspectable instead of vibe-based.

3. DEX worker (`e63f80babdca`)
   - Best for: simple Juno DeFi v1 launch readiness using Astroport-Juno as base.
   - Recent signal: frontend release checklist guard and CI wiring for deployment handoff files.
   - Public angle: DeFi work is deliberately boring and shippable: swaps, pools, liquidity, operator handoff.

4. GitHub drop worker (`bad062ff01ac`)
   - Best for: governance contributor discovery, raw GitHub evidence, recipient/audit/Merkle artifacts.
   - Recent signal: live raw evidence refresh for `snapshot-labs/snapshot`, queue reduced, tests passed.
   - Public angle: Juno is mapping real builder history into future governance/onboarding surfaces.

Do not treat the proposal watcher (`6d8ce4b76a94`) as daily public hype. It is operational monitoring for the Juno Agents DAO. Only mention it publicly when there is actionable governance activity: open vote, executable/passed proposal, failed proposal requiring attention, or a new proposal with a clear voter action.

## What not to say publicly

- No scheduler/tooling metadata: cron, job IDs, `context_from`, injected context, run IDs, tool names, wrapper headers, or internal paths unless linking a deliberate public artifact.
- No private-operator details: keys, seed phrases, auth failures, wallet internals beyond already-public addresses/proposals/contracts.
- No claims of governance consensus unless a passed vote is linked.
- No "we shipped v30" or similar chain-release claims while v30 is blocked on external review.
- No market advice, price talk, promised returns, token pumping, or fake certainty.
- No overclaiming: a local note, draft, guard, or checklist is not a launched product.
- No speaking as Jake, no pretending to represent all Juno voters/community members.
- No generic AI/SaaS sludge: avoid "leveraging synergies", "revolutionary", "seamless experience", "unlocking value".

## Concise Juno voice rules

- Sharp, sovereign, operational.
- Lead with the artifact or lesson, not the process.
- One public post = one clear theme plus 2-4 concrete receipts.
- Use concrete nouns: proposal, guard, diff, checklist, preview, query, contract, route, validator.
- Keep the boundary explicit when needed: agents can recommend and execute scoped work; voters decide power.
- Bullish is fine; financial advice is not.
- Prefer: "Agents are making Juno inspectable: website receipts, DEX launch guards, governance evidence. Builders who want accountable agent-run DAOs should pay attention."
- Avoid: "Cron ran multiple jobs today and generated outputs across repositories."

## `[SILENT]` / skip criteria

Return exactly `[SILENT]` or skip the public update when:

- The only fresh source is routine monitoring with no actionable change, e.g. proposal watcher says all proposals are executed/no action.
- Upstream worker outputs are failures, retries, or internal cleanup with no public artifact or useful blocker.
- The update would mostly repeat yesterday's message.
- Verification is missing and the claim would sound shipped without proof.
- The strongest available item is purely local and not explainable without exposing internal paths/tooling.
- The post would need caveats longer than the update.

A weak but valid public update may be posted only if it has at least one inspectable artifact or blocker and can be stated in plain language. Blockers are publishable when they teach something real: "v30 remains external-review blocked" is acceptable; "the agent had a tool error" is not.

## Quick preflight before public posting

- Pick 1 theme from the four public source workers.
- Check that at least one receipt has verification: command passed, file changed, proposal status, PR/diff, or explicit blocker.
- Remove all scheduler/internal language.
- Add governance boundary if the post mentions power, proposals, DAO decisions, or community direction.
- Cut to short Telegram length before sending.

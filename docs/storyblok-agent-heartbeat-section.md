# Storyblok agent heartbeat section

Purpose: give the homepage one small, shippable surface that proves Juno is being worked on by accountable agents without claiming governance consensus.

## Placement

Add below the hero proof points or just above the ecosystem/apps section. It should feel like a live workbench, not a campaign banner.

## Section copy

**Eyebrow:** Agent heartbeat

**Headline:** The chain wakes up in public.

**Body:** Juno agents should ship visible work: proposal drafts, node checks, treasury notes, DeFi registry updates, and plain-language summaries voters can inspect. The mandate stays with governance. The work gets cheaper, faster, and easier to verify.

**Primary CTA:** Run a Juno agent

**Secondary CTA:** Read the latest heartbeat

## Three proof cards

1. **Narrow mandate** — One agent, one job, one public trail. No invisible stewardship.
2. **Verified outputs** — Every note links to a source, command, diff, proposal, or blocker.
3. **Governance boundary** — Agents recommend and execute scoped work; voters decide power.

## Storyblok assembly

Use existing primitives only:

- `AppSection` with `spacing: Lg` and alternate brown background if contrast is needed.
- `AppHeadline` for eyebrow (`Secondary1`) and headline (`HeadlineH2`).
- `RichText` or existing paragraph block for body.
- `AppGrid`/`GridItem` or three `AppInfobox` blocks for proof cards.
- `AppButton` primary link to `/docs/run-a-juno-agent` or the eventual agent page.

## Acceptance checklist

- [ ] Does not say agents speak for the community.
- [ ] Includes at least one concrete work category: governance, nodes, treasury, docs, or DeFi.
- [ ] Links to `docs/run-a-juno-agent.md` until a public route exists.
- [ ] Uses verbs: run, verify, ship, vote.
- [ ] Build or type-check output is captured in PR notes.

## Telegram teaser

Juno does not need mascot bots. It needs accountable workers. Run an agent with a narrow mandate, publish the artifacts, and let governance decide what deserves more power. Forward is a verb: run, verify, ship.

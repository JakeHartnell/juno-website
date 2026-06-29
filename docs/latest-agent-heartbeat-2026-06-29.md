# Agent heartbeat: 2026-06-29 — Latest heartbeat receipt

**Mandate:** Make the homepage heartbeat CTA point at an inspectable agent receipt instead of a preview placeholder.

**Artifact type:** `diff`

**Artifact link or output:** `docs/latest-agent-heartbeat-2026-06-29.md`

**What changed:**
- Added the first latest-heartbeat receipt using the strict one-artifact template.
- Gave the Storyblok heartbeat section a concrete target for `Read the latest heartbeat`.
- Kept the public boundary explicit: agents show work; voters decide power.

**Verification:** `npm run storyblok:heartbeat:preview`, `npm run storyblok:heartbeat:check`, and `npm run docs:links:all` passed on 2026-06-29T12:52:50Z.

**Governance boundary:** Agents recommend or execute scoped work; voters decide power. This entry does not claim community consensus.

**Next bounded slice:** Add a lightweight updates index or route so heartbeat receipts are browsable without linking directly to raw markdown.

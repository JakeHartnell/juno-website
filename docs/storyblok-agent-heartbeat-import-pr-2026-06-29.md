# PR draft: import the Agent heartbeat homepage section

## Title

Add Agent heartbeat section to the homepage

## Summary

This PR imports a bounded Storyblok section that makes the Juno homepage feel alive without pretending agents speak for governance.

The section frames agents as accountable workers under narrow mandates: proposal drafts, node checks, treasury notes, DeFi registry updates, and voter-readable summaries. It gives visitors two actions: run a Juno agent, or inspect the latest heartbeat while the public updates surface is still forming.

## Files to include

- `docs/storyblok-agent-heartbeat-section.md` — placement, copy, Storyblok assembly notes, acceptance checklist.
- `docs/storyblok-agent-heartbeat-entry-draft.json` — import-ready Storyblok-shaped fixture.
- `docs/storyblok-agent-heartbeat-preview.html` — static visual preview generated from the fixture.
- `scripts/render-storyblok-fixture.mjs` — dependency-free fixture renderer.
- `package.json` — `storyblok:heartbeat:preview` script.
- `README.md` — links to the heartbeat spec, fixture, and preview.

## Placement

Homepage, below hero proof points or just above the ecosystem/apps section.

It should read like a live workbench, not a fundraising banner: one chain, visible work, governance still sovereign.

## Governance boundary

Safe copy principle:

> Agents recommend and execute scoped work; voters decide power.

Do not change this into “Juno governance wants…” or “the community has decided…” unless there is an actual passed proposal to cite. The section is a narrative surface for accountable work, not a substitute for voting.

## Temporary links

- Primary CTA: `Run a Juno agent` → `/docs/run-a-juno-agent.md`
- Secondary CTA: `Read the latest heartbeat` → `/docs/storyblok-agent-heartbeat-preview.html`

Before production publish, replace these with public routes if available. If not available, keep the links repo-scoped in PR notes rather than presenting them as final website URLs.

## Verification commands

```bash
npm run storyblok:heartbeat:preview
node - <<'NODE'
const fs = require('node:fs')
const entry = JSON.parse(fs.readFileSync('docs/storyblok-agent-heartbeat-entry-draft.json', 'utf8'))
const html = fs.readFileSync('docs/storyblok-agent-heartbeat-preview.html', 'utf8')
const text = JSON.stringify(entry)
for (const needle of [
  'Agent heartbeat',
  'The chain wakes up in public.',
  'proposal drafts',
  'node checks',
  'treasury notes',
  'DeFi registry updates',
  'voters decide power',
  'Run a Juno agent',
  'Read the latest heartbeat'
]) {
  if (!text.includes(needle) && !html.includes(needle)) throw new Error(`missing ${needle}`)
}
if (!html.includes('sb-appbutton--secondary')) throw new Error('secondary CTA style missing')
console.log('OK: heartbeat PR fixture guard passed')
NODE
```

## Reviewer checklist

- [ ] Section is placed near the top of the homepage but below the main hero claim.
- [ ] Copy names concrete work categories: governance, nodes, treasury, docs, or DeFi.
- [ ] No sentence claims to speak for voters or governance consensus.
- [ ] Both CTAs are present, or the missing route is called out as a launch blocker.
- [ ] Preview command output is pasted into the PR.

## Follow-up after merge

Create the first public heartbeat entry with one real artifact: a diff, command output, proposal draft, validator check, or blocker. The heartbeat must prove work, not perform theater.

# Agent heartbeat: 2026-06-29 — Storyblok preview verification

**Mandate:** Make the homepage agent-heartbeat section importable with a checked local preview before anyone touches production content.

**Artifact type:** `validator check`

**Artifact link or output:** `docs/storyblok-agent-heartbeat-preview.html`, regenerated from `docs/storyblok-agent-heartbeat-entry-draft.json`.

**What changed:**
- Regenerated the static Storyblok fixture preview for the Agent heartbeat homepage section.
- Verified the fixture contains the headline, concrete work categories, governance-boundary copy, and both CTAs.
- Captured this heartbeat receipt so the import PR has a fresh proof artifact.

**Verification:**

```bash
$ npm run storyblok:heartbeat:preview
OK: rendered Storyblok fixture preview to docs/storyblok-agent-heartbeat-preview.html
components={"AppSection":1,"AppHeadline":5,"RichText":1,"AppGrid":1,"GridItem":3,"AppInfobox":3,"AppButton":2}

$ node - <<'NODE'
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
OK: heartbeat PR fixture guard passed
```

**Governance boundary:** Agents recommend and execute scoped work; voters decide power.

**Next bounded slice:** Wire the first public heartbeat route or replace the temporary `/docs/storyblok-agent-heartbeat-preview.html` CTA with its production URL.

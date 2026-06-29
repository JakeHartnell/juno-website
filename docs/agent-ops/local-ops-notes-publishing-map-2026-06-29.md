# Local Juno ops notes publishing map — 2026-06-29

Purpose: keep useful local-only operating notes in repo-backed docs so future agents and humans can inspect, link, and review them.

## Home decisions

| Local artifact | Repo-backed home | Why |
| --- | --- | --- |
| `/opt/data/repos/juno-agents-dao-notes/external-agent-join-proposal-skeleton.md` | `juno-website/docs/agent-ops/juno-agents-dao-external-agent-join-proposal-skeleton.md` | Public-facing Juno Agents DAO onboarding/proposal material belongs beside the agentic revival docs. |
| `/opt/data/repos/public-heartbeat-source-map-style-guard.md` | `juno-website/docs/agent-ops/public-heartbeat-source-map-style-guard.md` | Public heartbeat style/source rules are website/community comms source material, not chain code. |
| `/opt/data/repos/juno-work-backlog.md` | `juno-website/docs/agent-ops/juno-autonomous-work-backlog.md` | The backlog explains bounded autonomous work lanes and should be visible with other agent ops docs. |
| `/opt/data/repos/juno-v30-review-watch-plan.md` | `juno/planning/V30-EXTERNAL-REVIEW-WATCH-PLAN.md` | v30 review watch rules are release-ops material tied to the chain repo and PR #1202. |

## Maintenance rule

When a local operational note becomes useful to future workers, copy it into the most specific repo-backed docs path, link it from the nearest README/index, run the local docs checks, then commit it on a docs branch.

# Agent template

Copy this skeleton to `.opencode/agents/<name>.md` to add a role agent.
Only the three marked sections are role-specific; everything else is shared
process that lives once (AGENTS.md is auto-loaded, the `agent-comms` skill
auto-surfaces). Change nothing you don't understand.

## Frontmatter

```markdown
---
description: <WHEN this agent is used — 1-2 sentences, front-load the trigger words or filenames a prompt would mention. This is the only thing another agent sees to decide to delegate to you.>
mode: <subagent | primary>          # subagent for task workers invoked via Task/@name; primary only if a human starts sessions with this title
permission:                         # least privilege; omit for defaults
  bash:
    "git *": allow                  # checkout/fetch/branch/commit/push
    "gh *": allow                   # pr review/merge
    "<the agent's own worktree-scoped commands>": allow
    "*": ask
---

You are the **<role>** agent for this repository.

## Role

<1-2 sentences: what this role owns in the codebase, and what it must never touch.>

## Task procedure

<The role's standard procedure, written as steps. Ground it in the repo's plans — `agents/documentation/plan.md` — and reference how this role verifies its own work (commands, tests).>

## Process rules

- Follow the workflow in `AGENTS.md`: branch from `master`, focused scope, unit
  tests for behavior, run your checks, open a PR targeting `master`, and notify
  the `reviewer` agent. A step is not done until a PR is open and the reviewer
  is notified.
- Follow the `agent-comms` ritual: read the bus at session start, send a
  `notice` (branch/PR/state) before switching branches or ending a session, and
  reply `result` when delegated work completes.

## Hard rules

<List the absolute prohibitions for this role (e.g. don't touch certain dirs, don't commit secrets, don't self-merge).>
```

## Checklist when adding an agent

- [ ] File lives in `.opencode/agents/`; name matches bus addressing (`to: <name>`).
- [ ] `description` has real trigger keywords so it surfaces when delegating.
- [ ] `mode: subagent` unless a human launches it directly.
- [ ] `permission` grants only what the role needs (read/edit default-allow, bash least-privilege).
- [ ] Procedure names real files/plans and gives the verify command.
- [ ] `steps` (max agentic iterations) set when the task is long-running.
---
name: agent-comms
description: Inter-agent communication over openbus. Use when delegating or receiving work from another agent, coordinating with other agents, starting or ending a session, switching branches/worktrees, notifying the review agent, checking for messages addressed to your agent name, or handling a @-mention in another agent's report. Covers sending, reading, acknowledging, and resolving bus messages.
---

# openbus for agents

opencode agents are stateless: each session is a fresh process with no memory of
the last. openbus gives agents a durable, shared mailbox so work can hand off
between sessions, branches, and parallel worktrees.

## 1. What the bus is

- One **message = one Markdown file** with a YAML envelope (id, from, to,
  thread, kind, created, ...) plus a body.
- Stored on the machine (default `~/.local/share/opencode/comms/<repo>/`,
  override `OPENCODE_BUS_DIR`), shared by **all agents and worktrees** on this
  machine.
- Append-only and **pull-based**: you find messages, they do not come to you.
- **Presence** (`bus who`) is best-effort only; never rely on it for correctness.

## 2. The check-in ritual (do this on every session)

1. **On session start**, run `bus list --unread --name <your-name>` — if you
   don't know your agent name, run `bus list` and infer it from `from:` values,
   or ask the user. Read anything addressed to you.
   Then `bus mark-read --name <your-name>` to advance the cursor.
2. **Before switching branches, opening a PR, or ending a session**: send a
   `notice` (to `*` or the thread owner) summarizing what you finished, what is
   still open, and which branch/PR. This is what lets the next session resume.
3. **When you finish a delegated task**: reply `result` with `status: done` (or
   `failed`) and evidence in `branch`/`pr`.
4. **When you accept a task**: reply `ack` with `status: in_progress` so the
   requester knows it is covered.

## 3. Sending a message

Always use the scripts — never write envelope files by hand.

```sh
B="node .opencode/comms/bus.mjs"     # or: bun .opencode/comms/bus.mjs
$B send --from arch --to review --kind request --thread review:step-2-state \
        --title "Please review step-2-state" --branch frontend/step-2-state \
        --ttl 120 --body "Branch is ready. Run: bun run check && bun run test."
```

Kinds: `request` (delegate), `result` (finished), `question`/`answer`
(blocked/info), `ack` (accepted / picked up), `notice` (broadcast update).
`request`/`result`/`question`/`answer` require `--thread`. Replies always carry
`--in <parent-id>`.

## 4. Reading

```sh
$B list                                # everything, newest last
$B list --to review --unread --name review
$B read  --thread review:step-2-state --mark --name review   # full bodies + cursor
$B who                                 # which agents are active (advisory)
```

## 5. Lifecycle of a delegated task

```
requester -> request (status: open)
agent     -> ack      (status: in_progress)     "I'll take it"
agent     -> result   (status: done | failed)   evidence: branch, PR, checks
```

- If a `request` is past its `ttl_minutes` and still `open`, reply `result`
  `status: expired` and take over or escalate rather than letting it rot.
- If you cannot finish, reply `failed` **with a clear statement of what is
  blocked and the suggested next owner**.

## 6. Rules of the road

- Address by agent name (or `*`); strip `@` prefixes.
- One thread per unit of work (`<topic>:<branch>`), not one thread per message.
- Keep bodies small: put detail in the branch/PR and link it.
- Never put secrets, full logs, or generated content into envelopes.
- The bus is never git-tracked and never committed.
- Re-reading is harmless; if a message seems stale, read the whole thread before
  answering. At-least-once delivery means you may see a request twice — ack
  once, then treat repeats as noise.
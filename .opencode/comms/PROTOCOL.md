# openbus — Inter-agent communication protocol

Openbus is the message-passing + presence system that lets opencode agents —
which are otherwise stateless, session-scoped processes — exchange durable
messages with each other. It is the explicit, shared channel underneath the
multi-agent workflow described in the repository root `AGENTS.md`.

**Read `skills/agent-comms/SKILL.md` first if you are an agent.** This file is
the reference contract; the skill is the playbook that teaches agents when and
how to use it.

---

## 1. Model

- **Durable, append-only mailbox.** Every message is one Markdown file (a YAML
  "envelope" header plus a free-form body). Messages are never edited or
  deleted; replies link to parents via `in_reply_to`. This makes the bus a
  crash-safe event log that survives agent restarts.
- **Shared across agents and worktrees.** The bus lives in a machine-level
  directory (see §3), because work-in-parallel agents run in sibling git
  worktrees whose on-disk `.opencode/` directories are separate. Pointing the
  bus at a git root-derived machine location gives every agent the same view.
- **Pull-based delivery.** Agents cannot be woken up, so delivery is
  *at-least-once reads* driven by a per-agent cursor (§6). There is no push.
- **Presence is best-effort.** A plugin publishes which agents/sessions are
  live (`who`). Do not depend on presence for correctness; use it for timing.

## 2. Envelope

The envelope is the YAML frontmatter of each message file.
Machine-readable schema: `envelope.schema.json`.

| Field | Required | Meaning |
| :--- | :--- | :--- |
| `id` | always | UUID of this message. |
| `from` | always | Sender agent name (no `@`). |
| `to` | always | Recipient agent name, comma-separated list, or `*` broadcast. |
| `thread` | always | Thread id grouping an exchange, e.g. `review:<branch>`. |
| `kind` | always | `request`, `result`, `question`, `answer`, `ack`, `notice`. |
| `created` | always | UTC ISO-8601 timestamp. |
| `title` | optional | One-line subject. |
| `in_reply_to` | optional | Parent message id (answers, acks, results). |
| `priority` | optional | `normal` (default) or `high`. |
| `status` | optional | Lifecycle: `open`, `ack`, `in_progress`, `done`, `failed`, `expired`. |
| `branch` / `pr` | optional | Refs the message points at. |
| `ttl_minutes` | optional | Request expiry; the recipient expires the request past this. |
| `body` | file body | Free-form Markdown. Keep bodies small; attach detail via refs. |

Agent names are lowercased with no `@` prefix; `*` means broadcast.

## 3. Location

- Bus root (env override): `OPENCODE_BUS_DIR`
- Default: `<XDG_DATA_HOME|~/.local/share>/opencode/comms/<git-root-name>/`
- Layout:

```
<bus>/
  messages/<YYYY>/<MM>/<stamp>-<from>-<id>.md   # append-only envelopes
  presence/<agent>.json                          # written by the plugin
  state/cursor                                   # per-agent read cursors
```

`OPENCODE_BUS_DIR` overrides everything and is the recommended way to run an
isolated bus during testing.

## 4. Kinds and lifecycle

The standard workflow is a **work request**:

```
sender                  recipient
  |  request (status: open)      |
  |----------------------------->|
  |  ack (status: in_progress)   |
  |<-----------------------------|
  |  result (status: done|failed)|
  |<-----------------------------|
```

- `request` — delegate a task. `status: open`, plus `ttl_minutes` when there is
  a deadline.
- `ack` — picked it up; `status: in_progress` or `ack`. Always references
  `in_reply_to`.
- `result` — completed. `status: done` or `failed`. Include concrete evidence
  (branch, PR, checks run) in `branch`/`pr` and the body.
- `question` / `answer` — blocked-on or informational exchange.
- `notice` — unaddressed broadcast (e.g. "branch merged"), usually `to: *`.

**Expiry:** if a `request` is past `created + ttl_minutes` and not `done`,
any interested agent may reply `result` with `status: expired` and take over or
escalate. Status is carried on replies; the envelope itself is immutable.

## 5. Invocation

```sh
# from the repo root; works with both node and bun
bun  .opencode/comms/bus.mjs send    --from arch --to review --kind request --thread review:step-2-state --title "Review step-2-state" --branch frontend/step-2-state --body "..." 
node .opencode/comms/bus.mjs list    --to review --unread --name review
node .opencode/comms/bus.mjs read    --thread review:step-2-state --mark --name review
node .opencode/comms/bus.mjs ack     <msgid> --from review --status in_progress
node .opencode/comms/bus.mjs respond --in <msgid> --from review --status done --branch frontend/step-2-state --body "..."
node .opencode/comms/bus.mjs who
```

Run `bus.mjs help` for the full command surface. The CLI validates required
fields and writes envelopes atomically (temp file + rename).

## 6. Read tracking

- `mark-read --name <me>` (or `read ... --mark --name <me>`) stores a cursor.
- `list --unread --name <me>` shows only messages newer than the cursor.
- Tracking is per-agent, not per-message: re-reading is harmless, so an agent
  that misses a check-in simply reads the thread again.

## 7. Conventions

- Never hand-write envelope files; always use `bus.mjs`.
- Always reply with `in_reply_to` set; keep one thread per unit of work.
- Never put credentials, logs, or payloads into envelopes — link to files/branches.
- Messages are committed to no git branch; the bus directory is never staged.
- Presence (`who`) is advisory. If a recipient is away, leave the request
  `open` with `ttl_minutes`; do not silently assume delivery.

## 8. Adding role agents

Role agents are thin files in `.opencode/agents/<name>.md`. The name is the bus
address (`to: <name>`), so it must match how you delegate. Start from the
template in `.opencode/docs/agent-template.md` — the only parts that change are
`description`, `permission`, and the "Task procedure" body. Never duplicate
shared process (AGENTS.md is auto-loaded; the `agent-comms` skill auto-surfaces).

Current role agents: `reviewer`, `backend-dev`, `frontend-dev`, `documenter`.
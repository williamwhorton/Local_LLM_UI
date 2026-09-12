// openbus presence plugin — publishes which agent/session is live, based on
// opencode session bus events. Advisory only: README/PROTOCOL treat presence
// as best-effort; correctness comes from the durable message envelopes.
//
// No external dependencies. Runs under Bun (plugin host) using node builtins.

import { execSync } from "node:child_process"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"

function gitToplevel(cwd) {
  try {
    const out = execSync("git rev-parse --show-toplevel", {
      cwd: cwd ?? process.cwd(),
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim()
    return out || null
  } catch {
    return null
  }
}

function resolveBusDir(cwd) {
  if (process.env.OPENCODE_BUS_DIR) return path.resolve(process.env.OPENCODE_BUS_DIR)
  const toplevel = gitToplevel(cwd)
  const slug = (toplevel ? path.basename(toplevel) : path.basename(cwd ?? process.cwd())) || "default"
  const base = process.env.XDG_DATA_HOME
    ? path.resolve(process.env.XDG_DATA_HOME)
    : path.join(os.homedir(), ".local", "share")
  return path.join(base, "opencode", "comms", slug)
}

function presenceFile(bus, name) {
  const safe = String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "agent"
  return path.join(bus, "presence", `${safe}.json`)
}

function readPresence(bus, name) {
  try {
    return JSON.parse(fs.readFileSync(presenceFile(bus, name), "utf8"))
  } catch {
    return {}
  }
}

function writePresence(bus, name, patch, worktree, cwd) {
  try {
    const file = presenceFile(bus, name)
    fs.mkdirSync(path.dirname(file), { recursive: true })
    const next = {
      ...readPresence(bus, name),
      agent: name,
      worktree: worktree ?? null,
      directory: cwd ?? null,
      updatedAt: new Date().toISOString(),
      ...patch,
    }
    const tmp = `${file}.tmp`
    fs.writeFileSync(tmp, JSON.stringify(next, null, 2), "utf8")
    fs.renameSync(tmp, file)
  } catch (err) {
    // Presence is advisory; never let a failure break the session.
    void err
  }
}

function sessionInfo(event) {
  const e = event ?? {}
  const session = e.properties?.session ?? e.properties ?? e.session ?? {}
  const sessionId = session?.id ?? session?.sessionID ?? e.sessionId ?? e.sessionID ?? "unknown"
  const agent = session?.agent ?? session?.agentName ?? e.agentName ?? e.agent ?? null
  return { sessionId, agent, properties: session }
}

export const OpenbusPresencePlugin = async ({ worktree, directory, $ }) => {
  return {
    event: async ({ event }) => {
      if (!event || !event.type) return
      const { sessionId, agent } = sessionInfo(event)
      const name = agent ?? sessionId
      const bus = resolveBusDir(directory ?? process.cwd())

      switch (event.type) {
        case "session.created":
          writePresence(bus, name, { active: true, sessionId }, worktree, directory)
          break
        case "session.idle":
          writePresence(bus, name, { active: false, sessionId, lastSeen: new Date().toISOString() }, worktree, directory)
          break
        case "session.error":
          writePresence(bus, name, { active: false, error: true, sessionId }, worktree, directory)
          break
        default:
          break
      }
    },
  }
}
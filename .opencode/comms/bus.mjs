#!/usr/bin/env node
// openbus - inter-agent message bus for opencode agents.
// Zero-dependency; works with `node` or `bun`. Protocol: PROTOCOL.md.
//
// The bus is a durable, append-only store of envelope files in a shared
// machine-level directory, so stateless opencode sessions and parallel
// git worktrees all see the same messages.
//
//   OPENCODE_BUS_DIR  override the bus directory (defaults to
//                     $XDG_DATA_HOME|~/.local/share/opencode/comms/<repo>)

import { execSync } from "node:child_process"
import crypto from "node:crypto"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.dirname(fileURLToPath(import.meta.url))
const KINDS = ["request", "result", "question", "answer", "ack", "notice"]
const STATUSES = ["open", "ack", "in_progress", "done", "failed", "expired"]

// ---------------------------------------------------------------------------
// Paths / helpers
// ---------------------------------------------------------------------------

function gitToplevel() {
  try {
    const out = execSync("git rev-parse --show-toplevel", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim()
    return out || null
  } catch {
    return null
  }
}

export function resolveBusDir() {
  if (process.env.OPENCODE_BUS_DIR) return path.resolve(process.env.OPENCODE_BUS_DIR)
  const toplevel = gitToplevel()
  const slug = (toplevel ? path.basename(toplevel) : path.basename(process.cwd())) || "default"
  const base = process.env.XDG_DATA_HOME
    ? path.resolve(process.env.XDG_DATA_HOME)
    : path.join(os.homedir(), ".local", "share")
  return path.join(base, "opencode", "comms", slug)
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "agent"
}

function nowIso() {
  return new Date().toISOString()
}

function stamp() {
  return nowIso().replace(/[:.]/g, "")
}

function shortId() {
  return crypto.randomUUID().slice(0, 8)
}

function readStdin() {
  return fs.readFileSync(0, "utf8").trim()
}

function stripAt(addr) {
  return String(addr).replace(/^@+/, "")
}

function quoteYaml(value) {
  return `'${String(value).replace(/'/g, "''")}'`
}

function unquoteYaml(value) {
  const v = String(value)
  if (v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1).replace(/''/g, "'")
  return v.replace(/^"(.*)"$/, "$1")
}

// ---------------------------------------------------------------------------
// Envelope read/write
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = {}
  const positional = []
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a.startsWith("--")) {
      const key = a.slice(2)
      const next = argv[i + 1]
      if (next !== undefined && !next.startsWith("--")) {
        args[key] = next
        i++
      } else {
        args[key] = true
      }
    } else {
      positional.push(a)
    }
  }
  args._ = positional
  return args
}

function writeEnvelope(meta, body) {
  const bus = resolveBusDir()
  const date = meta.created.slice(0, 10) // YYYY-MM-DD
  const name = `${stamp()}-${slugify(meta.from)}-${shortId()}.md`
  const file = path.join(bus, "messages", date.slice(0, 4), date.slice(5, 7), name)
  ensureDir(path.dirname(file))

  const lines = ["---"]
  for (const key of Object.keys(meta)) lines.push(`${key}: ${quoteYaml(meta[key])}`)
  lines.push("---", "", body?.trim() ?? "")
  const raw = lines.join("\n") + "\n"

  const tmp = file + ".tmp"
  fs.writeFileSync(tmp, raw, "utf8")
  fs.renameSync(tmp, file) // atomic-ish publish
  return { file, id: meta.id }
}

function readEnvelope(file) {
  const raw = fs.readFileSync(file, "utf8")
  const match = raw.match(/^---\n([\s\S]*?)\n---\n\n?([\s\S]*)$/)
  if (!match) return null
  const meta = {}
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(": ")
    if (idx < 0) continue
    meta[line.slice(0, idx)] = unquoteYaml(line.slice(idx + 2))
  }
  return { ...meta, body: (match[2] ?? "").trim() }
}

function listEnvelopes() {
  const bus = resolveBusDir()
  const dir = path.join(bus, "messages")
  if (!fs.existsSync(dir)) return []
  const files = []
  for (const year of fs.readdirSync(dir)) {
    const yp = path.join(dir, year)
    if (!fs.statSync(yp).isDirectory()) continue
    for (const month of fs.readdirSync(yp)) {
      const mp = path.join(yp, month)
      if (!fs.statSync(mp).isDirectory()) continue
      for (const name of fs.readdirSync(mp)) {
        if (!name.endsWith(".md")) continue
        const env = readEnvelope(path.join(mp, name))
        if (env) files.push(env)
      }
    }
  }
  return files
}

function matches(env, f) {
  if (f.to && stripAt(f.to) !== "*" && env.to !== stripAt(f.to)) return false
  if (f.from && env.from !== f.from) return false
  if (f.thread && env.thread !== f.thread) return false
  if (f.kind && env.kind !== f.kind) return false
  if (f.status && env.status !== f.status) return false
  if (f["in"] && env.in_reply_to !== f["in"]) return false
  if (f.unread && f.name) {
    const cursor = readCursor(f.name)
    if (cursor && env.created <= cursor) return false
  }
  return true
}

function cursorFile() {
  return path.join(resolveBusDir(), "state", "cursor")
}

function readCursor(name) {
  try {
    const raw = fs.readFileSync(cursorFile(), "utf8")
    const entry = raw.split("\n").find((line) => line.startsWith(`${name} `))
    return entry ? entry.split(" ")[1] : null
  } catch {
    return null
  }
}

function writeCursor(name, at) {
  const file = cursorFile()
  ensureDir(path.dirname(file))
  const raw = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : ""
  const lines = raw.split("\n").filter((l) => l && !l.startsWith(`${name} `))
  lines.push(`${name} ${at}`)
  fs.writeFileSync(file, lines.join("\n") + "\n", "utf8")
}

function presenceDir() {
  return path.join(resolveBusDir(), "presence")
}

// ---------------------------------------------------------------------------
// Command implementations
// ---------------------------------------------------------------------------

function findById(id) {
  return listEnvelopes().find((env) => env.id === id) ?? null
}

function cmdSend(args, body) {
  const from = stripAt(args.from)
  const to = args.to && stripAt(args.to) !== "*" ? stripAt(args.to) : "*"
  const kind = args.kind
  if (!from) fail("send requires --from <agent name>")
  if (!kind) fail("send requires --kind <" + KINDS.join("|") + ">")
  if (!KINDS.includes(kind)) fail(`invalid kind: ${kind}`)
  const thread = args.thread
  if (["request", "result", "question", "answer"].includes(kind) && !thread)
    fail(`kind "${kind}" requires --thread`)

  let status = args.status
  if (!status && kind === "request") status = "open"
  if (!status && kind === "result" && !args.status) status = "done"
  if (status && !STATUSES.includes(status)) fail(`invalid status: ${status}`)

  const meta = {
    id: args.id ?? crypto.randomUUID(),
    from,
    to,
    thread: thread ?? "",
    kind,
    created: nowIso(),
  }
  if (args.title) meta.title = args.title
  if (args.in) meta.in_reply_to = args.in
  if (args.priority) meta.priority = args.priority
  if (args.branch) meta.branch = args.branch
  if (args.pr) meta.pr = args.pr
  if (args.ttl) meta.ttl_minutes = args.ttl
  if (status) meta.status = status

  const { file } = writeEnvelope(meta, body || "")
  console.log(file)
}

function cmdList(args) {
  const envs = listEnvelopes()
    .filter((env) => matches(env, args))
    .sort((a, b) => (a.created < b.created ? -1 : 1))
  const limit = Number(args.limit ?? 50)
  const slice = Number.isFinite(limit) && limit > 0 ? envs.slice(-limit) : envs
  for (const env of slice) {
    const status = env.status ? ` [${env.status}]` : ""
    console.log(
      `${env.id}  ${env.kind.padEnd(8)} ${env.from} -> ${env.to}  ${env.created}  (${env.thread})${status}  ${env.title ?? ""}`,
    )
  }
  return slice
}

function cmdRead(args) {
  const rows = cmdList(args)
  if (!rows.length) return
  const limit = Number(args.limit ?? 20)
  const slice = Number.isFinite(limit) && limit > 0 ? rows.slice(-limit) : rows
  for (const env of slice) {
    console.log(`\n== ${env.id} :: ${env.kind} ${env.status ?? ""}`)
    console.log(`   from ${env.from} to ${env.to} @ ${env.created} thread=${env.thread}`)
    if (env.in_reply_to) console.log(`   in reply to ${env.in_reply_to}`)
    if (env.branch || env.pr) console.log(`   refs: ${env.branch ?? ""} ${env.pr ?? ""}`.trim())
    if (env.body) console.log(`\n${env.body}`)
  }
  if (args.mark && args.name) writeCursor(stripAt(args.name), nowIso())
}

function cmdAck(args) {
  const [msgid] = args._
  if (!msgid) fail("ack requires a message id")
  const target = findById(msgid)
  if (!target) fail(`no message ${msgid}`)
  const from = args.from ? stripAt(args.from) : fail("ack requires --from <agent name>")
  const status = args.status ?? "ack"
  cmdSend(
    {
      from,
      to: target.from === from ? "*" : target.from,
      thread: target.thread,
      kind: "ack",
      title: `Ack: ${target.title ?? msgid}`,
      in: msgid,
      status,
    },
    args.body || `Acknowledged (${msgid}).`,
  )
}

function cmdRespond(args) {
  const inId = args.in
  const from = args.from ? stripAt(args.from) : fail("respond requires --from <agent name>")
  if (!inId) fail("respond requires --in <message id>")
  const target = findById(inId)
  if (!target) fail(`no message ${inId}`)
  const kind = args.kind ?? "result"
  const status = args.status ?? (kind === "result" ? "done" : undefined)
  if (!status) fail("respond requires --status")
  cmdSend(
    {
      from,
      to: target.from === from ? "*" : target.from,
      thread: args.thread ?? target.thread,
      kind,
      title: args.title ?? `Re: ${target.title ?? inId}`,
      in: inId,
      status,
      branch: args.branch,
    },
    args.body ? args.body : readStdin(),
  )
}

function cmdMarkRead(args) {
  const name = stripAt(args.name)
  if (!name || args.name === true) fail("mark-read requires --name <agent name>")
  writeCursor(name, args.at ?? nowIso())
  console.log(`cursor for ${name} -> ${args.at ?? nowIso()}`)
}

function cmdWho() {
  const dir = presenceDir()
  if (!fs.existsSync(dir)) {
    console.log("(no agent presence recorded)")
    return
  }
  for (const name of fs.readdirSync(dir).sort()) {
    try {
      const p = JSON.parse(fs.readFileSync(path.join(dir, name), "utf8"))
      const where = p.worktree ?? p.directory ?? "?"
      console.log(
        `${p.active ? "active " : "away   "} ${p.agent ?? name}  last=${p.updatedAt ?? "?"}  session=${p.sessionId ?? "?"}  ${where}`,
      )
    } catch {
      /* skip malformed presence file */
    }
  }
}

function fail(msg) {
  console.error(`openbus: ${msg}`)
  process.exit(1)
}

function usage() {
  console.log(`openbus - inter-agent message bus for opencode agents

OVERVIEW
  OPENCODE_BUS_DIR=... node .opencode/comms/bus.mjs <command> [options]

COMMANDS
  send    --from <agent> [--to <agent|*>] --kind <kind> --thread <id>
          [--title ".."] [--in <msgid>] [--priority normal|high]
          [--branch <b>] [--pr <n>] [--ttl <minutes>] [--status <s>]
          [--body "text" | reads stdin]
  list    [--to <agent>] [--from <agent>] [--thread <id>] [--kind <kind>]
          [--status <s>] [--unread --name <me>] [--limit <n>]
  read    (list flags) [--mark --name <me>]
  ack     <msgid> --from <agent> [--status ack|in_progress] [--body ".."]
  respond --in <msgid> --from <agent> [--kind result] --status <done|failed>
          [--thread <id>] [--branch <b>] [--body ".." | stdin]
  mark-read --name <agent> [--at <iso>]
  who     (list agents currently tracked as present)

KINDS:  request | result | question | answer | ack | notice
STATUS: open | ack | in_progress | done | failed | expired
`)
}

function main() {
  const argv = process.argv.slice(2)
  if (!argv.length || argv[0] === "help" || argv[0] === "--help") usage()
  const [cmd, ...rest] = argv
  const args = parseArgs(rest)

  try {
    switch (cmd) {
      case "send":
        cmdSend(args, args.body ? String(args.body) : readStdin())
        break
      case "list":
        cmdList(args)
        break
      case "read":
        cmdRead(args)
        break
      case "ack":
        cmdAck(args)
        break
      case "respond":
        cmdRespond(args)
        break
      case "mark-read":
        cmdMarkRead(args)
        break
      case "who":
        cmdWho()
        break
      default:
        fail(`unknown command: ${cmd}`)
    }
  } catch (err) {
    fail(err instanceof Error ? err.message : String(err))
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main()
}
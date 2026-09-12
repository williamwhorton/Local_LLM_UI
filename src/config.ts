export interface Config {
  readonly host: string
  readonly port: number
  readonly lmStudioUrl: string
  readonly lmStudioApiKey: string | null
  readonly corsOrigin: true | string[]
}

const DEFAULTS = {
  HOST: '127.0.0.1',
  PORT: '3000',
  LM_STUDIO_URL: 'http://127.0.0.1:1234',
} as const

function parsePort(raw: string | undefined): number {
  const value = raw ?? DEFAULTS.PORT
  if (!/^\d+$/.test(value)) {
    throw new Error(`Invalid PORT "${value}": expected an integer between 0 and 65535`)
  }
  const port = Number(value)
  if (port < 0 || port > 65535) {
    throw new Error(`Invalid PORT "${value}": expected an integer between 0 and 65535`)
  }
  return port
}

function parseLmStudioUrl(raw: string | undefined): string {
  const value = raw ?? DEFAULTS.LM_STUDIO_URL
  let parsed: URL
  try {
    parsed = new URL(value)
  } catch {
    throw new Error(`Invalid LM_STUDIO_URL "${value}": expected an absolute HTTP(S) URL`)
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`Invalid LM_STUDIO_URL "${value}": expected an absolute HTTP(S) URL`)
  }
  return value
}

function parseCorsOrigin(raw: string | undefined): true | string[] {
  if (raw === undefined || raw.trim() === '') {
    return true
  }
  const origins = raw
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
  return origins.length > 0 ? origins : true
}

export function loadConfig(env: Record<string, string | undefined> = process.env): Config {
  const lmStudioApiKey = env.LM_STUDIO_API_KEY?.trim() || null
  const config: Config = {
    host: env.HOST?.trim() || DEFAULTS.HOST,
    port: parsePort(env.PORT),
    lmStudioUrl: parseLmStudioUrl(env.LM_STUDIO_URL),
    lmStudioApiKey,
    corsOrigin: parseCorsOrigin(env.CORS_ORIGIN),
  }
  return Object.freeze(config)
}
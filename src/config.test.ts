import { describe, expect, it } from 'vitest'
import { loadConfig } from './config'

describe('loadConfig', () => {
  it('returns defaults for an empty environment', () => {
    expect(loadConfig({})).toEqual({
      host: '127.0.0.1',
      port: 3000,
      lmStudioUrl: 'http://127.0.0.1:1234',
      lmStudioApiKey: null,
      corsOrigin: true,
      publicDir: 'public',
    })
  })

  it('applies values from the environment', () => {
    const config = loadConfig({
      HOST: '0.0.0.0',
      PORT: '8080',
      LM_STUDIO_URL: 'http://lm.local:9999',
      LM_STUDIO_API_KEY: ' secret ',
      PUBLIC_DIR: ' assets ',
    })
    expect(config).toEqual({
      host: '0.0.0.0',
      port: 8080,
      lmStudioUrl: 'http://lm.local:9999',
      lmStudioApiKey: 'secret',
      corsOrigin: true,
      publicDir: 'assets',
    })
  })

  it('treats a blank API key as absent', () => {
    expect(loadConfig({ LM_STUDIO_API_KEY: '   ' }).lmStudioApiKey).toBeNull()
  })

  it('parses a comma-separated CORS origin list', () => {
    expect(loadConfig({ CORS_ORIGIN: 'http://a.dev, http://b.dev ,' }).corsOrigin).toEqual([
      'http://a.dev',
      'http://b.dev',
    ])
  })

  it('allows any origin when CORS_ORIGIN is empty or missing', () => {
    expect(loadConfig({ CORS_ORIGIN: '' }).corsOrigin).toBe(true)
    expect(loadConfig({}).corsOrigin).toBe(true)
  })

  it('defaults PUBLIC_DIR to public when unset or blank', () => {
    expect(loadConfig({}).publicDir).toBe('public')
    expect(loadConfig({ PUBLIC_DIR: '  ' }).publicDir).toBe('public')
  })

  it('rejects a non-numeric PORT', () => {
    expect(() => loadConfig({ PORT: 'abc' })).toThrow(/PORT/)
  })

  it('rejects an out-of-range PORT', () => {
    expect(() => loadConfig({ PORT: '70000' })).toThrow(/PORT/)
  })

  it('rejects a malformed LM_STUDIO_URL', () => {
    expect(() => loadConfig({ LM_STUDIO_URL: 'not a url' })).toThrow(/LM_STUDIO_URL/)
  })

  it('rejects a non-HTTP LM_STUDIO_URL', () => {
    expect(() => loadConfig({ LM_STUDIO_URL: 'ftp://example.com' })).toThrow(/LM_STUDIO_URL/)
  })

  it('returns a frozen config', () => {
    expect(Object.isFrozen(loadConfig({}))).toBe(true)
  })
})
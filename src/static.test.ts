import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { existsSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { buildApp } from './app'
import { loadConfig, type Config } from './config'

let staticRoot: string

function buildStaticApp(): ReturnType<typeof buildApp> {
  const config: Config = loadConfig({ PUBLIC_DIR: staticRoot })
  return buildApp(config)
}

beforeEach(() => {
  staticRoot = mkdtempSync(join(tmpdir(), 'llm-ui-public-'))
  writeFileSync(join(staticRoot, 'index.html'), '<h1>Local</h1>')
  mkdirSync(join(staticRoot, 'assets'))
  writeFileSync(join(staticRoot, 'assets', 'app.js'), 'console.log("hi")')
})

afterEach(() => {
  if (existsSync(staticRoot)) {
    rmSync(staticRoot, { recursive: true, force: true })
  }
})

describe('static file serving', () => {
  it('serves index.html at the root', async () => {
    const app = buildStaticApp()
    const response = await app.inject({ method: 'GET', url: '/' })
    expect(response.statusCode).toBe(200)
    expect(response.headers['content-type']).toContain('text/html')
    expect(response.body).toBe('<h1>Local</h1>')
    await app.close()
  })

  it('serves files from subdirectories with the right content type', async () => {
    const app = buildStaticApp()
    const response = await app.inject({ method: 'GET', url: '/assets/app.js' })
    expect(response.statusCode).toBe(200)
    expect(response.headers['content-type']).toContain('javascript')
    expect(response.body).toBe('console.log("hi")')
    await app.close()
  })

  it('returns 404 for an unknown file', async () => {
    const app = buildStaticApp()
    const response = await app.inject({ method: 'GET', url: '/assets/does-not-exist.js' })
    expect(response.statusCode).toBe(404)
    await app.close()
  })

  it('rejects path traversal outside the public directory', async () => {
    const app = buildStaticApp()
    const encoded = await app.inject({ method: 'GET', url: '/assets/%2e%2e/config.ts' })
    expect(encoded.statusCode).toBe(404)

    const plain = await app.inject({ method: 'GET', url: '/assets/../config.ts' })
    expect(plain.statusCode).toBe(404)
    await app.close()
  })

  it('does not register static routes when the public directory is absent', async () => {
    const config: Config = loadConfig({ PUBLIC_DIR: join(staticRoot, 'missing') })
    const app = buildApp(config)
    const response = await app.inject({ method: 'GET', url: '/' })
    expect(response.statusCode).toBe(404)
    await app.close()
  })

  it('keeps the health endpoint alongside static routes', async () => {
    const app = buildStaticApp()
    const response = await app.inject({ method: 'GET', url: '/health' })
    expect(response.statusCode).toBe(200)
    await app.close()
  })
})
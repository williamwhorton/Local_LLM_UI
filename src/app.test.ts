import { describe, expect, it } from 'vitest'
import { buildApp } from './app'
import { loadConfig } from './config'

describe('buildApp', () => {
  it('serves a health check', async () => {
    const app = buildApp(loadConfig({}))
    const response = await app.inject({ method: 'GET', url: '/health' })
    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ status: 'ok' })
    await app.close()
  })

  it('reflects any origin when CORS allows all origins', async () => {
    const app = buildApp(loadConfig({}))
    const response = await app.inject({
      method: 'GET',
      url: '/health',
      headers: { origin: 'https://anywhere.example' },
    })
    expect(response.headers['access-control-allow-origin']).toBe('https://anywhere.example')
    await app.close()
  })

  it('echoes only whitelisted origins', async () => {
    const app = buildApp(loadConfig({ CORS_ORIGIN: 'http://allowed.dev' }))

    const allowed = await app.inject({
      method: 'GET',
      url: '/health',
      headers: { origin: 'http://allowed.dev' },
    })
    expect(allowed.headers['access-control-allow-origin']).toBe('http://allowed.dev')

    const denied = await app.inject({
      method: 'GET',
      url: '/health',
      headers: { origin: 'http://blocked.dev' },
    })
    expect(denied.headers['access-control-allow-origin']).toBeUndefined()
    await app.close()
  })

  it('answers CORS preflight for whitelisted origins', async () => {
    const app = buildApp(loadConfig({ CORS_ORIGIN: 'http://allowed.dev' }))
    const response = await app.inject({
      method: 'OPTIONS',
      url: '/health',
      headers: {
        origin: 'http://allowed.dev',
        'access-control-request-method': 'GET',
      },
    })
    expect(response.statusCode).toBe(204)
    expect(response.headers['access-control-allow-origin']).toBe('http://allowed.dev')
    await app.close()
  })
})
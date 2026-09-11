import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { startServer, type ServerHandles } from './server'

describe('startServer', () => {
  let server: ServerHandles

  beforeAll(async () => {
    server = await startServer({ logger: false, env: { HOST: '127.0.0.1', PORT: '0' } })
  })

  afterAll(async () => {
    await server.close()
  })

  it('binds a real socket and serves the health endpoint', async () => {
    const response = await fetch(`http://127.0.0.1:${server.port}/health`)
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ status: 'ok' })
  })
})
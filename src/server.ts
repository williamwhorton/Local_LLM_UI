import type { AddressInfo } from 'node:net'
import { buildApp } from './app'
import { loadConfig } from './config'

export interface ServerHandles {
  port: number
  close: () => Promise<void>
}

export interface StartServerOptions {
  logger?: boolean
  env?: Record<string, string | undefined>
}

export async function startServer(options: StartServerOptions = {}): Promise<ServerHandles> {
  const config = loadConfig(options.env)
  const app = buildApp(config, { logger: options.logger ?? true })
  await app.listen({ host: config.host, port: config.port })
  const address = app.server.address() as AddressInfo
  let closed = false
  const close = async () => {
    if (closed) {
      return
    }
    closed = true
    await app.close()
  }
  return { port: address.port, close }
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
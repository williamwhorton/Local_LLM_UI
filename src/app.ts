import Fastify, { type FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import { type Config } from './config'

export interface BuildAppOptions {
  logger?: boolean
}

export function buildApp(config: Config, options: BuildAppOptions = {}): FastifyInstance {
  const app = Fastify({ logger: options.logger ?? false })

  app.register(cors, { origin: config.corsOrigin })

  app.get('/health', async () => ({ status: 'ok' }))

  return app
}
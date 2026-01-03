import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import type { PingResponse } from '../shared/types.js'

const app = new Hono()

app.get('/api/ping', (c) => {
  const response: PingResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
  }
  return c.json(response)
})

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use('/*', serveStatic({ root: './dist/public' }))
}

const port = process.env.PORT ? parseInt(process.env.PORT) : 8787

if (import.meta.url === `file://${process.argv[1]}`) {
  serve({ fetch: app.fetch, port }, (info) => {
    console.log(`Server running at http://localhost:${info.port}`)
  })
}

export default app

import { describe, it, expect } from 'vitest'
import app from './index.js'

describe('GET /api/ping', () => {
  it('returns 200 with correct response shape', async () => {
    const res = await app.request('/api/ping')

    expect(res.status).toBe(200)

    const data = await res.json()

    expect(data).toHaveProperty('status')
    expect(data).toHaveProperty('timestamp')
    expect(typeof data.status).toBe('string')
    expect(typeof data.timestamp).toBe('string')
  })

  it('returns valid ISO 8601 timestamp', async () => {
    const res = await app.request('/api/ping')
    const data = await res.json()

    const parsedDate = new Date(data.timestamp)
    expect(parsedDate.toISOString()).toBe(data.timestamp)
    expect(isNaN(parsedDate.getTime())).toBe(false)
  })

  it('returns status "ok"', async () => {
    const res = await app.request('/api/ping')
    const data = await res.json()

    expect(data.status).toBe('ok')
  })
})

import { describe, it, expect } from 'vitest'
import app from './index.js'

describe('Server', () => {
  it('exports Hono app', () => {
    expect(app).toBeDefined()
    expect(typeof app.request).toBe('function')
  })
})

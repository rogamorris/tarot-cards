import { describe, it, expect } from 'vitest'
import { renderPingResult } from './app.js'
import type { PingResponse } from '../../shared/types.js'

describe('renderPingResult', () => {
  it('renders ping data to container', () => {
    const container = document.createElement('div')
    const data: PingResponse = {
      status: 'ok',
      timestamp: '2026-01-03T12:00:00.000Z',
    }

    renderPingResult(container, data)

    expect(container.textContent).toBe('API Status: ok (as of 2026-01-03T12:00:00.000Z)')
  })

  it('handles different status values', () => {
    const container = document.createElement('div')
    const data: PingResponse = {
      status: 'healthy',
      timestamp: '2026-01-03T15:30:00.000Z',
    }

    renderPingResult(container, data)

    expect(container.textContent).toContain('healthy')
    expect(container.textContent).toContain('2026-01-03T15:30:00.000Z')
  })
})

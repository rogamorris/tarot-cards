import { describe, it, expect, beforeEach, vi } from 'vitest'
import { fetchPing } from './ping.js'
import type { PingResponse } from '../../shared/types.js'

describe('fetchPing', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches and returns ping data', async () => {
    const mockResponse: PingResponse = {
      status: 'ok',
      timestamp: '2026-01-03T12:00:00.000Z',
    }

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    })

    const result = await fetchPing()

    expect(result).toEqual(mockResponse)
    expect(fetch).toHaveBeenCalledWith('/api/ping')
  })

  it('throws error when response is not ok', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    })

    await expect(fetchPing()).rejects.toThrow('HTTP error: 500')
  })
})

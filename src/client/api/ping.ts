import type { PingResponse } from '../../shared/types.js'

export async function fetchPing(): Promise<PingResponse> {
  const response = await fetch('/api/ping')
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`)
  }
  return response.json()
}

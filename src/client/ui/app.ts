import type { PingResponse } from '../../shared/types.js'
import { fetchPing } from '../api/ping.js'

export function renderPingResult(container: HTMLElement, data: PingResponse): void {
  container.textContent = `API Status: ${data.status} (as of ${data.timestamp})`
}

export async function init(): Promise<void> {
  const appElement = document.getElementById('app')
  if (!appElement) {
    return
  }

  try {
    const data = await fetchPing()
    renderPingResult(appElement, data)
  } catch (error) {
    appElement.textContent = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
  }
}

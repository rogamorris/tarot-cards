#!/usr/bin/env node
import { spawn } from 'child_process'

const server = spawn('node', ['dist/server/index.js'], {
  env: { ...process.env, NODE_ENV: 'production' },
  stdio: 'ignore'
})

setTimeout(async () => {
  try {
    const res = await fetch('http://localhost:8787/api/ping')
    if (res.ok) {
      const data = await res.json()
      console.log('✓ Smoke test passed:', data)
      server.kill()
      process.exit(0)
    } else {
      console.error('✗ Smoke test failed: HTTP', res.status)
      server.kill()
      process.exit(1)
    }
  } catch (e) {
    console.error('✗ Smoke test failed:', e.message)
    server.kill()
    process.exit(1)
  }
}, 2000)

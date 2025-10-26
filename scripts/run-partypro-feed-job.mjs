#!/usr/bin/env node

/**
 * Automated PartyPro Feed Job Runner
 * 
 * Dit script draait automatisch de PartyPro import met auto-confirm.
 * Bedoeld voor cron jobs, GitHub Actions, of Cloud Scheduler.
 * 
 * Usage:
 *   node scripts/run-partypro-feed-job.mjs
 * 
 * Environment variables:
 *   AUTO_CONFIRM=true (altijd enabled in dit script)
 *   CI=true (optioneel, wordt automatisch gezet door CI systems)
 */

import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const importScript = path.join(__dirname, 'import-partypro.mjs')

console.log('🤖 Automated PartyPro Feed Job')
console.log('═══════════════════════════════════════\n')
console.log(`📅 Started at: ${new Date().toISOString()}`)
console.log(`📂 Script: ${importScript}\n`)

// Spawn het import script met auto-confirm
const child = spawn('node', [importScript, '--auto'], {
  env: {
    ...process.env,
    AUTO_CONFIRM: 'true',
  },
  stdio: 'inherit', // Pipe output naar console
})

child.on('error', (error) => {
  console.error('\n❌ Failed to start import script:', error.message)
  process.exit(1)
})

child.on('exit', (code) => {
  const endTime = new Date().toISOString()
  console.log(`\n📅 Finished at: ${endTime}`)
  
  if (code === 0) {
    console.log('✅ Job completed successfully')
    process.exit(0)
  } else {
    console.error(`❌ Job failed with exit code ${code}`)
    process.exit(code || 1)
  }
})

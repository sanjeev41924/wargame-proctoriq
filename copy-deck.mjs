import { cp } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const src = path.resolve(__dirname, '..', '..', 'Deck')
const dest = path.join(__dirname, 'deck-serve')

if (!existsSync(src)) {
  console.log(`Deck source not found at ${src}, skipping copy.`)
  process.exit(0)
}

await cp(src, dest, { recursive: true, force: true })
console.log(`Copied Deck from ${src} to ${dest}`)

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defaultDb } from './defaultData.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dataFile = path.join(__dirname, 'db.json')

export function ensureDb() {
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify(defaultDb, null, 2), 'utf-8')
  }
}

export function readDb() {
  ensureDb()
  return JSON.parse(fs.readFileSync(dataFile, 'utf-8'))
}

export function writeDb(nextDb) {
  fs.writeFileSync(dataFile, JSON.stringify(nextDb, null, 2), 'utf-8')
  return nextDb
}

export function updateDb(updater) {
  const current = readDb()
  const next = updater(current)
  return writeDb(next)
}

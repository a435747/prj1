import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  defaultDb,
  DEFAULT_USER_PASSWORD,
  DEFAULT_USER_TOKEN,
  DEFAULT_USER_USERNAME,
} from './defaultData.js'
import { derivePlatformData } from '../src/shared/platformData.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dataFile = path.join(__dirname, 'db.json')

function migrateDb(db) {
  const next = {
    adminUser: {
      ...defaultDb.adminUser,
      ...(db.adminUser ?? {}),
    },
    platformData: derivePlatformData({
      ...defaultDb.platformData,
      ...(db.platformData ?? {}),
    }),
    adminData: {
      ...defaultDb.adminData,
      ...(db.adminData ?? {}),
      verifications: db.adminData?.verifications ?? [],
    },
    frontendUsers: Array.isArray(db.frontendUsers) ? db.frontendUsers : null,
  }

  if (!next.frontendUsers) {
    next.frontendUsers = [
      {
        id: 'user-1001',
        username: DEFAULT_USER_USERNAME,
        password: DEFAULT_USER_PASSWORD,
        token: DEFAULT_USER_TOKEN,
        verification: null,
        platformData: derivePlatformData({
          ...next.platformData,
          claimedTasks: db.platformData?.claimedTasks ?? [],
          withdrawRequests: db.platformData?.withdrawRequests ?? [],
          earningsFeed: db.platformData?.earningsFeed ?? next.platformData.earningsFeed ?? [],
          tickerItems: db.platformData?.tickerItems ?? next.platformData.tickerItems ?? [],
        }),
        createdAt: new Date().toISOString(),
      },
    ]
  } else {
    next.frontendUsers = next.frontendUsers.map((user, index) => ({
      id: user.id ?? `user-${1001 + index}`,
      username: user.username ?? `${DEFAULT_USER_USERNAME}${index ? index + 1 : ''}`,
      password: user.password ?? DEFAULT_USER_PASSWORD,
      token: user.token ?? `${DEFAULT_USER_TOKEN}-${index + 1}`,
      verification: user.verification ?? null,
      platformData: derivePlatformData({
        ...next.platformData,
        ...(user.platformData ?? {}),
        claimedTasks: user.platformData?.claimedTasks ?? [],
        withdrawRequests: user.platformData?.withdrawRequests ?? [],
        earningsFeed: user.platformData?.earningsFeed ?? next.platformData.earningsFeed ?? [],
        tickerItems: user.platformData?.tickerItems ?? next.platformData.tickerItems ?? [],
      }),
      createdAt: user.createdAt ?? new Date().toISOString(),
    }))
  }

  if (!Array.isArray(next.adminData.verifications) || !next.adminData.verifications.length) {
    next.adminData.verifications = next.frontendUsers.map((user) => user.verification).filter(Boolean)
  }

  return next
}

export function ensureDb() {
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify(defaultDb, null, 2), 'utf-8')
    return
  }

  const current = JSON.parse(fs.readFileSync(dataFile, 'utf-8'))
  const migrated = migrateDb(current)
  fs.writeFileSync(dataFile, JSON.stringify(migrated, null, 2), 'utf-8')
}

export function readDb() {
  ensureDb()
  return JSON.parse(fs.readFileSync(dataFile, 'utf-8'))
}

export function writeDb(nextDb) {
  const migrated = migrateDb(nextDb)
  fs.writeFileSync(dataFile, JSON.stringify(migrated, null, 2), 'utf-8')
  return migrated
}

export function updateDb(updater) {
  const current = readDb()
  const next = updater(current)
  return writeDb(next)
}

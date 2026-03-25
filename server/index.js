import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  DEFAULT_ADMIN_PASSWORD,
  DEFAULT_ADMIN_TOKEN,
  DEFAULT_ADMIN_USERNAME,
} from './defaultData.js'
import { ensureDb, readDb, updateDb } from './storage.js'

const app = express()
const PORT = process.env.PORT || 3001
const NODE_ENV = process.env.NODE_ENV || 'development'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const distPath = path.resolve(__dirname, '../dist')

ensureDb()
app.use(cors())
app.use(express.json({ limit: '2mb' }))

function auth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  const db = readDb()

  if (!token || token !== db.adminUser.token) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  return next()
}

function assertProductionSecurity() {
  if (NODE_ENV !== 'production') return

  const usingDefaultUsername = (process.env.ADMIN_USERNAME || DEFAULT_ADMIN_USERNAME) === DEFAULT_ADMIN_USERNAME
  const usingDefaultPassword = (process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD) === DEFAULT_ADMIN_PASSWORD
  const usingDefaultToken = (process.env.ADMIN_TOKEN || DEFAULT_ADMIN_TOKEN) === DEFAULT_ADMIN_TOKEN

  if (usingDefaultUsername || usingDefaultPassword || usingDefaultToken) {
    console.error('Refusing to start in production with default admin credentials. Please configure .env first.')
    process.exit(1)
  }
}

assertProductionSecurity()

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body
  const db = readDb()

  if (username !== db.adminUser.username || password !== db.adminUser.password) {
    return res.status(401).json({ message: '账号或密码错误' })
  }

  return res.json({
    token: db.adminUser.token,
    user: { username: db.adminUser.username },
  })
})

app.post('/api/auth/change-password', auth, (req, res) => {
  const { currentPassword, newPassword } = req.body
  const db = readDb()

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: '请填写完整密码信息' })
  }

  if (currentPassword !== db.adminUser.password) {
    return res.status(400).json({ message: '当前密码错误' })
  }

  if (String(newPassword).length < 6) {
    return res.status(400).json({ message: '新密码至少 6 位' })
  }

  updateDb((current) => ({
    ...current,
    adminUser: {
      ...current.adminUser,
      password: newPassword,
    },
  }))

  return res.json({ message: '密码修改成功' })
})

app.post('/api/auth/change-account', auth, (req, res) => {
  const { currentPassword, newUsername, newPassword } = req.body
  const db = readDb()

  if (!currentPassword || !newUsername) {
    return res.status(400).json({ message: '请填写完整账户信息' })
  }

  if (currentPassword !== db.adminUser.password) {
    return res.status(400).json({ message: '当前密码错误' })
  }

  if (String(newUsername).trim().length < 3) {
    return res.status(400).json({ message: '新账号至少 3 位' })
  }

  if (newPassword && String(newPassword).length < 6) {
    return res.status(400).json({ message: '新密码至少 6 位' })
  }

  const nextDb = updateDb((current) => ({
    ...current,
    adminUser: {
      ...current.adminUser,
      username: String(newUsername).trim(),
      password: newPassword ? String(newPassword) : current.adminUser.password,
    },
  }))

  return res.json({
    message: '管理员账户更新成功',
    user: { username: nextDb.adminUser.username },
  })
})

app.get('/api/platform', (_req, res) => {
  const db = readDb()
  return res.json(db.platformData)
})

app.put('/api/platform', auth, (req, res) => {
  const nextPlatform = req.body

  const db = updateDb((current) => ({
    ...current,
    platformData: nextPlatform,
  }))

  return res.json(db.platformData)
})

app.get('/api/admin/data', auth, (_req, res) => {
  const db = readDb()
  return res.json(db.adminData)
})

app.get('/api/health', (_req, res) => {
  return res.json({ ok: true, env: NODE_ENV })
})

if (NODE_ENV === 'production') {
  app.use(express.static(distPath))

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next()
    return res.sendFile(path.join(distPath, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} (${NODE_ENV})`)
})

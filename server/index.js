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
import { derivePlatformData } from '../src/shared/platformData.js'

const app = express()
const PORT = process.env.PORT || 3001
const NODE_ENV = process.env.NODE_ENV || 'development'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const distPath = path.resolve(__dirname, '../dist')

ensureDb()
app.use(cors())
app.use(express.json({ limit: '2mb' }))

function getBearerToken(req) {
  return req.headers.authorization?.replace('Bearer ', '')
}

function adminAuth(req, res, next) {
  const token = getBearerToken(req)
  const db = readDb()

  if (!token || token !== db.adminUser.token) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  return next()
}

function frontendAuth(req, res, next) {
  const token = getBearerToken(req)
  const db = readDb()

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const user = (db.frontendUsers ?? []).find((u) => u.token === token)
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  req.frontendUser = user
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

function formatTimestamp(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0')
  const mo = pad(date.getMonth() + 1)
  const dd = pad(date.getDate())
  const hh = pad(date.getHours())
  const mm = pad(date.getMinutes())
  return `${mo}/${dd} ${hh}:${mm}`
}

function formatAmount(value) {
  return `$${Number(value || 0).toFixed(0)}`
}

function parseDollar(value) {
  return Number(String(value ?? 0).replace('$', '')) || 0
}

function appendOrderFromClaim(adminData, claim) {
  return {
    ...adminData,
    orders: [
      {
        orderNo: `TASK${String(Date.now()).slice(-10)}`,
        username: claim.username,
        balance: '¥0',
        frozen: '¥0',
        amount: `¥${Number(claim.amount.replace('$', ''))}`,
        commission: `¥${Number(claim.amount.replace('$', ''))}`,
        level: 'VIP1',
        orderTime: claim.createdAt,
        finalPayTime: '--',
        paid: 'No',
        status: claim.status,
      },
      ...(adminData.orders ?? []),
    ],
  }
}

function updateOrderStatus(adminData, claim, status) {
  return {
    ...adminData,
    orders: (adminData.orders ?? []).map((order) => {
      if (order.username !== claim.username || order.amount !== `¥${Number(claim.amount.replace('$', ''))}`) {
        return order
      }

      return {
        ...order,
        status,
        paid: status === '已完成' ? '是' : '否',
        finalPayTime: ['under_review', 'completed', 'rejected', '待审核', '已完成', '已驳回'].includes(status) ? formatTimestamp() : order.finalPayTime,
        paid: status === 'completed' || status === '已完成' ? 'Yes' : 'No',
      }
    }),
  }
}

function appendWithdrawFromRequest(adminData, request) {
  return {
    ...adminData,
    withdraws: [
      {
        id: request.id,
        orderNo: `WD${String(Date.now()).slice(-10)}`,
        username: request.username,
        amount: request.amount,
        status: request.status,
        accountType: request.accountType,
        accountNo: request.accountNo,
        createdAt: request.createdAt,
        reviewedAt: request.reviewedAt,
        summary: request.summary,
      },
      ...(adminData.withdraws ?? []),
    ],
  }
}

function appendVerificationRequest(adminData, request) {
  return {
    ...adminData,
    verifications: [request, ...(adminData.verifications ?? [])],
  }
}

function updateVerificationStatus(adminData, request, status) {
  return {
    ...adminData,
    verifications: (adminData.verifications ?? []).map((row) => {
      if (row.id !== request.id) return row
      return {
        ...row,
        status,
        reviewedAt: request.reviewedAt,
        summary: request.summary,
      }
    }),
  }
}

function updateWithdrawStatus(adminData, request, status) {
  return {
    ...adminData,
    withdraws: (adminData.withdraws ?? []).map((row) => {
      if (row.id !== request.id) return row
      return {
        ...row,
        status,
        reviewedAt: request.reviewedAt,
        summary: request.summary,
      }
    }),
  }
}

function toWithdrawRows(requests = []) {
  return requests.map((request, index) => ({
    id: request.id,
    orderNo: `WD${String(900000 + index)}`,
    username: request.username,
    amount: request.amount,
    status: request.status,
    accountType: request.accountType,
    accountNo: request.accountNo,
    createdAt: request.createdAt,
    reviewedAt: request.reviewedAt || '--',
    summary: request.summary,
  }))
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

app.get('/api/auth/me', adminAuth, (_req, res) => {
  const db = readDb()
  return res.json({ user: { username: db.adminUser.username } })
})

app.post('/api/frontend-auth/register', (req, res) => {
  const { username, password } = req.body

  if (!String(username || '').trim() || String(username).length < 3) {
    return res.status(400).json({ message: 'Username must be at least 3 characters.' })
  }

  if (!password || String(password).length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' })
  }

  const db = updateDb((current) => {
    const exists = (current.frontendUsers ?? []).some((u) => u.username === String(username).trim())
    if (exists) {
      return current
    }

    const newUser = {
      id: `user-${Date.now()}`,
      username: String(username).trim(),
      password: String(password),
      token: `token-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      platformData: derivePlatformData({
        ...current.platformData,
        claimedTasks: [],
        withdrawRequests: [],
      }),
      createdAt: new Date().toISOString(),
    }

    return {
      ...current,
      frontendUsers: [newUser, ...(current.frontendUsers ?? [])],
    }
  })

  const newUser = (db.frontendUsers ?? []).find((u) => u.username === String(username).trim())
  if (!newUser) {
    return res.status(400).json({ message: 'Username already exists.' })
  }

  return res.json({
    token: newUser.token,
    user: { id: newUser.id, username: newUser.username },
  })
})

app.post('/api/frontend-auth/login', (req, res) => {
  const { username, password } = req.body
  const db = readDb()

  const user = (db.frontendUsers ?? []).find((u) => u.username === username && u.password === password)
  if (!user) {
    return res.status(401).json({ message: 'Incorrect username or password.' })
  }

  return res.json({
    token: user.token,
    user: { id: user.id, username: user.username },
  })
})

app.get('/api/frontend-auth/me', frontendAuth, (req, res) => {
  return res.json({ user: { id: req.frontendUser.id, username: req.frontendUser.username, verification: req.frontendUser.verification ?? null } })
})

app.post('/api/frontend-auth/change-password', frontendAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Please fill in both password fields.' })
  }

  if (currentPassword !== req.frontendUser.password) {
    return res.status(400).json({ message: 'Current password is incorrect.' })
  }

  if (String(newPassword).length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters.' })
  }

  updateDb((current) => ({
    ...current,
    frontendUsers: (current.frontendUsers ?? []).map((u) => (
      u.id === req.frontendUser.id ? { ...u, password: String(newPassword) } : u
    )),
  }))

  return res.json({ message: 'Password updated successfully.' })
})

app.post('/api/frontend-auth/verification', frontendAuth, (req, res) => {
  const { realName, idCard, accountName } = req.body

  if (!String(realName || '').trim() || !String(idCard || '').trim() || !String(accountName || '').trim()) {
    return res.status(400).json({ message: 'Please complete all verification fields.' })
  }

  let verification = null

  const db = updateDb((current) => {
    verification = {
      id: `verify-${Date.now()}`,
      username: req.frontendUser.username,
      realName: String(realName).trim(),
      idCard: String(idCard).trim(),
      accountName: String(accountName).trim(),
      status: '待审核',
      createdAt: formatTimestamp(),
      reviewedAt: '',
      summary: 'Verification submitted successfully. Waiting for admin review.',
    }

    return {
      ...current,
      frontendUsers: (current.frontendUsers ?? []).map((u) => (
        u.id === req.frontendUser.id ? { ...u, verification } : u
      )),
      adminData: appendVerificationRequest(current.adminData, verification),
    }
  })

  const updatedUser = (db.frontendUsers ?? []).find((u) => u.id === req.frontendUser.id)
  return res.json({ message: 'Verification submitted successfully.', verification: updatedUser.verification })
})

app.post('/api/auth/change-password', adminAuth, (req, res) => {
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

  return res.json({ message: 'Password updated successfully.' })
})

app.post('/api/auth/change-account', adminAuth, (req, res) => {
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

app.get('/api/platform', (req, res) => {
  const token = getBearerToken(req)
  const db = readDb()
  const rules = db.adminData?.rules ?? []

  if (!token) {
    return res.json({ ...derivePlatformData(db.platformData), rules })
  }

  const user = (db.frontendUsers ?? []).find((u) => u.token === token)
  if (!user) {
    return res.json({ ...derivePlatformData(db.platformData), rules })
  }

  const completedCount = (user.platformData.claimedTasks ?? []).filter(
    (c) => c.status === 'completed' || c.status === '已完成',
  ).length
  const vipLevel = completedCount >= 20 ? 'VIP3' : completedCount >= 5 ? 'VIP2' : 'VIP1'
  const activeRule = rules.find((r) => {
    const name = String(r.name || '').toLowerCase()
    if (vipLevel === 'VIP3' && name.includes('vip3')) return true
    if (vipLevel === 'VIP2' && (name.includes('vip2') || name.includes('高佣'))) return true
    return true
  }) ?? rules[0]

  return res.json({
    ...derivePlatformData(user.platformData),
    rules,
    activeRule: activeRule ?? null,
    vipLevel,
  })
})

app.post('/api/platform/claim-task', frontendAuth, (req, res) => {
  const { taskId } = req.body
  const db = readDb()
  const task = (db.platformData.tasks ?? []).find((item) => item.id === taskId)

  if (!task) {
    return res.status(404).json({ message: 'Task not found.' })
  }

  const exists = (req.frontendUser.platformData.claimedTasks ?? []).some(
    (item) => item.taskId === taskId && item.status !== '已驳回',
  )

  if (exists) {
    return res.status(400).json({ message: 'This task has already been claimed.' })
  }

  // ── Rule check ──────────────────────────────────────────────────────
  const completedCount = (req.frontendUser.platformData.claimedTasks ?? []).filter(
    (c) => c.status === 'completed' || c.status === '已完成',
  ).length
  const vipLevel = completedCount >= 20 ? 'VIP3' : completedCount >= 5 ? 'VIP2' : 'VIP1'
  const rules = db.adminData?.rules ?? []
  const activeRule = rules.find((r) => {
    const name = String(r.name || '').toLowerCase()
    if (vipLevel === 'VIP3' && name.includes('vip3')) return true
    if (vipLevel === 'VIP2' && (name.includes('vip2') || name.includes('高佣'))) return true
    return true // fallback: apply first rule
  }) ?? rules[0]

  if (activeRule) {
    const minAmount = parseDollar(activeRule.minAmount)
    if (minAmount > 0 && task.price < minAmount) {
      return res.status(403).json({
        message: `Your current level (${vipLevel}) requires tasks with a minimum reward of $${minAmount}. Please complete more tasks to unlock lower-value tasks, or select a qualifying task.`,
        locked: true,
        minAmount,
        vipLevel,
      })
    }
  }
  // ────────────────────────────────────────────────────────────────────

  const claim = {
    id: `claim-${Date.now()}`,
    taskId: task.id,
    username: req.frontendUser.username,
    title: task.title,
    amount: formatAmount(task.price),
    status: '待提交',
    createdAt: formatTimestamp(),
    submittedAt: '',
    reviewedAt: '',
    proofText: '',
    image: task.image,
    summary: `You have successfully claimed ${task.title}. Please submit your proof first.`,
  }

  const nextDb = updateDb((current) => {
    const userIndex = (current.frontendUsers ?? []).findIndex((u) => u.id === req.frontendUser.id)
    if (userIndex === -1) return current

    const nextUsers = [...current.frontendUsers]
    const nextPlatform = derivePlatformData({
      ...nextUsers[userIndex].platformData,
      claimedTasks: [claim, ...(nextUsers[userIndex].platformData.claimedTasks ?? [])],
      earningsFeed: [
        {
          id: Date.now(),
          user: claim.username,
          amount: claim.amount,
          text: `Just claimed ${claim.title}. Current status: pending proof submission.`,
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
          image: claim.image,
        },
        ...(nextUsers[userIndex].platformData.earningsFeed ?? []),
      ].slice(0, 12),
      tickerItems: [`${claim.username} just claimed ${claim.title}. Please submit proof next.`, ...(nextUsers[userIndex].platformData.tickerItems ?? [])].slice(0, 12),
    })

    nextUsers[userIndex] = { ...nextUsers[userIndex], platformData: nextPlatform }

    return {
      ...current,
      frontendUsers: nextUsers,
      platformData: derivePlatformData({
        ...current.platformData,
        claimedTasks: [claim, ...(current.platformData.claimedTasks ?? [])],
      }),
      adminData: appendOrderFromClaim(current.adminData, claim),
    }
  })

  const updatedUser = (nextDb.frontendUsers ?? []).find((u) => u.id === req.frontendUser.id)
  return res.json({ platformData: derivePlatformData(updatedUser.platformData), claim })
})

app.post('/api/platform/task-claims/:claimId/submit', frontendAuth, (req, res) => {
  const { claimId } = req.params
  const { proofText } = req.body

  if (!String(proofText || '').trim()) {
    return res.status(400).json({ message: 'Please fill in your task proof.' })
  }

  let updatedClaim = null

  const nextDb = updateDb((current) => {
    const userIndex = (current.frontendUsers ?? []).findIndex((u) => u.id === req.frontendUser.id)
    if (userIndex === -1) return current

    const nextUsers = [...current.frontendUsers]
    const nextClaims = (nextUsers[userIndex].platformData.claimedTasks ?? []).map((claim) => {
      if (claim.id !== claimId) return claim
      if (claim.status !== '待提交' && claim.status !== '已驳回') return claim

      updatedClaim = {
        ...claim,
        status: '待审核',
        submittedAt: formatTimestamp(),
        proofText: String(proofText).trim(),
        summary: 'Task proof submitted successfully. Waiting for admin review.',
      }
      return updatedClaim
    })

    if (!updatedClaim) return current

    const nextPlatform = derivePlatformData({
      ...nextUsers[userIndex].platformData,
      claimedTasks: nextClaims,
      earningsFeed: [
        {
          id: Date.now(),
          user: updatedClaim.username,
          amount: updatedClaim.amount,
          text: `${updatedClaim.title} proof has been submitted and is now waiting for review.`,
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
          image: updatedClaim.image,
        },
        ...(nextUsers[userIndex].platformData.earningsFeed ?? []),
      ].slice(0, 12),
      tickerItems: [`${updatedClaim.username} submitted proof for ${updatedClaim.title}.`, ...(nextUsers[userIndex].platformData.tickerItems ?? [])].slice(0, 12),
    })

    nextUsers[userIndex] = { ...nextUsers[userIndex], platformData: nextPlatform }

    return {
      ...current,
      frontendUsers: nextUsers,
      platformData: derivePlatformData({
        ...current.platformData,
        claimedTasks: (current.platformData.claimedTasks ?? []).map((c) => c.id === claimId ? updatedClaim : c),
      }),
      adminData: updateOrderStatus(current.adminData, updatedClaim, '待审核'),
    }
  })

  if (!updatedClaim) {
    return res.status(404).json({ message: 'Task record not found or cannot be submitted in the current status.' })
  }

  const updatedUser = (nextDb.frontendUsers ?? []).find((u) => u.id === req.frontendUser.id)
  return res.json({ message: 'Task proof submitted successfully.', claim: updatedClaim, platformData: derivePlatformData(updatedUser.platformData) })
})

app.post('/api/platform/withdraw-requests', frontendAuth, (req, res) => {
  const { amount, accountType, accountNo, bankName } = req.body
  const amountNum = parseDollar(amount)

  if (!amountNum || amountNum <= 0) {
    return res.status(400).json({ message: 'Withdrawal amount must be greater than 0.' })
  }

  if (!String(accountType || '').trim() || !String(accountNo || '').trim()) {
    return res.status(400).json({ message: 'Please complete your withdrawal account information.' })
  }

  // ── Task completion score check ──────────────────────────────────────
  const db = readDb()
  const rules = db.adminData?.rules ?? []
  const completedClaims = (req.frontendUser.platformData.claimedTasks ?? []).filter(
    (c) => c.status === 'completed' || c.status === '已完成',
  )
  const allTasks = db.platformData?.tasks ?? []

  // Calculate weighted score: sum of (task.multiplier ?? 1) for each completed claim
  const completedScore = completedClaims.reduce((sum, claim) => {
    const task = allTasks.find((t) => t.id === claim.taskId)
    const multiplier = Number(task?.multiplier ?? 1)
    return sum + multiplier
  }, 0)

  const completedCount = (req.frontendUser.platformData.claimedTasks ?? []).filter(
    (c) => c.status === 'completed' || c.status === '已完成',
  ).length
  const vipLevel = completedCount >= 20 ? 'VIP3' : completedCount >= 5 ? 'VIP2' : 'VIP1'

  const activeRule = rules.find((r) => {
    const name = String(r.name || '').toLowerCase()
    if (vipLevel === 'VIP3' && name.includes('vip3')) return true
    if (vipLevel === 'VIP2' && (name.includes('vip2') || name.includes('高佣'))) return true
    return true
  }) ?? rules[0]

  const requiredScore = Number(activeRule?.requiredTaskCount ?? 0)
  if (requiredScore > 0 && completedScore < requiredScore) {
    return res.status(403).json({
      message: `提现需完成 ${requiredScore} 积分的任务，当前已完成 ${completedScore.toFixed(1)} 积分，还差 ${(requiredScore - completedScore).toFixed(1)} 积分。请继续完成更多任务后再提现。`,
      locked: true,
      requiredScore,
      completedScore,
    })
  }
  // ────────────────────────────────────────────────────────────────────

  let createdRequest = null

  const nextDb = updateDb((current) => {
    const userIndex = (current.frontendUsers ?? []).findIndex((u) => u.id === req.frontendUser.id)
    if (userIndex === -1) return current

    const nextUsers = [...current.frontendUsers]
    const withdrawable = parseDollar(
      derivePlatformData(nextUsers[userIndex].platformData).quickStats?.find((item) => item.label === 'Withdrawable')?.value,
    )

    if (amountNum > withdrawable) return current

    createdRequest = {
      id: `withdraw-${Date.now()}`,
      username: req.frontendUser.username,
      amount: formatAmount(amountNum),
      status: '待审核',
      createdAt: formatTimestamp(),
      reviewedAt: '',
      accountType: String(accountType).trim(),
      bankName: String(bankName || '').trim(),
      accountNo: String(accountNo).trim(),
      summary: 'Withdrawal request submitted successfully. Waiting for admin review.',
    }

    const nextPlatform = derivePlatformData({
      ...nextUsers[userIndex].platformData,
      withdrawRequests: [createdRequest, ...(nextUsers[userIndex].platformData.withdrawRequests ?? [])],
      earningsFeed: [
        {
          id: Date.now(),
          user: createdRequest.username,
          amount: createdRequest.amount,
          text: `Submitted a withdrawal request for ${createdRequest.amount}. Current status: under review.`,
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
          image: current.platformData.tasks?.[0]?.image,
        },
        ...(nextUsers[userIndex].platformData.earningsFeed ?? []),
      ].slice(0, 12),
      tickerItems: [`${createdRequest.username} submitted a withdrawal request for ${createdRequest.amount}.`, ...(nextUsers[userIndex].platformData.tickerItems ?? [])].slice(0, 12),
    })

    nextUsers[userIndex] = { ...nextUsers[userIndex], platformData: nextPlatform }

    return {
      ...current,
      frontendUsers: nextUsers,
      platformData: derivePlatformData({
        ...current.platformData,
        withdrawRequests: [createdRequest, ...(current.platformData.withdrawRequests ?? [])],
      }),
      adminData: appendWithdrawFromRequest(current.adminData, createdRequest),
    }
  })

  if (!createdRequest) {
    return res.status(400).json({ message: 'Insufficient withdrawable balance.' })
  }

  const updatedUser = (nextDb.frontendUsers ?? []).find((u) => u.id === req.frontendUser.id)
  return res.json({ message: 'Withdrawal request submitted successfully.', request: createdRequest, platformData: derivePlatformData(updatedUser.platformData) })
})

app.put('/api/platform', adminAuth, (req, res) => {
  const nextPlatform = req.body

  const db = updateDb((current) => {
    const updatedGlobal = derivePlatformData(nextPlatform)
    const updatedFrontendUsers = (current.frontendUsers ?? []).map((u) => ({
      ...u,
      platformData: derivePlatformData({
        ...nextPlatform,
        claimedTasks: u.platformData.claimedTasks ?? [],
        withdrawRequests: u.platformData.withdrawRequests ?? [],
        earningsFeed: u.platformData.earningsFeed ?? [],
        tickerItems: u.platformData.tickerItems ?? [],
      }),
    }))

    return {
      ...current,
      platformData: updatedGlobal,
      frontendUsers: updatedFrontendUsers,
    }
  })

  return res.json(db.platformData)
})

app.get('/api/admin/data', adminAuth, (_req, res) => {
  const db = readDb()
  const allClaims = (db.frontendUsers ?? []).flatMap((u) => u.platformData.claimedTasks ?? [])
  const allWithdraws = (db.frontendUsers ?? []).flatMap((u) => u.platformData.withdrawRequests ?? [])
  const allRecharges = (db.frontendUsers ?? []).flatMap((u) => u.platformData.rechargeRequests ?? [])
  const verificationRows = (db.frontendUsers ?? []).map((u) => u.verification).filter(Boolean)
  const withdrawRows = toWithdrawRows(allWithdraws)

  return res.json({
    ...db.adminData,
    taskClaims: allClaims,
    verifications: verificationRows,
    withdraws: withdrawRows.length ? withdrawRows : db.adminData.withdraws ?? [],
    recharges: allRecharges.length ? allRecharges : db.adminData.recharges ?? [],
    users: (db.frontendUsers ?? []).map((u) => ({
      id: u.id,
      username: u.username,
      frozen: u.frozen ?? false,
      createdAt: u.createdAt ?? '',
      verification: u.verification?.status ?? 'none',
    })),
  })
})

app.post('/api/admin/task-claims/:claimId/review', adminAuth, (req, res) => {
  const { claimId } = req.params
  const { action, reason } = req.body

  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({ message: 'Invalid action.' })
  }

  let updatedClaim = null

  const db = updateDb((current) => {
    let targetUserIndex = -1
    let targetClaimIndex = -1

    ;(current.frontendUsers ?? []).forEach((u, ui) => {
      ;(u.platformData.claimedTasks ?? []).forEach((c, ci) => {
        if (c.id === claimId && c.status === '待审核') {
          targetUserIndex = ui
          targetClaimIndex = ci
        }
      })
    })

    if (targetUserIndex === -1) return current

    const nextUsers = [...current.frontendUsers]
    const nextClaims = [...(nextUsers[targetUserIndex].platformData.claimedTasks ?? [])]

    updatedClaim = {
      ...nextClaims[targetClaimIndex],
      status: action === 'approve' ? '已完成' : '已驳回',
      reviewedAt: formatTimestamp(),
      summary:
        action === 'approve'
          ? `${nextClaims[targetClaimIndex].title} was approved and the reward has been credited to your balance.`
          : `Task rejected: ${String(reason || 'Please upload clearer proof and submit again.').trim()}`,
    }
    nextClaims[targetClaimIndex] = updatedClaim

    const nextPlatform = derivePlatformData({
      ...nextUsers[targetUserIndex].platformData,
      claimedTasks: nextClaims,
      earningsFeed: [
        {
          id: Date.now(),
          user: updatedClaim.username,
          amount: updatedClaim.amount,
          text: action === 'approve' ? `${updatedClaim.title} was approved and the reward has been credited.` : `${updatedClaim.title} was rejected. Please upload updated proof.`,
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
          image: updatedClaim.image,
        },
        ...(nextUsers[targetUserIndex].platformData.earningsFeed ?? []),
      ].slice(0, 12),
      tickerItems: [
        action === 'approve'
          ? `${updatedClaim.username}'s ${updatedClaim.title} was approved for ${updatedClaim.amount}`
          : `${updatedClaim.username}'s ${updatedClaim.title} was rejected`,
        ...(nextUsers[targetUserIndex].platformData.tickerItems ?? []),
      ].slice(0, 12),
    })

    nextUsers[targetUserIndex] = { ...nextUsers[targetUserIndex], platformData: nextPlatform }

    const allClaims = nextUsers.flatMap((u) => u.platformData.claimedTasks ?? [])

    return {
      ...current,
      frontendUsers: nextUsers,
      platformData: derivePlatformData({ ...current.platformData, claimedTasks: allClaims }),
      adminData: updateOrderStatus(current.adminData, updatedClaim, updatedClaim.status),
    }
  })

  if (!updatedClaim) {
    return res.status(404).json({ message: 'Task record not found or cannot be reviewed in its current status.' })
  }

  const allClaims = (db.frontendUsers ?? []).flatMap((u) => u.platformData.claimedTasks ?? [])
  const allWithdraws = (db.frontendUsers ?? []).flatMap((u) => u.platformData.withdrawRequests ?? [])

  return res.json({
    message: action === 'approve' ? 'Task approved successfully.' : 'Task rejected.',
    claim: updatedClaim,
    platformData: db.platformData,
    adminData: {
      ...db.adminData,
      taskClaims: allClaims,
      withdraws: toWithdrawRows(allWithdraws),
    },
  })
})

app.post('/api/admin/withdraw-requests/:requestId/review', adminAuth, (req, res) => {
  const { requestId } = req.params
  const { action, reason } = req.body

  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({ message: 'Invalid action.' })
  }

  let updatedRequest = null

  const db = updateDb((current) => {
    let targetUserIndex = -1
    let targetRequestIndex = -1

    ;(current.frontendUsers ?? []).forEach((u, ui) => {
      ;(u.platformData.withdrawRequests ?? []).forEach((r, ri) => {
        if (r.id === requestId && r.status === '待审核') {
          targetUserIndex = ui
          targetRequestIndex = ri
        }
      })
    })

    if (targetUserIndex === -1) return current

    const nextUsers = [...current.frontendUsers]
    const nextRequests = [...(nextUsers[targetUserIndex].platformData.withdrawRequests ?? [])]

    updatedRequest = {
      ...nextRequests[targetRequestIndex],
      status: action === 'approve' ? '已通过' : '已驳回',
      reviewedAt: formatTimestamp(),
      summary: action === 'approve'
        ? 'Your withdrawal request was approved and the payout has been arranged.'
        : `Withdrawal request rejected: ${String(reason || 'Please check your account details and submit again.').trim()}`,
    }
    nextRequests[targetRequestIndex] = updatedRequest

    const nextPlatform = derivePlatformData({
      ...nextUsers[targetUserIndex].platformData,
      withdrawRequests: nextRequests,
      earningsFeed: [
        {
          id: Date.now(),
          user: updatedRequest.username,
          amount: updatedRequest.amount,
          text: action === 'approve' ? `${updatedRequest.amount} withdrawal request was approved.` : `${updatedRequest.amount} withdrawal request was rejected.`,
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
          image: current.platformData.tasks?.[0]?.image,
        },
        ...(nextUsers[targetUserIndex].platformData.earningsFeed ?? []),
      ].slice(0, 12),
      tickerItems: [
        action === 'approve'
          ? `${updatedRequest.username}'s withdrawal ${updatedRequest.amount} was approved`
          : `${updatedRequest.username}'s withdrawal ${updatedRequest.amount} was rejected`,
        ...(nextUsers[targetUserIndex].platformData.tickerItems ?? []),
      ].slice(0, 12),
    })

    nextUsers[targetUserIndex] = { ...nextUsers[targetUserIndex], platformData: nextPlatform }

    const allWithdraws = nextUsers.flatMap((u) => u.platformData.withdrawRequests ?? [])

    return {
      ...current,
      frontendUsers: nextUsers,
      platformData: derivePlatformData({ ...current.platformData, withdrawRequests: allWithdraws }),
      adminData: updateWithdrawStatus(current.adminData, updatedRequest, updatedRequest.status),
    }
  })

  if (!updatedRequest) {
    return res.status(404).json({ message: 'Withdrawal record not found or cannot be reviewed in its current status.' })
  }

  const allClaims = (db.frontendUsers ?? []).flatMap((u) => u.platformData.claimedTasks ?? [])
  const allWithdraws = (db.frontendUsers ?? []).flatMap((u) => u.platformData.withdrawRequests ?? [])

  return res.json({
    message: action === 'approve' ? 'Withdrawal approved.' : 'Withdrawal rejected.',
    request: updatedRequest,
    platformData: db.platformData,
    adminData: {
      ...db.adminData,
      taskClaims: allClaims,
      withdraws: toWithdrawRows(allWithdraws),
    },
  })
})

app.post('/api/admin/verifications/:verificationId/review', adminAuth, (req, res) => {
  const { verificationId } = req.params
  const { action, reason } = req.body

  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({ message: 'Invalid action.' })
  }

  let updatedVerification = null

  const db = updateDb((current) => ({
    ...current,
    frontendUsers: (current.frontendUsers ?? []).map((u) => {
      if (u.verification?.id !== verificationId || u.verification?.status !== '待审核') return u
      updatedVerification = {
        ...u.verification,
        status: action === 'approve' ? '已通过' : '已驳回',
        reviewedAt: formatTimestamp(),
        summary: action === 'approve'
          ? 'Your identity verification was approved.'
          : `Identity verification rejected: ${String(reason || 'Please submit your documents again.').trim()}`,
      }
      return { ...u, verification: updatedVerification }
    }),
    adminData: updatedVerification ? updateVerificationStatus(current.adminData, updatedVerification, updatedVerification.status) : current.adminData,
  }))

  if (!updatedVerification) {
    return res.status(404).json({ message: 'Verification record not found or cannot be reviewed in its current status.' })
  }

  return res.json({
    message: action === 'approve' ? 'Verification approved.' : 'Verification rejected.',
    verification: updatedVerification,
    adminData: {
      ...db.adminData,
      verifications: (db.frontendUsers ?? []).map((u) => u.verification).filter(Boolean),
    },
  })
})

// ── Recharge ──────────────────────────────────────────────────────────────
app.post('/api/platform/recharge-requests', frontendAuth, (req, res) => {
  const { amount, txId, channel } = req.body
  const amountNum = Number(String(amount || 0).replace('$', ''))

  if (!amountNum || amountNum <= 0) {
    return res.status(400).json({ message: 'Recharge amount must be greater than 0.' })
  }

  if (!String(txId || '').trim()) {
    return res.status(400).json({ message: 'Please provide a transaction ID or reference number.' })
  }

  const user = req.frontendUser
  if (!user.verification || (user.verification.status !== 'approved' && user.verification.status !== '已通过')) {
    return res.status(403).json({ message: 'Real-name verification required before recharging.' })
  }

  let createdRequest = null

  const nextDb = updateDb((current) => {
    const userIndex = (current.frontendUsers ?? []).findIndex((u) => u.id === req.frontendUser.id)
    if (userIndex === -1) return current

    const nextUsers = [...current.frontendUsers]
    createdRequest = {
      id: `recharge-${Date.now()}`,
      username: req.frontendUser.username,
      amount: amountNum,
      txId: String(txId).trim(),
      channel: String(channel || 'USDT').trim(),
      status: 'under_review',
      createdAt: formatTimestamp(),
      reviewedAt: '',
      summary: 'Recharge request submitted. Waiting for admin review.',
    }

    const userPlatform = nextUsers[userIndex].platformData
    nextUsers[userIndex] = {
      ...nextUsers[userIndex],
      platformData: {
        ...userPlatform,
        rechargeRequests: [createdRequest, ...(userPlatform.rechargeRequests ?? [])],
      },
    }

    return {
      ...current,
      frontendUsers: nextUsers,
      adminData: {
        ...current.adminData,
        recharges: [createdRequest, ...(current.adminData.recharges ?? [])],
      },
    }
  })

  if (!createdRequest) {
    return res.status(400).json({ message: 'Failed to create recharge request.' })
  }

  const updatedUser = (nextDb.frontendUsers ?? []).find((u) => u.id === req.frontendUser.id)
  return res.json({
    message: 'Recharge request submitted successfully.',
    request: createdRequest,
    platformData: derivePlatformData(updatedUser.platformData),
  })
})

app.post('/api/admin/recharge-requests/:requestId/review', adminAuth, (req, res) => {
  const { requestId } = req.params
  const { action, reason } = req.body

  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({ message: 'Invalid action.' })
  }

  let updatedRequest = null

  const db = updateDb((current) => {
    let targetUserIndex = -1
    let targetReqIndex = -1

    ;(current.frontendUsers ?? []).forEach((u, ui) => {
      ;(u.platformData.rechargeRequests ?? []).forEach((r, ri) => {
        if (r.id === requestId && r.status === 'under_review') {
          targetUserIndex = ui
          targetReqIndex = ri
        }
      })
    })

    if (targetUserIndex === -1) return current

    const nextUsers = [...current.frontendUsers]
    const nextRequests = [...(nextUsers[targetUserIndex].platformData.rechargeRequests ?? [])]

    updatedRequest = {
      ...nextRequests[targetReqIndex],
      status: action === 'approve' ? 'approved' : 'rejected',
      reviewedAt: formatTimestamp(),
      summary: action === 'approve'
        ? `Recharge of $${nextRequests[targetReqIndex].amount} was approved and credited to your balance.`
        : `Recharge rejected: ${String(reason || 'Please contact customer service for assistance.').trim()}`,
    }
    nextRequests[targetReqIndex] = updatedRequest

    // If approved, credit the balance by adding a virtual completed claim
    let userPlatform = {
      ...nextUsers[targetUserIndex].platformData,
      rechargeRequests: nextRequests,
    }

    if (action === 'approve') {
      const creditEntry = {
        id: `credit-${Date.now()}`,
        taskId: 0,
        username: updatedRequest.username,
        title: `Top-up Credit ($${updatedRequest.amount})`,
        amount: `$${updatedRequest.amount}`,
        status: 'completed',
        createdAt: updatedRequest.createdAt,
        submittedAt: updatedRequest.reviewedAt,
        reviewedAt: updatedRequest.reviewedAt,
        proofText: `Recharge via ${updatedRequest.channel}, ref: ${updatedRequest.txId}`,
        image: '',
        summary: `Top-up of $${updatedRequest.amount} approved and added to your balance.`,
      }
      userPlatform = {
        ...userPlatform,
        claimedTasks: [...(userPlatform.claimedTasks ?? []), creditEntry],
      }
    }

    nextUsers[targetUserIndex] = {
      ...nextUsers[targetUserIndex],
      platformData: derivePlatformData(userPlatform),
    }

    const allRecharges = nextUsers.flatMap((u) => u.platformData.rechargeRequests ?? [])

    return {
      ...current,
      frontendUsers: nextUsers,
      adminData: {
        ...current.adminData,
        recharges: allRecharges,
      },
    }
  })

  if (!updatedRequest) {
    return res.status(404).json({ message: 'Recharge record not found or already reviewed.' })
  }

  return res.json({
    message: action === 'approve' ? 'Recharge approved and balance credited.' : 'Recharge rejected.',
    request: updatedRequest,
    adminData: db.adminData,
  })
})

// ── Rules ───────────────────────────────────────────────────────────────
app.post('/api/admin/rules', adminAuth, (req, res) => {
  const { rules } = req.body
  if (!Array.isArray(rules)) return res.status(400).json({ message: 'Invalid rules.' })

  const db = updateDb((current) => ({
    ...current,
    adminData: { ...current.adminData, rules },
  }))

  return res.json({ message: 'Rules updated.', rules: db.adminData.rules })
})

// ── User Management ──────────────────────────────────────────────────────
app.post('/api/admin/users/:userId/freeze', adminAuth, (req, res) => {
  const { userId } = req.params
  const { action } = req.body // 'freeze' | 'unfreeze'

  const db = updateDb((current) => ({
    ...current,
    frontendUsers: (current.frontendUsers ?? []).map((u) =>
      u.id === userId ? { ...u, frozen: action === 'freeze' } : u
    ),
  }))

  const user = (db.frontendUsers ?? []).find((u) => u.id === userId)
  if (!user) return res.status(404).json({ message: 'User not found.' })

  const users = (db.frontendUsers ?? []).map((u) => ({
    id: u.id,
    username: u.username,
    frozen: u.frozen ?? false,
    createdAt: u.createdAt ?? '',
    verification: u.verification?.status ?? 'none',
  }))

  return res.json({ message: action === 'freeze' ? 'User frozen.' : 'User unfrozen.', users })
})

app.post('/api/admin/users/:userId/edit', adminAuth, (req, res) => {
  const { userId } = req.params
  const { username } = req.body

  if (!String(username || '').trim()) {
    return res.status(400).json({ message: 'Username cannot be empty.' })
  }

  const db = updateDb((current) => ({
    ...current,
    frontendUsers: (current.frontendUsers ?? []).map((u) =>
      u.id === userId ? { ...u, username: String(username).trim() } : u
    ),
  }))

  const users = (db.frontendUsers ?? []).map((u) => ({
    id: u.id,
    username: u.username,
    frozen: u.frozen ?? false,
    createdAt: u.createdAt ?? '',
    verification: u.verification?.status ?? 'none',
  }))

  return res.json({ message: 'User updated.', users })
})

// ── VIP Config ────────────────────────────────────────────────────────────
app.post('/api/admin/vip-levels', adminAuth, (req, res) => {
  const { vipLevels } = req.body
  if (!Array.isArray(vipLevels)) return res.status(400).json({ message: 'Invalid vipLevels.' })

  const db = updateDb((current) => ({
    ...current,
    adminData: { ...current.adminData, vipLevels },
  }))

  return res.json({ message: 'VIP levels updated.', vipLevels: db.adminData.vipLevels })
})

// ── Order Review ──────────────────────────────────────────────────────────
app.post('/api/admin/orders/:orderNo/review', adminAuth, (req, res) => {
  const { orderNo } = req.params
  const { action } = req.body // 'approve' | 'reject'

  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({ message: 'Invalid action.' })
  }

  const db = updateDb((current) => ({
    ...current,
    adminData: {
      ...current.adminData,
      orders: (current.adminData.orders ?? []).map((o) =>
        o.orderNo === orderNo
          ? { ...o, status: action === 'approve' ? '已完成' : '已驳回', finalPayTime: formatTimestamp(), paid: action === 'approve' ? 'Yes' : 'No' }
          : o
      ),
    },
  }))

  return res.json({
    message: action === 'approve' ? 'Order approved.' : 'Order rejected.',
    adminData: db.adminData,
  })
})

app.get('/api/health', (_req, res) => {
  return res.json({ ok: true, env: NODE_ENV })
})

if (NODE_ENV === 'production') {
  app.use(express.static(distPath))

  app.get(/^(?!\/api\/).*/, (req, res) => {
    return res.sendFile(path.join(distPath, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} (${NODE_ENV})`)
})

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  DEFAULT_ADMIN_PASSWORD,
  DEFAULT_ADMIN_TOKEN,
  DEFAULT_ADMIN_USERNAME,
  DEFAULT_USER_USERNAME,
  DEFAULT_USER_PASSWORD,
  DEFAULT_USER_TOKEN,
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
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
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
        paid: '否',
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
        finalPayTime: ['待审核', '已完成', '已驳回'].includes(status) ? formatTimestamp() : order.finalPayTime,
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

  return res.json({ message: '密码修改成功' })
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

  return res.json({ message: '密码修改成功' })
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

  if (!token) {
    return res.json(derivePlatformData(db.platformData))
  }

  const user = (db.frontendUsers ?? []).find((u) => u.token === token)
  if (!user) {
    return res.json(derivePlatformData(db.platformData))
  }

  return res.json(derivePlatformData(user.platformData))
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
          text: `刚刚领取了 ${claim.title}，当前状态：待提交凭证。`,
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
          image: claim.image,
        },
        ...(nextUsers[userIndex].platformData.earningsFeed ?? []),
      ].slice(0, 12),
      tickerItems: [`${claim.username} 刚刚领取 ${claim.title}，请提交任务凭证`, ...(nextUsers[userIndex].platformData.tickerItems ?? [])].slice(0, 12),
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
          text: `${updatedClaim.title} 的完成凭证已提交，等待审核。`,
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
          image: updatedClaim.image,
        },
        ...(nextUsers[userIndex].platformData.earningsFeed ?? []),
      ].slice(0, 12),
      tickerItems: [`${updatedClaim.username} 提交了 ${updatedClaim.title} 的任务凭证`, ...(nextUsers[userIndex].platformData.tickerItems ?? [])].slice(0, 12),
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
  const { amount, accountType, accountNo } = req.body
  const amountNum = parseDollar(amount)

  if (!amountNum || amountNum <= 0) {
    return res.status(400).json({ message: 'Withdrawal amount must be greater than 0.' })
  }

  if (!String(accountType || '').trim() || !String(accountNo || '').trim()) {
    return res.status(400).json({ message: 'Please complete your withdrawal account information.' })
  }

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
          text: `提交了 ${createdRequest.amount} 提现申请，状态：待审核。`,
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
          image: current.platformData.tasks?.[0]?.image,
        },
        ...(nextUsers[userIndex].platformData.earningsFeed ?? []),
      ].slice(0, 12),
      tickerItems: [`${createdRequest.username} 提交提现 ${createdRequest.amount}，等待审核`, ...(nextUsers[userIndex].platformData.tickerItems ?? [])].slice(0, 12),
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
  const verificationRows = (db.frontendUsers ?? []).map((u) => u.verification).filter(Boolean)
  const withdrawRows = toWithdrawRows(allWithdraws)

  return res.json({
    ...db.adminData,
    taskClaims: allClaims,
    verifications: verificationRows,
    withdraws: withdrawRows.length ? withdrawRows : db.adminData.withdraws ?? [],
  })
})

app.post('/api/admin/task-claims/:claimId/review', adminAuth, (req, res) => {
  const { claimId } = req.params
  const { action } = req.body

  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({ message: '无效审核操作' })
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
          ? `${nextClaims[targetClaimIndex].title} 已审核通过，奖励已计入账户余额。`
          : `${nextClaims[targetClaimIndex].title} 未通过审核，请补充更清晰的任务凭证后重新提交。`,
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
          text: action === 'approve' ? `${updatedClaim.title} 审核通过，奖励已到账。` : `${updatedClaim.title} 审核未通过，请重新提交任务凭证。`,
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
          image: updatedClaim.image,
        },
        ...(nextUsers[targetUserIndex].platformData.earningsFeed ?? []),
      ].slice(0, 12),
      tickerItems: [
        action === 'approve'
          ? `${updatedClaim.username} 的 ${updatedClaim.title} 审核通过，到账 ${updatedClaim.amount}`
          : `${updatedClaim.username} 的 ${updatedClaim.title} 被驳回`,
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
    return res.status(404).json({ message: '任务记录不存在或当前状态不可审核' })
  }

  const allClaims = (db.frontendUsers ?? []).flatMap((u) => u.platformData.claimedTasks ?? [])
  const allWithdraws = (db.frontendUsers ?? []).flatMap((u) => u.platformData.withdrawRequests ?? [])

  return res.json({
    message: action === 'approve' ? '任务已审核通过' : '任务已驳回',
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
  const { action } = req.body

  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({ message: '无效审核操作' })
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
      summary: action === 'approve' ? '提现申请已审核通过，资金已安排打款。' : '提现申请已驳回，请检查账户信息后重新提交。',
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
          text: action === 'approve' ? `${updatedRequest.amount} 提现申请已通过。` : `${updatedRequest.amount} 提现申请已驳回。`,
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
          image: current.platformData.tasks?.[0]?.image,
        },
        ...(nextUsers[targetUserIndex].platformData.earningsFeed ?? []),
      ].slice(0, 12),
      tickerItems: [
        action === 'approve'
          ? `${updatedRequest.username} 的提现 ${updatedRequest.amount} 已通过`
          : `${updatedRequest.username} 的提现 ${updatedRequest.amount} 已驳回`,
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
    return res.status(404).json({ message: '提现记录不存在或当前状态不可审核' })
  }

  const allClaims = (db.frontendUsers ?? []).flatMap((u) => u.platformData.claimedTasks ?? [])
  const allWithdraws = (db.frontendUsers ?? []).flatMap((u) => u.platformData.withdrawRequests ?? [])

  return res.json({
    message: action === 'approve' ? '提现申请已通过' : '提现申请已驳回',
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
    return res.status(400).json({ message: '无效审核操作' })
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
          ? '实名认证审核通过。'
          : `实名认证审核未通过：${String(reason || '请重新提交资料。').trim()}`,
      }
      return { ...u, verification: updatedVerification }
    }),
    adminData: updatedVerification ? updateVerificationStatus(current.adminData, updatedVerification, updatedVerification.status) : current.adminData,
  }))

  if (!updatedVerification) {
    return res.status(404).json({ message: '实名认证记录不存在或当前状态不可审核' })
  }

  return res.json({
    message: action === 'approve' ? '实名认证已通过' : '实名认证已驳回',
    verification: updatedVerification,
    adminData: {
      ...db.adminData,
      verifications: (db.frontendUsers ?? []).map((u) => u.verification).filter(Boolean),
    },
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

import {
  earningsFeed,
  leaderboard,
  tickerItems,
  tasks,
} from '../data/mock.js'

const BASE_BALANCE = 0
const BASE_COMPLETED = 0
const BASE_WITHDRAWABLE = 0
const BASE_TODAY_EARNINGS = 0
const BASE_ONLINE_COUNT = '18,426'

function isCompletedStatus(status) {
  return status === '已完成' || status === 'completed'
}

function isApprovedStatus(status) {
  return status === '已通过' || status === 'approved'
}

function isRejectedStatus(status) {
  return status === '已驳回' || status === 'rejected'
}

function isUnderReviewStatus(status) {
  return status === '待审核' || status === 'under_review'
}

function isPendingProofStatus(status) {
  return status === '待提交' || status === 'pending_proof'
}

const claimedTasks = []

const withdrawRequests = []

function parseDollar(value) {
  return Number(String(value ?? 0).replace('$', '')) || 0
}

function getApprovedTaskIncome(taskClaims) {
  return taskClaims
    .filter((item) => isCompletedStatus(item.status))
    .reduce((sum, item) => sum + parseDollar(item.amount), 0)
}

function getApprovedWithdrawAmount(requests) {
  return requests
    .filter((item) => isApprovedStatus(item.status))
    .reduce((sum, item) => sum + parseDollar(item.amount), 0)
}

function getPendingWithdrawAmount(requests) {
  return requests
    .filter((item) => isUnderReviewStatus(item.status))
    .reduce((sum, item) => sum + parseDollar(item.amount), 0)
}

function buildHomeStats(taskClaims, withdraws, existingHomeStats = []) {
  const completedAmount = getApprovedTaskIncome(taskClaims)
  const approvedWithdrawAmount = getApprovedWithdrawAmount(withdraws)

  return [
    { label: 'Today Earnings', value: `$${(BASE_TODAY_EARNINGS + completedAmount - approvedWithdrawAmount).toFixed(0)}`, sub: '+12.8%' },
    existingHomeStats[1] ?? { label: 'Online Users', value: BASE_ONLINE_COUNT, sub: 'Real-time online' },
  ]
}

function buildQuickStats(taskClaims, withdraws) {
  const completed = taskClaims.filter((item) => isCompletedStatus(item.status)).length
  const approvedIncome = getApprovedTaskIncome(taskClaims)
  const approvedWithdrawAmount = getApprovedWithdrawAmount(withdraws)
  const pendingWithdrawAmount = getPendingWithdrawAmount(withdraws)
  const balance = BASE_BALANCE + approvedIncome - approvedWithdrawAmount
  const withdrawable = BASE_WITHDRAWABLE + approvedIncome - approvedWithdrawAmount - pendingWithdrawAmount

  return [
    { label: 'Balance', value: `$${balance.toFixed(0)}` },
    { label: 'Completed', value: `${BASE_COMPLETED + completed}` },
    { label: 'Withdrawable', value: `$${Math.max(0, withdrawable).toFixed(0)}` },
  ]
}

function buildProfile(taskClaims, withdraws) {
  const completed = taskClaims.filter((item) => isCompletedStatus(item.status)).length
  const approvedIncome = getApprovedTaskIncome(taskClaims)
  const approvedWithdrawAmount = getApprovedWithdrawAmount(withdraws)
  const pendingWithdrawAmount = getPendingWithdrawAmount(withdraws)
  const balance = BASE_BALANCE + approvedIncome - approvedWithdrawAmount
  const withdrawable = BASE_WITHDRAWABLE + approvedIncome - approvedWithdrawAmount - pendingWithdrawAmount

  return {
    name: 'Premium Member',
    subtitle: `${taskClaims.length} tasks claimed / ${withdraws.length} withdrawals made`,
    rechargeRequests: [],
    // name is overridden in FrontendApp with actual username
    stats: [
      { label: 'Balance', value: `$${balance.toFixed(0)}` },
      { label: 'Completed', value: `${BASE_COMPLETED + completed}` },
      { label: 'Withdrawable', value: `$${Math.max(0, withdrawable).toFixed(0)}` },
    ],
    menus: ['Recharge', 'Withdrawal Records', 'Task Records', 'Real-Name Verification', 'Security Center'],
  }
}

export const defaultBannerSlides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=800&q=80',
    title: 'Earn While You Explore',
    subtitle: 'Complete tasks and get paid daily',
    link: '',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=800&q=80',
    title: 'High Commission Tasks',
    subtitle: 'Up to $200 per task — grab yours now',
    link: '',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    title: 'Top Earners This Week',
    subtitle: 'Join thousands of active members',
    link: '',
  },
]

export const initialPlatformData = {
  supportLink: '',
  bannerSlides: defaultBannerSlides,
  homeStats: buildHomeStats(claimedTasks, withdrawRequests),
  tickerItems,
  featuredTasks: tasks.slice(0, 3).map((task) => ({
    id: task.id,
    title: task.title,
    price: task.price,
    tag: task.badge,
    city: task.city,
    image: task.image,
  })),
  taskFilters: ['All', 'High Pay', 'Easy', 'Nearby'],
  tasks,
  claimedTasks,
  withdrawRequests,
  earningsFeed,
  leaderboard,
  quickStats: buildQuickStats(claimedTasks, withdrawRequests),
  profile: buildProfile(claimedTasks, withdrawRequests),
}

function buildWithdrawProgress(taskClaims, allTasks, rules) {
  const completedClaims = taskClaims.filter(
    (c) => c.status === '已完成' || c.status === 'completed',
  )
  const completedScore = completedClaims.reduce((sum, claim) => {
    const task = (allTasks ?? []).find((t) => t.id === claim.taskId)
    const multiplier = Number(task?.multiplier ?? 1)
    return sum + multiplier
  }, 0)

  const completedCount = completedClaims.length
  const vipLevel = completedCount >= 20 ? 'VIP3' : completedCount >= 5 ? 'VIP2' : 'VIP1'

  const activeRule = (rules ?? []).find((r) => {
    const name = String(r.name || '').toLowerCase()
    if (vipLevel === 'VIP3' && name.includes('vip3')) return true
    if (vipLevel === 'VIP2' && (name.includes('vip2') || name.includes('高佣'))) return true
    return true
  }) ?? (rules ?? [])[0] ?? null

  const requiredScore = Number(activeRule?.requiredTaskCount ?? 0)

  return {
    completedScore,
    requiredScore,
    met: requiredScore <= 0 || completedScore >= requiredScore,
    activeRuleName: activeRule?.name ?? '',
  }
}

export function derivePlatformData(nextPlatform) {
  const taskClaims = nextPlatform.claimedTasks ?? []
  const withdraws = nextPlatform.withdrawRequests ?? []
  const allTasks = nextPlatform.tasks ?? []
  const rules = nextPlatform.rules ?? []

  return {
    ...nextPlatform,
    rechargeRequests: nextPlatform.rechargeRequests ?? [],
    homeStats: buildHomeStats(taskClaims, withdraws, nextPlatform.homeStats),
    quickStats: buildQuickStats(taskClaims, withdraws),
    profile: buildProfile(taskClaims, withdraws),
    withdrawProgress: buildWithdrawProgress(taskClaims, allTasks, rules),
  }
}

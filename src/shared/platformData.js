import {
  earningsFeed,
  leaderboard,
  tickerItems,
  tasks,
} from '../data/mock.js'

const BASE_BALANCE = 1286
const BASE_COMPLETED = 128
const BASE_WITHDRAWABLE = 860
const BASE_TODAY_EARNINGS = 286
const BASE_ONLINE_COUNT = '18,426'

const claimedTasks = [
  {
    id: 'claim-1001',
    taskId: 103,
    username: 'Aurora',
    title: 'High-Commission Store Video',
    amount: '$168',
    status: '已完成',
    createdAt: 'Today 09:20',
    submittedAt: 'Today 10:05',
    reviewedAt: 'Today 10:30',
    proofText: 'Uploaded the store video and exterior screenshots.',
    image: tasks.find((task) => task.id === 103)?.image,
    summary: 'The video verification task was approved and the reward has been added to your balance.',
  },
  {
    id: 'claim-1002',
    taskId: 105,
    username: 'Aurora',
    title: 'Livestream Engagement Task',
    amount: '$22',
    status: '待提交',
    createdAt: 'Today 11:45',
    submittedAt: '',
    reviewedAt: '',
    proofText: '',
    image: tasks.find((task) => task.id === 105)?.image,
    summary: 'Task claimed successfully. Please submit your proof to continue.',
  },
]

const withdrawRequests = [
  {
    id: 'withdraw-1001',
    username: 'Aurora',
    amount: '$120',
    status: '已通过',
    createdAt: 'Today 08:10',
    reviewedAt: 'Today 08:25',
    accountType: 'USDT',
    accountNo: 'TRC20 / TXXXXXX8899',
    summary: 'Your withdrawal request was approved and paid out.',
  },
  {
    id: 'withdraw-1002',
    username: 'Aurora',
    amount: '$88',
    status: '待审核',
    createdAt: 'Today 12:10',
    reviewedAt: '',
    accountType: 'Alipay',
    accountNo: 'aurora***@mail.com',
    summary: 'Your withdrawal request has been submitted and is waiting for review.',
  },
]

function parseDollar(value) {
  return Number(String(value ?? 0).replace('$', '')) || 0
}

function getApprovedTaskIncome(taskClaims) {
  return taskClaims
    .filter((item) => item.status === '已完成')
    .reduce((sum, item) => sum + parseDollar(item.amount), 0)
}

function getApprovedWithdrawAmount(requests) {
  return requests
    .filter((item) => item.status === '已通过')
    .reduce((sum, item) => sum + parseDollar(item.amount), 0)
}

function getPendingWithdrawAmount(requests) {
  return requests
    .filter((item) => item.status === '待审核')
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
  const completed = taskClaims.filter((item) => item.status === '已完成').length
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
  const completed = taskClaims.filter((item) => item.status === '已完成').length
  const approvedIncome = getApprovedTaskIncome(taskClaims)
  const approvedWithdrawAmount = getApprovedWithdrawAmount(withdraws)
  const pendingWithdrawAmount = getPendingWithdrawAmount(withdraws)
  const balance = BASE_BALANCE + approvedIncome - approvedWithdrawAmount
  const withdrawable = BASE_WITHDRAWABLE + approvedIncome - approvedWithdrawAmount - pendingWithdrawAmount

  return {
    name: 'Premium Member · Aurora',
    subtitle: `${taskClaims.length} tasks claimed / ${withdraws.length} withdrawals made`,
    stats: [
      { label: 'Balance', value: `$${balance.toFixed(0)}` },
      { label: 'Completed', value: `${BASE_COMPLETED + completed}` },
      { label: 'Withdrawable', value: `$${Math.max(0, withdrawable).toFixed(0)}` },
    ],
    menus: ['Withdrawal Records', 'Task Records', 'Real-Name Verification', 'Security Center'],
  }
}

export const initialPlatformData = {
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

export function derivePlatformData(nextPlatform) {
  const taskClaims = nextPlatform.claimedTasks ?? []
  const withdraws = nextPlatform.withdrawRequests ?? []

  return {
    ...nextPlatform,
    homeStats: buildHomeStats(taskClaims, withdraws, nextPlatform.homeStats),
    quickStats: buildQuickStats(taskClaims, withdraws),
    profile: buildProfile(taskClaims, withdraws),
  }
}

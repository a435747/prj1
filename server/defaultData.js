import { initialPlatformData, derivePlatformData } from '../src/shared/platformData.js'
import {
  orders,
  recharges,
  rules,
  statsGroups,
  users,
  vipLevels,
  withdraws,
} from '../src/admin/data/adminMock.js'

export const DEFAULT_ADMIN_USERNAME = 'admin'
export const DEFAULT_ADMIN_PASSWORD = 'admin123456'
export const DEFAULT_ADMIN_TOKEN = 'demo-admin-token'

export const DEFAULT_USER_USERNAME = 'aurora'
export const DEFAULT_USER_PASSWORD = '123456'
export const DEFAULT_USER_TOKEN = 'demo-user-token'

const adminUsername = process.env.ADMIN_USERNAME || DEFAULT_ADMIN_USERNAME
const adminPassword = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD
const adminToken = process.env.ADMIN_TOKEN || DEFAULT_ADMIN_TOKEN

const defaultUserUsername = process.env.DEMO_USER_USERNAME || DEFAULT_USER_USERNAME
const defaultUserPassword = process.env.DEMO_USER_PASSWORD || DEFAULT_USER_PASSWORD
const defaultUserToken = process.env.DEMO_USER_TOKEN || DEFAULT_USER_TOKEN

function createUserPlatformData() {
  const base = derivePlatformData(initialPlatformData)
  return {
    ...base,
    claimedTasks: base.claimedTasks ?? [],
    withdrawRequests: base.withdrawRequests ?? [],
    earningsFeed: base.earningsFeed ?? [],
    tickerItems: base.tickerItems ?? [],
  }
}

export const defaultDb = {
  adminUser: {
    username: adminUsername,
    password: adminPassword,
    token: adminToken,
  },
  frontendUsers: [
    {
      id: 'user-1001',
      username: defaultUserUsername,
      password: defaultUserPassword,
      token: defaultUserToken,
      verification: null,
      platformData: createUserPlatformData(),
      createdAt: new Date().toISOString(),
    },
  ],
  platformData: derivePlatformData(initialPlatformData),
  adminData: {
    statsGroups,
    users,
    vipLevels,
    rules,
    orders,
    recharges,
    withdraws,
    verifications: [],
  },
}

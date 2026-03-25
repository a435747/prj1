import { initialPlatformData } from '../src/shared/platformData.js'
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

const adminUsername = process.env.ADMIN_USERNAME || DEFAULT_ADMIN_USERNAME
const adminPassword = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD
const adminToken = process.env.ADMIN_TOKEN || DEFAULT_ADMIN_TOKEN

export const defaultDb = {
  adminUser: {
    username: adminUsername,
    password: adminPassword,
    token: adminToken,
  },
  platformData: initialPlatformData,
  adminData: {
    statsGroups,
    users,
    vipLevels,
    rules,
    orders,
    recharges,
    withdraws,
  },
}

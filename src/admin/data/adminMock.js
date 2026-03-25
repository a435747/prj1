export const sidebarMenus = [
  {
    title: '前台管理',
    items: [
      { key: 'frontendContent', label: '前台内容' },
      { key: 'frontendTasks', label: '任务配置' },
    ],
  },
  {
    title: '交易管理',
    items: [
      { key: 'orders', label: '订单列表' },
      { key: 'recharge', label: '充值管理' },
      { key: 'withdraw', label: '提现管理' },
    ],
  },
  {
    title: '商品管理',
    items: [{ key: 'vip', label: 'VIP 等级' }, { key: 'rules', label: '打针规则' }],
  },
  {
    title: '系统管理',
    items: [{ key: 'users', label: '用户管理' }],
  },
]

export const searchFields = {
  username: '',
  phone: '',
  bindUserId: '',
  level: '全部',
  status: '全部',
  channel: '全部',
  orderNo: '',
  inviteCode: '',
  primaryAgent: '全部',
  secondaryAgent: '全部',
  paymentMethod: '全部',
  minRate: '1.1',
  registerStart: '',
  registerEnd: '',
  orderStart: '',
  orderEnd: '',
  initiateStart: '',
  initiateEnd: '',
}

export const statsGroups = [
  {
    title: '支付统计',
    items: [
      { label: '第三方累计充值', value: '¥ 2,860,000' },
      { label: '第三方手续费', value: '¥ 68,300' },
      { label: '第三方成功收款笔数', value: '12,890' },
      { label: '第三方充值成功人数', value: '4,620' },
    ],
  },
  {
    title: '用户统计',
    items: [
      { label: '用户充值总额', value: '¥ 1,980,000' },
      { label: '今日新增充值', value: '¥ 82,400' },
      { label: '昨日新增充值', value: '¥ 75,900' },
      { label: '充值人数', value: '2,168' },
      { label: '今日充值人数', value: '128' },
      { label: '昨日充值人数', value: '119' },
    ],
  },
  {
    title: '提现统计',
    items: [
      { label: '用户提现总额', value: '¥ 860,000' },
      { label: '今日新增提现', value: '¥ 29,600' },
      { label: '昨日新增提现', value: '¥ 26,400' },
      { label: '提现人数', value: '1,086' },
    ],
  },
]

export const users = Array.from({ length: 36 }).map((_, index) => ({
  id: 1000 + index,
  bindUserId: 5000 + index,
  level: ['VIP1', 'VIP2', 'VIP3'][index % 3],
  username: `user_${index + 1}`,
  phone: `1380000${String(index).padStart(4, '0')}`,
  inviteCode: `INV${200 + index}`,
  loginCount: 12 + index,
  status: index % 4 === 0 ? '冻结' : '正常',
  serviceLink: 'https://support.example.com',
  addTime: `2025-03-${String((index % 28) + 1).padStart(2, '0')} 10:20`,
}))

export const vipLevels = [
  { name: 'VIP1', icon: '🥉', price: '¥99', commissionRate: '8%', chainRate: '1.2%', subRate: '2%', minBalance: '¥100', orderTimes: '20', withdrawTimes: '2', withdrawRange: '¥50 / ¥2000', invitePermission: '开启' },
  { name: 'VIP2', icon: '🥈', price: '¥299', commissionRate: '12%', chainRate: '1.8%', subRate: '3%', minBalance: '¥300', orderTimes: '60', withdrawTimes: '4', withdrawRange: '¥100 / ¥5000', invitePermission: '开启' },
  { name: 'VIP3', icon: '🥇', price: '¥699', commissionRate: '18%', chainRate: '2.5%', subRate: '5%', minBalance: '¥800', orderTimes: '120', withdrawTimes: '8', withdrawRange: '¥200 / ¥12000', invitePermission: '开启' },
]

export const rules = [
  { agent: '华东代理', name: '新手打针规则', minAmount: '¥50', minCommissionRate: '1.1', orderCount: '10', ruleCount: '3', userCount: '128', recycle: '允许' },
  { agent: '华南代理', name: '高佣轮换规则', minAmount: '¥200', minCommissionRate: '1.6', orderCount: '30', ruleCount: '5', userCount: '82', recycle: '允许' },
]

export const orders = Array.from({ length: 28 }).map((_, index) => ({ orderNo: `ORD20250325${1000 + index}`, username: `user_${index + 1}`, balance: `¥${1200 + index * 33}`, frozen: `¥${100 + index * 5}`, amount: `¥${80 + index * 18}`, commission: `¥${8 + index * 2}`, level: ['VIP1', 'VIP2', 'VIP3'][index % 3], orderTime: `2025-03-25 1${index % 10}:22`, payTime: `2025-03-25 1${index % 10}:36`, finalPayTime: `2025-03-25 1${index % 10}:50`, paid: index % 3 === 0 ? '否' : '是', status: ['待处理', '已完成', '审核中'][index % 3] }))

export const recharges = Array.from({ length: 24 }).map((_, index) => ({ status: ['成功', '待确认', '失败'][index % 3], confirmed: index % 2 === 0 ? '是' : '否', channel: ['USDT', '支付宝', '微信'][index % 3], primaryAgent: ['华东代理', '华南代理'][index % 2], secondaryAgent: ['上海组', '深圳组', '杭州组'][index % 3], orderNo: `RCG${3000 + index}`, username: `user_${index + 1}`, phone: `1390000${String(index).padStart(4, '0')}`, addTime: `2025-03-${String((index % 28) + 1).padStart(2, '0')} 09:15`, stats: `¥${100 + index * 20}` }))

export const withdraws = Array.from({ length: 24 }).map((_, index) => ({ agentReview: index % 2 === 0 ? '已审核' : '待审核', status: ['处理中', '已通过', '已驳回'][index % 3], primaryAgent: ['华东代理', '华南代理'][index % 2], secondaryAgent: ['上海组', '深圳组', '杭州组'][index % 3], orderNo: `WD${5000 + index}`, username: `user_${index + 1}`, phone: `1370000${String(index).padStart(4, '0')}`, initiateTime: `2025-03-${String((index % 28) + 1).padStart(2, '0')} 15:40`, paymentMethod: ['USDT', '银行卡', '支付宝'][index % 3], stats: `¥${200 + index * 35}`, detailOrder: `TX${7000 + index}`, withdrawMethod: ['USDT', '银行卡', '支付宝'][index % 3], agent: ['华东代理', '华南代理'][index % 2], userInfo: `VIP${(index % 3) + 1} / user_${index + 1}`, agentGroup: `${['华东代理', '华南代理'][index % 2]} / ${['上海组', '深圳组', '杭州组'][index % 3]}`, amount: `¥${300 + index * 40}`, bankInfo: index % 3 === 0 ? 'TRC20 / TXXXXXX' : '中国银行 / 6222 ****', wallet: `wallet_${index + 1}`, timeFlow: '发起 / 处理 / 回调', reviewStatus: ['待审', '通过', '驳回'][index % 3], thirdStatus: ['处理中', '成功', '失败'][index % 3] }))

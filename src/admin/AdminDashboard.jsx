import { useMemo, useState } from 'react'
import { Layout } from './components/Layout'
import { Navbar } from './components/Navbar'
import { SearchForm } from './components/SearchForm'
import { Sidebar } from './components/Sidebar'
import { StatsCard } from './components/StatsCard'
import { AccountPanel } from './components/AccountPanel'
import { PasswordPanel } from './components/PasswordPanel'
import { FrontendContentEditor } from './components/FrontendContentEditor'
import { FrontendTaskTable } from './components/FrontendTaskTable'
import { OrderTable } from './components/OrderTable'
import { RechargeTable } from './components/RechargeTable'
import { RuleTable } from './components/RuleTable'
import { TaskClaimTable } from './components/TaskClaimTable'
import { UserTable } from './components/UserTable'
import { VerificationTable } from './components/VerificationTable'
import { VIPTable } from './components/VIPTable'
import { WithdrawTable } from './components/WithdrawTable'
import { sidebarMenus } from './data/adminMock'

const pageTitles = {
  dashboard: '管理员主页',
  frontendContent: '前台内容运营',
  frontendTasks: '任务配置中心',
  taskClaims: '任务审核中心',
  verifications: '实名认证审核',
  withdraw: '提现审核中心',
  recharge: '充值记录管理',
  orders: '订单列表',
  vip: 'VIP 等级配置',
  rules: '规则策略配置',
  users: '用户管理',
}

const pageDescriptions = {
  dashboard: '查看待办任务、平台统计数据，以及账户与密码设置。',
  frontendContent: '维护前台首页关键数据、公告和任务展示内容，修改将直接同步到前台。',
  frontendTasks: '统一维护任务标题、地区、价格与标签，用于前台任务大厅展示。',
  taskClaims: '集中审核用户提交的任务凭证，优先处理待审核记录。',
  verifications: '核验用户实名资料、身份证号与收款账户信息。',
  withdraw: '审核提现申请并确认收款账号，适用于财务与风控联动处理。',
  recharge: '查看充值记录与状态分布，追踪入金渠道表现。',
  orders: '查看任务订单、佣金、付款状态和订单时间线。',
  vip: '管理 VIP 等级门槛、佣金比例与提现权限。',
  rules: '配置平台策略规则，控制业务分发和收益逻辑。',
  users: '查看平台用户基础信息、状态和注册活跃情况。',
}

const initialFilters = {
  keyword: '',
  status: '全部',
  channel: '',
  startDate: '',
  endDate: '',
}

function filterRows(rows, filters) {
  return rows.filter((row) => {
    const text = Object.values(row).join(' ')

    if (filters.keyword && !text.toLowerCase().includes(filters.keyword.toLowerCase())) {
      return false
    }

    if (filters.status && filters.status !== '全部' && !text.includes(filters.status)) {
      return false
    }

    if (filters.channel && !text.toLowerCase().includes(filters.channel.toLowerCase())) {
      return false
    }

    if (filters.startDate && !text.includes(filters.startDate)) {
      return false
    }

    if (filters.endDate && !text.includes(filters.endDate)) {
      return false
    }

    return true
  })
}

function buildDynamicStats(dataset) {
  const totalAmount = dataset.reduce((sum, row) => {
    const values = Object.values(row)
      .join(' ')
      .match(/\d+(?:,\d+)?/g)
    if (!values) return sum
    return sum + Number(values[0].replaceAll(',', ''))
  }, 0)

  return {
    title: '当前页面统计',
    items: [
      { label: '记录总数', value: `${dataset.length}` },
      { label: '累计数值', value: `¥ ${totalAmount.toLocaleString()}` },
      { label: '今日新增', value: `${Math.max(0, Math.floor(dataset.length / 5))}` },
      { label: '昨日新增', value: `${Math.max(0, Math.floor(dataset.length / 6))}` },
    ],
  }
}

function buildWorkQueue(taskClaims, verifications, withdraws, recharges) {
  return [
    {
      key: 'taskClaims',
      title: 'Pending Task Reviews',
      count: taskClaims.filter((item) => item.status === '待审核' || item.status === 'under_review').length,
      note: 'Review submitted task proof records.',
    },
    {
      key: 'verifications',
      title: 'Pending Verifications',
      count: verifications.filter((item) => item.status === '待审核' || item.status === 'under_review').length,
      note: 'Verify identity documents and account names.',
    },
    {
      key: 'withdraw',
      title: 'Pending Withdrawals',
      count: withdraws.filter((item) => item.status === '待审核' || item.status === 'under_review').length,
      note: 'Verify payout accounts before approving.',
    },
    {
      key: 'recharge',
      title: 'Pending Recharges',
      count: recharges.filter((item) => item.status === 'under_review' || item.status === '待审核').length,
      note: 'Confirm payment and credit user balance.',
    },
  ]
}

function downloadRows(filename, rows) {
  const headers = Object.keys(rows[0] ?? {})
  const csv = [headers.join(','), ...rows.map((row) => headers.map((key) => `"${String(row[key] ?? '')}"`).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}

export function AdminDashboard({
  onSwitchToFrontend,
  onLogout,
  onChangePassword,
  onChangeAccount,
  onReviewTaskClaim,
  onReviewWithdraw,
  onReviewVerification,
  onReviewRecharge,
  onFreezeUser,
  onEditUser,
  onSaveVipLevels,
  onSaveRules,
  onReviewOrder,
  adminData,
  platformData,
  onSavePlatform,
  adminUsername,
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [activeKey, setActiveKey] = useState('dashboard')
  const [selectedTaskId, setSelectedTaskId] = useState(platformData.tasks[0]?.id)
  const [filters, setFilters] = useState(initialFilters)
  const [appliedFilters, setAppliedFilters] = useState(initialFilters)
  const [pages, setPages] = useState({
    frontendTasks: 1,
    taskClaims: 1,
    users: 1,
    verifications: 1,
    vip: 1,
    rules: 1,
    orders: 1,
    recharge: 1,
    withdraw: 1,
  })
  const [saving, setSaving] = useState(false)
  const [processingClaimId, setProcessingClaimId] = useState(null)
  const [processingWithdrawId, setProcessingWithdrawId] = useState(null)
  const [processingVerificationId, setProcessingVerificationId] = useState(null)
  const [processingRechargeId, setProcessingRechargeId] = useState(null)
  const [processingUserId, setProcessingUserId] = useState(null)
  const [processingOrderNo, setProcessingOrderNo] = useState(null)
  const [savingVip, setSavingVip] = useState(false)
  const [savingRules, setSavingRules] = useState(false)

  const statsGroups = adminData?.statsGroups ?? []
  const taskClaims = adminData?.taskClaims ?? []
  const verifications = adminData?.verifications ?? []
  const users = adminData?.users ?? []
  const vipLevels = adminData?.vipLevels ?? []
  const rules = adminData?.rules ?? []
  const orders = adminData?.orders ?? []
  const recharges = adminData?.recharges ?? []
  const withdraws = adminData?.withdraws ?? []

  const datasets = useMemo(
    () => ({
      frontendTasks: filterRows(platformData.tasks, appliedFilters),
      taskClaims: filterRows(taskClaims, appliedFilters),
      verifications: filterRows(verifications, appliedFilters),
      users: filterRows(users, appliedFilters),
      vip: filterRows(vipLevels, appliedFilters),
      rules: filterRows(rules, appliedFilters),
      orders: filterRows(orders, appliedFilters),
      recharge: filterRows(recharges, appliedFilters),
      withdraw: filterRows(withdraws, appliedFilters),
    }),
    [appliedFilters, orders, platformData.tasks, recharges, rules, taskClaims, verifications, users, vipLevels, withdraws],
  )

  const workQueue = useMemo(() => buildWorkQueue(taskClaims, verifications, withdraws, recharges), [taskClaims, verifications, withdraws, recharges])
  const currentRows = datasets[activeKey] ?? platformData.tasks
  const dynamicStats = buildDynamicStats(Array.isArray(currentRows) ? currentRows : [])
  const pageTitle = pageTitles[activeKey]
  const pageDescription = pageDescriptions[activeKey]

  const setPage = (key, page) => setPages((prev) => ({ ...prev, [key]: page }))

  const resetPages = () => setPages({ frontendTasks: 1, taskClaims: 1, users: 1, verifications: 1, vip: 1, rules: 1, orders: 1, recharge: 1, withdraw: 1 })

  const savePlatform = async (updater) => {
    const nextPlatform = typeof updater === 'function' ? updater(platformData) : updater
    setSaving(true)
    try {
      await onSavePlatform(nextPlatform)
    } finally {
      setSaving(false)
    }
  }

  const reviewClaim = async (claim, action) => {
    setProcessingClaimId(claim.id)
    try {
      await onReviewTaskClaim(claim.id, action, claim.rejectReason || '')
    } finally {
      setProcessingClaimId(null)
    }
  }

  const reviewWithdraw = async (row, action) => {
    setProcessingWithdrawId(row.id)
    try {
      await onReviewWithdraw(row.id, action, row.rejectReason || '')
    } finally {
      setProcessingWithdrawId(null)
    }
  }

  const reviewVerification = async (row, action, reason = '') => {
    setProcessingVerificationId(row.id)
    try {
      await onReviewVerification?.(row.id, action, reason)
    } finally {
      setProcessingVerificationId(null)
    }
  }

  const reviewRecharge = async (row, action, reason = '') => {
    setProcessingRechargeId(row.id)
    try {
      await onReviewRecharge?.(row.id, action, reason)
    } finally {
      setProcessingRechargeId(null)
    }
  }

  const renderCurrentSection = () => {
    switch (activeKey) {
      case 'frontendContent':
        return (
          <FrontendContentEditor
            data={platformData}
            selectedTaskId={selectedTaskId}
            onSelectTask={setSelectedTaskId}
            onUpdate={savePlatform}
          />
        )
      case 'frontendTasks':
        return (
          <FrontendTaskTable
            rows={datasets.frontendTasks}
            page={pages.frontendTasks}
            onPageChange={(page) => setPage('frontendTasks', page)}
            onSelect={(id) => {
              setSelectedTaskId(id)
              setActiveKey('frontendContent')
            }}
            onAddTask={(newTask) => {
              savePlatform((prev) => {
                const newId = Math.max(0, ...prev.tasks.map((t) => t.id)) + 1
                const task = { ...newTask, id: newId }
                return {
                  ...prev,
                  tasks: [...prev.tasks, task],
                  featuredTasks: [...prev.featuredTasks, task],
                }
              })
            }}
            onDeleteTask={(taskId) => {
              savePlatform((prev) => ({
                ...prev,
                tasks: prev.tasks.filter((t) => t.id !== taskId),
                featuredTasks: prev.featuredTasks.filter((t) => t.id !== taskId),
              }))
            }}
          />
        )
      case 'taskClaims':
        return (
          <TaskClaimTable
            rows={datasets.taskClaims}
            page={pages.taskClaims}
            onPageChange={(page) => setPage('taskClaims', page)}
            processingId={processingClaimId}
            onApprove={(claim) => reviewClaim(claim, 'approve')}
            onReject={(claim) => reviewClaim(claim, 'reject')}
          />
        )
      case 'users':
        return (
          <UserTable
            rows={datasets.users}
            page={pages.users}
            onPageChange={(page) => setPage('users', page)}
            processingId={processingUserId}
            onFreezeUser={async (userId, action) => {
              setProcessingUserId(userId)
              try { await onFreezeUser?.(userId, action) } finally { setProcessingUserId(null) }
            }}
            onEditUser={async (userId, body) => {
              setProcessingUserId(userId)
              try { await onEditUser?.(userId, body) } finally { setProcessingUserId(null) }
            }}
          />
        )
      case 'verifications':
        return (
          <VerificationTable
            rows={datasets.verifications}
            page={pages.verifications}
            onPageChange={(page) => setPage('verifications', page)}
            processingId={processingVerificationId}
            onApprove={(row) => reviewVerification(row, 'approve')}
            onReject={(row, reason) => reviewVerification(row, 'reject', reason)}
          />
        )
      case 'vip':
        return (
          <VIPTable
            rows={datasets.vip}
            page={pages.vip}
            onPageChange={(page) => setPage('vip', page)}
            saving={savingVip}
            onSaveVipLevels={async (levels) => {
              setSavingVip(true)
              try { await onSaveVipLevels?.(levels) } finally { setSavingVip(false) }
            }}
          />
        )
      case 'rules':
        return (
          <RuleTable
            rows={datasets.rules}
            saving={savingRules}
            onSaveRules={async (rules) => {
              setSavingRules(true)
              try { await onSaveRules?.(rules) } finally { setSavingRules(false) }
            }}
          />
        )
      case 'orders':
        return (
          <OrderTable
            rows={datasets.orders}
            page={pages.orders}
            onPageChange={(page) => setPage('orders', page)}
            processingId={processingOrderNo}
            onApprove={async (row) => {
              setProcessingOrderNo(row.orderNo)
              try { await onReviewOrder?.(row.orderNo, 'approve') } finally { setProcessingOrderNo(null) }
            }}
            onReject={async (row) => {
              setProcessingOrderNo(row.orderNo)
              try { await onReviewOrder?.(row.orderNo, 'reject') } finally { setProcessingOrderNo(null) }
            }}
          />
        )
      case 'recharge':
        return (
          <RechargeTable
            rows={datasets.recharge}
            page={pages.recharge}
            onPageChange={(page) => setPage('recharge', page)}
            processingId={processingRechargeId}
            onApprove={(row) => reviewRecharge(row, 'approve')}
            onReject={(row, reason) => reviewRecharge(row, 'reject', reason)}
          />
        )
      case 'withdraw':
      default:
        return (
          <WithdrawTable
            rows={datasets.withdraw}
            page={pages.withdraw}
            onPageChange={(page) => setPage('withdraw', page)}
            processingId={processingWithdrawId}
            onApprove={(row) => reviewWithdraw(row, 'approve')}
            onReject={(row) => reviewWithdraw(row, 'reject')}
          />
        )
    }
  }

  return (
    <Layout
      sidebar={
        <Sidebar
          collapsed={collapsed}
          activeKey={activeKey}
          onSelect={setActiveKey}
          onToggle={() => setCollapsed((prev) => !prev)}
          menus={sidebarMenus}
        />
      }
      navbar={
        <Navbar
          title={pageTitle}
          subtitle={pageDescription}
          adminUsername={adminUsername}
          onRefresh={() => setAppliedFilters({ ...appliedFilters })}
        />
      }
    >
      <div className="space-y-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Management Overview</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">{pageTitle}</h2>
              <p className="mt-2 text-sm text-slate-500">{pageDescription} {saving ? '当前有配置正在保存到服务端。' : '当前页面数据已与服务端保持同步。'}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onLogout}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                退出登录
              </button>
              <button
                type="button"
                onClick={onSwitchToFrontend}
                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 active:scale-95"
              >
                返回前台
              </button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          {workQueue.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setActiveKey(item.key)}
              className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_18px_40px_rgba(59,130,246,0.12)]"
            >
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">待办工作台</p>
              <div className="mt-3 flex items-end justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-500">{item.note}</p>
                </div>
                <div className={`rounded-2xl px-4 py-3 text-2xl font-semibold ${item.count > 0 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                  {item.count}
                </div>
              </div>
            </button>
          ))}
        </section>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {statsGroups.map((group, index) => (
            <StatsCard key={group.title} title={group.title} items={group.items} tone={index === 0 ? 'dark' : index === 1 ? 'blue' : 'default'} />
          ))}
          <StatsCard title={dynamicStats.title} items={dynamicStats.items} />
        </div>

        <SearchForm
          activeKey={activeKey}
          values={filters}
          onChange={setFilters}
          resultCount={Array.isArray(currentRows) ? currentRows.length : 0}
          onSearch={() => {
            setAppliedFilters(filters)
            resetPages()
          }}
          onReset={() => {
            setFilters(initialFilters)
            setAppliedFilters(initialFilters)
            resetPages()
          }}
          onExport={() => downloadRows(`${pageTitle}.csv`, Array.isArray(currentRows) ? currentRows : [])}
        />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <AccountPanel username={adminUsername} onSubmit={onChangeAccount} />
          <PasswordPanel onSubmit={onChangePassword} />
        </div>

        {renderCurrentSection()}
      </div>
    </Layout>
  )
}

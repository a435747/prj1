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
import { UserTable } from './components/UserTable'
import { VIPTable } from './components/VIPTable'
import { WithdrawTable } from './components/WithdrawTable'
import { searchFields, sidebarMenus } from './data/adminMock'

const pageTitles = {
  frontendContent: '前台内容',
  frontendTasks: '任务配置',
  withdraw: '提现管理',
  recharge: '充值管理',
  orders: '订单列表',
  vip: 'VIP 等级',
  rules: '打针规则',
  users: '用户管理',
}

function filterRows(rows, filters) {
  return rows.filter((row) => {
    const keywordChecks = [
      filters.username,
      filters.phone,
      filters.bindUserId,
      filters.orderNo,
      filters.inviteCode,
    ].filter(Boolean)

    if (!keywordChecks.length) return true

    const text = Object.values(row).join(' ')
    return keywordChecks.every((keyword) => text.includes(keyword))
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
    title: '当前列表统计',
    items: [
      { label: '当前列表总额', value: `¥ ${totalAmount.toLocaleString()}` },
      { label: '当前列表人数', value: `${dataset.length}` },
      { label: '今日新增', value: `${Math.max(0, Math.floor(dataset.length / 5))}` },
      { label: '昨日新增', value: `${Math.max(0, Math.floor(dataset.length / 6))}` },
    ],
  }
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
  adminData,
  platformData,
  onSavePlatform,
  adminUsername,
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [activeKey, setActiveKey] = useState('frontendContent')
  const [selectedTaskId, setSelectedTaskId] = useState(platformData.tasks[0]?.id)
  const [filters, setFilters] = useState(searchFields)
  const [appliedFilters, setAppliedFilters] = useState(searchFields)
  const [pages, setPages] = useState({
    frontendTasks: 1,
    users: 1,
    vip: 1,
    rules: 1,
    orders: 1,
    recharge: 1,
    withdraw: 1,
  })
  const [saving, setSaving] = useState(false)

  const statsGroups = adminData?.statsGroups ?? []
  const users = adminData?.users ?? []
  const vipLevels = adminData?.vipLevels ?? []
  const rules = adminData?.rules ?? []
  const orders = adminData?.orders ?? []
  const recharges = adminData?.recharges ?? []
  const withdraws = adminData?.withdraws ?? []

  const datasets = useMemo(
    () => ({
      frontendTasks: filterRows(platformData.tasks, appliedFilters),
      users: filterRows(users, appliedFilters),
      vip: filterRows(vipLevels, appliedFilters),
      rules: filterRows(rules, appliedFilters),
      orders: filterRows(orders, appliedFilters),
      recharge: filterRows(recharges, appliedFilters),
      withdraw: filterRows(withdraws, appliedFilters),
    }),
    [appliedFilters, orders, platformData.tasks, recharges, rules, users, vipLevels, withdraws],
  )

  const currentRows = datasets[activeKey] ?? platformData.tasks
  const dynamicStats = buildDynamicStats(Array.isArray(currentRows) ? currentRows : [])

  const setPage = (key, page) => setPages((prev) => ({ ...prev, [key]: page }))

  const savePlatform = async (updater) => {
    const nextPlatform = typeof updater === 'function' ? updater(platformData) : updater
    setSaving(true)
    try {
      await onSavePlatform(nextPlatform)
    } finally {
      setSaving(false)
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
            onSelect={setSelectedTaskId}
          />
        )
      case 'users':
        return <UserTable rows={datasets.users} page={pages.users} onPageChange={(page) => setPage('users', page)} />
      case 'vip':
        return <VIPTable rows={datasets.vip} page={pages.vip} onPageChange={(page) => setPage('vip', page)} />
      case 'rules':
        return <RuleTable rows={datasets.rules} page={pages.rules} onPageChange={(page) => setPage('rules', page)} />
      case 'orders':
        return <OrderTable rows={datasets.orders} page={pages.orders} onPageChange={(page) => setPage('orders', page)} />
      case 'recharge':
        return <RechargeTable rows={datasets.recharge} page={pages.recharge} onPageChange={(page) => setPage('recharge', page)} />
      case 'withdraw':
      default:
        return <WithdrawTable rows={datasets.withdraw} page={pages.withdraw} onPageChange={(page) => setPage('withdraw', page)} />
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
      navbar={<Navbar title="系统管理后台" adminUsername={adminUsername} onRefresh={() => setAppliedFilters({ ...appliedFilters })} />}
    >
      <div className="space-y-4">
        <div className="flex justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">{pageTitles[activeKey]}</h2>
            <p className="text-sm text-slate-500">这里的修改会实时保存到服务端。{saving ? ' 保存中...' : ''}</p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onLogout}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              退出登录
            </button>
            <button
              type="button"
              onClick={onSwitchToFrontend}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 active:scale-95"
            >
              返回前台
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <AccountPanel username={adminUsername} onSubmit={onChangeAccount} />
          <PasswordPanel onSubmit={onChangePassword} />
        </div>

        <SearchForm
          values={filters}
          onChange={setFilters}
          onSearch={() => {
            setAppliedFilters(filters)
            setPages({ frontendTasks: 1, users: 1, vip: 1, rules: 1, orders: 1, recharge: 1, withdraw: 1 })
          }}
          onExport={() => downloadRows(`${pageTitles[activeKey]}.csv`, Array.isArray(currentRows) ? currentRows : [])}
        />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {statsGroups.map((group) => (
            <StatsCard key={group.title} title={group.title} items={group.items} />
          ))}
          <StatsCard title={dynamicStats.title} items={dynamicStats.items} />
        </div>

        {renderCurrentSection()}
      </div>
    </Layout>
  )
}

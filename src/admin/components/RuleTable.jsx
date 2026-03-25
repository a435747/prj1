import { DataTable } from './DataTable'

const columns = [
  { key: 'agent', label: '所属代理' },
  { key: 'name', label: '名称' },
  { key: 'minAmount', label: '最低金额' },
  { key: 'minCommissionRate', label: '最低佣金比例' },
  { key: 'orderCount', label: '订单数量' },
  { key: 'ruleCount', label: '规则数量' },
  { key: 'userCount', label: '用户数量' },
  { key: 'recycle', label: '允许轮回' },
]

export function RuleTable(props) {
  return (
    <DataTable
      title="打针规则表格"
      columns={columns}
      {...props}
      renderActions={() => (
        <button type="button" className="rounded-md bg-blue-50 px-3 py-1 text-xs text-blue-600 transition hover:bg-blue-100">编辑</button>
      )}
    />
  )
}

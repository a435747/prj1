import { DataTable } from './DataTable'

const columns = [
  { key: 'name', label: '名称' },
  { key: 'icon', label: '图标' },
  { key: 'price', label: '会员价格' },
  { key: 'commissionRate', label: '佣金比例' },
  { key: 'chainRate', label: '连单佣金比例' },
  { key: 'subRate', label: '下级佣金比例' },
  { key: 'minBalance', label: '最小余额' },
  { key: 'orderTimes', label: '接单次数' },
  { key: 'withdrawTimes', label: '提现次数' },
  { key: 'withdrawRange', label: '提现最小/最大金额' },
  { key: 'invitePermission', label: '邀请权限' },
]

export function VIPTable(props) {
  return (
    <DataTable
      title="VIP 等级表格"
      columns={columns}
      {...props}
      renderActions={() => (
        <button type="button" className="rounded-md bg-blue-50 px-3 py-1 text-xs text-blue-600 transition hover:bg-blue-100">编辑</button>
      )}
    />
  )
}

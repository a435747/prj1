import { DataTable } from './DataTable'

const columns = [
  { key: 'orderNo', label: '订单号' },
  { key: 'username', label: '用户名' },
  { key: 'balance', label: '用户余额' },
  { key: 'frozen', label: '用户冻结金额' },
  { key: 'amount', label: '交易数额' },
  { key: 'commission', label: '佣金' },
  { key: 'level', label: '做单级别' },
  { key: 'orderTime', label: '下单时间/付款时间' },
  { key: 'finalPayTime', label: '最后付款时间' },
  { key: 'paid', label: '是否付款' },
  { key: 'status', label: '订单状态' },
]

export function OrderTable(props) {
  return (
    <DataTable
      title="订单管理表格"
      columns={columns}
      {...props}
      renderActions={() => (
        <div className="flex gap-2">
          <button type="button" className="rounded-md bg-green-50 px-3 py-1 text-xs text-green-600 transition hover:bg-green-100">通过</button>
          <button type="button" className="rounded-md bg-red-50 px-3 py-1 text-xs text-red-600 transition hover:bg-red-100">驳回</button>
        </div>
      )}
    />
  )
}

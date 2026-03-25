import { DataTable } from './DataTable'

const columns = [
  { key: 'status', label: '状态' },
  { key: 'confirmed', label: '是否确认' },
  { key: 'channel', label: '渠道' },
  { key: 'primaryAgent', label: '一级代理' },
  { key: 'secondaryAgent', label: '二级代理' },
  { key: 'orderNo', label: '订单号' },
  { key: 'username', label: '用户名称' },
  { key: 'phone', label: '手机号码' },
  { key: 'addTime', label: '添加时间' },
  { key: 'stats', label: '数据统计' },
]

export function RechargeTable(props) {
  return (
    <DataTable
      title="充值管理表格"
      columns={columns}
      {...props}
      renderActions={() => (
        <div className="flex gap-2">
          <button type="button" className="rounded-md bg-blue-50 px-3 py-1 text-xs text-blue-600 transition hover:bg-blue-100">查看</button>
          <button type="button" className="rounded-md bg-green-50 px-3 py-1 text-xs text-green-600 transition hover:bg-green-100">确认</button>
        </div>
      )}
    />
  )
}

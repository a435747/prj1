import { DataTable } from './DataTable'

const columns = [
  { key: 'agentReview', label: '代理审核' },
  { key: 'status', label: '状态' },
  { key: 'primaryAgent', label: '一级代理' },
  { key: 'secondaryAgent', label: '二级代理' },
  { key: 'orderNo', label: '订单号' },
  { key: 'username', label: '用户名称' },
  { key: 'phone', label: '手机号' },
  { key: 'initiateTime', label: '发起时间' },
  { key: 'paymentMethod', label: '当前付款方式' },
  { key: 'stats', label: '数据统计' },
  { key: 'detailOrder', label: '订单号/提现方式/代理' },
  { key: 'userInfo', label: '用户信息' },
  { key: 'agentGroup', label: '一级代理/二级代理' },
  { key: 'amount', label: '提现金额' },
  { key: 'bankInfo', label: '银行信息/usdt' },
  { key: 'wallet', label: '电子钱包' },
  { key: 'timeFlow', label: '发起/处理/回调' },
  { key: 'reviewStatus', label: '审核状态' },
  { key: 'thirdStatus', label: '三方状态' },
]

export function WithdrawTable(props) {
  return (
    <DataTable
      title="提现管理表格"
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

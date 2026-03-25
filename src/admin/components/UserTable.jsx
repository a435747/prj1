import { DataTable } from './DataTable'

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'bindUserId', label: '绑定用户ID' },
  { key: 'level', label: '级别' },
  { key: 'username', label: '用户名' },
  { key: 'phone', label: '手机号' },
  { key: 'inviteCode', label: '邀请码' },
  { key: 'loginCount', label: '登录次数' },
  { key: 'status', label: '使用状态' },
  { key: 'serviceLink', label: '客服链接' },
  { key: 'addTime', label: '添加时间' },
]

export function UserTable(props) {
  return (
    <DataTable
      title="用户表格"
      columns={columns}
      {...props}
      renderActions={() => (
        <div className="flex gap-2">
          <button type="button" className="rounded-md bg-blue-50 px-3 py-1 text-xs text-blue-600 transition hover:bg-blue-100">编辑</button>
          <button type="button" className="rounded-md bg-amber-50 px-3 py-1 text-xs text-amber-600 transition hover:bg-amber-100">冻结</button>
        </div>
      )}
    />
  )
}

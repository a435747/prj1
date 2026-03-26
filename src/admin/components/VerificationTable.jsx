import { DataTable } from './DataTable'

const columns = [
  { key: 'id', label: '记录ID' },
  { key: 'username', label: '用户' },
  { key: 'realName', label: '真实姓名' },
  { key: 'idCard', label: '身份证号' },
  { key: 'accountName', label: '账户姓名' },
  { key: 'status', label: '状态' },
  { key: 'createdAt', label: '提交时间' },
  { key: 'reviewedAt', label: '审核时间' },
  { key: 'summary', label: '备注' },
]

export function VerificationTable({ rows, page, onPageChange, onApprove, onReject, processingId }) {
  return (
    <DataTable
      title="实名认证审核"
      columns={columns}
      rows={rows}
      page={page}
      onPageChange={onPageChange}
      renderActions={(row) => {
        const locked = row.status !== '待审核' || processingId === row.id

        return (
          <div className="flex gap-2">
            <button
              type="button"
              disabled={locked}
              onClick={() => onApprove(row)}
              className="rounded-md bg-green-50 px-3 py-1 text-xs text-green-600 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {processingId === row.id ? '处理中...' : '通过'}
            </button>
            <button
              type="button"
              disabled={locked}
              onClick={() => {
                const reason = window.prompt('请输入驳回原因', '证件信息不清晰，请重新上传')
                if (reason === null) return
                onReject(row, reason)
              }}
              className="rounded-md bg-red-50 px-3 py-1 text-xs text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {processingId === row.id ? '处理中...' : '驳回'}
            </button>
          </div>
        )
      }}
    />
  )
}

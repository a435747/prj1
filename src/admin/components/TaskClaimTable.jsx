import { DataTable } from './DataTable'

const columns = [
  { key: 'id', label: '记录ID' },
  { key: 'username', label: '用户' },
  { key: 'title', label: '任务名称' },
  { key: 'amount', label: '预计收益' },
  { key: 'status', label: '审核状态' },
  { key: 'submittedAt', label: '提交时间' },
  { key: 'proofText', label: '任务凭证' },
]

export function TaskClaimTable({ rows, page, onPageChange, onApprove, onReject, processingId }) {
  return (
    <DataTable
      title="任务审核列表"
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
              onClick={() => {
                if (window.confirm(`确认通过任务：${row.title}？`)) onApprove(row)
              }}
              className="rounded-md bg-green-50 px-3 py-1 text-xs text-green-600 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {processingId === row.id ? '处理中...' : '通过'}
            </button>
            <button
              type="button"
              disabled={locked}
              onClick={() => {
                if (window.confirm(`确认驳回任务：${row.title}？`)) onReject(row)
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

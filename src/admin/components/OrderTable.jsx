import { useMemo, useState } from 'react'
import { DataTable } from './DataTable'

const columns = [
  { key: 'orderNo', label: 'Order No.' },
  { key: 'username', label: 'Username' },
  { key: 'amount', label: 'Amount' },
  { key: 'commission', label: 'Commission' },
  { key: 'status', label: 'Status' },
  { key: 'paid', label: 'Paid' },
  { key: 'orderTime', label: 'Order Time' },
  { key: 'finalPayTime', label: 'Final Pay Time' },
]

function statusClass(status) {
  if (status === '已完成' || status === 'completed') return 'bg-emerald-50 text-emerald-600'
  if (status === '已驳回' || status === 'rejected') return 'bg-red-50 text-red-600'
  return 'bg-amber-50 text-amber-600'
}

function statusLabel(status) {
  if (status === '已完成' || status === 'completed') return 'Completed'
  if (status === '已驳回' || status === 'rejected') return 'Rejected'
  if (status === '待审核' || status === 'under_review') return 'Under Review'
  return status || '--'
}

export function OrderTable({ rows = [], page, onPageChange, onApprove, onReject, processingId }) {
  const [confirmId, setConfirmId] = useState(null)

  const sortedRows = useMemo(
    () => [...rows].sort((a, b) => {
      const pending = (s) => s === '待审核' || s === 'under_review'
      if (pending(a.status) && !pending(b.status)) return -1
      if (!pending(a.status) && pending(b.status)) return 1
      return 0
    }),
    [rows],
  )

  const pendingCount = rows.filter((r) => r.status === '待审核' || r.status === 'under_review').length
  const doneCount = rows.filter((r) => r.status === '已完成' || r.status === 'completed').length
  const rejectedCount = rows.filter((r) => r.status === '已驳回' || r.status === 'rejected').length

  return (
    <div className="space-y-4">
      <section className="grid grid-cols-3 gap-4">
        {[['Under Review', pendingCount, 'text-amber-600'], ['Completed', doneCount, 'text-emerald-600'], ['Rejected', rejectedCount, 'text-red-500']].map(([label, value, cls]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
            <p className={`mt-2 text-2xl font-semibold ${cls}`}>{value}</p>
          </div>
        ))}
      </section>

      <DataTable
        title="Order Management"
        description="Review task orders. Pending orders are sorted to the top."
        columns={columns}
        rows={sortedRows}
        page={page}
        onPageChange={onPageChange}
        renderCell={(row, col) => {
          if (col.key === 'status') {
            return (
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusClass(row.status)}`}>
                {statusLabel(row.status)}
              </span>
            )
          }
          if (col.key === 'paid') {
            return (
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                row.paid === 'Yes' || row.paid === '是' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
              }`}>
                {row.paid === 'Yes' || row.paid === '是' ? 'Yes' : 'No'}
              </span>
            )
          }
          return String(row[col.key] ?? '--')
        }}
        renderActions={(row) => {
          const canReview = row.status === '待审核' || row.status === 'under_review'
          const isProcessing = processingId === row.orderNo

          if (!canReview) {
            return <span className={`text-xs font-medium ${statusClass(row.status)} rounded-full px-2 py-0.5`}>{statusLabel(row.status)}</span>
          }

          if (confirmId === row.orderNo) {
            return (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Approve order?</span>
                <button type="button" onClick={() => { onApprove?.(row); setConfirmId(null) }} className="rounded-md bg-emerald-50 px-3 py-1 text-xs text-emerald-600 hover:bg-emerald-100">Confirm</button>
                <button type="button" onClick={() => setConfirmId(null)} className="rounded-md bg-slate-50 px-3 py-1 text-xs text-slate-500 hover:bg-slate-100">Cancel</button>
              </div>
            )
          }

          return (
            <div className="flex gap-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => setConfirmId(row.orderNo)}
                className="rounded-md bg-emerald-50 px-3 py-1 text-xs text-emerald-600 transition hover:bg-emerald-100 disabled:opacity-50"
              >
                {isProcessing ? '...' : 'Approve'}
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => onReject?.(row)}
                className="rounded-md bg-red-50 px-3 py-1 text-xs text-red-600 transition hover:bg-red-100 disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          )
        }}
      />
    </div>
  )
}

import { useMemo, useState } from 'react'
import { DataTable } from './DataTable'
import { RejectReasonModal } from './RejectReasonModal'
import { ReviewDetailDrawer } from './ReviewDetailDrawer'

const columns = [
  { key: 'id', label: '记录ID' },
  { key: 'username', label: '用户' },
  { key: 'title', label: '任务名称' },
  { key: 'amount', label: '预计收益' },
  { key: 'status', label: '审核状态', type: 'status' },
  { key: 'createdAt', label: '领取时间' },
  { key: 'submittedAt', label: '提交时间' },
  { key: 'proofText', label: '任务凭证' },
  { key: 'summary', label: '处理说明' },
]

function buildReviewStats(rows) {
  const pending = rows.filter((row) => row.status === '待审核').length
  const approved = rows.filter((row) => row.status === '已完成').length
  const rejected = rows.filter((row) => row.status === '已驳回').length

  return [
    { label: '待审核', value: pending },
    { label: '已通过', value: approved },
    { label: '已驳回', value: rejected },
  ]
}

export function TaskClaimTable({ rows, page, onPageChange, onApprove, onReject, processingId }) {
  const [detailRow, setDetailRow] = useState(null)
  const [rejectRow, setRejectRow] = useState(null)
  const stats = buildReviewStats(rows)
  const sortedRows = useMemo(
    () =>
      [...rows].sort((a, b) => {
        if (a.status === '待审核' && b.status !== '待审核') return -1
        if (a.status !== '待审核' && b.status === '待审核') return 1
        return String(b.submittedAt || '').localeCompare(String(a.submittedAt || ''))
      }),
    [rows],
  )

  const detailSections = detailRow
    ? [
        {
          title: '任务记录',
          items: [
            { label: '记录ID', value: detailRow.id },
            { label: '任务名称', value: detailRow.title },
            { label: '审核状态', value: detailRow.status },
            { label: '预计收益', value: detailRow.amount },
          ],
        },
        {
          title: '用户与凭证',
          items: [
            { label: '用户', value: detailRow.username },
            { label: '领取时间', value: detailRow.createdAt },
            { label: '提交时间', value: detailRow.submittedAt },
            { label: '任务凭证', value: detailRow.proofText },
            { label: '处理说明', value: detailRow.summary },
          ],
        },
      ]
    : []

  return (
    <>
      <div className="space-y-4">
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {stats.map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{item.label}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{item.value}</p>
            </div>
          ))}
        </section>

        <DataTable
          title="任务审核列表"
          description="待审核记录已自动置顶，建议优先处理已提交任务凭证的记录。"
          columns={columns}
          rows={sortedRows}
          page={page}
          onPageChange={onPageChange}
          renderActions={(row) => {
            const locked = row.status !== '待审核' || processingId === row.id

            return (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setDetailRow(row)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  详情
                </button>
                <button
                  type="button"
                  disabled={locked}
                  onClick={() => {
                    if (window.confirm(`确认通过任务：${row.title}？`)) onApprove(row)
                  }}
                  className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {processingId === row.id ? '处理中...' : '通过'}
                </button>
                <button
                  type="button"
                  disabled={locked}
                  onClick={() => setRejectRow(row)}
                  className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  驳回
                </button>
              </div>
            )
          }}
        />
      </div>

      <ReviewDetailDrawer
        open={Boolean(detailRow)}
        title={detailRow?.title || '任务审核详情'}
        subtitle={detailRow ? `${detailRow.username} · ${detailRow.status}` : ''}
        record={detailRow}
        sections={detailSections}
        onClose={() => setDetailRow(null)}
      />

      <RejectReasonModal
        open={Boolean(rejectRow)}
        title={rejectRow ? `驳回任务：${rejectRow.title}` : '驳回任务'}
        initialValue={rejectRow?.summary || '任务凭证不符合要求，请重新提交完整截图。'}
        confirmText="确认驳回任务"
        onClose={() => setRejectRow(null)}
        onConfirm={(reason) => {
          if (!rejectRow) return
          onReject({ ...rejectRow, rejectReason: reason })
          setRejectRow(null)
        }}
      />
    </>
  )
}

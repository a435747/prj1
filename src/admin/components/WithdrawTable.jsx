import { useMemo, useState } from 'react'
import { DataTable } from './DataTable'
import { RejectReasonModal } from './RejectReasonModal'
import { ReviewDetailDrawer } from './ReviewDetailDrawer'

const columns = [
  { key: 'orderNo', label: '订单号' },
  { key: 'username', label: '用户名称' },
  { key: 'amount', label: '提现金额' },
  { key: 'status', label: '状态', type: 'status' },
  { key: 'accountType', label: '提现方式' },
  { key: 'accountNo', label: '收款账号' },
  { key: 'createdAt', label: '发起时间' },
  { key: 'reviewedAt', label: '审核时间' },
  { key: 'summary', label: '处理备注' },
]

function buildWithdrawStats(rows) {
  return [
    { label: '待审核', value: rows.filter((row) => row.status === '待审核').length },
    { label: '已通过', value: rows.filter((row) => row.status === '已通过').length },
    { label: '已驳回', value: rows.filter((row) => row.status === '已驳回').length },
  ]
}

export function WithdrawTable({ rows, page, onPageChange, onApprove, onReject, processingId }) {
  const [detailRow, setDetailRow] = useState(null)
  const [rejectRow, setRejectRow] = useState(null)
  const stats = buildWithdrawStats(rows)
  const sortedRows = useMemo(
    () =>
      [...rows].sort((a, b) => {
        if (a.status === '待审核' && b.status !== '待审核') return -1
        if (a.status !== '待审核' && b.status === '待审核') return 1
        return String(b.createdAt || '').localeCompare(String(a.createdAt || ''))
      }),
    [rows],
  )

  const detailSections = detailRow
    ? [
        {
          title: '提现订单',
          items: [
            { label: '订单号', value: detailRow.orderNo },
            { label: '用户名称', value: detailRow.username },
            { label: '提现金额', value: detailRow.amount },
            { label: '审核状态', value: detailRow.status },
          ],
        },
        {
          title: '收款信息',
          items: [
            { label: '提现方式', value: detailRow.accountType },
            { label: '收款账号', value: detailRow.accountNo },
            { label: '发起时间', value: detailRow.createdAt },
            { label: '审核时间', value: detailRow.reviewedAt },
            { label: '处理备注', value: detailRow.summary },
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
          title="提现管理表格"
          description="展示提现账户、审核时间与处理备注，便于财务与风控共同核验。"
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
                    if (window.confirm(`确认通过提现：${row.amount} / ${row.username}？`)) onApprove(row)
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
        title={detailRow?.orderNo || '提现详情'}
        subtitle={detailRow ? `${detailRow.username} · ${detailRow.status}` : ''}
        record={detailRow}
        sections={detailSections}
        onClose={() => setDetailRow(null)}
      />

      <RejectReasonModal
        open={Boolean(rejectRow)}
        title={rejectRow ? `驳回提现：${rejectRow.orderNo}` : '驳回提现'}
        initialValue={rejectRow?.summary || '收款信息校验未通过，请核对后重新提交。'}
        confirmText="确认驳回提现"
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

import { useMemo, useState } from 'react'
import { DataTable } from './DataTable'
import { RejectReasonModal } from './RejectReasonModal'
import { ReviewDetailDrawer } from './ReviewDetailDrawer'

const columns = [
  { key: 'id', label: '记录ID' },
  { key: 'username', label: '用户' },
  { key: 'realName', label: '真实姓名' },
  { key: 'idCard', label: '身份证号' },
  { key: 'accountName', label: '账户姓名' },
  { key: 'status', label: '状态', type: 'status' },
  { key: 'createdAt', label: '提交时间' },
  { key: 'reviewedAt', label: '审核时间' },
  { key: 'summary', label: '审核备注' },
]

function buildVerificationStats(rows) {
  return [
    { label: '待审核', value: rows.filter((row) => row.status === '待审核').length },
    { label: '已通过', value: rows.filter((row) => row.status === '已通过').length },
    { label: '已驳回', value: rows.filter((row) => row.status === '已驳回').length },
  ]
}

export function VerificationTable({ rows, page, onPageChange, onApprove, onReject, processingId }) {
  const [detailRow, setDetailRow] = useState(null)
  const [rejectRow, setRejectRow] = useState(null)
  const stats = buildVerificationStats(rows)
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
          title: '实名资料',
          items: [
            { label: '记录ID', value: detailRow.id },
            { label: '用户', value: detailRow.username },
            { label: '真实姓名', value: detailRow.realName },
            { label: '身份证号', value: detailRow.idCard },
          ],
        },
        {
          title: '审核信息',
          items: [
            { label: '账户姓名', value: detailRow.accountName },
            { label: '审核状态', value: detailRow.status },
            { label: '提交时间', value: detailRow.createdAt },
            { label: '审核时间', value: detailRow.reviewedAt },
            { label: '审核备注', value: detailRow.summary },
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
          title="实名认证审核"
          description="核验实名、证件号和收款账户姓名，驳回时请填写明确原因。"
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
                  onClick={() => onApprove(row)}
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
        title={detailRow?.realName || '实名认证详情'}
        subtitle={detailRow ? `${detailRow.username} · ${detailRow.status}` : ''}
        record={detailRow}
        sections={detailSections}
        onClose={() => setDetailRow(null)}
      />

      <RejectReasonModal
        open={Boolean(rejectRow)}
        title={rejectRow ? `驳回实名：${rejectRow.realName}` : '驳回实名认证'}
        initialValue={rejectRow?.summary || '证件信息不清晰，请重新上传真实有效的证件资料。'}
        confirmText="确认驳回实名"
        onClose={() => setRejectRow(null)}
        onConfirm={(reason) => {
          if (!rejectRow) return
          onReject(rejectRow, reason)
          setRejectRow(null)
        }}
      />
    </>
  )
}

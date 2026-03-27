function toneForStatus(value = '') {
  if (['已通过', '已完成', '正常', '成功', '是'].includes(value)) {
    return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
  }
  if (['已驳回', '失败', '冻结', '否'].includes(value)) {
    return 'bg-red-50 text-red-700 ring-1 ring-red-100'
  }
  if (['待审核', '处理中', '审核中', '待处理', '待确认', '待提交'].includes(value)) {
    return 'bg-amber-50 text-amber-700 ring-1 ring-amber-100'
  }
  return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
}

function renderCell(column, row) {
  if (typeof column.render === 'function') return column.render(row[column.key], row)

  const value = row[column.key]
  if (column.type === 'status') {
    return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${toneForStatus(String(value ?? ''))}`}>{value || '--'}</span>
  }

  if (typeof value === 'string' && value.length > 38) {
    return <div className="max-w-[320px] whitespace-normal break-words leading-6 text-slate-700">{value}</div>
  }

  return <span className="text-slate-700">{value || '--'}</span>
}

function Pagination({ page, totalPages, onPageChange }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(Math.max(1, page - 1))}
        className="rounded-lg border border-slate-200 px-3 py-1.5 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        上一页
      </button>
      <span className="text-slate-500">第 {page} / {totalPages} 页</span>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        className="rounded-lg border border-slate-200 px-3 py-1.5 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        下一页
      </button>
    </div>
  )
}

export function DataTable({ title, description, columns, rows, page, pageSize = 20, onPageChange, renderActions }) {
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
  const start = (page - 1) * pageSize
  const end = Math.min(rows.length, start + pageSize)
  const pageRows = rows.slice(start, start + pageSize)

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">{description || `共 ${rows.length} 条记录，当前展示 ${rows.length ? start + 1 : 0}-${end} 条。`}</p>
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="sticky top-0 z-[1] bg-slate-50 px-4 py-3 font-medium whitespace-nowrap text-slate-600">
                  {column.label}
                </th>
              ))}
              {renderActions ? <th className="sticky top-0 z-[1] bg-slate-50 px-4 py-3 font-medium whitespace-nowrap text-slate-600">操作</th> : null}
            </tr>
          </thead>
          <tbody>
            {pageRows.length ? (
              pageRows.map((row, rowIndex) => (
                <tr key={row.id ?? row.orderNo ?? row.name ?? row.username ?? rowIndex} className={`${rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} transition hover:bg-blue-50/60`}>
                  {columns.map((column) => (
                    <td key={column.key} className="border-t border-slate-100 px-4 py-3 align-top whitespace-nowrap">
                      {renderCell(column, row)}
                    </td>
                  ))}
                  {renderActions ? <td className="border-t border-slate-100 px-4 py-3 align-top">{renderActions(row)}</td> : null}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + (renderActions ? 1 : 0)} className="px-4 py-12 text-center text-sm text-slate-500">
                  当前没有符合筛选条件的数据。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

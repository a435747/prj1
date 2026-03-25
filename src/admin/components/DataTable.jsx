function Pagination({ page, totalPages, onPageChange }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <button type="button" onClick={() => onPageChange(Math.max(1, page - 1))} className="rounded-md border border-slate-200 px-3 py-1.5 transition hover:bg-slate-50">上一页</button>
      <span className="text-slate-500">第 {page} / {totalPages} 页</span>
      <button type="button" onClick={() => onPageChange(Math.min(totalPages, page + 1))} className="rounded-md border border-slate-200 px-3 py-1.5 transition hover:bg-slate-50">下一页</button>
    </div>
  )
}

export function DataTable({ title, columns, rows, page, pageSize = 20, onPageChange, renderActions }) {
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
  const start = (page - 1) * pageSize
  const pageRows = rows.slice(start, start + pageSize)

  return (
    <section className="rounded-lg bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="sticky top-0 bg-slate-50 px-3 py-3 font-medium whitespace-nowrap text-slate-600">
                  {column.label}
                </th>
              ))}
              {renderActions ? <th className="sticky top-0 bg-slate-50 px-3 py-3 font-medium whitespace-nowrap text-slate-600">操作</th> : null}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, rowIndex) => (
              <tr key={row.id ?? row.orderNo ?? row.name ?? row.username} className={`${rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'} transition hover:bg-blue-50`}>
                {columns.map((column) => (
                  <td key={column.key} className="border-t border-slate-100 px-3 py-3 align-top whitespace-nowrap text-slate-700">
                    {row[column.key]}
                  </td>
                ))}
                {renderActions ? <td className="border-t border-slate-100 px-3 py-3">{renderActions(row)}</td> : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

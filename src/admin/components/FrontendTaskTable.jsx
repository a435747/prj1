import { DataTable } from './DataTable'

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'title', label: '标题' },
  { key: 'price', label: '价格' },
  { key: 'city', label: '城市' },
  { key: 'location', label: '位置' },
  { key: 'badge', label: '标签' },
  { key: 'type', label: '分类' },
]

export function FrontendTaskTable(props) {
  return (
    <DataTable
      title="前台任务管理"
      columns={columns}
      {...props}
      renderActions={(row) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => props.onSelect?.(row.id)}
            className="rounded-md bg-blue-50 px-3 py-1 text-xs text-blue-600 transition hover:bg-blue-100"
          >
            编辑
          </button>
        </div>
      )}
    />
  )
}

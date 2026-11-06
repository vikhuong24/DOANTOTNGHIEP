// Table component - columns, data, loading, empty state, optional pagination
import Loading from '../Loading/Loading';
import EmptyState from '../EmptyState/EmptyState';
import './Table.css';

const Table = ({
  columns = [],
  data = [],
  loading = false,
  emptyTitle = 'Không có dữ liệu',
  emptyDescription = 'Chưa có bản ghi nào trong danh sách.',
  rowKey = 'id',
  onRowClick,
}) => {
  if (loading) return <Loading type="skeleton" rows={5} />;
  if (!data.length)
    return <EmptyState title={emptyTitle} description={emptyDescription} />;

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={{ width: col.width }} className={col.align ? `text-${col.align}` : ''}>
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={row[rowKey] ?? row.id ?? row.maNguoiDung ?? row.mahocsinh ?? row.maHocSinh ?? row.maBaiTaiTro ?? row.madotphanbo ?? row.madexuat ?? row.maphanhoi ?? index}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={onRowClick ? 'table-row--clickable' : ''}
            >
              {columns.map((col) => (
                <td key={col.key} className={col.align ? `text-${col.align}` : ''}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;

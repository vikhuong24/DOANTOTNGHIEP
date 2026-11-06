// Pagination component - page, totalPages, onChange
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './Pagination.css';

const Pagination = ({ page = 1, totalPages = 1, onChange, className = '' }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const delta = 2;
  const left = page - delta;
  const right = page + delta + 1;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= left && i < right)) {
      pages.push(i);
    }
  }

  const items = [];
  let prev = null;
  for (const p of pages) {
    if (prev && p - prev > 1) items.push('...');
    items.push(p);
    prev = p;
  }

  return (
    <div className={`pagination ${className}`}>
      <button
        className="pagination-btn"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="Trang trước"
      >
        <FiChevronLeft />
      </button>

      {items.map((item, idx) =>
        item === '...' ? (
          <span key={`dots-${idx}`} className="pagination-dots">…</span>
        ) : (
          <button
            key={item}
            className={`pagination-btn ${page === item ? 'pagination-btn--active' : ''}`}
            onClick={() => onChange(item)}
          >
            {item}
          </button>
        )
      )}

      <button
        className="pagination-btn"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Trang sau"
      >
        <FiChevronRight />
      </button>
    </div>
  );
};

export default Pagination;

// Re-export tất cả formatters và helper xử lý ảnh
export * from './formatCurrency';
export * from './formatDate';

/**
 * Chuẩn hóa URL ảnh, tự động thêm backend host nếu là đường dẫn tĩnh /uploads/...
 * @param {string} url - Đường dẫn ảnh
 * @param {string} fallback - Ảnh mặc định nếu url rỗng
 * @returns {string}
 */
export const formatImageUrl = (
  url,
  fallback = 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600'
) => {
  if (!url || typeof url !== 'string' || !url.trim()) return fallback;
  const trimmed = url.trim();
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed;
  }
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
  const hostBase = apiBase.replace(/\/api\/?$/, '');
  return `${hostBase}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
};

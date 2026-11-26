// Re-export tất cả formatters và helper xử lý ảnh
export * from './formatCurrency';
export * from './formatDate';

// Các ảnh bìa mẫu trong data.sql chưa có file vật lý trên server Backend -> ánh xạ sang public/images/
const SAMPLE_BANNER_FALLBACKS = {
  '/uploads/banners/may-doc-sach-braille.jpg': '/images/may_danh_chu_noi.jpg',
  '/uploads/banners/hoc-bong-anh-sang.jpg': encodeURI('/images/HỌC BỔNG ÁNH SÁNG VƯỢT KHÓ.jpg'),
  '/uploads/banners/gay-dinh-huong-thong-minh.jpg': '/images/gay_khiem_thi.jpg',
  '/uploads/banners/bep-an-dinh-duong.jpg': '/images/bep_an_bt.jpg',
  '/uploads/banners/nhac-cu-dan-toc.jpg': '/images/minhchungmau.jpg',
};

/**
 * Chuẩn hóa URL ảnh/tệp đính kèm:
 * - Đường dẫn /uploads/... từ Backend được nối với VITE_API_URL (http://localhost:8080/api/uploads/...)
 *   để lấy trực tiếp file thật đã upload trên Backend.
 * - Các ảnh bìa mẫu chưa có file vật lý được ánh xạ về public/images/.
 * @param {string} url - Đường dẫn ảnh hoặc tệp
 * @param {string} fallback - Ảnh mặc định nếu url rỗng
 * @returns {string}
 */
export const formatImageUrl = (
  url,
  fallback = '/images/minhchungmau.jpg'
) => {
  if (!url || typeof url !== 'string' || !url.trim()) return fallback;
  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();

  if (
    lower.startsWith('http://') ||
    lower.startsWith('https://') ||
    lower.startsWith('data:') ||
    lower.startsWith('blob:')
  ) {
    return trimmed;
  }

  if (lower.startsWith('/images/')) {
    return encodeURI(trimmed);
  }

  // Ánh xạ 4 ảnh bìa mẫu trong data.sql sang public/images/
  if (SAMPLE_BANNER_FALLBACKS[lower]) {
    return SAMPLE_BANNER_FALLBACKS[lower];
  }

  // Đường dẫn biên lai cũ (chưa qua /uploads/) từ dữ liệu test trước đây
  if (lower.startsWith('receipts/') || lower.startsWith('/receipts/')) {
    return fallback || '/images/minhchungmau.jpg';
  }

  // Mặc định: nối với API base URL (VD: http://localhost:8080/api/uploads/evidences/...)
  const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/+$/, '');
  return `${apiBase}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
};
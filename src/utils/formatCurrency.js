// Định dạng tiền tệ VNĐ

/**
 * Format số thành chuỗi tiền tệ VNĐ
 * @param {number} amount - Số tiền
 * @param {boolean} showCurrency - Hiển thị đơn vị tiền tệ
 * @returns {string}
 */
export const formatCurrency = (amount, showCurrency = true) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '—';
  const formatted = new Intl.NumberFormat('vi-VN').format(amount);
  return showCurrency ? `${formatted} đ` : formatted;
};

/**
 * Format số thành dạng rút gọn (1.2M, 500K, ...)
 * @param {number} amount
 * @returns {string}
 */
export const formatCurrencyShort = (amount) => {
  if (!amount) return '0 đ';
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)} tỷ đ`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)} triệu đ`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K đ`;
  return `${amount} đ`;
};

/**
 * Parse chuỗi tiền tệ thành số
 * @param {string} str
 * @returns {number}
 */
export const parseCurrency = (str) => {
  if (!str) return 0;
  return Number(str.replace(/[^\d]/g, ''));
};

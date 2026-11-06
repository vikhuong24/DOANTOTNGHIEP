// Các hàm validate dữ liệu đầu vào

/**
 * Validate email
 * @param {string} email
 * @returns {string|null} Lỗi hoặc null nếu hợp lệ
 */
export const validateEmail = (email) => {
  if (!email) return 'Email không được để trống';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return 'Email không hợp lệ';
  return null;
};

/**
 * Validate mật khẩu
 * @param {string} password
 * @returns {string|null}
 */
export const validatePassword = (password) => {
  if (!password) return 'Mật khẩu không được để trống';
  if (password.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự';
  return null;
};

/**
 * Validate số điện thoại VN
 * @param {string} phone
 * @returns {string|null}
 */
export const validatePhone = (phone) => {
  if (!phone) return 'Số điện thoại không được để trống';
  const re = /^(0|\+84)[3-9]\d{8}$/;
  if (!re.test(phone)) return 'Số điện thoại không hợp lệ';
  return null;
};

/**
 * Validate trường bắt buộc
 * @param {string} value
 * @param {string} fieldName
 * @returns {string|null}
 */
export const validateRequired = (value, fieldName = 'Trường này') => {
  if (!value || (typeof value === 'string' && !value.trim()))
    return `${fieldName} không được để trống`;
  return null;
};

/**
 * Validate số tiền tối thiểu
 * @param {number} amount
 * @param {number} min
 * @returns {string|null}
 */
export const validateMinAmount = (amount, min = 10000) => {
  if (!amount || isNaN(amount)) return 'Số tiền không hợp lệ';
  if (amount < min) return `Số tiền tối thiểu là ${min.toLocaleString('vi-VN')} đ`;
  return null;
};

/**
 * Validate URL
 * @param {string} url
 * @returns {string|null}
 */
export const validateUrl = (url) => {
  if (!url) return null; // URL không bắt buộc
  try {
    new URL(url);
    return null;
  } catch {
    return 'URL không hợp lệ';
  }
};

/**
 * Validate kích thước file ảnh
 * @param {File} file
 * @param {number} maxSize - bytes
 * @returns {string|null}
 */
export const validateImageFile = (file, maxSize = 5 * 1024 * 1024) => {
  if (!file) return null;
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.type)) return 'Chỉ chấp nhận file JPG, PNG, WEBP';
  if (file.size > maxSize) return `Kích thước file tối đa ${maxSize / 1024 / 1024}MB`;
  return null;
};

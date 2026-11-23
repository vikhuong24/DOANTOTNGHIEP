// Các hàm validate dữ liệu đầu vào chuẩn hóa theo quy tắc Backend Spring Boot
// Trường Phổ Thông Chuyên Biệt Nguyễn Đình Chiểu Đà Nẵng

/**
 * Validate email theo đúng chuẩn regex Backend (@Pattern(regexp = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}$"))
 * @param {string} email
 * @returns {string|null} Lỗi hoặc null nếu hợp lệ
 */
export const validateEmail = (email) => {
  if (!email || !String(email).trim()) return 'Email không được để trống';
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (!re.test(String(email).trim())) {
    return 'Email không đúng định dạng (Ví dụ: example@domain.com)';
  }
  return null;
};

/**
 * Validate mật khẩu theo yêu cầu Backend: từ 6 đến 50 ký tự
 * @param {string} password
 * @returns {string|null}
 */
export const validatePassword = (password) => {
  if (!password) return 'Mật khẩu không được để trống';
  if (password.length < 6) return 'Mật khẩu phải từ 6 đến 50 ký tự';
  if (password.length > 50) return 'Mật khẩu không được vượt quá 50 ký tự';
  return null;
};

/**
 * Validate số điện thoại theo Backend: bắt đầu bằng 0 và có đúng 10 chữ số (@Pattern(regexp = "^0\\d{9}$"))
 * @param {string} phone
 * @returns {string|null}
 */
export const validatePhone = (phone) => {
  if (!phone || !String(phone).trim()) return 'Số điện thoại không được để trống';
  const re = /^0\d{9}$/;
  if (!re.test(String(phone).trim())) {
    return 'Số điện thoại không hợp lệ. Phải bắt đầu bằng số 0 và bao gồm đúng 10 chữ số';
  }
  return null;
};

/**
 * Validate trường bắt buộc
 * @param {string} value
 * @param {string} fieldName
 * @returns {string|null}
 */
export const validateRequired = (value, fieldName = 'Trường này') => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} không được để trống`;
  }
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

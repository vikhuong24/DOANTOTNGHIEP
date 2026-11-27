// Axios instance với base URL và interceptor token chuẩn cho Backend Spring Boot
// Tích hợp kiểm tra hạn JWT và quản lý Bearer Token
import axios from 'axios';
import { isTokenExpired } from '../utils/jwt';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: tự động đính kèm Bearer JWT token vào header nếu token còn hợp lệ
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Kiểm tra token đã hết hạn chưa trước khi gửi request
      if (isTokenExpired(token)) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new CustomEvent('auth:expired'));

        // Chuyển hướng sang trang login nếu đang ở trang yêu cầu xác thực
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
          window.location.href = '/login';
        }

        return Promise.reject({
          status: 401,
          code: 1004,
          message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
        });
      }

      config.headers.Authorization = `Bearer ${token}`;
    }
    // Khi gửi FormData, xóa Content-Type mặc định (application/json) để trình duyệt tự sinh boundary
    if (config.data instanceof FormData && config.headers) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: xử lý cấu trúc ApiResponse từ Backend
api.interceptors.response.use(
  (response) => {
    // Trả về dữ liệu từ response.data
    return response.data;
  },
  (error) => {
    const status = error.response?.status;
    const errorData = error.response?.data;

    // 401 Unauthorized: token hết hạn hoặc không hợp lệ -> xóa session và chuyển hướng đăng nhập
    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new CustomEvent('auth:expired'));

      // Tránh lặp vô hạn nếu đang ở trang login
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }

    // Trích xuất thông điệp lỗi rõ ràng từ ApiResponse của Backend Spring Boot
    let message = errorData?.message || errorData?.error;

    // Nếu Backend trả về lỗi validation trường dữ liệu (MethodArgumentNotValidException)
    if (!message && errorData?.result && typeof errorData.result === 'object') {
      const fieldErrors = Object.values(errorData.result);
      if (fieldErrors.length > 0) {
        message = fieldErrors[0];
      }
    }

    if (!message) {
      if (status === 403) {
        message = 'Bạn không có quyền thực hiện thao tác này';
      } else if (status === 404) {
        message = 'Không tìm thấy dữ liệu yêu cầu';
      } else if (status >= 500) {
        message = 'Máy chủ gặp sự cố, vui lòng thử lại sau';
      } else {
        message = error.message || 'Đã xảy ra lỗi trong quá trình xử lý';
      }
    }

    return Promise.reject({
      status,
      code: errorData?.code,
      message,
      data: errorData,
      errors: (errorData?.result && typeof errorData.result === 'object') ? errorData.result : null,
    });
  }
);

/**
 * Helper unwrap kết quả từ Spring Boot ApiResponse:
 * Hỗ trợ ApiResponse<T> -> result -> items hoặc result trực tiếp
 */
export const unwrap = (res) => {
  if (!res) return null;
  if (res.result !== undefined) return res.result;
  if (res.data !== undefined) return res.data;
  return res;
};

/**
 * Helper unwrap danh sách mảng an toàn:
 * Hỗ trợ PageCustomResponse (items), mảng trực tiếp, hoặc fallback []
 */
export const unwrapList = (res) => {
  const unwrapped = unwrap(res);
  if (!unwrapped) return [];
  if (Array.isArray(unwrapped)) return unwrapped;
  if (Array.isArray(unwrapped.items)) return unwrapped.items;
  if (Array.isArray(unwrapped.content)) return unwrapped.content;
  return [];
};

export default api;

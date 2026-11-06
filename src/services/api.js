// Axios instance với base URL và interceptor token chuẩn cho Backend Spring Boot
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: gắn Bearer JWT token vào header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
      // Tránh lặp vô hạn nếu đang ở trang login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    // Trích xuất thông điệp lỗi rõ ràng từ ApiResponse của Backend Spring Boot
    const message =
      errorData?.message ||
      errorData?.error ||
      (status === 403 ? 'Bạn không có quyền thực hiện thao tác này' : null) ||
      (status === 404 ? 'Không tìm thấy dữ liệu yêu cầu' : null) ||
      (status >= 500 ? 'Máy chủ gặp sự cố, vui lòng thử lại sau' : null) ||
      error.message ||
      'Đã xảy ra lỗi trong quá trình xử lý';

    return Promise.reject({
      status,
      code: errorData?.code,
      message,
      data: errorData,
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

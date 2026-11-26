// Service xác thực người dùng - Kết nối trực tiếp API Backend Spring Boot
// Tương thích với controller /guest/register và /guest/login
import api, { unwrap } from './api';
import { ROLE_ROUTE_PREFIX } from '../utils/constants';
import { isTokenExpired, parseJwt } from '../utils/jwt';

/**
 * Chuẩn hóa đối tượng người dùng từ AuthResponse backend hoặc JWT Payload
 * @param {object} authData
 * @returns {object|null}
 */
export const normalizeUser = (authData) => {
  if (!authData) return null;

  const rawRole = authData.vaiTro || authData.role || authData.maVaiTro || '';
  const roleCode = String(rawRole).toUpperCase();
  const roleSlug = ROLE_ROUTE_PREFIX[roleCode] || 'guest';

  const maNguoiDung = authData.maNguoiDung || authData.userId || authData.id;
  const hoTen = authData.hoTen || authData.name || authData.hoten || '';
  const email = authData.email || (authData.sub && authData.sub.includes('@') ? authData.sub : '');
  const tenDangNhap = authData.tenDangNhap || authData.tendangnhap || authData.sub || email;

  return {
    ...authData,
    id: maNguoiDung,
    maNguoiDung,
    name: hoTen,
    hoten: hoTen,
    hoTen,
    email,
    tendangnhap: tenDangNhap,
    tenDangNhap,
    role: roleCode,
    maVaiTro: roleCode,
    vaiTro: roleCode,
    roleCode,
    roleSlug,
  };
};

/**
 * Đăng nhập hệ thống (Hỗ trợ xác thực thông minh bằng Email hoặc Tên đăng nhập)
 * API Backend: POST /api/guest/login
 * @param {string} usernameOrEmail - Email hoặc Tên đăng nhập
 * @param {string} password - Mật khẩu
 * @returns {Promise<{user: object, token: string, message: string}>}
 */
export const login = async (usernameOrEmail, password) => {
  const payload = {
    usernameOrEmail: String(usernameOrEmail || '').trim(),
    matKhau: String(password || ''),
  };

  const response = await api.post('/guest/login', payload);
  const authResponse = unwrap(response);

  if (!authResponse?.token) {
    throw new Error(response?.message || 'Đăng nhập không thành công, không nhận được token');
  }

  const token = authResponse.token;
  const user = normalizeUser(authResponse);

  // Lưu trữ phiên đăng nhập vào localStorage
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));

  return {
    user,
    token,
    message: response?.message || 'Đăng nhập thành công',
  };
};

/**
 * Đăng ký tài khoản Nhà hảo tâm
 * API Backend: POST /api/guest/register
 * Payload đúng theo RegisterRequest của backend: hoTen, email, sdt, matKhau
 * @param {object} userData
 * @returns {Promise<{success: boolean, message: string, data: object}>}
 */
export const register = async (userData) => {
  const payload = {
    hoTen: String(userData.hoten || userData.hoTen || userData.name || '').trim(),
    email: String(userData.email || '').trim().toLowerCase(),
    sdt: String(userData.sdt || userData.phone || '').trim(),
    matKhau: String(userData.matkhau || userData.password || ''),
  };

  const response = await api.post('/guest/register', payload);
  const authResponse = unwrap(response);

  return {
    success: true,
    message: response?.message || 'Đăng ký tài khoản Nhà hảo tâm thành công',
    data: authResponse,
  };
};

/**
 * Đăng xuất tài khoản khỏi hệ thống
 */
export const logout = async () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  return Promise.resolve();
};

/**
 * Lấy token hiện tại nếu còn hợp lệ
 * @returns {string|null}
 */
export const getToken = () => {
  const token = localStorage.getItem('token');
  if (!token || isTokenExpired(token)) {
    if (token) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return null;
  }
  return token;
};

/**
 * Lấy thông tin người dùng hiện tại từ localStorage
 * Kiểm tra tính hợp lệ của token đính kèm
 * @returns {object|null}
 */
export const getCurrentUser = () => {
  const token = getToken();
  if (!token) return null;

  const rawUser = localStorage.getItem('user');
  if (!rawUser) {
    // Nếu có token nhưng mất object user trong localStorage, tái tạo từ JWT payload
    const payload = parseJwt(token);
    if (payload) {
      const user = normalizeUser(payload);
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    }
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
};

/**
 * Lấy thông tin hồ sơ cá nhân của Nhà hảo tâm từ backend
 * Endpoint: GET /donor/profile
 * @returns {Promise<object>}
 */
export const getProfile = async () => {
  const res = await api.get('/donor/profile');
  return unwrap(res);
};

/**
 * Cập nhật thông tin tài khoản cá nhân của Nhà hảo tâm
 * Endpoint: PUT /donor/profile
 * Payload: { hoTen, email, sdt, diaChi }
 * @param {object} data
 * @returns {Promise<{profile: object, user: object, message: string}>}
 */
export const updateProfile = async (data) => {
  const payload = {
    hoTen: data.hoTen || data.hoten || data.name || undefined,
    email: data.email ? String(data.email).trim().toLowerCase() : undefined,
    sdt: data.sdt ? String(data.sdt).trim() : undefined,
    diaChi: data.diaChi !== undefined ? data.diaChi : (data.diachi !== undefined ? data.diachi : undefined),
  };

  const res = await api.put('/donor/profile', payload);
  const updatedProfile = unwrap(res);
  const currentUser = getCurrentUser() || {};
  const mergedUser = normalizeUser({
    ...currentUser,
    ...updatedProfile,
  });

  if (mergedUser) {
    localStorage.setItem('user', JSON.stringify(mergedUser));
  }

  return {
    profile: updatedProfile,
    user: mergedUser,
    message: res?.message || 'Cập nhật thông tin cá nhân thành công',
  };
};

/**
 * Đổi mật khẩu
 */
export const changePassword = async (oldPassword, newPassword) => {
  return api.put('/donor/profile/password', { oldPassword, newPassword });
};

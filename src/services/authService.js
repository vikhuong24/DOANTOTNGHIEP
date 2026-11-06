// Service xác thực người dùng - Kết nối trực tiếp API Backend Spring Boot
import api, { unwrap } from './api';
import { ROLE_ROUTE_PREFIX } from '../utils/constants';

/**
 * Chuẩn hóa đối tượng người dùng từ AuthResponse backend
 */
const normalizeUser = (authData) => {
  if (!authData) return null;
  const rawRole = authData.vaiTro || authData.role || authData.maVaiTro || '';
  const roleCode = String(rawRole).toUpperCase();
  const roleSlug = ROLE_ROUTE_PREFIX[roleCode] || 'guest';

  return {
    ...authData,
    id: authData.maNguoiDung || authData.id,
    maNguoiDung: authData.maNguoiDung || authData.id,
    name: authData.hoTen || authData.name,
    hoten: authData.hoTen || authData.name,
    hoTen: authData.hoTen || authData.name,
    email: authData.email,
    tendangnhap: authData.tenDangNhap || authData.tendangnhap || authData.email,
    tenDangNhap: authData.tenDangNhap || authData.tendangnhap || authData.email,
    role: roleCode,
    maVaiTro: roleCode,
    roleCode,
    roleSlug,
  };
};

/**
 * Đăng nhập hệ thống (Hỗ trợ cả email hoặc tên đăng nhập)
 * @param {string} usernameOrEmail
 * @param {string} password
 * @returns {Promise<{user: object, token: string}>}
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

  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));

  return { user, token };
};

/**
 * Đăng ký tài khoản Nhà hảo tâm
 * @param {object} userData
 * @returns {Promise<object>}
 */
export const register = async (userData) => {
  const payload = {
    hoTen: userData.hoten || userData.hoTen || userData.name,
    email: String(userData.email || '').trim().toLowerCase(),
    sdt: String(userData.sdt || userData.phone || '').trim(),
    matKhau: userData.matkhau || userData.password,
    diaChi: userData.diachi || userData.address || '',
  };

  const response = await api.post('/guest/register', payload);
  const authResponse = unwrap(response);

  if (authResponse?.token) {
    const token = authResponse.token;
    const user = normalizeUser(authResponse);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return { user, token, message: response?.message || 'Đăng ký thành công' };
  }

  return response;
};

/**
 * Đăng xuất
 */
export const logout = async () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  return Promise.resolve();
};

/**
 * Lấy thông tin user hiện tại từ localStorage
 */
export const getCurrentUser = () => {
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

/**
 * Cập nhật thông tin tài khoản cá nhân
 */
export const updateProfile = async (data) => {
  try {
    const res = await api.put('/donor/profile', data);
    const updated = normalizeUser(unwrap(res));
    if (updated) {
      localStorage.setItem('user', JSON.stringify(updated));
    }
    return updated;
  } catch (err) {
    console.error('Lỗi khi cập nhật profile:', err);
    throw err;
  }
};

/**
 * Đổi mật khẩu
 */
export const changePassword = async (oldPassword, newPassword) => {
  return api.put('/donor/profile/password', { oldPassword, newPassword });
};

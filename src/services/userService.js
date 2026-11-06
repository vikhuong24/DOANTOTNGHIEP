// Service quản lý tài khoản người dùng & phân quyền - Kết nối trực tiếp API Backend Spring Boot
import api, { unwrap, unwrapList } from './api';
import { ROLE_ROUTE_PREFIX, ROLE_LABEL } from '../utils/constants';

/**
 * Chuẩn hóa đối tượng người dùng
 */
const normalizeUser = (u) => {
  if (!u) return null;
  const id = u.manguoidung || u.maNguoiDung || u.id;
  const roleCode = (u.tenVaiTro || u.vaiTro || u.maVaiTro || u.role || '').toUpperCase();
  return {
    ...u,
    id,
    manguoidung: id,
    maNguoiDung: id,
    hoten: u.hoten || u.hoTen || u.name || '',
    hoTen: u.hoten || u.hoTen || u.name || '',
    email: u.email || '',
    sdt: u.sdt || '',
    diachi: u.diachi || u.diaChi || '',
    diaChi: u.diachi || u.diaChi || '',
    tendangnhap: u.tendangnhap || u.tenDangNhap || '',
    tenDangNhap: u.tendangnhap || u.tenDangNhap || '',
    mavaitro: u.mavaitro || u.maVaiTro || 4,
    maVaiTro: u.mavaitro || u.maVaiTro || 4,
    tenVaiTro: u.tenVaiTro || ROLE_LABEL[roleCode] || roleCode,
    role: roleCode,
    roleCode,
    roleSlug: ROLE_ROUTE_PREFIX[roleCode] || 'guest',
    trangthai: u.trangthai || u.trangThai || 'HOATDONG',
    trangThai: u.trangthai || u.trangThai || 'HOATDONG',
    ngaytao: u.ngaytao || u.ngayTao,
  };
};

/**
 * Admin lấy danh sách người dùng
 */
export const getAllUsers = async (params = {}) => {
  try {
    const res = await api.get('/admin/users', {
      params: {
        keyword: params.search || params.keyword || undefined,
        roleId: params.roleId || params.maVaiTro || undefined,
        page: params.page,
        size: params.size,
      },
    });
    const list = unwrapList(res);
    let enriched = list.map(normalizeUser);

    if (params.trangthai) {
      const st = String(params.trangthai).toUpperCase();
      enriched = enriched.filter((u) => u.trangthai?.toUpperCase() === st);
    }

    return { data: enriched, items: enriched, total: enriched.length };
  } catch (err) {
    console.error('Lỗi khi lấy danh sách người dùng:', err);
    throw err;
  }
};

/**
 * Lấy chi tiết một người dùng
 */
export const getUserById = async (id) => {
  const res = await api.get(`/admin/users/${id}`);
  return normalizeUser(unwrap(res));
};

/**
 * Admin tạo người dùng mới
 */
export const createUser = async (data) => {
  const payload = {
    hoTen: data.hoten || data.hoTen,
    email: data.email,
    sdt: data.sdt,
    diaChi: data.diachi || data.diaChi,
    tenDangNhap: data.tendangnhap || data.tenDangNhap,
    matKhau: data.matkhau || data.matKhau || '123456',
    maVaiTro: Number(data.maVaiTro || data.mavaitro || 4),
    trangThai: data.trangthai || data.trangThai || 'HOATDONG',
  };
  const res = await api.post('/admin/users', payload);
  return normalizeUser(unwrap(res));
};

/**
 * Admin cập nhật người dùng
 */
export const updateUser = async (id, data) => {
  const payload = {
    hoTen: data.hoten || data.hoTen,
    email: data.email,
    sdt: data.sdt,
    diaChi: data.diachi || data.diaChi,
    maVaiTro: data.maVaiTro ? Number(data.maVaiTro) : undefined,
    trangThai: data.trangthai || data.trangThai,
    matKhau: data.matkhau || undefined,
  };
  const res = await api.put(`/admin/users/${id}`, payload);
  return normalizeUser(unwrap(res));
};

/**
 * Khóa hoặc kích hoạt người dùng
 */
export const toggleUserStatus = async (id, currentStatus) => {
  const newStatus = String(currentStatus).toUpperCase() === 'HOATDONG' ? 'KHOA' : 'HOATDONG';
  const res = await api.put(`/admin/users/${id}`, { trangThai: newStatus });
  return normalizeUser(unwrap(res));
};

/**
 * Xóa người dùng (hoặc khóa tài khoản nếu hệ thống chỉ hỗ trợ khóa)
 */
export const deleteUser = async (id) => {
  try {
    const res = await api.delete(`/admin/users/${id}`);
    return unwrap(res);
  } catch {
    // Nếu BE không cho xóa cứng, chuyển sang khóa tài khoản
    return toggleUserStatus(id, 'HOATDONG');
  }
};

/**
 * Lấy danh sách vai trò
 */
export const getRoles = async () => {
  try {
    const res = await api.get('/admin/roles');
    const list = unwrapList(res);
    return list.map((r) => ({
      ...r,
      maVaiTro: r.mavaitro || r.maVaiTro || r.id,
      tenVaiTro: r.tenvaitro || r.tenVaiTro || r.name,
      moTa: r.mota || r.moTa,
    }));
  } catch (err) {
    console.error('Lỗi khi lấy danh sách vai trò:', err);
    return [
      { maVaiTro: 1, tenVaiTro: 'ADMIN', moTa: 'Quản trị viên hệ thống' },
      { maVaiTro: 2, tenVaiTro: 'HIEUTRUONG', moTa: 'Hiệu trưởng' },
      { maVaiTro: 3, tenVaiTro: 'CANBO', moTa: 'Cán bộ quản lý gây quỹ' },
      { maVaiTro: 4, tenVaiTro: 'NHATAITRO', moTa: 'Nhà hảo tâm' },
      { maVaiTro: 5, tenVaiTro: 'PHUHUYNH', moTa: 'Phụ huynh học sinh' },
    ];
  }
};

/**
 * Lấy hồ sơ cá nhân của Nhà hảo tâm
 */
export const getDonorProfile = async () => {
  const res = await api.get('/donor/profile');
  return normalizeUser(unwrap(res));
};

/**
 * Cập nhật hồ sơ Nhà hảo tâm
 */
export const updateDonorProfile = async (data) => {
  const res = await api.put('/donor/profile', data);
  return normalizeUser(unwrap(res));
};

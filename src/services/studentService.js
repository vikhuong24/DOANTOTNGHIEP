// Service quản lý học sinh chuyên biệt - Kết nối trực tiếp API Backend Spring Boot
import api, { unwrap, unwrapList } from './api';

/**
 * Chuẩn hóa đối tượng học sinh
 */
const normalizeStudent = (s) => {
  if (!s) return null;
  const id = s.mahocsinh || s.maHocSinh || s.id;
  return {
    ...s,
    id,
    mahocsinh: id,
    maHocSinh: id,
    hoten: s.hoten || s.hoTen || s.name || '',
    hoTen: s.hoten || s.hoTen || s.name || '',
    lop: s.lop || '',
    ngaysinh: s.ngaysinh || s.ngaySinh || '',
    ngaySinh: s.ngaysinh || s.ngaySinh || '',
    gioitinh: s.gioitinh || s.gioiTinh || 'Nam',
    gioiTinh: s.gioitinh || s.gioiTinh || 'Nam',
    loaihotro: s.loaihotro || s.loaiHoTro || '',
    loaiHoTro: s.loaihotro || s.loaiHoTro || '',
    mota: s.mota || s.moTa || s.hoancanh || '',
    moTa: s.mota || s.moTa || s.hoancanh || '',
    hoancanh: s.mota || s.moTa || s.hoancanh || '',
    maphuhuynh: s.maphuhuynh || s.maPhuHuynh,
    maPhuHuynh: s.maphuhuynh || s.maPhuHuynh,
  };
};

/**
 * Lấy danh sách học sinh công khai cho khách vãng lai và nhà hảo tâm (/guest/students)
 */
export const getGuestStudents = async (params = {}) => {
  try {
    const res = await api.get('/guest/students', {
      params: {
        page: params.page !== undefined ? params.page : 0,
        size: params.size || 100,
      },
    });
    const list = unwrapList(res);
    let enriched = list.map(normalizeStudent);

    if (params.search) {
      const q = params.search.toLowerCase();
      enriched = enriched.filter(
        (st) =>
          (st.hoten && st.hoten.toLowerCase().includes(q)) ||
          (st.lop && st.lop.toLowerCase().includes(q)) ||
          (st.mota && st.mota.toLowerCase().includes(q)) ||
          (st.loaihotro && st.loaihotro.toLowerCase().includes(q))
      );
    }
    if (params.lop && params.lop !== 'ALL') {
      enriched = enriched.filter((st) => st.lop === params.lop);
    }

    return { data: enriched, items: enriched, total: enriched.length };
  } catch (err) {
    console.error('Lỗi khi lấy danh sách học sinh guest:', err);
    throw err;
  }
};

/**
 * Lấy danh sách học sinh (tự động phân quyền: cán bộ quản lý / admin gọi /fundraiser/students, khách vãng lai / nhà tài trợ gọi /guest/students)
 */
export const getAllStudents = async (params = {}) => {
  try {
    let canAccessFundraiser = false;
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const role = String(user?.vaiTro || user?.role || user?.roleCode || '').toUpperCase();
      if (token && (role.includes('CANBO') || role.includes('ADMIN') || role.includes('CBQL') || role.includes('FUNDRAISER'))) {
        canAccessFundraiser = true;
      }
    } catch {
      canAccessFundraiser = false;
    }

    const endpoint = canAccessFundraiser && !params.isGuest ? '/fundraiser/students' : '/guest/students';
    const res = await api.get(endpoint, {
      params: {
        page: params.page !== undefined ? params.page : 0,
        size: params.size || 100,
      },
    });
    const list = unwrapList(res);
    let enriched = list.map(normalizeStudent);

    // Filter frontend nếu backend trả về toàn bộ
    if (params.search) {
      const q = params.search.toLowerCase();
      enriched = enriched.filter(
        (st) =>
          (st.hoten && st.hoten.toLowerCase().includes(q)) ||
          (st.lop && st.lop.toLowerCase().includes(q)) ||
          (st.mota && st.mota.toLowerCase().includes(q)) ||
          (st.loaihotro && st.loaihotro.toLowerCase().includes(q))
      );
    }
    if (params.lop && params.lop !== 'ALL') {
      enriched = enriched.filter((st) => st.lop === params.lop);
    }

    return { data: enriched, items: enriched, total: enriched.length };
  } catch (err) {
    console.error('Lỗi khi lấy danh sách học sinh:', err);
    throw err;
  }
};

export const getStudents = getAllStudents;

/**
 * Lấy chi tiết một học sinh
 */
export const getStudentById = async (id) => {
  const res = await api.get(`/fundraiser/students/${id}`);
  return normalizeStudent(unwrap(res));
};

/**
 * Phụ huynh lấy danh sách con em của mình
 */
export const getParentStudents = async () => {
  const res = await api.get('/parent/students');
  const list = unwrapList(res);
  return list.map(normalizeStudent);
};

export const getStudentsByParent = getParentStudents;

/**
 * Phụ huynh xem lịch sử nhận hỗ trợ của con
 */
export const getStudentSupportHistory = async (mahocsinh) => {
  const res = await api.get(`/parent/students/${mahocsinh}/history`);
  return unwrapList(res);
};

/**
 * Thêm hồ sơ học sinh mới
 */
export const createStudent = async (data) => {
  const payload = {
    hoten: data.hoten || data.hoTen,
    hoTen: data.hoten || data.hoTen,
    lop: data.lop,
    gioitinh: data.gioitinh || data.gioiTinh,
    gioiTinh: data.gioitinh || data.gioiTinh,
    ngaysinh: data.ngaysinh || data.ngaySinh,
    ngaySinh: data.ngaysinh || data.ngaySinh,
    loaihotro: data.loaihotro || data.loaiHoTro || data.hoancanh || '',
    mota: data.mota || data.moTa || data.hoancanh || '',
    maphuhuynh: data.maphuhuynh || data.maPhuHuynh,
  };
  const res = await api.post('/fundraiser/students', payload);
  return normalizeStudent(unwrap(res));
};

/**
 * Cập nhật hồ sơ học sinh
 */
export const updateStudent = async (id, data) => {
  const res = await api.put(`/fundraiser/students/${id}`, data);
  return normalizeStudent(unwrap(res));
};

/**
 * Xóa hồ sơ học sinh
 */
export const deleteStudent = async (id) => {
  const res = await api.delete(`/fundraiser/students/${id}`);
  return unwrap(res);
};

/**
 * Phân bổ học bổng
 */
export const distributeScholarship = async (data) => {
  return api.post('/fundraiser/distributions', {
    ...data,
    loaiPhanBo: 'HOCBONG',
  });
};

/**
 * Phân bổ đồ dùng
 */
export const distributeSupplies = async (data) => {
  return api.post('/fundraiser/distributions', {
    ...data,
    loaiPhanBo: 'DODUNG',
  });
};

/**
 * Nhập danh sách học sinh từ file Excel
 */
export const importStudentsFromExcel = async (studentsList) => {
  return api.post('/fundraiser/students/import', studentsList);
};

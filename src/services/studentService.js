// Service quản lý học sinh chuyên biệt - Kết nối trực tiếp API Backend Spring Boot
import api, { unwrap, unwrapList } from './api';

/**
 * Chuẩn hóa đối tượng học sinh
 */
export const normalizeStudent = (s) => {
  if (!s) return null;
  const id = s.maHocSinh || s.mahocsinh || s.id;
  const hoTen = s.hoTen || s.hoten || s.name || '';
  const lop = s.lop || '';
  const gioiTinh = s.gioiTinh || s.gioitinh || 'NAM';
  const loaiHoTro = s.loaiHoTro || s.loaihotro || s.hoancanh || '';
  const moTa = s.moTa || s.mota || s.hoancanh || '';

  return {
    ...s,
    id,
    mahocsinh: id,
    maHocSinh: id,
    hoten: hoTen,
    hoTen: hoTen,
    lop,
    ngaysinh: s.ngaySinh || s.ngaysinh || '',
    ngaySinh: s.ngaySinh || s.ngaysinh || '',
    gioitinh: gioiTinh,
    gioiTinh: gioiTinh,
    loaihotro: loaiHoTro,
    loaiHoTro: loaiHoTro,
    mota: moTa,
    moTa: moTa,
    hoancanh: moTa,
    maphuhuynh: s.maPhuHuynh || s.maphuhuynh,
    maPhuHuynh: s.maPhuHuynh || s.maphuhuynh,
  };
};

/**
 * Lấy danh sách học sinh công khai cho khách vãng lai và nhà hảo tâm
 * Endpoint: GET /guest/students
 * @param {object} params - { page, size }
 */
export const getGuestStudents = async (params = {}) => {
  try {
    const res = await api.get('/guest/students', {
      params: {
        page: params.page !== undefined ? params.page : 0,
        size: params.size || 20,
      },
    });

    const pageData = unwrap(res);
    const rawList = unwrapList(res);
    const enriched = rawList.map(normalizeStudent);

    return {
      data: enriched,
      items: enriched,
      total: pageData?.totalElements ?? enriched.length,
      totalElements: pageData?.totalElements ?? enriched.length,
      totalPages: pageData?.totalPages ?? 1,
      currentPage: pageData?.currentPage ?? 0,
      isLast: pageData?.isLast ?? pageData?.last ?? true,
    };
  } catch (err) {
    console.error('Lỗi khi lấy danh sách học sinh guest:', err);
    throw err;
  }
};

/**
 * Lấy danh sách học sinh (tự động phân quyền: cán bộ quản lý / admin gọi /fundraiser/students, khách vãng lai gọi /guest/students)
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

    const pageData = unwrap(res);
    const list = unwrapList(res);
    let enriched = list.map(normalizeStudent);

    return {
      data: enriched,
      items: enriched,
      total: pageData?.totalElements ?? enriched.length,
      totalPages: pageData?.totalPages ?? 1,
      currentPage: pageData?.currentPage ?? 0,
    };
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
 * Endpoint: GET /parent/students/{mahocsinh}/history
 */
export const getStudentSupportHistory = async (mahocsinh) => {
  const res = await api.get(`/parent/students/${mahocsinh}/history`);
  const list = unwrapList(res);
  return list.map((item) => ({
    ...item,
    id: item.maChiTietPhanBo || item.maDotPhanBo || item.id,
    maChiTietPhanBo: item.maChiTietPhanBo,
    maDotPhanBo: item.maDotPhanBo,
    tenDotPhanBo: item.tenDotPhanBo || item.tenDot || 'Đợt phân bổ hỗ trợ',
    maBaiTaiTro: item.maBaiTaiTro,
    tieuDeBaiTaiTro: item.tieuDeBaiTaiTro || '',
    soTien: item.soTien !== null && item.soTien !== undefined ? Number(item.soTien) : 0,
    nguoiNhan: item.nguoiNhan || '',
    ngayNhan: item.ngayNhan,
    ghiChu: item.ghiChu || '',
    trangThaiDotPhanBo: item.trangThaiDotPhanBo || 'DATRAO',
    ngayTrao: item.ngayTrao,
  }));
};

/**
 * Thêm hồ sơ học sinh mới
 */
export const createStudent = async (data) => {
  const payload = {
    hoTen: data.hoTen || data.hoten,
    lop: data.lop,
    gioiTinh: data.gioiTinh || data.gioitinh,
    ngaySinh: data.ngaySinh || data.ngaysinh,
    loaiHoTro: data.loaiHoTro || data.loaihotro || data.hoancanh || '',
    moTa: data.moTa || data.mota || data.hoancanh || '',
    maPhuHuynh: data.maPhuHuynh || data.maphuhuynh,
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

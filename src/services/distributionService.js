// Service quản lý đợt phân bổ học bổng / đồ dùng - Kết nối trực tiếp API Backend Spring Boot
import api, { unwrap, unwrapList } from './api';
import { DISTRIBUTION_STATUS } from '../utils/constants';

/**
 * Chuyển đổi ngày YYYY-MM-DD hoặc ISO sang LocalDateTime (YYYY-MM-DDTHH:mm:ss)
 */
const toLocalDateTime = (val) => {
  if (!val) return null;
  const s = String(val).trim();
  if (!s) return null;
  if (s.includes('T')) {
    return s.length === 16 ? `${s}:00` : s.slice(0, 19);
  }
  return `${s}T09:00:00`;
};

/**
 * Chuẩn hóa đối tượng đợt phân bổ
 */
const normalizeDistribution = (d) => {
  if (!d) return null;
  const id = d.madotphanbo || d.maDotPhanBo || d.id;
  const status = String(d.trangthai || d.trangThai || DISTRIBUTION_STATUS.CHODUYET).toUpperCase();
  const details = Array.isArray(d.chiTietPhanBo)
    ? d.chiTietPhanBo.map((ct) => ({
        ...ct,
        maChiTietPhanBo: ct.maChiTietPhanBo,
        maHocSinh: ct.maHocSinh,
        tenHocSinh: ct.tenHocSinh || '',
        lop: ct.lop || '',
        soTien: Number(ct.soTien ?? 0),
        nguoiNhan: ct.nguoiNhan || '',
        ngayNhan: ct.ngayNhan,
        ghiChu: ct.ghiChu || '',
      }))
    : [];

  return {
    ...d,
    id,
    madotphanbo: id,
    maDotPhanBo: id,
    tendot: d.tendot || d.tenDot || '',
    tenDot: d.tendot || d.tenDot || '',
    mabaitaitro: d.mabaitaitro || d.maBaiTaiTro,
    maBaiTaiTro: d.mabaitaitro || d.maBaiTaiTro,
    tieuDeBaiTaiTro: d.tieuDeBaiTaiTro || '',
    tongtien: Number(d.tongtien ?? d.tongTien ?? 0),
    tongTien: Number(d.tongtien ?? d.tongTien ?? 0),
    trangthai: status,
    trangThai: status,
    status,
    ngaytrao: d.ngaytrao || d.ngayTrao,
    ngayTrao: d.ngaytrao || d.ngayTrao,
    tenCanBo: d.tenCanBo || '',
    tenHieuTruong: d.tenHieuTruong || '',
    chiTietPhanBo: details,
  };
};

/**
 * Lấy danh sách các đợt phân bổ
 */
export const getAllDistributions = async (params = {}) => {
  try {
    const res = await api.get('/fundraiser/distributions', { params });
    const list = unwrapList(res);
    const enriched = list.map(normalizeDistribution);
    return { data: enriched, items: enriched, total: enriched.length };
  } catch (err) {
    console.error('Lỗi khi lấy danh sách đợt phân bổ:', err);
    throw err;
  }
};

export const getDistributions = getAllDistributions;

/**
 * Lấy chi tiết đợt phân bổ kèm danh sách học sinh nhận
 */
export const getDistributionById = async (id) => {
  const res = await api.get(`/fundraiser/distributions/${id}`);
  return normalizeDistribution(unwrap(res));
};

/**
 * Phụ huynh xem lịch sử phân bổ nhận quà của con em
 */
export const getDistributionsByStudent = async (mahocsinh) => {
  const res = await api.get(`/parent/students/${mahocsinh}/history`);
  return unwrapList(res);
};

/**
 * Cán bộ tạo đợt phân bổ mới
 * Endpoint: POST /fundraiser/distributions
 * Payload (CreateDistributionRequest): { maBaiTaiTro, tenDot, ngayTrao, chiTietPhanBo: [{ maHocSinh, soTien, nguoiNhan, ghiChu }] }
 */
export const createDistribution = async (data) => {
  const payload = {
    maBaiTaiTro: Number(data.maBaiTaiTro || data.mabaitaitro),
    tenDot: String(data.tenDot || data.tendot || '').trim(),
    ngayTrao: toLocalDateTime(data.ngayTrao || data.ngaytrao),
    chiTietPhanBo: (data.chiTietPhanBo || []).map((item) => ({
      maHocSinh: Number(item.maHocSinh),
      soTien: Number(item.soTien),
      nguoiNhan: item.nguoiNhan ? String(item.nguoiNhan).trim() : null,
      ghiChu: item.ghiChu ? String(item.ghiChu).trim() : null,
    })),
  };
  const res = await api.post('/fundraiser/distributions', payload);
  return normalizeDistribution(unwrap(res));
};

/**
 * Cán bộ xác nhận đã hoàn tất giải ngân / trao quà (DADUYET -> DATRAO)
 * Endpoint: PUT /fundraiser/distributions/{id}/disburse
 */
export const disburseDistribution = async (id) => {
  const res = await api.put(`/fundraiser/distributions/${id}/disburse`);
  return normalizeDistribution(unwrap(res));
};

/**
 * Hiệu trưởng lấy các đợt phân bổ chờ duyệt
 */
export const getPendingDistributions = async () => {
  const res = await api.get('/principal/approvals/distributions');
  const list = unwrapList(res);
  return list.map(normalizeDistribution);
};

/**
 * Hiệu trưởng phê duyệt hoặc từ chối đợt phân bổ
 */
export const approveDistribution = async (id, approved = true, reason = '') => {
  const payload = {
    trangThai: approved ? 'DADUYET' : 'TUCHOI',
    lyDo: reason,
  };
  const res = await api.put(`/principal/approvals/distributions/${id}`, payload);
  return normalizeDistribution(unwrap(res));
};

// Service quản lý tài liệu minh chứng (hóa đơn, ảnh trao quà, biên lai) - Kết nối API Backend Spring Boot
import api, { unwrap, unwrapList } from './api';

/**
 * Chuẩn hóa đối tượng minh chứng
 */
const normalizeEvidence = (e) => {
  if (!e) return null;
  const id = e.maminhchung || e.maMinhChung || e.id;
  return {
    ...e,
    id,
    maminhchung: id,
    maMinhChung: id,
    loaitailieu: e.loaitailieu || e.loaiTaiLieu || 'HINHANH',
    loaiTaiLieu: e.loaitailieu || e.loaiTaiLieu || 'HINHANH',
    duongdantep: e.duongdantep || e.duongDanTep || e.url || '',
    duongDanTep: e.duongdantep || e.duongDanTep || e.url || '',
    mota: e.mota || e.moTa || '',
    moTa: e.mota || e.moTa || '',
    mabaitaitro: e.mabaitaitro || e.maBaiTaiTro,
    madotphanbo: e.madotphanbo || e.maDotPhanBo,
    ngaytailen: e.ngaytailen || e.ngayTaiLen,
  };
};

/**
 * Lấy danh sách minh chứng của trường
 */
export const getAllEvidences = async (params = {}) => {
  try {
    const res = await api.get('/fundraiser/evidences', { params });
    const list = unwrapList(res);
    const enriched = list.map(normalizeEvidence);
    return { data: enriched, items: enriched, total: enriched.length };
  } catch (err) {
    console.error('Lỗi khi lấy danh sách minh chứng:', err);
    throw err;
  }
};

export const getEvidences = getAllEvidences;

/**
 * Cán bộ tải lên tài liệu minh chứng mới
 */
export const createEvidence = async (data) => {
  const payload = {
    maBaiTaiTro: data.maBaiTaiTro || data.mabaitaitro,
    maDotPhanBo: data.maDotPhanBo || data.madotphanbo,
    loaiTaiLieu: data.loaiTaiLieu || data.loaitailieu || 'HINHANH',
    duongDanTep: data.duongDanTep || data.duongdantep,
    moTa: data.moTa || data.mota || '',
  };
  const res = await api.post('/fundraiser/evidences', payload);
  return normalizeEvidence(unwrap(res));
};

/**
 * Phụ huynh xem minh chứng trao quà cho con em mình
 */
export const getParentEvidences = async (mahocsinh) => {
  const res = await api.get(`/parent/students/${mahocsinh}/evidences`);
  const list = unwrapList(res);
  return list.map(normalizeEvidence);
};

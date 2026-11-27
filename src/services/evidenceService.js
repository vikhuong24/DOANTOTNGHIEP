// Service quản lý tài liệu minh chứng (hóa đơn, ảnh trao quà, biên lai) - Kết nối API Backend Spring Boot
import api, { unwrap, unwrapList } from './api';
import { formatImageUrl } from '../utils/formatters';

/**
 * Chuẩn hóa đối tượng minh chứng
 */
const normalizeEvidence = (e) => {
  if (!e) return null;
  const id = e.maminhchung || e.maMinhChung || e.id;
  const rawPath = e.duongdantep || e.duongDanTep || e.url || '';
  const resolvedUrl = formatImageUrl(rawPath, '');
  return {
    ...e,
    id,
    maminhchung: id,
    maMinhChung: id,
    loaitailieu: e.loaitailieu || e.loaiTaiLieu || 'HINHANH',
    loaiTaiLieu: e.loaitailieu || e.loaiTaiLieu || 'HINHANH',
    duongdantep: resolvedUrl,
    duongDanTep: resolvedUrl,
    rawPath,
    mota: e.mota || e.moTa || '',
    moTa: e.mota || e.moTa || '',
    mabaitaitro: e.mabaitaitro || e.maBaiTaiTro,
    maBaiTaiTro: e.mabaitaitro || e.maBaiTaiTro,
    tieuDeBaiTaiTro: e.tieuDeBaiTaiTro || '',
    madotphanbo: e.madotphanbo || e.maDotPhanBo,
    maDotPhanBo: e.madotphanbo || e.maDotPhanBo,
    tenDotPhanBo: e.tenDotPhanBo || '',
    nguoiDang: e.nguoiDang || '',
    ngaytailen: e.ngaytailen || e.ngayTaiLen,
    ngayTaiLen: e.ngaytailen || e.ngayTaiLen,
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
 * Cán bộ tải lên tài liệu minh chứng mới (multipart/form-data)
 * Endpoint: POST /fundraiser/evidences/upload
 */
export const createEvidence = async (data) => {
  const formData = new FormData();
  if (data.file) formData.append('file', data.file);
  if (data.maBaiTaiTro || data.mabaitaitro) {
    formData.append('mabaitaitro', data.maBaiTaiTro || data.mabaitaitro);
  }
  if (data.maDotPhanBo || data.madotphanbo) {
    formData.append('madotphanbo', data.maDotPhanBo || data.madotphanbo);
  }
  if (data.loaiTaiLieu || data.loaitailieu) {
    formData.append('loaitailieu', data.loaiTaiLieu || data.loaitailieu);
  }
  if (data.moTa || data.mota) {
    formData.append('mota', data.moTa || data.mota);
  }

  const res = await api.post('/fundraiser/evidences/upload', formData);
  return normalizeEvidence(unwrap(res));
};

export const uploadEvidence = createEvidence;

/**
 * Cán bộ cập nhật toàn bộ thông tin minh chứng (file, đường dẫn, mô tả, loại tài liệu, bài đăng, đợt phân bổ)
 * Trường nào không truyền sẽ giữ nguyên giá trị cũ trong DB.
 * Endpoint: PUT /fundraiser/evidences/{id}
 */
export const updateEvidence = async (id, data = {}) => {
  const formData = new FormData();
  if (data.file) formData.append('file', data.file);
  if (data.duongDanTep || data.duongdantep || data.duongdantext) {
    formData.append('duongdantext', data.duongDanTep || data.duongdantep || data.duongdantext);
  }
  if (data.maBaiTaiTro || data.mabaitaitro) {
    formData.append('mabaitaitro', data.maBaiTaiTro || data.mabaitaitro);
  }
  if (data.maDotPhanBo || data.madotphanbo) {
    formData.append('madotphanbo', data.maDotPhanBo || data.madotphanbo);
  }
  if (data.loaiTaiLieu || data.loaitailieu) {
    formData.append('loaitailieu', data.loaiTaiLieu || data.loaitailieu);
  }
  if (data.moTa !== undefined || data.mota !== undefined) {
    const desc = data.moTa ?? data.mota;
    if (desc !== null && String(desc).trim() !== '') {
      formData.append('mota', desc);
    }
  }

  const res = await api.put(`/fundraiser/evidences/${id}`, formData);
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

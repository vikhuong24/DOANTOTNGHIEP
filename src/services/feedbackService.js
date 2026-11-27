// Service quản lý ý kiến phản hồi & giải đáp thắc mắc - Kết nối trực tiếp API Backend Spring Boot
import api, { unwrap, unwrapList } from './api';
import { FEEDBACK_STATUS } from '../utils/constants';

/**
 * Chuẩn hóa đối tượng phản hồi
 */
const normalizeFeedback = (f) => {
  if (!f) return null;
  const id = f.maphanhoi || f.maPhanHoi || f.id;
  const status = f.trangthai || f.trangThai || FEEDBACK_STATUS.CHOXULY;
  return {
    ...f,
    id,
    maphanhoi: id,
    maPhanHoi: id,
    tieude: f.tieude || f.tieuDe || '',
    tieuDe: f.tieude || f.tieuDe || '',
    noidung: f.noidung || f.noiDung || '',
    noiDung: f.noidung || f.noiDung || '',
    noidungtraloi: f.noidungtraloi || f.noiDungTraLoi || '',
    noiDungTraLoi: f.noidungtraloi || f.noiDungTraLoi || '',
    traLoi: f.noidungtraloi || f.noiDungTraLoi || f.traLoi || '',
    trangthai: status,
    trangThai: status,
    status,
    manguoidung: f.manguoidung || f.maNguoiDung,
    maNguoiDung: f.manguoidung || f.maNguoiDung,
    tenNguoiGui: f.tenNguoiGui || f.tenhienthi || `Người dùng #${f.manguoidung || f.maNguoiDung || ''}`,
    emailNguoiGui: f.emailNguoiGui || f.email || '',
    sdtNguoiGui: f.sdtNguoiGui || f.sdt || '',
    mabaitaitro: f.mabaitaitro || f.maBaiTaiTro,
    maBaiTaiTro: f.mabaitaitro || f.maBaiTaiTro,
    tieuDeBaiTaiTro: f.tieuDeBaiTaiTro || f.tieude || '',
    madotphanbo: f.madotphanbo || f.maDotPhanBo,
    maDotPhanBo: f.madotphanbo || f.maDotPhanBo,
    tenDotPhanBo: f.tenDotPhanBo || '',
    macanbo: f.macanbo || f.maCanBo,
    maCanBo: f.macanbo || f.maCanBo,
    tenCanBo: f.tenCanBo || f.tenCanBoTraLoi || '',
    tenCanBoTraLoi: f.tenCanBo || f.tenCanBoTraLoi || '',
    ngaygui: f.ngaygui || f.ngayGui,
    ngayGui: f.ngaygui || f.ngayGui,
    ngaytraloi: f.ngaytraloi || f.ngayTraLoi || f.ngayTrao || null,
    ngayTraLoi: f.ngaytraloi || f.ngayTraLoi || f.ngayTrao || null,
  };
};

/**
 * Cán bộ lấy danh sách phản hồi từ phụ huynh và nhà tài trợ
 * GET /fundraiser/feedbacks?trangThai=...
 */
export const getFundraiserFeedbacks = async (trangThai) => {
  try {
    const params = {};
    if (trangThai && trangThai !== 'ALL') {
      params.trangThai = trangThai;
    }
    const res = await api.get('/fundraiser/feedbacks', { params });
    const list = unwrapList(res);
    return list.map(normalizeFeedback);
  } catch (err) {
    console.error('Lỗi khi lấy danh sách phản hồi cán bộ:', err);
    throw err;
  }
};

/**
 * Cán bộ xem chi tiết phản hồi
 * GET /fundraiser/feedbacks/{id}
 */
export const getFundraiserFeedbackDetail = async (id) => {
  const res = await api.get(`/fundraiser/feedbacks/${id}`);
  return normalizeFeedback(unwrap(res));
};

export const getAllFeedbacks = getFundraiserFeedbacks;
export const getFeedbacks = getFundraiserFeedbacks;

/**
 * Hiệu trưởng lấy toàn bộ danh sách phản hồi và giám sát câu trả lời của cán bộ
 * GET /principal/feedbacks?trangThai=...
 */
export const getPrincipalFeedbacks = async (trangThai) => {
  try {
    const params = {};
    if (trangThai && trangThai !== 'ALL' && trangThai !== 'all') {
      params.trangThai = trangThai;
    }
    const res = await api.get('/principal/feedbacks', { params });
    const list = unwrapList(res);
    return list.map(normalizeFeedback);
  } catch (err) {
    console.error('Lỗi khi lấy danh sách phản hồi hiệu trưởng:', err);
    throw err;
  }
};

/**
 * Hiệu trưởng xem chi tiết một phản hồi
 * GET /principal/feedbacks/{id}
 */
export const getPrincipalFeedbackDetail = async (id) => {
  const res = await api.get(`/principal/feedbacks/${id}`);
  return normalizeFeedback(unwrap(res));
};

/**
 * Cán bộ trả lời phản hồi
 */
export const replyFeedback = async (id, replyContent) => {
  const payload = { noiDungTraLoi: replyContent };
  const res = await api.put(`/fundraiser/feedbacks/${id}/reply`, payload);
  return normalizeFeedback(unwrap(res));
};

/**
 * Lấy lịch sử phản hồi của người dùng hiện tại (Nhà tài trợ hoặc Phụ huynh)
 */
export const getFeedbacksByUser = async (userId) => {
  try {
    // Thử gọi endpoint donor trước
    const res = await api.get('/donor/feedbacks');
    const list = unwrapList(res);
    return list.map(normalizeFeedback);
  } catch {
    // Fallback sang endpoint parent
    try {
      const resParent = await api.get('/parent/feedbacks');
      return unwrapList(resParent).map(normalizeFeedback);
    } catch {
      return [];
    }
  }
};

// Helper alias cho các component dùng createFeedback


/**
 * Lấy danh sách phản hồi của Nhà hảo tâm hiện tại kèm câu trả lời từ nhà trường
 * Endpoint: GET /donor/feedbacks
 * @returns {Promise<Array>}
 */
export const getDonorFeedbacks = async () => {
  const res = await api.get('/donor/feedbacks');
  const list = unwrapList(res);
  return list.map(normalizeFeedback);
};

/**
 * Nhà hảo tâm gửi phản hồi / ý kiến đóng góp mới
 * Endpoint: POST /donor/feedbacks
 * Payload: { maBaiTaiTro, maDotPhanBo, tieuDe, noiDung }
 * @param {object} data
 * @returns {Promise<object>}
 */
export const sendDonorFeedback = async (data) => {
  const payload = {
    maBaiTaiTro: data.maBaiTaiTro ? Number(data.maBaiTaiTro) : null,
    maDotPhanBo: data.maDotPhanBo ? Number(data.maDotPhanBo) : null,
    tieuDe: String(data.tieuDe || data.tieude || '').trim(),
    noiDung: String(data.noiDung || data.noidung || '').trim(),
  };
  const res = await api.post('/donor/feedbacks', payload);
  return normalizeFeedback(unwrap(res));
};

export const createDonorFeedback = sendDonorFeedback;
export const createFeedback = sendDonorFeedback;

export const getParentFeedbacks = async () => {
  const res = await api.get('/parent/feedbacks');
  const list = unwrapList(res);
  return list.map(normalizeFeedback);
};

export const createParentFeedback = async (data) => {
  const payload = {
    tieuDe: String(data.tieuDe || data.tieude || '').trim(),
    noiDung: String(data.noiDung || data.noidung || '').trim(),
    maBaiTaiTro: data.maBaiTaiTro ? Number(data.maBaiTaiTro) : null,
    maDotPhanBo: data.maDotPhanBo ? Number(data.maDotPhanBo) : null,
  };
  const res = await api.post('/parent/feedbacks', payload);
  return normalizeFeedback(unwrap(res));
};



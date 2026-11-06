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
    trangthai: status,
    trangThai: status,
    status,
    manguoidung: f.manguoidung || f.maNguoiDung,
    maNguoiDung: f.manguoidung || f.maNguoiDung,
    tenNguoiGui: f.tenNguoiGui || f.tenhienthi || `Người dùng #${f.manguoidung || f.maNguoiDung || ''}`,
    mabaitaitro: f.mabaitaitro || f.maBaiTaiTro,
    maBaiTaiTro: f.mabaitaitro || f.maBaiTaiTro,
    tieuDeBaiTaiTro: f.tieuDeBaiTaiTro || f.tieude || '',
    macanbo: f.macanbo || f.maCanBo,
    maCanBo: f.macanbo || f.maCanBo,
    tenCanBoTraLoi: f.tenCanBoTraLoi || '',
    ngaygui: f.ngaygui || f.ngayGui,
    ngayGui: f.ngaygui || f.ngayGui,
    ngaytraloi: f.ngaytraloi || f.ngayTraLoi,
    ngayTraLoi: f.ngaytraloi || f.ngayTraLoi,
  };
};

/**
 * Cán bộ lấy danh sách phản hồi từ phụ huynh và nhà tài trợ
 */
export const getFundraiserFeedbacks = async () => {
  try {
    const res = await api.get('/fundraiser/feedbacks');
    const list = unwrapList(res);
    return list.map(normalizeFeedback);
  } catch (err) {
    console.error('Lỗi khi lấy danh sách phản hồi cán bộ:', err);
    throw err;
  }
};

export const getAllFeedbacks = getFundraiserFeedbacks;
export const getFeedbacks = getFundraiserFeedbacks;

/**
 * Hiệu trưởng lấy toàn bộ danh sách phản hồi và giám sát câu trả lời của cán bộ
 */
export const getPrincipalFeedbacks = async () => {
  try {
    const res = await api.get('/principal/feedbacks');
    const list = unwrapList(res);
    return list.map(normalizeFeedback);
  } catch (err) {
    console.error('Lỗi khi lấy danh sách phản hồi hiệu trưởng:', err);
    throw err;
  }
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

/**
 * Tạo mới phản hồi (Nhà tài trợ hoặc Phụ huynh)
 */
export const createFeedback = async (data) => {
  const payload = {
    tieuDe: data.tieuDe || data.tieude,
    noiDung: data.noiDung || data.noidung,
    maBaiTaiTro: data.maBaiTaiTro || data.mabaitaitro || null,
  };
  try {
    const res = await api.post('/donor/feedbacks', payload);
    return normalizeFeedback(unwrap(res));
  } catch {
    const res = await api.post('/parent/feedbacks', payload);
    return normalizeFeedback(unwrap(res));
  }
};

export const createDonorFeedback = createFeedback;
export const createParentFeedback = createFeedback;

export const getDonorFeedbacks = async () => {
  const res = await api.get('/donor/feedbacks');
  const list = unwrapList(res);
  return list.map(normalizeFeedback);
};

export const getParentFeedbacks = async () => {
  const res = await api.get('/parent/feedbacks');
  const list = unwrapList(res);
  return list.map(normalizeFeedback);
};

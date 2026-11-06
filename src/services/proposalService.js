// Service quản lý đề xuất tài trợ - Kết nối trực tiếp API Backend Spring Boot
import api, { unwrap, unwrapList } from './api';
import { PROPOSAL_STATUS } from '../utils/constants';

/**
 * Chuẩn hóa bản ghi đề xuất tài trợ
 */
const normalizeProposal = (p) => {
  if (!p) return null;
  const id = p.madexuat || p.maDeXuat || p.id;
  const amount = Number(p.soitendx ?? p.soTienDx ?? 0);
  const status = p.trangthai || p.trangThai || PROPOSAL_STATUS.CHODUYET;
  return {
    ...p,
    id,
    madexuat: id,
    maDeXuat: id,
    tieude: p.tieude || p.tieuDe || '',
    tieuDe: p.tieude || p.tieuDe || '',
    soitendx: amount,
    soTienDx: amount,
    amount,
    mucdichsd: p.mucdichsd || p.mucDichSd || '',
    mucDichSd: p.mucdichsd || p.mucDichSd || '',
    trangthai: status,
    trangThai: status,
    status,
    lydotuchoi: p.lydotuchoi || p.lyDoTuChoi || '',
    lyDoTuChoi: p.lydotuchoi || p.lyDoTuChoi || '',
    ngaygui: p.ngaygui || p.ngayGui,
    ngayGui: p.ngaygui || p.ngayGui,
    tenNguoiDung: p.tenNguoiDung || p.tenHienThi || (p.manguoidung ? `Nhà hảo tâm #${p.manguoidung}` : 'Nhà hảo tâm'),
  };
};

/**
 * Cán bộ lấy danh sách đề xuất tài trợ
 */
export const getAllProposals = async (params = {}) => {
  try {
    const res = await api.get('/fundraiser/approvals/proposals', { params });
    const list = unwrapList(res);
    const enriched = list.map(normalizeProposal);
    return { data: enriched, items: enriched, total: enriched.length };
  } catch (err) {
    console.error('Lỗi khi lấy danh sách đề xuất tài trợ:', err);
    throw err;
  }
};

export const getProposals = getAllProposals;

/**
 * Nhà tài trợ gửi đề xuất tài trợ mới
 */
export const proposeSponsor = async (data) => {
  const payload = {
    maBaiTaiTro: data.maBaiTaiTro ? Number(data.maBaiTaiTro) : null,
    tieuDe: data.tieuDe || data.tieude || '',
    soTienDx: Number(data.soTienDx || data.soitendx || 0),
    mucDichSd: data.mucDichSd || data.mucdichsd || '',
  };
  const res = await api.post('/donor/donations/propose', payload);
  return normalizeProposal(unwrap(res));
};

/**
 * Cán bộ phê duyệt hoặc từ chối đề xuất tài trợ
 */
export const approveProposal = async (id, approved = true, rejectReason = '') => {
  const payload = {
    trangThai: approved ? 'DADUYET' : 'TUCHOI',
    lyDoTuChoi: rejectReason || null,
  };
  const res = await api.put(`/fundraiser/approvals/proposals/${id}`, payload);
  return normalizeProposal(unwrap(res));
};

export const rejectProposal = (id, reason = '') => approveProposal(id, false, reason);

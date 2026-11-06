// Service xử lý phê duyệt (Hiệu trưởng duyệt bài & đợt phân bổ, Cán bộ duyệt đề xuất & tài trợ)
import api, { unwrap, unwrapList } from './api';

/**
 * Hiệu trưởng lấy các chiến dịch đang chờ duyệt
 */
export const getPendingCampaigns = async () => {
  const res = await api.get('/principal/approvals/campaigns');
  return unwrapList(res);
};

/**
 * Hiệu trưởng phê duyệt hoặc từ chối bài vận động gây quỹ
 */
export const approveCampaign = async (id, approved = true, rejectReason = '') => {
  const payload = {
    trangThai: approved ? 'DADUYET' : 'TUCHOI',
    lyDo: rejectReason || null,
  };
  const res = await api.put(`/principal/approvals/campaigns/${id}`, payload);
  return unwrap(res);
};

/**
 * Hiệu trưởng lấy các đợt phân bổ chờ duyệt
 */
export const getPendingDistributions = async () => {
  const res = await api.get('/principal/approvals/distributions');
  return unwrapList(res);
};

/**
 * Hiệu trưởng phê duyệt hoặc từ chối đợt phân bổ
 */
export const approveDistribution = async (id, approved = true, rejectReason = '') => {
  const payload = {
    trangThai: approved ? 'DADUYET' : 'TUCHOI',
    lyDo: rejectReason || null,
  };
  const res = await api.put(`/principal/approvals/distributions/${id}`, payload);
  return unwrap(res);
};

/**
 * Cán bộ lấy danh sách đề xuất tài trợ chờ duyệt
 */
export const getPendingProposals = async () => {
  const res = await api.get('/fundraiser/approvals/proposals');
  return unwrapList(res);
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
  return unwrap(res);
};

/**
 * Cán bộ lấy danh sách khoản tài trợ cần đối soát xác nhận
 */
export const getPendingDonations = async () => {
  const res = await api.get('/fundraiser/approvals/donations');
  return unwrapList(res);
};

/**
 * Cán bộ xác nhận đã nhận tiền đóng góp
 */
export const confirmDonation = async (id, data = {}) => {
  const res = await api.put(`/fundraiser/approvals/donations/${id}/confirm`, data);
  return unwrap(res);
};

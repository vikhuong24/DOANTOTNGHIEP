// Service quản lý tài trợ / quyên góp - Kết nối trực tiếp API Backend Spring Boot
import api, { unwrap, unwrapList } from './api';
import { DONATION_STATUS } from '../utils/constants';

/**
 * Chuẩn hóa bản ghi tài trợ
 */
const normalizeDonation = (d) => {
  if (!d) return null;
  const id = d.maTaiTro || d.id;
  const amount = Number(d.soitendk ?? d.soTienDk ?? d.amount ?? 0);
  const actualAmount = Number(d.soitentt ?? d.soTienTt ?? d.actualAmount ?? amount);
  const status = d.trangthai || d.trangThai || DONATION_STATUS.CHODUYET;

  return {
    ...d,
    id,
    maTaiTro: id,
    maBaiTaiTro: d.maBaiTaiTro || d.campaignId,
    tieuDeBaiTaiTro: d.tieuDeBaiTaiTro || d.tieude || d.campaignTitle || '',
    tenhienthi: d.tenhienthi || d.tenHienThi || d.donorName || 'Nhà hảo tâm',
    tenHienThi: d.tenhienthi || d.tenHienThi || d.donorName || 'Nhà hảo tâm',
    soitendk: amount,
    soTienDk: amount,
    soitentt: actualAmount,
    soTienTt: actualAmount,
    amount,
    actualAmount,
    trangthai: status,
    trangThai: status,
    status,
    anhgiaodich: d.anhgiaodich || d.anhGiaoDich || null,
    anhGiaoDich: d.anhgiaodich || d.anhGiaoDich || null,
    ghichu: d.ghichu || d.ghiChu || '',
    ghiChu: d.ghichu || d.ghiChu || '',
    ngaygui: d.ngaygui || d.ngayGui,
    ngaynhan: d.ngaynhan || d.ngayNhan,
  };
};

/**
 * Lấy danh sách toàn bộ sao kê / đóng góp công khai
 * @param {object} params - { maBaiTaiTro, page, size }
 */
export const getAllDonations = async (params = {}) => {
  try {
    const res = await api.get('/guest/statements', {
      params: {
        maBaiTaiTro: params.maBaiTaiTro || undefined,
        page: params.page !== undefined ? params.page : 0,
        size: params.size || 50,
      },
    });
    const rawList = unwrapList(res);
    const enriched = rawList.map(normalizeDonation);
    return { data: enriched, items: enriched, total: enriched.length };
  } catch (err) {
    console.error('Lỗi khi lấy danh sách sao kê tài trợ:', err);
    throw err;
  }
};

export const getDonations = getAllDonations;

/**
 * Lấy lịch sử đóng góp của Nhà hảo tâm hiện tại
 */
export const getDonationHistory = async () => {
  const res = await api.get('/donor/donations/history');
  const list = unwrapList(res);
  return list.map(normalizeDonation);
};

/**
 * Nhà hảo tâm đăng ký ủng hộ tiền cho chiến dịch
 * @param {object} data - { maBaiTaiTro, tenHienThi, soTienDk, ghiChu, anhGiaoDich }
 */
export const registerDonation = async (data) => {
  const payload = {
    maBaiTaiTro: Number(data.maBaiTaiTro || data.campaignId),
    tenHienThi: data.tenHienThi || data.tenhienthi || 'Nhà hảo tâm ẩn danh',
    soTienDk: Number(data.soTienDk || data.soitendk || data.amount || 0),
    ghiChu: data.ghiChu || data.ghichu || '',
    anhGiaoDich: data.anhGiaoDich || data.anhgiaodich || null,
  };
  const res = await api.post('/donor/donations/register', payload);
  return normalizeDonation(unwrap(res));
};

export const register = registerDonation;

/**
 * Nhà hảo tâm gửi đề xuất tài trợ
 */
export const proposeSponsor = async (data) => {
  const payload = {
    maBaiTaiTro: data.maBaiTaiTro ? Number(data.maBaiTaiTro) : null,
    tieuDe: data.tieuDe || data.tieude || '',
    soTienDx: Number(data.soTienDx || data.soitendx || data.amount || 0),
    mucDichSd: data.mucDichSd || data.mucdichsd || '',
  };
  const res = await api.post('/donor/donations/propose', payload);
  return normalizeDonation(unwrap(res));
};

export const propose = proposeSponsor;

/**
 * Cán bộ lấy danh sách tài trợ cần xác nhận
 */
export const getPendingDonations = async () => {
  const res = await api.get('/fundraiser/approvals/donations');
  const list = unwrapList(res);
  return list.map(normalizeDonation);
};

/**
 * Cán bộ xác nhận đã nhận tiền đóng góp
 * @param {number|string} id
 * @param {object} data - { soTienTt, anhGiaoDich, ghiChu }
 */
export const confirmDonation = async (id, data = {}) => {
  const payload = {
    soTienTt: data.soTienTt !== undefined ? Number(data.soTienTt) : undefined,
    anhGiaoDich: data.anhGiaoDich || data.anhgiaodich,
    ghiChu: data.ghiChu || data.ghichu,
  };
  const res = await api.put(`/fundraiser/approvals/donations/${id}/confirm`, payload);
  return normalizeDonation(unwrap(res));
};

export const approveDonation = confirmDonation;

/**
 * Từ chối tài trợ
 */
export const rejectDonation = async (id, reason = '') => {
  const res = await api.put(`/fundraiser/approvals/donations/${id}`, {
    trangThai: 'TUCHOI',
    ghiChu: reason,
  });
  return normalizeDonation(unwrap(res));
};

/**
 * Cập nhật thông tin khoản đóng góp / tiến độ giải ngân
 */
export const updateDonation = async (id, data) => {
  const res = await api.put(`/fundraiser/approvals/donations/${id}`, data);
  return normalizeDonation(unwrap(res));
};

export const updateDisbursement = async (campaignId, data) => {
  return api.put(`/fundraiser/campaigns/${campaignId}/disbursement`, data);
};

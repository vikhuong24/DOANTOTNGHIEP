// Service quản lý tài trợ / quyên góp - Kết nối trực tiếp API Backend Spring Boot
import api, { unwrap, unwrapList } from './api';
import { DONATION_STATUS } from '../utils/constants';
import { formatImageUrl } from '../utils/formatters';

/**
 * Chuẩn hóa bản ghi tài trợ hoặc bản ghi sao kê
 */
export const normalizeDonation = (d) => {
  if (!d) return null;
  const id = d.maTaiTro || d.id;
  const amount = Number(d.soTienDk ?? d.soitendk ?? d.amount ?? 0);
  const actualAmount = Number(d.soTienTt ?? d.soTienTT ?? d.soitentt ?? amount);
  const status = d.trangThai || d.trangthai || DONATION_STATUS.DANHAN;
  const receivedDate = d.ngayNhan || d.ngaynhan || d.ngaygui || d.ngayGui;

  return {
    ...d,
    id,
    maTaiTro: id,
    maBaiTaiTro: d.maBaiTaiTro || d.campaignId,
    tieuDeBaiTaiTro: d.tieuDeBaiTaiTro || d.tieude || d.campaignTitle || '',
    tenhienthi: d.tenHienThi || d.tenhienthi || d.donorName || 'Nhà hảo tâm ẩn danh',
    tenHienThi: d.tenHienThi || d.tenhienthi || d.donorName || 'Nhà hảo tâm ẩn danh',
    soitendk: amount,
    soTienDk: amount,
    soitentt: actualAmount,
    soTienTt: actualAmount,
    amount,
    actualAmount,
    trangthai: status,
    trangThai: status,
    status,
    anhgiaodich: d.anhGiaoDich || d.anhgiaodich ? formatImageUrl(d.anhGiaoDich || d.anhgiaodich, '/images/minhchungmau.jpg') : null,
    anhGiaoDich: d.anhGiaoDich || d.anhgiaodich ? formatImageUrl(d.anhGiaoDich || d.anhgiaodich, '/images/minhchungmau.jpg') : null,
    ghichu: d.ghiChu || d.ghichu || '',
    ghiChu: d.ghiChu || d.ghichu || '',
    ngaygui: d.ngayGui || d.ngaygui || receivedDate,
    ngayGui: d.ngayGui || d.ngaygui || receivedDate,
    ngaynhan: receivedDate,
    ngayNhan: receivedDate,
  };
};

/**
 * Lấy danh sách toàn bộ sao kê / đóng góp công khai
 * Endpoint: GET /guest/statements
 * @param {object} params - { maBaiTaiTro, page, size }
 */
export const getAllDonations = async (params = {}) => {
  try {
    const res = await api.get('/guest/statements', {
      params: {
        maBaiTaiTro: params.maBaiTaiTro || undefined,
        page: params.page !== undefined ? params.page : 0,
        size: params.size || 20,
      },
    });

    const pageData = unwrap(res);
    const rawList = unwrapList(res);
    const enriched = rawList.map(normalizeDonation);

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
    console.error('Lỗi khi lấy danh sách sao kê tài trợ:', err);
    throw err;
  }
};

export const getDonations = getAllDonations;
export const getStatements = getAllDonations;

/**
 * Lấy danh sách tiến trình các bài đăng mà Nhà hảo tâm đã từng ủng hộ
 * Endpoint: GET /donor/campaigns/progress
 * @returns {Promise<Array>}
 */
export const getCampaignsProgress = async () => {
  const res = await api.get('/donor/campaigns/progress');
  const list = unwrapList(res);
  return list.map((item) => ({
    ...item,
    maBaiTaiTro: item.maBaiTaiTro || item.id,
    tieuDe: item.tieuDe || item.tieude || '',
    anhBia: formatImageUrl(item.anhBia || item.anhbia),
    mucTieu: Number(item.mucTieu || item.muctieu || 0),
    tongTienDaNhan: Number(item.tongTienDaNhan || item.tongtienDaNhan || 0),
    phanTramHoanThanh: Number(item.phanTramHoanThanh ?? 0),
    trangThai: item.trangThai || item.trangthai || 'DADUYET',
    tongTienToiDaDongGop: Number(item.tongTienToiDaDongGop ?? 0),
    danhSachMinhChung: (item.danhSachMinhChung || []).map((m) => ({
      ...m,
      duongDanTep: formatImageUrl(m.duongDanTep, '/images/minhchungmau.jpg'),
    })),
  }));
};

/**
 * Lấy toàn bộ lịch sử đóng góp của Nhà hảo tâm (bao gồm khoản tài trợ và đề xuất)
 * Endpoint: GET /donor/donations/history
 * @returns {Promise<{tongTienDongGopThanhCong: number, danhSachDongGop: Array, danhSachDeXuat: Array}>}
 */
export const getDonationHistory = async () => {
  const res = await api.get('/donor/donations/history');
  const data = unwrap(res) || {};

  const danhSachDongGop = (data.danhSachDongGop || []).map((t) => ({
    ...t,
    id: t.maTaiTro,
    maTaiTro: t.maTaiTro,
    maBaiTaiTro: t.maBaiTaiTro,
    tieuDeBaiTaiTro: t.tieuDeBaiTaiTro || '',
    tenHienThi: t.tenHienThi || 'Nhà hảo tâm ẩn danh',
    soTienDk: Number(t.soTienDk || 0),
    soTienTt: t.soTienTt !== null && t.soTienTt !== undefined ? Number(t.soTienTt) : null,
    anhGiaoDich: t.anhGiaoDich ? formatImageUrl(t.anhGiaoDich, '/images/minhchungmau.jpg') : null,
    trangThai: t.trangThai || 'CHODUYET',
    ghiChu: t.ghiChu || '',
    ngayGui: t.ngayGui,
    ngayNhan: t.ngayNhan,
  }));

  const danhSachDeXuat = (data.danhSachDeXuat || []).map((d) => ({
    ...d,
    id: d.maDeXuat,
    maDeXuat: d.maDeXuat,
    maBaiTaiTro: d.maBaiTaiTro,
    tieuDeBaiTaiTro: d.tieuDeBaiTaiTro || '',
    tieuDe: d.tieuDe || '',
    soTienDx: Number(d.soTienDx || 0),
    mucDichSd: d.mucDichSd || '',
    trangThai: d.trangThai || 'CHODUYET',
    lyDoTuChoi: d.lyDoTuChoi || '',
    ngayGui: d.ngayGui,
    ngayXuLy: d.ngayXuLy,
  }));

  return {
    tongTienDongGopThanhCong: Number(data.tongTienDongGopThanhCong || 0),
    danhSachDongGop,
    danhSachDeXuat,
  };
};

/**
 * Nhà hảo tâm đăng ký ủng hộ tiền cho chiến dịch
 * Endpoint: POST /donor/donations/register
 * Payload: { maBaiTaiTro, tenHienThi, soTienDk, ghiChu, anhGiaoDich }
 * @param {object} data
 */
export const registerDonation = async (data) => {
  const payload = {
    maBaiTaiTro: Number(data.maBaiTaiTro || data.campaignId),
    tenHienThi: data.tenHienThi ? String(data.tenHienThi).trim() : undefined,
    soTienDk: Number(data.soTienDk || data.soTienDK || data.amount || 0),
    ghiChu: data.ghiChu ? String(data.ghiChu).trim() : undefined,
    anhGiaoDich: data.anhGiaoDich ? String(data.anhGiaoDich).trim() : undefined,
  };
  const res = await api.post('/donor/donations/register', payload);
  const unwrapped = unwrap(res);
  return {
    success: true,
    message: res?.message || 'Đăng ký ủng hộ thành công',
    ...unwrapped,
  };
};

export const register = registerDonation;

/**
 * Nhà hảo tâm gửi đề xuất tài trợ mới
 * Endpoint: POST /donor/donations/propose
 * Payload: { maBaiTaiTro, tieuDe, soTienDx, mucDichSd }
 * @param {object} data
 */
export const proposeSponsor = async (data) => {
  const payload = {
    maBaiTaiTro: data.maBaiTaiTro ? Number(data.maBaiTaiTro) : null,
    tieuDe: String(data.tieuDe || data.tieude || '').trim(),
    soTienDx: Number(data.soTienDx || data.soTienDX || data.amount || 0),
    mucDichSd: String(data.mucDichSd || data.mucdichSD || '').trim(),
  };
  const res = await api.post('/donor/donations/propose', payload);
  const unwrapped = unwrap(res);
  return {
    success: true,
    message: res?.message || 'Gửi đề xuất tài trợ thành công',
    ...unwrapped,
  };
};

export const propose = proposeSponsor;

const APPROVED_QUEUE_KEY = 'fundraiser_approved_donations_queue';

export const getApprovedDonationsQueue = () => {
  try {
    const raw = localStorage.getItem(APPROVED_QUEUE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.map(normalizeDonation) : [];
  } catch {
    return [];
  }
};

const saveApprovedDonationToQueue = (item) => {
  if (!item) return;
  try {
    const queue = getApprovedDonationsQueue().filter(
      (x) => Number(x.maTaiTro) !== Number(item.maTaiTro)
    );
    queue.unshift(item);
    localStorage.setItem(APPROVED_QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // ignore storage errors
  }
};

export const removeApprovedDonationFromQueue = (id) => {
  try {
    const queue = getApprovedDonationsQueue().filter(
      (x) => Number(x.maTaiTro) !== Number(id)
    );
    localStorage.setItem(APPROVED_QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // ignore storage errors
  }
};

/**
 * Cán bộ lấy danh sách đăng ký tài trợ chờ duyệt (CHODUYET)
 * Endpoint: GET /fundraiser/approvals/donations
 */
export const getPendingDonations = async () => {
  const res = await api.get('/fundraiser/approvals/donations');
  const list = unwrapList(res);
  return list.map(normalizeDonation);
};

/**
 * Cán bộ duyệt đăng ký tài trợ (CHODUYET -> DADUYET)
 * Endpoint: PUT /fundraiser/approvals/donations/{id}
 * @param {number|string} id
 * @param {string} note
 */
export const approveDonation = async (id, note = '') => {
  const res = await api.put(`/fundraiser/approvals/donations/${id}`, {
    trangthai: 'DADUYET',
    lydo: note ? String(note).trim() : null,
  });
  const updated = normalizeDonation(unwrap(res));
  if (updated) {
    saveApprovedDonationToQueue(updated);
  }
  return updated;
};

/**
 * Cán bộ từ chối đăng ký tài trợ (CHODUYET -> TUCHOI)
 * Endpoint: PUT /fundraiser/approvals/donations/{id}
 * @param {number|string} id
 * @param {string} reason
 */
export const rejectDonation = async (id, reason = '') => {
  const res = await api.put(`/fundraiser/approvals/donations/${id}`, {
    trangthai: 'TUCHOI',
    lydo: reason ? String(reason).trim() : null,
  });
  removeApprovedDonationFromQueue(id);
  return normalizeDonation(unwrap(res));
};

/**
 * Cán bộ xác nhận đã nhận tiền thực tế vào quỹ (DADUYET -> DANHAN, cộng dồn tongTienDaNhan)
 * Endpoint: PUT /fundraiser/approvals/donations/{id}/confirm
 * @param {number|string} id
 * @param {object} data - { soTienTt, ghiChu }
 */
export const confirmDonation = async (id, data = {}) => {
  const payload = {
    soTienTt: data.soTienTt !== undefined && data.soTienTt !== null ? Number(data.soTienTt) : undefined,
    ghiChu: data.ghiChu ? String(data.ghiChu).trim() : undefined,
  };
  const res = await api.put(`/fundraiser/approvals/donations/${id}/confirm`, payload);
  removeApprovedDonationFromQueue(id);
  return unwrap(res);
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

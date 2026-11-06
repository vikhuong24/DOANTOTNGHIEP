// Service quản lý bài kêu gọi gây quỹ - Kết nối trực tiếp API Backend Spring Boot
import api, { unwrap, unwrapList } from './api';
import { CAMPAIGN_STATUS } from '../utils/constants';

/**
 * Chuẩn hóa đối tượng bài tài trợ
 */
const normalizeCampaign = (c) => {
  if (!c) return null;
  const id = c.maBaiTaiTro || c.id;
  const title = c.tieude || c.tieuDe || c.title || '';
  const target = Number(c.muctieu ?? c.mucTieu ?? c.targetAmount ?? 0);
  const current = Number(c.tongtiendanhan ?? c.tongtienDaNhan ?? c.tongTienDaNhan ?? c.currentAmount ?? 0);
  const status = c.trangthai || c.trangThai || c.status || CAMPAIGN_STATUS.DADUYET;

  return {
    ...c,
    id,
    maBaiTaiTro: id,
    title,
    tieude: title,
    tieuDe: title,
    noidung: c.noidung || c.noiDung || c.description || '',
    noiDung: c.noidung || c.noiDung || c.description || '',
    anhbia: c.anhbia || c.anhBia || c.thumbnail || null,
    anhBia: c.anhbia || c.anhBia || c.thumbnail || null,
    muctieu: target,
    mucTieu: target,
    targetAmount: target,
    tongtiendanhan: current,
    tongtienDaNhan: current,
    tongTienDaNhan: current,
    currentAmount: current,
    status,
    trangthai: status,
    trangThai: status,
    ngaybatdau: c.ngaybatdau || c.ngayBatDau,
    ngaykethuc: c.ngaykethuc || c.ngayKetThuc,
  };
};

/**
 * Lấy danh sách bài kêu gọi tài trợ công khai
 * @param {object} filters - { keyword, search, page, size, trangthai }
 */
export const getAllCampaigns = async (filters = {}) => {
  const keyword = filters.keyword || filters.search || '';
  const page = filters.page !== undefined ? filters.page : 0;
  const size = filters.size || 20;

  try {
    const res = await api.get('/guest/campaigns', {
      params: { keyword: keyword || undefined, page, size },
    });
    const rawList = unwrapList(res);
    const enriched = rawList.map(normalizeCampaign);
    const rawData = unwrap(res);

    return {
      data: enriched,
      items: enriched,
      total: rawData?.totalElements ?? enriched.length,
      totalPages: rawData?.totalPages ?? 1,
      currentPage: rawData?.currentPage ?? page,
    };
  } catch (err) {
    // Nếu có lỗi mạng hoặc API chưa sẵn sàng, trả về danh sách rỗng để UI render Empty/Error state an toàn
    console.error('Lỗi khi lấy danh sách chiến dịch:', err);
    throw err;
  }
};

/**
 * Lấy chi tiết một bài kêu gọi tài trợ
 * @param {number|string} id
 */
export const getCampaignById = async (id) => {
  const res = await api.get(`/guest/campaigns/${id}`);
  const data = unwrap(res);
  return normalizeCampaign(data);
};

/**
 * Cán bộ tạo bài gây quỹ mới
 * @param {object} data
 */
export const createCampaign = async (data) => {
  const payload = {
    tieude: data.tieude || data.title,
    tieuDe: data.tieude || data.title,
    noidung: data.noidung || data.description,
    noiDung: data.noidung || data.description,
    anhbia: data.anhbia || data.thumbnail,
    anhBia: data.anhbia || data.thumbnail,
    muctieu: Number(data.muctieu || data.targetAmount || 0),
    mucTieu: Number(data.muctieu || data.targetAmount || 0),
    ngaybatdau: data.ngaybatdau || data.startDate,
    ngaykethuc: data.ngaykethuc || data.endDate,
  };
  const res = await api.post('/fundraiser/campaigns', payload);
  return normalizeCampaign(unwrap(res));
};

/**
 * Cán bộ cập nhật bài gây quỹ
 * @param {number|string} id
 * @param {object} data
 */
export const updateCampaign = async (id, data) => {
  const payload = {
    tieude: data.tieude || data.title,
    tieuDe: data.tieude || data.title,
    noidung: data.noidung || data.description,
    noiDung: data.noidung || data.description,
    anhbia: data.anhbia || data.thumbnail,
    anhBia: data.anhbia || data.thumbnail,
    muctieu: Number(data.muctieu || data.targetAmount || 0),
    mucTieu: Number(data.muctieu || data.targetAmount || 0),
    ngaybatdau: data.ngaybatdau || data.startDate,
    ngaykethuc: data.ngaykethuc || data.endDate,
    trangthai: data.trangthai || data.status,
  };
  const res = await api.put(`/fundraiser/campaigns/${id}`, payload);
  return normalizeCampaign(unwrap(res));
};

/**
 * Lấy danh sách các bài gây quỹ của cán bộ
 */
export const getFundraiserCampaigns = async () => {
  const res = await api.get('/fundraiser/campaigns');
  const list = unwrapList(res);
  return list.map(normalizeCampaign);
};

/**
 * Lấy tiến trình các chiến dịch mà Nhà hảo tâm đã ủng hộ
 */
export const getCampaignsProgress = async () => {
  const res = await api.get('/donor/campaigns/progress');
  const list = unwrapList(res);
  return list.map(normalizeCampaign);
};

export const getCampaigns = getAllCampaigns;


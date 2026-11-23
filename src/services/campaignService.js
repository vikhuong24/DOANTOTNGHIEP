// Service quản lý bài kêu gọi gây quỹ - Kết nối trực tiếp API Backend Spring Boot
import api, { unwrap, unwrapList } from './api';
import { CAMPAIGN_STATUS } from '../utils/constants';
import { formatImageUrl } from '../utils/formatters';

/**
 * Chuẩn hóa đối tượng bài tài trợ
 */
export const normalizeCampaign = (c) => {
  if (!c) return null;
  const id = c.maBaiTaiTro || c.id;
  const title = c.tieuDe || c.tieude || c.title || '';
  const target = Number(c.mucTieu ?? c.muctieu ?? c.targetAmount ?? 0);
  const current = Number(c.tongTienDaNhan ?? c.tongtiendanhan ?? c.tongtienDaNhan ?? c.currentAmount ?? 0);
  const status = c.trangThai || c.trangthai || c.status || CAMPAIGN_STATUS.DADUYET;

  let percent = c.phanTramHoanThanh;
  if (percent === undefined || percent === null) {
    percent = target > 0 ? (current / target) * 100 : 0;
  }
  percent = Number(percent);

  // Chuẩn hóa danh sách nhà hảo tâm nếu có (trong CampaignDetailResponse)
  const donors = Array.isArray(c.danhSachNhaHaoTam)
    ? c.danhSachNhaHaoTam.map((d) => ({
        maTaiTro: d.maTaiTro,
        tenHienThi: d.tenHienThi || 'Nhà hảo tâm ẩn danh',
        soTienTt: Number(d.soTienTt ?? d.soTienTT ?? d.amount ?? 0),
        ngayNhan: d.ngayNhan || d.ngaynhan,
        ghiChu: d.ghiChu || d.ghichu || '',
      }))
    : [];

  return {
    ...c,
    id,
    maBaiTaiTro: id,
    title,
    tieude: title,
    tieuDe: title,
    noidung: c.noiDung || c.noidung || c.description || '',
    noiDung: c.noiDung || c.noidung || c.description || '',
    anhbia: formatImageUrl(c.anhBia || c.anhbia),
    anhBia: formatImageUrl(c.anhBia || c.anhbia),
    muctieu: target,
    mucTieu: target,
    targetAmount: target,
    tongtiendanhan: current,
    tongtienDaNhan: current,
    tongTienDaNhan: current,
    currentAmount: current,
    phanTramHoanThanh: percent,
    status,
    trangthai: status,
    trangThai: status,
    ngaybatdau: c.ngayBatDau || c.ngaybatdau,
    ngayBatDau: c.ngayBatDau || c.ngaybatdau,
    ngaykethuc: c.ngayKetThuc || c.ngaykethuc,
    ngayKetThuc: c.ngayKetThuc || c.ngaykethuc,
    tenCanBoPhuTrach: c.tenCanBoPhuTrach || c.tenCanBo || '',
    tenCanBo: c.tenCanBo || c.tenCanBoPhuTrach || '',
    tenHieuTruongDuyet: c.tenHieuTruongDuyet || '',
    danhSachNhaHaoTam: donors,
  };
};

/**
 * Lấy danh sách bài kêu gọi tài trợ công khai
 * Endpoint: GET /guest/campaigns
 * @param {object} filters - { keyword, search, page, size }
 */
export const getAllCampaigns = async (filters = {}) => {
  const keyword = (filters.keyword || filters.search || '').trim();
  const page = filters.page !== undefined ? filters.page : 0;
  const size = filters.size || 10;

  try {
    const res = await api.get('/guest/campaigns', {
      params: {
        keyword: keyword || undefined,
        page,
        size,
      },
    });

    const pageData = unwrap(res);
    const rawList = unwrapList(res);
    const enriched = rawList.map(normalizeCampaign);

    return {
      data: enriched,
      items: enriched,
      total: pageData?.totalElements ?? enriched.length,
      totalElements: pageData?.totalElements ?? enriched.length,
      totalPages: pageData?.totalPages ?? 1,
      currentPage: pageData?.currentPage ?? page,
      isLast: pageData?.isLast ?? pageData?.last ?? true,
    };
  } catch (err) {
    console.error('Lỗi khi lấy danh sách chiến dịch:', err);
    throw err;
  }
};

/**
 * Lấy chi tiết một bài kêu gọi tài trợ
 * Endpoint: GET /guest/campaigns/{id}
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
    tieuDe: data.tieuDe || data.tieude || data.title,
    noiDung: data.noiDung || data.noidung || data.description,
    anhBia: data.anhBia || data.anhbia || data.thumbnail,
    mucTieu: Number(data.mucTieu || data.muctieu || data.targetAmount || 0),
    ngayBatDau: data.ngayBatDau || data.ngaybatdau || data.startDate,
    ngayKetThuc: data.ngayKetThuc || data.ngaykethuc || data.endDate,
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
    tieuDe: data.tieuDe || data.tieude || data.title,
    noiDung: data.noiDung || data.noidung || data.description,
    anhBia: data.anhBia || data.anhbia || data.thumbnail,
    mucTieu: Number(data.mucTieu || data.muctieu || data.targetAmount || 0),
    ngayBatDau: data.ngayBatDau || data.ngaybatdau || data.startDate,
    ngayKetThuc: data.ngayKetThuc || data.ngaykethuc || data.endDate,
    trangThai: data.trangThai || data.trangthai || data.status,
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

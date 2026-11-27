// Service báo cáo tài chính (Principal) & thống kê chiến dịch (Admin)
import api, { unwrap } from './api';

/**
 * Hiệu trưởng lấy báo cáo tài chính tổng hợp
 * GET /principal/reports/financial
 */
export const getPrincipalFinancialReport = async () => {
  const res = await api.get('/principal/reports/financial');
  return unwrap(res);
};

/**
 * Quản trị viên lấy thống kê tổng quan chiến dịch
 * GET /admin/statistics/campaigns
 */
export const getAdminCampaignStatistics = async () => {
  const res = await api.get('/admin/statistics/campaigns');
  return unwrap(res);
};

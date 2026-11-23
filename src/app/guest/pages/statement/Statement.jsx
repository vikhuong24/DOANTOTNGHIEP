// Statement: Bảng sao kê minh bạch các khoản tài trợ công khai
// Kết nối trực tiếp API Backend Spring Boot: GET /guest/statements
import { useState, useEffect, useMemo, useCallback } from 'react';
import Loading from '../../../../components/Loading/Loading';
import EmptyState from '../../../../components/EmptyState/EmptyState';
import Pagination from '../../../../components/Pagination/Pagination';
import { getAllDonations } from '../../../../services/donationService';
import { getAllCampaigns } from '../../../../services/campaignService';
import { formatCurrency } from '../../../../utils/formatCurrency';
import { formatDate } from '../../../../utils/formatDate';
import './Statement.css';

const Statement = () => {
  const [donations, setDonations] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 1. Tải danh mục các chiến dịch để đưa vào combobox lọc
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await getAllCampaigns({ size: 100 });
        setCampaigns(res.items || res.data || []);
      } catch (err) {
        console.error('Lỗi khi tải danh sách chiến dịch cho bộ lọc sao kê:', err);
      }
    };
    fetchCampaigns();
  }, []);

  // 2. Tải danh sách sao kê từ Backend theo chiến dịch được chọn và phân trang
  const fetchStatements = useCallback(async (campaignId, page) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAllDonations({
        maBaiTaiTro: campaignId ? Number(campaignId) : undefined,
        page: page - 1, // Spring Boot phân trang từ 0
        size: 50,
      });

      setDonations(res.items || res.data || []);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error('Lỗi tải bảng sao kê:', err);
      setError(err?.message || 'Không thể tải dữ liệu sao kê từ máy chủ');
      setDonations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatements(selectedCampaign, currentPage);
  }, [fetchStatements, selectedCampaign, currentPage]);

  // Lọc theo ngày từ client (nếu người dùng chọn khoảng ngày)
  const filteredDonations = useMemo(() => {
    return donations.filter((d) => {
      const dateVal = d.ngayNhan || d.ngaynhan || d.ngayGui || d.ngaygui;

      if (fromDate) {
        if (!dateVal) return false;
        const dDate = new Date(dateVal);
        if (dDate < new Date(fromDate)) return false;
      }

      if (toDate) {
        if (!dateVal) return false;
        const dDate = new Date(dateVal);
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        if (dDate > end) return false;
      }

      return true;
    });
  }, [donations, fromDate, toDate]);

  // Tổng tiền các khoản hiển thị
  const totalAmount = useMemo(() => {
    return filteredDonations.reduce((sum, d) => sum + (d.soTienTt || 0), 0);
  }, [filteredDonations]);

  return (
    <div className="container statement-page">
      <div className="statement-header">
        <h1 className="statement-title">Bảng sao kê gây quỹ công khai</h1>
        <p className="statement-desc">
          Toàn bộ các khoản đóng góp ủng hộ trường chuyên biệt Nguyễn Đình Chiểu đều được ghi nhận tự động, minh bạch và cập nhật theo thời gian thực.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="statement-filters">
        <div className="statement-filter-item">
          <label htmlFor="filter-campaign">Dự án gây quỹ</label>
          <select
            id="filter-campaign"
            value={selectedCampaign}
            onChange={(e) => {
              setSelectedCampaign(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Tất cả các chương trình</option>
            {campaigns.map((c) => (
              <option key={c.maBaiTaiTro} value={c.maBaiTaiTro}>
                {c.tieuDe}
              </option>
            ))}
          </select>
        </div>

        <div className="statement-filter-item">
          <label htmlFor="filter-from">Từ ngày</label>
          <input
            id="filter-from"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        <div className="statement-filter-item">
          <label htmlFor="filter-to">Đến ngày</label>
          <input
            id="filter-to"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

        {(selectedCampaign || fromDate || toDate) && (
          <button
            className="btn btn--outline btn--sm"
            style={{ height: '42px', marginTop: 'auto' }}
            onClick={() => {
              setSelectedCampaign('');
              setFromDate('');
              setToDate('');
              setCurrentPage(1);
            }}
          >
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Table Card */}
      <div className="statement-table-card">
        {loading ? (
          <div style={{ padding: '3rem 0' }}>
            <Loading type="skeleton" rows={6} />
          </div>
        ) : error ? (
          <EmptyState
            title="Đã xảy ra lỗi khi tải sao kê"
            description={error}
            actionLabel="Thử lại"
            onAction={() => fetchStatements(selectedCampaign, currentPage)}
          />
        ) : filteredDonations.length === 0 ? (
          <EmptyState
            title="Không có bản ghi sao kê nào"
            description="Không tìm thấy giao dịch quyên góp nào phù hợp với bộ lọc ngày hoặc dự án đã chọn."
            actionLabel={selectedCampaign || fromDate || toDate ? 'Xóa bộ lọc' : undefined}
            onAction={() => {
              setSelectedCampaign('');
              setFromDate('');
              setToDate('');
              setCurrentPage(1);
            }}
          />
        ) : (
          <>
            <div className="statement-table-wrap">
              <table className="statement-table">
                <thead>
                  <tr>
                    <th style={{ width: '60px', textAlign: 'center' }}>STT</th>
                    <th style={{ width: '130px' }}>Ngày tiếp nhận</th>
                    <th>Người ủng hộ</th>
                    <th style={{ textAlign: 'right' }}>Số tiền (VNĐ)</th>
                    <th>Chương trình / Dự án</th>
                    <th>Ghi chú</th>
                    <th style={{ width: '150px', textAlign: 'center' }}>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDonations.map((don, idx) => (
                    <tr key={don.maTaiTro}>
                      <td style={{ textAlign: 'center', color: '#888' }}>{idx + 1}</td>
                      <td>{don.ngayNhan ? formatDate(don.ngayNhan) : 'Mới đây'}</td>
                      <td style={{ fontWeight: 600 }}>
                        {don.tenHienThi || 'Nhà hảo tâm ẩn danh'}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--primary)' }}>
                        {formatCurrency(don.soTienTt || 0)}
                      </td>
                      <td>
                        {don.tieuDeBaiTaiTro || `Dự án #${don.maBaiTaiTro || 'Toàn trường'}`}
                      </td>
                      <td style={{ color: '#666', fontSize: '0.875rem' }}>
                        {don.ghiChu || '—'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge badge--success">
                          Đã tiếp nhận thực tế
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Footer */}
            <div className="statement-table-footer">
              <span>Tổng số lượt quyên góp: <strong>{filteredDonations.length} lượt</strong></span>
              <div>
                <span>Tổng cộng: </span>
                <span className="statement-total-val">{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            {totalPages > 1 && (
              <div style={{ padding: '1rem', borderTop: '1px solid #f0f0f0' }}>
                <Pagination
                  page={currentPage}
                  totalPages={totalPages}
                  onChange={(page) => setCurrentPage(page)}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Statement;

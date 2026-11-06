// Statement: Bảng sao kê minh bạch các khoản tài trợ công khai
import { useState, useEffect, useMemo } from 'react';
import Loading from '../../../../components/Loading/Loading';
import EmptyState from '../../../../components/EmptyState/EmptyState';
import { getAllDonations } from '../../../../services/donationService';
import { getAllCampaigns } from '../../../../services/campaignService';
import { formatCurrency } from '../../../../utils/formatCurrency';
import { formatDate } from '../../../../utils/formatDate';
import { DONATION_STATUS_LABEL } from '../../../../utils/constants';
import './Statement.css';

const Statement = () => {
  const [donations, setDonations] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [donsRes, campsRes] = await Promise.all([
          getAllDonations(),
          getAllCampaigns(),
        ]);
        setDonations(donsRes.data || []);
        setCampaigns(campsRes.data || []);
      } catch (err) {
        console.error('Lỗi tải bảng sao kê:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Map tên chiến dịch
  const campaignTitleMap = useMemo(() => {
    const map = {};
    campaigns.forEach((c) => {
      map[c.maBaiTaiTro] = c.tieude;
    });
    return map;
  }, [campaigns]);

  // Lọc dữ liệu sao kê (chỉ hiển thị các khoản đã nhận / hoàn thành / đã duyệt)
  const filteredDonations = useMemo(() => {
    return donations.filter((d) => {
      // Filter dự án
      if (selectedCampaign && String(d.maBaiTaiTro) !== selectedCampaign) {
        return false;
      }

      // Filter ngày
      if (fromDate) {
        const dDate = new Date(d.ngaygui || d.ngayGui);
        if (dDate < new Date(fromDate)) return false;
      }

      if (toDate) {
        const dDate = new Date(d.ngaygui || d.ngayGui);
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        if (dDate > end) return false;
      }

      // Chỉ sao kê các khoản tài trợ ĐÃ ĐƯỢC DUYỆT hoặc ĐÃ TIẾP NHẬN THỰC TẾ
      // Các khoản từ chối (TuChoi) hoặc chưa duyệt (ChoDuyet) không đưa lên sao kê
      const isApprovedOrReceived =
        d.trangthai === 'DaDuyet' || d.trangthai === 'DaNhan' || d.trangthai === 'HoanThanh';
      if (!isApprovedOrReceived) return false;

      return true;
    });
  }, [donations, selectedCampaign, fromDate, toDate]);

  // Tổng tiền các khoản hiển thị
  const totalAmount = useMemo(() => {
    return filteredDonations.reduce((sum, d) => sum + (d.soTienTT ?? d.soTienDK ?? d.amount ?? 0), 0);
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
            onChange={(e) => setSelectedCampaign(e.target.value)}
          >
            <option value="">Tất cả các chương trình</option>
            {campaigns.map((c) => (
              <option key={c.maBaiTaiTro} value={c.maBaiTaiTro}>
                {c.tieude}
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
        ) : filteredDonations.length === 0 ? (
          <EmptyState
            title="Không có bản ghi sao kê nào"
            description="Không tìm thấy giao dịch quyên góp nào phù hợp với bộ lọc ngày hoặc dự án đã chọn."
          />
        ) : (
          <>
            <div className="statement-table-wrap">
              <table className="statement-table">
                <thead>
                  <tr>
                    <th style={{ width: '60px', textAlign: 'center' }}>STT</th>
                    <th style={{ width: '130px' }}>Ngày giao dịch</th>
                    <th>Người ủng hộ</th>
                    <th style={{ textAlign: 'right' }}>Số tiền (VNĐ)</th>
                    <th>Chương trình / Dự án</th>
                    <th style={{ width: '140px' }}>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDonations.map((don, idx) => (
                    <tr key={don.maTaiTro}>
                      <td style={{ textAlign: 'center', color: '#888' }}>{idx + 1}</td>
                      <td>{formatDate(don.ngaygui || don.ngayGui)}</td>
                      <td style={{ fontWeight: 600 }}>
                        {don.tenHienThi || 'Nhà hảo tâm ẩn danh'}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--primary)' }}>
                        {formatCurrency(don.soTienTT ?? don.soTienDK ?? don.amount ?? 0)}
                      </td>
                      <td>{campaignTitleMap[don.maBaiTaiTro] || `Dự án #${don.maBaiTaiTro}`}</td>
                      <td>
                        <span className="badge badge--success">
                          {don.trangthai === 'DaDuyet' ? 'Đã duyệt' : 'Đã tiếp nhận thực tế'}
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
          </>
        )}
      </div>
    </div>
  );
};

export default Statement;

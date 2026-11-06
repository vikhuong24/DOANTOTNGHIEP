// DonationHistory: Bảng lịch sử các lượt đăng ký đóng góp của cá nhân Nhà hảo tâm theo ERD mới
// BẢNG TAITRO: maTaiTro, maNguoiDung, maBaiTaiTro, tenHienThi, soTienDK, soTienTT, anhGiaoDich, trangthai, maCanBo, ghichu, ngaygui, ngaynhan
import { useState, useEffect, useMemo } from 'react';
import { FiImage } from 'react-icons/fi';
import Loading from '../../../../components/Loading/Loading';
import EmptyState from '../../../../components/EmptyState/EmptyState';
import Modal from '../../../../components/Modal/Modal';
import Button from '../../../../components/Button/Button';
import { useAuth } from '../../../../contexts/AuthContext';
import { getAllDonations } from '../../../../services/donationService';
import { getAllCampaigns } from '../../../../services/campaignService';
import { formatCurrency } from '../../../../utils/formatCurrency';
import { formatDate } from '../../../../utils/formatDate';
import { DONATION_STATUS_LABEL } from '../../../../utils/constants';
import './DonationHistory.css';

const DonationHistory = () => {
  const { user } = useAuth();

  const [donations, setDonations] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userId = user?.maNguoiDung || user?.id || 1;
        const [donsRes, campsRes] = await Promise.all([
          getAllDonations({ maNguoiDung: userId }),
          getAllCampaigns(),
        ]);
        setDonations(donsRes.data || []);
        setCampaigns(campsRes.data || []);
      } catch (err) {
        console.error('Lỗi tải lịch sử đóng góp:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Campaign map
  const campaignMap = useMemo(() => {
    const map = {};
    campaigns.forEach((c) => {
      map[c.maBaiTaiTro] = c.tieude;
    });
    return map;
  }, [campaigns]);

  // Filtered donations
  const filteredDonations = useMemo(() => {
    return donations.filter((d) => {
      if (selectedStatus && d.trangthai !== selectedStatus) return false;
      if (selectedCampaign && String(d.maBaiTaiTro) !== selectedCampaign) return false;
      return true;
    });
  }, [donations, selectedStatus, selectedCampaign]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DaNhan':
      case 'HoanThanh':
        return <span className="badge badge--success">{DONATION_STATUS_LABEL[status] || 'Đã tiếp nhận'}</span>;
      case 'DaDuyet':
        return <span className="badge badge--primary">{DONATION_STATUS_LABEL[status] || 'Đã duyệt'}</span>;
      case 'TuChoi':
        return <span className="badge badge--danger">{DONATION_STATUS_LABEL[status] || 'Từ chối'}</span>;
      default:
        return <span className="badge badge--warning">{DONATION_STATUS_LABEL[status] || 'Chờ duyệt'}</span>;
    }
  };

  return (
    <div className="history-page">
      <div className="history-header">
        <h1>Lịch sử tài trợ & đóng góp</h1>
        <p>Tra cứu tình trạng phê duyệt, số tiền đăng ký, số tiền thực tế tiếp nhận và biên lai giao dịch của các khoản tài trợ.</p>
      </div>

      {/* Filter bar */}
      <div className="history-filters">
        <div className="history-filter-item">
          <label htmlFor="filter-history-camp">Lọc theo chương trình</label>
          <select
            id="filter-history-camp"
            value={selectedCampaign}
            onChange={(e) => setSelectedCampaign(e.target.value)}
          >
            <option value="">Tất cả chương trình đã tham gia</option>
            {campaigns.map((c) => (
              <option key={c.maBaiTaiTro} value={c.maBaiTaiTro}>
                {c.tieude}
              </option>
            ))}
          </select>
        </div>

        <div className="history-filter-item">
          <label htmlFor="filter-history-status">Trạng thái xác nhận</label>
          <select
            id="filter-history-status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ChoDuyet">Chờ duyệt</option>
            <option value="DaDuyet">Đã duyệt</option>
            <option value="DaNhan">Đã nhận</option>
            <option value="HoanThanh">Hoàn thành</option>
            <option value="TuChoi">Từ chối</option>
          </select>
        </div>

        {(selectedCampaign || selectedStatus) && (
          <button
            className="btn btn--outline btn--sm"
            style={{ height: '42px', marginTop: 'auto' }}
            onClick={() => {
              setSelectedCampaign('');
              setSelectedStatus('');
            }}
          >
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* History Table */}
      <div className="history-table-card">
        {loading ? (
          <div style={{ padding: '3rem 0' }}>
            <Loading type="skeleton" rows={5} />
          </div>
        ) : filteredDonations.length === 0 ? (
          <EmptyState
            title="Chưa tìm thấy lịch sử đóng góp nào"
            description="Bạn chưa có lượt đóng góp nào khớp với bộ lọc đã chọn."
            actionLabel="Đăng ký tài trợ ngay"
            onAction={() => window.location.href = '/donor/register-sponsor'}
          />
        ) : (
          <div className="statement-table-wrap">
            <table className="statement-table">
              <thead>
                <tr>
                  <th style={{ width: '50px', textAlign: 'center' }}>STT</th>
                  <th style={{ width: '120px' }}>Ngày gửi</th>
                  <th>Chương trình tài trợ</th>
                  <th style={{ textAlign: 'right', width: '150px' }}>Số tiền ĐK (VNĐ)</th>
                  <th style={{ textAlign: 'right', width: '150px' }}>Số tiền TT (VNĐ)</th>
                  <th style={{ width: '110px', textAlign: 'center' }}>Biên lai</th>
                  <th style={{ width: '130px' }}>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonations.map((d, idx) => (
                  <tr key={d.maTaiTro}>
                    <td style={{ textAlign: 'center', color: '#888' }}>{idx + 1}</td>
                    <td>{formatDate(d.ngaygui || d.ngayGui)}</td>
                    <td style={{ fontWeight: 600 }}>
                      {campaignMap[d.maBaiTaiTro] || `Chương trình #${d.maBaiTaiTro}`}
                      {(d.ghichu || d.ghiChu) && (
                        <div style={{ fontSize: '0.8rem', color: '#777', fontWeight: 400 }}>
                          Ghi chú: {d.ghichu || d.ghiChu}
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#555' }}>
                      {formatCurrency(d.soTienDK || d.amount || 0)}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--primary)' }}>
                      {d.soTienTT !== null && d.soTienTT !== undefined
                        ? formatCurrency(d.soTienTT)
                        : <span className="text-muted" style={{ fontStyle: 'italic', fontWeight: 400 }}>Chờ đối soát</span>}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {d.anhGiaoDich ? (
                        <button
                          type="button"
                          className="btn btn--outline btn--sm"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          onClick={() => setPreviewImage(d.anhGiaoDich)}
                        >
                          <FiImage /> Xem
                        </button>
                      ) : (
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>—</span>
                      )}
                    </td>
                    <td>{getStatusBadge(d.trangthai)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal xem biên lai giao dịch */}
      {previewImage && (
        <Modal
          isOpen={!!previewImage}
          onClose={() => setPreviewImage(null)}
          title="Ảnh chụp biên lai / Giao dịch chuyển khoản"
          size="md"
          footer={
            <Button variant="outline" onClick={() => setPreviewImage(null)}>
              Đóng
            </Button>
          }
        >
          <div style={{ textAlign: 'center' }}>
            <img
              src={previewImage}
              alt="Biên lai giao dịch"
              style={{ maxWidth: '100%', maxHeight: '450px', borderRadius: '8px' }}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DonationHistory;

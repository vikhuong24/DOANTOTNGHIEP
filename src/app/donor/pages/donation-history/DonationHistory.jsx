// DonationHistory: Bảng lịch sử các lượt tài trợ trực tiếp và các đề xuất tài trợ của Nhà hảo tâm
// Kết nối trực tiếp API Backend Spring Boot: GET /donor/donations/history
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiImage, FiHeart, FiFileText, FiCheckCircle, FiClock, FiXCircle, FiFilter } from 'react-icons/fi';
import Loading from '../../../../components/Loading/Loading';
import EmptyState from '../../../../components/EmptyState/EmptyState';
import Modal from '../../../../components/Modal/Modal';
import Button from '../../../../components/Button/Button';
import Tabs from '../../../../components/Tabs/Tabs';
import { getDonationHistory } from '../../../../services/donationService';
import { formatCurrency } from '../../../../utils/formatCurrency';
import { formatDate } from '../../../../utils/formatDate';
import './DonationHistory.css';

const DonationHistory = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('direct'); // 'direct' hoặc 'proposals'
  const [historyData, setHistoryData] = useState({
    tongTienDongGopThanhCong: 0,
    danhSachDongGop: [],
    danhSachDeXuat: [],
  });
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);

  // Filters cho lượt tài trợ trực tiếp
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await getDonationHistory();
      setHistoryData(data);
    } catch (err) {
      console.error('Lỗi khi tải lịch sử đóng góp:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const totalSuccessfulAmount = historyData?.tongTienDongGopThanhCong || 0;
  const directDonations = historyData?.danhSachDongGop || [];
  const proposals = historyData?.danhSachDeXuat || [];

  // Lọc danh sách đóng góp trực tiếp
  const filteredDonations = useMemo(() => {
    return directDonations.filter((d) => {
      if (selectedStatus && String(d.trangThai).toUpperCase() !== selectedStatus.toUpperCase()) {
        return false;
      }
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const camp = (d.tieuDeBaiTaiTro || '').toLowerCase();
        const note = (d.ghiChu || '').toLowerCase();
        const donor = (d.tenHienThi || '').toLowerCase();
        if (!camp.includes(term) && !note.includes(term) && !donor.includes(term)) {
          return false;
        }
      }
      return true;
    });
  }, [directDonations, selectedStatus, searchTerm]);

  // Trạng thái badge tài trợ
  const getDonationStatusBadge = (status) => {
    const s = String(status || '').toUpperCase();
    switch (s) {
      case 'DANHAN':
      case 'HOANTHANH':
        return <span className="badge badge--success">Đã tiếp nhận</span>;
      case 'DADUYET':
      case 'DAPHE_DUYET':
        return <span className="badge badge--primary">Đã xác nhận</span>;
      case 'TUCHOI':
        return <span className="badge badge--danger">Từ chối</span>;
      case 'CHODUYET':
      default:
        return <span className="badge badge--warning">Chờ đối soát</span>;
    }
  };

  // Trạng thái badge đề xuất
  const getProposalStatusBadge = (status) => {
    const s = String(status || '').toUpperCase();
    switch (s) {
      case 'DAPHE_DUYET':
      case 'DADUYET':
        return <span className="badge badge--success">Đã phê duyệt</span>;
      case 'TUCHOI':
        return <span className="badge badge--danger">Không tiếp nhận</span>;
      case 'CHODUYET':
      default:
        return <span className="badge badge--warning">Chờ ban giám hiệu duyệt</span>;
    }
  };

  const tabsConfig = [
    { value: 'direct', label: `Lượt tài trợ chiến dịch (${directDonations.length})`, icon: <FiHeart /> },
    { value: 'proposals', label: `Đề xuất tài trợ riêng (${proposals.length})`, icon: <FiFileText /> },
  ];

  return (
    <div className="history-page">
      <div className="history-header">
        <h1>Lịch sử tài trợ & đề xuất</h1>
        <p>Tra cứu chi tiết các khoản đóng góp đã thực hiện, trạng thái đối soát từ nhà trường và các đề xuất tài trợ dự án riêng.</p>
      </div>

      {/* KPI Summary Cards */}
      <div className="progress-summary-cards" style={{ marginBottom: '1.5rem' }}>
        <div className="summary-card">
          <span className="summary-card-label">Tổng số tiền đóng góp thành công</span>
          <span className="summary-card-value">{formatCurrency(totalSuccessfulAmount)}</span>
        </div>
        <div className="summary-card">
          <span className="summary-card-label">Tổng lượt tài trợ chiến dịch</span>
          <span className="summary-card-value" style={{ color: 'var(--secondary)' }}>
            {directDonations.length} lượt
          </span>
        </div>
        <div className="summary-card">
          <span className="summary-card-label">Số đề xuất tài trợ dự án</span>
          <span className="summary-card-value" style={{ color: 'var(--accent)' }}>
            {proposals.length} đề xuất
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Tabs tabs={tabsConfig} active={activeTab} onChange={setActiveTab} />
      </div>

      {/* TAB 1: TÀI TRỢ CHIẾN DỊCH */}
      {activeTab === 'direct' && (
        <>
          {/* Filter bar */}
          <div className="history-filters">
            <div className="history-filter-item" style={{ flex: 1, minWidth: '220px' }}>
              <label htmlFor="search-history">Tìm kiếm theo tên chiến dịch hoặc ghi chú</label>
              <input
                id="search-history"
                type="text"
                className="input-field"
                placeholder="Nhập từ khóa tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="history-filter-item">
              <label htmlFor="filter-history-status">Trạng thái xác nhận</label>
              <select
                id="filter-history-status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="CHODUYET">Chờ đối soát</option>
                <option value="DANHAN">Đã tiếp nhận</option>
                <option value="DADUYET">Đã xác nhận</option>
                <option value="TUCHOI">Từ chối</option>
              </select>
            </div>

            {(selectedStatus || searchTerm) && (
              <button
                className="btn btn--outline btn--sm"
                style={{ height: '42px', marginTop: 'auto' }}
                onClick={() => {
                  setSelectedStatus('');
                  setSearchTerm('');
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
                icon={<FiHeart size={40} style={{ color: 'var(--primary)' }} />}
                title="Chưa tìm thấy lịch sử đóng góp nào"
                description={searchTerm || selectedStatus ? 'Không có khoản đóng góp nào khớp với bộ lọc.' : 'Bạn chưa có lượt đóng góp chiến dịch nào.'}
                actionLabel="Đăng ký tài trợ ngay"
                onAction={() => navigate('/donor/register-sponsor')}
              />
            ) : (
              <div className="statement-table-wrap">
                <table className="statement-table">
                  <thead>
                    <tr>
                      <th style={{ width: '50px', textAlign: 'center' }}>STT</th>
                      <th style={{ width: '120px' }}>Ngày gửi</th>
                      <th>Chương trình tài trợ</th>
                      <th>Tên hiển thị vinh danh</th>
                      <th style={{ textAlign: 'right', width: '140px' }}>Số tiền ĐK</th>
                      <th style={{ textAlign: 'right', width: '140px' }}>Số tiền TT</th>
                      <th style={{ width: '100px', textAlign: 'center' }}>Biên lai</th>
                      <th style={{ width: '130px' }}>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDonations.map((d, idx) => (
                      <tr key={d.maTaiTro}>
                        <td style={{ textAlign: 'center', color: '#888' }}>{idx + 1}</td>
                        <td>{formatDate(d.ngayGui)}</td>
                        <td style={{ fontWeight: 600 }}>
                          <div>{d.tieuDeBaiTaiTro || `Chiến dịch #${d.maBaiTaiTro || ''}`}</div>
                          {d.ghiChu && (
                            <div style={{ fontSize: '0.8rem', color: '#777', fontWeight: 400, marginTop: '2px' }}>
                              Lời nhắn: {d.ghiChu}
                            </div>
                          )}
                        </td>
                        <td>
                          <span style={{ fontSize: '0.9rem', color: '#495057' }}>
                            {d.tenHienThi || 'Nhà hảo tâm ẩn danh'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: '#555' }}>
                          {formatCurrency(d.soTienDk || 0)}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--primary)' }}>
                          {d.soTienTt !== null && d.soTienTt !== undefined && d.soTienTt > 0 ? (
                            formatCurrency(d.soTienTt)
                          ) : (
                            <span className="text-muted" style={{ fontStyle: 'italic', fontWeight: 400, fontSize: '0.85rem' }}>
                              Chờ đối soát
                            </span>
                          )}
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
                        <td>{getDonationStatusBadge(d.trangThai)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* TAB 2: ĐỀ XUẤT TÀI TRỢ RIÊNG */}
      {activeTab === 'proposals' && (
        <div className="history-table-card">
          {loading ? (
            <div style={{ padding: '3rem 0' }}>
              <Loading type="skeleton" rows={4} />
            </div>
          ) : proposals.length === 0 ? (
            <EmptyState
              icon={<FiFileText size={40} style={{ color: 'var(--primary)' }} />}
              title="Bạn chưa có đề xuất tài trợ nào"
              description="Nếu bạn muốn tài trợ một hạng mục đặc thù cho các em học sinh, hãy gửi đề xuất dự án riêng cho nhà trường."
              actionLabel="Tạo đề xuất mới"
              onAction={() => navigate('/donor/propose-sponsor')}
            />
          ) : (
            <div className="statement-table-wrap">
              <table className="statement-table">
                <thead>
                  <tr>
                    <th style={{ width: '50px', textAlign: 'center' }}>STT</th>
                    <th style={{ width: '120px' }}>Ngày gửi</th>
                    <th>Tiêu đề đề xuất</th>
                    <th>Chương trình gắn kèm</th>
                    <th style={{ textAlign: 'right', width: '150px' }}>Dự toán (VNĐ)</th>
                    <th style={{ width: '160px' }}>Trạng thái thẩm định</th>
                  </tr>
                </thead>
                <tbody>
                  {proposals.map((prop, idx) => (
                    <tr key={prop.maDeXuat}>
                      <td style={{ textAlign: 'center', color: '#888' }}>{idx + 1}</td>
                      <td>{formatDate(prop.ngayGui)}</td>
                      <td>
                        <strong style={{ fontSize: '0.95rem' }}>{prop.tieuDe}</strong>
                        {prop.mucDichSd && (
                          <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px', maxWidth: '400px' }}>
                            <strong>Mục đích:</strong> {prop.mucDichSd}
                          </div>
                        )}
                        {prop.lyDoTuChoi && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--danger)', marginTop: '4px' }}>
                            <strong>Lý do từ chối:</strong> {prop.lyDoTuChoi}
                          </div>
                        )}
                      </td>
                      <td style={{ fontSize: '0.9rem', color: '#555' }}>
                        {prop.tieuDeBaiTaiTro || <span style={{ fontStyle: 'italic', color: '#888' }}>Đề xuất chung toàn trường</span>}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--primary)' }}>
                        {formatCurrency(prop.soTienDx || 0)}
                      </td>
                      <td>
                        <div>{getProposalStatusBadge(prop.trangThai)}</div>
                        {prop.ngayXuLy && (
                          <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '2px' }}>
                            Xử lý: {formatDate(prop.ngayXuLy)}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

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
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <img
              src={previewImage}
              alt="Biên lai giao dịch"
              style={{ maxWidth: '100%', maxHeight: '450px', borderRadius: '8px', border: '1px solid #ddd' }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentNode.innerHTML = `<div style="padding: 2rem; color: #666; font-style: italic;">Đường dẫn biên lai: <code>${previewImage}</code><br/>(Không thể hiển thị hình ảnh trực tiếp)</div>`;
              }}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DonationHistory;
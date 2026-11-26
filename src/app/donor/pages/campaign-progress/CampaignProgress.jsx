// CampaignProgress: Danh sách dự án Nhà hảo tâm đã tài trợ và tiến trình giải ngân/minh chứng
// Kết nối trực tiếp API Backend Spring Boot: GET /donor/campaigns/progress & GET /donor/donations/history
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiClock, FiFileText, FiImage, FiExternalLink, FiHeart } from 'react-icons/fi';
import Card from '../../../../components/Card/Card';
import ProgressBar from '../../../../components/ProgressBar/ProgressBar';
import Modal from '../../../../components/Modal/Modal';
import Button from '../../../../components/Button/Button';
import Loading from '../../../../components/Loading/Loading';
import EmptyState from '../../../../components/EmptyState/EmptyState';
import { getCampaignsProgress, getDonationHistory } from '../../../../services/donationService';
import { formatCurrency, formatCurrencyShort } from '../../../../utils/formatCurrency';
import { formatDate } from '../../../../utils/formatDate';
import './CampaignProgress.css';

const CampaignProgress = () => {
  const navigate = useNavigate();

  const [campaigns, setCampaigns] = useState([]);
  const [historySummary, setHistorySummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal xem chi tiết dự án + minh chứng
  const [selectedCamp, setSelectedCamp] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [progRes, histRes] = await Promise.all([
        getCampaignsProgress(),
        getDonationHistory(),
      ]);

      setCampaigns(progRes || []);
      setHistorySummary(histRes || {});
    } catch (err) {
      console.error('Lỗi tải tiến trình tài trợ:', err);
      setError(err?.message || 'Không thể tải tiến trình các dự án đã tài trợ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalSuccessfulAmount = historySummary?.tongTienDongGopThanhCong || 0;
  const totalDonationCount = historySummary?.danhSachDongGop?.length || 0;

  const handleOpenDetail = (camp) => {
    setSelectedCamp(camp);
    setModalOpen(true);
  };

  return (
    <div className="progress-page">
      <div className="progress-header">
        <h1>Tiến trình các dự án đã tài trợ</h1>
        <p>Theo dõi chi tiết số tiền đóng góp, tỷ lệ hoàn thành mục tiêu và hồ sơ minh chứng giải ngân thực tế từ nhà trường.</p>
      </div>

      {/* Summary KPI Cards - Dữ liệu chính thức từ Backend */}
      <div className="progress-summary-cards">
        <div className="summary-card">
          <span className="summary-card-label">Tổng số tiền bạn đã đóng góp thành công</span>
          <span className="summary-card-value">{formatCurrency(totalSuccessfulAmount)}</span>
        </div>
        <div className="summary-card">
          <span className="summary-card-label">Số dự án bạn đã đồng hành</span>
          <span className="summary-card-value" style={{ color: 'var(--secondary)' }}>
            {campaigns.length} dự án
          </span>
        </div>
        <div className="summary-card">
          <span className="summary-card-label">Tổng số lượt đăng ký tài trợ</span>
          <span className="summary-card-value" style={{ color: 'var(--accent)' }}>
            {totalDonationCount} lượt
          </span>
        </div>
      </div>

      {/* Grid Projects */}
      {loading ? (
        <div style={{ padding: '3rem 0' }}>
          <Loading type="skeleton" rows={4} />
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</p>
          <Button variant="outline" onClick={fetchData}>
            Thử lại
          </Button>
        </div>
      ) : campaigns.length === 0 ? (
        <EmptyState
          icon={<FiHeart size={44} style={{ color: 'var(--primary)' }} />}
          title="Bạn chưa có khoản đóng góp nào"
          description="Hãy khám phá các chương trình gây quỹ của trường và cùng chung tay thắp sáng ước mơ cho các em học sinh có hoàn cảnh đặc biệt."
          actionLabel="Khám phá chương trình ngay"
          onAction={() => navigate('/campaigns')}
        />
      ) : (
        <div className="progress-grid">
          {campaigns.map((camp) => {
            const isEnded =
              String(camp.trangThai).toUpperCase() === 'KETTHUC' ||
              String(camp.trangthai).toUpperCase() === 'KETTHUC';
            const percent = Number(camp.phanTramHoanThanh || 0);

            return (
              <Card key={camp.maBaiTaiTro} hoverable padding={false}>
                <img
                  src={
                    camp.anhBia ||
                    camp.anhbia ||
                    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600'
                  }
                  alt={camp.tieuDe}
                  className="progress-item-thumb"
                />

                <div className="progress-item-content">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className={`badge ${isEnded ? 'badge--secondary' : 'badge--primary'}`}>
                      {isEnded ? 'Đã hoàn tất' : 'Đang gây quỹ'}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#888' }}>
                      Tiến độ: {percent.toFixed(1)}%
                    </span>
                  </div>

                  <h3 className="progress-item-title">{camp.tieuDe}</h3>

                  <div className="progress-donation-badge">
                    <span>Bạn đã tài trợ:</span>
                    <strong>{formatCurrency(camp.tongTienToiDaDongGop || 0)}</strong>
                  </div>

                  <div>
                    <ProgressBar percent={percent} height={8} />
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.8rem',
                        marginTop: '4px',
                        color: '#666',
                      }}
                    >
                      <span>Đã nhận: {formatCurrencyShort(camp.tongTienDaNhan || 0)}</span>
                      <span>Mục tiêu: {formatCurrencyShort(camp.mucTieu || 0)}</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => handleOpenDetail(camp)}
                  >
                    <FiFileText /> Xem chi tiết & Minh chứng
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Chi tiết + Minh chứng */}
      {selectedCamp && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={`Tiến trình dự án: ${selectedCamp.tieuDe}`}
          size="lg"
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setModalOpen(false);
                  navigate(`/campaigns/${selectedCamp.maBaiTaiTro}`);
                }}
              >
                <FiExternalLink /> Xem trang bài viết
              </Button>
              <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                Đóng cửa sổ
              </Button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div
              style={{
                background: '#f8faf8',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.85rem', color: '#666' }}>Mục tiêu gây quỹ:</span>
                  <div style={{ fontWeight: 700 }}>{formatCurrency(selectedCamp.mucTieu || 0)}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.85rem', color: '#666' }}>Thực tế tiếp nhận:</span>
                  <div style={{ fontWeight: 700, color: 'var(--success)' }}>
                    {formatCurrency(selectedCamp.tongTienDaNhan || 0)}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.85rem', color: '#666' }}>Bạn đã đóng góp:</span>
                  <div style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    {formatCurrency(selectedCamp.tongTienToiDaDongGop || 0)}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.85rem', color: '#666' }}>Trạng thái chiến dịch:</span>
                  <div>
                    <span className="badge badge--primary">
                      {String(selectedCamp.trangThai).toUpperCase() === 'KETTHUC' ? 'Hoàn tất' : 'Đang tiếp nhận'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Danh sách minh chứng từ Backend */}
            <div className="progress-modal-evidences">
              <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--text)' }}>
                Hồ sơ minh chứng & giải ngân thực tế ({(selectedCamp.danhSachMinhChung || []).length})
              </h4>
              {(!selectedCamp.danhSachMinhChung || selectedCamp.danhSachMinhChung.length === 0) ? (
                <p style={{ color: '#888', fontStyle: 'italic', marginTop: '0.5rem' }}>
                  Ban quản lý nhà trường đang tổng hợp hóa đơn, chứng từ và hình ảnh trao quà. Minh chứng sẽ được cập nhật sớm nhất tại đây.
                </p>
              ) : (
                <div className="evidence-thumb-grid">
                  {selectedCamp.danhSachMinhChung.map((evi) => (
                    <div key={evi.maMinhChung} className="evidence-thumb-item">
                      <div className="evidence-thumb-img-wrap">
                        {evi.duongDanTep && evi.duongDanTep.toLowerCase().endsWith('.pdf') ? (
                          <div
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--primary)', cursor: 'pointer' }}
                            onClick={() => window.open(evi.duongDanTep, '_blank', 'noopener,noreferrer')}
                          >
                            <FiFileText size={36} />
                            <span style={{ fontSize: '0.75rem', marginTop: '4px' }}>Xem tài liệu PDF</span>
                          </div>
                        ) : (
                          <img
                            src={evi.duongDanTep || '/images/minhchungmau.jpg'}
                            alt={evi.moTa}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = '/images/minhchungmau.jpg';
                            }}
                          />
                        )}
                      </div>
                      <div className="evidence-thumb-desc">
                        {evi.loaiTaiLieu && <span className="evidence-type-tag">[{evi.loaiTaiLieu}]</span>}
                        <p>{evi.moTa}</p>
                        {evi.ngayTaiLen && (
                          <span style={{ fontSize: '0.75rem', color: '#888' }}>
                            {formatDate(evi.ngayTaiLen)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CampaignProgress;
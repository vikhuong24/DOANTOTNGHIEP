// CampaignProgress: Danh sách dự án Nhà hảo tâm đã tài trợ và tiến trình giải ngân/minh chứng
import { useState, useEffect, useMemo } from 'react';
import Card from '../../../../components/Card/Card';
import ProgressBar from '../../../../components/ProgressBar/ProgressBar';
import Modal from '../../../../components/Modal/Modal';
import Button from '../../../../components/Button/Button';
import Loading from '../../../../components/Loading/Loading';
import EmptyState from '../../../../components/EmptyState/EmptyState';
import { useAuth } from '../../../../contexts/AuthContext';
import { getAllCampaigns } from '../../../../services/campaignService';
import { getAllDonations } from '../../../../services/donationService';
import { getAllEvidences } from '../../../../services/evidenceService';
import { formatCurrency, formatCurrencyShort } from '../../../../utils/formatCurrency';
import { formatDate } from '../../../../utils/formatDate';
import './CampaignProgress.css';

const CampaignProgress = () => {
  const { user } = useAuth();

  const [campaigns, setCampaigns] = useState([]);
  const [myDonations, setMyDonations] = useState([]);
  const [evidences, setEvidences] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal xem chi tiết dự án + minh chứng
  const [selectedCamp, setSelectedCamp] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userId = user?.maNguoiDung || user?.id || 1;
        const [campsRes, myDonsRes, evisRes] = await Promise.all([
          getAllCampaigns(),
          getAllDonations({ maNguoiDung: userId }),
          getAllEvidences(),
        ]);

        setCampaigns(campsRes.data || []);
        setMyDonations(myDonsRes.data || []);
        setEvidences(evisRes.data || []);
      } catch (err) {
        console.error('Lỗi tải tiến trình tài trợ:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Tính tổng số tiền đã đóng góp của NHT này
  const totalContributed = useMemo(() => {
    return myDonations
      .filter((d) => d.trangthai === 'DaNhan' || d.trangthai === 'HoanThanh')
      .reduce((sum, d) => sum + (d.soTienTT ?? d.soTienDK ?? d.amount ?? 0), 0);
  }, [myDonations]);

  // Lấy danh sách ID các chiến dịch mà NHT này đã tài trợ
  const sponsoredCampaignIds = useMemo(() => {
    return [...new Set(myDonations.map((d) => d.maBaiTaiTro))];
  }, [myDonations]);

  // Các dự án mà NHT đã tham gia
  const myCampaigns = useMemo(() => {
    return campaigns.filter((c) => sponsoredCampaignIds.includes(c.maBaiTaiTro));
  }, [campaigns, sponsoredCampaignIds]);

  // Trạng thái tiến trình tiếng Việt: Đang gây quỹ / Đã đủ / Hoàn thành
  const getProgressStatus = (camp, percent) => {
    if (camp.trangthai === 'KetThuc') return 'Hoàn thành';
    if (percent >= 100) return 'Đã đủ mục tiêu';
    if (percent > 0) return 'Đang gây quỹ';
    return 'Chuẩn bị triển khai';
  };

  const handleOpenDetail = (camp) => {
    setSelectedCamp(camp);
    setModalOpen(true);
  };

  // Lọc minh chứng cho chiến dịch đang xem modal
  const selectedEvidences = useMemo(() => {
    if (!selectedCamp) return [];
    return evidences.filter((e) => e.mabaitaitro === selectedCamp.maBaiTaiTro);
  }, [selectedCamp, evidences]);

  return (
    <div className="progress-page">
      <div className="progress-header">
        <h1>Tiến trình các dự án đã tài trợ</h1>
        <p>Theo dõi chi tiết số tiền đóng góp, tỷ lệ hoàn thành mục tiêu và hồ sơ minh chứng giải ngân thực tế.</p>
      </div>

      {/* Summary KPI Cards */}
      <div className="progress-summary-cards">
        <div className="summary-card">
          <span className="summary-card-label">Tổng số tiền bạn đã đóng góp</span>
          <span className="summary-card-value">{formatCurrency(totalContributed)}</span>
        </div>
        <div className="summary-card">
          <span className="summary-card-label">Số dự án bạn đã đồng hành</span>
          <span className="summary-card-value" style={{ color: 'var(--secondary)' }}>
            {myCampaigns.length} dự án
          </span>
        </div>
        <div className="summary-card">
          <span className="summary-card-label">Số lượt đăng ký tài trợ</span>
          <span className="summary-card-value" style={{ color: 'var(--accent)' }}>
            {myDonations.length} lượt
          </span>
        </div>
      </div>

      {/* Grid Projects */}
      {loading ? (
        <Loading type="skeleton" rows={4} />
      ) : myCampaigns.length === 0 ? (
        <EmptyState
          title="Bạn chưa có khoản đóng góp nào"
          description="Hãy khám phá các chương trình gây quỹ của trường và cùng chung tay thắp sáng ước mơ cho các em học sinh."
          actionLabel="Khám phá chương trình ngay"
          onAction={() => window.location.href = '/campaigns'}
        />
      ) : (
        <div className="progress-grid">
          {myCampaigns.map((camp) => {
            const target = camp.muctieu || 0;
            const totalRaised = camp.tongtienDaNhan || 0;
            const percent = target > 0 ? (totalRaised / target) * 100 : 0;
            const statusLabel = getProgressStatus(camp, percent);

            // Số tiền cá nhân đóng góp cho riêng dự án này
            const myContributionToThis = myDonations
              .filter((d) => d.maBaiTaiTro === camp.maBaiTaiTro)
              .reduce((sum, d) => sum + (d.soTienTT ?? d.soTienDK ?? d.amount ?? 0), 0);

            return (
              <Card key={camp.maBaiTaiTro} hoverable padding={false}>
                <img
                  src={camp.anhbia || 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600'}
                  alt={camp.tieude}
                  className="progress-item-thumb"
                />

                <div className="progress-item-content">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="badge badge--primary">{statusLabel}</span>
                    <span style={{ fontSize: '0.8rem', color: '#888' }}>
                      Đến {formatDate(camp.ngaykethuc)}
                    </span>
                  </div>

                  <h3 className="progress-item-title">{camp.tieude}</h3>

                  <div className="progress-donation-badge">
                    <span>Bạn đã tài trợ:</span>
                    <strong>{formatCurrency(myContributionToThis)}</strong>
                  </div>

                  <div>
                    <ProgressBar percent={percent} height={8} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginTop: '4px', color: '#666' }}>
                      <span>Thực tế: {formatCurrencyShort(totalRaised)}</span>
                      <span>Mục tiêu: {formatCurrencyShort(target)}</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => handleOpenDetail(camp)}
                  >
                    Xem chi tiết & Minh chứng
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
          title={`Tiến trình dự án: ${selectedCamp.tieude}`}
          size="lg"
          footer={
            <Button variant="outline" size="md" onClick={() => setModalOpen(false)}>
              Đóng cửa sổ
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ background: '#f8faf8', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <p style={{ margin: '0 0 0.5rem 0' }}><strong>Nội dung:</strong> {selectedCamp.noidung}</p>
              <p style={{ margin: '0 0 0.5rem 0' }}><strong>Thời gian thực hiện:</strong> Từ {formatDate(selectedCamp.ngaybatdau)} đến {formatDate(selectedCamp.ngaykethuc)}</p>
              <p style={{ margin: '0 0 0.5rem 0' }}><strong>Mục tiêu kinh phí:</strong> {formatCurrency(selectedCamp.muctieu || 0)}</p>
              <p style={{ margin: 0 }}><strong>Đã tiếp nhận:</strong> <span className="font-bold text-success">{formatCurrency(selectedCamp.tongtienDaNhan || 0)}</span></p>
            </div>

            <div className="progress-modal-evidences">
              <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--text)' }}>
                Hồ sơ minh chứng & giải ngân thực tế ({selectedEvidences.length})
              </h4>
              {selectedEvidences.length === 0 ? (
                <p style={{ color: '#888', fontStyle: 'italic', marginTop: '0.5rem' }}>
                  Ban quản lý dự án đang tiến hành tổng hợp hóa đơn và chứng từ, minh chứng sẽ được cập nhật sớm nhất.
                </p>
              ) : (
                <div className="evidence-thumb-grid">
                  {selectedEvidences.map((evi) => (
                    <div key={evi.maMinhchung} className="evidence-thumb-item">
                      <div className="evidence-thumb-img-wrap">
                        <img src={evi.duongdantep} alt={evi.mota} />
                      </div>
                      <div className="evidence-thumb-desc">
                        {evi.loaitailieu && <span className="evidence-type-tag">[{evi.loaitailieu}]</span>}
                        <p>{evi.mota}</p>
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

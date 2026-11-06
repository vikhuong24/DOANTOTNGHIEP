// CampaignDetail: Chi tiết bài tài trợ, danh sách nhà hảo tâm, minh chứng và nút tài trợ/đề xuất
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiCalendar, FiUser, FiCheckCircle, FiClock, FiHeart, FiFileText } from 'react-icons/fi';
import Button from '../../../../components/Button/Button';
import ProgressBar from '../../../../components/ProgressBar/ProgressBar';
import Loading from '../../../../components/Loading/Loading';
import EmptyState from '../../../../components/EmptyState/EmptyState';
import Lightbox from '../../../../components/Lightbox/Lightbox';
import { useAuth } from '../../../../contexts/AuthContext';
import { getCampaignById } from '../../../../services/campaignService';
import { getAllDonations } from '../../../../services/donationService';
import { getAllEvidences } from '../../../../services/evidenceService';
import { formatCurrency } from '../../../../utils/formatCurrency';
import { formatDate, daysRemaining, formatRelativeTime } from '../../../../utils/formatDate';
import { CAMPAIGN_STATUS_LABEL } from '../../../../utils/constants';
import './CampaignDetail.css';

const CampaignDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [campaign, setCampaign] = useState(null);
  const [donations, setDonations] = useState([]);
  const [evidences, setEvidences] = useState([]);
  const [loading, setLoading] = useState(true);

  // Gallery & Lightbox
  const [activeImage, setActiveImage] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [campRes, donsRes, evisRes] = await Promise.all([
          getCampaignById(id),
          getAllDonations({ maBaiTaiTro: id }),
          getAllEvidences({ mabaitaitro: id }),
        ]);
        setCampaign(campRes);
        setActiveImage(campRes.anhbia || '');
        setDonations(donsRes.data || []);
        setEvidences(evisRes.data || []);
      } catch (err) {
        console.error('Lỗi tải chi tiết bài tài trợ:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const targetAmount = campaign?.muctieu || 0;
  const totalRaised = campaign?.tongtienDaNhan || 0;
  const progressPercent = targetAmount > 0 ? (totalRaised / targetAmount) * 100 : 0;
  const daysLeft = campaign ? daysRemaining(campaign.ngaykethuc) : 0;

  // Xử lý nút Đăng ký tài trợ
  const handleRegisterSponsor = () => {
    if (!isAuthenticated) {
      navigate('/donor/login', { state: { redirectTo: `/donor/register-sponsor?campaignId=${id}` } });
    } else {
      navigate(`/donor/register-sponsor?campaignId=${id}`);
    }
  };

  // Xử lý nút Đề xuất tài trợ
  const handleProposeSponsor = () => {
    if (!isAuthenticated) {
      navigate('/donor/login', { state: { redirectTo: `/donor/propose-sponsor?campaignId=${id}` } });
    } else {
      navigate(`/donor/propose-sponsor?campaignId=${id}`);
    }
  };

  // Gallery list (ảnh bìa + ảnh minh chứng)
  const allImages = useMemo(() => {
    const imgs = [];
    if (campaign?.anhbia) imgs.push(campaign.anhbia);
    evidences.forEach((e) => {
      if (e.duongdantep && !imgs.includes(e.duongdantep)) imgs.push(e.duongdantep);
    });
    return imgs;
  }, [campaign, evidences]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 0' }}>
        <Loading />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container" style={{ padding: '3rem 0' }}>
        <EmptyState
          title="Không tìm thấy bài kêu gọi tài trợ"
          description="Chương trình này có thể đã bị xóa hoặc không còn tồn tại."
          actionLabel="Quay lại danh sách"
          onAction={() => navigate('/campaigns')}
        />
      </div>
    );
  }

  return (
    <div className="container campaign-detail-page">
      <div className="campaign-detail-layout">
        {/* Cột chính: Nội dung, Gallery, Minh chứng, Nhà hảo tâm */}
        <div className="campaign-detail-main">
          {/* Header Title */}
          <div className="campaign-title-wrap">
            <span className={`badge ${campaign.trangthai === 'DangChay' ? 'badge--success' : 'badge--primary'}`}>
              {CAMPAIGN_STATUS_LABEL[campaign.trangthai] || campaign.trangthai}
            </span>
            <h1 style={{ marginTop: '0.5rem' }}>{campaign.tieude}</h1>
            <div className="campaign-meta-bar">
              <div className="campaign-meta-item">
                <FiCalendar />
                <span>Từ {formatDate(campaign.ngaybatdau)} đến {formatDate(campaign.ngaykethuc)}</span>
              </div>
              <div className="campaign-meta-item">
                <FiUser />
                <span>Cán bộ phụ trách: Lê Minh Cường (CBQL)</span>
              </div>
            </div>
          </div>

          {/* Main Photo */}
          <div
            className="campaign-main-image-wrap"
            onClick={() => {
              const idx = allImages.indexOf(activeImage);
              setLightboxIndex(idx >= 0 ? idx : 0);
              setLightboxOpen(true);
            }}
            style={{ cursor: 'pointer' }}
            title="Nhấp để phóng to ảnh"
          >
            <img src={activeImage} alt={campaign.tieude} className="campaign-main-image" />
          </div>

          {/* Thumbnail Gallery */}
          {allImages.length > 1 && (
            <div className="campaign-gallery">
              {allImages.map((img, idx) => (
                <div
                  key={idx}
                  className={`campaign-gallery-item ${activeImage === img ? 'campaign-gallery-item--active' : ''}`}
                  onClick={() => setActiveImage(img)}
                >
                  <img src={img} alt={`Gallery ${idx + 1}`} />
                </div>
              ))}
            </div>
          )}

          {/* Detailed Content */}
          <div className="campaign-content-box">
            <h3>Nội dung chương trình tài trợ</h3>
            <p style={{ whiteSpace: 'pre-line' }}>{campaign.noidung}</p>
          </div>

          {/* Minh chứng nếu có */}
          {evidences.length > 0 && (
            <div className="evidences-card">
              <h3>Minh chứng & Tài liệu giải ngân ({evidences.length})</h3>
              <p style={{ fontSize: '0.875rem', color: '#666' }}>
                Hóa đơn tài chính, chứng từ bàn giao và hình ảnh hoạt động trao tặng thực tế tại trường.
              </p>
              <div className="evidence-grid">
                {evidences.map((evi) => (
                  <div
                    key={evi.maMinhchung}
                    className="evidence-item"
                    onClick={() => {
                      const imgIdx = allImages.indexOf(evi.duongdantep);
                      setLightboxIndex(imgIdx >= 0 ? imgIdx : 0);
                      setLightboxOpen(true);
                    }}
                  >
                    <img src={evi.duongdantep} alt={evi.mota} className="evidence-thumb" />
                    <div className="evidence-caption">
                      <strong>[{evi.loaitailieu}]</strong> {evi.mota}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Donors */}
          <div className="recent-donors-card">
            <h3>Nhà hảo tâm đã đồng hành ({donations.length})</h3>
            <div style={{ marginTop: '1rem' }}>
              {donations.length === 0 ? (
                <p style={{ color: '#888', fontStyle: 'italic' }}>
                  Chưa có lượt tài trợ nào được xác nhận. Hãy là người đầu tiên ủng hộ!
                </p>
              ) : (
                donations.map((don) => (
                  <div key={don.maTaiTro} className="donor-item">
                    <div className="donor-info">
                      <div className="donor-avatar">
                        {(don.tenHienThi || 'N')[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="donor-name">{don.tenHienThi || 'Nhà hảo tâm ẩn danh'}</div>
                        <div className="donor-time">{formatRelativeTime(don.ngaygui || don.ngayGui)}</div>
                      </div>
                    </div>
                    <div className="donor-amount">{formatCurrency(don.soTienTT ?? don.soTienDK ?? don.amount ?? 0)}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Cột phải: Thẻ hành động tài trợ */}
        <div>
          <div className="campaign-sidebar-card">
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '2px' }}>
                Thực tế đã tiếp nhận:
              </div>
              <div className="campaign-raised-amount">{formatCurrency(totalRaised)}</div>
              <div className="campaign-target-amount">
                trên mục tiêu vận động {formatCurrency(targetAmount)}
              </div>
            </div>

            <ProgressBar percent={progressPercent} height={10} />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#666' }}>
              <div>
                <strong>{donations.length}</strong> lượt tài trợ
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent)', fontWeight: 600 }}>
                <FiClock />
                <span>{campaign.trangthai === 'KetThuc' ? 'Đã hoàn tất' : `Còn ${daysLeft} ngày`}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="campaign-sidebar-actions">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleRegisterSponsor}
                disabled={campaign.trangthai === 'KetThuc'}
              >
                <FiHeart /> Đăng ký tài trợ ngay
              </Button>

              <Button
                variant="outline"
                size="md"
                fullWidth
                onClick={handleProposeSponsor}
                disabled={campaign.trangthai === 'KetThuc'}
              >
                <FiFileText /> Đề xuất tài trợ dự án riêng
              </Button>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#888', textAlign: 'center', lineHeight: 1.4 }}>
              <FiCheckCircle style={{ color: 'var(--success)', verticalAlign: 'middle', marginRight: '4px' }} />
              100% kinh phí tài trợ được giải ngân minh bạch có biên nhận và chứng từ kiểm toán công khai.
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox phóng to ảnh */}
      {lightboxOpen && (
        <Lightbox
          images={allImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
};

export default CampaignDetail;

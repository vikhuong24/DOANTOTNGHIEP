// CampaignDetail: Chi tiết bài tài trợ, danh sách nhà hảo tâm, minh chứng và nút tài trợ/đề xuất
// Kết nối trực tiếp API Backend Spring Boot: GET /guest/campaigns/{id}
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiCalendar, FiUser, FiCheckCircle, FiClock, FiHeart, FiFileText, FiAward } from 'react-icons/fi';
import Button from '../../../../components/Button/Button';
import ProgressBar from '../../../../components/ProgressBar/ProgressBar';
import Loading from '../../../../components/Loading/Loading';
import EmptyState from '../../../../components/EmptyState/EmptyState';
import Lightbox from '../../../../components/Lightbox/Lightbox';
import { useAuth } from '../../../../contexts/AuthContext';
import { useNotification } from '../../../../components/Notification/Notification';
import { getCampaignById } from '../../../../services/campaignService';
import { getAllEvidences } from '../../../../services/evidenceService';
import { formatCurrency } from '../../../../utils/formatCurrency';
import { formatDate, daysRemaining, formatRelativeTime } from '../../../../utils/formatDate';
import { CAMPAIGN_STATUS_LABEL } from '../../../../utils/constants';
import './CampaignDetail.css';

const CampaignDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, hasRole } = useAuth();
  const { addToast } = useNotification();

  const [campaign, setCampaign] = useState(null);
  const [evidences, setEvidences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Gallery & Lightbox
  const [activeImage, setActiveImage] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Lấy chi tiết chiến dịch từ Backend (đã kèm sẵn danh sách nhà hảo tâm danhSachNhaHaoTam)
        const campRes = await getCampaignById(id);
        setCampaign(campRes);
        setActiveImage(campRes?.anhBia || '');

        // Lấy thêm minh chứng tài liệu giải ngân nếu có
        try {
          const evisRes = await getAllEvidences({ mabaitaitro: id });
          setEvidences(evisRes.data || []);
        } catch {
          setEvidences([]);
        }
      } catch (err) {
        console.error('Lỗi tải chi tiết bài tài trợ:', err);
        setError(err?.message || 'Không tìm thấy bài kêu gọi tài trợ');
        setCampaign(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const targetAmount = campaign?.mucTieu || 0;
  const totalRaised = campaign?.tongTienDaNhan || 0;
  const progressPercent = campaign?.phanTramHoanThanh !== undefined
    ? campaign.phanTramHoanThanh
    : (targetAmount > 0 ? (totalRaised / targetAmount) * 100 : 0);
  const daysLeft = campaign ? daysRemaining(campaign.ngayKetThuc) : 0;
  const statusKey = campaign?.trangThai || campaign?.trangthai;
  const isEnded = statusKey === 'KETTHUC' || statusKey === 'KetThuc';
  const donorsList = campaign?.danhSachNhaHaoTam || [];

  // Xử lý nút Đăng ký tài trợ
  const handleRegisterSponsor = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/donor/register-sponsor?campaignId=${id}` } } });
      return;
    }
    if (!hasRole(['NHATAITRO', 'NHT', 'ADMIN', 'donor'])) {
      addToast('Chức năng đăng ký tài trợ dành riêng cho tài khoản Nhà hảo tâm. Vui lòng đăng nhập bằng tài khoản Nhà hảo tâm!', 'info');
      return;
    }
    navigate(`/donor/register-sponsor?campaignId=${id}`);
  };

  // Xử lý nút Đề xuất tài trợ
  const handleProposeSponsor = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/donor/propose-sponsor?campaignId=${id}` } } });
      return;
    }
    if (!hasRole(['NHATAITRO', 'NHT', 'ADMIN', 'donor'])) {
      addToast('Chức năng đề xuất tài trợ dành riêng cho tài khoản Nhà hảo tâm. Vui lòng đăng nhập bằng tài khoản Nhà hảo tâm!', 'info');
      return;
    }
    navigate(`/donor/propose-sponsor?campaignId=${id}`);
  };

  // Gallery list (ảnh bìa + ảnh minh chứng)
  const allImages = useMemo(() => {
    const imgs = [];
    if (campaign?.anhBia) imgs.push(campaign.anhBia);
    evidences.forEach((e) => {
      const src = e.duongdantep || e.duongDanTep;
      if (src && !imgs.includes(src)) imgs.push(src);
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

  if (error || !campaign) {
    return (
      <div className="container" style={{ padding: '3rem 0' }}>
        <EmptyState
          title="Không tìm thấy bài kêu gọi tài trợ"
          description={error || "Chương trình này có thể đã bị xóa hoặc không còn tồn tại trên hệ thống."}
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
            <span className={`badge ${!isEnded ? 'badge--success' : 'badge--primary'}`}>
              {CAMPAIGN_STATUS_LABEL[statusKey] || (isEnded ? 'Kết thúc' : 'Đang vận động')}
            </span>
            <h1 style={{ marginTop: '0.5rem' }}>{campaign.tieuDe}</h1>
            <div className="campaign-meta-bar">
              <div className="campaign-meta-item">
                <FiCalendar />
                <span>Từ {formatDate(campaign.ngayBatDau)} đến {formatDate(campaign.ngayKetThuc)}</span>
              </div>
              <div className="campaign-meta-item">
                <FiUser />
                <span>Cán bộ phụ trách: <strong>{campaign.tenCanBo || campaign.tenCanBoPhuTrach || 'Cán bộ gây quỹ trường'}</strong></span>
              </div>
              {campaign.tenHieuTruongDuyet && (
                <div className="campaign-meta-item">
                  <FiAward />
                  <span>Phê duyệt bởi: <strong>{campaign.tenHieuTruongDuyet}</strong></span>
                </div>
              )}
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
            <img
              src={activeImage || 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600'}
              alt={campaign.tieuDe}
              className="campaign-main-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600';
              }}
            />
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
            <p style={{ whiteSpace: 'pre-line' }}>{campaign.noiDung}</p>
          </div>

          {/* Minh chứng nếu có */}
          {evidences.length > 0 && (
            <div className="evidences-card">
              <h3>Minh chứng & Tài liệu giải ngân ({evidences.length})</h3>
              <p style={{ fontSize: '0.875rem', color: '#666' }}>
                Hóa đơn tài chính, chứng từ bàn giao và hình ảnh hoạt động trao tặng thực tế tại trường.
              </p>
              <div className="evidence-grid">
                {evidences.map((evi) => {
                  const imgSrc = evi.duongdantep || evi.duongDanTep;
                  return (
                    <div
                      key={evi.maMinhchung || evi.maMinhChung}
                      className="evidence-item"
                      onClick={() => {
                        const imgIdx = allImages.indexOf(imgSrc);
                        setLightboxIndex(imgIdx >= 0 ? imgIdx : 0);
                        setLightboxOpen(true);
                      }}
                    >
                      <img src={imgSrc} alt={evi.mota || evi.moTa} className="evidence-thumb" />
                      <div className="evidence-caption">
                        <strong>[{evi.loaitailieu || evi.loaiTaiLieu}]</strong> {evi.mota || evi.moTa}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Donors - Dữ liệu thật từ Backend */}
          <div className="recent-donors-card">
            <h3>Nhà hảo tâm đã đồng hành ({donorsList.length})</h3>
            <div style={{ marginTop: '1rem' }}>
              {donorsList.length === 0 ? (
                <p style={{ color: '#888', fontStyle: 'italic' }}>
                  Chưa có lượt tài trợ nào được ghi nhận. Hãy là người đầu tiên ủng hộ chương trình này!
                </p>
              ) : (
                donorsList.map((don) => (
                  <div key={don.maTaiTro} className="donor-item">
                    <div className="donor-info">
                      <div className="donor-avatar">
                        {(don.tenHienThi || 'N')[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="donor-name">{don.tenHienThi || 'Nhà hảo tâm ẩn danh'}</div>
                        <div className="donor-time">
                          {don.ngayNhan ? formatDate(don.ngayNhan) : 'Mới đây'}
                          {don.ghiChu && ` • ${don.ghiChu}`}
                        </div>
                      </div>
                    </div>
                    <div className="donor-amount">{formatCurrency(don.soTienTt || 0)}</div>
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
                <strong>{donorsList.length}</strong> lượt tài trợ
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent)', fontWeight: 600 }}>
                <FiClock />
                <span>{isEnded ? 'Đã hoàn tất' : (daysLeft > 0 ? `Còn ${daysLeft} ngày` : 'Hôm nay')}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="campaign-sidebar-actions">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleRegisterSponsor}
                disabled={isEnded}
              >
                <FiHeart /> Đăng ký tài trợ ngay
              </Button>

              <Button
                variant="outline"
                size="md"
                fullWidth
                onClick={handleProposeSponsor}
                disabled={isEnded}
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

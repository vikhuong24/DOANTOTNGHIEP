// Trang Gallery Minh chứng trao tặng cho Phụ huynh
import { useState, useEffect } from 'react';
import { getEvidences } from '../../../../services/evidenceService';
import Card from '../../../../components/Card/Card';
import Lightbox from '../../../../components/Lightbox/Lightbox';
import Loading from '../../../../components/Loading/Loading';
import EmptyState from '../../../../components/EmptyState/EmptyState';
import { formatDate } from '../../../../utils/formatters';
import { FiEye, FiImage, FiFilter, FiCalendar } from 'react-icons/fi';
import './DonationEvidence.css';

const DonationEvidence = () => {
  const [loading, setLoading] = useState(true);
  const [evidences, setEvidences] = useState([]);
  const [filterType, setFilterType] = useState('ALL');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const fetchEvidences = async () => {
      try {
        setLoading(true);
        const res = await getEvidences();
        // Lấy danh sách ảnh minh chứng
        setEvidences(res?.data || res || []);
      } catch (err) {
        console.error('Lỗi khi tải minh chứng:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvidences();
  }, []);

  const filteredEvidences = evidences.filter((item) => {
    if (filterType === 'ALL') return true;
    return item.loai === filterType || item.type === filterType;
  });

  const lightboxImages = filteredEvidences.map((item) => ({
    src: item.duongDan || item.url || item.image || item,
    alt: item.moTa || item.tieuDe || 'Minh chứng trao tặng',
  }));

  const handleOpenLightbox = (index) => {
    setActiveImageIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div className="donation-evidence-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Thư Viện Minh Chứng Trao Tặng</h1>
          <p className="page-subtitle">
            Toàn bộ tư liệu, hình ảnh buổi lễ trao tặng học bổng và thiết bị học tập cho học sinh
          </p>
        </div>

        {/* Bộ lọc loại minh chứng */}
        <div className="evidence-filters">
          <div className="filter-label">
            <FiFilter /> Lọc theo loại:
          </div>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filterType === 'ALL' ? 'active' : ''}`}
              onClick={() => setFilterType('ALL')}
            >
              Tất cả
            </button>
            <button
              className={`filter-btn ${filterType === 'HocBong' ? 'active' : ''}`}
              onClick={() => setFilterType('HocBong')}
            >
              Học bổng
            </button>
            <button
              className={`filter-btn ${filterType === 'DoDung' ? 'active' : ''}`}
              onClick={() => setFilterType('DoDung')}
            >
              Đồ dùng học tập
            </button>
            <button
              className={`filter-btn ${filterType === 'CoSoVatChat' ? 'active' : ''}`}
              onClick={() => setFilterType('CoSoVatChat')}
            >
              Cơ sở vật chất
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <Loading fullScreen={false} text="Đang tải thư viện minh chứng..." />
      ) : filteredEvidences.length === 0 ? (
        <EmptyState
          icon={<FiImage size={48} />}
          title="Chưa có minh chứng nào"
          description="Hiện chưa có hình ảnh hoặc biên nhận nào thuộc danh mục này."
        />
      ) : (
        <div className="evidence-gallery-grid">
          {filteredEvidences.map((item, idx) => (
            <Card
              key={item.maMinhChung || idx}
              hoverable
              padding={false}
              className="evidence-card"
              onClick={() => handleOpenLightbox(idx)}
            >
              <div className="evidence-card-img-wrap">
                <img
                  src={item.duongDan || item.url || item.image || item}
                  alt={item.moTa || 'Minh chứng'}
                  className="evidence-card-img"
                  loading="lazy"
                />
                <div className="evidence-hover-overlay">
                  <FiEye size={24} />
                  <span>Xem chi tiết</span>
                </div>
              </div>
              <div className="evidence-card-content">
                <div className="evidence-type-tag">
                  {item.loai === 'HocBong'
                    ? 'Trao Học Bổng'
                    : item.loai === 'DoDung'
                    ? 'Trao Đồ Dùng'
                    : 'Hoạt Động Trao Tặng'}
                </div>
                <h3 className="evidence-title">
                  {item.moTa || item.tieuDe || `Minh chứng đợt phân bổ #${item.maDotPhanBo || idx + 1}`}
                </h3>
                {item.ngayTao && (
                  <div className="evidence-date">
                    <FiCalendar /> {formatDate(item.ngayTao)}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Lightbox phóng to */}
      {lightboxOpen && (
        <Lightbox
          images={lightboxImages}
          initialIndex={activeImageIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
};

export default DonationEvidence;

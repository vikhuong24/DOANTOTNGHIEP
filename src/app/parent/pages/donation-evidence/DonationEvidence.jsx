// Trang Gallery Minh chứng trao tặng cho Phụ huynh
// Kết nối trực tiếp API Backend Spring Boot: GET /parent/students & GET /parent/students/{mahocsinh}/evidences
import { useState, useEffect } from 'react';
import { getParentStudents } from '../../../../services/studentService';
import { getParentEvidences } from '../../../../services/evidenceService';
import Card from '../../../../components/Card/Card';
import Tabs from '../../../../components/Tabs/Tabs';
import Lightbox from '../../../../components/Lightbox/Lightbox';
import Loading from '../../../../components/Loading/Loading';
import EmptyState from '../../../../components/EmptyState/EmptyState';
import { formatDate } from '../../../../utils/formatters';
import { FiEye, FiImage, FiFilter, FiCalendar, FiUser, FiFileText } from 'react-icons/fi';
import './DonationEvidence.css';

const DonationEvidence = () => {
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const [loadingEvidences, setLoadingEvidences] = useState(false);
  const [evidences, setEvidences] = useState([]);
  const [error, setError] = useState(null);

  const [filterType, setFilterType] = useState('ALL');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoadingStudents(true);
        const list = await getParentStudents();
        setStudents(list || []);
        if (list && list.length > 0) {
          setSelectedStudentId(list[0].maHocSinh || list[0].mahocsinh);
        }
      } catch (err) {
        console.error('Lỗi khi tải danh sách học sinh:', err);
        setError(err?.message || 'Không thể tải danh sách học sinh thuộc quyền quản lý.');
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchStudents();
  }, []);

  const fetchEvidences = async (studentId) => {
    if (!studentId) return;
    try {
      setLoadingEvidences(true);
      setError(null);
      const list = await getParentEvidences(studentId);
      setEvidences(list || []);
    } catch (err) {
      console.error('Lỗi khi tải minh chứng:', err);
      setError(err?.message || 'Không thể tải danh sách minh chứng của học sinh.');
      setEvidences([]);
    } finally {
      setLoadingEvidences(false);
    }
  };

  useEffect(() => {
    if (selectedStudentId) {
      fetchEvidences(selectedStudentId);
    }
  }, [selectedStudentId]);

  const filteredEvidences = evidences.filter((item) => {
    if (filterType === 'ALL') return true;
    return String(item.loaiTaiLieu || '').toUpperCase() === filterType;
  });

  // Lọc các item là hình ảnh (không phải PDF) cho Lightbox
  const imageItems = filteredEvidences.filter(
    (item) => item.duongDanTep && !item.duongDanTep.toLowerCase().endsWith('.pdf')
  );

  const lightboxImages = imageItems.map((item) => ({
    src: item.duongDanTep,
    alt: item.moTa || item.tenDotPhanBo || 'Minh chứng trao tặng',
  }));

  const handleCardClick = (item) => {
    if (!item.duongDanTep) return;
    if (item.duongDanTep.toLowerCase().endsWith('.pdf')) {
      window.open(item.duongDanTep, '_blank', 'noopener,noreferrer');
      return;
    }
    const imgIdx = imageItems.findIndex((x) => x.maMinhChung === item.maMinhChung);
    setActiveImageIndex(imgIdx >= 0 ? imgIdx : 0);
    setLightboxOpen(true);
  };

  if (loadingStudents) {
    return (
      <div className="donation-evidence-page">
        <Loading fullScreen={false} text="Đang tải thông tin học sinh..." />
      </div>
    );
  }

  if (!students.length) {
    return (
      <div className="donation-evidence-page">
        <EmptyState
          icon={<FiUser size={48} />}
          title="Không tìm thấy học sinh nào"
          description="Tài khoản của bạn hiện chưa được liên kết với học sinh nào tại trường Nguyễn Đình Chiểu."
        />
      </div>
    );
  }

  const studentTabs = students.map((s) => ({
    value: s.maHocSinh || s.mahocsinh,
    label: `${s.hoTen || s.hoten} (${s.lop})`,
    icon: <FiUser />,
  }));

  return (
    <div className="donation-evidence-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Thư Viện Minh Chứng Trao Tặng</h1>
          <p className="page-subtitle">
            Toàn bộ tư liệu, hình ảnh buổi lễ trao tặng học bổng, hóa đơn và biên bản giao nhận của con em bạn
          </p>
        </div>

        {/* Bộ lọc loại tài liệu minh chứng theo LoaiTaiLieu của Backend */}
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
              className={`filter-btn ${filterType === 'HINHANH' ? 'active' : ''}`}
              onClick={() => setFilterType('HINHANH')}
            >
              Hình ảnh trao quà
            </button>
            <button
              className={`filter-btn ${filterType === 'CHUNGTU' ? 'active' : ''}`}
              onClick={() => setFilterType('CHUNGTU')}
            >
              Chứng từ / Biên bản
            </button>
            <button
              className={`filter-btn ${filterType === 'HOADON' ? 'active' : ''}`}
              onClick={() => setFilterType('HOADON')}
            >
              Hóa đơn
            </button>
          </div>
        </div>
      </div>

      {/* Tabs chọn học sinh nếu có nhiều con */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Tabs
          tabs={studentTabs}
          active={selectedStudentId}
          onChange={(val) => setSelectedStudentId(Number(val))}
        />
      </div>

      {loadingEvidences ? (
        <Loading fullScreen={false} text="Đang tải thư viện minh chứng..." />
      ) : error ? (
        <EmptyState
          icon={<FiImage size={48} />}
          title="Không thể tải minh chứng"
          description={error}
          actionLabel="Thử lại"
          onAction={() => fetchEvidences(selectedStudentId)}
        />
      ) : filteredEvidences.length === 0 ? (
        <EmptyState
          icon={<FiImage size={48} />}
          title="Chưa có minh chứng nào"
          description="Hiện chưa có hình ảnh, hóa đơn hoặc biên bản nào được đăng tải cho học sinh này trong danh mục đã chọn."
        />
      ) : (
        <div className="evidence-gallery-grid">
          {filteredEvidences.map((item, idx) => {
            const isPdf = item.duongDanTep?.toLowerCase().endsWith('.pdf');
            return (
              <Card
                key={item.maMinhChung || idx}
                hoverable
                padding={false}
                className="evidence-card"
                onClick={() => handleCardClick(item)}
              >
                <div className="evidence-card-img-wrap">
                  {isPdf ? (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        backgroundColor: '#f8f9fa',
                        color: 'var(--primary)',
                      }}
                    >
                      <FiFileText size={48} />
                      <span style={{ marginTop: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
                        Tài liệu PDF
                      </span>
                    </div>
                  ) : (
                    <img
                      src={
                        item.duongDanTep ||
                        '/images/minhchungmau.jpg'
                      }
                      alt={item.moTa || 'Minh chứng'}
                      className="evidence-card-img"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/images/minhchungmau.jpg';
                      }}
                    />
                  )}
                  <div className="evidence-hover-overlay">
                    <FiEye size={24} />
                    <span>{isPdf ? 'Mở tài liệu' : 'Xem phóng to'}</span>
                  </div>
                </div>

                <div className="evidence-card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span className="badge badge--primary" style={{ fontSize: '0.72rem' }}>
                      {item.loaiTaiLieu || 'HINHANH'}
                    </span>
                    {item.ngayTaiLen && (
                      <span style={{ fontSize: '0.75rem', color: '#888', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FiCalendar /> {formatDate(item.ngayTaiLen)}
                      </span>
                    )}
                  </div>

                  <p className="evidence-card-desc" style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                    {item.moTa || item.tenDotPhanBo || 'Minh chứng trao tặng'}
                  </p>

                  {item.tenDotPhanBo && (
                    <div style={{ fontSize: '0.8rem', color: '#555' }}>
                      Đợt: {item.tenDotPhanBo}
                    </div>
                  )}
                  {item.nguoiDang && (
                    <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '2px' }}>
                      Đăng bởi: {item.nguoiDang}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Lightbox phóng to ảnh */}
      {lightboxOpen && lightboxImages.length > 0 && (
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
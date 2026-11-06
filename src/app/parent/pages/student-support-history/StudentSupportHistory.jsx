// Trang Lịch sử nhận hỗ trợ của con em phụ huynh
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { getStudentsByParent } from '../../../../services/studentService';
import { getDistributionsByStudent } from '../../../../services/distributionService';
import Card from '../../../../components/Card/Card';
import Tabs from '../../../../components/Tabs/Tabs';
import Table from '../../../../components/Table/Table';
import Button from '../../../../components/Button/Button';
import Loading from '../../../../components/Loading/Loading';
import EmptyState from '../../../../components/EmptyState/EmptyState';
import Modal from '../../../../components/Modal/Modal';
import Lightbox from '../../../../components/Lightbox/Lightbox';
import { formatCurrency, formatDate } from '../../../../utils/formatters';
import { FiEye, FiAlertCircle, FiCheckCircle, FiUser, FiAward, FiPackage } from 'react-icons/fi';
import './StudentSupportHistory.css';

const StudentSupportHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [supportHistory, setSupportHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Modal / Lightbox xem minh chứng
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const parentId = user?.maNguoiDung || user?.id || 2;
        const res = await getStudentsByParent(parentId);
        const list = Array.isArray(res) ? res : (res?.data || []);
        setStudents(list);
        if (list && list.length > 0) {
          setSelectedStudentId(list[0].mahocsinh);
        }
      } catch (err) {
        console.error('Lỗi khi tải danh sách con em:', err);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [user]);

  useEffect(() => {
    if (!selectedStudentId) return;

    const fetchHistory = async () => {
      try {
        setHistoryLoading(true);
        const historyData = await getDistributionsByStudent(selectedStudentId);
        setSupportHistory(historyData || []);
      } catch (err) {
        console.error('Lỗi khi tải lịch sử hỗ trợ:', err);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchHistory();
  }, [selectedStudentId]);

  const currentStudent = students.find((s) => s.mahocsinh === Number(selectedStudentId));

  const handleOpenEvidence = (record) => {
    setSelectedEvidence(record);
    if (record.minhChung && record.minhChung.length > 0) {
      setLightboxImages(
        record.minhChung.map((item, idx) => ({
          src: item.duongDan || item,
          alt: `Minh chứng ${idx + 1}`,
        }))
      );
    } else {
      setLightboxImages([]);
    }
    setEvidenceModalOpen(true);
  };

  const handleReportDiscrepancy = (record) => {
    navigate(
      `/parent/feedback?studentId=${selectedStudentId}&distributionId=${record.maDotPhanBo || record.id}&note=${encodeURIComponent(
        `Báo cáo sai lệch đợt phân bổ: ${record.tenDot || record.tieuDe || 'Hỗ trợ'}`
      )}`
    );
  };

  const columns = [
    {
      key: 'maDotPhanBo',
      title: 'Mã đợt',
      width: '100px',
      render: (val, row) => `#PB${val || row.id}`,
    },
    {
      key: 'tenDot',
      title: 'Khoản hỗ trợ / Đợt phân bổ',
      render: (val, row) => (
        <div>
          <div className="font-semibold text-primary">{val || row.tieuDe || 'Hỗ trợ học sinh'}</div>
          <div className="text-muted text-sm">{row.moTa || 'Phân bổ theo kế hoạch tài trợ nhà trường'}</div>
        </div>
      ),
    },
    {
      key: 'loaiPhanBo',
      title: 'Phân loại',
      width: '140px',
      render: (val) => {
        const isScholarship = val === 'HocBong' || val === 'TienMat';
        return (
          <span className={`badge-support-type ${isScholarship ? 'type-money' : 'type-goods'}`}>
            {isScholarship ? <FiAward /> : <FiPackage />}
            {isScholarship ? 'Học bổng' : 'Đồ dùng / Hiện vật'}
          </span>
        );
      },
    },
    {
      key: 'giaTri',
      title: 'Giá trị / Số lượng',
      width: '150px',
      align: 'right',
      render: (val, row) => (
        <span className="font-bold text-success">
          {typeof val === 'number'
            ? formatCurrency(val)
            : val || (row.soLuong ? `${row.soLuong} ${row.donVi || 'suất'}` : 'Đã tiếp nhận')}
        </span>
      ),
    },
    {
      key: 'ngayNhan',
      title: 'Ngày trao nhận',
      width: '130px',
      render: (val, row) => formatDate(val || row.ngayTao || new Date().toISOString()),
    },
    {
      key: 'trangThai',
      title: 'Trạng thái',
      width: '130px',
      render: (val) => {
        const isReceived = val === 'DaNhan' || val === 'HoanThanh' || !val;
        return (
          <span className={`status-pill ${isReceived ? 'status-pill--success' : 'status-pill--warning'}`}>
            <FiCheckCircle /> {isReceived ? 'Đã nhận' : 'Đang xử lý'}
          </span>
        );
      },
    },
    {
      key: 'actions',
      title: 'Thao tác',
      width: '180px',
      render: (_, row) => (
        <div className="table-actions">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleOpenEvidence(row)}
            title="Xem hình ảnh / phiếu biên nhận"
          >
            <FiEye /> Minh chứng
          </Button>
          <button
            type="button"
            className="btn-report-link"
            onClick={() => handleReportDiscrepancy(row)}
            title="Báo cáo thông tin sai lệch"
          >
            <FiAlertCircle /> Báo sai
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return <Loading fullScreen={false} text="Đang tải thông tin học sinh..." />;
  }

  if (!students.length) {
    return (
      <div className="student-support-history-page">
        <EmptyState
          title="Không tìm thấy học sinh nào"
          description="Tài khoản của bạn hiện chưa được liên kết với học sinh nào tại trường Nguyễn Đình Chiểu. Vui lòng liên hệ ban giám hiệu để kiểm tra."
        />
      </div>
    );
  }

  const studentTabs = students.map((s) => ({
    value: s.mahocsinh,
    label: `${s.hoten} (${s.lop})`,
    icon: <FiUser />,
  }));

  return (
    <div className="student-support-history-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Lịch Sử Nhận Hỗ Trợ & Học Bổng</h1>
          <p className="page-subtitle">
            Theo dõi minh bạch toàn bộ các khoản học bổng, đồ dùng và hỗ trợ đã được trao cho các con
          </p>
        </div>
      </div>

      {/* Tabs chọn từng con em */}
      <div className="student-selector-tabs">
        <Tabs
          tabs={studentTabs}
          active={selectedStudentId}
          onChange={(newVal) => setSelectedStudentId(Number(newVal))}
        />
      </div>

      {currentStudent && (
        <Card className="student-info-summary">
          <div className="student-summary-grid">
            <div className="summary-col">
              <span className="summary-label">Họ và tên học sinh:</span>
              <span className="summary-value font-bold">{currentStudent.hoten}</span>
            </div>
            <div className="summary-col">
              <span className="summary-label">Lớp:</span>
              <span className="summary-value">{currentStudent.lop}</span>
            </div>
            <div className="summary-col">
              <span className="summary-label">Loại hỗ trợ / Tình trạng:</span>
              <span className="summary-badge">{currentStudent.loaihotro}</span>
            </div>
            <div className="summary-col">
              <span className="summary-label">Ngày sinh:</span>
              <span className="summary-value">{formatDate(currentStudent.ngaysinh)}</span>
            </div>
          </div>
          {currentStudent.mota && (
            <div className="student-summary-note">
              <strong>Ghi chú hoàn cảnh: </strong> {currentStudent.mota}
            </div>
          )}
        </Card>
      )}

      {/* Danh sách các lần nhận hỗ trợ */}
      <Card title="Danh sách các đợt hỗ trợ đã trao" className="history-table-card">
        {historyLoading ? (
          <Loading rows={4} type="skeleton" />
        ) : (
          <Table
            columns={columns}
            data={supportHistory}
            rowKey="maDotPhanBo"
            emptyTitle="Chưa có dữ liệu nhận hỗ trợ"
            emptyDescription="Học sinh chưa có đợt phân bổ học bổng hoặc đồ dùng nào được ghi nhận trong hệ thống."
          />
        )}
      </Card>

      {/* Modal xem chi tiết minh chứng */}
      <Modal
        isOpen={evidenceModalOpen}
        onClose={() => setEvidenceModalOpen(false)}
        title={`Minh chứng trao hỗ trợ: ${selectedEvidence?.tenDot || 'Đợt phân bổ'}`}
        size="md"
        footer={
          <div className="modal-buttons">
            {lightboxImages.length > 0 && (
              <Button
                variant="primary"
                onClick={() => {
                  setLightboxOpen(true);
                  setEvidenceModalOpen(false);
                }}
              >
                Phóng to toàn màn hình
              </Button>
            )}
            <Button variant="outline" onClick={() => setEvidenceModalOpen(false)}>
              Đóng
            </Button>
          </div>
        }
      >
        {selectedEvidence && (
          <div className="evidence-detail-view">
            <div className="evidence-info-row">
              <span className="evidence-label">Nội dung trao tặng:</span>
              <span className="evidence-value">{selectedEvidence.tenDot || 'Khoản hỗ trợ học sinh'}</span>
            </div>
            <div className="evidence-info-row">
              <span className="evidence-label">Giá trị tiếp nhận:</span>
              <span className="evidence-value font-bold text-success">
                {typeof selectedEvidence.giaTri === 'number'
                  ? formatCurrency(selectedEvidence.giaTri)
                  : selectedEvidence.giaTri || 'Hiện vật / Đồ dùng'}
              </span>
            </div>
            <div className="evidence-info-row">
              <span className="evidence-label">Ngày trao:</span>
              <span className="evidence-value">
                {formatDate(selectedEvidence.ngayNhan || selectedEvidence.ngayTao || new Date().toISOString())}
              </span>
            </div>

            <div className="evidence-images-section">
              <h4 className="evidence-section-title">Hình ảnh & Phiếu ký nhận:</h4>
              {lightboxImages.length > 0 ? (
                <div className="evidence-thumbnails-grid">
                  {lightboxImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="evidence-thumb-wrap"
                      onClick={() => {
                        setLightboxOpen(true);
                        setEvidenceModalOpen(false);
                      }}
                    >
                      <img src={img.src} alt={img.alt} className="evidence-thumb-img" />
                      <span className="evidence-thumb-zoom">
                        <FiEye /> Nhấp để phóng to
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="evidence-no-img">
                  <p>Minh chứng đã được ban giám hiệu xác thực trực tiếp tại trường.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Lightbox phóng to */}
      {lightboxOpen && (
        <Lightbox
          images={lightboxImages}
          initialIndex={0}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
};

export default StudentSupportHistory;

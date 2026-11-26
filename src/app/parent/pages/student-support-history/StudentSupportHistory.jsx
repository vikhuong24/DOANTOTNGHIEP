// Trang Lịch sử nhận hỗ trợ của con em phụ huynh
// Kết nối trực tiếp API Backend Spring Boot: GET /parent/students, GET /parent/students/{mahocsinh}/history, GET /parent/students/{mahocsinh}/evidences
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getParentStudents, getStudentSupportHistory } from '../../../../services/studentService';
import { getParentEvidences } from '../../../../services/evidenceService';
import Card from '../../../../components/Card/Card';
import Tabs from '../../../../components/Tabs/Tabs';
import Table from '../../../../components/Table/Table';
import Button from '../../../../components/Button/Button';
import Loading from '../../../../components/Loading/Loading';
import EmptyState from '../../../../components/EmptyState/EmptyState';
import Modal from '../../../../components/Modal/Modal';
import Lightbox from '../../../../components/Lightbox/Lightbox';
import { useNotification } from '../../../../components/Notification/Notification';
import { formatCurrency, formatDate } from '../../../../utils/formatters';
import { FiEye, FiAlertCircle, FiCheckCircle, FiUser, FiClock, FiFileText } from 'react-icons/fi';
import './StudentSupportHistory.css';

const StudentSupportHistory = () => {
  const navigate = useNavigate();
  const { addToast } = useNotification();

  const [loading, setLoading] = useState(true);
  const [studentsError, setStudentsError] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const [supportHistory, setSupportHistory] = useState([]);
  const [studentEvidences, setStudentEvidences] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);

  // Modal / Lightbox xem minh chứng
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [selectedEvidenceRecord, setSelectedEvidenceRecord] = useState(null);
  const [modalEvidences, setModalEvidences] = useState([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setStudentsError(null);
      const list = await getParentStudents();
      setStudents(list || []);
      if (list && list.length > 0) {
        setSelectedStudentId(list[0].maHocSinh || list[0].mahocsinh);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách con em:', err);
      setStudentsError(err?.message || 'Không thể tải danh sách học sinh thuộc quyền quản lý.');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudentDetails = async (studentId) => {
    if (!studentId) return;
    try {
      setHistoryLoading(true);
      setHistoryError(null);
      const [historyData, evidencesData] = await Promise.all([
        getStudentSupportHistory(studentId),
        getParentEvidences(studentId).catch(() => []),
      ]);
      setSupportHistory(historyData || []);
      setStudentEvidences(evidencesData || []);
    } catch (err) {
      console.error('Lỗi khi tải lịch sử hỗ trợ:', err);
      const msg = err?.message || 'Không thể tải lịch sử hỗ trợ của học sinh.';
      setHistoryError(msg);
      setSupportHistory([]);
      addToast(msg, 'error');
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (selectedStudentId) {
      fetchStudentDetails(selectedStudentId);
    }
  }, [selectedStudentId]);

  const currentStudent = students.find(
    (s) => Number(s.maHocSinh || s.mahocsinh) === Number(selectedStudentId)
  );

  const handleOpenEvidence = (record) => {
    setSelectedEvidenceRecord(record);
    // Lọc các minh chứng thuộc đợt phân bổ này của học sinh
    const matched = studentEvidences.filter(
      (ev) => ev.maDotPhanBo && Number(ev.maDotPhanBo) === Number(record.maDotPhanBo)
    );
    setModalEvidences(matched);

    const imgs = matched
      .filter((item) => item.duongDanTep && !item.duongDanTep.toLowerCase().endsWith('.pdf'))
      .map((item, idx) => ({
        src: item.duongDanTep,
        alt: item.moTa || `Minh chứng ${idx + 1}`,
      }));
    setLightboxImages(imgs);
    setEvidenceModalOpen(true);
  };

  const handleReportDiscrepancy = (record) => {
    const params = new URLSearchParams({
      studentId: String(selectedStudentId),
      distributionId: String(record.maDotPhanBo || ''),
      note: `Báo cáo sai lệch đợt phân bổ: ${record.tenDotPhanBo || 'Hỗ trợ'}`,
    });
    if (record.maBaiTaiTro) {
      params.set('campaignId', String(record.maBaiTaiTro));
    }
    navigate(`/parent/feedback?${params.toString()}`);
  };

  const getStatusBadge = (status) => {
    const s = String(status || '').toUpperCase();
    if (s === 'DATRAO') {
      return (
        <span className="status-pill status-pill--success">
          <FiCheckCircle /> Đã trao
        </span>
      );
    }
    if (s === 'DADUYET') {
      return (
        <span className="status-pill status-pill--primary">
          <FiCheckCircle /> Đã duyệt
        </span>
      );
    }
    return (
      <span className="status-pill status-pill--warning">
        <FiClock /> Chờ duyệt
      </span>
    );
  };

  const columns = [
    {
      key: 'maDotPhanBo',
      title: 'Mã đợt',
      width: '90px',
      render: (val, row) => `#PB${val || row.maChiTietPhanBo}`,
    },
    {
      key: 'tenDotPhanBo',
      title: 'Khoản hỗ trợ / Đợt phân bổ',
      render: (val, row) => (
        <div>
          <div className="font-semibold text-primary">{val || 'Đợt phân bổ hỗ trợ'}</div>
          {row.tieuDeBaiTaiTro && (
            <div className="text-muted text-sm">Chiến dịch: {row.tieuDeBaiTaiTro}</div>
          )}
          {row.ghiChu && <div className="text-muted text-sm">Ghi chú: {row.ghiChu}</div>}
        </div>
      ),
    },
    {
      key: 'nguoiNhan',
      title: 'Người đại diện nhận',
      width: '160px',
      render: (val) => val || <span className="text-muted">—</span>,
    },
    {
      key: 'soTien',
      title: 'Số tiền hỗ trợ',
      width: '140px',
      align: 'right',
      render: (val) => (
        <span className="font-bold text-success">{formatCurrency(val || 0)}</span>
      ),
    },
    {
      key: 'ngayNhan',
      title: 'Ngày trao nhận',
      width: '130px',
      render: (val, row) => (val || row.ngayTrao ? formatDate(val || row.ngayTrao) : '—'),
    },
    {
      key: 'trangThaiDotPhanBo',
      title: 'Trạng thái',
      width: '130px',
      render: (val) => getStatusBadge(val),
    },
    {
      key: 'actions',
      title: 'Thao tác',
      width: '185px',
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

  if (studentsError) {
    return (
      <div className="student-support-history-page">
        <EmptyState
          title="Không thể tải dữ liệu học sinh"
          description={studentsError}
          actionLabel="Thử lại"
          onAction={fetchStudents}
        />
      </div>
    );
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
    value: s.maHocSinh || s.mahocsinh,
    label: `${s.hoTen || s.hoten} (${s.lop})`,
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
              <span className="summary-value font-bold">{currentStudent.hoTen || currentStudent.hoten}</span>
            </div>
            <div className="summary-col">
              <span className="summary-label">Lớp / Giới tính:</span>
              <span className="summary-value">
                {currentStudent.lop} • {currentStudent.gioiTinh === 'NU' ? 'Nữ' : 'Nam'}
              </span>
            </div>
            <div className="summary-col">
              <span className="summary-label">Loại hỗ trợ / Tình trạng:</span>
              <span className="summary-badge">{currentStudent.loaiHoTro || currentStudent.loaihotro || 'Hỗ trợ đặc biệt'}</span>
            </div>
            <div className="summary-col">
              <span className="summary-label">Ngày sinh:</span>
              <span className="summary-value">
                {currentStudent.ngaySinh ? formatDate(currentStudent.ngaySinh) : '—'}
              </span>
            </div>
          </div>
          {(currentStudent.moTa || currentStudent.mota) && (
            <div className="student-summary-note">
              <strong>Hoàn cảnh / Mô tả: </strong> {currentStudent.moTa || currentStudent.mota}
            </div>
          )}
        </Card>
      )}

      {/* Danh sách các lần nhận hỗ trợ */}
      <Card title="Danh sách các đợt hỗ trợ đã trao" className="history-table-card">
        {historyLoading ? (
          <Loading rows={4} type="skeleton" />
        ) : historyError ? (
          <EmptyState
            title="Lỗi tải lịch sử hỗ trợ"
            description={historyError}
            actionLabel="Thử lại"
            onAction={() => fetchStudentDetails(selectedStudentId)}
          />
        ) : (
          <Table
            columns={columns}
            data={supportHistory}
            rowKey="maChiTietPhanBo"
            emptyTitle="Chưa có dữ liệu nhận hỗ trợ"
            emptyDescription="Học sinh chưa có đợt phân bổ học bổng hoặc quà tặng nào được ghi nhận trong hệ thống."
          />
        )}
      </Card>

      {/* Modal xem chi tiết minh chứng */}
      <Modal
        isOpen={evidenceModalOpen}
        onClose={() => setEvidenceModalOpen(false)}
        title={`Minh chứng trao hỗ trợ: ${selectedEvidenceRecord?.tenDotPhanBo || 'Đợt phân bổ'}`}
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
                Phóng to hình ảnh
              </Button>
            )}
            <Button variant="outline" onClick={() => setEvidenceModalOpen(false)}>
              Đóng
            </Button>
          </div>
        }
      >
        {selectedEvidenceRecord && (
          <div className="evidence-detail-view">
            <div className="evidence-info-row">
              <span className="evidence-label">Đợt phân bổ:</span>
              <span className="evidence-value">{selectedEvidenceRecord.tenDotPhanBo || 'Khoản hỗ trợ học sinh'}</span>
            </div>
            <div className="evidence-info-row">
              <span className="evidence-label">Số tiền tiếp nhận:</span>
              <span className="evidence-value font-bold text-success">
                {formatCurrency(selectedEvidenceRecord.soTien || 0)}
              </span>
            </div>
            <div className="evidence-info-row">
              <span className="evidence-label">Người nhận:</span>
              <span className="evidence-value">{selectedEvidenceRecord.nguoiNhan || '—'}</span>
            </div>
            <div className="evidence-info-row">
              <span className="evidence-label">Ngày trao:</span>
              <span className="evidence-value">
                {selectedEvidenceRecord.ngayNhan || selectedEvidenceRecord.ngayTrao
                  ? formatDate(selectedEvidenceRecord.ngayNhan || selectedEvidenceRecord.ngayTrao)
                  : '—'}
              </span>
            </div>

            <div className="evidence-images-section">
              <h4 className="evidence-section-title">
                Hình ảnh & Chứng từ ({modalEvidences.length}):
              </h4>
              {modalEvidences.length > 0 ? (
                <div className="evidence-thumbnails-grid">
                  {modalEvidences.map((evi, idx) => {
                    const isPdf = evi.duongDanTep?.toLowerCase().endsWith('.pdf');
                    return (
                      <div
                        key={evi.maMinhChung || idx}
                        className="evidence-thumb-wrap"
                        onClick={() => {
                          if (isPdf) {
                            window.open(evi.duongDanTep, '_blank', 'noopener,noreferrer');
                          } else {
                            setLightboxOpen(true);
                            setEvidenceModalOpen(false);
                          }
                        }}
                      >
                        {isPdf ? (
                          <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--primary)' }}>
                            <FiFileText size={32} />
                            <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                              {evi.moTa || 'Xem tệp PDF'}
                            </div>
                          </div>
                        ) : (
                          <>
                            <img
                              src={evi.duongDanTep || '/images/minhchungmau.jpg'}
                              alt={evi.moTa || 'Minh chứng'}
                              className="evidence-thumb-img"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/images/minhchungmau.jpg';
                              }}
                            />
                            <span className="evidence-thumb-zoom">
                              <FiEye /> Nhấp để phóng to
                            </span>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="evidence-no-img">
                  <p>Chưa có tệp hình ảnh minh chứng đính kèm cho đợt phân bổ này.</p>
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
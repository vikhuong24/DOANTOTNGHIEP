// Trang Gửi và Theo dõi phản hồi sai lệch cho Phụ huynh
// Kết nối trực tiếp API Backend Spring Boot: GET /parent/feedbacks & POST /parent/feedbacks
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getParentStudents } from '../../../../services/studentService';
import { getParentFeedbacks, createParentFeedback } from '../../../../services/feedbackService';
import Card from '../../../../components/Card/Card';
import Input from '../../../../components/Input/Input';
import Button from '../../../../components/Button/Button';
import Loading from '../../../../components/Loading/Loading';
import EmptyState from '../../../../components/EmptyState/EmptyState';
import { useNotification } from '../../../../components/Notification/Notification';
import { formatDate } from '../../../../utils/formatters';
import { FiSend, FiMessageSquare, FiClock, FiCheckCircle, FiAlertCircle, FiXCircle } from 'react-icons/fi';
import './Feedback.css';

const REASON_OPTIONS = [
  'Chưa nhận được khoản hỗ trợ theo danh sách công bố',
  'Số tiền hoặc hiện vật thực nhận không đúng với thông báo',
  'Sai thông tin họ tên, lớp hoặc tình trạng khuyết tật của con',
  'Đồ dùng học tập bị hư hỏng hoặc không phù hợp nhu cầu',
  'Ý kiến đóng góp khác',
];

const Feedback = () => {
  const [searchParams] = useSearchParams();
  const { addToast } = useNotification();

  const [students, setStudents] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const initialStudentId = searchParams.get('studentId') || '';
  const initialDistributionId = searchParams.get('distributionId') || '';
  const initialCampaignId = searchParams.get('campaignId') || '';
  const initialNote = searchParams.get('note') || '';

  const [formData, setFormData] = useState({
    maHocSinh: initialStudentId,
    maDotPhanBo: initialDistributionId,
    maBaiTaiTro: initialCampaignId,
    lyDo: REASON_OPTIONS[0],
    tieuDe: initialNote ? `Phản hồi: ${initialNote}`.slice(0, 255) : '',
    noiDung: '',
  });

  const [errors, setErrors] = useState({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentList, fbList] = await Promise.all([
        getParentStudents().catch(() => []),
        getParentFeedbacks(),
      ]);
      setStudents(studentList || []);
      setFeedbacks(fbList || []);

      if (!formData.maHocSinh && studentList && studentList.length > 0) {
        setFormData((prev) => ({
          ...prev,
          maHocSinh: studentList[0].maHocSinh || studentList[0].mahocsinh,
        }));
      }
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu phản hồi:', err);
      addToast(err?.message || 'Không thể tải danh sách phản hồi từ máy chủ', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    const titleTrimmed = formData.tieuDe.trim();
    const contentTrimmed = formData.noiDung.trim();

    if (!titleTrimmed) {
      newErrors.tieuDe = 'Vui lòng nhập tiêu đề phản ánh';
    } else if (titleTrimmed.length < 5) {
      newErrors.tieuDe = 'Tiêu đề phản ánh phải từ 5 ký tự trở lên';
    } else if (titleTrimmed.length > 255) {
      newErrors.tieuDe = 'Tiêu đề phản ánh không vượt quá 255 ký tự';
    }

    if (!contentTrimmed) {
      newErrors.noiDung = 'Vui lòng mô tả chi tiết sự việc hoặc thắc mắc';
    } else if (contentTrimmed.length < 10) {
      newErrors.noiDung = 'Nội dung phản ánh phải có tối thiểu 10 ký tự';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSubmitting(true);
      const studentObj = students.find(
        (s) => Number(s.maHocSinh || s.mahocsinh) === Number(formData.maHocSinh)
      );
      const studentLabel = studentObj
        ? `[Học sinh: ${studentObj.hoTen || studentObj.hoten} - Lớp: ${studentObj.lop}] `
        : '';
      const fullContent = `${studentLabel}[Vấn đề: ${formData.lyDo}]\n\n${contentTrimmed}`.slice(0, 2000);

      const payload = {
        maBaiTaiTro: formData.maBaiTaiTro ? Number(formData.maBaiTaiTro) : null,
        maDotPhanBo: formData.maDotPhanBo ? Number(formData.maDotPhanBo) : null,
        tieuDe: titleTrimmed,
        noiDung: fullContent,
      };

      const res = await createParentFeedback(payload);
      addToast('Phản ánh của bạn đã được gửi thành công đến Nhà trường', 'success');
      setFeedbacks((prev) => [res, ...prev]);
      setFormData({
        maHocSinh: students[0]?.maHocSinh || students[0]?.mahocsinh || '',
        maDotPhanBo: '',
        maBaiTaiTro: '',
        lyDo: REASON_OPTIONS[0],
        tieuDe: '',
        noiDung: '',
      });
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Không thể gửi phản ánh, vui lòng thử lại sau';
      addToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStatusBadge = (status) => {
    const s = String(status || '').toUpperCase();
    if (s === 'DAXULY' || s === 'DAGIAIQUYET' || s === 'DAPHANHOI') {
      return (
        <span className="badge-status badge-success">
          <FiCheckCircle /> Đã phản hồi
        </span>
      );
    }
    if (s === 'TUCHOI') {
      return (
        <span className="badge-status badge-danger">
          <FiXCircle /> Không tiếp nhận
        </span>
      );
    }
    return (
      <span className="badge-status badge-pending">
        <FiClock /> Đang xử lý
      </span>
    );
  };

  if (loading) {
    return <Loading text="Đang tải dữ liệu phản ánh..." />;
  }

  return (
    <div className="parent-feedback-page">
      <div className="page-header">
        <h1 className="page-title">Phản Hồi & Báo Cáo Sai Lệch</h1>
        <p className="page-subtitle">
          Trực tiếp gửi ý kiến hoặc phản ánh đến Cán bộ gây quỹ và Ban Giám hiệu nếu có sai lệch về thông tin hỗ trợ
        </p>
      </div>

      <div className="feedback-layout-grid">
        {/* Form gửi phản hồi */}
        <div className="feedback-form-col">
          <Card title="Gửi phản ánh mới">
            <form onSubmit={handleSubmit} className="feedback-form" noValidate>
              {students.length > 0 && (
                <div className="input-wrap">
                  <label className="input-label" htmlFor="maHocSinh">
                    Chọn học sinh liên quan <span className="input-required">*</span>
                  </label>
                  <div className="input-field-wrap">
                    <select
                      id="maHocSinh"
                      name="maHocSinh"
                      className="input-field"
                      value={formData.maHocSinh}
                      onChange={handleChange}
                    >
                      {students.map((st) => {
                        const stId = st.maHocSinh || st.mahocsinh;
                        return (
                          <option key={stId} value={stId}>
                            {st.hoTen || st.hoten} - {st.lop} ({st.loaiHoTro || st.loaihotro || 'Học sinh'})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              )}

              <div className="input-wrap">
                <label className="input-label" htmlFor="lyDo">
                  Vấn đề cần phản ánh <span className="input-required">*</span>
                </label>
                <div className="input-field-wrap">
                  <select
                    id="lyDo"
                    name="lyDo"
                    className="input-field"
                    value={formData.lyDo}
                    onChange={handleChange}
                  >
                    {REASON_OPTIONS.map((opt, idx) => (
                      <option key={idx} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Input
                label="Tiêu đề phản ánh"
                name="tieuDe"
                value={formData.tieuDe}
                onChange={handleChange}
                placeholder="Ví dụ: Chưa nhận tiền học bổng Đợt 1 / Sai số tiền thực tế..."
                error={errors.tieuDe}
                required
                helpText="Từ 5 đến 255 ký tự"
              />

              <Input
                type="textarea"
                rows={5}
                label="Nội dung mô tả chi tiết"
                name="noiDung"
                value={formData.noiDung}
                onChange={handleChange}
                placeholder="Mô tả cụ thể sự việc, ngày nhận, số tiền hoặc đồ dùng thực tế đã nhận được so với thông báo..."
                error={errors.noiDung}
                required
                helpText="Tối thiểu 10 ký tự"
              />

              <div className="form-submit-row">
                <Button
                  type="submit"
                  variant="primary"
                  loading={submitting}
                  size="md"
                >
                  <FiSend /> Gửi phản ánh đến nhà trường
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Lịch sử phản hồi đã gửi */}
        <div className="feedback-history-col">
          <Card title={`Phản hồi đã gửi gần đây (${feedbacks.length})`}>
            {feedbacks.length === 0 ? (
              <EmptyState
                icon={<FiMessageSquare size={40} />}
                title="Chưa có phản hồi nào"
                description="Bạn chưa gửi phản ánh hay yêu cầu hỗ trợ nào trong hệ thống."
              />
            ) : (
              <div className="feedback-cards-list">
                {feedbacks.map((item, idx) => {
                  const replyContent = item.noiDungTraLoi || item.noidungtraloi || item.traLoi;
                  return (
                    <div key={item.maPhanHoi || idx} className="feedback-item-card">
                      <div className="feedback-item-header">
                        <div>
                          <span className="feedback-item-title">{item.tieuDe || 'Phản ánh thông tin'}</span>
                          {(item.tenDotPhanBo || item.tieuDeBaiTaiTro) && (
                            <div style={{ fontSize: '0.78rem', color: 'var(--primary)', marginTop: '2px' }}>
                              {item.tenDotPhanBo ? `Đợt: ${item.tenDotPhanBo}` : ''}
                              {item.tenDotPhanBo && item.tieuDeBaiTaiTro ? ' • ' : ''}
                              {item.tieuDeBaiTaiTro ? `Chiến dịch: ${item.tieuDeBaiTaiTro}` : ''}
                            </div>
                          )}
                        </div>
                        {renderStatusBadge(item.trangThai)}
                      </div>

                      <p className="feedback-item-desc" style={{ whiteSpace: 'pre-line' }}>
                        {item.noiDung}
                      </p>

                      <div className="feedback-item-date">
                        Gửi lúc: {item.ngayGui ? formatDate(item.ngayGui) : '—'}
                      </div>

                      {replyContent && (
                        <div className="feedback-reply-box">
                          <div className="reply-author">
                            <FiAlertCircle />{' '}
                            <strong>
                              {item.tenCanBoTraLoi
                                ? `Cán bộ ${item.tenCanBoTraLoi} trả lời:`
                                : 'Phản hồi từ Nhà trường:'}
                            </strong>
                            {item.ngayTraLoi && (
                              <span style={{ marginLeft: '8px', fontSize: '0.75rem', color: '#888' }}>
                                ({formatDate(item.ngayTraLoi)})
                              </span>
                            )}
                          </div>
                          <p className="reply-content">{replyContent}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
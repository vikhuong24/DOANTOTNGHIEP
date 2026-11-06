// Trang Gửi và Theo dõi phản hồi sai lệch cho Phụ huynh
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { getStudentsByParent } from '../../../../services/studentService';
import { getFeedbacksByUser, createFeedback } from '../../../../services/feedbackService';
import Card from '../../../../components/Card/Card';
import Input from '../../../../components/Input/Input';
import Button from '../../../../components/Button/Button';
import Loading from '../../../../components/Loading/Loading';
import EmptyState from '../../../../components/EmptyState/EmptyState';
import { useNotification } from '../../../../components/Notification/Notification';
import { formatDate } from '../../../../utils/formatters';
import { FiSend, FiMessageSquare, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import './Feedback.css';

const REASON_OPTIONS = [
  'Chưa nhận được khoản hỗ trợ theo danh sách công bố',
  'Số tiền hoặc hiện vật thực nhận không đúng với thông báo',
  'Sai thông tin họ tên, lớp hoặc tình trạng khuyết tật của con',
  'Đồ dùng học tập bị hư hỏng hoặc không phù hợp nhu cầu',
  'Ý kiến đóng góp khác',
];

const Feedback = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const { addToast } = useNotification();

  const [students, setStudents] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const initialStudentId = searchParams.get('studentId') || '';
  const initialNote = searchParams.get('note') || '';

  const [formData, setFormData] = useState({
    maHocSinh: initialStudentId,
    lyDo: REASON_OPTIONS[0],
    tieuDe: initialNote ? `Phản hồi: ${initialNote}` : '',
    noiDung: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const parentId = user?.maNguoiDung || 2;
        const [studentList, fbList] = await Promise.all([
          getStudentsByParent(parentId),
          getFeedbacksByUser(parentId),
        ]);
        setStudents(studentList || []);
        setFeedbacks(fbList?.data || fbList || []);

        if (!formData.maHocSinh && studentList && studentList.length > 0) {
          setFormData((prev) => ({ ...prev, maHocSinh: studentList[0].mahocsinh }));
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu phản hồi:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.tieuDe.trim()) newErrors.tieuDe = 'Vui lòng nhập tiêu đề phản ánh';
    if (!formData.noiDung.trim()) newErrors.noiDung = 'Vui lòng mô tả chi tiết sự việc hoặc thắc mắc';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSubmitting(true);
      const studentObj = students.find((s) => s.mahocsinh === Number(formData.maHocSinh));
      const payload = {
        maNguoiDung: user?.maNguoiDung || 2,
        tenNguoiGui: user?.hoten || 'Phụ huynh học sinh',
        tieuDe: formData.tieuDe,
        noiDung: `[Học sinh: ${studentObj?.hoten || 'N/A'} - Lớp: ${studentObj?.lop || 'N/A'}] [Lý do: ${formData.lyDo}] \n\n${formData.noiDung}`,
        loaiNguoiDung: 'PH',
        ngayGui: new Date().toISOString(),
        trangThai: 'ChoXuLy',
      };

      const res = await createFeedback(payload);
      addToast('Phản ánh của bạn đã được gửi thành công đến Nhà trường', 'success');
      setFeedbacks((prev) => [res, ...prev]);
      setFormData({
        maHocSinh: students[0]?.mahocsinh || '',
        lyDo: REASON_OPTIONS[0],
        tieuDe: '',
        noiDung: '',
      });
    } catch (err) {
      addToast(err.message || 'Không thể gửi phản ánh, vui lòng thử lại sau', 'error');
    } finally {
      setSubmitting(false);
    }
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
            <form onSubmit={handleSubmit} className="feedback-form">
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
                    {students.map((st) => (
                      <option key={st.mahocsinh} value={st.mahocsinh}>
                        {st.hoten} - Lớp {st.lop} ({st.loaihotro})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

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
          <Card title="Phản hồi đã gửi gần đây">
            {feedbacks.length === 0 ? (
              <EmptyState
                icon={<FiMessageSquare size={40} />}
                title="Chưa có phản hồi nào"
                description="Bạn chưa gửi phản ánh hay yêu cầu hỗ trợ nào trong hệ thống."
              />
            ) : (
              <div className="feedback-cards-list">
                {feedbacks.map((item, idx) => (
                  <div key={item.maPhanHoi || idx} className="feedback-item-card">
                    <div className="feedback-item-header">
                      <span className="feedback-item-title">{item.tieuDe || 'Phản ánh thông tin'}</span>
                      <span
                        className={`badge-status ${
                          item.trangThai === 'DaGiaiQuyet' || item.trangThai === 'DaPhanHoi'
                            ? 'badge-success'
                            : 'badge-pending'
                        }`}
                      >
                        {item.trangThai === 'DaGiaiQuyet' || item.trangThai === 'DaPhanHoi' ? (
                          <>
                            <FiCheckCircle /> Đã phản hồi
                          </>
                        ) : (
                          <>
                            <FiClock /> Đang xử lý
                          </>
                        )}
                      </span>
                    </div>

                    <p className="feedback-item-desc">{item.noiDung}</p>

                    <div className="feedback-item-date">
                      Gửi lúc: {formatDate(item.ngayGui || new Date().toISOString())}
                    </div>

                    {item.traLoi && (
                      <div className="feedback-reply-box">
                        <div className="reply-author">
                          <FiAlertCircle /> <strong>Phản hồi từ Nhà trường:</strong>
                        </div>
                        <p className="reply-content">{item.traLoi}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Feedback;

// Feedback: Gửi phản hồi / khiếu nại và theo dõi giải đáp từ cán bộ quản lý
// Kết nối trực tiếp API Backend Spring Boot: GET /donor/feedbacks & POST /donor/feedbacks
import { useState, useEffect } from 'react';
import { FiSend, FiMessageCircle, FiCheckCircle, FiClock, FiHelpCircle } from 'react-icons/fi';
import Input from '../../../../components/Input/Input';
import Button from '../../../../components/Button/Button';
import Loading from '../../../../components/Loading/Loading';
import EmptyState from '../../../../components/EmptyState/EmptyState';
import { useAuth } from '../../../../contexts/AuthContext';
import { useNotification } from '../../../../components/Notification/Notification';
import { getAllCampaigns } from '../../../../services/campaignService';
import { getDonorFeedbacks, sendDonorFeedback } from '../../../../services/feedbackService';
import { formatDate } from '../../../../utils/formatDate';
import { validateRequired } from '../../../../utils/validators';
import './Feedback.css';

const Feedback = () => {
  const { user } = useAuth();
  const { addToast } = useNotification();

  const [campaigns, setCampaigns] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [errors, setErrors] = useState({});

  const loadData = async () => {
    try {
      setLoading(true);
      const [campsRes, fbsRes] = await Promise.all([
        getAllCampaigns({ size: 100 }),
        getDonorFeedbacks(),
      ]);
      setCampaigns(campsRes.data || []);
      setFeedbacks(fbsRes || []);
    } catch (err) {
      console.error('Lỗi tải dữ liệu phản hồi:', err);
      addToast('Không thể tải lịch sử phản hồi từ máy chủ', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const validateForm = () => {
    const errs = {};

    const titleErr = validateRequired(title, 'Tiêu đề phản hồi');
    if (titleErr) {
      errs.title = titleErr;
    } else if (title.trim().length < 5) {
      errs.title = 'Tiêu đề phản hồi phải có tối thiểu 5 ký tự';
    } else if (title.trim().length > 255) {
      errs.title = 'Tiêu đề không được vượt quá 255 ký tự';
    }

    const contentErr = validateRequired(content, 'Nội dung phản hồi');
    if (contentErr) {
      errs.content = contentErr;
    } else if (content.trim().length < 10) {
      errs.content = 'Nội dung phản hồi phải có tối thiểu 10 ký tự';
    } else if (content.trim().length > 2000) {
      errs.content = 'Nội dung phản hồi không được vượt quá 2,000 ký tự';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await sendDonorFeedback({
        maBaiTaiTro: selectedCampaign ? Number(selectedCampaign) : null,
        tieuDe: title.trim(),
        noiDung: content.trim(),
      });

      addToast('Gửi ý kiến phản hồi thành công! Cán bộ quản lý nhà trường sẽ sớm giải đáp.', 'success');
      setTitle('');
      setContent('');
      setSelectedCampaign('');
      setErrors({});
      // Tải lại danh sách phản hồi
      loadData();
    } catch (err) {
      console.error('Lỗi khi gửi phản hồi:', err);
      const errMsg = err?.response?.data?.message || err?.message || 'Không thể gửi phản hồi. Vui lòng thử lại!';
      addToast(errMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = String(status || '').toUpperCase();
    if (s === 'DATRALOI' || s === 'DAXULY') {
      return (
        <span className="badge badge--success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <FiCheckCircle /> Đã có giải đáp
        </span>
      );
    }
    return (
      <span className="badge badge--warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        <FiClock /> Đang xử lý
      </span>
    );
  };

  return (
    <div className="feedback-page">
      <div className="feedback-header">
        <h1>Phản hồi & Thắc mắc</h1>
        <p>Gửi câu hỏi, đề xuất hoặc phản ánh liên quan đến hoạt động tài trợ, tiếp nhận và chứng từ minh chứng giải ngân.</p>
      </div>

      <div className="feedback-layout">
        {/* Form gửi phản hồi mới */}
        <div className="feedback-form-card">
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiHelpCircle /> Gửi thắc mắc hoặc ý kiến đóng góp
          </h2>

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="input-wrap">
              <label className="input-label">Chiến dịch gây quỹ liên quan (Tùy chọn)</label>
              <select
                className="input-field"
                value={selectedCampaign}
                onChange={(e) => setSelectedCampaign(e.target.value)}
              >
                <option value="">-- Vấn đề chung về công tác gây quỹ của trường --</option>
                {campaigns.map((c) => (
                  <option key={c.maBaiTaiTro} value={c.maBaiTaiTro}>
                    {c.tieuDe || c.tieude}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Tiêu đề phản hồi"
              placeholder="VD: Cần hỗ trợ xuất giấy xác nhận đóng góp tài trợ..."
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
              }}
              error={errors.title}
              required
              helpText="Từ 5 đến 255 ký tự"
            />

            <Input
              label="Nội dung phản ánh chi tiết"
              type="textarea"
              rows={5}
              placeholder="Nhập chi tiết câu hỏi, thắc mắc hoặc thông điệp phản hồi của bạn tới nhà trường..."
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (errors.content) setErrors((prev) => ({ ...prev, content: null }));
              }}
              error={errors.content}
              required
              helpText="Từ 10 đến 2,000 ký tự"
            />

            <div style={{ marginTop: '0.5rem' }}>
              <Button type="submit" variant="primary" fullWidth loading={submitting}>
                <FiSend /> Gửi phản hồi đến nhà trường
              </Button>
            </div>
          </form>
        </div>

        {/* Danh sách phản hồi đã gửi */}
        <div className="feedback-list-card">
          <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Lịch sử phản hồi của bạn ({feedbacks.length})</h2>

          {loading ? (
            <div style={{ padding: '2rem 0' }}>
              <Loading type="skeleton" rows={3} />
            </div>
          ) : feedbacks.length === 0 ? (
            <EmptyState
              icon={<FiMessageCircle size={40} />}
              title="Bạn chưa có phản hồi nào"
              description="Mọi thắc mắc của bạn gửi tại đây sẽ được cán bộ chuyên trách trả lời công khai và gửi thông báo trực tiếp."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              {feedbacks.map((fb) => (
                <div key={fb.maPhanHoi || fb.maphanhoi} className="feedback-item">
                  <div className="feedback-item-header">
                    <div>
                      <h4 className="feedback-item-title">{fb.tieuDe || fb.tieude}</h4>
                      {fb.tieuDeBaiTaiTro && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '2px', fontWeight: 500 }}>
                          Về dự án: {fb.tieuDeBaiTaiTro}
                        </div>
                      )}
                    </div>
                    {getStatusBadge(fb.trangThai || fb.trangthai)}
                  </div>

                  <div className="feedback-item-date">{formatDate(fb.ngayGui || fb.ngaygui)}</div>
                  <p className="feedback-item-content">{fb.noiDung || fb.noidung}</p>

                  {/* Phản hồi từ cán bộ nếu có */}
                  {(fb.noiDungTraLoi || fb.noidungtraloi) ? (
                    <div className="feedback-response-box">
                      <div className="feedback-response-head">
                        <span className="feedback-response-by">
                          {fb.tenCanBoTraLoi ? `Cán bộ ${fb.tenCanBoTraLoi} trả lời:` : 'Ban Quản lý Quỹ trường trả lời:'}
                        </span>
                        {(fb.ngayTraLoi || fb.ngaytraloi) && (
                          <span style={{ fontSize: '0.75rem', color: '#888' }}>
                            {formatDate(fb.ngayTraLoi || fb.ngaytraloi)}
                          </span>
                        )}
                      </div>
                      <p className="feedback-response-text">{fb.noiDungTraLoi || fb.noidungtraloi}</p>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: '#888', fontStyle: 'italic', marginTop: '0.5rem' }}>
                      Cán bộ quản lý đang tiếp nhận và sẽ sớm giải đáp thắc mắc của bạn.
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Feedback;
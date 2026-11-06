// Feedback: Gửi phản hồi / khiếu nại và theo dõi giải đáp từ cán bộ quản lý
import { useState, useEffect } from 'react';
import { FiSend, FiMessageCircle } from 'react-icons/fi';
import Input from '../../../../components/Input/Input';
import Button from '../../../../components/Button/Button';
import Loading from '../../../../components/Loading/Loading';
import EmptyState from '../../../../components/EmptyState/EmptyState';
import { useAuth } from '../../../../contexts/AuthContext';
import { useNotification } from '../../../../components/Notification/Notification';
import { getAllCampaigns } from '../../../../services/campaignService';
import { getAllFeedbacks, createFeedback } from '../../../../services/feedbackService';
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
  const [fileUrl, setFileUrl] = useState('');
  const [errors, setErrors] = useState({});

  const userId = user?.maNguoiDung || user?.id || 1;

  const loadData = async () => {
    try {
      setLoading(true);
      const [campsRes, fbsRes] = await Promise.all([
        getAllCampaigns(),
        getAllFeedbacks({ manguoidung: userId }),
      ]);
      setCampaigns(campsRes.data || []);
      setFeedbacks(fbsRes.data || []);
    } catch (err) {
      console.error('Lỗi tải phản hồi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  const validateForm = () => {
    const errs = {};
    const titleErr = validateRequired(title, 'Tiêu đề phản hồi');
    if (titleErr) errs.title = titleErr;

    const contentErr = validateRequired(content, 'Nội dung phản hồi');
    if (contentErr) errs.content = contentErr;

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await createFeedback({
        manguoidung: userId,
        mabaitaitro: selectedCampaign ? Number(selectedCampaign) : null,
        tieude: title,
        noidung: fileUrl ? `${content} (Tài liệu đính kèm: ${fileUrl})` : content,
      });

      addToast('Gửi phản hồi thành công! Cán bộ sẽ sớm phản hồi lại bạn.', 'success');
      setTitle('');
      setContent('');
      setSelectedCampaign('');
      setFileUrl('');
      loadData();
    } catch (err) {
      addToast(err?.message || 'Không thể gửi phản hồi', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="feedback-page">
      <div className="feedback-header">
        <h1>Phản hồi & Thắc mắc</h1>
        <p>Gửi câu hỏi, đề xuất hoặc phản ánh liên quan đến hoạt động tài trợ, tiếp nhận và minh chứng giải ngân.</p>
      </div>

      <div className="feedback-layout">
        {/* Form gửi phản hồi mới */}
        <div className="feedback-form-card">
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>Gửi thắc mắc hoặc phản ánh</h2>

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="input-wrap">
              <label className="input-label">Dự án liên quan (Không bắt buộc)</label>
              <select
                className="input-field"
                value={selectedCampaign}
                onChange={(e) => setSelectedCampaign(e.target.value)}
              >
                <option value="">-- Vấn đề chung về quỹ trường --</option>
                {campaigns.map((c) => (
                  <option key={c.maBaiTaiTro} value={c.maBaiTaiTro}>
                    {c.tieude}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Tiêu đề phản hồi"
              placeholder="VD: Cần hỗ trợ xuất giấy chứng nhận đóng góp..."
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
              }}
              error={errors.title}
              required
            />

            <Input
              label="Nội dung phản ánh chi tiết"
              type="textarea"
              rows={4}
              placeholder="Nhập chi tiết câu hỏi, thắc mắc hoặc đề xuất của bạn..."
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (errors.content) setErrors((prev) => ({ ...prev, content: null }));
              }}
              error={errors.content}
              required
            />

            <Input
              label="Tệp đính kèm / Link hình ảnh biên lai (nếu có)"
              placeholder="https://..."
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              helpText="Đính kèm link ảnh chụp màn hình chuyển khoản hoặc tài liệu liên quan"
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
            <Loading type="skeleton" rows={3} />
          ) : feedbacks.length === 0 ? (
            <EmptyState
              icon={<FiMessageCircle size={40} />}
              title="Bạn chưa có phản hồi nào"
              description="Mọi thắc mắc của bạn gửi tại đây sẽ được cán bộ chuyên trách trả lời bằng văn bản."
            />
          ) : (
            feedbacks.map((fb) => (
              <div key={fb.maPhanhoi} className="feedback-item">
                <div className="feedback-item-header">
                  <h4 className="feedback-item-title">{fb.tieude || fb.subject}</h4>
                  <span className={`badge ${fb.trangthai === 'DaXuLy' ? 'badge--success' : 'badge--warning'}`}>
                    {fb.trangthai === 'DaXuLy' ? 'Đã giải đáp' : 'Đang xử lý'}
                  </span>
                </div>

                <div className="feedback-item-date">{formatDate(fb.ngaygui)}</div>
                <p className="feedback-item-content">{fb.noidung || fb.content}</p>

                {/* Phản hồi từ cán bộ nếu có */}
                {fb.noidungtraloi ? (
                  <div className="feedback-response-box">
                    <div className="feedback-response-head">
                      <span className="feedback-response-by">Ban Quản lý Quỹ trả lời:</span>
                      <span style={{ fontSize: '0.75rem', color: '#888' }}>{formatDate(fb.ngaytraloi)}</span>
                    </div>
                    <p className="feedback-response-text">{fb.noidungtraloi}</p>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.8rem', color: '#888', fontStyle: 'italic' }}>
                    Cán bộ quản lý đang tiếp nhận và sẽ trả lời bạn trong vòng 24-48 giờ.
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Feedback;

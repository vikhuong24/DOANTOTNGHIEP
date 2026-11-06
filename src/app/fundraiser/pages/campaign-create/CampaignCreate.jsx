// Trang Khởi tạo bài kêu gọi gây quỹ (Fundraiser) theo ERD mới
// BẢNG TT_TAITRO: maBaiTaiTro, tieude, noidung, anhbia, muctieu, tongtienDaNhan, trangthai, maCanBo, maHieuTruong, ngaybatdau, ngaykethuc
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { createCampaign } from '../../../../services/campaignService';
import { generateCampaignContent } from '../../../../services/assistantService';
import { useNotification } from '../../../../components/Notification/Notification';
import Card from '../../../../components/Card/Card';
import Input from '../../../../components/Input/Input';
import Button from '../../../../components/Button/Button';
import Modal from '../../../../components/Modal/Modal';
import { FiZap, FiSend, FiSave, FiInfo } from 'react-icons/fi';
import './CampaignCreate.css';

const CampaignCreate = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useNotification();

  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  const [formData, setFormData] = useState({
    tieude: '',
    noidung: '',
    anhbia: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=60',
    muctieu: 50000000,
    ngaybatdau: new Date().toISOString().split('T')[0],
    ngaykethuc: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'muctieu' ? Number(value) : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // AI Hỗ trợ viết bài
  const handleOpenAiModal = () => {
    setAiPrompt(formData.tieude ? `Viết bài kêu gọi cho chiến dịch: "${formData.tieude}"` : '');
    setAiModalOpen(true);
  };

  const handleGenerateAi = async () => {
    if (!aiPrompt.trim()) {
      addToast('Vui lòng nhập định hướng bài viết để AI hỗ trợ', 'warning');
      return;
    }

    try {
      setAiGenerating(true);
      const res = await generateCampaignContent(aiPrompt);
      if (res && res.content) {
        setFormData((prev) => ({
          ...prev,
          noidung: res.content,
          tieude: prev.tieude || res.suggestedTitle || prev.tieude,
        }));
        addToast('AI đã hoàn thành bản thảo nội dung thành công!', 'success');
        setAiModalOpen(false);
      }
    } catch (err) {
      addToast(err.message || 'Không thể tạo bài bằng AI lúc này', 'error');
    } finally {
      setAiGenerating(false);
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.tieude.trim()) errs.tieude = 'Vui lòng nhập tiêu đề chiến dịch';
    if (!formData.noidung.trim()) errs.noidung = 'Vui lòng nhập nội dung chi tiết';
    if (!formData.muctieu || Number(formData.muctieu) <= 0) {
      errs.muctieu = 'Mục tiêu gây quỹ phải lớn hơn 0';
    }
    if (!formData.ngaybatdau) errs.ngaybatdau = 'Vui lòng chọn ngày bắt đầu';
    if (!formData.ngaykethuc) errs.ngaykethuc = 'Vui lòng chọn ngày kết thúc';

    if (new Date(formData.ngaybatdau) >= new Date(formData.ngaykethuc)) {
      errs.ngaykethuc = 'Ngày kết thúc phải diễn ra sau ngày bắt đầu';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (trangthai = 'ChoDuyet') => {
    if (!validate()) {
      addToast('Vui lòng kiểm tra lại các trường thông tin bắt buộc', 'error');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        trangthai,
        maCanBo: user?.maNguoiDung || user?.id || 3,
      };

      await createCampaign(payload);
      addToast(
        trangthai === 'Nhap'
          ? 'Đã lưu bản nháp bài gây quỹ thành công!'
          : 'Đã gửi bài gây quỹ lên Ban Giám Hiệu phê duyệt!',
        'success'
      );
      navigate('/fundraiser/campaign-update');
    } catch (err) {
      addToast(err.message || 'Có lỗi xảy ra khi tạo chiến dịch', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="campaign-create-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tạo Bài Kêu Gọi Gây Quỹ</h1>
          <p className="page-subtitle">
            Khởi tạo chiến dịch vận động tài trợ kinh phí cho các em học sinh trường chuyên biệt Nguyễn Đình Chiểu
          </p>
        </div>

        <div className="page-actions">
          <Button
            variant="outline"
            onClick={handleOpenAiModal}
            className="btn-ai-sparkle"
          >
            <FiZap /> Soạn thảo cùng Trợ lý AI
          </Button>
        </div>
      </div>

      <div className="create-grid">
        {/* Form Nhập Thông Tin Bài Viết */}
        <div className="create-main-col">
          <Card title="Thông tin cơ bản chiến dịch">
            <div className="form-group-flex">
              <Input
                label="Tiêu đề bài kêu gọi gây quỹ"
                name="tieude"
                value={formData.tieude}
                onChange={handleChange}
                placeholder="VD: Trang bị 15 máy tính cho phòng học kỹ năng số"
                error={errors.tieude}
                required
              />

              <div className="two-cols">
                <Input
                  type="date"
                  label="Ngày bắt đầu gây quỹ"
                  name="ngaybatdau"
                  value={formData.ngaybatdau}
                  onChange={handleChange}
                  error={errors.ngaybatdau}
                  required
                />
                <Input
                  type="date"
                  label="Ngày kết thúc dự kiến"
                  name="ngaykethuc"
                  value={formData.ngaykethuc}
                  onChange={handleChange}
                  error={errors.ngaykethuc}
                  required
                />
              </div>

              <Input
                type="number"
                label="Mục tiêu vận động gây quỹ (VNĐ)"
                name="muctieu"
                value={formData.muctieu}
                onChange={handleChange}
                placeholder="VD: 150000000"
                error={errors.muctieu}
                required
              />

              <Input
                label="Đường dẫn ảnh bìa chiến dịch (URL)"
                name="anhbia"
                value={formData.anhbia}
                onChange={handleChange}
                placeholder="https://..."
                helpText="Dán liên kết ảnh minh họa sắc nét thể hiện đúng bối cảnh gây quỹ"
              />

              <div className="textarea-wrap">
                <label className="input-label">
                  Nội dung chi tiết & Thông điệp kêu gọi <span className="input-required">*</span>
                </label>
                <textarea
                  name="noidung"
                  className={`input-field custom-textarea ${errors.noidung ? 'input-field--error' : ''}`}
                  rows={8}
                  value={formData.noidung}
                  onChange={handleChange}
                  placeholder="Mô tả hoàn cảnh khó khăn của học sinh, mục đích gây quỹ và kế hoạch giải ngân cụ thể..."
                />
                {errors.noidung && <span className="input-error">{errors.noidung}</span>}
              </div>
            </div>
          </Card>
        </div>

        {/* Cột Xem Trước (Live Preview) */}
        <div className="create-sidebar-col">
          <Card title="Xem trước bài hiển thị">
            <div className="preview-card-wrap">
              <div className="preview-img-box">
                <img
                  src={formData.anhbia || 'https://placehold.co/600x400?text=Chua+co+anh'}
                  alt="Ảnh bìa"
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/600x400?text=Loi+Anh';
                  }}
                />
                <span className="preview-badge">Chờ duyệt</span>
              </div>

              <div className="preview-body">
                <h3 className="preview-title">
                  {formData.tieude || 'Tiêu đề chiến dịch sẽ hiển thị tại đây'}
                </h3>
                <p className="preview-desc">
                  {formData.noidung
                    ? formData.noidung.slice(0, 140) + '...'
                    : 'Bản xem trước tóm tắt thông điệp kêu gọi đóng góp...'}
                </p>

                <div className="preview-target-box">
                  <div className="target-label">Mục tiêu vận động:</div>
                  <div className="target-amount">
                    {Number(formData.muctieu || 0).toLocaleString('vi-VN')} VNĐ
                  </div>
                </div>

                <div className="preview-footer-meta">
                  <span>Bắt đầu: {formData.ngaybatdau}</span>
                  <span>Kết thúc: {formData.ngaykethuc}</span>
                </div>
              </div>
            </div>

            <div className="submit-action-buttons">
              <Button
                variant="outline"
                fullWidth
                loading={loading}
                onClick={() => handleSubmit('Nhap')}
              >
                <FiSave /> Lưu bản nháp
              </Button>
              <Button
                variant="primary"
                fullWidth
                size="lg"
                loading={loading}
                onClick={() => handleSubmit('ChoDuyet')}
              >
                <FiSend /> Gửi phê duyệt ngay
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal Trợ lý AI tạo content */}
      <Modal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        title="Trợ lý AI hỗ trợ viết bài kêu gọi"
        size="md"
        footer={
          <div className="modal-buttons">
            <Button variant="outline" onClick={() => setAiModalOpen(false)}>
              Đóng
            </Button>
            <Button
              variant="primary"
              onClick={handleGenerateAi}
              loading={aiGenerating}
            >
              <FiZap /> Khởi tạo nội dung
            </Button>
          </div>
        }
      >
        <div className="ai-modal-content">
          <div className="ai-hint-box">
            <FiInfo /> Nhập tóm tắt ý tưởng, hoàn cảnh của các em học sinh đặc biệt hoặc mục tiêu mua sắm trang thiết bị. AI sẽ tự động sinh văn phong truyền cảm hứng, xúc động và minh bạch.
          </div>

          <Input
            label="Định hướng / Chủ đề chiến dịch"
            type="textarea"
            rows={4}
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Ví dụ: Vận động kinh phí mua 10 máy trợ thính kỹ thuật số cho học sinh lớp 4B bị điếc bẩm sinh..."
          />
        </div>
      </Modal>
    </div>
  );
};

export default CampaignCreate;

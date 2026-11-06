// ProposeSponsor: Form đề xuất tài trợ theo ERD mới
// BẢNG DEXUATTAITRO: madexuat (PK), manguoidung (FK), mabaitaitro (FK), tieude (MỚI), soTienDX (MỚI), mucdichSD (MỚI), trangthai, macanbo, ngayxuly, lydotuchoi, ngaygui
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiSend, FiInfo } from 'react-icons/fi';
import Input from '../../../../components/Input/Input';
import Button from '../../../../components/Button/Button';
import { useAuth } from '../../../../contexts/AuthContext';
import { useNotification } from '../../../../components/Notification/Notification';
import { propose as proposeSponsor } from '../../../../services/donationService';
import { getAllCampaigns } from '../../../../services/campaignService';
import { validateRequired } from '../../../../utils/validators';
import './ProposeSponsor.css';

const ProposeSponsor = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { addToast } = useNotification();

  const campaignIdParam = searchParams.get('campaignId');

  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState(campaignIdParam || '');

  const [formData, setFormData] = useState({
    tieude: '',
    soTienDX: '',
    mucdichSD: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchCamps = async () => {
      try {
        const res = await getAllCampaigns();
        setCampaigns(res.data || []);
      } catch (err) {
        console.error('Lỗi tải chiến dịch:', err);
      }
    };
    fetchCamps();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const errs = {};
    const titleErr = validateRequired(formData.tieude, 'Tiêu đề đề xuất');
    if (titleErr) errs.tieude = titleErr;

    if (!formData.soTienDX || Number(formData.soTienDX) <= 0) {
      errs.soTienDX = 'Vui lòng nhập số tiền đề xuất tài trợ hợp lệ (lớn hơn 0)';
    }

    const descErr = validateRequired(formData.mucdichSD, 'Mục đích sử dụng');
    if (descErr) errs.mucdichSD = descErr;

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await proposeSponsor({
        manguoidung: user?.maNguoiDung || user?.id || 1,
        mabaitaitro: selectedCampaignId ? Number(selectedCampaignId) : null,
        tieude: formData.tieude,
        soTienDX: Number(formData.soTienDX),
        mucdichSD: formData.mucdichSD,
      });

      addToast('Gửi đề xuất tài trợ thành công! Ban giám hiệu và cán bộ quản lý sẽ liên hệ xem xét.', 'success');
      navigate('/donor/campaign-progress');
    } catch (err) {
      addToast(err?.message || 'Không thể gửi đề xuất tài trợ', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="propose-page">
      <div className="propose-card">
        <h1 className="propose-title">Đề xuất tài trợ dự án</h1>
        <p className="propose-desc">
          Nếu bạn mong muốn tài trợ một mục tiêu, dự án hoặc hạng mục đặc biệt dành cho các em học sinh trường chuyên biệt Nguyễn Đình Chiểu, vui lòng gửi đề xuất chi tiết tại đây.
        </p>

        <div className="propose-guidelines">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
            <FiInfo /> Quy trình xét duyệt đề xuất tài trợ:
          </div>
          <ul>
            <li>Cán bộ quản lý gây quỹ tiếp nhận và thẩm định nhu cầu thực tế của học sinh trường.</li>
            <li>Hiệu trưởng phê duyệt và ký biên bản thỏa thuận tiếp nhận tài trợ.</li>
            <li>Nhà trường phối hợp triển khai phân bổ và gửi hồ sơ minh chứng tri ân đến nhà hảo tâm.</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="propose-form" noValidate>
          {/* Chọn chiến dịch liên quan (tùy chọn) */}
          <div className="input-wrap">
            <label className="input-label">Chiến dịch gây quỹ liên quan (tùy chọn)</label>
            <select
              className="input-field"
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
            >
              <option value="">-- Đề xuất cho toàn trường / Không thuộc chiến dịch cụ thể --</option>
              {campaigns.map((c) => (
                <option key={c.maBaiTaiTro} value={c.maBaiTaiTro}>
                  {c.tieude}
                </option>
              ))}
            </select>
          </div>

          {/* Tiêu đề đề xuất */}
          <Input
            label="Tiêu đề đề xuất tài trợ"
            name="tieude"
            placeholder="VD: Đề xuất tài trợ phòng thực hành giác quan cho học sinh đa tật"
            value={formData.tieude}
            onChange={handleChange}
            error={errors.tieude}
            required
          />

          {/* Số tiền đề xuất */}
          <Input
            label="Số tiền đề xuất tài trợ (VNĐ)"
            name="soTienDX"
            type="number"
            placeholder="VD: 50000000"
            value={formData.soTienDX}
            onChange={handleChange}
            error={errors.soTienDX}
            required
          />

          {/* Mục đích sử dụng */}
          <Input
            label="Mục đích sử dụng"
            name="mucdichSD"
            type="textarea"
            rows={5}
            placeholder="Nêu rõ mục đích sử dụng nguồn kinh phí tài trợ, đối tượng học sinh thụ hưởng, phương án triển khai dự kiến..."
            value={formData.mucdichSD}
            onChange={handleChange}
            error={errors.mucdichSD}
            required
          />

          <div style={{ marginTop: '1.25rem' }}>
            <Button type="submit" variant="primary" size="lg" fullWidth loading={submitting}>
              <FiSend /> Gửi đề xuất tài trợ
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProposeSponsor;

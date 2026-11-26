// ProposeSponsor: Biểu mẫu đề xuất tài trợ dự án riêng của Nhà hảo tâm
// Kết nối trực tiếp API Backend Spring Boot: POST /donor/donations/propose
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiSend, FiInfo, FiCheckCircle, FiAlertTriangle, FiArrowLeft } from 'react-icons/fi';
import Input from '../../../../components/Input/Input';
import Button from '../../../../components/Button/Button';
import Loading from '../../../../components/Loading/Loading';
import { useAuth } from '../../../../contexts/AuthContext';
import { useNotification } from '../../../../components/Notification/Notification';
import { proposeSponsor } from '../../../../services/donationService';
import { getAllCampaigns } from '../../../../services/campaignService';
import { validateRequired } from '../../../../utils/validators';
import { formatCurrency } from '../../../../utils/formatCurrency';
import './ProposeSponsor.css';

const ProposeSponsor = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { addToast } = useNotification();

  const campaignIdParam = searchParams.get('campaignId');

  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState(campaignIdParam || '');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);

  const [formData, setFormData] = useState({
    tieuDe: '',
    soTienDx: '',
    mucDichSd: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    let isMounted = true;
    const fetchCamps = async () => {
      try {
        setLoading(true);
        const res = await getAllCampaigns({ size: 100 });
        if (isMounted) {
          setCampaigns(res.data || []);
        }
      } catch (err) {
        console.error('Lỗi tải danh sách chiến dịch:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchCamps();
    return () => {
      isMounted = false;
    };
  }, []);

  const selectedCampaign = campaigns.find(
    (c) => String(c.maBaiTaiTro) === String(selectedCampaignId)
  );
  const isSelectedCampaignEnded =
    selectedCampaign &&
    (String(selectedCampaign.trangThai).toUpperCase() === 'KETTHUC' ||
      String(selectedCampaign.trangthai).toUpperCase() === 'KETTHUC');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const errs = {};

    if (isSelectedCampaignEnded) {
      errs.campaign = 'Chiến dịch này đã kết thúc, vui lòng không gắn đề xuất vào chiến dịch này';
    }

    const titleErr = validateRequired(formData.tieuDe, 'Tiêu đề đề xuất tài trợ');
    if (titleErr) {
      errs.tieuDe = titleErr;
    } else if (formData.tieuDe.trim().length < 5) {
      errs.tieuDe = 'Tiêu đề đề xuất phải có tối thiểu 5 ký tự';
    } else if (formData.tieuDe.trim().length > 255) {
      errs.tieuDe = 'Tiêu đề đề xuất không vượt quá 255 ký tự';
    }

    const numAmount = Number(formData.soTienDx);
    if (!formData.soTienDx || isNaN(numAmount) || numAmount < 1000) {
      errs.soTienDx = 'Vui lòng nhập số tiền đề xuất hợp lệ (tối thiểu 1,000 VNĐ)';
    }

    const descErr = validateRequired(formData.mucDichSd, 'Mục đích sử dụng tài trợ');
    if (descErr) {
      errs.mucDichSd = descErr;
    } else if (formData.mucDichSd.trim().length < 10) {
      errs.mucDichSd = 'Mục đích sử dụng phải có tối thiểu 10 ký tự';
    } else if (formData.mucDichSd.trim().length > 2000) {
      errs.mucDichSd = 'Mục đích sử dụng không được vượt quá 2,000 ký tự';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        maBaiTaiTro: selectedCampaignId ? Number(selectedCampaignId) : null,
        tieuDe: formData.tieuDe.trim(),
        soTienDx: Number(formData.soTienDx),
        mucDichSd: formData.mucDichSd.trim(),
      };

      const result = await proposeSponsor(payload);

      setSuccessInfo({
        maDeXuat: result.maDeXuat,
        trangThai: result.trangThai || 'CHODUYET',
        title: formData.tieuDe.trim(),
        amount: Number(formData.soTienDx),
        campaignTitle: selectedCampaign ? (selectedCampaign.tieuDe || selectedCampaign.tieude) : 'Đề xuất chung cho trường',
        message: result.message || 'Gửi đề xuất tài trợ thành công! Ban giám hiệu nhà trường sẽ sớm xem xét.',
      });

      addToast('Gửi đề xuất tài trợ thành công! Nhà trường sẽ liên hệ phản hồi.', 'success');
    } catch (err) {
      console.error('Lỗi khi gửi đề xuất tài trợ:', err);
      const errMsg =
        err?.response?.data?.message || err?.message || 'Không thể gửi đề xuất tài trợ. Vui lòng thử lại!';
      addToast(errMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="propose-page">
        <Loading text="Đang tải biểu mẫu đề xuất tài trợ..." />
      </div>
    );
  }

  // Màn hình thông báo gửi thành công
  if (successInfo) {
    return (
      <div className="propose-page">
        <div className="propose-card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
          <div style={{ color: '#2b8a3e', fontSize: '3.5rem', marginBottom: '1rem' }}>
            <FiCheckCircle />
          </div>
          <h2 style={{ color: '#2b8a3e', marginBottom: '0.5rem' }}>Đã Gửi Đề Xuất Tài Trợ Thành Công!</h2>
          <p style={{ color: '#495057', fontSize: '1rem', maxWidth: '540px', margin: '0 auto 1.5rem' }}>
            {successInfo.message}
          </p>

          <div
            style={{
              backgroundColor: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '8px',
              padding: '1.25rem',
              maxWidth: '500px',
              margin: '0 auto 2rem',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#666' }}>Mã đề xuất:</span>
              <strong>#{successInfo.maDeXuat}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#666' }}>Tiêu đề:</span>
              <strong style={{ maxWidth: '300px', textAlign: 'right' }}>{successInfo.title}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#666' }}>Dự toán kinh phí:</span>
              <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>
                {formatCurrency(successInfo.amount)}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#666' }}>Thuộc chiến dịch:</span>
              <span>{successInfo.campaignTitle}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666' }}>Trạng thái tiếp nhận:</span>
              <span className="badge badge--warning">Chờ ban giám hiệu thẩm định</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="outline"
              onClick={() => {
                setSuccessInfo(null);
                setFormData({ tieuDe: '', soTienDx: '', mucDichSd: '' });
                setSelectedCampaignId('');
              }}
            >
              Gửi thêm đề xuất khác
            </Button>
            <Button variant="primary" onClick={() => navigate('/campaigns')}>
              Về trang chủ chiến dịch
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="propose-page">
      <div className="propose-card">
        <h1 className="propose-title">Đề xuất tài trợ dự án</h1>
        <p className="propose-desc">
          Nếu quý nhà hảo tâm mong muốn tài trợ một mục tiêu, dự án chuyên biệt hoặc một hạng mục giáo dục đặc biệt dành cho các em học sinh trường chuyên biệt Nguyễn Đình Chiểu, vui lòng gửi đề xuất chi tiết tại đây.
        </p>

        <div className="propose-guidelines">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
            <FiInfo /> Quy trình xét duyệt đề xuất tài trợ:
          </div>
          <ul>
            <li>Cán bộ phụ trách gây quỹ tiếp nhận và thẩm định nhu cầu thực tế của học sinh trường.</li>
            <li>Hiệu trưởng phê duyệt và ban hành biên bản ghi nhớ tiếp nhận tài trợ chính thức.</li>
            <li>Nhà trường phối hợp triển khai phân bổ và gửi hồ sơ chứng từ minh chứng tri ân đến nhà hảo tâm.</li>
          </ul>
        </div>

        {/* Cảnh báo nếu chiến dịch gắn kèm đã kết thúc */}
        {isSelectedCampaignEnded && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0.85rem 1rem',
              backgroundColor: '#fff3bf',
              border: '1px solid #ffe066',
              borderRadius: '8px',
              color: '#d9480f',
              marginBottom: '1.25rem',
              fontWeight: 600,
            }}
          >
            <FiAlertTriangle /> Chiến dịch được chọn đã kết thúc. Vui lòng chọn chiến dịch đang hoạt động khác hoặc chọn mục "Đề xuất cho toàn trường".
          </div>
        )}

        <form onSubmit={handleSubmit} className="propose-form" noValidate>
          {/* Chọn chiến dịch liên quan (tùy chọn) */}
          <div className="input-wrap">
            <label className="input-label">Chiến dịch gây quỹ liên quan (tùy chọn)</label>
            <select
              className="input-field"
              value={selectedCampaignId}
              onChange={(e) => {
                setSelectedCampaignId(e.target.value);
                if (errors.campaign) setErrors((prev) => ({ ...prev, campaign: null }));
              }}
            >
              <option value="">-- Đề xuất chung cho toàn trường / Không thuộc chiến dịch cụ thể --</option>
              {campaigns.map((c) => {
                const ended =
                  String(c.trangThai).toUpperCase() === 'KETTHUC' ||
                  String(c.trangthai).toUpperCase() === 'KETTHUC';
                return (
                  <option key={c.maBaiTaiTro} value={c.maBaiTaiTro}>
                    {c.tieuDe || c.tieude} {ended ? '(Đã kết thúc)' : ''}
                  </option>
                );
              })}
            </select>
            {errors.campaign && <p className="input-error">{errors.campaign}</p>}
          </div>

          {/* Tiêu đề đề xuất */}
          <Input
            label="Tiêu đề đề xuất tài trợ"
            name="tieuDe"
            placeholder="VD: Đề xuất tài trợ phòng thực hành giác quan cho học sinh đa tật"
            value={formData.tieuDe}
            onChange={handleChange}
            error={errors.tieuDe}
            required
            helpText="Tối thiểu 5 ký tự và tối đa 255 ký tự"
          />

          {/* Số tiền đề xuất */}
          <Input
            label="Số tiền đề xuất tài trợ (VNĐ)"
            name="soTienDx"
            type="number"
            placeholder="VD: 50000000 (Tối thiểu 1,000 VNĐ)"
            value={formData.soTienDx}
            onChange={handleChange}
            error={errors.soTienDx}
            required
          />

          {/* Mục đích sử dụng */}
          <Input
            label="Mục đích sử dụng chi tiết"
            name="mucDichSd"
            type="textarea"
            rows={5}
            placeholder="Nêu rõ mục đích sử dụng nguồn kinh phí tài trợ, đối tượng học sinh thụ hưởng, phương án triển khai dự kiến (tối thiểu 10 ký tự)..."
            value={formData.mucDichSd}
            onChange={handleChange}
            error={errors.mucDichSd}
            required
            helpText="Tối thiểu 10 ký tự và tối đa 2,000 ký tự"
          />

          <div style={{ marginTop: '1.25rem' }}>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={submitting}
              disabled={isSelectedCampaignEnded}
            >
              <FiSend /> Gửi đề xuất tài trợ
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProposeSponsor;
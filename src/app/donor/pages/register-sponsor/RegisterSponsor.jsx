// RegisterSponsor: Đăng ký tài trợ cho một chương trình gây quỹ theo ERD mới
// BẢNG TAITRO: maTaiTro (PK), maNguoiDung (FK), maBaiTaiTro (FK), tenHienThi, soTienDK, soTienTT, anhGiaoDich, trangthai, maCanBo, ghichu, ngaygui, ngaynhan
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiUpload, FiImage, FiX } from 'react-icons/fi';
import Input from '../../../../components/Input/Input';
import Button from '../../../../components/Button/Button';
import Loading from '../../../../components/Loading/Loading';
import { useAuth } from '../../../../contexts/AuthContext';
import { useNotification } from '../../../../components/Notification/Notification';
import { getAllCampaigns, getCampaignById } from '../../../../services/campaignService';
import { register as registerDonation } from '../../../../services/donationService';
import { formatCurrency } from '../../../../utils/formatCurrency';
import './RegisterSponsor.css';

const QUICK_AMOUNTS = [200000, 500000, 1000000, 2000000, 5000000, 10000000];

const RegisterSponsor = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useNotification();

  const campaignIdParam = searchParams.get('campaignId');

  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [soTienDK, setSoTienDK] = useState('');
  const [anhGiaoDich, setAnhGiaoDich] = useState('');
  const [anhPreview, setAnhPreview] = useState('');
  const [note, setNote] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getAllCampaigns();
        const activeCamps = (res.data || []).filter(
          (c) => c.trangthai === 'DangChay' || c.trangthai === 'DaDuyet'
        );
        setCampaigns(activeCamps);

        if (campaignIdParam) {
          const matched = activeCamps.find((c) => c.maBaiTaiTro === Number(campaignIdParam));
          if (matched) setSelectedCampaign(matched);
          else {
            const single = await getCampaignById(campaignIdParam);
            setSelectedCampaign(single);
          }
        } else if (activeCamps.length > 0) {
          setSelectedCampaign(activeCamps[0]);
        }
      } catch (err) {
        console.error('Lỗi tải danh sách chiến dịch:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [campaignIdParam]);

  const handleCampaignChange = (e) => {
    const id = Number(e.target.value);
    const found = campaigns.find((c) => c.maBaiTaiTro === id);
    if (found) setSelectedCampaign(found);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAnhGiaoDich(reader.result);
        setAnhPreview(reader.result);
        if (errors.anhGiaoDich) setErrors((prev) => ({ ...prev, anhGiaoDich: null }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const errs = {};
    if (!selectedCampaign) {
      errs.campaign = 'Vui lòng chọn chương trình tài trợ';
    }

    const numAmount = Number(soTienDK);
    if (!soTienDK || isNaN(numAmount) || numAmount < 10000) {
      errs.soTienDK = 'Số tiền tài trợ tối thiểu là 10.000 VNĐ';
    }

    if (!anhGiaoDich) {
      errs.anhGiaoDich = 'Vui lòng tải lên ảnh chụp giao dịch / ủy nhiệm chi ngân hàng';
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
        maNguoiDung: user?.maNguoiDung || user?.id || 1,
        maBaiTaiTro: selectedCampaign.maBaiTaiTro,
        tenHienThi: isAnonymous ? 'Nhà hảo tâm ẩn danh' : (user?.hoten || user?.name || 'Nhà hảo tâm'),
        soTienDK: Number(soTienDK),
        anhGiaoDich: anhGiaoDich,
        ghichu: note,
      };

      await registerDonation(payload);
      addToast('Đăng ký tài trợ thành công! Cảm ơn tấm lòng vàng của bạn.', 'success');
      navigate('/donor/donation-history');
    } catch (err) {
      addToast(err?.message || 'Đăng ký tài trợ không thành công', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="sponsor-page">
        <Loading />
      </div>
    );
  }

  return (
    <div className="sponsor-page">
      <div className="sponsor-card">
        <h1 className="sponsor-title">Đăng ký tài trợ gây quỹ</h1>
        <p className="sponsor-desc">
          Nhập số tiền bạn muốn đóng góp và đính kèm ảnh chụp giao dịch chuyển khoản. Khoản đóng góp của bạn sẽ được ban phụ trách trường Nguyễn Đình Chiểu xác nhận và giải ngân minh bạch.
        </p>

        {/* Campaign Selection Preview */}
        {selectedCampaign && (
          <div className="campaign-preview-box">
            <img
              src={selectedCampaign.anhbia || 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300'}
              alt={selectedCampaign.tieude}
              className="campaign-preview-thumb"
            />
            <div className="campaign-preview-info" style={{ flex: 1 }}>
              <span className="badge badge--primary" style={{ marginBottom: '0.25rem' }}>Đang gây quỹ</span>
              <h4>{selectedCampaign.tieude}</h4>
              <p>Mục tiêu: <strong>{formatCurrency(selectedCampaign.muctieu || selectedCampaign.targetAmount || 0)}</strong></p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="sponsor-form" noValidate>
          {/* Select Campaign nếu muốn đổi */}
          <div className="input-wrap">
            <label className="input-label">Chương trình tiếp nhận tài trợ</label>
            <select
              className="input-field"
              value={selectedCampaign?.maBaiTaiTro || ''}
              onChange={handleCampaignChange}
            >
              {campaigns.map((c) => (
                <option key={c.maBaiTaiTro} value={c.maBaiTaiTro}>
                  {c.tieude}
                </option>
              ))}
            </select>
            {errors.campaign && <p className="input-error">{errors.campaign}</p>}
          </div>

          {/* Nhập số tiền đăng ký */}
          <div>
            <Input
              label="Số tiền đăng ký tài trợ (VNĐ)"
              name="soTienDK"
              type="number"
              placeholder="Nhập số tiền đóng góp (VD: 500000)"
              value={soTienDK}
              onChange={(e) => {
                setSoTienDK(e.target.value);
                if (errors.soTienDK) setErrors((prev) => ({ ...prev, soTienDK: null }));
              }}
              error={errors.soTienDK}
              required
            />
            <div className="quick-amount-buttons">
              {QUICK_AMOUNTS.map((val) => (
                <button
                  key={val}
                  type="button"
                  className="quick-amount-btn"
                  onClick={() => {
                    setSoTienDK(String(val));
                    if (errors.soTienDK) setErrors((prev) => ({ ...prev, soTienDK: null }));
                  }}
                >
                  {val.toLocaleString('vi-VN')} đ
                </button>
              ))}
            </div>
          </div>

          {/* Hướng dẫn chuyển khoản */}
          <div className="sponsor-bank-info">
            <strong>Thông tin tài khoản tiếp nhận của nhà trường:</strong>
            <div>Ngân hàng: <strong>Vietcombank - Chi nhánh Đà Nẵng</strong></div>
            <div>Số tài khoản: <strong>0041000888999</strong></div>
            <div>Chủ tài khoản: <strong>TRUONG CHUYEN BIET NGUYEN DINH CHIEU</strong></div>
            <div>Nội dung CK: <code>TT {selectedCampaign?.maBaiTaiTro} {user?.sdt || 'DONOR'}</code></div>
          </div>

          {/* Upload ảnh giao dịch */}
          <div className="input-wrap">
            <label className="input-label">
              Ảnh chụp giao dịch / Biên lai chuyển khoản <span className="input-required">*</span>
            </label>
            <div className="receipt-upload-container">
              <label className="receipt-upload-btn">
                <FiUpload /> Tải ảnh giao dịch từ thiết bị
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </label>
              <span style={{ fontSize: '0.85rem', color: '#666' }}>Hoặc dán đường dẫn ảnh:</span>
              <Input
                name="anhGiaoDichUrl"
                placeholder="https://images... / link ảnh chụp"
                value={typeof anhGiaoDich === 'string' && anhGiaoDich.startsWith('http') ? anhGiaoDich : ''}
                onChange={(e) => {
                  setAnhGiaoDich(e.target.value);
                  setAnhPreview(e.target.value);
                  if (errors.anhGiaoDich) setErrors((prev) => ({ ...prev, anhGiaoDich: null }));
                }}
              />
            </div>
            {errors.anhGiaoDich && <p className="input-error">{errors.anhGiaoDich}</p>}

            {/* Preview ảnh giao dịch */}
            {anhPreview && (
              <div className="receipt-preview-box" style={{ marginTop: '0.75rem', position: 'relative', display: 'inline-block' }}>
                <img
                  src={anhPreview}
                  alt="Ảnh giao dịch"
                  style={{ maxHeight: '180px', borderRadius: '8px', border: '1px solid #ddd' }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setAnhGiaoDich('');
                    setAnhPreview('');
                  }}
                  style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    background: 'rgba(0,0,0,0.6)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Xóa ảnh"
                >
                  <FiX />
                </button>
              </div>
            )}
          </div>

          {/* Lời nhắn / Ghi chú */}
          <Input
            label="Lời nhắn gửi tới các em học sinh & nhà trường"
            name="note"
            type="textarea"
            rows={3}
            placeholder="Chia sẻ thông điệp yêu thương hoặc lưu ý xác nhận..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          {/* Checkbox ẩn danh */}
          <div className="sponsor-anonymous-box">
            <label className="register-terms" style={{ margin: 0 }}>
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
              />
              <span>
                <strong>Tài trợ ẩn danh:</strong> Không hiển thị tên và thông tin liên hệ của tôi trên bảng vinh danh và sao kê công khai.
              </span>
            </label>
          </div>

          <Button type="submit" variant="primary" size="lg" fullWidth loading={submitting}>
            <FiCheckCircle /> Xác nhận đăng ký tài trợ
          </Button>
        </form>
      </div>
    </div>
  );
};

export default RegisterSponsor;

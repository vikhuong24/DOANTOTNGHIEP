// RegisterSponsor: Đăng ký đóng góp tài trợ cho chương trình gây quỹ
// Kết nối trực tiếp API Backend Spring Boot: POST /donor/donations/register
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiUpload, FiImage, FiX, FiAlertTriangle, FiArrowLeft, FiHeart } from 'react-icons/fi';
import Input from '../../../../components/Input/Input';
import Button from '../../../../components/Button/Button';
import Loading from '../../../../components/Loading/Loading';
import { useAuth } from '../../../../contexts/AuthContext';
import { useNotification } from '../../../../components/Notification/Notification';
import { getAllCampaigns, getCampaignById } from '../../../../services/campaignService';
import { registerDonation } from '../../../../services/donationService';
import { formatCurrency } from '../../../../utils/formatCurrency';
import './RegisterSponsor.css';

const QUICK_AMOUNTS = [100000, 200000, 500000, 1000000, 2000000, 5000000];

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
  const [successInfo, setSuccessInfo] = useState(null);

  // Form state
  const [soTienDK, setSoTienDK] = useState('');
  const [customName, setCustomName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [anhGiaoDichUrl, setAnhGiaoDichUrl] = useState('');
  const [anhPreview, setAnhPreview] = useState('');
  const [receiptFileName, setReceiptFileName] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let isMounted = true;
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const res = await getAllCampaigns({ size: 100 });
        const list = res.data || [];
        if (!isMounted) return;

        setCampaigns(list);

        if (campaignIdParam) {
          const matched = list.find((c) => String(c.maBaiTaiTro) === String(campaignIdParam));
          if (matched) {
            setSelectedCampaign(matched);
          } else {
            try {
              const single = await getCampaignById(campaignIdParam);
              if (isMounted && single) setSelectedCampaign(single);
            } catch {
              // Nếu không tìm thấy, chọn chiến dịch đầu tiên đang hoạt động
              const firstActive = list.find((c) => String(c.trangThai).toUpperCase() !== 'KETTHUC');
              if (firstActive) setSelectedCampaign(firstActive);
            }
          }
        } else if (list.length > 0) {
          const firstActive = list.find((c) => String(c.trangThai).toUpperCase() !== 'KETTHUC') || list[0];
          setSelectedCampaign(firstActive);
        }
      } catch (err) {
        console.error('Lỗi khi tải danh sách chiến dịch:', err);
        addToast('Không thể tải danh sách chương trình gây quỹ', 'error');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCampaigns();
    return () => {
      isMounted = false;
    };
  }, [campaignIdParam]);

  const isCampaignEnded =
    selectedCampaign &&
    (String(selectedCampaign.trangThai).toUpperCase() === 'KETTHUC' ||
      String(selectedCampaign.trangthai).toUpperCase() === 'KETTHUC');

  const handleCampaignChange = (e) => {
    const id = Number(e.target.value);
    const found = campaigns.find((c) => c.maBaiTaiTro === id);
    if (found) {
      setSelectedCampaign(found);
      if (errors.campaign) setErrors((prev) => ({ ...prev, campaign: null }));
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, anhGiaoDich: 'Kích thước file ảnh tối đa 5MB' }));
        return;
      }

      // Tạo object URL để preview an toàn
      const objectUrl = URL.createObjectURL(file);
      setAnhPreview(objectUrl);
      const safeName = `receipts/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '')}`.slice(0, 250);
      setReceiptFileName(safeName);
      setAnhGiaoDichUrl('');
      if (errors.anhGiaoDich) setErrors((prev) => ({ ...prev, anhGiaoDich: null }));
    }
  };

  const validateForm = () => {
    const errs = {};

    if (!selectedCampaign) {
      errs.campaign = 'Vui lòng chọn chương trình gây quỹ cần tài trợ';
    } else if (isCampaignEnded) {
      errs.campaign = 'Chương trình này đã kết thúc, không thể tiếp nhận thêm tài trợ';
    }

    const numAmount = Number(soTienDK);
    if (!soTienDK || isNaN(numAmount) || numAmount < 1000) {
      errs.soTienDK = 'Số tiền tài trợ tối thiểu là 1.000 VNĐ theo quy định';
    }

    if (note && note.length > 1000) {
      errs.note = 'Lời nhắn không được vượt quá 1,000 ký tự';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      // Xác định tên hiển thị theo lựa chọn
      let tenHienThi = undefined;
      if (isAnonymous) {
        tenHienThi = 'Nhà hảo tâm ẩn danh';
      } else if (customName.trim()) {
        tenHienThi = customName.trim().slice(0, 100);
      } else if (user?.hoten || user?.name) {
        tenHienThi = (user.hoten || user.name).trim().slice(0, 100);
      }

      // Đường dẫn ảnh giao dịch (tối đa 255 ký tự)
      const anhFinal = (anhGiaoDichUrl.trim() || receiptFileName || '').slice(0, 255) || undefined;

      const payload = {
        maBaiTaiTro: Number(selectedCampaign.maBaiTaiTro),
        tenHienThi,
        soTienDk: Number(soTienDK),
        anhGiaoDich: anhFinal,
        ghiChu: note.trim().slice(0, 1000) || undefined,
      };

      const result = await registerDonation(payload);

      setSuccessInfo({
        maTaiTro: result.maTaiTro,
        trangThai: result.trangThai || 'CHODUYET',
        campaignTitle: selectedCampaign.tieuDe || selectedCampaign.tieude,
        amount: Number(soTienDK),
        message: result.message || 'Đăng ký ủng hộ thành công!',
      });

      addToast('Đăng ký tài trợ thành công! Ban quản lý nhà trường sẽ sớm đối soát.', 'success');
    } catch (err) {
      console.error('Lỗi đăng ký tài trợ:', err);
      const errMsg =
        err?.response?.data?.message || err?.message || 'Đăng ký tài trợ không thành công. Vui lòng thử lại!';
      addToast(errMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="sponsor-page">
        <Loading text="Đang tải thông tin chương trình gây quỹ..." />
      </div>
    );
  }

  // Màn hình xác nhận thành công
  if (successInfo) {
    return (
      <div className="sponsor-page">
        <div className="sponsor-card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
          <div style={{ color: '#2b8a3e', fontSize: '3.5rem', marginBottom: '1rem' }}>
            <FiCheckCircle />
          </div>
          <h2 style={{ color: '#2b8a3e', marginBottom: '0.5rem' }}>Đăng Ký Đóng Góp Thành Công!</h2>
          <p style={{ color: '#495057', fontSize: '1rem', maxWidth: '540px', margin: '0 auto 1.5rem' }}>
            {successInfo.message}
          </p>

          <div
            style={{
              backgroundColor: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '8px',
              padding: '1.25rem',
              maxWidth: '480px',
              margin: '0 auto 2rem',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#666' }}>Mã lượt tài trợ:</span>
              <strong>#{successInfo.maTaiTro}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#666' }}>Chương trình:</span>
              <strong style={{ maxWidth: '280px', textAlign: 'right' }}>{successInfo.campaignTitle}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#666' }}>Số tiền đăng ký:</span>
              <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>
                {formatCurrency(successInfo.amount)}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666' }}>Trạng thái xử lý:</span>
              <span className="badge badge--warning">Chờ nhà trường đối soát</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="outline"
              onClick={() => {
                setSuccessInfo(null);
                setSoTienDK('');
                setAnhGiaoDichUrl('');
                setAnhPreview('');
                setReceiptFileName('');
                setNote('');
              }}
            >
              Tiếp tục ủng hộ
            </Button>
            <Button variant="primary" onClick={() => navigate('/campaigns')}>
              Xem các chiến dịch khác
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sponsor-page">
      <div className="sponsor-card">
        <h1 className="sponsor-title">Đăng ký tài trợ gây quỹ</h1>
        <p className="sponsor-desc">
          Nhập số tiền bạn muốn đóng góp và đính kèm biên lai chuyển khoản. Khoản đóng góp của bạn sẽ được ban phụ trách trường chuyên biệt Nguyễn Đình Chiểu xác nhận và giải ngân minh bạch.
        </p>

        {/* Cảnh báo nếu chiến dịch đã kết thúc */}
        {isCampaignEnded && (
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
            <FiAlertTriangle /> Chương trình này đã hoàn tất tiếp nhận tài trợ. Vui lòng chọn một chương trình đang hoạt động khác dưới đây.
          </div>
        )}

        {/* Campaign Selection Preview */}
        {selectedCampaign && (
          <div className="campaign-preview-box">
            <img
              src={
                selectedCampaign.anhBia ||
                selectedCampaign.anhbia ||
                'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300'
              }
              alt={selectedCampaign.tieuDe || selectedCampaign.tieude}
              className="campaign-preview-thumb"
            />
            <div className="campaign-preview-info" style={{ flex: 1 }}>
              <span
                className={`badge ${isCampaignEnded ? 'badge--secondary' : 'badge--primary'}`}
                style={{ marginBottom: '0.25rem' }}
              >
                {isCampaignEnded ? 'Đã kết thúc' : 'Đang gây quỹ'}
              </span>
              <h4>{selectedCampaign.tieuDe || selectedCampaign.tieude}</h4>
              <p>
                Mục tiêu vận động:{' '}
                <strong>
                  {formatCurrency(
                    selectedCampaign.mucTieu || selectedCampaign.muctieu || selectedCampaign.targetAmount || 0
                  )}
                </strong>
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="sponsor-form" noValidate>
          {/* Chọn chiến dịch nếu muốn thay đổi */}
          <div className="input-wrap">
            <label className="input-label">Chương trình tiếp nhận tài trợ</label>
            <select
              className="input-field"
              value={selectedCampaign?.maBaiTaiTro || ''}
              onChange={handleCampaignChange}
            >
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

          {/* Nhập số tiền đăng ký */}
          <div>
            <Input
              label="Số tiền đăng ký tài trợ (VNĐ)"
              name="soTienDK"
              type="number"
              placeholder="Nhập số tiền đóng góp (Tối thiểu 1,000 VNĐ)"
              value={soTienDK}
              onChange={(e) => {
                setSoTienDK(e.target.value);
                if (errors.soTienDK) setErrors((prev) => ({ ...prev, soTienDK: null }));
              }}
              error={errors.soTienDK}
              required
              disabled={isCampaignEnded}
            />
            <div className="quick-amount-buttons">
              {QUICK_AMOUNTS.map((val) => (
                <button
                  key={val}
                  type="button"
                  className="quick-amount-btn"
                  disabled={isCampaignEnded}
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

          {/* Tên hiển thị vinh danh */}
          <div className="input-wrap">
            <Input
              label="Tên hiển thị công khai trên danh sách vinh danh (Tùy chọn)"
              name="customName"
              placeholder={user?.hoten || user?.name || 'Để trống sẽ lấy họ tên tài khoản của bạn'}
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              disabled={isAnonymous || isCampaignEnded}
            />
            <div className="sponsor-anonymous-box" style={{ marginTop: '0.5rem' }}>
              <label className="register-terms" style={{ margin: 0, cursor: isCampaignEnded ? 'not-allowed' : 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  disabled={isCampaignEnded}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                />
                <span>
                  <strong>Ủng hộ ẩn danh:</strong> Hiển thị là "Nhà hảo tâm ẩn danh" trên bảng sao kê và vinh danh công khai.
                </span>
              </label>
            </div>
          </div>

          {/* Hướng dẫn chuyển khoản */}
          <div className="sponsor-bank-info">
            <strong>Thông tin tài khoản tiếp nhận chính thức của nhà trường:</strong>
            <div>Ngân hàng: <strong>Vietcombank - Chi nhánh Đà Nẵng</strong></div>
            <div>Số tài khoản: <strong>0041000888999</strong></div>
            <div>Chủ tài khoản: <strong>TRUONG CHUYEN BIET NGUYEN DINH CHIEU</strong></div>
            <div>
              Nội dung chuyển khoản:{' '}
              <code style={{ background: '#fff', padding: '2px 6px', borderRadius: '4px', border: '1px solid #ced4da' }}>
                TT {selectedCampaign?.maBaiTaiTro || ''} {user?.sdt || user?.email || 'DONOR'}
              </code>
            </div>
          </div>

          {/* Upload ảnh biên lai giao dịch */}
          <div className="input-wrap">
            <label className="input-label">
              Ảnh chụp giao dịch / Biên lai chuyển khoản (Tùy chọn)
            </label>
            <div className="receipt-upload-container">
              <label className="receipt-upload-btn" style={{ cursor: isCampaignEnded ? 'not-allowed' : 'pointer' }}>
                <FiUpload /> Chọn ảnh biên lai từ máy
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileUpload}
                  disabled={isCampaignEnded}
                  style={{ display: 'none' }}
                />
              </label>
              <span style={{ fontSize: '0.85rem', color: '#666' }}>Hoặc dán đường dẫn ảnh:</span>
              <Input
                name="anhGiaoDichUrl"
                placeholder="https://... (đường dẫn hình ảnh)"
                value={anhGiaoDichUrl}
                disabled={isCampaignEnded}
                onChange={(e) => {
                  setAnhGiaoDichUrl(e.target.value);
                  setAnhPreview(e.target.value);
                  setReceiptFileName('');
                  if (errors.anhGiaoDich) setErrors((prev) => ({ ...prev, anhGiaoDich: null }));
                }}
              />
            </div>
            {errors.anhGiaoDich && <p className="input-error">{errors.anhGiaoDich}</p>}

            {/* Preview ảnh giao dịch */}
            {anhPreview && (
              <div
                className="receipt-preview-box"
                style={{ marginTop: '0.75rem', position: 'relative', display: 'inline-block' }}
              >
                <img
                  src={anhPreview}
                  alt="Ảnh giao dịch"
                  style={{ maxHeight: '180px', borderRadius: '8px', border: '1px solid #ddd' }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setAnhPreview('');
                    setReceiptFileName('');
                    setAnhGiaoDichUrl('');
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
            placeholder="Chia sẻ thông điệp yêu thương hoặc lưu ý xác nhận (tối đa 1,000 ký tự)..."
            value={note}
            disabled={isCampaignEnded}
            onChange={(e) => {
              setNote(e.target.value);
              if (errors.note) setErrors((prev) => ({ ...prev, note: null }));
            }}
            error={errors.note}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={submitting}
            disabled={isCampaignEnded}
          >
            <FiHeart /> Xác nhận đăng ký tài trợ
          </Button>
        </form>
      </div>
    </div>
  );
};

export default RegisterSponsor;
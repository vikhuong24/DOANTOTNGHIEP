// Register: Đăng ký tài khoản Nhà hảo tâm đồng hành cùng trường Nguyễn Đình Chiểu
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../../../components/Input/Input';
import Button from '../../../../components/Button/Button';
import { useNotification } from '../../../../components/Notification/Notification';
import { register as registerService } from '../../../../services/authService';
import { validateEmail, validatePhone, validatePassword, validateRequired } from '../../../../utils/validators';
import { FiHeart, FiCheckCircle, FiShield, FiUserPlus, FiArrowRight } from 'react-icons/fi';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const { addToast } = useNotification();

  const [formData, setFormData] = useState({
    hoten: '',
    email: '',
    sdt: '',
    matkhau: '',
    xacnhanMatkhau: '',
    agreeTerms: true,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const nameErr = validateRequired(formData.hoten, 'Họ và tên');
    if (nameErr) newErrors.hoten = nameErr;

    const emailErr = validateEmail(formData.email);
    if (emailErr) newErrors.email = emailErr;

    const phoneErr = validatePhone(formData.sdt);
    if (phoneErr) newErrors.sdt = phoneErr;

    const passErr = validatePassword(formData.matkhau);
    if (passErr) newErrors.matkhau = passErr;

    if (!formData.xacnhanMatkhau) {
      newErrors.xacnhanMatkhau = 'Vui lòng xác nhận lại mật khẩu';
    } else if (formData.matkhau !== formData.xacnhanMatkhau) {
      newErrors.xacnhanMatkhau = 'Mật khẩu xác nhận không trùng khớp';
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'Bạn cần đồng ý với điều khoản sử dụng và quy chế gây quỹ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await registerService({
        hoten: formData.hoten,
        email: formData.email,
        sdt: formData.sdt,
        matkhau: formData.matkhau,
      });

      addToast('Đăng ký tài khoản Nhà hảo tâm thành công! Mời bạn đăng nhập để tiếp tục.', 'success');
      navigate('/login');
    } catch (err) {
      addToast(err?.message || 'Đăng ký thất bại, vui lòng thử lại', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-split-page">
      <div className="register-split-container">
        {/* Cột trái: Giới thiệu sứ mệnh trường */}
        <div className="register-showcase-panel">
          <div className="register-showcase-content">
            <div className="register-badge">
              <FiHeart /> Trường PT Chuyên Biệt Nguyễn Đình Chiểu — Đà Nẵng
            </div>
            <h1 className="register-showcase-title">
              Mỗi Tấm Lòng Vàng — Một Điểm Tựa Cho Tương Lai
            </h1>
            <p className="register-showcase-desc">
              Gia nhập cộng đồng Nhà hảo tâm để trực tiếp theo dõi từng đồng đóng góp của bạn biến thành sách chữ nổi, máy trợ thính và những suất học bổng đầy yêu thương cho các em học sinh.
            </p>

            <div className="register-benefit-list">
              <div className="benefit-item">
                <FiCheckCircle className="benefit-icon" />
                <div>
                  <strong>Minh bạch tuyệt đối:</strong> Tra cứu sao kê tự động theo thời gian thực và xem minh chứng trao quà có chữ ký xác nhận.
                </div>
              </div>
              <div className="benefit-item">
                <FiShield className="benefit-icon" />
                <div>
                  <strong>Bảo vệ quyền lợi học sinh:</strong> Tuân thủ tiêu chuẩn an toàn thông tin trẻ khuyết tật theo quy định pháp luật.
                </div>
              </div>
              <div className="benefit-item">
                <FiHeart className="benefit-icon" />
                <div>
                  <strong>Đề xuất hỗ trợ theo ý nguyện:</strong> Linh hoạt đăng ký tài trợ bằng tiền mặt, hiện vật hoặc dự án chuyên biệt.
                </div>
              </div>
            </div>

            <div className="register-quote">
              <em>"Sự tử tế, dù nhỏ bé đến đâu, cũng không bao giờ là lãng phí."</em>
            </div>
          </div>
        </div>

        {/* Cột phải: Form Đăng ký */}
        <div className="register-form-panel">
          <div className="register-form-inner">
            <div className="register-header-box">
              <span className="register-tag">Đăng Ký Thành Viên</span>
              <h2 className="register-heading">Tạo Tài Khoản Nhà Hảo Tâm</h2>
              <p className="register-subtext">
                Điền thông tin để bắt đầu hành trình thiện nguyện cùng nhà trường
              </p>
            </div>

            <form onSubmit={handleSubmit} className="register-form-body" noValidate>
              <Input
                label="Họ và tên của bạn hoặc Tổ chức"
                name="hoten"
                placeholder="Ví dụ: Nguyễn Văn An / Quỹ Thiện Tâm"
                value={formData.hoten}
                onChange={handleChange}
                error={errors.hoten}
                required
              />

              <div className="form-two-fields">
                <Input
                  label="Địa chỉ Email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  required
                />

                <Input
                  label="Số điện thoại"
                  name="sdt"
                  type="tel"
                  placeholder="0905xxxxxx"
                  value={formData.sdt}
                  onChange={handleChange}
                  error={errors.sdt}
                  required
                />
              </div>

              <div className="form-two-fields">
                <Input
                  label="Mật khẩu"
                  name="matkhau"
                  type="password"
                  placeholder="Tối thiểu 6 ký tự"
                  value={formData.matkhau}
                  onChange={handleChange}
                  error={errors.matkhau}
                  required
                />

                <Input
                  label="Xác nhận mật khẩu"
                  name="xacnhanMatkhau"
                  type="password"
                  placeholder="Nhập lại mật khẩu"
                  value={formData.xacnhanMatkhau}
                  onChange={handleChange}
                  error={errors.xacnhanMatkhau}
                  required
                />
              </div>

              {/* Điều khoản */}
              <div className="terms-checkbox-wrap">
                <label className="terms-label">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                  />
                  <span>
                    Tôi cam kết thông tin cung cấp là chính xác và đồng ý với{' '}
                    <Link to="/statement" target="_blank" className="terms-link">
                      quy chế minh bạch tài trợ
                    </Link>{' '}
                    của trường.
                  </span>
                </label>
                {errors.agreeTerms && <p className="input-error">{errors.agreeTerms}</p>}
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                loading={loading}
              >
                <FiUserPlus /> Hoàn tất đăng ký tài khoản
              </Button>
            </form>

            <div className="register-footer-links">
              <span>Đã có tài khoản trên hệ thống?</span>
              <Link to="/login" className="login-now-link">
                Đăng nhập ngay <FiArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

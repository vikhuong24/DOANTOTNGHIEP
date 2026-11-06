// Trang Đăng Nhập Duy Nhất Của Hệ Thống Gây Quỹ Trường Chuyên Biệt Nguyễn Đình Chiểu Đà Nẵng
import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { useNotification } from '../../../../components/Notification/Notification';
import Input from '../../../../components/Input/Input';
import Button from '../../../../components/Button/Button';
import {
  FiHeart, FiCheckCircle, FiShield, FiUsers, FiLock, FiArrowLeft,
} from 'react-icons/fi';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { addToast } = useNotification();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = 'Vui lòng nhập tên đăng nhập hoặc email';
    if (!formData.password) newErrors.password = 'Vui lòng nhập mật khẩu';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const user = await login(formData.username, formData.password);
      const roleCode = (user.maVaiTro || user.role || user.vaiTro || '').toUpperCase();
      addToast(`Đăng nhập thành công! Chào mừng ${user.hoten || user.name}`, 'success');

      // Nếu có redirect state trước đó từ trang người dùng muốn truy cập
      const targetFrom = location.state?.from?.pathname;

      if (roleCode === 'ADMIN') {
        navigate(targetFrom?.startsWith('/admin') ? targetFrom : '/admin/user-management', { replace: true });
      } else if (roleCode === 'HIEUTRUONG' || roleCode === 'HT') {
        navigate(targetFrom?.startsWith('/principal') ? targetFrom : '/principal/campaign-approval', { replace: true });
      } else if (roleCode === 'CANBO' || roleCode === 'CBQL' || roleCode === 'FUNDRAISER') {
        navigate(targetFrom?.startsWith('/fundraiser') ? targetFrom : '/fundraiser/campaign-update', { replace: true });
      } else if (roleCode === 'PHUHUYNH' || roleCode === 'PH' || roleCode === 'PARENT') {
        navigate(targetFrom?.startsWith('/parent') ? targetFrom : '/parent/student-support-history', { replace: true });
      } else {
        // Mặc định là Nhà hảo tâm (NHATAITRO / NHT / DONOR)
        navigate(targetFrom || '/campaigns', { replace: true });
      }
    } catch (err) {
      addToast(err?.message || 'Đăng nhập không thành công, vui lòng kiểm tra lại tài khoản và mật khẩu', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="unified-login-page">
      <div className="unified-login-container">
        {/* Cột trái: Giới thiệu sứ mệnh trường chuyên biệt */}
        <div className="login-showcase-panel">
          <div className="showcase-content">
            <div className="showcase-badge">
              <FiHeart /> Trường Phổ Thông Chuyên Biệt Nguyễn Đình Chiểu
            </div>
            <h1 className="showcase-title">
              Chung Tay Tiếp Sức Cho Các Em Học Sinh Khiếm Thị Đà Nẵng
            </h1>
            <p className="showcase-desc">
              Cổng thông tin tiếp nhận tài trợ minh bạch 100%, đồng hành cùng các em học sinh khiếm thị, khiếm thính và đa tật trên hành trình học tập và hòa nhập cộng đồng.
            </p>

            <div className="showcase-highlights">
              <div className="highlight-item">
                <FiCheckCircle className="highlight-icon" />
                <div>
                  <div className="highlight-title">Minh bạch 100% dòng tiền</div>
                  <div className="highlight-sub">Sao kê ngân hàng công khai, cập nhật biên bản trao học bổng và thiết bị</div>
                </div>
              </div>
              <div className="highlight-item">
                <FiShield className="highlight-icon" />
                <div>
                  <div className="highlight-title">Bảo mật thông tin trẻ em</div>
                  <div className="highlight-sub">Tôn trọng nhân phẩm và bảo vệ quyền riêng tư học sinh theo quy chế</div>
                </div>
              </div>
              <div className="highlight-item">
                <FiUsers className="highlight-icon" />
                <div>
                  <div className="highlight-title">Hệ thống đồng hành 5 trong 1</div>
                  <div className="highlight-sub">Nhà hảo tâm • Phụ huynh • Cán bộ giáo viên • Ban Giám Hiệu • Quản trị viên</div>
                </div>
              </div>
            </div>

            <div className="showcase-footer">
              <span>Đà Nẵng • Nơi yêu thương hội tụ và lan tỏa</span>
            </div>
          </div>
        </div>

        {/* Cột phải: Form Đăng nhập duy nhất */}
        <div className="login-form-panel">
          <div className="form-panel-inner">
            <div className="form-header">
              <span className="form-pill">Cổng Đăng Nhập Toàn Hệ Thống</span>
              <h2 className="form-title">Đăng Nhập Tài Khoản</h2>
              <p className="form-subtitle">
                Đăng nhập bằng Email hoặc Tên đăng nhập để truy cập đúng phân hệ của bạn
              </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form-fields">
              <Input
                label="Tên đăng nhập hoặc Email"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Nhập tên đăng nhập hoặc email"
                error={errors.username}
                required
              />

              <Input
                type="password"
                label="Mật khẩu"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                error={errors.password}
                required
              />

              <div className="form-action-row">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={loading}
                  size="lg"
                >
                  <FiLock /> Đăng nhập
                </Button>
              </div>
            </form>

            <div className="form-links-footer">
              <p>
                Bạn là Nhà hảo tâm mới chưa có tài khoản?{' '}
                <Link to="/register" className="link-highlight">
                  Đăng ký tài khoản tại đây
                </Link>
              </p>
              <div className="portal-quick-links">
                <Link to="/campaigns"><FiArrowLeft style={{ verticalAlign: 'middle', marginRight: 4 }} />Về trang chủ khám phá chiến dịch</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

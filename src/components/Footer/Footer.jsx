// Footer component - thông tin trường, liên kết nhanh
import { Link, useNavigate } from 'react-router-dom';
import {
  FiHeart, FiMapPin, FiPhone, FiMail, FiFacebook, FiYoutube, FiLogOut,
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import {
  APP_NAME, SCHOOL_NAME, SCHOOL_ADDRESS, SCHOOL_PHONE, SCHOOL_EMAIL,
} from '../../utils/constants';
import './Footer.css';

const Footer = () => {
  const year = new Date().getFullYear();
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/campaigns', { replace: true });
  };

  return (
    <footer className="footer">
      <div className="footer-main">
        {/* Brand */}
        <div className="footer-brand">
          <div className="footer-brand-logo">
            <div className="footer-brand-icon"><FiHeart /></div>
            <span className="footer-brand-name">{APP_NAME}</span>
          </div>
          <p className="footer-brand-desc">
            Chung tay hỗ trợ các em học sinh khiếm thị, khiếm thính tại {SCHOOL_NAME}.
            Mỗi đóng góp là một niềm hy vọng thắp sáng tương lai các em.
          </p>
          <div className="footer-contact-item">
            <FiMapPin size={14} />
            <span>{SCHOOL_ADDRESS}</span>
          </div>
          <div className="footer-contact-item">
            <FiPhone size={14} />
            <a href={`tel:${SCHOOL_PHONE}`}>{SCHOOL_PHONE}</a>
          </div>
          <div className="footer-contact-item">
            <FiMail size={14} />
            <a href={`mailto:${SCHOOL_EMAIL}`}>{SCHOOL_EMAIL}</a>
          </div>
        </div>

        {/* Chiến dịch & Hoạt động */}
        <div>
          <h4 className="footer-section-title">Chương trình gây quỹ</h4>
          <ul className="footer-links">
            <li><Link to="/campaigns">Tất cả chiến dịch</Link></li>
            <li><Link to="/statement">Sao kê minh bạch</Link></li>
            <li><Link to="/students">Danh sách học sinh nhận hỗ trợ</Link></li>
            <li><Link to="/campaigns">Học bổng vượt khó</Link></li>
            <li><Link to="/campaigns">Thiết bị trợ thính & Chữ nổi Braille</Link></li>
          </ul>
        </div>

        {/* Cổng chức năng */}
        <div>
          <h4 className="footer-section-title">Cổng tác nhân</h4>
          <ul className="footer-links">
            <li><Link to="/parent/login">Cổng Phụ huynh học sinh</Link></li>
            <li><Link to="/donor/login">Cổng Nhà hảo tâm</Link></li>
            <li><Link to="/fundraiser/login">Cổng Cán bộ quản lý</Link></li>
            <li><Link to="/register">Đăng ký tài khoản mới</Link></li>
          </ul>
        </div>

        {/* Tài khoản & Liên hệ */}
        <div>
          <h4 className="footer-section-title">Tài khoản & Hỗ trợ</h4>
          <ul className="footer-links">
            {isAuthenticated ? (
              <>
                <li className="footer-user-greet">
                  Đang đăng nhập: <strong>{user?.hoten || user?.name}</strong>
                </li>
                <li>
                  <button type="button" className="footer-link-btn" onClick={handleLogout}>
                    <FiLogOut /> Đăng xuất tài khoản
                  </button>
                </li>
              </>
            ) : (
              <>
                <li><Link to="/login">Đăng nhập hệ thống</Link></li>
                <li><Link to="/register">Tạo tài khoản Nhà hảo tâm</Link></li>
              </>
            )}
          </ul>
          <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem' }}>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" style={{ color: '#aaa' }} title="Facebook">
              <FiFacebook size={20} />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" style={{ color: '#aaa' }} title="Youtube">
              <FiYoutube size={20} />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="footer-bottom">
        <span>© {year} {APP_NAME} — {SCHOOL_NAME}. Tất cả quyền được bảo lưu.</span>
        <div className="footer-bottom-links">
          <Link to="/statement">Minh bạch tài chính</Link>
          <Link to="/students">Bảo mật thông tin học sinh</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

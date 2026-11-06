// Header component - logo, nav, user menu, role-aware
import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FiHome, FiLogOut, FiUser, FiSettings, FiMenu, FiX, FiHeart,
  FiClock, FiMessageSquare, FiBarChart2, FiFileText, FiCheckSquare, FiUsers,
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { ROLES, ROLE_LABEL, APP_NAME, SCHOOL_NAME } from '../../utils/constants';
import './Header.css';

// Điều hướng theo role
const NAV_BY_ROLE = {
  [ROLES.GUEST]: [
    { label: 'Trang chủ', to: '/campaigns' },
    { label: 'Bài gây quỹ', to: '/campaigns' },
    { label: 'Sao kê', to: '/statement' },
    { label: 'Học sinh', to: '/students' },
  ],
  [ROLES.DONOR]: [
    { label: 'Chiến dịch gây quỹ', to: '/campaigns' },
    { label: 'Tiến trình ủng hộ', to: '/donor/campaign-progress' },
    { label: 'Lịch sử đóng góp', to: '/donor/donation-history' },
    { label: 'Sao kê toàn trường', to: '/statement' },
  ],
  [ROLES.PARENT]: [
    { label: 'Lịch sử hỗ trợ', to: '/parent/student-support-history' },
    { label: 'Minh chứng', to: '/parent/donation-evidence' },
    { label: 'Phản hồi', to: '/parent/feedback' },
    { label: 'Trợ lý AI', to: '/parent/chat-assistant' },
  ],
  parent: [
    { label: 'Lịch sử hỗ trợ', to: '/parent/student-support-history' },
    { label: 'Minh chứng', to: '/parent/donation-evidence' },
    { label: 'Phản hồi', to: '/parent/feedback' },
    { label: 'Trợ lý AI', to: '/parent/chat-assistant' },
  ],
  [ROLES.FUNDRAISER]: [
    { label: 'Bài kêu gọi', to: '/fundraiser/campaign-update' },
    { label: 'Tạo chiến dịch', to: '/fundraiser/campaign-create' },
    { label: 'Duyệt đề xuất', to: '/fundraiser/proposal-approval' },
    { label: 'Duyệt tài trợ', to: '/fundraiser/sponsor-approval' },
    { label: 'Tiếp nhận', to: '/fundraiser/donation-confirm' },
    { label: 'Phân bổ học sinh', to: '/fundraiser/scholarship-distribution' },
    { label: 'Giải ngân', to: '/fundraiser/disbursement-progress' },
  ],
  fundraiser: [
    { label: 'Bài kêu gọi', to: '/fundraiser/campaign-update' },
    { label: 'Tạo chiến dịch', to: '/fundraiser/campaign-create' },
    { label: 'Duyệt đề xuất', to: '/fundraiser/proposal-approval' },
    { label: 'Duyệt tài trợ', to: '/fundraiser/sponsor-approval' },
    { label: 'Tiếp nhận', to: '/fundraiser/donation-confirm' },
    { label: 'Phân bổ học sinh', to: '/fundraiser/scholarship-distribution' },
    { label: 'Giải ngân', to: '/fundraiser/disbursement-progress' },
  ],
  [ROLES.PRINCIPAL]: [
    { label: 'Duyệt bài tài trợ', to: '/principal/campaign-approval' },
    { label: 'Duyệt phân bổ', to: '/principal/distribution-approval' },
    { label: 'Báo cáo tài chính', to: '/principal/financial-report' },
    { label: 'Phản hồi PH', to: '/principal/parent-feedback-view' },
  ],
  principal: [
    { label: 'Duyệt bài tài trợ', to: '/principal/campaign-approval' },
    { label: 'Duyệt phân bổ', to: '/principal/distribution-approval' },
    { label: 'Báo cáo tài chính', to: '/principal/financial-report' },
    { label: 'Phản hồi PH', to: '/principal/parent-feedback-view' },
  ],
  [ROLES.ADMIN]: [
    { label: 'Người dùng', to: '/admin/user-management' },
    { label: 'Hồ sơ học sinh', to: '/admin/students' },
    { label: 'Phân quyền', to: '/admin/role-permission' },
    { label: 'Thống kê', to: '/admin/campaign-statistics' },
  ],
  admin: [
    { label: 'Người dùng', to: '/admin/user-management' },
    { label: 'Hồ sơ học sinh', to: '/admin/students' },
    { label: 'Phân quyền', to: '/admin/role-permission' },
    { label: 'Thống kê', to: '/admin/campaign-statistics' },
  ],
  // Fallback slug
  guest: [
    { label: 'Trang chủ', to: '/campaigns' },
    { label: 'Bài gây quỹ', to: '/campaigns' },
    { label: 'Sao kê', to: '/statement' },
    { label: 'Học sinh', to: '/students' },
  ],
  donor: [
    { label: 'Chiến dịch gây quỹ', to: '/campaigns' },
    { label: 'Tiến trình ủng hộ', to: '/donor/campaign-progress' },
    { label: 'Lịch sử đóng góp', to: '/donor/donation-history' },
    { label: 'Sao kê toàn trường', to: '/statement' },
  ],
};

const Header = () => {
  const { user, role, roleCode, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const navLinks = NAV_BY_ROLE[role] || NAV_BY_ROLE[roleCode] || NAV_BY_ROLE[ROLES.GUEST];

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    navigate('/campaigns', { replace: true });
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map((w) => w[0]).slice(-2).join('').toUpperCase();
  };

  const getHomePath = () => {
    if (!isAuthenticated) return '/campaigns';
    if (role === 'donor' || roleCode === 'NHT') return '/campaigns';
    if (role === 'parent' || roleCode === 'PH') return '/parent/student-support-history';
    if (role === 'fundraiser' || roleCode === 'CBQL') return '/fundraiser/campaign-update';
    if (role === 'principal' || roleCode === 'HT') return '/principal/campaign-approval';
    if (role === 'admin' || roleCode === 'ADMIN') return '/admin/user-management';
    return '/campaigns';
  };

  return (
    <header className="header">
      <div className="header-inner">
        {/* Logo */}
        <NavLink to={getHomePath()} className="header-logo">
          <div className="header-logo-icon">
            <FiHeart />
          </div>
          <div className="header-logo-text">
            <span className="header-logo-name">{APP_NAME}</span>
            <span className="header-logo-sub">{SCHOOL_NAME.substring(0, 32)}...</span>
          </div>
        </NavLink>

        {/* Desktop Nav */}
        <nav className="header-nav">
          {navLinks.map((link, idx) => (
            <NavLink
              key={`${link.to}-${idx}`}
              to={link.to}
              className={({ isActive }) =>
                `header-nav-link ${isActive ? 'header-nav-link--active' : ''}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="header-actions">
          {isAuthenticated ? (
            <div className="header-user" ref={dropdownRef}>
              <button
                className="header-user-btn"
                onClick={() => setDropdownOpen((p) => !p)}
                aria-expanded={dropdownOpen}
              >
                <div className="header-avatar">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name || user.hoten} />
                  ) : (
                    getInitials(user?.name || user?.hoten)
                  )}
                </div>
                <div>
                  <div className="header-user-name">{user?.name || user?.hoten}</div>
                  <div className="header-user-role">{ROLE_LABEL[role] || ROLE_LABEL[roleCode]}</div>
                </div>
              </button>

              {dropdownOpen && (
                <div className="header-dropdown">
                  {/* Menu riêng cho Nhà hảo tâm */}
                  {(role === 'donor' || roleCode === 'NHT') ? (
                    <>
                      <NavLink
                        to="/donor/profile"
                        className="header-dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <FiUser /> Hồ sơ cá nhân
                      </NavLink>
                      <NavLink
                        to="/donor/donation-history"
                        className="header-dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <FiClock /> Lịch sử đóng góp
                      </NavLink>
                      <NavLink
                        to="/donor/feedback"
                        className="header-dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <FiMessageSquare /> Gửi phản hồi & góp ý
                      </NavLink>
                      <NavLink
                        to="/donor/campaign-progress"
                        className="header-dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <FiBarChart2 /> Tiến trình dự án đã ủng hộ
                      </NavLink>
                    </>
                  ) : (role === 'parent' || roleCode === 'PH') ? (
                    <>
                      <NavLink
                        to="/parent/student-support-history"
                        className="header-dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <FiUser /> Lịch sử nhận hỗ trợ
                      </NavLink>
                      <NavLink
                        to="/parent/donation-evidence"
                        className="header-dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <FiFileText /> Minh chứng trao tặng
                      </NavLink>
                      <NavLink
                        to="/parent/feedback"
                        className="header-dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <FiMessageSquare /> Phản hồi sai lệch
                      </NavLink>
                    </>
                  ) : (role === 'fundraiser' || roleCode === 'CBQL') ? (
                    <>
                      <NavLink
                        to="/fundraiser/campaign-update"
                        className="header-dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <FiBarChart2 /> Quản lý bài kêu gọi
                      </NavLink>
                      <NavLink
                        to="/fundraiser/campaign-create"
                        className="header-dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <FiHeart /> Tạo bài kêu gọi mới
                      </NavLink>
                      <NavLink
                        to="/fundraiser/proposal-approval"
                        className="header-dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <FiFileText /> Duyệt đề xuất NHT
                      </NavLink>
                    </>
                  ) : (role === 'principal' || roleCode === 'HT') ? (
                    <>
                      <NavLink
                        to="/principal/campaign-approval"
                        className="header-dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <FiCheckSquare /> Duyệt bài tài trợ
                      </NavLink>
                      <NavLink
                        to="/principal/distribution-approval"
                        className="header-dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <FiCheckSquare /> Duyệt đợt phân bổ
                      </NavLink>
                      <NavLink
                        to="/principal/financial-report"
                        className="header-dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <FiBarChart2 /> Báo cáo tài chính
                      </NavLink>
                      <NavLink
                        to="/principal/parent-feedback-view"
                        className="header-dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <FiMessageSquare /> Phản hồi phụ huynh
                      </NavLink>
                      <NavLink
                        to="/principal/staff-response-view"
                        className="header-dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <FiFileText /> Phản hồi cán bộ
                      </NavLink>
                    </>
                  ) : (role === 'admin' || roleCode === 'ADMIN') ? (
                    <>
                      <NavLink
                        to="/admin/user-management"
                        className="header-dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <FiUsers /> Quản lý người dùng
                      </NavLink>
                      <NavLink
                        to="/admin/role-permission"
                        className="header-dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <FiSettings /> Phân quyền hệ thống
                      </NavLink>
                      <NavLink
                        to="/admin/campaign-statistics"
                        className="header-dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <FiBarChart2 /> Thống kê chiến dịch
                      </NavLink>
                    </>
                  ) : (
                    <>
                      <NavLink
                        to="/campaigns"
                        className="header-dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <FiHome /> Trang chủ
                      </NavLink>
                    </>
                  )}

                  <div className="header-dropdown-divider" />
                  <button className="header-dropdown-item header-dropdown-item--danger" onClick={handleLogout}>
                    <FiLogOut /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <NavLink to="/register">
                <button className="btn btn--outline btn--sm">Đăng ký</button>
              </NavLink>
              <NavLink to="/login">
                <button className="btn btn--primary btn--sm">Đăng nhập</button>
              </NavLink>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            className="header-mobile-btn"
            onClick={() => setMobileOpen((p) => !p)}
            aria-label="Menu"
          >
            {mobileOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

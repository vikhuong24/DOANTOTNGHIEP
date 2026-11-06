// Sidebar component - menu items theo role, collapsible
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiHeart, FiClock, FiMessageSquare,
  FiUsers, FiBookOpen, FiBarChart2, FiSettings, FiCheckSquare,
  FiPlusSquare, FiFileText, FiMenu, FiChevronLeft,
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { ROLES } from '../../utils/constants';
import './Sidebar.css';

// Menu config theo role
const MENU_BY_ROLE = {
  [ROLES.DONOR]: [
    {
      group: 'Chiến dịch gây quỹ',
      items: [
        { label: 'Khám phá bài gây quỹ', to: '/campaigns', icon: <FiHeart /> },
        { label: 'Tiến trình dự án đã ủng hộ', to: '/donor/campaign-progress', icon: <FiBarChart2 /> },
      ],
    },
    {
      group: 'Đóng góp & Sao kê',
      items: [
        { label: 'Lịch sử đóng góp', to: '/donor/donation-history', icon: <FiClock /> },
        { label: 'Sao kê toàn trường', to: '/statement', icon: <FiFileText /> },
      ],
    },
  ],
  donor: [
    {
      group: 'Chiến dịch gây quỹ',
      items: [
        { label: 'Khám phá bài gây quỹ', to: '/campaigns', icon: <FiHeart /> },
        { label: 'Tiến trình dự án đã ủng hộ', to: '/donor/campaign-progress', icon: <FiBarChart2 /> },
      ],
    },
    {
      group: 'Đóng góp & Sao kê',
      items: [
        { label: 'Lịch sử đóng góp', to: '/donor/donation-history', icon: <FiClock /> },
        { label: 'Sao kê toàn trường', to: '/statement', icon: <FiFileText /> },
      ],
    },
  ],
  [ROLES.PARENT]: [
    {
      group: 'Con em & Hỗ trợ',
      items: [
        { label: 'Lịch sử nhận hỗ trợ', to: '/parent/student-support-history', icon: <FiUsers /> },
        { label: 'Minh chứng trao tặng', to: '/parent/donation-evidence', icon: <FiFileText /> },
        { label: 'Phản hồi sai lệch', to: '/parent/feedback', icon: <FiMessageSquare /> },
        { label: 'Trợ lý AI hỗ trợ', to: '/parent/chat-assistant', icon: <FiBookOpen /> },
      ],
    },
  ],
  parent: [
    {
      group: 'Con em & Hỗ trợ',
      items: [
        { label: 'Lịch sử nhận hỗ trợ', to: '/parent/student-support-history', icon: <FiUsers /> },
        { label: 'Minh chứng trao tặng', to: '/parent/donation-evidence', icon: <FiFileText /> },
        { label: 'Phản hồi sai lệch', to: '/parent/feedback', icon: <FiMessageSquare /> },
        { label: 'Trợ lý AI hỗ trợ', to: '/parent/chat-assistant', icon: <FiBookOpen /> },
      ],
    },
  ],
  [ROLES.FUNDRAISER]: [
    {
      group: 'Quản lý chiến dịch',
      items: [
        { label: 'Tạo bài kêu gọi', to: '/fundraiser/campaign-create', icon: <FiPlusSquare /> },
        { label: 'Cập nhật bài kêu gọi', to: '/fundraiser/campaign-update', icon: <FiHeart /> },
        { label: 'Tiến độ giải ngân', to: '/fundraiser/disbursement-progress', icon: <FiBarChart2 /> },
      ],
    },
    {
      group: 'Tiếp nhận & Phê duyệt',
      items: [
        { label: 'Duyệt đề xuất NHT', to: '/fundraiser/proposal-approval', icon: <FiCheckSquare /> },
        { label: 'Duyệt đơn tài trợ', to: '/fundraiser/sponsor-approval', icon: <FiCheckSquare /> },
        { label: 'Xác nhận tiếp nhận', to: '/fundraiser/donation-confirm', icon: <FiClock /> },
      ],
    },
    {
      group: 'Phân bổ học sinh',
      items: [
        { label: 'Phân bổ học bổng', to: '/fundraiser/scholarship-distribution', icon: <FiUsers /> },
        { label: 'Phân bổ đồ dùng', to: '/fundraiser/supplies-distribution', icon: <FiBookOpen /> },
      ],
    },
    {
      group: 'Tương tác & Hỗ trợ',
      items: [
        { label: 'Phản hồi phụ huynh', to: '/fundraiser/parent-feedback', icon: <FiMessageSquare /> },
        { label: 'Phản hồi nhà hảo tâm', to: '/fundraiser/donor-feedback', icon: <FiMessageSquare /> },
        { label: 'Trợ lý AI tạo content', to: '/fundraiser/chat-assistant', icon: <FiFileText /> },
      ],
    },
  ],
  fundraiser: [
    {
      group: 'Quản lý chiến dịch',
      items: [
        { label: 'Tạo bài kêu gọi', to: '/fundraiser/campaign-create', icon: <FiPlusSquare /> },
        { label: 'Cập nhật bài kêu gọi', to: '/fundraiser/campaign-update', icon: <FiHeart /> },
        { label: 'Tiến độ giải ngân', to: '/fundraiser/disbursement-progress', icon: <FiBarChart2 /> },
      ],
    },
    {
      group: 'Tiếp nhận & Phê duyệt',
      items: [
        { label: 'Duyệt đề xuất NHT', to: '/fundraiser/proposal-approval', icon: <FiCheckSquare /> },
        { label: 'Duyệt đơn tài trợ', to: '/fundraiser/sponsor-approval', icon: <FiCheckSquare /> },
        { label: 'Xác nhận tiếp nhận', to: '/fundraiser/donation-confirm', icon: <FiClock /> },
      ],
    },
    {
      group: 'Phân bổ học sinh',
      items: [
        { label: 'Phân bổ học bổng', to: '/fundraiser/scholarship-distribution', icon: <FiUsers /> },
        { label: 'Phân bổ đồ dùng', to: '/fundraiser/supplies-distribution', icon: <FiBookOpen /> },
      ],
    },
    {
      group: 'Tương tác & Hỗ trợ',
      items: [
        { label: 'Phản hồi phụ huynh', to: '/fundraiser/parent-feedback', icon: <FiMessageSquare /> },
        { label: 'Phản hồi nhà hảo tâm', to: '/fundraiser/donor-feedback', icon: <FiMessageSquare /> },
        { label: 'Trợ lý AI tạo content', to: '/fundraiser/chat-assistant', icon: <FiFileText /> },
      ],
    },
  ],
  [ROLES.PRINCIPAL]: [
    {
      group: 'Phê duyệt & Giám sát',
      items: [
        { label: 'Duyệt bài tài trợ', to: '/principal/campaign-approval', icon: <FiCheckSquare /> },
        { label: 'Duyệt đợt phân bổ', to: '/principal/distribution-approval', icon: <FiCheckSquare /> },
        { label: 'Báo cáo tài chính', to: '/principal/financial-report', icon: <FiBarChart2 /> },
      ],
    },
    {
      group: 'Phản hồi & Trao đổi',
      items: [
        { label: 'Phản hồi phụ huynh', to: '/principal/parent-feedback-view', icon: <FiMessageSquare /> },
        { label: 'Phản hồi của cán bộ', to: '/principal/staff-response-view', icon: <FiFileText /> },
      ],
    },
  ],
  principal: [
    {
      group: 'Phê duyệt & Giám sát',
      items: [
        { label: 'Duyệt bài tài trợ', to: '/principal/campaign-approval', icon: <FiCheckSquare /> },
        { label: 'Duyệt đợt phân bổ', to: '/principal/distribution-approval', icon: <FiCheckSquare /> },
        { label: 'Báo cáo tài chính', to: '/principal/financial-report', icon: <FiBarChart2 /> },
      ],
    },
    {
      group: 'Phản hồi & Trao đổi',
      items: [
        { label: 'Phản hồi phụ huynh', to: '/principal/parent-feedback-view', icon: <FiMessageSquare /> },
        { label: 'Phản hồi của cán bộ', to: '/principal/staff-response-view', icon: <FiFileText /> },
      ],
    },
  ],
  [ROLES.ADMIN]: [
    {
      group: 'Quản trị hệ thống',
      items: [
        { label: 'Quản lý người dùng', to: '/admin/user-management', icon: <FiUsers /> },
        { label: 'Hồ sơ học sinh & Import', to: '/admin/students', icon: <FiBookOpen /> },
        { label: 'Phân quyền hệ thống', to: '/admin/role-permission', icon: <FiSettings /> },
        { label: 'Thống kê chiến dịch', to: '/admin/campaign-statistics', icon: <FiBarChart2 /> },
      ],
    },
  ],
  admin: [
    {
      group: 'Quản trị hệ thống',
      items: [
        { label: 'Quản lý người dùng', to: '/admin/user-management', icon: <FiUsers /> },
        { label: 'Hồ sơ học sinh & Import', to: '/admin/students', icon: <FiBookOpen /> },
        { label: 'Phân quyền hệ thống', to: '/admin/role-permission', icon: <FiSettings /> },
        { label: 'Thống kê chiến dịch', to: '/admin/campaign-statistics', icon: <FiBarChart2 /> },
      ],
    },
  ],
};

const Sidebar = ({ defaultCollapsed = false }) => {
  const { role, roleCode } = useAuth();
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const menuGroups = MENU_BY_ROLE[role] || MENU_BY_ROLE[roleCode] || [];

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      {/* Header */}
      <div className="sidebar-header">
        {!collapsed && <span className="sidebar-title">Menu</span>}
        <button
          className="sidebar-toggle"
          onClick={() => setCollapsed((p) => !p)}
          aria-label={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
        >
          {collapsed ? <FiMenu size={18} /> : <FiChevronLeft size={18} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {menuGroups.map((group, gIdx) => (
          <div key={gIdx} className="sidebar-group">
            {!collapsed && (
              <div className="sidebar-group-label">{group.group}</div>
            )}
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                data-tooltip={item.label}
                className={({ isActive }) =>
                  `sidebar-item ${isActive ? 'sidebar-item--active' : ''}`
                }
                end={item.to.endsWith('dashboard')}
              >
                <span className="sidebar-item-icon">{item.icon}</span>
                <span className="sidebar-item-label">{item.label}</span>
                {item.badge && (
                  <span className="sidebar-item-badge">{item.badge}</span>
                )}
              </NavLink>
            ))}
            {gIdx < menuGroups.length - 1 && (
              <div className="sidebar-divider" />
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;

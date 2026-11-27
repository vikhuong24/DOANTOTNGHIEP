// Sidebar component - menu items theo role, collapsible
import { useState, useEffect, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  FiHeart, FiClock, FiMessageSquare,
  FiUsers, FiBookOpen, FiBarChart2, FiSettings, FiCheckSquare,
  FiPlusSquare, FiFileText, FiMenu, FiChevronLeft,
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { ROLES } from '../../utils/constants';
import api, { unwrapList } from '../../services/api';
import './Sidebar.css';

// Menu config theo role (đồng nhất tên gọi với Header trên tất cả tác nhân)
const MENU_BY_ROLE = {
  [ROLES.DONOR]: [
    {
      group: 'Chiến dịch gây quỹ',
      items: [
        { label: 'Chiến dịch', to: '/campaigns', icon: <FiHeart /> },
        { label: 'Tiến trình ủng hộ', to: '/donor/campaign-progress', icon: <FiBarChart2 /> },
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
        { label: 'Chiến dịch', to: '/campaigns', icon: <FiHeart /> },
        { label: 'Tiến trình ủng hộ', to: '/donor/campaign-progress', icon: <FiBarChart2 /> },
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
        { label: 'Chiến dịch', to: '/campaigns', icon: <FiHeart /> },
        { label: 'Lịch sử hỗ trợ', to: '/parent/student-support-history', icon: <FiUsers /> },
        { label: 'Minh chứng trao quà', to: '/parent/donation-evidence', icon: <FiFileText /> },
        { label: 'Phản hồi sai lệch', to: '/parent/feedback', icon: <FiMessageSquare /> },
        { label: 'Trợ lý AI', to: '/parent/chat-assistant', icon: <FiBookOpen /> },
      ],
    },
  ],
  parent: [
    {
      group: 'Con em & Hỗ trợ',
      items: [
        { label: 'Chiến dịch', to: '/campaigns', icon: <FiHeart /> },
        { label: 'Lịch sử hỗ trợ', to: '/parent/student-support-history', icon: <FiUsers /> },
        { label: 'Minh chứng trao quà', to: '/parent/donation-evidence', icon: <FiFileText /> },
        { label: 'Phản hồi sai lệch', to: '/parent/feedback', icon: <FiMessageSquare /> },
        { label: 'Trợ lý AI', to: '/parent/chat-assistant', icon: <FiBookOpen /> },
      ],
    },
  ],
  [ROLES.FUNDRAISER]: [
    {
      group: 'Quản lý chiến dịch',
      items: [
        { label: 'Tạo chiến dịch', to: '/fundraiser/campaign-create', icon: <FiPlusSquare /> },
        { label: 'Quản lý chiến dịch', to: '/fundraiser/campaign-update', icon: <FiHeart /> },
        { label: 'Tiến độ giải ngân', to: '/fundraiser/disbursement-progress', icon: <FiBarChart2 /> },
      ],
    },
    {
      group: 'Tiếp nhận & Phê duyệt',
      items: [
        { label: 'Duyệt đề xuất', to: '/fundraiser/proposal-approval', icon: <FiCheckSquare /> },
        { label: 'Duyệt tài trợ', to: '/fundraiser/sponsor-approval', icon: <FiCheckSquare /> },
        { label: 'Xác nhận tiếp nhận', to: '/fundraiser/donation-confirm', icon: <FiClock /> },
      ],
    },
    {
      group: 'Phân bổ học sinh',
      items: [
        { label: 'Danh mục học sinh', to: '/fundraiser/students', icon: <FiUsers /> },
        { label: 'Phân bổ học bổng', to: '/fundraiser/scholarship-distribution', icon: <FiUsers /> },
        { label: 'Phân bổ đồ dùng', to: '/fundraiser/supplies-distribution', icon: <FiBookOpen /> },
      ],
    },
    {
      group: 'Tương tác & Hỗ trợ',
      items: [
        { label: 'Phản hồi phụ huynh', to: '/fundraiser/parent-feedback', icon: <FiMessageSquare /> },
        { label: 'Phản hồi nhà hảo tâm', to: '/fundraiser/donor-feedback', icon: <FiMessageSquare /> },
        { label: 'Trợ lý AI', to: '/fundraiser/chat-assistant', icon: <FiFileText /> },
      ],
    },
  ],
  fundraiser: [
    {
      group: 'Quản lý chiến dịch',
      items: [
        { label: 'Tạo chiến dịch', to: '/fundraiser/campaign-create', icon: <FiPlusSquare /> },
        { label: 'Quản lý chiến dịch', to: '/fundraiser/campaign-update', icon: <FiHeart /> },
        { label: 'Tiến độ giải ngân', to: '/fundraiser/disbursement-progress', icon: <FiBarChart2 /> },
      ],
    },
    {
      group: 'Tiếp nhận & Phê duyệt',
      items: [
        { label: 'Duyệt đề xuất', to: '/fundraiser/proposal-approval', icon: <FiCheckSquare /> },
        { label: 'Duyệt tài trợ', to: '/fundraiser/sponsor-approval', icon: <FiCheckSquare /> },
        { label: 'Xác nhận tiếp nhận', to: '/fundraiser/donation-confirm', icon: <FiClock /> },
      ],
    },
    {
      group: 'Phân bổ học sinh',
      items: [
        { label: 'Danh mục học sinh', to: '/fundraiser/students', icon: <FiUsers /> },
        { label: 'Phân bổ học bổng', to: '/fundraiser/scholarship-distribution', icon: <FiUsers /> },
        { label: 'Phân bổ đồ dùng', to: '/fundraiser/supplies-distribution', icon: <FiBookOpen /> },
      ],
    },
    {
      group: 'Tương tác & Hỗ trợ',
      items: [
        { label: 'Phản hồi phụ huynh', to: '/fundraiser/parent-feedback', icon: <FiMessageSquare /> },
        { label: 'Phản hồi nhà hảo tâm', to: '/fundraiser/donor-feedback', icon: <FiMessageSquare /> },
        { label: 'Trợ lý AI', to: '/fundraiser/chat-assistant', icon: <FiFileText /> },
      ],
    },
  ],
  [ROLES.PRINCIPAL]: [
    {
      group: 'Phê duyệt & Giám sát',
      items: [
        { label: 'Duyệt chiến dịch', to: '/principal/campaign-approval', icon: <FiCheckSquare /> },
        { label: 'Duyệt phân bổ', to: '/principal/distribution-approval', icon: <FiCheckSquare /> },
        { label: 'Báo cáo tài chính', to: '/principal/financial-report', icon: <FiBarChart2 /> },
      ],
    },
    {
      group: 'Phản hồi & Trao đổi',
      items: [
        { label: 'Phản hồi phụ huynh', to: '/principal/parent-feedback-view', icon: <FiMessageSquare /> },
        { label: 'Phản hồi cán bộ', to: '/principal/staff-response-view', icon: <FiFileText /> },
      ],
    },
  ],
  principal: [
    {
      group: 'Phê duyệt & Giám sát',
      items: [
        { label: 'Duyệt chiến dịch', to: '/principal/campaign-approval', icon: <FiCheckSquare /> },
        { label: 'Duyệt phân bổ', to: '/principal/distribution-approval', icon: <FiCheckSquare /> },
        { label: 'Báo cáo tài chính', to: '/principal/financial-report', icon: <FiBarChart2 /> },
      ],
    },
    {
      group: 'Phản hồi & Trao đổi',
      items: [
        { label: 'Phản hồi phụ huynh', to: '/principal/parent-feedback-view', icon: <FiMessageSquare /> },
        { label: 'Phản hồi cán bộ', to: '/principal/staff-response-view', icon: <FiFileText /> },
      ],
    },
  ],
  [ROLES.ADMIN]: [
    {
      group: 'Quản trị hệ thống',
      items: [
        { label: 'Quản lý người dùng', to: '/admin/user-management', icon: <FiUsers /> },
        { label: 'Hồ sơ học sinh', to: '/admin/students', icon: <FiBookOpen /> },
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
        { label: 'Hồ sơ học sinh', to: '/admin/students', icon: <FiBookOpen /> },
        { label: 'Phân quyền hệ thống', to: '/admin/role-permission', icon: <FiSettings /> },
        { label: 'Thống kê chiến dịch', to: '/admin/campaign-statistics', icon: <FiBarChart2 /> },
      ],
    },
  ],
};

const Sidebar = ({ defaultCollapsed = false }) => {
  const { role, roleCode } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [badges, setBadges] = useState({});

  const menuGroups = MENU_BY_ROLE[role] || MENU_BY_ROLE[roleCode] || [];

  const isFundraiser =
    role === ROLES.FUNDRAISER ||
    role === 'fundraiser' ||
    roleCode === 'CANBOGAYQUY' ||
    roleCode === 'FUNDRAISER';

  const isPrincipal =
    role === ROLES.PRINCIPAL ||
    role === 'principal' ||
    roleCode === 'HIEUTRUONG' ||
    roleCode === 'PRINCIPAL';

  const fetchBadges = useCallback(async () => {
    if (isFundraiser) {
      const [proposalsRes, donationsRes, feedbacksRes, distsRes] = await Promise.allSettled([
        api.get('/fundraiser/approvals/proposals'),
        api.get('/fundraiser/approvals/donations'),
        api.get('/fundraiser/feedbacks', { params: { trangThai: 'CHOXULY' } }),
        api.get('/fundraiser/distributions'),
      ]);

      const next = {};
      if (proposalsRes.status === 'fulfilled') {
        const list = unwrapList(proposalsRes.value);
        next['/fundraiser/proposal-approval'] = list.filter(
          (p) => String(p.trangThai || p.trangthai || '').toUpperCase() === 'CHODUYET'
        ).length;
      }
      if (donationsRes.status === 'fulfilled') {
        const list = unwrapList(donationsRes.value);
        next['/fundraiser/sponsor-approval'] = list.filter(
          (d) => String(d.trangThai || d.trangthai || '').toUpperCase() === 'CHODUYET'
        ).length;
        next['/fundraiser/donation-confirm'] = list.filter(
          (d) => String(d.trangThai || d.trangthai || '').toUpperCase() === 'DADUYET'
        ).length;
      }
      if (feedbacksRes.status === 'fulfilled') {
        const list = unwrapList(feedbacksRes.value);
        const pendingFb = list.filter(
          (f) => String(f.trangThai || f.trangthai || 'CHOXULY').toUpperCase() === 'CHOXULY'
        ).length;
        next['/fundraiser/parent-feedback'] = pendingFb;
        next['/fundraiser/donor-feedback'] = pendingFb;
      }
      if (distsRes.status === 'fulfilled') {
        const list = unwrapList(distsRes.value);
        next['/fundraiser/disbursement-progress'] = list.filter(
          (d) => String(d.trangThai || d.trangthai || '').toUpperCase() === 'DADUYET'
        ).length;
      }
      setBadges(next);
    } else if (isPrincipal) {
      const [campaignsRes, distsRes] = await Promise.allSettled([
        api.get('/principal/approvals/campaigns'),
        api.get('/principal/approvals/distributions'),
      ]);

      const next = {};
      if (campaignsRes.status === 'fulfilled') {
        const list = unwrapList(campaignsRes.value);
        next['/principal/campaign-approval'] = list.filter(
          (c) => String(c.trangThai || c.trangthai || '').toUpperCase() === 'CHODUYET'
        ).length;
      }
      if (distsRes.status === 'fulfilled') {
        const list = unwrapList(distsRes.value);
        next['/principal/distribution-approval'] = list.filter(
          (d) => String(d.trangThai || d.trangthai || '').toUpperCase() === 'CHODUYET'
        ).length;
      }
      setBadges(next);
    } else {
      setBadges({});
    }
  }, [isFundraiser, isPrincipal]);

  useEffect(() => {
    fetchBadges();
  }, [fetchBadges, location.pathname]);

  useEffect(() => {
    const handler = () => fetchBadges();
    window.addEventListener('sidebar:refresh-badges', handler);
    return () => window.removeEventListener('sidebar:refresh-badges', handler);
  }, [fetchBadges]);

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
                {(badges[item.to] || item.badge) > 0 && (
                  <span className="sidebar-item-badge">
                    {(badges[item.to] || item.badge) > 99 ? '99+' : (badges[item.to] || item.badge)}
                  </span>
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

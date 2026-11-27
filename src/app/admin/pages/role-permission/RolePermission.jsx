import { useState, useEffect, Fragment } from 'react';
import { FiShield } from 'react-icons/fi';
import Table from '../../../../components/Table/Table';
import { useNotification } from '../../../../components/Notification/Notification';
import { getRoles } from '../../../../services/userService';
import './RolePermission.css';

const ROLE_COLUMNS = [
  { code: 'NHATAITRO', label: 'Nhà hảo tâm' },
  { code: 'PHUHUYNH', label: 'Phụ huynh' },
  { code: 'CANBO', label: 'Cán bộ gây quỹ' },
  { code: 'HIEUTRUONG', label: 'Hiệu trưởng' },
  { code: 'ADMIN', label: 'Quản trị viên' },
];

const FEATURES = [
  { group: 'Chiến dịch gây quỹ', items: [
    { key: 'campaign.view', label: 'Xem danh sách chiến dịch', roles: ['NHATAITRO', 'PHUHUYNH', 'CANBO', 'HIEUTRUONG', 'ADMIN'] },
    { key: 'campaign.create', label: 'Tạo & cập nhật chiến dịch', roles: ['CANBO'] },
    { key: 'campaign.approve', label: 'Phê duyệt / từ chối chiến dịch', roles: ['HIEUTRUONG', 'ADMIN'] },
  ]},
  { group: 'Tài trợ & Đề xuất', items: [
    { key: 'donation.register', label: 'Đăng ký tài trợ & đề xuất', roles: ['NHATAITRO'] },
    { key: 'donation.approve', label: 'Duyệt đề xuất, tài trợ & xác nhận thực nhận', roles: ['CANBO'] },
  ]},
  { group: 'Phân bổ & Minh chứng', items: [
    { key: 'dist.create', label: 'Lập kế hoạch phân bổ & upload minh chứng', roles: ['CANBO'] },
    { key: 'dist.approve', label: 'Phê duyệt kế hoạch phân bổ', roles: ['HIEUTRUONG', 'ADMIN'] },
    { key: 'dist.parent', label: 'Xem lịch sử nhận hỗ trợ của con em', roles: ['PHUHUYNH'] },
  ]},
  { group: 'Phản hồi & Báo cáo', items: [
    { key: 'feedback.reply', label: 'Trả lời phản hồi phụ huynh & nhà hảo tâm', roles: ['CANBO'] },
    { key: 'feedback.monitor', label: 'Giám sát phản hồi & xem báo cáo tài chính', roles: ['HIEUTRUONG', 'ADMIN'] },
  ]},
  { group: 'Quản trị hệ thống', items: [
    { key: 'admin.users', label: 'Quản lý vai trò, người dùng & thống kê chiến dịch', roles: ['ADMIN'] },
  ]},
];

const RolePermission = () => {
  const { addToast } = useNotification();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      setLoading(true);
      try {
        const list = await getRoles();
        setRoles(Array.isArray(list) ? list : []);
      } catch (err) {
        addToast(err?.response?.data?.message || err?.message || 'Không thể tải danh sách vai trò', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, [addToast]);

  const roleTableColumns = [
    { key: 'maVaiTro', title: 'Mã vai trò', width: 110, render: (v) => `#${v}` },
    {
      key: 'tenVaiTro',
      title: 'Tên vai trò',
      width: 180,
      render: (v) => <strong>{v}</strong>,
    },
    { key: 'moTa', title: 'Mô tả quyền hạn', render: (v) => v || '—' },
  ];

  return (
    <div className="role-permission">
      <div className="rp-header">
        <div>
          <h1>Quản lý vai trò & phân quyền hệ thống</h1>
          <p>Danh mục vai trò thực tế từ hệ thống (GET /admin/roles) và ma trận phân quyền theo chuẩn bảo mật Backend</p>
        </div>
        <div className="rp-actions" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)', fontWeight: 600 }}>
          <FiShield /> Chỉ xem (Phân quyền cố định tại Backend)
        </div>
      </div>

      <div className="rp-table-wrap" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <h3 style={{ marginTop: 0, marginBottom: '0.75rem' }}>Danh mục vai trò ({roles.length})</h3>
        <Table
          columns={roleTableColumns}
          data={roles}
          loading={loading}
          rowKey="maVaiTro"
          emptyTitle="Không có vai trò"
          emptyDescription="Chưa tải được danh mục vai trò từ hệ thống."
        />
      </div>

      <div className="rp-table-wrap">
        <table className="rp-table">
          <thead>
            <tr>
              <th className="rp-th-feature">Chức năng hệ thống</th>
              {ROLE_COLUMNS.map((r) => (
                <th key={r.code} className="rp-th-role">{r.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FEATURES.map((group) => (
              <Fragment key={group.group}>
                <tr className="rp-group-row">
                  <td colSpan={ROLE_COLUMNS.length + 1} className="rp-group-label">
                    {group.group}
                  </td>
                </tr>
                {group.items.map((feat) => (
                  <tr key={feat.key} className="rp-row">
                    <td className="rp-feature-label">{feat.label}</td>
                    {ROLE_COLUMNS.map((role) => (
                      <td key={role.code} className="rp-cell">
                        <label className="rp-checkbox">
                          <input
                            type="checkbox"
                            checked={feat.roles.includes(role.code)}
                            disabled
                            readOnly
                          />
                        </label>
                      </td>
                    ))}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RolePermission;

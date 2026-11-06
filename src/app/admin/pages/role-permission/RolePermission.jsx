import { useState, Fragment } from 'react';
import { FiSave, FiRefreshCw } from 'react-icons/fi';
import Button from '../../../../components/Button/Button';
import { useNotification } from '../../../../components/Notification/Notification';
import './RolePermission.css';

const ROLES_LIST = [
  { code: 'NHT', label: 'Nhà hảo tâm' },
  { code: 'PH', label: 'Phụ huynh' },
  { code: 'CBQL', label: 'Cán bộ QL' },
  { code: 'HT', label: 'Hiệu trưởng' },
  { code: 'ADMIN', label: 'Admin' },
];

const FEATURES = [
  { group: 'Chiến dịch gây quỹ', items: [
    { key: 'campaign.view', label: 'Xem danh sách chiến dịch' },
    { key: 'campaign.create', label: 'Tạo chiến dịch mới' },
    { key: 'campaign.edit', label: 'Chỉnh sửa chiến dịch' },
    { key: 'campaign.approve', label: 'Phê duyệt chiến dịch' },
    { key: 'campaign.delete', label: 'Xóa chiến dịch' },
  ]},
  { group: 'Tài trợ & Quyên góp', items: [
    { key: 'donation.view', label: 'Xem danh sách tài trợ' },
    { key: 'donation.register', label: 'Đăng ký tài trợ' },
    { key: 'donation.confirm', label: 'Xác nhận tiếp nhận tài trợ' },
  ]},
  { group: 'Phân bổ học sinh', items: [
    { key: 'dist.view', label: 'Xem đợt phân bổ' },
    { key: 'dist.create', label: 'Tạo đợt phân bổ' },
    { key: 'dist.approve', label: 'Phê duyệt đợt phân bổ' },
  ]},
  { group: 'Người dùng', items: [
    { key: 'user.view', label: 'Xem danh sách người dùng' },
    { key: 'user.create', label: 'Tạo người dùng' },
    { key: 'user.edit', label: 'Chỉnh sửa người dùng' },
    { key: 'user.delete', label: 'Xóa người dùng' },
  ]},
  { group: 'Báo cáo & Thống kê', items: [
    { key: 'report.view', label: 'Xem báo cáo tài chính' },
    { key: 'report.export', label: 'Xuất báo cáo' },
  ]},
];

const DEFAULT_PERMISSIONS = {
  'campaign.view': { NHT: true, PH: true, CBQL: true, HT: true, ADMIN: true },
  'campaign.create': { NHT: false, PH: false, CBQL: true, HT: false, ADMIN: true },
  'campaign.edit': { NHT: false, PH: false, CBQL: true, HT: false, ADMIN: true },
  'campaign.approve': { NHT: false, PH: false, CBQL: false, HT: true, ADMIN: true },
  'campaign.delete': { NHT: false, PH: false, CBQL: false, HT: false, ADMIN: true },
  'donation.view': { NHT: true, PH: false, CBQL: true, HT: true, ADMIN: true },
  'donation.register': { NHT: true, PH: false, CBQL: false, HT: false, ADMIN: false },
  'donation.confirm': { NHT: false, PH: false, CBQL: true, HT: false, ADMIN: true },
  'dist.view': { NHT: false, PH: true, CBQL: true, HT: true, ADMIN: true },
  'dist.create': { NHT: false, PH: false, CBQL: true, HT: false, ADMIN: true },
  'dist.approve': { NHT: false, PH: false, CBQL: false, HT: true, ADMIN: true },
  'user.view': { NHT: false, PH: false, CBQL: false, HT: false, ADMIN: true },
  'user.create': { NHT: false, PH: false, CBQL: false, HT: false, ADMIN: true },
  'user.edit': { NHT: false, PH: false, CBQL: false, HT: false, ADMIN: true },
  'user.delete': { NHT: false, PH: false, CBQL: false, HT: false, ADMIN: true },
  'report.view': { NHT: false, PH: false, CBQL: true, HT: true, ADMIN: true },
  'report.export': { NHT: false, PH: false, CBQL: false, HT: true, ADMIN: true },
};

const RolePermission = () => {
  const { addToast } = useNotification();
  const [permissions, setPermissions] = useState({ ...DEFAULT_PERMISSIONS });
  const [saving, setSaving] = useState(false);

  const toggle = (featureKey, roleCode) => {
    setPermissions((prev) => ({
      ...prev,
      [featureKey]: {
        ...prev[featureKey],
        [roleCode]: !prev[featureKey]?.[roleCode],
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    addToast('Đã lưu cấu hình phân quyền thành công', 'success');
  };

  const handleReset = () => {
    setPermissions({ ...DEFAULT_PERMISSIONS });
    addToast('Đã khôi phục về cài đặt mặc định', 'info');
  };

  return (
    <div className="role-permission">
      <div className="rp-header">
        <div>
          <h1>Phân quyền hệ thống</h1>
          <p>Cấu hình quyền truy cập chức năng cho từng vai trò người dùng</p>
        </div>
        <div className="rp-actions">
          <Button variant="outline" onClick={handleReset}>
            <FiRefreshCw /> Khôi phục mặc định
          </Button>
          <Button variant="primary" loading={saving} onClick={handleSave}>
            <FiSave /> Lưu cấu hình
          </Button>
        </div>
      </div>

      <div className="rp-table-wrap">
        <table className="rp-table">
          <thead>
            <tr>
              <th className="rp-th-feature">Chức năng</th>
              {ROLES_LIST.map((r) => (
                <th key={r.code} className="rp-th-role">{r.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FEATURES.map((group) => (
              <Fragment key={group.group}>
                <tr className="rp-group-row">
                  <td colSpan={ROLES_LIST.length + 1} className="rp-group-label">
                    {group.group}
                  </td>
                </tr>
                {group.items.map((feat) => (
                  <tr key={feat.key} className="rp-row">
                    <td className="rp-feature-label">{feat.label}</td>
                    {ROLES_LIST.map((role) => (
                      <td key={role.code} className="rp-cell">
                        <label className="rp-checkbox">
                          <input
                            type="checkbox"
                            checked={!!permissions[feat.key]?.[role.code]}
                            onChange={() => toggle(feat.key, role.code)}
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

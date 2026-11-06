// Profile: Hồ sơ cá nhân Nhà hảo tâm, chỉnh sửa thông tin, đổi mật khẩu và liên kết lịch sử đóng góp
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiLock, FiClock } from 'react-icons/fi';
import Input from '../../../../components/Input/Input';
import Button from '../../../../components/Button/Button';
import Tabs from '../../../../components/Tabs/Tabs';
import { useAuth } from '../../../../contexts/AuthContext';
import { useNotification } from '../../../../components/Notification/Notification';
import { updateProfile, changePassword } from '../../../../services/authService';
import { validatePhone, validatePassword, validateRequired } from '../../../../utils/validators';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useNotification();

  const [activeTab, setActiveTab] = useState('info');

  // Form Thông tin cá nhân
  const [profileData, setProfileData] = useState({
    hoten: user?.hoten || user?.name || '',
    email: user?.email || '',
    sdt: user?.sdt || '',
    diachi: user?.diachi || '',
    avatar: user?.avatar || '',
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Form Đổi mật khẩu
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [loadingPassword, setLoadingPassword] = useState(false);

  // Xử lý đổi tab
  const handleTabChange = (val) => {
    setActiveTab(val);
  };

  // Cập nhật thông tin cá nhân
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
    if (profileErrors[name]) setProfileErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const errs = {};
    const nameErr = validateRequired(profileData.hoten, 'Họ và tên');
    if (nameErr) errs.hoten = nameErr;

    const phoneErr = validatePhone(profileData.sdt);
    if (phoneErr) errs.sdt = phoneErr;

    if (Object.keys(errs).length > 0) {
      setProfileErrors(errs);
      return;
    }

    setLoadingProfile(true);
    try {
      await updateProfile({
        hoten: profileData.hoten,
        name: profileData.hoten,
        sdt: profileData.sdt,
        diachi: profileData.diachi,
        avatar: profileData.avatar,
      });
      addToast('Cập nhật hồ sơ thành công!', 'success');
    } catch (err) {
      addToast(err?.message || 'Không thể cập nhật hồ sơ', 'error');
    } finally {
      setLoadingProfile(false);
    }
  };

  // Đổi mật khẩu
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) setPasswordErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!passwordData.oldPassword) errs.oldPassword = 'Vui lòng nhập mật khẩu cũ';
    const passErr = validatePassword(passwordData.newPassword);
    if (passErr) errs.newPassword = passErr;

    if (!passwordData.confirmPassword) {
      errs.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errs.confirmPassword = 'Mật khẩu xác nhận không trùng khớp';
    }

    if (Object.keys(errs).length > 0) {
      setPasswordErrors(errs);
      return;
    }

    setLoadingPassword(true);
    try {
      await changePassword(passwordData.oldPassword, passwordData.newPassword);
      addToast('Đổi mật khẩu thành công!', 'success');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      addToast(err?.message || 'Mật khẩu cũ không chính xác', 'error');
    } finally {
      setLoadingPassword(false);
    }
  };

  const tabsConfig = [
    { value: 'info', label: 'Thông tin cá nhân', icon: <FiUser /> },
    { value: 'security', label: 'Bảo mật & Đổi mật khẩu', icon: <FiLock /> },
  ];

  return (
    <div className="profile-page">
      {/* Header Profile Card */}
      <div className="profile-header-card">
        <div className="profile-avatar-large">
          {profileData.avatar ? (
            <img src={profileData.avatar} alt={profileData.hoten} />
          ) : (
            (profileData.hoten || 'N')[0]?.toUpperCase()
          )}
        </div>
        <div className="profile-header-info">
          <h2>{profileData.hoten || 'Nhà hảo tâm'}</h2>
          <p>{profileData.email}</p>
          <div style={{ marginTop: '0.5rem' }}>
            <span className="badge badge--success">Nhà hảo tâm đồng hành</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs-wrap">
        <Tabs tabs={tabsConfig} active={activeTab} onChange={handleTabChange} />
      </div>

      {/* Tab Content: Thông tin cá nhân */}
      {activeTab === 'info' && (
        <div className="profile-section-card">
          <h3 style={{ marginBottom: '1.25rem' }}>Chỉnh sửa thông tin liên hệ</h3>
          <form onSubmit={handleUpdateProfile} className="profile-form">
            <div className="profile-form-row">
              <Input
                label="Họ và tên"
                name="hoten"
                value={profileData.hoten}
                onChange={handleProfileChange}
                error={profileErrors.hoten}
                required
              />
              <Input
                label="Địa chỉ Email"
                name="email"
                value={profileData.email}
                disabled
                helpText="Email đăng nhập không thể thay đổi"
              />
            </div>

            <div className="profile-form-row">
              <Input
                label="Số điện thoại"
                name="sdt"
                value={profileData.sdt}
                onChange={handleProfileChange}
                error={profileErrors.sdt}
                required
              />
              <Input
                label="Đường dẫn ảnh đại diện (URL)"
                name="avatar"
                placeholder="https://..."
                value={profileData.avatar}
                onChange={handleProfileChange}
              />
            </div>

            <Input
              label="Địa chỉ cư trú / Doanh nghiệp"
              name="diachi"
              value={profileData.diachi}
              onChange={handleProfileChange}
              placeholder="Quận/Huyện, Tỉnh/TP"
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <Button type="submit" variant="primary" loading={loadingProfile}>
                Lưu thay đổi thông tin
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Tab Content: Đổi mật khẩu */}
      {activeTab === 'security' && (
        <div className="profile-section-card">
          <h3 style={{ marginBottom: '1.25rem' }}>Thiết lập mật khẩu mới</h3>
          <form onSubmit={handleChangePassword} className="profile-form" style={{ maxWidth: '480px' }}>
            <Input
              label="Mật khẩu hiện tại"
              name="oldPassword"
              type="password"
              value={passwordData.oldPassword}
              onChange={handlePasswordChange}
              error={passwordErrors.oldPassword}
              required
            />

            <Input
              label="Mật khẩu mới"
              name="newPassword"
              type="password"
              placeholder="Tối thiểu 6 ký tự"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              error={passwordErrors.newPassword}
              required
            />

            <Input
              label="Xác nhận mật khẩu mới"
              name="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              error={passwordErrors.confirmPassword}
              required
            />

            <div style={{ marginTop: '1rem' }}>
              <Button type="submit" variant="primary" loading={loadingPassword}>
                Cập nhật mật khẩu
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;

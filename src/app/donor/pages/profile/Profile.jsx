// Profile: Hồ sơ cá nhân Nhà hảo tâm, chỉnh sửa thông tin liên hệ và xem trạng thái tài khoản
// Kết nối trực tiếp API Backend Spring Boot: GET /donor/profile và PUT /donor/profile
import { useState, useEffect } from 'react';
import { FiUser, FiLock, FiCalendar, FiMapPin, FiPhone, FiMail } from 'react-icons/fi';
import Input from '../../../../components/Input/Input';
import Button from '../../../../components/Button/Button';
import Tabs from '../../../../components/Tabs/Tabs';
import Loading from '../../../../components/Loading/Loading';
import { useAuth } from '../../../../contexts/AuthContext';
import { useNotification } from '../../../../components/Notification/Notification';
import { getProfile, updateProfile } from '../../../../services/authService';
import { validatePhone, validateEmail, validateRequired } from '../../../../utils/validators';
import { formatDate } from '../../../../utils/formatDate';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { addToast } = useNotification();

  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(true);

  // Form Thông tin cá nhân
  const [profileData, setProfileData] = useState({
    maNguoiDung: null,
    hoten: '',
    email: '',
    sdt: '',
    diachi: '',
    ngayTao: null,
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

  // Tải dữ liệu hồ sơ từ Backend khi mở trang
  useEffect(() => {
    let isMounted = true;
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const data = await getProfile();
        if (isMounted && data) {
          setProfileData({
            maNguoiDung: data.maNguoiDung || data.id,
            hoten: data.hoTen || user?.hoten || user?.name || '',
            email: data.email || user?.email || '',
            sdt: data.sdt || user?.sdt || '',
            diachi: data.diaChi || user?.diaChi || user?.diachi || '',
            ngayTao: data.ngayTao || null,
          });
        }
      } catch (err) {
        console.error('Lỗi khi tải hồ sơ Nhà hảo tâm:', err);
        addToast(err?.message || 'Không thể tải thông tin hồ sơ từ máy chủ', 'error');
        // Fallback sang thông tin từ token/context
        if (isMounted && user) {
          setProfileData({
            maNguoiDung: user.maNguoiDung || user.id,
            hoten: user.hoten || user.name || '',
            email: user.email || '',
            sdt: user.sdt || '',
            diachi: user.diaChi || user.diachi || '',
            ngayTao: null,
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfileData();
    return () => {
      isMounted = false;
    };
  }, []);

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

    const emailErr = validateEmail(profileData.email);
    if (emailErr) errs.email = emailErr;

    if (profileData.sdt) {
      const phoneErr = validatePhone(profileData.sdt);
      if (phoneErr) errs.sdt = phoneErr;
    }

    if (Object.keys(errs).length > 0) {
      setProfileErrors(errs);
      return;
    }

    setLoadingProfile(true);
    try {
      const res = await updateProfile({
        hoTen: profileData.hoten,
        email: profileData.email,
        sdt: profileData.sdt,
        diaChi: profileData.diachi,
      });

      if (updateUser && res.user) {
        updateUser(res.user);
      }

      addToast(res.message || 'Cập nhật hồ sơ thành công!', 'success');
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message || err?.message || 'Không thể cập nhật hồ sơ cá nhân';
      addToast(errorMsg, 'error');
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
    if (!passwordData.newPassword) {
      errs.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (passwordData.newPassword.length < 6) {
      errs.newPassword = 'Mật khẩu mới phải từ 6 ký tự trở lên';
    }

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
      // Backend hiện tại chưa cung cấp endpoint đổi mật khẩu cho Nhà hảo tâm
      addToast(
        'Hệ thống đang bảo trì chức năng đổi mật khẩu trực tuyến. Quý nhà hảo tâm vui lòng liên hệ quản trị viên nhà trường để được hỗ trợ cấp lại mật khẩu!',
        'info'
      );
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      addToast(err?.message || 'Không thể đổi mật khẩu', 'error');
    } finally {
      setLoadingPassword(false);
    }
  };

  const tabsConfig = [
    { value: 'info', label: 'Thông tin cá nhân', icon: <FiUser /> },
    { value: 'security', label: 'Bảo mật & Đổi mật khẩu', icon: <FiLock /> },
  ];

  if (loading) {
    return (
      <div className="profile-page" style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
        <Loading text="Đang tải dữ liệu hồ sơ cá nhân..." />
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Header Profile Card */}
      <div className="profile-header-card">
        <div className="profile-avatar-large">
          {(profileData.hoten || user?.hoten || 'N')[0]?.toUpperCase()}
        </div>
        <div className="profile-header-info">
          <h2>{profileData.hoten || user?.hoten || 'Nhà hảo tâm'}</h2>
          <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FiMail /> {profileData.email || user?.email}
          </p>
          <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span className="badge badge--success">Nhà hảo tâm đồng hành</span>
            {profileData.ngayTao && (
              <span className="badge" style={{ background: '#e9ecef', color: '#495057' }}>
                <FiCalendar style={{ marginRight: '4px' }} /> Tham gia: {formatDate(profileData.ngayTao)}
              </span>
            )}
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
                type="email"
                value={profileData.email}
                onChange={handleProfileChange}
                error={profileErrors.email}
                required
                helpText="Email sử dụng để nhận thông báo và đối soát tài trợ"
              />
            </div>

            <div className="profile-form-row">
              <Input
                label="Số điện thoại"
                name="sdt"
                value={profileData.sdt}
                onChange={handleProfileChange}
                error={profileErrors.sdt}
                placeholder="0912345678 (10 chữ số)"
                helpText="Bắt đầu bằng 0 và bao gồm đúng 10 chữ số"
              />
              <Input
                label="Địa chỉ cư trú / Doanh nghiệp"
                name="diachi"
                value={profileData.diachi}
                onChange={handleProfileChange}
                placeholder="Quận/Huyện, Tỉnh/TP"
              />
            </div>

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
          <div
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: '#e7f5ff',
              borderLeft: '4px solid var(--primary)',
              borderRadius: '4px',
              fontSize: '0.875rem',
              color: '#1864ab',
              marginBottom: '1.5rem',
            }}
          >
            <strong>Lưu ý bảo mật:</strong> Để đảm bảo an toàn tuyệt đối cho tài khoản đóng góp từ thiện, mật khẩu tài khoản được mã hóa một chiều Bcrypt trên hệ thống.
          </div>

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
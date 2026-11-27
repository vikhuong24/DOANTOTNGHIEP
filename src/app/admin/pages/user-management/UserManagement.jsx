import { useState, useEffect, useCallback } from 'react';
import { FiEdit2, FiLock, FiUnlock, FiPlus, FiSearch, FiX, FiEye } from 'react-icons/fi';
import Table from '../../../../components/Table/Table';
import Modal from '../../../../components/Modal/Modal';
import Button from '../../../../components/Button/Button';
import { useNotification } from '../../../../components/Notification/Notification';
import { useAuth } from '../../../../contexts/AuthContext';
import {
  getAllUsers, getUserById, createUser, updateUser, toggleUserStatus, getRoles
} from '../../../../services/userService';
import { formatDate } from '../../../../utils/formatters';
import './UserManagement.css';

const TRANGTHAI_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'HOATDONG', label: 'Hoạt động' },
  { value: 'KHOA', label: 'Đã khóa' },
];

const EMPTY_FORM = {
  hoten: '',
  email: '',
  sdt: '',
  tendangnhap: '',
  matkhau: '',
  maVaiTro: 4,
  diachi: '',
  trangthai: 'HOATDONG',
};

const statusBadge = (s) => {
  const st = String(s || '').toUpperCase();
  const map = {
    HOATDONG: { label: 'Hoạt động', cls: 'um-badge--active' },
    KHOA: { label: 'Đã khóa', cls: 'um-badge--locked' },
  };
  const info = map[st] || { label: st || '—', cls: '' };
  return <span className={`um-badge ${info.cls}`}>{info.label}</span>;
};

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map((w) => w[0]).slice(-2).join('').toUpperCase();
};

const UserFormFields = ({ form, formErrors, roles, modalType, isSelfEdit, onChange }) => (
  <div className="um-form">
    <div className="um-form__row">
      <div className={`um-form__field ${formErrors.hoten ? 'um-form__field--error' : ''}`}>
        <label>Họ và tên <span className="um-form__req">*</span></label>
        <input name="hoten" value={form.hoten} onChange={onChange} placeholder="Nguyễn Văn A" />
        {formErrors.hoten && <span>{formErrors.hoten}</span>}
      </div>
      <div className={`um-form__field ${formErrors.email ? 'um-form__field--error' : ''}`}>
        <label>Email</label>
        <input name="email" type="email" value={form.email} onChange={onChange} placeholder="email@example.com" />
        {formErrors.email && <span>{formErrors.email}</span>}
      </div>
    </div>
    <div className="um-form__row">
      <div className="um-form__field">
        <label>Số điện thoại</label>
        <input name="sdt" value={form.sdt} onChange={onChange} placeholder="09xxxxxxxx" />
      </div>
      <div className="um-form__field">
        <label>Địa chỉ</label>
        <input name="diachi" value={form.diachi} onChange={onChange} placeholder="Đà Nẵng" />
      </div>
    </div>
    <div className="um-form__row">
      <div className={`um-form__field ${formErrors.tendangnhap ? 'um-form__field--error' : ''}`}>
        <label>Tên đăng nhập <span className="um-form__req">*</span></label>
        <input
          name="tendangnhap"
          value={form.tendangnhap}
          onChange={onChange}
          placeholder="username"
          disabled={modalType === 'edit'}
        />
        {formErrors.tendangnhap && <span>{formErrors.tendangnhap}</span>}
      </div>
      <div className={`um-form__field ${formErrors.matkhau ? 'um-form__field--error' : ''}`}>
        <label>Mật khẩu {modalType === 'add' && <span className="um-form__req">*</span>}</label>
        <input
          name="matkhau"
          type="password"
          value={form.matkhau}
          onChange={onChange}
          placeholder={modalType === 'edit' ? 'Để trống nếu không đổi (tối thiểu 6 ký tự)' : 'Tối thiểu 6 ký tự'}
        />
        {formErrors.matkhau && <span>{formErrors.matkhau}</span>}
      </div>
    </div>
    <div className="um-form__row">
      <div className="um-form__field">
        <label>Vai trò</label>
        <select name="maVaiTro" value={form.maVaiTro} onChange={onChange} disabled={isSelfEdit}>
          {roles.map((r) => (
            <option key={r.maVaiTro} value={r.maVaiTro}>
              {r.tenVaiTro}{r.moTa ? ` — ${r.moTa}` : ''}
            </option>
          ))}
        </select>
        {isSelfEdit && (
          <small style={{ color: '#888' }}>Không thể tự thay đổi vai trò của chính tài khoản đang đăng nhập.</small>
        )}
      </div>
      <div className="um-form__field">
        <label>Trạng thái</label>
        <select name="trangthai" value={form.trangthai} onChange={onChange} disabled={isSelfEdit}>
          <option value="HOATDONG">Hoạt động</option>
          <option value="KHOA">Đã khóa</option>
        </select>
      </div>
    </div>
  </div>
);

const UserManagement = () => {
  const { addToast } = useNotification();
  const { user: currentUser } = useAuth();
  const currentUserId = currentUser?.maNguoiDung || currentUser?.id;

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modalType, setModalType] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllUsers({
        search,
        roleId: filterRole || undefined,
        trangthai: filterStatus || undefined,
      });
      setUsers(res.data || res || []);
    } catch (err) {
      addToast(err?.response?.data?.message || err?.message || 'Không thể tải danh sách người dùng', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, filterRole, filterStatus, addToast]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { getRoles().then(setRoles); }, []);

  const openAdd = () => {
    setSelectedUser(null);
    setForm({ ...EMPTY_FORM, maVaiTro: roles[0]?.maVaiTro || 4 });
    setFormErrors({});
    setModalType('add');
  };

  const openDetail = async (u) => {
    setSelectedUser(u);
    setModalType('detail');
    try {
      const detail = await getUserById(u.maNguoiDung);
      if (detail) setSelectedUser(detail);
    } catch {
      // Giữ thông tin hiện tại nếu gọi detail lỗi
    }
  };

  const openEdit = (u) => {
    setSelectedUser(u);
    setForm({
      hoten: u.hoten || '',
      email: u.email || '',
      sdt: u.sdt || '',
      tendangnhap: u.tendangnhap || '',
      matkhau: '',
      maVaiTro: u.maVaiTro || 4,
      diachi: u.diachi || '',
      trangthai: String(u.trangthai || 'HOATDONG').toUpperCase(),
    });
    setFormErrors({});
    setModalType('edit');
  };

  const openToggle = (u) => { setSelectedUser(u); setModalType('toggle'); };
  const closeModal = () => { setModalType(null); setSelectedUser(null); };

  const validateForm = () => {
    const errs = {};
    if (!form.hoten.trim()) errs.hoten = 'Họ tên không được bỏ trống';
    if (modalType === 'add') {
      if (!form.tendangnhap.trim() || form.tendangnhap.trim().length < 3) {
        errs.tendangnhap = 'Tên đăng nhập phải từ 3 đến 50 ký tự';
      }
      if (!form.matkhau || form.matkhau.length < 6) {
        errs.matkhau = 'Mật khẩu phải từ 6 ký tự trở lên';
      }
    } else if (form.matkhau && form.matkhau.length < 6) {
      errs.matkhau = 'Mật khẩu mới phải từ 6 ký tự trở lên';
    }
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Email không đúng định dạng';
    return errs;
  };

  const handleFormChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (formErrors[e.target.name]) setFormErrors((p) => ({ ...p, [e.target.name]: '' }));
  };

  const handleSave = async () => {
    const errs = validateForm();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setActionLoading(true);
    try {
      if (modalType === 'add') {
        await createUser(form);
        addToast('Đã tạo tài khoản người dùng mới', 'success');
      } else {
        const updateData = { ...form };
        if (!updateData.matkhau) delete updateData.matkhau;
        if (Number(selectedUser.maNguoiDung) === Number(currentUserId)) {
          delete updateData.maVaiTro;
          delete updateData.trangthai;
        }
        await updateUser(selectedUser.maNguoiDung, updateData);
        addToast('Đã cập nhật thông tin người dùng', 'success');
      }
      fetchUsers();
      closeModal();
    } catch (err) {
      addToast(err?.response?.data?.message || err?.message || 'Có lỗi xảy ra', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggle = async () => {
    if (!selectedUser) return;
    if (Number(selectedUser.maNguoiDung) === Number(currentUserId)) {
      addToast('Không thể tự khóa tài khoản đang đăng nhập', 'warning');
      return;
    }
    setActionLoading(true);
    try {
      const currentSt = String(selectedUser.trangthai || 'HOATDONG').toUpperCase();
      await toggleUserStatus(selectedUser.maNguoiDung, currentSt);
      const label = currentSt === 'HOATDONG' ? 'khóa' : 'mở khóa';
      addToast(`Đã ${label} tài khoản ${selectedUser.hoten}`, 'success');
      fetchUsers();
      closeModal();
    } catch (err) {
      addToast(err?.response?.data?.message || err?.message || 'Có lỗi xảy ra', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const roleBadgeClass = (nameOrCode) => {
    const c = String(nameOrCode || '').toUpperCase();
    if (c.includes('ADMIN')) return 'um-role--admin';
    if (c.includes('HIEUTRUONG')) return 'um-role--ht';
    if (c.includes('CANBO')) return 'um-role--cbql';
    if (c.includes('PHUHUYNH')) return 'um-role--ph';
    if (c.includes('NHATAITRO')) return 'um-role--nht';
    return '';
  };

  const dataWithStt = users.map((u, i) => ({ ...u, _stt: i + 1 }));

  const columns = [
    { key: '_stt', title: 'STT', width: 56 },
    {
      key: 'avatar', title: '', width: 48,
      render: (_, row) => <div className="um-avatar">{getInitials(row.hoten)}</div>,
    },
    { key: 'hoten', title: 'Họ tên', render: (_, row) => <span className="um-name">{row.hoten}</span> },
    { key: 'tenDangNhap', title: 'Tên đăng nhập', render: (_, row) => row.tenDangNhap || '—' },
    { key: 'email', title: 'Email', render: (_, row) => <span className="um-email">{row.email || '—'}</span> },
    { key: 'sdt', title: 'SĐT', render: (_, row) => row.sdt || '—' },
    {
      key: 'tenVaiTro', title: 'Vai trò',
      render: (_, row) => (
        <span className={`um-role ${roleBadgeClass(row.tenVaiTro || row.roleCode)}`}>
          {row.tenVaiTro || row.roleCode}
        </span>
      ),
    },
    { key: 'trangthai', title: 'Trạng thái', render: (_, row) => statusBadge(row.trangthai) },
    {
      key: 'action', title: 'Hành động',
      render: (_, row) => {
        const isActive = String(row.trangthai || '').toUpperCase() === 'HOATDONG';
        const isSelf = Number(row.maNguoiDung) === Number(currentUserId);
        return (
          <div className="um-actions">
            <button className="um-btn" onClick={() => openDetail(row)} title="Xem chi tiết">
              <FiEye />
            </button>
            <button className="um-btn um-btn--edit" onClick={() => openEdit(row)} title="Chỉnh sửa">
              <FiEdit2 />
            </button>
            <button
              className={`um-btn ${isActive ? 'um-btn--lock' : 'um-btn--unlock'}`}
              onClick={() => openToggle(row)}
              disabled={isSelf}
              title={isSelf ? 'Không thể tự khóa tài khoản của mình' : (isActive ? 'Khóa tài khoản' : 'Mở khóa')}
            >
              {isActive ? <FiLock /> : <FiUnlock />}
            </button>
          </div>
        );
      },
    },
  ];

  const isSelfEdit = modalType === 'edit' && Number(selectedUser?.maNguoiDung) === Number(currentUserId);
  const isSelectedActive = String(selectedUser?.trangthai || '').toUpperCase() === 'HOATDONG';

  return (
    <div className="user-management">
      <div className="um-header">
        <div>
          <h1>Quản lý người dùng</h1>
          <p>Xem chi tiết, thêm, cập nhật và khóa/mở khóa tài khoản trong hệ thống</p>
        </div>
        <Button variant="primary" onClick={openAdd}>
          <FiPlus /> Thêm người dùng
        </Button>
      </div>

      <div className="um-filters">
        <div className="um-search-wrap">
          <FiSearch className="um-search-icon" />
          <input
            className="um-search"
            placeholder="Tìm kiếm tên, email, tên đăng nhập, SĐT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && <button className="um-clear" onClick={() => setSearch('')}><FiX /></button>}
        </div>
        <select className="um-select" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
          <option value="">Tất cả vai trò</option>
          {roles.map((r) => <option key={r.maVaiTro} value={r.maVaiTro}>{r.tenVaiTro}</option>)}
        </select>
        <select className="um-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          {TRANGTHAI_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div className="um-table-card">
        <Table
          columns={columns}
          data={dataWithStt}
          loading={loading}
          rowKey="maNguoiDung"
          emptyTitle="Không có người dùng"
          emptyDescription="Không tìm thấy người dùng nào phù hợp."
        />
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={modalType === 'detail'}
        onClose={closeModal}
        title="Chi tiết tài khoản người dùng"
        size="md"
        footer={<Button variant="outline" onClick={closeModal}>Đóng</Button>}
      >
        {selectedUser && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.92rem' }}>
            <div><strong>Mã người dùng:</strong> #{selectedUser.maNguoiDung}</div>
            <div><strong>Họ và tên:</strong> {selectedUser.hoten}</div>
            <div><strong>Tên đăng nhập:</strong> {selectedUser.tenDangNhap || '—'}</div>
            <div><strong>Email:</strong> {selectedUser.email || '—'}</div>
            <div><strong>Số điện thoại:</strong> {selectedUser.sdt || '—'}</div>
            <div><strong>Địa chỉ:</strong> {selectedUser.diachi || '—'}</div>
            <div><strong>Vai trò:</strong> {selectedUser.tenVaiTro}{selectedUser.moTaVaiTro ? ` (${selectedUser.moTaVaiTro})` : ''}</div>
            <div><strong>Trạng thái:</strong> {statusBadge(selectedUser.trangthai)}</div>
            <div><strong>Ngày tạo:</strong> {selectedUser.ngayTao ? formatDate(selectedUser.ngayTao) : '—'}</div>
            <div><strong>Cập nhật gần nhất:</strong> {selectedUser.ngayCapNhat ? formatDate(selectedUser.ngayCapNhat) : '—'}</div>
          </div>
        )}
      </Modal>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalType === 'add' || modalType === 'edit'}
        onClose={closeModal}
        title={modalType === 'add' ? 'Thêm người dùng mới' : 'Chỉnh sửa người dùng'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={closeModal}>Hủy</Button>
            <Button variant="primary" loading={actionLoading} onClick={handleSave}>
              {modalType === 'add' ? 'Thêm mới' : 'Lưu thay đổi'}
            </Button>
          </>
        }
      >
        <UserFormFields
          form={form}
          formErrors={formErrors}
          roles={roles}
          modalType={modalType}
          isSelfEdit={isSelfEdit}
          onChange={handleFormChange}
        />
      </Modal>

      {/* Toggle Lock/Unlock Confirm */}
      <Modal
        isOpen={modalType === 'toggle'}
        onClose={closeModal}
        title={isSelectedActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={closeModal}>Hủy</Button>
            <Button
              variant={isSelectedActive ? 'danger' : 'primary'}
              loading={actionLoading}
              onClick={handleToggle}
            >
              Xác nhận
            </Button>
          </>
        }
      >
        <p>
          {isSelectedActive
            ? `Khóa tài khoản của ${selectedUser?.hoten}? Người dùng sẽ không thể đăng nhập.`
            : `Mở khóa tài khoản của ${selectedUser?.hoten}?`
          }
        </p>
      </Modal>
    </div>
  );
};

export default UserManagement;

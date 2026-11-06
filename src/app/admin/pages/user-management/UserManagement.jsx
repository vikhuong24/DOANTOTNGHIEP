import { useState, useEffect, useCallback } from 'react';
import { FiEdit2, FiTrash2, FiLock, FiUnlock, FiPlus, FiSearch, FiX } from 'react-icons/fi';
import Table from '../../../../components/Table/Table';
import Modal from '../../../../components/Modal/Modal';
import Button from '../../../../components/Button/Button';
import { useNotification } from '../../../../components/Notification/Notification';
import {
  getAllUsers, createUser, updateUser, deleteUser, toggleUserStatus, getRoles
} from '../../../../services/userService';
import './UserManagement.css';

const TRANGTHAI_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'HoatDong', label: 'Hoạt động' },
  { value: 'Khoa', label: 'Đã khóa' },
  { value: 'ChoDuyet', label: 'Chờ duyệt' },
];

const EMPTY_FORM = { hoten: '', email: '', sdt: '', tendangnhap: '', matkhau: '', maVaiTro: 'NHT', diachi: '' };

const statusBadge = (s) => {
  const map = {
    HoatDong: { label: 'Hoạt động', cls: 'um-badge--active' },
    Khoa: { label: 'Đã khóa', cls: 'um-badge--locked' },
    ChoDuyet: { label: 'Chờ duyệt', cls: 'um-badge--pending' },
  };
  const info = map[s] || { label: s, cls: '' };
  return <span className={`um-badge ${info.cls}`}>{info.label}</span>;
};

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map((w) => w[0]).slice(-2).join('').toUpperCase();
};

// Component Form nhập liệu Người dùng (đặt ngoài UserManagement để giữ focus và state)
const UserFormFields = ({ form, formErrors, roles, modalType, onChange }) => (
  <div className="um-form">
    <div className="um-form__row">
      <div className={`um-form__field ${formErrors.hoten ? 'um-form__field--error' : ''}`}>
        <label>Họ và tên <span className="um-form__req">*</span></label>
        <input name="hoten" value={form.hoten} onChange={onChange} placeholder="Nguyễn Văn A" />
        {formErrors.hoten && <span>{formErrors.hoten}</span>}
      </div>
      <div className="um-form__field">
        <label>Email</label>
        <input name="email" type="email" value={form.email} onChange={onChange} placeholder="email@example.com" />
        {formErrors.email && <span className="um-form__err">{formErrors.email}</span>}
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
        <input name="tendangnhap" value={form.tendangnhap} onChange={onChange} placeholder="username" />
        {formErrors.tendangnhap && <span>{formErrors.tendangnhap}</span>}
      </div>
      <div className={`um-form__field ${formErrors.matkhau ? 'um-form__field--error' : ''}`}>
        <label>Mật khẩu {modalType === 'add' && <span className="um-form__req">*</span>}</label>
        <input name="matkhau" type="password" value={form.matkhau} onChange={onChange} placeholder={modalType === 'edit' ? 'Để trống nếu không đổi' : 'Nhập mật khẩu'} />
        {formErrors.matkhau && <span>{formErrors.matkhau}</span>}
      </div>
    </div>
    <div className="um-form__field">
      <label>Vai trò</label>
      <select name="maVaiTro" value={form.maVaiTro} onChange={onChange}>
        {roles.map((r) => <option key={r.maVaiTro} value={r.maVaiTro}>{r.tenVaiTro}</option>)}
      </select>
    </div>
  </div>
);

const UserManagement = () => {
  const { addToast } = useNotification();
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
      const res = await getAllUsers({ search, maVaiTro: filterRole, trangthai: filterStatus });
      setUsers(res.data || res);
    } finally {
      setLoading(false);
    }
  }, [search, filterRole, filterStatus]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { getRoles().then(setRoles); }, []);

  const openAdd = () => { setForm(EMPTY_FORM); setFormErrors({}); setModalType('add'); };
  const openEdit = (u) => {
    setSelectedUser(u);
    setForm({ hoten: u.hoten, email: u.email || '', sdt: u.sdt || '', tendangnhap: u.tendangnhap, matkhau: '', maVaiTro: u.maVaiTro, diachi: u.diachi || '' });
    setFormErrors({});
    setModalType('edit');
  };
  const openDelete = (u) => { setSelectedUser(u); setModalType('delete'); };
  const openToggle = (u) => { setSelectedUser(u); setModalType('toggle'); };
  const closeModal = () => { setModalType(null); setSelectedUser(null); };

  const validateForm = () => {
    const errs = {};
    if (!form.hoten.trim()) errs.hoten = 'Họ tên không được bỏ trống';
    if (!form.tendangnhap.trim()) errs.tendangnhap = 'Tên đăng nhập không được bỏ trống';
    if (modalType === 'add' && !form.matkhau) errs.matkhau = 'Mật khẩu không được bỏ trống';
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Email không hợp lệ';
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
        addToast('Đã thêm người dùng mới', 'success');
      } else {
        const updateData = { ...form };
        if (!updateData.matkhau) delete updateData.matkhau;
        await updateUser(selectedUser.maNguoiDung, updateData);
        addToast('Đã cập nhật thông tin người dùng', 'success');
      }
      fetchUsers();
      closeModal();
    } catch (err) {
      addToast(err.message || 'Có lỗi xảy ra', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await deleteUser(selectedUser.maNguoiDung);
      addToast('Đã xóa người dùng', 'success');
      fetchUsers();
      closeModal();
    } catch (err) {
      addToast(err.message || 'Có lỗi xảy ra', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggle = async () => {
    setActionLoading(true);
    try {
      await toggleUserStatus(selectedUser.maNguoiDung);
      const newStatus = selectedUser.trangthai === 'HoatDong' ? 'khóa' : 'mở khóa';
      addToast(`Đã ${newStatus} tài khoản ${selectedUser.hoten}`, 'success');
      fetchUsers();
      closeModal();
    } catch (err) {
      addToast(err.message || 'Có lỗi xảy ra', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const roleBadgeClass = (code) => {
    const map = { ADMIN: 'um-role--admin', HT: 'um-role--ht', CBQL: 'um-role--cbql', PH: 'um-role--ph', NHT: 'um-role--nht', GUEST: 'um-role--guest' };
    return map[code] || '';
  };

  const getRoleName = (code) =>
    roles.find((r) => r.maVaiTro === code)?.tenVaiTro || code;

  const dataWithStt = users.map((u, i) => ({ ...u, _stt: i + 1 }));

  const columns = [
    { key: '_stt', title: 'STT', width: 56 },
    {
      key: 'avatar', title: '', width: 48,
      render: (_, row) => (
        <div className="um-avatar">{getInitials(row.hoten)}</div>
      ),
    },
    { key: 'hoten', title: 'Họ tên', render: (_, row) => <span className="um-name">{row.hoten}</span> },
    { key: 'email', title: 'Email', render: (_, row) => <span className="um-email">{row.email || '—'}</span> },
    { key: 'sdt', title: 'SĐT', render: (_, row) => row.sdt || '—' },
    {
      key: 'maVaiTro', title: 'Vai trò',
      render: (_, row) => (
        <span className={`um-role ${roleBadgeClass(row.maVaiTro)}`}>{getRoleName(row.maVaiTro)}</span>
      ),
    },
    { key: 'trangthai', title: 'Trạng thái', render: (_, row) => statusBadge(row.trangthai) },
    {
      key: 'action', title: 'Hành động',
      render: (_, row) => (
        <div className="um-actions">
          <button className="um-btn um-btn--edit" onClick={() => openEdit(row)} title="Chỉnh sửa">
            <FiEdit2 />
          </button>
          <button
            className={`um-btn ${row.trangthai === 'HoatDong' ? 'um-btn--lock' : 'um-btn--unlock'}`}
            onClick={() => openToggle(row)}
            title={row.trangthai === 'HoatDong' ? 'Khóa tài khoản' : 'Mở khóa'}
          >
            {row.trangthai === 'HoatDong' ? <FiLock /> : <FiUnlock />}
          </button>
          <button className="um-btn um-btn--delete" onClick={() => openDelete(row)} title="Xóa">
            <FiTrash2 />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="user-management">
      <div className="um-header">
        <div>
          <h1>Quản lý người dùng</h1>
          <p>Xem, thêm, sửa, khóa và phân quyền tài khoản trong hệ thống</p>
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
            placeholder="Tìm kiếm tên, email, tên đăng nhập..."
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
          onChange={handleFormChange}
        />
      </Modal>

      {/* Delete Confirm */}
      <Modal
        isOpen={modalType === 'delete'}
        onClose={closeModal}
        title="Xác nhận xóa"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={closeModal}>Hủy</Button>
            <Button variant="danger" loading={actionLoading} onClick={handleDelete}>Xác nhận xóa</Button>
          </>
        }
      >
        <p>Bạn chắc chắn muốn <strong>xóa vĩnh viễn</strong> tài khoản của <strong>{selectedUser?.hoten}</strong>?</p>
        <p className="um-warn">Hành động này không thể hoàn tác.</p>
      </Modal>

      {/* Toggle Confirm */}
      <Modal
        isOpen={modalType === 'toggle'}
        onClose={closeModal}
        title={selectedUser?.trangthai === 'HoatDong' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={closeModal}>Hủy</Button>
            <Button
              variant={selectedUser?.trangthai === 'HoatDong' ? 'danger' : 'primary'}
              loading={actionLoading}
              onClick={handleToggle}
            >
              Xác nhận
            </Button>
          </>
        }
      >
        <p>
          {selectedUser?.trangthai === 'HoatDong'
            ? `Khóa tài khoản của ${selectedUser?.hoten}? Người dùng sẽ không thể đăng nhập.`
            : `Mở khóa tài khoản của ${selectedUser?.hoten}?`
          }
        </p>
      </Modal>
    </div>
  );
};

export default UserManagement;

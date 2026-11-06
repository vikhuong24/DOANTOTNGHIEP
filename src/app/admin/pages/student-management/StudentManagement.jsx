import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiUpload, FiSearch, FiEdit2, FiTrash2 } from 'react-icons/fi';
import Table from '../../../../components/Table/Table';
import Modal from '../../../../components/Modal/Modal';
import Button from '../../../../components/Button/Button';
import ImportStudentModal from '../../../../components/ImportStudentModal/ImportStudentModal';
import { useNotification } from '../../../../components/Notification/Notification';
import {
  getAllStudents, createStudent, updateStudent, deleteStudent
} from '../../../../services/studentService';
import { getAllUsers } from '../../../../services/userService';
import './StudentManagement.css';

const EMPTY_FORM = {
  hoten: '',
  mahuuhuynh: 2,
  ngaysinh: '2015-01-01',
  gioitinh: 'Nam',
  lop: '1A',
  hoancanh: '',
  trangthai: 'DangHoc',
};

const StudentManagement = () => {
  const { addToast } = useNotification();
  const [students, setStudents] = useState([]);
  const [parentUsers, setParentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'add' | 'edit' | 'delete'
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllStudents({ search, lop: filterClass });
      setStudents(res.data || res);
    } finally {
      setLoading(false);
    }
  }, [search, filterClass]);

  useEffect(() => {
    fetchStudents();
    getAllUsers({ roleId: 5 })
      .then((res) => setParentUsers(res.data || res || []))
      .catch(() => {});
  }, [fetchStudents]);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setFormErrors({});
    setModalType('add');
  };

  const openEdit = (stu) => {
    setSelectedStudent(stu);
    setForm({
      hoten: stu.hoten,
      mahuuhuynh: stu.mahuuhuynh || 2,
      ngaysinh: stu.ngaysinh || '2015-01-01',
      gioitinh: stu.gioitinh || 'Nam',
      lop: stu.lop || '1A',
      hoancanh: stu.hoancanh || stu.mota || '',
      trangthai: stu.trangthai || 'DangHoc',
    });
    setFormErrors({});
    setModalType('edit');
  };

  const openDelete = (stu) => {
    setSelectedStudent(stu);
    setModalType('delete');
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedStudent(null);
  };

  const validate = () => {
    const errs = {};
    if (!form.hoten?.trim()) errs.hoten = 'Vui lòng nhập họ và tên học sinh';
    if (!form.lop?.trim()) errs.lop = 'Vui lòng nhập lớp';
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setFormErrors(errs);
      return;
    }
    setActionLoading(true);
    try {
      if (modalType === 'add') {
        await createStudent(form);
        addToast('Đã thêm học sinh mới thành công', 'success');
      } else {
        await updateStudent(selectedStudent.mahocsinh, form);
        addToast('Đã cập nhật thông tin học sinh', 'success');
      }
      fetchStudents();
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
      await deleteStudent(selectedStudent.mahocsinh);
      addToast('Đã xóa học sinh khỏi danh sách', 'success');
      fetchStudents();
      closeModal();
    } catch (err) {
      addToast(err.message || 'Có lỗi xảy ra', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const getParentName = (parentId, row) => {
    if (row?.tenPhuHuynh) return row.tenPhuHuynh;
    const p = parentUsers.find((u) => u.maNguoiDung === parentId);
    return p ? p.hoten : (parentId ? `PH #${parentId}` : 'Chưa gắn');
  };

  // Lấy danh sách lớp duy nhất
  const uniqueClasses = Array.from(new Set(students.map((s) => s.lop))).filter(Boolean);

  const columns = [
    { key: '_stt', title: 'STT', width: 56 },
    {
      key: 'hoten',
      title: 'Họ và tên học sinh',
      render: (_, row) => (
        <div>
          <span className="stu-name">{row.hoten}</span>
          <span className="stu-id">Mã: #{row.mahocsinh}</span>
        </div>
      ),
    },
    { key: 'lop', title: 'Lớp', width: 80, align: 'center', render: (v) => <strong className="stu-class">{v}</strong> },
    {
      key: 'gioitinh',
      title: 'Giới tính',
      width: 90,
      align: 'center',
      render: (v) => (
        <span className={`gioitinh-tag ${v === 'Nu' ? 'gioitinh-tag--nu' : 'gioitinh-tag--nam'}`}>
          {v === 'Nu' ? 'Nữ' : 'Nam'}
        </span>
      ),
    },
    { key: 'ngaysinh', title: 'Ngày sinh', width: 110, render: (v) => v || '—' },
    { key: 'parent', title: 'Phụ huynh đại diện', render: (_, row) => getParentName(row.mahuuhuynh, row) },
    {
      key: 'hoancanh',
      title: 'Hoàn cảnh / Khuyết tật',
      render: (_, row) => <span className="stu-condition">{row.hoancanh || row.mota || '—'}</span>,
    },
    {
      key: 'trangthai',
      title: 'Trạng thái',
      width: 120,
      render: (v) => (
        <span className={`stu-status-badge stu-status-badge--${v ? v.toLowerCase() : 'danghoc'}`}>
          {v === 'DangHoc' ? 'Đang học' : v === 'DaTotNghiep' ? 'Đã tốt nghiệp' : 'Nghỉ học'}
        </span>
      ),
    },
    {
      key: 'action',
      title: 'Hành động',
      width: 100,
      render: (_, row) => (
        <div className="stu-actions">
          <button className="stu-btn stu-btn--edit" onClick={() => openEdit(row)} title="Chỉnh sửa">
            <FiEdit2 />
          </button>
          <button className="stu-btn stu-btn--delete" onClick={() => openDelete(row)} title="Xóa">
            <FiTrash2 />
          </button>
        </div>
      ),
    },
  ];

  const dataWithStt = students.map((s, idx) => ({ ...s, _stt: idx + 1 }));

  return (
    <div className="student-management">
      <div className="stu-header">
        <div>
          <h1>Quản lý hồ sơ học sinh</h1>
          <p>Danh sách học sinh trường chuyên biệt Nguyễn Đình Chiểu — Khớp bảng HOCSINH</p>
        </div>
        <div className="stu-header-actions">
          <Button variant="outline" onClick={() => setIsImportOpen(true)}>
            <FiUpload /> Nhập từ Excel (.xlsx)
          </Button>
          <Button variant="primary" onClick={openAdd}>
            <FiPlus /> Thêm học sinh
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="stu-filters">
        <div className="stu-search-wrap">
          <FiSearch className="stu-search-icon" />
          <input
            className="stu-search"
            placeholder="Tìm kiếm theo tên học sinh, hoàn cảnh..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="stu-select" value={filterClass} onChange={(e) => setFilterClass(e.target.value)}>
          <option value="">Tất cả các lớp</option>
          {uniqueClasses.map((cls) => (
            <option key={cls} value={cls}>Lớp {cls}</option>
          ))}
        </select>
        <div className="stu-count-tag">Tổng cộng: {students.length} học sinh</div>
      </div>

      {/* Table */}
      <div className="stu-table-card">
        <Table
          columns={columns}
          data={dataWithStt}
          loading={loading}
          rowKey="mahocsinh"
          emptyTitle="Chưa có học sinh nào"
          emptyDescription="Không tìm thấy hồ sơ học sinh phù hợp với bộ lọc."
        />
      </div>

      {/* Modal Add / Edit */}
      <Modal
        isOpen={modalType === 'add' || modalType === 'edit'}
        onClose={closeModal}
        title={modalType === 'add' ? 'Thêm học sinh mới' : 'Chỉnh sửa hồ sơ học sinh'}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={closeModal}>Hủy</Button>
            <Button variant="primary" loading={actionLoading} onClick={handleSave}>
              {modalType === 'add' ? 'Thêm mới' : 'Lưu thay đổi'}
            </Button>
          </>
        }
      >
        <div className="stu-form">
          <div className="stu-form-group">
            <label>Họ và tên học sinh <span className="req">*</span></label>
            <input
              type="text"
              value={form.hoten}
              onChange={(e) => setForm({ ...form, hoten: e.target.value })}
              placeholder="VD: Trần Minh Khang"
            />
            {formErrors.hoten && <span className="stu-err">{formErrors.hoten}</span>}
          </div>

          <div className="stu-form-row">
            <div className="stu-form-group">
              <label>Lớp học <span className="req">*</span></label>
              <input
                type="text"
                value={form.lop}
                onChange={(e) => setForm({ ...form, lop: e.target.value })}
                placeholder="VD: 5A"
              />
              {formErrors.lop && <span className="stu-err">{formErrors.lop}</span>}
            </div>

            <div className="stu-form-group">
              <label>Giới tính</label>
              <select
                value={form.gioitinh}
                onChange={(e) => setForm({ ...form, gioitinh: e.target.value })}
              >
                <option value="Nam">Nam</option>
                <option value="Nu">Nữ</option>
              </select>
            </div>
          </div>

          <div className="stu-form-row">
            <div className="stu-form-group">
              <label>Ngày sinh</label>
              <input
                type="date"
                value={form.ngaysinh}
                onChange={(e) => setForm({ ...form, ngaysinh: e.target.value })}
              />
            </div>

            <div className="stu-form-group">
              <label>Phụ huynh giám hộ</label>
              <select
                value={form.mahuuhuynh}
                onChange={(e) => setForm({ ...form, mahuuhuynh: Number(e.target.value) })}
              >
                {parentUsers.map((p) => (
                  <option key={p.maNguoiDung} value={p.maNguoiDung}>
                    {p.hoten} ({p.email || p.sdt})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="stu-form-group">
            <label>Hoàn cảnh / Loại khuyết tật</label>
            <textarea
              rows={3}
              value={form.hoancanh}
              onChange={(e) => setForm({ ...form, hoancanh: e.target.value })}
              placeholder="VD: Khiếm thị hoàn toàn, gia đình hộ nghèo, có năng khiếu âm nhạc..."
            />
          </div>

          <div className="stu-form-group">
            <label>Trạng thái học tập</label>
            <select
              value={form.trangthai}
              onChange={(e) => setForm({ ...form, trangthai: e.target.value })}
            >
              <option value="DangHoc">Đang học</option>
              <option value="DaTotNghiep">Đã tốt nghiệp</option>
              <option value="NghiHoc">Nghỉ học</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal
        isOpen={modalType === 'delete'}
        onClose={closeModal}
        title="Xác nhận xóa học sinh"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={closeModal}>Hủy</Button>
            <Button variant="danger" loading={actionLoading} onClick={handleDelete}>
              Xóa hồ sơ
            </Button>
          </>
        }
      >
        <p>
          Bạn có chắc chắn muốn xóa học sinh <strong>{selectedStudent?.hoten}</strong> (Lớp {selectedStudent?.lop})?
        </p>
        <p style={{ color: '#d32f2f', fontSize: '0.85rem' }}>
          Lưu ý: Dữ liệu phân bổ liên quan đến học sinh này sẽ bị ảnh hưởng.
        </p>
      </Modal>

      {/* Import Modal */}
      <ImportStudentModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportSuccess={() => fetchStudents()}
      />
    </div>
  );
};

export default StudentManagement;

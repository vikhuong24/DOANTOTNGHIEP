// Trang Danh mục hồ sơ học sinh dành cho Cán bộ quản lý gây quỹ (Fundraiser)
// Kết nối trực tiếp API Backend Spring Boot: GET /fundraiser/students & GET /fundraiser/students/{id}
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFundraiserStudents, getStudentById } from '../../../../services/studentService';
import Card from '../../../../components/Card/Card';
import Table from '../../../../components/Table/Table';
import Button from '../../../../components/Button/Button';
import Modal from '../../../../components/Modal/Modal';
import Loading from '../../../../components/Loading/Loading';
import EmptyState from '../../../../components/EmptyState/EmptyState';
import Pagination from '../../../../components/Pagination/Pagination';
import { useNotification } from '../../../../components/Notification/Notification';
import { formatDate } from '../../../../utils/formatters';
import { FiSearch, FiEye, FiUsers, FiPhone, FiUser, FiCalendar, FiBook, FiAward } from 'react-icons/fi';

const PAGE_SIZE = 10;

const StudentList = () => {
  const navigate = useNavigate();
  const { addToast } = useNotification();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);

  // Tìm kiếm (gọi API keyword) & Lọc bổ sung
  const [keywordInput, setKeywordInput] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [page, setPage] = useState(1);

  // Modal chi tiết học sinh (GET /fundraiser/students/{id})
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const fetchStudents = async (kw = '') => {
    try {
      setLoading(true);
      setError(null);
      const list = await getFundraiserStudents(kw);
      setStudents(list || []);
      setPage(1);
    } catch (err) {
      console.error('Lỗi tải danh sách học sinh:', err);
      setError(err?.message || 'Không thể tải danh sách học sinh từ máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents(appliedKeyword);
  }, [appliedKeyword]);

  // Danh sách lớp học duy nhất để lọc nhanh
  const classOptions = useMemo(() => {
    const set = new Set(students.map((s) => s.lop).filter(Boolean));
    return Array.from(set);
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (selectedClass && s.lop !== selectedClass) return false;
      if (selectedGender && String(s.gioiTinh).toUpperCase() !== selectedGender) return false;
      return true;
    });
  }, [students, selectedClass, selectedGender]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE));
  const paginatedStudents = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredStudents.slice(start, start + PAGE_SIZE);
  }, [filteredStudents, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setAppliedKeyword(keywordInput.trim());
  };

  const handleResetFilters = () => {
    setKeywordInput('');
    setAppliedKeyword('');
    setSelectedClass('');
    setSelectedGender('');
    setPage(1);
  };

  const handleOpenDetail = async (row) => {
    const id = row.maHocSinh || row.id;
    setSelectedStudent(row);
    setDetailOpen(true);
    try {
      setDetailLoading(true);
      const fresh = await getStudentById(id);
      if (fresh) setSelectedStudent(fresh);
    } catch (err) {
      addToast(err?.message || 'Không thể tải chi tiết hồ sơ học sinh', 'error');
    } finally {
      setDetailLoading(false);
    }
  };

  const columns = [
    {
      key: 'maHocSinh',
      title: 'Mã HS',
      width: '80px',
      render: (val, row) => `#HS${val || row.id}`,
    },
    {
      key: 'hoTen',
      title: 'Họ và tên học sinh',
      render: (val, row) => (
        <div>
          <div className="font-semibold text-primary">{val || row.hoten}</div>
          {row.moTa && (
            <div className="text-muted text-sm" style={{ maxWidth: '340px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {row.moTa}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'lop',
      title: 'Lớp',
      width: '110px',
      render: (val) => <span className="badge badge--primary">{val || '—'}</span>,
    },
    {
      key: 'gioiTinh',
      title: 'Giới tính',
      width: '95px',
      render: (val) => (String(val).toUpperCase() === 'NU' ? 'Nữ' : 'Nam'),
    },
    {
      key: 'ngaySinh',
      title: 'Ngày sinh',
      width: '115px',
      render: (val) => (val ? formatDate(val) : '—'),
    },
    {
      key: 'loaiHoTro',
      title: 'Loại hình hỗ trợ / Khuyết tật',
      render: (val) => <span>{val || '—'}</span>,
    },
    {
      key: 'tenPhuHuynh',
      title: 'Phụ huynh liên hệ',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 500 }}>{val || 'Chưa liên kết'}</div>
          {row.sdtPhuHuynh && (
            <div style={{ fontSize: '0.8rem', color: '#666' }}>{row.sdtPhuHuynh}</div>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      title: 'Thao tác',
      width: '125px',
      render: (_, row) => (
        <Button size="sm" variant="outline" onClick={() => handleOpenDetail(row)}>
          <FiEye /> Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Danh Mục Học Sinh Chuyên Biệt</h1>
          <p className="page-subtitle">
            Tra cứu hồ sơ học sinh và thông tin phụ huynh liên hệ phục vụ công tác lập kế hoạch phân bổ học bổng và đồ dùng.
          </p>
        </div>

        <div className="page-actions">
          <Button variant="primary" onClick={() => navigate('/fundraiser/scholarship-distribution')}>
            <FiAward /> Lập kế hoạch phân bổ
          </Button>
        </div>
      </div>

      {/* Bộ lọc & Tìm kiếm */}
      <Card>
        <form
          onSubmit={handleSearchSubmit}
          style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}
        >
          <div style={{ flex: 2, minWidth: '240px' }}>
            <label className="input-label">Tìm kiếm theo tên, lớp hoặc loại hỗ trợ</label>
            <div style={{ position: 'relative' }}>
              <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
              <input
                type="text"
                className="input-field"
                style={{ paddingLeft: '36px' }}
                placeholder="Nhập từ khóa (VD: Khang, 3A-KT, Khiếm thị)..."
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
              />
            </div>
          </div>

          <div style={{ minWidth: '150px' }}>
            <label className="input-label">Lớp học</label>
            <select
              className="input-field"
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Tất cả các lớp</option>
              {classOptions.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          <div style={{ minWidth: '130px' }}>
            <label className="input-label">Giới tính</label>
            <select
              className="input-field"
              value={selectedGender}
              onChange={(e) => {
                setSelectedGender(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Tất cả</option>
              <option value="NAM">Nam</option>
              <option value="NU">Nữ</option>
            </select>
          </div>

          <Button type="submit" variant="primary">
            <FiSearch /> Tìm kiếm
          </Button>

          {(appliedKeyword || keywordInput || selectedClass || selectedGender) && (
            <Button type="button" variant="outline" onClick={handleResetFilters}>
              Đặt lại
            </Button>
          )}
        </form>
      </Card>

      {/* Bảng danh sách học sinh */}
      <Card
        title={
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <FiUsers /> Danh sách học sinh ({filteredStudents.length})
          </span>
        }
        padding={false}
      >
        {loading ? (
          <div style={{ padding: '1.5rem' }}>
            <Loading rows={5} type="skeleton" />
          </div>
        ) : error ? (
          <div style={{ padding: '2rem' }}>
            <EmptyState
              title="Lỗi tải danh sách học sinh"
              description={error}
              actionLabel="Thử lại"
              onAction={() => fetchStudents(appliedKeyword)}
            />
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              data={paginatedStudents}
              rowKey="maHocSinh"
              emptyTitle="Không tìm thấy học sinh nào"
              emptyDescription="Chưa có hồ sơ học sinh nào khớp với từ khóa hoặc bộ lọc đã chọn."
            />
            {totalPages > 1 && (
              <div style={{ padding: '1rem', display: 'flex', justifyContent: 'center' }}>
                <Pagination page={page} totalPages={totalPages} onChange={setPage} />
              </div>
            )}
          </>
        )}
      </Card>

      {/* Modal Chi tiết hồ sơ học sinh */}
      <Modal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={`Hồ sơ học sinh #HS${selectedStudent?.maHocSinh || selectedStudent?.id || ''}`}
        size="md"
        footer={
          <div className="modal-buttons">
            <Button variant="outline" onClick={() => setDetailOpen(false)}>
              Đóng
            </Button>
          </div>
        }
      >
        {detailLoading && !selectedStudent ? (
          <Loading text="Đang tải thông tin chi tiết..." />
        ) : (
          selectedStudent && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary)' }}>
                  {selectedStudent.hoTen || selectedStudent.hoten}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <div>
                    <FiBook style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                    Lớp: <strong>{selectedStudent.lop || '—'}</strong>
                  </div>
                  <div>
                    <FiUser style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                    Giới tính: <strong>{String(selectedStudent.gioiTinh).toUpperCase() === 'NU' ? 'Nữ' : 'Nam'}</strong>
                  </div>
                  <div>
                    <FiCalendar style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                    Ngày sinh: <strong>{selectedStudent.ngaySinh ? formatDate(selectedStudent.ngaySinh) : '—'}</strong>
                  </div>
                  <div>
                    Loại hỗ trợ: <strong>{selectedStudent.loaiHoTro || '—'}</strong>
                  </div>
                </div>
              </div>

              {selectedStudent.moTa && (
                <div>
                  <strong style={{ fontSize: '0.9rem', display: 'block', marginBottom: '4px' }}>
                    Hoàn cảnh & Ghi chú chuyên biệt:
                  </strong>
                  <p style={{ margin: 0, color: '#495057', lineHeight: 1.5, background: '#fff', padding: '0.75rem', border: '1px solid #e9ecef', borderRadius: '6px' }}>
                    {selectedStudent.moTa}
                  </p>
                </div>
              )}

              <div style={{ background: '#e7f5ff', padding: '0.85rem 1rem', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                <strong style={{ fontSize: '0.9rem', display: 'block', marginBottom: '4px', color: '#1864ab' }}>
                  Thông tin Phụ huynh / Người giám hộ:
                </strong>
                <div style={{ fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span>
                    <FiUser style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                    {selectedStudent.tenPhuHuynh || 'Chưa cập nhật phụ huynh'}
                  </span>
                  {selectedStudent.sdtPhuHuynh && (
                    <span>
                      <FiPhone style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                      <strong>{selectedStudent.sdtPhuHuynh}</strong>
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        )}
      </Modal>
    </div>
  );
};

export default StudentList;
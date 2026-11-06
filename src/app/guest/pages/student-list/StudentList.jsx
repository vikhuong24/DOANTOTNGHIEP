// StudentList: Danh sách học sinh chuyên biệt được tiếp nhận hỗ trợ tại Trường Phổ Thông Chuyên Biệt Nguyễn Đình Chiểu
// Trang công khai cho khách vãng lai và nhà hảo tâm tham khảo hoàn cảnh (ẩn danh thông tin nhạy cảm theo quy chế bảo vệ trẻ em)
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiUsers,
  FiSearch,
  FiFilter,
  FiHeart,
  FiBookOpen,
  FiGrid,
  FiList,
  FiRotateCcw,
  FiInfo,
  FiX,
  FiExternalLink,
  FiSmile,
  FiTag,
} from 'react-icons/fi';
import Pagination from '../../../../components/Pagination/Pagination';
import Loading from '../../../../components/Loading/Loading';
import EmptyState from '../../../../components/EmptyState/EmptyState';
import { getGuestStudents } from '../../../../services/studentService';
import { getAllCampaigns } from '../../../../services/campaignService';
import './StudentList.css';

const GRID_PAGE_SIZE = 8;
const TABLE_PAGE_SIZE = 10;

const StudentList = () => {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bộ lọc tìm kiếm & Combobox
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedSupportType, setSelectedSupportType] = useState('ALL');
  const [selectedGender, setSelectedGender] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [currentPage, setCurrentPage] = useState(1);

  // Tải dữ liệu công khai từ backend (không yêu cầu đăng nhập)
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const [stuRes, campRes] = await Promise.all([
          getGuestStudents({ size: 200 }),
          getAllCampaigns({ size: 100 }),
        ]);
        if (isMounted) {
          setStudents(stuRes?.data || stuRes?.items || []);
          setCampaigns(campRes?.data || campRes?.items || []);
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu học sinh:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // Danh sách các lớp học hiện có
  const classList = useMemo(() => {
    const classes = new Set(
      students.map((s) => s.lop).filter(Boolean)
    );
    return Array.from(classes).sort((a, b) => a.localeCompare(b, 'vi', { numeric: true }));
  }, [students]);

  // Danh sách các loại hỗ trợ / nhu cầu hiện có
  const supportTypeList = useMemo(() => {
    const types = new Set();
    students.forEach((s) => {
      if (s.loaihotro) types.add(s.loaihotro);
      if (s.loaiHoTro) types.add(s.loaiHoTro);
    });
    return Array.from(types).filter(Boolean).sort();
  }, [students]);

  // Lọc danh sách học sinh
  const filteredStudents = useMemo(() => {
    return students.filter((stu) => {
      // 1. Tìm kiếm từ khóa (tên, mã, lớp, hoàn cảnh, loại hỗ trợ)
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const code = `hs${String(stu.mahocsinh || stu.id || '').padStart(3, '0')}`.toLowerCase();
        const matchName = stu.hoten && stu.hoten.toLowerCase().includes(q);
        const matchClass = stu.lop && stu.lop.toLowerCase().includes(q);
        const matchDesc = stu.mota && stu.mota.toLowerCase().includes(q);
        const matchType = stu.loaihotro && stu.loaihotro.toLowerCase().includes(q);
        const matchCode = code.includes(q);

        if (!matchName && !matchClass && !matchDesc && !matchType && !matchCode) {
          return false;
        }
      }

      // 2. Lọc theo Lớp
      if (selectedClass !== 'ALL' && stu.lop !== selectedClass) {
        return false;
      }

      // 3. Lọc theo Loại hỗ trợ
      if (selectedSupportType !== 'ALL') {
        const type = stu.loaihotro || stu.loaiHoTro || '';
        if (type !== selectedSupportType) {
          return false;
        }
      }

      // 4. Lọc theo Giới tính
      if (selectedGender !== 'ALL') {
        const g = String(stu.gioitinh || stu.gioiTinh || '').toUpperCase();
        if (selectedGender === 'NAM' && !g.includes('NAM')) return false;
        if (selectedGender === 'NU' && (g.includes('NAM') || (!g.includes('NU') && !g.includes('NỮ')))) return false;
      }

      return true;
    });
  }, [students, searchQuery, selectedClass, selectedSupportType, selectedGender]);

  // Phân trang
  const pageSize = viewMode === 'grid' ? GRID_PAGE_SIZE : TABLE_PAGE_SIZE;
  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  // Đặt lại toàn bộ bộ lọc
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedClass('ALL');
    setSelectedSupportType('ALL');
    setSelectedGender('ALL');
    setCurrentPage(1);
  };

  const isFiltered = searchQuery.trim() !== '' || selectedClass !== 'ALL' || selectedSupportType !== 'ALL' || selectedGender !== 'ALL';

  // Helper render Badge dạng tật / hỗ trợ
  const renderSupportTag = (loaiHoTro = '', mota = '') => {
    const fullText = `${loaiHoTro} ${mota}`.toLowerCase();
    if (fullText.includes('khiếm thị') || fullText.includes('braille') || fullText.includes('mắt') || fullText.includes('thị giác')) {
      return <span className="student-badge badge-vision">Khiếm thị</span>;
    }
    if (fullText.includes('khiếm thính') || fullText.includes('nghe') || fullText.includes('ký hiệu') || fullText.includes('thính giác')) {
      return <span className="student-badge badge-hearing">Khiếm thính</span>;
    }
    if (fullText.includes('vận động') || fullText.includes('xe lăn') || fullText.includes('chân')) {
      return <span className="student-badge badge-mobility">Khuyết tật vận động</span>;
    }
    if (fullText.includes('tự kỷ') || fullText.includes('trí tuệ') || fullText.includes('chậm phát triển')) {
      return <span className="student-badge badge-intellect">Phát triển trí não</span>;
    }
    return <span className="student-badge badge-support">{loaiHoTro || 'Học bổng chuyên biệt'}</span>;
  };

  return (
    <div className="container student-page-container">
      {/* Banner Giới thiệu Hero */}
      <section className="student-hero-section">
        <div className="student-hero-content">
          <span className="school-indicator">Trường Phổ Thông Chuyên Biệt Nguyễn Đình Chiểu</span>
          <h1 className="student-hero-heading">Danh Sách Học Sinh Tiếp Nhận Hỗ Trợ</h1>
          <p className="student-hero-subtext">
            Cổng thông tin công khai hoàn cảnh các em học sinh khiếm thị, khiếm thính và khuyết tật đặc biệt
            nhằm kết nối tình thương của cộng đồng và các nhà hảo tâm qua các chiến dịch thiện nguyện minh bạch.
          </p>

          <div className="student-quick-kpi">
            <div className="quick-kpi-pill">
              <FiUsers className="kpi-icon" />
              <span>Tổng số học sinh: <strong>{students.length} em</strong></span>
            </div>
            <div className="quick-kpi-pill">
              <FiBookOpen className="kpi-icon" />
              <span>Số lớp học chuyên biệt: <strong>{classList.length} lớp</strong></span>
            </div>
            <div className="quick-kpi-pill">
              <FiHeart className="kpi-icon" />
              <span>Chiến dịch đang mở: <strong>{campaigns.length} bài đăng</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* Toolbar Bộ Lọc & Tìm Kiếm */}
      <section className="student-filter-toolbar">
        <div className="filter-header-row">
          <div className="filter-header-title">
            <FiFilter className="filter-title-icon" />
            <span>Bộ lọc tra cứu thông tin</span>
          </div>

          <div className="filter-actions-right">
            {isFiltered && (
              <button
                type="button"
                className="btn-reset-filter"
                onClick={handleResetFilters}
                title="Xóa tất cả bộ lọc và hiển thị toàn bộ"
              >
                <FiRotateCcw /> Đặt lại bộ lọc
              </button>
            )}

            <div className="view-mode-toggle" role="group" aria-label="Chế độ hiển thị">
              <button
                type="button"
                className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => { setViewMode('grid'); setCurrentPage(1); }}
                title="Xem dạng lưới thẻ"
              >
                <FiGrid /> <span className="toggle-btn-text">Thẻ</span>
              </button>
              <button
                type="button"
                className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => { setViewMode('table'); setCurrentPage(1); }}
                title="Xem dạng bảng chi tiết"
              >
                <FiList /> <span className="toggle-btn-text">Bảng</span>
              </button>
            </div>
          </div>
        </div>

        {/* Các ô tìm kiếm và Combobox Dropdown */}
        <div className="filter-controls-grid">
          {/* 1. Ô tìm kiếm theo từ khóa */}
          <div className="form-control-item search-control-item">
            <label htmlFor="student-search-input" className="form-control-label">
              <FiSearch /> Tìm kiếm học sinh:
            </label>
            <div className="search-input-wrapper">
              <FiSearch className="search-field-icon" />
              <input
                id="student-search-input"
                type="text"
                className="search-input-field"
                placeholder="Nhập tên học sinh, lớp, mã HS hoặc hoàn cảnh..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => {
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
                  title="Xóa từ khóa"
                >
                  <FiX />
                </button>
              )}
            </div>
          </div>

          {/* 2. Combobox Lớp học */}
          <div className="form-control-item">
            <label htmlFor="student-class-select" className="form-control-label">
              <FiBookOpen /> Lớp học chuyên biệt:
            </label>
            <div className="custom-select-wrapper">
              <select
                id="student-class-select"
                className="custom-select-input"
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="ALL">Tất cả các lớp ({classList.length})</option>
                {classList.map((cls) => (
                  <option key={cls} value={cls}>
                    Lớp {cls}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Combobox Loại hỗ trợ / Dạng tật */}
          <div className="form-control-item">
            <label htmlFor="student-support-select" className="form-control-label">
              <FiTag /> Loại hỗ trợ / Nhu cầu:
            </label>
            <div className="custom-select-wrapper">
              <select
                id="student-support-select"
                className="custom-select-input"
                value={selectedSupportType}
                onChange={(e) => {
                  setSelectedSupportType(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="ALL">Tất cả loại hỗ trợ</option>
                {supportTypeList.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 4. Combobox Giới tính */}
          <div className="form-control-item gender-control-item">
            <label htmlFor="student-gender-select" className="form-control-label">
              <FiSmile /> Giới tính:
            </label>
            <div className="custom-select-wrapper">
              <select
                id="student-gender-select"
                className="custom-select-input"
                value={selectedGender}
                onChange={(e) => {
                  setSelectedGender(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="ALL">Tất cả giới tính</option>
                <option value="NAM">Nam</option>
                <option value="NU">Nữ</option>
              </select>
            </div>
          </div>
        </div>

        {/* Thanh kết quả đếm */}
        <div className="filter-result-bar">
          <span className="result-count">
            Hiển thị <strong>{filteredStudents.length}</strong> học sinh
            {isFiltered && ` (đã áp dụng bộ lọc)`}
          </span>
          <span className="privacy-badge">
            <FiInfo /> Tên học sinh được viết tắt theo nguyên tắc bảo vệ quyền trẻ em
          </span>
        </div>
      </section>

      {/* Nội dung danh sách học sinh */}
      {loading ? (
        <div className="student-loading-wrap">
          <Loading type="spinner" message="Đang tải danh sách học sinh từ nhà trường..." />
        </div>
      ) : filteredStudents.length === 0 ? (
        <EmptyState
          title="Không tìm thấy học sinh nào phù hợp"
          description="Vui lòng thử tìm với từ khóa khác hoặc bấm nút đặt lại bộ lọc để xem toàn bộ danh sách các em."
          actionLabel="Đặt lại bộ lọc"
          onAction={handleResetFilters}
        />
      ) : viewMode === 'grid' ? (
        /* DẠNG GRID CARDS HIỆN ĐẠI */
        <div className="students-cards-grid">
          {paginatedStudents.map((stu, index) => {
            const studentCode = `HS${String(stu.mahocsinh || stu.id || index + 1).padStart(3, '0')}`;
            const isFemale = String(stu.gioitinh || stu.gioiTinh || '').toUpperCase().includes('NU') || String(stu.gioitinh || stu.gioiTinh || '').toUpperCase().includes('NỮ');
            const initialChar = (stu.hoten || 'E').charAt(0).toUpperCase();

            return (
              <div key={stu.mahocsinh || stu.id || index} className="student-profile-card">
                <div className="student-card-header">
                  <div className={`student-avatar ${isFemale ? 'avatar-female' : 'avatar-male'}`}>
                    {initialChar}
                  </div>
                  <div className="student-card-identity">
                    <div className="student-card-code">#{studentCode}</div>
                    <h3 className="student-card-name" title={stu.hoten}>
                      {stu.hoten || 'Học sinh'}
                    </h3>
                  </div>
                  <span className={`gender-pill ${isFemale ? 'pill-female' : 'pill-male'}`}>
                    {isFemale ? 'Nữ' : 'Nam'}
                  </span>
                </div>

                <div className="student-card-body">
                  <div className="student-info-row">
                    <span className="info-label">Lớp học:</span>
                    <span className="class-tag">Lớp {stu.lop || 'Chuyên biệt'}</span>
                  </div>

                  <div className="student-info-row">
                    <span className="info-label">Nhu cầu:</span>
                    <div className="support-tags-wrap">
                      {renderSupportTag(stu.loaihotro || stu.loaiHoTro, stu.mota)}
                    </div>
                  </div>

                  <div className="student-circumstance-box">
                    <span className="circumstance-label">Hoàn cảnh & đặc điểm:</span>
                    <p className="circumstance-text">
                      {stu.mota || stu.moTa || 'Đang theo học và rèn luyện kỹ năng hòa nhập tại trường.'}
                    </p>
                  </div>
                </div>

                <div className="student-card-footer">
                  <button
                    type="button"
                    className="btn-support-student"
                    onClick={() => navigate('/campaigns')}
                  >
                    <FiHeart /> Chung tay giúp đỡ <FiExternalLink />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* DẠNG BẢNG CHI TIẾT */
        <div className="students-table-wrapper">
          <div className="table-responsive">
            <table className="students-data-table">
              <thead>
                <tr>
                  <th style={{ width: '60px', textAlign: 'center' }}>STT</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>Mã HS</th>
                  <th style={{ minWidth: '180px' }}>Họ và tên (Bảo mật)</th>
                  <th style={{ width: '90px', textAlign: 'center' }}>Giới tính</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>Lớp</th>
                  <th style={{ width: '180px' }}>Dạng tật / Hỗ trợ</th>
                  <th>Hoàn cảnh & Đặc điểm chuyên biệt</th>
                  <th style={{ width: '140px', textAlign: 'center' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.map((stu, index) => {
                  const stt = (currentPage - 1) * pageSize + index + 1;
                  const studentCode = `HS${String(stu.mahocsinh || stu.id || index + 1).padStart(3, '0')}`;
                  const isFemale = String(stu.gioitinh || stu.gioiTinh || '').toUpperCase().includes('NU') || String(stu.gioitinh || stu.gioiTinh || '').toUpperCase().includes('NỮ');

                  return (
                    <tr key={stu.mahocsinh || stu.id || index}>
                      <td style={{ textAlign: 'center', color: '#6b7280', fontWeight: 600 }}>
                        {stt}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="code-badge">#{studentCode}</span>
                      </td>
                      <td>
                        <div className="table-student-name">
                          <span className={`table-avatar-mini ${isFemale ? 'avatar-female' : 'avatar-male'}`}>
                            {(stu.hoten || 'E').charAt(0).toUpperCase()}
                          </span>
                          <span className="name-text">{stu.hoten || 'Học sinh'}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`gender-pill ${isFemale ? 'pill-female' : 'pill-male'}`}>
                          {isFemale ? 'Nữ' : 'Nam'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="class-tag">Lớp {stu.lop || 'CB'}</span>
                      </td>
                      <td>
                        {renderSupportTag(stu.loaihotro || stu.loaiHoTro, stu.mota)}
                      </td>
                      <td>
                        <p className="table-desc-text">
                          {stu.mota || stu.moTa || 'Đang theo học tại trường chuyên biệt Nguyễn Đình Chiểu.'}
                        </p>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="btn-table-action"
                          onClick={() => navigate('/campaigns')}
                          title="Ủng hộ qua các chiến dịch thiện nguyện"
                        >
                          <FiHeart /> Ủng hộ
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Phân trang */}
      {!loading && filteredStudents.length > 0 && totalPages > 1 && (
        <div className="student-pagination-wrap">
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            onChange={(p) => {
              setCurrentPage(p);
              window.scrollTo({ top: 350, behavior: 'smooth' });
            }}
          />
        </div>
      )}

      {/* Hộp cam kết bảo mật & quyền riêng tư của học sinh */}
      <section className="student-privacy-footer">
        <div className="privacy-footer-card">
          <div className="privacy-footer-icon-wrap">
            <FiInfo className="privacy-footer-icon" />
          </div>
          <div className="privacy-footer-content">
            <h4 className="privacy-footer-title">Cam kết bảo vệ quyền riêng tư & hình ảnh trẻ em</h4>
            <p className="privacy-footer-desc">
              Toàn bộ họ tên của học sinh được công khai dưới dạng viết tắt (VD: <em>Nguyễn H. Đ.</em>) theo Luật Trẻ em 2016
              và Quy chế công tác xã hội của Trường Phổ Thông Chuyên Biệt Nguyễn Đình Chiểu. Nghiêm cấm sao chép, thu thập
              hoặc sử dụng thông tin và hình ảnh của học sinh vào mục đích thương mại hoặc bất kỳ hành vi xâm hại quyền riêng tư nào.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StudentList;
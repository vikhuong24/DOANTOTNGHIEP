// Trang Phân bổ kinh phí cho học sinh chuyên biệt (Fundraiser) theo ERD mới
// BẢNG DOTPHANBO: maDotphanbo (PK), mabaitaitro (FK), tendot, tongtien (MỚI), ngaytrao, trangthai, macanbo, mahieutruong
// BẢNG CT_PHANBO: maChiTietPhanBo (PK), maDotPhanBo (FK), maHocSinh (FK), soTien (MỚI), nguoinhan, ngayNhan, ghichu
import { useState, useEffect } from 'react';
import { getStudents, distributeScholarship } from '../../../../services/studentService';
import { getCampaigns } from '../../../../services/campaignService';
import { getDistributions } from '../../../../services/distributionService';
import Card from '../../../../components/Card/Card';
import Table from '../../../../components/Table/Table';
import Button from '../../../../components/Button/Button';
import Input from '../../../../components/Input/Input';
import Loading from '../../../../components/Loading/Loading';
import { useNotification } from '../../../../components/Notification/Notification';
import { formatCurrency, formatDate } from '../../../../utils/formatters';
import { FiAward, FiCheck, FiUsers, FiFilter } from 'react-icons/fi';
import './ScholarshipDistribution.css';

const ScholarshipDistribution = () => {
  const { addToast } = useNotification();

  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [distributions, setDistributions] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Filter học sinh
  const [filterType, setFilterType] = useState('ALL');

  // Form phân bổ kinh phí
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [tenDot, setTenDot] = useState('');
  const [soTienMoiEm, setSoTienMoiEm] = useState(2000000);
  const [ngayTrao, setNgayTrao] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [stRes, campRes, distRes] = await Promise.all([
        getStudents(),
        getCampaigns(),
        getDistributions(),
      ]);
      const stList = stRes?.data || stRes || [];
      const campList = campRes?.data || campRes || [];
      const distList = distRes?.data || distRes || [];

      setStudents(stList);
      setCampaigns(campList);
      setDistributions(distList);

      if (campList.length > 0) {
        setSelectedCampaignId(campList[0].maBaiTaiTro || campList[0].id);
      }
      setTenDot(`Đợt trao kinh phí hỗ trợ học sinh - Tháng ${new Date().getMonth() + 1}`);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu phân bổ kinh phí:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredStudents = students.filter((s) => {
    if (filterType === 'ALL') return true;
    return s.loaihotro === filterType;
  });

  const handleToggleSelectAll = () => {
    if (selectedStudentIds.length === filteredStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map((s) => s.mahocsinh));
    }
  };

  const handleToggleStudent = (id) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCreateDistribution = async (e) => {
    e.preventDefault();
    if (!selectedStudentIds.length) {
      addToast('Vui lòng chọn ít nhất 1 học sinh nhận hỗ trợ', 'warning');
      return;
    }
    if (!tenDot.trim()) {
      addToast('Vui lòng nhập tên đợt phân bổ kinh phí', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const tongtien = Number(soTienMoiEm) * selectedStudentIds.length;
      const payload = {
        maBaiTaiTro: Number(selectedCampaignId),
        tenDot,
        giaTriMoiSuat: Number(soTienMoiEm),
        tongGiaTri: tongtien,
        tongtien: tongtien,
        soLuongHocSinh: selectedStudentIds.length,
        danhSachHocSinh: selectedStudentIds,
        ngayNhan: ngayTrao,
        trangThai: 'DaTrao',
      };

      await distributeScholarship(payload);
      addToast(
        `Phân bổ kinh phí thành công cho ${selectedStudentIds.length} học sinh với tổng số tiền ${formatCurrency(
          tongtien
        )}!`,
        'success'
      );
      setSelectedStudentIds([]);
      loadData();
    } catch (err) {
      addToast(err.message || 'Lỗi khi phân bổ kinh phí', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const distColumns = [
    {
      key: 'maDotphanbo',
      title: 'Mã đợt',
      width: '90px',
      render: (val, row) => `#PB${val || row.id}`,
    },
    {
      key: 'tendot',
      title: 'Tên đợt trao kinh phí',
      render: (val, row) => (
        <div>
          <div className="font-semibold text-primary">{val || row.tenDot || row.title}</div>
          <div className="text-muted text-sm">
            {(row.chiTiet?.length || row.soLuongHocSinh || 0)} em học sinh thụ hưởng
          </div>
        </div>
      ),
    },
    {
      key: 'tongtien',
      title: 'Tổng số tiền phân bổ',
      width: '180px',
      align: 'right',
      render: (val, row) => (
        <span className="font-bold text-success">
          {formatCurrency(val || row.tongGiaTri || row.giaTri || 0)}
        </span>
      ),
    },
    {
      key: 'ngaytrao',
      title: 'Ngày trao',
      width: '130px',
      render: (val, row) => formatDate(val || row.ngayNhan || new Date().toISOString()),
    },
    {
      key: 'trangthai',
      title: 'Trạng thái',
      width: '130px',
      render: (val) => (
        <span className="status-badge badge--approved">
          <FiCheck /> {val === 'DaTrao' ? 'Đã trao tặng' : val === 'DaDuyet' ? 'Đã duyệt' : 'Chờ duyệt'}
        </span>
      ),
    },
  ];

  if (loading) return <Loading text="Đang tải dữ liệu phân bổ học bổng..." />;

  return (
    <div className="scholarship-distribution-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Phân Bổ Kinh Phí Cho Học Sinh</h1>
          <p className="page-subtitle">
            Lựa chọn học sinh có hoàn cảnh đặc biệt khó khăn để trao kinh phí hỗ trợ học tập và sinh hoạt
          </p>
        </div>
      </div>

      <div className="distribution-grid">
        {/* Form thiết lập đợt phân bổ */}
        <div className="distribution-form-col">
          <Card title="Thiết lập đợt trao kinh phí mới">
            <form onSubmit={handleCreateDistribution} className="dist-form">
              <div className="input-wrap">
                <label className="input-label">Nguồn quỹ từ chiến dịch</label>
                <select
                  className="input-field"
                  value={selectedCampaignId}
                  onChange={(e) => setSelectedCampaignId(e.target.value)}
                >
                  {campaigns.map((c) => (
                    <option key={c.maBaiTaiTro || c.id} value={c.maBaiTaiTro || c.id}>
                      {c.tieude || c.title}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Tên đợt trao kinh phí"
                value={tenDot}
                onChange={(e) => setTenDot(e.target.value)}
                required
              />

              <div className="two-cols">
                <Input
                  type="number"
                  label="Số tiền mỗi em nhận (VNĐ)"
                  value={soTienMoiEm}
                  onChange={(e) => setSoTienMoiEm(Number(e.target.value))}
                  required
                />
                <Input
                  type="date"
                  label="Ngày tổ chức trao tặng"
                  value={ngayTrao}
                  onChange={(e) => setNgayTrao(e.target.value)}
                  required
                />
              </div>

              <div className="calc-summary-box">
                <div className="calc-row">
                  <span>Số học sinh đã chọn:</span>
                  <span className="font-bold text-primary">{selectedStudentIds.length} em</span>
                </div>
                <div className="calc-row">
                  <span>Tổng kinh phí đợt phân bổ:</span>
                  <span className="font-bold text-success text-lg">
                    {formatCurrency(selectedStudentIds.length * soTienMoiEm)}
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                loading={submitting}
                disabled={selectedStudentIds.length === 0}
              >
                <FiAward /> Xác nhận lập đợt phân bổ
              </Button>
            </form>
          </Card>
        </div>

        {/* Danh sách học sinh chọn */}
        <div className="student-selection-col">
          <Card
            title={
              <div className="card-title-flex">
                <span className="title-with-count">
                  <FiUsers /> Chọn học sinh nhận hỗ trợ ({selectedStudentIds.length}/{filteredStudents.length})
                </span>
                <button
                  type="button"
                  className="btn-select-all"
                  onClick={handleToggleSelectAll}
                >
                  {selectedStudentIds.length === filteredStudents.length
                    ? 'Bỏ chọn tất cả'
                    : 'Chọn tất cả'}
                </button>
              </div>
            }
          >
            {/* Lọc nhanh theo đối tượng */}
            <div className="student-filter-chips">
              <span className="filter-chip-label">
                <FiFilter /> Lọc:
              </span>
              <button
                className={`chip ${filterType === 'ALL' ? 'active' : ''}`}
                onClick={() => setFilterType('ALL')}
              >
                Tất cả
              </button>
              <button
                className={`chip ${filterType === 'KhuyetTat' ? 'active' : ''}`}
                onClick={() => setFilterType('KhuyetTat')}
              >
                Khuyết tật
              </button>
              <button
                className={`chip ${filterType === 'HoNgheo' ? 'active' : ''}`}
                onClick={() => setFilterType('HoNgheo')}
              >
                Hộ nghèo
              </button>
              <button
                className={`chip ${filterType === 'MoCoi' ? 'active' : ''}`}
                onClick={() => setFilterType('MoCoi')}
              >
                Mồ côi
              </button>
            </div>

            <div className="students-checkbox-list">
              {filteredStudents.map((st) => {
                const isChecked = selectedStudentIds.includes(st.mahocsinh);
                return (
                  <div
                    key={st.mahocsinh}
                    className={`student-item-check ${isChecked ? 'selected' : ''}`}
                    onClick={() => handleToggleStudent(st.mahocsinh)}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                    />
                    <div className="student-check-info">
                      <div className="student-check-name">{st.hoten}</div>
                      <div className="student-check-sub">
                        Lớp: {st.lop} • Hoàn cảnh: <strong>{st.loaihotro}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Lịch sử các đợt trao kinh phí */}
      <Card title="Các đợt phân bổ kinh phí đã thực hiện" padding={false}>
        <Table
          columns={distColumns}
          data={distributions}
          rowKey="maDotphanbo"
          emptyTitle="Chưa có đợt phân bổ nào"
          emptyDescription="Chưa có bản ghi phân bổ kinh phí nào được tạo."
        />
      </Card>
    </div>
  );
};

export default ScholarshipDistribution;

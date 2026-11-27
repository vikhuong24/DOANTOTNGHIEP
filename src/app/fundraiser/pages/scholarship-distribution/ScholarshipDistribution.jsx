// Trang Lập kế hoạch & Phân bổ kinh phí học bổng cho học sinh chuyên biệt (Fundraiser)
// Kết nối API Backend Spring Boot:
// - GET /fundraiser/distributions, GET /fundraiser/distributions/{id}
// - POST /fundraiser/distributions, PUT /fundraiser/distributions/{id}/disburse
import { useState, useEffect, useMemo } from "react";
import {
  getFundraiserStudents,
  getStudentById,
} from "../../../../services/studentService";
import {
  getFundraiserCampaigns,
  getAllCampaigns,
} from "../../../../services/campaignService";
import {
  getAllDistributions,
  getDistributionById,
  createDistribution,
  disburseDistribution,
} from "../../../../services/distributionService";
import Card from "../../../../components/Card/Card";
import Table from "../../../../components/Table/Table";
import Button from "../../../../components/Button/Button";
import Input from "../../../../components/Input/Input";
import Modal from "../../../../components/Modal/Modal";
import Loading from "../../../../components/Loading/Loading";
import EmptyState from "../../../../components/EmptyState/EmptyState";
import { useNotification } from "../../../../components/Notification/Notification";
import { formatCurrency, formatDate } from "../../../../utils/formatters";
import {
  FiAward,
  FiSend,
  FiCheck,
  FiUsers,
  FiFilter,
  FiSearch,
  FiEye,
  FiPhone,
  FiUser,
  FiCheckCircle,
  FiClock,
  FiAlertTriangle,
} from "react-icons/fi";
import "./ScholarshipDistribution.css";

const ScholarshipDistribution = () => {
  const { addToast } = useNotification();

  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [distributions, setDistributions] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Filter & Search học sinh
  const [filterType, setFilterType] = useState("ALL");
  const [studentKeyword, setStudentKeyword] = useState("");
  const [searchingStudents, setSearchingStudents] = useState(false);

  // Modal Chi tiết học sinh
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailStudent, setDetailStudent] = useState(null);

  // Modal Chi tiết đợt phân bổ (GET /fundraiser/distributions/{id})
  const [distDetailOpen, setDistDetailOpen] = useState(false);
  const [distDetailLoading, setDistDetailLoading] = useState(false);
  const [selectedDist, setSelectedDist] = useState(null);
  const [disbursingId, setDisbursingId] = useState(null);

  // Form phân bổ kinh phí
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [tenDot, setTenDot] = useState("");
  const [soTienMoiEm, setSoTienMoiEm] = useState(2000000);
  const [ngayTrao, setNgayTrao] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [ghiChuChung, setGhiChuChung] = useState(
    "Học bổng hỗ trợ học sinh vượt khó",
  );
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [stList, campRes, distRes] = await Promise.all([
        getFundraiserStudents().catch(() => []),
        getFundraiserCampaigns().catch(() =>
          getAllCampaigns({ size: 100 }).then((r) => r.data || []),
        ),
        getAllDistributions().catch(() => ({ data: [] })),
      ]);

      const rawCampList = Array.isArray(campRes)
        ? campRes
        : campRes?.data || [];
      // Chỉ cho phép lập kế hoạch phân bổ cho bài gây quỹ đã duyệt (DADUYET) hoặc đã hoàn thành (KETTHUC)
      const eligibleCampaigns = rawCampList.filter((c) => {
        const st = String(c.trangThai || c.trangthai || "").toUpperCase();
        return st === "DADUYET" || st === "KETTHUC";
      });

      const distList = distRes?.data || [];

      setStudents(stList || []);
      setCampaigns(eligibleCampaigns);
      setDistributions(distList);

      if (eligibleCampaigns.length > 0 && !selectedCampaignId) {
        const firstWithFund =
          eligibleCampaigns.find((c) => Number(c.tongTienDaNhan || 0) > 0) ||
          eligibleCampaigns[0];
        setSelectedCampaignId(
          String(firstWithFund.maBaiTaiTro || firstWithFund.id),
        );
      }
      if (!tenDot) {
        setTenDot(
          `Đợt trao học bổng hỗ trợ học sinh - Tháng ${new Date().getMonth() + 1}`,
        );
      }
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu phân bổ kinh phí:", err);
      addToast("Không thể tải dữ liệu phân bổ kinh phí", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedCampaign = useMemo(
    () =>
      campaigns.find(
        (c) => String(c.maBaiTaiTro || c.id) === String(selectedCampaignId),
      ),
    [campaigns, selectedCampaignId],
  );

  const campaignFundAvailable = Number(
    selectedCampaign?.tongTienDaNhan || selectedCampaign?.tongtienDaNhan || 0,
  );
  const totalPlannedAmount =
    selectedStudentIds.length * Number(soTienMoiEm || 0);
  const isOverBudget =
    selectedCampaign && totalPlannedAmount > campaignFundAvailable;

  const handleSearchStudents = async (kw) => {
    setStudentKeyword(kw);
    try {
      setSearchingStudents(true);
      const list = await getFundraiserStudents(kw);
      setStudents(list || []);
    } catch (err) {
      addToast(err?.message || "Lỗi khi tìm kiếm học sinh", "error");
    } finally {
      setSearchingStudents(false);
    }
  };

  const handleOpenStudentDetail = async (e, st) => {
    e.stopPropagation();
    const id = st.maHocSinh || st.mahocsinh;
    setDetailStudent(st);
    setDetailModalOpen(true);
    try {
      const fresh = await getStudentById(id);
      if (fresh) setDetailStudent(fresh);
    } catch {
      // keep existing
    }
  };

  const filteredStudents = students.filter((s) => {
    if (filterType === "ALL") return true;
    const loai = String(s.loaiHoTro || s.loaihotro || "").toLowerCase();
    return loai.includes(filterType.toLowerCase());
  });

  const handleToggleSelectAll = () => {
    if (
      selectedStudentIds.length === filteredStudents.length &&
      filteredStudents.length > 0
    ) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(
        filteredStudents.map((s) => s.maHocSinh || s.mahocsinh),
      );
    }
  };

  const handleToggleStudent = (id) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleCreateDistribution = async (e) => {
    e.preventDefault();
    if (!selectedCampaignId) {
      addToast("Vui lòng chọn chiến dịch nguồn kinh phí (đã duyệt)", "warning");
      return;
    }
    if (!selectedStudentIds.length) {
      addToast("Vui lòng chọn ít nhất 1 học sinh nhận hỗ trợ", "warning");
      return;
    }
    const titleTrimmed = tenDot.trim();
    if (titleTrimmed.length < 5 || titleTrimmed.length > 255) {
      addToast("Tên đợt phân bổ phải từ 5 đến 255 ký tự", "warning");
      return;
    }
    if (!soTienMoiEm || Number(soTienMoiEm) < 1000) {
      addToast(
        "Số tiền phân bổ mỗi học sinh tối thiểu là 1,000 VNĐ",
        "warning",
      );
      return;
    }
    if (isOverBudget) {
      addToast(
        `Tổng tiền phân bổ (${formatCurrency(totalPlannedAmount)}) vượt quá số tiền đã nhận của chiến dịch (${formatCurrency(campaignFundAvailable)})!`,
        "warning",
      );
      return;
    }

    try {
      setSubmitting(true);
      const chiTietPhanBo = selectedStudentIds.map((stId) => {
        const stObj = students.find(
          (s) => Number(s.maHocSinh || s.mahocsinh) === Number(stId),
        );
        return {
          maHocSinh: Number(stId),
          soTien: Number(soTienMoiEm),
          nguoiNhan: stObj?.tenPhuHuynh || null,
          ghiChu: ghiChuChung.trim() || null,
        };
      });

      const created = await createDistribution({
        maBaiTaiTro: Number(selectedCampaignId),
        tenDot: titleTrimmed,
        ngayTrao,
        chiTietPhanBo,
      });

      addToast(
        `Đã lập kế hoạch phân bổ #PB${created?.maDotPhanBo || ""} (${formatCurrency(totalPlannedAmount)}) với trạng thái Chờ Hiệu trưởng duyệt!`,
        "success",
      );
      setSelectedStudentIds([]);
      loadData();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Lỗi khi lập kế hoạch phân bổ";
      addToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDistDetail = async (row) => {
    const id = row.maDotPhanBo || row.id;
    setSelectedDist(row);
    setDistDetailOpen(true);
    try {
      setDistDetailLoading(true);
      const fresh = await getDistributionById(id);
      if (fresh) setSelectedDist(fresh);
    } catch (err) {
      addToast(err?.message || "Không thể tải chi tiết đợt phân bổ", "error");
    } finally {
      setDistDetailLoading(false);
    }
  };

  const handleDisburse = async (row) => {
    const id = row.maDotPhanBo || row.id;
    try {
      setDisbursingId(id);
      const updated = await disburseDistribution(id);
      addToast(
        `Đã xác nhận hoàn tất giải ngân đợt #PB${id} (DATRAO)!`,
        "success",
      );
      if (selectedDist && Number(selectedDist.maDotPhanBo) === Number(id)) {
        setSelectedDist(updated);
      }
      loadData();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể xác nhận hoàn tất giải ngân";
      addToast(msg, "error");
    } finally {
      setDisbursingId(null);
    }
  };

  const renderStatusBadge = (val) => {
    const s = String(val || "").toUpperCase();
    if (s === "DATRAO") {
      return (
        <span className="status-badge badge--approved">
          <FiCheckCircle /> Đã trao tặng
        </span>
      );
    }
    if (s === "DADUYET") {
      return (
        <span
          className="status-badge"
          style={{ background: "#e7f5ff", color: "#1971c2" }}
        >
          <FiCheck /> Đã duyệt (Chờ trao)
        </span>
      );
    }
    return (
      <span
        className="status-badge badge--pending"
        style={{ background: "#fff3bf", color: "#d9480f" }}
      >
        <FiClock /> Chờ Hiệu trưởng duyệt
      </span>
    );
  };

  const distColumns = [
    {
      key: "maDotPhanBo",
      title: "Mã đợt",
      width: "85px",
      render: (val, row) => `#PB${val || row.id}`,
    },
    {
      key: "tenDot",
      title: "Tên đợt phân bổ",
      render: (val, row) => (
        <div>
          <div className="font-semibold text-primary">{val || row.tendot}</div>
          {row.tieuDeBaiTaiTro && (
            <div className="text-muted text-sm">
              Chiến dịch: {row.tieuDeBaiTaiTro}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "tongTien",
      title: "Tổng số tiền",
      width: "150px",
      align: "right",
      render: (val, row) => (
        <span className="font-bold text-success">
          {formatCurrency(val ?? row.tongtien ?? 0)}
        </span>
      ),
    },
    {
      key: "ngayTrao",
      title: "Ngày trao",
      width: "120px",
      render: (val, row) =>
        val || row.ngaytrao ? formatDate(val || row.ngaytrao) : "—",
    },
    {
      key: "trangThai",
      title: "Trạng thái",
      width: "175px",
      render: (val, row) => renderStatusBadge(val || row.trangthai),
    },
    {
      key: "actions",
      title: "Thao tác",
      width: "215px",
      render: (_, row) => {
        const id = row.maDotPhanBo || row.id;
        const st = String(row.trangThai || row.trangthai || "").toUpperCase();
        return (
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleOpenDistDetail(row)}
            >
              <FiEye /> Chi tiết
            </Button>
            {st === "DADUYET" && (
              <Button
                size="sm"
                variant="primary"
                loading={disbursingId === id}
                onClick={() => handleDisburse(row)}
              >
                <FiCheckCircle /> Xác nhận trao
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  if (loading)
    return <Loading text="Đang tải dữ liệu lập kế hoạch phân bổ..." />;

  return (
    <div className="scholarship-distribution-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Phân Bổ Kinh Phí Cho Học Sinh</h1>
          <p className="page-subtitle">
            Lập kế hoạch phân bổ kinh phí từ các chiến dịch đã duyệt, theo dõi
            phê duyệt của Ban Giám Hiệu và xác nhận hoàn tất trao quà.
          </p>
        </div>
      </div>

      <div className="distribution-grid">
        {/* Form thiết lập đợt phân bổ */}
        <div className="distribution-form-col">
          <Card title="Thiết lập kế hoạch phân bổ mới">
            <form onSubmit={handleCreateDistribution} className="dist-form">
              <div className="input-wrap">
                <label className="input-label">
                  Nguồn quỹ từ chiến dịch (Đã duyệt / Hoàn tất)
                </label>
                <select
                  className="input-field"
                  value={selectedCampaignId}
                  onChange={(e) => setSelectedCampaignId(e.target.value)}
                >
                  {campaigns.length === 0 && (
                    <option value="">
                      -- Chưa có chiến dịch nào được duyệt --
                    </option>
                  )}
                  {campaigns.map((c) => {
                    const id = c.maBaiTaiTro || c.id;
                    const received = Number(
                      c.tongTienDaNhan || c.tongtienDaNhan || 0,
                    );
                    return (
                      <option key={id} value={id}>
                        {c.tieuDe || c.tieude} (Quỹ đã nhận:{" "}
                        {formatCurrency(received)})
                      </option>
                    );
                  })}
                </select>
                {selectedCampaign && (
                  <div
                    style={{
                      fontSize: "0.82rem",
                      color: "#495057",
                      marginTop: "4px",
                    }}
                  >
                    Ngân sách đã tiếp nhận của chiến dịch:{" "}
                    <strong style={{ color: "var(--success)" }}>
                      {formatCurrency(campaignFundAvailable)}
                    </strong>
                  </div>
                )}
              </div>

              <Input
                label="Tên đợt trao kinh phí"
                value={tenDot}
                onChange={(e) => setTenDot(e.target.value)}
                required
                helpText="Từ 5 đến 255 ký tự"
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
                  label="Ngày dự kiến trao"
                  value={ngayTrao}
                  onChange={(e) => setNgayTrao(e.target.value)}
                  required
                />
              </div>

              <Input
                label="Ghi chú phân bổ"
                value={ghiChuChung}
                onChange={(e) => setGhiChuChung(e.target.value)}
                placeholder="VD: Học bổng vượt khó học kỳ 1..."
              />

              <div className="calc-summary-box">
                <div className="calc-row">
                  <span>Số học sinh đã chọn:</span>
                  <span className="font-bold text-primary">
                    {selectedStudentIds.length} em
                  </span>
                </div>
                <div className="calc-row">
                  <span>Tổng kinh phí dự kiến:</span>
                  <span
                    className={`font-bold text-lg ${isOverBudget ? "text-danger" : "text-success"}`}
                  >
                    {formatCurrency(totalPlannedAmount)}
                  </span>
                </div>
              </div>

              {isOverBudget && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "#fff3bf",
                    color: "#d9480f",
                    padding: "0.6rem 0.85rem",
                    borderRadius: "6px",
                    fontSize: "0.85rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  <FiAlertTriangle style={{ flexShrink: 0 }} />
                  <span>
                    Tổng tiền phân bổ vượt quá quỹ đã nhận (
                    {formatCurrency(campaignFundAvailable)})!
                  </span>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                loading={submitting}
                disabled={
                  selectedStudentIds.length === 0 ||
                  isOverBudget ||
                  !selectedCampaignId
                }
              >
                <FiSend /> Gửi kế hoạch phân bổ
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
                  <FiUsers /> Chọn học sinh nhận hỗ trợ (
                  {selectedStudentIds.length}/{filteredStudents.length})
                </span>
                <button
                  type="button"
                  className="btn-select-all"
                  onClick={handleToggleSelectAll}
                >
                  {selectedStudentIds.length === filteredStudents.length &&
                  filteredStudents.length > 0
                    ? "Bỏ chọn tất cả"
                    : "Chọn tất cả"}
                </button>
              </div>
            }
          >
            <div style={{ marginBottom: "0.75rem", position: "relative" }}>
              <FiSearch
                style={{
                  position: "absolute",
                  left: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#888",
                }}
              />
              <input
                type="text"
                className="input-field"
                style={{ paddingLeft: "32px", fontSize: "0.9rem" }}
                placeholder="Tìm học sinh theo tên, lớp hoặc hoàn cảnh..."
                value={studentKeyword}
                onChange={(e) => handleSearchStudents(e.target.value)}
              />
            </div>

            <div className="student-filter-chips">
              <span className="filter-chip-label">
                <FiFilter /> Lọc:
              </span>
              <button
                type="button"
                className={`chip ${filterType === "ALL" ? "active" : ""}`}
                onClick={() => setFilterType("ALL")}
              >
                Tất cả
              </button>
              <button
                type="button"
                className={`chip ${filterType === "khiếm thị" ? "active" : ""}`}
                onClick={() => setFilterType("khiếm thị")}
              >
                Khiếm thị
              </button>
              <button
                type="button"
                className={`chip ${filterType === "nhìn kém" ? "active" : ""}`}
                onClick={() => setFilterType("nhìn kém")}
              >
                Nhìn kém
              </button>
              <button
                type="button"
                className={`chip ${filterType === "vận động" ? "active" : ""}`}
                onClick={() => setFilterType("vận động")}
              >
                Vận động
              </button>
            </div>

            {searchingStudents ? (
              <Loading rows={3} type="skeleton" />
            ) : filteredStudents.length === 0 ? (
              <EmptyState
                title="Không tìm thấy học sinh"
                description="Không có học sinh nào khớp với từ khóa hoặc bộ lọc đã chọn."
              />
            ) : (
              <div className="students-checkbox-list">
                {filteredStudents.map((st) => {
                  const stId = st.maHocSinh || st.mahocsinh;
                  const isChecked = selectedStudentIds.includes(stId);
                  return (
                    <div
                      key={stId}
                      className={`student-item-check ${isChecked ? "selected" : ""}`}
                      onClick={() => handleToggleStudent(stId)}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                      />
                      <div className="student-check-info" style={{ flex: 1 }}>
                        <div className="student-check-name">
                          {st.hoTen || st.hoten}
                        </div>
                        <div className="student-check-sub">
                          {st.lop} • Hoàn cảnh:{" "}
                          <strong>{st.loaiHoTro || st.loaihotro}</strong>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => handleOpenStudentDetail(e, st)}
                        title="Xem chi tiết hồ sơ học sinh"
                      >
                        <FiEye />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Danh sách các đợt phân bổ */}
      <Card
        title={`Danh sách các đợt phân bổ kinh phí (${distributions.length})`}
        padding={false}
      >
        <Table
          columns={distColumns}
          data={distributions}
          rowKey="maDotPhanBo"
          emptyTitle="Chưa có đợt phân bổ nào"
          emptyDescription="Chưa có kế hoạch phân bổ kinh phí nào được lập."
        />
      </Card>

      {/* Modal Chi tiết đợt phân bổ (GET /fundraiser/distributions/{id}) */}
      <Modal
        isOpen={distDetailOpen}
        onClose={() => setDistDetailOpen(false)}
        title={`Chi tiết kế hoạch phân bổ #PB${selectedDist?.maDotPhanBo || selectedDist?.id || ""}`}
        size="lg"
        footer={
          <div className="modal-buttons">
            {selectedDist &&
              String(selectedDist.trangThai).toUpperCase() === "DADUYET" && (
                <Button
                  variant="primary"
                  loading={
                    disbursingId ===
                    (selectedDist.maDotPhanBo || selectedDist.id)
                  }
                  onClick={() => handleDisburse(selectedDist)}
                >
                  <FiCheckCircle /> Xác nhận hoàn tất giải ngân (DATRAO)
                </Button>
              )}
            <Button variant="outline" onClick={() => setDistDetailOpen(false)}>
              Đóng
            </Button>
          </div>
        }
      >
        {distDetailLoading && !selectedDist?.chiTietPhanBo?.length ? (
          <Loading text="Đang tải chi tiết phân bổ..." />
        ) : (
          selectedDist && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div
                style={{
                  background: "#f8f9fa",
                  padding: "1rem",
                  borderRadius: "8px",
                  border: "1px solid #e9ecef",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.5rem",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "1.05rem",
                      color: "var(--primary)",
                    }}
                  >
                    {selectedDist.tenDot}
                  </h3>
                  {renderStatusBadge(selectedDist.trangThai)}
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "0.5rem",
                    fontSize: "0.88rem",
                  }}
                >
                  <div>
                    Chiến dịch:{" "}
                    <strong>
                      {selectedDist.tieuDeBaiTaiTro ||
                        `#${selectedDist.maBaiTaiTro}`}
                    </strong>
                  </div>
                  <div>
                    Tổng tiền:{" "}
                    <strong style={{ color: "var(--success)" }}>
                      {formatCurrency(selectedDist.tongTien || 0)}
                    </strong>
                  </div>
                  <div>
                    Ngày trao:{" "}
                    <strong>
                      {selectedDist.ngayTrao
                        ? formatDate(selectedDist.ngayTrao)
                        : "—"}
                    </strong>
                  </div>
                  <div>
                    Cán bộ lập: <strong>{selectedDist.tenCanBo || "—"}</strong>
                  </div>
                  {selectedDist.tenHieuTruong && (
                    <div>
                      Hiệu trưởng duyệt:{" "}
                      <strong>{selectedDist.tenHieuTruong}</strong>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: "0.95rem", marginBottom: "0.5rem" }}>
                  Danh sách học sinh thụ hưởng (
                  {(selectedDist.chiTietPhanBo || []).length} em)
                </h4>
                {(selectedDist.chiTietPhanBo || []).length === 0 ? (
                  <p className="text-muted">
                    Chưa có chi tiết học sinh cho đợt phân bổ này.
                  </p>
                ) : (
                  <div className="statement-table-wrap">
                    <table className="statement-table">
                      <thead>
                        <tr>
                          <th style={{ width: "50px", textAlign: "center" }}>
                            STT
                          </th>
                          <th>Học sinh</th>
                          <th>Lớp</th>
                          <th style={{ textAlign: "right" }}>Số tiền (VNĐ)</th>
                          <th>Người nhận thay</th>
                          <th>Ghi chú</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedDist.chiTietPhanBo.map((ct, idx) => (
                          <tr key={ct.maChiTietPhanBo || idx}>
                            <td style={{ textAlign: "center" }}>{idx + 1}</td>
                            <td style={{ fontWeight: 600 }}>
                              {ct.tenHocSinh || `#HS${ct.maHocSinh}`}
                            </td>
                            <td>{ct.lop || "—"}</td>
                            <td
                              style={{
                                textAlign: "right",
                                fontWeight: 700,
                                color: "var(--success)",
                              }}
                            >
                              {formatCurrency(ct.soTien || 0)}
                            </td>
                            <td>{ct.nguoiNhan || "—"}</td>
                            <td style={{ fontSize: "0.85rem", color: "#555" }}>
                              {ct.ghiChu || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </Modal>

      {/* Modal Chi tiết học sinh */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={`Hồ sơ học sinh #HS${detailStudent?.maHocSinh || detailStudent?.id || ""}`}
        size="md"
        footer={
          <Button variant="outline" onClick={() => setDetailModalOpen(false)}>
            Đóng
          </Button>
        }
      >
        {detailStudent && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            <div>
              <strong>Họ và tên:</strong>{" "}
              {detailStudent.hoTen || detailStudent.hoten}
            </div>
            <div>
              <strong>Lớp:</strong> {detailStudent.lop} •{" "}
              <strong>Giới tính:</strong>{" "}
              {String(detailStudent.gioiTinh).toUpperCase() === "NU"
                ? "Nữ"
                : "Nam"}
            </div>
            <div>
              <strong>Ngày sinh:</strong>{" "}
              {detailStudent.ngaySinh
                ? formatDate(detailStudent.ngaySinh)
                : "—"}
            </div>
            <div>
              <strong>Loại hình hỗ trợ:</strong>{" "}
              {detailStudent.loaiHoTro || detailStudent.loaihotro}
            </div>
            {detailStudent.moTa && (
              <div>
                <strong>Mô tả:</strong> {detailStudent.moTa}
              </div>
            )}
            <div
              style={{
                background: "#e7f5ff",
                padding: "0.75rem",
                borderRadius: "6px",
                marginTop: "0.25rem",
              }}
            >
              <div>
                <FiUser
                  style={{ verticalAlign: "middle", marginRight: "6px" }}
                />
                <strong>Phụ huynh:</strong>{" "}
                {detailStudent.tenPhuHuynh || "Chưa cập nhật"}
              </div>
              {detailStudent.sdtPhuHuynh && (
                <div>
                  <FiPhone
                    style={{ verticalAlign: "middle", marginRight: "6px" }}
                  />
                  <strong>SĐT:</strong> {detailStudent.sdtPhuHuynh}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ScholarshipDistribution;

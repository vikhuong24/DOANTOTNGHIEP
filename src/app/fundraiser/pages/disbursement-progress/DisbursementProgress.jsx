// Trang Cập nhật tiến độ giải ngân & Upload minh chứng (Fundraiser)
// Kết nối trực tiếp API Backend Spring Boot:
// - GET /fundraiser/campaigns
// - GET /fundraiser/distributions & PUT /fundraiser/distributions/{id}/disburse
// - GET /fundraiser/evidences?madotphanbo=... & POST /fundraiser/evidences/upload (MultipartFile)
import { useState, useEffect, useMemo } from 'react';
import { getFundraiserCampaigns, getAllCampaigns } from '../../../../services/campaignService';
import { getAllDistributions, disburseDistribution } from '../../../../services/distributionService';
import { getAllEvidences, uploadEvidence } from '../../../../services/evidenceService';
import Card from '../../../../components/Card/Card';
import Table from '../../../../components/Table/Table';
import Button from '../../../../components/Button/Button';
import Input from '../../../../components/Input/Input';
import ProgressBar from '../../../../components/ProgressBar/ProgressBar';
import Loading from '../../../../components/Loading/Loading';
import Modal from '../../../../components/Modal/Modal';
import Lightbox from '../../../../components/Lightbox/Lightbox';
import EmptyState from '../../../../components/EmptyState/EmptyState';
import { useNotification } from '../../../../components/Notification/Notification';
import { formatCurrency, formatDate } from '../../../../utils/formatters';
import {
  FiUpload,
  FiPlus,
  FiCheckCircle,
  FiFileText,
  FiImage,
  FiEye,
  FiClock,
  FiX,
  FiExternalLink,
} from 'react-icons/fi';
import './DisbursementProgress.css';

const EVIDENCE_TYPES = [
  { value: 'HOADON', label: 'Hóa đơn (HOADON)' },
  { value: 'HINHANH', label: 'Hình ảnh trao quà (HINHANH)' },
  { value: 'CHUNGTU', label: 'Chứng từ / Biên bản (CHUNGTU)' },
  { value: 'KHAC', label: 'Tài liệu khác (KHAC)' },
];

const DisbursementProgress = () => {
  const { addToast } = useNotification();

  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [distributions, setDistributions] = useState([]);
  const [evidencesByDist, setEvidencesByDist] = useState({});
  const [selectedCampaignId, setSelectedCampaignId] = useState('ALL');

  // Modal Upload chứng từ / Cập nhật giải ngân (chọn file)
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');
  const [uploadForm, setUploadForm] = useState({
    madotphanbo: '',
    loaitailieu: 'HOADON',
    mota: '',
    markDisbursed: false,
  });

  // Modal Xem hóa đơn / tài liệu minh chứng theo mã đợt phân bổ
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewingDistribution, setViewingDistribution] = useState(null);
  const [viewingEvidences, setViewingEvidences] = useState([]);

  // Lightbox phóng to ảnh minh chứng
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [campRes, distRes, eviRes] = await Promise.all([
        getFundraiserCampaigns().catch(() => getAllCampaigns({ size: 100 }).then((r) => r.data || [])),
        getAllDistributions().catch(() => ({ data: [] })),
        getAllEvidences().catch(() => ({ data: [] })),
      ]);

      const campList = Array.isArray(campRes) ? campRes : (campRes?.data || []);
      const distList = distRes?.data || [];
      const eviList = eviRes?.data || [];

      setCampaigns(campList);
      setDistributions(distList);

      // Nhóm minh chứng theo maDotPhanBo để hiển thị nhanh số lượng chứng từ trên bảng
      const grouped = {};
      eviList.forEach((ev) => {
        const distId = ev.maDotPhanBo || ev.madotphanbo;
        if (distId) {
          if (!grouped[distId]) grouped[distId] = [];
          grouped[distId].push(ev);
        }
      });
      setEvidencesByDist(grouped);
    } catch (err) {
      console.error('Lỗi tải dữ liệu giải ngân:', err);
      addToast('Không thể tải dữ liệu tiến độ giải ngân', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Lọc các đợt phân bổ theo chiến dịch đang chọn
  const filteredDistributions = useMemo(() => {
    if (selectedCampaignId === 'ALL') return distributions;
    return distributions.filter(
      (d) => Number(d.maBaiTaiTro || d.mabaitaitro) === Number(selectedCampaignId)
    );
  }, [distributions, selectedCampaignId]);

  const currentCampaign = campaigns.find(
    (c) => Number(c.maBaiTaiTro || c.id) === Number(selectedCampaignId)
  );

  // Tính toán KPI từ dữ liệu thực tế Backend
  const totalFund = useMemo(() => {
    if (selectedCampaignId === 'ALL') {
      return campaigns.reduce((sum, c) => sum + Number(c.tongTienDaNhan || c.tongtienDaNhan || 0), 0);
    }
    return Number(currentCampaign?.tongTienDaNhan || currentCampaign?.tongtienDaNhan || 0);
  }, [selectedCampaignId, campaigns, currentCampaign]);

  const totalDisbursed = useMemo(() => {
    return filteredDistributions
      .filter((d) => String(d.trangThai || d.trangthai || '').toUpperCase() === 'DATRAO')
      .reduce((sum, d) => sum + Number(d.tongTien || d.tongtien || 0), 0);
  }, [filteredDistributions]);

  const remainingFund = Math.max(0, totalFund - totalDisbursed);
  const disbursedPercent = totalFund > 0 ? Math.min(100, (totalDisbursed / totalFund) * 100) : 0;

  // Mở modal upload chứng từ (có thể truyền sẵn mã đợt phân bổ)
  const handleOpenUploadModal = (presetDistId = '') => {
    const defaultDistId =
      presetDistId ||
      (filteredDistributions[0]?.maDotPhanBo || filteredDistributions[0]?.id || '');

    setSelectedFile(null);
    setFilePreview('');
    setUploadForm({
      madotphanbo: defaultDistId ? String(defaultDistId) : '',
      loaitailieu: 'HOADON',
      mota: '',
      markDisbursed: false,
    });
    setUploadModalOpen(true);
  };

  const ALLOWED_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf'];

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED_EXTS.includes(ext)) {
      addToast('Định dạng tệp không được hỗ trợ! Chỉ chấp nhận: jpg, jpeg, png, webp, gif, pdf.', 'warning');
      e.target.value = '';
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      addToast('Kích thước tệp tối đa là 20MB', 'warning');
      e.target.value = '';
      return;
    }
    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      setFilePreview(URL.createObjectURL(file));
    } else {
      setFilePreview('');
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      addToast('Vui lòng chọn tệp hình ảnh hoặc PDF chứng từ từ thiết bị', 'warning');
      return;
    }

    const chosenDist = distributions.find(
      (d) => Number(d.maDotPhanBo || d.id) === Number(uploadForm.madotphanbo)
    );
    const campaignIdForUpload =
      chosenDist?.maBaiTaiTro ||
      (selectedCampaignId !== 'ALL' ? Number(selectedCampaignId) : null);

    try {
      setSubmitting(true);
      await uploadEvidence({
        file: selectedFile,
        mabaitaitro: campaignIdForUpload,
        madotphanbo: uploadForm.madotphanbo ? Number(uploadForm.madotphanbo) : null,
        loaitailieu: uploadForm.loaitailieu,
        mota: uploadForm.mota.trim() || selectedFile.name,
      });

      // Nếu cán bộ tích chọn "Xác nhận đã trao (DATRAO)" cho đợt đang DADUYET
      if (
        uploadForm.markDisbursed &&
        chosenDist &&
        String(chosenDist.trangThai || '').toUpperCase() === 'DADUYET'
      ) {
        await disburseDistribution(chosenDist.maDotPhanBo || chosenDist.id);
        addToast('Upload chứng từ và xác nhận giải ngân (DATRAO) thành công!', 'success');
      } else {
        addToast('Upload tệp chứng từ minh chứng thành công!', 'success');
      }

      setUploadModalOpen(false);
      fetchData();
      window.dispatchEvent(new CustomEvent('sidebar:refresh-badges'));
    } catch (err) {
      console.error('Lỗi upload chứng từ:', err);
      addToast(err?.response?.data?.message || err?.message || 'Không thể tải lên chứng từ', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Mở modal xem toàn bộ hóa đơn & minh chứng từ bảng MINHCHUNG theo mã đợt phân bổ
  const handleViewEvidences = async (row) => {
    const distId = row.maDotPhanBo || row.id;
    setViewingDistribution(row);
    setViewingEvidences(evidencesByDist[distId] || []);
    setViewModalOpen(true);

    try {
      setViewLoading(true);
      const res = await getAllEvidences({ madotphanbo: distId });
      setViewingEvidences(res?.data || []);
    } catch (err) {
      addToast(err?.message || 'Không thể tải danh sách minh chứng của đợt phân bổ', 'error');
    } finally {
      setViewLoading(false);
    }
  };

  const handleOpenLightbox = (imgUrl) => {
    const imgs = viewingEvidences
      .filter((ev) => ev.duongDanTep && !ev.duongDanTep.toLowerCase().endsWith('.pdf'))
      .map((ev) => ({
        src: ev.duongDanTep,
        alt: ev.moTa || 'Minh chứng giải ngân',
      }));
    const idx = imgs.findIndex((i) => i.src === imgUrl);
    setLightboxImages(imgs.length ? imgs : [{ src: imgUrl, alt: 'Minh chứng' }]);
    setLightboxIndex(idx >= 0 ? idx : 0);
    setLightboxOpen(true);
  };

  const handleMarkDisbursed = async (row) => {
    const distId = row.maDotPhanBo || row.id;
    try {
      await disburseDistribution(distId);
      addToast(`Đã xác nhận giải ngân thành công đợt #PB${distId} (DATRAO)!`, 'success');
      fetchData();
    } catch (err) {
      addToast(err?.response?.data?.message || err?.message || 'Không thể cập nhật trạng thái giải ngân', 'error');
    }
  };

  const getStatusBadge = (status) => {
    const s = String(status || '').toUpperCase();
    if (s === 'DATRAO') {
      return (
        <span className="status-badge badge--approved" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <FiCheckCircle /> Đã giải ngân
        </span>
      );
    }
    if (s === 'DADUYET') {
      return (
        <span className="status-badge badge--primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#e7f5ff', color: '#1971c2' }}>
          <FiCheckCircle /> Đã duyệt (Chờ trao)
        </span>
      );
    }
    return (
      <span className="status-badge badge--pending" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        <FiClock /> Chờ Hiệu trưởng duyệt
      </span>
    );
  };

  const columns = [
    {
      key: 'maDotPhanBo',
      title: 'Mã đợt',
      width: '85px',
      render: (val, row) => `#PB${val || row.id}`,
    },
    {
      key: 'tenDot',
      title: 'Đợt phân bổ / Mục đích chi',
      render: (val, row) => (
        <div>
          <div className="font-semibold text-primary">{val || row.tendot}</div>
          <div className="text-muted text-sm">
            {row.tieuDeBaiTaiTro ? `Chiến dịch: ${row.tieuDeBaiTaiTro}` : ''}
            {row.tenCanBo ? ` • Lập bởi: ${row.tenCanBo}` : ''}
          </div>
        </div>
      ),
    },
    {
      key: 'tongTien',
      title: 'Số tiền phân bổ',
      width: '150px',
      align: 'right',
      render: (val, row) => (
        <span className="font-bold text-danger">-{formatCurrency(val ?? row.tongtien ?? 0)}</span>
      ),
    },
    {
      key: 'ngayTrao',
      title: 'Ngày trao',
      width: '120px',
      render: (val, row) => (val || row.ngaytrao ? formatDate(val || row.ngaytrao) : '—'),
    },
    {
      key: 'trangThai',
      title: 'Trạng thái',
      width: '155px',
      render: (val, row) => getStatusBadge(val || row.trangthai),
    },
    {
      key: 'evidences',
      title: 'Hóa đơn / Minh chứng',
      width: '210px',
      render: (_, row) => {
        const distId = row.maDotPhanBo || row.id;
        const count = (evidencesByDist[distId] || []).length;
        const isApproved = String(row.trangThai || '').toUpperCase() === 'DADUYET';
        return (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleViewEvidences(row)}
            >
              <FiEye /> Xem minh chứng ({count})
            </Button>
            {isApproved && (
              <Button
                size="sm"
                variant="primary"
                onClick={() => handleMarkDisbursed(row)}
                title="Xác nhận đã trao quà/tiền (DADUYET → DATRAO)"
              >
                <FiCheckCircle /> Đã trao
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const selectedUploadDist = distributions.find(
    (d) => Number(d.maDotPhanBo || d.id) === Number(uploadForm.madotphanbo)
  );
  const canMarkDisbursed =
    selectedUploadDist && String(selectedUploadDist.trangThai || '').toUpperCase() === 'DADUYET';

  if (loading) return <Loading text="Đang tải dữ liệu tiến độ giải ngân..." />;

  return (
    <div className="disbursement-progress-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tiến Độ Giải Ngân & Minh Chứng Hóa Đơn</h1>
          <p className="page-subtitle">
            Theo dõi các đợt phân bổ kinh phí, upload tệp hóa đơn/chứng từ từ máy và đối chiếu minh chứng theo từng đợt phân bổ.
          </p>
        </div>

        <div className="campaign-select-wrap">
          <label className="select-label">Lọc theo chiến dịch:</label>
          <select
            className="input-field select-campaign"
            value={selectedCampaignId}
            onChange={(e) => setSelectedCampaignId(e.target.value)}
          >
            <option value="ALL">Tất cả chiến dịch</option>
            {campaigns.map((c) => (
              <option key={c.maBaiTaiTro || c.id} value={c.maBaiTaiTro || c.id}>
                {c.tieuDe || c.tieude}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Thẻ chỉ số giải ngân */}
      <div className="disbursement-stats-grid">
        <Card className="stat-box">
          <span className="stat-title">Tổng tiền quỹ đã tiếp nhận</span>
          <span className="stat-amount text-primary">{formatCurrency(totalFund)}</span>
          <span className="stat-sub">Từ các nhà hảo tâm đã xác nhận nhận tiền</span>
        </Card>

        <Card className="stat-box">
          <span className="stat-title">Đã giải ngân thực tế (DATRAO)</span>
          <span className="stat-amount text-danger">{formatCurrency(totalDisbursed)}</span>
          <span className="stat-sub">Tỉ lệ giải ngân: {disbursedPercent.toFixed(1)}%</span>
        </Card>

        <Card className="stat-box">
          <span className="stat-title">Số dư quỹ còn lại</span>
          <span className="stat-amount text-success">{formatCurrency(remainingFund)}</span>
          <span className="stat-sub">Sẵn sàng cho các đợt phân bổ tiếp theo</span>
        </Card>
      </div>

      <Card className="progress-overview-card">
        <div className="progress-header">
          <span className="font-semibold text-text">Tiến độ chi tiêu ngân sách gây quỹ</span>
          <span className="font-bold text-primary">{disbursedPercent.toFixed(1)}%</span>
        </div>
        <ProgressBar percent={disbursedPercent} showLabel={false} height={12} />
      </Card>

      {/* Bảng nhật ký các đợt giải ngân / phân bổ */}
      <Card
        title={
          <div className="card-title-flex">
            <span>Nhật ký các đợt phân bổ & giải ngân ({filteredDistributions.length})</span>
            <Button variant="primary" size="sm" onClick={() => handleOpenUploadModal()}>
              <FiPlus /> Upload hóa đơn / chứng từ giải ngân
            </Button>
          </div>
        }
        padding={false}
      >
        <Table
          columns={columns}
          data={filteredDistributions}
          rowKey="maDotPhanBo"
          emptyTitle="Chưa có đợt phân bổ giải ngân nào"
          emptyDescription="Chiến dịch này chưa có đợt phân bổ nào được tạo."
        />
      </Card>

      {/* Modal Upload chứng từ (CHỌN FILE TỪ THIẾT BỊ) */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload chứng từ & hóa đơn giải ngân"
        size="md"
        footer={
          <div className="modal-buttons">
            <Button variant="outline" onClick={() => setUploadModalOpen(false)}>
              Đóng
            </Button>
            <Button
              variant="primary"
              onClick={handleUploadSubmit}
              loading={submitting}
              disabled={!selectedFile}
            >
              <FiUpload /> Tải lên chứng từ
            </Button>
          </div>
        }
      >
        <form onSubmit={handleUploadSubmit} className="disburse-form">
          <div className="input-wrap">
            <label className="input-label">Chọn đợt phân bổ liên quan</label>
            <select
              className="input-field"
              value={uploadForm.madotphanbo}
              onChange={(e) => setUploadForm((p) => ({ ...p, madotphanbo: e.target.value, markDisbursed: false }))}
            >
              <option value="">-- Gắn vào chiến dịch chung (không chọn đợt cụ thể) --</option>
              {distributions.map((d) => (
                <option key={d.maDotPhanBo || d.id} value={d.maDotPhanBo || d.id}>
                  #PB{d.maDotPhanBo || d.id} - {d.tenDot || d.tendot} ({formatCurrency(d.tongTien || 0)})
                </option>
              ))}
            </select>
          </div>

          <div className="input-wrap">
            <label className="input-label">Loại tài liệu minh chứng</label>
            <select
              className="input-field"
              value={uploadForm.loaitailieu}
              onChange={(e) => setUploadForm((p) => ({ ...p, loaitailieu: e.target.value }))}
            >
              {EVIDENCE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Chọn file từ thiết bị */}
          <div className="input-wrap">
            <label className="input-label">
              Chọn tệp hóa đơn / ảnh trao quà / biên bản (JPG, PNG, PDF) <span className="input-required">*</span>
            </label>
            <div
              style={{
                border: '2px dashed #cbd5e1',
                borderRadius: '8px',
                padding: '1.25rem',
                textAlign: 'center',
                backgroundColor: '#f8fafc',
              }}
            >
              <label
                className="btn btn--outline btn--sm"
                style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <FiUpload /> {selectedFile ? 'Đổi tệp khác' : 'Chọn tệp từ máy tính'}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,application/pdf"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
              </label>

              {selectedFile ? (
                <div style={{ marginTop: '0.75rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--primary)' }}>
                    {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </div>
                  {filePreview ? (
                    <img
                      src={filePreview}
                      alt="Xem trước chứng từ"
                      style={{
                        maxHeight: '160px',
                        maxWidth: '100%',
                        marginTop: '0.5rem',
                        borderRadius: '6px',
                        border: '1px solid #ddd',
                      }}
                    />
                  ) : (
                    <div style={{ marginTop: '0.5rem', color: '#495057', fontSize: '0.85rem' }}>
                      <FiFileText style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                      Tệp tài liệu PDF sẵn sàng tải lên
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: '#64748b' }}>
                  Hỗ trợ ảnh chụp hóa đơn (JPG, PNG, WEBP) hoặc chứng từ PDF (tối đa 20MB)
                </div>
              )}
            </div>
          </div>

          <Input
            type="textarea"
            rows={3}
            label="Mô tả chứng từ"
            value={uploadForm.mota}
            onChange={(e) => setUploadForm((p) => ({ ...p, mota: e.target.value }))}
            placeholder="Ví dụ: Hóa đơn VAT mua thiết bị, Biên bản ký nhận học bổng đợt 1..."
          />

          {canMarkDisbursed && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', background: '#ebfbee', padding: '0.65rem 0.85rem', borderRadius: '6px', color: '#2b8a3e' }}>
              <input
                type="checkbox"
                checked={uploadForm.markDisbursed}
                onChange={(e) => setUploadForm((p) => ({ ...p, markDisbursed: e.target.checked }))}
              />
              <span>
                Đồng thời xác nhận đợt <strong>#PB{uploadForm.madotphanbo}</strong> đã giải ngân xong (chuyển sang <strong>DATRAO</strong>)
              </span>
            </label>
          )}
        </form>
      </Modal>

      {/* Modal Xem hóa đơn & tài liệu minh chứng từ bảng MINHCHUNG theo mã đợt phân bổ */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title={`Minh chứng giải ngân — Đợt #PB${viewingDistribution?.maDotPhanBo || viewingDistribution?.id || ''}`}
        size="lg"
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '0.5rem' }}>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                const distId = viewingDistribution?.maDotPhanBo || viewingDistribution?.id;
                setViewModalOpen(false);
                handleOpenUploadModal(distId);
              }}
            >
              <FiPlus /> Tải thêm chứng từ cho đợt này
            </Button>
            <Button variant="outline" size="sm" onClick={() => setViewModalOpen(false)}>
              <FiX /> Đóng cửa sổ
            </Button>
          </div>
        }
      >
        {viewingDistribution && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: '#f8f9fa', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #e9ecef' }}>
              <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '4px' }}>
                {viewingDistribution.tenDot || viewingDistribution.tendot}
              </div>
              <div style={{ fontSize: '0.88rem', color: '#555', display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                <span>Số tiền: <strong>{formatCurrency(viewingDistribution.tongTien ?? viewingDistribution.tongtien ?? 0)}</strong></span>
                <span>Ngày trao: <strong>{viewingDistribution.ngayTrao ? formatDate(viewingDistribution.ngayTrao) : '—'}</strong></span>
                <span>Trạng thái: <strong>{String(viewingDistribution.trangThai || '').toUpperCase()}</strong></span>
              </div>
            </div>

            {viewLoading ? (
              <Loading text="Đang tải danh sách minh chứng từ máy chủ..." />
            ) : viewingEvidences.length === 0 ? (
              <EmptyState
                icon={<FiImage size={40} />}
                title="Chưa có chứng từ minh chứng nào"
                description={`Đợt phân bổ #PB${viewingDistribution.maDotPhanBo || viewingDistribution.id} chưa có hóa đơn hoặc hình ảnh nào trong bảng MINHCHUNG.`}
              />
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: '1rem',
                }}
              >
                {viewingEvidences.map((evi, idx) => {
                  const isPdf = evi.duongDanTep?.toLowerCase().endsWith('.pdf');
                  return (
                    <div
                      key={evi.maMinhChung || idx}
                      style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        background: '#fff',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <div
                        style={{
                          height: '150px',
                          background: '#f8fafc',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          overflow: 'hidden',
                        }}
                        onClick={() => {
                          if (isPdf) {
                            window.open(evi.duongDanTep, '_blank', 'noopener,noreferrer');
                          } else {
                            handleOpenLightbox(evi.duongDanTep);
                          }
                        }}
                      >
                        {isPdf ? (
                          <div style={{ textAlign: 'center', color: 'var(--primary)', padding: '1rem' }}>
                            <FiFileText size={38} />
                            <div style={{ fontSize: '0.8rem', fontWeight: 600, marginTop: '6px' }}>
                              Tài liệu PDF
                            </div>
                          </div>
                        ) : (
                          <img
                            src={evi.duongDanTep || '/images/minhchungmau.jpg'}
                            alt={evi.moTa || 'Minh chứng'}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = '/images/minhchungmau.jpg';
                            }}
                          />
                        )}
                      </div>

                      <div style={{ padding: '0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="badge badge--primary" style={{ fontSize: '0.7rem' }}>
                            {evi.loaiTaiLieu || 'HINHANH'}
                          </span>
                          {evi.ngayTaiLen && (
                            <span style={{ fontSize: '0.72rem', color: '#888' }}>
                              {formatDate(evi.ngayTaiLen)}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>
                          {evi.moTa || 'Tài liệu minh chứng'}
                        </div>
                        {evi.nguoiDang && (
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            Đăng bởi: {evi.nguoiDang}
                          </div>
                        )}
                        <div style={{ marginTop: 'auto', paddingTop: '6px' }}>
                          {isPdf ? (
                            <Button
                              size="sm"
                              variant="outline"
                              fullWidth
                              onClick={() => window.open(evi.duongDanTep, '_blank', 'noopener,noreferrer')}
                            >
                              <FiExternalLink /> Mở PDF
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              fullWidth
                              onClick={() => handleOpenLightbox(evi.duongDanTep)}
                            >
                              <FiEye /> Phóng to ảnh
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Lightbox phóng to ảnh (có nút X và phím Esc để thoát) */}
      {lightboxOpen && lightboxImages.length > 0 && (
        <Lightbox
          images={lightboxImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
};

export default DisbursementProgress;
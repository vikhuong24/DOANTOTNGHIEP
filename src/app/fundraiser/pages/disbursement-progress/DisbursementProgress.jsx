// Trang Cập nhật tiến độ giải ngân & Upload minh chứng (Fundraiser)
import { useState, useEffect } from 'react';
import { getCampaigns } from '../../../../services/campaignService';
import { updateDisbursement } from '../../../../services/donationService';
import { createEvidence } from '../../../../services/evidenceService';
import Card from '../../../../components/Card/Card';
import Table from '../../../../components/Table/Table';
import Button from '../../../../components/Button/Button';
import Input from '../../../../components/Input/Input';
import ProgressBar from '../../../../components/ProgressBar/ProgressBar';
import Loading from '../../../../components/Loading/Loading';
import Modal from '../../../../components/Modal/Modal';
import { useNotification } from '../../../../components/Notification/Notification';
import { formatCurrency, formatDate } from '../../../../utils/formatters';
import { FiDollarSign, FiUpload, FiPlus, FiCheckCircle, FiFileText, FiImage } from 'react-icons/fi';
import './DisbursementProgress.css';

const DisbursementProgress = () => {
  const { addToast } = useNotification();

  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState('');

  // Danh sách các đợt giải ngân mẫu
  const [disbursements, setDisbursements] = useState([
    {
      id: 1,
      tieuDe: 'Chi trao học bổng Đợt 1 cho 20 em học sinh khiếm thị',
      soTien: 40000000,
      hangMuc: 'Học bổng vượt khó',
      ngayChi: '2026-10-10',
      minhChungUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=400',
      nguoiThucHien: 'Lê Minh Cường (CBQL)',
    },
    {
      id: 2,
      tieuDe: 'Thanh toán hợp đồng mua 10 máy trợ thính kỹ thuật số',
      soTien: 35000000,
      hangMuc: 'Cơ sở vật chất & Thiết bị',
      ngayChi: '2026-10-12',
      minhChungUrl: 'https://images.unsplash.com/photo-1584697964190-71c8901eb234?w=400',
      nguoiThucHien: 'Lê Minh Cường (CBQL)',
    },
  ]);

  // Modal giải ngân mới
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    tieuDe: '',
    soTien: 10000000,
    hangMuc: 'Học bổng',
    ngayChi: new Date().toISOString().split('T')[0],
    minhChungUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600',
    ghiChu: '',
  });

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const res = await getCampaigns();
        const list = res?.data || res || [];
        setCampaigns(list);
        if (list.length > 0) {
          setSelectedCampaignId(list[0].maBaiTaiTro || list[0].id);
        }
      } catch (err) {
        console.error('Lỗi tải chiến dịch:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  const currentCampaign = campaigns.find(
    (c) => (c.maBaiTaiTro || c.id) === Number(selectedCampaignId)
  );

  const totalFund = currentCampaign?.currentAmount || 150000000;
  const totalDisbursed = disbursements.reduce((sum, d) => sum + Number(d.soTien || 0), 0);
  const remainingFund = Math.max(0, totalFund - totalDisbursed);
  const disbursedPercent = totalFund > 0 ? (totalDisbursed / totalFund) * 100 : 0;

  const handleOpenModal = () => {
    setForm({
      tieuDe: '',
      soTien: 10000000,
      hangMuc: 'Học bổng',
      ngayChi: new Date().toISOString().split('T')[0],
      minhChungUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600',
      ghiChu: '',
    });
    setModalOpen(true);
  };

  const handleSaveDisbursement = async (e) => {
    e.preventDefault();
    if (!form.tieuDe.trim()) {
      addToast('Vui lòng nhập tên đợt giải ngân / mục đích chi tiêu', 'warning');
      return;
    }
    if (form.soTien <= 0) {
      addToast('Số tiền giải ngân phải lớn hơn 0', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const newDisbursement = {
        id: disbursements.length + 1,
        ...form,
        soTien: Number(form.soTien),
        maBaiTaiTro: Number(selectedCampaignId),
        nguoiThucHien: 'Lê Minh Cường (CBQL)',
      };

      await updateDisbursement(newDisbursement);

      // Tự động tạo bản ghi minh chứng
      if (form.minhChungUrl) {
        await createEvidence({
          maDotPhanBo: newDisbursement.id,
          duongDan: form.minhChungUrl,
          loai: form.hangMuc === 'Học bổng' ? 'HocBong' : 'DoDung',
          mota: form.tieuDe,
          ngayTao: new Date().toISOString(),
        });
      }

      setDisbursements([newDisbursement, ...disbursements]);
      addToast('Ghi nhận đợt giải ngân và lưu minh chứng thành công!', 'success');
      setModalOpen(false);
    } catch (err) {
      addToast(err.message || 'Lỗi khi cập nhật giải ngân', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'id',
      title: 'Mã GN',
      width: '80px',
      render: (val) => `#GN${val}`,
    },
    {
      key: 'tieuDe',
      title: 'Hạng mục giải ngân / Mục đích chi',
      render: (val, row) => (
        <div>
          <div className="font-semibold text-primary">{val}</div>
          <div className="text-muted text-sm">
            Danh mục: <strong>{row.hangMuc}</strong> • Thực hiện bởi: {row.nguoiThucHien}
          </div>
        </div>
      ),
    },
    {
      key: 'soTien',
      title: 'Số tiền chi trả',
      width: '160px',
      align: 'right',
      render: (val) => (
        <span className="font-bold text-danger">-{formatCurrency(val)}</span>
      ),
    },
    {
      key: 'ngayChi',
      title: 'Ngày thực hiện',
      width: '130px',
      render: (val) => formatDate(val),
    },
    {
      key: 'minhChungUrl',
      title: 'Chứng từ đính kèm',
      width: '140px',
      render: (val) =>
        val ? (
          <a
            href={val}
            target="_blank"
            rel="noreferrer"
            className="link-evidence-preview"
          >
            <FiImage /> Xem hóa đơn
          </a>
        ) : (
          <span className="text-muted text-sm">Chưa có</span>
        ),
    },
  ];

  if (loading) return <Loading text="Đang tải dữ liệu tiến độ giải ngân..." />;

  return (
    <div className="disbursement-progress-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tiến Độ Giải Ngân & Minh Chứng Hóa Đơn</h1>
          <p className="page-subtitle">
            Hạch toán minh bạch các khoản chi cho học sinh, đính kèm hóa đơn chứng từ phục vụ kiểm toán
          </p>
        </div>

        <div className="campaign-select-wrap">
          <label className="select-label">Chọn chiến dịch:</label>
          <select
            className="input-field select-campaign"
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
      </div>

      {/* Thẻ chỉ số giải ngân */}
      <div className="disbursement-stats-grid">
        <Card className="stat-box">
          <span className="stat-title">Tổng tiền quỹ đã tiếp nhận</span>
          <span className="stat-amount text-primary">{formatCurrency(totalFund)}</span>
          <span className="stat-sub">Từ các nhà hảo tâm đã chuyển khoản</span>
        </Card>

        <Card className="stat-box">
          <span className="stat-title">Đã giải ngân thực tế</span>
          <span className="stat-amount text-danger">{formatCurrency(totalDisbursed)}</span>
          <span className="stat-sub">Tỉ lệ giải ngân: {disbursedPercent.toFixed(1)}%</span>
        </Card>

        <Card className="stat-box">
          <span className="stat-title">Số dư quỹ còn lại</span>
          <span className="stat-amount text-success">{formatCurrency(remainingFund)}</span>
          <span className="stat-sub">Sẵn sàng cho các đợt tiếp theo</span>
        </Card>
      </div>

      <Card className="progress-overview-card">
        <div className="progress-header">
          <span className="font-semibold text-text">Tiến độ chi tiêu ngân sách gây quỹ</span>
          <span className="font-bold text-primary">{disbursedPercent.toFixed(1)}%</span>
        </div>
        <ProgressBar percent={disbursedPercent} showLabel={false} height={12} />
      </Card>

      {/* Bảng nhật ký giải ngân */}
      <Card
        title={
          <div className="card-title-flex">
            <span>Nhật ký các đợt giải ngân</span>
            <Button variant="primary" size="sm" onClick={handleOpenModal}>
              <FiPlus /> Tạo đợt giải ngân & Upload hóa đơn
            </Button>
          </div>
        }
        padding={false}
      >
        <Table
          columns={columns}
          data={disbursements}
          rowKey="id"
          emptyTitle="Chưa có khoản giải ngân nào"
          emptyDescription="Chiến dịch này chưa thực hiện giải ngân chi phí nào."
        />
      </Card>

      {/* Modal Lập đợt giải ngân */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Ghi nhận đợt giải ngân & Đính kèm chứng từ"
        size="md"
        footer={
          <div className="modal-buttons">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Hủy bỏ
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveDisbursement}
              loading={submitting}
            >
              <FiCheckCircle /> Xác nhận lưu khoản chi
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveDisbursement} className="disburse-form">
          <Input
            label="Mục đích chi tiêu / Hạng mục giải ngân"
            value={form.tieuDe}
            onChange={(e) => setForm((p) => ({ ...p, tieuDe: e.target.value }))}
            placeholder="Ví dụ: Trao học bổng đợt 2 cho học sinh..."
            required
          />

          <div className="input-wrap">
            <label className="input-label">Hạng mục ngân sách</label>
            <select
              className="input-field"
              value={form.hangMuc}
              onChange={(e) => setForm((p) => ({ ...p, hangMuc: e.target.value }))}
            >
              <option value="Học bổng">Học bổng học sinh</option>
              <option value="Đồ dùng học tập">Mua sắm sách vở & đồ dùng</option>
              <option value="Cơ sở vật chất">Cơ sở vật chất & Thiết bị trợ thính</option>
              <option value="Y tế & Phục hồi">Y tế, phục hồi chức năng & dinh dưỡng</option>
            </select>
          </div>

          <div className="two-cols">
            <Input
              type="number"
              label="Số tiền giải ngân (VNĐ)"
              value={form.soTien}
              onChange={(e) => setForm((p) => ({ ...p, soTien: e.target.value }))}
              required
            />
            <Input
              type="date"
              label="Ngày thực hiện chi"
              value={form.ngayChi}
              onChange={(e) => setForm((p) => ({ ...p, ngayChi: e.target.value }))}
              required
            />
          </div>

          <Input
            label="URL Hình ảnh hóa đơn / Phiếu chi / Biên bản bàn giao"
            value={form.minhChungUrl}
            onChange={(e) => setForm((p) => ({ ...p, minhChungUrl: e.target.value }))}
            placeholder="https://..."
            helpText="Đính kèm link hình ảnh phiếu chi hoặc hóa đơn mua thiết bị"
          />

          <Input
            type="textarea"
            rows={3}
            label="Ghi chú thêm"
            value={form.ghiChu}
            onChange={(e) => setForm((p) => ({ ...p, ghiChu: e.target.value }))}
            placeholder="Ghi chú người nhận, số hóa đơn VAT..."
          />
        </form>
      </Modal>
    </div>
  );
};

export default DisbursementProgress;

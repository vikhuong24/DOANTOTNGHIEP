// Trang Duyệt & Quản lý đơn đăng ký tài trợ (Fundraiser) theo ERD mới
// BẢNG TAITRO: maTaiTro, maNguoiDung, maBaiTaiTro, tenHienThi, soTienDK, soTienTT, anhGiaoDich, trangthai, maCanBo, ghichu, ngaygui, ngaynhan
import { useState, useEffect } from 'react';
import { getAllDonations, approveDonation, rejectDonation } from '../../../../services/donationService';
import { getAllCampaigns } from '../../../../services/campaignService';
import Card from '../../../../components/Card/Card';
import Table from '../../../../components/Table/Table';
import Button from '../../../../components/Button/Button';
import Modal from '../../../../components/Modal/Modal';
import Input from '../../../../components/Input/Input';
import Tabs from '../../../../components/Tabs/Tabs';
import Loading from '../../../../components/Loading/Loading';
import { useNotification } from '../../../../components/Notification/Notification';
import { formatDate, formatCurrency } from '../../../../utils/formatters';
import { DONATION_STATUS_LABELS } from '../../../../utils/constants';
import { FiCheck, FiX, FiEye, FiClock, FiCheckCircle, FiFileText, FiImage } from 'react-icons/fi';
import './SponsorApproval.css';

const TABS = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'ChoDuyet', label: 'Chờ duyệt' },
  { value: 'DaDuyet', label: 'Đã duyệt' },
  { value: 'DaNhan', label: 'Đã tiếp nhận' },
  { value: 'TuChoi', label: 'Từ chối' },
];

const SponsorApproval = () => {
  const { addToast } = useNotification();
  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');

  // Detail Modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);

  // Reject Modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchList = async () => {
    try {
      setLoading(true);
      const [donRes, campRes] = await Promise.all([
        getAllDonations(),
        getAllCampaigns(),
      ]);
      setDonations(donRes?.data || donRes || []);
      setCampaigns(campRes?.data || campRes || []);
    } catch (err) {
      console.error('Lỗi tải danh sách tài trợ:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const getCampaignTitle = (cId) => {
    const c = campaigns.find((camp) => camp.maBaiTaiTro === cId);
    return c?.tieude || `Chiến dịch #${cId}`;
  };

  const filteredDonations = donations.filter((d) => {
    if (activeTab === 'ALL') return true;
    return d.trangthai === activeTab || d.status === activeTab;
  });

  const handleOpenDetail = (row) => {
    setSelectedDonation(row);
    setDetailModalOpen(true);
  };

  const handleApprove = async (row) => {
    const id = row.maTaiTro || row.id;
    try {
      setSubmittingAction(true);
      await approveDonation(id);
      addToast(`Đã duyệt đơn đăng ký tài trợ #${id}`, 'success');
      setDetailModalOpen(false);
      fetchList();
    } catch (err) {
      addToast(err.message || 'Lỗi khi duyệt tài trợ', 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleOpenReject = (row) => {
    setSelectedDonation(row);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectReason.trim()) {
      addToast('Vui lòng nhập lý do từ chối đơn', 'warning');
      return;
    }

    const id = selectedDonation.maTaiTro || selectedDonation.id;
    try {
      setSubmittingAction(true);
      await rejectDonation(id, rejectReason);
      addToast(`Đã từ chối đơn đăng ký tài trợ #${id}`, 'info');
      setRejectModalOpen(false);
      setDetailModalOpen(false);
      fetchList();
    } catch (err) {
      addToast(err.message || 'Lỗi khi từ chối đơn', 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'ChoDuyet':
        return <span className="sponsor-badge badge--pending"><FiClock /> Chờ duyệt</span>;
      case 'DaDuyet':
        return <span className="sponsor-badge badge--approved"><FiCheckCircle /> Đã duyệt</span>;
      case 'DaNhan':
        return <span className="sponsor-badge badge--received"><FiCheck /> Đã nhận</span>;
      case 'TuChoi':
        return <span className="sponsor-badge badge--rejected"><FiX /> Từ chối</span>;
      default:
        return <span className="sponsor-badge">{DONATION_STATUS_LABELS[st] || st}</span>;
    }
  };

  const columns = [
    {
      key: 'maTaiTro',
      title: 'Mã đơn',
      width: '80px',
      render: (val, row) => `#TT${val || row.id}`,
    },
    {
      key: 'tenHienThi',
      title: 'Nhà hảo tâm',
      render: (val, row) => (
        <div>
          <div className="font-semibold text-primary">{val || 'Ẩn danh'}</div>
          <div className="text-muted text-sm">
            {row.ghichu || row.ghiChu ? `"${row.ghichu || row.ghiChu}"` : 'Đăng ký đóng góp thiện nguyện'}
          </div>
        </div>
      ),
    },
    {
      key: 'maBaiTaiTro',
      title: 'Chiến dịch tiếp nhận',
      render: (val) => (
        <span className="font-medium text-text">
          {getCampaignTitle(val)}
        </span>
      ),
    },
    {
      key: 'soTienDK',
      title: 'Số tiền ĐK',
      width: '150px',
      align: 'right',
      render: (val, row) => (
        <span className="font-semibold text-text">
          {formatCurrency(val || row.amount || 0)}
        </span>
      ),
    },
    {
      key: 'soTienTT',
      title: 'Số tiền thực tế',
      width: '150px',
      align: 'right',
      render: (val) => (
        <span className="font-bold text-success">
          {val !== null && val !== undefined ? formatCurrency(val) : '—'}
        </span>
      ),
    },
    {
      key: 'ngaygui',
      title: 'Ngày gửi đơn',
      width: '120px',
      render: (val, row) => formatDate(val || row.ngayGui || new Date().toISOString()),
    },
    {
      key: 'trangthai',
      title: 'Trạng thái',
      width: '130px',
      render: (val, row) => getStatusBadge(val || row.status),
    },
    {
      key: 'actions',
      title: 'Thao tác',
      width: '170px',
      render: (_, row) => {
        const st = row.trangthai || row.status;
        const isPending = st === 'ChoDuyet';
        return (
          <div className="table-actions">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleOpenDetail(row)}
              title="Xem thông tin chi tiết"
            >
              <FiEye /> Xem
            </Button>
            {isPending && (
              <>
                <button
                  type="button"
                  className="btn-quick-approve"
                  onClick={() => handleApprove(row)}
                  title="Duyệt đơn"
                  disabled={submittingAction}
                >
                  <FiCheck />
                </button>
                <button
                  type="button"
                  className="btn-quick-reject"
                  onClick={() => handleOpenReject(row)}
                  title="Từ chối đơn"
                  disabled={submittingAction}
                >
                  <FiX />
                </button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="sponsor-approval-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Phê Duyệt Đơn Đăng Ký Tài Trợ</h1>
          <p className="page-subtitle">
            Xét duyệt các yêu cầu đăng ký tài trợ kinh phí từ nhà hảo tâm
          </p>
        </div>
      </div>

      <div className="tabs-container">
        <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />
      </div>

      <Card padding={false}>
        {loading ? (
          <Loading rows={5} type="skeleton" />
        ) : (
          <Table
            columns={columns}
            data={filteredDonations}
            rowKey="maTaiTro"
            emptyTitle="Không có đơn đăng ký nào"
            emptyDescription="Chưa có bản ghi tài trợ nào khớp với bộ lọc."
          />
        )}
      </Card>

      {/* Modal Chi tiết đơn */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={`Chi tiết đơn tài trợ #${selectedDonation?.maTaiTro || selectedDonation?.id}`}
        size="md"
        footer={
          <div className="modal-buttons">
            {selectedDonation?.trangthai === 'ChoDuyet' && (
              <>
                <Button
                  variant="danger"
                  onClick={() => handleOpenReject(selectedDonation)}
                  disabled={submittingAction}
                >
                  <FiX /> Từ chối đơn
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleApprove(selectedDonation)}
                  loading={submittingAction}
                >
                  <FiCheck /> Phê duyệt đơn
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => setDetailModalOpen(false)}>
              Đóng
            </Button>
          </div>
        }
      >
        {selectedDonation && (
          <div className="sponsor-detail-body">
            <div className="detail-row">
              <span className="detail-label">Tên người ủng hộ:</span>
              <span className="detail-value font-bold">{selectedDonation.tenHienThi}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Chiến dịch tiếp nhận:</span>
              <span className="detail-value font-semibold">
                {getCampaignTitle(selectedDonation.maBaiTaiTro)}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Số tiền đăng ký tài trợ:</span>
              <span className="detail-value font-bold text-success text-lg">
                {formatCurrency(selectedDonation.soTienDK || selectedDonation.amount || 0)}
              </span>
            </div>
            {selectedDonation.soTienTT !== null && selectedDonation.soTienTT !== undefined && (
              <div className="detail-row">
                <span className="detail-label">Số tiền thực tế tiếp nhận:</span>
                <span className="detail-value font-bold text-primary">
                  {formatCurrency(selectedDonation.soTienTT)}
                </span>
              </div>
            )}
            <div className="detail-row">
              <span className="detail-label">Thời gian gửi đăng ký:</span>
              <span className="detail-value">{formatDate(selectedDonation.ngaygui || selectedDonation.ngayGui)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Trạng thái hiện tại:</span>
              <span className="detail-value">{getStatusBadge(selectedDonation.trangthai)}</span>
            </div>

            {/* Ảnh giao dịch đính kèm */}
            {selectedDonation.anhGiaoDich && (
              <div style={{ marginTop: '1rem', background: '#f9fbf9', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiImage /> Biên lai / Ủy nhiệm chi đính kèm:
                </div>
                <img
                  src={selectedDonation.anhGiaoDich}
                  alt="Biên lai giao dịch"
                  style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: '6px', objectFit: 'contain' }}
                />
              </div>
            )}

            {(selectedDonation.ghichu || selectedDonation.ghiChu) && (
              <div className="sponsor-note-box" style={{ marginTop: '1rem' }}>
                <div className="note-title">
                  <FiFileText /> Lời nhắn gửi từ nhà hảo tâm:
                </div>
                <p className="note-text">{selectedDonation.ghichu || selectedDonation.ghiChu}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal Từ chối */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Từ chối đơn đăng ký tài trợ"
        size="sm"
        footer={
          <div className="modal-buttons">
            <Button variant="outline" onClick={() => setRejectModalOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmReject}
              loading={submittingAction}
            >
              Xác nhận từ chối
            </Button>
          </div>
        }
      >
        <div className="reject-modal-body">
          <Input
            type="textarea"
            rows={4}
            label="Lý do từ chối đơn"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Ví dụ: Thông tin liên lạc không chính xác, chiến dịch đã hoàn thành chỉ tiêu..."
            required
          />
        </div>
      </Modal>
    </div>
  );
};

export default SponsorApproval;

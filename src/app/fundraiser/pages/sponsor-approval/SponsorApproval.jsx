// Trang Duyệt & Quản lý đơn đăng ký tài trợ (Fundraiser)
// Kết nối API Backend: GET /fundraiser/approvals/donations & PUT /fundraiser/approvals/donations/{id}
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getPendingDonations,
  getAllDonations,
  getApprovedDonationsQueue,
  approveDonation,
  rejectDonation,
} from '../../../../services/donationService';
import { getFundraiserCampaigns, getAllCampaigns } from '../../../../services/campaignService';
import Card from '../../../../components/Card/Card';
import Table from '../../../../components/Table/Table';
import Button from '../../../../components/Button/Button';
import Modal from '../../../../components/Modal/Modal';
import Input from '../../../../components/Input/Input';
import Tabs from '../../../../components/Tabs/Tabs';
import Loading from '../../../../components/Loading/Loading';
import { useNotification } from '../../../../components/Notification/Notification';
import { formatDate, formatCurrency } from '../../../../utils/formatters';
import { FiCheck, FiX, FiEye, FiClock, FiCheckCircle, FiFileText, FiImage, FiArrowRight } from 'react-icons/fi';
import './SponsorApproval.css';

const TABS = [
  { value: 'CHODUYET', label: 'Chờ duyệt' },
  { value: 'DADUYET', label: 'Đã duyệt (Chờ xác nhận tiền)' },
  { value: 'DANHAN', label: 'Đã tiếp nhận vào quỹ' },
  { value: 'TUCHOI', label: 'Đã từ chối' },
  { value: 'ALL', label: 'Tất cả' },
];

const SponsorApproval = () => {
  const navigate = useNavigate();
  const { addToast } = useNotification();
  const [loading, setLoading] = useState(true);
  const [pendingList, setPendingList] = useState([]);
  const [receivedList, setReceivedList] = useState([]);
  const [approvedQueue, setApprovedQueue] = useState([]);
  const [processedMap, setProcessedMap] = useState({});
  const [campaigns, setCampaigns] = useState([]);
  const [activeTab, setActiveTab] = useState('CHODUYET');

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
      const [pendingRes, statementsRes, campRes] = await Promise.all([
        getPendingDonations().catch(() => []),
        getAllDonations({ size: 100 }).catch(() => ({ data: [] })),
        getFundraiserCampaigns().catch(() => getAllCampaigns({ size: 100 }).then((r) => r.data || [])),
      ]);
      setPendingList(pendingRes || []);
      setReceivedList(statementsRes?.data || []);
      setApprovedQueue(getApprovedDonationsQueue());
      setCampaigns(Array.isArray(campRes) ? campRes : (campRes?.data || []));
    } catch (err) {
      console.error('Lỗi tải danh sách tài trợ:', err);
      addToast('Không thể tải danh sách đơn đăng ký tài trợ', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const getCampaignTitle = (row) => {
    if (row?.tieuDeBaiTaiTro) return row.tieuDeBaiTaiTro;
    const cId = row?.maBaiTaiTro;
    const c = campaigns.find((camp) => Number(camp.maBaiTaiTro) === Number(cId));
    return c?.tieuDe || c?.tieude || `Chiến dịch #${cId}`;
  };

  // Gộp danh sách theo mã tài trợ (ưu tiên trạng thái mới nhất)
  const allDonations = useMemo(() => {
    const map = new Map();
    receivedList.forEach((d) => map.set(Number(d.maTaiTro), d));
    approvedQueue.forEach((d) => map.set(Number(d.maTaiTro), d));
    pendingList.forEach((d) => map.set(Number(d.maTaiTro), d));
    Object.values(processedMap).forEach((d) => map.set(Number(d.maTaiTro), d));
    return Array.from(map.values());
  }, [pendingList, receivedList, approvedQueue, processedMap]);

  const filteredDonations = useMemo(() => {
    return allDonations.filter((d) => {
      const st = String(d.trangThai || d.trangthai || '').toUpperCase();
      if (activeTab === 'ALL') return true;
      return st === activeTab;
    });
  }, [allDonations, activeTab]);

  const handleOpenDetail = (row) => {
    setSelectedDonation(row);
    setDetailModalOpen(true);
  };

  const handleApprove = async (row) => {
    const id = row.maTaiTro || row.id;
    try {
      setSubmittingAction(true);
      const updated = await approveDonation(id);
      if (updated) {
        setProcessedMap((prev) => ({ ...prev, [id]: updated }));
      }
      addToast(
        `Đã duyệt đơn đăng ký #${id} (chuyển sang DADUYET). Vui lòng sang mục "Xác nhận tiếp nhận tiền" để đối soát số tiền thực nhận!`,
        'success'
      );
      setDetailModalOpen(false);
      fetchList();
      window.dispatchEvent(new CustomEvent('sidebar:refresh-badges'));
    } catch (err) {
      addToast(err?.response?.data?.message || err.message || 'Lỗi khi duyệt tài trợ', 'error');
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
      const updated = await rejectDonation(id, rejectReason);
      if (updated) {
        setProcessedMap((prev) => ({ ...prev, [id]: updated }));
      }
      addToast(`Đã từ chối đơn đăng ký tài trợ #${id}`, 'info');
      setRejectModalOpen(false);
      setDetailModalOpen(false);
      fetchList();
      window.dispatchEvent(new CustomEvent('sidebar:refresh-badges'));
      window.dispatchEvent(new CustomEvent('sidebar:refresh-badges'));
    } catch (err) {
      addToast(err?.response?.data?.message || err.message || 'Lỗi khi từ chối đơn', 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  const getStatusBadge = (st) => {
    const s = String(st || '').toUpperCase();
    switch (s) {
      case 'CHODUYET':
        return <span className="sponsor-badge badge--pending"><FiClock /> Chờ duyệt</span>;
      case 'DADUYET':
        return <span className="sponsor-badge badge--approved"><FiCheckCircle /> Đã duyệt</span>;
      case 'DANHAN':
      case 'HOANTHANH':
        return <span className="sponsor-badge badge--received"><FiCheck /> Đã tiếp nhận</span>;
      case 'TUCHOI':
        return <span className="sponsor-badge badge--rejected"><FiX /> Từ chối</span>;
      default:
        return <span className="sponsor-badge">{s}</span>;
    }
  };

  const columns = [
    {
      key: 'maTaiTro',
      title: 'Mã đơn',
      width: '85px',
      render: (val, row) => `#TT${val || row.id}`,
    },
    {
      key: 'tenHienThi',
      title: 'Nhà hảo tâm',
      render: (val, row) => (
        <div>
          <div className="font-semibold text-primary">{val || row.tenNguoiDung || 'Ẩn danh'}</div>
          {(row.sdtNguoiDung || row.emailNguoiDung) && (
            <div style={{ fontSize: '0.78rem', color: '#666' }}>
              {[row.sdtNguoiDung, row.emailNguoiDung].filter(Boolean).join(' • ')}
            </div>
          )}
          {(row.ghiChu || row.ghichu) && (
            <div className="text-muted text-sm">"{row.ghiChu || row.ghichu}"</div>
          )}
        </div>
      ),
    },
    {
      key: 'maBaiTaiTro',
      title: 'Chiến dịch tiếp nhận',
      render: (_, row) => (
        <span className="font-medium text-text">{getCampaignTitle(row)}</span>
      ),
    },
    {
      key: 'soTienDk',
      title: 'Số tiền ĐK',
      width: '140px',
      align: 'right',
      render: (val, row) => (
        <span className="font-semibold text-text">
          {formatCurrency(val ?? row.soTienDK ?? row.amount ?? 0)}
        </span>
      ),
    },
    {
      key: 'soTienTt',
      title: 'Số tiền thực nhận',
      width: '140px',
      align: 'right',
      render: (val, row) => {
        const st = String(row.trangThai || '').toUpperCase();
        if (st === 'DANHAN' && val !== null && val !== undefined) {
          return <span className="font-bold text-success">{formatCurrency(val)}</span>;
        }
        return <span className="text-muted">—</span>;
      },
    },
    {
      key: 'ngayGui',
      title: 'Ngày gửi đơn',
      width: '120px',
      render: (val, row) => formatDate(val || row.ngaygui),
    },
    {
      key: 'trangThai',
      title: 'Trạng thái',
      width: '140px',
      render: (val, row) => getStatusBadge(val || row.trangthai),
    },
    {
      key: 'actions',
      title: 'Thao tác',
      width: '185px',
      render: (_, row) => {
        const st = String(row.trangThai || row.trangthai || '').toUpperCase();
        const isPending = st === 'CHODUYET';
        const isApproved = st === 'DADUYET';
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
                  title="Duyệt đơn (CHODUYET → DADUYET)"
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
            {isApproved && (
              <Button
                size="sm"
                variant="primary"
                onClick={() => navigate('/fundraiser/donation-confirm')}
                title="Chuyển sang đối soát xác nhận tiền thực nhận"
              >
                <FiArrowRight /> Xác nhận tiền
              </Button>
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
            Bước 1: Kiểm tra thông tin, biên lai và duyệt yêu cầu đăng ký tài trợ từ nhà hảo tâm (trạng thái CHODUYET → DADUYET).
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
            emptyDescription="Chưa có bản ghi tài trợ nào khớp với trạng thái đã chọn."
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
            {String(selectedDonation?.trangThai || selectedDonation?.trangthai || '').toUpperCase() === 'CHODUYET' && (
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
            {String(selectedDonation?.trangThai || selectedDonation?.trangthai || '').toUpperCase() === 'DADUYET' && (
              <Button
                variant="primary"
                onClick={() => {
                  setDetailModalOpen(false);
                  navigate('/fundraiser/donation-confirm');
                }}
              >
                <FiArrowRight /> Đi tới Xác nhận tiền thực nhận
              </Button>
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
              <span className="detail-label">Tên hiển thị vinh danh:</span>
              <span className="detail-value font-bold">{selectedDonation.tenHienThi}</span>
            </div>
            {selectedDonation.tenNguoiDung && (
              <div className="detail-row">
                <span className="detail-label">Tài khoản đăng ký:</span>
                <span className="detail-value">
                  {selectedDonation.tenNguoiDung}{' '}
                  {(selectedDonation.sdtNguoiDung || selectedDonation.emailNguoiDung) &&
                    `(${[selectedDonation.sdtNguoiDung, selectedDonation.emailNguoiDung].filter(Boolean).join(' • ')})`}
                </span>
              </div>
            )}
            <div className="detail-row">
              <span className="detail-label">Chiến dịch tiếp nhận:</span>
              <span className="detail-value font-semibold">
                {getCampaignTitle(selectedDonation)}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Số tiền đăng ký tài trợ:</span>
              <span className="detail-value font-bold text-success text-lg">
                {formatCurrency(selectedDonation.soTienDk ?? selectedDonation.soTienDK ?? selectedDonation.amount ?? 0)}
              </span>
            </div>
            {String(selectedDonation.trangThai || '').toUpperCase() === 'DANHAN' &&
              selectedDonation.soTienTt !== null &&
              selectedDonation.soTienTt !== undefined && (
                <div className="detail-row">
                  <span className="detail-label">Số tiền thực tế tiếp nhận:</span>
                  <span className="detail-value font-bold text-primary">
                    {formatCurrency(selectedDonation.soTienTt)}
                  </span>
                </div>
              )}
            <div className="detail-row">
              <span className="detail-label">Thời gian gửi đăng ký:</span>
              <span className="detail-value">{formatDate(selectedDonation.ngayGui || selectedDonation.ngaygui)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Trạng thái hiện tại:</span>
              <span className="detail-value">{getStatusBadge(selectedDonation.trangThai || selectedDonation.trangthai)}</span>
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
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/images/minhchungmau.jpg';
                  }}
                />
              </div>
            )}

            {(selectedDonation.ghiChu || selectedDonation.ghichu) && (
              <div className="sponsor-note-box" style={{ marginTop: '1rem' }}>
                <div className="note-title">
                  <FiFileText /> Ghi chú / Lời nhắn:
                </div>
                <p className="note-text">{selectedDonation.ghiChu || selectedDonation.ghichu}</p>
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
            placeholder="Ví dụ: Thông tin giao dịch không khớp, chưa nhận được chứng từ hợp lệ..."
            required
          />
        </div>
      </Modal>
    </div>
  );
};

export default SponsorApproval;
// Trang Phê duyệt đề xuất tài trợ từ Nhà hảo tâm (Fundraiser) theo ERD mới
// BẢNG DEXUATTAITRO: madexuat, manguoidung, mabaitaitro, tieude, soTienDX, mucdichSD, trangthai, macanbo, ngayxuly, lydotuchoi, ngaygui
import { useState, useEffect } from 'react';
import { getProposals, approveProposal, rejectProposal } from '../../../../services/proposalService';
import Card from '../../../../components/Card/Card';
import Table from '../../../../components/Table/Table';
import Button from '../../../../components/Button/Button';
import Modal from '../../../../components/Modal/Modal';
import Input from '../../../../components/Input/Input';
import Loading from '../../../../components/Loading/Loading';
import Tabs from '../../../../components/Tabs/Tabs';
import { useNotification } from '../../../../components/Notification/Notification';
import { formatDate, formatCurrency } from '../../../../utils/formatters';
import { FiCheck, FiX, FiEye, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import './ProposalApproval.css';

const STATUS_TABS = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'ChoDuyet', label: 'Chờ duyệt' },
  { value: 'DaDuyet', label: 'Đã duyệt' },
  { value: 'TuChoi', label: 'Đã từ chối' },
];

const ProposalApproval = () => {
  const { addToast } = useNotification();
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');

  // Modal Chi tiết
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);

  // Modal Từ chối
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const res = await getProposals();
      setProposals(res?.data || res || []);
    } catch (err) {
      console.error('Lỗi khi tải đề xuất tài trợ:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const getUserName = (userId, row) => {
    return row?.tenNguoiDung || row?.tenHienThi || (userId ? `Nhà hảo tâm #${userId}` : 'Nhà hảo tâm');
  };

  const filteredProposals = proposals.filter((p) => {
    const st = p.trangthai || p.trangThai || p.status;
    if (activeTab === 'ALL') return true;
    return st === activeTab;
  });

  const handleOpenDetail = (item) => {
    setSelectedProposal(item);
    setDetailModalOpen(true);
  };

  const handleApprove = async (item) => {
    const id = item.madexuat || item.maDeXuat || item.id;
    try {
      setSubmittingAction(true);
      await approveProposal(id);
      addToast(`Đã phê duyệt đề xuất tài trợ #${id} thành công!`, 'success');
      setDetailModalOpen(false);
      fetchProposals();
    } catch (err) {
      addToast(err.message || 'Không thể phê duyệt đề xuất', 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleOpenReject = (item) => {
    setSelectedProposal(item);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectReason.trim()) {
      addToast('Vui lòng nhập lý do từ chối để phản hồi đến nhà hảo tâm', 'warning');
      return;
    }

    const id = selectedProposal.madexuat || selectedProposal.maDeXuat || selectedProposal.id;
    try {
      setSubmittingAction(true);
      await rejectProposal(id, rejectReason);
      addToast(`Đã từ chối đề xuất tài trợ #${id}`, 'info');
      setRejectModalOpen(false);
      setDetailModalOpen(false);
      fetchProposals();
    } catch (err) {
      addToast(err.message || 'Thao tác thất bại', 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  const renderStatus = (st) => {
    if (st === 'DaDuyet') {
      return (
        <span className="badge-proposal-status status-approved">
          <FiCheckCircle /> Đã duyệt
        </span>
      );
    }
    if (st === 'TuChoi') {
      return (
        <span className="badge-proposal-status status-rejected">
          <FiXCircle /> Đã từ chối
        </span>
      );
    }
    return (
      <span className="badge-proposal-status status-pending">
        <FiClock /> Chờ duyệt
      </span>
    );
  };

  const columns = [
    {
      key: 'madexuat',
      title: 'Mã ĐX',
      width: '80px',
      render: (val, row) => `#ĐX${val || row.id}`,
    },
    {
      key: 'tieude',
      title: 'Tiêu đề đề xuất tài trợ',
      render: (val, row) => (
        <div>
          <div className="font-semibold text-primary">{val || row.tieuDe || row.title}</div>
          <div className="text-muted text-sm">
            Người đề xuất: <strong>{getUserName(row.manguoidung, row)}</strong>
          </div>
        </div>
      ),
    },
    {
      key: 'soTienDX',
      title: 'Số tiền đề xuất',
      width: '160px',
      align: 'right',
      render: (val, row) => (
        <span className="font-bold text-success">
          {formatCurrency(val || row.giaTriUocTinh || 0)}
        </span>
      ),
    },
    {
      key: 'ngaygui',
      title: 'Ngày gửi',
      width: '120px',
      render: (val, row) => formatDate(val || row.ngayGui || new Date().toISOString()),
    },
    {
      key: 'trangthai',
      title: 'Trạng thái',
      width: '130px',
      render: (val, row) => renderStatus(val || row.status),
    },
    {
      key: 'actions',
      title: 'Thao tác',
      width: '180px',
      render: (_, row) => {
        const st = row.trangthai || row.status;
        const isPending = st === 'ChoDuyet';
        return (
          <div className="table-actions">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleOpenDetail(row)}
              title="Xem chi tiết"
            >
              <FiEye /> Xem
            </Button>
            {isPending && (
              <>
                <button
                  type="button"
                  className="btn-quick-approve"
                  onClick={() => handleApprove(row)}
                  title="Duyệt nhanh"
                  disabled={submittingAction}
                >
                  <FiCheck />
                </button>
                <button
                  type="button"
                  className="btn-quick-reject"
                  onClick={() => handleOpenReject(row)}
                  title="Từ chối"
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
    <div className="proposal-approval-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Thẩm Định & Phê Duyệt Đề Xuất Tài Trợ</h1>
          <p className="page-subtitle">
            Tiếp nhận các dự án và đề xuất đóng góp riêng biệt do các nhà hảo tâm gửi đến nhà trường
          </p>
        </div>
      </div>

      <div className="tabs-container">
        <Tabs tabs={STATUS_TABS} active={activeTab} onChange={setActiveTab} />
      </div>

      <Card padding={false}>
        {loading ? (
          <Loading rows={5} type="skeleton" />
        ) : (
          <Table
            columns={columns}
            data={filteredProposals}
            rowKey="madexuat"
            emptyTitle="Không có đề xuất nào"
            emptyDescription="Chưa có hồ sơ đề xuất tài trợ nào trong mục đã chọn."
          />
        )}
      </Card>

      {/* Modal Xem chi tiết đề xuất */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={`Chi tiết đề xuất #${selectedProposal?.madexuat || selectedProposal?.id}`}
        size="md"
        footer={
          <div className="modal-buttons">
            {selectedProposal?.trangthai === 'ChoDuyet' && (
              <>
                <Button
                  variant="danger"
                  onClick={() => handleOpenReject(selectedProposal)}
                  disabled={submittingAction}
                >
                  <FiX /> Từ chối đề xuất
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleApprove(selectedProposal)}
                  loading={submittingAction}
                >
                  <FiCheck /> Phê duyệt chấp thuận
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => setDetailModalOpen(false)}>
              Đóng
            </Button>
          </div>
        }
      >
        {selectedProposal && (
          <div className="proposal-detail-content">
            <div className="detail-row">
              <span className="detail-label">Người đề xuất:</span>
              <span className="detail-value font-bold">
                {getUserName(selectedProposal.manguoidung, selectedProposal)}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Tiêu đề đề xuất:</span>
              <span className="detail-value font-semibold text-primary">
                {selectedProposal.tieude || selectedProposal.tieuDe}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Số tiền đề xuất:</span>
              <span className="detail-value font-bold text-success">
                {formatCurrency(selectedProposal.soTienDX || selectedProposal.giaTriUocTinh || 0)}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Ngày gửi đề xuất:</span>
              <span className="detail-value">
                {formatDate(selectedProposal.ngaygui || selectedProposal.ngayGui)}
              </span>
            </div>
            {selectedProposal.ngayxuly && (
              <div className="detail-row">
                <span className="detail-label">Ngày xử lý:</span>
                <span className="detail-value">
                  {formatDate(selectedProposal.ngayxuly)}
                </span>
              </div>
            )}
            {selectedProposal.lydotuchoi && (
              <div className="detail-row" style={{ color: 'var(--danger)' }}>
                <span className="detail-label">Lý do từ chối:</span>
                <span className="detail-value font-semibold">
                  {selectedProposal.lydotuchoi}
                </span>
              </div>
            )}

            <div className="detail-desc-box">
              <div className="desc-title">Mục đích sử dụng nguồn kinh phí:</div>
              <p className="desc-text">
                {selectedProposal.mucdichSD || selectedProposal.moTa || selectedProposal.content}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Nhập lý do từ chối */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Từ chối đề xuất tài trợ"
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
          <p className="text-sm text-muted">
            Vui lòng nhập lý do để phản hồi minh bạch đến Nhà hảo tâm:
          </p>
          <Input
            type="textarea"
            rows={4}
            label="Lý do từ chối"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Nhập lý do phản hồi..."
            required
          />
        </div>
      </Modal>
    </div>
  );
};

export default ProposalApproval;

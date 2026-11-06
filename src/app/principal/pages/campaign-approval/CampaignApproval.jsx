import { useState, useEffect } from 'react';
import { FiCheckCircle, FiXCircle, FiEye } from 'react-icons/fi';
import Tabs from '../../../../components/Tabs/Tabs';
import Table from '../../../../components/Table/Table';
import Modal from '../../../../components/Modal/Modal';
import Button from '../../../../components/Button/Button';
import { useNotification } from '../../../../components/Notification/Notification';
import { getAllCampaigns } from '../../../../services/campaignService';
import { approveCampaign } from '../../../../services/approvalService';
import './CampaignApproval.css';

const STATUS_TABS = [
  { label: 'Chờ duyệt', value: 'ChoDuyet' },
  { label: 'Đã duyệt', value: 'DaDuyet' },
  { label: 'Từ chối', value: 'TuChoi' },
  { label: 'Tất cả', value: 'all' },
];

const formatCurrency = (n) =>
  n != null ? n.toLocaleString('vi-VN') + ' ₫' : '—';

const statusBadge = (s) => {
  const map = {
    DangChay: { label: 'Đang chạy', cls: 'badge--info' },
    ChoDuyet: { label: 'Chờ duyệt', cls: 'badge--warning' },
    DaDuyet: { label: 'Đã duyệt', cls: 'badge--success' },
    KetThuc: { label: 'Kết thúc', cls: 'badge--secondary' },
    TuChoi: { label: 'Từ chối', cls: 'badge--danger' },
  };
  const info = map[s] || { label: s, cls: '' };
  return <span className={`badge ${info.cls}`}>{info.label}</span>;
};

const CampaignApproval = () => {
  const { addToast } = useNotification();
  const [activeTab, setActiveTab] = useState('ChoDuyet');
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAllCampaigns();
      setCampaigns(res.data || res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = activeTab === 'all'
    ? campaigns
    : campaigns.filter((c) => c.trangthai === activeTab);

  const pendingCount = campaigns.filter((c) => c.trangthai === 'ChoDuyet').length;
  const tabs = STATUS_TABS.map((t) =>
    t.value === 'ChoDuyet' ? { ...t, badge: pendingCount || undefined } : t
  );

  const getUserName = (id, row) =>
    row?.tenCanBo || (id ? `Cán bộ #${id}` : 'Cán bộ phụ trách');

  const openDetail = (c) => { setSelected(c); setModalType('detail'); };
  const openApprove = (c) => { setSelected(c); setModalType('approve'); };
  const openReject = (c) => { setSelected(c); setModalType('reject'); setRejectReason(''); };
  const closeModal = () => { setSelected(null); setModalType(null); };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await approveCampaign(selected.maBaiTaiTro, true);
      addToast(`Đã duyệt chiến dịch "${selected.tieude}"`, 'success');
      fetchData();
      closeModal();
    } catch {
      addToast('Có lỗi xảy ra, vui lòng thử lại', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { addToast('Vui lòng nhập lý do từ chối', 'warning'); return; }
    setActionLoading(true);
    try {
      await approveCampaign(selected.maBaiTaiTro, false, rejectReason);
      addToast(`Đã từ chối chiến dịch "${selected.tieude}"`, 'info');
      fetchData();
      closeModal();
    } catch {
      addToast('Có lỗi xảy ra, vui lòng thử lại', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const dataWithStt = filtered.map((c, i) => ({ ...c, _stt: i + 1 }));

  const columns = [
    { key: '_stt', title: 'STT', width: 56 },
    { key: 'tieude', title: 'Tiêu đề chiến dịch', render: (v, row) => <span className="ca-title">{row.tieude}</span> },
    { key: 'muctieu', title: 'Mục tiêu gây quỹ', align: 'right', render: (v, row) => formatCurrency(v || row.targetAmount || 0) },
    { key: 'creator', title: 'Cán bộ lập bài', render: (_, row) => getUserName(row.maCanBo, row) },
    { key: 'ngaybatdau', title: 'Ngày bắt đầu', render: (_, row) => row.ngaybatdau },
    { key: 'ngaykethuc', title: 'Ngày kết thúc', render: (_, row) => row.ngaykethuc },
    { key: 'trangthai', title: 'Trạng thái', render: (_, row) => statusBadge(row.trangthai) },
    {
      key: 'action', title: 'Hành động',
      render: (_, row) => (
        <div className="ca-actions">
          <button className="ca-btn ca-btn--view" onClick={() => openDetail(row)} title="Xem chi tiết">
            <FiEye />
          </button>
          {row.trangthai === 'ChoDuyet' && (
            <>
              <button className="ca-btn ca-btn--approve" onClick={() => openApprove(row)} title="Duyệt">
                <FiCheckCircle />
              </button>
              <button className="ca-btn ca-btn--reject" onClick={() => openReject(row)} title="Từ chối">
                <FiXCircle />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="campaign-approval">
      <div className="ca-header">
        <div>
          <h1 className="ca-heading">Phê duyệt chiến dịch gây quỹ</h1>
          <p className="ca-sub">Xem xét và phê duyệt các bài kêu gọi tài trợ do cán bộ tạo</p>
        </div>
        <div className="ca-stat">
          <span className="ca-stat__num">{pendingCount}</span>
          <span className="ca-stat__label">chiến dịch chờ duyệt</span>
        </div>
      </div>

      <div className="ca-card">
        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
        <div className="ca-table-wrap">
          <Table
            columns={columns}
            data={dataWithStt}
            loading={loading}
            rowKey="maBaiTaiTro"
            emptyTitle="Không có chiến dịch"
            emptyDescription="Không có chiến dịch nào trong trạng thái này."
          />
        </div>
      </div>

      {/* Modal chi tiết */}
      <Modal
        isOpen={modalType === 'detail'}
        onClose={closeModal}
        title="Chi tiết chiến dịch"
        size="lg"
      >
        {selected && (
          <div className="ca-detail">
            {selected.anhbia && <img src={selected.anhbia} alt={selected.tieude} className="ca-detail__img" />}
            <h3>{selected.tieude}</h3>
            <div className="ca-detail__meta">
              <span><strong>Trạng thái:</strong> {statusBadge(selected.trangthai)}</span>
              <span><strong>Cán bộ:</strong> {getUserName(selected.maCanBo, selected)}</span>
              <span><strong>Thời gian:</strong> {selected.ngaybatdau} → {selected.ngaykethuc}</span>
              <span><strong>Mục tiêu:</strong> {formatCurrency(selected.muctieu || selected.targetAmount || 0)}</span>
              <span><strong>Đã tiếp nhận:</strong> {formatCurrency(selected.tongtienDaNhan || 0)}</span>
            </div>
            <div className="ca-detail__desc">
              <strong>Nội dung:</strong>
              <p>{selected.noidung}</p>
            </div>
            {selected.trangthai === 'ChoDuyet' && (
              <div className="ca-detail__actions">
                <Button variant="primary" onClick={() => { closeModal(); openApprove(selected); }}>
                  <FiCheckCircle /> Phê duyệt
                </Button>
                <Button variant="danger" onClick={() => { closeModal(); openReject(selected); }}>
                  <FiXCircle /> Từ chối
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal duyệt */}
      <Modal
        isOpen={modalType === 'approve'}
        onClose={closeModal}
        title="Xác nhận phê duyệt"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={closeModal}>Hủy</Button>
            <Button variant="primary" loading={actionLoading} onClick={handleApprove}>
              Xác nhận duyệt
            </Button>
          </>
        }
      >
        <p>Bạn có chắc muốn <strong>phê duyệt</strong> chiến dịch:</p>
        <p className="ca-confirm-title">"{selected?.tieude}"?</p>
        <p className="ca-confirm-note">Chiến dịch sẽ được công bố và cán bộ có thể bắt đầu tiếp nhận tài trợ.</p>
      </Modal>

      {/* Modal từ chối */}
      <Modal
        isOpen={modalType === 'reject'}
        onClose={closeModal}
        title="Từ chối chiến dịch"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={closeModal}>Hủy</Button>
            <Button variant="danger" loading={actionLoading} onClick={handleReject}>
              Xác nhận từ chối
            </Button>
          </>
        }
      >
        <p>Lý do từ chối chiến dịch <strong>"{selected?.tieude}"</strong>:</p>
        <textarea
          className="ca-reason"
          rows={4}
          placeholder="Nhập lý do từ chối để thông báo cho cán bộ..."
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default CampaignApproval;

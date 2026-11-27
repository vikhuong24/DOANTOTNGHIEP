import { useState, useEffect, useCallback } from 'react';
import { FiCheckCircle, FiXCircle, FiEye } from 'react-icons/fi';
import Tabs from '../../../../components/Tabs/Tabs';
import Table from '../../../../components/Table/Table';
import Modal from '../../../../components/Modal/Modal';
import Button from '../../../../components/Button/Button';
import { useNotification } from '../../../../components/Notification/Notification';
import { getPendingCampaigns, approveCampaign } from '../../../../services/approvalService';
import { formatDate, formatImageUrl } from '../../../../utils/formatters';
import './CampaignApproval.css';

const STATUS_TABS = [
  { label: 'Chờ duyệt', value: 'CHODUYET' },
  { label: 'Đã duyệt (phiên này)', value: 'DADUYET' },
  { label: 'Từ chối (phiên này)', value: 'TUCHOI' },
  { label: 'Tất cả', value: 'ALL' },
];

const formatCurrency = (n) =>
  n != null ? Number(n).toLocaleString('vi-VN') + ' ₫' : '—';

const normalizeCampaign = (c) => {
  if (!c) return null;
  const status = String(c.trangThai || c.trangthai || 'CHODUYET').toUpperCase();
  return {
    ...c,
    maBaiTaiTro: c.maBaiTaiTro || c.mabaitaitro || c.id,
    tieuDe: c.tieuDe || c.tieude || '',
    noiDung: c.noiDung || c.noidung || '',
    anhBia: c.anhBia || c.anhbia || '',
    mucTieu: c.mucTieu ?? c.muctieu ?? 0,
    tongTienDaNhan: c.tongTienDaNhan ?? c.tongtienDaNhan ?? 0,
    trangThai: status,
    tenCanBo: c.tenCanBo || (c.maCanBo ? `Cán bộ #${c.maCanBo}` : 'Cán bộ phụ trách'),
    ngayBatDau: c.ngayBatDau || c.ngaybatdau || '',
    ngayKetThuc: c.ngayKetThuc || c.ngaykethuc || '',
  };
};

const statusBadge = (s) => {
  const st = String(s || '').toUpperCase();
  const map = {
    CHODUYET: { label: 'Chờ duyệt', cls: 'badge--warning' },
    DADUYET: { label: 'Đã duyệt', cls: 'badge--success' },
    KETTHUC: { label: 'Kết thúc', cls: 'badge--secondary' },
    TUCHOI: { label: 'Từ chối', cls: 'badge--danger' },
    NHAP: { label: 'Nháp', cls: 'badge--secondary' },
  };
  const info = map[st] || { label: st, cls: '' };
  return <span className={`badge ${info.cls}`}>{info.label}</span>;
};

const CampaignApproval = () => {
  const { addToast } = useNotification();
  const [activeTab, setActiveTab] = useState('CHODUYET');
  const [campaigns, setCampaigns] = useState([]);
  const [processedMap, setProcessedMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getPendingCampaigns();
      setCampaigns((Array.isArray(list) ? list : []).map(normalizeCampaign));
    } catch (err) {
      addToast(err?.response?.data?.message || err?.message || 'Không thể tải danh sách chiến dịch chờ duyệt', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Kết hợp danh sách CHODUYET từ Backend và các mục vừa xử lý trong phiên
  const combinedList = [
    ...campaigns,
    ...Object.values(processedMap).filter(
      (p) => !campaigns.some((c) => c.maBaiTaiTro === p.maBaiTaiTro)
    ),
  ];

  const filtered = activeTab === 'ALL'
    ? combinedList
    : combinedList.filter((c) => c.trangThai === activeTab);

  const pendingCount = campaigns.filter((c) => c.trangThai === 'CHODUYET').length;
  const tabs = STATUS_TABS.map((t) =>
    t.value === 'CHODUYET' ? { ...t, badge: pendingCount || undefined } : t
  );

  const openDetail = (c) => { setSelected(c); setModalType('detail'); };
  const openApprove = (c) => { setSelected(c); setModalType('approve'); };
  const openReject = (c) => { setSelected(c); setModalType('reject'); setRejectReason(''); };
  const closeModal = () => { setSelected(null); setModalType(null); };

  const handleApprove = async () => {
    if (!selected || selected.trangThai !== 'CHODUYET') {
      addToast('Chỉ có thể phê duyệt chiến dịch đang ở trạng thái Chờ duyệt', 'warning');
      return;
    }
    setActionLoading(true);
    try {
      const updated = normalizeCampaign(await approveCampaign(selected.maBaiTaiTro, true));
      if (updated) {
        setProcessedMap((prev) => ({ ...prev, [updated.maBaiTaiTro]: updated }));
      }
      addToast(`Đã duyệt chiến dịch "${selected.tieuDe}"`, 'success');
      fetchData();
      window.dispatchEvent(new CustomEvent('sidebar:refresh-badges'));
      closeModal();
    } catch (err) {
      addToast(err?.response?.data?.message || err?.message || 'Có lỗi xảy ra, vui lòng thử lại', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selected || selected.trangThai !== 'CHODUYET') {
      addToast('Chỉ có thể từ chối chiến dịch đang ở trạng thái Chờ duyệt', 'warning');
      return;
    }
    if (!rejectReason.trim()) {
      addToast('Vui lòng nhập lý do từ chối', 'warning');
      return;
    }
    setActionLoading(true);
    try {
      const updated = normalizeCampaign(await approveCampaign(selected.maBaiTaiTro, false, rejectReason.trim()));
      if (updated) {
        setProcessedMap((prev) => ({
          ...prev,
          [updated.maBaiTaiTro]: { ...updated, lyDoTuChoi: rejectReason.trim() },
        }));
      }
      addToast(`Đã từ chối chiến dịch "${selected.tieuDe}"`, 'info');
      fetchData();
      window.dispatchEvent(new CustomEvent('sidebar:refresh-badges'));
      closeModal();
    } catch (err) {
      addToast(err?.response?.data?.message || err?.message || 'Có lỗi xảy ra, vui lòng thử lại', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const dataWithStt = filtered.map((c, i) => ({ ...c, _stt: i + 1 }));

  const columns = [
    { key: '_stt', title: 'STT', width: 56 },
    { key: 'tieuDe', title: 'Tiêu đề chiến dịch', render: (_, row) => <span className="ca-title">{row.tieuDe}</span> },
    { key: 'mucTieu', title: 'Mục tiêu gây quỹ', align: 'right', render: (_, row) => formatCurrency(row.mucTieu) },
    { key: 'tenCanBo', title: 'Cán bộ lập bài', render: (_, row) => row.tenCanBo },
    { key: 'ngayBatDau', title: 'Ngày bắt đầu', render: (_, row) => formatDate(row.ngayBatDau) },
    { key: 'ngayKetThuc', title: 'Ngày kết thúc', render: (_, row) => formatDate(row.ngayKetThuc) },
    { key: 'trangThai', title: 'Trạng thái', render: (_, row) => statusBadge(row.trangThai) },
    {
      key: 'action', title: 'Hành động',
      render: (_, row) => (
        <div className="ca-actions">
          <button className="ca-btn ca-btn--view" onClick={() => openDetail(row)} title="Xem chi tiết">
            <FiEye />
          </button>
          {row.trangThai === 'CHODUYET' && (
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
            {selected.anhBia && (
              <img
                src={formatImageUrl(selected.anhBia)}
                alt={selected.tieuDe}
                className="ca-detail__img"
              />
            )}
            <h3>{selected.tieuDe}</h3>
            <div className="ca-detail__meta">
              <span><strong>Trạng thái:</strong> {statusBadge(selected.trangThai)}</span>
              <span><strong>Cán bộ:</strong> {selected.tenCanBo}</span>
              <span><strong>Thời gian:</strong> {formatDate(selected.ngayBatDau)} → {formatDate(selected.ngayKetThuc)}</span>
              <span><strong>Mục tiêu:</strong> {formatCurrency(selected.mucTieu)}</span>
              <span><strong>Đã tiếp nhận:</strong> {formatCurrency(selected.tongTienDaNhan)}</span>
            </div>
            <div className="ca-detail__desc">
              <strong>Nội dung:</strong>
              <p>{selected.noiDung}</p>
            </div>
            {selected.lyDoTuChoi && (
              <div className="ca-detail__desc">
                <strong>Lý do từ chối:</strong>
                <p>{selected.lyDoTuChoi}</p>
              </div>
            )}
            {selected.trangThai === 'CHODUYET' && (
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
        <p className="ca-confirm-title">"{selected?.tieuDe}"?</p>
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
        <p>Lý do từ chối chiến dịch <strong>"{selected?.tieuDe}"</strong>:</p>
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

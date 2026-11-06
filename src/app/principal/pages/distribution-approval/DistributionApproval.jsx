import { useState, useEffect } from 'react';
import { FiCheckCircle, FiXCircle, FiEye } from 'react-icons/fi';
import Tabs from '../../../../components/Tabs/Tabs';
import Table from '../../../../components/Table/Table';
import Modal from '../../../../components/Modal/Modal';
import Button from '../../../../components/Button/Button';
import { useNotification } from '../../../../components/Notification/Notification';
import { getAllDistributions, approveDistribution } from '../../../../services/distributionService';
import { getAllCampaigns } from '../../../../services/campaignService';
import './DistributionApproval.css';

const TYPE_TABS = [
  { label: 'Chờ duyệt', value: 'ChoDuyet' },
  { label: 'Đã duyệt', value: 'DaDuyet' },
  { label: 'Đã trao', value: 'DaTrao' },
  { label: 'Tất cả', value: 'all' },
];

const formatCurrency = (n) =>
  n != null ? n.toLocaleString('vi-VN') + ' ₫' : '—';

const statusBadge = (s) => {
  const map = {
    ChoDuyet: { label: 'Chờ duyệt', cls: 'da-badge--warning' },
    DaDuyet: { label: 'Đã duyệt', cls: 'da-badge--success' },
    DaTrao: { label: 'Đã trao', cls: 'da-badge--info' },
    TuChoi: { label: 'Từ chối', cls: 'da-badge--danger' },
  };
  const info = map[s] || { label: s, cls: '' };
  return <span className={`da-badge ${info.cls}`}>{info.label}</span>;
};

const DistributionApproval = () => {
  const { addToast } = useNotification();
  const [activeTab, setActiveTab] = useState('ChoDuyet');
  const [distributions, setDistributions] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [distRes, campRes] = await Promise.all([
        getAllDistributions(),
        getAllCampaigns(),
      ]);
      setDistributions(distRes.data || distRes);
      setCampaigns(campRes.data || campRes);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = activeTab === 'all'
    ? distributions
    : distributions.filter((d) => d.trangthai === activeTab);

  const pendingCount = distributions.filter((d) => d.trangthai === 'ChoDuyet').length;
  const tabs = TYPE_TABS.map((t) =>
    t.value === 'ChoDuyet' ? { ...t, badge: pendingCount || undefined } : t
  );

  const getCampaignTitle = (id) =>
    campaigns.find((c) => c.maBaiTaiTro === id)?.tieude || `Bài #${id}`;
  const getCanBoName = (id, dist) =>
    dist?.tenCanBo || (id ? `Cán bộ #${id}` : 'Cán bộ điều phối');

  const getTotalValue = (dist) => {
    const total = (dist.chiTiet || []).reduce((s, ct) => s + (ct.soTien || 0), 0);
    return total || null;
  };

  const openDetail = (d) => { setSelected(d); setModalType('detail'); };
  const openApprove = (d) => { setSelected(d); setModalType('approve'); };
  const openReject = (d) => { setSelected(d); setModalType('reject'); setRejectReason(''); };
  const closeModal = () => { setSelected(null); setModalType(null); };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      setDistributions((prev) =>
        prev.map((d) =>
          d.maDotphanbo === selected.maDotphanbo ? { ...d, trangthai: 'DaDuyet' } : d
        )
      );
      addToast(`Đã duyệt đợt "${selected.tendot}"`, 'success');
      closeModal();
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { addToast('Vui lòng nhập lý do', 'warning'); return; }
    setActionLoading(true);
    try {
      setDistributions((prev) =>
        prev.map((d) =>
          d.maDotphanbo === selected.maDotphanbo ? { ...d, trangthai: 'TuChoi' } : d
        )
      );
      addToast(`Đã từ chối đợt "${selected.tendot}"`, 'info');
      closeModal();
    } finally {
      setActionLoading(false);
    }
  };

  const dataWithStt = filtered.map((d, i) => ({ ...d, _stt: i + 1 }));

  const columns = [
    { key: '_stt', title: 'STT', width: 56 },
    { key: 'tendot', title: 'Tên đợt phân bổ', render: (v, row) => <span className="da-title">{row.tendot}</span> },
    { key: 'campaign', title: 'Bài tài trợ', render: (_, row) => <span className="da-camp">{getCampaignTitle(row.mabaitaitro)}</span> },
    { key: 'value', title: 'Tổng giá trị', align: 'right', render: (_, row) => formatCurrency(getTotalValue(row)) },
    { key: 'canbo', title: 'Cán bộ', render: (_, row) => getCanBoName(row.macanbo, row) },
    { key: 'ngaytrao', title: 'Ngày trao', render: (_, row) => row.ngaytrao },
    { key: 'trangthai', title: 'Trạng thái', render: (_, row) => statusBadge(row.trangthai) },
    {
      key: 'action', title: 'Hành động',
      render: (_, row) => (
        <div className="da-actions">
          <button className="da-btn da-btn--view" onClick={() => openDetail(row)} title="Xem chi tiết"><FiEye /></button>
          {row.trangthai === 'ChoDuyet' && (
            <>
              <button className="da-btn da-btn--approve" onClick={() => openApprove(row)} title="Duyệt"><FiCheckCircle /></button>
              <button className="da-btn da-btn--reject" onClick={() => openReject(row)} title="Từ chối"><FiXCircle /></button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="distribution-approval">
      <div className="da-header">
        <div>
          <h1 className="da-heading">Phê duyệt đợt phân bổ</h1>
          <p className="da-sub">Xem xét và phê duyệt các đợt phân bổ hỗ trợ cho học sinh</p>
        </div>
        <div className="da-stat">
          <span className="da-stat__num">{pendingCount}</span>
          <span className="da-stat__label">đợt chờ duyệt</span>
        </div>
      </div>

      <div className="da-card">
        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
        <Table
          columns={columns}
          data={dataWithStt}
          loading={loading}
          rowKey="maDotphanbo"
          emptyTitle="Không có đợt phân bổ"
          emptyDescription="Không có đợt phân bổ nào trong trạng thái này."
        />
      </div>

      {/* Modal chi tiết */}
      <Modal isOpen={modalType === 'detail'} onClose={closeModal} title="Chi tiết đợt phân bổ" size="lg">
        {selected && (
          <div className="da-detail">
            <h3>{selected.tendot}</h3>
            <div className="da-detail__meta">
              <span><strong>Bài tài trợ:</strong> {getCampaignTitle(selected.mabaitaitro)}</span>
              <span><strong>Cán bộ:</strong> {getCanBoName(selected.macanbo, selected)}</span>
              <span><strong>Ngày trao:</strong> {selected.ngaytrao}</span>
              <span><strong>Trạng thái:</strong> {statusBadge(selected.trangthai)}</span>
            </div>
            <div className="da-detail__list">
              <strong>Danh sách chi tiết phân bổ:</strong>
              {(selected.chiTiet || []).map((ct, i) => (
                <div key={i} className="da-detail__row">
                  <span>Học sinh #{ct.maHocSinh}</span>
                  <span>SL: {ct.soLuong || 1}</span>
                  <span>{ct.soTien ? formatCurrency(ct.soTien) : 'Hiện vật'}</span>
                  <span className="da-detail__note">{ct.ghiChu}</span>
                </div>
              ))}
            </div>
            {selected.trangthai === 'ChoDuyet' && (
              <div className="da-detail__acts">
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
            <Button variant="primary" loading={actionLoading} onClick={handleApprove}>Xác nhận</Button>
          </>
        }
      >
        <p>Xác nhận phê duyệt đợt <strong>"{selected?.tendot}"</strong>?</p>
      </Modal>

      {/* Modal từ chối */}
      <Modal
        isOpen={modalType === 'reject'}
        onClose={closeModal}
        title="Từ chối đợt phân bổ"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={closeModal}>Hủy</Button>
            <Button variant="danger" loading={actionLoading} onClick={handleReject}>Xác nhận từ chối</Button>
          </>
        }
      >
        <p>Lý do từ chối đợt <strong>"{selected?.tendot}"</strong>:</p>
        <textarea
          className="da-reason"
          rows={4}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Nhập lý do..."
        />
      </Modal>
    </div>
  );
};

export default DistributionApproval;

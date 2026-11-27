import { useState, useEffect, useCallback } from 'react';
import { FiCheckCircle, FiXCircle, FiEye } from 'react-icons/fi';
import Tabs from '../../../../components/Tabs/Tabs';
import Table from '../../../../components/Table/Table';
import Modal from '../../../../components/Modal/Modal';
import Button from '../../../../components/Button/Button';
import { useNotification } from '../../../../components/Notification/Notification';
import { getPendingDistributions, approveDistribution } from '../../../../services/approvalService';
import { formatDate } from '../../../../utils/formatters';
import './DistributionApproval.css';

const TYPE_TABS = [
  { label: 'Chờ duyệt', value: 'CHODUYET' },
  { label: 'Đã duyệt (phiên này)', value: 'DADUYET' },
  { label: 'Từ chối (phiên này)', value: 'TUCHOI' },
  { label: 'Tất cả', value: 'ALL' },
];

const formatCurrency = (n) =>
  n != null ? Number(n).toLocaleString('vi-VN') + ' ₫' : '—';

const normalizeDistribution = (d) => {
  if (!d) return null;
  const status = String(d.trangThai || d.trangthai || 'CHODUYET').toUpperCase();
  return {
    ...d,
    maDotPhanBo: d.maDotPhanBo || d.maDotphanbo || d.id,
    maBaiTaiTro: d.maBaiTaiTro || d.mabaitaitro,
    tieuDeBaiTaiTro: d.tieuDeBaiTaiTro || (d.maBaiTaiTro ? `Bài #${d.maBaiTaiTro}` : '—'),
    tenDot: d.tenDot || d.tendot || '',
    tongTien: d.tongTien ?? d.tongtien ?? 0,
    ngayTrao: d.ngayTrao || d.ngaytrao || '',
    trangThai: status,
    tenCanBo: d.tenCanBo || (d.maCanBo ? `Cán bộ #${d.maCanBo}` : 'Cán bộ điều phối'),
    chiTietPhanBo: Array.isArray(d.chiTietPhanBo || d.chiTiet) ? (d.chiTietPhanBo || d.chiTiet) : [],
  };
};

const statusBadge = (s) => {
  const st = String(s || '').toUpperCase();
  const map = {
    CHODUYET: { label: 'Chờ duyệt', cls: 'da-badge--warning' },
    DADUYET: { label: 'Đã duyệt', cls: 'da-badge--success' },
    DATRAO: { label: 'Đã trao', cls: 'da-badge--info' },
    TUCHOI: { label: 'Từ chối', cls: 'da-badge--danger' },
  };
  const info = map[st] || { label: st, cls: '' };
  return <span className={`da-badge ${info.cls}`}>{info.label}</span>;
};

const DistributionApproval = () => {
  const { addToast } = useNotification();
  const [activeTab, setActiveTab] = useState('CHODUYET');
  const [distributions, setDistributions] = useState([]);
  const [processedMap, setProcessedMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getPendingDistributions();
      setDistributions((Array.isArray(list) ? list : []).map(normalizeDistribution));
    } catch (err) {
      addToast(err?.response?.data?.message || err?.message || 'Không thể tải danh sách đợt phân bổ chờ duyệt', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const combinedList = [
    ...distributions,
    ...Object.values(processedMap).filter(
      (p) => !distributions.some((d) => d.maDotPhanBo === p.maDotPhanBo)
    ),
  ];

  const filtered = activeTab === 'ALL'
    ? combinedList
    : combinedList.filter((d) => d.trangThai === activeTab);

  const pendingCount = distributions.filter((d) => d.trangThai === 'CHODUYET').length;
  const tabs = TYPE_TABS.map((t) =>
    t.value === 'CHODUYET' ? { ...t, badge: pendingCount || undefined } : t
  );

  const openDetail = (d) => { setSelected(d); setModalType('detail'); };
  const openApprove = (d) => { setSelected(d); setModalType('approve'); };
  const openReject = (d) => { setSelected(d); setModalType('reject'); setRejectReason(''); };
  const closeModal = () => { setSelected(null); setModalType(null); };

  const handleApprove = async () => {
    if (!selected || selected.trangThai !== 'CHODUYET') {
      addToast('Chỉ có thể phê duyệt đợt phân bổ đang ở trạng thái Chờ duyệt', 'warning');
      return;
    }
    setActionLoading(true);
    try {
      const updated = normalizeDistribution(await approveDistribution(selected.maDotPhanBo, true));
      if (updated) {
        setProcessedMap((prev) => ({ ...prev, [updated.maDotPhanBo]: updated }));
      }
      addToast(`Đã duyệt đợt "${selected.tenDot}"`, 'success');
      fetchData();
      window.dispatchEvent(new CustomEvent('sidebar:refresh-badges'));
      closeModal();
    } catch (err) {
      addToast(err?.response?.data?.message || err?.message || 'Không thể phê duyệt đợt phân bổ', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selected || selected.trangThai !== 'CHODUYET') {
      addToast('Chỉ có thể từ chối đợt phân bổ đang ở trạng thái Chờ duyệt', 'warning');
      return;
    }
    if (!rejectReason.trim()) {
      addToast('Vui lòng nhập lý do từ chối', 'warning');
      return;
    }
    setActionLoading(true);
    try {
      const updated = normalizeDistribution(
        await approveDistribution(selected.maDotPhanBo, false, rejectReason.trim())
      );
      if (updated) {
        setProcessedMap((prev) => ({
          ...prev,
          [updated.maDotPhanBo]: { ...updated, lyDoTuChoi: rejectReason.trim() },
        }));
      }
      addToast(`Đã từ chối đợt "${selected.tenDot}"`, 'info');
      fetchData();
      window.dispatchEvent(new CustomEvent('sidebar:refresh-badges'));
      closeModal();
    } catch (err) {
      addToast(err?.response?.data?.message || err?.message || 'Không thể từ chối đợt phân bổ', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const dataWithStt = filtered.map((d, i) => ({ ...d, _stt: i + 1 }));

  const columns = [
    { key: '_stt', title: 'STT', width: 56 },
    { key: 'tenDot', title: 'Tên đợt phân bổ', render: (_, row) => <span className="da-title">{row.tenDot}</span> },
    { key: 'tieuDeBaiTaiTro', title: 'Bài tài trợ', render: (_, row) => <span className="da-camp">{row.tieuDeBaiTaiTro}</span> },
    { key: 'tongTien', title: 'Tổng giá trị', align: 'right', render: (_, row) => formatCurrency(row.tongTien) },
    { key: 'tenCanBo', title: 'Cán bộ', render: (_, row) => row.tenCanBo },
    { key: 'ngayTrao', title: 'Ngày trao', render: (_, row) => formatDate(row.ngayTrao) },
    { key: 'trangThai', title: 'Trạng thái', render: (_, row) => statusBadge(row.trangThai) },
    {
      key: 'action', title: 'Hành động',
      render: (_, row) => (
        <div className="da-actions">
          <button className="da-btn da-btn--view" onClick={() => openDetail(row)} title="Xem chi tiết"><FiEye /></button>
          {row.trangThai === 'CHODUYET' && (
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
      </div>

      <div className="da-card">
        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
        <Table
          columns={columns}
          data={dataWithStt}
          loading={loading}
          rowKey="maDotPhanBo"
          emptyTitle="Không có đợt phân bổ"
          emptyDescription="Không có đợt phân bổ nào trong trạng thái này."
        />
      </div>

      {/* Modal chi tiết */}
      <Modal isOpen={modalType === 'detail'} onClose={closeModal} title="Chi tiết đợt phân bổ" size="lg">
        {selected && (
          <div className="da-detail">
            <h3>{selected.tenDot}</h3>
            <div className="da-detail__meta">
              <span><strong>Bài tài trợ:</strong> {selected.tieuDeBaiTaiTro}</span>
              <span><strong>Cán bộ:</strong> {selected.tenCanBo}</span>
              <span><strong>Ngày trao:</strong> {formatDate(selected.ngayTrao)}</span>
              <span><strong>Tổng giá trị:</strong> {formatCurrency(selected.tongTien)}</span>
              <span><strong>Trạng thái:</strong> {statusBadge(selected.trangThai)}</span>
            </div>
            <div className="da-detail__list">
              <strong>Danh sách chi tiết phân bổ ({selected.chiTietPhanBo.length} học sinh):</strong>
              {selected.chiTietPhanBo.map((ct, i) => (
                <div key={ct.maChiTietPhanBo || i} className="da-detail__row">
                  <span>{ct.tenHocSinh || `Học sinh #${ct.maHocSinh}`}{ct.lop ? ` (${ct.lop})` : ''}</span>
                  <span>{ct.soTien ? formatCurrency(ct.soTien) : 'Hiện vật'}</span>
                  <span>{ct.nguoiNhan ? `Nhận thay: ${ct.nguoiNhan}` : ''}</span>
                  <span className="da-detail__note">{ct.ghiChu || ''}</span>
                </div>
              ))}
            </div>
            {selected.lyDoTuChoi && (
              <div className="da-detail__note">
                <strong>Lý do từ chối:</strong> {selected.lyDoTuChoi}
              </div>
            )}
            {selected.trangThai === 'CHODUYET' && (
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
        <p>Xác nhận phê duyệt đợt <strong>"{selected?.tenDot}"</strong>?</p>
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
        <p>Lý do từ chối đợt <strong>"{selected?.tenDot}"</strong>:</p>
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

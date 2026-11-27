// Trang Xác nhận tiếp nhận kinh phí tài trợ thực tế (Fundraiser)
// Kết nối API Backend: PUT /fundraiser/approvals/donations/{id}/confirm
import { useState, useEffect, useMemo } from 'react';
import {
  getPendingDonations,
  getAllDonations,
  getApprovedDonationsQueue,
  confirmDonation,
} from '../../../../services/donationService';
import { getFundraiserCampaigns, getAllCampaigns } from '../../../../services/campaignService';
import Card from '../../../../components/Card/Card';
import Table from '../../../../components/Table/Table';
import Button from '../../../../components/Button/Button';
import Modal from '../../../../components/Modal/Modal';
import Input from '../../../../components/Input/Input';
import Loading from '../../../../components/Loading/Loading';
import { useNotification } from '../../../../components/Notification/Notification';
import { formatDate, formatCurrency } from '../../../../utils/formatters';
import { FiCheckCircle, FiClock, FiDollarSign, FiCheck, FiInfo, FiImage, FiAlertTriangle, FiSearch } from 'react-icons/fi';
import './DonationConfirm.css';

const DonationConfirm = () => {
  const { addToast } = useNotification();
  const [loading, setLoading] = useState(true);
  const [approvedQueue, setApprovedQueue] = useState([]);
  const [receivedList, setReceivedList] = useState([]);
  const [pendingApiList, setPendingApiList] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [filterType, setFilterType] = useState('DADUYET');

  // Quick Confirm by ID (hỗ trợ trường hợp đơn DADUYET từ phiên làm việc khác)
  const [quickId, setQuickId] = useState('');

  // Modal xác nhận nhận tiền
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [actualAmount, setActualAmount] = useState(0);
  const [receiveNote, setReceiveNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchList = async () => {
    try {
      setLoading(true);
      const [pendingRes, statementsRes, campRes] = await Promise.all([
        getPendingDonations().catch(() => []),
        getAllDonations({ size: 100 }).catch(() => ({ data: [] })),
        getFundraiserCampaigns().catch(() => getAllCampaigns({ size: 100 }).then((r) => r.data || [])),
      ]);
      setPendingApiList(pendingRes || []);
      setReceivedList(statementsRes?.data || []);
      setApprovedQueue(getApprovedDonationsQueue());
      setCampaigns(Array.isArray(campRes) ? campRes : (campRes?.data || []));
    } catch (err) {
      console.error('Lỗi khi tải danh sách tiếp nhận:', err);
      addToast('Không thể tải danh sách tiếp nhận kinh phí', 'error');
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
    if (!cId) return 'Chiến dịch gây quỹ';
    const c = campaigns.find((camp) => Number(camp.maBaiTaiTro) === Number(cId));
    return c?.tieuDe || c?.tieude || `Chiến dịch #${cId}`;
  };

  const allDonations = useMemo(() => {
    const map = new Map();
    receivedList.forEach((d) => map.set(Number(d.maTaiTro), d));
    approvedQueue.forEach((d) => map.set(Number(d.maTaiTro), d));
    pendingApiList.forEach((d) => {
      if (String(d.trangThai || '').toUpperCase() === 'DADUYET') {
        map.set(Number(d.maTaiTro), d);
      }
    });
    return Array.from(map.values());
  }, [receivedList, approvedQueue, pendingApiList]);

  const filteredDonations = useMemo(() => {
    return allDonations.filter((d) => {
      const st = String(d.trangThai || d.trangthai || '').toUpperCase();
      if (filterType === 'ALL') return true;
      if (filterType === 'DADUYET') return st === 'DADUYET';
      if (filterType === 'DANHAN') return st === 'DANHAN' || st === 'HOANTHANH';
      return true;
    });
  }, [allDonations, filterType]);

  const handleOpenConfirm = (row) => {
    setSelectedDonation(row);
    const registered = Number(row.soTienDk ?? row.soTienDK ?? row.amount ?? 0);
    setActualAmount(registered > 0 ? registered : 100000);
    setReceiveNote('Đã đối soát khớp sao kê tài khoản ngân hàng nhà trường.');
    setConfirmModalOpen(true);
  };

  const handleOpenQuickConfirm = () => {
    const idNum = Number(quickId);
    if (!idNum || idNum <= 0) {
      addToast('Vui lòng nhập Mã tài trợ hợp lệ (VD: 6)', 'warning');
      return;
    }
    const existing = allDonations.find((d) => Number(d.maTaiTro) === idNum);
    if (existing) {
      handleOpenConfirm(existing);
    } else {
      setSelectedDonation({
        maTaiTro: idNum,
        tenHienThi: `Đơn tài trợ #${idNum}`,
        soTienDk: 0,
        trangThai: 'DADUYET',
      });
      setActualAmount(100000);
      setReceiveNote('Đối soát trực tiếp theo mã tài trợ.');
      setConfirmModalOpen(true);
    }
  };

  const handleConfirmSubmit = async () => {
    if (!actualAmount || Number(actualAmount) < 1000) {
      addToast('Số tiền thực nhận tối thiểu là 1,000 VNĐ', 'warning');
      return;
    }

    const id = selectedDonation.maTaiTro || selectedDonation.id;
    try {
      setSubmitting(true);
      const res = await confirmDonation(id, {
        soTienTt: Number(actualAmount),
        ghiChu: receiveNote,
      });

      const confirmedAmt = res?.soTienTt ?? Number(actualAmount);
      const newCampaignTotal = res?.tongTienDaNhanMoi;
      addToast(
        newCampaignTotal !== undefined
          ? `Xác nhận nhận ${formatCurrency(confirmedAmt)} thành công! Tổng quỹ chiến dịch mới: ${formatCurrency(newCampaignTotal)}`
          : `Đã xác nhận tiếp nhận thành công khoản tài trợ #${id} (${formatCurrency(confirmedAmt)})!`,
        'success'
      );
      setConfirmModalOpen(false);
      setQuickId('');
      fetchList();
      window.dispatchEvent(new CustomEvent('sidebar:refresh-badges'));
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Lỗi khi xác nhận tiếp nhận';
      addToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const registeredAmt = Number(selectedDonation?.soTienDk ?? selectedDonation?.soTienDK ?? selectedDonation?.amount ?? 0);
  const isDifferentAmount = registeredAmt > 0 && Number(actualAmount) !== registeredAmt;

  const columns = [
    {
      key: 'maTaiTro',
      title: 'Mã TT',
      width: '90px',
      render: (val, row) => `#TT${val || row.id}`,
    },
    {
      key: 'tenHienThi',
      title: 'Nhà hảo tâm',
      render: (val, row) => (
        <div>
          <div className="font-semibold text-primary">{val || 'Nhà hảo tâm'}</div>
          <div className="text-muted text-sm">{getCampaignTitle(row)}</div>
        </div>
      ),
    },
    {
      key: 'soTienDk',
      title: 'Số tiền đăng ký',
      width: '150px',
      align: 'right',
      render: (val, row) => {
        const reg = val ?? row.soTienDK ?? row.amount;
        return reg ? (
          <span className="font-semibold text-text">{formatCurrency(reg)}</span>
        ) : (
          <span className="text-muted">—</span>
        );
      },
    },
    {
      key: 'soTienTt',
      title: 'Số tiền thực nhận',
      width: '150px',
      align: 'right',
      render: (val, row) => {
        const st = String(row.trangThai || '').toUpperCase();
        if (st === 'DANHAN' && val !== null && val !== undefined) {
          return <span className="font-bold text-success">{formatCurrency(val)}</span>;
        }
        return <span className="text-muted" style={{ fontStyle: 'italic' }}>Chờ đối soát</span>;
      },
    },
    {
      key: 'ngayGui',
      title: 'Ngày gửi',
      width: '120px',
      render: (val, row) => formatDate(val || row.ngaygui),
    },
    {
      key: 'trangThai',
      title: 'Tình trạng',
      width: '145px',
      render: (val) => {
        const s = String(val || '').toUpperCase();
        const isReceived = s === 'DANHAN' || s === 'HOANTHANH';
        return (
          <span className={`status-tag ${isReceived ? 'tag--received' : 'tag--waiting'}`}>
            {isReceived ? <FiCheckCircle /> : <FiClock />}
            {isReceived ? 'Đã tiếp nhận' : 'Chờ nhận thực tế'}
          </span>
        );
      },
    },
    {
      key: 'actions',
      title: 'Thao tác',
      width: '185px',
      render: (_, row) => {
        const s = String(row.trangThai || '').toUpperCase();
        const isReceived = s === 'DANHAN' || s === 'HOANTHANH';
        return (
          <div className="table-actions">
            {!isReceived ? (
              <Button
                size="sm"
                variant="primary"
                onClick={() => handleOpenConfirm(row)}
              >
                <FiCheckCircle /> Xác nhận đã nhận
              </Button>
            ) : (
              <span className="text-muted text-sm font-semibold">
                Đã vào quỹ: {formatDate(row.ngayNhan || row.ngaynhan)}
              </span>
            )}
          </div>
        );
      },
    },
  ];

  const countReceived = allDonations.filter((d) => String(d.trangThai || '').toUpperCase() === 'DANHAN').length;
  const countWaiting = allDonations.filter((d) => String(d.trangThai || '').toUpperCase() === 'DADUYET').length;

  return (
    <div className="donation-confirm-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Xác Nhận Tiếp Nhận Kinh Phí Tài Trợ</h1>
          <p className="page-subtitle">
            Bước 2: Đối soát sao kê ngân hàng và xác nhận số tiền thực tế đã vào tài khoản quỹ (trạng thái DADUYET → DANHAN).
          </p>
        </div>

        <div className="confirm-filter-tabs">
          <button
            className={`filter-pill ${filterType === 'DADUYET' ? 'active' : ''}`}
            onClick={() => setFilterType('DADUYET')}
          >
            Chờ tiếp nhận thực tế ({countWaiting})
          </button>
          <button
            className={`filter-pill ${filterType === 'DANHAN' ? 'active' : ''}`}
            onClick={() => setFilterType('DANHAN')}
          >
            Đã tiếp nhận vào quỹ ({countReceived})
          </button>
          <button
            className={`filter-pill ${filterType === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilterType('ALL')}
          >
            Tất cả
          </button>
        </div>
      </div>

      {/* Thẻ thống kê nhanh */}
      <div className="stats-row">
        <Card className="stat-card">
          <div className="stat-icon icon-money">
            <FiDollarSign />
          </div>
          <div className="stat-info">
            <span className="stat-label">Tổng đơn đã tiếp nhận</span>
            <span className="stat-value">{countReceived} đơn</span>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-icon icon-waiting">
            <FiClock />
          </div>
          <div className="stat-info">
            <span className="stat-label">Đang chờ nhận thực tế</span>
            <span className="stat-value text-warning">{countWaiting} đơn</span>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-icon icon-money">
            <FiSearch />
          </div>
          <div className="stat-info" style={{ width: '100%' }}>
            <span className="stat-label">Xác nhận nhanh theo Mã TT</span>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '4px' }}>
              <input
                type="number"
                className="input-field"
                style={{ padding: '4px 8px', fontSize: '0.85rem', width: '110px' }}
                placeholder="Mã TT..."
                value={quickId}
                onChange={(e) => setQuickId(e.target.value)}
              />
              <Button size="sm" variant="outline" onClick={handleOpenQuickConfirm}>
                Đối soát
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <Card padding={false}>
        {loading ? (
          <Loading rows={5} type="skeleton" />
        ) : (
          <Table
            columns={columns}
            data={filteredDonations}
            rowKey="maTaiTro"
            emptyTitle="Không có đơn nào cần xử lý"
            emptyDescription={
              filterType === 'DADUYET'
                ? 'Hiện chưa có đơn đã duyệt (DADUYET) nào chờ xác nhận tiền. Bạn có thể duyệt đơn ở mục "Duyệt tài trợ" hoặc nhập Mã TT ở trên.'
                : 'Chưa có dữ liệu tài trợ phù hợp.'
            }
          />
        )}
      </Card>

      {/* Modal Xác nhận tiếp nhận */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title={`Xác nhận tiếp nhận tài trợ #${selectedDonation?.maTaiTro || selectedDonation?.id}`}
        size="md"
        footer={
          <div className="modal-buttons">
            <Button variant="outline" onClick={() => setConfirmModalOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmSubmit}
              loading={submitting}
            >
              <FiCheckCircle /> Xác nhận vào quỹ
            </Button>
          </div>
        }
      >
        {selectedDonation && (
          <div className="confirm-modal-body">
            <div className="confirm-prompt-box">
              <FiInfo />
              <span>
                Khoản tài trợ của <strong>{selectedDonation.tenHienThi}</strong> sẽ được chuyển sang trạng thái <strong>Đã nhận (DANHAN)</strong> và tự động cộng dồn số tiền thực nhận vào quỹ chiến dịch.
              </span>
            </div>

            {registeredAmt > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.85rem', background: '#f8f9fa', borderRadius: '6px', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                <span>Số tiền nhà hảo tâm đã đăng ký:</span>
                <strong>{formatCurrency(registeredAmt)}</strong>
              </div>
            )}

            {isDifferentAmount && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.65rem 0.85rem', background: '#fff3bf', border: '1px solid #ffe066', borderRadius: '6px', color: '#d9480f', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                <FiAlertTriangle style={{ flexShrink: 0 }} />
                <span>
                  Số tiền thực nhận (<strong>{formatCurrency(actualAmount)}</strong>) khác với số tiền đăng ký (<strong>{formatCurrency(registeredAmt)}</strong>). Hệ thống sẽ ghi nhận theo số tiền thực nhận!
                </span>
              </div>
            )}

            {selectedDonation.anhGiaoDich && (
              <div style={{ marginBottom: '1rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiImage /> Biên lai nhà hảo tâm đính kèm:
                </div>
                <img
                  src={selectedDonation.anhGiaoDich}
                  alt="Biên lai đối soát"
                  style={{ maxHeight: '200px', maxWidth: '100%', borderRadius: '4px', display: 'block', margin: '0 auto' }}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/images/minhchungmau.jpg';
                  }}
                />
              </div>
            )}

            <div className="input-row">
              <Input
                type="number"
                label="Số tiền thực tế đã nhận (VNĐ)"
                value={actualAmount}
                onChange={(e) => setActualAmount(Number(e.target.value))}
                helpText="Tối thiểu 1,000 VNĐ. Có thể điều chỉnh nếu số tiền thực nhận khác số tiền đăng ký."
                required
              />
            </div>

            <Input
              type="textarea"
              rows={3}
              label="Ghi chú xác nhận / Mã tham chiếu sao kê"
              value={receiveNote}
              onChange={(e) => setReceiveNote(e.target.value)}
              placeholder="Ví dụ: Mã giao dịch Vietcombank FT234859..."
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DonationConfirm;
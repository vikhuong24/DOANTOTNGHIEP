// Trang Xác nhận tiếp nhận kinh phí tài trợ (Fundraiser) theo ERD mới
// BẢNG TAITRO: maTaiTro, maNguoiDung, maBaiTaiTro, tenHienThi, soTienDK, soTienTT, anhGiaoDich, trangthai, maCanBo, ghichu, ngaygui, ngaynhan
import { useState, useEffect } from 'react';
import { getAllDonations, confirmDonation } from '../../../../services/donationService';
import { getAllCampaigns } from '../../../../services/campaignService';
import Card from '../../../../components/Card/Card';
import Table from '../../../../components/Table/Table';
import Button from '../../../../components/Button/Button';
import Modal from '../../../../components/Modal/Modal';
import Input from '../../../../components/Input/Input';
import Loading from '../../../../components/Loading/Loading';
import { useNotification } from '../../../../components/Notification/Notification';
import { formatDate, formatCurrency } from '../../../../utils/formatters';
import { FiCheckCircle, FiClock, FiDollarSign, FiCheck, FiInfo, FiImage } from 'react-icons/fi';
import './DonationConfirm.css';

const DonationConfirm = () => {
  const { addToast } = useNotification();
  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [filterType, setFilterType] = useState('DaDuyet');

  // Modal xác nhận nhận tiền
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [actualAmount, setActualAmount] = useState(0);
  const [receiveNote, setReceiveNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
      console.error('Lỗi khi tải danh sách tiếp nhận:', err);
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
    if (filterType === 'ALL') return true;
    if (filterType === 'DaDuyet') return d.trangthai === 'DaDuyet';
    if (filterType === 'DaNhan') return d.trangthai === 'DaNhan' || d.trangthai === 'HoanThanh';
    return true;
  });

  const handleOpenConfirm = (row) => {
    setSelectedDonation(row);
    setActualAmount(row.soTienTT || row.soTienDK || row.amount || 0);
    setReceiveNote('Đã nhận đủ qua tài khoản ngân hàng nhà trường Vietcombank.');
    setConfirmModalOpen(true);
  };

  const handleConfirmSubmit = async () => {
    const id = selectedDonation.maTaiTro || selectedDonation.id;
    try {
      setSubmitting(true);
      await confirmDonation(id, actualAmount, receiveNote);
      addToast(
        `Đã xác nhận tiếp nhận thành công khoản tài trợ #${id} với số tiền thực tế ${formatCurrency(
          actualAmount
        )}!`,
        'success'
      );
      setConfirmModalOpen(false);
      fetchList();
    } catch (err) {
      addToast(err.message || 'Lỗi khi xác nhận tiếp nhận', 'error');
    } finally {
      setSubmitting(false);
    }
  };

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
          <div className="text-muted text-sm">{getCampaignTitle(row.maBaiTaiTro)}</div>
        </div>
      ),
    },
    {
      key: 'soTienDK',
      title: 'Số tiền đăng ký',
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
      title: 'Số tiền thực nhận',
      width: '160px',
      align: 'right',
      render: (val) => (
        <span className="font-bold text-success">
          {val !== null && val !== undefined ? formatCurrency(val) : '—'}
        </span>
      ),
    },
    {
      key: 'ngaygui',
      title: 'Ngày duyệt',
      width: '130px',
      render: (val, row) => formatDate(val || row.ngayGui || new Date().toISOString()),
    },
    {
      key: 'trangthai',
      title: 'Tình trạng',
      width: '140px',
      render: (val) => {
        const isReceived = val === 'DaNhan' || val === 'HoanThanh';
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
      width: '180px',
      render: (_, row) => {
        const isReceived = row.trangthai === 'DaNhan' || row.trangthai === 'HoanThanh';
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
                Đã vào quỹ: {formatDate(row.ngaynhan || row.ngayNhan || new Date().toISOString())}
              </span>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="donation-confirm-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Xác Nhận Tiếp Nhận Kinh Phí Tài Trợ</h1>
          <p className="page-subtitle">
            Cập nhật trạng thái sau khi đã nhận được sao kê ngân hàng đối chiếu với biên lai của nhà hảo tâm
          </p>
        </div>

        <div className="confirm-filter-tabs">
          <button
            className={`filter-pill ${filterType === 'DaDuyet' ? 'active' : ''}`}
            onClick={() => setFilterType('DaDuyet')}
          >
            Chờ tiếp nhận thực tế
          </button>
          <button
            className={`filter-pill ${filterType === 'DaNhan' ? 'active' : ''}`}
            onClick={() => setFilterType('DaNhan')}
          >
            Đã tiếp nhận vào quỹ
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
            <span className="stat-value">
              {donations.filter((d) => d.trangthai === 'DaNhan' || d.trangthai === 'HoanThanh').length} đơn
            </span>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-icon icon-waiting">
            <FiClock />
          </div>
          <div className="stat-info">
            <span className="stat-label">Đang chờ nhận thực tế</span>
            <span className="stat-value text-warning">
              {donations.filter((d) => d.trangthai === 'DaDuyet').length} đơn
            </span>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-icon icon-money">
            <FiCheck />
          </div>
          <div className="stat-info">
            <span className="stat-label">Sẵn sàng phân bổ</span>
            <span className="stat-value text-primary">Toàn trường</span>
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
            emptyDescription="Tất cả các khoản đăng ký hiện đã được tiếp nhận hoàn tất."
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
                Khoản tài trợ của <strong>{selectedDonation.tenHienThi}</strong> sẽ được chuyển sang trạng thái <strong>Đã nhận</strong> và ghi nhận số tiền thực tế tiếp nhận vào quỹ chiến dịch.
              </span>
            </div>

            {selectedDonation.anhGiaoDich && (
              <div style={{ marginBottom: '1rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiImage /> Biên lai nhà hảo tâm đính kèm:
                </div>
                <img
                  src={selectedDonation.anhGiaoDich}
                  alt="Biên lai đối soát"
                  style={{ maxHeight: '200px', maxWidth: '100%', borderRadius: '4px', display: 'block', margin: '0 auto' }}
                />
              </div>
            )}

            <div className="input-row">
              <Input
                type="number"
                label="Số tiền thực tế đã nhận (VNĐ)"
                value={actualAmount}
                onChange={(e) => setActualAmount(Number(e.target.value))}
                helpText="Kiểm tra khớp với giao dịch chuyển khoản ngân hàng hoặc phiếu thu tài chính"
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

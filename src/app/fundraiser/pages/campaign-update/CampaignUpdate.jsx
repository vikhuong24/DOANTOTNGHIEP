// Trang Danh sách & Cập nhật bài kêu gọi gây quỹ (Fundraiser) theo ERD mới
// BẢNG TT_TAITRO: maBaiTaiTro, tieude, noidung, anhbia, muctieu, tongtienDaNhan, trangthai, maCanBo, maHieuTruong, ngaybatdau, ngaykethuc
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCampaigns, updateCampaign } from '../../../../services/campaignService';
import Card from '../../../../components/Card/Card';
import Table from '../../../../components/Table/Table';
import Button from '../../../../components/Button/Button';
import Modal from '../../../../components/Modal/Modal';
import Input from '../../../../components/Input/Input';
import Tabs from '../../../../components/Tabs/Tabs';
import Loading from '../../../../components/Loading/Loading';
import ProgressBar from '../../../../components/ProgressBar/ProgressBar';
import { useNotification } from '../../../../components/Notification/Notification';
import { formatDate, formatCurrency } from '../../../../utils/formatters';
import { CAMPAIGN_STATUS_LABELS } from '../../../../utils/constants';
import { FiEdit2, FiExternalLink, FiPlus, FiBarChart2 } from 'react-icons/fi';
import './CampaignUpdate.css';

const TABS = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'DangChay', label: 'Đang chạy' },
  { value: 'ChoDuyet', label: 'Chờ duyệt' },
  { value: 'DaDuyet', label: 'Đã duyệt' },
  { value: 'Nhap', label: 'Bản nháp' },
  { value: 'KetThuc', label: 'Đã kết thúc' },
];

const CampaignUpdate = () => {
  const navigate = useNavigate();
  const { addToast } = useNotification();

  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({
    tieude: '',
    noidung: '',
    anhbia: '',
    muctieu: 50000000,
    ngaybatdau: '',
    ngaykethuc: '',
    trangthai: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchList = async () => {
    try {
      setLoading(true);
      const res = await getCampaigns();
      setCampaigns(res?.data || res || []);
    } catch (err) {
      console.error('Lỗi khi tải danh sách chiến dịch:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const filteredCampaigns = campaigns.filter((c) => {
    if (activeTab === 'ALL') return true;
    return c.trangthai === activeTab;
  });

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setEditForm({
      tieude: item.tieude || item.title || '',
      noidung: item.noidung || item.description || '',
      anhbia: item.anhbia || item.thumbnail || '',
      muctieu: item.muctieu || item.targetAmount || 50000000,
      ngaybatdau: item.ngaybatdau || '',
      ngaykethuc: item.ngaykethuc || '',
      trangthai: item.trangthai || item.status || 'DangChay',
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editForm.tieude.trim()) {
      addToast('Vui lòng nhập tiêu đề chiến dịch', 'warning');
      return;
    }
    if (Number(editForm.muctieu) <= 0) {
      addToast('Số tiền mục tiêu phải lớn hơn 0', 'warning');
      return;
    }

    try {
      setSaving(true);
      const campaignId = editingItem.maBaiTaiTro || editingItem.id;
      await updateCampaign(campaignId, {
        tieude: editForm.tieude,
        noidung: editForm.noidung,
        anhbia: editForm.anhbia,
        muctieu: Number(editForm.muctieu),
        ngaybatdau: editForm.ngaybatdau,
        ngaykethuc: editForm.ngaykethuc,
        trangthai: editForm.trangthai,
      });

      addToast(`Cập nhật chiến dịch #${campaignId} thành công!`, 'success');
      setEditModalOpen(false);
      fetchList();
    } catch (err) {
      addToast(err.message || 'Lỗi khi cập nhật chiến dịch', 'error');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'DangChay':
        return <span className="status-badge badge--active">Đang chạy</span>;
      case 'ChoDuyet':
        return <span className="status-badge badge--pending">Chờ duyệt</span>;
      case 'DaDuyet':
        return <span className="status-badge badge--approved">Đã duyệt</span>;
      case 'KetThuc':
        return <span className="status-badge badge--ended">Đã kết thúc</span>;
      case 'Nhap':
        return <span className="status-badge badge--draft">Bản nháp</span>;
      default:
        return <span className="status-badge">{CAMPAIGN_STATUS_LABELS[st] || st}</span>;
    }
  };

  const columns = [
    {
      key: 'maBaiTaiTro',
      title: 'Mã',
      width: '70px',
      render: (val, row) => `#${val || row.id}`,
    },
    {
      key: 'tieude',
      title: 'Chiến dịch gây quỹ',
      render: (val, row) => (
        <div className="campaign-info-cell">
          <img
            src={row.anhbia || 'https://placehold.co/100x70?text=Camp'}
            alt=""
            className="campaign-mini-thumb"
          />
          <div>
            <div className="campaign-cell-title">{val || row.title}</div>
            <div className="campaign-cell-dates">
              {formatDate(row.ngaybatdau)} - {formatDate(row.ngaykethuc)}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'muctieu',
      title: 'Mục tiêu (VNĐ)',
      width: '150px',
      align: 'right',
      render: (val, row) => (
        <span className="font-semibold text-text">
          {formatCurrency(val || row.targetAmount || 0)}
        </span>
      ),
    },
    {
      key: 'tongtienDaNhan',
      title: 'Đã nhận (VNĐ)',
      width: '150px',
      align: 'right',
      render: (val, row) => (
        <span className="font-bold text-success">
          {formatCurrency(val || row.currentAmount || 0)}
        </span>
      ),
    },
    {
      key: 'progress',
      title: 'Tiến độ',
      width: '160px',
      render: (_, row) => {
        const target = row.muctieu || row.targetAmount || 1;
        const current = row.tongtienDaNhan || row.currentAmount || 0;
        const percent = Math.min(100, Math.round((current / target) * 100));
        return (
          <div className="progress-cell">
            <ProgressBar percent={percent} height={6} showLabel={false} />
            <div className="progress-label-text">{percent}%</div>
          </div>
        );
      },
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
      width: '140px',
      render: (_, row) => (
        <div className="table-actions">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleOpenEdit(row)}
            title="Chỉnh sửa bài"
          >
            <FiEdit2 /> Sửa
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate(`/campaigns/${row.maBaiTaiTro || row.id}`)}
            title="Xem bài công khai"
          >
            <FiExternalLink />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="campaign-update-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản Lý & Cập Nhật Bài Gây Quỹ</h1>
          <p className="page-subtitle">
            Theo dõi tiến trình giải ngân và cập nhật thông tin các chiến dịch gây quỹ trường Nguyễn Đình Chiểu
          </p>
        </div>

        <div className="page-actions">
          <Link to="/fundraiser/campaign-create">
            <Button variant="primary">
              <FiPlus /> Tạo bài gây quỹ mới
            </Button>
          </Link>
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
            data={filteredCampaigns}
            rowKey="maBaiTaiTro"
            emptyTitle="Không tìm thấy chiến dịch nào"
            emptyDescription="Chưa có bài gây quỹ nào phù hợp với bộ lọc này."
          />
        )}
      </Card>

      {/* Modal Chỉnh Sửa Bài */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Cập nhật chiến dịch #${editingItem?.maBaiTaiTro || editingItem?.id}`}
        size="md"
        footer={
          <div className="modal-buttons">
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleSaveEdit} loading={saving}>
              Lưu thay đổi
            </Button>
          </div>
        }
      >
        <div className="edit-form-content">
          <Input
            label="Tiêu đề chiến dịch"
            value={editForm.tieude}
            onChange={(e) => setEditForm({ ...editForm, tieude: e.target.value })}
            required
          />

          <div className="two-cols">
            <Input
              type="number"
              label="Mục tiêu vận động (VNĐ)"
              value={editForm.muctieu}
              onChange={(e) => setEditForm({ ...editForm, muctieu: Number(e.target.value) })}
              required
            />
            <div className="input-wrap">
              <label className="input-label">Trạng thái bài</label>
              <select
                className="input-field"
                value={editForm.trangthai}
                onChange={(e) => setEditForm({ ...editForm, trangthai: e.target.value })}
              >
                <option value="DangChay">Đang chạy</option>
                <option value="ChoDuyet">Chờ duyệt</option>
                <option value="DaDuyet">Đã duyệt</option>
                <option value="KetThuc">Kết thúc</option>
                <option value="Nhap">Bản nháp</option>
              </select>
            </div>
          </div>

          <div className="two-cols">
            <Input
              type="date"
              label="Ngày bắt đầu"
              value={editForm.ngaybatdau}
              onChange={(e) => setEditForm({ ...editForm, ngaybatdau: e.target.value })}
            />
            <Input
              type="date"
              label="Ngày kết thúc"
              value={editForm.ngaykethuc}
              onChange={(e) => setEditForm({ ...editForm, ngaykethuc: e.target.value })}
            />
          </div>

          <Input
            label="Đường dẫn ảnh bìa"
            value={editForm.anhbia}
            onChange={(e) => setEditForm({ ...editForm, anhbia: e.target.value })}
          />

          <Input
            type="textarea"
            rows={5}
            label="Nội dung bài viết"
            value={editForm.noidung}
            onChange={(e) => setEditForm({ ...editForm, noidung: e.target.value })}
          />
        </div>
      </Modal>
    </div>
  );
};

export default CampaignUpdate;

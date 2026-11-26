// Trang Danh sách, Chi tiết & Cập nhật bài kêu gọi gây quỹ (Fundraiser)
// Kết nối trực tiếp API Backend Spring Boot: GET /fundraiser/campaigns, GET /fundraiser/campaigns/{id}, PUT /fundraiser/campaigns/{id}
import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getFundraiserCampaigns,
  getFundraiserCampaignById,
  updateCampaign,
} from '../../../../services/campaignService';
import { uploadImage } from '../../../../services/fileService';
import Card from '../../../../components/Card/Card';
import Table from '../../../../components/Table/Table';
import Button from '../../../../components/Button/Button';
import Modal from '../../../../components/Modal/Modal';
import Input from '../../../../components/Input/Input';
import Tabs from '../../../../components/Tabs/Tabs';
import Loading from '../../../../components/Loading/Loading';
import EmptyState from '../../../../components/EmptyState/EmptyState';
import ProgressBar from '../../../../components/ProgressBar/ProgressBar';
import { useNotification } from '../../../../components/Notification/Notification';
import { formatDate, formatCurrency, formatImageUrl } from '../../../../utils/formatters';
import {
  FiEdit2,
  FiExternalLink,
  FiPlus,
  FiEye,
  FiUpload,
  FiSearch,
  FiCalendar,
  FiUser,
} from 'react-icons/fi';
import './CampaignUpdate.css';

const TABS = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'DADUYET', label: 'Đã duyệt / Đang chạy' },
  { value: 'CHODUYET', label: 'Chờ duyệt' },
  { value: 'NHAP', label: 'Bản nháp' },
  { value: 'TUCHOI', label: 'Từ chối' },
  { value: 'KETTHUC', label: 'Đã kết thúc' },
];

const toDateInputValue = (val) => {
  if (!val) return '';
  const s = String(val);
  return s.includes('T') ? s.split('T')[0] : s.slice(0, 10);
};

const CampaignUpdate = () => {
  const navigate = useNavigate();
  const { addToast } = useNotification();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Detail Modal State (GET /fundraiser/campaigns/{id})
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailItem, setDetailItem] = useState(null);

  // Edit Modal State (PUT /fundraiser/campaigns/{id})
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({
    tieude: '',
    noidung: '',
    anhbia: '',
    muctieu: 50000000,
    ngaybatdau: '',
    ngaykethuc: '',
    trangthai: 'CHODUYET',
  });
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const fetchList = async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await getFundraiserCampaigns();
      setCampaigns(list || []);
    } catch (err) {
      console.error('Lỗi khi tải danh sách chiến dịch cán bộ:', err);
      setError(err?.message || 'Không thể tải danh sách bài đăng gây quỹ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      const status = String(c.trangThai || c.trangthai || '').toUpperCase();
      if (activeTab !== 'ALL' && status !== activeTab) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.trim().toLowerCase();
        const title = String(c.tieuDe || c.tieude || '').toLowerCase();
        const idStr = String(c.maBaiTaiTro || c.id || '');
        if (!title.includes(q) && !idStr.includes(q)) return false;
      }
      return true;
    });
  }, [campaigns, activeTab, searchTerm]);

  const handleOpenDetail = async (item) => {
    const id = item.maBaiTaiTro || item.id;
    setDetailItem(item);
    setDetailModalOpen(true);
    try {
      setDetailLoading(true);
      const fresh = await getFundraiserCampaignById(id);
      if (fresh) setDetailItem(fresh);
    } catch (err) {
      addToast(err?.message || 'Không thể tải chi tiết chiến dịch', 'error');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleOpenEdit = async (item) => {
    const status = String(item.trangThai || item.trangthai || '').toUpperCase();
    if (status === 'KETTHUC') {
      addToast('Chiến dịch đã kết thúc, không được phép chỉnh sửa.', 'warning');
      return;
    }

    const id = item.maBaiTaiTro || item.id;
    setEditingItem(item);
    setEditForm({
      tieude: item.tieuDe || item.tieude || '',
      noidung: item.noiDung || item.noidung || '',
      anhbia: item.anhBia || item.anhbia || '',
      muctieu: item.mucTieu || item.muctieu || 50000000,
      ngaybatdau: toDateInputValue(item.ngayBatDau || item.ngaybatdau),
      ngaykethuc: toDateInputValue(item.ngayKetThuc || item.ngaykethuc),
      trangthai: status || 'CHODUYET',
    });
    setEditModalOpen(true);

    // Đồng bộ dữ liệu mới nhất từ GET /fundraiser/campaigns/{id}
    try {
      const fresh = await getFundraiserCampaignById(id);
      if (fresh) {
        setEditingItem(fresh);
        setEditForm({
          tieude: fresh.tieuDe || fresh.tieude || '',
          noidung: fresh.noiDung || fresh.noidung || '',
          anhbia: fresh.anhBia || fresh.anhbia || '',
          muctieu: fresh.mucTieu || fresh.muctieu || 50000000,
          ngaybatdau: toDateInputValue(fresh.ngayBatDau || fresh.ngaybatdau),
          ngaykethuc: toDateInputValue(fresh.ngayKetThuc || fresh.ngaykethuc),
          trangthai: String(fresh.trangThai || fresh.trangthai || 'CHODUYET').toUpperCase(),
        });
      }
    } catch {
      // Giữ dữ liệu hiện có từ danh sách nếu fetch chi tiết lỗi tạm thời
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      addToast('Kích thước ảnh bìa tối đa 5MB', 'warning');
      return;
    }
    try {
      setUploadingCover(true);
      const uploaded = await uploadImage(file, 'campaigns');
      if (uploaded?.url) {
        setEditForm((prev) => ({ ...prev, anhbia: uploaded.url }));
        addToast('Tải lên ảnh bìa mới thành công!', 'success');
      }
    } catch (err) {
      addToast(
        err?.message || 'Backend chưa hỗ trợ upload trực tiếp, vui lòng dán URL ảnh hoặc đường dẫn /images/...',
        'warning'
      );
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSaveEdit = async () => {
    const titleTrimmed = editForm.tieude.trim();
    if (!titleTrimmed || titleTrimmed.length < 5 || titleTrimmed.length > 255) {
      addToast('Tiêu đề chiến dịch phải từ 5 đến 255 ký tự', 'warning');
      return;
    }
    if (!editForm.noidung.trim()) {
      addToast('Vui lòng nhập nội dung bài viết', 'warning');
      return;
    }
    if (!editForm.muctieu || Number(editForm.muctieu) < 1000) {
      addToast('Số tiền mục tiêu tối thiểu là 1,000 VNĐ', 'warning');
      return;
    }
    if (editForm.ngaybatdau && editForm.ngaykethuc && new Date(editForm.ngaykethuc) < new Date(editForm.ngaybatdau)) {
      addToast('Ngày kết thúc không được nhỏ hơn ngày bắt đầu', 'warning');
      return;
    }

    try {
      setSaving(true);
      const campaignId = editingItem.maBaiTaiTro || editingItem.id;
      await updateCampaign(campaignId, {
        tieuDe: titleTrimmed,
        noiDung: editForm.noidung.trim(),
        anhBia: editForm.anhbia.trim() || undefined,
        mucTieu: Number(editForm.muctieu),
        ngayBatDau: editForm.ngaybatdau || undefined,
        ngayKetThuc: editForm.ngaykethuc || undefined,
        trangThai: editForm.trangthai,
      });

      addToast(`Cập nhật chiến dịch #${campaignId} thành công!`, 'success');
      setEditModalOpen(false);
      fetchList();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Lỗi khi cập nhật chiến dịch';
      addToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (st) => {
    const s = String(st || '').toUpperCase();
    switch (s) {
      case 'DADUYET':
        return <span className="status-badge badge--approved">Đã duyệt / Đang chạy</span>;
      case 'CHODUYET':
        return <span className="status-badge badge--pending">Chờ Hiệu trưởng duyệt</span>;
      case 'KETTHUC':
        return <span className="status-badge badge--ended">Đã kết thúc</span>;
      case 'NHAP':
        return <span className="status-badge badge--draft">Bản nháp</span>;
      case 'TUCHOI':
        return <span className="status-badge badge--danger" style={{ background: '#ffe3e3', color: '#c92a2a' }}>Từ chối</span>;
      default:
        return <span className="status-badge">{s}</span>;
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
      key: 'tieuDe',
      title: 'Chiến dịch gây quỹ',
      render: (val, row) => (
        <div className="campaign-info-cell">
          <img
            src={formatImageUrl(row.anhBia || row.anhbia)}
            alt=""
            className="campaign-mini-thumb"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/images/minhchungmau.jpg';
            }}
          />
          <div>
            <div className="campaign-cell-title">{val || row.tieude}</div>
            <div className="campaign-cell-dates">
              {formatDate(row.ngayBatDau || row.ngaybatdau)} - {formatDate(row.ngayKetThuc || row.ngaykethuc)}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'mucTieu',
      title: 'Mục tiêu (VNĐ)',
      width: '140px',
      align: 'right',
      render: (val, row) => (
        <span className="font-semibold text-text">
          {formatCurrency(val ?? row.muctieu ?? 0)}
        </span>
      ),
    },
    {
      key: 'tongTienDaNhan',
      title: 'Đã nhận (VNĐ)',
      width: '140px',
      align: 'right',
      render: (val, row) => (
        <span className="font-bold text-success">
          {formatCurrency(val ?? row.tongtienDaNhan ?? 0)}
        </span>
      ),
    },
    {
      key: 'progress',
      title: 'Tiến độ',
      width: '140px',
      render: (_, row) => {
        const target = Number(row.mucTieu ?? row.muctieu ?? 1);
        const current = Number(row.tongTienDaNhan ?? row.tongtienDaNhan ?? 0);
        const percent = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
        return (
          <div className="progress-cell">
            <ProgressBar percent={percent} height={6} showLabel={false} />
            <div className="progress-label-text">{percent}%</div>
          </div>
        );
      },
    },
    {
      key: 'trangThai',
      title: 'Trạng thái',
      width: '165px',
      render: (val, row) => getStatusBadge(val || row.trangthai),
    },
    {
      key: 'actions',
      title: 'Thao tác',
      width: '185px',
      render: (_, row) => {
        const status = String(row.trangThai || row.trangthai || '').toUpperCase();
        const isPublic = status === 'DADUYET' || status === 'KETTHUC';
        const isEnded = status === 'KETTHUC';
        return (
          <div className="table-actions">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleOpenDetail(row)}
              title="Xem chi tiết bài đăng"
            >
              <FiEye />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleOpenEdit(row)}
              disabled={isEnded}
              title={isEnded ? 'Chiến dịch đã kết thúc không thể sửa' : 'Chỉnh sửa bài'}
            >
              <FiEdit2 /> Sửa
            </Button>
            {isPublic && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate(`/campaigns/${row.maBaiTaiTro || row.id}`)}
                title="Xem trang công khai"
              >
                <FiExternalLink />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="campaign-update-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản Lý & Cập Nhật Bài Gây Quỹ</h1>
          <p className="page-subtitle">
            Theo dõi trạng thái phê duyệt từ Ban Giám Hiệu, tiến độ quyên góp và cập nhật thông tin các chiến dịch do bạn phụ trách
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

      <div className="tabs-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />
        <div style={{ position: 'relative', minWidth: '250px' }}>
          <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
          <input
            type="text"
            className="input-field"
            style={{ paddingLeft: '36px' }}
            placeholder="Tìm theo tên hoặc mã bài..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card padding={false}>
        {loading ? (
          <Loading rows={5} type="skeleton" />
        ) : error ? (
          <div style={{ padding: '2rem' }}>
            <EmptyState
              title="Lỗi tải danh sách chiến dịch"
              description={error}
              actionLabel="Thử lại"
              onAction={fetchList}
            />
          </div>
        ) : (
          <Table
            columns={columns}
            data={filteredCampaigns}
            rowKey="maBaiTaiTro"
            emptyTitle="Không tìm thấy chiến dịch nào"
            emptyDescription="Chưa có bài gây quỹ nào do bạn tạo phù hợp với bộ lọc hiện tại."
          />
        )}
      </Card>

      {/* Modal Xem Chi Tiết Bài Đăng (GET /fundraiser/campaigns/{id}) */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={`Chi tiết bài gây quỹ #${detailItem?.maBaiTaiTro || detailItem?.id || ''}`}
        size="lg"
        footer={
          <div className="modal-buttons">
            {detailItem && String(detailItem.trangThai).toUpperCase() !== 'KETTHUC' && (
              <Button
                variant="primary"
                onClick={() => {
                  setDetailModalOpen(false);
                  handleOpenEdit(detailItem);
                }}
              >
                <FiEdit2 /> Chỉnh sửa bài này
              </Button>
            )}
            <Button variant="outline" onClick={() => setDetailModalOpen(false)}>
              Đóng
            </Button>
          </div>
        }
      >
        {detailLoading && !detailItem ? (
          <Loading text="Đang tải chi tiết chiến dịch..." />
        ) : detailItem && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <img
                src={formatImageUrl(detailItem.anhBia || detailItem.anhbia)}
                alt={detailItem.tieuDe}
                style={{ width: '200px', height: '130px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e9ecef' }}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/images/minhchungmau.jpg';
                }}
              />
              <div style={{ flex: 1, minWidth: '240px' }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  {getStatusBadge(detailItem.trangThai || detailItem.trangthai)}
                </div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.15rem' }}>{detailItem.tieuDe || detailItem.tieude}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.9rem', color: '#555' }}>
                  <div>
                    <FiUser style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                    Cán bộ phụ trách: <strong>{detailItem.tenCanBo || 'Cán bộ gây quỹ'}</strong>
                  </div>
                  <div>
                    <FiCalendar style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                    Thời gian: <strong>{formatDate(detailItem.ngayBatDau)}</strong> đến <strong>{formatDate(detailItem.ngayKetThuc)}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#f8f9fa', padding: '0.85rem 1rem', borderRadius: '8px' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>Mục tiêu vận động</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{formatCurrency(detailItem.mucTieu || 0)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>Đã tiếp nhận thực tế</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--success)' }}>
                  {formatCurrency(detailItem.tongTienDaNhan || 0)}
                </div>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.4rem' }}>Nội dung kêu gọi chi tiết:</h4>
              <p style={{ whiteSpace: 'pre-line', color: '#333', lineHeight: 1.6, margin: 0 }}>
                {detailItem.noiDung || detailItem.noidung}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Chỉnh Sửa Bài (PUT /fundraiser/campaigns/{id}) */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Cập nhật chiến dịch #${editingItem?.maBaiTaiTro || editingItem?.id || ''}`}
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
            helpText="Từ 5 đến 255 ký tự"
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
              <label className="input-label">Trạng thái bài đăng</label>
              <select
                className="input-field"
                value={editForm.trangthai}
                onChange={(e) => setEditForm({ ...editForm, trangthai: e.target.value })}
              >
                <option value="NHAP">Bản nháp (NHAP)</option>
                <option value="CHODUYET">Gửi chờ Hiệu trưởng duyệt (CHODUYET)</option>
                {editForm.trangthai === 'DADUYET' && (
                  <option value="DADUYET">Đã duyệt / Đang chạy (DADUYET)</option>
                )}
                {editForm.trangthai === 'TUCHOI' && (
                  <option value="TUCHOI">Bị từ chối (TUCHOI)</option>
                )}
                <option value="KETTHUC">Đánh dấu kết thúc (KETTHUC)</option>
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

          <div className="input-wrap">
            <label className="input-label">Ảnh bìa chiến dịch</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label
                className="btn btn--outline btn--sm"
                style={{ cursor: uploadingCover ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <FiUpload /> {uploadingCover ? 'Đang tải lên...' : 'Chọn ảnh mới từ máy'}
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleCoverUpload}
                  disabled={uploadingCover}
                  style={{ display: 'none' }}
                />
              </label>
              {editForm.anhbia && (
                <img
                  src={formatImageUrl(editForm.anhbia)}
                  alt="Preview"
                  style={{ height: '36px', width: '54px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/images/minhchungmau.jpg';
                  }}
                />
              )}
            </div>
            <Input
              value={editForm.anhbia}
              onChange={(e) => setEditForm({ ...editForm, anhbia: e.target.value })}
              placeholder="https://... hoặc /images/... hoặc /uploads/..."
            />
          </div>

          <Input
            type="textarea"
            rows={5}
            label="Nội dung bài viết"
            value={editForm.noidung}
            onChange={(e) => setEditForm({ ...editForm, noidung: e.target.value })}
            required
          />
        </div>
      </Modal>
    </div>
  );
};

export default CampaignUpdate;
// Hộp thư phản hồi từ Nhà hảo tâm (Fundraiser)
import { useState, useEffect, useCallback } from 'react';
import {
  getFundraiserFeedbacks,
  getFundraiserFeedbackDetail,
  replyFeedback,
} from '../../../../services/feedbackService';
import Card from '../../../../components/Card/Card';
import Table from '../../../../components/Table/Table';
import Button from '../../../../components/Button/Button';
import Modal from '../../../../components/Modal/Modal';
import Input from '../../../../components/Input/Input';
import Tabs from '../../../../components/Tabs/Tabs';
import Loading from '../../../../components/Loading/Loading';
import { useNotification } from '../../../../components/Notification/Notification';
import { formatDate } from '../../../../utils/formatters';
import { FiHeart, FiCornerDownRight, FiCheckCircle, FiClock, FiSend, FiXCircle } from 'react-icons/fi';
import './DonorFeedback.css';

const TABS = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'CHOXULY', label: 'Chờ giải đáp' },
  { value: 'DAXULY', label: 'Đã xử lý' },
  { value: 'TUCHOI', label: 'Từ chối' },
];

const DonorFeedback = () => {
  const { addToast } = useNotification();
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');

  // Modal Trả lời & Chi tiết
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchFeedbacks = useCallback(async () => {
    try {
      setLoading(true);
      const list = await getFundraiserFeedbacks(activeTab === 'ALL' ? undefined : activeTab);
      const donorList = (Array.isArray(list) ? list : []).filter((f) => {
        const role = f.loaiNguoiDung || f.userRole;
        if (!role) return true;
        return role === 'NHT' || role === 'donor';
      });
      setFeedbacks(donorList);
    } catch (err) {
      console.error('Lỗi khi tải phản hồi nhà hảo tâm:', err);
      addToast(err?.response?.data?.message || err?.message || 'Không thể tải danh sách phản hồi', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeTab, addToast]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const filteredList = feedbacks;

  const handleOpenReply = async (item) => {
    setSelectedItem(item);
    setReplyText(item.noiDungTraLoi || item.traLoi || '');
    setReplyModalOpen(true);
    const id = item.maPhanHoi || item.id;
    try {
      const detail = await getFundraiserFeedbackDetail(id);
      if (detail) {
        setSelectedItem(detail);
        setReplyText(detail.noiDungTraLoi || detail.traLoi || '');
      }
    } catch {
      // Giữ dữ liệu hàng hiện tại nếu gọi detail lỗi
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      addToast('Vui lòng nhập nội dung thư phản hồi đến nhà hảo tâm', 'warning');
      return;
    }

    const id = selectedItem.maPhanHoi || selectedItem.id;
    try {
      setSubmitting(true);
      await replyFeedback(id, replyText.trim());
      addToast('Đã gửi thư phản hồi thành công!', 'success');
      setReplyModalOpen(false);
      fetchFeedbacks();
      window.dispatchEvent(new CustomEvent('sidebar:refresh-badges'));
    } catch (err) {
      addToast(err?.response?.data?.message || err?.message || 'Lỗi khi gửi phản hồi', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'maPhanHoi',
      title: 'Mã thư',
      width: '80px',
      render: (val, row) => `#NHT${val || row.id}`,
    },
    {
      key: 'tenNguoiGui',
      title: 'Nhà hảo tâm',
      width: '200px',
      render: (val, row) => (
        <div>
          <div className="font-semibold text-primary">{val || 'Nhà hảo tâm'}</div>
          <div className="text-muted text-sm">{formatDate(row.ngayGui)}</div>
        </div>
      ),
    },
    {
      key: 'noiDung',
      title: 'Nội dung thư thắc mắc / đóng góp',
      render: (_, row) => (
        <div className="feedback-content-cell">
          <div className="feedback-title-text">{row.tieuDe || 'Thư gửi ban quản lý'}</div>
          <p className="feedback-body-text">{row.noiDung}</p>
          {row.noiDungTraLoi && (
            <div className="reply-preview-box">
              <FiCornerDownRight />
              <span>
                <strong>Thư hồi đáp: </strong> {row.noiDungTraLoi}
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'trangThai',
      title: 'Trạng thái',
      width: '140px',
      render: (_, row) => {
        const st = String(row.trangThai || '').toUpperCase();
        if (st === 'TUCHOI') {
          return (
            <span className="badge-reply badge-rejected">
              <FiXCircle /> Từ chối
            </span>
          );
        }
        const isAnswered = st === 'DAXULY' || !!row.noiDungTraLoi;
        return (
          <span className={`badge-reply ${isAnswered ? 'badge-replied' : 'badge-waiting'}`}>
            {isAnswered ? <FiCheckCircle /> : <FiClock />}
            {isAnswered ? 'Đã xử lý' : 'Chờ giải đáp'}
          </span>
        );
      },
    },
    {
      key: 'actions',
      title: 'Thao tác',
      width: '140px',
      render: (_, row) => (
        <Button
          size="sm"
          variant={row.noiDungTraLoi ? 'outline' : 'primary'}
          onClick={() => handleOpenReply(row)}
        >
          {row.noiDungTraLoi ? 'Xem / Sửa' : 'Hồi đáp'}
        </Button>
      ),
    },
  ];

  return (
    <div className="donor-feedback-manage-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Hộp Thư Phản Hồi Từ Nhà Hảo Tâm</h1>
          <p className="page-subtitle">
            Tiếp nhận tâm thư, câu hỏi về tiến độ dự án tài trợ và giải đáp thắc mắc cho các tổ chức, cá nhân thiện nguyện
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
            data={filteredList}
            rowKey="maPhanHoi"
            emptyTitle="Không có thư phản hồi nào"
            emptyDescription="Chưa có thông điệp nào từ nhà hảo tâm trong danh mục này."
          />
        )}
      </Card>

      {/* Modal Hồi đáp Nhà hảo tâm */}
      <Modal
        isOpen={replyModalOpen}
        onClose={() => setReplyModalOpen(false)}
        title={`Hồi đáp thư #${selectedItem?.maPhanHoi || selectedItem?.id}`}
        size="md"
        footer={
          <div className="modal-buttons">
            <Button variant="outline" onClick={() => setReplyModalOpen(false)}>
              Đóng
            </Button>
            <Button
              variant="primary"
              onClick={handleSendReply}
              loading={submitting}
            >
              <FiSend /> Gửi thư tri ân & hồi đáp
            </Button>
          </div>
        }
      >
        {selectedItem && (
          <div className="reply-dialog-body">
            <div className="original-message-card">
              <div className="orig-sender">
                <FiHeart className="text-accent" /> Từ: <strong>{selectedItem.tenNguoiGui}</strong>
                {selectedItem.emailNguoiGui && ` (${selectedItem.emailNguoiGui})`}
                {selectedItem.sdtNguoiGui && ` • ${selectedItem.sdtNguoiGui}`}
              </div>
              {(selectedItem.tieuDeBaiTaiTro || selectedItem.tenDotPhanBo) && (
                <div className="text-sm text-muted" style={{ marginBottom: 6 }}>
                  {selectedItem.tieuDeBaiTaiTro && <span>Chiến dịch: <strong>{selectedItem.tieuDeBaiTaiTro}</strong></span>}
                  {selectedItem.tieuDeBaiTaiTro && selectedItem.tenDotPhanBo && ' • '}
                  {selectedItem.tenDotPhanBo && <span>Đợt phân bổ: <strong>{selectedItem.tenDotPhanBo}</strong></span>}
                </div>
              )}
              <div className="orig-title">{selectedItem.tieuDe}</div>
              <p className="orig-text">{selectedItem.noiDung}</p>
              {selectedItem.tenCanBo && (
                <div className="text-sm text-muted" style={{ marginTop: 8 }}>
                  Cán bộ xử lý: <strong>{selectedItem.tenCanBo}</strong>
                  {selectedItem.ngayTraLoi && ` • ${formatDate(selectedItem.ngayTraLoi)}`}
                </div>
              )}
            </div>

            <Input
              type="textarea"
              rows={5}
              label="Nội dung thư hồi đáp từ Ban Quản lý gây quỹ"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Gửi lời tri ân chân thành, cập nhật tiến độ trao quà hoặc thông tin biên lai chứng từ..."
              required
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DonorFeedback;

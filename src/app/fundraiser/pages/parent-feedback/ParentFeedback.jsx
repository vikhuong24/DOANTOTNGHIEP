// Hộp thư phản hồi từ Phụ huynh học sinh (Fundraiser)
import { useState, useEffect } from 'react';
import { getFeedbacks, replyFeedback } from '../../../../services/feedbackService';
import Card from '../../../../components/Card/Card';
import Table from '../../../../components/Table/Table';
import Button from '../../../../components/Button/Button';
import Modal from '../../../../components/Modal/Modal';
import Input from '../../../../components/Input/Input';
import Tabs from '../../../../components/Tabs/Tabs';
import Loading from '../../../../components/Loading/Loading';
import { useNotification } from '../../../../components/Notification/Notification';
import { formatDate } from '../../../../utils/formatters';
import { FiCornerDownRight, FiCheckCircle, FiClock, FiSend } from 'react-icons/fi';
import './ParentFeedback.css';

const TABS = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'ChoXuLy', label: 'Chờ giải quyết' },
  { value: 'DaGiaiQuyet', label: 'Đã phản hồi' },
];

const ParentFeedback = () => {
  const { addToast } = useNotification();
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');

  // Modal Trả lời
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const res = await getFeedbacks();
      const list = res?.data || res || [];
      // Lọc các phản hồi từ Phụ huynh
      const parentList = list.filter(
        (f) => f.loaiNguoiDung === 'PH' || f.userRole === 'parent' || f.userRole === 'PH'
      );
      setFeedbacks(parentList);
    } catch (err) {
      console.error('Lỗi khi tải phản hồi phụ huynh:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const filteredList = feedbacks.filter((item) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'ChoXuLy') return item.trangThai === 'ChoXuLy' || !item.traLoi;
    if (activeTab === 'DaGiaiQuyet') return item.trangThai === 'DaGiaiQuyet' || !!item.traLoi;
    return true;
  });

  const handleOpenReply = (item) => {
    setSelectedItem(item);
    setReplyText(item.traLoi || '');
    setReplyModalOpen(true);
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      addToast('Vui lòng nhập nội dung phản hồi phụ huynh', 'warning');
      return;
    }

    const id = selectedItem.maPhanHoi || selectedItem.id;
    try {
      setSubmitting(true);
      await replyFeedback(id, replyText);
      addToast(`Đã gửi câu trả lời đến phụ huynh thành công!`, 'success');
      setReplyModalOpen(false);
      fetchFeedbacks();
    } catch (err) {
      addToast(err.message || 'Lỗi khi gửi phản hồi', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'maPhanHoi',
      title: 'Mã PH',
      width: '80px',
      render: (val, row) => `#PH${val || row.id}`,
    },
    {
      key: 'tenNguoiGui',
      title: 'Phụ huynh gửi',
      width: '180px',
      render: (val, row) => (
        <div>
          <div className="font-semibold text-primary">{val || 'Phụ huynh'}</div>
          <div className="text-muted text-sm">{formatDate(row.ngayGui)}</div>
        </div>
      ),
    },
    {
      key: 'noiDung',
      title: 'Nội dung phản ánh',
      render: (_, row) => (
        <div className="feedback-content-cell">
          <div className="feedback-title-text">{row.tieuDe || 'Báo cáo sai lệch hỗ trợ'}</div>
          <p className="feedback-body-text">{row.noiDung}</p>
          {row.traLoi && (
            <div className="reply-preview-box">
              <FiCornerDownRight />
              <span>
                <strong>Đã trả lời: </strong> {row.traLoi}
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
        const isAnswered = !!row.traLoi || row.trangThai === 'DaGiaiQuyet';
        return (
          <span className={`badge-reply ${isAnswered ? 'badge-replied' : 'badge-waiting'}`}>
            {isAnswered ? <FiCheckCircle /> : <FiClock />}
            {isAnswered ? 'Đã giải quyết' : 'Chờ xử lý'}
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
          variant={row.traLoi ? 'outline' : 'primary'}
          onClick={() => handleOpenReply(row)}
        >
          {row.traLoi ? 'Xem / Sửa' : 'Trả lời'}
        </Button>
      ),
    },
  ];

  return (
    <div className="parent-feedback-manage-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Hộp Thư Phản Hồi Từ Phụ Huynh</h1>
          <p className="page-subtitle">
            Tiếp nhận, kiểm tra xác minh và giải đáp các phản ánh sai lệch về tiền học bổng, đồ dùng học tập
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
            emptyTitle="Không có phản hồi nào"
            emptyDescription="Chưa có phản ánh nào từ phụ huynh trong mục đã chọn."
          />
        )}
      </Card>

      {/* Modal Trả lời Phụ huynh */}
      <Modal
        isOpen={replyModalOpen}
        onClose={() => setReplyModalOpen(false)}
        title={`Giải đáp phản ánh #${selectedItem?.maPhanHoi || selectedItem?.id}`}
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
              <FiSend /> Gửi phúc đáp cho Phụ huynh
            </Button>
          </div>
        }
      >
        {selectedItem && (
          <div className="reply-dialog-body">
            <div className="original-message-card">
              <div className="orig-sender">
                Từ phụ huynh: <strong>{selectedItem.tenNguoiGui}</strong>
              </div>
              <div className="orig-title">{selectedItem.tieuDe}</div>
              <p className="orig-text">{selectedItem.noiDung}</p>
            </div>

            <Input
              type="textarea"
              rows={5}
              label="Nội dung phúc đáp từ Cán bộ quản lý gây quỹ"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Giải thích chi tiết về việc rà soát hồ sơ, thời gian chi trả bổ sung hoặc hướng dẫn liên hệ trực tiếp văn phòng trường..."
              required
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ParentFeedback;

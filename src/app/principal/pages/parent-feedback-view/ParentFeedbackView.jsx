import { useState, useEffect } from 'react';
import { FiEye } from 'react-icons/fi';
import Tabs from '../../../../components/Tabs/Tabs';
import Table from '../../../../components/Table/Table';
import Modal from '../../../../components/Modal/Modal';
import { getPrincipalFeedbacks, getPrincipalFeedbackDetail } from '../../../../services/feedbackService';
import './ParentFeedbackView.css';

const TABS = [
  { label: 'Chờ xử lý', value: 'CHOXULY' },
  { label: 'Đã xử lý', value: 'DAXULY' },
  { label: 'Từ chối', value: 'TUCHOI' },
  { label: 'Tất cả', value: 'ALL' },
];

const ParentFeedbackView = () => {
  const [activeTab, setActiveTab] = useState('ALL');
  const [feedbacks, setFeedbacks] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getPrincipalFeedbacks();
        setFeedbacks(data || []);
      } catch (err) {
        console.error('Lỗi khi tải phản hồi:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleViewDetail = async (row) => {
    setSelected(row);
    try {
      const detail = await getPrincipalFeedbackDetail(row.maPhanHoi || row.id);
      if (detail) setSelected(detail);
    } catch {
      // Giữ dữ liệu hàng hiện tại nếu detail lỗi
    }
  };

  const filtered = activeTab === 'ALL'
    ? feedbacks
    : feedbacks.filter((f) => String(f.trangThai || f.trangthai || '').toUpperCase() === activeTab);

  const pendingCount = feedbacks.filter(
    (f) => String(f.trangThai || f.trangthai || '').toUpperCase() === 'CHOXULY'
  ).length;

  const tabs = TABS.map((t) =>
    t.value === 'CHOXULY' ? { ...t, badge: pendingCount || undefined } : t
  );

  const dataWithStt = filtered.map((f, i) => ({ ...f, _stt: i + 1 }));

  const columns = [
    { key: '_stt', title: 'STT', width: 56 },
    { key: 'phuHuynh', title: 'Người gửi', render: (_, row) => row.tenNguoiGui || `Phụ huynh #${row.manguoidung || ''}` },
    { key: 'baiTaiTro', title: 'Chiến dịch / Dự án', render: (_, row) => <span className="pfv-camp">{row.tieuDeBaiTaiTro || 'Chung'}</span> },
    { key: 'tieude', title: 'Tiêu đề', render: (_, row) => <span className="pfv-title">{row.tieude}</span> },
    { key: 'ngaygui', title: 'Ngày gửi', render: (_, row) => (row.ngaygui ? String(row.ngaygui).split('T')[0] : '—') },
    {
      key: 'trangthai', title: 'Trạng thái', render: (_, row) => {
        const isDone = String(row.trangthai).toUpperCase() === 'DAXULY';
        return (
          <span className={`pfv-badge ${isDone ? 'pfv-badge--done' : 'pfv-badge--pending'}`}>
            {isDone ? 'Đã xử lý' : 'Chờ xử lý'}
          </span>
        );
      },
    },
    {
      key: 'action', title: '',
      render: (_, row) => (
        <button className="pfv-btn" onClick={() => handleViewDetail(row)}>
          <FiEye /> Xem
        </button>
      ),
    },
  ];

  return (
    <div className="parent-feedback-view">
      <div className="pfv-header">
        <h1>Phản hồi của Phụ huynh & Nhà tài trợ</h1>
        <p>Giám sát toàn bộ ý kiến đóng góp, thắc mắc và câu trả lời từ cán bộ quản lý gây quỹ</p>
      </div>

      <div className="pfv-card">
        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
        <Table
          columns={columns}
          data={dataWithStt}
          loading={loading}
          rowKey="id"
          emptyTitle="Không có phản hồi"
          emptyDescription="Chưa có ý kiến phản hồi nào trong danh sách này."
        />
      </div>

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Chi tiết phản hồi"
        size="md"
      >
        {selected && (
          <div className="pfv-detail">
            <div className="pfv-detail__meta">
              <span><strong>Người gửi:</strong> {selected.tenNguoiGui || `Người dùng #${selected.manguoidung}`}</span>
              <span><strong>Ngày gửi:</strong> {selected.ngaygui ? String(selected.ngaygui).split('T')[0] : '—'}</span>
              {selected.tieuDeBaiTaiTro && <span><strong>Chiến dịch liên quan:</strong> {selected.tieuDeBaiTaiTro}</span>}
              <span>
                <strong>Trạng thái:</strong>{' '}
                <span className={`pfv-badge ${String(selected.trangthai).toUpperCase() === 'DAXULY' ? 'pfv-badge--done' : 'pfv-badge--pending'}`}>
                  {String(selected.trangthai).toUpperCase() === 'DAXULY' ? 'Đã xử lý' : 'Chờ xử lý'}
                </span>
              </span>
            </div>
            <div className="pfv-detail__section">
              <strong>Tiêu đề:</strong>
              <p>{selected.tieude}</p>
            </div>
            <div className="pfv-detail__section">
              <strong>Nội dung phản hồi:</strong>
              <p>{selected.noidung}</p>
            </div>
            {selected.noidungtraloi ? (
              <div className="pfv-detail__reply">
                <strong>Phản hồi của cán bộ ({selected.tenCanBoTraLoi || 'Cán bộ điều phối'}):</strong>
                <p>{selected.noidungtraloi}</p>
                {selected.ngaytraloi && <small>Ngày trả lời: {String(selected.ngaytraloi).split('T')[0]}</small>}
              </div>
            ) : (
              <div className="pfv-detail__no-reply">
                Chưa có phản hồi từ cán bộ phụ trách.
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ParentFeedbackView;

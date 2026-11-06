import { useState, useEffect } from 'react';
import { FiEye } from 'react-icons/fi';
import Table from '../../../../components/Table/Table';
import Modal from '../../../../components/Modal/Modal';
import { getPrincipalFeedbacks } from '../../../../services/feedbackService';
import './StaffResponseView.css';

const StaffResponseView = () => {
  const [responses, setResponses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getPrincipalFeedbacks();
        // Lọc các phản hồi đã có nội dung trả lời từ cán bộ
        const answered = (data || []).filter(
          (f) => !!f.noidungtraloi || String(f.trangthai).toUpperCase() === 'DAXULY'
        );
        setResponses(answered);
      } catch (err) {
        console.error('Lỗi khi tải phản hồi của cán bộ:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const dataWithStt = responses.map((r, i) => ({ ...r, _stt: i + 1 }));

  const columns = [
    { key: '_stt', title: 'STT', width: 56 },
    { key: 'sender', title: 'Người gửi phản hồi', render: (_, row) => row.tenNguoiGui || `Người dùng #${row.manguoidung}` },
    { key: 'campaign', title: 'Chiến dịch', render: (_, row) => <span className="srv-camp">{row.tieuDeBaiTaiTro || 'Chung'}</span> },
    { key: 'staff', title: 'Cán bộ trả lời', render: (_, row) => <span className="srv-staff">{row.tenCanBoTraLoi || `Cán bộ #${row.macanbo || ''}`}</span> },
    { key: 'reply', title: 'Nội dung trả lời', render: (_, row) => <span className="srv-reply-preview">{row.noidungtraloi?.slice(0, 80) || '—'}...</span> },
    { key: 'ngaytraloi', title: 'Ngày trả lời', render: (_, row) => (row.ngaytraloi ? String(row.ngaytraloi).split('T')[0] : '—') },
    {
      key: 'action', title: '',
      render: (_, row) => (
        <button className="srv-btn" onClick={() => setSelected(row)}>
          <FiEye /> Xem
        </button>
      ),
    },
  ];

  return (
    <div className="staff-response-view">
      <div className="srv-header">
        <h1>Phản hồi của Cán bộ gây quỹ</h1>
        <p>Danh sách các câu trả lời và giải đáp thắc mắc từ cán bộ (chế độ giám sát chỉ xem)</p>
      </div>

      <div className="srv-card">
        <Table
          columns={columns}
          data={dataWithStt}
          loading={loading}
          rowKey="id"
          emptyTitle="Chưa có dữ liệu phản hồi"
          emptyDescription="Chưa có câu trả lời nào từ cán bộ được ghi nhận."
        />
      </div>

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Chi tiết câu trả lời của cán bộ"
        size="md"
      >
        {selected && (
          <div className="srv-detail">
            <div className="srv-detail__meta">
              <span><strong>Người gửi:</strong> {selected.tenNguoiGui || `Người dùng #${selected.manguoidung}`}</span>
              <span><strong>Cán bộ trả lời:</strong> {selected.tenCanBoTraLoi || `Cán bộ #${selected.macanbo || ''}`}</span>
              <span><strong>Ngày gửi:</strong> {selected.ngaygui ? String(selected.ngaygui).split('T')[0] : '—'}</span>
              <span><strong>Ngày trả lời:</strong> {selected.ngaytraloi ? String(selected.ngaytraloi).split('T')[0] : '—'}</span>
              {selected.tieuDeBaiTaiTro && <span><strong>Chiến dịch:</strong> {selected.tieuDeBaiTaiTro}</span>}
            </div>
            <div className="srv-detail__section">
              <strong>Tiêu đề:</strong>
              <p>{selected.tieude}</p>
            </div>
            <div className="srv-detail__section">
              <strong>Nội dung phản hồi gốc:</strong>
              <p>{selected.noidung}</p>
            </div>
            <div className="srv-detail__reply">
              <strong>Nội dung trả lời của cán bộ:</strong>
              <p>{selected.noidungtraloi || 'Chưa cập nhật nội dung'}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StaffResponseView;

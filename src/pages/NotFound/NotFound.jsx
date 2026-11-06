import { Link } from 'react-router-dom';
import { FiAlertTriangle, FiHome, FiArrowLeft } from 'react-icons/fi';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="notfound-page">
      <div className="notfound-content">
        <div className="notfound-icon">
          <FiAlertTriangle />
        </div>
        <h1 className="notfound-code">404</h1>
        <h2 className="notfound-title">Không Tìm Thấy Trang</h2>
        <p className="notfound-desc">
          Đường dẫn bạn yêu cầu không tồn tại, đã bị xóa hoặc tạm thời không khả dụng trên hệ thống trường Nguyễn Đình Chiểu.
        </p>
        <div className="notfound-actions">
          <button className="btn btn--outline btn--md" onClick={() => window.history.back()}>
            <FiArrowLeft /> Quay lại trang trước
          </button>
          <Link to="/campaigns" className="btn btn--primary btn--md">
            <FiHome /> Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

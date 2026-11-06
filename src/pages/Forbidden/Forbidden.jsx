import { Link } from 'react-router-dom';
import { FiSlash, FiHome, FiArrowLeft } from 'react-icons/fi';
import './Forbidden.css';

const Forbidden = () => {
  return (
    <div className="forbidden-page">
      <div className="forbidden-content">
        <div className="forbidden-icon">
          <FiSlash />
        </div>
        <h1 className="forbidden-code">403</h1>
        <h2 className="forbidden-title">Truy Cập Bị Từ Chối</h2>
        <p className="forbidden-desc">
          Tài khoản của bạn không có đủ quyền hạn để truy cập vào phân hệ này.
          Vui lòng kiểm tra lại vai trò của tài khoản hoặc liên hệ quản trị viên trường Nguyễn Đình Chiểu.
        </p>
        <div className="forbidden-actions">
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

export default Forbidden;

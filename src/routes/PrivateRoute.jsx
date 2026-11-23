// PrivateRoute: Bảo vệ route theo vai trò người dùng, chuyển hướng an toàn nếu chưa đăng nhập hoặc không đủ quyền
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loading from '../components/Loading/Loading';

/**
 * PrivateRoute bảo vệ các route yêu cầu xác thực và phân quyền
 * @param {React.ReactNode} children
 * @param {string[]} allowedRoles - Danh sách vai trò được phép truy cập
 */
const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, hasRole, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading fullScreen />;
  }

  // 1. Chưa đăng nhập: chuyển hướng sang trang /login, lưu lại trang đích để chuyển về sau khi login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Đã đăng nhập nhưng không đủ quyền: chuyển hướng sang trang 403 Forbidden
  if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    return <Navigate to="/403" replace />;
  }

  return children;
};

export default PrivateRoute;

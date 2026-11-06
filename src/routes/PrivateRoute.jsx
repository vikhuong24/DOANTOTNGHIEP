// PrivateRoute: Bảo vệ route theo role, redirect nếu không có quyền
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loading from '../components/Loading/Loading';

/**
 * PrivateRoute bảo vệ các route yêu cầu xác thực và role cụ thể
 * @param {React.ReactNode} children
 * @param {string[]} allowedRoles - Danh sách role được phép truy cập
 */
const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, role, roleCode, hasRole, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!isAuthenticated) {
    // Điều hướng an toàn sang trang đăng nhập, kèm state để sau khi login quay lại
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Kiểm tra quyền truy cập
  if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    // Nếu không có quyền, chuyển về đúng trang chính của vai trò hiện tại
    const currentCode = (roleCode || '').toUpperCase();
    let safeRedirect = '/campaigns';

    if (currentCode === 'ADMIN' || role === 'admin') {
      safeRedirect = '/admin/user-management';
    } else if (currentCode === 'HT' || currentCode === 'HIEUTRUONG' || role === 'principal') {
      safeRedirect = '/principal/campaign-approval';
    } else if (currentCode === 'CBQL' || currentCode === 'CANBO' || currentCode === 'FUNDRAISER' || role === 'fundraiser') {
      safeRedirect = '/fundraiser/campaign-update';
    } else if (currentCode === 'PH' || currentCode === 'PHUHUYNH' || role === 'parent') {
      safeRedirect = '/parent/student-support-history';
    } else if (currentCode === 'NHT' || currentCode === 'NHATAITRO' || role === 'donor') {
      safeRedirect = '/campaigns';
    }

    // Tránh redirect lặp nếu URL hiện tại trùng đích
    if (location.pathname === safeRedirect) {
      return children;
    }

    return <Navigate to={safeRedirect} replace />;
  }

  return children;
};

export default PrivateRoute;

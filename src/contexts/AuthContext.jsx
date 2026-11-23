// AuthContext: Quản lý trạng thái xác thực toàn ứng dụng
// Đồng bộ chặt chẽ với cơ chế JWT và vai trò từ Backend Spring Boot
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  login as loginService,
  logout as logoutService,
  getCurrentUser,
  getToken,
  register as registerService,
} from '../services/authService';
import { ROLE_ROUTE_PREFIX } from '../utils/constants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null); // Slug vai trò (donor, parent, fundraiser, principal, admin)
  const [roleCode, setRoleCode] = useState(null); // Mã vai trò CSDL (NHATAITRO, PHUHUYNH, CANBO, HIEUTRUONG, ADMIN)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Đặt lại toàn bộ trạng thái xác thực về rỗng
  const resetAuthState = useCallback(() => {
    setUser(null);
    setToken(null);
    setRole(null);
    setRoleCode(null);
    setIsAuthenticated(false);
  }, []);

  // Khôi phục session từ localStorage khi khởi động
  useEffect(() => {
    const validToken = getToken();
    const savedUser = getCurrentUser();

    if (validToken && savedUser) {
      setUser(savedUser);
      setToken(validToken);
      const code = (savedUser.maVaiTro || savedUser.role || savedUser.vaiTro || '').toUpperCase();
      setRoleCode(code);
      setRole(ROLE_ROUTE_PREFIX[code] || code.toLowerCase());
      setIsAuthenticated(true);
    } else {
      resetAuthState();
    }
    setLoading(false);

    // Lắng nghe sự kiện hết hạn token từ Axios Interceptor
    const handleAuthExpired = () => {
      resetAuthState();
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    return () => {
      window.removeEventListener('auth:expired', handleAuthExpired);
    };
  }, [resetAuthState]);

  /**
   * Đăng nhập với usernameOrEmail và password
   */
  const login = async (usernameOrEmail, password) => {
    const { user: loggedUser, token: loggedToken } = await loginService(usernameOrEmail, password);
    setUser(loggedUser);
    setToken(loggedToken);
    const code = (loggedUser.maVaiTro || loggedUser.role || loggedUser.vaiTro || '').toUpperCase();
    setRoleCode(code);
    setRole(ROLE_ROUTE_PREFIX[code] || code.toLowerCase());
    setIsAuthenticated(true);
    return loggedUser;
  };

  /**
   * Đăng ký tài khoản Nhà hảo tâm
   */
  const register = async (userData) => {
    return registerService(userData);
  };

  /**
   * Đăng xuất
   */
  const logout = async () => {
    await logoutService();
    resetAuthState();
  };

  /**
   * Kiểm tra quyền truy cập theo vai trò
   * @param {string[]} allowedRoles - Danh sách role cho phép (chấp nhận cả mã IN HOA hoặc slug in thường)
   * @returns {boolean}
   */
  const hasRole = (allowedRoles = []) => {
    if (!isAuthenticated) return false;
    if (!allowedRoles || allowedRoles.length === 0) return true;

    const currentCode = (roleCode || user?.maVaiTro || user?.role || user?.vaiTro || '').toUpperCase();

    // ADMIN có quyền truy cập toàn bộ tài nguyên theo cấu hình phân quyền SecurityConfig của Backend
    if (currentCode === 'ADMIN') return true;

    const currentSlug = (role || ROLE_ROUTE_PREFIX[currentCode] || '').toLowerCase();

    return allowedRoles.some((r) => {
      if (!r) return false;
      const rUpper = String(r).toUpperCase();
      const rLower = String(r).toLowerCase();
      return (
        rUpper === currentCode ||
        rLower === currentSlug ||
        ROLE_ROUTE_PREFIX[rUpper] === currentSlug ||
        rLower === currentCode.toLowerCase()
      );
    });
  };

  const value = {
    user,
    token,
    role,
    roleCode,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook sử dụng AuthContext
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth phải được dùng bên trong AuthProvider');
  return context;
};

export default AuthContext;

// AuthContext: Quản lý trạng thái xác thực toàn ứng dụng
import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginService, logout as logoutService, getCurrentUser } from '../services/authService';
import { ROLE_ROUTE_PREFIX } from '../utils/constants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // Ví dụ: 'donor' hoặc 'NHT'
  const [roleCode, setRoleCode] = useState(null); // 'NHT', 'PH', ...
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Khôi phục session từ localStorage khi khởi động
  useEffect(() => {
    const savedUser = getCurrentUser();
    const token = localStorage.getItem('token');
    if (savedUser && token) {
      setUser(savedUser);
      const code = savedUser.maVaiTro || savedUser.role;
      setRoleCode(code);
      setRole(ROLE_ROUTE_PREFIX[code] || code?.toLowerCase());
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  /**
   * Đăng nhập với usernameOrEmail và password
   */
  const login = async (usernameOrEmail, password) => {
    const { user: loggedUser } = await loginService(usernameOrEmail, password);
    setUser(loggedUser);
    const code = loggedUser.maVaiTro || loggedUser.role;
    setRoleCode(code);
    setRole(ROLE_ROUTE_PREFIX[code] || code?.toLowerCase());
    setIsAuthenticated(true);
    return loggedUser;
  };

  /**
   * Đăng xuất
   */
  const logout = async () => {
    await logoutService();
    setUser(null);
    setRole(null);
    setRoleCode(null);
    setIsAuthenticated(false);
  };

  /**
   * Kiểm tra quyền truy cập theo role
   * @param {string[]} allowedRoles
   * @returns {boolean}
   */
  const hasRole = (allowedRoles = []) => {
    if (!isAuthenticated) return false;
    if (!allowedRoles || allowedRoles.length === 0) return true;
    const currentCode = (roleCode || user?.maVaiTro || user?.role || '').toUpperCase();
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
    role,
    roleCode,
    isAuthenticated,
    loading,
    login,
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

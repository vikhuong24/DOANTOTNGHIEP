// Notification / Toast component - success, error, warning, info
import { createContext, useContext, useState, useCallback } from 'react';
import { FiCheckCircle, FiXCircle, FiAlertTriangle, FiInfo, FiX } from 'react-icons/fi';
import './Notification.css';

const NotificationContext = createContext(null);

const ICONS = {
  success: <FiCheckCircle />,
  error: <FiXCircle />,
  warning: <FiAlertTriangle />,
  info: <FiInfo />,
};

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast--${toast.type}`}>
            <span className="toast-icon">{ICONS[toast.type]}</span>
            <p className="toast-message">{toast.message}</p>
            <button className="toast-close" onClick={() => removeToast(toast.id)} aria-label="Đóng">
              <FiX />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification phải dùng bên trong NotificationProvider');
  return ctx;
};

export default NotificationProvider;

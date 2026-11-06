// ChatContext: Quản lý trạng thái và lịch sử chatbox AI Assistant phân quyền
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { sendMessage as sendMessageService } from '../services/assistantService';
import { useAuth } from './AuthContext';

const ChatContext = createContext(null);

const DEFAULT_WELCOME = {
  donor: 'Xin chào Nhà hảo tâm! Tôi là Trợ lý ảo NĐC. Tôi có thể giúp gì cho bạn về các chiến dịch gây quỹ và quy trình tài trợ?',
  parent: 'Kính chào Phụ huynh! Tôi là Trợ lý ảo NĐC. Bạn có câu hỏi nào về các đợt nhận hỗ trợ, minh chứng trao tặng của con không?',
  fundraiser: 'Chào Cán bộ quản lý! Tôi là Trợ lý ảo NĐC, sẵn sàng hỗ trợ bạn viết nội dung bài kêu gọi, kiểm tra số liệu quyên góp và đối soát dữ liệu.',
  default: 'Xin chào! Tôi là Trợ lý ảo của hệ thống gây quỹ trường phổ thông chuyên biệt Nguyễn Đình Chiểu Đà Nẵng.',
};

const getRoleKey = (role, roleCode) => {
  const r = roleCode || role || 'guest';
  if (r === 'NHT' || r === 'donor') return 'donor';
  if (r === 'PH' || r === 'parent') return 'parent';
  if (r === 'CBQL' || r === 'fundraiser') return 'fundraiser';
  if (r === 'HT' || r === 'principal') return 'principal';
  if (r === 'ADMIN' || r === 'admin') return 'admin';
  return 'guest';
};

export const ChatProvider = ({ children }) => {
  const { role, roleCode } = useAuth();
  const currentRole = getRoleKey(role, roleCode);

  const getInitialMessages = (roleKey) => {
    try {
      const saved = localStorage.getItem(`chat_history_${roleKey}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Lỗi đọc chat history từ localStorage:', e);
    }

    return [
      {
        id: 1,
        from: 'bot',
        text: DEFAULT_WELCOME[roleKey] || DEFAULT_WELCOME.default,
        timestamp: new Date().toISOString(),
      },
    ];
  };

  const [messages, setMessages] = useState(() => getInitialMessages(currentRole));
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Cập nhật messages khi đổi role
  useEffect(() => {
    setMessages(getInitialMessages(currentRole));
  }, [currentRole]);

  // Lưu localStorage mỗi khi tin nhắn thay đổi
  useEffect(() => {
    try {
      if (messages.length > 0) {
        localStorage.setItem(`chat_history_${currentRole}`, JSON.stringify(messages));
      }
    } catch (e) {
      console.warn('Lỗi lưu chat history:', e);
    }
  }, [messages, currentRole]);

  /**
   * Gửi tin nhắn và nhận phản hồi từ AI
   * @param {string} text
   * @param {string} overrideRole
   */
  const sendMessage = useCallback(
    async (text, overrideRole) => {
      if (!text?.trim()) return;

      const userMsg = {
        id: Date.now(),
        from: 'user',
        text: text.trim(),
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);

      const targetRole = overrideRole || currentRole;

      try {
        const reply = await sendMessageService(text, targetRole);
        const botMsg = {
          id: Date.now() + 1,
          from: 'bot',
          text: reply,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, botMsg]);
      } catch {
        const errMsg = {
          id: Date.now() + 1,
          from: 'bot',
          text: 'Xin lỗi, đã có lỗi xảy ra kết nối với trợ lý ảo. Vui lòng thử lại sau.',
          timestamp: new Date().toISOString(),
          isError: true,
        };
        setMessages((prev) => [...prev, errMsg]);
      } finally {
        setLoading(false);
      }
    },
    [currentRole]
  );

  /**
   * Xóa lịch sử chat của role hiện tại
   */
  const clearHistory = useCallback(() => {
    const welcome = [
      {
        id: Date.now(),
        from: 'bot',
        text: DEFAULT_WELCOME[currentRole] || DEFAULT_WELCOME.default,
        timestamp: new Date().toISOString(),
      },
    ];
    setMessages(welcome);
    try {
      localStorage.removeItem(`chat_history_${currentRole}`);
    } catch (e) {
      console.warn(e);
    }
  }, [currentRole]);

  const toggleChat = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const value = {
    messages,
    loading,
    isOpen,
    role: currentRole,
    sendMessage,
    clearHistory,
    toggleChat,
    setIsOpen,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat phải được dùng bên trong ChatProvider');
  return context;
};

export default ChatContext;

import { useEffect, useRef, useState } from 'react';
import { FiMessageCircle, FiX, FiSend, FiTrash2, FiCpu } from 'react-icons/fi';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatRelativeTime } from '../../utils/formatDate';
import './ChatBox.css';

const ROLE_PROMPTS = {
  donor: [
    'Dự án X đang tiến độ bao nhiêu?',
    'Tôi đã đóng góp bao nhiêu?',
    'Làm sao để tài trợ?',
  ],
  parent: [
    'Con tôi đã nhận được gì?',
    'Minh chứng trao tặng ở đâu?',
    'Tôi muốn phản hồi sai lệch',
  ],
  fundraiser: [
    'Viết content bài đăng cho dự án X',
    'Thống kê quyên góp tháng này',
    'Đối soát dữ liệu đóng góp',
  ],
  principal: [
    'Chiến dịch nào đang chờ duyệt?',
    'Tiến độ giải ngân toàn trường',
    'Báo cáo tài chính tháng này',
  ],
  admin: [
    'Thống kê tổng người dùng',
    'Kiểm tra quyền hạn các vai trò',
    'Dữ liệu học sinh toàn trường',
  ],
};

const normalizeRole = (r, code) => {
  const val = code || r || '';
  if (val === 'NHT' || val === 'donor') return 'donor';
  if (val === 'PH' || val === 'parent') return 'parent';
  if (val === 'CBQL' || val === 'fundraiser') return 'fundraiser';
  if (val === 'HT' || val === 'principal') return 'principal';
  if (val === 'ADMIN' || val === 'admin') return 'admin';
  return val.toLowerCase();
};

const ChatBox = ({ role: propRole }) => {
  const { messages, loading, isOpen, sendMessage, clearHistory, toggleChat } = useChat();
  const { isAuthenticated, role: authRole, roleCode } = useAuth();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Xác định role hiện hành
  const effectiveRole = propRole || normalizeRole(authRole, roleCode);

  // Auto scroll xuống cuối khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input khi mở chat
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  // Phân quyền hiển thị: Chỉ hiển thị icon nổi AI khi đã đăng nhập
  const allowedRoles = ['CBQL', 'PH', 'NHT', 'fundraiser', 'parent', 'donor', 'HT', 'principal', 'ADMIN', 'admin'];
  const canAccessAI = isAuthenticated && (allowedRoles.includes(roleCode) || allowedRoles.includes(authRole) || Boolean(propRole));
  if (!canAccessAI) return null;

  const handleSend = async (customText) => {
    const text = (customText || input).trim();
    if (!text || loading) return;
    setInput('');
    await sendMessage(text, effectiveRole);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const prompts = ROLE_PROMPTS[effectiveRole] || [
    'Giới thiệu quỹ trường',
    'Làm sao để quyên góp?',
    'Quy chế học bổng học sinh',
  ];

  return (
    <div className="chatbox-bubble">
      {/* Chat Window: 400 x 500 px */}
      {isOpen && (
        <div className="chatbox-window" role="dialog" aria-label="Trợ lý ảo NĐC">
          {/* Header */}
          <div className="chatbox-header">
            <div className="chatbox-header-avatar">
              <FiCpu />
            </div>
            <div className="chatbox-header-info">
              <div className="chatbox-header-name">Trợ lý ảo NĐC</div>
              <div className="chatbox-header-status">
                <span className="chatbox-status-dot" /> Trực tuyến • {effectiveRole ? effectiveRole.toUpperCase() : 'Hỗ trợ'}
              </div>
            </div>
            <div className="chatbox-header-actions">
              <button
                className="chatbox-header-btn"
                onClick={clearHistory}
                title="Xóa lịch sử"
                aria-label="Xóa lịch sử chat"
              >
                <FiTrash2 size={15} />
              </button>
              <button
                className="chatbox-header-btn"
                onClick={toggleChat}
                title="Đóng"
                aria-label="Đóng chat"
              >
                <FiX size={17} />
              </button>
            </div>
          </div>

          {/* Quick Prompts */}
          <div className="chatbox-prompts">
            {prompts.map((p, idx) => (
              <button
                key={idx}
                className="chatbox-prompt-btn"
                onClick={() => handleSend(p)}
                disabled={loading}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="chatbox-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chatbox-msg chatbox-msg--${msg.from} ${msg.isError ? 'chatbox-msg--error' : ''}`}
              >
                <div className="chatbox-msg-avatar">
                  {msg.from === 'bot' ? <FiCpu /> : 'Tôi'}
                </div>
                <div className="chatbox-msg-body">
                  <div className="chatbox-msg-bubble">{msg.text}</div>
                  <div className="chatbox-msg-time">{formatRelativeTime(msg.timestamp)}</div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="chatbox-msg chatbox-msg--bot">
                <div className="chatbox-msg-avatar"><FiCpu /></div>
                <div className="chatbox-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chatbox-input-area">
            <textarea
              ref={inputRef}
              className="chatbox-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập câu hỏi của bạn..."
              rows={1}
              aria-label="Nhập tin nhắn"
            />
            <button
              className="chatbox-send"
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              aria-label="Gửi tin nhắn"
            >
              <FiSend size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Trigger Button */}
      <button
        className="chatbox-trigger"
        onClick={toggleChat}
        aria-label={isOpen ? 'Đóng trợ lý ảo' : 'Mở trợ lý ảo NĐC'}
        title="Trợ lý ảo NĐC"
      >
        {isOpen ? <FiX size={22} /> : <FiMessageCircle size={22} />}
      </button>
    </div>
  );
};

export default ChatBox;

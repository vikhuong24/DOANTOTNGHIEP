// Trang Trợ lý AI giải đáp chính sách cho Phụ huynh
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { sendChatMessage } from '../../../../services/assistantService';
import Card from '../../../../components/Card/Card';
import Button from '../../../../components/Button/Button';
import { FiSend, FiCpu, FiUser, FiHelpCircle } from 'react-icons/fi';
import './ChatAssistant.css';

const QUICK_QUESTIONS = [
  'Khi nào thì có đợt phát học bổng tiếp theo?',
  'Con tôi bị khiếm thị thì được nhận những loại học phẩm nào?',
  'Làm sao để biết tiền tài trợ đã được giải ngân cho lớp?',
  'Tôi phát hiện danh sách nhận quà bị sai họ tên con thì liên hệ ai?',
];

const ChatAssistant = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      text: `Xin chào ${user?.hoten || 'Quý phụ huynh'}! Tôi là Trợ lý AI của Trường Phổ thông Chuyên biệt Nguyễn Đình Chiểu. Tôi có thể hỗ trợ quý phụ huynh giải đáp các thắc mắc về lịch sử hỗ trợ, tiêu chuẩn học bổng hoặc hướng dẫn thủ tục nhận đồ dùng học tập chuyên biệt cho các con.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (customText) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customText) setInputText('');
    setLoading(true);

    try {
      const response = await sendChatMessage(textToSend, 'parent');
      const botMessage = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: response.reply || 'Cảm ơn phụ huynh đã gửi câu hỏi. Chúng tôi đã ghi nhận và sẽ phản hồi chi tiết.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch {
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: 'Xin lỗi, hiện tại hệ thống phản hồi đang bận. Quý phụ huynh có thể dùng tính năng "Phản hồi sai lệch" để gửi yêu cầu trực tiếp đến cán bộ.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="parent-chat-assistant-page">
      <div className="page-header">
        <h1 className="page-title">Trợ Lý AI Đồng Hành Cùng Phụ Huynh</h1>
        <p className="page-subtitle">
          Giải đáp tức thời về chế độ chính sách, tiêu chí phân bổ học bổng và quy trình hỗ trợ học sinh
        </p>
      </div>

      <div className="chat-container-layout">
        <Card className="chat-main-card" padding={false}>
          {/* Hộp tin nhắn */}
          <div className="chat-messages-area">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-bubble-row ${msg.sender === 'user' ? 'row-user' : 'row-assistant'}`}
              >
                <div className="chat-avatar">
                  {msg.sender === 'user' ? <FiUser /> : <FiCpu />}
                </div>
                <div className="chat-bubble-content">
                  <div className="chat-bubble-text">{msg.text}</div>
                  <span className="chat-bubble-time">{msg.time}</span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="chat-bubble-row row-assistant">
                <div className="chat-avatar">
                  <FiCpu />
                </div>
                <div className="chat-bubble-content">
                  <div className="chat-typing-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Gợi ý câu hỏi nhanh */}
          <div className="chat-quick-questions">
            <span className="quick-label">
              <FiHelpCircle /> Câu hỏi thường gặp:
            </span>
            <div className="quick-chips">
              {QUICK_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="quick-chip-btn"
                  onClick={() => handleSend(q)}
                  disabled={loading}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Ô nhập tin nhắn */}
          <div className="chat-input-bar">
            <textarea
              className="chat-textarea"
              placeholder="Nhập câu hỏi của phụ huynh tại đây... (Nhấn Enter để gửi)"
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button
              variant="primary"
              onClick={() => handleSend()}
              disabled={loading || !inputText.trim()}
              size="md"
            >
              <FiSend /> Gửi
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ChatAssistant;

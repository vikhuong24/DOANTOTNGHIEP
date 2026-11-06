// ChatAssistant: Trợ lý ảo AI thông minh hỗ trợ giải đáp quy trình tài trợ cho Nhà hảo tâm
import { useState, useRef, useEffect } from 'react';
import { FiSend, FiTrash2, FiCpu } from 'react-icons/fi';
import Button from '../../../../components/Button/Button';
import { useChat } from '../../../../contexts/ChatContext';
import { formatRelativeTime } from '../../../../utils/formatDate';
import './ChatAssistant.css';

const QUICK_QUESTIONS = [
  'Làm sao để nhận giấy chứng nhận tài trợ?',
  'Quy trình giải ngân diễn ra như thế nào?',
  'Tôi muốn tài trợ thiết bị dạy học thì làm thế nào?',
  'Tiền ủng hộ có được miễn giảm thuế thu nhập không?',
];

const ChatAssistant = () => {
  const { messages, loading, sendMessage, clearHistory } = useChat();
  const [inputText, setInputText] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const text = textToSend || inputText.trim();
    if (!text || loading) return;
    setInputText('');
    await sendMessage(text);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-assistant-page">
      <div className="assistant-header">
        <h1>Trợ lý AI Nhà Hảo Tâm</h1>
        <p>Hệ thống tự động giải đáp các câu hỏi về chính sách quyên góp, minh chứng tài chính và hỗ trợ học sinh.</p>
      </div>

      <div className="assistant-chat-container">
        {/* Head */}
        <div className="assistant-chat-head">
          <div className="assistant-bot-profile">
            <div className="assistant-bot-avatar">
              <FiCpu />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text)' }}>Trợ lý AI - Quỹ Trường Nguyễn Đình Chiểu</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', background: 'var(--success)', borderRadius: '50%', display: 'inline-block' }} />
                Sẵn sàng giải đáp 24/7
              </div>
            </div>
          </div>

          <button
            className="btn btn--outline btn--sm"
            onClick={clearHistory}
            title="Làm mới cuộc trò chuyện"
          >
            <FiTrash2 /> Xóa lịch sử
          </button>
        </div>

        {/* Quick prompt chips */}
        <div className="assistant-quick-prompts">
          {QUICK_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              className="prompt-chip"
              onClick={() => handleSend(q)}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Messages Body */}
        <div className="assistant-messages-body">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`assistant-bubble-row assistant-bubble-row--${msg.from}`}
            >
              <div>
                <div className="assistant-bubble">
                  {msg.text}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#aaa', marginTop: '3px', textAlign: msg.from === 'user' ? 'right' : 'left' }}>
                  {formatRelativeTime(msg.timestamp)}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="assistant-bubble-row assistant-bubble-row--bot">
              <div className="assistant-bubble" style={{ color: '#888', fontStyle: 'italic' }}>
                Trợ lý AI đang tra cứu câu trả lời phù hợp nhất...
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* Input Bar */}
        <div className="assistant-input-bar">
          <input
            type="text"
            className="input-field"
            placeholder="Nhập câu hỏi của bạn về thủ tục quyên góp, tài trợ..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button
            variant="primary"
            onClick={() => handleSend()}
            disabled={!inputText.trim() || loading}
          >
            <FiSend /> Gửi
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;

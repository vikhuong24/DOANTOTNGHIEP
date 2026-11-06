// Trợ lý AI đồng hành cùng Cán bộ Quản lý Gây quỹ (Fundraiser)
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { sendChatMessage, generateCampaignContent } from '../../../../services/assistantService';
import Card from '../../../../components/Card/Card';
import Button from '../../../../components/Button/Button';
import { useNotification } from '../../../../components/Notification/Notification';
import { FiSend, FiCpu, FiUser, FiZap, FiCopy, FiCheck, FiArrowRight } from 'react-icons/fi';
import './ChatAssistant.css';

const QUICK_PROMPTS = [
  'Viết thư cảm ơn gửi nhà hảo tâm ủng hộ 50 triệu tiền học bổng',
  'Soạn thảo kế hoạch vận động đồ dùng học tập học kỳ 2',
  'Gợi ý các tiêu chí thẩm định hoàn cảnh học sinh chuyên biệt',
  'Viết thông cáo báo chí tổng kết chiến dịch gây quỹ máy trợ thính',
];

const ChatAssistant = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useNotification();

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      text: `Xin chào Cán bộ ${user?.hoten || 'Lê Minh Cường'}! Tôi là Trợ lý AI phụ trách nội dung và nghiệp vụ gây quỹ. Tôi có thể hỗ trợ bạn:\n- Viết nội dung bài kêu gọi gây quỹ truyền cảm hứng\n- Soạn thảo thư cảm ơn và báo cáo tài chính gửi nhà hảo tâm\n- Lên ý tưởng dự toán phân bổ học bổng và thiết bị chuyên biệt\n\nBạn muốn tôi hỗ trợ công việc gì hôm nay?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (customPrompt) => {
    const textToSend = customPrompt || inputText;
    if (!textToSend.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customPrompt) setInputText('');
    setLoading(true);

    try {
      let replyContent = '';
      if (textToSend.toLowerCase().includes('bài kêu gọi') || textToSend.toLowerCase().includes('chiến dịch')) {
        const res = await generateCampaignContent(textToSend);
        replyContent = res.content || res.reply;
      } else {
        const res = await sendChatMessage(textToSend, 'fundraiser');
        replyContent = res.reply;
      }

      const botMessage = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: replyContent,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        canUseAsCampaign: textToSend.toLowerCase().includes('bài kêu gọi') || textToSend.toLowerCase().includes('kêu gọi'),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch {
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: 'Hệ thống AI đang bận xử lý, vui lòng thử lại sau vài giây.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    addToast('Đã sao chép nội dung vào bộ nhớ tạm', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleApplyToCampaign = () => {
    navigate('/fundraiser/campaign-create');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fundraiser-chat-assistant-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Trợ Lý AI Tạo Content & Nghiệp Vụ Gây Quỹ</h1>
          <p className="page-subtitle">
            Tận dụng trí tuệ nhân tạo để soạn thảo bài kêu gọi truyền cảm hứng, viết thư cảm ơn và lên dự toán
          </p>
        </div>
      </div>

      <div className="chat-container-layout">
        <Card className="chat-main-card" padding={false}>
          {/* Vùng chat */}
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
                  <div className="chat-bubble-meta">
                    <span className="chat-bubble-time">{msg.time}</span>
                    {msg.sender === 'assistant' && (
                      <div className="bubble-actions">
                        <button
                          type="button"
                          className="btn-bubble-action"
                          onClick={() => handleCopy(msg.id, msg.text)}
                          title="Sao chép nội dung này"
                        >
                          {copiedId === msg.id ? <FiCheck /> : <FiCopy />}
                          {copiedId === msg.id ? 'Đã chép' : 'Sao chép'}
                        </button>
                        {msg.canUseAsCampaign && (
                          <button
                            type="button"
                            className="btn-bubble-action text-primary"
                            onClick={handleApplyToCampaign}
                            title="Chuyển sang trang tạo chiến dịch"
                          >
                            <FiArrowRight /> Tạo chiến dịch ngay
                          </button>
                        )}
                      </div>
                    )}
                  </div>
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

          {/* Prompt gợi ý */}
          <div className="chat-quick-questions">
            <span className="quick-label">
              <FiZap /> Gợi ý nghiệp vụ:
            </span>
            <div className="quick-chips">
              {QUICK_PROMPTS.map((q, idx) => (
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

          {/* Ô nhập */}
          <div className="chat-input-bar">
            <textarea
              className="chat-textarea"
              placeholder="Yêu cầu AI viết bài hoặc hỗ trợ nghiệp vụ... (Shift + Enter để xuống dòng, Enter để gửi)"
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

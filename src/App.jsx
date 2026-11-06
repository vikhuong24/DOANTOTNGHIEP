// App.jsx - Root component kết nối tất cả providers và routes
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import { NotificationProvider } from './components/Notification/Notification';
import AppRoutes from './routes/AppRoutes';
import ChatBox from './components/ChatBox/ChatBox';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <ChatProvider>
            {/* Routes chính */}
            <AppRoutes />
            {/* ChatBox AI Assistant - hiển thị toàn cục */}
            <ChatBox />
          </ChatProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

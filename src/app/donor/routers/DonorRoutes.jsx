// DonorRoutes: Định tuyến toàn bộ các trang dành cho Nhà hảo tâm
import { Routes, Route, Navigate } from 'react-router-dom';
import DonorLayout from '../components/DonorLayout';
import Profile from '../pages/profile/Profile';
import RegisterSponsor from '../pages/register-sponsor/RegisterSponsor';
import ProposeSponsor from '../pages/propose-sponsor/ProposeSponsor';
import CampaignProgress from '../pages/campaign-progress/CampaignProgress';
import DonationHistory from '../pages/donation-history/DonationHistory';
import Feedback from '../pages/feedback/Feedback';
import ChatAssistant from '../pages/chat-assistant/ChatAssistant';
import PrivateRoute from '../../../routes/PrivateRoute';
import { ROLES } from '../../../utils/constants';

const DonorRoutes = () => {
  return (
    <Routes>
      {/* Chuyển hướng đăng nhập về trang /login duy nhất */}
      <Route path="login" element={<Navigate to="/login" replace />} />

      {/* Các route yêu cầu quyền đăng nhập Nhà hảo tâm (NHATAITRO / donor) */}
      <Route
        element={
          <PrivateRoute allowedRoles={[ROLES.DONOR, 'donor', 'NHATAITRO', 'NHT']}>
            <DonorLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/donor/campaign-progress" replace />} />
        <Route path="dashboard" element={<Navigate to="/donor/campaign-progress" replace />} />
        <Route path="campaign-progress" element={<CampaignProgress />} />
        
        {/* Đăng ký tài trợ & alias URL */}
        <Route path="register-sponsor" element={<RegisterSponsor />} />
        <Route path="donations/register" element={<Navigate to="/donor/register-sponsor" replace />} />
        
        {/* Đề xuất tài trợ & alias URL */}
        <Route path="propose-sponsor" element={<ProposeSponsor />} />
        <Route path="donations/propose" element={<Navigate to="/donor/propose-sponsor" replace />} />

        {/* Lịch sử đóng góp & alias */}
        <Route path="donation-history" element={<DonationHistory />} />
        <Route path="history" element={<Navigate to="/donor/donation-history" replace />} />
        <Route path="donations/history" element={<Navigate to="/donor/donation-history" replace />} />

        <Route path="profile" element={<Profile />} />
        <Route path="feedback" element={<Feedback />} />
        <Route path="chat-assistant" element={<ChatAssistant />} />

        {/* Fallback route: Luôn dùng đường dẫn tuyệt đối /donor/campaign-progress để tránh vòng lặp relative redirect */}
        <Route path="*" element={<Navigate to="/donor/campaign-progress" replace />} />
      </Route>
    </Routes>
  );
};

export default DonorRoutes;
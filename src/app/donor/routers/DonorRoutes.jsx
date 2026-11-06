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
        <Route index element={<Navigate to="campaign-progress" replace />} />
        <Route path="dashboard" element={<Navigate to="campaign-progress" replace />} />
        <Route path="campaign-progress" element={<CampaignProgress />} />
        <Route path="register-sponsor" element={<RegisterSponsor />} />
        <Route path="propose-sponsor" element={<ProposeSponsor />} />
        <Route path="donation-history" element={<DonationHistory />} />
        <Route path="history" element={<Navigate to="donation-history" replace />} />
        <Route path="profile" element={<Profile />} />
        <Route path="feedback" element={<Feedback />} />
        <Route path="chat-assistant" element={<ChatAssistant />} />
        <Route path="*" element={<Navigate to="campaign-progress" replace />} />
      </Route>
    </Routes>
  );
};

export default DonorRoutes;

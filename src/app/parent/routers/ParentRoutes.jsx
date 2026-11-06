// Định tuyến toàn bộ các trang dành cho Phụ huynh học sinh
import { Routes, Route, Navigate } from 'react-router-dom';
import ParentLayout from '../components/ParentLayout';
import StudentSupportHistory from '../pages/student-support-history/StudentSupportHistory';
import DonationEvidence from '../pages/donation-evidence/DonationEvidence';
import Feedback from '../pages/feedback/Feedback';
import ChatAssistant from '../pages/chat-assistant/ChatAssistant';
import PrivateRoute from '../../../routes/PrivateRoute';
import { ROLES } from '../../../utils/constants';

const ParentRoutes = () => {
  return (
    <Routes>
      {/* Chuyển hướng đăng nhập về trang /login duy nhất */}
      <Route path="login" element={<Navigate to="/login" replace />} />

      {/* Các route yêu cầu quyền đăng nhập Phụ huynh (PHUHUYNH / parent) */}
      <Route
        element={
          <PrivateRoute allowedRoles={[ROLES.PARENT, 'parent', 'PHUHUYNH', 'PH']}>
            <ParentLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<StudentSupportHistory />} />
        <Route path="dashboard" element={<StudentSupportHistory />} />
        <Route path="students" element={<StudentSupportHistory />} />
        <Route path="student-support-history" element={<StudentSupportHistory />} />
        <Route path="donation-evidence" element={<DonationEvidence />} />
        <Route path="feedback" element={<Feedback />} />
        <Route path="chat-assistant" element={<ChatAssistant />} />
        <Route path="*" element={<Navigate to="/parent/student-support-history" replace />} />
      </Route>
    </Routes>
  );
};

export default ParentRoutes;

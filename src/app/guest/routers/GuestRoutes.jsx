// GuestRoutes: Định tuyến tất cả các trang cho tác nhân Khách vãng lai
import { Routes, Route, Navigate } from 'react-router-dom';
import GuestLayout from '../components/GuestLayout';
import CampaignList from '../pages/campaign-list/CampaignList';
import CampaignDetail from '../pages/campaign-detail/CampaignDetail';
import Statement from '../pages/statement/Statement';
import StudentList from '../pages/student-list/StudentList';
import Register from '../pages/register/Register';

const GuestRoutes = () => {
  return (
    <Routes>
      <Route element={<GuestLayout />}>
        <Route index element={<Navigate to="campaigns" replace />} />
        <Route path="home" element={<Navigate to="../campaigns" replace />} />
        <Route path="campaigns" element={<CampaignList />} />
        <Route path="campaigns/:id" element={<CampaignDetail />} />
        <Route path="campaign/:id" element={<CampaignDetail />} />
        <Route path="statement" element={<Statement />} />
        <Route path="students" element={<StudentList />} />
        <Route path="register" element={<Register />} />
        {/* Chuyển hướng login về trang /login duy nhất */}
        <Route path="login" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="campaigns" replace />} />
      </Route>
    </Routes>
  );
};

export default GuestRoutes;

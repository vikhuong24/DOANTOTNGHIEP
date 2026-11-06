import { Routes, Route, Navigate } from 'react-router-dom';
import { ROLES } from '../../../utils/constants';
import PrivateRoute from '../../../routes/PrivateRoute';
import AdminLayout from '../components/AdminLayout';
import UserManagement from '../pages/user-management/UserManagement';
import RolePermission from '../pages/role-permission/RolePermission';
import CampaignStatistics from '../pages/campaign-statistics/CampaignStatistics';
import StudentManagement from '../pages/student-management/StudentManagement';

const AdminRoutes = () => (
  <Routes>
    {/* Tất cả điều hướng đăng nhập đưa về trang /login duy nhất của hệ thống */}
    <Route path="login" element={<Navigate to="/login" replace />} />
    <Route
      element={
        <PrivateRoute allowedRoles={[ROLES.ADMIN, 'ADMIN', 'admin']}>
          <AdminLayout />
        </PrivateRoute>
      }
    >
      <Route index element={<Navigate to="user-management" replace />} />
      <Route path="dashboard" element={<Navigate to="user-management" replace />} />
      <Route path="users" element={<Navigate to="user-management" replace />} />
      <Route path="user-management" element={<UserManagement />} />
      <Route path="students" element={<StudentManagement />} />
      <Route path="student-management" element={<StudentManagement />} />
      <Route path="role-permission" element={<RolePermission />} />
      <Route path="campaign-statistics" element={<CampaignStatistics />} />
      <Route path="reports" element={<Navigate to="campaign-statistics" replace />} />
      <Route path="*" element={<Navigate to="user-management" replace />} />
    </Route>
  </Routes>
);

export default AdminRoutes;

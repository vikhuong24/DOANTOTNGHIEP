import { Routes, Route, Navigate } from 'react-router-dom';
import { ROLES } from '../../../utils/constants';
import PrivateRoute from '../../../routes/PrivateRoute';
import PrincipalLayout from '../components/PrincipalLayout';
import CampaignApproval from '../pages/campaign-approval/CampaignApproval';
import DistributionApproval from '../pages/distribution-approval/DistributionApproval';
import FinancialReport from '../pages/financial-report/FinancialReport';
import ParentFeedbackView from '../pages/parent-feedback-view/ParentFeedbackView';
import StaffResponseView from '../pages/staff-response-view/StaffResponseView';

const PrincipalRoutes = () => (
  <Routes>
    {/* Chuyển hướng đăng nhập về trang /login duy nhất */}
    <Route path="login" element={<Navigate to="/login" replace />} />
    <Route
      element={
        <PrivateRoute allowedRoles={[ROLES.PRINCIPAL, 'HIEUTRUONG', 'HT', 'principal']}>
          <PrincipalLayout />
        </PrivateRoute>
      }
    >
      <Route index element={<Navigate to="campaign-approval" replace />} />
      <Route path="dashboard" element={<Navigate to="campaign-approval" replace />} />
      <Route path="approvals" element={<Navigate to="campaign-approval" replace />} />
      <Route path="campaign-approval" element={<CampaignApproval />} />
      <Route path="distribution-approval" element={<DistributionApproval />} />
      <Route path="financial-report" element={<FinancialReport />} />
      <Route path="reports" element={<Navigate to="financial-report" replace />} />
      <Route path="parent-feedback-view" element={<ParentFeedbackView />} />
      <Route path="staff-response-view" element={<StaffResponseView />} />
      <Route path="*" element={<Navigate to="campaign-approval" replace />} />
    </Route>
  </Routes>
);

export default PrincipalRoutes;

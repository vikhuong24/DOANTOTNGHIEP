// Định tuyến toàn bộ các trang dành cho Cán bộ Quản lý Gây quỹ
import { Routes, Route, Navigate } from 'react-router-dom';
import FundraiserLayout from '../components/FundraiserLayout';
import CampaignCreate from '../pages/campaign-create/CampaignCreate';
import CampaignUpdate from '../pages/campaign-update/CampaignUpdate';
import ProposalApproval from '../pages/proposal-approval/ProposalApproval';
import SponsorApproval from '../pages/sponsor-approval/SponsorApproval';
import DonationConfirm from '../pages/donation-confirm/DonationConfirm';
import ScholarshipDistribution from '../pages/scholarship-distribution/ScholarshipDistribution';
import SuppliesDistribution from '../pages/supplies-distribution/SuppliesDistribution';
import DisbursementProgress from '../pages/disbursement-progress/DisbursementProgress';
import ParentFeedback from '../pages/parent-feedback/ParentFeedback';
import DonorFeedback from '../pages/donor-feedback/DonorFeedback';
import ChatAssistant from '../pages/chat-assistant/ChatAssistant';
import PrivateRoute from '../../../routes/PrivateRoute';
import { ROLES } from '../../../utils/constants';

const FundraiserRoutes = () => {
  return (
    <Routes>
      {/* Chuyển hướng đăng nhập về trang /login duy nhất */}
      <Route path="login" element={<Navigate to="/login" replace />} />

      {/* Các route yêu cầu quyền Cán bộ Quản lý gây quỹ (CANBO / fundraiser) */}
      <Route
        element={
          <PrivateRoute allowedRoles={[ROLES.FUNDRAISER, 'fundraiser', 'CANBO', 'CBQL']}>
            <FundraiserLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<CampaignUpdate />} />
        <Route path="dashboard" element={<CampaignUpdate />} />
        <Route path="campaigns" element={<CampaignUpdate />} />
        <Route path="campaigns/create" element={<CampaignCreate />} />
        <Route path="campaign-create" element={<CampaignCreate />} />
        <Route path="campaign-update" element={<CampaignUpdate />} />
        <Route path="proposal-approval" element={<ProposalApproval />} />
        <Route path="sponsor-approval" element={<SponsorApproval />} />
        <Route path="donation-confirm" element={<DonationConfirm />} />
        <Route path="scholarship-distribution" element={<ScholarshipDistribution />} />
        <Route path="supplies-distribution" element={<SuppliesDistribution />} />
        <Route path="disbursement-progress" element={<DisbursementProgress />} />
        <Route path="parent-feedback" element={<ParentFeedback />} />
        <Route path="donor-feedback" element={<DonorFeedback />} />
        <Route path="feedback" element={<Navigate to="parent-feedback" replace />} />
        <Route path="chat-assistant" element={<ChatAssistant />} />
        <Route path="*" element={<Navigate to="campaign-update" replace />} />
      </Route>
    </Routes>
  );
};

export default FundraiserRoutes;

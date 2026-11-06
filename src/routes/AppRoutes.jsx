// AppRoutes: Khai báo toàn bộ cấu trúc route của ứng dụng
import { Routes, Route, Navigate } from 'react-router-dom';

// Routes của Guest
import GuestLayout from '../app/guest/components/GuestLayout';
import GuestRoutes from '../app/guest/routers/GuestRoutes';
import CampaignList from '../app/guest/pages/campaign-list/CampaignList';
import CampaignDetail from '../app/guest/pages/campaign-detail/CampaignDetail';
import Statement from '../app/guest/pages/statement/Statement';
import StudentList from '../app/guest/pages/student-list/StudentList';
import Register from '../app/guest/pages/register/Register';
import GuestLogin from '../app/guest/pages/login/Login';

// Routes của các tác nhân
import DonorRoutes from '../app/donor/routers/DonorRoutes';
import ParentRoutes from '../app/parent/routers/ParentRoutes';
import FundraiserRoutes from '../app/fundraiser/routers/FundraiserRoutes';
import PrincipalRoutes from '../app/principal/routers/PrincipalRoutes';
import AdminRoutes from '../app/admin/routers/AdminRoutes';

// Trang lỗi
import Forbidden from '../pages/Forbidden/Forbidden';
import NotFound from '../pages/NotFound/NotFound';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Redirect root về danh sách chiến dịch */}
      <Route path="/" element={<Navigate to="/campaigns" replace />} />

      {/* ===== CÁC TRANG CÔNG KHAI (Direct Public Paths) ===== */}
      <Route element={<GuestLayout />}>
        <Route path="/campaigns" element={<CampaignList />} />
        <Route path="/campaigns/:id" element={<CampaignDetail />} />
        <Route path="/campaign/:id" element={<CampaignDetail />} />
        <Route path="/statement" element={<Statement />} />
        <Route path="/students" element={<StudentList />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<GuestLogin />} />
        <Route path="/403" element={<Forbidden />} />
        <Route path="/404" element={<NotFound />} />
      </Route>

      {/* ===== GUEST ROUTES ALIAS (/guest/*) ===== */}
      <Route path="/guest/campaign-list" element={<Navigate to="/campaigns" replace />} />
      <Route path="/guest/*" element={<GuestRoutes />} />

      {/* ===== TASK 2: DONOR ===== */}
      <Route path="/donor/*" element={<DonorRoutes />} />

      {/* ===== TASK 3: PARENT ===== */}
      <Route path="/parent/*" element={<ParentRoutes />} />

      {/* ===== TASK 3: FUNDRAISER ===== */}
      <Route path="/fundraiser/*" element={<FundraiserRoutes />} />

      {/* ===== TASK 4: PRINCIPAL ===== */}
      <Route path="/principal/*" element={<PrincipalRoutes />} />

      {/* ===== TASK 4: ADMIN ===== */}
      <Route path="/admin/*" element={<AdminRoutes />} />

      {/* Trang lỗi 403 & 404 độc lập */}
      <Route path="/forbidden" element={<Navigate to="/403" replace />} />

      {/* Fallback 404 cho tất cả các đường dẫn không khớp */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;

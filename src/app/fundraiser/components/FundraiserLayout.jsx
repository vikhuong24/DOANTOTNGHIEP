// Layout dùng chung cho Cán bộ quản lý gây quỹ
import { Outlet } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import Sidebar from '../../../components/Sidebar/Sidebar';
import './FundraiserLayout.css';

const FundraiserLayout = () => {
  return (
    <div className="fundraiser-layout">
      <Header />
      <div className="fundraiser-body">
        <Sidebar />
        <main className="fundraiser-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default FundraiserLayout;

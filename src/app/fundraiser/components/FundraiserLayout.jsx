// Layout dùng chung cho Cán bộ quản lý gây quỹ
import { Outlet } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import Sidebar from '../../../components/Sidebar/Sidebar';
import Footer from '../../../components/Footer/Footer';
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
      <Footer />
    </div>
  );
};

export default FundraiserLayout;

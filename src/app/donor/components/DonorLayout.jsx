// DonorLayout: Khung giao diện cho Nhà hảo tâm gồm Header, Sidebar và Main Outlet
import { Outlet } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import Sidebar from '../../../components/Sidebar/Sidebar';
import Footer from '../../../components/Footer/Footer';
import './DonorLayout.css';

const DonorLayout = () => {
  return (
    <div className="donor-layout">
      <Header />
      <div className="donor-body">
        <Sidebar />
        <main className="donor-main">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default DonorLayout;

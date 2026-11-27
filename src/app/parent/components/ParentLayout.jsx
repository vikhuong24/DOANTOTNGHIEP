// Layout dùng chung cho Phụ huynh
import { Outlet } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import Sidebar from '../../../components/Sidebar/Sidebar';
import './ParentLayout.css';

const ParentLayout = () => {
  return (
    <div className="parent-layout">
      <Header />
      <div className="parent-body">
        <Sidebar />
        <main className="parent-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ParentLayout;

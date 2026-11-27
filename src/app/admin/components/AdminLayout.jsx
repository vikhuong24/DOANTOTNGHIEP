import { Outlet } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import Sidebar from '../../../components/Sidebar/Sidebar';
import './AdminLayout.css';

const AdminLayout = () => (
  <div className="admin-layout">
    <Header />
    <div className="admin-layout__body">
      <Sidebar />
      <main className="admin-layout__main">
        <Outlet />
      </main>
    </div>
  </div>
);

export default AdminLayout;

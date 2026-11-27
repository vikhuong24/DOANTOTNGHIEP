import { Outlet } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import Sidebar from '../../../components/Sidebar/Sidebar';
import './PrincipalLayout.css';

const PrincipalLayout = () => {
  return (
    <div className="principal-layout">
      <Header />
      <div className="principal-layout__body">
        <Sidebar />
        <main className="principal-layout__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PrincipalLayout;

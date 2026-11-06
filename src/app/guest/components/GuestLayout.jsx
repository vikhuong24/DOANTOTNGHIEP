// GuestLayout: Layout chung cho khách vãng lai gồm Header + Main Content + Footer
import { Outlet } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import './GuestLayout.css';

const GuestLayout = () => {
  return (
    <div className="guest-layout">
      <Header />
      <main className="guest-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default GuestLayout;

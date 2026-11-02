import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

// Wraps every logged-in page: navbar on top, the page below it.
function AppLayout() {
  return (
    <>
      <Navbar />
      <main className="page-container">
        <Outlet />
      </main>
    </>
  );
}

export default AppLayout;
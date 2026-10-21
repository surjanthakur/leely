import { Footer } from '../components/export.js';
import { HomePage } from '../pages/export.js';
import { ToastContainer } from 'react-toastify';
import { Navbar } from '../components/export.js';

export default function MainLayout() {
  return (
    <>
      <div className="min-h-screen bg-[#f7f6f0]">
        <Navbar />
        <main>
          <ToastContainer
            position="top-center"
            autoClose={3000}
            hideProgressBar={false}
            closeOnClick
            pauseOnHover
          />
          <HomePage />
        </main>
        <Footer />
      </div>
    </>
  );
}

// import { Outlet } from 'react-router-dom';
// import { Sidebar } from '../components/Sidebar';
// import { Navbar } from '../components/Navbar';

// export const MainLayout = () => {
//   return (
//     <div className="flex min-h-screen bg-[#F8F7F2] dark:bg-slate-950 text-[#2D3748] dark:text-slate-100 transition-colors">
//       <Sidebar />
//       <div className="flex-1 flex flex-col min-w-0">
//         <Navbar />
//         <main className="flex-1 p-8 overflow-y-auto max-w-6xl">
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   );
// };

import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';

export const MainLayout = () => {
  const location = useLocation();

  // Full-bleed views should not have max-width or inner container padding
  const isFullBleed =
    location.pathname.startsWith('/runner') ||
    location.pathname.startsWith('/code-runner') ||
    location.pathname.startsWith('/coderunner') ||
    location.pathname.startsWith('/visualizer');

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F7F2] dark:bg-slate-950 text-[#2D3748] dark:text-slate-100 transition-colors">
      {/* Persistent Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Navbar />
        <main
          className={`flex-1 overflow-y-auto ${
            isFullBleed ? 'p-0 w-full' : 'p-8 max-w-6xl w-full'
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};
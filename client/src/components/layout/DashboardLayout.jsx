import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import DashboardSidebar from './DashboardSidebar';

const DashboardLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F6] dark:bg-[#0b1120] text-gray-900 dark:text-gray-100 transition-colors">
      <Navbar />
      
      <div className="flex flex-1 max-w-[1600px] w-full mx-auto">
        <DashboardSidebar mobileOpen={false} onClose={() => {}} />
        <main className="flex-1 w-full min-w-0 pb-12 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

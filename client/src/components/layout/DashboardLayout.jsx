import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import DashboardSidebar from './DashboardSidebar';

const DashboardLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F6]">
      <Navbar />
      <div className="flex flex-1 max-w-[1600px] w-full mx-auto">
        <DashboardSidebar />
        <main className="flex-1 w-full min-w-0 pb-12">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

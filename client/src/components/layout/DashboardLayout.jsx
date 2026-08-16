import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import DashboardSidebar from './DashboardSidebar';
import { PanelLeft } from 'lucide-react';

const DashboardLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F6]">
      <Navbar />
      
      {/* Mobile Dashboard Navigation Header Bar */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between sticky top-20 z-30 shadow-xs">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-primary px-3 py-1.5 rounded-lg border border-gray-200 hover:border-primary/40 bg-gray-50 transition-colors"
        >
          <PanelLeft size={18} className="text-primary" />
          <span>Dashboard Menu</span>
        </button>
      </div>

      <div className="flex flex-1 max-w-[1600px] w-full mx-auto">
        <DashboardSidebar 
          mobileOpen={mobileMenuOpen} 
          onClose={() => setMobileMenuOpen(false)} 
        />
        <main className="flex-1 w-full min-w-0 pb-12 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

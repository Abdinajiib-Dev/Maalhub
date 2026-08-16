import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, 
  Kanban, 
  Users, 
  MessageCircle, 
  User, 
  Settings,
  TrendingUp,
  X
} from 'lucide-react';

const DashboardSidebar = ({ mobileOpen, onClose }) => {
  const location = useLocation();
  const { profile } = useAuth();
  const isEntrepreneur = profile?.role === 'entrepreneur';
  
  const basePath = isEntrepreneur ? '/entrepreneur' : '/investor';

  const navLinks = [
    { name: 'Dashboard', path: `${basePath}/dashboard`, icon: Home },
    { name: isEntrepreneur ? 'My Projects' : 'Explore Projects', path: `${basePath}/projects`, icon: Kanban },
    { name: 'Investment Requests', path: `${basePath}/requests`, icon: Users },
    { name: 'Messages', path: `${basePath}/messages`, icon: MessageCircle },
    { name: 'Profile', path: `${basePath}/profile`, icon: User },
    { name: 'Settings', path: `${basePath}/settings`, icon: Settings },
  ];

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#FAF9F6]">
      <div className="flex items-center justify-between p-4 md:hidden border-b border-gray-200">
        <span className="font-bold text-gray-900 text-base">Dashboard Menu</span>
        <button 
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4">
        <nav className="space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-primary text-white shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-gray-500'} />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {isEntrepreneur && (
        <div className="px-4 mb-4 mt-auto">
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
            <div className="w-10 h-10 bg-[#FAF9F6] border border-gray-100 rounded-lg shadow-sm flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="text-primary" size={20} />
            </div>
            <h4 className="font-bold text-gray-900 mb-1 text-sm">Ready to grow your idea?</h4>
            <p className="text-[11px] text-gray-500 mb-4 leading-relaxed">
              Share your project and connect with investors.
            </p>
            <Link 
              to="/entrepreneur/create-project" 
              onClick={handleLinkClick}
              className="block w-full bg-primary hover:bg-secondary text-white text-xs font-medium py-2 rounded-lg transition-colors shadow-sm text-center"
            >
              Create New Project
            </Link>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-60 lg:w-64 bg-[#FAF9F6] border-r border-gray-100 flex-col h-[calc(100vh-5rem)] sticky top-20 flex-shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity" 
            onClick={onClose}
          />
          {/* Slide-over panel */}
          <div className="relative flex-1 max-w-xs w-full bg-[#FAF9F6] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardSidebar;

import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LineChart, ChevronDown, LayoutDashboard, LogOut, Home, Kanban, Users, MessageCircle, User, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [unreadMessages, setUnreadMessages] = React.useState([]);
  const notificationRef = React.useRef(null);
  const profileMenuRef = React.useRef(null);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (!user) return;
    
    const fetchUnread = async () => {
      try {
        const data = await api.getUnreadMessages();
        setUnreadCount(data?.count || 0);
        setUnreadMessages(data?.messages || []);
      } catch (err) {
        setUnreadCount(0);
        setUnreadMessages([]);
      }
    };
    
    fetchUnread();
    const intervalId = setInterval(fetchUnread, 60000); // 60 seconds

    const handleUpdate = () => {
      fetchUnread();
    };

    window.addEventListener('unread_messages_updated', handleUpdate);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('unread_messages_updated', handleUpdate);
    };
  }, [user]);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    
    if (showNotifications || showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications, showProfileMenu]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isDashboard = location.pathname.includes('/entrepreneur') || location.pathname.includes('/investor');
  const basePath = profile?.role === 'entrepreneur' ? '/entrepreneur' : '/investor';

  const navLinks = isDashboard ? [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Dashboard', path: `${basePath}/dashboard`, icon: LayoutDashboard },
    { name: profile?.role === 'entrepreneur' ? 'My Projects' : 'Explore Projects', path: `${basePath}/projects`, icon: Kanban },
    { name: 'Investment Requests', path: `${basePath}/requests`, icon: Users },
    { name: 'Messages', path: `${basePath}/messages`, icon: MessageCircle },
    { name: 'Profile', path: `${basePath}/profile`, icon: User },
    { name: 'Settings', path: `${basePath}/settings`, icon: Settings },
  ] : [
    { name: 'Home', path: '/' },
    { name: 'Projects', path: '/projects' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="bg-background border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Left: Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="h-12 w-12 rounded-full overflow-hidden flex items-center justify-center shadow-sm">
                <img src="/Maalhub2.jpg" alt="MaalHub Logo" className="h-full w-full object-cover scale-125" />
              </div>
              <span className="text-2xl font-bold tracking-tight">
                <span className="text-text">Maal</span>
                <span className="text-primary">Hub</span>
              </span>
            </Link>
          </div>

          {/* Center: Navigation */}
          {!isDashboard && (
            <div className="hidden md:flex flex-1 justify-center">
              <div className="flex space-x-6 sm:space-x-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`text-sm font-medium transition-all ${
                      location.pathname === link.path
                        ? 'text-primary border-b-2 border-primary pb-1'
                        : 'text-gray-500 hover:text-primary pb-1 border-b-2 border-transparent hover:border-primary/30'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Right: Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {!user ? (
              <>
                <Link to="/login" className="text-text hover:text-primary font-medium text-sm px-4 py-2 border border-gray-300 rounded-md hover:border-primary transition-colors">
                  Log In
                </Link>
                <Link to="/register" className="bg-primary hover:bg-[#7a5338] text-white font-medium text-sm px-5 py-2 rounded-md transition-colors shadow-sm">
                  Sign Up
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-6">
                {/* Notification Bell */}
                <div className="relative" ref={notificationRef}>
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)} 
                    className="relative p-2 text-gray-500 hover:text-primary transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-white text-[10px] font-bold flex items-center justify-center rounded-full ring-2 ring-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  
                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-50 bg-gray-50 flex justify-between items-center">
                        <span className="font-bold text-gray-900 text-sm">Notifications</span>
                        {unreadCount > 0 && (
                          <button 
                            onClick={() => setUnreadCount(0)} 
                            className="text-xs text-primary font-medium hover:underline"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {unreadMessages.length === 0 ? (
                          <div className="px-4 py-6 text-center text-gray-500">
                            <p className="text-sm">No new notifications</p>
                          </div>
                        ) : (
                          unreadMessages.map((msg) => (
                            <Link 
                              key={msg.id} 
                              to={`/${profile?.role}/messages`} 
                              onClick={() => setShowNotifications(false)}
                              className="block px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                            >
                              <p className="text-sm text-gray-900">
                                New message from <span className="font-bold">{msg.sender?.full_name || 'User'}</span>
                              </p>
                              <p className="text-xs text-gray-500 mt-1 truncate">{msg.message}</p>
                            </Link>
                          ))
                        )}
                      </div>
                      <div className="px-4 py-2 border-t border-gray-50 text-center">
                        <Link onClick={() => setShowNotifications(false)} to={`/${profile?.role}/messages`} className="text-xs text-primary font-medium hover:underline">View all notifications</Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Clickable Profile Button & Dropdown */}
                <div className="relative" ref={profileMenuRef}>
                  <button
                    type="button"
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-2.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 hover:border-primary/40 hover:bg-gray-50 transition-all shadow-xs focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-primary/10 border border-primary/20 flex-shrink-0 flex items-center justify-center">
                      <img 
                        src={profile?.profile_photo_url || "https://ui-avatars.com/api/?name=" + (profile?.full_name || 'User') + "&background=8A5F41&color=fff"} 
                        alt="User Avatar" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-800 max-w-[120px] truncate">
                      {profile?.full_name?.split(' ')[0] || 'User'}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showProfileMenu ? 'rotate-180 text-primary' : ''}`} />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {showProfileMenu && (
                    <div className="absolute top-full right-0 mt-2.5 w-52 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden py-1.5 animate-in fade-in-50 duration-150">
                      <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50/60">
                        <p className="text-xs font-semibold text-gray-900 truncate">{profile?.full_name || 'User'}</p>
                        <p className="text-[11px] text-gray-500 capitalize">{profile?.role || 'Member'}</p>
                      </div>

                      <Link
                        to={profile?.role === 'entrepreneur' ? '/entrepreneur/dashboard' : '/investor/dashboard'}
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center space-x-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors font-medium"
                      >
                        <LayoutDashboard className="w-4 h-4 text-primary" />
                        <span>Dashboard</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setShowProfileMenu(false);
                          handleSignOut();
                        }}
                        className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium text-left border-t border-gray-100 mt-1 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden transition-all duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile menu drawer */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-20 flex items-center justify-between px-4 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full overflow-hidden flex items-center justify-center shadow-sm">
              <img src="/Maalhub2.jpg" alt="MaalHub Logo" className="h-full w-full object-cover scale-125" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              <span className="text-text">Maal</span>
              <span className="text-primary">Hub</span>
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
          >
            <span className="sr-only">Close menu</span>
            <X className="block h-6 w-6" />
          </button>
        </div>

        <div className="px-4 py-4 space-y-2 overflow-y-auto flex-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                location.pathname === link.path
                  ? 'text-primary bg-primary/5 shadow-sm'
                  : 'text-gray-600 hover:text-primary hover:bg-gray-50'
              }`}
              onClick={() => setIsOpen(false)}
            >
              {Icon && <Icon size={20} className={location.pathname === link.path ? 'text-primary' : 'text-gray-400'} />}
              <span>{link.name}</span>
            </Link>
          )})}
          <div className="pt-4 mt-2 border-t border-gray-100 flex flex-col space-y-3">
            {!user ? (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 rounded-md text-base font-medium text-text border border-gray-200 text-center hover:bg-gray-50 transition-colors">Log In</Link>
                <Link to="/register" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 rounded-md text-base font-medium text-white bg-primary text-center hover:bg-[#7a5338] transition-colors">Sign Up</Link>
              </>
            ) : (
              <>
                {isDashboard ? (
                  <Link 
                    to={profile?.role === 'entrepreneur' ? '/entrepreneur/create-project' : '/investor/projects'} 
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2.5 rounded-md text-base font-medium text-white bg-primary text-center hover:bg-[#7a5338] transition-colors shadow-sm"
                  >
                    {profile?.role === 'entrepreneur' ? 'Create Project' : 'Browse Projects'}
                  </Link>
                ) : (
                  <Link 
                    to={profile?.role === 'entrepreneur' ? '/entrepreneur/dashboard' : '/investor/dashboard'} 
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2.5 rounded-md text-base font-medium text-white bg-primary text-center hover:bg-[#7a5338] transition-colors shadow-sm"
                  >
                    Dashboard
                  </Link>
                )}
                <button onClick={() => { handleSignOut(); setIsOpen(false); }} className="block w-full text-center px-3 py-2.5 rounded-md text-base font-medium text-red-600 border border-gray-200 hover:bg-red-50 transition-colors mt-2">Sign Out</button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

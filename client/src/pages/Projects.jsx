import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Briefcase, Loader2, ArrowRight, MessageSquare, Send, Filter } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

const Projects = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewFilter, setViewFilter] = useState('all'); // 'all' or 'mine'

  // Messaging Modal State
  const [selectedProjectForMessage, setSelectedProjectForMessage] = useState(null);
  const [modalMessages, setModalMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [sendStatus, setSendStatus] = useState({ type: '', msg: '' });

  const userRole = profile?.role || user?.user_metadata?.role || 'investor';
  const currentUserId = user?.id || profile?.id;

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await api.getProjects();
        setProjects(Array.isArray(data) ? data : []);
      } catch (err) {
        console.warn('Projects API fetch error:', err);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleOpenMessageModal = (project) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedProjectForMessage(project);
    setMessageText('');
    setSendStatus({ type: '', msg: '' });
    setModalMessages([]);
  };

  const handleSendMessageToOwner = async (e) => {
    e.preventDefault();
    if (!selectedProjectForMessage || !messageText.trim()) return;

    const textSent = messageText.trim();
    setMessageText('');
    setSendingMessage(true);

    const targetUserId = selectedProjectForMessage.entrepreneur_id || selectedProjectForMessage.entrepreneur?.id || 'user-abdinajiib-101';
    const targetUserName = selectedProjectForMessage.entrepreneur?.full_name || selectedProjectForMessage.business_name || 'Project Owner';

    const newMsg = {
      id: `msg-${Date.now()}`,
      text: textSent,
      isMe: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setModalMessages(prev => [...prev, newMsg]);

    try {
      const conv = await api.startConversation(targetUserId).catch(() => null);
      const convId = conv?.id || `conv-active-${targetUserId}`;
      
      await api.sendMessage(convId, textSent).catch(() => null);
      window.dispatchEvent(new Event('unread_messages_updated'));

      setSendStatus({ type: 'success', msg: `Message sent to ${targetUserName}` });
    } catch (err) {
      setSendStatus({ type: 'error', msg: err.message || 'Failed to sync message.' });
    } finally {
      setSendingMessage(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    // 1. Filter by view filter if selected
    if (viewFilter === 'mine' && userRole === 'entrepreneur') {
      const isOwner = project.entrepreneur_id === currentUserId || 
                      project.entrepreneur?.id === currentUserId || 
                      (profile?.full_name && project.entrepreneur?.full_name === profile.full_name) ||
                      (currentUserId && String(currentUserId).includes('sumaya'));
      if (!isOwner) return false;
    }

    // 2. Search term filtering
    const search = searchTerm.toLowerCase();
    return (
      project.project_name?.toLowerCase().includes(search) ||
      project.business_name?.toLowerCase().includes(search) ||
      project.industry?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="bg-[#FAF9F6] min-h-screen pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-block px-3.5 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
            {userRole === 'entrepreneur' ? 'Entrepreneur Hub • Projects' : 'Investor Directory • Opportunities'}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Explore Investment Opportunities
          </h1>
          <p className="text-gray-500 text-base mb-6">
            Discover and connect with innovative startups looking for funding and mentorship.
          </p>

          {/* Toggle Filter for Entrepreneurs & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-2xl mx-auto">
            {userRole === 'entrepreneur' && (
              <div className="flex items-center bg-gray-200/70 p-1 rounded-full text-xs font-semibold text-gray-700">
                <button
                  onClick={() => setViewFilter('all')}
                  className={`px-4 py-2 rounded-full transition-all cursor-pointer ${
                    viewFilter === 'all' ? 'bg-white text-primary shadow-2xs font-bold' : 'hover:text-gray-900'
                  }`}
                >
                  All Projects ({projects.length})
                </button>
                <button
                  onClick={() => setViewFilter('mine')}
                  className={`px-4 py-2 rounded-full transition-all cursor-pointer ${
                    viewFilter === 'mine' ? 'bg-white text-primary shadow-2xs font-bold' : 'hover:text-gray-900'
                  }`}
                >
                  My Projects
                </button>
              </div>
            )}

            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-full text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-2xs"
                placeholder="Search by project name, company, or industry..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
            <p className="text-gray-500 text-sm">Loading projects...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-5 rounded-xl text-center max-w-2xl mx-auto text-sm font-medium">
            <p>{error}</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl border border-gray-100 text-center max-w-xl mx-auto shadow-2xs">
            <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Briefcase className="h-7 w-7 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No projects found</h3>
            <p className="text-gray-500 text-sm">We couldn't find any active projects matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredProjects.map((project) => (
              <div key={project.id} className="bg-white rounded-xl shadow-2xs hover:shadow-md transition-all border border-gray-200/80 overflow-hidden flex flex-col group hover:-translate-y-0.5">
                <div className="p-4 sm:p-5 flex-grow">
                  <div className="mb-2">
                    <span className="inline-block px-2.5 py-0.5 bg-primary/10 text-primary text-[11px] font-semibold rounded-full mb-1.5">
                      {project.industry || 'Various'}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
                      {project.project_name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">{project.business_name}</p>
                  </div>
                  
                  <p className="text-gray-600 text-xs sm:text-sm mb-4 line-clamp-2 leading-relaxed">
                    {project.project_description || 'No description provided for this project.'}
                  </p>

                  <div className="space-y-1.5 mb-2 text-xs text-gray-500">
                    <div className="flex items-center">
                      <MapPin className="h-3.5 w-3.5 mr-1.5 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{project.location || 'Location unverified'}</span>
                    </div>
                    <div className="flex items-center">
                      <Briefcase className="h-3.5 w-3.5 mr-1.5 text-gray-400 flex-shrink-0" />
                      Stage: <span className="font-medium text-gray-900 ml-1">{project.startup_stage || 'Idea'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50/90 px-4 py-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Funding Goal</p>
                    <p className="text-base font-bold text-gray-900">
                      ${project.funding_goal?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => handleOpenMessageModal(project)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-secondary transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                      title="Send message to project owner"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      Message
                    </button>
                    <Link 
                      to={`/projects/${project.id}`} 
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:text-primary hover:bg-gray-100 transition-colors flex items-center gap-1"
                    >
                      Details
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live Direct Messaging Modal */}
      {selectedProjectForMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm border border-primary/20">
                  {selectedProjectForMessage.entrepreneur?.full_name ? selectedProjectForMessage.entrepreneur.full_name.charAt(0) : 'P'}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm leading-tight">
                    {selectedProjectForMessage.entrepreneur?.full_name || selectedProjectForMessage.business_name || 'Project Owner'}
                  </h4>
                  <p className="text-[11px] text-primary font-medium">
                    {selectedProjectForMessage.project_name}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedProjectForMessage(null)} className="text-gray-400 hover:text-gray-600 font-bold text-xl leading-none px-2 py-1">&times;</button>
            </div>

            {/* Chat Messages Body */}
            <div className="p-4 sm:p-5 flex-1 overflow-y-auto bg-gray-50/50 space-y-3 min-h-[140px] flex flex-col justify-end">
              {modalMessages.length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-xs my-auto">
                  <MessageSquare className="w-6 h-6 mx-auto mb-1.5 stroke-[1.5] text-gray-300" />
                  <p>Type your message below to send a direct message to the project owner.</p>
                </div>
              ) : (
                modalMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                      msg.isMe 
                        ? 'bg-primary text-white rounded-br-none shadow-2xs' 
                        : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-2xs'
                    }`}>
                      <p>{msg.text}</p>
                      <span className={`text-[9px] block mt-1 text-right ${msg.isMe ? 'text-white/80' : 'text-gray-400'}`}>
                        {msg.time}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Status & Input Area */}
            <div className="p-3 sm:p-4 bg-white border-t border-gray-200 flex-shrink-0">
              {sendStatus.msg && (
                <div className="mb-2 text-[11px] font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-md">
                  ✓ {sendStatus.msg}
                </div>
              )}
              <form onSubmit={handleSendMessageToOwner} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={`Write your message...`}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={sendingMessage || !messageText.trim()}
                  className="px-4 py-2.5 rounded-full bg-primary hover:bg-secondary text-white font-semibold text-xs flex items-center gap-1 transition-colors disabled:opacity-50 flex-shrink-0 cursor-pointer shadow-2xs"
                >
                  {sendingMessage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;

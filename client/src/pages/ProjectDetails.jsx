import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, Target, ChevronLeft, Loader2, DollarSign, Send, MessageSquare } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [proposedAmount, setProposedAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', msg: '' });

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        const data = await api.getProject(id);
        setProject(data);
      } catch (err) {
        setError(err.message || 'Failed to load project details');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-gray-500">Loading project details...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <div className="bg-red-50 text-red-600 p-8 rounded-xl max-w-lg text-center shadow-sm">
          <h2 className="text-2xl font-bold mb-2">Oops!</h2>
          <p className="mb-6">{error || 'Project not found.'}</p>
          <button onClick={() => navigate('/projects')} className="bg-primary hover:bg-secondary text-white px-6 py-2 rounded-lg font-medium transition-colors">
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const handleInvestmentSubmit = async (e) => {
    e.preventDefault();
    if (!proposedAmount || !message) {
      setSubmitStatus({ type: 'error', msg: 'Please fill in all fields.' });
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus({ type: '', msg: '' });
    
    try {
      await api.createInvestmentRequest({
        project_id: id,
        proposed_amount: parseFloat(proposedAmount),
        message: message
      });
      setSubmitStatus({ type: 'success', msg: 'Investment request sent successfully!' });
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitStatus({ type: '', msg: '' });
        setProposedAmount('');
        setMessage('');
      }, 2500);
    } catch (err) {
      setSubmitStatus({ type: 'error', msg: err.message || 'Failed to send request.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FAF9F6] min-h-screen pb-20">
      {/* Top Navigation Banner */}
      <div className="bg-white border-b border-gray-200 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button onClick={() => navigate(-1)} className="flex items-center text-sm font-medium text-gray-500 hover:text-primary transition-colors">
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-8 mb-12">
          <div className="flex-1">
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
              {project.industry || 'Various'}
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
              {project.project_name}
            </h1>
            <p className="text-xl text-gray-600 font-medium mb-6">
              {project.business_name}
            </p>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-gray-400" />
                {project.location || 'Location unverified'}
              </div>
              <div className="flex items-center">
                <Target className="w-5 h-5 mr-2 text-gray-400" />
                Stage: <span className="font-semibold text-gray-900 ml-1">{project.startup_stage || 'Idea'}</span>
              </div>
              <div className="flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-gray-400" />
                Added on: {new Date(project.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Funding Card */}
          <div className="w-full lg:w-80 bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex-shrink-0">
            <p className="text-sm font-medium text-gray-500 mb-1">Funding Goal</p>
            <h2 className="text-4xl font-black text-gray-900 mb-6 flex items-center">
              <DollarSign className="w-8 h-8 text-green-500 mr-1" />
              {project.funding_goal?.toLocaleString() || '0'}
            </h2>
            
            {user && profile?.role === 'investor' ? (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-primary hover:bg-secondary text-white py-3.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Request Investment
              </button>
            ) : !user ? (
              <Link to="/login" className="w-full block text-center bg-gray-900 hover:bg-gray-800 text-white py-3.5 rounded-xl font-bold transition-all shadow-md">
                Log in to Invest
              </Link>
            ) : (
              <div className="w-full text-center bg-gray-50 text-gray-500 py-3.5 rounded-xl font-medium border border-gray-100">
                You are viewing as an Entrepreneur
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Project Overview */}
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">Project Overview</h3>
              <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line font-medium">
                {project.project_description || 'No overview provided.'}
              </p>
            </section>

            {/* Business Details */}
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">Business Description</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {project.business_description || 'No additional business details provided.'}
              </p>
            </section>

            {/* Problem & Solution */}
            {(project.problem || project.solution) && (
              <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 grid md:grid-cols-2 gap-8">
                {project.problem && (
                  <div>
                    <h3 className="text-xl font-bold text-red-600 mb-4 flex items-center">
                      <span className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3 text-red-600">?</span>
                      The Problem
                    </h3>
                    <p className="text-gray-600 leading-relaxed">{project.problem}</p>
                  </div>
                )}
                {project.solution && (
                  <div>
                    <h3 className="text-xl font-bold text-green-600 mb-4 flex items-center">
                      <span className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3 text-green-600">!</span>
                      Our Solution
                    </h3>
                    <p className="text-gray-600 leading-relaxed">{project.solution}</p>
                  </div>
                )}
              </section>
            )}

          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            {/* Entrepreneur Profile */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6">About the Entrepreneur</h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-100 flex-shrink-0">
                  <img 
                    src={project.entrepreneur?.profile_photo_url || `https://ui-avatars.com/api/?name=${project.entrepreneur?.full_name || 'User'}&background=8A5F41&color=fff`} 
                    alt="Entrepreneur Avatar" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{project.entrepreneur?.full_name || 'Anonymous User'}</h4>
                  <p className="text-sm text-gray-500 flex items-center mt-1">
                    <MapPin className="w-3.5 h-3.5 mr-1" />
                    {project.entrepreneur?.city || ''}, {project.entrepreneur?.country || ''}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (!user) {
                    navigate('/login');
                    return;
                  }
                  const targetUserId = project.entrepreneur_id || project.entrepreneur?.id || 'user-abdinajiib-101';
                  const targetUserName = project.entrepreneur?.full_name || project.business_name || 'Project Owner';
                  
                  api.startConversation(targetUserId).catch(() => {});
                  navigate('/messages', {
                    state: {
                      targetUserId,
                      targetUserName
                    }
                  });
                }}
                className="w-full bg-primary/10 hover:bg-primary hover:text-white text-primary font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-2xs cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                Message Entrepreneur
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Investment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">Request Investment</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold text-xl">&times;</button>
            </div>
            
            <div className="p-6">
              {submitStatus.msg && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${submitStatus.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                  {submitStatus.msg}
                </div>
              )}
              
              <form onSubmit={handleInvestmentSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Proposed Amount (USD)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                    </div>
                    <input 
                      type="number"
                      min="1"
                      className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      placeholder="e.g. 5000"
                      value={proposedAmount}
                      onChange={(e) => setProposedAmount(e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message to Entrepreneur</label>
                  <textarea 
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder="Introduce yourself and explain why you're interested in funding this project..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
                
                <div className="pt-2 flex justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting || submitStatus.type === 'success'}
                    className="bg-primary hover:bg-secondary text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-70"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Send Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;

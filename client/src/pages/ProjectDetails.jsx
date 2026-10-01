import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  MapPin, 
  Target, 
  ChevronLeft, 
  Loader2, 
  DollarSign, 
  Send, 
  Layers, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
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
  const [selectedPhaseId, setSelectedPhaseId] = useState('');
  const [proposedAmount, setProposedAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', msg: '' });

  // Phase update loading state (for entrepreneur owners)
  const [phaseActionLoading, setPhaseActionLoading] = useState(null);

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

  const isOwner = user && project.entrepreneur_id === user.id;
  const isInvestor = user && profile?.role === 'investor';
  const phases = Array.isArray(project.phases) ? project.phases : [];

  const openInvestModalForPhase = (phaseId, suggestedAmount) => {
    setSelectedPhaseId(phaseId || '');
    if (suggestedAmount && suggestedAmount > 0) {
      setProposedAmount(suggestedAmount.toString());
    } else {
      setProposedAmount('');
    }
    setSubmitStatus({ type: '', msg: '' });
    setIsModalOpen(true);
  };

  const handleUpdatePhaseStatus = async (phaseId, newStatus) => {
    try {
      setPhaseActionLoading(phaseId);
      await api.updateProjectPhase(id, phaseId, { status: newStatus });
      setProject(prev => ({
        ...prev,
        phases: (prev.phases || []).map(p => p.id === phaseId ? { ...p, status: newStatus } : p)
      }));
    } catch (err) {
      alert(`Failed to update phase status: ${err.message}`);
    } finally {
      setPhaseActionLoading(null);
    }
  };

  const handleInvestmentSubmit = async (e) => {
    e.preventDefault();
    if (!proposedAmount || !message) {
      setSubmitStatus({ type: 'error', msg: 'Please fill in all required fields.' });
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus({ type: '', msg: '' });
    
    try {
      await api.createInvestmentRequest({
        project_id: id,
        proposed_amount: parseFloat(proposedAmount),
        message: message,
        phase_id: selectedPhaseId || null
      });
      setSubmitStatus({ type: 'success', msg: 'Investment proposal sent successfully!' });
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitStatus({ type: '', msg: '' });
        setProposedAmount('');
        setMessage('');
        setSelectedPhaseId('');
      }, 2500);
    } catch (err) {
      setSubmitStatus({ type: 'error', msg: err.message || 'Failed to send request.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPhase = phases.find(p => p.id === selectedPhaseId);

  return (
    <div className="bg-[#FAF9F6] min-h-screen pb-20">
      {/* Top Navigation Banner */}
      <div className="bg-white border-b border-gray-200 sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center text-sm font-medium text-gray-500 hover:text-primary transition-colors">
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back
          </button>
          {isOwner && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
              Your Project
            </span>
          )}
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
              {phases.length > 0 && (
                <div className="flex items-center text-primary font-medium">
                  <Layers className="w-5 h-5 mr-2 text-primary" />
                  {phases.length} Funding {phases.length === 1 ? 'Phase' : 'Phases'}
                </div>
              )}
            </div>
          </div>

          {/* Funding Card */}
          <div className="w-full lg:w-84 bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex-shrink-0">
            <p className="text-sm font-medium text-gray-500 mb-1">Total Funding Goal</p>
            <h2 className="text-4xl font-black text-gray-900 mb-6 flex items-center">
              <DollarSign className="w-8 h-8 text-green-500 mr-1" />
              {project.funding_goal?.toLocaleString() || '0'}
            </h2>
            
            {isInvestor ? (
              <button 
                onClick={() => openInvestModalForPhase('', null)}
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
                {isOwner ? 'You are the Owner' : 'Viewing as Entrepreneur'}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-10">

            {/* INVESTMENT PHASES & ROADMAP SECTION */}
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6 border-b pb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Layers className="w-6 h-6 text-primary" />
                    Investment Phases & Milestones
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Structured funding tranches and deliverables for this venture.
                  </p>
                </div>
              </div>

              {phases.length === 0 ? (
                <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <p className="text-gray-600 text-sm">
                    This project raises funding under a single general round of 
                    <span className="font-bold text-gray-900 ml-1">${project.funding_goal?.toLocaleString()}</span>.
                  </p>
                  {isInvestor && (
                    <button
                      onClick={() => openInvestModalForPhase('', project.funding_goal)}
                      className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
                    >
                      Make an investment offer <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {phases.map((phase, idx) => {
                    const currentAmt = Number(phase.current_amount || 0);
                    const targetAmt = Number(phase.target_amount || 1);
                    const percent = Math.min(100, Math.round((currentAmt / targetAmt) * 100));
                    const remainingAmt = Math.max(0, targetAmt - currentAmt);

                    const statusStyles = {
                      Active: {
                        badge: 'bg-blue-50 text-blue-700 border-blue-200',
                        dot: 'bg-blue-500 animate-pulse',
                        bar: 'bg-blue-600',
                      },
                      Funded: {
                        badge: 'bg-green-50 text-green-700 border-green-200',
                        dot: 'bg-green-500',
                        bar: 'bg-green-600',
                      },
                      Completed: {
                        badge: 'bg-emerald-50 text-emerald-800 border-emerald-300',
                        dot: 'bg-emerald-600',
                        bar: 'bg-emerald-600',
                      },
                      Upcoming: {
                        badge: 'bg-gray-100 text-gray-700 border-gray-200',
                        dot: 'bg-gray-400',
                        bar: 'bg-gray-300',
                      },
                    }[phase.status] || {
                      badge: 'bg-gray-100 text-gray-700 border-gray-200',
                      dot: 'bg-gray-400',
                      bar: 'bg-gray-400',
                    };

                    return (
                      <div 
                        key={phase.id || idx} 
                        className={`p-6 rounded-2xl border transition-all ${
                          phase.status === 'Active' 
                            ? 'bg-blue-50/20 border-blue-200 shadow-xs ring-1 ring-blue-100' 
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        {/* Phase Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center">
                              {phase.phase_number || idx + 1}
                            </span>
                            <div>
                              <h4 className="text-lg font-bold text-gray-900">{phase.title}</h4>
                              {phase.target_date && (
                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                  Target Milestone Date: {new Date(phase.target_date).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusStyles.badge}`}>
                              <span className={`w-2 h-2 rounded-full ${statusStyles.dot}`} />
                              {phase.status}
                            </span>

                            {/* Owner phase status switcher */}
                            {isOwner && (
                              <select
                                value={phase.status}
                                disabled={phaseActionLoading === phase.id}
                                onChange={(e) => handleUpdatePhaseStatus(phase.id, e.target.value)}
                                className="text-xs border border-gray-200 bg-white text-gray-700 rounded-lg px-2 py-1 outline-none font-medium hover:border-gray-300"
                              >
                                <option value="Upcoming">Upcoming</option>
                                <option value="Active">Active</option>
                                <option value="Funded">Funded</option>
                                <option value="Completed">Completed</option>
                              </select>
                            )}
                          </div>
                        </div>

                        {/* Phase Description */}
                        {phase.description && (
                          <p className="text-gray-600 text-sm mb-4 leading-relaxed pl-11">
                            {phase.description}
                          </p>
                        )}

                        {/* Financial Progress Bar */}
                        <div className="pl-11 mt-4">
                          <div className="flex justify-between items-center text-xs font-semibold text-gray-700 mb-1.5">
                            <span>
                              Raised: <strong className="text-gray-900">${currentAmt.toLocaleString()}</strong> of ${targetAmt.toLocaleString()}
                            </span>
                            <span className="text-primary font-bold">{percent}%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                            <div 
                              className={`h-2.5 transition-all duration-500 ${statusStyles.bar}`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>

                          {/* Action Button for Investors */}
                          {isInvestor && phase.status !== 'Funded' && phase.status !== 'Completed' && (
                            <div className="mt-4 flex justify-end">
                              <button
                                onClick={() => openInvestModalForPhase(phase.id, remainingAmt > 0 ? remainingAmt : targetAmt)}
                                className="inline-flex items-center gap-2 text-xs font-bold bg-primary hover:bg-secondary text-white px-4 py-2 rounded-lg shadow-xs transition"
                              >
                                <DollarSign className="w-3.5 h-3.5" />
                                Fund This Phase ({remainingAmt > 0 ? `$${remainingAmt.toLocaleString()} remaining` : `$${targetAmt.toLocaleString()}`})
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
            
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
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-100">
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
              {project.entrepreneur?.about && (
                <p className="text-sm text-gray-600 mt-4 pt-4 border-t border-gray-100">
                  {project.entrepreneur.about}
                </p>
              )}
            </div>

            {/* Quick Investment Overview */}
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-6 rounded-2xl border border-primary/20">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                <ShieldCheck className="w-4 h-4 text-primary" />
                MaalHub Investment Protection
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                By investing in specific milestone tranches, your funds align with verified startup progress and key deliverables.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Investment Proposal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-gray-900">Request Investment</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold text-xl">&times;</button>
            </div>
            
            <div className="p-6">
              {submitStatus.msg && (
                <div className={`mb-4 p-3 rounded-xl text-sm font-medium ${submitStatus.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                  {submitStatus.msg}
                </div>
              )}
              
              <form onSubmit={handleInvestmentSubmit} className="space-y-5">
                {/* Investment Target (Phase selection) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Investment Target (Tranche)
                  </label>
                  <select
                    value={selectedPhaseId}
                    onChange={(e) => {
                      const newPhaseId = e.target.value;
                      setSelectedPhaseId(newPhaseId);
                      const target = phases.find(p => p.id === newPhaseId);
                      if (target) {
                        const rem = Math.max(0, Number(target.target_amount) - Number(target.current_amount || 0));
                        if (rem > 0) setProposedAmount(rem.toString());
                      }
                    }}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm text-gray-800 bg-white"
                  >
                    <option value="">Whole Project (Overall Goal: ${project.funding_goal?.toLocaleString()})</option>
                    {phases.map((p) => {
                      const rem = Math.max(0, Number(p.target_amount) - Number(p.current_amount || 0));
                      return (
                        <option key={p.id} value={p.id}>
                          Phase {p.phase_number}: {p.title} (${p.target_amount?.toLocaleString()} - {p.status})
                        </option>
                      );
                    })}
                  </select>
                  
                  {selectedPhase && (
                    <div className="mt-2 p-3 bg-blue-50/70 rounded-lg border border-blue-100 text-xs text-blue-900">
                      <strong>Phase {selectedPhase.phase_number}:</strong> {selectedPhase.title}
                      <div className="mt-1 text-blue-700">
                        Target: ${selectedPhase.target_amount?.toLocaleString()} • 
                        Raised: ${Number(selectedPhase.current_amount || 0).toLocaleString()} • 
                        Remaining: ${Math.max(0, Number(selectedPhase.target_amount) - Number(selectedPhase.current_amount || 0)).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Proposed Investment Amount (USD) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <DollarSign className="h-4 w-4" />
                    </div>
                    <input 
                      type="number"
                      min="1"
                      required
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                      placeholder="e.g. 10000"
                      value={proposedAmount}
                      onChange={(e) => setProposedAmount(e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Proposal Message *
                  </label>
                  <textarea 
                    rows={4}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                    placeholder="Introduce yourself, propose your investment terms, and express interest in this phase..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
                
                <div className="pt-2 flex justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting || submitStatus.type === 'success'}
                    className="bg-primary hover:bg-secondary text-white px-6 py-2.5 text-sm rounded-xl font-bold transition-colors flex items-center gap-2 disabled:opacity-70 shadow-sm"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Send Investment Request
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

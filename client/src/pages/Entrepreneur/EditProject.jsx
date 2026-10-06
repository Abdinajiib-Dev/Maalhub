import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Trash2, 
  Plus, 
  Layers, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  TrendingUp, 
  AlertCircle,
  FolderOpen
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { PROJECT_CATEGORIES } from '../../constants/categories';
import ProjectProgressBar from '../../components/ProjectProgressBar';

const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Project form data
  const [formData, setFormData] = useState({
    project_name: '',
    business_name: '',
    industry: '',
    startup_stage: 'Idea',
    funding_goal: '',
    project_image_url: '',
    location: '',
    status: 'Published',
    progress_percentage: 0,
    project_description: '',
    business_description: '',
    problem: '',
    solution: '',
    target_market: '',
    competitive_advantage: '',
    business_model: '',
    revenue_model: '',
    funding_use: ''
  });

  // Phases state
  const [phases, setPhases] = useState([]);
  const [originalPhases, setOriginalPhases] = useState([]);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const data = await api.getProject(id);
        
        // Ownership check
        if (user && data.entrepreneur_id !== user.id) {
          setError('Permission denied: You can only edit projects you created.');
          setLoading(false);
          return;
        }

        setFormData({
          project_name: data.project_name || '',
          business_name: data.business_name || '',
          industry: data.industry || '',
          startup_stage: data.startup_stage || 'Idea',
          funding_goal: data.funding_goal ? data.funding_goal.toString() : '',
          project_image_url: data.project_image_url || '',
          location: data.location || '',
          status: data.status || 'Published',
          progress_percentage: data.progress_percentage ?? 0,
          project_description: data.project_description || '',
          business_description: data.business_description || '',
          problem: data.problem || '',
          solution: data.solution || '',
          target_market: data.target_market || '',
          competitive_advantage: data.competitive_advantage || '',
          business_model: data.business_model || '',
          revenue_model: data.revenue_model || '',
          funding_use: data.funding_use || ''
        });

        const projectPhases = Array.isArray(data.phases) ? data.phases : [];
        setPhases(projectPhases);
        setOriginalPhases(projectPhases);
      } catch (err) {
        setError(err.message || 'Failed to load project details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProject();
    }
  }, [id, user]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddPhase = () => {
    const goalNum = parseFloat(formData.funding_goal) || 0;
    const currentTotal = phases.reduce((sum, p) => sum + (parseFloat(p.target_amount) || 0), 0);
    const remaining = Math.max(0, goalNum - currentTotal);

    setPhases(prev => [
      ...prev,
      {
        id: `temp_${Date.now()}`,
        isNew: true,
        phase_number: prev.length + 1,
        title: `Phase ${prev.length + 1}`,
        description: '',
        target_amount: remaining > 0 ? remaining.toString() : '',
        status: prev.length === 0 ? 'Active' : 'Upcoming',
        target_date: ''
      }
    ]);
  };

  const handlePhaseChange = (index, field, value) => {
    setPhases(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemovePhase = async (index) => {
    const phaseToRemove = phases[index];
    if (phaseToRemove && !phaseToRemove.isNew && phaseToRemove.id) {
      if (!window.confirm(`Are you sure you want to remove ${phaseToRemove.title || 'this phase'}?`)) {
        return;
      }
      try {
        await api.deleteProjectPhase(id, phaseToRemove.id);
      } catch (err) {
        alert('Failed to delete phase from database: ' + err.message);
        return;
      }
    }
    setPhases(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const parsedFundingGoal = parseFloat(formData.funding_goal) || 0;
      const parsedProgress = Math.min(100, Math.max(0, parseInt(formData.progress_percentage, 10) || 0));

      const updatePayload = {
        ...formData,
        funding_goal: parsedFundingGoal,
        progress_percentage: parsedProgress,
        current_progress: `${parsedProgress}%`
      };

      // 1. Update project details
      await api.updateProject(id, updatePayload);

      // 2. Save / Update individual phases
      for (let i = 0; i < phases.length; i++) {
        const ph = phases[i];
        const phasePayload = {
          phase_number: i + 1,
          title: ph.title?.trim() || `Phase ${i + 1}`,
          description: ph.description || '',
          target_amount: parseFloat(ph.target_amount) || 0,
          status: ph.status || (i === 0 ? 'Active' : 'Upcoming'),
          target_date: ph.target_date || null
        };

        if (ph.isNew) {
          await api.addProjectPhase(id, phasePayload);
        } else if (ph.id) {
          await api.updateProjectPhase(id, ph.id, phasePayload);
        }
      }

      setSuccessMessage('Project information updated successfully!');
      setTimeout(() => {
        navigate(`/projects/${id}`);
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to update project information');
    } finally {
      setSaving(false);
    }
  };

  const selectedCategoryObj = PROJECT_CATEGORIES.find(c => c.name === formData.industry);
  const totalPhasesAmount = phases.reduce((sum, p) => sum + (parseFloat(p.target_amount) || 0), 0);
  const goalNum = parseFloat(formData.funding_goal) || 0;
  const remainingGoal = goalNum - totalPhasesAmount;

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="h-9 w-9 text-primary animate-spin mb-3" />
        <p className="text-gray-500 font-medium">Loading project information...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-gray-200">
        <div>
          <button 
            type="button" 
            onClick={() => navigate(-1)} 
            className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-primary mb-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Project
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            <span>Edit Project Information</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Update your startup details, fundraising goal, development progress, and phases.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link 
            to={`/projects/${id}`} 
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="bg-primary hover:bg-secondary text-white px-5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-70"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-emerald-800 text-sm font-semibold">{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Core Project Details */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-1">1. Basic Information</h2>
          <p className="text-xs text-gray-500 mb-5">Primary title, business entity, and fundraising classification.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Project Name / Title *
              </label>
              <input 
                type="text" 
                required
                value={formData.project_name} 
                onChange={(e) => handleInputChange('project_name', e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                placeholder="e.g. SolarHydro Smart Farming"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Company / Business Name
              </label>
              <input 
                type="text" 
                value={formData.business_name} 
                onChange={(e) => handleInputChange('business_name', e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                placeholder="e.g. SolarHydro Solutions Ltd."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Industry / Category *
              </label>
              <select 
                required
                value={formData.industry} 
                onChange={(e) => handleInputChange('industry', e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
              >
                <option value="">-- Select Category --</option>
                {PROJECT_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedCategoryObj && (
              <div className={`md:col-span-2 p-3.5 rounded-xl border flex items-center gap-3 transition-all ${selectedCategoryObj.badgeBg}`}>
                <selectedCategoryObj.icon className="w-5 h-5 shrink-0" />
                <div>
                  <h4 className="font-bold text-xs">{selectedCategoryObj.name}</h4>
                  <p className="text-[11px] opacity-85 mt-0.5">{selectedCategoryObj.description}</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Funding Goal (USD) *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 font-bold">$</span>
                <input 
                  type="number" 
                  min="1"
                  required
                  value={formData.funding_goal} 
                  onChange={(e) => handleInputChange('funding_goal', e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                  placeholder="50000"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Startup Stage
              </label>
              <select 
                value={formData.startup_stage} 
                onChange={(e) => handleInputChange('startup_stage', e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
              >
                <option value="Idea">Idea / Concept</option>
                <option value="Prototype">Prototype</option>
                <option value="MVP">MVP (Minimum Viable Product)</option>
                <option value="Early Revenue">Early Revenue</option>
                <option value="Growth">Growth & Scaling</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Location (City, Country)
              </label>
              <input 
                type="text" 
                value={formData.location} 
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                placeholder="e.g. Mogadishu, Somalia"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Publication Status
              </label>
              <select 
                value={formData.status} 
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white font-semibold focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
              >
                <option value="Published">Published (Visible to all investors)</option>
                <option value="Draft">Draft (Only visible to you)</option>
                <option value="Paused">Paused (Temporarily paused)</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Cover Image URL
              </label>
              <input 
                type="url" 
                value={formData.project_image_url} 
                onChange={(e) => handleInputChange('project_image_url', e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                placeholder="https://images.unsplash.com/photo-..."
              />
              {formData.project_image_url && (
                <div className="mt-3 w-32 h-20 rounded-xl overflow-hidden border border-gray-200 shadow-2xs">
                  <img src={formData.project_image_url} alt="Cover Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Project Development Progress */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              2. Development Progress
            </h2>
            <span className="text-xl font-black text-primary">{formData.progress_percentage}%</span>
          </div>
          <p className="text-xs text-gray-500 mb-4">Set your startup's development completion level from 0% to 100%.</p>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input 
                type="range" 
                min="0" 
                max="100" 
                step="5"
                value={formData.progress_percentage}
                onChange={(e) => handleInputChange('progress_percentage', parseInt(e.target.value, 10))}
                className="w-full h-2.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex items-center gap-1.5 shrink-0">
                <input 
                  type="number"
                  min="0"
                  max="100"
                  value={formData.progress_percentage}
                  onChange={(e) => handleInputChange('progress_percentage', parseInt(e.target.value, 10) || 0)}
                  className="w-16 px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm font-bold text-center"
                />
                <span className="text-xs font-bold text-gray-500">%</span>
              </div>
            </div>

            {/* Presets */}
            <div className="flex items-center gap-2">
              {[0, 25, 50, 75, 100].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleInputChange('progress_percentage', val)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    Number(formData.progress_percentage) === val
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {val}%
                </button>
              ))}
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <ProjectProgressBar progress={formData.progress_percentage} size="md" />
            </div>
          </div>
        </div>

        {/* Section 3: Investment Phases & Roadmap */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                3. Investment Phases & Roadmap
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Break down your total funding goal into sequential milestones.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddPhase}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-secondary bg-primary/10 hover:bg-primary/20 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Another Phase
            </button>
          </div>

          {/* Allocation math reminder */}
          <div className="mb-5 p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex flex-wrap justify-between items-center text-xs gap-3">
            <div>
              <span className="text-gray-500">Total Goal: </span>
              <strong className="text-gray-900 font-bold">${goalNum.toLocaleString()}</strong>
              <span className="mx-2 text-gray-300">|</span>
              <span className="text-gray-500">Phases Allocated: </span>
              <strong className="text-primary font-bold">${totalPhasesAmount.toLocaleString()}</strong>
            </div>
            <div>
              {remainingGoal === 0 ? (
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Fully Allocated (100%)
                </span>
              ) : remainingGoal > 0 ? (
                <span className="text-amber-700 font-medium">
                  ${remainingGoal.toLocaleString()} remaining unallocated
                </span>
              ) : (
                <span className="text-rose-700 font-medium">
                  Exceeds goal by ${Math.abs(remainingGoal).toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {phases.map((phase, index) => (
              <div key={phase.id || index} className="p-4 rounded-xl border border-gray-200 bg-gray-50/40 relative">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                      {index + 1}
                    </span>
                    <h3 className="font-bold text-sm text-gray-900">Phase {index + 1}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={phase.status || 'Upcoming'}
                      onChange={(e) => handlePhaseChange(index, 'status', e.target.value)}
                      className="text-xs border border-gray-200 bg-white text-gray-700 rounded-lg px-2.5 py-1 font-semibold outline-none"
                    >
                      <option value="Upcoming">Upcoming</option>
                      <option value="Active">Active</option>
                      <option value="Funded">Funded</option>
                      <option value="Completed">Completed</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleRemovePhase(index)}
                      className="text-gray-400 hover:text-red-500 p-1 transition-colors cursor-pointer"
                      title="Remove Phase"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Phase Title *</label>
                    <input
                      type="text"
                      required
                      value={phase.title || ''}
                      onChange={(e) => handlePhaseChange(index, 'title', e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-primary outline-none"
                      placeholder="e.g. Phase 1: Prototype Development"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Target Amount (USD) *</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 text-xs">$</span>
                      <input
                        type="number"
                        min="1"
                        required
                        value={phase.target_amount || ''}
                        onChange={(e) => handlePhaseChange(index, 'target_amount', e.target.value)}
                        className="w-full pl-7 pr-3 py-2 text-sm rounded-lg border border-gray-200 bg-white font-bold focus:ring-2 focus:ring-primary outline-none"
                        placeholder="25000"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Purpose & Deliverables</label>
                    <textarea
                      rows={2}
                      value={phase.description || ''}
                      onChange={(e) => handlePhaseChange(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-primary outline-none"
                      placeholder="Describe the key goals and deliverables funded by this tranche..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Target Completion Date</label>
                    <input
                      type="date"
                      value={phase.target_date ? String(phase.target_date).substring(0, 10) : ''}
                      onChange={(e) => handlePhaseChange(index, 'target_date', e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}

            {phases.length === 0 && (
              <div className="p-6 bg-gray-50 text-center rounded-xl border border-dashed border-gray-200 text-xs text-gray-500">
                No investment phases defined. Click "+ Add Another Phase" to create funding milestones.
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Detailed Pitch & Business Model */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-1">4. Business Information & Pitch</h2>
          <p className="text-xs text-gray-500 mb-5">Provide full venture context so investors understand your strategy.</p>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Short Pitch / Executive Summary *
              </label>
              <textarea 
                required
                rows={2}
                value={formData.project_description}
                onChange={(e) => handleInputChange('project_description', e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
                placeholder="A compelling 1-2 sentence pitch describing what your project does."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Full Business Description
              </label>
              <textarea 
                rows={4}
                value={formData.business_description}
                onChange={(e) => handleInputChange('business_description', e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
                placeholder="Describe your company, background, operations, and long-term vision..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  The Problem
                </label>
                <textarea 
                  rows={3}
                  value={formData.problem}
                  onChange={(e) => handleInputChange('problem', e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
                  placeholder="What specific pain point or market friction does your project address?"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  The Solution
                </label>
                <textarea 
                  rows={3}
                  value={formData.solution}
                  onChange={(e) => handleInputChange('solution', e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
                  placeholder="How does your solution uniquely resolve this issue?"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Target Market
                </label>
                <textarea 
                  rows={3}
                  value={formData.target_market}
                  onChange={(e) => handleInputChange('target_market', e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Who are your customers or target demographics?"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Competitive Advantage
                </label>
                <textarea 
                  rows={3}
                  value={formData.competitive_advantage}
                  onChange={(e) => handleInputChange('competitive_advantage', e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
                  placeholder="What makes your startup unique and hard to copy?"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Revenue / Business Model
                </label>
                <textarea 
                  rows={3}
                  value={formData.revenue_model}
                  onChange={(e) => handleInputChange('revenue_model', e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
                  placeholder="How does your business monetize and generate revenue?"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Use of Funds
                </label>
                <textarea 
                  rows={3}
                  value={formData.funding_use}
                  onChange={(e) => handleInputChange('funding_use', e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
                  placeholder="e.g. 40% Product development, 30% Marketing, 30% Working capital"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end items-center gap-3 pt-4 border-t border-gray-200">
          <Link 
            to={`/projects/${id}`} 
            className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="bg-primary hover:bg-secondary text-white px-7 py-2.5 text-sm font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-70"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save & Publish Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProject;

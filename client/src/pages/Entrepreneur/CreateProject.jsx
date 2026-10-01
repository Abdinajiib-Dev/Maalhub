import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Plus, Trash2, Layers, Calendar, DollarSign, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { PROJECT_CATEGORIES } from '../../constants/categories';

const CreateProject = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fundingGoalWatch = watch('funding_goal', '');

  // Investment Phases State
  const [phases, setPhases] = useState([
    {
      phase_number: 1,
      title: '',
      target_amount: '',
      description: '',
      target_date: '',
      status: 'Active'
    }
  ]);

  const handlePhaseChange = (index, field, value) => {
    setPhases(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddPhase = () => {
    const nextNum = phases.length + 1;
    setPhases(prev => [
      ...prev,
      {
        phase_number: nextNum,
        title: '',
        target_amount: '',
        description: '',
        target_date: '',
        status: 'Upcoming'
      }
    ]);
  };

  const handleRemovePhase = (index) => {
    if (phases.length <= 1) return;
    setPhases(prev =>
      prev.filter((_, i) => i !== index).map((p, i) => ({ ...p, phase_number: i + 1 }))
    );
  };

  const totalPhasesAmount = phases.reduce((sum, p) => sum + (parseFloat(p.target_amount) || 0), 0);
  const goalNum = parseFloat(fundingGoalWatch) || 0;
  const remainingGoal = goalNum - totalPhasesAmount;

  const handleAutoDistributeRemaining = () => {
    if (remainingGoal <= 0 || phases.length === 0) return;
    const lastIndex = phases.length - 1;
    const currentLastAmount = parseFloat(phases[lastIndex].target_amount) || 0;
    handlePhaseChange(lastIndex, 'target_amount', currentLastAmount + remainingGoal);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    try {
      // Clean and validate phases
      let validPhases = phases
        .filter(p => p.title.trim() || parseFloat(p.target_amount) > 0)
        .map((p, index) => ({
          phase_number: index + 1,
          title: p.title.trim() || `Phase ${index + 1}`,
          description: p.description?.trim() || '',
          target_amount: parseFloat(p.target_amount) || 0,
          current_amount: 0,
          status: index === 0 ? 'Active' : (p.status || 'Upcoming'),
          target_date: p.target_date || null
        }));

      // If user hasn't filled any phases, create a default Phase 1 with the full funding goal
      if (validPhases.length === 0 && parseFloat(data.funding_goal) > 0) {
        validPhases = [{
          phase_number: 1,
          title: 'Phase 1: Initial Growth & Launch',
          description: 'Initial funding tranche for milestone execution.',
          target_amount: parseFloat(data.funding_goal),
          current_amount: 0,
          status: 'Active',
          target_date: null
        }];
      }

      const payload = {
        ...data,
        funding_goal: parseFloat(data.funding_goal),
        phases: validPhases,
        // By default, let's publish it for simplicity, or we can make it a Draft.
        status: 'Published'
      };

      await api.createProject(payload);

      alert('Project with investment phases created successfully!');
      navigate('/entrepreneur/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="mb-8 border-b pb-4">
          <h1 className="text-3xl font-extrabold text-gray-900">Create New Project</h1>
          <p className="text-gray-500 mt-2">Provide the details of your startup to attract investors.</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Section 1: Basic Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="label">Project Title *</label>
                <input type="text" {...register("project_name", { required: true })} className="input-field" placeholder="e.g. Revolutionary AI Platform" />
                {errors.project_name && <span className="text-xs text-red-500">Project Title is required</span>}
              </div>

              <div>
                <label className="label">Category / Industry *</label>
                <select {...register("industry", { required: true })} className="input-field">
                  {PROJECT_CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {errors.industry && <span className="text-xs text-red-500">Category is required</span>}
              </div>

              <div>
                <label className="label">Funding Goal (USD) *</label>
                <input type="number" min="1" {...register("funding_goal", { required: true })} className="input-field" placeholder="50000" />
                {errors.funding_goal && <span className="text-xs text-red-500">Funding Goal is required</span>}
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Section 2: Investment Phases (Funding Tranches) */}
          <div className="bg-slate-50/70 p-6 sm:p-7 rounded-2xl border border-slate-200/80">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">2</span>
                  <Layers className="w-5 h-5 text-primary" />
                  Investment Phases (Funding Tranches)
                </h3>
              </div>

              <button
                type="button"
                onClick={handleAddPhase}
                className="inline-flex items-center gap-1.5 text-sm font-medium bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-3.5 py-1.5 rounded-lg shadow-2xs transition-colors"
              >
                <Plus className="w-4 h-4 text-primary" />
                Add Phase
              </button>
            </div>

            {/* Allocation Progress Bar & Math */}
            {goalNum > 0 && (
              <div className="mb-6 p-4 bg-white rounded-xl border border-gray-200">
                <div className="flex justify-between items-center text-xs font-semibold mb-2">
                  <span className="text-gray-600">Phases Allocation Progress</span>
                  <span className={remainingGoal === 0 ? "text-green-600 flex items-center gap-1" : remainingGoal > 0 ? "text-amber-600" : "text-red-600"}>
                    {remainingGoal === 0 ? (
                      <><CheckCircle2 className="w-3.5 h-3.5" /> 100% Allocated (${totalPhasesAmount.toLocaleString()})</>
                    ) : remainingGoal > 0 ? (
                      `$${totalPhasesAmount.toLocaleString()} of $${goalNum.toLocaleString()} (${remainingGoal.toLocaleString()} unassigned)`
                    ) : (
                      `Phases exceed goal by $${Math.abs(remainingGoal).toLocaleString()}`
                    )}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 transition-all duration-300 ${remainingGoal === 0 ? 'bg-green-500' : remainingGoal > 0 ? 'bg-primary' : 'bg-red-500'
                      }`}
                    style={{ width: `${Math.min(100, (totalPhasesAmount / goalNum) * 100)}%` }}
                  />
                </div>
                {remainingGoal > 0 && (
                  <div className="mt-2.5 flex items-center justify-end text-xs">
                    <button
                      type="button"
                      onClick={handleAutoDistributeRemaining}
                      className="text-primary hover:underline font-medium"
                    >
                      Fill remaining ${remainingGoal.toLocaleString()} to last phase
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Phase Cards */}
            <div className="space-y-4">
              {phases.map((phase, index) => (
                <div key={index} className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs relative">
                  <div className="flex justify-between items-center mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                      Phase {index + 1} {index === 0 && '• (Initial Active Phase)'}
                    </span>
                    {phases.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePhase(index)}
                        className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                        title="Remove Phase"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Phase Title *</label>
                      <input
                        type="text"
                        value={phase.title}
                        onChange={(e) => handlePhaseChange(index, 'title', e.target.value)}
                        placeholder="Phase Title"
                        className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Target Amount (USD) *</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                          <DollarSign className="w-4 h-4" />
                        </div>
                        <input
                          type="number"
                          min="1"
                          value={phase.target_amount}
                          onChange={(e) => handlePhaseChange(index, 'target_amount', e.target.value)}
                          placeholder="25000"
                          className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Purpose of Funds</label>
                      <textarea
                        rows={2}
                        value={phase.description}
                        onChange={(e) => handlePhaseChange(index, 'description', e.target.value)}
                        placeholder="Describe how the funds for this phase will be utilized..."
                        className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Target Completion Date</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <input
                          type="date"
                          value={phase.target_date || ''}
                          onChange={(e) => handlePhaseChange(index, 'target_date', e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Section 3: Detailed Descriptions */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Detailed Description</h3>
            <div className="space-y-6">
              <div>
                <label className="label">Short Pitch (Project Description) *</label>
                <textarea {...register("project_description", { required: true })} rows={2} className="input-field" placeholder="A 1-2 sentence pitch describing what your project does." />
                {errors.project_description && <span className="text-xs text-red-500">Short Pitch is required</span>}
              </div>

              <div>
                <label className="label">Full Business Description *</label>
                <textarea {...register("business_description", { required: true })} rows={4} className="input-field" placeholder="Describe your business in detail." />
                {errors.business_description && <span className="text-xs text-red-500">Business Description is required</span>}
              </div>

              <div>
                <label className="label">The Problem</label>
                <textarea {...register("problem")} rows={3} className="input-field" placeholder="What problem are you solving?" />
              </div>

              <div>
                <label className="label">The Solution</label>
                <textarea {...register("solution")} rows={3} className="input-field" placeholder="How does your product solve this problem?" />
              </div>
            </div>
          </div>



          <div className="flex justify-end pt-6 border-t border-gray-200 gap-4">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button
              type="submit"
              className="bg-primary hover:bg-secondary text-white px-8 py-2.5 text-sm font-bold rounded-xl shadow-md transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Publishing Project...' : 'Publish Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;

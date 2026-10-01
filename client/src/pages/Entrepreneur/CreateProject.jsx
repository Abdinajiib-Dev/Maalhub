import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { api } from '../../lib/api';
import { PROJECT_CATEGORIES } from '../../constants/categories';

const CreateProject = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const selectedCategoryName = watch("industry");
  const selectedCategoryObj = PROJECT_CATEGORIES.find(c => c.name === selectedCategoryName);

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...data,
        funding_goal: parseFloat(data.funding_goal),
        status: 'Published' 
      };

      await api.createProject(payload);
      
      alert('Project created successfully!');
      navigate('/entrepreneur/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
        <div className="mb-8 border-b pb-4">
          <h1 className="text-3xl font-extrabold text-gray-900">Create New Project</h1>
          <p className="text-gray-500 mt-2">Provide the details of your startup to attract investors across core project scope categories.</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Section 1: Basic Details & Category */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Basic Information & Category</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="label">Project Title *</label>
                <input 
                  type="text" 
                  {...register("project_name", { required: true })} 
                  className="input-field" 
                  placeholder="e.g. Modern Greenhouse Farming Initiative" 
                />
                {errors.project_name && <span className="text-xs text-red-500 font-medium">Project Title is required</span>}
              </div>

              {/* Project Category / Scope Select Dropdown */}
              <div className="md:col-span-2">
                <label className="label">Project Scope / Category *</label>
                <select 
                  {...register("industry", { required: true })} 
                  className="input-field bg-white"
                >
                  <option value="">-- Select Project Category --</option>
                  {PROJECT_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.industry && <span className="text-xs text-red-500 font-medium">Please select a project category</span>}

                {/* Selected Category Preview Banner */}
                {selectedCategoryObj && (
                  <div className={`mt-3 p-4 rounded-xl border flex items-start gap-3 transition-all ${selectedCategoryObj.badgeBg}`}>
                    <selectedCategoryObj.icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm">{selectedCategoryObj.name}</h4>
                      <p className="text-xs mt-0.5 opacity-90">{selectedCategoryObj.description}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="label">Funding Goal (USD) *</label>
                <input 
                  type="number" 
                  min="1" 
                  {...register("funding_goal", { required: true })} 
                  className="input-field" 
                  placeholder="e.g. 50000" 
                />
                {errors.funding_goal && <span className="text-xs text-red-500 font-medium">Funding Goal is required</span>}
              </div>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Section 2: Detailed Descriptions */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Detailed Description</h3>
            <div className="space-y-6">
              <div>
                <label className="label">Short Pitch (Project Description) *</label>
                <textarea 
                  {...register("project_description", { required: true })} 
                  rows={2} 
                  className="input-field" 
                  placeholder="A 1-2 sentence pitch describing what your project does." 
                />
                {errors.project_description && <span className="text-xs text-red-500 font-medium">Short Pitch is required</span>}
              </div>

              <div>
                <label className="label">Full Business Description *</label>
                <textarea 
                  {...register("business_description", { required: true })} 
                  rows={4} 
                  className="input-field" 
                  placeholder="Describe your business model, operations, and vision in detail." 
                />
                {errors.business_description && <span className="text-xs text-red-500 font-medium">Business Description is required</span>}
              </div>

              <div>
                <label className="label">The Problem</label>
                <textarea 
                  {...register("problem")} 
                  rows={3} 
                  className="input-field" 
                  placeholder="What key market challenge or problem are you solving?" 
                />
              </div>

              <div>
                <label className="label">The Solution</label>
                <textarea 
                  {...register("solution")} 
                  rows={3} 
                  className="input-field" 
                  placeholder="How does your project uniquely solve this problem?" 
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-gray-200 gap-4">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Publishing...' : 'Publish Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;

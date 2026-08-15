import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { api } from '../../lib/api';

const CreateProject = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...data,
        funding_goal: parseFloat(data.funding_goal),
        // By default, let's publish it for simplicity, or we can make it a Draft.
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

              <div className="md:col-span-2">
                <label className="label">Funding Goal (USD) *</label>
                <input type="number" min="1" {...register("funding_goal", { required: true })} className="input-field" placeholder="50000" />
                {errors.funding_goal && <span className="text-xs text-red-500">Funding Goal is required</span>}
              </div>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Section 2: Detailed Descriptions */}
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

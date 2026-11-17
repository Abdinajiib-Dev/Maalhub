import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  Plus, 
  Trash2, 
  Layers, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  Image as ImageIcon, 
  UploadCloud, 
  X, 
  Link as LinkIcon, 
  Loader2 
} from 'lucide-react';
import { api } from '../../lib/api';
import { PROJECT_CATEGORIES } from '../../constants/categories';
import { useDialog } from '../../contexts/DialogContext';

const CreateProject = () => {
  const { showAlert, toast } = useDialog();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      progress_percentage: 0,
      project_image_url: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Project Image Upload States
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [imageInputMode, setImageInputMode] = useState('file'); // 'file' or 'url'
  const [urlInput, setUrlInput] = useState('');

  const selectedCategoryName = watch("industry");
  const selectedCategoryObj = PROJECT_CATEGORIES.find(c => c.name === selectedCategoryName);

  const fundingGoalValue = watch("funding_goal");
  const goalNum = parseFloat(fundingGoalValue) || 0;

  const [phases, setPhases] = useState([
    { title: '', description: '', target_amount: '', target_date: '' }
  ]);

  const totalPhasesAmount = phases.reduce((sum, p) => sum + (parseFloat(p.target_amount) || 0), 0);
  const remainingGoal = goalNum - totalPhasesAmount;

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageUploadError('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageUploadError('Image size exceeds 5MB. Please choose a smaller image.');
      return;
    }

    setImageUploadError(null);
    setIsUploadingImage(true);

    try {
      const publicUrl = await api.uploadProjectImage(file);
      setValue('project_image_url', publicUrl);
      setPreviewUrl(publicUrl);
      toast.success('Project image uploaded successfully!');
    } catch (err) {
      console.warn('Supabase storage upload error, falling back to local preview:', err);
      // Fallback to base64 DataURL
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue('project_image_url', reader.result);
        setPreviewUrl(reader.result);
        toast.success('Project image loaded!');
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setValue('project_image_url', '');
    setPreviewUrl('');
    setUrlInput('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddPhase = () => {
    setPhases(prev => [
      ...prev,
      {
        title: '',
        description: '',
        target_amount: remainingGoal > 0 ? remainingGoal.toString() : '',
        target_date: ''
      }
    ]);
  };

  const handleRemovePhase = (index) => {
    setPhases(prev => prev.filter((_, i) => i !== index));
  };

  const handlePhaseChange = (index, field, value) => {
    setPhases(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAutoDistributeRemaining = () => {
    if (remainingGoal <= 0 || phases.length === 0) return;
    const lastIndex = phases.length - 1;
    const currentLastAmount = parseFloat(phases[lastIndex].target_amount) || 0;
    const newLastAmount = currentLastAmount + remainingGoal;

    handlePhaseChange(lastIndex, 'target_amount', newLastAmount.toString());
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    try {
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

      if (validPhases.length === 0 && parseFloat(data.funding_goal) > 0) {
        validPhases = [{
          phase_number: 1,
          title: 'Phase 1: Initial Growth & Launch',
          description: 'Initial funding tranche for phase execution.',
          target_amount: parseFloat(data.funding_goal),
          current_amount: 0,
          status: 'Active',
          target_date: null
        }];
      }

      const payload = {
        ...data,
        project_image_url: previewUrl || data.project_image_url || null,
        funding_goal: parseFloat(data.funding_goal),
        progress_percentage: 0,
        phases: validPhases,
        status: 'Published'
      };

      await api.createProject(payload);

      toast.success('Project created successfully!');
      navigate('/entrepreneur/projects');
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
          <p className="text-gray-500 mt-2">Provide the details of your startup to attract investors.</p>
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
                  placeholder="e.g. Revolutionary AI Platform" 
                />
                {errors.project_name && <span className="text-xs text-red-500 font-medium">Project Title is required</span>}
              </div>

              {/* Category Dropdown */}
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

              <div>
                <label className="label">Funding Goal (USD) *</label>
                <input 
                  type="number" 
                  min="1" 
                  {...register("funding_goal", { required: true })} 
                  className="input-field" 
                  placeholder="50000" 
                />
                {errors.funding_goal && <span className="text-xs text-red-500 font-medium">Funding Goal is required</span>}
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Section 2: Upload Project Image */}
          <div className="bg-primary/5 p-6 sm:p-7 rounded-2xl border border-primary/20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">2</span>
                  <ImageIcon className="w-5 h-5 text-primary" />
                  Project Cover Image
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Upload an engaging cover photo or banner for your startup to stand out to investors.
                </p>
              </div>

              {/* Mode Switcher */}
              <div className="flex items-center bg-white p-1 rounded-xl border border-gray-200 text-xs font-semibold shadow-2xs">
                <button
                  type="button"
                  onClick={() => setImageInputMode('file')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    imageInputMode === 'file'
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setImageInputMode('url')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    imageInputMode === 'url'
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Image URL
                </button>
              </div>
            </div>

            {imageUploadError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
                {imageUploadError}
              </div>
            )}

            {/* Display Image Preview if available */}
            {previewUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm group">
                <div className="relative w-full h-64 sm:h-72 bg-gray-100 flex items-center justify-center overflow-hidden">
                  <img
                    src={previewUrl}
                    alt="Project Cover Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-white/90 hover:bg-white text-gray-800 text-xs font-bold px-3.5 py-2 rounded-lg shadow-md transition-all flex items-center gap-1.5"
                    >
                      <UploadCloud className="w-4 h-4 text-primary" />
                      Change Image
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-md transition-all flex items-center gap-1.5"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-white flex justify-between items-center text-xs text-gray-500 border-t border-gray-100">
                  <span className="flex items-center gap-1.5 text-green-600 font-semibold">
                    <CheckCircle2 className="w-4 h-4" /> Cover image ready
                  </span>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="text-gray-400 hover:text-red-500 transition-colors font-medium"
                  >
                    Remove Image
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {imageInputMode === 'file' ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (e.dataTransfer.files?.[0]) {
                        handleImageFileChange({ target: { files: e.dataTransfer.files } });
                      }
                    }}
                    className="border-2 border-dashed border-primary/30 hover:border-primary bg-white rounded-2xl p-8 text-center cursor-pointer transition-all hover:shadow-xs group"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />

                    {isUploadingImage ? (
                      <div className="py-4 flex flex-col items-center">
                        <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
                        <p className="text-sm font-bold text-gray-800">Uploading Image...</p>
                        <p className="text-xs text-gray-500 mt-1">Please wait a moment</p>
                      </div>
                    ) : (
                      <div className="py-2 flex flex-col items-center">
                        <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <UploadCloud className="w-7 h-7" />
                        </div>
                        <p className="text-sm font-bold text-gray-800 mb-1">
                          Click to browse or drag & drop your project cover image
                        </p>
                        <p className="text-xs text-gray-500 max-w-sm">
                          Supports PNG, JPG, JPEG, WEBP up to 5MB (16:9 ratio recommended)
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white p-5 rounded-2xl border border-gray-200">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Direct Image URL
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                          <LinkIcon className="w-4 h-4" />
                        </div>
                        <input
                          type="url"
                          placeholder="https://images.unsplash.com/photo-..."
                          value={urlInput}
                          onChange={(e) => {
                            setUrlInput(e.target.value);
                            if (e.target.value) {
                              setPreviewUrl(e.target.value);
                              setValue('project_image_url', e.target.value);
                            }
                          }}
                          className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                        />
                      </div>
                      {urlInput && (
                        <button
                          type="button"
                          onClick={() => {
                            setUrlInput('');
                            setPreviewUrl('');
                            setValue('project_image_url', '');
                          }}
                          className="p-2.5 text-gray-400 hover:text-gray-600 rounded-xl border border-gray-200 hover:bg-gray-50 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-2">
                      Paste a direct HTTPS link to an image on the web (e.g. Unsplash, Cloudinary, AWS S3).
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <hr className="border-gray-100" />

          {/* Section 3: Investment Phases */}
          <div className="bg-slate-50/70 p-6 sm:p-7 rounded-2xl border border-slate-200/80">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">3</span>
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
                    className={`h-2.5 transition-all duration-300 ${remainingGoal === 0 ? 'bg-green-500' : remainingGoal > 0 ? 'bg-primary' : 'bg-red-500'}`}
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
                        placeholder={`e.g. Phase ${index + 1}: Prototype & Launch`}
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

          {/* Section 4: Detailed Descriptions */}
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

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import { API_URL } from '../../lib/api';
import TermsContent from '../../components/TermsContent';
import PrivacyContent from '../../components/PrivacyContent';
import { PROJECT_CATEGORIES } from '../../constants/categories';
import { 
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  FileText, 
  ShieldCheck,
  Briefcase,
  Check,
  Globe
} from 'lucide-react';

const INVESTOR_CATEGORIES = [
  {
    id: 'All',
    name: 'All',
    description: 'Interested in exploring and investing across all industries and sectors.',
    icon: Globe,
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    accentColor: 'text-emerald-600',
  },
  ...PROJECT_CATEGORIES,
];

const Register = () => {
  const [role, setRole] = useState(null); // 'entrepreneur' | 'investor'
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Policy agreement states for Step 2
  const [activePolicyTab, setActivePolicyTab] = useState('terms'); // 'terms' | 'privacy'
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [rejectedNotice, setRejectedNotice] = useState(false);
  const [policyValidationError, setPolicyValidationError] = useState('');

  // Investor Category Selection (1 or 2 selections only)
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categoryError, setCategoryError] = useState('');

  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, watch, trigger, setValue } = useForm({
    shouldUnregister: false,
    defaultValues: {
      terms: false
    }
  });

  // Watch password to check confirm password
  const password = watch('password');

  const handleCategoryToggle = (catName) => {
    if (catName === 'All') {
      if (selectedCategories.includes('All')) {
        setSelectedCategories([]);
        setCategoryError('Please choose "All" or select one or more categories.');
      } else {
        setSelectedCategories(['All']);
        setCategoryError('');
      }
      return;
    }

    // Selecting a specific category clears 'All' if it was active
    let updated = selectedCategories.filter((item) => item !== 'All');

    if (updated.includes(catName)) {
      updated = updated.filter((item) => item !== catName);
      setSelectedCategories(updated);
      if (updated.length === 0) {
        setCategoryError('Please choose "All" or select one or more categories.');
      } else {
        setCategoryError('');
      }
    } else {
      updated = [...updated, catName];
      setSelectedCategories(updated);
      setCategoryError('');
    }
  };

  const onSubmit = async (data) => {
    // Validate investor categories if role is investor (choose "All" or one or more specific categories)
    if (role === 'investor') {
      if (selectedCategories.length === 0) {
        setCategoryError('Please choose "All" or select one or more categories.');
        return;
      }
    }

    setLoading(true);
    setError(null);
    
    try {
      // 1. Register with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            full_name: data.full_name,
            role: role,
            target_industries: role === 'investor' ? selectedCategories : []
          }
        }
      });

      if (authError) throw authError;

      // 2. Call our backend to create the profile records
      const payload = {
        id: authData.user.id,
        email: data.email,
        full_name: data.full_name,
        date_of_birth: data.date_of_birth,
        city: data.city,
        country: data.country,
        role: role,
        // Role specific fields
        ...(role === 'entrepreneur' ? {
          startup_company_name: data.startup_company_name,
          industry: data.industry,
          startup_stage: data.startup_stage,
          funding_goal: parseFloat(data.funding_goal)
        } : {
          investor_type: data.investor_type,
          minimum_investment: parseFloat(data.minimum_investment),
          maximum_investment: parseFloat(data.maximum_investment),
          target_industries: selectedCategories,
          preferred_stages: data.preferred_stages ? [data.preferred_stages] : []
        })
      };

      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const contentType = response.headers.get('content-type') || '';
      let result = null;
      if (contentType.includes('application/json')) {
        try {
          result = await response.json();
        } catch (e) {
          result = null;
        }
      } else {
        const text = await response.text();
        if (text.trim().toLowerCase().startsWith('<!doctype') || text.includes('<html')) {
          throw new Error(`Server returned HTML response (${response.status}). Please check backend API server.`);
        }
        result = { error: text };
      }
      
      if (!response.ok) {
        throw new Error(result?.error || result?.message || 'Failed to create profile');
      }

      setIsSuccess(true);

    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptPolicies = () => {
    setAgreedTerms(true);
    setAgreedPrivacy(true);
    setValue('terms', true, { shouldValidate: true });
    setPolicyValidationError('');
    setRejectedNotice(false);
    setStep(3);
  };

  const handleNextFromPolicies = () => {
    if (!agreedTerms || !agreedPrivacy) {
      setPolicyValidationError('Please accept both the Terms & Conditions and Privacy Policy to continue.');
      return;
    }
    setValue('terms', true, { shouldValidate: true });
    setPolicyValidationError('');
    setStep(3);
  };

  const nextStep = async () => {
    if (step === 1 && role) {
      setStep(2);
    } else if (step === 2) {
      handleNextFromPolicies();
    } else if (step === 3) {
      const isValid = await trigger(['full_name', 'date_of_birth', 'email', 'city', 'country', 'password', 'confirm_password']);
      if (isValid) {
        setStep(4);
      }
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  if (isSuccess) {
    return (
      <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8 text-center">
           <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-green-500 w-8 h-8" />
           </div>
           <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Created!</h2>
           <p className="text-gray-600 mb-8">
             Your account has been created successfully. A verification link has been sent to your email. Please verify your email address to activate your account.
           </p>
           <Link to="/login" className="btn-primary w-full inline-block">
             Proceed to Login
           </Link>
        </div>
      </div>
    );
  }

  const stepsList = [
    { num: 1, label: 'Role' },
    { num: 2, label: 'Terms & Privacy' },
    { num: 3, label: 'Personal Info' },
    { num: 4, label: 'Profile Details' }
  ];

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-md p-6 sm:p-8">
        {/* Progress Header */}
        <div className="mb-8">
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Create an Account
          </h2>
          
          <div className="mt-6 max-w-xl mx-auto">
            <div className="flex items-center justify-between relative">
              {stepsList.map((item, idx) => (
                <React.Fragment key={item.num}>
                  <div className="flex flex-col items-center z-10">
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                        step > item.num 
                          ? 'bg-primary text-white shadow-sm' 
                          : step === item.num 
                            ? 'bg-primary text-white ring-4 ring-primary/20 shadow-sm' 
                            : 'bg-gray-100 text-gray-400 border border-gray-200'
                      }`}
                    >
                      {step > item.num ? '✓' : item.num}
                    </div>
                    <span className={`text-[11px] sm:text-xs mt-1 font-medium transition-colors text-center ${
                      step >= item.num ? 'text-primary' : 'text-gray-400'
                    }`}>
                      {item.label}
                    </span>
                  </div>
                  {idx < stepsList.length - 1 && (
                    <div 
                      className={`flex-1 h-0.5 -mt-5 mx-1 sm:mx-2 transition-all duration-300 ${
                        step > item.num ? 'bg-primary' : 'bg-gray-200'
                      }`} 
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* STEP 1: Select Role */}
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-xl font-medium text-center mb-6">I want to join as an...</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div 
                className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${role === 'entrepreneur' ? 'border-primary bg-primary/5 shadow-sm' : 'border-gray-200 hover:border-primary/50'}`}
                onClick={() => setRole('entrepreneur')}
              >
                <div className="text-center">
                  <div className="text-4xl mb-4">💡</div>
                  <h4 className="text-lg font-bold text-gray-900">Entrepreneur</h4>
                  <p className="mt-2 text-sm text-gray-500">I have a business or idea and I am looking for funding.</p>
                </div>
              </div>
              <div 
                className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${role === 'investor' ? 'border-secondary bg-secondary/5 shadow-sm' : 'border-gray-200 hover:border-secondary/50'}`}
                onClick={() => setRole('investor')}
              >
                <div className="text-center">
                  <div className="text-4xl mb-4">💼</div>
                  <h4 className="text-lg font-bold text-gray-900">Investor</h4>
                  <p className="mt-2 text-sm text-gray-500">I want to discover and invest in promising projects.</p>
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button 
                type="button"
                onClick={nextStep} 
                disabled={!role}
                className={`btn-primary ${!role ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Terms & Conditions and Privacy Policy (Before entering personal info) */}
        {step === 2 && (
          <div className="space-y-6">
            {rejectedNotice ? (
              <div className="text-center py-8 px-6 bg-red-50/80 border border-red-200 rounded-xl space-y-4">
                <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                  <XCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Terms & Policies Declined</h3>
                <p className="text-sm text-gray-600 max-w-md mx-auto">
                  To ensure safety, transparency, and legal compliance between entrepreneurs and investors, MaalHub requires all members to accept our Terms & Conditions and Privacy Policy before creating an account.
                </p>
                <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setRejectedNotice(false);
                      setPolicyValidationError('');
                    }}
                    className="btn-primary"
                  >
                    Review & Accept Policies
                  </button>
                  <Link
                    to="/"
                    className="btn-secondary text-center"
                  >
                    Return to Home
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="border-b border-gray-200 pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Terms & Privacy Policy</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Please review and accept our policies before providing your personal details.
                      </p>
                    </div>
                    <span className="hidden sm:inline-block text-xs font-semibold px-2.5 py-1 bg-primary/10 text-primary rounded-full capitalize">
                      {role}
                    </span>
                  </div>
                </div>

                {/* Tab switchers */}
                <div className="flex border-b border-gray-200 space-x-2">
                  <button
                    type="button"
                    onClick={() => setActivePolicyTab('terms')}
                    className={`flex items-center space-x-2 py-2.5 px-4 text-sm font-medium border-b-2 transition-all ${
                      activePolicyTab === 'terms'
                        ? 'border-primary text-primary bg-primary/5 rounded-t-lg'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Terms & Conditions</span>
                    {agreedTerms && <CheckCircle className="w-3.5 h-3.5 text-green-600 ml-1" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePolicyTab('privacy')}
                    className={`flex items-center space-x-2 py-2.5 px-4 text-sm font-medium border-b-2 transition-all ${
                      activePolicyTab === 'privacy'
                        ? 'border-primary text-primary bg-primary/5 rounded-t-lg'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Privacy Policy</span>
                    {agreedPrivacy && <CheckCircle className="w-3.5 h-3.5 text-green-600 ml-1" />}
                  </button>
                </div>

                {/* Scrollable Policy Viewer */}
                <div className="border border-gray-200 rounded-xl bg-gray-50/50 p-5 max-h-64 sm:max-h-72 overflow-y-auto shadow-inner text-sm leading-relaxed">
                  {activePolicyTab === 'terms' ? (
                    <div>
                      <div className="flex items-center justify-between pb-2 mb-4 border-b border-gray-200 text-xs text-gray-500">
                        <span className="font-semibold text-gray-800">MaalHub Platform Terms & Conditions</span>
                        <span>Scroll down to read</span>
                      </div>
                      <TermsContent />
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between pb-2 mb-4 border-b border-gray-200 text-xs text-gray-500">
                        <span className="font-semibold text-gray-800">MaalHub Platform Privacy Policy</span>
                        <span>Scroll down to read</span>
                      </div>
                      <PrivacyContent />
                    </div>
                  )}
                </div>

                {/* Explicit Acceptance Checkboxes */}
                <div className="space-y-3 pt-1">
                  <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={agreedTerms}
                      onChange={(e) => {
                        setAgreedTerms(e.target.checked);
                        if (e.target.checked && agreedPrivacy) setPolicyValidationError('');
                      }}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">
                      I have read, understood, and accept the{' '}
                      <button
                        type="button"
                        onClick={() => setActivePolicyTab('terms')}
                        className="text-primary font-semibold hover:underline"
                      >
                        Terms & Conditions
                      </button>
                      .
                    </span>
                  </label>

                  <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={agreedPrivacy}
                      onChange={(e) => {
                        setAgreedPrivacy(e.target.checked);
                        if (e.target.checked && agreedTerms) setPolicyValidationError('');
                      }}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">
                      I have read, understood, and accept the{' '}
                      <button
                        type="button"
                        onClick={() => setActivePolicyTab('privacy')}
                        className="text-primary font-semibold hover:underline"
                      >
                        Privacy Policy
                      </button>
                      .
                    </span>
                  </label>
                </div>

                {policyValidationError && (
                  <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{policyValidationError}</span>
                  </div>
                )}

                {/* Step 2 Action Buttons */}
                <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="btn-secondary w-full sm:w-auto"
                  >
                    Back
                  </button>

                  <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => setRejectedNotice(true)}
                      className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 border border-red-200 rounded-md transition-colors"
                    >
                      Decline / Reject
                    </button>

                    <button
                      type="button"
                      onClick={handleAcceptPolicies}
                      className="btn-primary w-full sm:w-auto flex items-center justify-center space-x-1.5"
                    >
                      <span>Accept & Continue</span>
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* STEP 3 & STEP 4: Personal Information & Profile Details Form */}
        {step >= 3 && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* STEP 3: Basic Info (Personal Information) */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-3 mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
                  <p className="text-sm text-gray-500 mt-1">Please enter your basic personal and contact information.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Full Legal Name *</label>
                    <input type="text" {...register("full_name", { required: true })} className="input-field" placeholder="Enter your full legal name" />
                    {errors.full_name && <span className="text-xs text-red-500">This field is required</span>}
                  </div>
                  <div>
                    <label className="label">Date of Birth *</label>
                    <input type="date" {...register("date_of_birth", { required: true })} className="input-field" />
                    {errors.date_of_birth && <span className="text-xs text-red-500">Must be 18+</span>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="label">Professional Email *</label>
                    <input type="email" {...register("email", { required: true })} className="input-field" placeholder="name@company.com" />
                    {errors.email && <span className="text-xs text-red-500">A valid email is required</span>}
                  </div>
                  <div>
                    <label className="label">City *</label>
                    <input type="text" {...register("city", { required: true })} className="input-field" placeholder="e.g. Mogadishu" />
                    {errors.city && <span className="text-xs text-red-500">City is required</span>}
                  </div>
                  <div>
                    <label className="label">Country *</label>
                    <input type="text" {...register("country", { required: true })} className="input-field" placeholder="e.g. Somalia" />
                    {errors.country && <span className="text-xs text-red-500">Country is required</span>}
                  </div>
                  <div>
                    <label className="label">Password *</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        {...register("password", { required: true, minLength: 8 })} 
                        className="input-field pr-10" 
                        placeholder="Minimum 8 characters"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-primary"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.password && <span className="text-xs text-red-500">Password must be at least 8 characters</span>}
                  </div>
                  <div>
                    <label className="label">Confirm Password *</label>
                    <div className="relative">
                      <input 
                        type={showConfirmPassword ? "text" : "password"} 
                        {...register("confirm_password", { validate: value => value === password || "Passwords do not match" })} 
                        className="input-field pr-10" 
                        placeholder="Re-enter your password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-primary"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.confirm_password && <span className="text-xs text-red-500">{errors.confirm_password.message}</span>}
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-gray-200">
                  <button type="button" onClick={prevStep} className="btn-secondary">Back to Policies</button>
                  <button type="button" onClick={nextStep} className="btn-primary">Next: Profile Details</button>
                </div>
              </div>
            )}

            {/* STEP 4: Role Specific Info & Submission */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-3 mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    {role === 'entrepreneur' ? 'Business Information' : 'Investment Profile'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {role === 'entrepreneur' 
                      ? 'Tell us about your venture to match with relevant investors.' 
                      : 'Provide your investment preferences to discover aligned projects.'}
                  </p>
                </div>
                
                {role === 'entrepreneur' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="label">Startup / Company Name *</label>
                      <input type="text" {...register("startup_company_name", { required: true })} className="input-field" placeholder="e.g. Somali Agrotech" />
                      {errors.startup_company_name && <span className="text-xs text-red-500">Startup name is required</span>}
                    </div>
                    <div>
                      <label className="label">Industry / Project Category *</label>
                      <select {...register("industry", { required: true })} className="input-field">
                        <option value="">Select Category...</option>
                        <option value="Agriculture">Agriculture</option>
                        <option value="Business">Business</option>
                        <option value="Hospitality & Tourism">Hospitality & Tourism</option>
                        <option value="Education">Education</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.industry && <span className="text-xs text-red-500">Industry is required</span>}
                    </div>
                    <div>
                      <label className="label">Startup Stage *</label>
                      <select {...register("startup_stage", { required: true })} className="input-field">
                        <option value="">Select Stage...</option>
                        <option value="Idea Phase">Idea Phase</option>
                        <option value="Pre-Seed">Pre-Seed</option>
                        <option value="Seed">Seed</option>
                        <option value="Early Revenue">Early Revenue</option>
                        <option value="Growth">Growth</option>
                      </select>
                      {errors.startup_stage && <span className="text-xs text-red-500">Startup stage is required</span>}
                    </div>
                    <div className="md:col-span-2">
                      <label className="label">Funding Goal (USD) *</label>
                      <input type="number" min="1" {...register("funding_goal", { required: true })} className="input-field" placeholder="e.g. 50000" />
                      {errors.funding_goal && <span className="text-xs text-red-500">Funding goal is required</span>}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-5">
                    <div>
                      <label className="label">Investor Type *</label>
                      <select {...register("investor_type", { required: true })} className="input-field">
                        <option value="">Select Investor Type...</option>
                        <option value="Individual / Angel Investor">Individual / Angel Investor</option>
                        <option value="Venture Capitalist">Venture Capitalist</option>
                        <option value="Corporate / Institution">Corporate / Institution</option>
                      </select>
                      {errors.investor_type && <span className="text-xs text-red-500">Investor type is required</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label">Min Investment ($)</label>
                        <input type="number" min="0" {...register("minimum_investment", { required: true })} className="input-field" placeholder="e.g. 5000" />
                      </div>
                      <div>
                        <label className="label">Max Investment ($)</label>
                        <input type="number" min="0" {...register("maximum_investment", { required: true })} className="input-field" placeholder="e.g. 100000" />
                      </div>
                    </div>

                    {/* Target Categories (Choose "All" or one or more specific categories) */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="label mb-0">
                          Target Categories *{' '}
                          <span className="text-xs text-gray-500 font-normal">
                            (Choose "All" or one or more categories)
                          </span>
                        </label>
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border transition-colors ${
                            selectedCategories.length === 0
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : selectedCategories.includes('All')
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {selectedCategories.includes('All')
                            ? 'All Categories Selected'
                            : selectedCategories.length === 0
                            ? '0 Selected'
                            : `${selectedCategories.length} Selected`}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-3">
                        Select "All" to explore investments across all sectors, or choose one or more specific categories.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {INVESTOR_CATEGORIES.map((cat) => {
                          const isSelected = selectedCategories.includes(cat.name);
                          const IconComponent = cat.icon;

                          return (
                            <div
                              key={cat.id}
                              onClick={() => handleCategoryToggle(cat.name)}
                              className={`relative p-3 rounded-xl border-2 cursor-pointer transition-all flex items-start space-x-3 select-none ${
                                cat.id === 'All' ? 'sm:col-span-2' : ''
                              } ${
                                isSelected
                                  ? 'border-primary bg-primary/5 shadow-sm'
                                  : 'border-gray-200 bg-white hover:border-primary/50 hover:bg-gray-50/50'
                              }`}
                            >
                              <div
                                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                  isSelected
                                    ? 'bg-primary text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {IconComponent && <IconComponent className="w-5 h-5" />}
                              </div>

                              <div className="flex-1 min-w-0 pr-6">
                                <div className="flex items-center space-x-2">
                                  <h4
                                    className={`text-sm font-semibold truncate ${
                                      isSelected ? 'text-primary' : 'text-gray-900'
                                    }`}
                                  >
                                    {cat.name}
                                  </h4>
                                  {cat.id === 'All' && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                                      Every Industry
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                                  {cat.description}
                                </p>
                              </div>

                              {/* Selection Indicator */}
                              <div
                                className={`absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                                  isSelected
                                    ? 'bg-primary text-white shadow-sm'
                                    : 'border border-gray-300 bg-white'
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {categoryError && (
                        <div className="flex items-center space-x-2 mt-2.5 text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{categoryError}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Confirmed Policy Acceptance Banner */}
                <div className="pt-4 border-t border-gray-200 mt-6 space-y-4">
                  <div className="p-3.5 bg-green-50/80 border border-green-200 rounded-lg flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-green-800 text-sm font-medium">
                      <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                      <span>Terms & Conditions and Privacy Policy Accepted</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      <button 
                        type="button" 
                        onClick={() => setShowTermsModal(true)}
                        className="text-primary hover:underline font-medium"
                      >
                        View Terms
                      </button>
                      <span className="text-gray-300">•</span>
                      <button 
                        type="button" 
                        onClick={() => setShowPrivacyModal(true)}
                        className="text-primary hover:underline font-medium"
                      >
                        View Privacy
                      </button>
                    </div>
                  </div>

                  <input type="hidden" {...register("terms", { required: true })} value="true" />
                </div>

                <div className="flex justify-between pt-4">
                  <button type="button" onClick={prevStep} className="btn-secondary" disabled={loading}>Back</button>
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Complete Registration'}
                  </button>
                </div>
              </div>
            )}
          </form>
        )}
        
        {step === 1 && (
          <p className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:text-secondary">
              Sign in
            </Link>
          </p>
        )}
      </div>

      {/* Read-Only Modal for Terms */}
      {showTermsModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowTermsModal(false)}
        >
          <div 
            className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Terms & Conditions</h2>
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                ✕
              </button>
            </div>
            <div className="mb-6">
              <TermsContent />
            </div>
            <button type="button" onClick={() => setShowTermsModal(false)} className="btn-primary w-full">Close</button>
          </div>
        </div>
      )}

      {/* Read-Only Modal for Privacy */}
      {showPrivacyModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPrivacyModal(false)}
        >
          <div 
            className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Privacy Policy</h2>
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                ✕
              </button>
            </div>
            <div className="mb-6">
              <PrivacyContent />
            </div>
            <button type="button" onClick={() => setShowPrivacyModal(false)} className="btn-primary w-full">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;

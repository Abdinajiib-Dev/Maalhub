import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import TermsContent from '../../components/TermsContent';
import PrivacyContent from '../../components/PrivacyContent';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';

const Register = () => {
  const [role, setRole] = useState(null); // 'entrepreneur' | 'investor'
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, watch, trigger } = useForm();

  // Watch password to check confirm password
  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    
    try {
      // 1. Register with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            role: role
          }
        }
      });

      if (authError) throw authError;

      // 2. Call our backend to create the profile records
      // In a real app, you might want to use a Supabase Edge Function or Database Trigger for this, 
      // but the prompt specified an Express backend API. 
      // Let's call the backend register route.
      
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
          target_industries: data.target_industries ? [data.target_industries] : [], // Simplified for now
          preferred_stages: data.preferred_stages ? [data.preferred_stages] : []
        })
      };

      const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');
      const response = await fetch(`${apiUrl}/auth/register`, {
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

  const nextStep = async () => {
    if (step === 1 && role) {
      setStep(2);
    } else if (step === 2) {
      const isValid = await trigger(['full_name', 'date_of_birth', 'email', 'city', 'country', 'password', 'confirm_password']);
      if (isValid) {
        setStep(3);
      }
    }
  };

  const prevStep = () => {
    setStep(step - 1);
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

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-md p-8">
        <div className="mb-8">
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Create an Account
          </h2>
          <div className="flex justify-center mt-4 space-x-2">
             <div className={`h-2 w-16 rounded ${step >= 1 ? 'bg-primary' : 'bg-gray-200'}`}></div>
             <div className={`h-2 w-16 rounded ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
             <div className={`h-2 w-16 rounded ${step >= 3 ? 'bg-primary' : 'bg-gray-200'}`}></div>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* STEP 1: Select Role */}
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-xl font-medium text-center mb-6">I want to join as an...</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div 
                className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${role === 'entrepreneur' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'}`}
                onClick={() => setRole('entrepreneur')}
              >
                <div className="text-center">
                  <div className="text-4xl mb-4">💡</div>
                  <h4 className="text-lg font-bold text-gray-900">Entrepreneur</h4>
                  <p className="mt-2 text-sm text-gray-500">I have a business or idea and I am looking for funding.</p>
                </div>
              </div>
              <div 
                className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${role === 'investor' ? 'border-secondary bg-secondary/5' : 'border-gray-200 hover:border-secondary/50'}`}
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
                onClick={nextStep} 
                disabled={!role}
                className={`btn-primary ${!role ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Form starting from Step 2 */}
        {step > 1 && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* STEP 2: Basic Info */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-xl font-medium mb-6">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Full Legal Name *</label>
                    <input type="text" {...register("full_name", { required: true })} className="input-field" />
                    {errors.full_name && <span className="text-xs text-red-500">This field is required</span>}
                  </div>
                  <div>
                    <label className="label">Date of Birth *</label>
                    <input type="date" {...register("date_of_birth", { required: true })} className="input-field" />
                     {errors.date_of_birth && <span className="text-xs text-red-500">Must be 18+</span>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="label">Professional Email *</label>
                    <input type="email" {...register("email", { required: true })} className="input-field" />
                  </div>
                  <div>
                    <label className="label">City *</label>
                    <input type="text" {...register("city", { required: true })} className="input-field" />
                  </div>
                  <div>
                    <label className="label">Country *</label>
                    <input type="text" {...register("country", { required: true })} className="input-field" />
                  </div>
                  <div>
                    <label className="label">Password *</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} {...register("password", { required: true, minLength: 8 })} className="input-field pr-10" />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-primary"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="label">Confirm Password *</label>
                    <div className="relative">
                      <input type={showConfirmPassword ? "text" : "password"} {...register("confirm_password", { validate: value => value === password || "Passwords do not match" })} className="input-field pr-10" />
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
                <div className="flex justify-between pt-4">
                  <button type="button" onClick={prevStep} className="btn-secondary">Back</button>
                  <button type="button" onClick={nextStep} className="btn-primary">Next</button>
                </div>
              </div>
            )}

            {/* STEP 3: Role Specific Info */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-xl font-medium mb-6">
                  {role === 'entrepreneur' ? 'Business Information' : 'Investment Profile'}
                </h3>
                
                {role === 'entrepreneur' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="label">Startup / Company Name *</label>
                      <input type="text" {...register("startup_company_name", { required: true })} className="input-field" />
                    </div>
                    <div>
                      <label className="label">Industry *</label>
                      <select {...register("industry", { required: true })} className="input-field">
                        <option value="">Select...</option>
                        <option value="FinTech">FinTech</option>
                        <option value="E-commerce">E-commerce</option>
                        <option value="HealthTech">HealthTech</option>
                        <option value="EdTech">EdTech</option>
                        <option value="Technology">Technology</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Startup Stage *</label>
                      <select {...register("startup_stage", { required: true })} className="input-field">
                        <option value="">Select...</option>
                        <option value="Idea Phase">Idea Phase</option>
                        <option value="Pre-Seed">Pre-Seed</option>
                        <option value="Seed">Seed</option>
                        <option value="Early Revenue">Early Revenue</option>
                        <option value="Growth">Growth</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="label">Funding Goal (USD) *</label>
                      <input type="number" min="1" {...register("funding_goal", { required: true })} className="input-field" placeholder="e.g. 50000" />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="label">Investor Type *</label>
                      <select {...register("investor_type", { required: true })} className="input-field">
                        <option value="">Select...</option>
                        <option value="Individual / Angel Investor">Individual / Angel Investor</option>
                        <option value="Venture Capitalist">Venture Capitalist</option>
                        <option value="Corporate / Institution">Corporate / Institution</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                        <label className="label">Min Investment</label>
                        <input type="number" min="0" {...register("minimum_investment", { required: true })} className="input-field" placeholder="0" />
                      </div>
                      <div>
                        <label className="label">Max Investment</label>
                        <input type="number" min="0" {...register("maximum_investment", { required: true })} className="input-field" placeholder="1000000" />
                      </div>
                    </div>
                     <div>
                      <label className="label">Target Industry (Primary) *</label>
                      <select {...register("target_industries", { required: true })} className="input-field">
                        <option value="">Select...</option>
                        <option value="FinTech">FinTech</option>
                        <option value="E-commerce">E-commerce</option>
                        <option value="HealthTech">HealthTech</option>
                        <option value="Technology">Technology</option>
                        <option value="Any">Any</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200 mt-6">
                  <div className="flex items-start mb-4">
                    <input type="checkbox" id="terms" {...register("terms", { required: true })} className="mt-1 mr-2" />
                    <label htmlFor="terms" className="text-sm text-gray-600">
                      I confirm I am at least 18 years old and agree to the <button type="button" onClick={() => setShowTerms(true)} className="text-primary hover:underline">Terms & Conditions</button> and <button type="button" onClick={() => setShowPrivacy(true)} className="text-primary hover:underline">Privacy Policy</button>. *
                    </label>
                  </div>
                  {errors.terms && <p className="text-xs text-red-500 mb-2">You must accept the terms to continue.</p>}
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

      {/* Modals */}
      {showTerms && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowTerms(false)}
        >
          <div 
            className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">Terms & Conditions</h2>
            <div className="mb-6">
              <TermsContent />
            </div>
            <button type="button" onClick={() => setShowTerms(false)} className="btn-primary w-full">Close</button>
          </div>
        </div>
      )}

      {showPrivacy && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPrivacy(false)}
        >
          <div 
            className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">Privacy Policy</h2>
            <div className="mb-6">
              <PrivacyContent />
            </div>
            <button type="button" onClick={() => setShowPrivacy(false)} className="btn-primary w-full">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;

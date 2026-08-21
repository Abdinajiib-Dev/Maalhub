import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Mail, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleResetRequest = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Check if the email exists in the profiles table
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .eq('email', email)
          .maybeSingle();
          
        if (!profileError && !profile) {
          setError('No account found with this email address.');
          setLoading(false);
          return;
        }
      } catch (checkErr) {
        // Ignore check errors (like network issues) and proceed to the actual reset attempt
      }

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) throw resetError;

      setSuccess(`A password reset link has been sent to ${email}`);
      setEmail('');
    } catch (err) {
      console.error(err);
      // For security reasons, we usually don't want to reveal if an email exists or not.
      // But if there's a genuine network/config error we can show it, otherwise show a generic message.
      if (err.message.includes('fetch')) {
        setError('Network error. Please try again later.');
      } else {
        setSuccess(`A password reset link has been sent to ${email}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail size={24} />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            Forgot Password?
          </h2>
          <p className="text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-lg flex items-start gap-3">
            <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 text-sm rounded-lg flex items-start gap-3">
            <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0" />
            <p>{success}</p>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleResetRequest}>
          <div>
            <label htmlFor="email-address" className="label block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !!success}
              className={`group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors ${loading || success ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  Sending...
                </span>
              ) : 'Send Reset Link'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm font-medium text-primary hover:text-secondary">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

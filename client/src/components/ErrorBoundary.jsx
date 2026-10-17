import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 max-w-md w-full text-center">
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
              <AlertCircle size={28} />
            </div>
            <h2 className="text-xl font-extrabold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              An unexpected error occurred while rendering this view. Please try refreshing or returning to the main page.
            </p>
            {this.state.error?.message && (
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-left mb-6 overflow-x-auto">
                <p className="text-[11px] font-mono text-gray-700 break-all">{this.state.error.message}</p>
              </div>
            )}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-secondary text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
              >
                <RefreshCw size={14} />
                Refresh Page
              </button>
              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                <Home size={14} />
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

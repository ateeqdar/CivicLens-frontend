import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6 bg-slate-50/50">
          <div className="max-w-md w-full bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 p-10 text-center">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <AlertTriangle className="h-10 w-10 text-rose-500" />
            </div>
            
            <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Something went wrong</h2>
            <p className="text-slate-500 font-medium mb-10 leading-relaxed">
              An unexpected error occurred while rendering this component. Our team has been notified.
            </p>

            <div className="flex flex-col gap-3">
              <button 
                onClick={() => window.location.reload()}
                className="flex items-center justify-center gap-2 py-4 bg-primary-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary-700 transition-all active:scale-95 shadow-lg shadow-primary-200"
              >
                <RotateCcw className="h-4 w-4" />
                Reload Page
              </button>
              
              <Link 
                to="/"
                onClick={() => this.setState({ hasError: false })}
                className="flex items-center justify-center gap-2 py-4 bg-slate-50 text-slate-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-100 transition-all"
              >
                <Home className="h-4 w-4" />
                Back to Safety
              </Link>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8 pt-8 border-t border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Error Details</p>
                <div className="bg-slate-50 p-4 rounded-xl text-left overflow-auto max-h-32">
                  <code className="text-xs text-rose-600 font-mono break-all">
                    {this.state.error?.toString()}
                  </code>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

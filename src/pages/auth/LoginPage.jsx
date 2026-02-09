import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { ROLES, DEPARTMENTS } from '../../constants';
import Navbar from '../../components/Navbar';
import { Mail, Lock, Building2, User, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { cn } from '../../utils/cn';

const LoginPage = () => {
  const [role, setRole] = useState(ROLES.CITIZEN);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Failed to login');
      setIsLoading(false);
    }
  };

  // Effect to handle navigation once user is loaded
  React.useEffect(() => {
    if (user) {
      if (user.role === ROLES.CITIZEN) {
        navigate('/citizen/dashboard');
      } else if (user.role === ROLES.HEAD_AUTHORITY) {
        navigate('/head-authority/dashboard');
      }
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <Navbar />
      
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary-50 rounded-full blur-[120px] opacity-60" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-60" />
      </div>

      <div className="relative pt-32 pb-20 px-4 flex justify-center items-center min-h-screen">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="text-center mb-10">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-[1.5rem] shadow-xl shadow-primary-200 mb-6"
            >
              <ShieldCheck className="h-8 w-8 text-white" />
            </motion.div>
            <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Welcome Back</h1>
            <p className="text-slate-500 font-medium text-lg">Access your CivicLens portal</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-white p-2">
            <div className="p-8">
              {/* Role Selector */}
              <div className="flex p-1.5 bg-slate-100/50 rounded-2xl mb-10 border border-slate-100">
                <button
                  onClick={() => setRole(ROLES.CITIZEN)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-black transition-all duration-300",
                    role === ROLES.CITIZEN 
                      ? "bg-white text-primary-600 shadow-xl shadow-slate-200/50 scale-[1.02]" 
                      : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  <User className="h-4 w-4" />
                  Citizen
                </button>
                <button
                  onClick={() => setRole(ROLES.HEAD_AUTHORITY)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-black transition-all duration-300",
                    role === ROLES.HEAD_AUTHORITY 
                      ? "bg-white text-primary-600 shadow-xl shadow-slate-200/50 scale-[1.02]" 
                      : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  <ShieldCheck className="h-4 w-4" />
                  Head Authority
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-2xl">
                    {error}
                  </div>
                )}
  

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative group">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-12 py-4 text-slate-900 font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all group-hover:border-slate-200"
                    />
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-hover:text-primary-500 transition-colors" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Password</label>
                    <button type="button" className="text-xs font-black text-primary-600 hover:text-primary-700">Forgot?</button>
                  </div>
                  <div className="relative group">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-12 py-4 text-slate-900 font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all group-hover:border-slate-200"
                    />
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-hover:text-primary-500 transition-colors" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary-500 transition-colors focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black hover:bg-primary-600 disabled:bg-slate-300 transition-all duration-300 shadow-xl shadow-slate-200 hover:shadow-primary-200 flex items-center justify-center gap-3 group mt-4"
                >
                  {isLoading ? 'Signing in...' : 'Sign Into Portal'}
                  {!isLoading && <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
                </motion.button>
              </form>
            </div>

            <div className="p-8 bg-slate-50/50 rounded-b-[2.3rem] border-t border-slate-100 text-center">
              <p className="text-slate-500 font-bold">
                New to CivicLens?{' '}
                <Link to="/signup" className="text-primary-600 hover:text-primary-700 underline decoration-2 underline-offset-4">
                  Create account
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;

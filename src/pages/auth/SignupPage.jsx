import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants';
import Navbar from '../../components/Navbar';
import { Mail, Lock, User, ArrowRight, ShieldCheck, Sparkles, Eye, EyeOff } from 'lucide-react';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup, user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await signup(email, password, name);
      // AuthContext will handle state change
    } catch (err) {
      setError(err.message || 'Failed to sign up');
      setIsLoading(false);
    }
  };

  // Effect to handle navigation once user is loaded
  React.useEffect(() => {
    if (user) {
      navigate('/citizen/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <Navbar />
      
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary-50 rounded-full blur-[120px] opacity-60" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-60" />
      </div>

      <div className="relative pt-24 md:pt-32 pb-12 md:pb-20 px-4 flex justify-center items-center min-h-screen">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="text-center mb-8 md:mb-10">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-primary-600 rounded-2xl md:rounded-[1.5rem] shadow-xl shadow-primary-200 mb-4 md:mb-6"
            >
              <Sparkles className="h-7 w-7 md:h-8 md:w-8 text-white" />
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 md:mb-3 tracking-tight">Join CivicLens</h1>
            <p className="text-slate-500 font-medium text-base md:text-lg">Empower your community today</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] md:rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-white p-1.5 md:p-2">
            <div className="p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
                {error && (
                  <div className="p-3 md:p-4 bg-red-50 border border-red-100 text-red-600 text-xs md:text-sm font-bold rounded-xl md:rounded-2xl">
                    {error}
                  </div>
                )}
                <div className="space-y-1.5 md:space-y-2">
                  <label className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative group">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl md:rounded-2xl px-11 md:px-12 py-3.5 md:py-4 text-sm md:text-base text-slate-900 font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all group-hover:border-slate-200"
                    />
                    <User className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-slate-300 group-hover:text-primary-500 transition-colors" />
                  </div>
                </div>

                <div className="space-y-1.5 md:space-y-2">
                  <label className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative group">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl md:rounded-2xl px-11 md:px-12 py-3.5 md:py-4 text-sm md:text-base text-slate-900 font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all group-hover:border-slate-200"
                    />
                    <Mail className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-slate-300 group-hover:text-primary-500 transition-colors" />
                  </div>
                </div>

                <div className="space-y-1.5 md:space-y-2">
                  <label className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                  <div className="relative group">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl md:rounded-2xl px-11 md:px-12 py-3.5 md:py-4 text-sm md:text-base text-slate-900 font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all group-hover:border-slate-200"
                    />
                    <Lock className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-slate-300 group-hover:text-primary-500 transition-colors" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 md:right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary-500 transition-colors focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4 md:h-5 md:w-5" /> : <Eye className="h-4 w-4 md:h-5 md:w-5" />}
                    </button>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-slate-900 text-white py-4 md:py-5 rounded-xl md:rounded-2xl font-black hover:bg-primary-600 disabled:bg-slate-300 transition-all duration-300 shadow-xl shadow-slate-200 hover:shadow-primary-200 flex items-center justify-center gap-2 md:gap-3 group mt-4"
                >
                  {isLoading ? 'Creating account...' : 'Create Account'}
                  {!isLoading && <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
                </motion.button>
              </form>
            </div>

            <div className="p-6 md:p-8 bg-slate-50/50 rounded-b-[1.8rem] md:rounded-b-[2.3rem] border-t border-slate-100 text-center">
              <p className="text-sm md:text-base text-slate-500 font-bold">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 hover:text-primary-700 underline decoration-2 underline-offset-4">
                  Sign in instead
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignupPage;

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  Camera, 
  LogOut, 
  User, 
  Menu, 
  X, 
  Bell, 
  Shield, 
  LayoutDashboard, 
  PlusCircle, 
  ClipboardList, 
  ShieldCheck, 
  Users,
  Settings,
  HelpCircle
} from 'lucide-react';
import { cn } from '../utils/cn';
import { NAV_LINKS, ROLES } from '../constants';

const ICON_MAP = {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  ShieldCheck,
  Users,
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isLandingPage = location.pathname === '/';
  const isDashboard = location.pathname.includes('/citizen/') || 
                      location.pathname.includes('/head-authority/');

  const links = user ? NAV_LINKS[user.role] || [] : [];

  return (
    <nav 
      className={cn(
        "fixed z-50 transition-all duration-500",
        isDashboard ? "left-0 md:left-72 right-0" : "w-full",
        isScrolled || !isLandingPage || isMobileMenuOpen
          ? "bg-white/90 backdrop-blur-xl border-b border-slate-100 py-3 shadow-lg shadow-slate-200/20" 
          : "bg-transparent py-6"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex justify-between items-center">
          {/* Logo - Hide on desktop dashboard if sidebar has it */}
          <Link to="/" className={cn(
            "flex items-center group gap-3 transition-all",
            isDashboard && "md:hidden"
          )}>
            <div className="relative">
              <div className="absolute inset-0 bg-primary-600 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="bg-slate-900 p-2 rounded-[1rem] relative z-10 group-hover:scale-110 transition-transform duration-500">
                <Camera className="h-6 w-6 text-white" />
              </div>
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              Civic<span className="text-primary-600">Lens</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {!user ? (
              <>
                <Link to="/transparency-wall" className="text-sm font-black text-slate-500 hover:text-primary-600 transition-colors uppercase tracking-widest">
                  Transparency Wall
                </Link>
                <div className="h-6 w-px bg-slate-200" />
                <Link to="/login" className="text-sm font-black text-slate-900 hover:text-primary-600 transition-colors uppercase tracking-widest">
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary-600 hover:shadow-xl hover:shadow-primary-200 transition-all active:scale-95"
                >
                  Join Community
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-6">
                <button className="relative p-2 text-slate-400 hover:text-primary-600 transition-colors">
                  <Bell className="h-6 w-6" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
                </button>
                
                <div className="h-8 w-px bg-slate-100" />
                
                <div className="flex items-center gap-4 bg-slate-50 p-1.5 pr-4 rounded-[1.5rem] border border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                    <User className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-900 leading-tight">
                      {user.name || user.email.split('@')[0]}
                    </span>
                    <span className="text-[10px] font-black text-primary-600 uppercase tracking-tighter">
                      {user.role === 'head_authority' ? 'Head Authority' : 
                       user.role}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-3 bg-white text-slate-400 hover:text-rose-600 hover:shadow-md rounded-xl transition-all border border-slate-100"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden p-2 bg-slate-50 rounded-xl text-slate-900"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-white border-t border-slate-100 overflow-y-auto max-h-[calc(100vh-80px)]"
          >
            <div className="px-4 py-8 flex flex-col gap-8">
              {!user ? (
                <>
                  <Link to="/transparency-wall" className="text-lg font-black text-slate-900 flex items-center gap-3">
                    <Shield className="h-5 w-5 text-primary-600" />
                    Transparency Wall
                  </Link>
                  <Link to="/login" className="text-lg font-black text-slate-900 flex items-center gap-3">
                    <User className="h-5 w-5 text-primary-600" />
                    Login
                  </Link>
                  <Link to="/signup" className="bg-primary-600 text-white p-5 rounded-2xl font-black text-center shadow-lg shadow-primary-200">
                    Join Community
                  </Link>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                      <User className="h-7 w-7 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-lg leading-tight">{user.name || user.email.split('@')[0]}</p>
                      <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest mt-1">
                        {user.role === 'head_authority' ? 'Head Authority' : user.role}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-2">Navigation</p>
                    {links.map((link) => {
                      const Icon = ICON_MAP[link.icon];
                      const isActive = location.pathname === link.to;
                      return (
                        <Link
                          key={link.to}
                          to={link.to}
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-2xl font-bold transition-all",
                            isActive 
                              ? "bg-primary-50 text-primary-600 border border-primary-100" 
                              : "text-slate-600 hover:bg-slate-50"
                          )}
                        >
                          {Icon && <Icon className="h-5 w-5" />}
                          {link.label}
                        </Link>
                      );
                    })}
                  </div>

                  <div className="grid gap-2 pt-4 border-t border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-2">Account</p>
                    <Link to="/settings" className="flex items-center gap-4 p-4 rounded-2xl font-bold text-slate-600">
                      <Settings className="h-5 w-5" />
                      Settings
                    </Link>
                    {user.role === ROLES.CITIZEN && (
                      <Link to="/help-center" className="flex items-center gap-4 p-4 rounded-2xl font-bold text-slate-600">
                        <HelpCircle className="h-5 w-5" />
                        Help Center
                      </Link>
                    )}
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-4 p-4 text-rose-600 rounded-2xl font-black mt-2 bg-rose-50"
                    >
                      <LogOut className="h-5 w-5" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

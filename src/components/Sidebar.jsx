import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  PlusCircle, 
  ClipboardList, 
  Settings, 
  ShieldCheck,
  MapPin,
  Users,
  LogOut,
  HelpCircle,
  Bell
} from 'lucide-react';
import { ROLES, NAV_LINKS } from '../constants';
import { cn } from '../utils/cn';

const ICON_MAP = {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  ShieldCheck,
  Users,
};

const Sidebar = ({ role }) => {
  const location = useLocation();

  const links = NAV_LINKS[role] || [];

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-white border-r border-slate-100 hidden md:flex flex-col z-50">
      {/* Logo Section */}
      <div className="h-24 flex items-center px-8 shrink-0">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200 group-hover:rotate-12 transition-transform duration-300">
            {role === ROLES.HEAD_AUTHORITY ? (
              <ShieldCheck className="text-white h-6 w-6" />
            ) : (
              <LayoutDashboard className="text-white h-6 w-6" />
            )}
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tight">
            Civic<span className="text-primary-600">Lens</span>
          </span>
        </Link>
      </div>

      <div className="flex-1 px-4 space-y-1.5 overflow-y-auto py-4 custom-scrollbar">
        <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
          Main Menu
        </p>
        
        {links.map((link) => {
          const Icon = ICON_MAP[link.icon];
          const isActive = location.pathname === link.to;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  "relative group flex items-center space-x-3 px-4 py-3.5 rounded-2xl font-bold transition-all duration-300 overflow-hidden",
                  isActive
                    ? "text-primary-600"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                )
              }
            >
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 bg-primary-50 border border-primary-100/50"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              <div className={cn(
                "relative z-10 p-2 rounded-xl transition-colors duration-300",
                isActive ? "bg-white shadow-sm text-primary-600" : "bg-transparent group-hover:bg-white group-hover:shadow-sm"
              )}>
                {Icon && <Icon className="h-5 w-5" />}
              </div>
              
              <span className="relative z-10 text-sm tracking-tight">{link.label}</span>
              
              {isActive && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute right-4 w-1.5 h-1.5 rounded-full bg-primary-600"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                />
              )}
            </NavLink>
          );
        })}

        <div className="pt-8">
          <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
            Preferences
          </p>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                "relative group flex items-center space-x-3 px-4 py-3.5 rounded-2xl font-bold transition-all duration-300 overflow-hidden",
                isActive
                  ? "text-primary-600"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 bg-primary-50 border border-primary-100/50"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <div className={cn(
                  "relative z-10 p-2 rounded-xl transition-colors duration-300",
                  isActive ? "bg-white shadow-sm text-primary-600" : "bg-transparent group-hover:bg-white group-hover:shadow-sm"
                )}>
                  <Settings className="h-5 w-5" />
                </div>
                <span className="relative z-10 text-sm tracking-tight">Settings</span>
                {isActive && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute right-4 w-1.5 h-1.5 rounded-full bg-primary-600"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  />
                )}
              </>
            )}
          </NavLink>
          {role === ROLES.CITIZEN && (
            <NavLink
              to="/help-center"
              className={({ isActive }) =>
                cn(
                  "relative group flex items-center space-x-3 px-4 py-3.5 rounded-2xl font-bold transition-all duration-300 overflow-hidden",
                  isActive
                    ? "text-primary-600"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="active-pill-help"
                      className="absolute inset-0 bg-primary-50 border border-primary-100/50"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <div className={cn(
                    "relative z-10 p-2 rounded-xl transition-colors duration-300",
                    isActive ? "bg-white shadow-sm text-primary-600" : "bg-transparent group-hover:bg-white group-hover:shadow-sm"
                  )}>
                    <HelpCircle className="h-5 w-5" />
                  </div>
                  <span className="relative z-10 text-sm tracking-tight">Help Center</span>
                  {isActive && (
                    <motion.div
                      layoutId="active-indicator-help"
                      className="absolute right-4 w-1.5 h-1.5 rounded-full bg-primary-600"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          )}
        </div>
      </div>
      
      <div className="p-6">
        <div className="bg-slate-900 rounded-[2rem] p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">System Live</span>
            </div>
            <p className="text-white font-bold text-sm mb-1">Indiranagar Zone</p>
            <p className="text-slate-400 text-xs font-medium mb-4">4 Active Reports</p>
            
            <button className="w-full py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all">
              View Analytics
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-50 rounded-full blur-[120px] opacity-50" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-emerald-50 rounded-full blur-[100px] opacity-40" />
      </div>

      <Navbar />
      
      <div className="flex relative z-10">
        <Sidebar role={user?.role} />
        
        <main className="flex-1 md:pl-72 min-h-screen transition-all duration-300">
          <div className="pt-28 pb-12 px-4 md:px-10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-7xl mx-auto"
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>

      {/* Footer / Status Bar - Optional but adds polish */}
      <footer className="md:pl-72 py-6 px-10 border-t border-slate-100 bg-white/50 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-xs font-bold uppercase tracking-widest">
          <p>© 2026 CivicLens Infrastructure. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-primary-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary-600 transition-colors">Terms of Service</a>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Network Stable</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout;

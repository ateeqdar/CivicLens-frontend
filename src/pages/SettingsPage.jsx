import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Shield, Bell, Lock, Palette, Info } from 'lucide-react';

const SettingsPage = () => {
  const { user } = useAuth();

  const renderCitizenSettings = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-100 space-y-8"
    >
      <h2 className="text-3xl font-black text-slate-900 mb-6">Citizen Settings</h2>
      
      {/* Profile Settings */}
      <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="p-4 bg-primary-100 rounded-xl">
          <User className="h-6 w-6 text-primary-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900">Profile Information</h3>
          <p className="text-slate-500 mt-1">Update your name, email, and contact details.</p>
        </div>
        <button className="ml-auto px-6 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors">Edit</button>
      </div>

      {/* Notification Settings */}
      <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="p-4 bg-emerald-100 rounded-xl">
          <Bell className="h-6 w-6 text-emerald-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900">Notification Preferences</h3>
          <p className="text-slate-500 mt-1">Manage how you receive updates on your reported issues.</p>
        </div>
        <button className="ml-auto px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors">Manage</button>
      </div>

      {/* Privacy Settings */}
      <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="p-4 bg-purple-100 rounded-xl">
          <Lock className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900">Privacy & Security</h3>
          <p className="text-slate-500 mt-1">Adjust your privacy settings and change your password.</p>
        </div>
        <button className="ml-auto px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors">Configure</button>
      </div>
    </motion.div>
  );

  const renderHeadAuthoritySettings = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-100 space-y-8"
    >
      <h2 className="text-3xl font-black text-slate-900 mb-6">Head Authority Settings</h2>
      
      {/* Department Management */}
      <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="p-4 bg-blue-100 rounded-xl">
          <Shield className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900">Department Management</h3>
          <p className="text-slate-500 mt-1">Add, edit, or remove departments and assign authorities.</p>
        </div>
        <button className="ml-auto px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">Manage</button>
      </div>

      {/* System Preferences */}
      <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="p-4 bg-orange-100 rounded-xl">
          <Palette className="h-6 w-6 text-orange-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900">System Preferences</h3>
          <p className="text-slate-500 mt-1">Configure global settings, AI parameters, and reporting options.</p>
        </div>
        <button className="ml-auto px-6 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors">Configure</button>
      </div>

      {/* Audit Logs */}
      <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="p-4 bg-red-100 rounded-xl">
          <Info className="h-6 w-6 text-red-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900">Audit Logs</h3>
          <p className="text-slate-500 mt-1">View system activity and user actions for compliance.</p>
        </div>
        <button className="ml-auto px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors">View Logs</button>
      </div>
    </motion.div>
  );

  if (!user) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-slate-700">Please log in to view settings.</h2>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-10">Settings</h1>
        
        {user.role === 'citizen' && renderCitizenSettings()}
        {user.role === 'head_authority' && renderHeadAuthoritySettings()}
        
        {/* Default/Fallback for other roles or if role is not defined */}
        {!user.role && (
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-100">
            <h2 className="text-3xl font-black text-slate-900 mb-6">General Settings</h2>
            <p className="text-slate-500">No specific settings available for your role.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;

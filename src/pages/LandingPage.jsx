import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { 
  Camera, MapPin, ShieldCheck, ArrowRight, 
  BarChart3, Sparkles, Zap, Users, Globe 
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white selection:bg-primary-100 selection:text-primary-900">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-50 rounded-full blur-[120px] opacity-60 animate-pulse"></div>
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-blue-50 rounded-full blur-[100px] opacity-50"></div>
        </div>

        <div className="max-w-7xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 bg-slate-900 text-white px-5 py-2.5 rounded-full mb-10 shadow-2xl shadow-slate-200"
          >
            <Sparkles className="h-4 w-4 text-primary-400 fill-primary-400" />
            <span className="text-xs font-black uppercase tracking-[0.2em]">Next-Gen Civic Platform</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black text-slate-900 tracking-tight mb-8 leading-[0.9]"
          >
            Empower Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-blue-600 to-indigo-600">
              Community Space
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto mb-12 leading-relaxed font-medium"
          >
            The world's first community-driven transparency platform for city management. 
            Report, track, and resolve civic issues with unprecedented speed.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-6"
          >
            <Link
              to="/signup"
              className="w-full sm:w-auto bg-primary-600 text-white px-10 py-5 rounded-2xl font-black text-xl hover:bg-primary-700 transition-all shadow-2xl shadow-primary-200 flex items-center justify-center gap-3 group active:scale-95"
            >
              Start Reporting
              <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/transparency-wall"
              className="w-full sm:w-auto bg-white text-slate-900 border-2 border-slate-100 px-10 py-5 rounded-2xl font-black text-xl hover:border-slate-900 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-sm"
            >
              <BarChart3 className="h-6 w-6" />
              Live Insights
            </Link>
          </motion.div>

          {/* Social Proof / Stats */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
          >
            <StatItem label="Issues Resolved" value="12k+" />
            <StatItem label="Active Citizens" value="45k+" />
            <StatItem label="Avg. Response" value="2.4h" />
            <StatItem label="Resolution Accuracy" value="99.2%" />
          </motion.div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 space-y-8">
              <h2 className="text-5xl font-black text-slate-900 leading-tight">
                Built for Transparency. <br />
                <span className="text-primary-600">Loved by Citizens.</span>
              </h2>
              <p className="text-xl text-slate-500 font-medium leading-relaxed">
                CivicLens bridges the gap between residents and authorities. 
                Every report is public, every action is logged, and every resolution is verified.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <TrustFeature icon={<Zap className="h-6 w-6" />} text="Instant Smart Sorting" />
                <TrustFeature icon={<Globe className="h-6 w-6" />} text="Public Resolution Log" />
                <TrustFeature icon={<Users className="h-6 w-6" />} text="Community Verification" />
                <TrustFeature icon={<ShieldCheck className="h-6 w-6" />} text="Secure Data Handling" />
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="absolute inset-0 bg-primary-600/5 rounded-[3rem] -rotate-3"></div>
              <div className="relative bg-slate-900 rounded-[3rem] p-8 shadow-2xl rotate-3 transition-transform hover:rotate-0 duration-700">
                <div className="space-y-6">
                  <div className="h-4 w-1/2 bg-white/10 rounded-full"></div>
                  <div className="space-y-3">
                    <div className="h-32 w-full bg-white/5 rounded-2xl"></div>
                    <div className="h-4 w-full bg-white/10 rounded-full"></div>
                    <div className="h-4 w-3/4 bg-white/10 rounded-full"></div>
                  </div>
                  <div className="flex gap-4">
                    <div className="h-12 w-1/2 bg-primary-600 rounded-xl"></div>
                    <div className="h-12 w-1/4 bg-white/5 rounded-xl"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-32 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">How it works</h2>
            <p className="text-xl text-slate-500 font-medium">Reporting an issue has never been this simple or effective.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <ProcessCard 
              step="01"
              icon={<Camera className="h-10 w-10 text-primary-600" />}
              title="Snap & Describe"
              description="Capture the issue and add a brief description. Our system understands context instantly."
            />
            <ProcessCard 
              step="02"
              icon={<MapPin className="h-10 w-10 text-primary-600" />}
              title="Auto-Coordinate"
              description="Location data and department routing are handled automatically by our smart engine."
            />
            <ProcessCard 
              step="03"
              icon={<ShieldCheck className="h-10 w-10 text-primary-600" />}
              title="Verify & Resolve"
              description="Track progress live on your dashboard and verify the resolution once completed."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-slate-900 text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12 pb-16 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-600 p-2.5 rounded-2xl shadow-xl shadow-primary-600/20">
                <Camera className="h-8 w-8 text-white" />
              </div>
              <span className="text-3xl font-black tracking-tighter">CivicLens</span>
            </div>
            <nav className="flex gap-10">
              <FooterLink text="Product" />
              <FooterLink text="Transparency" />
              <FooterLink text="Impact" />
              <FooterLink text="Contact" />
            </nav>
          </div>
          <div className="mt-16 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-slate-400 font-medium">
              © 2026 CivicLens. Forging the future of urban governance.
            </p>
            <div className="flex gap-6">
              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">
                <Globe className="h-5 w-5 text-slate-400" />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const StatItem = ({ label, value }) => (
  <div className="text-center">
    <div className="text-4xl font-black text-slate-900 mb-1">{value}</div>
    <div className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</div>
  </div>
);

const TrustFeature = ({ icon, text }) => (
  <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 group hover:border-primary-200 transition-colors">
    <div className="bg-white p-2 rounded-xl shadow-sm group-hover:text-primary-600 transition-colors">
      {icon}
    </div>
    <span className="font-bold text-slate-700">{text}</span>
  </div>
);

const ProcessCard = ({ step, icon, title, description }) => (
  <motion.div 
    whileHover={{ y: -10 }}
    className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 relative group"
  >
    <div className="absolute top-10 right-10 text-6xl font-black text-slate-50 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
      {step}
    </div>
    <div className="bg-primary-50 w-20 h-20 rounded-[1.5rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
      {icon}
    </div>
    <h3 className="text-2xl font-black text-slate-900 mb-4">{title}</h3>
    <p className="text-slate-500 font-medium leading-relaxed">{description}</p>
  </motion.div>
);

const FooterLink = ({ text }) => (
  <a href="#" className="text-slate-400 hover:text-white font-bold transition-colors">
    {text}
  </a>
);

export default LandingPage;

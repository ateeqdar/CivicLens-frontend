import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { ISSUE_STATUS } from '../constants';
import Badge from '../components/Badge';
import { issueService } from '../services/api';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  Building2, 
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Share2,
  AlertTriangle,
  Zap,
  Map as MapIcon,
  Loader2,
  Eye
} from 'lucide-react';
import { cn } from '../utils/cn';
import { formatStatus } from '../utils/format';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

const PublicIssueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await issueService.getIssueById(id);
        if (data) {
          setIssue(data);
        } else {
          setError('Issue not found');
        }
      } catch (err) {
        console.error('Fetch issue error:', err);
        setError(err.response?.status === 404 ? 'Issue not found' : 'Failed to load issue details');
      } finally {
        setLoading(false);
      }
    };
    fetchIssue();
  }, [id]);

  const getStatusVariant = (s) => {
    if (!s) return 'primary';
    switch (s.toLowerCase()) {
      case 'resolved': return 'success';
      case 'in_progress': return 'warning';
      default: return 'primary';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="h-12 w-12 text-primary-600 animate-spin" />
          <p className="text-slate-500 font-black">Loading issue details...</p>
        </div>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-2xl mx-auto py-32 text-center px-6">
          <div className="bg-red-50 w-24 h-24 rounded-[3rem] flex items-center justify-center mx-auto mb-8">
            <AlertTriangle className="h-12 w-12 text-red-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4">Error</h2>
          <p className="text-slate-500 text-lg font-medium mb-10">{error || 'Could not retrieve issue data.'}</p>
          <button onClick={() => navigate('/transparency-wall')} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black">
            Back to Transparency Wall
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />
      
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto px-6 pt-32 pb-20"
      >
        {/* Navigation & Header */}
        <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/transparency-wall')}
              className="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
            >
              <ArrowLeft className="h-6 w-6 text-slate-600 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
                <span>Transparency Wall</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-primary-600">{issue.id.slice(0, 8)}...</span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">{issue.issue_type || 'Civic Issue'}</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
              }}
              className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:bg-slate-50 transition-all"
            >
              <Share2 className="h-5 w-5 text-slate-600" />
            </button>
            <Badge variant={getStatusVariant(issue.status)} className="px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-current/5">
              {formatStatus(issue.status) || 'REPORTED'}
            </Badge>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Image Card */}
            <motion.div variants={item} className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
              <div className="relative group">
                <div className={cn(
                  "grid gap-1",
                  issue.status?.toLowerCase() === 'resolved' && issue.resolved_image_url ? "grid-cols-2" : "grid-cols-1"
                )}>
                  <div className="relative overflow-hidden group/img">
                    <img 
                      src={issue.image_url} 
                      alt="Original" 
                      className="w-full h-[500px] object-cover transition-transform duration-700 group-hover/img:scale-105" 
                    />
                    <div className="absolute top-8 left-8 bg-slate-900/80 backdrop-blur-md text-white px-5 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl border border-white/10">
                      Before
                    </div>
                  </div>

                  {issue.status?.toLowerCase() === 'resolved' && issue.resolved_image_url && (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="relative overflow-hidden group/img border-l border-slate-100"
                    >
                      <img 
                        src={issue.resolved_image_url} 
                        alt="Resolved" 
                        className="w-full h-[500px] object-cover transition-transform duration-700 group-hover/img:scale-105" 
                      />
                      <div className="absolute top-8 right-8 bg-emerald-500 text-white px-5 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        After (Resolved)
                      </div>
                    </motion.div>
                  )}
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className="absolute bottom-8 left-8 flex gap-4 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                  <a 
                    href={`https://www.google.com/maps?q=${issue.location_lat},${issue.location_lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 text-white font-black text-sm flex items-center gap-2 hover:bg-white/30 transition-colors"
                  >
                    <MapIcon className="h-4 w-4" />
                    Open in Maps
                  </a>
                </div>
              </div>
              
              <div className="p-10">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-10 pb-10 border-b border-slate-50">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Coordinates</p>
                    <div className="flex items-center gap-2 text-slate-900 font-bold">
                      <MapPin className="h-4 w-4 text-primary-500" />
                      <span className="truncate">{issue.location_lat?.toFixed(4)}, {issue.location_lng?.toFixed(4)}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reported On</p>
                    <div className="flex items-center gap-2 text-slate-900 font-bold">
                      <Calendar className="h-4 w-4 text-primary-500" />
                      {new Date(issue.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Report Source</p>
                    <div className="flex items-center gap-2">
                      {issue.ai_analysis?.is_manual ? (
                        <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-lg border border-amber-100 text-xs font-black uppercase tracking-widest">
                          <User className="h-3.5 w-3.5" />
                          Manual Report
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-600 rounded-lg border border-primary-100 text-xs font-black uppercase tracking-widest">
                          <Zap className="h-3.5 w-3.5" />
                          AI Detected
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">{issue.issue_type}</h2>
                  <p className="text-slate-600 text-lg leading-relaxed font-medium">
                    {issue.description}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Resolution Proof (If Resolved) */}
            {issue.status?.toLowerCase() === 'resolved' && issue.resolved_image_url && (
              <motion.div variants={item} className="bg-emerald-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-emerald-900/20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] -mr-32 -mt-32" />
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                      <CheckCircle2 className="h-7 w-7 text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black tracking-tight">Resolution Proof</h2>
                      <p className="text-emerald-400 text-sm font-medium">Issue marked as resolved by authorities</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="relative group rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
                      <img src={issue.resolved_image_url} alt="Resolution Proof" className="w-full h-[300px] object-cover" />
                      <a 
                        href={issue.resolved_image_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3"
                      >
                        <Eye className="h-6 w-6 text-white" />
                        <span className="text-white font-black uppercase tracking-widest text-xs">View Full Size</span>
                      </a>
                    </div>
                    <div className="space-y-6 flex flex-col justify-center">
                      <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Resolution Date</p>
                        <p className="text-xl font-black text-white">
                          {issue.resolved_at ? new Date(issue.resolved_at).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'Recently Resolved'}
                        </p>
                      </div>
                      <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Verification</p>
                        <p className="text-xl font-black text-white flex items-center gap-2">
                          <ShieldCheck className="h-5 w-5 text-emerald-400" />
                          Authority Verified
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-10">
            {/* Timeline/Progress Card */}
            <motion.div variants={item} className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 p-8">
              <h2 className="text-xl font-black text-slate-900 mb-8 tracking-tight">Issue Progress</h2>
              <div className="space-y-8 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                {[
                  { label: 'Reported', date: issue.created_at, icon: Clock, completed: true, color: 'text-primary-600', bg: 'bg-primary-50' },
                  { label: 'Verification', date: issue.created_at, icon: ShieldCheck, completed: true, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'In Progress', date: null, icon: Building2, completed: issue.status?.toLowerCase() !== 'reported', color: 'text-amber-600', bg: 'bg-amber-50' },
                  { label: 'Resolved', date: issue.resolved_at, icon: CheckCircle2, completed: issue.status?.toLowerCase() === 'resolved', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                ].map((step, idx) => (
                  <div key={idx} className="flex gap-6 relative">
                    <div className={cn(
                      "h-9 w-9 rounded-xl flex items-center justify-center shrink-0 z-10",
                      step.completed ? `${step.bg} ${step.color}` : "bg-slate-50 text-slate-300"
                    )}>
                      <step.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className={cn(
                        "font-black text-sm uppercase tracking-widest mb-1",
                        step.completed ? "text-slate-900" : "text-slate-300"
                      )}>
                        {step.label}
                      </p>
                      {step.date && (
                        <p className="text-xs font-bold text-slate-400">
                          {new Date(step.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Authority Card */}
            <motion.div variants={item} className="bg-slate-900 rounded-[2.5rem] p-8 text-white">
              <h2 className="text-xl font-black mb-6 tracking-tight">Assigned Authority</h2>
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="h-12 w-12 bg-primary-500 rounded-xl flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-black text-primary-400 uppercase tracking-widest mb-0.5">Department</p>
                  <p className="font-black text-lg">{issue.assigned_authority || 'General'}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PublicIssueDetail;

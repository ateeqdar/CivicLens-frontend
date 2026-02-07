import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { ISSUE_STATUS, ROLES } from '../../constants';
import Badge from '../../components/Badge';
import { issueService } from '../../services/api';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  Building2, 
  MessageSquare,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Share2,
  AlertTriangle,
  Zap,
  CheckCircle,
  TrendingUp,
  Map as MapIcon,
  Loader2,
  Upload,
  X,
  Eye,
  Camera,
  Trash2
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { formatStatus } from '../../utils/format';
import { supabase } from '../../lib/supabase';

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

const IssueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  const [proofImage, setProofImage] = useState(null);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isAuthority = user?.role === ROLES.HEAD_AUTHORITY;

  useEffect(() => {
    const fetchIssue = async () => {
      if (authLoading) return;
      
      try {
        setLoading(true);
        setError('');
        const data = await issueService.getIssueById(id);
        if (data) {
          setIssue(data);
          setStatus(data.status);
        } else {
          setError('Issue not found');
        }
      } catch (err) {
        console.error('Fetch issue error details:', {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message
        });
        const errorMessage = err.response?.data?.details || err.response?.data?.error || err.message;
        setError(err.response?.status === 404 ? `Issue not found (ID: ${id})` : `Error: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };
    fetchIssue();
  }, [id, authLoading]);

  const handleStatusChange = async (newStatus) => {
    if (newStatus === ISSUE_STATUS.RESOLVED) {
      setIsProofModalOpen(true);
      return;
    }

    try {
      setUpdating(true);
      await issueService.updateIssueStatus(id, newStatus);
      setStatus(newStatus);
      // Optional: Refresh issue data
    } catch (err) {
      console.error('Update status error:', err);
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleProofSubmit = async () => {
    if (!proofImage) {
      alert('Please upload a proof image');
      return;
    }

    setIsUploadingProof(true);
    try {
      // 1. Upload Proof Image to Supabase
      const fileExt = proofImage.name.split('.').pop();
      const fileName = `proofs/${id}_${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('issue-images')
        .upload(fileName, proofImage);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('issue-images')
        .getPublicUrl(fileName);

      // 2. Update status with proof URL
      await issueService.updateIssueStatus(id, ISSUE_STATUS.RESOLVED, publicUrl);
      
      // 3. Update local state
      setStatus(ISSUE_STATUS.RESOLVED);
      setIssue(prev => ({ ...prev, status: ISSUE_STATUS.RESOLVED, resolved_image_url: publicUrl }));
      setIsProofModalOpen(false);
      setProofImage(null);
    } catch (err) {
      console.error('Error submitting proof:', err);
      alert('Failed to submit proof. Please try again.');
    } finally {
      setIsUploadingProof(false);
    }
  };

  const handleDeleteIssue = async () => {
    try {
      setUpdating(true);
      await issueService.deleteIssue(id);
      alert('Issue deleted successfully!');
      navigate('/head-authority/management'); // Redirect to issue management page
    } catch (err) {
      console.error('Delete issue error:', err);
      alert('Failed to delete issue. Please try again.');
    } finally {
      setUpdating(false);
      setShowDeleteConfirm(false);
    }
  };

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
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="h-12 w-12 text-primary-600 animate-spin" />
          <p className="text-slate-500 font-black">Loading issue details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !issue) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto py-32 text-center">
          <div className="bg-red-50 w-24 h-24 rounded-[3rem] flex items-center justify-center mx-auto mb-8">
            <AlertTriangle className="h-12 w-12 text-red-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4">Error</h2>
          <p className="text-slate-500 text-lg font-medium mb-10">{error || 'Could not retrieve issue data.'}</p>
          <button onClick={() => navigate(-1)} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black">
            Return to Dashboard
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const timeline = [
    { label: 'Reported', date: issue.created_at, icon: Clock, completed: true, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'Verification', date: issue.created_at, icon: ShieldCheck, completed: true, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'In Progress', date: null, icon: Building2, completed: status?.toLowerCase() !== 'reported', color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Resolved', date: issue.resolved_at, icon: CheckCircle2, completed: status?.toLowerCase() === 'resolved', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <DashboardLayout>
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto pb-20"
      >
        {/* Navigation & Header */}
        <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
            >
              <ArrowLeft className="h-6 w-6 text-slate-600 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
                <span>Issue Tracking</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-primary-600">{issue.id}</span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">{issue.issue_type || 'Civic Issue'}</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:bg-slate-50 transition-all">
              <Share2 className="h-5 w-5 text-slate-600" />
            </button>
            <Badge variant={getStatusVariant(status)} className="px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-current/5">
              {formatStatus(status) || 'REPORTED'}
            </Badge>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Image Card - Side by Side comparison if resolved */}
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
                  <button 
                    onClick={() => {
                      const win = window.open();
                      win.document.write(`
                        <html>
                          <body style="margin:0; background:#0f172a; display:flex; gap:10px; padding:10px;">
                            <div style="flex:1; text-align:center;">
                              <h3 style="color:white; font-family:sans-serif;">BEFORE</h3>
                              <img src="${issue.image_url}" style="max-width:100%; border-radius:10px;">
                            </div>
                            ${issue.resolved_image_url ? `
                            <div style="flex:1; text-align:center;">
                              <h3 style="color:#10b981; font-family:sans-serif;">AFTER</h3>
                              <img src="${issue.resolved_image_url}" style="max-width:100%; border-radius:10px;">
                            </div>
                            ` : ''}
                          </body>
                        </html>
                      `);
                    }}
                    className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 text-white font-black text-sm flex items-center gap-2 hover:bg-white/30 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    Full Comparison
                  </button>
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
            {/* Status Control for Authority */}
            {isAuthority && (
              <motion.div variants={item} className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 p-8">
                <h2 className="text-xl font-black text-slate-900 mb-6 tracking-tight">Administrative Actions</h2>
                <div className="space-y-3">
                  {Object.values(ISSUE_STATUS).map((s) => (
                    <button
                      key={s}
                      disabled={updating}
                      onClick={() => handleStatusChange(s)}
                      className={cn(
                        "w-full py-4 px-6 rounded-2xl font-black text-sm transition-all border-2 text-left flex items-center justify-between group/btn disabled:opacity-50 disabled:cursor-not-allowed",
                        status?.toUpperCase() === s.toUpperCase() 
                          ? "bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-200" 
                          : "bg-slate-50 text-slate-500 border-transparent hover:border-primary-400 hover:text-primary-600"
                      )}
                    >
                      {formatStatus(s)}
                      {status?.toUpperCase() === s.toUpperCase() ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                      )}
                    </button>
                  ))}
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={updating}
                    className="w-full py-4 px-6 rounded-2xl font-black text-sm transition-all border-2 text-left flex items-center justify-between group/btn disabled:opacity-50 disabled:cursor-not-allowed bg-red-50 text-red-500 border-transparent hover:border-red-400 hover:text-red-600"
                  >
                    Delete Issue
                    <Trash2 className="h-5 w-5 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
              {showDeleteConfirm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999] flex items-center justify-center p-4"
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full text-center"
                  >
                    <Trash2 className="h-16 w-16 text-red-500 mx-auto mb-6" />
                    <h3 className="text-2xl font-black text-slate-900 mb-3">Confirm Deletion</h3>
                    <p className="text-slate-500 mb-8">Are you sure you want to delete this issue? This action cannot be undone.</p>
                    <div className="flex gap-4 justify-center">
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-6 py-3 rounded-xl font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDeleteIssue}
                        disabled={updating}
                        className="px-6 py-3 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updating ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progress Timeline */}
            <motion.div variants={item} className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 p-8">
              <h2 className="text-xl font-black text-slate-900 mb-8 tracking-tight">Progress Tracker</h2>
              <div className="space-y-10 relative">
                <div className="absolute left-7 top-2 bottom-2 w-1 bg-slate-50" />
                {timeline.map((step, idx) => (
                  <div key={step.label} className="flex gap-6 relative group">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center z-10 transition-all duration-500",
                      step.completed 
                        ? cn(step.bg, step.color, "shadow-lg shadow-current/10 ring-4 ring-white") 
                        : "bg-white text-slate-200 border-2 border-slate-50 ring-4 ring-white"
                    )}>
                      <step.icon className="h-7 w-7" />
                    </div>
                    <div className="flex-1 pt-1">
                      <p className={cn(
                        "font-black text-base transition-colors", 
                        step.completed ? "text-slate-900" : "text-slate-300"
                      )}>
                        {step.label}
                      </p>
                      <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
                        {step.date ? new Date(step.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Awaiting processing'}
                      </p>
                    </div>
                    {step.completed && (
                      <div className="absolute left-7 -bottom-10 w-1 h-10 bg-primary-500 transition-all duration-1000 origin-top" />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick Discussion / Comments Placeholder */}
            <motion.div variants={item} className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 text-center">
              <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <MessageSquare className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">Issue Discussion</h3>
              <p className="text-sm text-slate-500 font-medium mb-6">Connect with authorities and other citizens regarding this report.</p>
              <button className="w-full bg-white border border-slate-200 text-slate-700 py-4 rounded-2xl font-black hover:bg-slate-100 transition-all">
                Join Conversation
              </button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Resolution Proof Upload Modal */}
      <AnimatePresence>
        {isProofModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProofModalOpen(false)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="bg-emerald-100 p-3 rounded-2xl">
                      <Camera className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Resolution Proof</h3>
                      <p className="text-slate-500 text-sm font-medium">Upload an image of the fixed issue</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsProofModalOpen(false)}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    <X className="h-6 w-6 text-slate-400" />
                  </button>
                </div>

                <div className="space-y-8">
                  <div 
                    onClick={() => document.getElementById('proof-upload').click()}
                    className={cn(
                      "relative aspect-video rounded-[2rem] border-4 border-dashed transition-all cursor-pointer group overflow-hidden flex flex-col items-center justify-center gap-4",
                      proofImage ? "border-emerald-500 bg-emerald-50" : "border-slate-100 bg-slate-50 hover:border-primary-300 hover:bg-primary-50/30"
                    )}
                  >
                    {proofImage ? (
                      <>
                        <img 
                          src={URL.createObjectURL(proofImage)} 
                          alt="Proof preview" 
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-emerald-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2">
                            <Upload className="h-4 w-4 text-emerald-600" />
                            <span className="text-emerald-600 font-black text-xs uppercase tracking-widest">Change Image</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Upload className="h-8 w-8 text-slate-300 group-hover:text-primary-500 transition-colors" />
                        </div>
                        <div className="text-center">
                          <p className="text-slate-900 font-black uppercase tracking-widest text-xs mb-1">Select Proof Image</p>
                          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">JPG, PNG or WEBP (Max 5MB)</p>
                        </div>
                      </>
                    )}
                  </div>

                  <input 
                    id="proof-upload"
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setProofImage(e.target.files[0])}
                    className="hidden"
                  />

                  <div className="flex flex-col gap-3 pt-4">
                    <button
                      disabled={!proofImage || isUploadingProof}
                      onClick={handleProofSubmit}
                      className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all hover:bg-slate-800 active:scale-[0.98]"
                    >
                      {isUploadingProof ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Submit Resolution Proof
                          <ChevronRight className="h-5 w-5" />
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setIsProofModalOpen(false)}
                      className="w-full py-4 text-slate-400 font-black text-xs uppercase tracking-[0.2em] hover:text-slate-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default IssueDetail;

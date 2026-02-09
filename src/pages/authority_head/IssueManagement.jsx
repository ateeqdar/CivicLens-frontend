import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { ISSUE_STATUS, DEPARTMENTS } from '../../constants';
import Badge from '../../components/Badge';
import { issueService } from '../../services/api';
import { 
  Search, 
  Filter, 
  ArrowRight,
  ShieldAlert,
  Edit2,
  Trash2,
  CheckCircle2,
  ArrowRightLeft,
  LayoutGrid,
  List as ListIcon,
  MapPin,
  Calendar,
  AlertCircle,
  Inbox,
  ChevronRight,
  ExternalLink,
  Zap,
  User,
  Loader2,
  Camera,
  Upload,
  X,
  Eye
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { formatStatus } from '../../utils/format';
import { supabase } from '../../lib/supabase';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

const IssueManagement = () => {
  const { user, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterDept, setFilterDept] = useState(searchParams.get('dept') || 'All');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('detailed'); // 'table' or 'detailed'
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [proofImage, setProofImage] = useState(null);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [issueToDeleteId, setIssueToDeleteId] = useState(null);
  const [selectedIssues, setSelectedIssues] = useState([]); // New state for selected issues
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false); // New state for bulk delete confirmation

  const toggleIssueSelection = (issueId) => {
    setSelectedIssues(prevSelected => {
      const newSelected = prevSelected.includes(issueId)
        ? prevSelected.filter(id => id !== issueId)
        : [...prevSelected, issueId];
      return newSelected;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIssues(prevSelected => {
      const newSelected = prevSelected.length === filteredIssues.length && filteredIssues.length > 0
        ? []
        : filteredIssues.map(issue => issue.id);
      return newSelected;
    });
  };
  
  useEffect(() => {
    const fetchIssues = async () => {
      if (authLoading) return;
      try {
        const data = await issueService.getAuthorityIssues();
        const normalizedData = (data || []).map(issue => ({
          ...issue,
          status: issue.status || ISSUE_STATUS.REPORTED,
          priority: (issue.priority || 'medium').toLowerCase(),
          assigned_authority: issue.assigned_authority || issue.department || 'Unassigned',
          title: issue.title || issue.issue_type || 'Civic Issue',
          description: issue.description || '',
          location: (issue.location && typeof issue.location === 'object') ? issue.location : { address: 'Location pending...' },
          image: issue.image || issue.image_url || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=1000',
          resolved_image_url: issue.resolved_image_url || null,
          resolved_at: issue.resolved_at || null,
          createdAt: issue.createdAt || issue.created_at || new Date().toISOString()
        }));
        setIssues(normalizedData);
      } catch (err) {
        console.error('Error fetching issues:', err);
        setError('Failed to load issue data');
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, [authLoading]);

  const filteredIssues = issues.filter(issue => {
    const matchesDept = filterDept === 'All' || 
                          (filterDept.toLowerCase().includes((issue.assigned_authority || '').toLowerCase()) || 
                           filterDept.toLowerCase().includes((issue.department || '').toLowerCase()));
    const matchesSearch = (issue.title || '').toLowerCase().includes(search.toLowerCase()) || 
                          (issue.description || '').toLowerCase().includes(search.toLowerCase()) ||
                          (String(issue.id) || '').toLowerCase().includes(search.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const stats = [
    { label: 'Total Reports', value: issues.length, icon: Inbox, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'In Progress', value: issues.filter(i => (i.status || '').toLowerCase() === ISSUE_STATUS.IN_PROGRESS).length, icon: ArrowRight, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Critical Issues', value: issues.filter(i => (i.priority || '').toLowerCase() === 'high').length, icon: ShieldAlert, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  const handleStatusChange = async (issueId, newStatus) => {
    if (newStatus === ISSUE_STATUS.RESOLVED) {
      setSelectedIssueId(issueId);
      setIsProofModalOpen(true);
      return;
    }

    try {
      await issueService.updateIssueStatus(issueId, newStatus);
      setIssues(issues.map(issue => 
        issue.id === issueId ? { ...issue, status: newStatus } : issue
      ));
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleProofSubmit = async () => {
    if (!proofImage || !selectedIssueId) {
      return;
    }

    setIsUploadingProof(true);
    try {
      const fileExt = proofImage.name.split('.').pop();
      const fileName = `proofs/${selectedIssueId}_${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('issue-images')
        .upload(fileName, proofImage);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('issue-images')
        .getPublicUrl(fileName);
      
      const publicUrl = urlData.publicUrl.replace(/[`\s]/g, '').trim();

      await issueService.updateIssueStatus(selectedIssueId, ISSUE_STATUS.RESOLVED, publicUrl);
      
      setIssues(prevIssues => prevIssues.map(issue => 
        issue.id === selectedIssueId 
          ? { 
              ...issue, 
              status: ISSUE_STATUS.RESOLVED, 
              resolved_image_url: publicUrl,
              resolved_at: new Date().toISOString()
            } 
          : issue
      ));
      
      setIsProofModalOpen(false);
      setProofImage(null);
      setSelectedIssueId(null);
    } catch (err) {
      alert(`Failed to submit proof: ${err.message || 'Unknown error'}`);
    } finally {
      setIsUploadingProof(false);
    }
  };

  const handleSingleDeleteIssue = async () => {
    if (!issueToDeleteId) return;

    try {
      await issueService.deleteIssue(issueToDeleteId);
      setIssues(prevIssues => prevIssues.filter(issue => issue.id !== issueToDeleteId));
      alert('Issue deleted successfully!');
    } catch (err) {
      console.error('Delete issue error:', err);
      alert('Failed to delete issue. Please try again.');
    } finally {
      setShowDeleteConfirm(false);
      setIssueToDeleteId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIssues.length === 0) {
      console.log('No issues selected for bulk delete.');
      return;
    }

    try {
      await issueService.bulkDeleteIssues(selectedIssues);
      setIssues(prevIssues => prevIssues.filter(issue => !selectedIssues.includes(issue.id)));
      setSelectedIssues([]);
      alert(`${selectedIssues.length} issues deleted successfully!`);
    } catch (err) {
      console.error('Bulk delete error:', err);
      alert('Failed to delete selected issues. Please try again.');
    } finally {
      setShowBulkDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 text-primary-600 animate-spin mb-4" />
          <p className="text-slate-500 font-bold">Synchronizing global issue data...</p>
        </div>

      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto pb-20"
      >
        {/* Header Section */}
        <motion.div variants={item} className="mb-12 relative">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-100/40 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-100 shadow-sm text-primary-600 text-xs font-black uppercase tracking-widest">
                <ShieldAlert className="h-4 w-4" />
                Global Oversight
              </div>
              <h1 className="text-5xl font-black text-slate-900 tracking-tight">
                Issue <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">Command Center</span>
              </h1>
              <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">
                Review, reassign, and manage every civic report in the system. Ensure accountability across all departments.
              </p>
            </div>

            <div className="flex gap-4">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-white px-6 py-4 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex items-center gap-4">
                  <div className={cn("p-3 rounded-2xl", stat.bg, stat.color)}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Controls Bar */}
        <motion.div variants={item} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 mb-10">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="relative flex-1 group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search issues by title, ID, or description..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-[1.5rem] pl-14 pr-6 py-4 text-slate-900 font-medium placeholder:text-slate-400 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <select 
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                  className="bg-slate-50 border-none rounded-[1.25rem] pl-10 pr-10 py-4 text-sm font-black text-slate-700 appearance-none focus:ring-4 focus:ring-primary-500/10 outline-none cursor-pointer min-w-[220px]"
                >
                  <option value="All">All Departments</option>
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 rotate-90 pointer-events-none" />
              </div>

              {filteredIssues.length > 0 && (
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-primary-600 rounded-md border-slate-300 focus:ring-primary-500"
                      checked={selectedIssues.length === filteredIssues.length && filteredIssues.length > 0}
                      onChange={toggleSelectAll}
                    />
                    Select All
                  </label>
                  <button
                    onClick={() => {
                      setShowBulkDeleteConfirm(true);
                    }}
                    disabled={selectedIssues.length === 0}
                    className="px-5 py-2.5 bg-rose-500 text-white rounded-[1.25rem] font-black text-sm uppercase tracking-widest shadow-lg hover:bg-rose-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Delete Selected ({selectedIssues.length})
                  </button>
                </div>
              )}

              <div className="h-10 w-px bg-slate-100 mx-2 hidden lg:block" />

              <div className="flex bg-slate-50 p-1.5 rounded-[1.25rem]">
                <button 
                  onClick={() => setViewMode('detailed')}
                  className={cn("p-3 rounded-xl transition-all", viewMode === 'detailed' ? "bg-white text-primary-600 shadow-md" : "text-slate-400 hover:text-slate-600")}
                  title="Detailed View"
                >
                  <LayoutGrid className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => setViewMode('table')}
                  className={cn("p-3 rounded-xl transition-all", viewMode === 'table' ? "bg-white text-primary-600 shadow-md" : "text-slate-400 hover:text-slate-600")}
                  title="Table View"
                >
                  <ListIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {filteredIssues.length > 0 ? (
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {viewMode === 'detailed' ? (
                <div className="space-y-10">
                  {filteredIssues.map((issue) => (
                    <motion.div
                      layout
                      key={issue.id}
                      variants={item}
                      className="group bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col lg:flex-row transition-all duration-500 hover:shadow-primary-100"
                    >
                      {/* Left: Image & Quick Stats - Side by Side comparison if resolved */}
                      <div className="lg:w-2/5 relative h-[400px] lg:h-auto overflow-hidden">
                        <div className={cn(
                          "h-full grid gap-1",
                          issue.status?.toLowerCase() === ISSUE_STATUS.RESOLVED && issue.resolved_image_url ? "grid-cols-2" : "grid-cols-1"
                        )}>
                          <div className="relative overflow-hidden group/img">
                            <img 
                              src={issue.image} 
                              className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105" 
                              alt="Before" 
                            />
                            <div className="absolute top-8 left-8 bg-slate-900/80 backdrop-blur-md text-white px-4 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-widest border border-white/10 z-10">
                              Before
                            </div>
                          </div>

                          {issue.status?.toLowerCase() === ISSUE_STATUS.RESOLVED && issue.resolved_image_url && (
                            <div className="relative overflow-hidden group/img border-l border-slate-100">
                              <img 
                                src={issue.resolved_image_url} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105" 
                                alt="After" 
                              />
                              <div className="absolute top-8 right-8 bg-emerald-500 text-white px-4 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg flex items-center gap-2 z-10">
                                <CheckCircle2 className="h-3 w-3" />
                                After
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/40 to-transparent pointer-events-none" />
                        
                        <div className="absolute top-20 left-8 flex flex-col gap-3 z-10">
                          <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-white/50 flex items-center gap-3">
                            <input
                              type="checkbox"
                              className="form-checkbox h-4 w-4 text-primary-600 rounded border-slate-300"
                              checked={selectedIssues.includes(issue.id)}
                              onChange={() => toggleIssueSelection(issue.id)}
                            />
                            <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">#{issue.id.slice(-8)}</span>
                          </div>
                          <Badge 
                            variant={issue.status?.toLowerCase() === ISSUE_STATUS.RESOLVED ? 'success' : 'primary'} 
                            className="px-5 py-2.5 rounded-2xl font-black text-[11px] uppercase tracking-[0.15em] shadow-xl backdrop-blur-md"
                          >
                            {formatStatus(issue.status)}
                          </Badge>
                        </div>

                        {issue.status === ISSUE_STATUS.RESOLVED && issue.resolved_image_url && (
                          <div className="absolute bottom-8 left-8 right-8">
                            <div className="bg-emerald-500/90 backdrop-blur-md p-4 rounded-3xl border border-emerald-400/30 flex items-center justify-between">
                              <div className="flex items-center gap-3 text-white">
                                <CheckCircle2 className="h-5 w-5" />
                                <span className="text-xs font-black uppercase tracking-widest">Resolution Proof Uploaded</span>
                              </div>
                              <a 
                                href={issue.resolved_image_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all"
                              >
                                <Eye className="h-4 w-4 text-white" />
                              </a>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right: Content & Actions */}
                      <div className="lg:w-3/5 p-10 lg:p-14 flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                          <div className="flex items-center gap-3">
                            <div className="px-5 py-2.5 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 font-black text-[11px] uppercase tracking-widest">
                              {issue.department}
                            </div>
                            <div className={cn(
                              "px-5 py-2.5 rounded-2xl font-black text-[11px] uppercase tracking-widest",
                              issue.priority === 'high' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-50 text-slate-500 border border-slate-100'
                            )}>
                              {issue.priority} Priority
                            </div>
                            <div className={cn(
                              "px-5 py-2.5 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center gap-2",
                              issue.ai_analysis?.is_manual ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-primary-50 text-primary-600 border border-primary-100"
                            )}>
                              {issue.ai_analysis?.is_manual ? (
                                <><User className="h-3.5 w-3.5" /> Manual Report</>
                              ) : (
                                <><Zap className="h-3.5 w-3.5" /> AI Detected</>
                              )}
                            </div>
                          </div>
                          <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {new Date(issue.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                          </div>
                        </div>

                        <h2 className="text-4xl font-black text-slate-900 mb-6 leading-tight group-hover:text-primary-600 transition-colors">
                          {issue.title}
                        </h2>

                        <div className="space-y-6 mb-10 flex-1">
                          <div className="flex items-start gap-4 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                            <MapPin className="h-6 w-6 text-primary-500 shrink-0 mt-1" />
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Full Incident Location</p>
                              <p className="text-slate-700 font-bold leading-relaxed">{issue.location?.address || 'Precise location details loading...'}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-4 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                            <AlertCircle className="h-6 w-6 text-primary-500 shrink-0 mt-1" />
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Incident Description</p>
                              <p className="text-slate-700 font-medium leading-relaxed italic">"{issue.description}"</p>
                            </div>
                          </div>

                          {issue.status === ISSUE_STATUS.RESOLVED && issue.resolved_at && (
                            <div className="flex items-start gap-4 p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100">
                              <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0 mt-1" />
                              <div>
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Resolved On</p>
                                <p className="text-emerald-900 font-bold leading-relaxed">
                                  {new Date(issue.resolved_at).toLocaleDateString(undefined, { dateStyle: 'long' })} at {new Date(issue.resolved_at).toLocaleTimeString(undefined, { timeStyle: 'short' })}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4 pt-8 border-t border-slate-100">
                          <div className="flex-1 w-full relative">
                            <select
                              value={issue.status?.toLowerCase()}
                              onChange={(e) => handleStatusChange(issue.id, e.target.value)}
                              className={cn(
                                "w-full py-5 px-8 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] appearance-none cursor-pointer outline-none transition-all shadow-sm",
                                issue.status?.toLowerCase() === ISSUE_STATUS.RESOLVED ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                issue.status?.toLowerCase() === ISSUE_STATUS.IN_PROGRESS ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                                'bg-primary-50 text-primary-600 border-primary-100'
                              )}
                            >
                              {Object.values(ISSUE_STATUS).map((status) => (
                                <option key={status} value={status}>
                                  Update Status to: {formatStatus(status)}
                                </option>
                              ))}
                            </select>
                            <ChevronRight className="absolute right-8 top-1/2 -translate-y-1/2 h-5 w-5 rotate-90 pointer-events-none opacity-40" />
                          </div>

                          <Link 
                            to={`/citizen/issue/${issue.id}`}
                            className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-3"
                          >
                            Full Details
                            <ExternalLink className="h-5 w-5" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredIssues.map((issue) => (
                    <motion.div
                      layout
                      key={issue.id}
                      variants={item}
                      className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-primary-100 hover:scale-[1.02]"
                    >
                      <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md text-white px-3 py-1 rounded-lg font-black text-[8px] uppercase tracking-widest border border-white/10 z-10">
                        <input
                          type="checkbox"
                          className="form-checkbox h-3 w-3 text-primary-600 rounded border-slate-300 mr-1"
                          checked={selectedIssues.includes(issue.id)}
                          onChange={() => toggleIssueSelection(issue.id)}
                        />
                        #{issue.id.slice(-8)}
                      </div>
                      <Link to={`/authority/issue/${issue.id}`} className="block">
                        <div className="relative h-48 w-full overflow-hidden">
                          <img 
                            src={issue.image} 
                            alt={issue.title} 
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
                          />
                          <Badge 
                            variant={issue.status?.toLowerCase() === ISSUE_STATUS.RESOLVED ? 'success' : 'primary'} 
                            className="absolute bottom-4 right-4 px-3 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-[0.1em] shadow-lg backdrop-blur-md"
                          >
                            {formatStatus(issue.status)}
                          </Badge>
                        </div>
                        <div className="p-6">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 font-black text-[9px] uppercase tracking-widest">
                              {issue.department}
                            </div>
                            <div className={cn(
                              "px-3 py-1 rounded-lg font-black text-[9px] uppercase tracking-widest",
                              issue.priority === 'high' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-50 text-slate-500 border border-slate-100'
                            )}>
                              {issue.priority} Priority
                            </div>
                            <div className={cn(
                              "px-3 py-1 rounded-lg font-black text-[9px] uppercase tracking-widest flex items-center gap-1.5",
                              issue.ai_analysis?.is_manual ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-primary-50 text-primary-600 border border-primary-100"
                            )}>
                              {issue.ai_analysis?.is_manual ? (
                                <><User className="h-3 w-3" /> Manual Report</>
                              ) : (
                                <><Zap className="h-3 w-3" /> AI Detected</>
                              )}
                            </div>
                          </div>
                          <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight">
                            {issue.title}
                          </h3>
                          <p className="text-slate-500 text-sm line-clamp-2">
                            {issue.description}
                          </p>
                          <div className="flex items-center gap-2 text-slate-400 text-xs mt-4">
                            <MapPin className="h-3 w-3" />
                            <span>{issue.location?.address || 'Location pending...'}</span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : viewMode === 'table' ? (
                <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50/50">
                          <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            <input
                              type="checkbox"
                              className="form-checkbox h-4 w-4 text-primary-600 rounded border-slate-300 mr-2"
                              checked={selectedIssues.length === filteredIssues.length && filteredIssues.length > 0}
                              onChange={toggleSelectAll}
                            />
                            Report & ID
                          </th>
                          <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Assignment</th>
                          <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                          <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {filteredIssues.map((issue) => (
                          <motion.tr 
                            layout
                            key={issue.id} 
                            className="group hover:bg-slate-50/80 transition-all duration-300"
                          >
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-5">
                                <input
                                  type="checkbox"
                                  className="form-checkbox h-4 w-4 text-primary-600 rounded border-slate-300"
                                  checked={selectedIssues.includes(issue.id)}
                                  onChange={() => toggleIssueSelection(issue.id)}
                                />
                                <div className="relative shrink-0">
                                  <AnimatePresence mode="wait">
                                    {issue.status?.toLowerCase() === ISSUE_STATUS.RESOLVED && issue.resolved_image_url ? (
                                      <motion.img 
                                        key="resolved"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        src={issue.resolved_image_url} 
                                        className="h-16 w-16 rounded-[1.25rem] object-cover shadow-lg group-hover:scale-110 transition-transform duration-500 border-2 border-emerald-500" 
                                        alt="Resolved" 
                                      />
                                    ) : (
                                      <motion.img 
                                        key="original"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        src={issue.image} 
                                        className="h-16 w-16 rounded-[1.25rem] object-cover shadow-lg group-hover:scale-110 transition-transform duration-500" 
                                        alt="" 
                                      />
                                    )}
                                  </AnimatePresence>
                                  <div className="absolute -top-2 -left-2 bg-white p-1 rounded-lg shadow-md border border-slate-50">
                                    <span className="text-[10px] font-black text-primary-600">#{issue.id.slice(-4)}</span>
                                  </div>
                                </div>
                                <div>
                                  <p className="font-black text-slate-900 text-lg group-hover:text-primary-600 transition-colors">{issue.title}</p>
                                  <div className="flex items-center gap-3 mt-1 text-slate-400 font-bold text-xs">
                                    <span className="flex items-center gap-1.5">
                                      <MapPin className="h-3.5 w-3.5 text-primary-400" />
                                      {issue.location?.address?.split(',')[0] || 'Unknown Location'}
                                    </span>
                                    <span className={cn(
                                      "flex items-center gap-1 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border",
                                      issue.ai_analysis?.is_manual ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-primary-50 text-primary-600 border-primary-100"
                                    )}>
                                      {issue.ai_analysis?.is_manual ? (
                                        <><User className="h-2.5 w-2.5" /> Manual Report</>
                                      ) : (
                                        <><Zap className="h-2.5 w-2.5" /> AI Detected</>
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                <div className="px-4 py-2 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                  <span className="text-xs font-black text-blue-700 uppercase tracking-widest">{issue.department}</span>
                                </div>
                                <button className="p-2 text-slate-300 hover:text-primary-600 hover:bg-white hover:shadow-sm rounded-lg transition-all" title="Reassign">
                                  <ArrowRightLeft className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <select
                                value={issue.status?.toLowerCase()}
                                onChange={(e) => handleStatusChange(issue.id, e.target.value)}
                                className={cn(
                                  "rounded-xl px-4 py-2 font-black text-[10px] uppercase tracking-widest shadow-sm border-none cursor-pointer outline-none focus:ring-2 focus:ring-primary-500/20 transition-all",
                                  issue.status?.toLowerCase() === ISSUE_STATUS.RESOLVED ? 'bg-emerald-50 text-emerald-600' : 
                                  issue.status?.toLowerCase() === ISSUE_STATUS.IN_PROGRESS ? 'bg-amber-50 text-amber-600' : 
                                  'bg-blue-50 text-blue-600'
                                )}
                              >
                                {Object.values(ISSUE_STATUS).map((status) => (
                                  <option key={status} value={status}>
                                    {formatStatus(status)}
                                  </option>
                                ))}
                              </select>
                              {issue.status?.toLowerCase() === ISSUE_STATUS.RESOLVED && issue.resolved_at && (
                                <p className="mt-2 text-[10px] font-bold text-emerald-600 uppercase tracking-tighter flex items-center gap-1">
                                  <CheckCircle2 className="h-2.5 w-2.5" />
                                  {new Date(issue.resolved_at).toLocaleDateString()}
                                </p>
                              )}
                            </td>
                            <td className="px-8 py-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Link 
                                  to={`/citizen/issue/${issue.id}`}
                                  className="p-3 bg-slate-50 text-slate-400 hover:bg-primary-600 hover:text-white rounded-xl transition-all duration-300 shadow-sm"
                                  title="View Details"
                                >
                                  <ExternalLink className="h-5 w-5" />
                                </Link>
                                <button 
                                  onClick={() => {
                                    setIssueToDeleteId(issue.id);
                                    setShowDeleteConfirm(true);
                                  }}
                                  className="p-3 bg-slate-50 text-slate-400 hover:bg-rose-500 hover:text-white rounded-xl transition-all duration-300 shadow-sm" 
                                  title="Archive"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredIssues.map((issue) => (
                    <motion.div
                      layout
                      key={issue.id}
                      variants={item}
                      className="group bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary-100/50"
                    >
                      <div className={cn(
                        "relative aspect-[16/10] overflow-hidden grid gap-px",
                        issue.status?.toLowerCase() === ISSUE_STATUS.RESOLVED && issue.resolved_image_url ? "grid-cols-2" : "grid-cols-1"
                      )}>
                        <div className="relative overflow-hidden group/img">
                          <img 
                            src={issue.image} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" 
                            alt="Before" 
                          />
                          <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md text-white px-3 py-1 rounded-lg font-black text-[8px] uppercase tracking-widest border border-white/10 z-10">
                            Before
                          </div>
                        </div>

                        {issue.status?.toLowerCase() === ISSUE_STATUS.RESOLVED && issue.resolved_image_url && (
                          <div className="relative overflow-hidden group/img border-l border-slate-100/10">
                            <img 
                              src={issue.resolved_image_url} 
                              className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" 
                              alt="After" 
                            />
                            <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-lg font-black text-[8px] uppercase tracking-widest shadow-lg flex items-center gap-1.5 z-10">
                              <CheckCircle2 className="h-3 w-3" />
                              After
                            </div>
                          </div>
                        )}
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        <div className="absolute top-6 right-6 flex flex-col items-end gap-3 pointer-events-none">
                          <Badge variant={issue.status?.toLowerCase() === ISSUE_STATUS.RESOLVED ? 'success' : 'primary'} className="rounded-xl px-4 py-1.5 font-black text-[10px] uppercase tracking-widest shadow-lg">
                            {formatStatus(issue.status)}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-8">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-[10px] font-black text-primary-600 bg-primary-50 px-2.5 py-1 rounded-lg uppercase tracking-widest border border-primary-100">#{issue.id.slice(-6)}</span>
                          <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg uppercase tracking-widest border border-blue-100">{issue.department}</span>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-1 mb-4">{issue.title}</h3>
                        
                        {issue.status?.toLowerCase() === ISSUE_STATUS.RESOLVED && issue.resolved_at && (
                          <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 bg-emerald-50/50 py-1.5 px-3 rounded-lg w-fit border border-emerald-100/50 uppercase tracking-wider mb-4">
                            <CheckCircle2 className="h-3 w-3" />
                            Resolved on {new Date(issue.resolved_at).toLocaleDateString()}
                          </div>
                        )}

                        <div className="flex items-center gap-6 pt-6 border-t border-slate-50">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                            <MapPin className="h-4 w-4 text-primary-400" />
                            {issue.location?.address?.split(',')[0] || 'Unknown Location'}
                          </div>
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                            <Calendar className="h-4 w-4 text-primary-400" />
                            {new Date(issue.createdAt || issue.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-8">
                          <Link 
                            to={`/citizen/issue/${issue.id}`}
                            className="flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95"
                          >
                            Details
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                          <select
                            value={issue.status?.toLowerCase()}
                            onChange={(e) => handleStatusChange(issue.id, e.target.value)}
                            className={cn(
                              "flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 border-none cursor-pointer outline-none",
                              issue.status?.toLowerCase() === ISSUE_STATUS.RESOLVED ? 'bg-emerald-50 text-emerald-600' : 
                              issue.status?.toLowerCase() === ISSUE_STATUS.IN_PROGRESS ? 'bg-amber-50 text-amber-600' : 
                              'bg-blue-50 text-blue-600'
                            )}
                          >
                            {Object.values(ISSUE_STATUS).map((status) => (
                              <option key={status} value={status}>
                                {formatStatus(status)}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-32 text-center bg-white rounded-[4rem] border border-dashed border-slate-200"
            >
              <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
                <Inbox className="h-10 w-10 text-slate-300" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">No matching reports found</h3>
              <p className="text-slate-500 font-medium">Try broadening your search or switching departments.</p>
              <button 
                onClick={() => { setSearch(''); setFilterDept('All'); }}
                className="mt-8 text-primary-600 font-black hover:underline underline-offset-4"
              >
                Reset Filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>

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
      </AnimatePresence><AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999] flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-[2.5rem] p-8 shadow-2xl max-w-md w-full text-center border border-slate-100"
              >
                <div className="bg-rose-50 w-20 h-20 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
                  <Trash2 className="h-10 w-10 text-rose-500" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3">Confirm Deletion</h3>
                <p className="text-slate-500 mb-8">
                  Are you sure you want to delete this issue? This action cannot be undone.
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSingleDeleteIssue}
                    className="px-6 py-3 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      {/* Bulk Delete Confirmation Modal */}
      <AnimatePresence>
        {showBulkDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-8 shadow-xl max-w-md w-full text-center"
            >
              <ShieldAlert className="h-16 w-16 text-rose-500 mx-auto mb-6" />
              <h3 className="text-3xl font-bold text-slate-900 mb-4">Confirm Bulk Deletion</h3>
              <p className="text-slate-500 mb-8">
                Are you sure you want to delete {selectedIssues.length} selected issues? This action cannot be undone.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setShowBulkDeleteConfirm(false)}
                  className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-6 py-3 rounded-xl bg-rose-500 text-white font-semibold hover:bg-rose-600 transition-colors"
                >
                  Delete {selectedIssues.length} Issues
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default IssueManagement;

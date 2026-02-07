import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { ISSUE_STATUS } from '../../constants';
import Badge from '../../components/Badge';
import { issueService } from '../../services/api';
import { formatStatus } from '../../utils/format';
import { cn } from '../../utils/cn';
import { 
  MapPin, Calendar, ArrowRight, Search, 
  Filter, Clock, CheckCircle2, AlertCircle,
  ChevronDown, ArrowLeft, MessageSquare,
  Sparkles, ArrowUpRight, Loader2
} from 'lucide-react';

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

const MyIssues = () => {
  const { user, loading: authLoading } = useAuth();
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchIssues = async () => {
      if (authLoading) return;
      try {
        setLoading(true);
        const data = await issueService.getMyIssues();
        setIssues(data);
      } catch (err) {
        setError('Failed to load issues');
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, [authLoading]);

  const filteredIssues = issues.filter(issue => {
    const status = issue.status || 'REPORTED';
    const description = issue.description || '';
    const type = issue.issue_type || '';
    
    const matchesFilter = filter === 'ALL' || status.toUpperCase() === filter.toUpperCase();
    const matchesSearch = description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusVariant = (status = 'REPORTED') => {
    switch (status.toLowerCase()) {
      case ISSUE_STATUS.RESOLVED.toLowerCase(): return 'success';
      case ISSUE_STATUS.IN_PROGRESS.toLowerCase(): return 'warning';
      default: return 'primary';
    }
  };

  const getStatusIcon = (status = 'REPORTED') => {
    switch (status.toLowerCase()) {
      case ISSUE_STATUS.RESOLVED.toLowerCase(): return <CheckCircle2 className="h-4 w-4" />;
      case ISSUE_STATUS.IN_PROGRESS.toLowerCase(): return <Clock className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <DashboardLayout>
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-6xl mx-auto pb-20"
      >
        {/* Header */}
        <motion.div variants={item} className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">My Reports</h1>
              <p className="text-lg text-slate-500 font-medium">Tracking <span className="text-primary-600 font-bold">{filteredIssues.length} active contributions</span> to the city.</p>
            </div>
            
            <Link
              to="/citizen/report"
              className="group bg-primary-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-primary-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary-200"
            >
              <Sparkles className="h-5 w-5" />
              Report New Issue
            </Link>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div variants={item} className="flex flex-col lg:flex-row gap-6 items-center justify-between mb-10 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex bg-slate-50 p-1.5 rounded-2xl w-full lg:w-auto overflow-x-auto no-scrollbar">
            {['ALL', ISSUE_STATUS.REPORTED, ISSUE_STATUS.IN_PROGRESS, ISSUE_STATUS.RESOLVED].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-8 py-2.5 rounded-xl text-sm font-black whitespace-nowrap transition-all ${filter === s ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {s === 'ALL' ? 'Everything' : formatStatus(s)}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-96 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-medium focus:bg-white focus:border-primary-100 focus:ring-4 focus:ring-primary-50/50 transition-all outline-none"
            />
          </div>
        </motion.div>

        {/* Issues List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-10 w-10 text-primary-600 animate-spin" />
            <p className="text-slate-500 font-bold">Loading your reports...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-8 rounded-[2rem] border border-red-100 text-center">
            <p className="text-red-600 font-bold">{error}</p>
          </div>
        ) : (
          <div className="space-y-8">
            <AnimatePresence mode="popLayout">
              {filteredIssues.map((issue) => (
                <motion.div 
                  layout
                  key={issue.id}
                  variants={item}
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden hover:shadow-2xl transition-all duration-500"
                >
                  <div className="flex flex-col lg:flex-row">
                    <div className="lg:w-80 h-64 lg:h-auto relative overflow-hidden">
                      <div className={cn(
                        "h-full grid gap-0.5",
                        issue.status?.toLowerCase() === ISSUE_STATUS.RESOLVED.toLowerCase() && issue.resolved_image_url ? "grid-cols-2" : "grid-cols-1"
                      )}>
                        <div className="relative overflow-hidden group/img">
                          <img 
                            src={issue.image_url} 
                            alt="Before" 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110"
                          />
                          <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md text-white px-3 py-1 rounded-lg font-black text-[8px] uppercase tracking-widest border border-white/10 z-10">
                            Before
                          </div>
                        </div>

                        {issue.status?.toLowerCase() === ISSUE_STATUS.RESOLVED.toLowerCase() && issue.resolved_image_url && (
                          <div className="relative overflow-hidden group/img">
                            <img 
                              src={issue.resolved_image_url} 
                              alt="After" 
                              className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110"
                            />
                            <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-lg font-black text-[8px] uppercase tracking-widest shadow-lg flex items-center gap-1.5 z-10">
                              <CheckCircle2 className="h-3 w-3" />
                              After
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="absolute top-6 left-6 z-20">
                        <Badge variant="primary" className="bg-white/95 backdrop-blur-md border-white/20 px-4 py-1.5 rounded-xl font-black text-xs shadow-xl">
                          {issue.issue_type || 'Civic Issue'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex-1 p-10 flex flex-col justify-between gap-8">
                      <div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
                          <h3 className="text-3xl font-black text-slate-900 tracking-tight group-hover:text-primary-600 transition-colors">
                            {issue.issue_type || 'Civic Issue'}
                          </h3>
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant={getStatusVariant(issue.status)} className="w-fit flex items-center gap-2 px-5 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-lg shadow-current/5">
                              {getStatusIcon(issue.status)}
                              {formatStatus(issue.status) || 'Reported'}
                            </Badge>

                          </div>
                        </div>
                        
                        <p className="text-slate-500 font-medium text-lg leading-relaxed mb-8 line-clamp-2">
                          {issue.description}
                        </p>

                        {issue.status?.toLowerCase() === ISSUE_STATUS.RESOLVED.toLowerCase() && issue.resolved_at && (
                          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs bg-emerald-50 py-1.5 px-3 rounded-xl w-fit border border-emerald-100/50 uppercase tracking-wider mb-8">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Resolved on {new Date(issue.resolved_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        )}
                        
                        <div className="flex flex-wrap items-center gap-8 text-sm font-bold">
                          <div className="flex items-center gap-2.5 text-slate-400 group-hover:text-slate-600 transition-colors">
                            <MapPin className="h-5 w-5 text-primary-400" />
                            {issue.assigned_authority}
                          </div>
                          <div className="flex items-center gap-2.5 text-slate-400">
                            <Calendar className="h-5 w-5 text-primary-400" />
                            {new Date(issue.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                          </div>
                          <div className="flex items-center gap-2.5 text-slate-400">
                            <MessageSquare className="h-5 w-5 text-primary-400" />
                            Active Report
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-8 border-t border-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                          <div className="bg-primary-50 p-3 rounded-2xl border border-primary-100">
                            <ArrowRight className="h-5 w-5 text-primary-600" />
                          </div>
                          <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</p>
                          <p className="text-lg font-black text-slate-900">{issue.department || issue.assigned_authority}</p>
                        </div>
                        </div>
                        <Link 
                          to={`/citizen/issue/${issue.id}`}
                          className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-primary-600 transition-all shadow-xl shadow-slate-200 active:scale-95"
                        >
                          Track Progress
                          <ArrowUpRight className="h-5 w-5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default MyIssues;

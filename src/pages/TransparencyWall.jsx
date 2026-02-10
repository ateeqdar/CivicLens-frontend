import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Badge from '../components/Badge';
import { ISSUE_STATUS } from '../constants';
import { formatStatus } from '../utils/format';
import { cn } from '../utils/cn';
import { issueService } from '../services/api';
import { 
  MapPin, Calendar, CheckCircle2, Clock, 
  AlertCircle, Search, Filter, ArrowUpRight,
  TrendingUp, Users, Building2, Loader2, User, Zap
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

const TransparencyWall = () => {
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true);
        const data = await issueService.getAllPublicIssues();
        
        // Normalize data for consistency
        const normalizedData = (data || []).map(issue => ({
          ...issue,
          title: issue.title || issue.issue_type || issue.issueType || 'Civic Issue',
          description: issue.description || '',
          status: issue.status || ISSUE_STATUS.REPORTED,
          assigned_authority: issue.assigned_authority || issue.department || 'General',
          image: issue.image_url || issue.image || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=1000',
          created_at: issue.created_at || issue.createdAt || new Date().toISOString(),
          location_display: issue.location?.address?.split(',')[0] || 'Civic Location'
        }));
        
        setIssues(normalizedData);
      } catch (err) {
        console.error('Transparency wall fetch error:', err);
        setError('Failed to load transparency wall data');
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, []);

  const filteredIssues = issues.filter(issue => {
    const matchesFilter = filter === 'ALL' || (issue.status || '').toLowerCase() === filter.toLowerCase();
    
    const searchFields = [
      issue.title,
      issue.description,
      issue.assigned_authority,
      issue.location_display,
      issue.status
    ];

    const matchesSearch = searchQuery === '' || searchFields.some(field => 
      (field || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return matchesFilter && matchesSearch;
  });

  const getStatusIcon = (status) => {
    if (!status) return <AlertCircle className="h-4 w-4" />;
    switch (status.toLowerCase()) {
      case ISSUE_STATUS.RESOLVED.toLowerCase(): return <CheckCircle2 className="h-4 w-4" />;
      case ISSUE_STATUS.IN_PROGRESS.toLowerCase(): return <Clock className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status) => {
    if (!status) return 'primary';
    switch (status.toLowerCase()) {
      case ISSUE_STATUS.RESOLVED.toLowerCase(): return 'success';
      case ISSUE_STATUS.IN_PROGRESS.toLowerCase(): return 'warning';
      default: return 'primary';
    }
  };

  const stats = [
    { label: 'Total Reports', value: issues.length, icon: AlertCircle, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'Active Issues', value: issues.filter(i => i.status !== ISSUE_STATUS.RESOLVED).length, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Citizens Helped', value: '2.4k+', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Departments', value: '12', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative pt-24 md:pt-32 pb-12 md:pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-0 left-0 w-64 md:w-96 h-64 md:h-96 bg-primary-100/50 rounded-full blur-[80px] md:blur-[100px] -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-emerald-100/30 rounded-full blur-[80px] md:blur-[100px] translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10 md:mb-20"
          >
            <Badge variant="primary" className="mb-4 md:mb-6 px-4 py-1.5 rounded-full font-black text-[10px] md:text-xs tracking-widest uppercase">
              Live Transparency Feed
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-slate-900 mb-4 md:mb-6 tracking-tight leading-[1.1]">
              Civic <span className="text-primary-600">Accountability</span> Wall
            </h1>
            <p className="text-base md:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed px-2 md:px-4">
              Every report, every update, and every resolution—broadcasted in real-time to build trust and transform our city.
            </p>
          </motion.div>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-12 md:mb-20">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-4 md:p-6 rounded-[1.25rem] md:rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex items-center gap-3 md:gap-5"
              >
                <div className={`${stat.bg} ${stat.color} p-2 md:p-3 rounded-lg md:rounded-2xl shrink-0`}>
                  <stat.icon className="h-4 w-4 md:h-6 md:w-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{stat.label}</p>
                  <p className="text-lg md:text-2xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex flex-col lg:flex-row gap-4 md:gap-6 items-center justify-between mb-8 md:mb-12">
            <div className="flex bg-white p-1 md:p-1.5 rounded-xl md:rounded-2xl shadow-sm border border-slate-100 w-full lg:w-auto overflow-x-auto no-scrollbar scroll-smooth">
              {['ALL', ISSUE_STATUS.REPORTED, ISSUE_STATUS.IN_PROGRESS, ISSUE_STATUS.RESOLVED].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-4 md:px-8 py-2 md:py-2.5 rounded-lg md:rounded-xl text-[10px] md:text-sm font-black transition-all whitespace-nowrap flex-1 lg:flex-none ${filter === s ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  {s === 'ALL' ? 'Everything' : formatStatus(s)}
                </button>
              ))}
            </div>

            <div className="relative w-full lg:w-96 group">
              <Search className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 md:pl-14 pr-4 md:pr-6 py-3 md:py-4 bg-white border-2 border-slate-100 rounded-xl md:rounded-2xl text-sm md:text-base font-medium focus:ring-4 focus:ring-primary-50 focus:border-primary-200 transition-all outline-none shadow-sm"
              />
            </div>
          </div>

          {/* Feed Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-10 w-10 md:h-12 md:w-12 text-primary-600 animate-spin" />
              <p className="text-slate-500 font-black text-sm md:text-base">Connecting to live feed...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-red-100 text-center">
              <p className="text-red-600 font-bold text-sm md:text-base">{error}</p>
            </div>
          ) : (
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-10"
            >
              <AnimatePresence mode="popLayout">
                {filteredIssues.map((issue) => (
                  <motion.div 
                    layout
                    key={issue.id}
                    variants={item}
                    initial="hidden"
                    animate="show"
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group bg-white rounded-[1.25rem] md:rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 md:hover:-translate-y-2 flex flex-col"
                  >
                    <Link to={`/issues/${issue.id}`} className="relative h-44 md:h-64 overflow-hidden block">
                      <div className={cn(
                        "h-full grid gap-0.5",
                        issue.status?.toLowerCase() === ISSUE_STATUS.RESOLVED && issue.resolved_image_url ? "grid-cols-2" : "grid-cols-1"
                      )}>
                        <div className="relative overflow-hidden group/img">
                          <img 
                            src={issue.image} 
                            alt="Before" 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110"
                          />
                          <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-slate-900/80 backdrop-blur-md text-white px-2 md:px-3 py-0.5 md:py-1 rounded-md md:rounded-lg font-black text-[7px] md:text-[8px] uppercase tracking-widest border border-white/10 z-10">
                            Before
                          </div>
                        </div>

                        {issue.status?.toLowerCase() === ISSUE_STATUS.RESOLVED && issue.resolved_image_url && (
                          <div className="relative overflow-hidden group/img">
                            <img 
                              src={issue.resolved_image_url} 
                              alt="After" 
                              className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110"
                            />
                            <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-emerald-500 text-white px-2 md:px-3 py-0.5 md:py-1 rounded-md md:rounded-lg font-black text-[7px] md:text-[8px] uppercase tracking-widest shadow-lg flex items-center gap-1 md:gap-1.5 z-10">
                              <CheckCircle2 className="h-3 md:h-3.5 w-3 md:w-3.5" />
                              After
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      <div className="absolute top-2 md:top-4 left-1/2 -translate-x-1/2 z-20">
                        <Badge variant={getStatusVariant(issue.status)} className="flex items-center gap-1 md:gap-2 py-1 md:py-1.5 px-2 md:px-3 shadow-xl bg-white/95 backdrop-blur-md rounded-full font-black text-[8px] md:text-[10px] border border-white/20 whitespace-nowrap">
                          {getStatusIcon(issue.status)}
                          {formatStatus(issue.status)}
                        </Badge>
                      </div>
                    </Link>
                    
                    <div className="p-4 md:p-8 flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-3 md:mb-4 gap-2">
                        <div className="flex flex-col gap-1.5 md:gap-2">
                          <span className="px-2 py-0.5 md:px-3 md:py-1 rounded-md md:rounded-lg bg-primary-50 text-[8px] md:text-[10px] font-black text-primary-600 uppercase tracking-widest border border-primary-100 w-fit">
                            {issue.assigned_authority}
                          </span>
                          <div className={cn(
                            "flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[7px] md:text-[8px] font-black uppercase tracking-widest border w-fit",
                            issue.ai_analysis?.is_manual 
                              ? "bg-amber-50 text-amber-600 border-amber-100" 
                              : "bg-primary-50 text-primary-600 border-primary-100"
                          )}>
                            {issue.ai_analysis?.is_manual ? (
                              <><User className="h-2 w-2 md:h-2.5 md:w-2.5" /> Manual</>
                            ) : (
                              <><Zap className="h-2 w-2 md:h-2.5 md:w-2.5" /> AI</>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <div className="flex items-center text-slate-400 text-[10px] md:text-xs font-bold">
                            <Calendar className="h-3 md:h-3.5 w-3 md:w-3.5 mr-1 md:mr-1.5" />
                            {new Date(issue.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      </div>
                      
                      <Link to={`/issues/${issue.id}`}>
                        <h3 className="text-base sm:text-lg md:text-2xl font-black text-slate-900 mb-1.5 md:mb-3 line-clamp-1 tracking-tight group-hover:text-primary-600 transition-colors">
                          {issue.title}
                        </h3>
                      </Link>
                      
                      <p className="text-slate-500 font-medium text-[11px] md:text-sm mb-4 md:mb-6 line-clamp-2 leading-relaxed">
                        {issue.description}
                      </p>

                      {issue.status?.toLowerCase() === ISSUE_STATUS.RESOLVED.toLowerCase() && issue.resolved_at && (
                        <div className="mb-4 md:mb-6 flex items-center gap-1.5 md:gap-2 text-emerald-600 font-bold text-[8px] md:text-[10px] bg-emerald-50/50 py-1.5 md:py-2 px-2 md:px-3 rounded-lg md:rounded-xl w-fit border border-emerald-100/50 uppercase tracking-wider">
                          <CheckCircle2 className="h-3 md:h-3.5 w-3 md:w-3.5" />
                          Resolved {new Date(issue.resolved_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                      )}
                      
                      <div className="mt-auto pt-4 md:pt-6 border-t border-slate-50 flex items-center justify-between">
                        <div className="flex items-center text-slate-500 text-[11px] md:text-sm font-bold truncate mr-2">
                          <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1 md:mr-2 text-primary-400 shrink-0" />
                          <span className="truncate">{issue.location_display}</span>
                        </div>
                        <Link 
                          to={`/issues/${issue.id}`}
                          className="p-2 md:p-3 bg-slate-50 rounded-lg md:rounded-xl text-slate-400 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300 shrink-0"
                        >
                          <ArrowUpRight className="h-4 w-4 md:h-5 md:w-5" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {filteredIssues.length === 0 && (
                <div className="col-span-full py-20 text-center">
                  <div className="bg-white p-12 rounded-[3rem] border border-dashed border-slate-200 inline-block">
                    <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-black text-xl">No issues found matching your criteria</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransparencyWall;

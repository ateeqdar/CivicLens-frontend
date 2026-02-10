import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { ISSUE_STATUS } from '../../constants';
import { formatStatus } from '../../utils/format';
import { cn } from '../../utils/cn';
import Badge from '../../components/Badge';
import { issueService } from '../../services/api';
import { 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp,
  ArrowRight,
  MapPin,
  Calendar,
  MessageSquare,
  Zap,
  User,
  Loader2
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

const StatCard = ({ stat }) => (
  <motion.div 
    variants={item}
    whileHover={{ y: -5, scale: 1.02 }}
    className="bg-white p-5 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group transition-all duration-300"
  >
    <div className={`absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 ${stat.bg} opacity-10 rounded-full -mr-12 md:-mr-16 -mt-12 md:-mt-16 transition-transform group-hover:scale-150 duration-700`} />
    <div className="relative flex items-center gap-4 md:gap-6">
      <div className={`${stat.bg} ${stat.color} p-3 md:p-4 rounded-xl md:rounded-2xl shadow-lg shadow-current/5 group-hover:rotate-6 transition-transform`}>
        <stat.icon className="h-6 w-6 md:h-8 md:w-8" />
      </div>
      <div>
        <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">{stat.value}</p>
          {stat.value > 0 && (
            <span className="flex items-center text-[8px] md:text-[10px] font-black text-emerald-600 bg-emerald-50 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full border border-emerald-100">
              <TrendingUp className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
              Live
            </span>
          )}
        </div>
      </div>
    </div>
  </motion.div>
);

const CitizenDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [myIssues, setMyIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchIssues = async () => {
      if (authLoading) return;
      try {
        setLoading(true);
        const data = await issueService.getMyIssues();
        // Normalize data for the dashboard
        const normalizedData = (data || []).map(issue => ({
          ...issue,
          title: issue.issue_type || 'Civic Issue',
          image: issue.image_url || issue.image || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=1000',
          resolved_image_url: issue.resolved_image_url || null,
          location_name: issue.category || 'Local Area',
          date_display: new Date(issue.created_at || issue.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        }));
        setMyIssues(normalizedData);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError('Failed to load your recent reports');
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, [authLoading]);

  const stats = [
    { label: 'Total Reported', value: myIssues.length, icon: AlertCircle, color: 'text-primary-600', bg: 'bg-primary-500' },
    { label: 'In Progress', value: myIssues.filter(i => (i.status || '').toLowerCase() === ISSUE_STATUS.IN_PROGRESS.toLowerCase()).length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-500' },
    { label: 'Resolved', value: myIssues.filter(i => (i.status || '').toLowerCase() === ISSUE_STATUS.RESOLVED.toLowerCase()).length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-500' },
  ];

  return (
    <DashboardLayout>
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto pb-20"
      >
        {/* Welcome Header */}
        <motion.div variants={item} className="mb-8 md:mb-12 relative px-4 md:px-0">
          {/* Abstract Background Elements */}
          <div className="absolute -top-32 -left-32 w-64 md:w-96 h-64 md:h-96 bg-primary-100/50 rounded-full blur-[80px] md:blur-[100px] pointer-events-none" />
          <div className="absolute -top-20 -right-20 w-48 md:w-64 h-48 md:h-64 bg-emerald-100/30 rounded-full blur-[60px] md:blur-[80px] pointer-events-none" />
          
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8">
            <div className="space-y-3 md:space-y-4 text-center md:text-left">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl bg-white border border-slate-100 shadow-sm text-primary-600 text-[9px] md:text-xs font-black uppercase tracking-widest"
              >
                <span className="relative flex h-2 w-2 md:h-2.5 md:w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 md:h-2.5 w-2 md:w-2.5 bg-primary-500"></span>
                </span>
                Citizen Portal Active
              </motion.div>
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">
                Welcome back, <br className="md:hidden" />
                <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">{user?.name}</span>
              </h1>
              <p className="text-base md:text-xl text-slate-500 font-medium max-w-lg leading-relaxed mx-auto md:mx-0">
                Your voice is making <span className="text-slate-900 font-bold underline decoration-primary-300 decoration-4 underline-offset-4">Indiranagar</span> a better place to live.
              </p>
            </div>
            
            <Link
              to="/citizen/report"
              className="group relative overflow-hidden bg-slate-900 text-white px-6 md:px-10 py-4 md:py-5 rounded-xl md:rounded-[2rem] font-black text-sm md:text-lg transition-all duration-300 flex items-center justify-center gap-3 md:gap-4 shadow-2xl shadow-slate-200 hover:shadow-primary-200 hover:-translate-y-1 active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              <PlusCircle className="h-5 w-5 md:h-6 md:w-6 relative z-10 group-hover:rotate-90 transition-transform duration-500" />
              <span className="relative z-10">Report New Issue</span>
            </Link>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8 mb-10 md:mb-16 px-4 md:px-0">
          {stats.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 px-4 md:px-0">
          {/* Recent Activity */}
          <motion.div variants={item} className="lg:col-span-2">
            <div className="bg-white rounded-[1.5rem] md:rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
              <div className="p-6 md:p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="bg-white p-2 md:p-3 rounded-xl md:rounded-2xl shadow-sm border border-slate-100">
                    <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-primary-600" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900">Recent Reports</h2>
                    <p className="text-[9px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5 md:mt-1">Activity Stream</p>
                  </div>
                </div>
                <Link to="/citizen/my-issues" className="group px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl bg-slate-100 hover:bg-slate-200 text-xs md:text-sm font-black text-slate-700 flex items-center gap-2 transition-all">
                  View All
                  <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              
              <div className="divide-y divide-slate-50">
                {myIssues.length > 0 ? (
                  myIssues.slice(0, 5).map((issue) => (
                    <Link 
                      key={issue.id} 
                      to={`/citizen/issue/${issue.id}`}
                      className="p-5 md:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-slate-50/80 transition-all group gap-4 md:gap-6"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-8 w-full sm:w-auto">
                        <div className="relative shrink-0">
                          <div className="absolute inset-0 bg-primary-200 rounded-xl md:rounded-3xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity" />
                          <div className={cn(
                            "relative h-14 md:h-20 rounded-xl md:rounded-3xl overflow-hidden shadow-xl group-hover:scale-110 transition-transform duration-500",
                            (issue.status || '').toLowerCase() === ISSUE_STATUS.RESOLVED.toLowerCase() && issue.resolved_image_url ? "w-28 md:w-40 grid grid-cols-2 gap-0.5" : "w-14 md:w-20"
                          )}>
                            <div className="relative">
                              <img src={issue.image} className="h-full w-full object-cover" alt="Before" />
                            </div>
                            {(issue.status || '').toLowerCase() === ISSUE_STATUS.RESOLVED.toLowerCase() && issue.resolved_image_url && (
                              <div className="relative border-l border-white/20">
                                <img src={issue.resolved_image_url} className="h-full w-full object-cover" alt="After" />
                                <div className="absolute inset-0 bg-emerald-500/20" />
                              </div>
                            )}
                          </div>
                          <div className="absolute -bottom-1.5 -right-1.5 bg-white p-1 rounded-md md:p-1.5 md:rounded-xl shadow-lg border border-slate-50 z-10">
                            <Badge variant={(issue.status || '').toLowerCase() === ISSUE_STATUS.RESOLVED.toLowerCase() ? 'success' : 'primary'} className="h-2 md:h-3 w-2 md:w-3 p-0 rounded-full" />
                          </div>
                        </div>
                        <div className="space-y-1.5 md:space-y-2 w-full">
                          <div className="flex items-start justify-between sm:block">
                            <h3 className="text-base md:text-xl font-black text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-1">{issue.issue_type}</h3>
                            <div className="sm:hidden">
                              <Badge variant={(issue.status || '').toLowerCase() === ISSUE_STATUS.RESOLVED.toLowerCase() ? 'success' : 'primary'} className="rounded-md md:rounded-lg px-2 md:px-3 py-0.5 md:py-1 font-black text-[7px] md:text-[8px] uppercase tracking-widest">
                                {formatStatus(issue.status)}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 md:gap-5">
                            <span className="flex items-center gap-1 text-[10px] md:text-sm text-slate-400 font-bold">
                              <MapPin className="h-3 w-3 md:h-4 md:w-4 text-primary-400" />
                              {issue.location_name}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] md:text-sm text-slate-400 font-bold">
                              <Calendar className="h-3 w-3 md:h-4 md:w-4 text-primary-400" />
                              {issue.date_display}
                            </span>
                            <div className={cn(
                              "flex items-center gap-1 px-1.5 py-0.5 rounded-md md:rounded-lg text-[7px] md:text-[8px] font-black uppercase tracking-widest border",
                              issue.ai_analysis?.is_manual ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-primary-50 text-primary-600 border-primary-100"
                            )}>
                              {issue.ai_analysis?.is_manual ? (
                                <><User className="h-2 w-2 md:h-2.5 md:w-2.5" /> Manual</>
                              ) : (
                                <><Zap className="h-2 w-2 md:h-2.5 md:w-2.5" /> AI</>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 md:gap-8 self-stretch sm:self-center justify-between sm:justify-end border-t sm:border-t-0 pt-3 md:pt-0 border-slate-50 w-full sm:w-auto">
                        <div className="hidden sm:flex flex-col items-end gap-1">
                          <Badge variant={(issue.status || '').toLowerCase() === ISSUE_STATUS.RESOLVED.toLowerCase() ? 'success' : 'primary'} className="rounded-xl px-5 py-1.5 font-black text-xs uppercase tracking-widest">
                            {formatStatus(issue.status)}
                          </Badge>
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">Updated 4h ago</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 md:p-4 rounded-lg md:rounded-2xl group-hover:bg-primary-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary-200 transition-all duration-300 ml-auto sm:ml-0">
                          <ArrowRight className="h-4 w-4 md:h-6 md:w-6" />
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="p-12 md:p-20 text-center">
                    <div className="bg-slate-50 w-16 md:w-20 h-16 md:h-20 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                      <AlertCircle className="h-8 md:h-10 w-8 md:w-10 text-slate-300" />
                    </div>
                    <h3 className="text-lg md:text-xl font-black text-slate-900 mb-1.5 md:mb-2">No Reports Yet</h3>
                    <p className="text-sm md:text-base text-slate-500 font-medium mb-6 md:mb-8">Start by reporting an issue in your area.</p>
                    <Link to="/citizen/report" className="inline-flex items-center gap-2 text-primary-600 font-black hover:gap-3 transition-all text-sm md:text-base">
                      Report your first issue <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Quick Actions / Sidebar */}
          <motion.div variants={item} className="space-y-6 md:space-y-10">
            {/* Guide Card */}
            <div className="bg-primary-600 rounded-[2rem] md:rounded-[3rem] p-8 md:p-10 text-white relative overflow-hidden group shadow-2xl shadow-primary-200/50">
              <div className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-white opacity-10 rounded-full -mr-24 md:-mr-32 -mt-24 md:-mt-32 group-hover:scale-150 transition-transform duration-1000" />
              <div className="absolute bottom-0 left-0 w-24 md:w-32 h-24 md:h-32 bg-primary-400 opacity-20 rounded-full -ml-12 md:-ml-16 -mb-12 md:-mb-16 blur-2xl" />
              
              <div className="relative z-10 text-center md:text-left">
                <div className="bg-white/20 backdrop-blur-md w-12 md:h-14 md:w-14 h-12 rounded-xl md:rounded-2xl flex items-center justify-center mb-6 md:mb-8 border border-white/20 mx-auto md:mx-0">
                  <PlusCircle className="h-6 md:h-7 w-6 md:w-7 text-white" />
                </div>
                <h3 className="text-2xl md:text-3xl font-black mb-3 md:mb-4 leading-tight">Need a Hand?</h3>
                <p className="text-primary-100 font-medium mb-8 md:mb-10 leading-relaxed text-base md:text-lg">
                  Learn how our AI classifies issues and how to get faster resolutions.
                </p>
                <button className="w-full bg-white text-primary-600 py-4 md:py-5 rounded-xl md:rounded-2xl font-black hover:bg-primary-50 transition-all shadow-xl active:scale-95 text-sm md:text-base">
                  Read Citizen Guide
                </button>
              </div>
            </div>

            {/* Impact Metrics Sidebar */}
            <div className="bg-slate-900 rounded-[2rem] md:rounded-[3rem] p-8 md:p-10 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
              {/* Decorative Background */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                   style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 md:gap-4 mb-8 md:mb-10">
                  <div className="bg-white/10 backdrop-blur-md p-2.5 md:p-3 rounded-xl md:rounded-2xl border border-white/10">
                    <TrendingUp className="h-5 md:h-6 w-5 md:w-6 text-primary-400" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-black tracking-tight">Community Impact</h3>
                </div>
                
                <div className="space-y-8 md:space-y-10">
                  {[
                    { label: 'Total Resolved', value: '1,284', percent: 85, color: 'bg-emerald-500' },
                    { label: 'Avg. Response Time', value: '24h', percent: 92, color: 'bg-primary-500' },
                    { label: 'Satisfaction', value: '4.8/5', percent: 96, color: 'bg-amber-500' }
                  ].map((stat) => (
                    <div key={stat.label} className="group">
                      <div className="flex justify-between items-end mb-2.5 md:mb-3">
                        <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</span>
                        <span className="text-xl md:text-2xl font-black tracking-tight group-hover:text-primary-400 transition-colors">{stat.value}</span>
                      </div>
                      <div className="h-2.5 md:h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${stat.percent}%` }}
                          transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                          className={`h-full ${stat.color} rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)]`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-10 md:mt-12 pt-8 md:pt-10 border-t border-white/5">
                  <div className="flex items-center gap-3 md:gap-4 p-4 md:p-5 bg-white/5 rounded-2xl md:rounded-[2rem] border border-white/10 backdrop-blur-sm">
                    <div className="flex -space-x-2 md:-space-x-3 shrink-0">
                      {[1,2,3].map(i => (
                        <div key={i} className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[8px] md:text-[10px] font-black overflow-hidden">
                          <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="" />
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] md:text-xs font-bold text-slate-300">
                      Join <span className="text-white">2.4k+ citizens</span> making an impact today.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default CitizenDashboard;

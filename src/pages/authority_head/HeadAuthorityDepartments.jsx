import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { DEPARTMENTS, ISSUE_STATUS } from '../../constants';
import Badge from '../../components/Badge';
import { issueService } from '../../services/api';
import { 
  Building2, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  ChevronRight,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Search,
  Loader2
} from 'lucide-react';
import { cn } from '../../utils/cn';

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

const HeadAuthorityDepartments = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchIssues = async () => {
      if (authLoading) return;
      try {
        const data = await issueService.getAuthorityIssues();
        const normalizedData = (data || []).map(issue => ({
          ...issue,
          status: issue.status || ISSUE_STATUS.REPORTED,
          assigned_authority: issue.assigned_authority || issue.department || 'Unassigned'
        }));
        setIssues(normalizedData);
      } catch (err) {
        console.error('Error fetching issues:', err);
        setError('Failed to load departmental analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, [authLoading]);

  const departments = (DEPARTMENTS || []);

  const getDeptStats = (deptName) => {
    const lowerDeptName = deptName.toLowerCase();
    const deptIssues = issues.filter(i => 
      lowerDeptName.includes((i.assigned_authority || '').toLowerCase()) || 
      lowerDeptName.includes((i.department || '').toLowerCase())
    );
    const total = deptIssues.length;
    const resolved = deptIssues.filter(i => (i.status || '').toLowerCase() === ISSUE_STATUS.RESOLVED.toLowerCase()).length;
    const pending = deptIssues.filter(i => (i.status || '').toLowerCase() === ISSUE_STATUS.REPORTED.toLowerCase()).length;
    const inProgress = deptIssues.filter(i => (i.status || '').toLowerCase() === ISSUE_STATUS.IN_PROGRESS.toLowerCase()).length;
    const efficiency = total > 0 ? Math.round((resolved / total) * 100) : 0;
    
    const manualReported = deptIssues.filter(i => i.ai_analysis?.is_manual).length;
    const aiDetected = total - manualReported;
    
    return { total, resolved, pending, inProgress, efficiency, manualReported, aiDetected };
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 text-primary-600 animate-spin mb-4" />
          <p className="text-slate-500 font-bold">Aggregating departmental metrics...</p>
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
        {/* Executive Header */}
        <motion.div variants={item} className="mb-12 relative">
          {/* Abstract Background Elements */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary-100/50 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-100 shadow-sm text-primary-600 text-xs font-black uppercase tracking-widest">
                <ShieldCheck className="h-4 w-4" />
                Inter-Departmental Control
              </div>
              <h1 className="text-5xl font-black text-slate-900 tracking-tight">
                Departmental <br />
                <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">Efficiency Hub</span>
              </h1>
              <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">
                High-level oversight of performance metrics, resource allocation, and resolution speeds across all civic branches.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
                <TrendingUp className="h-5 w-5 text-primary-400" />
                Generate Analytics
              </button>
              <button className="flex items-center justify-center gap-3 px-8 py-4 bg-white border border-slate-100 text-slate-900 rounded-[1.5rem] font-black hover:bg-slate-50 transition-all shadow-lg shadow-slate-100">
                <Users className="h-5 w-5 text-primary-600" />
                Manage Staff
              </button>
            </div>
          </div>
        </motion.div>

        {/* Search & Filter Bar */}
        <motion.div variants={item} className="mb-10">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Quick search departments or supervisors..." 
              className="w-full bg-white border border-slate-100 rounded-[2rem] pl-16 pr-8 py-6 text-slate-900 text-lg font-medium placeholder:text-slate-400 shadow-xl shadow-slate-200/40 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none"
            />
          </div>
        </motion.div>

        {/* Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {departments.map((dept) => {
            const stats = getDeptStats(dept);
            return (
              <motion.div 
                key={dept} 
                variants={item}
                whileHover={{ y: -10 }}
                className="group bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden transition-all duration-500"
              >
                {/* Card Header */}
                <div className="p-8 pb-0 flex items-start justify-between">
                  <div className="flex items-center gap-5">
                    <div className="bg-primary-600 p-4 rounded-[1.5rem] text-white shadow-lg shadow-primary-200 group-hover:rotate-6 transition-transform duration-500">
                      <Building2 className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">{dept}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operationally Healthy</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="primary" className="rounded-xl px-4 py-1.5 font-black text-[10px] uppercase tracking-widest bg-slate-100 text-slate-600">Active</Badge>
                </div>
                
                <div className="p-8">
                  {/* Performance Indicators */}
                  <div className="grid grid-cols-2 gap-6 mb-10">
                    <div className="p-6 bg-slate-50/80 rounded-[2rem] border border-slate-50 group-hover:bg-white group-hover:shadow-xl group-hover:shadow-slate-100 transition-all duration-500">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-white rounded-xl shadow-sm">
                          <Zap className="h-4 w-4 text-primary-600" />
                        </div>
                        <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">+12%</span>
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Total Issues</p>
                      <p className="text-3xl font-black text-slate-900">{stats.total}</p>
                    </div>
                    <div className="p-6 bg-emerald-50/50 rounded-[2rem] border border-emerald-50 group-hover:bg-white group-hover:shadow-xl group-hover:shadow-emerald-100 transition-all duration-500">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-white rounded-xl shadow-sm">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        </div>
                        <span className="text-xs font-black text-emerald-600 bg-white px-2 py-1 rounded-lg">High</span>
                      </div>
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wider mb-1">Resolved</p>
                      <p className="text-3xl font-black text-emerald-700">{stats.resolved}</p>
                    </div>
                  </div>

                  {/* Efficiency Progress */}
                  <div className="mb-10">
                    <div className="flex justify-between items-end mb-4">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Efficiency Rating</span>
                      <span className="text-lg font-black text-slate-900">{stats.efficiency}%</span>
                    </div>
                    <div className="h-3 bg-slate-50 rounded-full overflow-hidden p-0.5 border border-slate-100">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.efficiency}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={cn(
                          "h-full rounded-full shadow-sm",
                          stats.efficiency > 70 ? "bg-emerald-500 shadow-emerald-200" : "bg-primary-500 shadow-primary-200"
                        )}
                      />
                    </div>
                  </div>

                  {/* Status Breakdown */}
                  <div className="space-y-4 mb-10">
                    {[
                      { label: 'Awaiting Action', count: stats.pending, icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-50' },
                      { label: 'In Active Progress', count: stats.inProgress, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
                      { label: 'Assigned Personnel', count: '12 Active', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' }
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors group/row">
                        <div className="flex items-center gap-4">
                          <div className={cn("p-2 rounded-xl transition-transform group-hover/row:scale-110", row.bg, row.color)}>
                            <row.icon className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-bold text-slate-600">{row.label}</span>
                        </div>
                        <span className="text-sm font-black text-slate-900">{row.count}</span>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => navigate(`/head-authority/management?dept=${dept}`)}
                    className="w-full py-5 rounded-[1.5rem] border-2 border-slate-100 font-black text-slate-500 hover:border-primary-600 hover:text-primary-600 hover:bg-primary-50/50 transition-all flex items-center justify-center gap-3 group/btn"
                  >
                    Access Detailed Performance
                    <ArrowUpRight className="h-5 w-5 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default HeadAuthorityDepartments;

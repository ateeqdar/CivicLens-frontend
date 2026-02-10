import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { ISSUE_STATUS, DEPARTMENTS } from '../../constants';
import { formatStatus } from '../../utils/format';
import Badge from '../../components/Badge';
import { issueService } from '../../services/api';
import { 
  BarChart3, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  Activity,
  ArrowUpRight,
  Building2,
  Map as MapIcon,
  Globe,
  TrendingUp,
  ShieldCheck,
  Zap,
  Loader2
} from 'lucide-react';

const HeadAuthorityDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchIssues = async () => {
      if (authLoading) return;
      try {
        setLoading(true);

        const data = await issueService.getAuthorityIssues();

        
        // Normalize data to prevent crashes with null/undefined fields
        const normalizedData = (Array.isArray(data) ? data : []).map(issue => ({
          ...issue,
          status: issue?.status || ISSUE_STATUS.REPORTED,
          assigned_authority: issue?.assigned_authority || issue?.department || 'Unassigned'
        }));
        

        setIssues(normalizedData);
        setError('');
      } catch (err) {
        console.error('HeadAuthorityDashboard: Error fetching issues:', err);
        const message = err.response?.data?.error || err.response?.data?.details || err.message || 'Failed to load dashboard data';
      setError(message);
    } finally {
      setLoading(false);
    }
  };
  fetchIssues();
}, [authLoading]);

// Defensive stats calculation
const safeIssues = Array.isArray(issues) ? issues : [];

const stats = [
  { label: 'City-wide Reports', value: safeIssues.length, icon: Globe, color: 'text-primary-600', bg: 'bg-primary-500' },
  { label: 'Active Workflow', value: safeIssues.filter(i => {
      const s = (i?.status || '').toLowerCase();
      return s === ISSUE_STATUS.REPORTED.toLowerCase() || s === ISSUE_STATUS.IN_PROGRESS.toLowerCase();
    }).length, icon: Zap, color: 'text-amber-600', bg: 'bg-amber-500' },
  { label: 'Resolution Rate', value: safeIssues.length > 0 ? `${Math.round((safeIssues.filter(i => (i?.status || '').toLowerCase() === ISSUE_STATUS.RESOLVED.toLowerCase()).length / safeIssues.length) * 100)}%` : '0%', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-500' },
];

const deptStats = (Array.isArray(DEPARTMENTS) ? DEPARTMENTS : [])
  .filter(d => d !== 'Head Authority')
  .map(dept => {
    const deptIssues = safeIssues.filter(i => 
      dept.toLowerCase().includes((i.assigned_authority || '').toLowerCase()) || 
      dept.toLowerCase().includes((i.department || '').toLowerCase())
    );
    const resolvedIssues = deptIssues.filter(i => (i?.status || '').toUpperCase() === 'RESOLVED');
    return {
      name: dept,
      count: deptIssues.length,
      resolved: resolvedIssues.length
    };
  });

return (
  <DashboardLayout>
    <div className="max-w-7xl mx-auto">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 text-primary-600 animate-spin" />
          <p className="text-slate-500 font-bold">Loading dashboard data...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-8 rounded-[2rem] border border-red-100 text-center">
          <p className="text-red-600 font-bold">{error}</p>
        </div>
      ) : (
        <div className="space-y-8 md:space-y-12">
          {/* Header */}
          <div className="mb-6 md:mb-10 relative">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-100 rounded-full blur-3xl opacity-50" />
            <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] mb-3 md:mb-4">
                  <Activity className="h-3 w-3 text-primary-400" />
                  Live City Overview
                </div>
                  <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 tracking-tight">Executive Command</h1>
                  <p className="text-base md:text-lg text-slate-500 font-medium max-w-2xl">Global oversight of all municipal departments and civic infrastructure.</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2 md:-space-x-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 md:border-4 border-white bg-slate-200 overflow-hidden shadow-sm">
                        <img src={`https://i.pravatar.cc/150?u=${i}`} alt="" />
                      </div>
                    ))}
                  </div>
                  <div className="text-xs md:text-sm font-bold text-slate-400 ml-1 md:ml-2">
                    <span className="text-slate-900">12</span> Dept Heads Online
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-8 md:mb-12">
              {stats.map((stat) => (
                <div 
                  key={stat.label}
                  className="bg-white p-5 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:-translate-y-1 transition-all"
                >
                  <div className={`absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 ${stat.bg} opacity-10 rounded-full -mr-12 -mt-12 md:-mr-16 md:-mt-16 transition-transform group-hover:scale-110 duration-500`} />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                      <div className={`${stat.bg} ${stat.color} p-3 md:p-4 rounded-xl md:rounded-2xl shadow-lg shadow-current/5`}>
                        <stat.icon className="h-5 w-5 md:h-7 md:w-7" />
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="flex items-center text-[10px] md:text-xs font-black text-emerald-600 bg-emerald-50 px-2 md:px-2.5 py-0.5 md:py-1 rounded-full border border-emerald-100">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          +12.5%
                        </span>
                      </div>
                    </div>
                    <p className="text-[10px] md:text-sm font-black text-slate-400 uppercase tracking-widest mb-0.5 md:mb-1">{stat.label}</p>
                    <p className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10 mb-8 md:mb-12">
              {/* Department Performance */}
              <div className="lg:col-span-2 bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-6 md:p-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 md:mb-10">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="bg-primary-50 p-2.5 md:p-3 rounded-xl md:rounded-2xl">
                      <Building2 className="h-5 w-5 md:h-6 md:w-6 text-primary-600" />
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-black text-slate-900">Department Metrics</h2>
                      <p className="text-[10px] md:text-sm text-slate-400 font-bold uppercase tracking-widest">Efficiency Benchmarking</p>
                    </div>
                  </div>
                  <button className="w-full sm:w-auto bg-slate-50 hover:bg-slate-100 text-slate-600 px-6 py-2.5 rounded-xl text-xs md:text-sm font-black transition-all">
                    Export Data
                  </button>
                </div>
                
                <div className="space-y-6 md:space-y-8">
                  {deptStats.map((dept) => (
                    <div 
                      key={dept.name} 
                      className="group cursor-pointer"
                      onClick={() => navigate(`/head-authority/management?dept=${dept.name}`)}
                    >
                      <div className="flex justify-between items-end mb-2 md:mb-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-base md:text-lg font-black text-slate-900 group-hover:text-primary-600 transition-colors truncate">{dept.name}</p>
                          <div className="flex items-center gap-2 md:gap-3 mt-0.5 md:mt-1 flex-wrap">
                            <span className="text-[9px] md:text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">{dept.count} Active Tasks</span>
                            <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-200" />
                            <span className="text-[9px] md:text-xs font-bold text-primary-500 uppercase tracking-widest whitespace-nowrap">{dept.resolved} Resolved</span>
                          </div>
                        </div>
                        <div className="text-right ml-4 shrink-0">
                          <p className="text-xl md:text-2xl font-black text-slate-900">
                            {dept.count > 0 ? Math.round((dept.resolved / dept.count) * 100) : 0}%
                          </p>
                          <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">SLA Compliance</p>
                        </div>
                      </div>
                      <div className="h-2.5 md:h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
                        <div 
                          className="h-full bg-primary-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all duration-1000"
                          style={{ width: `${dept.count > 0 ? (dept.resolved / dept.count) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick View Map Card */}
              <div className="bg-slate-900 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-10 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
                <div className="relative z-10 flex flex-col h-full">
                  <div className="mb-6 md:mb-8">
                    <div className="bg-white/10 w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 backdrop-blur-md border border-white/10">
                      <MapIcon className="h-6 w-6 md:h-7 md:w-7 text-primary-400" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-black mb-2 md:mb-3 tracking-tight">Geospatial Insights</h2>
                    <p className="text-sm md:text-base text-slate-400 font-medium leading-relaxed">
                      Real-time visualization of report density across municipal sectors.
                    </p>
                  </div>

                  <div className="space-y-3 md:space-y-4 mb-8 md:mb-10 flex-grow">
                    {[
                      { name: 'Central District', status: 'Critical', color: 'rose', value: 85, bg: 'bg-rose-500', bgLight: 'bg-rose-500/20', text: 'text-rose-400' },
                      { name: 'Innovation Hub', status: 'Normal', color: 'emerald', value: 32, bg: 'bg-emerald-500', bgLight: 'bg-emerald-500/20', text: 'text-emerald-400' },
                      { name: 'Residential Zone', status: 'Warning', color: 'amber', value: 54, bg: 'bg-amber-500', bgLight: 'bg-amber-500/20', text: 'text-amber-400' }
                    ].map((zone) => (
                      <div key={zone.name} className="bg-white/5 backdrop-blur-xl rounded-xl md:rounded-2xl p-4 md:p-5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer group">
                        <div className="flex justify-between items-center mb-2 md:mb-3">
                          <span className="text-sm md:text-base font-black text-slate-200">{zone.name}</span>
                          <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest px-2 py-0.5 md:py-1 rounded-lg ${zone.bgLight} ${zone.text}`}>
                            {zone.status}
                          </span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${zone.bg} rounded-full transition-all group-hover:scale-x-105 origin-left`}
                            style={{ width: `${zone.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <button className="w-full bg-primary-600 text-white py-4 md:py-5 rounded-xl md:rounded-2xl font-black hover:bg-primary-500 transition-all shadow-xl shadow-primary-900/20 flex items-center justify-center gap-2 md:gap-3 group">
                    Open Strategy Map
                    <ArrowUpRight className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
                </div>
                
                {/* Decorative Grid */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                    style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default HeadAuthorityDashboard;

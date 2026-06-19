import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Users, FileText, AlertTriangle, Briefcase, CheckCircle, XCircle, Clock, Search, TrendingUp, Activity, UserCheck, RefreshCcw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { useVerifiedEmployees, useAllRequests, usePendingVerifications } from '../hooks/useLeaves';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

export default function AdminDashboard() {
  const { data: verifiedEmployees = [], isLoading: loadingEmp } = useVerifiedEmployees();
  const { data: allRequests = [], isLoading: loadingReq } = useAllRequests();
  const { data: pendingVerifs = [] } = usePendingVerifications();
  const [search, setSearch] = useState('');

  const pendingRequests = allRequests.filter(r => r.status === 'pending');
  const approvedRequests = allRequests.filter(r => r.status === 'approved');
  const rejectedRequests = allRequests.filter(r => r.status === 'rejected');

  const onLeaveToday = approvedRequests.filter(r => {
    const today = dayjs();
    return today.isAfter(dayjs(r.start_date).subtract(1, 'day')) && today.isBefore(dayjs(r.end_date).add(1, 'day'));
  }).length;

  // Dynamic chart data
  const chartData = useMemo(() => {
    const counts = {};
    allRequests.forEach(req => {
      const type = req.leave_types?.name || 'Other';
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  }, [allRequests]);

  const pieColors = ['#7e57c2', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

  const filteredEmployees = useMemo(() =>
    verifiedEmployees.filter(e =>
      (e.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.email || '').toLowerCase().includes(search.toLowerCase())
    ), [verifiedEmployees, search]);

  const kpis = [
    { title: 'Active Employees', value: verifiedEmployees.length, icon: Users, gradient: 'from-blue-500 to-blue-600', sub: `+${pendingVerifs.length} pending` },
    { title: 'On Leave Today', value: onLeaveToday, icon: Briefcase, gradient: 'from-purple-500 to-purple-600', sub: 'currently away' },
    { title: 'Pending Approvals', value: pendingRequests.length, icon: Clock, gradient: 'from-amber-500 to-orange-500', sub: 'awaiting action' },
    { title: 'Total Requests', value: allRequests.length, icon: FileText, gradient: 'from-emerald-500 to-emerald-600', sub: `${approvedRequests.length} approved` },
  ];

  return (
    <div className="space-y-6 font-sans">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
          <p className="text-sm text-gray-500 mt-1">{dayjs().format('dddd, MMMM D, YYYY')} · Leave Portal Management</p>
        </div>
        <div className="flex gap-2">
          {pendingVerifs.length > 0 && (
            <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-lg text-sm font-medium">
              <AlertTriangle className="w-4 h-4" />
              {pendingVerifs.length} employees need verification
            </span>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((item, idx) => (
          <div key={idx} className={`bg-gradient-to-br ${item.gradient} rounded-2xl p-5 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 cursor-default`}>
            <div className="flex justify-between items-start mb-4">
              <div className="bg-white/20 p-2.5 rounded-xl">
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-white/70 text-xs font-medium">{item.sub}</span>
            </div>
            <p className="text-4xl font-bold">{item.value}</p>
            <p className="text-white/80 text-sm mt-1">{item.title}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Requests Status Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2"><Activity className="w-4 h-4 text-[#9b72e5]" /> Request Breakdown</h3>
          <p className="text-xs text-gray-400 mb-4">All-time status distribution</p>
          {allRequests.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">No requests yet</div>
          ) : (
            <div className="space-y-3">
              {[
                { label: 'Approved', count: approvedRequests.length, color: '#10b981', cls: 'bg-emerald-500' },
                { label: 'Pending', count: pendingRequests.length, color: '#f59e0b', cls: 'bg-amber-400' },
                { label: 'Rejected', count: rejectedRequests.length, color: '#ef4444', cls: 'bg-red-500' },
              ].map(s => (
                <div key={s.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{s.label}</span>
                    <span className="font-semibold text-gray-800">{s.count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all duration-700 ${s.cls}`} style={{ width: `${allRequests.length > 0 ? (s.count / allRequests.length) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
              <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-3 text-center">
                {[
                  { label: 'Total', val: allRequests.length },
                  { label: 'Approval %', val: allRequests.length > 0 ? `${Math.round((approvedRequests.length / allRequests.length) * 100)}%` : '0%' },
                  { label: 'Open', val: pendingRequests.length },
                ].map(m => (
                  <div key={m.label}>
                    <p className="text-lg font-bold text-gray-900">{m.val}</p>
                    <p className="text-[10px] text-gray-400">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Leave Types Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-[#9b72e5]" /> Leave Types Distribution</h3>
          <p className="text-xs text-gray-400 mb-4">Requests grouped by leave category</p>
          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} barSize={36}>
                <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} tick={{ fill: '#6b7280' }} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} tick={{ fill: '#6b7280' }} />
                <Tooltip
                  cursor={{ fill: '#f5f3ff' }}
                  contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontSize: '12px' }}
                />
                <Bar dataKey="value" name="Requests" radius={[6, 6, 0, 0]}>
                  {chartData.map((_, index) => <Cell key={index} fill={pieColors[index % pieColors.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Employee Directory + Recent Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Employee Directory */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col max-h-[400px]">
          <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
            <div>
              <h3 className="font-semibold text-gray-800 flex items-center gap-2"><UserCheck className="w-4 h-4 text-emerald-500" /> Active Employees</h3>
              <p className="text-xs text-gray-400 mt-0.5">{verifiedEmployees.length} verified members</p>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-xs w-40 focus:ring-2 focus:ring-[#9b72e5] focus:border-transparent outline-none"
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            {loadingEmp ? (
              <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-[#9b72e5] border-t-transparent rounded-full animate-spin" /></div>
            ) : filteredEmployees.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">No employees found.</div>
            ) : (
              filteredEmployees.map((emp, i) => (
                <div key={emp.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ backgroundColor: ['#7e57c2','#10b981','#f59e0b','#ef4444','#3b82f6'][i % 5] }}>
                    {(emp.full_name || emp.email).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">{emp.full_name || 'No Name'}</p>
                    <p className="text-xs text-gray-400 truncate">{emp.email}</p>
                  </div>
                  <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-100">Active</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Leave Requests */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col max-h-[400px]">
          <div className="p-5 border-b border-gray-100 shrink-0">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Clock className="w-4 h-4 text-amber-500" /> Recent Requests</h3>
            <p className="text-xs text-gray-400 mt-0.5">Latest leave submissions across all employees</p>
          </div>
          <div className="overflow-y-auto flex-1">
            {loadingReq ? (
              <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-[#9b72e5] border-t-transparent rounded-full animate-spin" /></div>
            ) : allRequests.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">No requests yet.</div>
            ) : (
              allRequests.slice(0, 10).map(req => {
                const sc = req.status === 'approved'
                  ? { icon: CheckCircle, cls: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Approved' }
                  : req.status === 'rejected'
                  ? { icon: XCircle, cls: 'text-red-500', bg: 'bg-red-50', label: 'Rejected' }
                  : req.status === 'cancelled'
                  ? { icon: RefreshCcw, cls: 'text-gray-500', bg: 'bg-gray-50', label: 'Withdrawn' }
                  : { icon: Clock, cls: 'text-amber-500', bg: 'bg-amber-50', label: 'Pending' };
                const StatusIcon = sc.icon;
                return (
                  <div key={req.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                    <div className={`${sc.bg} p-2 rounded-lg shrink-0`}>
                      <StatusIcon className={`w-4 h-4 ${sc.cls}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">{req.profiles?.full_name || req.profiles?.email || 'Employee'}</p>
                      <p className="text-xs text-gray-400">{req.leave_types?.name} · {req.total_days} day{req.total_days !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${sc.bg} ${sc.cls}`}>{sc.label}</span>
                      <p className="text-[10px] text-gray-400 mt-0.5">{dayjs(req.created_at).fromNow()}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

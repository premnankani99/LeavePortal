import { FileText, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function DashboardStats({ stats }) {
  const statCards = [
    { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
      {statCards.map((s, idx) => {
        const Icon = s.icon;
        return (
          <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:-translate-y-1 hover:shadow-md transition-all duration-300 group cursor-pointer">
            <div>
              <p className="text-gray-500 text-[15px] font-medium mb-1">{s.label}</p>
              <p className="text-[28px] font-bold text-gray-900 group-hover:text-[#7e57c2] transition-colors leading-none">{s.value}</p>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${s.bg} ${s.color} transition-transform duration-300 group-hover:scale-110 group-hover:animate-pulse`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

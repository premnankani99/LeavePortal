import { Link } from 'react-router-dom';
import { PlusCircle, User, CalendarDays, Wallet } from 'lucide-react';

export default function QuickActions() {
  const actions = [
    {
      title: 'Apply Leave',
      desc: 'Submit a new request',
      icon: PlusCircle,
      link: '/apply-leave',
      bg: 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700',
      iconBg: 'bg-purple-200 text-[#7e57c2]'
    },
    {
      title: 'Leave Balance',
      desc: 'Check available leaves',
      icon: Wallet,
      link: '/my-comp-offs',
      bg: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700',
      iconBg: 'bg-blue-200 text-blue-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
      {actions.map((action, idx) => {
        const Icon = action.icon;
        
        return (
          <Link 
            key={idx} 
            to={action.link}
            className={`border rounded-xl p-4 flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer group ${action.bg}`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${action.iconBg}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{action.title}</h3>
              <p className="text-sm opacity-80 font-medium">{action.desc}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

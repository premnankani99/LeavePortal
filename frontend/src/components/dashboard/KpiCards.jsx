import { Link } from 'react-router-dom';

export default function KpiCards({ kpis }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((item, idx) => {
        const Icon = item.icon;
        const CardWrapper = item.path ? Link : 'div';
        return (
          <CardWrapper 
            key={idx} 
            to={item.path}
            className="block bg-white border border-gray-200 rounded-xl p-4 text-gray-900 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-3">
              <div className={`p-2 rounded-lg ${item.iconBg} group-hover:scale-110 transition-transform`}>
                <Icon className={`w-4 h-4 ${item.iconColor}`} />
              </div>
              <span className="text-gray-500 text-[11px] font-medium uppercase tracking-wider">{item.sub}</span>
            </div>
            <p className="text-3xl font-bold text-gray-800">{item.value}</p>
            <p className="text-gray-600 text-sm mt-0.5">{item.title}</p>
          </CardWrapper>
        );
      })}
    </div>
  );
}

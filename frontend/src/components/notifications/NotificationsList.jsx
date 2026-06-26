import { Bell } from 'lucide-react';

export default function NotificationsList({ notificationsList }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto flex flex-col">
        {notificationsList.map((notif, index) => {
          const Icon = notif.icon;
          return (
            <div key={notif.id} className={`p-6 flex items-start gap-5 transition-colors ${index !== notificationsList.length - 1 ? 'border-b border-gray-100' : ''} ${notif.isUnread ? 'bg-blue-50/30' : 'hover:bg-gray-50'}`}>
              <div className={`p-3 rounded-full ${notif.iconBg}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <p className="text-base font-bold text-gray-900">{notif.title}</p>
                  <p className="text-sm text-gray-400 font-medium">{notif.time}</p>
                </div>
                <p className="text-base text-gray-600 mt-1">{notif.message}</p>
              </div>
            </div>
          );
        })}
        {notificationsList.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500 min-h-[300px]">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <span className="text-lg">No notifications at this time.</span>
          </div>
        )}
      </div>
    </div>
  );
}

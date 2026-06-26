import { useNotifications } from '../hooks/useNotifications';
import NotificationsList from '../components/notifications/NotificationsList';

export default function Notifications() {
  const { notificationsList } = useNotifications();

  return (
    <div className="max-w-7xl mx-auto w-full min-h-[calc(100vh-8rem)] flex flex-col font-sans pb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <NotificationsList notificationsList={notificationsList} />

    </div>
  );
}

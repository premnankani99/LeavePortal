import { Link, useLocation, useNavigate } from "react-router-dom"
import { LayoutDashboard, Calendar, Users, Settings, LogOut, Inbox, Briefcase, FileText, Clock, FileBarChart, CalendarDays, FolderOpen, RefreshCcw, Activity, User, CheckCircle2, Bell, PlusCircle, Megaphone } from "lucide-react"
import { useContext, useState, useEffect, useRef } from "react"
import { useAuth } from "../../context/AuthContext"
import { useNotifications } from "../../hooks/useNotifications"
import { Button } from "../ui/button"

export default function Layout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  // const { currentUser, setRole } = useContext(LeaveContext) // Puraana mock system
  const { user, role, logout } = useAuth(); // Naya Asli system
  const { notificationsList } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);
  
  const markAllAsRead = () => {
    if (user?.id) {
      localStorage.setItem(`notif_read_${user.id}`, Date.now().toString());
      // Force a re-render by dispatching a custom event or just let it update on next poll.
      // Easiest is to dispatch an event
      window.dispatchEvent(new Event('notifications_read'));
    }
  };

  const [lastRead, setLastRead] = useState(Date.now());
  useEffect(() => {
    const updateRead = () => setLastRead(Date.now());
    window.addEventListener('notifications_read', updateRead);
    return () => window.removeEventListener('notifications_read', updateRead);
  }, []);

  const unreadNotifications = notificationsList?.filter(n => n.isUnread) || [];
  const hasUnreadNotifications = unreadNotifications.length > 0;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Clear unread notifications when viewing the notifications page
  useEffect(() => {
    if (location.pathname === '/notifications') {
      markAllAsRead();
    }
  }, [location.pathname, user?.id]);

  const isActive = (path) => location.pathname === path

  const handleNotificationClick = () => {
    setShowNotifications(false);
    navigate('/notifications');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex z-20">
        <div className="flex items-center px-6 h-20 border-b border-gray-100">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-600 text-white mr-3">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-gray-900 leading-tight block">Leave Portal</span>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          
          <Link to={role === 'admin' ? "/admin" : "/"} className={`flex items-center px-4 py-3 rounded-lg transition-all duration-300 text-base font-medium group ${isActive(role === 'admin' ? '/admin' : '/') ? 'bg-[#7e57c2] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
            <LayoutDashboard className={`w-5 h-5 mr-3 transition-transform duration-300 ${!isActive(role === 'admin' ? '/admin' : '/') && 'group-hover:translate-x-1'}`} />
            Dashboard
          </Link>

          {role === 'employee' && (
            <>
              <Link to="/apply-leave" className={`flex items-center px-4 py-3 rounded-lg transition-all duration-300 text-base font-medium group ${isActive('/apply-leave') ? 'bg-[#7e57c2] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                <PlusCircle className={`w-5 h-5 mr-3 transition-transform duration-300 ${!isActive('/apply-leave') && 'group-hover:translate-x-1'}`} />
                Apply Leave
              </Link>
              <Link to="/leaves" className={`flex items-center px-4 py-3 rounded-lg transition-all duration-300 text-base font-medium group ${isActive('/leaves') ? 'bg-[#7e57c2] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                <Briefcase className={`w-5 h-5 mr-3 transition-transform duration-300 ${!isActive('/leaves') && 'group-hover:translate-x-1'}`} />
                Leave History
              </Link>
              <Link to="/notifications" className={`flex items-center px-4 py-3 rounded-lg transition-all duration-300 text-base font-medium group ${isActive('/notifications') ? 'bg-[#7e57c2] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                <Bell className={`w-5 h-5 mr-3 transition-transform duration-300 ${!isActive('/notifications') && 'group-hover:translate-x-1'}`} />
                Notifications
                {hasUnreadNotifications && <span className="ml-auto w-2 h-2 bg-red-500 rounded-full"></span>}
              </Link>
              <Link to="/profile" className={`flex items-center px-4 py-3 rounded-lg transition-all duration-300 text-base font-medium group ${isActive('/profile') ? 'bg-[#7e57c2] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                <User className={`w-5 h-5 mr-3 transition-transform duration-300 ${!isActive('/profile') && 'group-hover:translate-x-1'}`} />
                My Profile
              </Link>
            </>
          )}

          {role === 'admin' && (
            <>
              <Link to="/admin/leave-queue" className={`flex items-center whitespace-nowrap px-4 py-3 rounded-lg transition-colors text-base font-medium ${isActive('/admin/leave-queue') ? 'bg-[#7e57c2] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                <Inbox className="w-5 h-5 mr-3 shrink-0" />
                Leave Approval Queue
              </Link>
              <Link to="/admin/verification-queue" className={`flex items-center whitespace-nowrap px-4 py-3 rounded-lg transition-colors text-base font-medium ${isActive('/admin/verification-queue') ? 'bg-[#7e57c2] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                <CheckCircle2 className="w-5 h-5 mr-3 shrink-0" />
                Verification Queue
              </Link>
              <Link to="/admin/employees" className={`flex items-center whitespace-nowrap px-4 py-3 rounded-lg transition-colors text-base font-medium ${isActive('/admin/employees') ? 'bg-[#7e57c2] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                <Users className="w-5 h-5 mr-3 shrink-0" />
                Employees
              </Link>
              <Link to="/notifications" className={`flex items-center px-4 py-3 rounded-lg transition-all duration-300 text-base font-medium group ${isActive('/notifications') ? 'bg-[#7e57c2] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                <Bell className={`w-5 h-5 mr-3 shrink-0 transition-transform duration-300 ${!isActive('/notifications') && 'group-hover:translate-x-1'}`} />
                Notifications
                {hasUnreadNotifications && <span className="ml-auto w-2 h-2 bg-red-500 rounded-full"></span>}
              </Link>

              <Link to="/profile" className={`flex items-center whitespace-nowrap px-4 py-3 rounded-lg transition-all duration-300 text-base font-medium group ${isActive('/profile') ? 'bg-[#7e57c2] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                <User className={`w-5 h-5 mr-3 shrink-0 transition-transform duration-300 ${!isActive('/profile') && 'group-hover:translate-x-1'}`} />
                Profile
              </Link>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center space-x-3 mb-2 overflow-hidden text-ellipsis whitespace-nowrap px-2">
            <div className="w-10 h-10 rounded-full bg-[#7e57c2] flex-shrink-0 flex items-center justify-center font-bold text-white uppercase text-sm">
              {user?.email?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.user_metadata?.full_name || user?.email}</p>
              <p className="text-xs text-gray-500">{role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="relative h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-50">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-800">
              {isActive('/') ? 'Dashboard Overview' : 
               isActive('/admin') ? 'Admin Dashboard' : 
               isActive('/admin/leave-queue') ? 'Leave Approval Queue' : 
               isActive('/admin/verification-queue') ? 'Verification Queue' : 
               isActive('/admin/announcements') ? 'Announcements' : 
               isActive('/admin/employees') ? 'Employee Directory' : 
               isActive('/leaves') ? 'Leave History' : 
               isActive('/apply-leave') ? 'Apply for Leave' : 
               isActive('/profile') ? 'My Profile' : 
               isActive('/notifications') ? 'Notifications' : 
               isActive('/announcements') ? 'Announcements Feed' : 'Settings'}
            </h1>
          </div>

          <div className="flex items-center space-x-4 relative" ref={notificationRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {hasUnreadNotifications && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>}
            </button>
            
            {showNotifications && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                  <h3 className="font-bold text-gray-900">Notifications</h3>
                  {hasUnreadNotifications && (
                    <button onClick={markAllAsRead} className="text-xs text-[#7e57c2] font-medium hover:underline">Mark all as read</button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {unreadNotifications.slice(0, 5).map(notif => {
                    const Icon = notif.icon;
                    return (
                      <div key={notif.id} onClick={handleNotificationClick} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors flex items-start gap-3 cursor-pointer">
                        <div className={`p-2 rounded-full ${notif.iconBg}`}><Icon className="w-4 h-4" /></div>
                        <div>
                          <p className="text-sm text-gray-800 font-medium">{notif.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{notif.message}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{notif.time}</p>
                        </div>
                      </div>
                    );
                  })}
                  {unreadNotifications.length === 0 && (
                    <div className="p-4 text-center text-sm text-gray-500">No new notifications</div>
                  )}
                </div>
                <div className="p-3 border-t border-gray-50 text-center">
                  <button onClick={handleNotificationClick} className="text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors">View all notifications</button>
                </div>
              </div>
            )}

            <div className="w-px h-6 bg-gray-200 mx-2"></div>

            <Button variant="ghost" size="sm" className="text-gray-500 hover:bg-gray-50" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

import { Link, useLocation, useNavigate } from "react-router-dom"
import { LayoutDashboard, Calendar, Users, Settings, LogOut, Inbox, Briefcase, FileText, Clock, FileBarChart, CalendarDays, FolderOpen, RefreshCcw, Activity, User, CheckCircle2, Bell, PlusCircle, Megaphone, Gift, Menu, X } from "lucide-react"
import { useContext, useState, useEffect, useRef } from "react"
import { useAuth } from "../../context/AuthContext"
import { useNotifications } from "../../hooks/useNotifications"
import { Button } from "../ui/button"

export default function Layout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  // const { currentUser, setRole } = useContext(LeaveContext) // Puraana mock system
  const { user, role, logout } = useAuth(); // Naya Asli system
  const { notificationsList, pendingLeavesCount, pendingVerificationCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const notificationRef = useRef(null);
  
  const markAllAsRead = () => {
    console.log("[Frontend Component] Rendering markAllAsRead in Layout.jsx");
    if (user?.id) {
      localStorage.setItem(`notif_read_${user.id}`, Date.now().toString());
      // Force a re-render by dispatching a custom event or just let it update on next poll.
      // Easiest is to dispatch an event
      window.dispatchEvent(new Event('notifications_read'));
    }
  };

  const [lastRead, setLastRead] = useState(Date.now());
  useEffect(() => {
        console.log("[Frontend Effect] Triggered in Layout.jsx");
    const updateRead = () => setLastRead(Date.now());
    window.addEventListener('notifications_read', updateRead);
    return () => window.removeEventListener('notifications_read', updateRead);
  }, []);

  const unreadNotifications = notificationsList?.filter(n => n.isUnread) || [];
  const hasUnreadNotifications = unreadNotifications.length > 0;

  useEffect(() => {
        console.log("[Frontend Effect] Triggered in Layout.jsx");
    const handleClickOutside = (event) => {
    console.log("[Frontend Component] Rendering handleClickOutside in Layout.jsx");
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Clear unread notifications when viewing relevant pages
  useEffect(() => {
        console.log("[Frontend Effect] Triggered in Layout.jsx");
    const clearPaths = [
      '/notifications',
      '/admin/leave-queue',
      '/admin/verification-queue',
      '/admin/comp-off'
    ];
    if (clearPaths.includes(location.pathname)) {
      markAllAsRead();
    }
  }, [location.pathname, user?.id]);

  const isActive = (path) => location.pathname === path

  // Close mobile menu when route changes
  useEffect(() => {
        console.log("[Frontend Effect] Triggered in Layout.jsx");
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleNotificationClick = (link) => {
    console.log("[Frontend Component] Rendering handleNotificationClick in Layout.jsx");
    setShowNotifications(false);
    if (link) {
      navigate(link);
    } else {
      navigate('/notifications');
    }
  };

  const handleLogout = async () => {
    console.log("[Frontend Async] Executing handleLogout in Layout.jsx");
    await logout();
    navigate('/login');
  }

  const getInitials = (u) => {
    console.log("[Frontend Component] Rendering getInitials in Layout.jsx");
    const nameToUse = u?.full_name || u?.email || 'U';
    const match = nameToUse.match(/[a-zA-Z]/);
    return match ? match[0].toUpperCase() : 'U';
  };

  const formatRole = (r) => {
    console.log("[Frontend Component] Rendering formatRole in Layout.jsx");
    if (!r) return '';
    if (r.toLowerCase() === 'hr') return 'HR';
    return r.charAt(0).toUpperCase() + r.slice(1).toLowerCase();
  };

  const formatName = (name) => {
    console.log("[Frontend Component] Rendering formatName in Layout.jsx");
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : '')
      .join(' ');
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 transform ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 w-64 bg-white border-r border-gray-200 flex flex-col z-50 transition-transform duration-300 ease-in-out`}>
        <div className="flex items-center justify-between px-6 h-20 border-b border-gray-100 shrink-0">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#7e57c2] text-white mr-3 shadow-sm">
              <Users className="w-6 h-6" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900 leading-tight">Leave Portal</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-gray-400 hover:text-gray-600 focus:outline-none p-1 -mr-2">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          
          <Link to={role === 'admin' ? "/admin" : role?.toLowerCase() === 'hr' ? "/hr/dashboard" : "/"} className={`flex items-center px-4 py-3 rounded-lg transition-all duration-300 text-base font-medium group ${isActive(role === 'admin' ? '/admin' : role?.toLowerCase() === 'hr' ? '/hr/dashboard' : '/') ? 'bg-[#7e57c2] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
            <LayoutDashboard className={`w-5 h-5 mr-3 transition-transform duration-300 ${!isActive(role === 'admin' ? '/admin' : role?.toLowerCase() === 'hr' ? '/hr/dashboard' : '/') && 'group-hover:translate-x-1'}`} />
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
              <Link to="/my-comp-offs" className={`flex items-center px-4 py-3 rounded-lg transition-all duration-300 text-base font-medium group ${isActive('/my-comp-offs') ? 'bg-[#7e57c2] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                <Gift className={`w-5 h-5 mr-3 transition-transform duration-300 ${!isActive('/my-comp-offs') && 'group-hover:translate-x-1'}`} />
                Comp-Offs
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
                {pendingLeavesCount > 0 && !isActive('/admin/leave-queue') && <span className="ml-auto w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
              </Link>
              <Link to="/admin/verification-queue" className={`flex items-center whitespace-nowrap px-4 py-3 rounded-lg transition-colors text-base font-medium ${isActive('/admin/verification-queue') ? 'bg-[#7e57c2] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                <CheckCircle2 className="w-5 h-5 mr-3 shrink-0" />
                Verification Queue
                {pendingVerificationCount > 0 && !isActive('/admin/verification-queue') && <span className="ml-auto w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
              </Link>
              <Link to="/admin/employees" className={`flex items-center whitespace-nowrap px-4 py-3 rounded-lg transition-colors text-base font-medium ${isActive('/admin/employees') ? 'bg-[#7e57c2] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                <Users className="w-5 h-5 mr-3 shrink-0" />
                Employees
              </Link>
              <Link to="/admin/comp-off" className={`flex items-center whitespace-nowrap px-4 py-3 rounded-lg transition-colors text-base font-medium ${isActive('/admin/comp-off') ? 'bg-[#7e57c2] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                <Gift className="w-5 h-5 mr-3 shrink-0" />
                Comp-Offs
              </Link>
              <Link to="/admin/apply-leave" className={`flex items-center whitespace-nowrap px-4 py-3 rounded-lg transition-colors text-base font-medium ${isActive('/admin/apply-leave') ? 'bg-[#7e57c2] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                <PlusCircle className="w-5 h-5 mr-3 shrink-0" />
                Apply on Behalf
              </Link>

              <Link to="/holidays" className={`flex items-center px-4 py-3 rounded-lg transition-all duration-300 text-base font-medium group ${isActive('/holidays') ? 'bg-[#7e57c2] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                <CalendarDays className={`w-5 h-5 mr-3 shrink-0 transition-transform duration-300 ${!isActive('/holidays') && 'group-hover:translate-x-1'}`} />
                Holidays
              </Link>
              <Link to="/profile" className={`flex items-center whitespace-nowrap px-4 py-3 rounded-lg transition-all duration-300 text-base font-medium group ${isActive('/profile') ? 'bg-[#7e57c2] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                <User className={`w-5 h-5 mr-3 shrink-0 transition-transform duration-300 ${!isActive('/profile') && 'group-hover:translate-x-1'}`} />
                Profile
              </Link>
            </>
          )}

          {role?.toLowerCase() === 'hr' && (
            <>
              <Link to="/hr/employees" className={`flex items-center px-4 py-3 rounded-lg transition-all duration-300 text-base font-medium group ${isActive('/hr/employees') ? 'bg-[#7e57c2] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                <Users className={`w-5 h-5 mr-3 shrink-0 transition-transform duration-300 ${!isActive('/hr/employees') && 'group-hover:translate-x-1'}`} />
                Employees
              </Link>
              <Link to="/hr/history" className={`flex items-center px-4 py-3 rounded-lg transition-all duration-300 text-base font-medium group ${isActive('/hr/history') ? 'bg-[#7e57c2] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                <Inbox className={`w-5 h-5 mr-3 shrink-0 transition-transform duration-300 ${!isActive('/hr/history') && 'group-hover:translate-x-1'}`} />
                Leave History
              </Link>
              <Link to="/hr/away" className={`flex items-center px-4 py-3 rounded-lg transition-all duration-300 text-base font-medium group ${isActive('/hr/away') ? 'bg-[#7e57c2] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                <Calendar className={`w-5 h-5 mr-3 shrink-0 transition-transform duration-300 ${!isActive('/hr/away') && 'group-hover:translate-x-1'}`} />
                Away Calendar
              </Link>
              <Link to="/holidays" className={`flex items-center px-4 py-3 rounded-lg transition-all duration-300 text-base font-medium group ${isActive('/holidays') ? 'bg-[#7e57c2] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                <CalendarDays className={`w-5 h-5 mr-3 shrink-0 transition-transform duration-300 ${!isActive('/holidays') && 'group-hover:translate-x-1'}`} />
                Holidays
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
              {getInitials(user)}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-semibold text-gray-900 truncate">{formatName(user?.full_name) || user?.email}</p>
              <p className="text-xs text-gray-500">{formatRole(role)}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Top Header */}
        <header className="relative h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 shadow-sm z-30">
          <div className="flex items-center overflow-hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="mr-3 p-2 -ml-2 text-gray-500 hover:text-gray-700 md:hidden focus:outline-none"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg md:text-xl font-semibold text-gray-800 truncate">
              {isActive('/') ? 'Dashboard Overview' : 
               isActive('/admin') ? 'Admin Dashboard' : 
               isActive('/hr/dashboard') ? 'HR Dashboard' : 
               isActive('/admin/leave-queue') ? 'Leave Approval Queue' : 
               isActive('/admin/verification-queue') ? 'Verification Queue' : 
               isActive('/admin/employees') ? 'Employee Directory' : 
               isActive('/admin/comp-off') ? 'Comp-Off Management' : 
               isActive('/admin/apply-leave') ? 'Apply Leave on Behalf' : 
               isActive('/leaves') ? 'Leave History' : 
               isActive('/hr/history') ? 'Leave History' : 
               isActive('/my-comp-offs') ? 'My Comp-Offs' :
               isActive('/holidays') ? 'Company Holidays' : 
               isActive('/apply-leave') ? 'Apply for Leave' : 
               isActive('/profile') ? 'My Profile' : 
               isActive('/notifications') ? 'Notifications' : 
               location.pathname.includes('/hr/employees') ? 'Employee Profile' :
               ''}
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
                  {notificationsList?.slice(0, 8).map(notif => {
                    const Icon = notif.icon;
                    return (
                      <div key={notif.id} onClick={() => handleNotificationClick(notif.link)} className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors flex items-start gap-3 cursor-pointer ${notif.isUnread ? 'bg-blue-50/50' : ''}`}>
                        <div className={`p-2 rounded-full ${notif.iconBg}`}><Icon className="w-4 h-4" /></div>
                        <div>
                          <p className={`text-sm ${notif.isUnread ? 'font-bold text-gray-900' : 'font-medium text-gray-800'}`}>{notif.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{notif.message}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{notif.time}</p>
                        </div>
                      </div>
                    );
                  })}
                  {(!notificationsList || notificationsList.length === 0) && (
                    <div className="p-4 text-center text-sm text-gray-500">No notifications</div>
                  )}
                </div>
                <div className="p-3 border-t border-gray-50 text-center">
                  <button onClick={() => handleNotificationClick('/notifications')} className="text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors">View all notifications</button>
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
        <main className="flex-1 overflow-y-auto p-4 md:p-6 w-full">
          {children}
        </main>
      </div>
    </div>
  )
}

import { Link, useLocation, useNavigate } from "react-router-dom"
import { LayoutDashboard, Calendar, Users, Settings, LogOut, Bell, Inbox, Briefcase, FileText, Clock, FileBarChart, CalendarDays, FolderOpen, RefreshCcw, Activity } from "lucide-react"
import { useContext } from "react"
import { LeaveContext } from "../../context/LeaveContext"
import { useAuth } from "../../context/AuthContext"
import { Button } from "../ui/button"

export default function Layout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  // const { currentUser, setRole } = useContext(LeaveContext) // Puraana mock system
  const { user, role, signOut } = useAuth(); // Naya Asli system

  const isActive = (path) => location.pathname === path

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="flex items-center px-6 h-20 border-b border-gray-100">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-600 text-white mr-3">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-gray-900 leading-tight block">Leave Portal</span>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          
          <Link to={role === 'Admin' ? "/admin" : "/"} className={`flex items-center px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${isActive(role === 'Admin' ? '/admin' : '/') ? 'bg-[#7e57c2] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
            <LayoutDashboard className="w-4 h-4 mr-3" />
            Dashboard
          </Link>

          {role === 'Employee' && (
            <Link to="/" className={`flex items-center px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${isActive('/') ? 'bg-[#7e57c2] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
              <Briefcase className="w-4 h-4 mr-3" />
              Leave Request
            </Link>
          )}

          {(role === 'Manager' || role === 'Admin') && (
            <Link to="/admin/requests" className={`flex items-center px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${isActive('/admin/requests') ? 'bg-[#7e57c2] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
              <Inbox className="w-4 h-4 mr-3" />
              Requests Queue
            </Link>
          )}

          {/* Cleaned up dummy links as requested */}
          
          {role === 'Admin' && (
            <>
              <Link to="/admin/audit-logs" className={`flex items-center px-3 py-2.5 rounded-lg transition-colors text-sm font-medium mt-2 ${isActive('/admin/audit-logs') ? 'bg-[#7e57c2] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                <Activity className="w-4 h-4 mr-3" />
                Audit Logs
              </Link>
              <Link to="/settings" className={`flex items-center px-3 py-2.5 rounded-lg transition-colors text-sm font-medium mt-2 ${isActive('/settings') ? 'bg-[#7e57c2] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                <Settings className="w-4 h-4 mr-3" />
                Settings
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
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-800">
              {isActive('/') ? 'Employee Dashboard' : isActive('/admin') ? 'Dashboard Overview' : isActive('/admin/requests') ? 'Requests Queue' : isActive('/admin/audit-logs') ? 'Audit Logs' : 'Settings'}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <Button variant="ghost" size="sm" className="text-gray-500" onClick={handleLogout}>
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

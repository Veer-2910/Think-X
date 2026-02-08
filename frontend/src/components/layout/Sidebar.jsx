import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  FileText,
  Database,
  Menu,
  X,
  BookOpen,
  ClipboardList,
  ShieldAlert,
  LogOut
} from 'lucide-react';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth(); // Added logout

  const role = user?.role || 'GUEST';

  // Define menus per role
  const allMenuItems = [
    // Common / Admin
    { path: '/', icon: LayoutDashboard, label: 'Overview', roles: ['ADMIN'] },

    // Mentor Specific
    { path: '/mentor/my-students', icon: BookOpen, label: 'My Students', roles: ['MENTOR'] },

    // Counselor Specific
    { path: '/counseling/queue', icon: ClipboardList, label: 'Counseling Queue', roles: ['COUNSELOR'] },
    { path: '/counseling/analytics', icon: BarChart3, label: 'My Analytics', roles: ['COUNSELOR'] },
    { path: '/counseling/data', icon: Database, label: 'Manage Data', roles: ['COUNSELOR'] },

    // General Students List (Admin and Mentor only - Counselors see only assigned students)
    { path: '/students', icon: Users, label: 'Student Directory', roles: ['ADMIN', 'MENTOR'] },

    // Admin / Advanced
    { path: '/analytics', icon: BarChart3, label: 'Analytics', roles: ['ADMIN'] },
    { path: '/reports', icon: FileText, label: 'Reports', roles: ['ADMIN'] },
    { path: '/data-management', icon: Database, label: 'Data Management', roles: ['ADMIN'] },
    { path: '/admin', icon: ShieldAlert, label: 'Admin Console', roles: ['ADMIN'] },
  ];

  // Filter items
  const menuItems = allMenuItems.filter(item => item.roles.includes(role));

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md text-slate-600"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-secondary-900 text-secondary-300 z-40
          transition-transform duration-300 ease-in-out border-r border-secondary-800
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 w-64 flex flex-col shadow-2xl font-sans
        `}
      >
        {/* Header */}
        <div className="h-16 flex items-center px-6 bg-secondary-950 border-b border-secondary-800">
          <div className="flex items-center gap-3 text-primary-400">
            <div className="p-2 bg-primary-500/10 rounded-lg">
              <LayoutDashboard size={20} className="text-primary-400" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">Student Success</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group
                  ${active
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20'
                    : 'text-secondary-400 hover:bg-secondary-800 hover:text-white'
                  }
                `}
              >
                <Icon size={20} className={`transition-colors ${active ? 'text-white' : 'text-secondary-500 group-hover:text-white'}`} />
                <span className="font-medium text-sm">{item.label}</span>
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/50" />}
              </Link>
            );
          })}
        </nav>

        {/* User Profile / Footer */}
        <div className="p-4 border-t border-secondary-800 bg-secondary-900/50">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary-800/50 hover:bg-secondary-800 transition-colors group cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold shadow-lg shadow-primary-500/20 shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-secondary-400 truncate capitalize">{user?.role?.toLowerCase() || 'Guest'}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 text-secondary-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

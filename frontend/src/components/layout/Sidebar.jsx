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
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white shadow-lg z-40
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 w-64 flex flex-col
        `}
      >
        <div className="p-6 border-b border-secondary-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <h1 className="text-xl font-bold text-primary">Student Success</h1>
          <button
            onClick={logout}
            className="p-2 text-secondary-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            title="Sign Out"
          >
            <LogOut size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto mt-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-6 py-3 transition-all duration-200 border-l-4
                  ${isActive(item.path)
                    ? 'bg-primary-50 text-primary border-primary'
                    : 'text-secondary-600 border-transparent hover:bg-secondary-50 hover:text-primary'
                  }
                `}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>


      </aside>
    </>
  );
};

export default Sidebar;

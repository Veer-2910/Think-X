import { User } from 'lucide-react';

const Topbar = ({ title = 'Dashboard' }) => {
  return (
    <header className="sticky top-0 z-20 bg-white shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="lg:ml-0 ml-14">
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-900">Admin User</p>
            <p className="text-xs text-secondary-500">Administrator</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
            <User size={20} className="text-primary" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;

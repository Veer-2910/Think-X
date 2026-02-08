import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
            <Sidebar />
            <div className="flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out lg:ml-72">
                {/* Main Content */}
                <main className="flex-1 p-6 lg:p-8 animate-fade-in">
                    {children || <Outlet />}
                </main>
            </div>
        </div>
    );
};

export default Layout;

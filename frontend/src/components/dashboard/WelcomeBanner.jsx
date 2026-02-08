import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, FileText, Users, Sparkles } from 'lucide-react';
import Button from '../ui/Button';

const WelcomeBanner = () => {
    const { user } = useAuth();
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');
    }, []);

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-800 text-white shadow-xl mb-8">
            {/* Abstract Background Shapes */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl pointer-events-none"></div>

            <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold uppercase tracking-wider border border-white/10">
                            {user?.role || 'Admin'} Dashboard
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                        {greeting}, {user?.name?.split(' ')[0] || 'Admin'}! 👋
                    </h1>
                    <p className="text-blue-100 max-w-xl text-lg">
                        Here's what's happening with your students today. You have <span className="font-semibold text-white">3 high-risk</span> alerts requiring attention.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Button
                        variant="ghost"
                        className="bg-white/10 text-white hover:bg-white/20 border-white/20 backdrop-blur-md"
                    >
                        <FileText size={18} className="mr-2" />
                        Verify Report
                    </Button>
                    <Button
                        className="bg-white text-primary-700 hover:bg-blue-50 border-none shadow-lg shadow-black/10"
                    >
                        <Plus size={18} className="mr-2" />
                        Add New Student
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default WelcomeBanner;

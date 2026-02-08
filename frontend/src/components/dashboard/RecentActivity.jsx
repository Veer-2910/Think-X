import Card from '../ui/Card';
import { Clock, AlertTriangle, CheckCircle, UserPlus, FileText } from 'lucide-react';

const ActivityItem = ({ icon: Icon, color, title, time, user }) => (
    <div className="flex gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors group cursor-pointer">
        <div className={`mt-1 p-2 rounded-full h-fit flex-shrink-0 ${color}`}>
            <Icon size={16} />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate group-hover:text-primary-600 transition-colors">
                {title}
            </p>
            <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-500 font-medium">{user}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock size={10} /> {time}
                </span>
            </div>
        </div>
    </div>
);

const RecentActivity = () => {
    // Mock data - replace with API call later
    const activities = [
        {
            id: 1,
            type: 'risk',
            title: 'High risk alert: Sarah Johnson',
            time: '2 hours ago',
            user: 'System AI',
            icon: AlertTriangle,
            color: 'bg-rose-100 text-rose-600'
        },
        {
            id: 2,
            type: 'success',
            title: 'Performance improved: Mike Smith',
            time: '4 hours ago',
            user: 'Metrics Watch',
            icon: CheckCircle,
            color: 'bg-green-100 text-green-600'
        },
        {
            id: 3,
            type: 'new',
            title: 'New student enrollment',
            time: '1 day ago',
            user: 'Admin',
            icon: UserPlus,
            color: 'bg-blue-100 text-blue-600'
        },
        {
            id: 4,
            type: 'report',
            title: 'Monthly attendance report generated',
            time: '1 day ago',
            user: 'System',
            icon: FileText,
            color: 'bg-purple-100 text-purple-600'
        }
    ];

    return (
        <Card className="h-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800">Recent Activity</h3>
                <button className="text-xs font-medium text-primary-600 hover:text-primary-700">View All</button>
            </div>
            <div className="space-y-1 -mx-2">
                {activities.map(activity => (
                    <ActivityItem key={activity.id} {...activity} />
                ))}
            </div>
        </Card>
    );
};

export default RecentActivity;

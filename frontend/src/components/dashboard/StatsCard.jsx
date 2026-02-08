import Card from '../ui/Card';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

const StatsCard = ({
    title,
    value,
    icon: Icon,
    trend,
    trendLabel = 'vs last month',
    color = 'primary',
    delay = 0
}) => {
    const colors = {
        primary: 'bg-primary-50 text-primary-600',
        success: 'bg-green-50 text-green-600',
        warning: 'bg-amber-50 text-amber-600',
        danger: 'bg-rose-50 text-rose-600',
        info: 'bg-sky-50 text-sky-600',
        purple: 'bg-purple-50 text-purple-600'
    };

    const trendColors = {
        up: 'text-green-600',
        down: 'text-rose-600',
        neutral: 'text-slate-500'
    };

    const getTrendIcon = () => {
        if (trend > 0) return <ArrowUpRight size={16} />;
        if (trend < 0) return <ArrowDownRight size={16} />;
        return <Minus size={16} />;
    };

    const trendColor = trend > 0 ? trendColors.up : trend < 0 ? trendColors.down : trendColors.neutral;

    return (
        <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${colors[color]} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={24} />
                </div>
                {trend !== undefined && (
                    <div className={`flex items-center gap-1 text-sm font-semibold ${trendColor} bg-white px-2 py-1 rounded-lg border border-slate-100 shadow-sm`}>
                        {getTrendIcon()}
                        <span>{Math.abs(trend)}%</span>
                    </div>
                )}
            </div>

            <div>
                <h3 className="text-secondary-500 text-sm font-medium mb-1">{title}</h3>
                <div className="flex items-baseline gap-2">
                    <h2 className="text-3xl font-bold text-slate-800">{value}</h2>
                </div>
                {trendLabel && (
                    <p className="text-xs text-secondary-400 mt-2">{trendLabel}</p>
                )}
            </div>
        </Card>
    );
};

export default StatsCard;

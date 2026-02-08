import { Link } from 'react-router-dom';
import { Mail, Phone, BookOpen, AlertTriangle, MoreVertical, Eye } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

const TrendIndicator = ({ value, label }) => (
    <div className="flex flex-col">
        <span className="text-xs text-slate-400 font-medium uppercase">{label}</span>
        <span className={`text-lg font-bold ${value < 75 ? 'text-red-500' : 'text-slate-800'}`}>
            {value}%
        </span>
    </div>
);

const MenteeCard = ({ student }) => {
    return (
        <div className="group bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-lg hover:border-indigo-100 transition-all duration-300 relative overflow-hidden">
            {/* Risk Border Top */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 ${student.dropoutRisk === 'HIGH' ? 'bg-red-500' :
                    student.dropoutRisk === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'
                }`}></div>

            <div className="flex justify-between items-start mb-4 mt-2">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                        {student.name.charAt(0)}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{student.name}</h3>
                        <p className="text-xs text-slate-500">{student.studentId}</p>
                    </div>
                </div>
                <div className="p-2 hover:bg-slate-50 rounded-full cursor-pointer text-slate-400">
                    <MoreVertical size={18} />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-5 border-t border-b border-slate-50 py-3">
                <TrendIndicator value={student.attendancePercent ? Math.round(student.attendancePercent) : 0} label="Attendance" />
                <div className="flex flex-col text-right">
                    <span className="text-xs text-slate-400 font-medium uppercase">CGPA</span>
                    <span className={`text-lg font-bold ${student.currentCGPA < 6 ? 'text-red-500' : 'text-slate-800'}`}>
                        {student.currentCGPA?.toFixed(1) || 'N/A'}
                    </span>
                </div>
            </div>

            {/* Action Area */}
            <div className="flex items-center gap-2">
                <Link to={`/students/${student.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full justify-center group-hover:border-indigo-200 group-hover:bg-indigo-50 group-hover:text-indigo-700">
                        <Eye size={16} className="mr-2" /> View Profile
                    </Button>
                </Link>
                <Button size="sm" className="px-3 bg-white border border-slate-200 text-slate-500 hover:text-indigo-600">
                    <Mail size={16} />
                </Button>
            </div>

            {/* Risk Indicator Tag (if high risk) */}
            {student.dropoutRisk === 'HIGH' && (
                <div className="absolute top-2 right-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                </div>
            )}
        </div>
    );
};

const MyMenteesGrid = ({ students }) => {
    if (!students || students.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users size={32} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-600">No Mentees Assigned</h3>
                <p className="text-slate-400 text-sm">Students assigned to you will appear here.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {students.map(student => (
                <MenteeCard key={student.id} student={student} />
            ))}
        </div>
    );
};

// Also export Users icon for the empty state to work if needed, though mostly standard imports
import { Users } from 'lucide-react';

export default MyMenteesGrid;

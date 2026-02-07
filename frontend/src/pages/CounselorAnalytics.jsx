import { useState, useEffect } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import { counselorAPI } from '../services/api';
import {
    BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
    TrendingUp, AlertTriangle, Users, Award, BookOpen, Target
} from 'lucide-react';
import Badge from '../components/ui/Badge';

const CounselorAnalytics = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyStudents();
    }, []);

    const fetchMyStudents = async () => {
        try {
            setLoading(true);
            const response = await counselorAPI.getMyStudents();
            setStudents(response.data || []);
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <PageWrapper title="My Students Analytics">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                </div>
            </PageWrapper>
        );
    }

    // Calculate statistics
    const totalStudents = students.length;
    const highRisk = students.filter(s => s.dropoutRisk === 'HIGH').length;
    const mediumRisk = students.filter(s => s.dropoutRisk === 'MEDIUM').length;
    const lowRisk = students.filter(s => s.dropoutRisk === 'LOW').length;

    const avgAttendance = totalStudents > 0
        ? (students.reduce((sum, s) => sum + (s.attendancePercent || 0), 0) / totalStudents).toFixed(1)
        : 0;

    const avgCGPA = totalStudents > 0
        ? (students.reduce((sum, s) => sum + (s.currentCGPA || 0), 0) / totalStudents).toFixed(2)
        : 0;

    const lowAttendance = students.filter(s => (s.attendancePercent || 0) < 75).length;
    const lowCGPA = students.filter(s => (s.currentCGPA || 0) < 6.0).length;

    // Risk distribution pie chart data
    const riskData = [
        { name: 'Low Risk', value: lowRisk, color: '#22C55E' },
        { name: 'Medium Risk', value: mediumRisk, color: '#F59E0B' },
        { name: 'High Risk', value: highRisk, color: '#EF4444' },
    ].filter(item => item.value > 0);

    // Performance categories
    const performanceData = [
        { category: 'Excellent (CGPA > 8)', count: students.filter(s => s.currentCGPA > 8).length },
        { category: 'Good (7-8)', count: students.filter(s => s.currentCGPA >= 7 && s.currentCGPA <= 8).length },
        { category: 'Average (6-7)', count: students.filter(s => s.currentCGPA >= 6 && s.currentCGPA < 7).length },
        { category: 'Below Avg (<6)', count: students.filter(s => s.currentCGPA < 6).length },
    ];

    // Attendance categories
    const attendanceData = [
        { category: '90%+', count: students.filter(s => s.attendancePercent >= 90).length },
        { category: '75-90%', count: students.filter(s => s.attendancePercent >= 75 && s.attendancePercent < 90).length },
        { category: '60-75%', count: students.filter(s => s.attendancePercent >= 60 && s.attendancePercent < 75).length },
        { category: 'Below 60%', count: students.filter(s => s.attendancePercent < 60).length },
    ];

    const statsCards = [
        {
            title: 'Total Students',
            value: totalStudents,
            icon: Users,
            color: 'text-primary',
            bgColor: 'bg-primary-50',
        },
        {
            title: 'High Risk Students',
            value: highRisk,
            subtitle: `${totalStudents > 0 ? ((highRisk / totalStudents) * 100).toFixed(1) : 0}% of total`,
            icon: AlertTriangle,
            color: 'text-red-600',
            bgColor: 'bg-red-50',
        },
        {
            title: 'Average CGPA',
            value: avgCGPA,
            subtitle: `${lowCGPA} students below 6.0`,
            icon: Award,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
        },
        {
            title: 'Avg Attendance',
            value: `${avgAttendance}%`,
            subtitle: `${lowAttendance} below 75%`,
            icon: Target,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
    ];

    return (
        <PageWrapper title="My Students Analytics">
            {totalStudents === 0 ? (
                <Card>
                    <div className="text-center py-12">
                        <Users size={48} className="mx-auto text-secondary-400 mb-4" />
                        <h3 className="text-lg font-semibold text-secondary-700 mb-2">No Students Assigned</h3>
                        <p className="text-secondary-500">You don't have any students assigned to you yet.</p>
                    </div>
                </Card>
            ) : (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {statsCards.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <Card key={index} hover>
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm text-secondary-500 font-medium">{stat.title}</p>
                                        <div className={`${stat.bgColor} ${stat.color} p-2 rounded-lg`}>
                                            <Icon size={20} />
                                        </div>
                                    </div>
                                    <p className="text-3xl font-bold mb-1">{stat.value}</p>
                                    {stat.subtitle && (
                                        <p className="text-sm text-secondary-500">{stat.subtitle}</p>
                                    )}
                                </Card>
                            );
                        })}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Risk Distribution */}
                        <Card>
                            <div className="flex items-center gap-2 mb-4">
                                <AlertTriangle className="text-red-600" size={24} />
                                <h3 className="text-lg font-semibold">Risk Distribution</h3>
                            </div>
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie
                                        data={riskData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={90}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {riskData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                                <div>
                                    <div className="text-2xl font-bold text-green-600">{lowRisk}</div>
                                    <div className="text-xs text-secondary-600">Low Risk</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-amber-600">{mediumRisk}</div>
                                    <div className="text-xs text-secondary-600">Medium Risk</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-red-600">{highRisk}</div>
                                    <div className="text-xs text-secondary-600">High Risk</div>
                                </div>
                            </div>
                        </Card>

                        {/* Performance Distribution */}
                        <Card>
                            <div className="flex items-center gap-2 mb-4">
                                <Award className="text-primary" size={24} />
                                <h3 className="text-lg font-semibold">CGPA Distribution</h3>
                            </div>
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={performanceData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                    <XAxis dataKey="category" stroke="#64748B" angle={-15} textAnchor="end" height={80} />
                                    <YAxis stroke="#64748B" />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#4F46E5" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                    </div>

                    {/* Attendance Distribution */}
                    <Card className="mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <BookOpen className="text-blue-600" size={24} />
                            <h3 className="text-lg font-semibold">Attendance Distribution</h3>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={attendanceData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                <XAxis type="number" stroke="#64748B" />
                                <YAxis dataKey="category" type="category" stroke="#64748B" width={80} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#22C55E" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>

                    {/* High-Risk Students List */}
                    {highRisk > 0 && (
                        <Card>
                            <div className="flex items-center gap-2 mb-4">
                                <AlertTriangle className="text-red-600" size={24} />
                                <h3 className="text-lg font-semibold">High Risk Students - Priority Attention</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-secondary-100">
                                            <th className="text-left py-3 px-4 text-sm font-semibold">Student</th>
                                            <th className="text-center py-3 px-4 text-sm font-semibold">Attendance</th>
                                            <th className="text-center py-3 px-4 text-sm font-semibold">CGPA</th>
                                            <th className="text-center py-3 px-4 text-sm font-semibold">Risk</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students
                                            .filter(s => s.dropoutRisk === 'HIGH')
                                            .map((student) => (
                                                <tr key={student.id} className="border-b border-secondary-50 hover:bg-secondary-50">
                                                    <td className="py-3 px-4">
                                                        <p className="font-medium">{student.name}</p>
                                                        <p className="text-xs text-secondary-500">{student.studentId}</p>
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        <span className={`font-semibold ${student.attendancePercent < 75 ? 'text-red-600' : 'text-green-600'}`}>
                                                            {student.attendancePercent || 0}%
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        <span className={`font-semibold ${student.currentCGPA < 6 ? 'text-red-600' : 'text-green-600'}`}>
                                                            {student.currentCGPA?.toFixed(2) || '0.00'}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        <Badge variant="danger">HIGH</Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}
                </>
            )}
        </PageWrapper>
    );
};

export default CounselorAnalytics;

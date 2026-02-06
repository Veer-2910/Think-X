import { useState, useEffect } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { 
  Users, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle,
  Eye
} from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Link } from 'react-router-dom';
import { studentAPI } from '../services/api';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [highRiskStudents, setHighRiskStudents] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all students (set high limit to get all records)
      const studentsData = await studentAPI.getAll({ limit: 10000 });
      const students = studentsData.data || studentsData;
      
      // Calculate statistics
      const totalStudents = students.length;
      const highRisk = students.filter(s => s.dropoutRisk === 'HIGH').length;
      const mediumRisk = students.filter(s => s.dropoutRisk === 'MEDIUM').length;
      const lowRisk = students.filter(s => s.dropoutRisk === 'LOW' || !s.dropoutRisk).length;
      
      // Get high risk students for table (top 5)
      const highRiskList = students
        .filter(s => s.dropoutRisk === 'HIGH')
        .slice(0, 5)
        .map(s => ({
          id: s.id,
          name: s.name,
          studentId: s.studentId,
          attendance: Math.round(s.attendancePercent || 0),
          avgMarks: s.currentCGPA ? Math.round((s.currentCGPA / 10) * 100) : 0,
          riskLevel: 'HIGH'
        }));
      
      setStats({
        total: totalStudents,
        highRisk,
        mediumRisk,
        safe: lowRisk
      });
      
      setHighRiskStudents(highRiskList);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      </PageWrapper>
    );
  }

  if (!stats) {
    return (
      <PageWrapper title="Dashboard">
        <Card>
          <p className="text-center text-secondary-500">Failed to load dashboard data</p>
        </Card>
      </PageWrapper>
    );
  }

  const riskDistribution = [
    { name: 'Low Risk', value: stats.safe, color: '#22C55E' },
    { name: 'Medium Risk', value: stats.mediumRisk, color: '#F59E0B' },
    { name: 'High Risk', value: stats.highRisk, color: '#EF4444' },
  ];

  const kpis = [
    {
      title: 'Total Students',
      value: stats.total,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary-50',
    },
    {
      title: 'High Risk',
      value: stats.highRisk,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Medium Risk',
      value: stats.mediumRisk,
      icon: AlertCircle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      title: 'Safe',
      value: stats.safe,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  const getRiskBadge = (level) => {
    const variants = {
      HIGH: 'danger',
      MEDIUM: 'warning',
      LOW: 'success',
    };
    return <Badge variant={variants[level]}>{level}</Badge>;
  };

  return (
    <PageWrapper title="Dashboard">
      <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
        <h2 className="text-lg font-semibold text-indigo-800">Welcome, Admin</h2>
        <p className="text-indigo-600">System overview and global management.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} hover className="cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary-500 font-medium">{kpi.title}</p>
                  <p className="text-3xl font-bold mt-2">{kpi.value}</p>
                </div>
                <div className={`${kpi.bgColor} ${kpi.color} p-3 rounded-lg`}>
                  <Icon size={24} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-8">
        {/* Risk Distribution */}
        <Card>
          <h3 className="text-lg font-semibold mb-4">Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={riskDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {riskDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* High Risk Students Table */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">High-Risk Students</h3>
          <Link to="/students?risk=HIGH" className="text-primary hover:text-primary-600 text-sm font-medium">
            View All →
          </Link>
        </div>
        {highRiskStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-secondary-100">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">Student ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">Attendance</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">Avg Marks</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">Risk Level</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {highRiskStudents.map((student) => (
                  <tr 
                    key={student.id} 
                    className="border-b border-secondary-50 hover:bg-secondary-50 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm font-medium">{student.name}</td>
                    <td className="py-3 px-4 text-sm text-secondary-600">{student.studentId}</td>
                    <td className="py-3 px-4 text-sm">{student.attendance}%</td>
                    <td className="py-3 px-4 text-sm">{student.avgMarks}%</td>
                    <td className="py-3 px-4">{getRiskBadge(student.riskLevel)}</td>
                    <td className="py-3 px-4">
                      <Link
                        to={`/students/${student.id}`}
                        className="inline-flex items-center gap-1 text-primary hover:text-primary-600 text-sm font-medium"
                      >
                        <Eye size={16} />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-secondary-500">
            <p>No high-risk students found</p>
            <p className="text-sm mt-2">Upload student data to see risk analysis</p>
          </div>
        )}
      </Card>
    </PageWrapper>
  );
};

export default Dashboard;

import { useState, useEffect } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import { 
  TrendingUp, 
  TrendingDown,
  Users,
  Award,
  AlertTriangle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts';
import { analyticsAPI, studentAPI } from '../services/api';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [departmentData, setDepartmentData] = useState([]);
  const [stats, setStats] = useState({
    successRate: 0,
    dropoutRate: 0,
    activeInterventions: 0,
    highRiskStudents: 0
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch department risk data
      const deptResponse = await analyticsAPI.getDepartmentRisk();
      const deptData = deptResponse.data || deptResponse;
      
      // Transform data for chart
      const chartData = deptData.map(dept => ({
        name: dept.department.substring(0, 10), // Shorten long names
        total: dept.total,
        highRisk: dept.high,
        mediumRisk: dept.medium,
        lowRisk: dept.low
      }));
      
      setDepartmentData(chartData);
      
      // Fetch students for stats calculation
      const studentsResponse = await studentAPI.getAll({ limit: 10000 });
      const students = studentsResponse.data || studentsResponse;
      
      const totalStudents = students.length;
      const highRisk = students.filter(s => s.dropoutRisk === 'HIGH').length;
      const lowRisk = students.filter(s => s.dropoutRisk === 'LOW' || !s.dropoutRisk).length;
      
      setStats({
        successRate: totalStudents > 0 ? ((lowRisk / totalStudents) * 100).toFixed(1) : 0,
        dropoutRate: totalStudents > 0 ? ((highRisk / totalStudents) * 100).toFixed(1) : 0,
        activeInterventions: 0, // Would need intervention API
        highRiskStudents: highRisk
      });
      
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper title="Analytics">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      </PageWrapper>
    );
  }

  const statsCards = [
    {
      title: 'Success Rate',
      value: `${stats.successRate}%`,
      change: '+5.2%',
      icon: Award,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      positive: true,
    },
    {
      title: 'Dropout Rate',
      value: `${stats.dropoutRate}%`,
      change: '-1.7%',
      icon: TrendingDown,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      positive: true,
    },
    {
      title: 'Active Interventions',
      value: stats.activeInterventions,
      change: '+12',
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary-50',
      positive: true,
    },
    {
      title: 'High Risk Students',
      value: stats.highRiskStudents,
      change: '-15',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      positive: true,
    },
  ];

  return (
    <PageWrapper title="Analytics">
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
              <p className={`text-sm ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change} from last month
              </p>
            </Card>
          );
        })}
      </div>

      {/* Department-wise Risk Distribution */}
      <Card className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Department-wise Risk Distribution</h3>
        {departmentData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="name" stroke="#64748B" />
              <YAxis stroke="#64748B" />
              <Tooltip />
              <Legend />
              <Bar dataKey="lowRisk" fill="#22C55E" name="Low Risk" />
              <Bar dataKey="mediumRisk" fill="#F59E0B" name="Medium Risk" />
              <Bar dataKey="highRisk" fill="#EF4444" name="High Risk" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-secondary-500">
            <p>No department data available</p>
            <p className="text-sm mt-2">Upload student data to see analytics</p>
          </div>
        )}
      </Card>
    </PageWrapper>
  );
};

export default Analytics;

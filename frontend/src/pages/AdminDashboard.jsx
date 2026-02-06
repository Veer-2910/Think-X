import { useState, useEffect } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button'; // Assuming Button component exists
import ExportButton from '../components/ui/ExportButton';
import { analyticsAPI, authAPI } from '../services/api'; // Added authAPI
import { 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  Building2,
  UserCheck,
  FileText,
  BarChart3,
  UserPlus, // Added
  Mail // Added
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState('');
  
  // Create User State
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'MENTOR' });
  const [createUserLoading, setCreateUserLoading] = useState(false);
  const [createUserMessage, setCreateUserMessage] = useState(null); // { type: 'success'|'error', text: '' }

  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  useEffect(() => {
    fetchInsights();
  }, [selectedSemester]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const params = selectedSemester ? { semester: selectedSemester } : {};
      const data = await analyticsAPI.getAdminInsights(params);
      setInsights(data.data);
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateUserLoading(true);
    setCreateUserMessage(null);
    try {
      await authAPI.createUser(newUser);
      setCreateUserMessage({ type: 'success', text: `User ${newUser.email} created successfully!` });
      setNewUser({ name: '', email: '', role: 'MENTOR' });
      // Optionally refresh stats if impactful
    } catch (error) {
      setCreateUserMessage({ type: 'error', text: error.response?.data?.message || 'Failed to create user' });
    } finally {
      setCreateUserLoading(false);
    }
  };

  if (loading && !insights) {
    return (
      <PageWrapper title="Admin Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      </PageWrapper>
    );
  }

  if (!loading && !insights) {
    return (
      <PageWrapper title="Admin Dashboard">
        <Card>
          <p className="text-center text-secondary-500">Failed to load insights</p>
        </Card>
      </PageWrapper>
    );
  }

  const riskData = insights ? [
    { name: 'High Risk', value: insights.overview.highRiskStudents, color: '#EF4444' },
    { name: 'Medium Risk', value: insights.overview.mediumRiskStudents, color: '#F59E0B' },
    { name: 'Low Risk', value: insights.overview.lowRiskStudents, color: '#22C55E' }
  ] : [];

  const kpis = insights ? [
    {
      title: 'Total Students',
      value: insights.overview.totalStudents,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary-50'
    },
    {
      title: 'Departments',
      value: insights.overview.totalDepartments,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'High Risk',
      value: insights.overview.highRiskStudents,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Interventions',
      value: insights.interventions.total,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Avg CGPA',
      value: insights.overview.avgCGPA,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'Avg Attendance',
      value: `${insights.overview.avgAttendance}%`,
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ] : [];

  return (
    <PageWrapper title="Admin Dashboard">

      {/* Controls: Semester Filter & Export */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        
        {/* Semester Filter */}
        <div className="flex items-center gap-3 bg-white p-2 rounded-lg shadow-sm w-full md:w-auto">
          <span className="text-sm font-medium text-secondary-600 pl-2">Filter by:</span>
          <select 
            value={selectedSemester} 
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="border-none bg-secondary-50 rounded-md px-3 py-1.5 text-sm font-medium text-secondary-900 focus:ring-2 focus:ring-primary-500 cursor-pointer"
          >
            <option value="">All Semesters</option>
            {semesters.map(sem => (
              <option key={sem} value={sem}>Semester {sem}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <Button 
            onClick={() => {
              fetchInsights();
            }}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </Button>
          <div className="flex gap-2">
            <ExportButton type="csv" reportType="students" filters={selectedSemester ? { semester: selectedSemester } : {}} />
            <ExportButton type="pdf" reportType="admin-insights" />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} hover className="cursor-pointer">
              <div className="flex flex-col gap-3">
                <div className={`${kpi.bgColor} ${kpi.color} p-3 rounded-lg w-fit`}>
                  <Icon size={24} />
                </div>
                <div>
                  <p className="text-sm text-secondary-500 font-medium">{kpi.title}</p>
                  <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* User Management Section */}
      <Card className="mb-8 border-l-4 border-l-primary">
        <div className="flex items-center gap-3 mb-4">
          <UserPlus className="text-primary" size={24} />
          <h3 className="text-lg font-semibold">Create New User</h3>
        </div>
        
        {createUserMessage && (
          <div className={`mb-4 p-3 rounded-lg ${createUserMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {createUserMessage.text}
          </div>
        )}

        <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input 
              type="text" 
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g. Dr. Jane Smith"
              value={newUser.name}
              onChange={(e) => setNewUser({...newUser, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              placeholder="jane@university.edu"
              value={newUser.email}
              onChange={(e) => setNewUser({...newUser, email: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
            <select 
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              value={newUser.role}
              onChange={(e) => setNewUser({...newUser, role: e.target.value})}
            >
              <option value="MENTOR">Mentor</option>
              <option value="COUNSELOR">Counselor</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div>
            <Button type="submit" disabled={createUserLoading} className="w-full flex justify-center items-center gap-2">
              {createUserLoading ? 'Creating...' : <><Mail size={16} /> Create & Send Credentials</>}
            </Button>
          </div>
        </form>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Risk Distribution */}
        <Card>
          <h3 className="text-lg font-semibold mb-4">Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={riskData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {riskData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Quick Stats */}
        <Card>
          <h3 className="text-lg font-semibold mb-4">System Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="text-primary" size={20} />
                <span className="text-sm font-medium">Counseling Sessions</span>
              </div>
              <span className="text-lg font-bold">{insights.interventions.counselingSessions}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
              <div className="flex items-center gap-3">
                <UserCheck className="text-green-600" size={20} />
                <span className="text-sm font-medium">Active Interventions</span>
              </div>
              <span className="text-lg font-bold">{insights.interventions.total}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="text-blue-600" size={20} />
                <span className="text-sm font-medium">Risk Trend</span>
              </div>
              <Badge variant="success">{insights.trends.riskTrend}</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
              <div className="flex items-center gap-3">
                <BarChart3 className="text-purple-600" size={20} />
                <span className="text-sm font-medium">Attendance Trend</span>
              </div>
              <Badge variant="success">{insights.trends.attendanceTrend}</Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Top Departments by Risk */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Top Departments by Risk</h3>
          <Link to="/advanced-analytics" className="text-primary hover:text-primary-600 text-sm font-medium">
            View All →
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondary-100">
                <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">Department</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-secondary-700">Total</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-secondary-700">High Risk</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-secondary-700">Medium Risk</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-secondary-700">Low Risk</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-secondary-700">Risk %</th>
              </tr>
            </thead>
            <tbody>
              {insights.departmentRisk.map((dept, index) => (
                <tr key={index} className="border-b border-secondary-50 hover:bg-secondary-50 transition-colors">
                  <td className="py-3 px-4 text-sm font-medium">{dept.department}</td>
                  <td className="py-3 px-4 text-sm text-center">{dept.total}</td>
                  <td className="py-3 px-4 text-sm text-center">
                    <span className="text-red-600 font-semibold">{dept.high}</span>
                  </td>
                  <td className="py-3 px-4 text-sm text-center">
                    <span className="text-amber-600 font-semibold">{dept.medium}</span>
                  </td>
                  <td className="py-3 px-4 text-sm text-center">
                    <span className="text-green-600 font-semibold">{dept.low}</span>
                  </td>
                  <td className="py-3 px-4 text-sm text-center">
                    <Badge variant={dept.highPercent > 20 ? 'danger' : dept.highPercent > 10 ? 'warning' : 'success'}>
                      {dept.highPercent}%
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Link to="/students">
          <Card hover className="cursor-pointer text-center p-6">
            <Users className="mx-auto text-primary mb-3" size={32} />
            <h4 className="font-semibold mb-1">Manage Students</h4>
            <p className="text-sm text-secondary-600">View and manage all students</p>
          </Card>
        </Link>

        <Link to="/analytics">
          <Card hover className="cursor-pointer text-center p-6">
            <BarChart3 className="mx-auto text-green-600 mb-3" size={32} />
            <h4 className="font-semibold mb-1">View Analytics</h4>
            <p className="text-sm text-secondary-600">Detailed analytics and reports</p>
          </Card>
        </Link>

        <Link to="/advanced-analytics">
          <Card hover className="cursor-pointer text-center p-6">
            <TrendingUp className="mx-auto text-purple-600 mb-3" size={32} />
            <h4 className="font-semibold mb-1">Advanced Analytics</h4>
            <p className="text-sm text-secondary-600">In-depth insights and trends</p>
          </Card>
        </Link>
      </div>
    </PageWrapper>
  );
};

export default AdminDashboard;

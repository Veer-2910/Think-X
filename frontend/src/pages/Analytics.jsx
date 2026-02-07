import { useState, useEffect } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import HeatmapChart from '../components/charts/HeatmapChart';
import ExportButton from '../components/ui/ExportButton';
import { analyticsAPI, studentAPI } from '../services/api';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  TrendingUp, TrendingDown, AlertTriangle, BookOpen,
  Users, Award
} from 'lucide-react';

const Analytics = () => {
  // Data states
  const [departmentRisk, setDepartmentRisk] = useState([]);
  const [subjectFailures, setSubjectFailures] = useState([]);
  const [semesterTransition, setSemesterTransition] = useState([]);
  const [stats, setStats] = useState({
    successRate: 0,
    dropoutRate: 0,
    activeInterventions: 0,
    highRiskStudents: 0
  });

  // UI states
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState('');

  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  useEffect(() => {
    fetchAnalytics();
  }, [selectedSemester]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      const params = selectedSemester ? { semester: selectedSemester } : {};

      // Fetch all analytics data
      const [deptData, subjData, semData, studentsResponse] = await Promise.all([
        analyticsAPI.getDepartmentRisk(params),
        analyticsAPI.getSubjectFailures(),
        analyticsAPI.getSemesterTransition(),
        studentAPI.getAll({ limit: 1000 })
      ]);

      setDepartmentRisk(deptData.data || []);
      setSubjectFailures(subjData.data || []);
      setSemesterTransition(semData.data || []);

      // Calculate stats
      const students = studentsResponse.data || [];
      const totalStudents = students.length;
      const highRisk = students.filter(s => s.dropoutRisk === 'HIGH').length;
      const lowRisk = students.filter(s => s.dropoutRisk === 'LOW' || !s.dropoutRisk).length;

      setStats({
        successRate: totalStudents > 0 ? ((lowRisk / totalStudents) * 100).toFixed(1) : 0,
        dropoutRate: totalStudents > 0 ? ((highRisk / totalStudents) * 100).toFixed(1) : 0,
        activeInterventions: 0,
        highRiskStudents: highRisk
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && departmentRisk.length === 0) {
    return (
      <PageWrapper title="Analytics & Insights">
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
      bgColor: 'bg-green-50',
      color: 'text-green-600',
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
    <PageWrapper title="Analytics & Insights">
      {/* Controls: Filter & Export */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        {/* Semester Filter */}
        <div className="flex items-center gap-3 bg-white p-2 rounded-lg shadow-sm w-full md:w-auto">
          <span className="text-sm font-medium text-secondary-600 pl-2">Filter by Semester:</span>
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

        <div className="flex gap-3 w-full md:w-auto justify-end">
          <ExportButton type="csv" reportType="students" />
          <ExportButton type="pdf" reportType="admin-insights" />
        </div>
      </div>

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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-primary" size={24} />
            <h3 className="text-lg font-semibold">Department-wise Risk Distribution</h3>
          </div>
          <ExportButton type="pdf" reportType="department-risk" />
        </div>

        {departmentRisk.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={departmentRisk}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="department" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip />
                <Legend />
                <Bar dataKey="high" fill="#EF4444" name="High Risk" />
                <Bar dataKey="medium" fill="#F59E0B" name="Medium Risk" />
                <Bar dataKey="low" fill="#22C55E" name="Low Risk" />
              </BarChart>
            </ResponsiveContainer>

            {/* Department Stats Table */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-secondary-100">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">Department</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-secondary-700">Total</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-secondary-700">High Risk %</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-secondary-700">Avg Risk Score</th>
                  </tr>
                </thead>
                <tbody>
                  {departmentRisk.map((dept, index) => (
                    <tr key={index} className="border-b border-secondary-50 hover:bg-secondary-50 transition-colors">
                      <td className="py-3 px-4 text-sm font-medium">{dept.department}</td>
                      <td className="py-3 px-4 text-sm text-center">{dept.total}</td>
                      <td className="py-3 px-4 text-sm text-center">
                        <span className={`font-semibold ${dept.highPercent > 20 ? 'text-red-600' : dept.highPercent > 10 ? 'text-amber-600' : 'text-green-600'}`}>
                          {dept.highPercent}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-center">{dept.avgRiskScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-secondary-500">
            <p>No department data available</p>
            <p className="text-sm mt-2">Upload student data to see analytics</p>
          </div>
        )}
      </Card>

      {/* Subject-wise Failure Heatmap */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="text-red-600" size={24} />
          <h3 className="text-lg font-semibold">Subject-wise Failure Heatmap</h3>
        </div>
        <p className="text-sm text-secondary-600 mb-4">
          Hover over cells to see detailed failure statistics
        </p>
        <HeatmapChart data={subjectFailures} />
      </Card>

      {/* Semester Transition Analysis */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="text-primary" size={24} />
          <h3 className="text-lg font-semibold">Semester Transition Analysis</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CGPA Trend */}
          <div>
            <h4 className="text-sm font-semibold text-secondary-700 mb-3">Average CGPA by Semester</h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={semesterTransition}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="semester" stroke="#64748B" />
                <YAxis stroke="#64748B" domain={[0, 10]} />
                <Tooltip />
                <Line type="monotone" dataKey="avgCGPA" stroke="#4F46E5" strokeWidth={3} dot={{ fill: '#4F46E5', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Attendance Trend */}
          <div>
            <h4 className="text-sm font-semibold text-secondary-700 mb-3">Average Attendance by Semester</h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={semesterTransition}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="semester" stroke="#64748B" />
                <YAxis stroke="#64748B" domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="avgAttendance" stroke="#22C55E" strokeWidth={3} dot={{ fill: '#22C55E', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution by Semester */}
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-secondary-700 mb-3">Risk Distribution by Semester</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={semesterTransition}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="semester" stroke="#64748B" />
              <YAxis stroke="#64748B" />
              <Tooltip />
              <Legend />
              <Bar dataKey="highRisk" stackId="a" fill="#EF4444" name="High Risk" />
              <Bar dataKey="mediumRisk" stackId="a" fill="#F59E0B" name="Medium Risk" />
              <Bar dataKey="lowRisk" stackId="a" fill="#22C55E" name="Low Risk" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </PageWrapper>
  );
};

export default Analytics;

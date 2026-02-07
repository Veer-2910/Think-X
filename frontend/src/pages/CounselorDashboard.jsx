import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { counselorAPI } from '../services/api';
import {
  Users,
  AlertTriangle,
  TrendingUp,
  Eye,
  Edit,
  Plus,
  Activity
} from 'lucide-react';

const CounselorDashboard = () => {
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, HIGH, MEDIUM, LOW
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsData, statsData] = await Promise.all([
        counselorAPI.getMyStudents(),
        counselorAPI.getMyStats()
      ]);
      setStudents(studentsData.data || []);
      setStats(statsData.data || null);
    } catch (err) {
      console.error('Error fetching counselor data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (level) => {
    const variants = {
      HIGH: 'danger',
      MEDIUM: 'warning',
      LOW: 'success',
      UNKNOWN: 'neutral'
    };
    return <Badge variant={variants[level] || 'neutral'}>{level}</Badge>;
  };

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesFilter = filter === 'ALL' || student.dropoutRisk === filter;
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <PageWrapper title="My Students">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="My Students">

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-50 text-primary rounded-lg">
              <Users size={24} />
            </div>
            <div>
              <p className="text-secondary-500 text-sm">Total Students</p>
              <h3 className="text-2xl font-bold">{stats?.totalStudents || 0}</h3>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-lg">
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="text-secondary-500 text-sm">High Risk</p>
              <h3 className="text-2xl font-bold">{stats?.highRisk || 0}</h3>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-secondary-500 text-sm">Avg CGPA</p>
              <h3 className="text-2xl font-bold">{stats?.avgCGPA?.toFixed(2) || '0.00'}</h3>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-secondary-500 text-sm">Avg Attendance</p>
              <h3 className="text-2xl font-bold">{stats?.avgAttendance?.toFixed(1) || '0.0'}%</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Capacity Indicator */}
      {stats && (
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-secondary-700">Student Capacity</h3>
            <span className="text-sm font-medium text-secondary-600">
              {stats.totalStudents} / {stats.maxStudents}
            </span>
          </div>
          <div className="w-full bg-secondary-100 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${parseFloat(stats.capacityUsed) > 90 ? 'bg-red-500' :
                  parseFloat(stats.capacityUsed) > 70 ? 'bg-amber-500' : 'bg-green-500'
                }`}
              style={{ width: `${Math.min(parseFloat(stats.capacityUsed), 100)}%` }}
            ></div>
          </div>
        </Card>
      )}

      {/* Student List */}
      <Card>
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <h2 className="text-lg font-semibold">Assigned Students ({filteredStudents.length})</h2>

          <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
            {/* Search */}
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full md:w-64"
            />

            {/* Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full md:w-auto"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="HIGH">High Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="LOW">Low Risk</option>
            </select>
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="text-center py-12 text-secondary-500">
            <Users size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">
              {students.length === 0 ? 'No students assigned yet.' : 'No students match your filters.'}
            </p>
            {students.length === 0 && (
              <p className="text-sm mt-2">Please wait for admin assignment.</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-secondary-100">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">Student</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">Department</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-secondary-700">Semester</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-secondary-700">CGPA</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-secondary-700">Attendance</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-secondary-700">Risk Level</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-secondary-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="border-b border-secondary-50 hover:bg-secondary-50 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-secondary-900">{student.name}</p>
                        <p className="text-xs text-secondary-500">{student.studentId}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-secondary-600">{student.department}</td>
                    <td className="py-3 px-4 text-sm text-center text-secondary-600">{student.semester}</td>
                    <td className="py-3 px-4 text-sm text-center text-secondary-600">{student.currentCGPA}</td>
                    <td className="py-3 px-4 text-sm text-center text-secondary-600">{student.attendancePercent?.toFixed(1)}%</td>
                    <td className="py-3 px-4 text-center">{getRiskBadge(student.dropoutRisk)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={`/students/${student.id}`}
                          className="inline-flex items-center gap-1 text-primary hover:text-primary-700 font-medium text-sm"
                        >
                          <Eye size={16} />
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </PageWrapper>
  );
};

export default CounselorDashboard;

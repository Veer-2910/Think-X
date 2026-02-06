import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { mentorAPI } from '../services/api';
import { 
  Users, 
  AlertTriangle, 
  BookOpen,
  Eye,
  Activity
} from 'lucide-react';

const MentorDashboard = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyStudents();
  }, []);

  const fetchMyStudents = async () => {
    try {
      setLoading(true);
      const data = await mentorAPI.getMyStudents();
      setStudents(data.data || []);
    } catch (err) {
      console.error('Error fetching students:', err);
      // Don't show error if it's just 404/empty (backend returns 200 with empty array usually)
      setError('Failed to load assigned students');
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

  if (loading) {
    return (
      <PageWrapper title="My Mentorship Group">
        <div className="flex items-center justify-center h-64">
           <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      </PageWrapper>
    );
  }

  // Calculate stats
  const totalStudents = students.length;
  const highRisk = students.filter(s => s.dropoutRisk === 'HIGH').length;
  const avgAttendance = students.reduce((acc, s) => acc + (s.attendancePercent || 0), 0) / (totalStudents || 1);

  return (
    <PageWrapper title="My Mentorship Group">


      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-50 text-primary rounded-lg">
              <Users size={24} />
            </div>
            <div>
              <p className="text-secondary-500 text-sm">Assigned Students</p>
              <h3 className="text-2xl font-bold">{totalStudents}</h3>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center gap-4">
             <div className="p-3 bg-red-50 text-red-600 rounded-lg">
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="text-secondary-500 text-sm">High Risk Cases</p>
              <h3 className="text-2xl font-bold">{highRisk}</h3>
            </div>
          </div>
        </Card>

        <Card>
           <div className="flex items-center gap-4">
             <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-secondary-500 text-sm">Avg. Group Attendance</p>
              <h3 className="text-2xl font-bold">{avgAttendance.toFixed(1)}%</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Student List */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Assigned Students</h2>
        </div>

        {students.length === 0 ? (
          <div className="text-center py-12 text-secondary-500">
            <Users size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No students assigned yet.</p>
            <p className="text-sm mt-2">Please wait for admin assignment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-secondary-100">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">Student</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">Department</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">Attendance</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">CGPA</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">Risk Level</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">Primary Reason</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b border-secondary-50 hover:bg-secondary-50 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-secondary-900">{student.name}</p>
                        <p className="text-xs text-secondary-500">{student.studentId}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-secondary-600">{student.department}</td>
                    <td className="py-3 px-4 text-sm text-secondary-600">{student.attendancePercent?.toFixed(1)}%</td>
                    <td className="py-3 px-4 text-sm text-secondary-600">{student.currentCGPA}</td>
                    <td className="py-3 px-4">{getRiskBadge(student.dropoutRisk)}</td>
                    <td className="py-3 px-4 text-sm text-secondary-600 truncate max-w-xs" title={student.riskReason}>
                      {student.riskReason || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <Link 
                        to={`/students/${student.id}`} 
                        className="inline-flex items-center gap-1 text-primary hover:text-primary-700 font-medium text-sm"
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
        )}
      </Card>
    </PageWrapper>
  );
};

export default MentorDashboard;

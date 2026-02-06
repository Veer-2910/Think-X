import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar,
  TrendingDown,
  AlertTriangle,
  BookOpen,
  Clock
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { studentAPI, counselingAPI } from '../services/api';

const StudentProfile = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [counselingHistory, setCounselingHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, [id]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      
      // Fetch student details
      const studentResponse = await studentAPI.getById(id);
      const studentData = studentResponse.data || studentResponse;
      setStudent(studentData);
      
      // Fetch counseling history
      try {
        const counselingResponse = await counselingAPI.getByStudent(id);
        const counselingData = counselingResponse.data || counselingResponse;
        setCounselingHistory(counselingData);
      } catch (error) {
        console.log('No counseling history found');
        setCounselingHistory([]);
      }
      
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (level) => {
    const variants = {
      HIGH: 'danger',
      MEDIUM: 'warning',
      LOW: 'success',
    };
    return <Badge variant={variants[level || 'LOW']}>{level || 'LOW'}</Badge>;
  };

  // Calculate estimated risk score from risk level (since DB doesn't store numeric score)
  const getEstimatedRiskScore = (riskLevel) => {
    const scores = {
      HIGH: 85,      // High risk = 75-100
      MEDIUM: 55,    // Medium risk = 40-74
      LOW: 20,       // Low risk = 0-39
      UNKNOWN: 0
    };
    return scores[riskLevel] || 0;
  };

  if (loading) {
    return (
      <PageWrapper title="Student Profile">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      </PageWrapper>
    );
  }

  if (!student) {
    return (
      <PageWrapper title="Student Profile">
        <Card>
          <p className="text-center text-secondary-500">Student not found</p>
        </Card>
      </PageWrapper>
    );
  }

  // Dummy trend data (would need historical tracking)
  const attendanceTrend = [
    { month: 'Jan', value: 75 },
    { month: 'Feb', value: 68 },
    { month: 'Mar', value: 55 },
    { month: 'Apr', value: 48 },
    { month: 'May', value: student.attendancePercent || 0 },
  ];

  const marksTrend = [
    { month: 'Jan', value: 72 },
    { month: 'Feb', value: 65 },
    { month: 'Mar', value: 58 },
    { month: 'Apr', value: 52 },
    { month: 'May', value: (student.currentCGPA || 0) * 10 },
  ];

  // Generate risk factors based on actual data
  const riskFactors = [];
  if (student.attendancePercent < 60) {
    riskFactors.push(`Attendance below 60% (Currently: ${Math.round(student.attendancePercent)}%)`);
  }
  if (student.currentCGPA < 6.0) {
    riskFactors.push(`CGPA below 6.0 (Currently: ${student.currentCGPA.toFixed(1)})`);
  }
  if (student.dropoutRisk === 'HIGH') {
    riskFactors.push('High dropout risk detected by AI model');
  }
  if (riskFactors.length === 0) {
    riskFactors.push('No major risk factors detected - student is performing well');
  }

  return (
    <PageWrapper title="Student Profile">
      {/* Profile Header */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center">
            <User size={48} className="text-primary" />
          </div>
          
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h2 className="text-2xl font-bold">{student.name}</h2>
                <p className="text-secondary-500">{student.studentId} • {student.department}</p>
              </div>
              {getRiskBadge(student.dropoutRisk)}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Mail size={16} className="text-secondary-400" />
                <span>{student.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone size={16} className="text-secondary-400" />
                <span>{student.contactNumber || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={16} className="text-secondary-400" />
                <span>Semester: {student.currentSemester}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Academic Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className={`${student.attendancePercent < 60 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'} p-3 rounded-lg`}>
              <TrendingDown size={24} />
            </div>
            <div>
              <p className="text-sm text-secondary-500">Attendance</p>
              <p className="text-2xl font-bold">{Math.round(student.attendancePercent || 0)}%</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center gap-3">
            <div className={`${student.currentCGPA < 6.0 ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'} p-3 rounded-lg`}>
              <BookOpen size={24} />
            </div>
            <div>
              <p className="text-sm text-secondary-500">CGPA</p>
              <p className="text-2xl font-bold">{(student.currentCGPA || 0).toFixed(1)}</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center gap-3">
            <div className={`${student.dropoutRisk === 'HIGH' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'} p-3 rounded-lg`}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="text-sm text-secondary-500">Risk Score</p>
              <p className="text-2xl font-bold">{getEstimatedRiskScore(student.dropoutRisk)}/100</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Risk Explanation */}
      <Card className="mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className={student.dropoutRisk === 'HIGH' ? 'text-red-600' : 'text-green-600'} size={20} />
          {student.dropoutRisk === 'HIGH' ? 'Why is this student at risk?' : 'Student Performance Summary'}
        </h3>
        <ul className="space-y-2">
          {riskFactors.map((factor, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className={student.dropoutRisk === 'HIGH' ? 'text-red-600 mt-1' : 'text-green-600 mt-1'}>•</span>
              <span className="text-secondary-700">{factor}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <h3 className="text-lg font-semibold mb-4">Attendance Trend</h3>
          <p className="text-xs text-secondary-500 mb-2">📊 Sample trend data (requires historical tracking)</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={attendanceTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" stroke="#64748B" />
              <YAxis stroke="#64748B" />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#EF4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        
        <Card>
          <h3 className="text-lg font-semibold mb-4">Marks Trend</h3>
          <p className="text-xs text-secondary-500 mb-2">📊 Sample trend data (requires historical tracking)</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={marksTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" stroke="#64748B" />
              <YAxis stroke="#64748B" />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#F59E0B" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Counseling History */}
      <Card>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock size={20} />
          Counseling History
        </h3>
        {counselingHistory.length > 0 ? (
          <div className="space-y-4">
            {counselingHistory.map((session, index) => (
              <div key={index} className="border-l-4 border-primary pl-4 py-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">{new Date(session.date).toLocaleDateString()}</span>
                  <span className="text-sm text-secondary-500">• {session.counselorName || 'Counselor'}</span>
                </div>
                <p className="text-sm text-secondary-700">{session.notes || session.summary}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-secondary-500">
            <p>No counseling sessions recorded yet</p>
            <p className="text-sm mt-2">Schedule a session to start tracking interventions</p>
          </div>
        )}
      </Card>
    </PageWrapper>
  );
};

export default StudentProfile;

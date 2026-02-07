import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Clock,
  Trash2,
  Edit,
  ArrowLeft,
  Sparkles,
  Target,
  Lightbulb,
  CheckCircle2,
  BookOpenCheck
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { studentAPI, counselingAPI, aiAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import EditStudentModal from '../components/modals/EditStudentModal';

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [counselingHistory, setCounselingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [improvementPlan, setImprovementPlan] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(false);

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

  const handleDeleteStudent = async () => {
    try {
      setDeleting(true);
      await studentAPI.delete(id);
      success('Student deleted successfully');
      navigate('/students');
    } catch (err) {
      console.error('Delete student error:', err);
      toastError(err.message || 'Failed to delete student');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const generateImprovementPlan = async () => {
    try {
      setLoadingPlan(true);
      const response = await aiAPI.getImprovementPlan(id);
      setImprovementPlan(response.data);
      success('AI Guidance generated successfully!');
    } catch (err) {
      console.error('AI Plan Error:', err);
      toastError('Failed to generate improvement plan');
    } finally {
      setLoadingPlan(false);
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
    riskFactors.push(`Attendance below 60 % (Currently: ${Math.round(student.attendancePercent)}%)`);
  }
  if (student.currentCGPA < 6.0) {
    riskFactors.push(`CGPA below 6.0(Currently: ${student.currentCGPA.toFixed(1)})`);
  }
  if (student.dropoutRisk === 'HIGH') {
    riskFactors.push('High dropout risk detected by AI model');
  }
  if (riskFactors.length === 0) {
    riskFactors.push('No major risk factors detected - student is performing well');
  }

  // Determine back navigation based on role
  const getBackPath = () => {
    if (user?.role === 'COUNSELOR') {
      return '/counseling/queue'; // Counselor Dashboard
    }
    return '/students'; // Default to Students page for Admin/Mentor
  };

  return (
    <PageWrapper
      title={
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(getBackPath())}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            title={user?.role === 'COUNSELOR' ? 'Back to Dashboard' : 'Back to Students'}
          >
            <ArrowLeft size={24} className="text-slate-600" />
          </button>
          <span>Student Profile</span>
        </div>
      }
    >
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
              <div className="flex items-center gap-3">
                {getRiskBadge(student.dropoutRisk)}
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-3 py-2 text-sm font-medium text-primary hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors flex items-center gap-2"
                  title="Edit Student"
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                  title="Delete Student"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Mail size={16} className="text-secondary-400" />
                <span>{student.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone size={16} className="text-secondary-400" />
                <span>{student.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={16} className="text-secondary-400" />
                <span>Semester: {student.semester}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Academic Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className={`${student.attendancePercent < 60 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'} p - 3 rounded - lg`}>
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
            <div className={`${student.currentCGPA < 6.0 ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'} p - 3 rounded - lg`}>
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
            <div className={`${student.dropoutRisk === 'HIGH' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'} p - 3 rounded - lg`}>
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

      {/* AI Improvement Guidance */}
      <Card className="mb-6 border-t-4 border-t-purple-500">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="text-purple-600" size={24} />
            AI-Powered Guidance & Improvement Plan
          </h3>
          <Button
            onClick={generateImprovementPlan}
            disabled={loadingPlan}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {loadingPlan ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <Lightbulb size={16} className="mr-2" />
                {improvementPlan ? 'Regenerate Guidance' : 'Generate AI Guidance'}
              </>
            )}
          </Button>
        </div>

        {improvementPlan ? (
          <div className="space-y-6">
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 italic text-purple-800">
              "{improvementPlan.motivational_message}"
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Academic Steps */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                  <BookOpenCheck size={18} className="text-blue-600" />
                  Academic Action Plan
                </h4>
                <ul className="space-y-2">
                  {improvementPlan.academic_guidance.map((step, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-700">
                      <span className="text-blue-500 font-bold">•</span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Behavioral/Social */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                  <Target size={18} className="text-green-600" />
                  Behavioral & Engagement
                </h4>
                <ul className="space-y-2">
                  {improvementPlan.behavioral_guidance.map((step, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-700">
                      <span className="text-green-500 font-bold">•</span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mentor Focus */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                  <User size={18} className="text-orange-600" />
                  Focus Areas for Mentor
                </h4>
                <ul className="space-y-2">
                  {improvementPlan.mentor_focus_areas.map((step, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-700">
                      <CheckCircle2 size={16} className="text-orange-500 mt-0.5 flex-shrink-0" />
                      {step}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                  <Lightbulb size={18} className="text-yellow-600" />
                  Recommended Resources
                </h4>
                <ul className="space-y-2">
                  {improvementPlan.resource_recommendations.map((step, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-700">
                      <span className="text-yellow-500 font-bold">→</span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-secondary-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
            <Sparkles className="mx-auto text-slate-300 mb-2" size={32} />
            <p>Click "Generate AI Guidance" to get a personalized improvement plan.</p>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Delete Student</h3>
            </div>

            <div className="mb-6">
              <p className="text-slate-700 mb-2">
                Are you sure you want to delete <strong>{student.name}</strong>?
              </p>
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 font-medium mb-1">⚠️ This action cannot be undone!</p>
                <p className="text-sm text-red-700">All student data including attendance, assessments, and counseling logs will be permanently deleted.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteStudent}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete Student
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      <EditStudentModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={() => {
          fetchStudentData();
        }}
        student={student}
      />
    </PageWrapper>
  );
};

export default StudentProfile;

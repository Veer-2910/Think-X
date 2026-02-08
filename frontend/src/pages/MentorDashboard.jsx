import { useState, useEffect } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import MyMenteesGrid from '../components/dashboard/MyMenteesGrid';
import { mentorAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  Users,
  AlertTriangle,
  Activity,
  CheckCircle2,
  BookOpen
} from 'lucide-react';

const MentorDashboard = () => {
  const { user } = useAuth();
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
      // Don't show error if it's just 404/empty
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const totalStudents = students.length;
  const highRisk = students.filter(s => s.dropoutRisk === 'HIGH').length;
  const avgAttendance = totalStudents > 0
    ? students.reduce((acc, s) => acc + (s.attendancePercent || 0), 0) / totalStudents
    : 0;

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12">

        {/* Glass Header */}
        <div className="relative mb-8 z-20">
          <div className="absolute inset-0 bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-white/50"></div>
          <div className="relative px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Mentorship Workspace</h1>
              <p className="text-slate-500 text-sm">Track progress and guide your assigned students.</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl font-bold text-sm border border-indigo-100 flex items-center gap-2">
                <img
                  src={`https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff`}
                  alt={user?.name}
                  className="w-6 h-6 rounded-full"
                />
                {user?.name}
                <span className="text-indigo-400 font-normal ml-1">• {user?.specialization || 'General'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white border-none shadow-lg shadow-indigo-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-indigo-100 text-xs font-bold uppercase mb-1">My Group</p>
                <h3 className="text-3xl font-bold">{totalStudents} <span className="text-sm font-normal opacity-80">Mentees</span></h3>
              </div>
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Users size={24} />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/20 text-xs text-indigo-100 flex items-center gap-2">
              <CheckCircle2 size={12} /> Active & Enrolled
            </div>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase mb-1">Attention Needed</p>
                <h3 className="text-3xl font-bold text-slate-800">{highRisk}</h3>
              </div>
              <div className={`p-2 rounded-lg ${highRisk > 0 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                <AlertTriangle size={24} />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Students marked as High Risk</p>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase mb-1">Group Avg Attendance</p>
                <h3 className="text-3xl font-bold text-slate-800">{avgAttendance.toFixed(1)}%</h3>
              </div>
              <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
                <Activity size={24} />
              </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-4">
              <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${avgAttendance}%` }}></div>
            </div>
          </Card>
        </div>

        {/* Mentees Grid */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="text-indigo-600" size={20} />
            <h2 className="text-lg font-bold text-slate-800">Assigned Students</h2>
          </div>

          <MyMenteesGrid students={students} />
        </div>

      </div>
    </PageWrapper>
  );
};

export default MentorDashboard;

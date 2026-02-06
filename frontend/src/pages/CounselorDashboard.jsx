import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { counselingAPI } from '../services/api';
import { 
  Users, 
  AlertTriangle, 
  ClipboardList,
  ArrowRight,
  Clock
} from 'lucide-react';

const CounselorDashboard = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const data = await counselingAPI.getQueue();
      setQueue(data.data || []);
    } catch (err) {
      console.error('Error fetching counseling queue:', err);
      setError('Failed to load counseling queue');
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
      <PageWrapper title="Counseling Queue">
        <div className="flex items-center justify-center h-64">
           <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      </PageWrapper>
    );
  }

  // Calculate stats
  const totalCases = queue.length;
  const criticalCases = queue.filter(s => s.dropoutRisk === 'HIGH').length;
  const pendingAlerts = queue.reduce((acc, s) => acc + (s._count?.alerts || 0), 0);

  return (
    <PageWrapper title="Counseling Queue">


      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-lg">
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="text-secondary-500 text-sm">Priority Cases</p>
              <h3 className="text-2xl font-bold">{criticalCases}</h3>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center gap-4">
             <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-secondary-500 text-sm">Total In Queue</p>
              <h3 className="text-2xl font-bold">{totalCases}</h3>
            </div>
          </div>
        </Card>

        <Card>
           <div className="flex items-center gap-4">
             <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
              <ClipboardList size={24} />
            </div>
            <div>
              <p className="text-secondary-500 text-sm">Pending Alerts</p>
              <h3 className="text-2xl font-bold">{pendingAlerts}</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Queue List */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Priority Intervention List</h2>
          <span className="text-sm text-secondary-500">Sorted by Risk Level & Prediction Confidence</span>
        </div>

        {queue.length === 0 ? (
          <div className="text-center py-12 text-secondary-500">
            <ClipboardList size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No priority cases assigned.</p>
            <p className="text-sm mt-2">The queue is currently empty.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-secondary-100">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">Student</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">Risk Profile</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">ML Probability</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">Primary Reason</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">Alerts</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((student) => (
                  <tr key={student.id} className="border-b border-secondary-50 hover:bg-secondary-50 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-secondary-900">{student.name}</p>
                        <p className="text-xs text-secondary-500">{student.studentId} • {student.department}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">{getRiskBadge(student.dropoutRisk)}</td>
                    <td className="py-3 px-4 text-sm text-secondary-600">
                      {student.mlProbability ? `${(student.mlProbability * 100).toFixed(1)}%` : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-sm text-secondary-600 truncate max-w-xs" title={student.riskReason}>
                      {student.riskReason || '-'}
                    </td>
                    <td className="py-3 px-4">
                      {student._count?.alerts > 0 && (
                        <Badge variant="danger">{student._count.alerts} New</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Link 
                        to={`/students/${student.id}`} 
                        className="inline-flex items-center gap-1 text-primary hover:text-primary-700 font-medium text-sm"
                      >
                        Start Session
                        <ArrowRight size={16} />
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

export default CounselorDashboard;

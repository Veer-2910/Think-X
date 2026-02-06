import { useState, useEffect } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Search, Filter, Eye, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { studentAPI } from '../services/api';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('ALL');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getAll({ limit: 10000 });
      const data = response.data || response;
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
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

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterRisk === 'ALL' || student.dropoutRisk === filterRisk;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <PageWrapper title="Students">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Students">
      {/* Search and Filter Bar */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" size={20} />
            <input
              type="text"
              placeholder="Search by name or student ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="px-4 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="HIGH">High Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="LOW">Low Risk</option>
            </select>
            
            <Button variant="secondary">
              <Download size={18} className="mr-2" />
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* Students Table */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            All Students ({filteredStudents.length})
          </h3>
        </div>
        
        {filteredStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-secondary-100">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">Student ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">Department</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">Attendance</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">CGPA</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">Risk Level</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr 
                    key={student.id} 
                    className="border-b border-secondary-50 hover:bg-secondary-50 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm font-medium">{student.name}</td>
                    <td className="py-3 px-4 text-sm text-secondary-600">{student.studentId}</td>
                    <td className="py-3 px-4 text-sm text-secondary-600">{student.department}</td>
                    <td className="py-3 px-4 text-sm">
                      <span className={(student.attendancePercent || 0) < 60 ? 'text-red-600 font-medium' : ''}>
                        {Math.round(student.attendancePercent || 0)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span className={(student.currentCGPA || 0) < 6.0 ? 'text-red-600 font-medium' : ''}>
                        {(student.currentCGPA || 0).toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4">{getRiskBadge(student.dropoutRisk)}</td>
                    <td className="py-3 px-4">
                      <Link
                        to={`/students/${student.id}`}
                        className="inline-flex items-center gap-1 text-primary hover:text-primary-600 text-sm font-medium transition-colors"
                      >
                        <Eye size={16} />
                        View Profile
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-secondary-500">
            <p className="text-lg font-medium mb-2">No students found</p>
            <p className="text-sm">Upload student data to get started</p>
          </div>
        )}
      </Card>
    </PageWrapper>
  );
};

export default Students;

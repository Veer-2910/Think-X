import { Link } from 'react-router-dom';
import Badge from '../ui/Badge';
import { Eye } from 'lucide-react';

const StudentTable = ({ students, showActions = true }) => {
  const getRiskBadge = (level) => {
    const variants = {
      HIGH: 'danger',
      MEDIUM: 'warning',
      LOW: 'success',
    };
    return <Badge variant={variants[level]}>{level}</Badge>;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="sticky top-0 bg-white">
          <tr className="border-b border-secondary-100">
            <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">Name</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">Student ID</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">Attendance</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">Avg Marks</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">Risk Level</th>
            {showActions && (
              <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr 
              key={student.id} 
              className="border-b border-secondary-50 hover:bg-secondary-50 transition-colors"
            >
              <td className="py-3 px-4 text-sm font-medium">{student.name}</td>
              <td className="py-3 px-4 text-sm text-secondary-600">{student.studentId}</td>
              <td className="py-3 px-4 text-sm">
                <span className={student.attendance < 60 ? 'text-red-600 font-medium' : ''}>
                  {student.attendance}%
                </span>
              </td>
              <td className="py-3 px-4 text-sm">
                {student.avgMarks || student.cgpa || 'N/A'}
                {student.avgMarks && '%'}
              </td>
              <td className="py-3 px-4">{getRiskBadge(student.riskLevel)}</td>
              {showActions && (
                <td className="py-3 px-4">
                  <Link
                    to={`/students/${student.id}`}
                    className="inline-flex items-center gap-1 text-primary hover:text-primary-600 text-sm font-medium transition-colors"
                  >
                    <Eye size={16} />
                    View
                  </Link>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentTable;

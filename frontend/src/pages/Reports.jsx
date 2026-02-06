import { useState, useEffect } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import ExportButton from '../components/ui/ExportButton';
import { studentAPI, analyticsAPI } from '../services/api';
import { FileText, Download, Users, TrendingDown, AlertTriangle, PieChart } from 'lucide-react';

const Reports = () => {
  const [students, setStudents] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, deptRes] = await Promise.all([
          studentAPI.getAll({ limit: 10000 }),
          analyticsAPI.getDepartmentRisk()
        ]);
        setStudents(studentsRes.data?.data || []);
        setDepartmentData(deptRes.data?.data?.departments || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalStudents = students.length;
  const highRisk = students.filter(s => s.dropoutRisk === 'HIGH').length;
  const mediumRisk = students.filter(s => s.dropoutRisk === 'MEDIUM').length;
  const lowRisk = students.filter(s => s.dropoutRisk === 'LOW').length;

  const reportTypes = [
    {
      title: 'Student List Report',
      description: 'Complete list of all students with their details',
      icon: Users,
      type: 'csv',
      reportType: 'students'
    },
    {
      title: 'Risk Analysis Report',
      description: 'Detailed breakdown of dropout risk by department',
      icon: AlertTriangle,
      type: 'pdf',
      reportType: 'department-risk'
    },
    {
      title: 'Admin Insights Report',
      description: 'Executive summary with key metrics and trends',
      icon: PieChart,
      type: 'pdf',
      reportType: 'admin-insights'
    }
  ];

  return (
    <PageWrapper
      title="Reports"
      subtitle="Generate and download reports"
    >
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="text-center p-4">
          <p className="text-2xl font-bold text-slate-900">{totalStudents}</p>
          <p className="text-sm text-secondary-600">Total Students</p>
        </Card>
        <Card className="text-center p-4">
          <p className="text-2xl font-bold text-red-600">{highRisk}</p>
          <p className="text-sm text-secondary-600">High Risk</p>
        </Card>
        <Card className="text-center p-4">
          <p className="text-2xl font-bold text-yellow-600">{mediumRisk}</p>
          <p className="text-sm text-secondary-600">Medium Risk</p>
        </Card>
        <Card className="text-center p-4">
          <p className="text-2xl font-bold text-green-600">{lowRisk}</p>
          <p className="text-sm text-secondary-600">Low Risk</p>
        </Card>
      </div>

      {/* Available Reports */}
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Available Reports</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reportTypes.map((report, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-50 rounded-lg">
                <report.icon className="text-primary-600" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">{report.title}</h3>
                <p className="text-sm text-secondary-600 mt-1 mb-4">{report.description}</p>
                <ExportButton type={report.type} reportType={report.reportType} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Department Breakdown */}
      {departmentData.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Department Summary</h2>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-secondary-600">Department</th>
                    <th className="text-center py-3 px-4 font-medium text-secondary-600">Students</th>
                    <th className="text-center py-3 px-4 font-medium text-secondary-600">High Risk</th>
                    <th className="text-center py-3 px-4 font-medium text-secondary-600">Medium Risk</th>
                    <th className="text-center py-3 px-4 font-medium text-secondary-600">Low Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {departmentData.map((dept, index) => (
                    <tr key={index} className="border-b last:border-0 hover:bg-secondary-50">
                      <td className="py-3 px-4 font-medium">{dept.department}</td>
                      <td className="py-3 px-4 text-center">{dept.total}</td>
                      <td className="py-3 px-4 text-center text-red-600">{dept.highRisk}</td>
                      <td className="py-3 px-4 text-center text-yellow-600">{dept.mediumRisk}</td>
                      <td className="py-3 px-4 text-center text-green-600">{dept.lowRisk}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </PageWrapper>
  );
};

export default Reports;

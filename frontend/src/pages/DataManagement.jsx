import { useState } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import CSVUploadCard from '../components/ui/CSVUploadCard';
import AddStudentModal from '../components/modals/AddStudentModal';
import { studentAPI, attendanceAPI, academicAPI, feeAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { Users, Calendar, FileText, BookOpen, DollarSign, AlertTriangle, Trash2, ChevronDown, ChevronUp, Database, UserPlus } from 'lucide-react';

const DataManagement = () => {
  const { success, error, info } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);
  const [showClearModal, setShowClearModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [clearing, setClearing] = useState(false);
  const [clearError, setClearError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleUploadSuccess = (entityType) => {
    // Trigger data refresh
    setRefreshKey(prev => prev + 1);
    success(`${entityType} uploaded successfully`);
  };

  const handleClearAllData = async () => {
    if (confirmText !== 'DELETE') {
      setClearError('Please type DELETE to confirm');
      return;
    }

    try {
      setClearing(true);
      setClearError('');

      const result = await studentAPI.clearAllData();

      // Success - close modal and refresh
      setShowClearModal(false);
      setConfirmText('');
      setRefreshKey(prev => prev + 1);

      success(`Successfully deleted ${result.data.totalRecords} records!`);
      info('You can now upload new data.');
    } catch (err) {
      setClearError(err.message || 'Failed to clear data. Please try again.');
      error('Failed to clear data');
    } finally {
      setClearing(false);
    }
  };

  // Master CSV - Primary Upload Option
  const masterConfig = {
    title: 'Master Student Data',
    description: 'Upload ALL student data in one file: personal info, academics, attendance %, behavioral data, family info, and fees',
    uploadEndpoint: studentAPI.uploadCSV,
    templateUrl: '/sample_data/master_students_sample.csv',
    icon: Database,
    onSuccess: () => handleUploadSuccess('Master Data')
  };

  // Detailed CSVs - Optional for institutions needing historical data
  const detailedConfigs = [
    {
      title: 'Students (Basic)',
      description: 'Upload basic student information only (use Master CSV for complete data)',
      uploadEndpoint: studentAPI.uploadCSV,
      templateUrl: '/sample_data/students_sample.csv',
      icon: Users,
      onSuccess: () => handleUploadSuccess('Students')
    },
    {
      title: 'Attendance Records',
      description: 'Upload daily attendance records - enables trend analysis over time',
      uploadEndpoint: attendanceAPI.uploadCSV,
      templateUrl: '/sample_data/attendance_sample.csv',
      icon: Calendar,
      onSuccess: () => handleUploadSuccess('Attendance')
    },
    {
      title: 'Assessment Results',
      description: 'Upload individual exam scores - enables performance drop detection',
      uploadEndpoint: academicAPI.uploadAssessmentsCSV,
      templateUrl: '/sample_data/assessments_sample.csv',
      icon: FileText,
      onSuccess: () => handleUploadSuccess('Assessments')
    },
    {
      title: 'Course Attempts',
      description: 'Upload course attempt history with pass/fail status',
      uploadEndpoint: academicAPI.uploadAttemptsCSV,
      templateUrl: '/sample_data/attempts_sample.csv',
      icon: BookOpen,
      onSuccess: () => handleUploadSuccess('Course Attempts')
    },
    {
      title: 'Fee Records',
      description: 'Upload fee payment information separately (already included in Master CSV)',
      uploadEndpoint: feeAPI.uploadCSV,
      templateUrl: '/sample_data/fees_sample.csv',
      icon: DollarSign,
      onSuccess: () => handleUploadSuccess('Fees')
    }
  ];

  return (
    <PageWrapper
      title="Data Management"
      subtitle="Upload and manage student data"
    >
      {/* Master CSV Upload */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Upload Student Data</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-600 text-white font-medium rounded-lg transition-colors"
          >
            <UserPlus size={18} />
            Add Student
          </button>
        </div>
        <CSVUploadCard
          key={`master-${refreshKey}`}
          title={masterConfig.title}
          description={masterConfig.description}
          uploadEndpoint={masterConfig.uploadEndpoint}
          templateUrl={masterConfig.templateUrl}
          icon={masterConfig.icon}
          onUploadSuccess={masterConfig.onSuccess}
        />
      </div>

      {/* Add Student Modal */}
      <AddStudentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setRefreshKey(prev => prev + 1);
        }}
      />

      {/* Advanced Section */}
      <div className="mb-8">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm font-medium text-secondary-600 hover:text-secondary-800 transition-colors"
        >
          {showAdvanced ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          {showAdvanced ? 'Hide' : 'Show'} Advanced Options
        </button>

        {showAdvanced && (
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {detailedConfigs.map((config, index) => (
              <CSVUploadCard
                key={`${config.title}-${refreshKey}-${index}`}
                title={config.title}
                description={config.description}
                uploadEndpoint={config.uploadEndpoint}
                templateUrl={config.templateUrl}
                icon={config.icon}
                onUploadSuccess={config.onSuccess}
              />
            ))}
          </div>
        )}
      </div>

      {/* Clear Data */}
      <div className="border-t pt-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-slate-900">Clear All Data</h3>
            <p className="text-sm text-secondary-500">Permanently delete all uploaded records</p>
          </div>
          <button
            onClick={() => setShowClearModal(true)}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
          >
            <Trash2 size={16} />
            Clear Data
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Confirm Data Deletion</h3>
            </div>

            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 font-medium mb-2">⚠️ This will permanently delete:</p>
              <ul className="text-sm text-red-700 space-y-1 ml-4">
                <li>• All student records</li>
                <li>• All attendance data</li>
                <li>• All assessment scores</li>
                <li>• All course attempts</li>
                <li>• All fee records</li>
                <li>• All counseling logs</li>
                <li>• All intervention tasks</li>
              </ul>
            </div>

            <p className="text-sm text-slate-700 mb-4">
              Type <span className="font-mono font-bold bg-slate-100 px-2 py-1 rounded">DELETE</span> to confirm:
            </p>

            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-4 focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />

            {clearError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {clearError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowClearModal(false);
                  setConfirmText('');
                  setClearError('');
                }}
                disabled={clearing}
                className="flex-1 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAllData}
                disabled={confirmText !== 'DELETE' || clearing}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {clearing ? 'Deleting...' : 'Delete All Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default DataManagement;

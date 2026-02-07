import { useState, useEffect } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import CSVUploadCard from '../components/ui/CSVUploadCard';
import { counselorAPI, attendanceAPI, academicAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { Calendar, FileText, ChevronDown, ChevronUp, UserCheck, Plus } from 'lucide-react';

const CounselorDataManagement = () => {
    const { success, error } = useToast();
    const [refreshKey, setRefreshKey] = useState(0);
    const [showManualEntry, setShowManualEntry] = useState(false);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Manual entry form states
    const [selectedStudent, setSelectedStudent] = useState('');
    const [entryType, setEntryType] = useState('attendance'); // 'attendance' or 'marks'

    // Attendance fields
    const [attendanceDate, setAttendanceDate] = useState('');
    const [attendanceStatus, setAttendanceStatus] = useState('PRESENT');
    const [attendanceSubject, setAttendanceSubject] = useState('');

    // Marks fields
    const [examName, setExamName] = useState('');
    const [subject, setSubject] = useState('');
    const [marksObtained, setMarksObtained] = useState('');
    const [totalMarks, setTotalMarks] = useState('');
    const [semester, setSemester] = useState('');

    useEffect(() => {
        fetchMyStudents();
    }, []);

    const fetchMyStudents = async () => {
        try {
            setLoading(true);
            const response = await counselorAPI.getMyStudents();
            setStudents(response.data || []);
        } catch (err) {
            error('Failed to fetch students');
        } finally {
            setLoading(false);
        }
    };

    const handleUploadSuccess = (entityType) => {
        setRefreshKey(prev => prev + 1);
        success(`${entityType} uploaded successfully`);
    };

    const resetForm = () => {
        setSelectedStudent('');
        setAttendanceDate('');
        setAttendanceStatus('PRESENT');
        setAttendanceSubject('');
        setExamName('');
        setSubject('');
        setMarksObtained('');
        setTotalMarks('');
        setSemester('');
    };

    const handleManualSubmit = async (e) => {
        e.preventDefault();

        if (!selectedStudent) {
            error('Please select a student');
            return;
        }

        try {
            if (entryType === 'attendance') {
                await attendanceAPI.create({
                    studentId: selectedStudent,
                    date: attendanceDate,
                    status: attendanceStatus,
                    subject: attendanceSubject || undefined
                });
                success('Attendance record added successfully');
            } else {
                await academicAPI.createAssessment({
                    studentId: selectedStudent,
                    examName,
                    subject,
                    marksObtained: parseFloat(marksObtained),
                    totalMarks: parseFloat(totalMarks),
                    semester: parseInt(semester)
                });
                success('Assessment record added successfully');
            }

            resetForm();
            setRefreshKey(prev => prev + 1);
        } catch (err) {
            error(err.message || `Failed to add ${entryType}`);
        }
    };

    const csvConfigs = [
        {
            title: 'Attendance Records',
            description: 'Upload daily attendance records for your students',
            uploadEndpoint: attendanceAPI.uploadCSV,
            templateUrl: '/sample_data/attendance_sample.csv',
            icon: Calendar,
            onSuccess: () => handleUploadSuccess('Attendance')
        },
        {
            title: 'Assessment Results',
            description: 'Upload exam scores and marks for your students',
            uploadEndpoint: academicAPI.uploadAssessmentsCSV,
            templateUrl: '/sample_data/assessments_sample.csv',
            icon: FileText,
            onSuccess: () => handleUploadSuccess('Assessments')
        }
    ];

    return (
        <PageWrapper
            title="Manage Student Data"
            subtitle={`Add attendance and marks for your ${students.length} assigned students`}
        >
            {/* Manual Entry Section */}
            <Card className="mb-8">
                <button
                    onClick={() => setShowManualEntry(!showManualEntry)}
                    className="flex items-center justify-between w-full text-left"
                >
                    <div className="flex items-center gap-2">
                        <Plus size={20} className="text-primary" />
                        <h3 className="text-lg font-semibold">Manual Entry</h3>
                    </div>
                    {showManualEntry ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>

                {showManualEntry && (
                    <form onSubmit={handleManualSubmit} className="mt-6 space-y-6">
                        {/* Student Selection */}
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-2">
                                Select Student *
                            </label>
                            <select
                                value={selectedStudent}
                                onChange={(e) => setSelectedStudent(e.target.value)}
                                className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                required
                            >
                                <option value="">-- Choose a student --</option>
                                {students.map(student => (
                                    <option key={student.id} value={student.id}>
                                        {student.name} ({student.studentId})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Entry Type Toggle */}
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setEntryType('attendance')}
                                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${entryType === 'attendance'
                                        ? 'bg-primary text-white'
                                        : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                                    }`}
                            >
                                <Calendar size={20} className="inline mr-2" />
                                Attendance
                            </button>
                            <button
                                type="button"
                                onClick={() => setEntryType('marks')}
                                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${entryType === 'marks'
                                        ? 'bg-primary text-white'
                                        : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                                    }`}
                            >
                                <FileText size={20} className="inline mr-2" />
                                Marks
                            </button>
                        </div>

                        {/* Attendance Fields */}
                        {entryType === 'attendance' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                                        Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={attendanceDate}
                                        onChange={(e) => setAttendanceDate(e.target.value)}
                                        className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                                        Status *
                                    </label>
                                    <select
                                        value={attendanceStatus}
                                        onChange={(e) => setAttendanceStatus(e.target.value)}
                                        className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                        required
                                    >
                                        <option value="PRESENT">Present</option>
                                        <option value="ABSENT">Absent</option>
                                        <option value="LEAVE">Leave</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                                        Subject (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={attendanceSubject}
                                        onChange={(e) => setAttendanceSubject(e.target.value)}
                                        placeholder="e.g., Mathematics"
                                        className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Marks Fields */}
                        {entryType === 'marks' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                                        Exam Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={examName}
                                        onChange={(e) => setExamName(e.target.value)}
                                        placeholder="e.g., Mid-Sem 1"
                                        className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                                        Subject *
                                    </label>
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        placeholder="e.g., Mathematics"
                                        className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                                        Marks Obtained *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={marksObtained}
                                        onChange={(e) => setMarksObtained(e.target.value)}
                                        placeholder="e.g., 85"
                                        className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                                        Total Marks *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={totalMarks}
                                        onChange={(e) => setTotalMarks(e.target.value)}
                                        placeholder="e.g., 100"
                                        className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                                        Semester *
                                    </label>
                                    <input
                                        type="number"
                                        value={semester}
                                        onChange={(e) => setSemester(e.target.value)}
                                        placeholder="e.g., 3"
                                        className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-6 py-2 border border-secondary-300 text-secondary-700 rounded-lg hover:bg-secondary-50 transition-colors"
                            >
                                Clear
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-6 py-2 bg-primary hover:bg-primary-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <UserCheck size={18} />
                                Add {entryType === 'attendance' ? 'Attendance' : 'Marks'}
                            </button>
                        </div>
                    </form>
                )}
            </Card>

            {/* CSV Upload Section */}
            <div>
                <h2 className="text-lg font-semibold mb-4">Bulk Upload via CSV</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {csvConfigs.map((config, index) => (
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
            </div>

            {loading && students.length === 0 && (
                <div className="text-center py-12 text-secondary-500">
                    <p>Loading your students...</p>
                </div>
            )}

            {!loading && students.length === 0 && (
                <Card className="mt-6">
                    <div className="text-center py-12">
                        <UserCheck size={48} className="mx-auto text-secondary-400 mb-4" />
                        <h3 className="text-lg font-semibold text-secondary-700 mb-2">No Students Assigned</h3>
                        <p className="text-secondary-500">You don't have any students assigned to you yet.</p>
                    </div>
                </Card>
            )}
        </PageWrapper>
    );
};

export default CounselorDataManagement;

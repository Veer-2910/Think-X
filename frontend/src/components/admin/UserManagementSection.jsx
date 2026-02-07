import { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { adminAPI, studentAPI } from '../../services/api';
import { Users, UserCog, X, Check, Trash2 } from 'lucide-react';
import AIAssignment from './AIAssignment';

const UserManagementSection = () => {
    const [activeTab, setActiveTab] = useState('counselors'); // 'mentors' | 'counselors'
    const [mentors, setMentors] = useState([]);
    const [counselors, setCounselors] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);

    // Assignment modal state
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [assignmentType, setAssignmentType] = useState(null); // 'student-counselor' | 'mentor-counselor'
    const [selectedCounselor, setSelectedCounselor] = useState('');
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [selectedMentor, setSelectedMentor] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Advanced filters for student assignment
    const [filterDepartment, setFilterDepartment] = useState('');
    const [filterSemester, setFilterSemester] = useState('');
    const [assignmentMode, setAssignmentMode] = useState('manual'); // 'manual' or 'range'
    const [rangeStart, setRangeStart] = useState(1);
    const [rangeEnd, setRangeEnd] = useState(10);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [mentorsData, counselorsData, studentsData] = await Promise.all([
                adminAPI.getAllMentors(),
                adminAPI.getAllCounselors(),
                studentAPI.getAll({ limit: 1000 }) // Fetch all students (default is only 10!)
            ]);
            setMentors(mentorsData.data || []);
            setCounselors(counselorsData.data || []);
            setStudents(studentsData.data || []);
        } catch (error) {
            console.error('Error fetching user management data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!userId) {
            error('Cannot delete user: Missing User ID');
            return;
        }

        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone and will remove all their profiles and assignments.')) {
            return;
        }

        try {
            await adminAPI.deleteUser(userId);
            success('User deleted successfully');
            fetchData(); // Refresh list
        } catch (err) {
            console.error('Delete user error:', err);
            error(err.message || 'Failed to delete user');
        }
    };

    // Get students that are not yet assigned to any counselor
    const getAvailableStudents = () => {
        // Get all assigned student IDs from all counselors
        const assignedStudentIds = new Set();
        counselors.forEach(counselor => {
            if (counselor.assignedStudents) {
                counselor.assignedStudents.forEach(assignment => {
                    assignedStudentIds.add(assignment.studentId);
                });
            }
        });

        // Filter out assigned students
        let available = students.filter(student => !assignedStudentIds.has(student.id));

        // Apply department filter (only if filter is set)
        if (filterDepartment) {
            available = available.filter(student =>
                student.department && student.department === filterDepartment
            );
        }

        // Apply semester filter (only if filter is set)
        if (filterSemester) {
            available = available.filter(student =>
                student.semester && student.semester === parseInt(filterSemester)
            );
        }

        // Apply search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            available = available.filter(student =>
                (student.name && student.name.toLowerCase().includes(term)) ||
                (student.studentId && student.studentId.toLowerCase().includes(term))
            );
        }

        return available;
    };

    // Get unique departments from students (filter out null/undefined)
    const getUniqueDepartments = () => {
        const depts = [...new Set(students.map(s => s.department))];
        return depts.filter(d => d && d !== null && d !== undefined && d !== '').sort();
    };

    // Get unique semesters from students (filter out null/undefined)
    const getUniqueSemesters = () => {
        const sems = [...new Set(students.map(s => s.semester))];
        return sems.filter(s => s !== null && s !== undefined && s !== '' && !isNaN(s)).sort((a, b) => a - b);
    };

    // Handle range selection
    const handleRangeSelection = () => {
        const available = getAvailableStudents();
        const start = Math.max(1, rangeStart) - 1; // Convert to 0-indexed
        const end = Math.min(rangeEnd, available.length);
        const selectedIds = available.slice(start, end).map(s => s.id);
        setSelectedStudents(selectedIds);
    };

    const handleAssignStudents = async () => {
        try {
            if (selectedStudents.length === 0 || !selectedCounselor) {
                alert('Please select counselor and at least one student');
                return;
            }

            if (selectedStudents.length === 1) {
                await adminAPI.assignStudentToCounselor({
                    studentId: selectedStudents[0],
                    counselorId: selectedCounselor
                });
            } else {
                await adminAPI.bulkAssignStudents({
                    studentIds: selectedStudents,
                    counselorId: selectedCounselor
                });
            }

            alert(`Successfully assigned ${selectedStudents.length} student(s)`);
            setShowAssignModal(false);
            setSelectedStudents([]);
            setSelectedCounselor('');
            fetchData();
        } catch (error) {
            alert(error.message || 'Failed to assign students');
        }
    };

    const handleAssignMentor = async () => {
        try {
            if (!selectedMentor || !selectedCounselor) {
                alert('Please select both mentor and counselor');
                return;
            }

            await adminAPI.assignMentorToCounselor({
                mentorId: selectedMentor,
                counselorId: selectedCounselor
            });

            alert('Successfully assigned mentor to counselor');
            setShowAssignModal(false);
            setSelectedMentor('');
            setSelectedCounselor('');
            fetchData();
        } catch (error) {
            alert(error.message || 'Failed to assign mentor');
        }
    };

    const toggleStudentSelection = (studentId) => {
        setSelectedStudents(prev =>
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    return (
        <div className="space-y-6">
            {/* Header with Actions */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">User Management</h2>
                <div className="flex gap-2">
                    <Button
                        onClick={() => {
                            setAssignmentType('student-counselor');
                            setShowAssignModal(true);
                        }}
                        variant="primary"
                    >
                        Assign Students
                    </Button>
                    <Button
                        onClick={() => {
                            setAssignmentType('mentor-counselor');
                            setShowAssignModal(true);
                        }}
                        variant="secondary"
                    >
                        Assign Mentor
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-secondary-200">
                <button
                    onClick={() => setActiveTab('counselors')}
                    className={`px-4 py-2 font-medium transition-colors ${activeTab === 'counselors'
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-secondary-600 hover:text-secondary-900'
                        }`}
                >
                    Counselors ({counselors.length})
                </button>
                <button
                    onClick={() => setActiveTab('mentors')}
                    className={`px-4 py-2 font-medium transition-colors ${activeTab === 'mentors'
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-secondary-600 hover:text-secondary-900'
                        }`}
                >
                    Mentors ({mentors.length})
                </button>
            </div>

            {/* Content */}
            <Card>
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
                    </div>
                ) : activeTab === 'counselors' ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-secondary-100">
                                    <th className="text-left py-3 px-4 text-sm font-semibold">Name</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold">Email</th>
                                    <th className="text-center py-3 px-4 text-sm font-semibold">Students</th>
                                    <th className="text-center py-3 px-4 text-sm font-semibold">High Risk</th>
                                    <th className="text-center py-3 px-4 text-sm font-semibold">Capacity</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold">Mentors</th>
                                    <th className="text-center py-3 px-4 text-sm font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {counselors.map((counselor) => (
                                    <tr key={counselor.id} className="border-b border-secondary-50 hover:bg-secondary-50">
                                        <td className="py-3 px-4 font-medium">{counselor.name}</td>
                                        <td className="py-3 px-4 text-sm text-secondary-600">{counselor.email}</td>
                                        <td className="py-3 px-4 text-center">{counselor.studentCount}</td>
                                        <td className="py-3 px-4 text-center">
                                            <Badge variant={counselor.highRiskCount > 0 ? 'danger' : 'success'}>
                                                {counselor.highRiskCount}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-4 text-center text-sm">
                                            {counselor.capacityUsed}%
                                        </td>
                                        <td className="py-3 px-4 text-sm">
                                            {counselor.mentors?.length > 0
                                                ? counselor.mentors.map(m => m.name).join(', ')
                                                : 'None'}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <button
                                                onClick={() => handleDeleteUser(counselor.userId)}
                                                className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                                                title="Delete User"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-secondary-100">
                                    <th className="text-left py-3 px-4 text-sm font-semibold">Name</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold">Email</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold">Specialization</th>
                                    <th className="text-center py-3 px-4 text-sm font-semibold">Students</th>
                                    <th className="text-center py-3 px-4 text-sm font-semibold">Counselors</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold">Department</th>
                                    <th className="text-center py-3 px-4 text-sm font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mentors.map((mentor) => (
                                    <tr key={mentor.id} className="border-b border-secondary-50 hover:bg-secondary-50">
                                        <td className="py-3 px-4 font-medium">{mentor.name}</td>
                                        <td className="py-3 px-4 text-sm text-secondary-600">{mentor.email}</td>
                                        <td className="py-3 px-4 text-sm">
                                            <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium">
                                                {mentor.specialization || 'General Mentoring'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-center">{mentor.assignedStudents?.length || 0}</td>
                                        <td className="py-3 px-4 text-center">{mentor.counselorCount}</td>
                                        <td className="py-3 px-4 text-sm">{mentor.department || 'N/A'}</td>
                                        <td className="py-3 px-4 text-center">
                                            <button
                                                onClick={() => handleDeleteUser(mentor.userId)}
                                                className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                                                title="Delete User"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Assignment Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">
                                {assignmentType === 'student-counselor' ? 'Assign Students to Counselor' : 'Assign Mentor to Counselor'}
                            </h3>
                            <button onClick={() => setShowAssignModal(false)} className="text-secondary-500 hover:text-secondary-700">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Select Counselor */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Select Counselor</label>
                                <select
                                    value={selectedCounselor}
                                    onChange={(e) => setSelectedCounselor(e.target.value)}
                                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg"
                                >
                                    <option value="">Choose a counselor...</option>
                                    {counselors.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} ({c.studentCount}/{c.maxStudents} students)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {assignmentType === 'student-counselor' ? (
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Select Students ({selectedStudents.length} selected)
                                    </label>

                                    {/* AI-Powered Mentor Assignment - Only show when NOT assigning to counselor */}
                                    {assignmentType === 'student-counselor' && selectedStudents.length === 1 && (
                                        <div className="mt-6 pt-6 border-t border-secondary-200">
                                            <AIAssignment
                                                studentId={selectedStudents[0]}
                                                studentName={getAvailableStudents().find(s => s.id === selectedStudents[0])?.name}
                                                onMentorSelect={(mentorId) => {
                                                    // Auto-select the mentor suggested by AI
                                                    setSelectedMentor(mentorId);
                                                }}
                                            />
                                        </div>
                                    )}

                                    {/* Assignment Mode Tabs */}
                                    <div className="flex gap-3 pt-4 border-b border-secondary-200">
                                        <button
                                            onClick={() => setAssignmentMode('manual')}
                                            className={`px-3 py-2 text-sm font-medium ${assignmentMode === 'manual'
                                                ? 'text-primary border-b-2 border-primary'
                                                : 'text-secondary-600'}`}
                                        >
                                            Manual Selection
                                        </button>
                                        <button
                                            onClick={() => setAssignmentMode('range')}
                                            className={`px-3 py-2 text-sm font-medium ${assignmentMode === 'range'
                                                ? 'text-primary border-b-2 border-primary'
                                                : 'text-secondary-600'}`}
                                        >
                                            Range Selection
                                        </button>
                                    </div>

                                    {/* Filters */}
                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <div>
                                            <label className="block text-xs font-medium mb-1">Department</label>
                                            <select
                                                value={filterDepartment}
                                                onChange={(e) => setFilterDepartment(e.target.value)}
                                                className="w-full px-2 py-1.5 text-sm border border-secondary-300 rounded-lg"
                                            >
                                                <option value="">All Departments</option>
                                                {getUniqueDepartments().map(dept => (
                                                    <option key={dept} value={dept}>{dept}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium mb-1">Semester</label>
                                            <select
                                                value={filterSemester}
                                                onChange={(e) => setFilterSemester(e.target.value)}
                                                className="w-full px-2 py-1.5 text-sm border border-secondary-300 rounded-lg"
                                            >
                                                <option value="">All Semesters</option>
                                                {getUniqueSemesters().map(sem => (
                                                    <option key={sem} value={sem}>Semester {sem}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {assignmentMode === 'range' ? (
                                        /* Range Selection Mode */
                                        <div className="space-y-3">
                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                                <p className="text-sm font-medium text-blue-900 mb-2">
                                                    📊 {getAvailableStudents().length} students available after filters
                                                </p>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="block text-xs font-medium mb-1">From (Student #)</label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max={getAvailableStudents().length}
                                                            value={rangeStart}
                                                            onChange={(e) => setRangeStart(parseInt(e.target.value) || 1)}
                                                            className="w-full px-2 py-1.5 text-sm border border-secondary-300 rounded-lg"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium mb-1">To (Student #)</label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max={getAvailableStudents().length}
                                                            value={rangeEnd}
                                                            onChange={(e) => setRangeEnd(parseInt(e.target.value) || 1)}
                                                            className="w-full px-2 py-1.5 text-sm border border-secondary-300 rounded-lg"
                                                        />
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={handleRangeSelection}
                                                    className="w-full mt-2 px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-600"
                                                >
                                                    Select Range ({Math.max(0, Math.min(rangeEnd, getAvailableStudents().length) - (rangeStart - 1))} students)
                                                </button>
                                            </div>

                                            {/* Preview of selected students */}
                                            {selectedStudents.length > 0 && (
                                                <div className="border border-secondary-300 rounded-lg max-h-48 overflow-y-auto">
                                                    <div className="bg-secondary-50 px-3 py-2 border-b border-secondary-200 sticky top-0">
                                                        <p className="text-sm font-medium">Selected Students Preview</p>
                                                    </div>
                                                    {getAvailableStudents()
                                                        .filter(s => selectedStudents.includes(s.id))
                                                        .map(student => (
                                                            <div key={student.id} className="px-3 py-2 border-b border-secondary-100">
                                                                <p className="text-sm font-medium">{student.name}</p>
                                                                <p className="text-xs text-secondary-500">{student.studentId} - {student.department} - Sem {student.semester}</p>
                                                            </div>
                                                        ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        /* Manual Selection Mode */
                                        <div>
                                            <input
                                                type="text"
                                                placeholder="Search by name or ID..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full px-3 py-2 mb-2 border border-secondary-300 rounded-lg"
                                            />

                                            <div className="border border-secondary-300 rounded-lg max-h-64 overflow-y-auto">
                                                {getAvailableStudents().length === 0 ? (
                                                    <div className="px-3 py-8 text-center text-secondary-500">
                                                        {filterDepartment || filterSemester || searchTerm
                                                            ? 'No students match your filters'
                                                            : 'All students are already assigned'}
                                                    </div>
                                                ) : (
                                                    getAvailableStudents().map(student => (
                                                        <div
                                                            key={student.id}
                                                            onClick={() => toggleStudentSelection(student.id)}
                                                            className={`px-3 py-2 cursor-pointer hover:bg-secondary-50 flex items-center justify-between ${selectedStudents.includes(student.id) ? 'bg-primary-50' : ''
                                                                }`}
                                                        >
                                                            <div>
                                                                <p className="font-medium">{student.name}</p>
                                                                <p className="text-xs text-secondary-500">
                                                                    {student.studentId} - {student.department || 'N/A'} - {student.semester ? `Sem ${student.semester}` : 'N/A'}
                                                                </p>
                                                            </div>
                                                            {selectedStudents.includes(student.id) && <Check size={16} className="text-primary" />}
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <p className="text-xs text-secondary-500 mt-2">
                                        {getAvailableStudents().length} unassigned student(s) match filters
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium mb-2">Select Mentor</label>
                                    <select
                                        value={selectedMentor}
                                        onChange={(e) => setSelectedMentor(e.target.value)}
                                        className="w-full px-3 py-2 border border-secondary-300 rounded-lg"
                                    >
                                        <option value="">Choose a mentor...</option>
                                        {mentors.map(m => (
                                            <option key={m.id} value={m.id}>{m.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="flex gap-2 justify-end">
                                <Button variant="secondary" onClick={() => setShowAssignModal(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={assignmentType === 'student-counselor' ? handleAssignStudents : handleAssignMentor}
                                >
                                    Assign
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default UserManagementSection;

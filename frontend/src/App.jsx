import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import StudentProfile from './pages/StudentProfile';
import Analytics from './pages/Analytics';
import AdvancedAnalytics from './pages/AdvancedAnalytics';
import AdminDashboard from './pages/AdminDashboard';
import DataManagement from './pages/DataManagement';
import Reports from './pages/Reports';
import MentorDashboard from './pages/MentorDashboard';
import CounselorDashboard from './pages/CounselorDashboard';
import Login from './pages/Login';
import ChangePassword from './pages/ChangePassword';
import './index.css';

function App() {
  return (
    <Router>
      <ToastProvider>
      <AuthProvider>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<Login />} />
          <Route path="/change-password" element={<ChangePassword />} /> // Authenticated but restricted
          
          {/* Protected routes with sidebar */}
          <Route path="/*" element={
            <ProtectedRoute>
              <div className="flex min-h-screen bg-secondary-50">
                <Sidebar />
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/students" element={<Students />} />
                  <Route path="/students/:id" element={<StudentProfile />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/advanced-analytics" element={<AdvancedAnalytics />} />
                  <Route path="/data-management" element={<DataManagement />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/mentor/my-students" element={<MentorDashboard />} />
                  <Route path="/counseling/queue" element={<CounselorDashboard />} />
                  
                  {/* Admin dashboard - unrestricted for now */}
                  <Route path="/admin" element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                </Routes>
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;

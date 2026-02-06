import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { LogIn, GraduationCap, AlertCircle } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { success, error: toastError } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        success('Login successful! Redirecting...');
        
        // Enforce password change if flagged
        if (result.mustChangePassword) {
          navigate('/change-password');
          return;
        }

        // Redirect based on role
        switch (result.user.role) {
          case 'ADMIN':
            navigate('/');
            break;
          case 'MENTOR':
            navigate('/mentor/my-students');
            break;
          case 'COUNSELOR':
            navigate('/counseling/queue');
            break;
          default:
            navigate('/');
        }
      } else {
        toastError(result.error || 'Login failed');
      }
    } catch (err) {
      toastError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <GraduationCap size={32} className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Student Success</h1>
          {/* <p className="text-secondary-500">Dropout Prevention System</p>
          <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-sm rounded-lg border border-blue-100">
            <p><strong>Single login</strong> for Admins, Mentors, and Counselors.</p>
            <p>Access is automatically determined by your role.</p>
          </div> */}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle size={20} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full px-4 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="admin@university.edu"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full px-4 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="••••••••"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Signing in...
              </>
            ) : (
              <>
                <LogIn size={20} />
                Sign In
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-secondary-500">
          <p>Contact your administrator for credentials</p>
        </div>
      </Card>
    </div>
  );
};

export default Login;

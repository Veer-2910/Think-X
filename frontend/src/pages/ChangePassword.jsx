import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Lock, ShieldCheck, AlertCircle } from 'lucide-react';

const ChangePassword = () => {
  const navigate = useNavigate();
  const { success, error: toastError, warning } = useToast();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      warning('New passwords do not match');
      return;
    }
    if (formData.newPassword.length < 6) {
      warning('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await authAPI.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      
      success('Password changed successfully! You can now access your dashboard.');
      navigate('/');
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 rounded-full mb-4">
            <Lock size={24} className="text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Change Password</h1>
          <p className="text-slate-500 mt-2">
            For your security, you must change your temporary password to continue.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle size={20} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Temporary Password</label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
              placeholder="Enter the password from email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
              placeholder="Minimum 6 characters"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
              placeholder="Re-enter new password"
            />
          </div>

          <Button type="submit" className="w-full justify-center" disabled={loading}>
            {loading ? 'Updating...' : 'Set New Password'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ChangePassword;

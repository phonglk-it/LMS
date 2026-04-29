'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      return setMessage({ type: 'error', text: 'Passwords do not match!' });
    }

    if (newPassword.length < 6) {
      return setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
    }

    setLoading(true);

    try {
      // ✅ FIX PORT 8000
      await axios.post('http://localhost:8000/auth/reset-password', {
        token,
        newPassword,
      });

      setMessage({
        type: 'success',
        text: 'Password reset successfully! Redirecting to login...',
      });

      setTimeout(() => router.push('/login'), 3000);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Invalid or expired token.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">Reset Password</h2>
          <p className="text-gray-500 mt-2">Please enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              New Password
            </label>
            <input
              type="password"
              required
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              required
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {message.text && (
            <div
              className={`p-3 rounded ${
                message.type === 'success'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg"
          >
            {loading ? 'Processing...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
// src/components/auth/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials((s) => ({ ...s, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!credentials.username || !credentials.password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    const result = await login(credentials.username, credentials.password);
    setLoading(false);
    if (result.success) navigate('/dashboard');
    else setError(result.error || 'Sign in failed');
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* soft background */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-rose-50" />
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-sky-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-rose-200/30 blur-3xl" />

      {/* top links */}
      <div className="absolute top-4 left-6 text-sky-600 font-semibold select-none">M.</div>
      <div className="absolute top-4 right-6 text-sm text-gray-600">
        <a href="#" className="hover:underline">Need help?</a>
      </div>

      {/* card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8">
          {/* header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Sign in</h2>
            <p className="text-sm text-gray-600 mt-2">Staff access only</p>
          </div>

          {/* form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="Enter your username"
                disabled={loading}
                autoComplete="username"
              />
            </div>

            {/* password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <a href="#" className="text-xs text-gray-600 hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  className="input-field w-full pr-10"
                  placeholder="••••••••"
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPw ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3l18 18M10.584 10.59a3 3 0 104.243 4.243M9.88 5.09A8.966 8.966 0 0112 5c5.523 0 10 4.477 10 10 0 1.248-.227 2.443-.64 3.547M6.228 6.228C4.11 7.614 2.5 9.676 2 12c.663 3.09 3.621 6 10 6 1.178 0 2.277-.132 3.287-.377" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322C3.423 7.943 7.36 5 12 5c4.64 0 8.577 2.943 9.964 7.322a.75.75 0 010 .356C20.577 17.057 16.64 20 12 20c-4.64 0-8.577-2.943-9.964-7.322a.75.75 0 010-.356z" />
                      <circle cx="12" cy="12" r="3" strokeWidth="1.5" stroke="currentColor" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center rounded-lg bg-gray-900 text-white px-4 py-2.5 font-medium hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-gray-900/30 transition"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        {/* footer note */}
        <div className="text-center text-xs text-gray-500 mt-4">
          Internal staff use only
        </div>
      </div>
    </div>
  );
};

export default Login;

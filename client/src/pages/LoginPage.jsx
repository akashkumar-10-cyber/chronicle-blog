import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, BookOpen, ShieldCheck, PenTool, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const LoginPage = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email/username and password.', 'error');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      showToast('Welcome back to Chronicle!', 'success');
      navigate(from, { replace: true });
    } catch (err) {
      showToast(err.message || 'Invalid email or password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    showToast(`Quick-filled credentials for ${demoEmail}. Click "Sign In" to proceed!`, 'info');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-700 text-white flex items-center justify-center mx-auto shadow-md">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-slate-900 dark:text-white tracking-tight">
            Welcome to Chronicle
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-sans">
            Sign in to publish articles, engage with comments, and manage your stories.
          </p>
        </div>

        {/* Instant Demo Logins Section */}
        <div className="p-4 rounded-2xl bg-stone-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Instant Demo Quick-Fill:
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill('admin@chronicle.com', 'Admin@123456')}
              className="p-2.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 text-purple-900 dark:text-purple-200 text-left transition-colors"
            >
              <div className="flex items-center gap-1 text-[11px] font-bold">
                <ShieldCheck className="w-3 h-3 text-purple-600" /> Admin Demo
              </div>
              <p className="text-[10px] text-purple-600/80 dark:text-purple-300/80 truncate">
                admin@chronicle.com
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleDemoFill('sarah.chen@chronicle.com', 'Author@123456')}
              className="p-2.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-900 dark:text-blue-200 text-left transition-colors"
            >
              <div className="flex items-center gap-1 text-[11px] font-bold">
                <PenTool className="w-3 h-3 text-blue-600" /> Author Demo
              </div>
              <p className="text-[10px] text-blue-600/80 dark:text-blue-300/80 truncate">
                sarah.chen@chronicle.com
              </p>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Email or Username
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@chronicle.com or your_handle"
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-stone-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-stone-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Don't have an author account yet?{' '}
          <Link
            to="/register"
            className="font-semibold text-brand-600 dark:text-brand-400 hover:underline"
          >
            Register Now
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { USER_ROLES } from '../constants/roles';
import { 
  Building2, 
  Lock, 
  Mail, 
  User, 
  Home, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  Wrench,
  Clock,
  Layers
} from 'lucide-react';
import { ApexLogo } from '../components/common/Navbar';

const LoginPage = () => {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form Fields - strictly empty defaults (zero demo credentials)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [flatNo, setFlatNo] = useState('');

  // Automatic immediate redirection if already authenticated
  useEffect(() => {
    if (user) {
      if (user.role === USER_ROLES.ADMIN || user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (user.role === USER_ROLES.TECHNICIAN || user.role === 'technician') {
        navigate('/technician', { replace: true });
      } else {
        navigate('/resident', { replace: true });
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let res;
      if (isRegister) {
        if (!name.trim() || !email.trim() || !password || !flatNo.trim()) {
          throw new Error('Please fill out all registration fields.');
        }
        res = await register({
          name: name.trim(),
          email: email.trim(),
          password,
          flat_no: flatNo.trim()
        });
      } else {
        if (!email.trim() || !password) {
          throw new Error('Please enter both email and password.');
        }
        res = await login(email.trim(), password);
      }

      // Instant programmatic navigation
      const loggedUser = res?.user;
      if (loggedUser) {
        if (loggedUser.role === USER_ROLES.ADMIN || loggedUser.role === 'admin') {
          navigate('/admin', { replace: true });
        } else if (loggedUser.role === USER_ROLES.TECHNICIAN || loggedUser.role === 'technician') {
          navigate('/technician', { replace: true });
        } else {
          navigate('/resident', { replace: true });
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.18, ease: "easeInOut" }}
      className="w-full flex-1 flex items-center justify-center py-10 sm:py-16 px-4 sm:px-6 lg:px-8 bg-twinsoft-grid"
    >
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        
        {/* Left Column: Minimalist Platform Telemetry & Brand Presentation */}
        <div className="lg:col-span-6 space-y-7 text-left">
          
          {/* Minimalist Monochrome Brand Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-neutral-800 dark:text-neutral-200 text-xs font-semibold backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>ApexHeights Smart Residency • Facility Operations OS</span>
          </div>

          {/* Minimalist Monochrome Title */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-black dark:text-white tracking-tight leading-[1.12]">
              Unified Residential <br />
              <span className="text-neutral-400 dark:text-neutral-500 font-bold">
                Incident Operations
              </span>
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-xl font-normal">
              An enterprise operations ecosystem connecting residents, facility management, and on-demand certified technical specialists. Track maintenance telemetry and verify SLA resolution in real time.
            </p>
          </div>

          {/* Operational Metrics Ribbon - Glassmorphic B&W */}
          <div className="grid grid-cols-3 gap-3 pt-1">
            <div className="p-4 rounded-2xl bg-white/70 dark:bg-black/60 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.12] shadow-sm">
              <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400 font-semibold text-[11px] uppercase tracking-wider mb-1">
                <Wrench className="w-3.5 h-3.5" />
                <span>Specialists</span>
              </div>
              <p className="text-2xl font-black text-black dark:text-white">7 Staff</p>
              <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">Electrical, Plumbing, Civil</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/70 dark:bg-black/60 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.12] shadow-sm">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] uppercase tracking-wider mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Uptime</span>
              </div>
              <p className="text-2xl font-black text-black dark:text-white">24/7</p>
              <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">Central dispatch desk</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/70 dark:bg-black/60 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.12] shadow-sm">
              <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400 font-semibold text-[11px] uppercase tracking-wider mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Target SLA</span>
              </div>
              <p className="text-2xl font-black text-black dark:text-white">4 Hours</p>
              <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">P1 emergency dispatch</p>
            </div>
          </div>

        </div>

        {/* Right Column: High-Precision Minimalist Glassmorphic Authentication Console */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <div className="bg-white/80 dark:bg-black/70 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.12] rounded-3xl p-7 sm:p-9 shadow-2xl transition-all">
            
            {/* Header with Monochrome ApexLogo */}
            <div className="flex items-center gap-3.5 mb-6 pb-5 border-b border-black/[0.06] dark:border-white/[0.08]">
              <ApexLogo className="w-11 h-11" />
              <div>
                <h2 className="text-xl font-black text-black dark:text-white tracking-tight">
                  {isRegister ? 'Resident Registration' : 'Portal Access'}
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {isRegister 
                    ? 'Register your residential unit to lodge service requests' 
                    : 'Sign in to access your authorized console'}
                </p>
              </div>
            </div>

            {/* Segmented Sign In vs Register Toggle - Minimalist Monochrome */}
            <div className="flex bg-neutral-100/90 dark:bg-neutral-900/90 p-1 rounded-xl mb-6 border border-neutral-200/80 dark:border-neutral-800">
              <button
                type="button"
                id="tab-login"
                data-testid="tab-login"
                onClick={() => { setIsRegister(false); setError(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  !isRegister
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                id="tab-register"
                data-testid="tab-register"
                onClick={() => { setIsRegister(true); setError(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  isRegister
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                }`}
              >
                Register Resident
              </button>
            </div>

            {/* Error Banner - Functional Red strictly when needed */}
            {error && (
              <div
                id="auth-error-msg"
                data-testid="auth-error-msg"
                className="mb-4 p-3.5 bg-red-500/10 border border-red-500/25 rounded-xl flex items-center gap-2.5 text-xs text-red-600 dark:text-red-400"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                      Full Resident Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        id="register-name"
                        data-testid="register-name-input"
                        placeholder="e.g., Rohit Verma"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-neutral-50/80 dark:bg-neutral-950/80 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 text-sm focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white transition-colors"
                        required={isRegister}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                      Flat / Unit Number
                    </label>
                    <div className="relative">
                      <Home className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        id="register-flat"
                        data-testid="register-flat-input"
                        placeholder="e.g., A-104 or B-202"
                        value={flatNo}
                        onChange={(e) => setFlatNo(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-neutral-50/80 dark:bg-neutral-950/80 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 text-sm focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white transition-colors"
                        required={isRegister}
                      />
                    </div>
                  </div>
                </>
              )}



              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    id="login-email"
                    data-testid="login-email-input"
                    placeholder="name@society.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-50/80 dark:bg-neutral-950/80 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 text-sm focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    id="login-password"
                    data-testid="login-password-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-50/80 dark:bg-neutral-950/80 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 text-sm focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Minimalist High-Contrast Black & White Button */}
              <button
                type="submit"
                id="login-submit-btn"
                data-testid="login-submit-btn"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 bg-black hover:bg-neutral-800 active:bg-neutral-900 dark:bg-white dark:hover:bg-neutral-200 dark:active:bg-neutral-300 text-white dark:text-black font-bold text-sm rounded-xl transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating...' : isRegister ? 'Complete Registration' : 'Enter Facility Console'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-black/[0.06] dark:border-white/[0.08] text-center">
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center justify-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Protected by Enterprise Role-Based Access Control</span>
              </p>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default LoginPage;

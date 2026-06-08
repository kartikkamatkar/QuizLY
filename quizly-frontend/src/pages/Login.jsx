import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { FiMail, FiLock, FiArrowRight, FiCheckCircle, FiAlertCircle, FiKey, FiArrowLeft, FiShield } from 'react-icons/fi';
import api from '../api/axios';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Password reset flow states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1 = Enter Email, 2 = Enter OTP and New Password
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const otpRefs = useRef([]);

  // Handle normal sign in
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });

      const token = response.data;
      if (token === 'password required' || token === 'User not found' || token === 'Invalid Credentials') {
        setError(token);
        setLoading(false);
        return;
      }

      // Store token
      localStorage.setItem('token', token);

      // Fetch user profile info
      const userResponse = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });

      localStorage.setItem('user', JSON.stringify(userResponse.data));
      setSuccess('Signed in successfully! Redirecting...');

      setTimeout(() => {
        navigate('/dashboard');
        window.location.reload(); // Force header state update
      }, 1200);

    } catch (err) {
      console.error(err);
      setError('Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  // Handle password reset - send OTP
  const handleForgetPass = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      setError('Please enter your email.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/forgetpass', {
        email: resetEmail
      });

      if (response.data === 'Email not Exist ') {
        setError('No account found with this email.');
        setLoading(false);
        return;
      }

      setSuccess('Password reset code sent to your email.');
      setTimeout(() => {
        setResetStep(2);
        setSuccess('');
        setError('');
      }, 1500);

    } catch (err) {
      console.error(err);
      setError('Error requesting password reset code.');
    } finally {
      setLoading(false);
    }
  };

  // Handle password reset - verify OTP & change password
  const handleResetPass = async (e) => {
    e.preventDefault();
    const otpCode = resetOtp.join('');
    if (otpCode.length < 6) {
      setError('Please enter the full 6-digit OTP code.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/resetpass', {
        email: resetEmail,
        otp: otpCode,
        newPassword: newPassword
      });

      if (response.data === 'OTP EXPIRED' || response.data === 'Invalid OTP ') {
        setError(response.data);
        setLoading(false);
        return;
      }

      setSuccess('Password updated successfully! Please sign in.');
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetStep(1);
        setResetEmail('');
        setResetOtp(['', '', '', '', '', '']);
        setNewPassword('');
        setSuccess('');
        setError('');
      }, 2000);

    } catch (err) {
      console.error(err);
      setError('Error resetting password.');
    } finally {
      setLoading(false);
    }
  };

  // OTP inputs in recovery flow
  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...resetOtp];
    newOtp[index] = value;
    setResetOtp(newOtp);

    if (value !== '' && index < 5) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && resetOtp[index] === '' && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center bg-black mono-grid-bg relative">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none" />

      <div className="auth-container z-10 w-full max-w-md bg-mono-gray-900 border border-mono-gray-600 shadow-2xl p-8 rounded-2xl relative overflow-hidden">
        {/* Decorative Blur */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-white/5 blur-3xl rounded-full" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-white/5 blur-3xl rounded-full" />

        <div className="mb-8 text-center">
          <RouterLink to="/" className="text-3xl font-display font-bold text-white tracking-wider">
            Quiz<span className="text-black bg-white px-1 ml-0.5 rounded">LY</span>
          </RouterLink>
          <p className="text-mono-gray-400 mt-2 text-sm">Elevate your mind. Master details.</p>
        </div>

        {/* Dynamic Status Badges */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 p-4 bg-black border border-white/20 text-white rounded-lg flex items-center gap-3 text-sm"
            >
              <FiAlertCircle size={18} className="shrink-0 text-white" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 p-4 bg-white text-black rounded-lg flex items-center gap-3 text-sm font-semibold"
            >
              <FiCheckCircle size={18} className="shrink-0" />
              <span>{success}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {!showForgotPassword ? (
            // Sign in Form
            <motion.form
              key="signin-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleLoginSubmit}
              className="space-y-5"
            >
              <h2 className="text-2xl font-bold font-display tracking-tight text-white mb-2">Welcome Back</h2>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-mono-gray-500">
                  <FiMail size={18} />
                </span>
                <input
                  type="email"
                  placeholder="Email address"
                  className="mono-input pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-mono-gray-500">
                  <FiLock size={18} />
                </span>
                <input
                  type="password"
                  placeholder="Password"
                  className="mono-input pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(true);
                    setResetStep(1);
                    setError('');
                    setSuccess('');
                  }}
                  className="text-mono-gray-400 hover:text-white transition-colors text-xs font-semibold"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-white text-black font-semibold rounded-lg hover:bg-black hover:text-white hover:border-white border border-white transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <FiArrowRight size={18} />
                  </>
                )}
              </button>

              <p className="text-center text-mono-gray-400 text-sm mt-4">
                Don't have an account?{' '}
                <RouterLink to="/register" className="text-white hover:underline font-semibold">
                  Register
                </RouterLink>
              </p>
            </motion.form>
          ) : (
            // Password Recovery Slide
            <motion.div
              key="forgot-password"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  setError('');
                  setSuccess('');
                }}
                className="flex items-center gap-2 text-mono-gray-400 hover:text-white transition-colors text-sm font-semibold mb-4"
              >
                <FiArrowLeft size={16} />
                <span>Back to sign in</span>
              </button>

              {resetStep === 1 ? (
                <form onSubmit={handleForgetPass} className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <FiKey className="text-white" size={24} />
                    <h2 className="text-2xl font-bold font-display text-white">Reset Password</h2>
                  </div>
                  <p className="text-mono-gray-400 text-sm">
                    Enter the email address associated with your account, and we'll send a code to reset your password.
                  </p>

                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-mono-gray-500">
                      <FiMail size={18} />
                    </span>
                    <input
                      type="email"
                      placeholder="Email address"
                      className="mono-input pl-10"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-white text-black font-semibold rounded-lg hover:bg-black hover:text-white hover:border-white border border-white transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>Send Code</span>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPass} className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <FiShield className="text-white" size={24} />
                    <h2 className="text-2xl font-bold font-display text-white">Update Password</h2>
                  </div>
                  <p className="text-mono-gray-400 text-sm">
                    Enter the 6-digit OTP code sent to your email and your new password.
                  </p>

                  {/* OTP inputs */}
                  <div className="flex justify-between gap-2 my-4">
                    {resetOtp.map((digit, idx) => (
                      <input
                        key={idx}
                        type="text"
                        maxLength={1}
                        value={digit}
                        ref={(el) => (otpRefs.current[idx] = el)}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        disabled={loading}
                        className="w-12 h-14 bg-mono-gray-900 border border-mono-gray-700 text-center font-display text-2xl font-bold text-white rounded-lg focus:outline-none focus:border-white transition-colors"
                      />
                    ))}
                  </div>

                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-mono-gray-500">
                      <FiLock size={18} />
                    </span>
                    <input
                      type="password"
                      placeholder="New Password (min 6 characters)"
                      className="mono-input pl-10"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-white text-black font-semibold rounded-lg hover:bg-black hover:text-white hover:border-white border border-white transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>Reset Password</span>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Login;

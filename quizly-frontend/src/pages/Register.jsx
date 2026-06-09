import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiShield, FiUser, FiMail, FiLock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import api from '../api/axios';

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = Details, 2 = OTP
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // OTP digits state
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // Assuming 6-digit OTP
  const otpRefs = useRef([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle registration details submission
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password
      });

      setSuccess('Registration successful! OTP has been sent to your email.');
      setTimeout(() => {
        setStep(2);
        setError('');
        setSuccess('');
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data || 'Email already exists or server error.');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP inputs
  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Focus next input
    if (value !== '' && index < 5) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Focus previous input on backspace
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (pasteData.length === 6 && /^\d+$/.test(pasteData)) {
      const newOtp = pasteData.split('');
      setOtp(newOtp);
      otpRefs.current[5].focus();
    }
  };

  // Handle OTP verification submission
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setError('Please enter the full 6-digit code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Step 1: Verify OTP
      const otpResponse = await api.post('/auth/verifyotp', {
        email,
        otp: otpCode
      });

      const token = otpResponse.data;
      if (token === 'Invalid OTP' || token === 'OTP Expired' || token === 'User Data Expired') {
        setError(token);
        setLoading(false);
        return;
      }

      // Save token
      localStorage.setItem('token', token);

      // Step 2: Fetch user profile details
      const userResponse = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });

      localStorage.setItem('user', JSON.stringify(userResponse.data));
      setSuccess('Account created and verified! Redirecting to Dashboard...');

      setTimeout(() => {
        navigate('/dashboard');
        window.location.reload(); // Ensure Navbar updates
      }, 1500);

    } catch (err) {
      console.error(err);
      setError(err.response?.data || 'Verification failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // Go back to details edit
  const handleBackToDetails = () => {
    setStep(1);
    setOtp(['', '', '', '', '', '']);
    setError('');
    setSuccess('');
  };

  return (
      <div className="min-h-screen pt-28 pb-20 px-6 flex items-center justify-center bg-black mono-grid-bg relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none" />

        <div className="auth-container z-10 w-full max-w-md bg-mono-gray-900 border border-mono-gray-600 shadow-2xl p-8 sm:p-10 rounded-2xl relative overflow-hidden">
          {/* Glow accent */}
          <div className="absolute -top-20 -left-20 w-48 h-48 bg-white/5 blur-3xl rounded-full" />
          <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-white/5 blur-3xl rounded-full" />

          <div className="mb-10 text-center">
            <Link to="/" className="text-3xl font-display font-bold text-white tracking-wider">
              Quiz<span className="text-black bg-white px-1.5 ml-0.5 rounded">LY</span>
            </Link>
            <p className="text-mono-gray-400 mt-3 text-sm font-sans">Learn. Practice. Mastery.</p>
          </div>

          {/* Feedback alerts */}
          <AnimatePresence>
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-6 p-4 bg-black border-l-4 border-white/40 border border-mono-gray-800 text-white rounded-lg flex items-center gap-3 text-sm"
                >
                  <FiAlertCircle size={18} className="shrink-0 text-white" />
                  <span className="flex-1">{error}</span>
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
                  <span className="flex-1">{success}</span>
                </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {step === 1 ? (
                <motion.form
                    key="details-form"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleRegisterSubmit}
                    className="space-y-6"
                >
                  <h2 className="text-2xl font-bold font-display tracking-tight text-white mb-4">Create Account</h2>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                      <FiUser size={18} className="text-mono-gray-500" />
                    </div>
                    <input
                        type="text"
                        placeholder="Full Name"
                        className="w-full bg-mono-gray-900 border border-mono-gray-800 rounded-lg px-4 py-3 pl-10 text-white text-sm focus:outline-none focus:border-white transition-all duration-200"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={loading}
                        required
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                      <FiMail size={18} className="text-mono-gray-500" />
                    </div>
                    <input
                        type="email"
                        placeholder="Email Address"
                        className="w-full bg-mono-gray-900 border border-mono-gray-800 rounded-lg px-4 py-3 pl-10 text-white text-sm focus:outline-none focus:border-white transition-all duration-200"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        required
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                      <FiLock size={18} className="text-mono-gray-500" />
                    </div>
                    <input
                        type="password"
                        placeholder="Password (min 6 characters)"
                        className="w-full bg-mono-gray-900 border border-mono-gray-800 rounded-lg px-4 py-3 pl-10 text-white text-sm focus:outline-none focus:border-white transition-all duration-200"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        required
                    />
                  </div>

                  <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 bg-white text-black font-semibold rounded-lg hover:bg-black hover:text-white hover:border-white border-2 border-white transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2 group"
                  >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <>
                          <span>Continue</span>
                          <FiArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-200" />
                        </>
                    )}
                  </button>

                  <p className="text-center text-mono-gray-400 text-sm mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-white hover:underline font-semibold transition-all duration-200">
                      Sign In
                    </Link>
                  </p>
                </motion.form>
            ) : (
                <motion.form
                    key="otp-form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleVerifyOtp}
                    className="space-y-6"
                >
                  <div className="flex items-center gap-3.5 mb-3">
                    <FiShield className="text-white" size={26} />
                    <h2 className="text-2xl font-bold font-display tracking-tight text-white">Verify Email</h2>
                  </div>

                  <p className="text-mono-gray-400 text-sm leading-relaxed">
                    We sent a 6-digit code to <span className="text-white font-semibold">{email}</span>. Please enter it below.
                  </p>

                  <div className="flex justify-between gap-3 my-5" onPaste={handleOtpPaste}>
                    {otp.map((digit, idx) => (
                        <input
                            key={idx}
                            type="text"
                            maxLength={1}
                            value={digit}
                            ref={(el) => (otpRefs.current[idx] = el)}
                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                            disabled={loading}
                            className="w-12 h-14 bg-mono-gray-900 border border-mono-gray-700 text-center font-display text-2xl font-bold text-white rounded-lg focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all duration-200"
                        />
                    ))}
                  </div>

                  <div className="space-y-3.5 mt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-white text-black font-semibold rounded-lg hover:bg-black hover:text-white hover:border-white border-2 border-white transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 group"
                    >
                      {loading ? (
                          <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      ) : (
                          <span>Verify & Register</span>
                      )}
                    </button>

                    <button
                        type="button"
                        onClick={handleBackToDetails}
                        disabled={loading}
                        className="w-full py-3 bg-transparent text-mono-gray-400 hover:text-white transition-all duration-200 text-sm font-semibold hover:underline"
                    >
                      Edit details / Back
                    </button>
                  </div>
                </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
  );
};

export default Register;
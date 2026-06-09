import { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiAward, FiTrendingUp, FiArrowRight, FiBookOpen, FiGrid, FiActivity } from 'react-icons/fi';
import api from '../api/axios';

const Result = () => {
  const { attemptId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // State
  const [result, setResult] = useState(null);
  const [quizTitle, setQuizTitle] = useState('Quiz Completion');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Try to load from navigation state first
    if (location.state?.resultData) {
      setResult(location.state.resultData);
      setQuizTitle(location.state.quizTitle || 'Quiz');
      setLoading(false);
    }
    // 2. Otherwise load attempt from API if attemptId is a valid number
    else if (attemptId && attemptId !== 'summary') {
      fetchAttemptResult(attemptId);
    } else {
      // Fallback
      setLoading(false);
    }
  }, [attemptId, location]);

  const fetchAttemptResult = async (id) => {
    try {
      // Fetch specific attempt
      const attemptResponse = await api.get(`/api/attempts/${id}`);
      const attempt = attemptResponse.data;

      // Calculate percentage
      const score = attempt.score;
      const total = attempt.totalQuestions;
      const percentage = total > 0 ? (score / total) * 100 : 0;

      // Determine feedback based on percent (mirroring backend logic)
      let feedback = '';
      if (percentage >= 80) feedback = "Excellent! Great job!";
      else if (percentage >= 60) feedback = "Good work! Keep practicing!";
      else if (percentage >= 40) feedback = "Fair attempt. Review the material and try again.";
      else feedback = "Need more practice. Don't give up!";

      setResult({
        score,
        totalQuestions: total,
        percentage,
        feedback
      });

      // Try to fetch quiz title
      try {
        const quizResponse = await api.get(`/api/quizzes/${attempt.quizId}`);
        setQuizTitle(quizResponse.data.title);
      } catch (err) {
        console.error('Quiz details not available', err);
        setQuizTitle(`Quiz #${attempt.quizId}`);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading attempt result:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
    );
  }

  if (!result) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-center px-6">
          <div className="max-w-md">
            <FiActivity className="mx-auto mb-5 text-mono-gray-400 animate-bounce" size={52} />
            <h2 className="text-3xl font-bold font-display text-white mb-3 uppercase">No Result Found</h2>
            <p className="text-mono-gray-400 text-base mb-8 max-w-sm mx-auto">We couldn't resolve details for this quiz session.</p>
            <Link to="/dashboard" className="mono-btn-primary mx-auto inline-block">
              Go to Dashboard
            </Link>
          </div>
        </div>
    );
  }

  const roundedPercentage = Math.round(result.percentage);
  const strokeDashoffset = 280 - (280 * roundedPercentage) / 100;

  return (
      <div className="min-h-screen pt-28 pb-20 px-6 sm:px-8 bg-black mono-grid-bg">
        <div className="max-w-4xl mx-auto">
          <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-mono-gray-900 border border-mono-gray-800 rounded-3xl p-6 sm:p-10 lg:p-12 text-center relative overflow-hidden"
          >
            {/* Glow backdrop */}
            <div className="absolute -top-32 -left-32 w-64 h-64 bg-white/5 blur-3xl rounded-full" />
            <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-white/5 blur-3xl rounded-full" />

            {/* Icon Header */}
            <div className="mb-5">
              <FiAward className="mx-auto text-white" size={52} />
            </div>

            <span className="text-[11px] font-bold text-mono-gray-400 font-mono tracking-wider uppercase block">
            TEST SUMMARY SEQUENCE COMPLETED
          </span>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white uppercase mt-3 mb-10 max-w-2xl mx-auto leading-tight">
              {quizTitle}
            </h1>

            {/* SVG Circular Progress Bar in Stark B&W */}
            <div className="relative w-48 h-48 mx-auto mb-10 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                {/* Outer ring */}
                <circle
                    cx="96"
                    cy="96"
                    r="76"
                    className="stroke-mono-gray-800 fill-transparent"
                    strokeWidth="8"
                />
                {/* Inner animated ring */}
                <motion.circle
                    cx="96"
                    cy="96"
                    r="76"
                    className="stroke-white fill-transparent"
                    strokeWidth="8"
                    strokeDasharray="477"
                    initial={{ strokeDashoffset: 477 }}
                    animate={{ strokeDashoffset: 477 - (477 * roundedPercentage) / 100 }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-5xl font-display font-bold text-white">{roundedPercentage}%</span>
                <span className="text-[11px] uppercase font-bold text-mono-gray-400 tracking-wider mt-1 font-mono">Accuracy</span>
              </div>
            </div>

            {/* Feedback Section */}
            <div className="max-w-lg mx-auto mb-12 p-6 bg-black border border-mono-gray-800 rounded-2xl">
              <p className="text-xs font-semibold uppercase tracking-wider font-mono text-mono-gray-400">Evaluation Verdict</p>
              <p className="text-lg lg:text-xl font-semibold text-white mt-2 leading-relaxed">{result.feedback}</p>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-2 gap-5 max-w-md mx-auto mb-12 text-left">
              <div className="p-5 bg-black border border-mono-gray-800 rounded-xl hover:border-mono-gray-500 transition-all duration-200">
                <span className="text-[11px] font-bold text-mono-gray-500 font-mono uppercase block mb-1">Correct Score</span>
                <span className="text-2xl font-bold text-white font-mono">{result.score}</span>
              </div>
              <div className="p-5 bg-black border border-mono-gray-800 rounded-xl hover:border-mono-gray-500 transition-all duration-200">
                <span className="text-[11px] font-bold text-mono-gray-500 font-mono uppercase block mb-1">Total Questions</span>
                <span className="text-2xl font-bold text-white font-mono">{result.totalQuestions}</span>
              </div>
            </div>

            {/* Control Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
              <button
                  onClick={() => navigate('/leaderboard')}
                  className="px-7 py-3.5 bg-white text-black hover:bg-black hover:text-white border-2 border-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer text-xs uppercase font-mono font-bold group"
              >
                <span>View Leaderboard</span>
                <FiTrendingUp size={15} className="group-hover:translate-x-1 transition-transform duration-200" />
              </button>

              <button
                  onClick={() => navigate('/dashboard')}
                  className="px-7 py-3.5 bg-black text-white hover:bg-white hover:text-black border-2 border-mono-gray-800 hover:border-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer text-xs uppercase font-mono font-bold"
              >
                <span>Go to Dashboard</span>
                <FiGrid size={15} />
              </button>

              <button
                  onClick={() => navigate('/quizzes')}
                  className="px-7 py-3.5 bg-black text-white hover:bg-white hover:text-black border-2 border-mono-gray-800 hover:border-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer text-xs uppercase font-mono font-bold"
              >
                <span>Browse Quizzes</span>
                <FiBookOpen size={15} />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
  );
};

export default Result;
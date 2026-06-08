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
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-center px-4">
        <div>
          <FiActivity className="mx-auto mb-4 text-mono-gray-400 animate-bounce" size={48} />
          <h2 className="text-2xl font-bold font-display text-white mb-2 uppercase">No Result Found</h2>
          <p className="text-mono-gray-400 mb-6 max-w-sm">We couldn't resolve details for this quiz session.</p>
          <Link to="/dashboard" className="mono-btn-primary mx-auto">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const roundedPercentage = Math.round(result.percentage);
  const strokeDashoffset = 280 - (280 * roundedPercentage) / 100;

  return (
    <div className="min-h-screen pt-28 pb-16 px-6 sm:px-8 bg-black mono-grid-bg">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-mono-gray-900 border border-mono-gray-800 rounded-3xl p-6 sm:p-10 text-center relative overflow-hidden"
        >
          {/* Glow backdrop */}
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-white/5 blur-3xl rounded-full" />
          <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-white/5 blur-3xl rounded-full" />

          {/* Icon Header */}
          <div className="mb-4">
            <FiAward className="mx-auto text-white" size={48} />
          </div>

          <span className="text-[10px] font-bold text-mono-gray-400 font-mono tracking-widest uppercase block">
            TEST SUMMARY SEQUENCE COMPLETED
          </span>
          
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-white uppercase mt-2 mb-8 max-w-lg mx-auto">
            {quizTitle}
          </h1>

          {/* SVG Circular Progress Bar in Stark B&W */}
          <div className="relative w-44 h-44 mx-auto mb-8 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              {/* Outer ring */}
              <circle
                cx="88"
                cy="88"
                r="70"
                className="stroke-mono-gray-800 fill-transparent"
                strokeWidth="8"
              />
              {/* Inner animated ring */}
              <motion.circle
                cx="88"
                cy="88"
                r="70"
                className="stroke-white fill-transparent"
                strokeWidth="8"
                strokeDasharray="440"
                initial={{ strokeDashoffset: 440 }}
                animate={{ strokeDashoffset: 440 - (440 * roundedPercentage) / 100 }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-display font-bold text-white">{roundedPercentage}%</span>
              <span className="text-[10px] uppercase font-bold text-mono-gray-400 tracking-wider mt-0.5 font-mono">Accuracy</span>
            </div>
          </div>

          {/* Feedback Section */}
          <div className="max-w-md mx-auto mb-10 p-5 bg-black border border-mono-gray-800 rounded-2xl">
            <p className="text-mono-gray-400 text-xs font-semibold uppercase tracking-wider font-mono">Evaluation Verdict</p>
            <p className="text-lg font-semibold text-white mt-1.5 leading-relaxed">{result.feedback}</p>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-10 text-left">
            <div className="p-4 bg-black border border-mono-gray-800 rounded-xl">
              <span className="text-[10px] font-bold text-mono-gray-500 font-mono uppercase block">Correct Score</span>
              <span className="text-xl font-bold text-white font-mono">{result.score}</span>
            </div>
            <div className="p-4 bg-black border border-mono-gray-800 rounded-xl">
              <span className="text-[10px] font-bold text-mono-gray-500 font-mono uppercase block">Total Questions</span>
              <span className="text-xl font-bold text-white font-mono">{result.totalQuestions}</span>
            </div>
          </div>

          {/* Control Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
            <button
              onClick={() => navigate('/leaderboard')}
              className="px-6 py-3 bg-white text-black hover:bg-black hover:text-white border border-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase font-mono font-bold"
            >
              <span>View Leaderboard</span>
              <FiTrendingUp size={14} />
            </button>
            
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-black text-white hover:bg-white hover:text-black border border-mono-gray-800 hover:border-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase font-mono font-bold"
            >
              <span>Go to Dashboard</span>
              <FiGrid size={14} />
            </button>

            <button
              onClick={() => navigate('/quizzes')}
              className="px-6 py-3 bg-black text-white hover:bg-white hover:text-black border border-mono-gray-800 hover:border-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase font-mono font-bold"
            >
              <span>Browse Quizzes</span>
              <FiBookOpen size={14} />
            </button>
          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default Result;

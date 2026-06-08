import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiClock, FiPlay, FiAlertCircle, FiAward, FiBookOpen, FiArrowLeft } from 'react-icons/fi';
import api from '../api/axios';

const QuizDetailed = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    fetchQuizDetails();
  }, [id]);

  const fetchQuizDetails = async () => {
    try {
      // Must prepend /api to route through Gateway
      const response = await api.get(`/api/quizzes/${id}`);
      setQuiz(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching quiz details:', error);
      setLoading(false);
    }
  };

  const handleStartQuiz = async () => {
    setStarting(true);
    try {
      // Must prepend /api to route through Gateway
      const response = await api.get(`/api/quizzes/${id}/start`); // Wait, in controller it was GET /api/quizzes/{id}/start !
      navigate(`/quiz/take/${id}`, { state: { quizSession: response.data } });
    } catch (error) {
      console.error('Error starting quiz:', error);
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <FiAlertCircle className="mx-auto mb-4 text-mono-gray-400" size={48} />
          <h2 className="text-2xl font-bold mb-2">Quiz Not Found</h2>
          <p className="text-mono-gray-400 mb-6">The quiz you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/quizzes')} className="mono-btn-primary mx-auto">
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-16 px-6 sm:px-8 bg-black mono-grid-bg">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/quizzes')}
          className="flex items-center gap-2 text-mono-gray-400 hover:text-white transition-colors text-sm font-semibold mb-6"
        >
          <FiArrowLeft size={16} />
          <span>Back to Quizzes</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-mono-gray-900 border border-mono-gray-800 rounded-3xl p-6 sm:p-10 relative overflow-hidden"
        >
          {/* Subtle grid light */}
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-white/5 blur-3xl rounded-full" />

          {/* Quiz Header */}
          <div className="mb-10 relative">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-[10px] bg-white text-black px-2 py-0.5 rounded font-extrabold uppercase font-sans tracking-wider">
                {quiz.category}
              </span>
              <span className="text-[9px] text-white border border-mono-gray-600 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                {quiz.difficulty}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-white tracking-tight uppercase leading-none mb-4">
              {quiz.title}
            </h1>
            <p className="text-mono-gray-400 text-base max-w-2xl leading-relaxed">
              {quiz.description}
            </p>
          </div>

          {/* Quiz Stats Grid */}
          <div className="grid sm:grid-cols-3 gap-6 mb-10">
            <div className="p-5 bg-black border border-mono-gray-800 rounded-2xl">
              <div className="flex items-center gap-2 text-mono-gray-500 mb-2">
                <FiBookOpen size={16} />
                <span className="text-xs font-semibold uppercase tracking-wider">Category</span>
              </div>
              <p className="text-base font-bold text-white uppercase">{quiz.category}</p>
            </div>
            
            <div className="p-5 bg-black border border-mono-gray-800 rounded-2xl">
              <div className="flex items-center gap-2 text-mono-gray-500 mb-2">
                <FiAward size={16} />
                <span className="text-xs font-semibold uppercase tracking-wider">Question Density</span>
              </div>
              <p className="text-base font-bold text-white">{quiz.questionCount || 0} Questions</p>
            </div>

            <div className="p-5 bg-black border border-mono-gray-800 rounded-2xl">
              <div className="flex items-center gap-2 text-mono-gray-500 mb-2">
                <FiClock size={16} />
                <span className="text-xs font-semibold uppercase tracking-wider">Time Available</span>
              </div>
              <p className="text-base font-bold text-white">{quiz.timeLimit || 30} Minutes</p>
            </div>
          </div>

          {/* Guidelines / Instructions */}
          <div className="mb-10 p-6 bg-black border border-mono-gray-800 rounded-2xl">
            <h2 className="text-lg font-display font-semibold text-white mb-4 uppercase tracking-wider">
              Instruction Set
            </h2>
            <ul className="space-y-3.5 text-xs text-mono-gray-400 font-sans">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 shrink-0" />
                <span>Submit answers question-by-question. You can traverse backward and forward.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 shrink-0" />
                <span>Timer operates strictly in the background. Submit before expiration to prevent score invalidation.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 shrink-0" />
                <span>Upon clicking Start, questions are synchronized immediately and attempts are logged dynamically.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 shrink-0" />
                <span>Ensure your internet network is stable during the duration of the test.</span>
              </li>
            </ul>
          </div>

          {/* Start Action Trigger */}
          <button
            onClick={handleStartQuiz}
            disabled={starting}
            className="w-full py-4 bg-white text-black hover:bg-black hover:text-white hover:border-white border border-white rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {starting ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <FiPlay size={18} />
                <span>INITIATE TEST SEQUENCE</span>
              </>
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default QuizDetailed;
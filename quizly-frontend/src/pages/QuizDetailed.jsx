import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiClock, FiPlay, FiAlertCircle, FiAward, FiBookOpen, FiArrowLeft, FiDownload } from 'react-icons/fi';
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
      const response = await api.get(`/api/quizzes/${id}/start`);
      navigate(`/quiz/take/${id}`, { state: { quizSession: response.data } });
    } catch (error) {
      console.error('Error starting quiz:', error);
      setStarting(false);
    }
  };

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
    );
  }

  if (!quiz) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-black px-6">
          <div className="text-center max-w-md">
            <FiAlertCircle className="mx-auto mb-5 text-mono-gray-400" size={52} />
            <h2 className="text-3xl font-bold font-display text-white mb-3">Quiz Not Found</h2>
            <p className="text-mono-gray-400 text-base mb-8">The quiz you're looking for doesn't exist.</p>
            <button onClick={() => navigate('/quizzes')} className="mono-btn-primary mx-auto">
              Back to Quizzes
            </button>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen pt-28 pb-20 px-6 sm:px-8 bg-black mono-grid-bg">
        <div className="max-w-5xl mx-auto">
          <button
              onClick={() => navigate('/quizzes')}
              className="flex items-center gap-2.5 text-mono-gray-400 hover:text-white transition-all duration-200 text-sm font-semibold mb-8 group"
          >
            <FiArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-200" />
            <span>Back to Quizzes</span>
          </button>

          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-mono-gray-900 border border-mono-gray-800 rounded-3xl p-6 sm:p-10 lg:p-12 relative overflow-hidden"
          >
            {/* Subtle grid light */}
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-white/5 blur-3xl rounded-full" />
            <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-white/5 blur-3xl rounded-full" />

            {/* Quiz Header */}
            <div className="mb-12 relative">
              <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className="text-[11px] bg-white text-black px-2.5 py-0.5 rounded font-extrabold uppercase font-sans tracking-wider">
                {quiz.category}
              </span>
                <span className="text-[10px] text-white border border-mono-gray-600 px-2.5 py-0.5 rounded uppercase font-bold tracking-wider">
                {quiz.difficulty}
              </span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white tracking-tighter uppercase leading-tight mb-5">
                {quiz.title}
              </h1>
              <p className="text-mono-gray-400 text-base lg:text-lg max-w-3xl leading-relaxed">
                {quiz.description}
              </p>
            </div>

            {/* Quiz Stats Grid */}
            <div className="grid sm:grid-cols-3 gap-6 mb-12">
              <div className="group p-5 bg-black border border-mono-gray-800 hover:border-mono-gray-500 rounded-2xl transition-all duration-200 hover:shadow-lg">
                <div className="flex items-center gap-2.5 text-mono-gray-500 mb-3">
                  <FiBookOpen size={18} />
                  <span className="text-xs font-semibold uppercase tracking-wider">Category</span>
                </div>
                <p className="text-base lg:text-lg font-bold text-white uppercase">{quiz.category}</p>
              </div>

              <div className="group p-5 bg-black border border-mono-gray-800 hover:border-mono-gray-500 rounded-2xl transition-all duration-200 hover:shadow-lg">
                <div className="flex items-center gap-2.5 text-mono-gray-500 mb-3">
                  <FiAward size={18} />
                  <span className="text-xs font-semibold uppercase tracking-wider">Question Density</span>
                </div>
                <p className="text-base lg:text-lg font-bold text-white">{quiz.questionCount || 0} Questions</p>
              </div>

              <div className="group p-5 bg-black border border-mono-gray-800 hover:border-mono-gray-500 rounded-2xl transition-all duration-200 hover:shadow-lg">
                <div className="flex items-center gap-2.5 text-mono-gray-500 mb-3">
                  <FiClock size={18} />
                  <span className="text-xs font-semibold uppercase tracking-wider">Time Available</span>
                </div>
                <p className="text-base lg:text-lg font-bold text-white">{quiz.timeLimit || 30} Minutes</p>
              </div>
            </div>

            {/* Guidelines / Instructions */}
            <div className="mb-12 p-6 lg:p-8 bg-black border border-mono-gray-800 rounded-2xl">
              <h2 className="text-xl font-display font-semibold text-white mb-5 uppercase tracking-wider">
                Instruction Set
              </h2>
              <ul className="space-y-4 text-sm text-mono-gray-400 font-sans">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-white mt-2 shrink-0" />
                  <span className="leading-relaxed">Submit answers question-by-question. You can traverse backward and forward.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-white mt-2 shrink-0" />
                  <span className="leading-relaxed">Timer operates strictly in the background. Submit before expiration to prevent score invalidation.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-white mt-2 shrink-0" />
                  <span className="leading-relaxed">Upon clicking Start, questions are synchronized immediately and attempts are logged dynamically.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-white mt-2 shrink-0" />
                  <span className="leading-relaxed">Ensure your internet network is stable during the duration of the test.</span>
                </li>
              </ul>
            </div>

            {/* Start Action Trigger with optional PDF Download */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                  onClick={handleStartQuiz}
                  disabled={starting}
                  className="flex-1 py-4.5 bg-white text-black hover:bg-black hover:text-white hover:border-white border-2 border-white rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer group"
              >
                {starting ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                    <>
                      <FiPlay size={18} className="group-hover:scale-110 transition-transform duration-200" />
                      <span className="tracking-wider">INITIATE TEST SEQUENCE</span>
                    </>
                )}
              </button>

              {quiz.pdfUrl && (
                  <a
                      href={quiz.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-4 px-6 bg-black text-white hover:bg-white hover:text-black border border-mono-gray-700 hover:border-white rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FiDownload size={18} />
                    <span>DOWNLOAD PDF SHEET</span>
                  </a>
              )}
            </div>
          </motion.div>
        </div>
      </div>
  );
};

export default QuizDetailed;
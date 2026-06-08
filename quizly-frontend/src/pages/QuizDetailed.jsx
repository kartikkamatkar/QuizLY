import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiClock, FiBarChart2, FiPlay, FiAlertCircle, FiAward } from 'react-icons/fi';
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
      const response = await api.get(`/quizzes/${id}`);
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
      const response = await api.post(`/quizzes/${id}/start`);
      navigate(`/quiz/take/${id}`, { state: { quizSession: response.data } });
    } catch (error) {
      console.error('Error starting quiz:', error);
      setStarting(false);
    }
  };

  const getDifficultyDetails = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return { color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' };
      case 'intermediate':
        return { color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' };
      case 'advanced':
        return { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' };
      default:
        return { color: 'text-gray-400', bg: 'bg-gray-400/10', border: 'border-gray-700' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FiAlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
          <h2 className="text-2xl font-bold mb-2">Quiz Not Found</h2>
          <p className="text-gray-400">The quiz you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const difficultyDetails = getDifficultyDetails(quiz.difficulty);

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Quiz Header */}
          <div className="mb-8">
            <span className={`inline-block px-3 py-1 rounded-full text-sm ${difficultyDetails.bg} ${difficultyDetails.color} border ${difficultyDetails.border} mb-4`}>
              {quiz.difficulty}
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              {quiz.title}
            </h1>
            <p className="text-gray-400 text-lg">
              {quiz.description}
            </p>
          </div>

          {/* Quiz Stats */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-xl border border-gray-800">
              <div className="flex items-center gap-3 mb-2">
                <FiBarChart2 className="text-gray-400" size={20} />
                <span className="text-sm text-gray-400">Category</span>
              </div>
              <p className="text-lg font-semibold">{quiz.category}</p>
            </div>
            <div className="p-4 rounded-xl border border-gray-800">
              <div className="flex items-center gap-3 mb-2">
                <FiAward className="text-gray-400" size={20} />
                <span className="text-sm text-gray-400">Questions</span>
              </div>
              <p className="text-lg font-semibold">{quiz.questionCount} questions</p>
            </div>
            <div className="p-4 rounded-xl border border-gray-800">
              <div className="flex items-center gap-3 mb-2">
                <FiClock className="text-gray-400" size={20} />
                <span className="text-sm text-gray-400">Time Limit</span>
              </div>
              <p className="text-lg font-semibold">{quiz.timeLimit || 30} minutes</p>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-8 p-6 rounded-2xl border border-gray-800">
            <h2 className="text-xl font-semibold mb-4">Instructions</h2>
            <ul className="space-y-2 text-gray-400">
              <li>• Read each question carefully before answering</li>
              <li>• You can navigate between questions using Previous/Next buttons</li>
              <li>• Once submitted, you cannot change your answers</li>
              <li>• Your score will be displayed immediately after submission</li>
              <li>• You can retake the quiz to improve your score</li>
            </ul>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStartQuiz}
            disabled={starting}
            className="w-full py-4 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {starting ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <FiPlay size={20} />
                <span>Start Quiz</span>
              </>
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default QuizDetailed;
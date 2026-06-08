import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock, FiCheckSquare, FiAlertCircle, FiArrowLeft, FiArrowRight, FiCheck } from 'react-icons/fi';
import api from '../api/axios';

const QuizTaking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const session = location.state?.quizSession;

  // Safeguard if accessed directly without state
  useEffect(() => {
    if (!session) {
      navigate('/quizzes');
    }
  }, [session, navigate]);

  if (!session) return null;

  const { quizId, title, questions = [] } = session;
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // questionId -> selectedOptionKey (optionA, optionB, optionC, optionD)
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // default 30 mins
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Setup timer
  useEffect(() => {
    // We could fetch the time limit from some metadata, or default to 30 mins
    const limit = 30; // 30 minutes
    setTimeRemaining(limit * 60);

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto submit when time hits 0
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSelectOption = (questionId, optionKey) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey
    }));
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleAutoSubmit = () => {
    alert('Time limit reached! Submitting your quiz automatically.');
    submitQuizAnswers();
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const unansweredCount = questions.length - Object.keys(answers).length;
    if (unansweredCount > 0) {
      const confirmSubmit = confirm(
        `You have left ${unansweredCount} question(s) unanswered. Are you sure you want to submit?`
      );
      if (!confirmSubmit) return;
    } else {
      if (!confirm('Are you sure you want to submit this quiz?')) return;
    }
    submitQuizAnswers();
  };

  const submitQuizAnswers = async () => {
    setSubmitting(true);
    setError('');

    try {
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      
      if (!user) {
        setError('User session expired. Please sign in again.');
        setSubmitting(false);
        return;
      }

      // Format matching SubmitQuizRequest structure
      const response = await api.post('/api/quizzes/submit', {
        userId: user.id,
        quizId: quizId,
        answers: answers
      });

      // Redirect to result page, passing the response stats inside navigation state
      navigate('/result/summary', {
        state: {
          resultData: response.data,
          quizTitle: title
        }
      });

    } catch (err) {
      console.error('Error submitting quiz answers:', err);
      setError('An error occurred while submitting your answers. Please try again.');
      setSubmitting(false);
    }
  };

  const activeQuestion = questions[currentIdx];
  const isQuestionAnswered = (id) => !!answers[id];

  return (
    <div className="min-h-screen pt-24 pb-16 px-6 sm:px-8 bg-black flex flex-col justify-between">
      {/* Header Panel */}
      <div className="max-w-5xl w-full mx-auto bg-mono-gray-900 border border-mono-gray-800 p-5 rounded-2xl flex items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-[9px] font-bold text-mono-gray-400 font-mono uppercase tracking-widest block">
            QUIZ TAKING IN PROGRESS
          </span>
          <h2 className="text-lg font-display font-bold text-white uppercase mt-0.5 line-clamp-1">
            {title}
          </h2>
        </div>

        {/* Timer Box */}
        <div className="flex items-center gap-2 px-4 py-2 border border-mono-gray-800 bg-black rounded-xl text-white font-mono font-bold text-sm shrink-0">
          <FiClock className={timeRemaining < 60 ? 'text-white animate-pulse' : 'text-mono-gray-400'} />
          <span className={timeRemaining < 60 ? 'text-white font-extrabold' : ''}>
            {formatTime(timeRemaining)}
          </span>
        </div>
      </div>

      {/* Main Grid Workspace */}
      <div className="max-w-5xl w-full mx-auto grid md:grid-cols-4 gap-8 items-start flex-1 mb-8">
        
        {/* LEFT PANEL: Quick Navigation Matrix */}
        <div className="bg-mono-gray-900 border border-mono-gray-800 p-6 rounded-2xl space-y-4 md:col-span-1">
          <h3 className="text-xs font-bold text-mono-gray-400 font-mono uppercase tracking-wider">
            Navigation Grid
          </h3>
          
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, idx) => {
              const answered = isQuestionAnswered(q.id);
              const active = idx === currentIdx;
              
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIdx(idx)}
                  className={`w-9 h-9 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    active
                      ? 'bg-black text-white border-2 border-white'
                      : answered
                        ? 'bg-white text-black font-extrabold'
                        : 'bg-black text-mono-gray-400 border border-mono-gray-800 hover:border-mono-gray-600'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="border-t border-mono-gray-800/80 pt-4 space-y-2 text-[10px] font-mono text-mono-gray-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-white" />
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-black border border-white" />
              <span>Current Question</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-black border border-mono-gray-800" />
              <span>Unattempted</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Question content card */}
        <div className="md:col-span-3">
          {error && (
            <div className="mb-6 p-4 bg-black border border-white/20 text-white rounded-xl flex items-center gap-3 text-sm">
              <FiAlertCircle className="text-white shrink-0" size={18} />
              <span>{error}</span>
            </div>
          )}

          {activeQuestion && (
            <motion.div
              key={activeQuestion.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-mono-gray-900 border border-mono-gray-800 rounded-3xl p-6 sm:p-8 space-y-6"
            >
              <div className="flex justify-between items-center border-b border-mono-gray-800/80 pb-4">
                <span className="text-[10px] font-bold text-mono-gray-400 font-mono tracking-widest uppercase">
                  QUESTION {currentIdx + 1} OF {questions.length}
                </span>
                {activeQuestion.topic && (
                  <span className="text-[10px] text-white border border-mono-gray-700 px-2 py-0.5 rounded font-mono uppercase">
                    {activeQuestion.topic}
                  </span>
                )}
              </div>

              {/* Question */}
              <h2 className="text-xl sm:text-2xl font-display font-semibold text-white leading-relaxed">
                {activeQuestion.question}
              </h2>

              {/* Choices list */}
              <div className="space-y-3 pt-2">
                {[
                  { key: 'optionA', val: activeQuestion.optionA, letter: 'A' },
                  { key: 'optionB', val: activeQuestion.optionB, letter: 'B' },
                  { key: 'optionC', val: activeQuestion.optionC, letter: 'C' },
                  { key: 'optionD', val: activeQuestion.optionD, letter: 'D' }
                ].map((opt) => {
                  const isSelected = answers[activeQuestion.id] === opt.key;
                  
                  return (
                    <button
                      key={opt.key}
                      onClick={() => handleSelectOption(activeQuestion.id, opt.key)}
                      className={`w-full text-left p-4.5 rounded-xl border font-sans text-sm transition-all duration-200 flex items-center gap-4 cursor-pointer ${
                        isSelected
                          ? 'bg-white text-black border-white font-semibold'
                          : 'bg-black text-mono-gray-300 border-mono-gray-800 hover:border-mono-gray-500 hover:text-white'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded border flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                        isSelected 
                          ? 'bg-black text-white border-black' 
                          : 'border-mono-gray-700 text-mono-gray-400 group-hover:text-white'
                      }`}>
                        {opt.letter}
                      </span>
                      <span>{opt.val}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Nav Controls */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={handlePrev}
              disabled={currentIdx === 0}
              className="px-5 py-3 rounded-xl border border-mono-gray-800 hover:border-white text-mono-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1 text-xs font-bold font-mono"
            >
              <FiArrowLeft size={14} /> PREV
            </button>

            {currentIdx < questions.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-5 py-3 bg-white text-black border border-white hover:bg-black hover:text-white rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-bold font-mono"
              >
                NEXT <FiArrowRight size={14} />
              </button>
            ) : (
              <button
                onClick={handleFormSubmit}
                disabled={submitting}
                className="px-6 py-3 bg-white text-black hover:bg-black hover:text-white border border-white rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase font-mono disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <FiCheckSquare size={14} /> SUBMIT QUIZ
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default QuizTaking;

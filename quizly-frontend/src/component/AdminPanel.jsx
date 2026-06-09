import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiLink, FiBookOpen, FiHelpCircle, FiClock, FiCheck, FiAlertTriangle } from 'react-icons/fi';
import api from '../api/axios';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('quizzes'); // 'quizzes', 'questions', 'assign'

  // Data lists
  const [quizzes, setQuizzes] = useState([]);
  const [questions, setQuestions] = useState([]);

  // Loading & Alert states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form States - Quiz Creation
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [quizCategory, setQuizCategory] = useState('JAVA');
  const [quizDifficulty, setQuizDifficulty] = useState('EASY');
  const [quizTimeLimit, setQuizTimeLimit] = useState(30);
  const [quizPdfUrl, setQuizPdfUrl] = useState('');

  // Form States - Question Creation
  const [questText, setQuestText] = useState('');
  const [questOptA, setQuestOptA] = useState('');
  const [questOptB, setQuestOptB] = useState('');
  const [questOptC, setQuestOptC] = useState('');
  const [questOptD, setQuestOptD] = useState('');
  const [questCorrect, setQuestCorrect] = useState('optionA'); // 'optionA', 'optionB', etc.
  const [questTopic, setQuestTopic] = useState('');
  const [questCategory, setQuestCategory] = useState('JAVA');
  const [questDifficulty, setQuestDifficulty] = useState('EASY');

  // Form States - Assigning Questions
  const [selectedQuizId, setSelectedQuizId] = useState('');
  const [selectedQuestionId, setSelectedQuestionId] = useState('');

  const categories = ['JAVA', 'SPRING', 'REACT', 'DSA', 'DBMS', 'OS', 'CN', 'APTITUDE'];
  const difficulties = ['EASY', 'MEDIUM', 'HARD'];

  useEffect(() => {
    fetchQuizzes();
    fetchQuestions();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await api.get('/api/quizzes');
      setQuizzes(response.data);
    } catch (err) {
      console.error('Error fetching quizzes:', err);
    }
  };

  const fetchQuestions = async () => {
    try {
      // The backend uses pagination for questions: GET /api/questions?page=0&size=100
      const response = await api.get('/api/questions?page=0&size=100');
      if (response.data && response.data.content) {
        setQuestions(response.data.content);
      } else {
        setQuestions([]);
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
    }
  };

  // Quiz submission
  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    if (!quizTitle || !quizDescription) {
      setError('Please provide a title and description.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/api/quizzes', {
        title: quizTitle,
        description: quizDescription,
        category: quizCategory,
        difficulty: quizDifficulty,
        timeLimit: parseInt(quizTimeLimit),
        pdfUrl: quizPdfUrl
      });

      setSuccess('Quiz created successfully!');
      setQuizTitle('');
      setQuizDescription('');
      setQuizTimeLimit(30);
      setQuizPdfUrl('');
      fetchQuizzes();
    } catch (err) {
      setError(err.response?.data || 'Failed to create quiz.');
    } finally {
      setLoading(false);
    }
  };

  // Question submission
  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    if (!questText || !questOptA || !questOptB || !questOptC || !questOptD || !questTopic) {
      setError('Please fill in all question fields.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/api/questions', {
        question: questText,
        optionA: questOptA,
        optionB: questOptB,
        optionC: questOptC,
        optionD: questOptD,
        correctAnswer: questCorrect, // e.g. "optionA"
        topic: questTopic,
        category: questCategory,
        difficulty: questDifficulty
      });

      setSuccess('Question added successfully!');
      setQuestText('');
      setQuestOptA('');
      setQuestOptB('');
      setQuestOptC('');
      setQuestOptD('');
      setQuestTopic('');
      fetchQuestions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create question.');
    } finally {
      setLoading(false);
    }
  };

  // Link Question to Quiz
  const handleLinkQuestion = async (e) => {
    e.preventDefault();
    if (!selectedQuizId || !selectedQuestionId) {
      setError('Please select both a Quiz and a Question.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post(`/api/quizzes/${selectedQuizId}/questions/${selectedQuestionId}`);
      setSuccess('Question successfully linked to the quiz!');
      setSelectedQuestionId('');
      fetchQuizzes(); // Refresh quiz stats (question counts)
    } catch (err) {
      setError(err.response?.data || 'Failed to link question to quiz.');
    } finally {
      setLoading(false);
    }
  };

  // Delete handlers
  const handleDeleteQuiz = async (id) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;
    try {
      await api.delete(`/api/quizzes/${id}`);
      setSuccess('Quiz deleted successfully.');
      fetchQuizzes();
    } catch (err) {
      setError('Failed to delete quiz.');
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      await api.delete(`/api/questions/${id}`);
      setSuccess('Question deleted successfully.');
      fetchQuestions();
    } catch (err) {
      setError('Failed to delete question.');
    }
  };

  return (
      <div className="w-full bg-mono-gray-900 border border-mono-gray-800 rounded-2xl p-6 sm:p-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 pb-6 border-b border-mono-gray-800">
          <div>
            <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
              <FiBookOpen className="text-white" size={24} />
              Admin Control Board
            </h2>
            <p className="text-mono-gray-400 text-sm mt-2">Configure quizzes, questions, and curriculum.</p>
          </div>

          {/* Tab Controls */}
          <div className="flex bg-black p-1 border border-mono-gray-800 rounded-lg gap-1">
            <button
                onClick={() => { setActiveTab('quizzes'); setError(''); setSuccess(''); }}
                className={`px-5 py-2 text-sm font-semibold rounded-md transition-all duration-200 cursor-pointer ${
                    activeTab === 'quizzes' ? 'bg-white text-black' : 'text-mono-gray-400 hover:text-white hover:bg-mono-gray-800'
                }`}
            >
              Quizzes
            </button>
            <button
                onClick={() => { setActiveTab('questions'); setError(''); setSuccess(''); }}
                className={`px-5 py-2 text-sm font-semibold rounded-md transition-all duration-200 cursor-pointer ${
                    activeTab === 'questions' ? 'bg-white text-black' : 'text-mono-gray-400 hover:text-white hover:bg-mono-gray-800'
                }`}
            >
              Questions
            </button>
            <button
                onClick={() => { setActiveTab('assign'); setError(''); setSuccess(''); }}
                className={`px-5 py-2 text-sm font-semibold rounded-md transition-all duration-200 cursor-pointer ${
                    activeTab === 'assign' ? 'bg-white text-black' : 'text-mono-gray-400 hover:text-white hover:bg-mono-gray-800'
                }`}
            >
              Link Items
            </button>
          </div>
        </div>

        {/* Alerts */}
        <AnimatePresence>
          {error && (
              <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-8 p-4 bg-black border-l-4 border-white/40 border border-mono-gray-800 text-white rounded-lg flex items-center gap-3 text-sm"
              >
                <FiAlertTriangle className="text-white shrink-0" size={18} />
                <span className="flex-1">{error}</span>
              </motion.div>
          )}
          {success && (
              <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-8 p-4 bg-white text-black rounded-lg flex items-center gap-3 text-sm font-semibold"
              >
                <FiCheck className="shrink-0" size={18} />
                <span className="flex-1">{success}</span>
              </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Panels */}
        <div className="mt-2">
          {/* TAB 1: QUIZZES */}
          {activeTab === 'quizzes' && (
              <div className="grid lg:grid-cols-5 gap-10">
                {/* Create Quiz Form */}
                <form onSubmit={handleCreateQuiz} className="lg:col-span-2 space-y-6">
                  <div className="flex items-center gap-3 pb-2">
                    <FiPlus size={20} className="text-white" />
                    <h3 className="text-xl font-display font-semibold text-white">Create New Quiz</h3>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-mono-gray-400 block">Quiz Title</label>
                    <input
                        type="text"
                        placeholder="Enter title (e.g. Spring Boot Basics)"
                        className="mono-input w-full"
                        value={quizTitle}
                        onChange={(e) => setQuizTitle(e.target.value)}
                        required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-mono-gray-400 block">Description</label>
                    <textarea
                        placeholder="Enter short quiz description..."
                        className="mono-input w-full min-h-[90px] resize-y"
                        value={quizDescription}
                        onChange={(e) => setQuizDescription(e.target.value)}
                        required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-mono-gray-400 block">Category</label>
                      <select
                          className="mono-input w-full bg-black"
                          value={quizCategory}
                          onChange={(e) => setQuizCategory(e.target.value)}
                      >
                        {categories.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-mono-gray-400 block">Difficulty</label>
                      <select
                          className="mono-input w-full bg-black"
                          value={quizDifficulty}
                          onChange={(e) => setQuizDifficulty(e.target.value)}
                      >
                        {difficulties.map((d) => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-mono-gray-400 block">Time Limit (Minutes)</label>
                    <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-mono-gray-500">
                    <FiClock size={16} />
                  </span>
                      <input
                          type="number"
                          min="1"
                          className="mono-input w-full pl-9"
                          value={quizTimeLimit}
                          onChange={(e) => setQuizTimeLimit(e.target.value)}
                          required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-mono-gray-400 block">Practice Sheet PDF URL (Optional)</label>
                    <input
                        type="url"
                        placeholder="https://example.com/practice.pdf"
                        className="mono-input w-full"
                        value={quizPdfUrl}
                        onChange={(e) => setQuizPdfUrl(e.target.value)}
                    />
                  </div>

                  <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-white text-black text-sm font-bold rounded-lg hover:bg-black hover:text-white hover:border-white border-2 border-white transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 mt-4"
                  >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <>Create Quiz</>
                    )}
                  </button>
                </form>

                {/* List Quizzes */}
                <div className="lg:col-span-3 space-y-5">
                  <div className="flex items-center justify-between pb-2">
                    <h3 className="text-xl font-display font-semibold text-white">Active Quizzes</h3>
                    <span className="text-sm text-mono-gray-400 bg-black px-3 py-1 rounded-full border border-mono-gray-800">
                  {quizzes.length} total
                </span>
                  </div>

                  <div className="space-y-4 max-h-[550px] overflow-y-auto pr-2 custom-scrollbar">
                    {quizzes.length > 0 ? (
                        quizzes.map((q) => (
                            <div
                                key={q.id}
                                className="p-5 bg-black border border-mono-gray-800 rounded-xl flex items-center justify-between hover:border-mono-gray-500 transition-all duration-200 group"
                            >
                              <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-extrabold bg-white text-black px-2 py-0.5 rounded uppercase tracking-wide">
                            {q.category}
                          </span>
                                  <span className="text-xs text-mono-gray-400 border border-mono-gray-700 px-2 py-0.5 rounded uppercase">
                            {q.difficulty}
                          </span>
                                  <span className="text-xs text-mono-gray-500 flex items-center gap-1 font-mono">
                            <FiClock size={12} /> {q.timeLimit || 30}m
                          </span>
                                </div>
                                <h4 className="text-base font-bold text-white leading-tight">{q.title}</h4>
                                <p className="text-sm text-mono-gray-400 max-w-md line-clamp-2">{q.description}</p>
                                <p className="text-xs text-mono-gray-500 font-mono">
                                  {q.questionCount || 0} question{q.questionCount !== 1 ? 's' : ''}
                                </p>
                              </div>

                              <button
                                  onClick={() => handleDeleteQuiz(q.id)}
                                  className="p-2.5 border border-mono-gray-800 group-hover:border-white text-mono-gray-400 group-hover:text-white rounded-lg transition-all duration-200 cursor-pointer opacity-0 group-hover:opacity-100"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-16 border-2 border-dashed border-mono-gray-800 rounded-xl">
                          <p className="text-mono-gray-400 text-sm">No quizzes created yet.</p>
                        </div>
                    )}
                  </div>
                </div>
              </div>
          )}

          {/* TAB 2: QUESTIONS */}
          {activeTab === 'questions' && (
              <div className="grid lg:grid-cols-5 gap-10">
                {/* Create Question Form */}
                <form onSubmit={handleCreateQuestion} className="lg:col-span-2 space-y-6">
                  <div className="flex items-center gap-3 pb-2">
                    <FiPlus size={20} className="text-white" />
                    <h3 className="text-xl font-display font-semibold text-white">Add New Question</h3>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-mono-gray-400 block">Question Content</label>
                    <textarea
                        placeholder="Enter the question text..."
                        className="mono-input w-full min-h-[80px] resize-y"
                        value={questText}
                        onChange={(e) => setQuestText(e.target.value)}
                        required
                    />
                  </div>

                  {/* Options grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-mono-gray-400 block">Option A</label>
                      <input
                          type="text"
                          placeholder="Choice A"
                          className="mono-input w-full text-sm"
                          value={questOptA}
                          onChange={(e) => setQuestOptA(e.target.value)}
                          required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-mono-gray-400 block">Option B</label>
                      <input
                          type="text"
                          placeholder="Choice B"
                          className="mono-input w-full text-sm"
                          value={questOptB}
                          onChange={(e) => setQuestOptB(e.target.value)}
                          required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-mono-gray-400 block">Option C</label>
                      <input
                          type="text"
                          placeholder="Choice C"
                          className="mono-input w-full text-sm"
                          value={questOptC}
                          onChange={(e) => setQuestOptC(e.target.value)}
                          required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-mono-gray-400 block">Option D</label>
                      <input
                          type="text"
                          placeholder="Choice D"
                          className="mono-input w-full text-sm"
                          value={questOptD}
                          onChange={(e) => setQuestOptD(e.target.value)}
                          required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-mono-gray-400 block">Correct Answer</label>
                    <select
                        className="mono-input w-full bg-black text-sm"
                        value={questCorrect}
                        onChange={(e) => setQuestCorrect(e.target.value)}
                    >
                      <option value="optionA">Option A</option>
                      <option value="optionB">Option B</option>
                      <option value="optionC">Option C</option>
                      <option value="optionD">Option D</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-mono-gray-400 block">Topic Area</label>
                    <input
                        type="text"
                        placeholder="e.g. Inheritance, Garbage Collection"
                        className="mono-input w-full text-sm"
                        value={questTopic}
                        onChange={(e) => setQuestTopic(e.target.value)}
                        required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-mono-gray-400 block">Category</label>
                      <select
                          className="mono-input w-full bg-black text-sm"
                          value={questCategory}
                          onChange={(e) => setQuestCategory(e.target.value)}
                      >
                        {categories.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-mono-gray-400 block">Difficulty</label>
                      <select
                          className="mono-input w-full bg-black text-sm"
                          value={questDifficulty}
                          onChange={(e) => setQuestDifficulty(e.target.value)}
                      >
                        {difficulties.map((d) => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-white text-black text-sm font-bold rounded-lg hover:bg-black hover:text-white hover:border-white border-2 border-white transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 mt-4"
                  >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <>Add Question</>
                    )}
                  </button>
                </form>

                {/* List Questions */}
                <div className="lg:col-span-3 space-y-5">
                  <div className="flex items-center justify-between pb-2">
                    <h3 className="text-xl font-display font-semibold text-white">Active Questions</h3>
                    <span className="text-sm text-mono-gray-400 bg-black px-3 py-1 rounded-full border border-mono-gray-800">
                  {questions.length} total
                </span>
                  </div>

                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {questions.length > 0 ? (
                        questions.map((q) => (
                            <div
                                key={q.id}
                                className="p-5 bg-black border border-mono-gray-800 rounded-xl hover:border-mono-gray-500 transition-all duration-200 group"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="space-y-3 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-extrabold bg-white text-black px-2 py-0.5 rounded uppercase tracking-wide">
                              {q.category}
                            </span>
                                    <span className="text-xs text-mono-gray-400 border border-mono-gray-700 px-2 py-0.5 rounded uppercase">
                              {q.difficulty}
                            </span>
                                    <span className="text-xs text-mono-gray-500 font-mono">
                              Topic: {q.topic}
                            </span>
                                  </div>
                                  <h4 className="text-sm font-semibold text-white leading-relaxed">{q.question}</h4>
                                  <div className="grid grid-cols-2 gap-2 text-xs text-mono-gray-400 font-mono">
                                    <div className={q.correctAnswer === 'optionA' ? 'text-white font-bold' : ''}>A: {q.optionA}</div>
                                    <div className={q.correctAnswer === 'optionB' ? 'text-white font-bold' : ''}>B: {q.optionB}</div>
                                    <div className={q.correctAnswer === 'optionC' ? 'text-white font-bold' : ''}>C: {q.optionC}</div>
                                    <div className={q.correctAnswer === 'optionD' ? 'text-white font-bold' : ''}>D: {q.optionD}</div>
                                  </div>
                                </div>

                                <button
                                    onClick={() => handleDeleteQuestion(q.id)}
                                    className="p-2.5 border border-mono-gray-800 group-hover:border-white text-mono-gray-400 group-hover:text-white rounded-lg transition-all duration-200 cursor-pointer shrink-0 opacity-0 group-hover:opacity-100"
                                >
                                  <FiTrash2 size={14} />
                                </button>
                              </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-16 border-2 border-dashed border-mono-gray-800 rounded-xl">
                          <p className="text-mono-gray-400 text-sm">No questions available. Add some using the creator form.</p>
                        </div>
                    )}
                  </div>
                </div>
              </div>
          )}

          {/* TAB 3: LINK ITEMS */}
          {activeTab === 'assign' && (
              <div className="max-w-3xl mx-auto py-8">
                <form onSubmit={handleLinkQuestion} className="bg-black border border-mono-gray-800 p-8 rounded-2xl space-y-8">
                  <div className="text-center space-y-3">
                    <FiLink className="text-white mx-auto" size={36} />
                    <h3 className="text-2xl font-display font-semibold text-white">Link Questions to Quizzes</h3>
                    <p className="text-mono-gray-400 text-sm">Select a quiz and choose a question to attach to it.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-mono-gray-400 block">1. Select Target Quiz</label>
                      <select
                          className="mono-input w-full bg-black text-base py-3"
                          value={selectedQuizId}
                          onChange={(e) => setSelectedQuizId(e.target.value)}
                          required
                      >
                        <option value="">-- Choose Quiz --</option>
                        {quizzes.map((q) => (
                            <option key={q.id} value={q.id}>
                              {q.title} ({q.category} | {q.difficulty})
                            </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-mono-gray-400 block">2. Select Question to Add</label>
                      <select
                          className="mono-input w-full bg-black text-base py-3"
                          value={selectedQuestionId}
                          onChange={(e) => setSelectedQuestionId(e.target.value)}
                          required
                      >
                        <option value="">-- Choose Question --</option>
                        {questions.map((q) => (
                            <option key={q.id} value={q.id}>
                              [{q.category} - {q.topic}] {q.question.substring(0, 60)}...
                            </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 bg-white text-black text-sm font-bold rounded-lg hover:bg-black hover:text-white hover:border-white border-2 border-white transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <>
                          <FiPlus size={16} /> Link Question to Quiz
                        </>
                    )}
                  </button>
                </form>
              </div>
          )}
        </div>

        {/* Custom scrollbar styles */}
        <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1a1a1a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
      </div>
  );
};

export default AdminPanel;
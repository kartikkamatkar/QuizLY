import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiSearch, FiBookOpen, FiClock, FiGrid, FiArrowRight, FiSliders } from 'react-icons/fi';
import api from '../api/axios';

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');

  // Include APTITUDE category
  const categories = ['ALL', 'JAVA', 'SPRING', 'REACT', 'DSA', 'DBMS', 'OS', 'CN', 'APTITUDE'];
  const difficulties = ['ALL', 'EASY', 'MEDIUM', 'HARD'];

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await api.get('/api/quizzes');
      setQuizzes(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      setLoading(false);
    }
  };

  // Filtering function
  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch = quiz.title?.toLowerCase().includes(search.toLowerCase()) ||
        quiz.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || quiz.category === categoryFilter;
    const matchesDifficulty = difficultyFilter === 'ALL' || quiz.difficulty === difficultyFilter;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
    );
  }

  return (
      <div className="min-h-screen pt-28 pb-20 px-6 sm:px-8 bg-black mono-grid-bg">
        <div className="max-w-7xl mx-auto">

          {/* Title and stats bar */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-5 mb-12 pb-7 border-b border-mono-gray-800">
            <div className="space-y-1.5">
              <h1 className="text-4xl sm:text-5xl font-display font-bold text-white tracking-tighter uppercase">
                Curriculum Quizzes
              </h1>
              <p className="text-mono-gray-400 text-sm">Select a topic to test your expertise and log attempts.</p>
            </div>

            <div className="text-sm font-semibold text-mono-gray-400 font-mono bg-black px-4 py-2 rounded-full border border-mono-gray-800">
              TOTAL POPULATED: <span className="text-white font-bold">{quizzes.length}</span>
            </div>
          </div>

          {/* Controls Block */}
          <div className="bg-mono-gray-900 border border-mono-gray-800 p-6 lg:p-8 rounded-2xl mb-10 space-y-7">
            <div className="flex flex-col md:flex-row gap-5 items-center justify-between">
              {/* Search Input */}
              <div className="relative w-full md:max-w-lg">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-mono-gray-500">
                <FiSearch size={18} />
              </span>
                <input
                    type="text"
                    placeholder="Search by quiz title or details..."
                    className="mono-input pl-10 py-3 w-full text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2.5 text-xs font-semibold text-mono-gray-400 font-mono uppercase bg-black px-3 py-1.5 rounded-lg border border-mono-gray-800">
                <FiSliders size={14} />
                Filters active: {categoryFilter !== 'ALL' || difficultyFilter !== 'ALL' ? 'Yes' : 'None'}
              </div>
            </div>

            <div className="space-y-5">
              {/* Categories Toggles */}
              <div className="space-y-2">
              <span className="text-[11px] font-bold text-mono-gray-400 font-mono uppercase tracking-wider block">
                Filter Category
              </span>
                <div className="flex flex-wrap gap-2.5">
                  {categories.map((cat) => (
                      <button
                          key={cat}
                          onClick={() => setCategoryFilter(cat)}
                          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-200 cursor-pointer ${
                              categoryFilter === cat
                                  ? 'bg-white text-black border-white'
                                  : 'bg-black text-mono-gray-400 border-mono-gray-800 hover:border-mono-gray-500 hover:text-white'
                          }`}
                      >
                        {cat}
                      </button>
                  ))}
                </div>
              </div>

              {/* Difficulties Toggles */}
              <div className="space-y-2">
              <span className="text-[11px] font-bold text-mono-gray-400 font-mono uppercase tracking-wider block">
                Filter Difficulty
              </span>
                <div className="flex flex-wrap gap-2.5">
                  {difficulties.map((diff) => (
                      <button
                          key={diff}
                          onClick={() => setDifficultyFilter(diff)}
                          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-200 cursor-pointer ${
                              difficultyFilter === diff
                                  ? 'bg-white text-black border-white'
                                  : 'bg-black text-mono-gray-400 border-mono-gray-800 hover:border-mono-gray-500 hover:text-white'
                          }`}
                      >
                        {diff}
                      </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quizzes Grid layout */}
          <AnimatePresence mode="popLayout">
            {quizzes.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-24 border border-mono-gray-800 rounded-3xl bg-mono-gray-900/20 backdrop-blur-sm p-10 max-w-2xl mx-auto"
                >
                  <div className="p-5 bg-mono-gray-900 border border-mono-gray-800 rounded-2xl mb-6 text-mono-gray-400 w-max mx-auto shadow-md">
                    <FiBookOpen size={32} />
                  </div>
                  <h3 className="text-2xl font-bold font-display text-white uppercase tracking-wider mb-2.5">No Quizzes Found</h3>
                  <p className="text-mono-gray-400 text-base mb-8 leading-relaxed">
                    The platform curriculum is currently empty. Start by logging in as an administrator to create quizzes manually, or head over to the AI Hub to generate high-quality quizzes instantly with AI!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                    <Link
                        to="/ai-hub"
                        className="w-full sm:w-auto px-8 py-4 bg-white text-black font-semibold rounded-lg hover:bg-black hover:text-white hover:border-white border-2 border-white transition-all duration-300 text-sm font-mono tracking-wider uppercase cursor-pointer"
                    >
                      Go to AI Hub Generator
                    </Link>
                  </div>
                </motion.div>
            ) : filteredQuizzes.length > 0 ? (
                <motion.div
                    layout
                    className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
                >
                  {filteredQuizzes.map((quiz, index) => (
                      <motion.div
                          key={quiz.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <Link
                            to={`/quiz/${quiz.id}`}
                            className="group block p-6 lg:p-7 bg-mono-gray-900 border border-mono-gray-800 rounded-2xl hover:border-white transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-full hover:shadow-[0_0_25px_rgba(255,255,255,0.1)]"
                        >
                          {/* Glow background accent */}
                          <div className="absolute -top-12 -right-12 w-24 h-24 bg-white/5 blur-2xl rounded-full group-hover:bg-white/10 transition-all duration-300" />

                          <div>
                            {/* Meta badges */}
                            <div className="flex items-center gap-2.5 mb-5">
                        <span className="text-[11px] bg-white text-black px-2.5 py-0.5 rounded font-extrabold tracking-wide uppercase font-sans">
                          {quiz.category}
                        </span>
                              <span className="text-[10px] text-mono-gray-400 border border-mono-gray-800 group-hover:border-mono-gray-600 px-2 py-0.5 rounded uppercase font-semibold">
                          {quiz.difficulty}
                        </span>
                            </div>

                            {/* Info */}
                            <h3 className="text-xl lg:text-2xl font-display font-bold text-white leading-tight mb-3 group-hover:underline decoration-2 underline-offset-4">
                              {quiz.title}
                            </h3>
                            <p className="text-sm text-mono-gray-400 line-clamp-3 mb-6 font-sans leading-relaxed">
                              {quiz.description}
                            </p>
                          </div>

                          <div className="border-t border-mono-gray-800/80 pt-5 flex items-center justify-between text-sm text-mono-gray-500 font-mono mt-auto">
                            <div className="flex items-center gap-1.5">
                              <FiBookOpen size={15} />
                              <span>{quiz.questionCount || 0} Questions</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <FiClock size={15} />
                              <span>{quiz.timeLimit || 30}m</span>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                  ))}
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20 border border-mono-gray-800 bg-mono-gray-900/10 rounded-3xl"
                >
                  <p className="text-mono-gray-400 text-base mb-5">No quizzes match your selected filter criteria.</p>
                  <button
                      onClick={() => { setCategoryFilter('ALL'); setDifficultyFilter('ALL'); setSearch(''); }}
                      className="px-5 py-2.5 border border-mono-gray-800 hover:border-white text-mono-gray-400 hover:text-white rounded-lg text-sm font-bold transition-all duration-200 cursor-pointer bg-mono-gray-900 hover:bg-black"
                  >
                    Clear Filters
                  </button>
                </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
  );
};

export default QuizList;
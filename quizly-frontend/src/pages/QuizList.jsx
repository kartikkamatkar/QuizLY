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
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-16 px-6 sm:px-8 bg-black mono-grid-bg">
      <div className="max-w-6xl mx-auto">
        
        {/* Title and stats bar */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-10 border-b border-mono-gray-800 pb-6">
          <div>
            <h1 className="text-4xl font-display font-bold text-white tracking-tight uppercase">
              Curriculum Quizzes
            </h1>
            <p className="text-mono-gray-400 text-xs mt-1">Select a topic to test your expertise and log attempts.</p>
          </div>
          
          <div className="text-xs font-semibold text-mono-gray-400 font-mono">
            TOTAL POPULATED: <span className="text-white font-bold">{quizzes.length}</span>
          </div>
        </div>

        {/* Controls Block */}
        <div className="bg-mono-gray-900 border border-mono-gray-800 p-6 rounded-2xl mb-8 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:max-w-md">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-mono-gray-500">
                <FiSearch size={18} />
              </span>
              <input
                type="text"
                placeholder="Search by quiz title or details..."
                className="mono-input pl-10 py-2.5"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 text-xs font-semibold text-mono-gray-400 font-mono uppercase">
              <FiSliders /> Filters active: {categoryFilter !== 'ALL' || difficultyFilter !== 'ALL' ? 'Yes' : 'None'}
            </div>
          </div>

          <div className="space-y-4">
            {/* Categories Toggles */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-mono-gray-400 font-mono uppercase tracking-wider block">
                Filter Category
              </span>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
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
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-mono-gray-400 font-mono uppercase tracking-wider block">
                Filter Difficulty
              </span>
              <div className="flex gap-2">
                {difficulties.map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficultyFilter(diff)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
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
          {filteredQuizzes.length > 0 ? (
            <motion.div
              layout
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
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
                    className="group block p-6 bg-mono-gray-900 border border-mono-gray-800 rounded-2xl hover:border-white transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-full hover:shadow-[0_0_25px_rgba(255,255,255,0.08)]"
                  >
                    {/* Glow background accent */}
                    <div className="absolute -top-12 -right-12 w-24 h-24 bg-white/5 blur-2xl rounded-full group-hover:bg-white/10 transition-colors" />

                    <div>
                      {/* Meta badges */}
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-[10px] bg-white text-black px-2 py-0.5 rounded font-extrabold tracking-wide uppercase font-sans">
                          {quiz.category}
                        </span>
                        <span className="text-[9px] text-mono-gray-400 border border-mono-gray-800 group-hover:border-mono-gray-600 px-1.5 py-0.5 rounded uppercase font-semibold">
                          {quiz.difficulty}
                        </span>
                      </div>

                      {/* Info */}
                      <h3 className="text-xl font-display font-bold text-white leading-snug mb-2 group-hover:underline">
                        {quiz.title}
                      </h3>
                      <p className="text-sm text-mono-gray-400 line-clamp-3 mb-6 font-sans">
                        {quiz.description}
                      </p>
                    </div>

                    <div className="border-t border-mono-gray-800/80 pt-4 flex items-center justify-between text-xs text-mono-gray-500 font-mono mt-auto">
                      <div className="flex items-center gap-1">
                        <FiBookOpen size={14} />
                        <span>{quiz.questionCount || 0} Questions</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiClock size={14} />
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
              className="text-center py-16 border border-dashed border-mono-gray-800 rounded-2xl"
            >
              <p className="text-mono-gray-400 text-sm">No quizzes match your selected filter criteria.</p>
              <button
                onClick={() => { setCategoryFilter('ALL'); setDifficultyFilter('ALL'); setSearch(''); }}
                className="mt-4 px-4 py-2 border border-mono-gray-800 hover:border-white text-mono-gray-400 hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer bg-mono-gray-900"
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

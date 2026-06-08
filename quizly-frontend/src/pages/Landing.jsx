import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiBookOpen, FiTerminal, FiShield } from 'react-icons/fi';

const Landing = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } },
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6 sm:px-8 bg-black flex flex-col items-center justify-center mono-grid-bg relative overflow-hidden">
      {/* Moving scanner grid line effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/10 animate-pulse" />

      {/* Decorative cyber wireframe elements */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/5 blur-3xl rounded-full" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-white/5 blur-3xl rounded-full" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto text-center z-10 flex flex-col items-center space-y-8"
      >
        {/* Banner Badge */}
        <motion.div
          variants={itemVariants}
          className="px-3.5 py-1.5 border border-mono-gray-700 bg-mono-gray-900 rounded-full flex items-center gap-2 w-max text-[10px] font-mono font-bold text-mono-gray-300 uppercase tracking-widest"
        >
          <FiTerminal className="text-white animate-pulse" /> SYSTEM VERSION 1.0.0 ONLINE
        </motion.div>

        {/* Brand Title */}
        <motion.h1
          variants={itemVariants}
          className="text-6xl sm:text-8xl font-display font-bold text-white tracking-tight uppercase leading-none"
        >
          QUIZ<span className="bg-white text-black px-3 rounded-2xl ml-1 border border-white hover:bg-black hover:text-white transition-colors duration-300">LY</span>
        </motion.h1>

        {/* Slogan */}
        <motion.p
          variants={itemVariants}
          className="text-mono-gray-400 text-lg sm:text-xl max-w-2xl font-sans leading-relaxed"
        >
          An interactive, high-contrast monochrome assessment engine. Track points, attempt curriculum exams, and master code details.
        </motion.p>

        {/* Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-4"
        >
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-3.5 bg-white text-black font-semibold rounded-lg hover:bg-black hover:text-white hover:border-white border border-white transition-all duration-300 flex items-center justify-center gap-2 text-xs font-mono font-bold tracking-wider"
          >
            <span>GET STARTED</span>
            <FiArrowRight size={14} />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-3.5 bg-black text-white hover:bg-white hover:text-black border border-mono-gray-800 hover:border-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-xs font-mono font-bold tracking-wider"
          >
            <span>SIGN IN</span>
          </Link>
        </motion.div>

        {/* Feature Preview Cards */}
        <motion.div
          variants={itemVariants}
          className="grid sm:grid-cols-3 gap-6 w-full pt-16 border-t border-mono-gray-800/80 mt-12 text-left"
        >
          <div className="p-6 bg-mono-gray-900 border border-mono-gray-800 rounded-2xl hover:border-mono-gray-500 transition-colors">
            <FiBookOpen className="text-white mb-3" size={20} />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Curriculum Tests</h3>
            <p className="text-xs text-mono-gray-400 font-sans leading-relaxed">
              Curated quizzes covering Java, Spring Boot, React, DSA, DBMS, and network concepts.
            </p>
          </div>
          <div className="p-6 bg-mono-gray-900 border border-mono-gray-800 rounded-2xl hover:border-mono-gray-500 transition-colors">
            <FiTerminal className="text-white mb-3" size={20} />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Realtime Scoring</h3>
            <p className="text-xs text-mono-gray-400 font-sans leading-relaxed">
              Instant feedback processing, scoring summaries, and attempt log synchronizations.
            </p>
          </div>
          <div className="p-6 bg-mono-gray-900 border border-mono-gray-800 rounded-2xl hover:border-mono-gray-500 transition-colors">
            <FiShield className="text-white mb-3" size={20} />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Competition</h3>
            <p className="text-xs text-mono-gray-400 font-sans leading-relaxed">
              Compete against other coders and register score ranks on the public leaderboard.
            </p>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default Landing;

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiBookOpen, FiTerminal, FiShield } from 'react-icons/fi';

const Landing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);
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
      <div className="min-h-screen pt-28 pb-20 px-6 sm:px-8 bg-black flex flex-col items-center justify-center mono-grid-bg relative overflow-hidden">
        {/* Moving scanner grid line effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-white/10 animate-pulse" />

        {/* Decorative cyber wireframe elements */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/5 blur-3xl rounded-full" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-white/5 blur-3xl rounded-full" />

        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-5xl mx-auto text-center z-10 flex flex-col items-center space-y-10"
        >
          {/* Banner Badge */}
          <motion.div
              variants={itemVariants}
              className="px-4 py-2 border border-mono-gray-700 bg-mono-gray-900 rounded-full flex items-center gap-2.5 w-max text-[11px] font-mono font-bold text-mono-gray-300 uppercase tracking-wider"
          >
            <FiTerminal className="text-white animate-pulse" size={14} /> SYSTEM VERSION 1.0.0 ONLINE
          </motion.div>

          {/* Brand Title */}
          <motion.h1
              variants={itemVariants}
              className="text-7xl sm:text-8xl md:text-9xl font-display font-bold text-white tracking-tighter uppercase leading-[1.1]"
          >
            QUIZ
            <span className="bg-white text-black px-4 md:px-6 py-1 rounded-3xl ml-3 border-2 border-white hover:bg-black hover:text-white transition-all duration-300 inline-block">
            LY
          </span>
          </motion.h1>

          {/* Slogan */}
          <motion.p
              variants={itemVariants}
              className="text-mono-gray-400 text-lg sm:text-xl md:text-2xl max-w-4xl font-sans leading-relaxed"
          >
            An interactive, high-contrast monochrome assessment engine. Track points, attempt curriculum exams, and master code details.
          </motion.p>

          {/* Buttons */}
          <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-5 items-center justify-center pt-6 w-full sm:w-auto"
          >
            <Link
                to="/register"
                className="w-full sm:w-auto px-12 py-5 bg-white text-black font-semibold rounded-xl hover:bg-black hover:text-white hover:border-white border-2 border-white transition-all duration-300 flex items-center justify-center gap-2.5 text-base font-mono font-bold tracking-wider group cursor-pointer"
            >
              <span>GET STARTED</span>
              <FiArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
            <Link
                to="/login"
                className="w-full sm:w-auto px-12 py-5 bg-black text-white hover:bg-white hover:text-black border-2 border-mono-gray-800 hover:border-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2.5 text-base font-mono font-bold tracking-wider cursor-pointer"
            >
              <span>SIGN IN</span>
            </Link>
          </motion.div>

          {/* Feature Preview Cards */}
          <motion.div
              variants={itemVariants}
              className="grid sm:grid-cols-3 gap-8 md:gap-10 w-full pt-20 border-t border-mono-gray-800/80 mt-14 text-left"
          >
            <div className="group p-10 bg-mono-gray-900 border border-mono-gray-800 rounded-2xl hover:border-mono-gray-500 transition-all duration-300 hover:shadow-lg">
              <FiBookOpen className="text-white mb-6" size={28} />
              <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-3.5">Curriculum Tests</h3>
              <p className="text-base text-mono-gray-400 font-sans leading-relaxed">
                Curated quizzes covering Java, Spring Boot, React, DSA, DBMS, and network concepts.
              </p>
            </div>

            <div className="group p-10 bg-mono-gray-900 border border-mono-gray-800 rounded-2xl hover:border-mono-gray-500 transition-all duration-300 hover:shadow-lg">
              <FiTerminal className="text-white mb-6" size={28} />
              <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-3.5">Realtime Scoring</h3>
              <p className="text-base text-mono-gray-400 font-sans leading-relaxed">
                Instant feedback processing, scoring summaries, and attempt log synchronizations.
              </p>
            </div>

            <div className="group p-10 bg-mono-gray-900 border border-mono-gray-800 rounded-2xl hover:border-mono-gray-500 transition-all duration-300 hover:shadow-lg">
              <FiShield className="text-white mb-6" size={28} />
              <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-3.5">Competition</h3>
              <p className="text-base text-mono-gray-400 font-sans leading-relaxed">
                Compete against other coders and register score ranks on the public leaderboard.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
  );
};

export default Landing;
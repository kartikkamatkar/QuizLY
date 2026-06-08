import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

const Landing = () => {
  return (
    <div className="min-h-screen pt-20 pb-12 px-4 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto text-center"
      >
        <h1 className="text-5xl font-bold mb-6">Welcome to QuizLY</h1>
        <p className="text-xl text-gray-400 mb-8">Learn. Practice. Improve. Master any subject with our intelligent quiz platform.</p>
        <div className="flex gap-4 justify-center">
          <Link to="/register" className="px-8 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition-all">Get Started</Link>
          <Link to="/login" className="px-8 py-3 border border-white rounded-lg font-semibold hover:bg-white hover:text-black transition-all">Sign In</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Landing;

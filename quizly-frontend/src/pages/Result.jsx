import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Result = () => {
  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <h1 className="text-4xl font-bold mb-8">Quiz Result</h1>
        <p className="text-gray-400 mb-8">Your quiz result will appear here</p>
        <Link to="/dashboard" className="px-6 py-2 bg-white text-black rounded-lg font-semibold hover:bg-gray-200">Back to Dashboard</Link>
      </motion.div>
    </div>
  );
};

export default Result;

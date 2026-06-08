import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const QuizTaking = () => {
  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <h1 className="text-4xl font-bold mb-8">Take Quiz</h1>
        <p className="text-gray-400">Quiz taking interface</p>
      </motion.div>
    </div>
  );
};

export default QuizTaking;

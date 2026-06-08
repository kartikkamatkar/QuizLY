import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
    setQuizzes([]);
  }, []);

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-4xl font-bold mb-8">Available Quizzes</h1>
        {quizzes.length === 0 ? (
          <p className="text-gray-400">No quizzes available yet.</p>
        ) : (
          <div className="grid gap-6">
            {quizzes.map((quiz) => (
              <Link key={quiz.id} to={`/quiz/${quiz.id}`} className="p-6 rounded-2xl border border-gray-800 hover:border-white transition-colors">
                <h3 className="text-xl font-semibold mb-2">{quiz.title}</h3>
                <p className="text-gray-400">{quiz.description}</p>
              </Link>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default QuizList;

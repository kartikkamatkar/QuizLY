import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiAward, FiTrendingUp, FiStar } from 'react-icons/fi';
import api from '../api/axios';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await api.get('/leaderboard');
      setLeaderboard(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLoading(false);
    }
  };

  const getMedalIcon = (position) => {
    switch(position) {
      case 1:
        return <FiStar className="text-yellow-400" size={24} />;
      case 2:
        return <FiStar className="text-gray-400" size={24} />;
      case 3:
        return <FiStar className="text-orange-400" size={24} />;
      default:
        return <span className="text-lg font-semibold text-gray-400">#{position}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center gap-3 mb-12">
            <FiAward className="text-white" size={32} />
            <h1 className="text-4xl sm:text-5xl font-bold">Leaderboard</h1>
          </div>

          <div className="space-y-3">
            {leaderboard.length > 0 ? (
              leaderboard.map((entry, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`p-6 rounded-2xl border transition-all duration-300 ${
                    index < 3 
                      ? 'border-white/30 bg-white/5' 
                      : 'border-gray-800 hover:border-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center justify-center w-12">
                        {getMedalIcon(index + 1)}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">{entry.userName}</h3>
                        <p className="text-gray-400 text-sm">
                          Avg Score: {entry.averageScore}%
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <FiTrendingUp className="text-green-400" />
                        <span className="text-2xl font-bold">{entry.totalScore}</span>
                      </div>
                      <p className="text-gray-400 text-sm">points</p>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400">No leaderboard data available</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Leaderboard;

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTrophy, FiUser, FiTrendingUp } from 'react-icons/fi';
import api from '../api/axios';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchLeaderboard();
  }, [filter]);

  const fetchLeaderboard = async () => {
    try {
      const response = await api.get(`/leaderboard?filter=${filter}`);
      setLeaderboard(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <FiTrophy className="text-yellow-400" size={24} />;
    if (rank === 2) return <FiTrophy className="text-gray-400" size={24} />;
    if (rank === 3) return <FiTrophy className="text-amber-600" size={24} />;
    return null;
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30';
    if (rank === 2) return 'bg-gray-400/20 text-gray-400 border-gray-400/30';
    if (rank === 3) return 'bg-amber-600/20 text-amber-600 border-amber-600/30';
    return 'bg-gray-800 text-gray-400';
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
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-white mb-4">
              <FiTrophy size={32} />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Leaderboard
            </h1>
            <p className="text-gray-400 text-lg">
              Top performers across all quizzes
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex justify-center gap-2 mb-8">
            {['all', 'weekly', 'monthly'].map((option) => (
              <button
                key={option}
                onClick={() => setFilter(option)}
                className={`px-4 py-2 rounded-lg capitalize transition-all duration-200 ${
                  filter === option
                    ? 'bg-white text-black'
                    : 'border border-gray-700 hover:border-white'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          {/* Leaderboard Table */}
          <div className="rounded-2xl border border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-800 bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Rank</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">User</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Score</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Quizzes Taken</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Avg. Score</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-b border-gray-800 hover:bg-white/5 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {getRankIcon(index + 1)}
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${getRankBadge(index + 1)}`}>
                            {index + 1}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                            <FiUser size={20} className="text-gray-400" />
                          </div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-lg font-semibold text-green-400">
                          {user.topScore}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {user.totalQuizzes}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FiTrendingUp size={16} className="text-blue-400" />
                          <span className="text-gray-300">{user.averageScore}%</span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {leaderboard.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">No data available for this period.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Leaderboard;
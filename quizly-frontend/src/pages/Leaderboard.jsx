import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiAward, FiTrendingUp, FiStar, FiUser, FiBarChart2 } from 'react-icons/fi';
import api from '../api/axios';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setCurrentUser(JSON.parse(userData));
      } catch (e) {
        console.error('Error parsing current user data', e);
      }
    }
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await api.get('/api/attempts/leaderboard');
      setLeaderboard(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      setLoading(false);
    }
  };

  const getCompetitorName = (userId) => {
    if (currentUser && currentUser.id === userId) {
      return `${currentUser.name} (You)`;
    }
    return `Quizzer #${userId}`;
  };

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
    );
  }

  // Get top 3 for medal display
  const topThree = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  return (
      <div className="min-h-screen pt-28 pb-20 px-6 sm:px-8 bg-black mono-grid-bg">
        <div className="max-w-5xl mx-auto">
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-3">
                <FiAward className="text-white" size={32} />
                <h1 className="text-4xl sm:text-5xl font-display font-bold text-white tracking-tight">
                  Leaderboard
                </h1>
              </div>
              <p className="text-mono-gray-400 text-sm">Top performers who've mastered the challenges</p>
            </div>

            {leaderboard.length > 0 ? (
                <>
                  {/* Top 3 Cards - Simplified Elegant Design */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {/* 2nd Place */}
                    {topThree[1] && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="order-2 md:order-1"
                        >
                          <div className="bg-mono-gray-900 border border-mono-gray-800 rounded-2xl p-6 text-center hover:border-mono-gray-600 transition-all duration-300">
                            <div className="mb-4">
                              <div className="w-16 h-16 mx-auto rounded-full bg-mono-gray-800 border-2 border-mono-gray-600 flex items-center justify-center mb-3">
                                <span className="text-2xl font-bold text-mono-gray-300">2</span>
                              </div>
                              <div className="w-12 h-12 mx-auto -mt-8 rounded-full bg-mono-gray-800 border border-mono-gray-600 flex items-center justify-center">
                                {topThree[1].userId === currentUser?.id ? (
                                    <FiUser size={20} className="text-white" />
                                ) : (
                                    <span className="text-xs font-bold text-mono-gray-300 uppercase">
                              {getCompetitorName(topThree[1].userId).charAt(0)}
                            </span>
                                )}
                              </div>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1">
                              {getCompetitorName(topThree[1].userId).split(' ')[0]}
                            </h3>
                            <p className="text-2xl font-bold text-mono-gray-300 mb-2">{topThree[1].totalScore} pts</p>
                            <span className="inline-block text-xs font-mono text-mono-gray-500">Silver Medal</span>
                          </div>
                        </motion.div>
                    )}

                    {/* 1st Place */}
                    {topThree[0] && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0 }}
                            className="order-1 md:order-2"
                        >
                          <div className="bg-white text-black rounded-2xl p-6 text-center shadow-xl transform md:scale-105">
                            <div className="mb-4">
                              <div className="w-20 h-20 mx-auto rounded-full bg-black border-4 border-white flex items-center justify-center mb-3">
                                <span className="text-3xl font-bold text-white">1</span>
                              </div>
                              <div className="w-14 h-14 mx-auto -mt-9 rounded-full bg-black border-2 border-white flex items-center justify-center">
                                {topThree[0].userId === currentUser?.id ? (
                                    <FiUser size={22} className="text-white" />
                                ) : (
                                    <span className="text-base font-bold text-white uppercase">
                              {getCompetitorName(topThree[0].userId).charAt(0)}
                            </span>
                                )}
                              </div>
                            </div>
                            <h3 className="text-xl font-bold text-black mb-1">
                              {getCompetitorName(topThree[0].userId).split(' ')[0]}
                            </h3>
                            <p className="text-3xl font-bold text-black mb-2">{topThree[0].totalScore} pts</p>
                            <span className="inline-block text-xs font-mono text-mono-gray-600 font-semibold">🥇 Gold Medal</span>
                          </div>
                        </motion.div>
                    )}

                    {/* 3rd Place */}
                    {topThree[2] && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="order-3"
                        >
                          <div className="bg-mono-gray-900 border border-mono-gray-800 rounded-2xl p-6 text-center hover:border-mono-gray-600 transition-all duration-300">
                            <div className="mb-4">
                              <div className="w-16 h-16 mx-auto rounded-full bg-mono-gray-800 border-2 border-mono-gray-600 flex items-center justify-center mb-3">
                                <span className="text-2xl font-bold text-mono-gray-300">3</span>
                              </div>
                              <div className="w-12 h-12 mx-auto -mt-8 rounded-full bg-mono-gray-800 border border-mono-gray-600 flex items-center justify-center">
                                {topThree[2].userId === currentUser?.id ? (
                                    <FiUser size={20} className="text-white" />
                                ) : (
                                    <span className="text-xs font-bold text-mono-gray-300 uppercase">
                              {getCompetitorName(topThree[2].userId).charAt(0)}
                            </span>
                                )}
                              </div>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1">
                              {getCompetitorName(topThree[2].userId).split(' ')[0]}
                            </h3>
                            <p className="text-2xl font-bold text-mono-gray-300 mb-2">{topThree[2].totalScore} pts</p>
                            <span className="inline-block text-xs font-mono text-mono-gray-500">Bronze Medal</span>
                          </div>
                        </motion.div>
                    )}
                  </div>

                  {/* Rest of Rankings - Clean Table Design */}
                  <div className="bg-mono-gray-900 border border-mono-gray-800 rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-mono-gray-800">
                      <h3 className="text-sm font-bold text-mono-gray-400 font-mono uppercase tracking-wider">
                        All Competitors
                      </h3>
                    </div>

                    <div className="divide-y divide-mono-gray-800">
                      {remaining.map((entry, index) => {
                        const isSelf = currentUser && currentUser.id === entry.userId;
                        const rank = index + 4;

                        return (
                            <motion.div
                                key={entry.userId}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.02 }}
                                className={`px-6 py-4 flex items-center justify-between transition-all duration-200 ${
                                    isSelf ? 'bg-white/5 border-l-4 border-white' : 'hover:bg-white/5'
                                }`}
                            >
                              <div className="flex items-center gap-4">
                          <span className={`w-8 text-center font-mono font-bold text-sm ${
                              isSelf ? 'text-white' : 'text-mono-gray-500'
                          }`}>
                            #{rank}
                          </span>
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold uppercase ${
                                      isSelf
                                          ? 'bg-white text-black'
                                          : 'bg-mono-gray-800 text-mono-gray-300'
                                  }`}>
                                    {isSelf ? 'U' : getCompetitorName(entry.userId).charAt(0)}
                                  </div>
                                  <span className={`text-sm ${isSelf ? 'text-white font-semibold' : 'text-mono-gray-300'}`}>
                              {getCompetitorName(entry.userId)}
                            </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 font-mono font-bold">
                                <FiTrendingUp size={14} className={isSelf ? 'text-white' : 'text-mono-gray-500'} />
                                <span className={isSelf ? 'text-white' : 'text-mono-gray-300'}>
                            {entry.totalScore} pts
                          </span>
                              </div>
                            </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Show if no remaining players */}
                  {remaining.length === 0 && topThree.length > 0 && (
                      <div className="text-center py-8 text-mono-gray-500 text-sm">
                        No other competitors yet
                      </div>
                  )}
                </>
            ) : (
                <div className="text-center py-20 border-2 border-dashed border-mono-gray-800 rounded-2xl">
                  <FiAward className="mx-auto mb-4 text-mono-gray-600" size={48} />
                  <p className="text-mono-gray-400 text-base mb-2">No standings available yet</p>
                  <p className="text-mono-gray-500 text-sm">Complete a quiz to appear on the leaderboard</p>
                </div>
            )}
          </motion.div>
        </div>
      </div>
  );
};

export default Leaderboard;
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiAward, FiTrendingUp, FiStar, FiUser } from 'react-icons/fi';
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
      // Prepend /api/attempts to match gateway paths
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
      return `YOU (${currentUser.name})`;
    }
    return `QUIZZER #${userId}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Split top 3 vs others
  const topThree = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  // Re-order top 3 for B&W pedestal display: [2nd, 1st, 3rd]
  const orderedPodium = [];
  if (topThree[1]) orderedPodium.push({ ...topThree[1], rank: 2 });
  if (topThree[0]) orderedPodium.push({ ...topThree[0], rank: 1 });
  if (topThree[2]) orderedPodium.push({ ...topThree[2], rank: 3 });

  return (
    <div className="min-h-screen pt-28 pb-16 px-6 sm:px-8 bg-black mono-grid-bg">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header title */}
          <div className="flex items-center justify-center gap-3.5 mb-14 text-center">
            <FiAward className="text-white" size={32} />
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-white tracking-widest uppercase">
              Standings
            </h1>
          </div>

          {leaderboard.length > 0 ? (
            <>
              {/* STARK WIREFRAME PODIUM (TOP 3) */}
              <div className="grid grid-cols-3 gap-4 items-end mb-16 max-w-2xl mx-auto border-b border-mono-gray-800 pb-2">
                
                {/* 2nd Place Pedestal */}
                {topThree[1] && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex flex-col items-center"
                  >
                    <span className="text-[10px] font-mono text-mono-gray-400 mb-2 font-bold">2ND PLACE</span>
                    <div className="w-8 h-8 rounded-full border border-mono-gray-600 bg-mono-gray-900 flex items-center justify-center text-xs text-mono-gray-300 font-bold uppercase mb-2">
                      {topThree[1].userId === currentUser?.id ? 'U' : 'Q'}
                    </div>
                    <span className="text-xs font-bold text-mono-gray-300 text-center max-w-[90px] truncate">
                      {getCompetitorName(topThree[1].userId).split(' ')[0]}
                    </span>
                    <span className="text-sm font-mono text-mono-gray-400 font-bold mb-3">
                      {topThree[1].totalScore} pts
                    </span>
                    
                    {/* Pedestar Column */}
                    <div className="w-full h-24 bg-mono-gray-900 border border-mono-gray-800 border-b-0 rounded-t-lg flex items-center justify-center">
                      <span className="text-xl font-display font-bold text-mono-gray-400">II</span>
                    </div>
                  </motion.div>
                )}

                {/* 1st Place Pedestal (Tallest, Centered) */}
                {topThree[0] && (
                  <motion.div
                    initial={{ opacity: 0, y: 35 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="flex flex-col items-center"
                  >
                    <FiStar className="text-white mb-1 animate-spin" style={{ animationDuration: '6s' }} size={20} />
                    <span className="text-[10px] font-mono text-white mb-2 font-bold">CHAMPION</span>
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-white text-black flex items-center justify-center text-sm font-extrabold uppercase mb-2">
                      {topThree[0].userId === currentUser?.id ? 'U' : 'Q'}
                    </div>
                    <span className="text-sm font-bold text-white text-center max-w-[110px] truncate">
                      {getCompetitorName(topThree[0].userId).split(' ')[0]}
                    </span>
                    <span className="text-base font-mono text-white font-extrabold mb-3">
                      {topThree[0].totalScore} pts
                    </span>
                    
                    {/* Pedestar Column */}
                    <div className="w-full h-36 bg-white border border-white rounded-t-lg flex items-center justify-center shadow-[0_-5px_30px_rgba(255,255,255,0.1)]">
                      <span className="text-2xl font-display font-bold text-black">I</span>
                    </div>
                  </motion.div>
                )}

                {/* 3rd Place Pedestal */}
                {topThree[2] && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col items-center"
                  >
                    <span className="text-[10px] font-mono text-mono-gray-400 mb-2 font-bold">3RD PLACE</span>
                    <div className="w-8 h-8 rounded-full border border-mono-gray-600 bg-mono-gray-900 flex items-center justify-center text-xs text-mono-gray-300 font-bold uppercase mb-2">
                      {topThree[2].userId === currentUser?.id ? 'U' : 'Q'}
                    </div>
                    <span className="text-xs font-bold text-mono-gray-300 text-center max-w-[90px] truncate">
                      {getCompetitorName(topThree[2].userId).split(' ')[0]}
                    </span>
                    <span className="text-sm font-mono text-mono-gray-400 font-bold mb-3">
                      {topThree[2].totalScore} pts
                    </span>
                    
                    {/* Pedestar Column */}
                    <div className="w-full h-16 bg-mono-gray-900 border border-mono-gray-800 border-b-0 rounded-t-lg flex items-center justify-center">
                      <span className="text-xl font-display font-bold text-mono-gray-400">III</span>
                    </div>
                  </motion.div>
                )}

              </div>

              {/* LIST TABLE (ALL OTHER COMPETITORS) */}
              <div className="bg-mono-gray-900 border border-mono-gray-800 rounded-2xl p-6 sm:p-8">
                <h3 className="text-xs font-bold text-mono-gray-400 font-mono uppercase tracking-wider mb-6">
                  Competitors Rank List
                </h3>

                <div className="space-y-2">
                  {leaderboard.map((entry, index) => {
                    const isSelf = currentUser && currentUser.id === entry.userId;
                    
                    return (
                      <motion.div
                        key={entry.userId}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${
                          isSelf
                            ? 'bg-white text-black border-white font-semibold'
                            : 'bg-black text-mono-gray-300 border-mono-gray-800 hover:border-mono-gray-500'
                        }`}
                      >
                        <div className="flex items-center gap-6">
                          <span className={`w-8 font-mono font-bold text-sm ${isSelf ? 'text-black' : 'text-mono-gray-400'}`}>
                            #{index + 1}
                          </span>
                          <div className="flex items-center gap-3">
                            <div className={`w-7 h-7 rounded-full border flex items-center justify-center text-[10px] font-bold uppercase ${
                              isSelf ? 'bg-black text-white border-black' : 'bg-mono-gray-900 text-white border-mono-gray-700'
                            }`}>
                              {isSelf ? 'U' : 'Q'}
                            </div>
                            <span className={`text-sm ${isSelf ? 'font-bold' : 'font-semibold'}`}>
                              {getCompetitorName(entry.userId)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 font-mono text-sm font-bold">
                          <FiTrendingUp className={isSelf ? 'text-black' : 'text-mono-gray-400'} size={14} />
                          <span>{entry.totalScore} pts</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-20 border border-dashed border-mono-gray-800 rounded-2xl">
              <p className="text-mono-gray-400 text-sm">Standings database is empty. Complete a test sequence to register.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Leaderboard;

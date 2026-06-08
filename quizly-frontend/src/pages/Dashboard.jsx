import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrendingUp, FiAward, FiActivity, FiArrowRight, FiShield, FiUser, FiUsers, FiPlus, FiHash } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import AdminPanel from '../component/AdminPanel';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdminView, setIsAdminView] = useState(false);

  // Multiplayer Lobby Creation States
  const [lobbyTitle, setLobbyTitle] = useState('');
  const [lobbyCategory, setLobbyCategory] = useState('JAVA');
  const [lobbyTimeLimit, setLobbyTimeLimit] = useState(15);
  const [lobbyQCount, setLobbyQCount] = useState(10);
  const [lobbyLoading, setLobbyLoading] = useState(false);

  // Quick Join State
  const [joinRoomCode, setJoinRoomCode] = useState('');

  const categories = ['JAVA', 'SPRING', 'REACT', 'DSA', 'DBMS', 'OS', 'CN', 'APTITUDE'];

  useEffect(() => {
    // Load user profile
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchDashboardData(parsedUser.id);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchDashboardData = async (userId) => {
    try {
      // 1. Fetch user attempts
      const attemptsResponse = await api.get(`/api/attempts/dashboard/user/${userId}`);
      setAttempts(attemptsResponse.data);

      // 2. Fetch all quizzes to perform a client-side join (quizId -> title)
      const quizzesResponse = await api.get('/api/quizzes');
      setQuizzes(quizzesResponse.data);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard statistics:', error);
      setLoading(false);
    }
  };

  const getQuizTitle = (quizId) => {
    const quiz = quizzes.find((q) => q.id === quizId);
    return quiz ? quiz.title : `Quiz #${quizId}`;
  };

  const getQuizCategory = (quizId) => {
    const quiz = quizzes.find((q) => q.id === quizId);
    return quiz ? quiz.category : 'N/A';
  };

  const handleCreateLobby = async (e) => {
    e.preventDefault();
    if (!lobbyTitle) return;
    
    setLobbyLoading(true);
    try {
      // Create Lobby: POST /api/competitions
      const response = await api.post('/api/competitions', {
        title: lobbyTitle,
        category: lobbyCategory,
        questionCount: parseInt(lobbyQCount),
        timeLimit: parseInt(lobbyTimeLimit),
        hostUserId: user.id,
        hostUserName: user.name
      });
      
      const comp = response.data;
      navigate(`/lobby/${comp.roomCode}`);
    } catch (err) {
      alert(err.response?.data || 'Failed to create lobby room.');
    } finally {
      setLobbyLoading(false);
    }
  };

  const handleJoinLobby = (e) => {
    e.preventDefault();
    if (!joinRoomCode) return;
    navigate(`/lobby/${joinRoomCode.trim().toUpperCase()}`);
  };

  // Stats calculations
  const totalAttempts = attempts.length;
  const totalPoints = attempts.reduce((acc, curr) => acc + (curr.score || 0), 0);
  const avgPercentage = totalAttempts > 0 
    ? Math.round(
        (attempts.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions), 0) / totalAttempts) * 100
      )
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-center px-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-white mb-4">Access Denied</h2>
          <p className="text-mono-gray-400 mb-6">You must be signed in to access the dashboard.</p>
          <Link to="/login" className="mono-btn-primary mx-auto">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-16 px-6 sm:px-8 bg-black mono-grid-bg">
      <div className="max-w-6xl mx-auto">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6 mb-12 border-b border-mono-gray-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] uppercase font-bold text-mono-gray-400 font-mono tracking-widest">
                Welcome Workspace
              </span>
              {user.role === 'ADMIN' && (
                <span className="text-[9px] font-extrabold text-black bg-white px-1.5 py-0.5 rounded flex items-center gap-0.5 uppercase">
                  <FiShield size={10} /> Admin Privilege
                </span>
              )}
            </div>
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-white tracking-tight uppercase">
              Hello, {user.name.split(' ')[0]}
            </h1>
          </div>

          {/* Admin Toggle Switch */}
          {user.role === 'ADMIN' && (
            <button
              onClick={() => setIsAdminView(!isAdminView)}
              className="flex items-center gap-2 px-5 py-3 rounded-lg border border-mono-gray-800 hover:border-white text-xs font-bold transition-all cursor-pointer bg-mono-gray-900 text-white"
            >
              {isAdminView ? (
                <>
                  <FiUser size={14} /> View User Dashboard
                </>
              ) : (
                <>
                  <FiShield size={14} /> Open Admin Panel
                </>
              )}
            </button>
          )}
        </div>

        {/* Dashboard Panels */}
        <AnimatePresence mode="wait">
          {isAdminView && user.role === 'ADMIN' ? (
            <motion.div
              key="admin-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <AdminPanel />
            </motion.div>
          ) : (
            <motion.div
              key="user-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-12"
            >
              {/* Statistic Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* CARD 1 */}
                <div className="p-6 bg-mono-gray-900 border border-mono-gray-800 hover:border-white rounded-2xl flex items-center gap-5 transition-colors group">
                  <div className="w-12 h-12 border border-mono-gray-800 group-hover:border-white rounded-xl flex items-center justify-center text-mono-gray-400 group-hover:text-white transition-colors">
                    <FiActivity size={20} />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-mono-gray-400 uppercase tracking-wide">Quizzes Completed</h3>
                    <p className="text-3xl font-display font-bold text-white mt-1">{totalAttempts}</p>
                  </div>
                </div>

                {/* CARD 2 */}
                <div className="p-6 bg-mono-gray-900 border border-mono-gray-800 hover:border-white rounded-2xl flex items-center gap-5 transition-colors group">
                  <div className="w-12 h-12 border border-mono-gray-800 group-hover:border-white rounded-xl flex items-center justify-center text-mono-gray-400 group-hover:text-white transition-colors">
                    <FiAward size={20} />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-mono-gray-400 uppercase tracking-wide">Total Score Points</h3>
                    <p className="text-3xl font-display font-bold text-white mt-1">{totalPoints}</p>
                  </div>
                </div>

                {/* CARD 3 */}
                <div className="p-6 bg-mono-gray-900 border border-mono-gray-800 hover:border-white rounded-2xl flex items-center gap-5 transition-colors group">
                  <div className="w-12 h-12 border border-mono-gray-800 group-hover:border-white rounded-xl flex items-center justify-center text-mono-gray-400 group-hover:text-white transition-colors">
                    <FiTrendingUp size={20} />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-mono-gray-400 uppercase tracking-wide">Average Percentage</h3>
                    <p className="text-3xl font-display font-bold text-white mt-1">{avgPercentage}%</p>
                  </div>
                </div>
              </div>

              {/* Two Column Section: Left: History Logs, Right: Multiplayer Lobby tools */}
              <div className="grid lg:grid-cols-3 gap-8">
                
                {/* LEFT: History Logs (Col span 2) */}
                <div className="lg:col-span-2 bg-mono-gray-900 border border-mono-gray-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                      <div>
                        <h2 className="text-xl font-display font-bold text-white">Your Attempt History</h2>
                        <p className="text-mono-gray-400 text-xs mt-1">Review your score achievements on previous tests.</p>
                      </div>
                      <Link
                        to="/quizzes"
                        className="flex items-center gap-1.5 text-xs font-semibold text-white hover:underline shrink-0 font-mono"
                      >
                        <span>BROWSE QUIZZES</span>
                        <FiArrowRight size={14} />
                      </Link>
                    </div>

                    <div className="overflow-x-auto">
                      {attempts.length > 0 ? (
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-mono-gray-800 text-[10px] uppercase text-mono-gray-400 tracking-wider font-mono">
                              <th className="pb-3 pl-2">Category</th>
                              <th className="pb-3">Quiz Name</th>
                              <th className="pb-3">Submit Date</th>
                              <th className="pb-3 text-right pr-6">Score</th>
                              <th className="pb-3 text-right pr-2">Accuracy</th>
                            </tr>
                          </thead>
                          <tbody>
                            {attempts.map((attempt) => {
                              const percent = Math.round((attempt.score / attempt.totalQuestions) * 100);
                              return (
                                <tr
                                  key={attempt.id}
                                  className="border-b border-mono-gray-800/50 hover:bg-white/5 transition-colors text-sm"
                                >
                                  <td className="py-4 pl-2 font-semibold text-white">
                                    <span className="text-[10px] bg-white text-black px-1.5 py-0.5 rounded font-extrabold font-sans uppercase">
                                      {getQuizCategory(attempt.quizId)}
                                    </span>
                                  </td>
                                  <td className="py-4 font-semibold text-white">
                                    {getQuizTitle(attempt.quizId)}
                                  </td>
                                  <td className="py-4 text-mono-gray-400 text-xs font-mono">
                                    {new Date(attempt.submittedAt).toLocaleDateString(undefined, {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                    })}
                                  </td>
                                  <td className="py-4 text-right pr-6 font-mono font-bold text-white">
                                    {attempt.score} / {attempt.totalQuestions}
                                  </td>
                                  <td className="py-4 text-right pr-2">
                                    <span className={`inline-block font-mono font-semibold px-2 py-0.5 rounded text-xs ${
                                      percent >= 80 
                                        ? 'bg-white text-black font-extrabold border border-white' 
                                        : percent >= 50 
                                          ? 'text-white border border-mono-gray-600' 
                                          : 'text-mono-gray-500 border border-mono-gray-800'
                                    }`}>
                                      {percent}%
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      ) : (
                        <div className="text-center py-12 border border-dashed border-mono-gray-800 rounded-xl">
                          <p className="text-mono-gray-400 text-sm">You haven't attempted any quizzes yet.</p>
                          <Link
                            to="/quizzes"
                            className="mt-4 inline-flex px-5 py-2.5 bg-white text-black hover:bg-black hover:text-white border border-white rounded-lg text-xs font-bold transition-all cursor-pointer font-mono"
                          >
                            START FIRST SEQUENCE
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT: Multiplayer Arena (Col span 1) */}
                <div className="space-y-6">
                  {/* Join Room Box */}
                  <div className="p-6 bg-mono-gray-900 border border-mono-gray-800 rounded-2xl space-y-4">
                    <h3 className="text-sm font-bold font-display text-white uppercase tracking-wider flex items-center gap-2">
                      <FiHash /> Join Match Code
                    </h3>
                    <form onSubmit={handleJoinLobby} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="ENTER ROOM CODE"
                        maxLength={6}
                        className="mono-input py-2.5 text-xs font-mono font-bold text-center tracking-widest uppercase"
                        value={joinRoomCode}
                        onChange={(e) => setJoinRoomCode(e.target.value)}
                        required
                      />
                      <button
                        type="submit"
                        className="px-4 bg-white text-black font-semibold rounded-lg hover:bg-black hover:text-white border border-white text-xs transition-colors cursor-pointer"
                      >
                        JOIN
                      </button>
                    </form>
                  </div>

                  {/* Create Room Box */}
                  <form onSubmit={handleCreateLobby} className="p-6 bg-mono-gray-900 border border-mono-gray-800 rounded-2xl space-y-4">
                    <h3 className="text-sm font-bold font-display text-white uppercase tracking-wider flex items-center gap-2">
                      <FiUsers /> Create Tournament
                    </h3>

                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-mono-gray-400">Championship Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Speed OOP Java Match"
                        className="mono-input py-2 text-xs"
                        value={lobbyTitle}
                        onChange={(e) => setLobbyTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-mono-gray-400">Select Module</label>
                      <select
                        className="mono-input bg-black py-2 text-xs"
                        value={lobbyCategory}
                        onChange={(e) => setLobbyCategory(e.target.value)}
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-mono-gray-400">Questions count</label>
                        <select
                          className="mono-input bg-black py-2 text-xs"
                          value={lobbyQCount}
                          onChange={(e) => setLobbyQCount(e.target.value)}
                        >
                          <option value="5">5 Qs</option>
                          <option value="10">10 Qs</option>
                          <option value="15">15 Qs</option>
                          <option value="20">20 Qs</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-mono-gray-400">Time Limit</label>
                        <select
                          className="mono-input bg-black py-2 text-xs"
                          value={lobbyTimeLimit}
                          onChange={(e) => setLobbyTimeLimit(e.target.value)}
                        >
                          <option value="5">5m limit</option>
                          <option value="10">10m limit</option>
                          <option value="15">15m limit</option>
                          <option value="20">20m limit</option>
                          <option value="30">30m limit</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={lobbyLoading}
                      className="w-full py-2.5 bg-white text-black hover:bg-black hover:text-white border border-white font-bold rounded-lg text-xs tracking-wider uppercase font-mono transition-all duration-300 flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {lobbyLoading ? (
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <FiPlus size={12} />
                          <span>CREATE ROOM</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Dashboard;

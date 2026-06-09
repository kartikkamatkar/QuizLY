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
          <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
    );
  }

  if (!user) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-center px-6">
          <div className="max-w-md">
            <h2 className="text-3xl font-bold font-display text-white mb-4">Access Denied</h2>
            <p className="text-mono-gray-400 text-base mb-8">You must be signed in to access the dashboard.</p>
            <Link to="/login" className="mono-btn-primary mx-auto inline-block">Sign In</Link>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen pt-28 pb-20 px-6 sm:px-8 bg-black mono-grid-bg">
        <div className="max-w-7xl mx-auto">
          {/* Header Block */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6 mb-12 pb-8 border-b border-mono-gray-800">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
              <span className="text-xs uppercase font-bold text-mono-gray-400 font-mono tracking-wider">
                Welcome Workspace
              </span>
                {user.role === 'ADMIN' && (
                    <span className="text-[10px] font-extrabold text-black bg-white px-2 py-0.5 rounded flex items-center gap-1.5 uppercase">
                  <FiShield size={11} /> Admin Privilege
                </span>
                )}
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white tracking-tight uppercase">
                Hello, {user.name.split(' ')[0]}
              </h1>
            </div>

            {/* Admin Toggle Switch */}
            {user.role === 'ADMIN' && (
                <button
                    onClick={() => setIsAdminView(!isAdminView)}
                    className="flex items-center gap-2.5 px-6 py-3.5 rounded-lg border border-mono-gray-800 hover:border-white text-sm font-bold transition-all duration-200 cursor-pointer bg-mono-gray-900 text-white hover:bg-mono-gray-800"
                >
                  {isAdminView ? (
                      <>
                        <FiUser size={16} /> View User Dashboard
                      </>
                  ) : (
                      <>
                        <FiShield size={16} /> Open Admin Panel
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
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  <AdminPanel />
                </motion.div>
            ) : (
                <motion.div
                    key="user-view"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="space-y-14"
                >
                  {/* Statistic Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
                    {/* CARD 1 */}
                    <div className="group p-7 bg-mono-gray-900 border border-mono-gray-800 hover:border-mono-gray-500 rounded-2xl flex items-center gap-6 transition-all duration-200 hover:shadow-lg">
                      <div className="w-14 h-14 border border-mono-gray-800 group-hover:border-white rounded-xl flex items-center justify-center text-mono-gray-400 group-hover:text-white transition-all duration-200">
                        <FiActivity size={22} />
                      </div>
                      <div>
                        <h3 className="text-xs font-semibold text-mono-gray-400 uppercase tracking-wider mb-1">Quizzes Completed</h3>
                        <p className="text-4xl font-display font-bold text-white">{totalAttempts}</p>
                      </div>
                    </div>

                    {/* CARD 2 */}
                    <div className="group p-7 bg-mono-gray-900 border border-mono-gray-800 hover:border-mono-gray-500 rounded-2xl flex items-center gap-6 transition-all duration-200 hover:shadow-lg">
                      <div className="w-14 h-14 border border-mono-gray-800 group-hover:border-white rounded-xl flex items-center justify-center text-mono-gray-400 group-hover:text-white transition-all duration-200">
                        <FiAward size={22} />
                      </div>
                      <div>
                        <h3 className="text-xs font-semibold text-mono-gray-400 uppercase tracking-wider mb-1">Total Score Points</h3>
                        <p className="text-4xl font-display font-bold text-white">{totalPoints}</p>
                      </div>
                    </div>

                    {/* CARD 3 */}
                    <div className="group p-7 bg-mono-gray-900 border border-mono-gray-800 hover:border-mono-gray-500 rounded-2xl flex items-center gap-6 transition-all duration-200 hover:shadow-lg">
                      <div className="w-14 h-14 border border-mono-gray-800 group-hover:border-white rounded-xl flex items-center justify-center text-mono-gray-400 group-hover:text-white transition-all duration-200">
                        <FiTrendingUp size={22} />
                      </div>
                      <div>
                        <h3 className="text-xs font-semibold text-mono-gray-400 uppercase tracking-wider mb-1">Average Percentage</h3>
                        <p className="text-4xl font-display font-bold text-white">{avgPercentage}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Two Column Section: Left: History Logs, Right: Multiplayer Lobby tools */}
                  <div className="grid lg:grid-cols-3 gap-8">

                    {/* LEFT: History Logs (Col span 2) */}
                    <div className="lg:col-span-2 bg-mono-gray-900 border border-mono-gray-800 rounded-2xl p-6 sm:p-8 lg:p-10">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-8">
                        <div className="space-y-1.5">
                          <h2 className="text-2xl font-display font-bold text-white">Your Attempt History</h2>
                          <p className="text-mono-gray-400 text-sm">Review your score achievements on previous tests.</p>
                        </div>
                        <Link
                            to="/quizzes"
                            className="flex items-center gap-2 text-sm font-semibold text-white hover:underline transition-all duration-200 shrink-0 group"
                        >
                          <span>Browse Quizzes</span>
                          <FiArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
                        </Link>
                      </div>

                      <div className="overflow-x-auto">
                        {attempts.length > 0 ? (
                            <table className="w-full text-left border-collapse min-w-[600px]">
                              <thead>
                              <tr className="border-b border-mono-gray-800 text-xs uppercase text-mono-gray-400 tracking-wider font-mono">
                                <th className="pb-4 pl-3 font-semibold">Category</th>
                                <th className="pb-4 font-semibold">Quiz Name</th>
                                <th className="pb-4 font-semibold">Submit Date</th>
                                <th className="pb-4 text-right pr-7 font-semibold">Score</th>
                                <th className="pb-4 text-right pr-3 font-semibold">Accuracy</th>
                              </tr>
                              </thead>
                              <tbody>
                              {attempts.map((attempt, index) => {
                                const percent = Math.round((attempt.score / attempt.totalQuestions) * 100);
                                return (
                                    <motion.tr
                                        key={attempt.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05, duration: 0.2 }}
                                        className="border-b border-mono-gray-800/50 hover:bg-white/5 transition-all duration-200 text-sm"
                                    >
                                      <td className="py-5 pl-3 font-semibold text-white">
                                  <span className="text-[11px] bg-white text-black px-2 py-0.5 rounded font-extrabold font-sans uppercase">
                                    {getQuizCategory(attempt.quizId)}
                                  </span>
                                      </td>
                                      <td className="py-5 font-semibold text-white">
                                        {getQuizTitle(attempt.quizId)}
                                      </td>
                                      <td className="py-5 text-mono-gray-400 text-xs font-mono">
                                        {new Date(attempt.submittedAt).toLocaleDateString(undefined, {
                                          year: 'numeric',
                                          month: 'short',
                                          day: 'numeric',
                                        })}
                                      </td>
                                      <td className="py-5 text-right pr-7 font-mono font-bold text-white">
                                        {attempt.score} / {attempt.totalQuestions}
                                      </td>
                                      <td className="py-5 text-right pr-3">
                                  <span className={`inline-block font-mono font-semibold px-2.5 py-1 rounded text-xs ${
                                      percent >= 80
                                          ? 'bg-white text-black font-extrabold border border-white'
                                          : percent >= 50
                                              ? 'text-white border border-mono-gray-600'
                                              : 'text-mono-gray-500 border border-mono-gray-800'
                                  }`}>
                                    {percent}%
                                  </span>
                                      </td>
                                    </motion.tr>
                                );
                              })}
                              </tbody>
                            </table>
                        ) : (
                            <div className="text-center py-16 border-2 border-dashed border-mono-gray-800 rounded-xl">
                              <p className="text-mono-gray-400 text-base mb-4">You haven't attempted any quizzes yet.</p>
                              <Link
                                  to="/quizzes"
                                  className="inline-flex px-6 py-3 bg-white text-black hover:bg-black hover:text-white border-2 border-white rounded-lg text-sm font-bold transition-all duration-200 cursor-pointer"
                              >
                                Start Your First Quiz
                              </Link>
                            </div>
                        )}
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
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiZap, FiClock, FiAward, FiShield, FiTrendingUp, FiAlertTriangle, FiBookOpen } from 'react-icons/fi';
import api from '../api/axios';

const Competitions = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState({ h: 3, m: 24, s: 45 });

  useEffect(() => {
    fetchQuizzesAndLeaderboard();

    // Live countdown timer for the upcoming tournament
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.s > 0) return { ...prev, s: prev.s - 1 };
        if (prev.m > 0) return { ...prev, m: prev.m - 1, s: 59 };
        if (prev.h > 0) return { h: prev.h - 1, m: 59, s: 59 };
        clearInterval(timer);
        return { h: 0, m: 0, s: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchQuizzesAndLeaderboard = async () => {
    try {
      // 1. Load available quizzes
      const quizzesResponse = await api.get('/api/quizzes');
      setQuizzes(quizzesResponse.data);

      // 2. Load leaderboard standings
      const leaderboardResponse = await api.get('/api/attempts/leaderboard');
      setLeaderboard(leaderboardResponse.data.slice(0, 3)); // Only top 3 for dashboard

      setLoading(false);
    } catch (error) {
      console.error('Error fetching arena data:', error);
      setLoading(false);
    }
  };

  const handleEnterArena = async (category) => {
    // Locate the seeded quiz matching this category
    const targetQuiz = quizzes.find((q) => q.category === category);
    if (!targetQuiz) {
      alert(`Quiz for category ${category} is not yet seeded or active in the database.`);
      return;
    }

    try {
      const response = await api.get(`/api/quizzes/${targetQuiz.id}/start`);
      // Start the quiz with location state
      navigate(`/quiz/take/${targetQuiz.id}`, { state: { quizSession: response.data } });
    } catch (error) {
      console.error('Error entering tournament arena:', error);
      alert('Could not start tournament. Ensure backend services are online.');
    }
  };

  const formatCountdown = () => {
    const pad = (n) => n.toString().padStart(2, '0');
    return `${pad(countdown.h)}:${pad(countdown.m)}:${pad(countdown.s)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Active tourney lists
  const tournaments = [
    {
      id: 'dsa-gp',
      title: 'Algorithm Grand Prix',
      category: 'DSA',
      desc: 'Speed traversal of sorting, graph logic, and Dynamic Programming arrays.',
      difficulty: 'HARD',
      timeLimit: 30,
      reward: '200 Pts + Champion Badge'
    },
    {
      id: 'java-bytecode',
      title: 'Java JVM Bytecode Cup',
      category: 'JAVA',
      desc: 'Deep dive into concurrent locks, JIT compilers, GC generational collection, and reference variables.',
      difficulty: 'MEDIUM',
      timeLimit: 20,
      reward: '150 Pts + Compiler Specialist'
    },
    {
      id: 'sql-championship',
      title: 'Advanced SQL Query Cup',
      category: 'DBMS',
      desc: 'Stark evaluation of B+ Tree index scans, 3NF schema, joins, and group aggregation HAVING clauses.',
      difficulty: 'MEDIUM',
      timeLimit: 20,
      reward: '120 Pts + DB Architect'
    },
    {
      id: 'aptitude-sprint',
      title: 'Aptitude Logical Speedrun',
      category: 'APTITUDE',
      desc: 'Speed quantitative and deduction sprint covering ratios, percentages, sequences, and statistics.',
      difficulty: 'EASY',
      timeLimit: 20,
      reward: '100 Pts + Analytical Lead'
    }
  ];

  return (
    <div className="min-h-screen pt-28 pb-16 px-6 sm:px-8 bg-black mono-grid-bg">
      <div className="max-w-6xl mx-auto">
        
        {/* Arena Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-12 border-b border-mono-gray-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span className="text-[10px] uppercase font-bold text-white font-mono tracking-widest">
                Arena Status: ACTIVE SESSIONS
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-white tracking-tight uppercase">
              Championships
            </h1>
          </div>

          {/* Next cup countdown widget */}
          <div className="p-4 bg-mono-gray-900 border border-mono-gray-800 rounded-2xl flex items-center gap-4 shrink-0">
            <div>
              <span className="text-[9px] font-bold text-mono-gray-500 font-mono block uppercase">NEXT ARENA UNLOCKS IN</span>
              <span className="text-xl font-mono font-bold text-white tracking-wider mt-0.5 block">{formatCountdown()}</span>
            </div>
            <div className="w-10 h-10 border border-mono-gray-800 rounded-xl flex items-center justify-center text-white bg-black animate-pulse">
              <FiZap size={18} />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          
          {/* LEFT: Live Arenas grid (Col span 3) */}
          <div className="lg:col-span-3 space-y-6">
            <h2 className="text-lg font-display font-bold text-white uppercase tracking-wider mb-2">
              Live Arena Sprints
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {tournaments.map((t) => (
                <div
                  key={t.id}
                  className="group p-6 bg-mono-gray-900 border border-mono-gray-800 hover:border-white rounded-2xl flex flex-col justify-between hover:shadow-[0_0_20px_rgba(255,255,255,0.06)] transition-all duration-300 relative overflow-hidden"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] bg-white text-black px-2 py-0.5 rounded font-extrabold font-sans uppercase">
                        {t.category}
                      </span>
                      <span className="text-[9px] text-mono-gray-400 border border-mono-gray-800 group-hover:border-mono-gray-700 px-1.5 py-0.5 rounded uppercase font-semibold">
                        {t.difficulty}
                      </span>
                    </div>

                    <h3 className="text-lg font-display font-bold text-white group-hover:underline">
                      {t.title}
                    </h3>
                    <p className="text-xs text-mono-gray-400 leading-relaxed mt-2 mb-6">
                      {t.desc}
                    </p>
                  </div>

                  <div className="border-t border-mono-gray-800/80 pt-4 flex flex-col gap-3">
                    <div className="flex justify-between items-center text-[10px] text-mono-gray-500 font-mono">
                      <span className="flex items-center gap-1"><FiClock /> {t.timeLimit}m duration</span>
                      <span>Reward: {t.reward}</span>
                    </div>
                    
                    <button
                      onClick={() => handleEnterArena(t.category)}
                      className="w-full py-2.5 bg-white text-black font-semibold rounded-lg hover:bg-black hover:text-white hover:border-white border border-white transition-all duration-300 flex items-center justify-center gap-1.5 text-xs tracking-wider uppercase font-mono cursor-pointer"
                    >
                      <span>ENTER TOURNAMENT</span>
                      <FiZap size={12} className="animate-bounce" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Rules and Hall of Fame (Col span 1) */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* Dynamic Rules Card */}
            <div className="p-6 bg-mono-gray-900 border border-mono-gray-800 rounded-2xl space-y-4">
              <h3 className="text-xs font-bold text-mono-gray-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                <FiShield /> Tournament Rules
              </h3>
              
              <ul className="space-y-3.5 text-[11px] text-mono-gray-400 leading-relaxed font-sans">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white mt-1 shrink-0" />
                  <span>Single-session attempts only. Navigating away pauses the timer but does not reset the test.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white mt-1 shrink-0" />
                  <span>Submitting logs scores straight to the standing board immediately.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white mt-1 shrink-0" />
                  <span>Accuracy percentage and execution speed affect ranking priorities.</span>
                </li>
              </ul>
            </div>

            {/* Hall of Fame Panel */}
            <div className="p-6 bg-mono-gray-900 border border-mono-gray-800 rounded-2xl space-y-4">
              <h3 className="text-xs font-bold text-mono-gray-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                <FiAward /> Hall of Fame
              </h3>

              <div className="space-y-3">
                {leaderboard.length > 0 ? (
                  leaderboard.map((leader, index) => (
                    <div
                      key={leader.userId}
                      className="p-3 bg-black border border-mono-gray-800 rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-mono font-bold text-mono-gray-400">
                          #{index + 1}
                        </span>
                        <span className="text-xs font-semibold text-white">
                          QUIZZER #{leader.userId}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-white">
                        {leader.totalScore} pts
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-mono-gray-500 text-center py-4">
                    Hall of Fame is currently vacant.
                  </p>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Competitions;

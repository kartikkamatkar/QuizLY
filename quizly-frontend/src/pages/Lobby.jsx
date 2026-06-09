import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiClock, FiPlay, FiShare2, FiCheckSquare, FiAlertCircle, FiCheck, FiAward, FiTrendingUp } from 'react-icons/fi';
import api from '../api/axios';

const Lobby = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  // Lobby States
  const [competition, setCompetition] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [status, setStatus] = useState('LOBBY'); // "LOBBY", "ACTIVE", "COMPLETED"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Active Test States
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // questionId -> selectedOptionKey
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [userSubmitted, setUserSubmitted] = useState(false);

  // References
  const pollInterval = useRef(null);
  const timerInterval = useRef(null);
  const stompClientRef = useRef(null);
  const competitionRef = useRef(null);

  // Update competitionRef when competition changes
  useEffect(() => {
    competitionRef.current = competition;
  }, [competition]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      initializeLobby(parsedUser);
    } else {
      setError('You must be signed in to join a competition.');
      setLoading(false);
    }

    return () => {
      disconnectWebSocket();
      clearInterval(pollInterval.current);
      clearInterval(timerInterval.current);
    };
  }, [roomCode]);

  const disconnectWebSocket = () => {
    if (stompClientRef.current) {
      try {
        stompClientRef.current.disconnect();
      } catch (e) {
        console.error("Error disconnecting WebSocket:", e);
      }
      stompClientRef.current = null;
    }
  };

  const connectWebSocket = (currentUser, initialComp) => {
    if (!window.SockJS || !window.Stomp) {
      console.warn("SockJS/Stomp not available. Falling back to HTTP polling.");
      initializeHttpPolling(currentUser);
      return;
    }

    try {
      const socket = new window.SockJS('http://localhost:6063/ws'); // Route via API Gateway
      const client = window.Stomp.over(socket);
      client.debug = () => {}; // Disable logs

      client.connect({}, () => {
        stompClientRef.current = client;

        // Subscribe to room topics
        client.subscribe(`/topic/room/${roomCode.toUpperCase()}`, (msg) => {
          const payload = JSON.parse(msg.body);
          handleWebSocketMessage(payload, currentUser, initialComp);
        });

        // Send JOIN socket mapping message
        client.send(`/app/room/${roomCode.toUpperCase()}/join`, {}, JSON.stringify({
          userId: currentUser.id,
          userName: currentUser.name
        }));

      }, (err) => {
        console.error("STOMP connection failed. Falling back to HTTP polling.", err);
        initializeHttpPolling(currentUser);
      });
    } catch (e) {
      console.error("Websocket init failed. Falling back to HTTP polling.", e);
      initializeHttpPolling(currentUser);
    }
  };

  const handleWebSocketMessage = (payload, currentUser, initialComp) => {
    console.log("WS Event:", payload);
    switch (payload.type) {
      case 'USER_JOINED':
        setParticipants(payload.participants);
        break;
      case 'COMPETITION_STARTED':
        setStatus('ACTIVE');
        const activeComp = competitionRef.current || initialComp;
        loadRandomizedQuestions(activeComp);
        break;
      case 'LEADERBOARD_UPDATE':
        setParticipants(payload.participants);
        // Completed status check
        const allDone = payload.participants.every(p => p.submitted);
        if (allDone) {
          setStatus('COMPLETED');
        }
        break;
      default:
        break;
    }
  };

  const initializeLobby = async (currentUser) => {
    try {
      // 1. Load initial metadata
      const response = await api.get(`/api/competitions/${roomCode}`);
      const data = response.data;

      setCompetition(data.competition);
      setParticipants(data.participants);
      setStatus(data.competition.status);

      // Restore submit state if page refreshed
      const selfPart = data.participants.find(p => p.userId === currentUser.id);
      if (selfPart && selfPart.submitted) {
        setUserSubmitted(true);
      }

      if (data.competition.status === 'ACTIVE') {
        loadRandomizedQuestions(data.competition);
      } else if (data.competition.status === 'COMPLETED') {
        // Room already completed
      } else {
        // 2. Load WebSocket dynamic state
        connectWebSocket(currentUser, data.competition);
      }

      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(err.response?.data || 'Failed to initialize competition lobby.');
      setLoading(false);
    }
  };

  const initializeHttpPolling = (currentUser) => {
    fetchLobbyData();
    pollInterval.current = setInterval(fetchLobbyData, 2000);
  };

  const fetchLobbyData = async () => {
    try {
      const response = await api.get(`/api/competitions/${roomCode}`);
      const data = response.data;

      setCompetition(data.competition);
      setParticipants(data.participants);
      setStatus(data.competition.status);

      const currentUserData = localStorage.getItem('user');
      const currentUser = currentUserData ? JSON.parse(currentUserData) : null;
      if (currentUser) {
        const selfPart = data.participants.find(p => p.userId === currentUser.id);
        if (selfPart && selfPart.submitted) {
          setUserSubmitted(true);
        }
      }

      if (data.competition.status === 'ACTIVE' && questions.length === 0) {
        clearInterval(pollInterval.current);
        loadRandomizedQuestions(data.competition);
      }

      if (data.competition.status === 'COMPLETED') {
        clearInterval(pollInterval.current);
        clearInterval(timerInterval.current);
      }
    } catch (err) {
      console.error('Error polling lobby data:', err);
    }
  };

  // Load and shuffle questions
  const loadRandomizedQuestions = async (compDetails) => {
    if (!compDetails) return;
    try {
      const response = await api.get(`/api/questions/category/${compDetails.category}`);
      let allQuestions = response.data;

      if (!allQuestions || allQuestions.length === 0) {
        const fallbackResp = await api.get('/api/questions?page=0&size=50');
        allQuestions = fallbackResp.data.content || [];
      }

      const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
      const sliced = shuffled.slice(0, compDetails.questionCount);

      setQuestions(sliced);
      setTimeRemaining(compDetails.timeLimit * 60);
      startTestTimer(compDetails.timeLimit * 60);
    } catch (err) {
      console.error('Error loading questions:', err);
      setError('Could not load quiz questions. Try reloading.');
    }
  };

  const startTestTimer = (initialSecs) => {
    let secs = initialSecs;
    timerInterval.current = setInterval(() => {
      secs--;
      setTimeRemaining(secs);
      if (secs <= 0) {
        clearInterval(timerInterval.current);
        handleAutoSubmit();
      }
    }, 1000);
  };

  const handleStartCompetition = async () => {
    if (!user || !competition) return;

    if (stompClientRef.current && stompClientRef.current.connected) {
      try {
        stompClientRef.current.send(`/app/room/${roomCode.toUpperCase()}/start`, {}, JSON.stringify({
          hostUserId: user.id
        }));
        return;
      } catch (wsErr) {
        console.error("WS start failed, falling back to REST:", wsErr);
      }
    }

    try {
      await api.post(`/api/competitions/${roomCode}/start?userId=${user.id}`);
      fetchLobbyData();
    } catch (err) {
      alert(err.response?.data || 'Failed to start competition.');
    }
  };

  const handleSelectOption = (questionId, optionKey) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionKey
    }));
  };

  const handlePrev = () => {
    setCurrentIdx(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1));
  };

  const handleAutoSubmit = () => {
    alert('Time has expired! Submitting answers.');
    submitQuizScore();
  };

  const handleManualSubmit = () => {
    const unansweredCount = questions.length - Object.keys(answers).length;
    let confirmMsg = 'Are you sure you want to submit?';
    if (unansweredCount > 0) {
      confirmMsg = `You have ${unansweredCount} unanswered question(s). ${confirmMsg}`;
    }
    if (confirm(confirmMsg)) {
      submitQuizScore();
    }
  };

  const submitQuizScore = async () => {
    setSubmitting(true);
    clearInterval(timerInterval.current);

    let score = 0;
    questions.forEach((q) => {
      const userAns = answers[q.id];
      if (userAns && userAns.toLowerCase() === q.correctAnswer.toLowerCase()) {
        score++;
      }
    });

    if (stompClientRef.current && stompClientRef.current.connected) {
      try {
        stompClientRef.current.send(`/app/room/${roomCode.toUpperCase()}/score`, {}, JSON.stringify({
          userId: user.id,
          score: score
        }));
        setUserSubmitted(true);
        setSubmitting(false);
        return;
      } catch (wsErr) {
        console.error("WS score submit failed, falling back to REST:", wsErr);
      }
    }

    try {
      await api.post(`/api/competitions/${roomCode}/submit`, {
        userId: user.id,
        score: score
      });
      setUserSubmitted(true);
      setSubmitting(false);
      initializeHttpPolling(user);
    } catch (err) {
      console.error('Error submitting score:', err);
      setError('Failed to submit score. Try again.');
      setSubmitting(false);
    }
  };

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/lobby/${roomCode}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-center px-4">
        <div>
          <FiAlertCircle className="mx-auto mb-4 text-mono-gray-400" size={48} />
          <h2 className="text-2xl font-bold font-display text-white mb-2 uppercase">Lobby Error</h2>
          <p className="text-mono-gray-400 mb-6">{error}</p>
          <button onClick={() => navigate('/dashboard')} className="mono-btn-primary mx-auto">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isHost = competition && user && competition.hostUserId === user.id;
  const activeQuestion = questions[currentIdx];

  return (
    <div className="min-h-screen pt-28 pb-16 px-6 sm:px-8 bg-black mono-grid-bg flex flex-col justify-between">
      
      {/* 1. LOBBY STATE UI */}
      {status === 'LOBBY' && (
        <div className="max-w-4xl mx-auto w-full space-y-8">
          {/* Lobby Summary */}
          <div className="bg-mono-gray-900 border border-mono-gray-800 rounded-3xl p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
            <div className="absolute -top-32 -left-32 w-64 h-64 bg-white/5 blur-3xl rounded-full" />
            
            <div className="space-y-2 relative">
              <span className="text-[9px] font-bold text-mono-gray-500 font-mono tracking-widest uppercase">
                COMPETITION LOBBY ACTIVE
              </span>
              <h1 className="text-3xl font-display font-bold text-white uppercase">{competition.title}</h1>
              <p className="text-mono-gray-400 text-xs font-mono">
                TOPIC: <span className="text-white font-bold">{competition.category}</span> | LIMIT: {competition.questionCount} Qs | {competition.timeLimit} Mins
              </p>
            </div>

            {/* Room code copies */}
            <div className="flex gap-3 relative shrink-0">
              <div className="px-5 py-3 border border-mono-gray-800 bg-black rounded-xl text-center">
                <span className="text-[9px] font-bold text-mono-gray-500 font-mono block uppercase">ROOM CODE</span>
                <span className="text-2xl font-display font-bold text-white tracking-widest block">{competition.roomCode}</span>
              </div>
              <button
                onClick={copyShareLink}
                className="px-4 border border-mono-gray-800 hover:border-white rounded-xl text-mono-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                {copied ? <FiCheck size={18} className="text-white" /> : <FiShare2 size={18} />}
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-start">
            {/* Participants list (Col span 2) */}
            <div className="md:col-span-2 bg-mono-gray-900 border border-mono-gray-800 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-mono-gray-800/80 pb-4">
                <h2 className="text-sm font-bold font-display text-white uppercase tracking-wider flex items-center gap-2">
                  <FiUsers /> Joined Competitors ({participants.length})
                </h2>
                <span className="text-[10px] text-mono-gray-500 font-mono">WAITING IN ROOM...</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {participants.map((p) => {
                  const isPlayerHost = p.userId === competition.hostUserId;
                  return (
                    <div
                      key={p.userId}
                      className="p-4 bg-black border border-mono-gray-800 rounded-xl flex items-center justify-between hover:border-mono-gray-500 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full border border-mono-gray-700 bg-mono-gray-900 flex items-center justify-center text-xs font-bold uppercase text-white">
                          {p.userName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{p.userName}</p>
                          {isPlayerHost && (
                            <span className="text-[9px] font-bold text-black bg-white px-1.5 rounded uppercase font-sans">
                              HOST
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Launch actions (Col span 1) */}
            <div className="p-6 bg-mono-gray-900 border border-mono-gray-800 rounded-3xl space-y-6">
              <h3 className="text-xs font-bold text-mono-gray-400 font-mono uppercase tracking-wider">
                Arena Controls
              </h3>

              {isHost ? (
                <div className="space-y-4">
                  <p className="text-xs text-mono-gray-400 leading-relaxed font-sans">
                    As the host, you can initiate the competition sequence once all competitors are in the room.
                  </p>
                  <button
                    onClick={handleStartCompetition}
                    className="w-full py-3 bg-white text-black hover:bg-black hover:text-white hover:border-white border border-white font-bold rounded-lg text-xs tracking-wider uppercase font-mono transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FiPlay size={14} className="animate-bounce" />
                    <span>LAUNCH ARENA</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3.5 text-center py-4">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs text-mono-gray-400 leading-relaxed font-sans">
                    Waiting for the host (<span className="text-white font-semibold">
                      {participants.find(p => p.userId === competition.hostUserId)?.userName || 'Admin'}
                    </span>) to launch the test sequence...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. ACTIVE STATE UI: TEST SEQUENCE */}
      {status === 'ACTIVE' && !userSubmitted && (
        <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col justify-between h-full">
          {/* Header Panel */}
          <div className="bg-mono-gray-900 border border-mono-gray-800 p-5 rounded-2xl flex items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-[9px] font-bold text-mono-gray-400 font-mono uppercase tracking-widest block">
                COMPETITION ARENA ACTIVE
              </span>
              <h2 className="text-lg font-display font-bold text-white uppercase mt-0.5 line-clamp-1">
                {competition.title}
              </h2>
            </div>

            {/* Countdown timer */}
            <div className="flex items-center gap-2 px-4 py-2 border border-mono-gray-800 bg-black rounded-xl text-white font-mono font-bold text-sm shrink-0">
              <FiClock className={timeRemaining < 60 ? 'text-white animate-pulse' : 'text-mono-gray-400'} />
              <span>{formatTime(timeRemaining)}</span>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-8 items-start flex-1 mb-8">
            {/* Quick Navigation Dots */}
            <div className="bg-mono-gray-900 border border-mono-gray-800 p-6 rounded-2xl space-y-4 md:col-span-1">
              <h3 className="text-xs font-bold text-mono-gray-400 font-mono uppercase tracking-wider">
                Question Grid
              </h3>
              
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const answered = !!answers[q.id];
                  const active = idx === currentIdx;
                  
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIdx(idx)}
                      className={`w-9 h-9 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        active
                          ? 'bg-black text-white border-2 border-white'
                          : answered
                            ? 'bg-white text-black font-extrabold'
                            : 'bg-black text-mono-gray-400 border border-mono-gray-800'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Question Box */}
            <div className="md:col-span-3 space-y-6">
              {activeQuestion && (
                <motion.div
                  key={activeQuestion.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="bg-mono-gray-900 border border-mono-gray-800 rounded-3xl p-6 sm:p-8 space-y-6"
                >
                  <div className="flex justify-between items-center border-b border-mono-gray-800/80 pb-4">
                    <span className="text-[10px] font-bold text-mono-gray-400 font-mono tracking-widest uppercase">
                      QUESTION {currentIdx + 1} OF {questions.length}
                    </span>
                    {activeQuestion.topic && (
                      <span className="text-[10px] text-white border border-mono-gray-700 px-2 py-0.5 rounded font-mono uppercase">
                        {activeQuestion.topic}
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl sm:text-2xl font-display font-semibold text-white leading-relaxed">
                    {activeQuestion.question}
                  </h2>

                  <div className="space-y-3 pt-2">
                    {[
                      { key: 'optionA', val: activeQuestion.optionA, letter: 'A' },
                      { key: 'optionB', val: activeQuestion.optionB, letter: 'B' },
                      { key: 'optionC', val: activeQuestion.optionC, letter: 'C' },
                      { key: 'optionD', val: activeQuestion.optionD, letter: 'D' }
                    ].map((opt) => {
                      const isSelected = answers[activeQuestion.id] === opt.key;
                      
                      return (
                        <button
                          key={opt.key}
                          onClick={() => handleSelectOption(activeQuestion.id, opt.key)}
                          className={`w-full text-left p-4.5 rounded-xl border font-sans text-sm transition-all duration-200 flex items-center gap-4 cursor-pointer ${
                            isSelected
                              ? 'bg-white text-black border-white font-semibold'
                              : 'bg-black text-mono-gray-300 border-mono-gray-800 hover:border-mono-gray-500'
                          }`}
                        >
                          <span className={`w-6 h-6 rounded border flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                            isSelected ? 'bg-black text-white border-black' : 'border-mono-gray-700 text-mono-gray-400'
                          }`}>
                            {opt.letter}
                          </span>
                          <span>{opt.val}</span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Navigation Actions */}
              <div className="flex justify-between items-center">
                <button
                  onClick={handlePrev}
                  disabled={currentIdx === 0}
                  className="px-5 py-3 rounded-xl border border-mono-gray-800 hover:border-white text-mono-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer text-xs font-bold font-mono"
                >
                  PREV
                </button>

                {currentIdx < questions.length - 1 ? (
                  <button
                    onClick={handleNext}
                    className="px-5 py-3 bg-white text-black border border-white hover:bg-black hover:text-white rounded-xl transition-all cursor-pointer text-xs font-bold font-mono"
                  >
                    NEXT
                  </button>
                ) : (
                  <button
                    onClick={handleManualSubmit}
                    disabled={submitting}
                    className="px-6 py-3 bg-white text-black hover:bg-black hover:text-white border border-white rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase font-mono disabled:opacity-50"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <FiCheckSquare size={14} /> SUBMIT SEQUENCE
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 3. ACTIVE SUBMITTED STATE: WAITING SCREEN */}
      {status === 'ACTIVE' && userSubmitted && (
        <div className="max-w-2xl mx-auto w-full text-center space-y-6 py-12">
          <div className="w-12 h-12 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          
          <span className="text-[10px] font-bold text-mono-gray-400 font-mono tracking-widest uppercase block">
            ANSWERS REGISTERED SUCCESSFULLY
          </span>
          <h2 className="text-2xl font-display font-bold text-white uppercase">Waiting for Competitors</h2>
          <p className="text-mono-gray-400 text-sm max-w-sm mx-auto leading-relaxed">
            Your results are locked in. Standings will render automatically once all joined competitors complete the test.
          </p>

          <div className="bg-mono-gray-900 border border-mono-gray-800 p-6 rounded-2xl max-w-md mx-auto text-left space-y-4">
            <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">Submission Logs</h3>
            <div className="space-y-2">
              {participants.map((p) => (
                <div key={p.userId} className="flex items-center justify-between text-xs font-mono">
                  <span className="text-mono-gray-300">{p.userName}</span>
                  {p.submitted ? (
                    <span className="text-white font-bold flex items-center gap-1">
                      <FiCheck /> COMPLETE
                    </span>
                  ) : (
                    <span className="text-mono-gray-500 animate-pulse">TESTING...</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. COMPLETED STATE: ROOM LEADERBOARD */}
      {status === 'COMPLETED' && (
        <div className="max-w-4xl mx-auto w-full space-y-8">
          <div className="text-center space-y-3 mb-10">
            <FiAward className="mx-auto text-white" size={48} />
            <span className="text-[9px] font-bold text-mono-gray-400 font-mono tracking-widest uppercase block">
              TOURNAMENT RESULTS ARCHIVED
            </span>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-white uppercase">{competition.title}</h1>
            <p className="text-mono-gray-400 text-xs font-mono">
              ROOM CODE: {competition.roomCode} | TOPIC: {competition.category}
            </p>
          </div>

          {/* Pedestal Standings for Lobbies */}
          <div className="grid grid-cols-3 gap-4 items-end mb-16 max-w-2xl mx-auto border-b border-mono-gray-800 pb-2">
            {/* Sorted list copy */}
            {(() => {
              const sorted = [...participants].sort((a, b) => b.score - a.score);
              return (
                <>
                  {/* 2nd Place */}
                  {sorted[1] && (
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-mono text-mono-gray-400 mb-1.5">2ND</span>
                      <div className="w-8 h-8 rounded-full border border-mono-gray-600 bg-mono-gray-900 flex items-center justify-center text-xs text-white font-bold uppercase mb-2">
                        {sorted[1].userName.charAt(0)}
                      </div>
                      <span className="text-xs font-bold text-mono-gray-300 truncate max-w-[90px]">{sorted[1].userName}</span>
                      <span className="text-xs font-mono text-mono-gray-400 font-bold mb-2">{sorted[1].score} Qs</span>
                      <div className="w-full h-20 bg-mono-gray-900 border border-mono-gray-800 border-b-0 rounded-t-lg flex items-center justify-center">
                        <span className="text-base font-display font-bold text-mono-gray-400">II</span>
                      </div>
                    </div>
                  )}

                  {/* 1st Place */}
                  {sorted[0] && (
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-mono text-white mb-1.5 font-bold">WINNER</span>
                      <div className="w-10 h-10 rounded-full border-2 border-white bg-white text-black flex items-center justify-center text-sm font-extrabold uppercase mb-2">
                        {sorted[0].userName.charAt(0)}
                      </div>
                      <span className="text-sm font-bold text-white truncate max-w-[110px]">{sorted[0].userName}</span>
                      <span className="text-sm font-mono text-white font-extrabold mb-2">{sorted[0].score} Qs</span>
                      <div className="w-full h-28 bg-white border border-white rounded-t-lg flex items-center justify-center">
                        <span className="text-xl font-display font-bold text-black">I</span>
                      </div>
                    </div>
                  )}

                  {/* 3rd Place */}
                  {sorted[2] && (
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-mono text-mono-gray-400 mb-1.5">3RD</span>
                      <div className="w-8 h-8 rounded-full border border-mono-gray-600 bg-mono-gray-900 flex items-center justify-center text-xs text-white font-bold uppercase mb-2">
                        {sorted[2].userName.charAt(0)}
                      </div>
                      <span className="text-xs font-bold text-mono-gray-300 truncate max-w-[90px]">{sorted[2].userName}</span>
                      <span className="text-xs font-mono text-mono-gray-400 font-bold mb-2">{sorted[2].score} Qs</span>
                      <div className="w-full h-14 bg-mono-gray-900 border border-mono-gray-800 border-b-0 rounded-t-lg flex items-center justify-center">
                        <span className="text-base font-display font-bold text-mono-gray-400">III</span>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>

          {/* Scores Table */}
          <div className="bg-mono-gray-900 border border-mono-gray-800 rounded-3xl p-6 sm:p-8">
            <h3 className="text-xs font-bold text-mono-gray-400 font-mono uppercase tracking-wider mb-6">
              Competitor Standings
            </h3>
            
            <div className="space-y-2">
              {[...participants]
                .sort((a, b) => b.score - a.score)
                .map((p, idx) => (
                  <div
                    key={p.userId}
                    className="p-4 bg-black border border-mono-gray-800 rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-mono font-bold text-mono-gray-400">#{idx + 1}</span>
                      <span className="text-sm font-semibold text-white">{p.userName}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-sm font-bold text-white">
                      <FiTrendingUp className="text-mono-gray-400" />
                      <span>{p.score} Points</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Exit Action */}
          <div className="text-center pt-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="mono-btn-primary mx-auto"
            >
              Exit Arena Lobby
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Lobby;

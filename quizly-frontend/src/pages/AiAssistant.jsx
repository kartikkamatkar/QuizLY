import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCpu, FiCheckSquare, FiAlertCircle, FiBookOpen,
  FiMessageSquare, FiTrendingUp, FiActivity, FiArrowRight,
  FiPlus, FiUpload, FiPlay, FiFileText, FiAward, FiSend,
  FiChevronRight, FiZap, FiCheck, FiX, FiInfo
} from 'react-icons/fi';
import api from '../api/axios';

const AiAssistant = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('generator'); // generator, coach, chatbot

  // Quiz Generator States
  const [topic, setTopic] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('JAVA');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [qCount, setQCount] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  // PDF Upload States
  const [pdfFile, setPdfFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  // Generated Quiz Wizard States
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [quizIdx, setQuizIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // idx -> optionKey
  const [submittedAnswers, setSubmittedAnswers] = useState({}); // idx -> boolean (isSubmitted)
  const [aiExplanations, setAiExplanations] = useState({}); // idx -> string
  const [explainingIdx, setExplainingIdx] = useState(null);

  // AI Coach / Recommendations States
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // RAG Chatbot States
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { sender: 'assistant', text: 'Hello! I am your AI Learning Assistant. You can ask me any question about programming, your quiz performance, or generate custom learning paths.' }
  ]);
  const [sendingChat, setSendingChat] = useState(false);
  const [learningPathTopic, setLearningPathTopic] = useState('');
  const [learningPathResult, setLearningPathResult] = useState('');
  const [generatingPath, setGeneratingPath] = useState(false);

  const chatEndRef = useRef(null);

  const categories = ['JAVA', 'SPRING', 'REACT', 'DSA', 'DBMS', 'OS', 'CN', 'APTITUDE'];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  // Handle PDF Drag & Drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        setPdfFile(file);
      } else {
        alert('Please drop a valid PDF document.');
      }
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
    }
  };

  // Generate Quiz from Prompt
  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    if (!topic || !title) return;

    setGenerating(true);
    setError('');
    setGeneratedQuiz(null);
    setQuizIdx(0);
    setSelectedAnswers({});
    setSubmittedAnswers({});
    setAiExplanations({});

    try {
      const response = await api.post('/api/ai/quiz/generate', {
        title,
        topic,
        category,
        difficulty,
        questionCount: parseInt(qCount)
      });

      setGeneratedQuiz(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data || 'Failed to generate quiz. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  // Generate Quiz from PDF
  const handleGenerateFromPdf = async (e) => {
    e.preventDefault();
    if (!pdfFile || !topic || !title) return;

    setGenerating(true);
    setError('');
    setGeneratedQuiz(null);
    setQuizIdx(0);
    setSelectedAnswers({});
    setSubmittedAnswers({});
    setAiExplanations({});

    try {
      const formData = new FormData();
      formData.append('file', pdfFile);
      formData.append('title', title);
      formData.append('topic', topic);
      formData.append('category', category);
      formData.append('difficulty', difficulty);
      formData.append('questionCount', qCount);

      const response = await api.post('/api/ai/quiz/generate-from-pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setGeneratedQuiz(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data || 'Failed to generate quiz from PDF. Please check backend config.');
    } finally {
      setGenerating(false);
    }
  };

  // Answer Selection
  const selectOption = (optKey) => {
    if (submittedAnswers[quizIdx]) return; // locked after checking
    setSelectedAnswers({
      ...selectedAnswers,
      [quizIdx]: optKey
    });
  };

  // Check Answer Status
  const checkAnswer = () => {
    if (!selectedAnswers[quizIdx]) return;
    setSubmittedAnswers({
      ...submittedAnswers,
      [quizIdx]: true
    });
  };

  // Explain with AI
  const explainAnswer = async () => {
    const q = generatedQuiz.questions[quizIdx];
    setExplainingIdx(quizIdx);
    try {
      const response = await api.post('/api/ai/explain', {
        question: q.question,
        correctAnswer: q.correctAnswer,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD
      });
      setAiExplanations({
        ...aiExplanations,
        [quizIdx]: response.data.explanation
      });
    } catch (err) {
      console.error(err);
      setAiExplanations({
        ...aiExplanations,
        [quizIdx]: 'Could not generate explanation. Check if OpenAI/Gemini credentials are configured on the backend.'
      });
    } finally {
      setExplainingIdx(null);
    }
  };

  // Load Weak Topics & Dynamic Recommendations
  const loadCoachAnalytics = async () => {
    if (!user) return;
    setLoadingAnalytics(true);
    try {
      const response = await api.get(`/api/ai/analytics/recommendations/${user.id}`);
      setAnalytics(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Trigger coach loading when active tab changes
  useEffect(() => {
    if (activeTab === 'coach' && !analytics && user) {
      loadCoachAnalytics();
    }
  }, [activeTab, user]);

  // Send RAG Chat message
  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || !user) return;

    const userText = chatMessage;
    setChatMessage('');
    setChatHistory(prev => [...prev, { sender: 'user', text: userText }]);
    setSendingChat(true);

    try {
      const response = await api.post('/api/ai/chat', {
        userId: user.id,
        message: userText
      });
      setChatHistory(prev => [...prev, { sender: 'assistant', text: response.data.response }]);
    } catch (err) {
      console.error(err);
      setChatHistory(prev => [...prev, { sender: 'assistant', text: 'Error contacting AI agent. Please check your vector database and Spring AI integrations.' }]);
    } finally {
      setSendingChat(false);
    }
  };

  // Generate Learning Path Timeline
  const handleGeneratePath = async (e) => {
    e.preventDefault();
    if (!learningPathTopic.trim() || !user) return;

    setGeneratingPath(true);
    setLearningPathResult('');
    try {
      const response = await api.post('/api/ai/learning-path', {
        userId: user.id,
        topicInterest: learningPathTopic
      });
      setLearningPathResult(response.data.learningPath);
    } catch (err) {
      console.error(err);
      setLearningPathResult('Failed to generate study path. Verify service connection.');
    } finally {
      setGeneratingPath(false);
    }
  };

  return (
      <div className="min-h-screen pt-32 pb-24 px-6 sm:px-8 bg-black mono-grid-bg text-white selection:bg-white selection:text-black">
        <div className="max-w-7xl mx-auto relative z-10">

          {/* Header Block */}
          <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 mb-12 pb-8 border-b border-neutral-900">
            <div className="space-y-2.5">
            <span className="text-[11px] uppercase font-bold text-neutral-500 font-mono tracking-widest flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-neutral-400 animate-pulse" /> Advanced placement toolkit
            </span>
              <h1 className="text-4xl sm:text-5xl font-display font-black text-white tracking-tighter uppercase leading-none">
                AI LEARNING HU<span className="bg-white text-black px-2 py-0.5 ml-1.5 rounded-2xl transform inline-block shadow-lg">B</span>
              </h1>
            </div>

            {/* Stark Navigation Tabs */}
            <div className="flex gap-1 p-1 bg-neutral-950 border border-neutral-900 rounded-xl max-w-max">
              {[
                { id: 'generator', label: 'AI Quiz Gen', icon: FiCpu },
                { id: 'coach', label: 'AI Study Coach', icon: FiTrendingUp },
                { id: 'chatbot', label: 'RAG Assistant', icon: FiMessageSquare }
              ].map(tab => (
                  <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer select-none ${
                          activeTab === tab.id
                              ? 'bg-white text-black border border-white'
                              : 'text-neutral-500 hover:text-neutral-200 bg-transparent'
                      }`}
                  >
                    <tab.icon size={13} />
                    {tab.label}
                  </button>
              ))}
            </div>
          </div>

          {/* Tab Contents */}
          <div className="min-h-[500px]">
            {/* TAB 1: GENERATOR */}
            {activeTab === 'generator' && (
                <div className="grid lg:grid-cols-3 gap-8 items-start">
                  {/* Form Input Columns */}
                  <div className="space-y-6 lg:col-span-1">
                    <div className="p-6 bg-neutral-950/40 backdrop-blur-sm border border-neutral-900 rounded-2xl space-y-5">
                      <div className="border-b border-neutral-900/60 pb-3">
                        <h3 className="text-xs font-mono font-bold uppercase tracking-widest flex items-center gap-2 text-neutral-400">
                          <FiCpu size={14} /> Generator Options
                        </h3>
                      </div>

                      <form onSubmit={pdfFile ? handleGenerateFromPdf : handleGenerateQuiz} className="space-y-4.5">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-neutral-500 uppercase font-mono tracking-wider">Quiz Title</label>
                          <input
                              type="text"
                              placeholder="e.g. Master Kafka Pipelines"
                              className="w-full bg-black border border-neutral-900 focus:border-neutral-700 rounded-lg px-3 py-2 text-xs text-white outline-none transition-colors placeholder:text-neutral-800 font-mono"
                              value={title}
                              onChange={(e) => setTitle(e.target.value)}
                              required
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-neutral-500 uppercase font-mono tracking-wider">Core Topic</label>
                          <input
                              type="text"
                              placeholder="e.g. Consumer Groups and Offsets"
                              className="w-full bg-black border border-neutral-900 focus:border-neutral-700 rounded-lg px-3 py-2 text-xs text-white outline-none transition-colors placeholder:text-neutral-800 font-mono"
                              value={topic}
                              onChange={(e) => setTopic(e.target.value)}
                              required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-neutral-500 uppercase font-mono tracking-wider">Category</label>
                            <select
                                className="w-full bg-black border border-neutral-900 focus:border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-300 outline-none transition-colors cursor-pointer font-mono"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                              {categories.map((c) => (
                                  <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-neutral-500 uppercase font-mono tracking-wider">Difficulty</label>
                            <select
                                className="w-full bg-black border border-neutral-900 focus:border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-300 outline-none transition-colors cursor-pointer font-mono"
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                            >
                              <option value="EASY">EASY</option>
                              <option value="MEDIUM">MEDIUM</option>
                              <option value="HARD">HARD</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-neutral-500 uppercase font-mono tracking-wider">Questions count</label>
                          <select
                              className="w-full bg-black border border-neutral-900 focus:border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-300 outline-none transition-colors cursor-pointer font-mono"
                              value={qCount}
                              onChange={(e) => setQCount(e.target.value)}
                          >
                            <option value="3">3 Qs</option>
                            <option value="5">5 Qs</option>
                            <option value="10">10 Qs</option>
                          </select>
                        </div>

                        {/* PDF Upload Area */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-neutral-500 uppercase font-mono tracking-wider block">
                            PDF Upload (Optional)
                          </label>

                          {!pdfFile ? (
                              <div
                                  onDragOver={handleDragOver}
                                  onDragLeave={handleDragLeave}
                                  onDrop={handleDrop}
                                  className={`border border-dashed rounded-xl p-5 text-center transition-all duration-300 cursor-pointer ${
                                      dragOver ? 'border-neutral-400 bg-neutral-900/40' : 'border-neutral-900 hover:border-neutral-700 bg-black/40'
                                  }`}
                              >
                                <input
                                    type="file"
                                    accept=".pdf"
                                    className="hidden"
                                    id="pdf-input"
                                    onChange={handleFileSelect}
                                />
                                <label htmlFor="pdf-input" className="cursor-pointer space-y-2 block">
                                  <FiUpload size={20} className="mx-auto text-neutral-600" />
                                  <span className="text-[10px] text-neutral-500 uppercase font-mono tracking-widest block select-none">
                              Drag & Drop PDF or Browse
                            </span>
                                </label>
                              </div>
                          ) : (
                              <div className="flex items-center justify-between p-3 bg-neutral-950 border border-neutral-900 rounded-xl">
                                <div className="flex items-center gap-2.5 max-w-[80%]">
                                  <FiFileText size={16} className="text-neutral-400 shrink-0" />
                                  <span className="text-xs truncate font-mono text-neutral-300">{pdfFile.name}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setPdfFile(null)}
                                    className="p-1 rounded border border-neutral-900 hover:border-neutral-700 text-neutral-500 hover:text-white transition-colors cursor-pointer"
                                >
                                  <FiX size={12} />
                                </button>
                              </div>
                          )}
                        </div>

                        <button
                            type="submit"
                            disabled={generating}
                            className="w-full py-3 bg-white text-black hover:bg-neutral-900 hover:text-white border border-white font-mono font-bold text-xs tracking-widest uppercase rounded-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {generating ? (
                              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          ) : (
                              <>
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                                <span>{pdfFile ? 'GENERATE FROM PDF' : 'GENERATE AI QUIZ'}</span>
                              </>
                          )}
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Main Quiz / Results Screen */}
                  <div className="lg:col-span-2">
                    <AnimatePresence mode="wait">
                      {generating && (
                          <motion.div
                              key="generating-loading"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="h-full flex flex-col items-center justify-center border border-neutral-900 bg-neutral-950/20 backdrop-blur-sm rounded-2xl p-16 text-center min-h-[400px]"
                          >
                            <div className="w-8 h-8 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin mb-5" />
                            <h3 className="text-lg font-display font-bold uppercase tracking-wide text-white mb-1.5">Synthesizing Syllabus</h3>
                            <p className="text-neutral-500 text-xs font-mono max-w-sm leading-relaxed">
                              Spring AI is generating structured JSON questions using LLM schemas and evaluating initial settings...
                            </p>
                          </motion.div>
                      )}

                      {error && (
                          <motion.div
                              key="error-panel"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="p-5 bg-neutral-950/40 border-l-2 border-white border border-neutral-900 rounded-2xl flex items-start gap-4"
                          >
                            <FiAlertCircle className="text-neutral-400 shrink-0 mt-0.5" size={20} />
                            <div className="space-y-0.5">
                              <h4 className="text-xs font-bold uppercase font-mono text-white tracking-wider">Quiz Generation Error</h4>
                              <p className="text-xs text-neutral-400 font-mono leading-relaxed">{error}</p>
                            </div>
                          </motion.div>
                      )}

                      {!generating && !error && !generatedQuiz && (
                          <motion.div
                              key="empty-panel"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="h-[430px] flex flex-col items-center justify-center border border-neutral-900 bg-neutral-950/20 rounded-2xl p-8 text-center"
                          >
                            <div className="p-4 bg-neutral-950/80 border border-neutral-900 rounded-2xl mb-4 text-neutral-600">
                              <FiBookOpen size={28} />
                            </div>
                            <h3 className="text-base font-bold font-display uppercase tracking-wider text-white">No Generated Quiz Active</h3>
                            <p className="text-neutral-500 text-xs font-mono max-w-xs mt-1.5 leading-relaxed">
                              Enter prompt details on the left, upload an optional PDF document, and launch the AI pipeline to start.
                            </p>
                          </motion.div>
                      )}

                      {generatedQuiz && (
                          <motion.div
                              key="active-quiz"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="space-y-6"
                          >
                            {/* Active Quiz Card */}
                            <div className="bg-neutral-950/40 backdrop-blur-sm border border-neutral-900 p-6 sm:p-8 rounded-2xl space-y-6">
                              <div className="flex justify-between items-start border-b border-neutral-900 pb-4.5">
                                <div className="space-y-1">
                            <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest block font-bold">
                              AI GENERATED QUIZ IN SESSION
                            </span>
                                  <h2 className="text-xl font-display font-bold uppercase text-white tracking-tight">
                                    {generatedQuiz.title}
                                  </h2>
                                </div>
                                <span className="text-[10px] bg-white text-black border border-white px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                            {generatedQuiz.category}
                          </span>
                              </div>

                              {/* Pagination Selector */}
                              <div className="flex flex-wrap gap-1.5">
                                {generatedQuiz.questions.map((q, idx) => {
                                  const active = idx === quizIdx;
                                  const answered = selectedAnswers[idx] !== undefined;
                                  const submitted = submittedAnswers[idx] === true;

                                  return (
                                      <button
                                          key={idx}
                                          onClick={() => setQuizIdx(idx)}
                                          className={`w-8 h-8 rounded-lg text-xs font-mono font-bold transition-all duration-200 cursor-pointer ${
                                              active
                                                  ? 'bg-white text-black border border-white shadow-md shadow-white/5'
                                                  : submitted
                                                      ? 'bg-neutral-900 text-neutral-300 border border-neutral-800'
                                                      : answered
                                                          ? 'border border-neutral-700 text-neutral-200 bg-transparent'
                                                          : 'bg-black text-neutral-600 border border-neutral-900 hover:border-neutral-700'
                                          }`}
                                      >
                                        {idx + 1}
                                      </button>
                                  );
                                })}
                              </div>

                              {/* Active Question */}
                              {generatedQuiz.questions[quizIdx] && (
                                  <div className="space-y-5">
                                    <h3 className="text-base sm:text-lg font-sans font-medium text-white leading-relaxed">
                                      {generatedQuiz.questions[quizIdx].question}
                                    </h3>

                                    {/* Options */}
                                    <div className="space-y-2.5">
                                      {[
                                        { key: 'optionA', val: generatedQuiz.questions[quizIdx].optionA, letter: 'A' },
                                        { key: 'optionB', val: generatedQuiz.questions[quizIdx].optionB, letter: 'B' },
                                        { key: 'optionC', val: generatedQuiz.questions[quizIdx].optionC, letter: 'C' },
                                        { key: 'optionD', val: generatedQuiz.questions[quizIdx].optionD, letter: 'D' }
                                      ].map(opt => {
                                        const isSelected = selectedAnswers[quizIdx] === opt.key;
                                        const isCorrect = generatedQuiz.questions[quizIdx].correctAnswer.toLowerCase() === opt.key.toLowerCase();
                                        const isSubmitted = submittedAnswers[quizIdx] === true;

                                        let btnStyles = 'bg-black text-neutral-400 border-neutral-900 hover:border-neutral-700 hover:text-white';
                                        if (isSelected) {
                                          btnStyles = 'bg-white text-black border-white font-bold';
                                        }
                                        if (isSubmitted) {
                                          if (isCorrect) {
                                            btnStyles = 'bg-black text-white border-neutral-400 font-bold border-2';
                                          } else if (isSelected) {
                                            btnStyles = 'bg-black text-neutral-500 border-neutral-900 opacity-60 line-through';
                                          } else {
                                            btnStyles = 'bg-black text-neutral-600 border-neutral-950/60 opacity-40';
                                          }
                                        }

                                        return (
                                            <button
                                                key={opt.key}
                                                onClick={() => selectOption(opt.key)}
                                                disabled={isSubmitted}
                                                className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm transition-all duration-200 flex items-center justify-between cursor-pointer ${btnStyles}`}
                                            >
                                              <div className="flex items-center gap-3.5">
                                      <span className={`w-5 h-5 rounded font-mono text-[10px] font-bold flex items-center justify-center tracking-none ${
                                          isSelected
                                              ? 'bg-black text-white'
                                              : 'bg-neutral-900 text-neutral-500 border border-neutral-800'
                                      }`}>
                                        {opt.letter}
                                      </span>
                                                <span>{opt.val}</span>
                                              </div>
                                              {isSubmitted && isCorrect && (
                                                  <span className="text-[9px] bg-white text-black px-1.5 py-0.5 rounded font-mono font-black tracking-wider">VALID</span>
                                              )}
                                            </button>
                                        );
                                      })}
                                    </div>

                                    {/* Checking Actions */}
                                    <div className="flex gap-3 pt-2">
                                      {!submittedAnswers[quizIdx] ? (
                                          <button
                                              onClick={checkAnswer}
                                              disabled={!selectedAnswers[quizIdx]}
                                              className="px-5 py-2.5 bg-white text-black hover:bg-neutral-900 hover:text-white border border-white rounded-xl text-xs font-mono font-bold tracking-wider uppercase cursor-pointer disabled:opacity-50 transition-colors"
                                          >
                                            Check Answer
                                          </button>
                                      ) : (
                                          <div className="flex items-center gap-3 w-full">
                                            <button
                                                onClick={explainAnswer}
                                                disabled={explainingIdx === quizIdx}
                                                className="px-5 py-2.5 bg-transparent text-neutral-300 hover:text-white border border-neutral-800 hover:border-neutral-500 rounded-xl text-xs font-mono font-bold tracking-wider uppercase cursor-pointer transition-all duration-300 flex items-center gap-2 bg-neutral-950/30"
                                            >
                                              {explainingIdx === quizIdx ? (
                                                  <div className="w-3.5 h-3.5 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
                                              ) : <FiCpu size={12} />}
                                              <span>Ask AI Explanation</span>
                                            </button>

                                            {quizIdx < generatedQuiz.questions.length - 1 && (
                                                <button
                                                    onClick={() => setQuizIdx(quizIdx + 1)}
                                                    className="px-5 py-2.5 bg-transparent border border-neutral-800 hover:border-neutral-500 text-neutral-300 hover:text-white rounded-xl text-xs font-mono font-bold tracking-wider uppercase cursor-pointer transition-all duration-300 ml-auto flex items-center gap-1 bg-neutral-950/30"
                                                >
                                                  <span>Next</span> <FiChevronRight size={12} />
                                                </button>
                                            )}
                                          </div>
                                      )}
                                    </div>

                                    {/* AI Explanation Dialog */}
                                    {aiExplanations[quizIdx] && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-5 bg-neutral-950/60 border border-neutral-900 rounded-xl space-y-2 mt-4"
                                        >
                                          <div className="flex items-center gap-1.5 text-neutral-500 font-mono text-[10px] uppercase font-bold tracking-widest">
                                            <span className="w-1 h-1 rounded-full bg-neutral-400" /> AI Explanation engine
                                          </div>
                                          <p className="text-xs text-neutral-400 leading-relaxed font-mono whitespace-pre-line">
                                            {aiExplanations[quizIdx]}
                                          </p>
                                        </motion.div>
                                    )}
                                  </div>
                              )}
                            </div>
                          </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
            )}

            {/* TAB 2: STUDY COACH */}
            {activeTab === 'coach' && (
                <div className="space-y-8">
                  {loadingAnalytics && (
                      <div className="h-[420px] flex flex-col items-center justify-center border border-neutral-900 bg-neutral-950/20 backdrop-blur-sm rounded-2xl p-16 text-center">
                        <div className="w-8 h-8 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin mb-5" />
                        <h3 className="text-lg font-display font-bold uppercase tracking-wide mb-1.5">Analyzing Quiz attempt sequences</h3>
                        <p className="text-neutral-500 text-xs font-mono max-w-sm leading-relaxed">
                          Connecting to Feign clients to scrape attempt-service and quiz-service records for user ID {user?.id}...
                        </p>
                      </div>
                  )}

                  {!loadingAnalytics && analytics && (
                      <div className="grid md:grid-cols-3 gap-8 items-start">
                        {/* Left Column: Weak Topics & Streaks */}
                        <div className="space-y-6 md:col-span-1">
                          <div className="p-6 bg-neutral-950/40 border border-neutral-900 rounded-2xl space-y-4">
                            <h3 className="text-[10px] font-bold font-mono text-neutral-500 uppercase tracking-widest border-b border-neutral-900 pb-3">
                              Performance Analytics
                            </h3>

                            <div className="space-y-4">
                              <div>
                                <span className="text-[10px] text-neutral-500 font-mono uppercase font-bold block mb-0.5">XP Points</span>
                                <span className="text-3xl font-display font-bold text-white font-mono tracking-tight">{analytics.xpPoints || 120}</span>
                              </div>

                              <div>
                                <span className="text-[10px] text-neutral-500 font-mono uppercase font-bold block mb-0.5">Active Streak</span>
                                <span className="text-3xl font-display font-bold text-white font-mono tracking-tight">{analytics.streakDays || 3} Days</span>
                              </div>

                              <div>
                                <span className="text-[10px] text-neutral-500 font-mono uppercase font-bold block mb-0.5">User Level</span>
                                <span className="text-3xl font-display font-bold text-white font-mono tracking-tight">Lvl {analytics.userLevel || 2}</span>
                              </div>
                            </div>
                          </div>

                          {/* Weak Topics list */}
                          <div className="p-6 bg-neutral-950/40 border border-neutral-900 rounded-2xl space-y-4">
                            <h3 className="text-[10px] font-bold font-mono text-neutral-500 uppercase tracking-widest border-b border-neutral-900 pb-3">
                              Identified Weak Topics
                            </h3>

                            {analytics.weakTopics && analytics.weakTopics.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  {analytics.weakTopics.map((topic, i) => (
                                      <span
                                          key={i}
                                          className="text-[10px] font-bold font-mono border border-neutral-800 text-neutral-300 px-2 py-0.5 rounded bg-neutral-900 uppercase tracking-wide"
                                      >
                              {topic}
                            </span>
                                  ))}
                                </div>
                            ) : (
                                <p className="text-xs text-neutral-600 font-mono">No clear weak topics identified. Keep attempting quizzes!</p>
                            )}
                          </div>
                        </div>

                        {/* Right Column: AI Recommendations */}
                        <div className="md:col-span-2 bg-neutral-950/40 border border-neutral-900 p-6 sm:p-8 rounded-2xl space-y-5">
                          <h3 className="text-xs font-mono font-bold uppercase tracking-widest border-b border-neutral-900 pb-3 text-neutral-400">
                            AI Study Recommendations & Guidance
                          </h3>

                          {analytics.recommendations ? (
                              <div className="p-5 bg-black border border-neutral-900 rounded-xl space-y-3.5">
                                <div className="flex items-center gap-1.5 text-neutral-500 font-mono text-[10px] uppercase font-bold tracking-widest">
                                  <span className="w-1 h-1 rounded-full bg-neutral-400" /> Personalized study recommendation engine
                                </div>
                                <p className="text-xs text-neutral-400 leading-relaxed font-mono whitespace-pre-line">
                                  {analytics.recommendations}
                                </p>
                              </div>
                          ) : (
                              <p className="text-xs text-neutral-600 font-mono py-10 text-center">
                                Attempt a few more quizzes on different topics to enable recommendations.
                              </p>
                          )}

                          <button
                              onClick={loadCoachAnalytics}
                              className="px-5 py-2.5 bg-white text-black hover:bg-neutral-900 hover:text-white border border-white rounded-xl text-xs font-mono font-bold tracking-wider uppercase cursor-pointer transition-all duration-300 flex items-center gap-1.5"
                          >
                            <FiActivity size={14} />
                            <span>Refresh Analytics</span>
                          </button>
                        </div>
                      </div>
                  )}

                  {!loadingAnalytics && !analytics && (
                      <div className="h-[400px] flex flex-col items-center justify-center border border-neutral-900 bg-neutral-950/20 rounded-2xl p-8 text-center">
                        <div className="p-4 bg-neutral-950 border border-neutral-900 rounded-2xl mb-4 text-neutral-600">
                          <FiTrendingUp size={24} />
                        </div>
                        <h3 className="text-base font-bold font-display uppercase tracking-wider text-white">No Analytics Data Scraped</h3>
                        <p className="text-neutral-500 text-xs font-mono max-w-xs mt-1 mb-6 leading-relaxed">
                          We need to fetch your performance profile from attempt-service logs.
                        </p>
                        <button
                            onClick={loadCoachAnalytics}
                            className="px-6 py-2.5 bg-white text-black hover:bg-neutral-900 hover:text-white border border-white rounded-lg text-xs font-mono font-bold tracking-wider uppercase cursor-pointer transition-all duration-200"
                        >
                          Load Analytics
                        </button>
                      </div>
                  )}
                </div>
            )}

            {/* TAB 3: CHATBOT */}
            {activeTab === 'chatbot' && (
                <div className="grid lg:grid-cols-3 gap-8 items-start">
                  {/* Left Column: Learning Path Generator */}
                  <div className="lg:col-span-1 space-y-6">
                    <div className="p-6 bg-neutral-950/40 border border-neutral-900 rounded-2xl space-y-4">
                      <div className="border-b border-neutral-900 pb-3">
                        <h3 className="text-xs font-mono font-bold uppercase tracking-widest flex items-center gap-2 text-neutral-400">
                          <FiBookOpen size={14} /> Study Path Generator
                        </h3>
                      </div>

                      <form onSubmit={handleGeneratePath} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-neutral-500 uppercase font-mono tracking-wider">Topic Area</label>
                          <input
                              type="text"
                              placeholder="e.g. Distributed Consensus in Kafka"
                              className="w-full bg-black border border-neutral-900 focus:border-neutral-700 rounded-lg px-3 py-2 text-xs text-white outline-none transition-colors placeholder:text-neutral-800 font-mono"
                              value={learningPathTopic}
                              onChange={(e) => setLearningPathTopic(e.target.value)}
                              required
                          />
                        </div>

                        <button
                            type="submit"
                            disabled={generatingPath}
                            className="w-full py-2.5 bg-white text-black hover:bg-neutral-900 hover:text-white border border-white font-mono font-bold text-xs tracking-widest uppercase rounded-lg transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {generatingPath ? (
                              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          ) : (
                              <>
                                <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
                                <span>CREATE ROADMAP</span>
                              </>
                          )}
                        </button>
                      </form>

                      {learningPathResult && (
                          <div className="p-4 bg-black border border-neutral-900 rounded-xl space-y-2.5 max-h-[300px] overflow-y-auto">
                            <div className="text-[9px] uppercase font-bold text-neutral-500 font-mono flex items-center gap-1 tracking-widest">
                              <FiFileText size={12} /> Output Timeline
                            </div>
                            <p className="text-xs text-neutral-400 leading-relaxed font-mono whitespace-pre-line">
                              {learningPathResult}
                            </p>
                          </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Chat Dialog Box */}
                  <div className="lg:col-span-2">
                    <div className="bg-neutral-950/40 border border-neutral-900 rounded-2xl h-[560px] flex flex-col justify-between overflow-hidden">
                      {/* Chat Header */}
                      <div className="bg-black/40 border-b border-neutral-900 px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg border border-neutral-800 bg-neutral-900 flex items-center justify-center text-neutral-400 font-bold">
                            <FiCpu size={14} />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold tracking-wide text-white">RAG Chat Assistant</h4>
                            <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest block font-bold">CONNECTED TO VECTORSTORE COLLECTION</span>
                          </div>
                        </div>
                      </div>

                      {/* Message Area */}
                      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-neutral-950/10">
                        {chatHistory.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                  className={`max-w-[80%] rounded-xl p-4 text-xs font-mono leading-relaxed border ${
                                      msg.sender === 'user'
                                          ? 'bg-white text-black border-white shadow-md shadow-white/5'
                                          : 'bg-black text-neutral-300 border-neutral-900'
                                  }`}
                              >
                          <span className={`text-[9px] uppercase font-bold block mb-1.5 opacity-50 tracking-wider ${
                              msg.sender === 'user' ? 'text-black' : 'text-neutral-400'
                          }`}>
                            {msg.sender === 'user' ? 'YOU' : 'AI CO-PILOT'}
                          </span>
                                <p className="whitespace-pre-line">{msg.text}</p>
                              </div>
                            </div>
                        ))}

                        {sendingChat && (
                            <div className="flex justify-start">
                              <div className="bg-black text-neutral-500 border border-neutral-900 rounded-xl p-4 text-xs font-mono flex items-center gap-2.5">
                                <div className="w-3.5 h-3.5 border-2 border-neutral-600 border-t-transparent rounded-full animate-spin" />
                                <span className="tracking-wide">Searching index embeddings...</span>
                              </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                      </div>

                      {/* Message Input Box */}
                      <form onSubmit={handleSendChat} className="bg-black border-t border-neutral-900 p-4 flex gap-2">
                        <input
                            type="text"
                            placeholder="Ask a question on Spring Cloud config loading or Kafka partitions..."
                            className="w-full bg-neutral-950 border border-neutral-900 focus:border-neutral-700 rounded-lg px-4 py-3 text-xs font-mono text-white outline-none placeholder:text-neutral-700 transition-colors"
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            required
                            disabled={sendingChat}
                        />
                        <button
                            type="submit"
                            disabled={sendingChat || !chatMessage.trim()}
                            className="px-5 bg-white text-black hover:bg-neutral-900 hover:text-white border border-white rounded-lg flex items-center justify-center cursor-pointer transition-colors disabled:opacity-50"
                        >
                          <FiSend size={14} />
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default AiAssistant;
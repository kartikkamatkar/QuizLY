import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiCpu, FiCheckSquare, FiAlertCircle, FiBookOpen, 
  FiMessageSquare, FiTrendingUp, FiActivity, FiArrowRight, 
  FiPlus, FiUpload, FiPlay, FiFileText, FiAward, FiSend, 
  FiChevronRight, FiSparkles, FiCheck, FiX, FiInfo
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
    <div className="min-h-screen pt-28 pb-20 px-6 sm:px-8 bg-black mono-grid-bg text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-10 pb-8 border-b border-mono-gray-800">
          <div className="space-y-2">
            <span className="text-xs uppercase font-bold text-mono-gray-400 font-mono tracking-wider flex items-center gap-2">
              <FiSparkles className="animate-pulse" /> Advanced placement toolkit
            </span>
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-white tracking-tight uppercase">
              AI LEARNING HU<span className="bg-white text-black px-1.5 py-0.5 ml-1 rounded">B</span>
            </h1>
          </div>
          
          {/* Stark Navigation Tabs */}
          <div className="flex gap-1.5 p-1 bg-mono-gray-900 border border-mono-gray-800 rounded-xl max-w-max">
            {[
              { id: 'generator', label: 'AI Quiz Gen', icon: FiCpu },
              { id: 'coach', label: 'AI Study Coach', icon: FiTrendingUp },
              { id: 'chatbot', label: 'RAG Assistant', icon: FiMessageSquare }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-mono font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                  activeTab === tab.id 
                    ? 'bg-white text-black border border-white' 
                    : 'text-mono-gray-400 hover:text-white bg-transparent'
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
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Form Input Columns (Col span 1) */}
              <div className="space-y-6 lg:col-span-1">
                <div className="p-6 bg-mono-gray-900 border border-mono-gray-800 rounded-2xl space-y-5">
                  <div className="border-b border-mono-gray-800 pb-3">
                    <h3 className="text-sm font-bold font-display uppercase tracking-wider flex items-center gap-2">
                      <FiCpu /> Generator Options
                    </h3>
                  </div>

                  <form onSubmit={pdfFile ? handleGenerateFromPdf : handleGenerateQuiz} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-mono-gray-400 uppercase font-mono">Quiz Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Master Kafka Pipelines"
                        className="mono-input py-2 text-xs"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-mono-gray-400 uppercase font-mono">Core Topic</label>
                      <input
                        type="text"
                        placeholder="e.g. Consumer Groups and Offsets"
                        className="mono-input py-2 text-xs"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-mono-gray-400 uppercase font-mono">Category</label>
                        <select
                          className="mono-input bg-black py-2 text-xs"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                        >
                          {categories.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-mono-gray-400 uppercase font-mono">Difficulty</label>
                        <select
                          className="mono-input bg-black py-2 text-xs"
                          value={difficulty}
                          onChange={(e) => setDifficulty(e.target.value)}
                        >
                          <option value="EASY">EASY</option>
                          <option value="MEDIUM">MEDIUM</option>
                          <option value="HARD">HARD</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-mono-gray-400 uppercase font-mono">Questions count</label>
                      <select
                        className="mono-input bg-black py-2 text-xs"
                        value={qCount}
                        onChange={(e) => setQCount(e.target.value)}
                      >
                        <option value="3">3 Qs</option>
                        <option value="5">5 Qs</option>
                        <option value="10">10 Qs</option>
                      </select>
                    </div>

                    {/* PDF Upload Area */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-mono-gray-400 uppercase font-mono block">
                        PDF Upload (Optional)
                      </label>
                      
                      {!pdfFile ? (
                        <div
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          className={`border-2 border-dashed rounded-xl p-5 text-center transition-all duration-200 cursor-pointer ${
                            dragOver ? 'border-white bg-white/5' : 'border-mono-gray-800 hover:border-mono-gray-600 bg-black'
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
                            <FiUpload size={22} className="mx-auto text-mono-gray-400" />
                            <span className="text-[10px] text-mono-gray-400 uppercase font-mono tracking-wider block">
                              Drag & Drop PDF or Browse
                            </span>
                          </label>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-3.5 bg-black border border-mono-gray-800 rounded-xl">
                          <div className="flex items-center gap-2 max-w-[80%]">
                            <FiFileText size={18} className="text-white shrink-0" />
                            <span className="text-xs truncate font-mono">{pdfFile.name}</span>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => setPdfFile(null)} 
                            className="p-1 rounded bg-mono-gray-900 border border-mono-gray-800 hover:border-white cursor-pointer"
                          >
                            <FiX size={12} />
                          </button>
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={generating}
                      className="w-full py-3 bg-white text-black hover:bg-black hover:text-white border-2 border-white font-mono font-bold text-xs tracking-widest uppercase rounded-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {generating ? (
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <FiSparkles size={13} />
                          <span>{pdfFile ? 'GENERATE FROM PDF' : 'GENERATE AI QUIZ'}</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* Main Quiz / Results Screen (Col span 2) */}
              <div className="lg:col-span-2">
                <AnimatePresence mode="wait">
                  {generating && (
                    <motion.div 
                      key="generating-loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-full flex flex-col items-center justify-center border border-mono-gray-800 bg-mono-gray-900 rounded-2xl p-16 text-center"
                    >
                      <div className="w-12 h-12 border-2 border-white border-t-transparent rounded-full animate-spin mb-6" />
                      <h3 className="text-xl font-display font-bold uppercase tracking-wider mb-2">Synthesizing Syllabus</h3>
                      <p className="text-mono-gray-400 text-xs font-mono max-w-sm">
                        Spring AI is generating structured JSON questions using LLM schemas and evaluating initial settings...
                      </p>
                    </motion.div>
                  )}

                  {error && (
                    <motion.div 
                      key="error-panel"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-6 bg-black border-l-4 border-white border border-mono-gray-800 rounded-2xl flex items-center gap-4"
                    >
                      <FiAlertCircle className="text-white shrink-0" size={24} />
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold uppercase font-mono text-white">Quiz Generation Error</h4>
                        <p className="text-xs text-mono-gray-400 font-mono">{error}</p>
                      </div>
                    </motion.div>
                  )}

                  {!generating && !error && !generatedQuiz && (
                    <motion.div 
                      key="empty-panel"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-mono-gray-800 bg-mono-gray-900/30 rounded-2xl p-8 text-center"
                    >
                      <FiBookOpen size={48} className="text-mono-gray-600 mb-4" />
                      <h3 className="text-lg font-bold font-display uppercase tracking-wider text-white">No Generated Quiz Active</h3>
                      <p className="text-mono-gray-400 text-xs font-mono max-w-xs mt-1">
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
                      <div className="bg-mono-gray-900 border border-mono-gray-800 p-6 sm:p-8 rounded-2xl space-y-6">
                        <div className="flex justify-between items-center border-b border-mono-gray-800 pb-4">
                          <div className="space-y-1">
                            <span className="text-[10px] text-mono-gray-400 font-mono uppercase tracking-wider block">
                              AI GENERATED QUIZ IN SESSION
                            </span>
                            <h2 className="text-xl font-display font-bold uppercase text-white">
                              {generatedQuiz.title}
                            </h2>
                          </div>
                          <span className="text-[10px] bg-white text-black px-2 py-0.5 rounded font-extrabold font-mono uppercase">
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
                                className={`w-8 h-8 rounded-md text-xs font-mono font-bold transition-all duration-200 cursor-pointer ${
                                  active 
                                    ? 'bg-white text-black border border-white' 
                                    : submitted
                                      ? 'bg-mono-gray-800 text-white border border-mono-gray-600'
                                      : answered
                                        ? 'border border-mono-gray-400 text-mono-gray-200 bg-transparent'
                                        : 'bg-black text-mono-gray-500 border border-mono-gray-800 hover:border-mono-gray-600'
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
                            <h3 className="text-lg font-display font-semibold text-white leading-relaxed">
                              {generatedQuiz.questions[quizIdx].question}
                            </h3>

                            {/* Options */}
                            <div className="space-y-3">
                              {[
                                { key: 'optionA', val: generatedQuiz.questions[quizIdx].optionA, letter: 'A' },
                                { key: 'optionB', val: generatedQuiz.questions[quizIdx].optionB, letter: 'B' },
                                { key: 'optionC', val: generatedQuiz.questions[quizIdx].optionC, letter: 'C' },
                                { key: 'optionD', val: generatedQuiz.questions[quizIdx].optionD, letter: 'D' }
                              ].map(opt => {
                                const isSelected = selectedAnswers[quizIdx] === opt.key;
                                const isCorrect = generatedQuiz.questions[quizIdx].correctAnswer.toLowerCase() === opt.key.toLowerCase();
                                const isSubmitted = submittedAnswers[quizIdx] === true;

                                let btnStyles = 'bg-black text-mono-gray-300 border-mono-gray-800 hover:border-mono-gray-500 hover:text-white';
                                if (isSelected) {
                                  btnStyles = 'bg-white text-black border-white font-semibold';
                                }
                                if (isSubmitted) {
                                  if (isCorrect) {
                                    btnStyles = 'bg-black text-white border-white border-2 font-bold';
                                  } else if (isSelected) {
                                    btnStyles = 'bg-black text-mono-gray-400 border-mono-gray-800 opacity-60';
                                  } else {
                                    btnStyles = 'bg-black text-mono-gray-500 border-mono-gray-900 opacity-40';
                                  }
                                }

                                return (
                                  <button
                                    key={opt.key}
                                    onClick={() => selectOption(opt.key)}
                                    disabled={isSubmitted}
                                    className={`w-full text-left p-3.5 rounded-lg border text-xs sm:text-sm transition-all duration-200 flex items-center justify-between cursor-pointer ${btnStyles}`}
                                  >
                                    <div className="flex items-center gap-3.5">
                                      <span className={`w-6 h-6 rounded border flex items-center justify-center text-[10px] font-mono font-bold shrink-0 ${
                                        isSelected 
                                          ? 'bg-black text-white border-black' 
                                          : 'border-mono-gray-700 text-mono-gray-400'
                                      }`}>
                                        {opt.letter}
                                      </span>
                                      <span>{opt.val}</span>
                                    </div>
                                    {isSubmitted && isCorrect && (
                                      <span className="text-[10px] bg-white text-black px-1.5 py-0.5 rounded font-mono font-extrabold">CORRECT</span>
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
                                  className="px-5 py-2.5 bg-white text-black hover:bg-black hover:text-white border-2 border-white rounded-lg text-xs font-mono font-bold tracking-wider uppercase cursor-pointer disabled:opacity-50 transition-colors"
                                >
                                  Check Answer
                                </button>
                              ) : (
                                <div className="flex items-center gap-3 w-full">
                                  <button
                                    onClick={explainAnswer}
                                    disabled={explainingIdx === quizIdx}
                                    className="px-5 py-2.5 bg-black text-white hover:bg-white hover:text-black border-2 border-mono-gray-800 hover:border-white rounded-lg text-xs font-mono font-bold tracking-wider uppercase cursor-pointer transition-all duration-200 flex items-center gap-2"
                                  >
                                    {explainingIdx === quizIdx ? (
                                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : <FiCpu size={12} />}
                                    <span>Ask AI Explanation</span>
                                  </button>

                                  {quizIdx < generatedQuiz.questions.length - 1 && (
                                    <button
                                      onClick={() => setQuizIdx(quizIdx + 1)}
                                      className="px-5 py-2.5 bg-transparent border border-mono-gray-700 text-white hover:border-white rounded-lg text-xs font-mono font-bold tracking-wider uppercase cursor-pointer transition-all duration-200 ml-auto flex items-center gap-1"
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
                                className="p-5 bg-black border border-mono-gray-800 rounded-xl space-y-2 mt-4"
                              >
                                <div className="flex items-center gap-1.5 text-mono-gray-400 font-mono text-[10px] uppercase font-bold">
                                  <FiSparkles /> AIExplanation engine
                                </div>
                                <p className="text-xs text-mono-gray-300 leading-relaxed font-mono whitespace-pre-line">
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
                <div className="h-[400px] flex flex-col items-center justify-center border border-mono-gray-800 bg-mono-gray-900 rounded-2xl p-16 text-center">
                  <div className="w-12 h-12 border-2 border-white border-t-transparent rounded-full animate-spin mb-6" />
                  <h3 className="text-xl font-display font-bold uppercase tracking-wider mb-2">Analyzing Quiz attempt sequences</h3>
                  <p className="text-mono-gray-400 text-xs font-mono max-w-sm">
                    Connecting to Feign clients to scrape attempt-service and quiz-service records for user ID {user?.id}...
                  </p>
                </div>
              )}

              {!loadingAnalytics && analytics && (
                <div className="grid md:grid-cols-3 gap-8">
                  {/* Left Column: Weak Topics & Streaks (Col span 1) */}
                  <div className="space-y-6 md:col-span-1">
                    <div className="p-6 bg-mono-gray-900 border border-mono-gray-800 rounded-2xl space-y-4">
                      <h3 className="text-xs font-bold font-mono text-mono-gray-400 uppercase tracking-wider border-b border-mono-gray-800 pb-3">
                        Performance Analytics
                      </h3>
                      
                      <div className="space-y-3">
                        <div>
                          <span className="text-[10px] text-mono-gray-500 font-mono uppercase font-bold block mb-1">XP Points</span>
                          <span className="text-3xl font-display font-bold text-white font-mono">{analytics.xpPoints || 120}</span>
                        </div>

                        <div>
                          <span className="text-[10px] text-mono-gray-500 font-mono uppercase font-bold block mb-1">Active Streak</span>
                          <span className="text-3xl font-display font-bold text-white font-mono">{analytics.streakDays || 3} Days</span>
                        </div>

                        <div>
                          <span className="text-[10px] text-mono-gray-500 font-mono uppercase font-bold block mb-1">User Level</span>
                          <span className="text-3xl font-display font-bold text-white font-mono">Lvl {analytics.userLevel || 2}</span>
                        </div>
                      </div>
                    </div>

                    {/* Weak Topics list */}
                    <div className="p-6 bg-mono-gray-900 border border-mono-gray-800 rounded-2xl space-y-4">
                      <h3 className="text-xs font-bold font-mono text-mono-gray-400 uppercase tracking-wider border-b border-mono-gray-800 pb-3">
                        Identified Weak Topics
                      </h3>

                      {analytics.weakTopics && analytics.weakTopics.length > 0 ? (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {analytics.weakTopics.map((topic, i) => (
                            <span 
                              key={i} 
                              className="text-[10px] font-bold font-mono border border-white text-white px-2 py-1 rounded bg-black uppercase"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-mono-gray-500 font-mono">No clear weak topics identified. Keep attempting quizzes!</p>
                      )}
                    </div>
                  </div>

                  {/* Right Column: AI Recommendations (Col span 2) */}
                  <div className="md:col-span-2 bg-mono-gray-900 border border-mono-gray-800 p-6 sm:p-8 rounded-2xl space-y-5">
                    <h3 className="text-sm font-bold font-display uppercase tracking-wider border-b border-mono-gray-800 pb-3">
                      AI Study Recommendations & Guidance
                    </h3>
                    
                    {analytics.recommendations ? (
                      <div className="p-5 bg-black border border-mono-gray-800 rounded-xl space-y-4">
                        <div className="flex items-center gap-2 text-mono-gray-400 font-mono text-[10px] uppercase font-bold">
                          <FiSparkles /> Personalized study recommendation engine
                        </div>
                        <p className="text-xs text-mono-gray-300 leading-relaxed font-mono whitespace-pre-line">
                          {analytics.recommendations}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-mono-gray-500 font-mono py-10 text-center">
                        Attempt a few more quizzes on different topics to enable recommendations.
                      </p>
                    )}

                    <button
                      onClick={loadCoachAnalytics}
                      className="px-5 py-2.5 bg-white text-black hover:bg-black hover:text-white border border-white rounded-lg text-xs font-mono font-bold tracking-wider uppercase cursor-pointer transition-all duration-200 flex items-center gap-1"
                    >
                      <FiActivity size={12} />
                      <span>Refresh Analytics</span>
                    </button>
                  </div>
                </div>
              )}

              {!loadingAnalytics && !analytics && (
                <div className="h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-mono-gray-800 bg-mono-gray-900/30 rounded-2xl p-8 text-center">
                  <FiTrendingUp size={48} className="text-mono-gray-600 mb-4" />
                  <h3 className="text-lg font-bold font-display uppercase tracking-wider text-white">No Analytics Data Scraped</h3>
                  <p className="text-mono-gray-400 text-xs font-mono max-w-xs mt-1 mb-6">
                    We need to fetch your performance profile from attempt-service logs.
                  </p>
                  <button
                    onClick={loadCoachAnalytics}
                    className="px-6 py-3 bg-white text-black hover:bg-black hover:text-white border-2 border-white rounded-lg text-xs font-mono font-bold tracking-wider uppercase cursor-pointer transition-all duration-200"
                  >
                    Load Analytics
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CHATBOT */}
          {activeTab === 'chatbot' && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column: Learning Path Generator */}
              <div className="lg:col-span-1 space-y-6">
                <div className="p-6 bg-mono-gray-900 border border-mono-gray-800 rounded-2xl space-y-4">
                  <div className="border-b border-mono-gray-800 pb-3">
                    <h3 className="text-sm font-bold font-display uppercase tracking-wider flex items-center gap-2">
                      <FiBookOpen /> Study Path Generator
                    </h3>
                  </div>

                  <form onSubmit={handleGeneratePath} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-mono-gray-400 uppercase font-mono">Topic Area</label>
                      <input
                        type="text"
                        placeholder="e.g. Distributed Consensus in Kafka"
                        className="mono-input py-2 text-xs"
                        value={learningPathTopic}
                        onChange={(e) => setLearningPathTopic(e.target.value)}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={generatingPath}
                      className="w-full py-2.5 bg-white text-black hover:bg-black hover:text-white border-2 border-white font-mono font-bold text-xs tracking-wider uppercase rounded-lg transition-all duration-300 flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {generatingPath ? (
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <FiSparkles size={12} />
                          <span>CREATE ROADMAP</span>
                        </>
                      )}
                    </button>
                  </form>

                  {learningPathResult && (
                    <div className="p-4 bg-black border border-mono-gray-800 rounded-xl space-y-2 max-h-[300px] overflow-y-auto">
                      <div className="text-[10px] uppercase font-bold text-mono-gray-400 font-mono flex items-center gap-1">
                        <FiFileText /> Output Timeline
                      </div>
                      <p className="text-xs text-mono-gray-300 leading-relaxed font-mono whitespace-pre-line">
                        {learningPathResult}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Chat Dialog Box */}
              <div className="lg:col-span-2">
                <div className="bg-mono-gray-900 border border-mono-gray-800 rounded-2xl h-[550px] flex flex-col justify-between overflow-hidden">
                  {/* Chat Header */}
                  <div className="bg-black border-b border-mono-gray-800 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg border border-mono-gray-600 bg-mono-gray-900 flex items-center justify-center text-white font-bold">
                        <FiCpu size={14} />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold tracking-wide text-white">RAG Chat Assistant</h4>
                        <span className="text-[9px] font-mono text-mono-gray-400 uppercase tracking-widest block">CONNECTED TO VECTORSTORE COLLECTION</span>
                      </div>
                    </div>
                  </div>

                  {/* Message Area */}
                  <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-mono-gray-900/50">
                    {chatHistory.map((msg, i) => (
                      <div 
                        key={i} 
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[80%] rounded-xl p-4 text-xs font-mono leading-relaxed border ${
                            msg.sender === 'user' 
                              ? 'bg-white text-black border-white' 
                              : 'bg-black text-mono-gray-200 border-mono-gray-800'
                          }`}
                        >
                          <span className="text-[9px] uppercase font-bold block mb-1.5 opacity-60">
                            {msg.sender === 'user' ? 'YOU' : 'AI CO-PILOT'}
                          </span>
                          <p className="whitespace-pre-line">{msg.text}</p>
                        </div>
                      </div>
                    ))}
                    
                    {sendingChat && (
                      <div className="flex justify-start">
                        <div className="bg-black text-mono-gray-400 border border-mono-gray-800 rounded-xl p-4 text-xs font-mono flex items-center gap-2.5">
                          <div className="w-3.5 h-3.5 border-2 border-mono-gray-400 border-t-transparent rounded-full animate-spin" />
                          <span>Searching index embeddings...</span>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Message Input Box */}
                  <form onSubmit={handleSendChat} className="bg-black border-t border-mono-gray-800 p-4 flex gap-2">
                    <input
                      type="text"
                      placeholder="Ask a question on Spring Cloud config loading or Kafka partitions..."
                      className="mono-input flex-1 py-3 px-4 text-xs font-mono bg-mono-gray-900 border-mono-gray-800 focus:border-white"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      required
                      disabled={sendingChat}
                    />
                    <button
                      type="submit"
                      disabled={sendingChat || !chatMessage.trim()}
                      className="px-5 bg-white text-black hover:bg-black hover:text-white border border-white rounded-lg flex items-center justify-center cursor-pointer transition-colors disabled:opacity-50"
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

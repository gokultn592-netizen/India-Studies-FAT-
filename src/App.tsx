import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Trophy, 
  Brain, 
  ShieldCheck, 
  History
} from 'lucide-react';
import { questions, Question } from './data/questions';


const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      const target = e.target as HTMLElement;
      setIsPointer(window.getComputedStyle(target).cursor === 'pointer');
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 rounded-full border border-[#5A5A40] pointer-events-none z-[9999] mix-blend-difference hidden md:block"
      animate={{
        x: position.x - 16,
        y: position.y - 16,
        scale: isPointer ? 1.5 : 1,
        backgroundColor: isPointer ? "rgba(90, 90, 64, 0.2)" : "rgba(90, 90, 64, 0)",
      }}
      transition={{ type: "spring", damping: 20, stiffness: 250, mass: 0.5 }}
    />
  );
};

const SpotlightCard = ({ children, className = "", spotlightColor = "rgba(90, 90, 64, 0.12)", ...props }: { children: React.ReactNode, className?: string, spotlightColor?: string, [key: string]: any }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      {...props}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative overflow-hidden ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 z-10"
        style={{
          opacity,
          background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`,
        }}
      />
      <div className="relative z-20 h-full w-full">
        {children}
      </div>
    </div>
  );
};

const AnimatedNumber = ({ value }: { value: number }) => {
  return (
    <motion.span
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      key={value}
      className="inline-block"
    >
      {value}
    </motion.span>
  );
};

type QuizState = 'setup' | 'quiz' | 'results';

export default function App() {
  const [state, setState] = useState<QuizState>('setup');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState(0);


  const startQuiz = () => {
    let filteredQuestions = [...questions];
    if (selectedModules.length > 0) {
      filteredQuestions = filteredQuestions.filter(q => selectedModules.includes(q.category));
    }
    
    const shuffled = filteredQuestions.sort(() => 0.5 - Math.random());
    const count = Math.min(questionCount, shuffled.length);
    setSelectedQuestions(shuffled.slice(0, count));
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setScore(0);

    setState('quiz');
  };

  const handleAnswer = async (answer: string) => {
    const currentQuestion = selectedQuestions[currentQuestionIndex];
    if (userAnswers[currentQuestion.id]) return;

    setUserAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }));
    
    if (answer === currentQuestion.answer) {
      setScore(prev => prev + 1);
    }


  };

  const nextQuestion = () => {
    if (currentQuestionIndex < selectedQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setState('results');
    }
  };

  const getResultComment = () => {
    const percentage = (score / selectedQuestions.length) * 100;
    if (percentage === 100) return "Outstanding! You are a master of this subject.";
    if (percentage >= 80) return "Excellent work! You have a very strong grasp of the material.";
    if (percentage >= 60) return "Good job! You have a solid foundation, but there's room for improvement.";
    if (percentage >= 40) return "Not bad, but you might want to review some sections.";
    return "Keep studying! Focus on the areas suggested below to improve your score.";
  };

  const getWeakAreas = () => {
    const categoryStats: Record<string, { total: number; correct: number }> = {};
    
    selectedQuestions.forEach(q => {
      if (!categoryStats[q.category]) {
        categoryStats[q.category] = { total: 0, correct: 0 };
      }
      categoryStats[q.category].total += 1;
      if (userAnswers[q.id] === q.answer) {
        categoryStats[q.category].correct += 1;
      }
    });

    return Object.entries(categoryStats)
      .filter(([_, stats]) => (stats.correct / stats.total) < 0.7)
      .map(([category]) => category);
  };

  const currentQuestion = selectedQuestions[currentQuestionIndex];

  return (
    <div className="relative min-h-screen bg-[#F5F5F0] text-[#141414] font-sans selection:bg-[#5A5A40] selection:text-white overflow-hidden md:cursor-none">
      <CustomCursor />
      {/* Background Patterns */}
      <div className="absolute inset-0 bg-grid opacity-[0.4] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#F5F5F0]/50 to-[#F5F5F0] pointer-events-none" />
      
      {/* Decoroative Blurs */}
      <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-[#5A5A40]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[40%] -right-[10%] w-[30%] h-[50%] bg-[#A8A880]/5 blur-[100px] rounded-full pointer-events-none animate-pulse" />

      <header className="border-b border-[#141414]/5 py-6 px-8 flex justify-between items-center bg-white/40 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#5A5A40] rounded-full flex items-center justify-center text-white">
            <BookOpen size={20} />
          </div>
          <h1 className="text-xl font-medium tracking-tight">Indian Studies FAT Exam</h1>
        </div>
        {state === 'quiz' && (
          <div className="flex flex-col items-end gap-2">
            <div className="text-sm font-mono opacity-60">
              Question {currentQuestionIndex + 1} of {selectedQuestions.length}
            </div>
            <div className="w-32 h-1.5 bg-[#141414]/5 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-[#5A5A40]"
                initial={{ width: 0 }}
                animate={{ width: `${((currentQuestionIndex + 1) / selectedQuestions.length) * 100}%` }}
                transition={{ type: 'spring', stiffness: 50 }}
              />
            </div>
          </div>
        )}
      </header>

      <main className="max-w-3xl mx-auto py-12 px-6">
        <AnimatePresence mode="wait">
          {state === 'setup' ? (
            <motion.div 
              key="setup"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="space-y-12"
            >
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#5A5A40]/10 text-[#5A5A40] rounded-full text-[10px] font-mono uppercase tracking-[0.2em] font-bold">
                  <div className="w-1.5 h-1.5 bg-[#5A5A40] rounded-full animate-pulse" />
                  Knowledge Assessment 2026
                </div>
                <h2 className="text-6xl md:text-7xl font-serif italic leading-[1.1] tracking-tight">
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="block"
                  >
                    Test your knowledge.
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="block text-[#5A5A40]/40"
                  >
                    Enhance your wisdom.
                  </motion.span>
                </h2>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl opacity-70 max-w-xl font-light leading-relaxed"
                >
                  Explore traditional wisdom, cultural history, and the constitutional framework of India through a meticulously crafted assessment.
                </motion.p>
              </div>

              <SpotlightCard className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-1 shadow-sm border border-[#141414]/5">
                <div className="relative z-20 p-8 space-y-10">
                  <div className="space-y-6">
                    <label className="text-[10px] font-mono uppercase tracking-[0.25em] opacity-40 font-bold block">
                      Assessment Length
                    </label>
                    <div className="grid grid-cols-5 gap-3">
                      {[10, 20, 30, 50, 100].map((n, i) => (
                        <motion.button
                          key={n}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 + i * 0.05 }}
                          whileHover={{ y: -5, scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setQuestionCount(n)}
                          className={`group relative overflow-hidden py-5 rounded-2xl border transition-all duration-500 ${
                            questionCount === n 
                              ? 'bg-[#141414] text-white border-[#141414] shadow-xl' 
                              : 'bg-white/50 border-[#141414]/10 hover:border-[#5A5A40]/50'
                          }`}
                        >
                          <span className="relative z-10 text-lg font-medium tracking-tight">{n}</span>
                          {questionCount === n && (
                            <motion.div 
                              layoutId="activeCount"
                              className="absolute inset-0 bg-gradient-to-br from-[#5A5A40]/20 to-transparent"
                              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <label className="text-[10px] font-mono uppercase tracking-[0.25em] opacity-40 font-bold block">
                      Subject Modules
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { id: 'Module 1', label: "Module 1", sub: "Heritage & Culture", icon: Brain, color: "bg-amber-100/50 text-amber-900" },
                        { id: 'Module 2', label: "Module 2", sub: "Ancient Science", icon: Trophy, color: "bg-emerald-100/50 text-emerald-900" },
                        { id: 'Module 3', label: "Module 3", sub: "Constitution Intro", icon: History, color: "bg-blue-100/50 text-blue-900" },
                        { id: 'Module 4', label: "Module 4", sub: "Rights & Duties", icon: ShieldCheck, color: "bg-rose-100/50 text-rose-900" },
                        { id: 'Module 5', label: "Module 5", sub: "Legal Processes", icon: BookOpen, color: "bg-purple-100/50 text-purple-900" },
                        { id: 'Module 6', label: "Module 6", sub: "Contemporary", icon: ArrowRight, color: "bg-gray-100/50 text-gray-900" },
                      ].map((item, i) => (
                        <motion.button
                          key={item.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 + i * 0.05 }}
                          whileHover={{ y: -6, scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => {
                            setSelectedModules(prev => 
                              prev.includes(item.id) 
                                ? prev.filter(id => id !== item.id) 
                                : [...prev, item.id]
                            );
                          }}
                          className={`flex items-center gap-4 p-5 rounded-3xl border transition-all duration-700 group relative ${
                            selectedModules.includes(item.id)
                              ? 'bg-[#5A5A40] text-white border-[#5A5A40] shadow-2xl shadow-[#5A5A40]/20' 
                              : 'bg-white/40 border-[#141414]/5 hover:bg-white hover:border-[#5A5A40]/20'
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:rotate-12 ${
                            selectedModules.includes(item.id) ? 'bg-white/20 text-white' : item.color
                          }`}>
                            <item.icon size={22} />
                          </div>
                          <div className="flex flex-col text-left">
                            <span className="text-[10px] font-mono opacity-50 uppercase tracking-widest">{item.label}</span>
                            <span className="text-sm font-bold tracking-tight">{item.sub}</span>
                          </div>
                          {selectedModules.includes(item.id) && (
                            <motion.div 
                              layoutId={`check-${item.id}`}
                              className="absolute top-3 right-3 text-white/40"
                            >
                              <CheckCircle2 size={16} />
                            </motion.div>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01, y: -2 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={startQuiz}
                    className="w-full py-6 bg-[#141414] text-white rounded-3xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-[#2A2A2A] shadow-2xl shadow-[#141414]/20 transition-all group"
                  >
                    Begin Assessment
                    <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform duration-500" />
                  </motion.button>
                </div>
              </SpotlightCard>
            </motion.div>
          ) : state === 'quiz' && currentQuestion ? (
            <motion.div 
              key="quiz"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              <div className="space-y-4">
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex justify-between items-center"
                >
                  <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#5A5A40] font-bold bg-[#5A5A40]/10 px-3 py-1 rounded-full">
                    {currentQuestion.category}
                  </span>
                </motion.div>
                <h2 className="text-4xl md:text-5xl font-serif leading-[1.1] tracking-tight">
                  {currentQuestion.question}
                </h2>
              </div>

              <div className="grid gap-3">
                <AnimatePresence mode="popLayout">
                  {currentQuestion.options.map((option, i) => {
                    const isSelected = userAnswers[currentQuestion.id] === option;
                    const isCorrect = option === currentQuestion.answer;
                    const hasAnswered = !!userAnswers[currentQuestion.id];

                    let buttonClass = "w-full p-6 rounded-[2rem] border-2 text-left transition-all duration-500 flex justify-between items-center relative overflow-hidden group ";
                    
                    if (!hasAnswered) {
                      buttonClass += "bg-white border-[#141414]/5 hover:border-[#5A5A40] hover:shadow-xl hover:shadow-[#5A5A40]/5";
                    } else {
                      if (isCorrect) {
                        buttonClass += "bg-emerald-50 border-emerald-500 text-emerald-900";
                      } else if (isSelected) {
                        buttonClass += "bg-rose-50 border-rose-500 text-rose-900";
                      } else {
                        buttonClass += "bg-white border-[#141414]/5 opacity-40 grayscale-[0.5]";
                      }
                    }

                    return (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={!hasAnswered ? { scale: 1.01, x: 10 } : {}}
                        whileTap={!hasAnswered ? { scale: 0.99 } : {}}
                        disabled={hasAnswered}
                        onClick={() => handleAnswer(option)}
                        className={buttonClass}
                      >
                        <span className="relative z-10 font-bold text-lg tracking-tight">{option}</span>
                        <div className="relative z-10">
                          {hasAnswered && isCorrect && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                              <CheckCircle2 size={24} className="text-emerald-500" />
                            </motion.div>
                          )}
                          {hasAnswered && isSelected && !isCorrect && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                              <XCircle size={24} className="text-rose-500" />
                            </motion.div>
                          )}
                        </div>
                        {!hasAnswered && (
                          <div className="absolute inset-0 bg-gradient-to-r from-[#5A5A40]/0 via-[#5A5A40]/5 to-[#5A5A40]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        )}
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </div>

                {userAnswers[currentQuestion.id] && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    key="answer-feedback"
                    className="space-y-6"
                  >
                    <motion.button
                      whileHover={{ scale: 1.01, y: -2 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={nextQuestion}
                      className="w-full py-6 bg-[#5A5A40] text-white rounded-3xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-[#4A4A30] shadow-xl shadow-[#5A5A40]/20 transition-all group"
                    >
                      {currentQuestionIndex === selectedQuestions.length - 1 ? 'Conclude Assessment' : 'Next Question'}
                      <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform duration-500" />
                    </motion.button>
                  </motion.div>
                )}
            </motion.div>
          ) : (
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12 pb-20"
            >
              <div className="text-center space-y-6">
                <motion.div 
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                  className="inline-flex items-center justify-center w-32 h-32 bg-amber-100 text-amber-600 rounded-[2.5rem] shadow-xl shadow-amber-200/50"
                >
                  <Trophy size={60} />
                </motion.div>
                <div className="space-y-2">
                  <h2 className="text-5xl md:text-6xl font-serif italic">Assessment Concluded</h2>
                  <p className="text-xl opacity-60 italic max-w-lg mx-auto leading-relaxed">"{getResultComment()}"</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SpotlightCard className="bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] border border-[#141414]/5 text-center space-y-3">
                  <span className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-40 font-bold">Wisdom Score</span>
                  <div className="text-7xl font-serif font-bold text-[#5A5A40] tracking-tighter">
                    <AnimatedNumber value={score} />
                    <span className="text-3xl opacity-20 font-light ml-1">/ {selectedQuestions.length}</span>
                  </div>
                </SpotlightCard>
                
                <SpotlightCard className="bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] border border-[#141414]/5 text-center space-y-3">
                  <span className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-40 font-bold">Accuracy Metric</span>
                  <div className="text-7xl font-serif font-bold text-[#5A5A40] tracking-tighter">
                    <AnimatedNumber value={Math.round((score / selectedQuestions.length) * 100)} />
                    <span className="text-3xl opacity-20 font-light ml-1">%</span>
                  </div>
                </SpotlightCard>
              </div>

              <div className="space-y-8">
                <SpotlightCard className="bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] border border-[#141414]/5 space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-serif italic">Analytical Overview</h3>
                    <div className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-mono uppercase tracking-widest font-bold">
                      Performance Tracking
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 font-bold block">Areas of Mastery / Focus</span>
                    <div className="flex flex-wrap gap-3">
                      {getWeakAreas().length > 0 ? (
                        getWeakAreas().map((area, i) => (
                          <motion.span 
                            key={area} 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="px-5 py-2.5 bg-rose-50 text-rose-700 rounded-2xl text-sm font-bold border border-rose-100 shadow-sm"
                          >
                            {area}
                          </motion.span>
                        ))
                      ) : (
                        <motion.span 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="px-5 py-2.5 bg-emerald-50 text-emerald-700 rounded-2xl text-sm font-bold border border-emerald-100 shadow-sm flex items-center gap-2"
                        >
                          <ShieldCheck size={16} />
                          Full Heritage Mastery
                        </motion.span>
                      )}
                    </div>
                  </div>
                </SpotlightCard>

                {selectedQuestions.some(q => userAnswers[q.id] !== q.answer) && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                      <div className="h-px flex-1 bg-[#141414]/5" />
                      <span className="text-[10px] font-mono uppercase tracking-[0.4em] opacity-30 font-bold text-center">Question Audit</span>
                      <div className="h-px flex-1 bg-[#141414]/5" />
                    </div>
                    
                    <div className="space-y-4">
                      {selectedQuestions
                        .filter(q => userAnswers[q.id] !== q.answer)
                        .map((q, idx) => (
                          <SpotlightCard key={q.id} className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] border border-[#141414]/5 space-y-6 group">
                            <div className="flex items-start gap-4">
                              <span className="text-xs font-mono opacity-20 mt-1 font-bold">0{idx + 1}</span>
                              <div className="space-y-4 flex-1">
                                <p className="text-xl font-bold tracking-tight leading-snug">{q.question}</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100">
                                    <span className="text-[10px] font-mono uppercase text-rose-400 block mb-1">Your Submission</span>
                                    <span className="text-rose-700 font-bold">{userAnswers[q.id]}</span>
                                  </div>
                                  <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                                    <span className="text-[10px] font-mono uppercase text-emerald-400 block mb-1">Correct wisdom</span>
                                    <span className="text-emerald-700 font-bold">{q.answer}</span>
                                  </div>
                                </div>

                              </div>
                            </div>
                          </SpotlightCard>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.01, y: -2 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setState('setup')}
                className="w-full py-6 bg-white border-2 border-[#141414] text-[#141414] rounded-[2rem] font-bold text-lg flex items-center justify-center gap-3 hover:bg-[#141414] hover:text-white shadow-xl transition-all group"
              >
                <RotateCcw size={20} className="group-hover:rotate-[-180deg] transition-transform duration-700" />
                Return to Sanctuary
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="py-12 px-8 border-t border-[#141414]/5 text-center">
        <p className="text-xs font-mono opacity-40 uppercase tracking-widest">
          Made by Thalaivar and Regal 
        </p>
      </footer>
    </div>
  );
}

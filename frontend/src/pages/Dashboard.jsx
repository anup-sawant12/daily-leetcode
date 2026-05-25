import React, { useState, useContext, useEffect } from 'react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { ExternalLink, CheckCircle2, Circle, Sparkles, StickyNote, Flame, Clock, Trophy, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const [dailySet, setDailySet] = useState(null);
  const [solvedMap, setSolvedMap] = useState({});
  const [loading, setLoading] = useState(true);
  const { user, setUser } = useContext(AuthContext);
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState({});
  const [activeNoteQuestionId, setActiveNoteQuestionId] = useState(null);
  const [noteInput, setNoteInput] = useState('');
  const [timeLeft, setTimeLeft] = useState('00:00:00');

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date().toISOString().split('T')[0]);
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  // Live countdown timer until next midnight local time
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setHours(24, 0, 0, 0); // Next midnight
      const diff = tomorrow - now;
      if (diff <= 0) return '00:00:00';
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };
    
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      await api.post('/daily-sets/generate');
      const res = await api.get('/daily-sets/today');
      setDailySet(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error generating set', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [setRes, solvedRes, notesRes] = await Promise.all([
          api.get('/daily-sets/today'),
          api.get('/daily-sets/solved'),
          api.get('/notes')
        ]);
        setDailySet(setRes.data);
        
        const map = {};
        solvedRes.data.forEach(sq => {
          if (sq.question) {
            map[sq.question._id] = sq.solveCount || 1;
          }
        });
        setSolvedMap(map);
        
        const notesMap = {};
        notesRes.data.forEach(note => {
          notesMap[note.question] = note.content;
        });
        setNotes(notesMap);
      } catch (error) {
        console.error('Error fetching data', error);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleToggleNote = (questionId) => {
    if (activeNoteQuestionId === questionId) {
      setActiveNoteQuestionId(null);
      setNoteInput('');
    } else {
      setActiveNoteQuestionId(questionId);
      setNoteInput(notes[questionId] || '');
    }
  };

  const handleSaveNote = async (questionId) => {
    try {
      const res = await api.put(`/notes/${questionId}`, { content: noteInput });
      if (res.data.status === 'deleted' || res.data.status === 'noop') {
        const newNotes = { ...notes };
        delete newNotes[questionId];
        setNotes(newNotes);
      } else {
        setNotes({
          ...notes,
          [questionId]: res.data.content
        });
      }
      setActiveNoteQuestionId(null);
      setNoteInput('');
    } catch (error) {
      console.error('Error saving note', error);
    }
  };

  const handleMarkSolved = async (id) => {
    try {
      const res = await api.post(`/daily-sets/solve/${id}`);
      if (res.data.status === 'unsolved') {
        const newSolvedMap = { ...solvedMap };
        delete newSolvedMap[id];
        setSolvedMap(newSolvedMap);
      } else {
        setSolvedMap({
          ...solvedMap,
          [id]: 1
        });
        if (res.data.streak !== undefined) {
          setUser({ ...user, streak: res.data.streak });
        }
      }
    } catch (error) {
      console.error('Error marking solved', error);
    }
  };

  const handleIncrementSolve = async (id) => {
    try {
      const res = await api.post(`/daily-sets/solve/${id}/increment`);
      setSolvedMap({
        ...solvedMap,
        [id]: res.data.solveCount
      });
    } catch (error) {
      console.error('Error incrementing solve count', error);
    }
  };

  const handleDecrementSolve = async (id) => {
    try {
      const res = await api.post(`/daily-sets/solve/${id}/decrement`);
      if (res.data.status === 'unsolved') {
        const newSolvedMap = { ...solvedMap };
        delete newSolvedMap[id];
        setSolvedMap(newSolvedMap);
      } else {
        setSolvedMap({
          ...solvedMap,
          [id]: res.data.solveCount
        });
      }
    } catch (error) {
      console.error('Error decrementing solve count', error);
    }
  };

  const getDifficultyStyles = (diff) => {
    switch (diff) {
      case 'Easy': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 glow-emerald';
      case 'Medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/20 glow-amber';
      case 'Hard': return 'text-rose-400 bg-rose-500/10 border-rose-500/20 glow-rose';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4 animate-pulse">
        <div className="flex flex-col md:flex-row justify-between mb-10 gap-6">
          <div className="h-16 bg-white/5 rounded-2xl w-1/3 backdrop-blur-md"></div>
          <div className="h-16 bg-white/5 rounded-2xl w-1/4 backdrop-blur-md"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-white/5 rounded-2xl border border-white/5"></div>
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 glass-panel rounded-2xl border border-white/5"></div>
          ))}
        </div>
      </div>
    );
  }

  const progressCount = Object.keys(solvedMap).filter(id => dailySet?.questions.some(q => q._id === id)).length;
  const totalQuestions = dailySet?.questions?.length || 6;
  const progressPercent = (progressCount / totalQuestions) * 100;

  // Circular Progress calculations
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8 relative z-10">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md flex items-center gap-3">
            <span>Daily Challenge</span>
            <Sparkles className="text-blue-400 animate-pulse" size={28} />
          </h1>
          <p className="text-slate-400 mt-2 text-md sm:text-lg">
            Solve today's selection to secure your progress. Happy hacking!
          </p>
        </div>
      </div>

      {/* Top Level Quick Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {/* Metric 1: Streak */}
        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between border border-white/5 bg-slate-900/40 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full filter blur-xl pointer-events-none transition-all group-hover:bg-amber-500/10"></div>
          <div>
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Current Streak</div>
            <div className="text-3xl font-black text-white mt-1.5 flex items-baseline gap-1">
              {user?.streak || 0}
              <span className="text-xs text-amber-500 font-semibold">days</span>
            </div>
          </div>
          <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)] group-hover:scale-110 transition-transform">
            <Flame size={24} className="fill-amber-500/10" />
          </div>
        </div>

        {/* Metric 2: Complete Status Circular */}
        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between border border-white/5 bg-slate-900/40 relative overflow-hidden group col-span-1 sm:col-span-2 lg:col-span-2">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full filter blur-xl pointer-events-none transition-all group-hover:bg-blue-500/10"></div>
          <div className="flex-1">
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Today's Progress</div>
            <div className="text-3xl font-black text-white mt-1.5">
              {progressCount} <span className="text-lg text-slate-500">/ {totalQuestions}</span>
            </div>
            
            {/* Small status dots for individual questions */}
            <div className="flex gap-1.5 mt-3.5">
              {dailySet?.questions?.map((q, idx) => {
                const isSolved = !!solvedMap[q._id];
                return (
                  <div 
                    key={q._id} 
                    className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                      isSolved 
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' 
                        : 'bg-slate-800'
                    }`}
                    title={`Question ${idx + 1}`}
                  />
                );
              })}
            </div>
          </div>

          <div className="relative flex items-center justify-center ml-4">
            <svg className="w-18 h-18 transform -rotate-90">
              <circle cx="36" cy="36" r={radius} className="text-slate-800" strokeWidth="5" fill="transparent" />
              <circle 
                cx="36" 
                cy="36" 
                r={radius} 
                className="text-blue-500 transition-all duration-500 ease-out" 
                strokeWidth="5" 
                strokeDasharray={circumference} 
                strokeDashoffset={strokeDashoffset} 
                strokeLinecap="round" 
                stroke="url(#progress-grad)" 
                fill="transparent" 
              />
              <defs>
                <linearGradient id="progress-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute font-bold text-xs text-white">
              {Math.round(progressPercent)}%
            </div>
          </div>
        </div>

        {/* Metric 3: Time Countdown */}
        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between border border-white/5 bg-slate-900/40 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full filter blur-xl pointer-events-none transition-all group-hover:bg-indigo-500/10"></div>
          <div>
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Next Challenge In</div>
            <div className="text-3xl font-black text-indigo-400 mt-1.5 font-mono tracking-wider drop-shadow-sm">
              {timeLeft}
            </div>
          </div>
          <div className="bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.1)] group-hover:scale-110 transition-transform">
            <Clock size={24} />
          </div>
        </div>
      </div>

      {(!dailySet || (dailySet && dailySet.date !== currentDate)) ? (
        <div className="text-center py-20 glass-panel rounded-3xl flex flex-col items-center justify-center relative overflow-hidden border border-white/5 shadow-2xl bg-slate-950/20 backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none"></div>
          <div className="bg-blue-600/10 p-5 rounded-full border border-blue-500/20 text-blue-400 mb-6 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
            <Trophy size={40} className="animate-bounce" />
          </div>
          <p className="text-slate-200 text-2xl font-bold mb-3 relative z-10">
            A new day has started!
          </p>
          <p className="text-slate-400 text-sm max-w-sm mb-8 relative z-10">
            Click generate to get your next personalized daily coding challenges curated by Leetcode.
          </p>
          <button 
            onClick={handleGenerate} 
            className="relative z-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-3.5 rounded-xl font-bold text-lg transition-all shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.5)] transform hover:-translate-y-1 active:translate-y-0"
          >
            Generate Today's Challenge
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {dailySet.questions.map((question, index) => {
            const solveCount = solvedMap[question._id] || 0;
            const isSolved = solveCount > 0;
            const isNoteActive = activeNoteQuestionId === question._id;
            
            return (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                key={question._id} 
                className={`p-6 rounded-2xl border flex flex-col transition-all duration-300 relative overflow-hidden ${
                  isSolved 
                    ? 'bg-slate-950/20 border-white/5 opacity-70 backdrop-blur-sm shadow-md' 
                    : 'glass-panel border-white/10 hover:border-blue-500/30 hover:bg-slate-900/50 hover:shadow-2xl shadow-lg'
                }`}
              >
                {/* Solved backdrop overlay */}
                {isSolved && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full filter blur-[40px] pointer-events-none"></div>
                )}
                
                <div className="flex items-start gap-4 sm:gap-5 w-full relative z-10">
                  {/* Solve Check Action */}
                  <div className="flex flex-col items-center gap-3.5 shrink-0 mt-1">
                    <button 
                      onClick={() => handleMarkSolved(question._id)}
                      className={`transition-all duration-300 transform hover:scale-110 flex items-center justify-center p-1 rounded-full ${
                        isSolved 
                          ? 'text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)] bg-emerald-500/10 border border-emerald-500/20' 
                          : 'text-slate-500 hover:text-emerald-400 bg-white/5 border border-white/5 hover:border-emerald-500/20'
                      }`}
                      title={isSolved ? "Mark as unsolved" : "Mark as solved"}
                    >
                      {isSolved ? (
                        <CheckCircle2 size={24} className="animate-check" />
                      ) : (
                        <Circle size={24} className="opacity-70 hover:opacity-100" />
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleToggleNote(question._id)}
                      className={`transition-all duration-200 transform hover:scale-110 p-2 rounded-xl border ${
                        notes[question._id]
                          ? 'text-amber-400 bg-amber-400/10 border-amber-400/20 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                          : 'text-slate-500 hover:text-amber-400 border-white/5 hover:border-amber-400/20 bg-white/5'
                      }`}
                      title={notes[question._id] ? "Edit Note" : "Add Note"}
                    >
                      <StickyNote size={15} />
                    </button>
                  </div>

                  {/* Main Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                      <span className="text-slate-500 text-xs font-black bg-slate-900/60 border border-white/5 px-2.5 py-0.5 rounded-lg">
                        #{question.questionId}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-lg border text-xs font-extrabold ${getDifficultyStyles(question.difficulty)}`}>
                        {question.difficulty}
                      </span>
                      {isSolved && (
                        <div className="flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded-lg text-xs font-extrabold shadow-sm">
                          <span>{solveCount}x Solved</span>
                          <div className="flex items-center gap-1 ml-1.5 border-l border-blue-500/20 pl-1.5">
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleDecrementSolve(question._id); }}
                              className="hover:text-white px-0.5 text-xs font-black leading-none"
                              title="Decrement solved count"
                            >
                              -
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleIncrementSolve(question._id); }}
                              className="hover:text-white px-0.5 text-xs font-black leading-none"
                              title="Increment solved count"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <a 
                      href={question.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className={`group/title inline-flex items-center gap-1.5 font-bold text-lg sm:text-xl transition-all ${
                        isSolved 
                          ? 'text-slate-400 line-through decoration-slate-700' 
                          : 'text-white hover:text-blue-400'
                      }`}
                    >
                      <span className="truncate">{question.title}</span>
                      <ExternalLink size={14} className="opacity-40 group-hover/title:opacity-100 transition-opacity shrink-0" />
                    </a>

                    {/* Topic Tags */}
                    <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold mt-3">
                      {question.topicTags.slice(0, 5).map(tag => (
                        <span key={tag} className="px-2.5 py-0.5 rounded-md bg-slate-900/60 text-slate-400 border border-white/5 shadow-sm">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Render Note preview */}
                    {notes[question._id] && !isNoteActive && (
                      <div className="mt-4 p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/10 text-slate-300 flex items-start gap-2.5 shadow-sm">
                        <StickyNote size={14} className="text-amber-400 shrink-0 mt-0.5" />
                        <div className="text-xs italic whitespace-pre-wrap leading-relaxed font-sans">{notes[question._id]}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Collapsible note editor drawer */}
                <AnimatePresence>
                  {isNoteActive && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden w-full"
                    >
                      <div className="mt-5 pt-4 border-t border-white/5 w-full flex flex-col gap-3 relative z-10">
                        <textarea
                          value={noteInput}
                          onChange={(e) => setNoteInput(e.target.value)}
                          placeholder="Document your solution approach, time/space complexity, or important algorithms..."
                          className="w-full bg-slate-950/70 border border-white/10 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/40 transition-colors font-mono resize-y min-h-[90px] leading-relaxed shadow-inner"
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleToggleNote(question._id)}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveNote(question._id)}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition-colors shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                          >
                            Save Note
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;

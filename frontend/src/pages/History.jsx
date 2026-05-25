import React, { useState, useEffect, useMemo } from 'react';
import api from '../utils/api';
import { BookOpen, CheckCircle2, XCircle, ExternalLink, StickyNote, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const History = () => {
  const [solved, setSolved] = useState([]);
  const [missed, setMissed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('solved'); // 'solved' or 'missed'
  const [notes, setNotes] = useState({});
  const [activeNoteQuestionId, setActiveNoteQuestionId] = useState(null);
  const [noteInput, setNoteInput] = useState('');

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [tagFilter, setTagFilter] = useState('All');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const [historyResponse, notesResponse] = await Promise.all([
          api.get('/daily-sets/history'),
          api.get('/notes')
        ]);
        setSolved(historyResponse.data.solved || []);
        setMissed(historyResponse.data.missed || []);
        
        const notesMap = {};
        notesResponse.data.forEach(note => {
          notesMap[note.question] = note.content;
        });
        setNotes(notesMap);
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
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
      await api.post(`/daily-sets/solve/${id}`);
      // Refresh history data
      const historyResponse = await api.get('/daily-sets/history');
      setSolved(historyResponse.data.solved || []);
      setMissed(historyResponse.data.missed || []);
    } catch (error) {
      console.error('Error marking solved:', error);
    }
  };

  const handleIncrementSolve = async (questionId) => {
    try {
      const res = await api.post(`/daily-sets/solve/${questionId}/increment`);
      setSolved(solved.map(item => {
        if (item.question && item.question._id === questionId) {
          return { ...item, solveCount: res.data.solveCount };
        }
        return item;
      }));
    } catch (error) {
      console.error('Error incrementing solve count:', error);
    }
  };

  const handleDecrementSolve = async (questionId) => {
    try {
      const res = await api.post(`/daily-sets/solve/${questionId}/decrement`);
      if (res.data.status === 'unsolved') {
        const historyResponse = await api.get('/daily-sets/history');
        setSolved(historyResponse.data.solved || []);
        setMissed(historyResponse.data.missed || []);
      } else {
        setSolved(solved.map(item => {
          if (item.question && item.question._id === questionId) {
            return { ...item, solveCount: res.data.solveCount };
          }
          return item;
        }));
      }
    } catch (error) {
      console.error('Error decrementing solve count:', error);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 glow-emerald';
      case 'Medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/20 glow-amber';
      case 'Hard': return 'text-rose-400 bg-rose-500/10 border-rose-500/20 glow-rose';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const getBorderColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'hover:border-l-emerald-500 border-l-transparent';
      case 'Medium': return 'hover:border-l-amber-500 border-l-transparent';
      case 'Hard': return 'hover:border-l-rose-500 border-l-transparent';
      default: return 'hover:border-l-blue-500 border-l-transparent';
    }
  };

  // Dynamically extract all unique tags from solved and missed questions
  const uniqueTags = useMemo(() => {
    const tagsSet = new Set();
    solved.forEach(item => item.question?.topicTags?.forEach(tag => tagsSet.add(tag)));
    missed.forEach(item => item.topicTags?.forEach(tag => tagsSet.add(tag)));
    return Array.from(tagsSet).sort();
  }, [solved, missed]);

  // Compute filtered list based on search and selected options
  const filteredList = useMemo(() => {
    const list = activeTab === 'solved' ? solved : missed;
    return list.filter(item => {
      const q = activeTab === 'solved' ? item.question : item;
      if (!q) return false;

      const matchesSearch = 
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        String(q.questionId).includes(searchQuery);
      
      const matchesDifficulty = difficultyFilter === 'All' || q.difficulty === difficultyFilter;
      const matchesTag = tagFilter === 'All' || (q.topicTags && q.topicTags.includes(tagFilter));

      return matchesSearch && matchesDifficulty && matchesTag;
    });
  }, [activeTab, solved, missed, searchQuery, difficultyFilter, tagFilter]);

  // Reset filters when changing tabs
  useEffect(() => {
    setSearchQuery('');
    setDifficultyFilter('All');
    setTagFilter('All');
  }, [activeTab]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
      <div className="mb-8">
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md flex items-center gap-3">
          <BookOpen size={36} className="text-blue-500" />
          <span>Problem Bank</span>
        </h1>
        <p className="text-slate-400 mt-2 text-md sm:text-lg">
          Review your solve history and tackle previous missed challenges.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2.5 mb-8">
        <button
          onClick={() => setActiveTab('solved')}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 border ${
            activeTab === 'solved'
              ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)]'
              : 'bg-slate-900/40 text-slate-400 hover:bg-slate-900/60 border-white/5'
          }`}
        >
          <CheckCircle2 size={16} />
          Solved History ({solved.length})
        </button>
        <button
          onClick={() => setActiveTab('missed')}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 border ${
            activeTab === 'missed'
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.15)]'
              : 'bg-slate-900/40 text-slate-400 hover:bg-slate-900/60 border-white/5'
          }`}
        >
          <XCircle size={16} />
          Missed Challenges ({missed.length})
        </button>
      </div>

      {/* Filter and Search Bar Controller */}
      <div className="glass-panel p-4 rounded-2xl mb-8 border border-white/5 bg-slate-950/20 backdrop-blur-xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-lg">
        {/* Search */}
        <div className="relative w-full md:w-1/3">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by title or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input pl-10 pr-4 py-2 w-full text-sm focus:border-blue-500"
          />
        </div>

        {/* Filters dropdowns */}
        <div className="flex flex-wrap w-full md:w-auto items-center gap-3 justify-end">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-slate-500 text-xs font-semibold flex items-center gap-1 shrink-0">
              <Filter size={12} /> Difficulty
            </span>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="glass-input px-3 py-2 text-xs focus:border-blue-500 bg-slate-950 font-semibold"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-slate-500 text-xs font-semibold flex items-center gap-1 shrink-0">
              <Filter size={12} /> Tags
            </span>
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="glass-input px-3 py-2 text-xs focus:border-blue-500 bg-slate-950 font-semibold max-w-[200px]"
            >
              <option value="All">All Tags</option>
              {uniqueTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 shadow-sm"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredList.length === 0 ? (
            <div className="glass-panel py-16 text-center rounded-2xl border border-white/5">
              <p className="text-slate-400 text-md">
                No matching questions found in this folder.
              </p>
            </div>
          ) : (
            filteredList.map((item, index) => {
              const q = activeTab === 'solved' ? item.question : item;
              if (!q) return null;
              
              const dateStr = activeTab === 'solved' 
                ? new Date(item.solvedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                : new Date(item.missedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
              
              const isNoteActive = activeNoteQuestionId === q._id;

              return (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.04, 0.4) }}
                  key={activeTab === 'solved' ? item._id : q._id}
                  className={`glass-panel p-5 rounded-2xl flex flex-col gap-4 border-l-4 ${getBorderColor(q.difficulty)} hover:bg-slate-900/30 transition-all duration-300 shadow-md relative overflow-hidden`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full relative z-10">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5 mb-2">
                        <span className={`px-2.5 py-0.5 rounded-lg border text-[11px] font-extrabold ${getDifficultyColor(q.difficulty)}`}>
                          {q.difficulty}
                        </span>
                        
                        {activeTab === 'solved' && (
                          <div className="flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded-lg text-[11px] font-extrabold shadow-sm">
                            <span>{item.solveCount || 1}x Solved</span>
                            <div className="flex items-center gap-1 ml-1.5 border-l border-blue-500/20 pl-1.5">
                              <button 
                                onClick={(e) => { e.preventDefault(); handleDecrementSolve(q._id); }}
                                className="hover:text-white px-0.5 text-xs font-black leading-none"
                                title="Decrement solved count"
                              >
                                -
                              </button>
                              <button 
                                onClick={(e) => { e.preventDefault(); handleIncrementSolve(q._id); }}
                                className="hover:text-white px-0.5 text-xs font-black leading-none"
                                title="Increment solved count"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        )}
                        
                        <span className="text-slate-500 text-xs">
                          {activeTab === 'solved' ? 'Solved on' : 'Missed on'}:{' '}
                          <span className="font-semibold text-slate-300">{dateStr}</span>
                        </span>
                      </div>
                      
                      <a 
                        href={q.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="group/title inline-flex items-center gap-1.5 font-bold text-lg sm:text-xl text-slate-100 hover:text-blue-400 transition-colors"
                      >
                        <span className="truncate">{q.title}</span>
                        <ExternalLink size={14} className="opacity-40 group-hover/title:opacity-100 transition-opacity shrink-0" />
                      </a>
                      
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {q.topicTags.map(tag => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 bg-slate-900/60 text-slate-400 rounded-md border border-white/5 shadow-sm">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto mt-2 sm:mt-0">
                      {activeTab === 'missed' && (
                        <button
                          onClick={() => handleMarkSolved(q._id)}
                          className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 transition-all border border-emerald-500/20"
                          title="Mark as solved"
                        >
                          <CheckCircle2 size={18} />
                        </button>
                      )}

                      <button
                        onClick={() => handleToggleNote(q._id)}
                        className={`flex items-center justify-center w-10 h-10 rounded-xl border transition-all ${
                          notes[q._id]
                            ? 'text-amber-400 bg-amber-400/10 border-amber-400/20 shadow-[0_0_10px_rgba(245,158,11,0.15)] hover:text-amber-300'
                            : 'text-slate-400 bg-white/5 border-white/5 hover:border-amber-500/20 hover:text-amber-400'
                        }`}
                        title={notes[q._id] ? "Edit Note" : "Add Note"}
                      >
                        <StickyNote size={16} />
                      </button>

                      <a 
                        href={q.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition-all border border-blue-500/20"
                        title="Solve on LeetCode"
                      >
                        <ExternalLink size={16} />
                      </a>
                    </div>
                  </div>

                  {/* Render Note preview */}
                  {notes[q._id] && !isNoteActive && (
                    <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/10 text-slate-300 flex items-start gap-2.5 shadow-sm relative z-10">
                      <StickyNote size={14} className="text-amber-400 shrink-0 mt-0.5" />
                      <div className="text-xs italic whitespace-pre-wrap leading-relaxed font-sans">{notes[q._id]}</div>
                    </div>
                  )}

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
                        <div className="pt-4 border-t border-white/5 w-full flex flex-col gap-3 relative z-10">
                          <textarea
                            value={noteInput}
                            onChange={(e) => setNoteInput(e.target.value)}
                            placeholder="Document your solution approach, complexity, algorithms..."
                            className="w-full bg-slate-950/70 border border-white/10 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/40 transition-colors font-mono resize-y min-h-[90px] leading-relaxed shadow-inner"
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleToggleNote(q._id)}
                              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveNote(q._id)}
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
            })
          )}
        </div>
      )}
    </div>
  );
};

export default History;

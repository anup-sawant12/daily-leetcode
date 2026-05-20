import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { BookOpen, CheckCircle2, XCircle, ExternalLink, StickyNote } from 'lucide-react';
import { motion } from 'framer-motion';

const History = () => {
  const [solved, setSolved] = useState([]);
  const [missed, setMissed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('solved'); // 'solved' or 'missed'
  const [notes, setNotes] = useState({});
  const [activeNoteQuestionId, setActiveNoteQuestionId] = useState(null);
  const [noteInput, setNoteInput] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const [historyResponse, notesResponse] = await Promise.all([
          api.get('/daily-sets/history'),
          api.get('/notes')
        ]);
        setSolved(historyResponse.data.solved);
        setMissed(historyResponse.data.missed);
        
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

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'Medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'Hard': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const currentList = activeTab === 'solved' ? solved : missed;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 relative z-10 gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2 flex items-center gap-3">
            <BookOpen size={40} className="text-blue-400" />
            Problem Bank
          </h1>
          <p className="text-slate-400 text-lg">Review your solved questions and tackle missed challenges.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => setActiveTab('solved')}
          className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
            activeTab === 'solved'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
              : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/5'
          }`}
        >
          <CheckCircle2 size={20} />
          Solved History ({solved.length})
        </button>
        <button
          onClick={() => setActiveTab('missed')}
          className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
            activeTab === 'missed'
              ? 'bg-rose-600/20 text-rose-400 border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
              : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/5'
          }`}
        >
          <XCircle size={20} />
          Missed Challenges ({missed.length})
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-4 relative z-10">
          {currentList.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-2xl">
              <p className="text-slate-400 text-lg">
                {activeTab === 'solved' 
                  ? "You haven't solved any problems yet. Go to the dashboard to start!" 
                  : "Great job! You don't have any missed challenges from previous daily sets."}
              </p>
            </div>
          ) : (
            currentList.map((item, index) => {
              const q = activeTab === 'solved' ? item.question : item;
              const dateStr = activeTab === 'solved' 
                ? new Date(item.solvedAt).toLocaleDateString()
                : new Date(item.missedDate).toLocaleDateString();

              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={activeTab === 'solved' ? item._id : q._id}
                  className="glass-panel p-5 rounded-2xl flex flex-col gap-4 hover:bg-white/[0.08] transition-colors border-l-4 border-l-transparent hover:border-l-blue-500 group"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getDifficultyColor(q.difficulty)}`}>
                          {q.difficulty}
                        </span>
                        <span className="text-slate-500 text-sm">
                          {activeTab === 'solved' ? 'Solved on: ' : 'Missed on: '} 
                          <span className="font-semibold text-slate-300">{dateStr}</span>
                        </span>
                      </div>
                      <a 
                        href={q.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xl font-bold text-slate-200 hover:text-white transition-colors group-hover:underline decoration-blue-500 decoration-2 underline-offset-4"
                      >
                        {q.title}
                      </a>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {q.topicTags.map(tag => (
                          <span key={tag} className="text-xs px-2 py-1 bg-slate-800/50 text-slate-400 rounded-md border border-slate-700/50">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                      <button
                        onClick={() => handleToggleNote(q._id)}
                        className={`flex items-center justify-center w-12 h-12 rounded-xl border transition-all ${
                          notes[q._id]
                            ? 'text-amber-400 bg-amber-400/10 border-amber-400/20 shadow-[0_0_10px_rgba(245,158,11,0.15)] hover:text-amber-300'
                            : 'text-slate-400 bg-white/5 border-transparent hover:bg-slate-700/30 hover:text-amber-400'
                        }`}
                        title={notes[q._id] ? "Edit Note" : "Add Note"}
                      >
                        <StickyNote size={20} />
                      </button>

                      <a 
                        href={q.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition-colors border border-transparent"
                        title="Solve on LeetCode"
                      >
                        <ExternalLink size={20} />
                      </a>
                    </div>
                  </div>

                  {/* Display note content if it exists and we are not editing it */}
                  {notes[q._id] && activeNoteQuestionId !== q._id && (
                    <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 text-slate-300 flex items-start gap-2.5">
                      <StickyNote size={16} className="text-amber-400 shrink-0 mt-0.5" />
                      <div className="text-sm italic whitespace-pre-wrap">{notes[q._id]}</div>
                    </div>
                  )}

                  {/* Collapsible note editor */}
                  {activeNoteQuestionId === q._id && (
                    <div className="pt-4 border-t border-white/5 w-full flex flex-col gap-3">
                      <textarea
                        value={noteInput}
                        onChange={(e) => setNoteInput(e.target.value)}
                        placeholder="Write your note here... (e.g. solution approach, complexity, gotchas)"
                        className="w-full bg-slate-950/60 border border-white/10 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors resize-y min-h-[90px]"
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleToggleNote(q._id)}
                          className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveNote(q._id)}
                          className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold transition-colors shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                        >
                          Save Note
                        </button>
                      </div>
                    </div>
                  )}
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

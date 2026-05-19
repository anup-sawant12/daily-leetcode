import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { BookOpen, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const History = () => {
  const [solved, setSolved] = useState([]);
  const [missed, setMissed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('solved'); // 'solved' or 'missed'

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/daily-sets/history');
        setSolved(response.data.solved);
        setMissed(response.data.missed);
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

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
                  className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-white/[0.08] transition-colors border-l-4 border-l-transparent hover:border-l-blue-500 group"
                >
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
                  
                  <a 
                    href={q.url}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition-colors"
                    title="Solve on LeetCode"
                  >
                    <ExternalLink size={20} />
                  </a>
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

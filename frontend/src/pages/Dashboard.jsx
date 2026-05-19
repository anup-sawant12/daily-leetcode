import React, { useState, useContext, useEffect } from 'react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { ExternalLink, CheckCircle2, Circle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const [dailySet, setDailySet] = useState(null);
  const [solvedIds, setSolvedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, setUser } = useContext(AuthContext);
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date().toISOString().split('T')[0]);
    }, 60000); // Check every minute
    return () => clearInterval(interval);
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
        const [setRes, solvedRes] = await Promise.all([
          api.get('/daily-sets/today'),
          api.get('/daily-sets/solved')
        ]);
        setDailySet(setRes.data);
        setSolvedIds(solvedRes.data.map(sq => sq.question._id));
      } catch (error) {
        console.error('Error fetching data', error);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleMarkSolved = async (id) => {
    try {
      const res = await api.post(`/daily-sets/solve/${id}`);
      if (res.data.status === 'unsolved') {
        setSolvedIds(solvedIds.filter(solvedId => solvedId !== id));
      } else {
        setSolvedIds([...solvedIds, id]);
        if (res.data.streak !== undefined) {
          setUser({ ...user, streak: res.data.streak });
        }
      }
    } catch (error) {
      console.error('Error marking solved', error);
    }
  };

  const getDifficultyStyles = (diff) => {
    switch (diff) {
      case 'Easy': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20 shadow-[0_0_10px_rgba(52,211,153,0.1)]';
      case 'Medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/20 shadow-[0_0_10px_rgba(251,191,36,0.1)]';
      case 'Hard': return 'text-rose-400 bg-rose-400/10 border-rose-400/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 animate-pulse">
        <div className="h-10 bg-white/5 rounded w-1/3 mb-8 backdrop-blur-md"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-28 glass-panel rounded-2xl border border-white/5"></div>
          ))}
        </div>
      </div>
    );
  }

  const progressCount = solvedIds.filter(id => dailySet?.questions.some(q => q._id === id)).length;
  const progressPercent = (progressCount / 6) * 100;

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8 relative">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight drop-shadow-md">Daily Challenge</h1>
          <p className="text-slate-400 text-lg flex items-center gap-2">
            Complete these 6 problems to maintain your streak. <Sparkles size={18} className="text-blue-400" />
          </p>
        </div>
        <div className="glass-panel p-4 rounded-2xl flex flex-col items-end min-w-[200px]">
          <div className="text-sm font-medium text-slate-400 mb-2 uppercase tracking-wider">Today's Progress</div>
          <div className="text-3xl font-bold text-white flex items-baseline gap-1">
            {progressCount} <span className="text-lg text-slate-500">/ 6</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {(!dailySet || (dailySet && dailySet.date !== currentDate)) ? (
        <div className="text-center py-24 glass-panel rounded-3xl flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent"></div>
          <p className="text-slate-300 text-xl mb-8 relative z-10 font-medium">
            {(dailySet && dailySet.date !== currentDate) 
              ? "A new day has started! Generate today's challenge." 
              : "Today's set hasn't been generated yet."}
          </p>
          <button 
            onClick={handleGenerate} 
            className="relative z-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-3 rounded-xl font-bold text-lg transition-all shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.5)] transform hover:-translate-y-1"
          >
            Generate Now
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {dailySet.questions.map((question, index) => {
            const isSolved = solvedIds.includes(question._id);
            return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                key={question._id} 
                className={`p-6 rounded-2xl border flex items-center justify-between transition-all duration-300 ${
                  isSolved 
                    ? 'bg-slate-900/40 border-white/5 opacity-60 backdrop-blur-sm' 
                    : 'glass-panel border-white/10 hover:border-blue-500/30 hover:bg-slate-800/60 shadow-lg'
                }`}
              >
                <div className="flex items-center gap-5 w-full">
                  <button 
                    onClick={() => handleMarkSolved(question._id)}
                    className={`transition-all duration-300 transform hover:scale-110 ${isSolved ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'text-slate-500 hover:text-emerald-400'}`}
                  >
                    {isSolved ? <CheckCircle2 size={28} /> : <Circle size={28} />}
                  </button>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                      <span className="text-slate-500 text-sm font-bold bg-slate-800/50 px-2 py-0.5 rounded-md border border-white/5 w-max">#{question.questionId}</span>
                      <a 
                        href={question.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className={`font-bold text-xl flex items-center gap-1.5 transition-colors ${isSolved ? 'text-slate-400 line-through decoration-slate-600' : 'text-white hover:text-blue-400'}`}
                      >
                        {question.title}
                        <ExternalLink size={16} className="opacity-40" />
                      </a>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs font-semibold mt-3">
                      <span className={`px-3 py-1 rounded-lg border ${getDifficultyStyles(question.difficulty)}`}>
                        {question.difficulty}
                      </span>
                      {question.topicTags.slice(0, 4).map(tag => (
                        <span key={tag} className="px-3 py-1 rounded-lg bg-slate-800/80 text-slate-300 border border-white/10 shadow-sm backdrop-blur-md">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;

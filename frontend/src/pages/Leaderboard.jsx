import React, { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { Trophy, Flame, Award, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const Leaderboard = () => {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await api.get('/auth/leaderboard');
        setRankings(data);
      } catch (error) {
        console.error('Error fetching leaderboard', error);
      }
      setLoading(false);
    };

    fetchLeaderboard();
  }, []);

  const getRankBadge = (index) => {
    switch (index) {
      case 0:
        return (
          <div className="bg-amber-400/10 border border-amber-400/30 text-amber-400 p-1.5 rounded-lg shadow-[0_0_15px_rgba(245,158,11,0.2)] flex items-center justify-center">
            <Trophy size={16} className="fill-amber-400/10" />
          </div>
        );
      case 1:
        return (
          <div className="bg-slate-300/10 border border-slate-300/30 text-slate-300 p-1.5 rounded-lg shadow-[0_0_15px_rgba(203,213,225,0.15)] flex items-center justify-center">
            <Trophy size={16} className="fill-slate-300/10" />
          </div>
        );
      case 2:
        return (
          <div className="bg-amber-600/10 border border-amber-600/30 text-amber-600 p-1.5 rounded-lg shadow-[0_0_15px_rgba(180,83,9,0.15)] flex items-center justify-center">
            <Trophy size={16} className="fill-amber-600/10" />
          </div>
        );
      default:
        return (
          <span className="font-mono text-slate-400 font-extrabold text-sm ml-2.5">
            {index + 1}
          </span>
        );
    }
  };

  const getInitials = (name) => {
    if (!name) return 'LC';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 animate-pulse">
        <div className="h-12 bg-white/5 rounded-2xl w-48 mb-8 backdrop-blur-md"></div>
        <div className="h-96 glass-panel rounded-3xl border border-white/5 bg-slate-900/40"></div>
      </div>
    );
  }

  // Find current user's rank
  const currentUserIndex = rankings.findIndex(r => r._id === user?.id || r.name === user?.name);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 relative z-10">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md flex items-center gap-3">
            <Trophy size={36} className="text-amber-400 animate-pulse" />
            <span>Leaderboard</span>
          </h1>
          <p className="text-slate-400 mt-2 text-md sm:text-lg">
            Compete with daily coders. Rank is determined by active streak and total questions solved.
          </p>
        </div>

        {currentUserIndex !== -1 && (
          <div className="glass-panel px-5 py-3.5 rounded-2xl border border-white/5 bg-slate-900/40 flex items-center gap-4 shadow-md">
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Your Rank</div>
              <div className="text-2xl font-black text-amber-400 mt-0.5">#{currentUserIndex + 1}</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Streak</div>
              <div className="text-2xl font-black text-white mt-0.5 flex items-center gap-1">
                {user?.streak} <Flame size={18} className="text-amber-500 fill-amber-500/10" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Leaderboard Panel */}
      <div className="glass-panel rounded-3xl shadow-2xl border border-white/5 bg-slate-900/20 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full filter blur-[80px] pointer-events-none"></div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-slate-950/40 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                <th className="py-5 px-6 w-20 text-center">Rank</th>
                <th className="py-5 px-6">Coder</th>
                <th className="py-5 px-6 text-center w-36">Daily Streak</th>
                <th className="py-5 px-6 text-right w-36">Total Solved</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((coder, index) => {
                const isCurrentUser = coder._id === user?.id || coder.name === user?.name;
                return (
                  <motion.tr
                    key={coder._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.05, 0.5) }}
                    className={`border-b border-white/5 transition-colors duration-200 ${
                      isCurrentUser 
                        ? 'bg-blue-500/10 border-l-4 border-l-blue-500 hover:bg-blue-500/15' 
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <td className="py-4.5 px-6 flex justify-center items-center">
                      {getRankBadge(index)}
                    </td>
                    <td className="py-4.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-inner ${
                          isCurrentUser
                            ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
                            : index === 0
                            ? 'bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-950'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {getInitials(coder.name)}
                        </div>
                        <div>
                          <span className={`font-bold text-sm flex items-center gap-1.5 ${
                            isCurrentUser ? 'text-blue-400' : 'text-white'
                          }`}>
                            {coder.name}
                            {isCurrentUser && (
                              <span className="text-[9px] font-black uppercase bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/25">
                                You
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4.5 px-6 text-center">
                      <div className="inline-flex items-center gap-1 bg-amber-500/5 border border-amber-500/10 text-amber-500 font-extrabold text-xs px-2.5 py-1 rounded-lg">
                        <Flame size={13} className="fill-amber-500/15" />
                        <span>{coder.streak}</span>
                      </div>
                    </td>
                    <td className="py-4.5 px-6 text-right font-mono font-bold text-slate-300 text-sm">
                      {coder.solvedCount}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;

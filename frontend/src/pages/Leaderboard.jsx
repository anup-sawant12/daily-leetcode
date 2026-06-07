import React, { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { Trophy, Flame, Award, Loader2, Sparkles, X, ExternalLink, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Leaderboard = () => {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('overall'); // 'weekly', 'monthly', 'overall'
  const { user } = useContext(AuthContext);

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);

  const handleOpenProfile = async (userId) => {
    setShowProfileModal(true);
    setProfileLoading(true);
    setProfileData(null);
    try {
      const { data } = await api.get(`/auth/profile/${userId}`);
      setProfileData(data);
    } catch (error) {
      console.error('Error fetching user profile', error);
    }
    setProfileLoading(false);
  };

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/auth/leaderboard?timeframe=${timeframe}`);
        setRankings(data);
      } catch (error) {
        console.error('Error fetching leaderboard', error);
      }
      setLoading(false);
    };

    fetchLeaderboard();
  }, [timeframe]);

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

  const getCoderAward = (index) => {
    switch (index) {
      case 0:
        return (
          <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider bg-amber-400/10 border border-amber-400/30 text-amber-400 px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.1)]">
            <Sparkles size={10} className="text-amber-400 animate-pulse" />
            Apex Coder
          </span>
        );
      case 1:
        return (
          <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider bg-slate-300/10 border border-slate-300/30 text-slate-300 px-2 py-0.5 rounded-full">
            <Award size={10} className="text-slate-300" />
            Elite Solver
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider bg-amber-700/10 border border-amber-700/30 text-amber-600 px-2 py-0.5 rounded-full">
            <Trophy size={10} className="text-amber-600" />
            Rising Star
          </span>
        );
      default:
        return null;
    }
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
            Compete with daily coders. Rank is determined by active streak and questions solved in the selected timeframe.
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

      {/* Timeframe Selector Tabs */}
      <div className="flex justify-end gap-1.5 mb-5 bg-slate-950/40 p-1.5 rounded-xl border border-white/5 w-fit ml-auto">
        {['weekly', 'monthly', 'overall'].map((t) => (
          <button
            key={t}
            onClick={() => setTimeframe(t)}
            className={`px-4 py-2 rounded-lg text-xs font-extrabold capitalize transition-all duration-200 cursor-pointer ${
              timeframe === t
                ? 'bg-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            {t}
          </button>
        ))}
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
                <th className="py-5 px-6 text-right w-36">
                  {timeframe === 'overall' ? 'Total Solved' : `${timeframe} Solved`}
                </th>
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
                    <td 
                      className="py-4.5 px-6 cursor-pointer hover:bg-white/5 active:bg-white/10 select-none group"
                      onClick={() => handleOpenProfile(coder._id)}
                      title="View Profile Statistics"
                    >
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
                        <div className="flex flex-col gap-0.5">
                          <span className={`font-bold text-sm flex items-center gap-1.5 group-hover:text-blue-400 transition-colors ${
                            isCurrentUser ? 'text-blue-400' : 'text-white'
                          }`}>
                            {coder.name}
                            {isCurrentUser && (
                              <span className="text-[9px] font-black uppercase bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/25">
                                You
                              </span>
                            )}
                          </span>
                          {index < 3 && (
                            <div className="mt-0.5">
                              {getCoderAward(index)}
                            </div>
                          )}
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

      {/* Coder Profile Modal */}
      <AnimatePresence>
        {showProfileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProfileModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative bg-slate-900 border border-white/10 p-6 rounded-3xl max-w-md w-full shadow-2xl z-10 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full filter blur-xl pointer-events-none"></div>

              {/* Close Button */}
              <button
                onClick={() => setShowProfileModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>

              {profileLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 size={32} className="text-blue-500 animate-spin" />
                  <p className="text-slate-400 text-xs mt-3">Loading profile data...</p>
                </div>
              ) : profileData ? (
                <div className="flex flex-col">
                  {/* Coder Header info */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md">
                      {getInitials(profileData.user.name)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white tracking-tight leading-tight">
                        {profileData.user.name}
                      </h3>
                      {profileData.user.leetcodeUsername ? (
                        <a
                          href={`https://leetcode.com/${profileData.user.leetcodeUsername}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-amber-500 hover:text-amber-400 text-xs font-semibold mt-1"
                        >
                          <span>@{profileData.user.leetcodeUsername}</span>
                          <ExternalLink size={12} />
                        </a>
                      ) : (
                        <p className="text-slate-500 text-xs mt-1">No LeetCode linked</p>
                      )}
                    </div>
                  </div>

                  {/* Core Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-4 flex flex-col items-center">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        Total Solved
                      </span>
                      <span className="text-2xl font-black text-white mt-1.5 font-mono">
                        {profileData.totalSolved}
                      </span>
                    </div>
                    <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-4 flex flex-col items-center">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                        Active Streak
                      </span>
                      <span className="text-2xl font-black text-amber-500 mt-1.5 flex items-center gap-1 font-mono">
                        {profileData.user.streak}
                        <Flame size={18} className="text-amber-500 fill-amber-500/10" />
                      </span>
                    </div>
                  </div>

                  {/* Difficulty breakdown list */}
                  <div className="mb-6">
                    <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3.5 flex items-center gap-2">
                      <Activity size={14} className="text-blue-500" />
                      <span>Difficulty Breakdown</span>
                    </h4>
                    <div className="space-y-3">
                      {/* Easy */}
                      <div>
                        <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
                          <span className="text-emerald-400">Easy</span>
                          <span className="text-white font-mono">{profileData.difficultyCounts.Easy} solves</span>
                        </div>
                        <div className="w-full bg-slate-950/60 h-2 rounded-full overflow-hidden border border-white/5">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${
                                profileData.totalSolved > 0
                                  ? (profileData.difficultyCounts.Easy / profileData.totalSolved) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Medium */}
                      <div>
                        <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
                          <span className="text-amber-400">Medium</span>
                          <span className="text-white font-mono">{profileData.difficultyCounts.Medium} solves</span>
                        </div>
                        <div className="w-full bg-slate-950/60 h-2 rounded-full overflow-hidden border border-white/5">
                          <div
                            className="bg-amber-500 h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${
                                profileData.totalSolved > 0
                                  ? (profileData.difficultyCounts.Medium / profileData.totalSolved) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Hard */}
                      <div>
                        <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
                          <span className="text-rose-400">Hard</span>
                          <span className="text-white font-mono">{profileData.difficultyCounts.Hard} solves</span>
                        </div>
                        <div className="w-full bg-slate-950/60 h-2 rounded-full overflow-hidden border border-white/5">
                          <div
                            className="bg-rose-500 h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${
                                profileData.totalSolved > 0
                                  ? (profileData.difficultyCounts.Hard / profileData.totalSolved) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Top topic tags */}
                  <div>
                    <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Sparkles size={14} className="text-indigo-400" />
                      <span>Topic Tag Mastery</span>
                    </h4>
                    {profileData.topicCounts.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {profileData.topicCounts.map((tag) => (
                          <div
                            key={tag.name}
                            className="flex items-center gap-2 bg-slate-950/40 border border-white/5 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-300"
                          >
                            <span>{tag.name}</span>
                            <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold px-1.5 py-0.5 rounded text-[10px]">
                              {tag.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 text-xs italic">No tag history recorded yet.</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-rose-400 text-xs font-bold">
                  Failed to load coder profile.
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Leaderboard;

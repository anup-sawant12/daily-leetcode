import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../utils/api';
import { motion } from 'framer-motion';
import { LineChart, Trophy, Target, Award, AwardIcon } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel p-3 rounded-xl border border-white/10 bg-slate-950/90 backdrop-blur-md shadow-xl text-xs">
        <p className="text-slate-400 font-bold mb-1">{label}</p>
        <p className="text-blue-400 font-black text-sm">
          Solved: <span className="text-white">{payload[0].value} problems</span>
        </p>
      </div>
    );
  }
  return null;
};

const Progress = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('1M'); // '1W', '1M', '1Y', 'ALL'

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/daily-sets/stats');
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats', error);
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  const getFilteredData = () => {
    if (!stats || !stats.history) return [];
    
    let daysToKeep = 30;
    if (timeRange === '1W') daysToKeep = 7;
    else if (timeRange === '1M') daysToKeep = 30;
    else if (timeRange === '1Y') daysToKeep = 365;
    else if (timeRange === 'ALL') daysToKeep = 9999;

    const data = [];
    const today = new Date();

    for (let i = daysToKeep - 1; i >= 0; i--) {
      const d = new Date();
      d.setUTCDate(today.getUTCDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const statEntry = stats.history.find(s => s.date === dateStr);
      data.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
        solved: statEntry ? statEntry.solved : 0
      });
    }
    return data;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-10 px-4 animate-pulse">
        <div className="h-12 bg-white/5 rounded-2xl w-48 mb-8 backdrop-blur-md"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 h-[400px] glass-panel rounded-3xl"></div>
          <div className="h-[400px] glass-panel rounded-3xl"></div>
        </div>
      </div>
    );
  }

  const chartData = getFilteredData();
  const totalSolvedRange = chartData.reduce((sum, item) => sum + item.solved, 0);

  const easyCount = stats?.difficultyCounts?.Easy || 0;
  const mediumCount = stats?.difficultyCounts?.Medium || 0;
  const hardCount = stats?.difficultyCounts?.Hard || 0;
  const totalSolved = stats?.total || (easyCount + mediumCount + hardCount) || 0;

  const easyPercent = totalSolved ? (easyCount / totalSolved) * 100 : 0;
  const mediumPercent = totalSolved ? (mediumCount / totalSolved) * 100 : 0;
  const hardPercent = totalSolved ? (hardCount / totalSolved) * 100 : 0;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="mb-10">
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md flex items-center gap-3">
          <LineChart size={36} className="text-blue-500" />
          <span>Analytics</span>
        </h1>
        <p className="text-slate-400 mt-2 text-md sm:text-lg">
          Track your LeetCode problem-solving journey and category breakdowns.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Solve History Line Chart Panel */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/5 relative overflow-hidden bg-slate-900/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full filter blur-[80px] pointer-events-none transform translate-z-0"></div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 relative z-10 gap-4">
            <div>
              <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Solved ({timeRange})</div>
              <div className="text-4xl font-black text-white mt-1 drop-shadow-lg">{totalSolvedRange}</div>
            </div>
            <div className="flex gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-white/5 backdrop-blur-xl">
              {['1W', '1M', '1Y', 'ALL'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all duration-200 ${
                    timeRange === range
                      ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] border border-blue-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[320px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} 
                  minTickGap={40}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} 
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1 }} />
                <Area 
                  type="monotone" 
                  dataKey="solved" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorSolved)" 
                  activeDot={{ r: 5, fill: '#3b82f6', stroke: '#fff', strokeWidth: 1.5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Difficulty Distribution Breakdown (Right Panel) */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/5 relative overflow-hidden bg-slate-900/20 flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full filter blur-[60px] pointer-events-none"></div>
          
          <div className="mb-6 relative z-10">
            <h3 className="text-white font-bold text-lg">Difficulty Mastery</h3>
            <p className="text-slate-400 text-xs mt-1">Problem counts categorized by complexity level.</p>
          </div>

          <div className="flex flex-col gap-6 relative z-10 flex-1 justify-center my-6">
            {/* Easy Bar */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5 font-bold">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Easy
                </span>
                <span className="text-white">{easyCount} <span className="text-slate-500 text-[10px]">solved</span></span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${easyPercent}%` }} 
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="bg-emerald-400 h-2.5 rounded-full"
                />
              </div>
            </div>

            {/* Medium Bar */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5 font-bold">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span> Medium
                </span>
                <span className="text-white">{mediumCount} <span className="text-slate-500 text-[10px]">solved</span></span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${mediumPercent}%` }} 
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 }}
                  className="bg-amber-400 h-2.5 rounded-full"
                />
              </div>
            </div>

            {/* Hard Bar */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5 font-bold">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400"></span> Hard
                </span>
                <span className="text-white">{hardCount} <span className="text-slate-500 text-[10px]">solved</span></span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${hardPercent}%` }} 
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                  className="bg-rose-400 h-2.5 rounded-full"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 relative z-10 flex justify-between items-center">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Completed</span>
            <span className="text-2xl font-black text-white">{totalSolved}</span>
          </div>
        </div>
      </div>

      {/* Interactive highlights row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-6 rounded-2xl flex items-center gap-4 border border-white/5 bg-slate-950/20">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <Award size={20} />
          </div>
          <div>
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Easy solved</div>
            <div className="text-2xl font-black text-white mt-0.5">{easyCount}</div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-panel p-6 rounded-2xl flex items-center gap-4 border border-white/5 bg-slate-950/20">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
            <Trophy size={20} />
          </div>
          <div>
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Medium solved</div>
            <div className="text-2xl font-black text-white mt-0.5">{mediumCount}</div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-panel p-6 rounded-2xl flex items-center gap-4 border border-white/5 bg-slate-950/20">
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
            <Target size={20} />
          </div>
          <div>
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Hard solved</div>
            <div className="text-2xl font-black text-white mt-0.5">{hardCount}</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Progress;

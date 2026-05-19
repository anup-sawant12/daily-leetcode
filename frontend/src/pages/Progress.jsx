import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../utils/api';
import { motion } from 'framer-motion';

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
      <div className="max-w-5xl mx-auto py-10 px-4 animate-pulse">
        <div className="h-10 bg-white/5 rounded w-48 mb-8 backdrop-blur-md"></div>
        <div className="h-[400px] glass-panel rounded-3xl mb-8"></div>
      </div>
    );
  }

  const chartData = getFilteredData();
  const totalSolvedRange = chartData.reduce((sum, item) => sum + item.solved, 0);

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8 relative">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight drop-shadow-md">Your Progress</h1>
        <p className="text-slate-400 text-lg">Track your LeetCode problem-solving journey over time.</p>
      </div>

      <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl mb-8 border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full filter blur-[60px] pointer-events-none transform translate-z-0"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 relative z-10 gap-6">
          <div>
            <div className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Total Solved ({timeRange})</div>
            <div className="text-5xl font-extrabold text-white mt-2 drop-shadow-lg">{totalSolvedRange}</div>
          </div>
          <div className="flex gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-white/5 backdrop-blur-xl">
            {['1W', '1M', '1Y', 'ALL'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                  timeRange === range
                    ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[350px] w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 500 }} 
                minTickGap={30}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 500 }} 
                allowDecimals={false}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)', color: '#fff' }}
                itemStyle={{ color: '#60a5fa', fontWeight: 'bold' }}
                cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
              />
              <Area 
                type="monotone" 
                dataKey="solved" 
                stroke="#60a5fa" 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorSolved)" 
                activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2, shadow: '0 0 10px rgba(59,130,246,1)' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors"></div>
          <div className="text-slate-400 font-semibold mb-2 tracking-wider uppercase text-sm relative z-10">Easy</div>
          <div className="text-5xl font-extrabold text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)] relative z-10">{stats?.difficultyCounts?.Easy || 0}</div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-6 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-amber-500/5 group-hover:bg-amber-500/10 transition-colors"></div>
          <div className="text-slate-400 font-semibold mb-2 tracking-wider uppercase text-sm relative z-10">Medium</div>
          <div className="text-5xl font-extrabold text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.3)] relative z-10">{stats?.difficultyCounts?.Medium || 0}</div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-6 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-rose-500/5 group-hover:bg-rose-500/10 transition-colors"></div>
          <div className="text-slate-400 font-semibold mb-2 tracking-wider uppercase text-sm relative z-10">Hard</div>
          <div className="text-5xl font-extrabold text-rose-400 drop-shadow-[0_0_15px_rgba(244,63,94,0.3)] relative z-10">{stats?.difficultyCounts?.Hard || 0}</div>
        </motion.div>
      </div>
    </div>
  );
};

export default Progress;

import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Code2, ChevronLeft, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Blobs - Optimized */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full filter blur-[60px] pointer-events-none transform translate-z-0"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full filter blur-[60px] pointer-events-none transform translate-z-0"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link to="/" className="absolute -left-12 top-2 text-slate-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full backdrop-blur-sm hidden md:flex">
          <ChevronLeft size={24} />
        </Link>
        <div className="flex justify-center text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10">
            <Code2 size={48} />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
          Welcome back <Sparkles className="text-yellow-400" size={24} />
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
            Sign up for free
          </Link>
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="glass-panel py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-white/10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-4 rounded-xl flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-400"></div>
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                required
                className="appearance-none block w-full px-4 py-3 border border-white/10 rounded-xl shadow-sm bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all sm:text-sm backdrop-blur-sm"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                className="appearance-none block w-full px-4 py-3 border border-white/10 rounded-xl shadow-sm bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all sm:text-sm backdrop-blur-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 transition-all"
              >
                Sign in to Dashboard
              </button>
            </div>
            
            <div className="md:hidden text-center mt-4">
              <Link to="/" className="text-sm text-slate-400 hover:text-white inline-flex items-center gap-1">
                <ChevronLeft size={16} /> Back to home
              </Link>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

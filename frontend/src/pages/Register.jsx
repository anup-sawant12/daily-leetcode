import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Code2, ChevronLeft, Rocket, User, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Dynamic Animated Blobs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full filter blur-[70px] pointer-events-none animate-float-blob"></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-rose-600/5 rounded-full filter blur-[70px] pointer-events-none animate-float-blob-reverse"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <Link to="/" className="absolute -left-16 top-3 text-slate-400 hover:text-white transition-all bg-white/5 hover:bg-white/10 p-2.5 rounded-xl border border-white/5 backdrop-blur-sm hidden md:flex">
          <ChevronLeft size={20} />
        </Link>
        <div className="flex justify-center text-indigo-400 drop-shadow-[0_0_20px_rgba(99,102,241,0.3)]">
          <div className="bg-slate-950/40 p-4 rounded-2xl backdrop-blur-md border border-white/10 shadow-2xl">
            <Code2 size={40} className="text-indigo-400" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2">
          <span>Start Your Journey</span>
          <Rocket className="text-rose-400 animate-bounce" size={20} />
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
            Sign in instead
          </Link>
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0"
      >
        <div className="glass-panel py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-white/5 bg-slate-950/40 backdrop-blur-xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs p-3.5 rounded-xl flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0"></div>
                <span>{error}</span>
              </div>
            )}
            
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  className="glass-input pl-11 pr-4 py-3 w-full text-sm"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  className="glass-input pl-11 pr-4 py-3 w-full text-sm"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  className="glass-input pl-11 pr-4 py-3 w-full text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] text-sm font-black text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 transition-all active:scale-[0.98]"
              >
                Create Account
              </button>
            </div>
            
            <div className="md:hidden text-center mt-4">
              <Link to="/" className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1 font-semibold">
                <ChevronLeft size={14} /> Back to Home
              </Link>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;

import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Flame, LogOut, Code2, LineChart, ChevronLeft } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="glass-panel sticky top-0 z-50 border-b-0 border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-4">
            {location.pathname !== '/' && (
              <button 
                onClick={() => navigate(-1)}
                className="text-slate-400 hover:text-white transition-colors flex items-center justify-center bg-white/5 hover:bg-white/10 p-2 rounded-full backdrop-blur-md"
                title="Go Back"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white group">
              <div className="bg-blue-500/20 p-1.5 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                <Code2 className="text-blue-400" size={24} />
              </div>
              <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Daily LeetCode
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-6">
            {user ? (
              <>
                <div className="hidden sm:flex items-center gap-2 text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full font-medium shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                  <Flame size={18} className="animate-pulse" />
                  <span>{user.streak} Day Streak</span>
                </div>
                <Link to="/progress" className="text-slate-300 hover:text-white flex items-center gap-1 font-medium transition-colors hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                  <LineChart size={18} />
                  <span className="hidden sm:inline">Progress</span>
                </Link>
                <div className="text-slate-300 border-l border-white/10 pl-6 ml-2 hidden md:block font-medium">
                  {user.name}
                </div>
                <button
                  onClick={logout}
                  className="text-slate-400 hover:text-red-400 transition-colors p-2 rounded-full hover:bg-red-400/10"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-300 hover:text-white font-medium transition-colors">Login</Link>
                <Link to="/register" className="bg-white text-slate-900 hover:bg-slate-200 px-4 py-2 rounded-lg font-bold transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]">Sign up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

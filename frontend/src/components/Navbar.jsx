import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Flame, LogOut, Code2, LineChart, ChevronLeft, BookOpen } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Get initials for user avatar
  const getInitials = (name) => {
    if (!name) return 'LC';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <nav className="glass-panel sticky top-4 z-50 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 rounded-2xl border border-white/5 bg-slate-950/40 backdrop-blur-xl shadow-2xl mt-4">
      <div className="flex justify-between h-16 items-center">
        <div className="flex items-center gap-4">
          {location.pathname !== '/' && (
            <button 
              onClick={() => navigate(-1)}
              className="text-slate-400 hover:text-white transition-all flex items-center justify-center bg-white/5 hover:bg-white/10 p-2 rounded-full border border-white/5"
              title="Go Back"
            >
              <ChevronLeft size={18} />
            </button>
          )}
          <Link to="/" className="flex items-center gap-2.5 text-xl font-black text-white group">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2 rounded-xl group-hover:scale-105 transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <Code2 className="text-white group-hover:rotate-6 transition-transform" size={20} />
            </div>
            <span className="bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent font-extrabold tracking-tight">
              Daily LeetCode
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {user ? (
            <>
              {/* Streak Badge */}
              <div className="flex items-center gap-2 text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-full font-bold text-sm shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                <Flame size={16} className="animate-bounce text-amber-400 fill-amber-500/20" />
                <span className="hidden xs:inline">{user.streak} Day Streak</span>
                <span className="xs:hidden">{user.streak}</span>
              </div>

              {/* Navigation Links */}
              <div className="flex items-center gap-1 sm:gap-2 border-l border-white/10 pl-2 sm:pl-4">
                <Link 
                  to="/history" 
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    location.pathname === '/history' 
                      ? 'text-blue-400 bg-blue-500/10 border border-blue-500/10' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <BookOpen size={16} />
                  <span className="hidden md:inline">Problem Bank</span>
                </Link>
                
                <Link 
                  to="/progress" 
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    location.pathname === '/progress' 
                      ? 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/10' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <LineChart size={16} />
                  <span className="hidden md:inline">Analytics</span>
                </Link>
              </div>

              {/* User Avatar Chip */}
              <div className="flex items-center gap-3 border-l border-white/10 pl-2 sm:pl-4 ml-1">
                <div className="flex items-center gap-2 bg-slate-900/60 border border-white/5 pl-2 pr-3 py-1 rounded-full">
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white w-7 h-7 flex items-center justify-center rounded-full font-black text-xs shadow-md">
                    {getInitials(user.name)}
                  </div>
                  <span className="hidden sm:inline text-xs font-semibold text-slate-300 max-w-[100px] truncate">
                    {user.name}
                  </span>
                </div>

                <button
                  onClick={logout}
                  className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 p-2 rounded-xl transition-all border border-transparent hover:border-rose-500/20"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link 
                to="/login" 
                className="text-slate-300 hover:text-white font-semibold text-sm px-4 py-2 transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="bg-white text-slate-950 hover:bg-slate-200 px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_35px_rgba(255,255,255,0.3)]"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

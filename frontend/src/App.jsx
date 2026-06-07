import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Progress from './pages/Progress';
import History from './pages/History';
import Login from './pages/Login';
import Register from './pages/Register';

import { Code2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const LoadingScreen = () => {
  const { serverWaking } = useContext(AuthContext);
  
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6 relative overflow-hidden">
      {/* Animated Glowing Blobs */}
      <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-blue-600/10 rounded-full filter blur-[80px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-indigo-600/10 rounded-full filter blur-[80px] pointer-events-none animate-pulse"></div>

      <div className="relative flex flex-col items-center max-w-md text-center z-10">
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: "easeInOut",
          }}
          className="bg-slate-900/80 p-5 rounded-3xl border border-white/10 shadow-2xl mb-8 flex justify-center text-blue-400"
        >
          <Code2 size={48} className="text-blue-500" />
        </motion.div>

        <h2 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2 mb-3">
          <span>DSAVerse is initializing</span>
          <Sparkles className="text-amber-400 animate-bounce" size={18} />
        </h2>

        {serverWaking ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <p className="text-sm font-bold text-blue-400 uppercase tracking-widest animate-pulse">
              Waking up backend server...
            </p>
            <p className="text-xs text-slate-400 leading-relaxed bg-white/5 border border-white/5 p-4 rounded-2xl backdrop-blur-md">
              Our backend runs on Render's free tier and spins down after 15 minutes of inactivity. Waking it up can take 30-50 seconds. Thanks for waiting!
            </p>
          </motion.div>
        ) : (
          <p className="text-xs text-slate-500">
            Checking authentication and loading environment variables...
          </p>
        )}

        {/* Custom Progress bar */}
        <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden mt-6">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
            animate={{
              width: ["0%", "100%"],
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: "linear",
            }}
          />
        </div>
      </div>
    </div>
  );
};

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <LoadingScreen />;
  return user ? children : <Navigate to="/login" />;
};

const AppContent = () => {
  const { user } = useContext(AuthContext);
  return (
    <div className="min-h-screen text-slate-300 font-sans relative">
      <div className="fixed-bg"></div>
      <div className="grid-overlay"></div>
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="/progress" element={
          <PrivateRoute>
            <Progress />
          </PrivateRoute>
        } />
        <Route path="/history" element={
          <PrivateRoute>
            <History />
          </PrivateRoute>
        } />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;

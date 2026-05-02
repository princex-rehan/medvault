import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, User, Activity, FileText, Upload, Clock, Share2, Search, QrCode, ClipboardList, Shield, Menu, X, ChevronRight } from 'lucide-react';
import { api } from './lib/api';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import PatientDashboard from './pages/PatientDashboard';
import PatientUpload from './pages/PatientUpload';
import PatientTimeline from './pages/PatientTimeline';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientView from './pages/PatientView';
import HealthChatbot from './components/HealthChatbot';

export default function App() {
  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem('medvault_user');
    return saved ? JSON.parse(saved) : null;
  });

  const loginUser = (userData: any) => {
    setUser(userData);
    localStorage.setItem('medvault_user', JSON.stringify(userData));
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem('medvault_user');
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#f3f7ff] text-[#1e293b] font-sans selection:bg-blue-100 pb-20 md:pb-0">
        <AnimatePresence mode="wait">
          {user && <Navbar user={user} logoutUser={logoutUser} />}
        </AnimatePresence>

        <main className="max-w-md mx-auto min-h-[calc(100vh-64px)] md:max-w-none">
          <Routes>
            <Route path="/login" element={!user ? <Login loginUser={loginUser} /> : <Navigate to="/" />} />
            <Route path="/onboarding" element={user ? <Onboarding user={user} loginUser={loginUser} /> : <Navigate to="/login" />} />
            
            <Route path="/" element={
              user ? (
                !user.onboardingComplete ? <Navigate to="/onboarding" /> : (
                  user.role === 'patient' ? <Navigate to="/patient/dashboard" /> : <Navigate to="/doctor/dashboard" />
                )
              ) : <Navigate to="/login" />
            } />

            {/* Patient Routes */}
            <Route path="/patient/dashboard" element={<ProtectedRoute user={user} role="patient"><PatientDashboard user={user} loginUser={loginUser} /></ProtectedRoute>} />
            <Route path="/patient/upload" element={<ProtectedRoute user={user} role="patient"><PatientUpload user={user} /></ProtectedRoute>} />
            <Route path="/patient/timeline" element={<ProtectedRoute user={user} role="patient"><PatientTimeline user={user} /></ProtectedRoute>} />

            {/* Doctor Routes */}
            <Route path="/doctor/dashboard" element={<ProtectedRoute user={user} role="doctor"><DoctorDashboard user={user} /></ProtectedRoute>} />
            <Route path="/doctor/patient/:id" element={<ProtectedRoute user={user} role="doctor"><PatientView doctor={user} /></ProtectedRoute>} />
          </Routes>
        </main>

        <AnimatePresence>
          {user && user.onboardingComplete && <HealthChatbot />}
        </AnimatePresence>

        {user && user.onboardingComplete && <MobileNav user={user} />}
      </div>
    </BrowserRouter>
  );
}

function ProtectedRoute({ children, user, role }: { children: any, user: any, role: string }) {
  if (!user) return <Navigate to="/login" />;
  if (user.role !== role) return <Navigate to="/" />;
  if (!user.onboardingComplete) return <Navigate to="/onboarding" />;
  return children;
}

function Navbar({ user, logoutUser }: { user: any, logoutUser: () => void }) {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200 px-6 py-4 hidden md:flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2 font-bold text-xl text-blue-600">
        <Activity className="w-6 h-6" />
        <span>MedVault</span>
      </Link>
      <div className="flex items-center gap-6">
        <span className="text-sm font-medium text-neutral-600">
          {user.name || user.email} ({user.role})
        </span>
        <button 
          onClick={logoutUser}
          className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-500 hover:text-red-500"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
}

function MobileNav({ user }: { user: any }) {
  const isPatient = user.role === 'patient';
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-2 py-3 flex justify-around items-center md:hidden z-50">
      {isPatient ? (
        <>
          <NavLink to="/patient/dashboard" icon={<User className="w-6 h-6" />} label="Home" />
          <NavLink to="/patient/upload" icon={<Upload className="w-6 h-6" />} label="Upload" />
          <NavLink to="/patient/timeline" icon={<Clock className="w-6 h-6" />} label="Timeline" />
        </>
      ) : (
        <>
          <NavLink to="/doctor/dashboard" icon={<Search className="w-6 h-6" />} label="Search" />
          <div className="flex flex-col items-center gap-1 opacity-40">
            <Clock className="w-6 h-6" />
            <span className="text-[10px]">History</span>
          </div>
        </>
      )}
    </nav>
  );
}

function NavLink({ to, icon, label }: { to: string, icon: any, label: string }) {
  return (
    <Link to={to} className="flex flex-col items-center gap-1 text-neutral-500 hover:text-blue-600 transition-colors">
      {icon}
      <span className="text-[10px] font-medium tracking-wide uppercase">{label}</span>
    </Link>
  );
}

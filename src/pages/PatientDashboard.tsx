import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Clock, Share2, Shield, QrCode as QrIcon, User, ChevronRight, Bell, Plus, Trash2, Pill } from 'lucide-react';
import { Link } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { api } from '../lib/api';

export default function PatientDashboard({ user, loginUser }: { user: any, loginUser: (u: any) => void }) {
  const [reminders, setReminders] = useState<any[]>([]);
  const [newMed, setNewMed] = useState('');
  const [showAddMed, setShowAddMed] = useState(false);

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const data = await api.getReminders(user.id);
        setReminders(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchReminders();
  }, [user.id]);

  const toggleSharing = async () => {
    try {
      const res = await api.toggleSharing(user.id, !user.sharingEnabled);
      loginUser({ ...user, sharingEnabled: res.sharingEnabled });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMed.trim()) return;
    try {
      const reminder = await api.addReminder({ patientId: user.id, text: newMed, completed: false });
      setReminders([...reminders, reminder]);
      setNewMed('');
      setShowAddMed(false);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteMed = async (id: string) => {
    try {
      await api.deleteReminder(id);
      setReminders(reminders.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="px-6 py-10 space-y-6 md:space-y-0 md:grid md:grid-cols-12 md:gap-6 max-w-5xl mx-auto">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bento-card md:col-span-4 md:row-span-4"
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-bold text-2xl">
            👤
          </div>
          <div>
            <h2 className="font-bold text-xl text-neutral-900 leading-tight">{user.name}</h2>
            <p className="text-neutral-500 text-sm mt-1 uppercase tracking-tighter font-mono">#{user.id.slice(-6)}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-auto">
          <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100">
            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Age</p>
            <p className="font-bold text-neutral-900">{user.age} Yrs</p>
          </div>
          <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100 border-l-[3px] border-l-red-500">
            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Blood</p>
            <p className="font-bold text-neutral-900">{user.bloodGroup}</p>
          </div>
        </div>
      </motion.div>

      {/* QR Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bento-card md:col-span-4 md:row-span-4 items-center justify-center text-center px-4"
      >
        <div className="bg-neutral-50 p-3 rounded-2xl border-2 border-dashed border-neutral-200 mb-4 inline-block">
          <QRCode 
            value={`${window.location.origin}/doctor/patient/${user.id}`} 
            size={120}
            className="w-full h-auto"
          />
        </div>
        <h3 className="font-bold text-lg mb-1">Emergency QR</h3>
        <p className="text-neutral-500 text-xs mb-4 leading-relaxed">Let doctors access your history in one scan.</p>
        <button 
          onClick={() => {
            navigator.clipboard.writeText(user.id);
            alert('Patient ID copied!');
          }}
          className="text-[10px] font-bold text-blue-600/60 uppercase tracking-widest hover:text-blue-600 transition-colors"
        >
          Copy ID: {user.id}
        </button>
      </motion.div>

      {/* Medication Reminders Widget */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bento-card md:col-span-4 md:row-span-7"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-lg">Meds</h3>
          </div>
          <button 
            onClick={() => setShowAddMed(!showAddMed)}
            className="p-1.5 bg-neutral-50 hover:bg-blue-50 text-neutral-400 hover:text-blue-600 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-hidden">
          <AnimatePresence>
            {showAddMed && (
              <motion.form 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                onSubmit={handleAddMed}
                className="overflow-hidden"
              >
                <input 
                  autoFocus
                  value={newMed}
                  onChange={(e) => setNewMed(e.target.value)}
                  placeholder="Enter medication..."
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition-all mb-2"
                />
              </motion.form>
            )}
          </AnimatePresence>

          <div className="space-y-2 overflow-y-auto pr-1 max-h-[300px]">
            {reminders.map((r) => (
              <motion.div 
                key={r.id}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-3 bg-neutral-50 border border-neutral-100 rounded-2xl group"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <Pill className="w-4 h-4 text-blue-300 flex-shrink-0" />
                  <span className="text-sm font-medium text-neutral-700 truncate">{r.text}</span>
                </div>
                <button 
                  onClick={() => deleteMed(r.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
            {reminders.length === 0 && !showAddMed && (
              <p className="text-xs text-neutral-400 text-center py-8">No reminders set.</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Privacy Control */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bento-card md:col-span-4 md:row-span-3"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Sharing</h3>
          <button 
            onClick={toggleSharing}
            className={`w-11 h-6 rounded-full transition-all relative ${user.sharingEnabled ? 'bg-blue-600' : 'bg-neutral-200'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${user.sharingEnabled ? 'right-1' : 'left-1'}`} />
          </button>
        </div>
        <p className="text-neutral-500 text-xs mb-4">
          Status: <b>{user.sharingEnabled ? 'VISIBLE TO DOCTORS' : 'PRIVATE VAULT'}</b>. 
        </p>
        <div className="mt-auto flex items-center gap-2 text-[#10b981]">
          <span className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
          <span className="text-[10px] font-bold uppercase tracking-wider">Live Sync</span>
        </div>
      </motion.div>

      {/* Actions */}
      <div className="md:col-span-8 md:row-span-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
          <Link to="/patient/upload" className="bento-card hover:border-blue-300 transition-colors group">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-500/20">
              <Upload className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-lg mb-1 group-hover:text-blue-600 transition-colors">Digital Upload</h4>
            <p className="text-neutral-500 text-xs">Send records directly to your Vault</p>
          </Link>
          <Link to="/patient/timeline" className="bento-card hover:border-blue-300 transition-colors group">
            <div className="w-12 h-12 bg-neutral-800 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-neutral-800/20">
              <Clock className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-lg mb-1 group-hover:text-blue-600 transition-colors">Full Timeline</h4>
            <p className="text-neutral-500 text-xs">Browse all historical documents</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

function ActionButton({ to, icon, title, desc, color }: any) {
  return (
    <Link to={to} className="group active:scale-[0.98] transition-transform">
      <div className="bg-white p-5 rounded-3xl border border-neutral-100 shadow-sm flex items-center gap-4 hover:border-blue-200 hover:bg-blue-50/10 transition-colors">
        <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center text-white shadow-lg shadow-neutral-200`}>
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-neutral-900">{title}</h4>
          <p className="text-neutral-500 text-xs">{desc}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-neutral-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
      </div>
    </Link>
  );
}

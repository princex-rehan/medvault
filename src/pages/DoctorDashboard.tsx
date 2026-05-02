import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, QrCode, ClipboardList, Shield, ChevronRight, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QRScanner from '../components/QRScanner';

export default function DoctorDashboard({ user }: { user: any }) {
  const [patientId, setPatientId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (patientId.trim()) {
      navigate(`/doctor/patient/${patientId.trim()}`);
    }
  };

  const handleScan = (decodedText: string) => {
    setIsScanning(false);
    // Expecting full URL like: https://.../doctor/patient/ID
    // Extract ID from URL if it's a URL, otherwise use as is
    try {
      const url = new URL(decodedText);
      const parts = url.pathname.split('/');
      const id = parts[parts.length - 1];
      if (id) navigate(`/doctor/patient/${id}`);
    } catch {
      navigate(`/doctor/patient/${decodedText}`);
    }
  };

  return (
    <div className="px-6 py-10 space-y-6 md:space-y-0 md:grid md:grid-cols-12 md:gap-6 max-w-5xl mx-auto">
      <AnimatePresence>
        {isScanning && (
          <QRScanner 
            onScan={handleScan} 
            onClose={() => setIsScanning(false)} 
          />
        )}
      </AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="md:col-span-12 mb-4"
      >
        <h1 className="text-3xl font-extrabold text-neutral-900 mb-2">Doctor's Desk</h1>
        <p className="text-neutral-500">Welcome, Dr. {user.name}. Input a patient ID or scan a QR to view medical history.</p>
      </motion.div>

      {/* Search Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="md:col-span-8 md:row-span-6 bento-card bg-neutral-900 text-white p-10 shadow-2xl shadow-neutral-200"
      >
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-500/20">
          <Search className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold mb-8">Patient Lookup</h2>
        
        <form onSubmit={handleSearch} className="space-y-6">
          <div className="relative group">
            <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 group-focus-within:text-blue-400 transition-colors" />
            <input
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              placeholder="Enter Patient ID (e.g. MV-1234)"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all font-medium text-lg"
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-5 font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 group active:scale-[0.99]"
          >
            Access Secure Record
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-all" />
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-white/5 space-y-6">
          <div className="flex items-center gap-5 text-neutral-400">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
              <QrCode className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider leading-relaxed opacity-60">Scan the patient's MedVault QR to open history instantly.</p>
          </div>
          
          <button 
            onClick={() => setIsScanning(true)}
            className="w-full bg-white/10 hover:bg-white/20 text-white rounded-2xl py-4 font-bold border border-white/10 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            <QrCode className="w-5 h-5 text-blue-400" />
            Open QR Scanner
          </button>
        </div>
      </motion.div>

      {/* Side Cards */}
      <div className="md:col-span-4 md:row-span-3 bento-card">
        <Shield className="w-8 h-8 text-blue-600 mb-4" />
        <h3 className="font-bold text-lg mb-1">Privacy First</h3>
        <p className="text-neutral-500 text-sm">Patients must explicitly enable sharing before you can access their medical history.</p>
      </div>

      <div className="md:col-span-4 md:row-span-3 bento-card bg-blue-50 border-blue-100">
        <ClipboardList className="w-8 h-8 text-blue-800 mb-4" />
        <h3 className="font-bold text-lg mb-1 text-blue-900">Timeline View</h3>
        <p className="text-blue-800/70 text-sm">Unified view of prescriptions and lab reports sorted by investigation date.</p>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, User, ShieldAlert, FileText, ClipboardList, Calendar, ExternalLink, Loader2 } from 'lucide-react';
import { api } from '../lib/api';

export default function PatientView({ doctor }: { doctor: any }) {
  const { id } = useParams();
  const [patient, setPatient] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const patientData = await api.getProfile(id!);
        setPatient(patientData);
        
        const recordsData = await api.getRecords(id!, doctor.id);
        setRecords(recordsData.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, doctor.id]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      <p className="text-neutral-500 font-medium">Validating Access...</p>
    </div>
  );

  if (error) return (
    <div className="px-6 py-20 flex flex-col items-center text-center">
      <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center text-red-500 mb-6 border border-red-100">
        <ShieldAlert className="w-10 h-10" />
      </div>
      <h1 className="text-2xl font-extrabold text-neutral-900 mb-4">Access Denied</h1>
      <p className="text-neutral-500 mb-10 max-w-xs">{error}</p>
      <Link to="/" className="w-full bg-neutral-900 text-white rounded-2xl py-4 font-bold shadow-lg shadow-neutral-100 max-w-xs">
        Return to Dashboard
      </Link>
    </div>
  );

  return (
    <div className="px-6 py-10 min-h-screen max-w-5xl mx-auto">
      <Link to="/" className="flex items-center gap-1 text-neutral-400 text-sm font-medium mb-8 hover:text-neutral-900 transition-colors">
        <ChevronLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 md:space-y-0 md:grid md:grid-cols-12 md:gap-6"
      >
        <div className="md:col-span-12 bento-card flex-row items-center gap-5">
           <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100/50 flex-shrink-0 text-2xl font-bold">
            👤
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-neutral-900">{patient.name}</h1>
            <p className="text-neutral-500 text-sm mt-1">{patient.gender} • {patient.age} yrs • Blood {patient.bloodGroup}</p>
          </div>
        </div>

        <div className="md:col-span-8 md:row-span-6 bento-card">
          <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-neutral-100 pb-3">
            <Calendar className="w-4 h-4" />
            Medical History Timeline
          </h2>
          
          {records.length === 0 ? (
            <div className="bg-neutral-50 p-10 rounded-[2rem] text-center border border-dashed border-neutral-200">
              <p className="text-neutral-400 text-sm font-medium">No records shared yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {records.map((record, index) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center p-4 bg-neutral-50 rounded-2xl border border-neutral-100 hover:bg-white hover:shadow-sm transition-all group"
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white flex-shrink-0 ${
                    record.type === 'prescription' ? 'bg-blue-600' : 'bg-neutral-800'
                  }`}>
                    {record.type === 'prescription' ? <FileText className="w-5 h-5" /> : <ClipboardList className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 ml-4 overflow-hidden">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-0.5">
                      {new Date(record.createdAt).toLocaleDateString()}
                    </p>
                    <h4 className="font-bold text-neutral-900 text-sm truncate">{record.originalName}</h4>
                  </div>
                  <a 
                    href={`/uploads/${record.fileName}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="ml-4 p-3 bg-white rounded-xl text-neutral-400 hover:text-blue-600 shadow-sm transition-all border border-neutral-100 group-hover:border-blue-200"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="md:col-span-4 md:row-span-3 bento-card bg-blue-700 text-white border-none">
          <ShieldAlert className="w-8 h-8 text-white/50 mb-4" />
          <h3 className="font-bold text-lg mb-2">Access Status</h3>
          <p className="text-white/80 text-sm leading-relaxed mb-4">
            You have temporary access to this vault because the patient has enabled live sharing.
          </p>
          <div className="mt-auto flex items-center gap-2 text-green-400">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Active Session</span>
          </div>
        </div>

        <div className="md:col-span-4 md:row-span-3 bento-card">
          <h3 className="font-bold text-sm text-neutral-400 uppercase tracking-widest mb-3">Residential Address</h3>
          <p className="text-neutral-900 text-sm leading-relaxed font-medium">{patient.address}</p>
          <div className="mt-auto pt-4 border-t border-neutral-50 flex items-center gap-2 text-neutral-400">
             <Calendar className="w-4 h-4" />
             <span className="text-xs">Joined MedVault recently</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock, FileText, ClipboardList, ChevronLeft, ExternalLink, Activity, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

export default function PatientTimeline({ user }: { user: any }) {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const data = await api.getRecords(user.id, user.id);
        setRecords(data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, [user.id]);

  return (
    <div className="px-6 py-10 min-h-screen">
      <Link to="/" className="flex items-center gap-1 text-neutral-400 text-sm font-medium mb-8 hover:text-neutral-900 transition-colors">
        <ChevronLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-extrabold text-neutral-900 mb-2">Medical Records</h1>
        <p className="text-neutral-500 mb-10">Your organized timeline of health events.</p>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-neutral-100 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : records.length === 0 ? (
          <div className="bg-neutral-50 p-12 rounded-[2.5rem] border border-neutral-100 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-neutral-200/50 rounded-2xl flex items-center justify-center text-neutral-400 mb-6 font-bold">?</div>
            <h3 className="font-bold text-neutral-900">No records found</h3>
            <p className="text-neutral-500 text-sm mt-1 mb-8">Start by uploading your first medical document.</p>
            <Link to="/patient/upload" className="font-bold text-blue-600 border-b-2 border-blue-100 pb-1">
              Upload Now
            </Link>
          </div>
        ) : (
          <div className="space-y-4 relative">
             <div className="absolute left-6 top-0 bottom-0 w-px bg-neutral-200 -z-10" />
            
            {records.map((record, index) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-5 rounded-3xl border border-neutral-100 shadow-sm flex items-start gap-4 relative z-10"
              >
                <div className={`w-12 h-12 flex-shrink-0 rounded-2xl flex items-center justify-center shadow-lg shadow-neutral-100 ${
                  record.type === 'prescription' ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-white'
                }`}>
                  {record.type === 'prescription' ? <FileText className="w-6 h-6" /> : <ClipboardList className="w-6 h-6" />}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-full">
                      {record.type}
                    </span>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(record.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-bold text-neutral-900 mb-1">{record.originalName}</h4>
                  <a 
                    href={`/uploads/${record.fileName}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-bold text-neutral-500 hover:text-blue-600 transition-colors group mt-2"
                  >
                    View Document
                    <ExternalLink className="w-3 h-3 group-hover:scale-110 transition-transform" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

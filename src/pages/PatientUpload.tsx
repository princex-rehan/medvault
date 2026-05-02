import { useState, ChangeEvent, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Upload, FileText, CheckCircle2, ChevronLeft, Loader2, FileUp, ClipboardList } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';

export default function PatientUpload({ user }: { user: any }) {
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<'prescription' | 'report'>('prescription');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('patientId', user.id);
    formData.append('type', type);

    try {
      await api.uploadRecord(formData);
      setSuccess(true);
      setTimeout(() => navigate('/patient/timeline'), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-3xl font-extrabold text-neutral-900 mb-2">Upload Record</h1>
        <p className="text-neutral-500 mb-10">Add a new medical record to your vault.</p>

        {success ? (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-green-50 border border-green-100 rounded-[2.5rem] p-12 flex flex-col items-center text-center"
          >
            <div className="w-20 h-20 bg-green-500 rounded-3xl flex items-center justify-center text-white mb-6 shadow-lg shadow-green-100">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-green-900 mb-2">Upload Successful!</h2>
            <p className="text-green-700 text-sm">Redirecting to your timeline...</p>
          </motion.div>
        ) : (
          <form onSubmit={handleUpload} className="space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Record Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setType('prescription')}
                  className={`p-5 rounded-3xl border transition-all flex flex-col items-center gap-3 ${
                    type === 'prescription' ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white border-neutral-100 text-neutral-500'
                  }`}
                >
                  <FileText className="w-6 h-6" />
                  <span className="font-bold text-sm">Prescription</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType('report')}
                  className={`p-5 rounded-3xl border transition-all flex flex-col items-center gap-3 ${
                    type === 'report' ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white border-neutral-100 text-neutral-500'
                  }`}
                >
                  <ClipboardList className="w-6 h-6" />
                  <span className="font-bold text-sm">Lab Report</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Select File</label>
              <div 
                className={`relative border-2 border-dashed rounded-[2rem] p-12 flex flex-col items-center justify-center text-center transition-all ${
                  file ? 'border-blue-500 bg-blue-50/20' : 'border-neutral-200 bg-neutral-50 hover:border-neutral-300'
                }`}
              >
                <input
                  type="file"
                  onChange={handleFileChange}
                  required
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${file ? 'bg-blue-500 text-white' : 'bg-white text-neutral-400 shadow-sm'}`}>
                  {file ? <FileUp className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
                </div>
                {file ? (
                  <div>
                    <p className="font-bold text-neutral-900 text-sm truncate max-w-[200px]">{file.name}</p>
                    <p className="text-neutral-500 text-xs mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div>
                    <p className="font-bold text-neutral-900 text-sm">Tap to upload</p>
                    <p className="text-neutral-500 text-xs mt-1">PDF or Image (Max 5MB)</p>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={!file || loading}
              className="w-full bg-neutral-900 text-white rounded-2xl py-5 font-bold hover:bg-neutral-800 transition-all active:scale-[0.98] disabled:opacity-30 flex items-center justify-center gap-2 group mt-8 shadow-xl shadow-neutral-100"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Securely Upload'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}

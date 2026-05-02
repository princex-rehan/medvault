import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Calendar, MapPin, Award, ChevronRight, Droplets, UserRound } from 'lucide-react';
import { api } from '../lib/api';

export default function Onboarding({ user, loginUser }: { user: any, loginUser: (u: any) => void }) {
  const [formData, setFormData] = useState<any>({
    name: '',
    age: '',
    gender: 'Other',
    bloodGroup: 'A+',
    address: '',
    degree: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedUser = await api.updateProfile(user.id, formData);
      loginUser(updatedUser);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isPatient = user.role === 'patient';

  return (
    <div className="px-6 py-12 min-h-screen bg-white">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <span className="text-blue-600 font-bold tracking-widest text-xs uppercase mb-2 block">Step 2 / 2</span>
        <h1 className="text-3xl font-extrabold text-neutral-900 mb-2">Complete Profile</h1>
        <p className="text-neutral-500 mb-10">We need a few more details to set up your {user.role} workspace.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <InputGroup label="Full Name" icon={<User className="w-4 h-4" />}>
            <input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="onboarding-input"
              placeholder="John Doe"
            />
          </InputGroup>

          {isPatient ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <InputGroup label="Age" icon={<Calendar className="w-4 h-4" />}>
                  <input
                    required
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="onboarding-input"
                    placeholder="25"
                  />
                </InputGroup>
                <InputGroup label="Gender" icon={<UserRound className="w-4 h-4" />}>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="onboarding-input appearance-none"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </InputGroup>
              </div>

              <InputGroup label="Blood Group" icon={<Droplets className="w-4 h-4 text-red-500" />}>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="onboarding-input appearance-none"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg}>{bg}</option>
                  ))}
                </select>
              </InputGroup>
            </>
          ) : (
            <InputGroup label="Degree / Specialization" icon={<Award className="w-4 h-4" />}>
              <input
                required
                value={formData.degree}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                className="onboarding-input"
                placeholder="MD, Cardiology"
              />
            </InputGroup>
          )}

          <InputGroup label="Address" icon={<MapPin className="w-4 h-4" />}>
            <textarea
              required
              rows={3}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="onboarding-input resize-none"
              placeholder="123 Medic Lane, Healthy City"
            />
          </InputGroup>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-neutral-900 text-white rounded-2xl py-5 font-bold hover:bg-neutral-800 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 group mt-8"
          >
            {loading ? 'Saving Profile...' : 'Finish Setup'}
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </motion.div>

      <style>{`
        .onboarding-input {
          width: 100%;
          background-color: #f7f7f7;
          border: 1px solid #eeeeee;
          border-radius: 1rem;
          padding: 1rem 1rem 1rem 3rem;
          outline: none;
          transition: all 0.2s;
        }
        .onboarding-input:focus {
          background-color: white;
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }
      `}</style>
    </div>
  );
}

function InputGroup({ label, icon, children }: { label: string, icon: any, children: any }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] ml-1">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-[1.125rem] text-neutral-400">
          {icon}
        </div>
        {children}
      </div>
    </div>
  );
}

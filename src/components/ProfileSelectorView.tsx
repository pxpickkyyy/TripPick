import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ALL_AMENITIES } from '../lib/travelDestinations';

interface ProfileSelectorViewProps {
  onSubmit: (name: string, role: string, preferredAmenities: string[]) => Promise<boolean>;
  loading: boolean;
  error: string | null;
  onBack: () => void;
}

const ROLES = [
  'Founder / C-Level',
  'Engineering / Tech Lead',
  'Product & Design Lead',
  'People / HR & Events',
  'Team Member'
];

export function ProfileSelectorView({ onSubmit, loading, error, onBack }: ProfileSelectorViewProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState(ROLES[0]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'Starlink / Fiber 500+ Mbps',
    'Executive Boardroom & AV'
  ]);
  const [nameError, setNameError] = useState<string | null>(null);

  const toggleAmenity = (amenityName: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenityName)
        ? prev.filter(a => a !== amenityName)
        : [...prev, amenityName]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('Please enter your name or role identifier.');
      return;
    }
    await onSubmit(name, role, selectedAmenities);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center min-h-[85vh] px-4 text-center select-none py-8 relative z-10"
    >
      <div className="w-full max-w-xl text-left mb-4">
        <button
          onClick={onBack}
          className="text-slate-400 hover:text-cyan-300 transition-colors text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
        >
          ← Return
        </button>
      </div>

      <div className="w-full max-w-xl glass-panel p-6 md:p-8 rounded-3xl border border-slate-700/60 shadow-2xl">
        <div className="text-center mb-6">
          <span className="px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-mono text-[10px] uppercase tracking-widest font-bold">
            Step 1 of 2: Team Identity
          </span>
          <h2 className="text-2xl font-black text-white uppercase tracking-wider mt-2">
            Configure Your Retreat Profile
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Set your retreat priorities. We filter the deck based on what your team actually values.
          </p>
        </div>

        {(error || nameError) && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-mono text-center">
            {error || nameError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-left">
          {/* Display Name Input */}
          <div>
            <label className="text-[11px] font-bold text-slate-300 uppercase font-mono tracking-wider block mb-2">
              Your Name &amp; Title
            </label>
            <input
              type="text"
              required
              maxLength={25}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError(null);
              }}
              placeholder="e.g. Sarah (Head of Engineering)"
              className="w-full py-3.5 px-4 bg-slate-900/90 border border-slate-700 rounded-xl text-white font-medium text-sm focus:outline-none focus:border-cyan-500 transition-all placeholder:text-slate-600"
            />
          </div>

          {/* Role selector */}
          <div>
            <label className="text-[11px] font-bold text-slate-300 uppercase font-mono tracking-wider block mb-2">
              Primary Role for This Retreat
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ROLES.map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRole(r)}
                  className={`py-2 px-3 rounded-xl text-xs font-mono font-medium text-center transition-all cursor-pointer border ${
                    role === r
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-200'
                      : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Must-Have Business & Tourism Amenities */}
          <div>
            <label className="text-[11px] font-bold text-slate-300 uppercase font-mono tracking-wider block mb-2">
              Must-Have Amenities &amp; Perks
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ALL_AMENITIES.map((amenity) => {
                const isSelected = selectedAmenities.includes(amenity.name);
                return (
                  <div
                    key={amenity.id}
                    onClick={() => toggleAmenity(amenity.name)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500/50 text-white shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                        : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xl">{amenity.icon}</span>
                    <span className="text-xs font-mono font-semibold flex-1">{amenity.name}</span>
                    <span className={`text-xs font-bold ${isSelected ? 'text-emerald-400' : 'text-slate-600'}`}>
                      {isSelected ? '✓' : '+'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit CTA */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-2 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold rounded-2xl text-xs font-mono tracking-widest uppercase shadow-[0_0_20px_rgba(6,182,212,0.25)] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? 'Joining Lobby...' : 'Proceed to Retreat Lobby →'}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}

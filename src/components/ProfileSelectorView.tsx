import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ALL_AMENITIES } from '../lib/travelDestinations';
import { useLanguage } from '../lib/i18n';

interface ProfileSelectorViewProps {
  onSubmit: (name: string, role: string, preferredAmenities: string[]) => Promise<boolean>;
  loading: boolean;
  error: string | null;
  onBack: () => void;
}

const ROLES_MAP = {
  th: [
    'ผู้บริหาร / ผู้ก่อตั้ง (C-Level)',
    'หัวหน้าฝ่ายวิศวกรรม / เทค (Tech Lead)',
    'ฝ่ายผลิตภัณฑ์ & ดีไซน์ (Product & Design)',
    'ฝ่ายบุคคล & จัดกิจกรรม (HR & People)',
    'สมาชิกทีม (Team Member)',
  ],
  en: [
    'Executive / Founder (C-Level)',
    'Head of Engineering (Tech Lead)',
    'Product & Design Lead',
    'HR & People Operations',
    'Team Member / Attendee',
  ],
};

const AMENITIES_EN_MAP: Record<string, string> = {
  'wifi': 'Starlink / Fiber Internet 500+ Mbps',
  'boardroom': 'Executive Boardroom & Full AV System',
  'private_pool': 'Private Cliffside / Beachfront Pool',
  'team_dining': 'Private Chef & Group Catering',
  'airport_shuttle': 'Private VIP Airport Vans',
  'coworking': 'Coworking Zone with Nature Views',
  'wellness': 'Spa, Thai Massage & Yoga Classes',
  'adventure': 'Private Yacht Cruise & Team Bonding',
};

export function ProfileSelectorView({ onSubmit, loading, error, onBack }: ProfileSelectorViewProps) {
  const { language, t } = useLanguage();
  const currentRoles = ROLES_MAP[language];

  const [name, setName] = useState('');
  const [roleIndex, setRoleIndex] = useState(0);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'wifi',
    'boardroom',
  ]);
  const [nameError, setNameError] = useState<string | null>(null);

  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenityId)
        ? prev.filter((a) => a !== amenityId)
        : [...prev, amenityId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError(t.nameError);
      return;
    }
    const selectedRole = currentRoles[roleIndex] || currentRoles[0];
    // Map selected IDs back to standard names for room matching
    const amenitiesToSubmit = selectedAmenities.map((id) => {
      const found = ALL_AMENITIES.find((a) => a.id === id);
      return found ? found.name : id;
    });

    await onSubmit(name.trim(), selectedRole, amenitiesToSubmit);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center min-h-[calc(100dvh-5rem)] px-4 sm:px-6 py-6 sm:py-10 text-center relative z-20"
    >
      <div className="w-full max-w-xl text-left mb-3 flex items-center justify-between">
        <button
          onClick={onBack}
          className="group inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#181825] hover:bg-[#313244] border border-[#313244] text-xs font-medium text-[#bac2de] hover:text-[#cdd6f4] transition-colors cursor-pointer active:scale-[0.98]"
        >
          <svg className="w-3.5 h-3.5 text-[#cba6f7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          <span>{t.backBtn}</span>
        </button>

        <span className="text-[11px] font-mono text-[#6c7086] uppercase tracking-wider">
          {t.profileStep}
        </span>
      </div>

      {/* Minimalist Enclosure (Low-End Optimized Solid Surfaces) */}
      <div className="w-full max-w-xl p-2 rounded-2xl bg-[#181825] border border-[#313244] shadow-xl">
        <div className="rounded-xl p-5 sm:p-6 bg-[#1e1e2e] border border-[#313244] text-left">
          <div className="mb-5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#313244] border border-[#45475a] mb-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#a6e3a1]" />
              <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-[#cba6f7]">
                PARTICIPANT PROFILE
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#cdd6f4] tracking-tight">
              {t.profileTitle}
            </h2>
            <p className="text-xs text-[#a6adc8] mt-1.5 leading-relaxed">
              {t.profileSubtitle}
            </p>
          </div>

          {(error || nameError) && (
            <div className="mb-4 p-3 rounded-xl bg-[#f38ba8]/15 border border-[#f38ba8]/30 text-[#f38ba8] text-xs">
              {error || nameError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Display Name Input */}
            <div>
              <label className="text-xs font-semibold text-[#bac2de] block mb-1.5 font-mono uppercase tracking-wider text-[11px]">
                {t.nameLabel}
              </label>
              <input
                data-testid="user-name-input"
                type="text"
                required
                maxLength={30}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameError) setNameError(null);
                }}
                placeholder={t.namePlaceholder}
                className="w-full py-2.5 px-3.5 rounded-xl bg-[#181825] border border-[#313244] text-[#cdd6f4] placeholder-[#6c7086] text-xs font-medium focus:outline-none focus:border-[#cba6f7] transition-colors"
              />
            </div>

            {/* Role selector */}
            <div>
              <label className="text-xs font-semibold text-[#bac2de] block mb-1.5 font-mono uppercase tracking-wider text-[11px]">
                {t.roleLabel}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentRoles.map((r, idx) => {
                  const isSelected = roleIndex === idx;
                  return (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setRoleIndex(idx)}
                      className={`p-2.5 rounded-xl text-xs font-medium text-left transition-colors cursor-pointer flex items-center justify-between border active:scale-[0.98] ${
                        isSelected
                          ? 'bg-[#313244] border-[#cba6f7] text-[#cba6f7]'
                          : 'bg-[#181825] border-[#313244] text-[#a6adc8] hover:text-[#cdd6f4] hover:bg-[#313244]/60'
                      }`}
                    >
                      <span>{r}</span>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#cba6f7] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Must-Have Business & Tourism Amenities */}
            <div>
              <label className="text-xs font-semibold text-[#bac2de] block mb-1.5 font-mono uppercase tracking-wider text-[11px]">
                {t.amenitiesLabel}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ALL_AMENITIES.map((amenity) => {
                  const isSelected = selectedAmenities.includes(amenity.id);
                  const displayName = language === 'en' ? (AMENITIES_EN_MAP[amenity.id] || amenity.name) : amenity.name;

                  return (
                    <div
                      key={amenity.id}
                      onClick={() => toggleAmenity(amenity.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-colors cursor-pointer active:scale-[0.98] ${
                        isSelected
                          ? 'bg-[#181825] border-[#a6e3a1]/60 text-[#cdd6f4]'
                          : 'bg-[#181825] border-[#313244] text-[#a6adc8] hover:text-[#cdd6f4] hover:bg-[#313244]/50'
                      }`}
                    >
                      <span className="text-xs font-medium pr-2">{displayName}</span>
                      <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? 'bg-[#a6e3a1] border-[#a6e3a1] text-[#11111b]'
                          : 'border-[#45475a] bg-[#1e1e2e]'
                      }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-[#11111b] stroke-[3]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submit Action */}
            <button
              data-testid="enter-lobby-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-5 mt-1 rounded-xl bg-[#cba6f7] hover:bg-[#b4befe] text-[#11111b] font-bold text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
            >
              <span>{loading ? t.enteringLobbyBtn : t.enterLobbyBtn}</span>
              <svg className="w-4 h-4 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}

import React, { useState, useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
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

  const cardRef = useRef<HTMLDivElement | null>(null);
  const spotX = useMotionValue(260);
  const spotY = useMotionValue(180);
  const spotOpacity = useMotionValue(0);

  const specularOverlay = useMotionTemplate`radial-gradient(420px circle at ${spotX}px ${spotY}px, rgba(203, 166, 247, 0.14), rgba(250, 179, 135, 0.06) 45%, transparent 80%)`;
  const specularBorder = useMotionTemplate`radial-gradient(280px circle at ${spotX}px ${spotY}px, rgba(203, 166, 247, 0.55), rgba(250, 179, 135, 0.25) 50%, rgba(205, 214, 244, 0.08) 100%)`;

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    spotX.set(e.clientX - rect.left);
    spotY.set(e.clientY - rect.top);
    spotOpacity.set(1);
  };

  const handlePointerLeave = () => {
    spotOpacity.set(0);
  };

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
    const amenitiesToSubmit = selectedAmenities.map((id) => {
      const found = ALL_AMENITIES.find((a) => a.id === id);
      return found ? found.name : id;
    });

    await onSubmit(name.trim(), selectedRole, amenitiesToSubmit);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
      className="flex flex-col items-center justify-center min-h-[calc(100dvh-5rem)] px-4 sm:px-6 py-6 sm:py-10 text-center relative z-20"
    >
      {/* Top Editorial Breadcrumb Bar */}
      <div className="w-full max-w-xl text-left mb-3.5 flex items-center justify-between">
        <button
          onClick={onBack}
          className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#181825] hover:bg-[#313244] border border-[#313244] hover:border-[#cba6f7]/50 text-xs font-medium text-[#bac2de] hover:text-[#cdd6f4] transition-all cursor-pointer active:scale-[0.98]"
        >
          <svg className="w-3.5 h-3.5 text-[#cba6f7] group-hover:-translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          <span>{t.backBtn}</span>
        </button>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181825] border border-[#313244] text-[10px] font-mono text-[#cba6f7] uppercase tracking-[0.16em]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#a6e3a1] animate-pulse" />
          <span>{t.profileStep}</span>
        </span>
      </div>

      {/* Double-Bezel (Doppelrand) Executive Profile Card */}
      <motion.div
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        style={{ backgroundImage: specularBorder }}
        className="w-full max-w-xl p-[1px] rounded-[2rem] bg-[#313244] shadow-[0_28px_80px_-16px_rgba(17,17,27,0.85)]"
      >
        <div className="rounded-[calc(2rem-1px)] p-2 bg-[#181825]">
          <div className="relative overflow-hidden rounded-[calc(2rem-0.5rem)] p-5 sm:p-7 bg-[#1e1e2e] border border-[#313244] shadow-[inset_0_1px_0_rgba(205,214,244,0.08)] text-left">
            <motion.div
              aria-hidden="true"
              style={{ background: specularOverlay, opacity: spotOpacity }}
              className="pointer-events-none absolute inset-0 transition-opacity duration-300"
            />

            <div className="relative z-10 mb-5 pb-4 border-b border-[#313244]">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#cba6f7]/15 border border-[#cba6f7]/30 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#cba6f7]" />
                <span className="text-[10px] uppercase font-mono tracking-[0.16em] font-semibold text-[#cba6f7]">
                  01 · EXECUTIVE PROFILE & PREFERENCES
                </span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#cdd6f4] tracking-[-0.035em]">
                {t.profileTitle}
              </h2>
              <p className="text-xs sm:text-sm text-[#bac2de] mt-1.5 leading-relaxed">
                {t.profileSubtitle}
              </p>
            </div>

            {(error || nameError) && (
              <div className="relative z-10 mb-4 p-3.5 rounded-2xl bg-[#f38ba8]/15 border border-[#f38ba8]/40 text-[#f38ba8] text-xs font-medium">
                {error || nameError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-5">
              {/* Display Name Input */}
              <div>
                <label className="text-[10px] font-semibold text-[#a6adc8] block mb-2 font-mono uppercase tracking-[0.16em]">
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
                  className="w-full py-3 px-4 rounded-2xl bg-[#181825] border border-[#313244] text-[#cdd6f4] placeholder-[#6c7086] text-xs font-medium focus:outline-none focus:border-[#cba6f7] transition-all"
                />
              </div>

              {/* Role selector */}
              <div>
                <label className="text-[10px] font-semibold text-[#a6adc8] block mb-2 font-mono uppercase tracking-[0.16em]">
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
                        className={`p-3 rounded-2xl text-xs font-medium text-left transition-all cursor-pointer flex items-center justify-between border active:scale-[0.98] ${
                          isSelected
                            ? 'bg-[#cba6f7]/15 border-[#cba6f7] text-[#cdd6f4] shadow-sm'
                            : 'bg-[#181825] border-[#313244] text-[#a6adc8] hover:text-[#cdd6f4] hover:border-[#45475a]'
                        }`}
                      >
                        <span>{r}</span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-[#cba6f7] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Must-Have Business & Tourism Amenities */}
              <div>
                <label className="text-[10px] font-semibold text-[#a6adc8] block mb-2 font-mono uppercase tracking-[0.16em]">
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
                        className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer active:scale-[0.98] ${
                          isSelected
                            ? 'bg-[#cba6f7]/12 border-[#cba6f7]/60 text-[#cdd6f4]'
                            : 'bg-[#181825] border-[#313244] text-[#a6adc8] hover:text-[#cdd6f4] hover:border-[#45475a]'
                        }`}
                      >
                        <span className="text-xs font-medium pr-2">{displayName}</span>
                        <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border transition-colors ${
                          isSelected
                            ? 'bg-[#cba6f7] border-[#cba6f7] text-[#11111b]'
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

              {/* Submit Action (Button-in-Button Architecture) */}
              <button
                data-testid="enter-lobby-btn"
                type="submit"
                disabled={loading}
                className="group w-full py-3.5 pl-6 pr-3.5 mt-1 rounded-full bg-gradient-to-r from-[#cba6f7] via-[#b4befe] to-[#fab387] text-[#11111b] font-extrabold text-sm shadow-[0_12px_32px_rgba(203,166,247,0.3)] hover:shadow-[0_16px_40px_rgba(203,166,247,0.45)] transition-all duration-300 cursor-pointer flex items-center justify-between active:scale-[0.98] disabled:opacity-50"
              >
                <span className="tracking-tight">{loading ? t.enteringLobbyBtn : t.enterLobbyBtn}</span>
                <div className="w-8 h-8 rounded-full bg-[#11111b] text-[#cba6f7] flex items-center justify-center shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                  <svg className="w-4 h-4 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                  </svg>
                </div>
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

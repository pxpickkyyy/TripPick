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
  'ผู้บริหาร / ผู้ก่อตั้ง (C-Level)',
  'หัวหน้าฝ่ายวิศวกรรม / เทค (Tech Lead)',
  'ฝ่ายผลิตภัณฑ์ & ดีไซน์ (Product & Design)',
  'ฝ่ายบุคคล & จัดกิจกรรม (HR & People)',
  'สมาชิกทีม (Team Member)'
];

export function ProfileSelectorView({ onSubmit, loading, error, onBack }: ProfileSelectorViewProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState(ROLES[0]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'อินเทอร์เน็ต Starlink / Fiber 500+ Mbps',
    'ห้องประชุมผู้บริหาร & ระบบ AV ครบครัน'
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
      setNameError('กรุณากรอกชื่อหรือตำแหน่งของคุณ');
      return;
    }
    await onSubmit(name, role, selectedAmenities);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
      className="flex flex-col items-center justify-center min-h-[calc(100dvh-5rem)] px-4 sm:px-6 py-10 sm:py-16 text-center relative z-20"
    >
      <div className="w-full max-w-xl text-left mb-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="group inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1e1e2e]/80 hover:bg-[#313244] border border-[#45475a]/60 text-xs font-medium text-[#bac2de] hover:text-[#cdd6f4] transition-all duration-300 ease-spring cursor-pointer"
        >
          <svg className="w-3.5 h-3.5 transition-transform duration-300 group-hover:-translate-x-0.5 text-[#cba6f7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          <span>ย้อนกลับ</span>
        </button>

        <span className="text-[11px] font-mono text-[#6c7086] uppercase tracking-wider">
          STEP 01 // 02
        </span>
      </div>

      {/* The Double-Bezel Enclosure (Catppuccin Mocha) */}
      <div className="w-full max-w-xl p-2 sm:p-2.5 rounded-[2.25rem] bg-[#181825]/70 ring-1 ring-[#cba6f7]/20 border border-[#313244]/80 backdrop-blur-2xl shadow-[0_20px_60px_rgba(17,17,27,0.85)]">
        <div className="rounded-[1.75rem] p-6 sm:p-8 bg-[#1e1e2e]/95 border border-[#313244]/80 shadow-[inset_0_1px_1px_rgba(203,166,247,0.15)] text-left">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#cba6f7]/15 border border-[#cba6f7]/30 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#a6e3a1]" />
              <span className="text-[10px] uppercase font-mono tracking-[0.2em] font-semibold text-[#cba6f7]">
                PARTICIPANT PROFILE
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#cdd6f4] tracking-tight">
              ตั้งค่าโปรไฟล์และสิ่งที่ต้องการ
            </h2>
            <p className="text-xs sm:text-sm text-[#a6adc8] mt-2 leading-relaxed">
              เลือกสิ่งอำนวยความสะดวกที่ทีมของคุณให้ความสำคัญ เพื่อให้ระบบฉันทามติคัดเลือกสถานที่ได้ตรงเป้าหมายที่สุด
            </p>
          </div>

          {(error || nameError) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 rounded-2xl bg-[#f38ba8]/15 border border-[#f38ba8]/30 text-[#f38ba8] text-xs sm:text-sm"
            >
              {error || nameError}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Display Name Input */}
            <div>
              <label className="text-xs font-semibold text-[#bac2de] block mb-2 font-mono uppercase tracking-wider text-[11px]">
                ชื่อและตำแหน่งของคุณ
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
                placeholder="เช่น นนท์ (Head of Tech) หรือ มุก (HR Lead)"
                className="w-full py-3.5 px-4 rounded-xl bg-[#181825]/90 border border-[#45475a]/70 text-[#cdd6f4] placeholder-[#6c7086] font-medium text-sm focus:outline-none focus:border-[#cba6f7]/70 focus:bg-[#181825] transition-all duration-300"
              />
            </div>

            {/* Role selector */}
            <div>
              <label className="text-xs font-semibold text-[#bac2de] block mb-2 font-mono uppercase tracking-wider text-[11px]">
                บทบาทของคุณในทริปนี้
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ROLES.map((r) => {
                  const isSelected = role === r;
                  return (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setRole(r)}
                      className={`p-3 rounded-xl text-xs font-medium text-left transition-all duration-300 ease-spring cursor-pointer flex items-center justify-between border ${
                        isSelected
                          ? 'bg-[#cba6f7]/20 border-[#cba6f7]/50 text-[#cba6f7] shadow-[0_0_15px_rgba(203,166,247,0.2)]'
                          : 'bg-[#181825]/60 border-[#313244] text-[#a6adc8] hover:text-[#cdd6f4] hover:bg-[#313244]/50'
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
              <label className="text-xs font-semibold text-[#bac2de] block mb-2 font-mono uppercase tracking-wider text-[11px]">
                สิ่งอำนวยความสะดวกที่จำเป็นต้องมี
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ALL_AMENITIES.map((amenity) => {
                  const isSelected = selectedAmenities.includes(amenity.name);
                  return (
                    <div
                      key={amenity.id}
                      onClick={() => toggleAmenity(amenity.name)}
                      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-300 ease-spring cursor-pointer ${
                        isSelected
                          ? 'bg-[#313244]/90 border-[#a6e3a1]/50 text-[#cdd6f4] shadow-[0_0_15px_rgba(166,227,161,0.15)]'
                          : 'bg-[#181825]/50 border-[#313244] text-[#a6adc8] hover:text-[#cdd6f4] hover:bg-[#313244]/40'
                      }`}
                    >
                      <span className="text-xs font-medium pr-2">{amenity.name}</span>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all duration-300 ${
                        isSelected
                          ? 'bg-[#a6e3a1] border-[#a6e3a1] text-[#11111b]'
                          : 'border-[#45475a] bg-[#181825]'
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

            {/* Nested CTA: Button-in-Button (Catppuccin Mocha Mauve-Sapphire Gradient) */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full py-3.5 pl-6 pr-3 mt-2 rounded-full bg-gradient-to-r from-[#cba6f7] via-[#b4befe] to-[#89b4fa] hover:from-[#d5b8ff] hover:to-[#9ac2ff] text-[#11111b] font-bold text-sm transition-all duration-300 ease-spring active:scale-[0.98] shadow-[0_4px_24px_rgba(203,166,247,0.4)] cursor-pointer flex items-center justify-between disabled:opacity-50"
            >
              <span className="tracking-tight">
                {loading ? 'กำลังเข้าสู่ห้องล็อบบี้...' : 'เข้าสู่ห้องล็อบบี้ทริป'}
              </span>
              <div className="w-9 h-9 rounded-full bg-[#11111b]/25 text-[#11111b] flex items-center justify-center shrink-0 transition-transform duration-300 ease-spring group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <svg className="w-4 h-4 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                </svg>
              </div>
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}

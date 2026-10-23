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
    await onSubmit(name.trim(), role, selectedAmenities);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center min-h-[calc(100dvh-5rem)] px-4 sm:px-6 py-8 sm:py-12 text-center relative z-20"
    >
      <div className="w-full max-w-xl text-left mb-3 flex items-center justify-between">
        <button
          onClick={onBack}
          className="group inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#181825] hover:bg-[#313244] border border-[#313244] text-xs font-medium text-[#bac2de] hover:text-[#cdd6f4] transition-colors cursor-pointer active:scale-[0.98]"
        >
          <svg className="w-3.5 h-3.5 text-[#cba6f7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          <span>ย้อนกลับ</span>
        </button>

        <span className="text-[11px] font-mono text-[#6c7086] uppercase tracking-wider">
          STEP 01 // 02
        </span>
      </div>

      {/* Minimalist Enclosure (Low-End Optimized Solid Surfaces) */}
      <div className="w-full max-w-xl p-2 rounded-2xl bg-[#181825] border border-[#313244] shadow-sm">
        <div className="rounded-xl p-5 sm:p-6 bg-[#1e1e2e] border border-[#313244] text-left">
          <div className="mb-5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#313244] border border-[#45475a] mb-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#a6e3a1]" />
              <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-[#cba6f7]">
                PARTICIPANT PROFILE
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#cdd6f4] tracking-tight">
              ตั้งค่าโปรไฟล์และสิ่งที่ต้องการ
            </h2>
            <p className="text-xs text-[#a6adc8] mt-1.5 leading-relaxed">
              เลือกสิ่งอำนวยความสะดวกที่ทีมของคุณให้ความสำคัญ เพื่อให้ระบบฉันทามติคัดเลือกสถานที่ได้ตรงเป้าหมายที่สุด
            </p>
          </div>

          {(error || nameError) && (
            <div className="mb-5 p-3 rounded-xl bg-[#f38ba8]/15 border border-[#f38ba8]/30 text-[#f38ba8] text-xs">
              {error || nameError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Display Name Input */}
            <div>
              <label className="text-xs font-semibold text-[#bac2de] block mb-1.5 font-mono uppercase tracking-wider text-[11px]">
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
                className="w-full py-2.5 px-3.5 rounded-xl bg-[#181825] border border-[#313244] text-[#cdd6f4] placeholder-[#6c7086] text-xs font-medium focus:outline-none focus:border-[#cba6f7] transition-colors"
              />
            </div>

            {/* Role selector */}
            <div>
              <label className="text-xs font-semibold text-[#bac2de] block mb-1.5 font-mono uppercase tracking-wider text-[11px]">
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
                สิ่งอำนวยความสะดวกที่จำเป็นต้องมี
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ALL_AMENITIES.map((amenity) => {
                  const isSelected = selectedAmenities.includes(amenity.name);
                  return (
                    <div
                      key={amenity.id}
                      onClick={() => toggleAmenity(amenity.name)}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-colors cursor-pointer active:scale-[0.98] ${
                        isSelected
                          ? 'bg-[#181825] border-[#a6e3a1]/60 text-[#cdd6f4]'
                          : 'bg-[#181825] border-[#313244] text-[#a6adc8] hover:text-[#cdd6f4] hover:bg-[#313244]/50'
                      }`}
                    >
                      <span className="text-xs font-medium pr-2">{amenity.name}</span>
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
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-5 mt-1 rounded-xl bg-[#cba6f7] hover:bg-[#b4befe] text-[#11111b] font-bold text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
            >
              <span>{loading ? 'กำลังเข้าสู่ห้องล็อบบี้...' : 'เข้าสู่ห้องล็อบบี้ทริป'}</span>
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

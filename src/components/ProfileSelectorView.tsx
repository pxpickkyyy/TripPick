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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center min-h-dvh px-6 py-12 text-center"
    >
      <div className="w-full max-w-xl text-left mb-6">
        <button
          onClick={onBack}
          className="text-slate-400 hover:text-white text-sm font-medium transition-colors duration-150 cursor-pointer"
        >
          ย้อนกลับ
        </button>
      </div>

      <div className="w-full max-w-xl bg-[#131822] p-8 rounded-2xl text-left">
        <div className="mb-8">
          <span className="text-xs text-emerald-400 font-medium block mb-1">
            ขั้นตอนที่ 1 จาก 2: ข้อมูลผู้เข้าร่วมทริป
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            ตั้งค่าโปรไฟล์และสิ่งที่ต้องการ
          </h2>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            เลือกสิ่งอำนวยความสะดวกที่ทีมของคุณให้ความสำคัญ เพื่อให้ระบบคัดเลือกสถานที่ได้ตรงใจที่สุด
          </p>
        </div>

        {(error || nameError) && (
          <div className="mb-6 p-4 rounded-xl bg-[#2a151b] text-rose-300 text-sm">
            {error || nameError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Display Name Input */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              ชื่อและบทบาทของคุณ
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
              className="w-full py-3.5 px-4 bg-[#0e121a] rounded-xl text-white font-medium text-sm focus:outline-none focus:bg-[#161d2a]"
            />
          </div>

          {/* Role selector */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              บทบาทของคุณในทริปนี้
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ROLES.map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRole(r)}
                  className={`py-2.5 px-4 rounded-xl text-xs font-medium text-left transition-colors duration-150 cursor-pointer ${
                    role === r
                      ? 'bg-emerald-950 text-emerald-300'
                      : 'bg-[#0e121a] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Must-Have Business & Tourism Amenities */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              สิ่งอำนวยความสะดวกที่จำเป็นต้องมี
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ALL_AMENITIES.map((amenity) => {
                const isSelected = selectedAmenities.includes(amenity.name);
                return (
                  <div
                    key={amenity.id}
                    onClick={() => toggleAmenity(amenity.name)}
                    className={`flex items-center justify-between p-3.5 rounded-xl transition-colors duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-[#182622] text-white'
                        : 'bg-[#0e121a] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-xs font-medium">{amenity.name}</span>
                    <span className={`text-xs font-bold ${isSelected ? 'text-emerald-400' : 'text-slate-600'}`}>
                      {isSelected ? 'เลือกแล้ว' : 'เลือก'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-2 bg-[#10b981] hover:bg-[#059669] text-white font-semibold rounded-xl text-sm transition-colors duration-150 cursor-pointer"
          >
            {loading ? 'กำลังเข้าสู่ห้องล็อบบี้...' : 'เข้าสู่ห้องล็อบบี้ทริป'}
          </button>
        </form>
      </div>
    </motion.div>
  );
}

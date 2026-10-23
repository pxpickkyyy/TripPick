import { useState } from 'react';
import { motion } from 'framer-motion';
import type { TravelDestination } from '../lib/travelDestinations';
import type { RoomUser, Swipe } from '../hooks/useTripPick';

interface MatchOverlayViewProps {
  matchedDestination: TravelDestination | null;
  users: RoomUser[];
  onReset: () => void;
  swipes: Swipe[];
  destinationsDeck: TravelDestination[];
}

export function MatchOverlayView({
  matchedDestination,
  users,
  onReset,
}: MatchOverlayViewProps) {
  const [teamSize, setTeamSize] = useState(Math.max(4, users.length));
  const [nights, setNights] = useState(3);
  const [proposalSent, setProposalSent] = useState(false);

  if (!matchedDestination) return null;

  const totalCost = matchedDestination.price_per_person * teamSize * nights;
  const commissionEarned = Math.round(totalCost * (matchedDestination.commission_percentage / 100));

  const handleSendProposal = () => {
    setProposalSent(true);
    setTimeout(() => setProposalSent(false), 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center min-h-[92vh] px-4 py-8 relative z-20 select-none text-center"
    >
      {/* Background Celebration Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-cyan-500/20 blur-[130px] pointer-events-none -z-10" />

      {/* Celebration Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-4"
      >
        <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 font-mono text-xs uppercase tracking-widest font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] mb-2">
          🎉 สรุปผลสำเร็จ: เกิดฉันทามติของทีมแล้ว!
        </span>
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase">
          ทริปออฟไซต์นี้... <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">แมตช์แล้ว!</span>
        </h1>
        <p className="text-xs md:text-sm font-mono text-slate-300 mt-1">
          ทุกคนในทีมโหวตเห็นชอบตรงกัน 100% ไร้ข้อโต้แย้ง พร้อมเริ่มต้นทริปได้ทันที
        </p>
      </motion.div>

      {/* Main Matched Destination Card */}
      <div className="w-full max-w-xl glass-panel-glow rounded-3xl p-6 md:p-8 border border-cyan-500/30 text-left shadow-2xl relative overflow-hidden">
        {/* Destination Image & Badges */}
        <div className="relative h-56 rounded-2xl overflow-hidden mb-5">
          <img
            src={matchedDestination.hero_image}
            alt={matchedDestination.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-300 font-bold bg-black/60 px-2 py-0.5 rounded backdrop-blur-md">
                {matchedDestination.city}, {matchedDestination.country}
              </span>
              <h2 className="text-xl md:text-2xl font-black text-white mt-1 drop-shadow-md">
                {matchedDestination.title}
              </h2>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold">
              ★ {matchedDestination.rating}
            </span>
          </div>
        </div>

        {/* Overview */}
        <p className="text-xs text-slate-300 leading-relaxed font-sans mb-4">
          {matchedDestination.overview}
        </p>

        {/* Business Perks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
          {matchedDestination.business_amenities.slice(0, 4).map((a, i) => (
            <div key={i} className="text-[11px] font-mono p-2 rounded-xl bg-slate-900/80 border border-slate-700/80 text-cyan-200 flex items-center gap-1.5">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>{a}</span>
            </div>
          ))}
        </div>

        {/* MAKE ME MONEY: Interactive Group Cost & Commission Box */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900/90 to-cyan-950/40 border border-emerald-500/30 mb-6">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold flex items-center gap-1">
              <span>💰</span> กลไกสร้างรายได้: Make Me Money (คอมมิชชั่น B2B)
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              ส่วนแบ่งคอมมิชชั่น {matchedDestination.commission_percentage}%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 my-3">
            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                จำนวนสมาชิก: <span className="text-white font-bold">{teamSize} ท่าน</span>
              </label>
              <input
                type="range"
                min={2}
                max={30}
                value={teamSize}
                onChange={(e) => setTeamSize(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                ระยะเวลาพัก: <span className="text-white font-bold">{nights} คืน</span>
              </label>
              <input
                type="range"
                min={1}
                max={7}
                value={nights}
                onChange={(e) => setNights(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase">มูลค่ายอดจองรวม (GBV):</span>
              <p className="text-base font-black font-mono text-white">{totalCost.toLocaleString()} บาท</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">คอมมิชชั่นที่ TripPick ได้รับ:</span>
              <p className="text-base font-black font-mono text-emerald-400">+{commissionEarned.toLocaleString()} บาท</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={matchedDestination.affiliate_booking_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono text-xs font-bold uppercase rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] text-center flex items-center justify-center gap-2"
          >
            <span>🏨</span>
            <span>กดจองแพ็กเกจทริปกลุ่มทันที</span>
          </a>

          <button
            onClick={handleSendProposal}
            className="py-3.5 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-cyan-300 font-mono text-xs font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {proposalSent ? '✓ ออกใบเสนอราคาสำเร็จ!' : '📑 ส่งออกใบเสนอราคาองค์กร'}
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={onReset}
            className="text-xs font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            ← วางแผนทริปอื่นเพิ่มเติม
          </button>
        </div>
      </div>
    </motion.div>
  );
}

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
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
      className="flex flex-col items-center justify-center min-h-[calc(100dvh-5rem)] px-4 sm:px-6 py-12 sm:py-20 text-center relative z-20"
    >
      {/* Celebration Header */}
      <div className="mb-8 max-w-xl flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#a6e3a1]/15 border border-[#a6e3a1]/30 text-[#a6e3a1] text-xs font-semibold mb-4 shadow-[0_0_20px_rgba(166,227,161,0.25)]">
          <span className="w-2 h-2 rounded-full bg-[#a6e3a1] animate-ping" />
          <span className="font-mono text-[10px] uppercase tracking-widest">
            100% UNANIMOUS CONSENSUS REACHED
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-2">
          <span className="bg-gradient-to-b from-[#cdd6f4] via-[#bac2de] to-[#cba6f7] bg-clip-text text-transparent">
            ทริปออฟไซต์นี้... แมตช์แล้ว
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-[#a6adc8] max-w-md leading-relaxed text-balance">
          ทุกคนในทีมโหวตเห็นชอบตรงกัน 100% ไร้ข้อโต้แย้งในห้องแชท พร้อมเริ่มต้นปิดดีลและจัดเตรียมเดินทางได้ทันที
        </p>
      </div>

      {/* Main Matched Destination Card: The Double-Bezel (Catppuccin Mocha) */}
      <div className="w-full max-w-xl p-2 sm:p-2.5 rounded-[2.25rem] bg-[#181825]/70 ring-1 ring-[#cba6f7]/20 border border-[#313244]/80 backdrop-blur-2xl shadow-[0_25px_60px_rgba(17,17,27,0.85)] text-left">
        <div className="rounded-[1.75rem] p-6 sm:p-8 bg-[#1e1e2e]/95 border border-[#313244]/80 shadow-[inset_0_1px_1px_rgba(203,166,247,0.15)]">
          {/* Destination Image & Badges */}
          <div className="relative h-64 rounded-2xl overflow-hidden mb-6">
            <img
              src={matchedDestination.hero_image}
              alt={matchedDestination.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1e1e2e] via-[#11111b]/40 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
              <div>
                <span className="text-[11px] text-[#cdd6f4] font-medium bg-[#11111b]/80 backdrop-blur-md border border-[#313244] px-2.5 py-0.5 rounded-full inline-block mb-1.5">
                  {matchedDestination.city}, {matchedDestination.country}
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#cdd6f4] tracking-tight">
                  {matchedDestination.title}
                </h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#181825]/90 backdrop-blur-md border border-[#f9e2af]/30 text-[#f9e2af] text-xs font-semibold tabular-data font-mono">
                ★ {matchedDestination.rating}
              </span>
            </div>
          </div>

          {/* Overview */}
          <p className="text-xs sm:text-sm text-[#bac2de] leading-relaxed mb-6">
            {matchedDestination.overview}
          </p>

          {/* Business Perks Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
            {matchedDestination.business_amenities.slice(0, 4).map((a, i) => (
              <div key={i} className="text-xs p-3 rounded-xl bg-[#181825] border border-[#313244] text-[#cdd6f4] flex items-center justify-between">
                <span>{a}</span>
                <span className="text-[#a6e3a1] font-semibold text-[10px] font-mono uppercase">VERIFIED</span>
              </div>
            ))}
          </div>

          {/* MAKE ME MONEY: Financial Consensus Dashboard */}
          <div className="p-5 rounded-2xl bg-[#181825]/90 border border-[#313244] mb-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#313244]">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#a6e3a1] animate-pulse" />
                <span className="text-xs text-[#a6e3a1] font-semibold font-mono uppercase tracking-wider">
                  MAKE ME MONEY // REVENUE ENGINE
                </span>
              </div>
              <span className="text-xs text-[#a6adc8] font-mono">
                ส่วนแบ่งคอมมิชชั่น {matchedDestination.commission_percentage}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 my-4">
              <div>
                <label className="text-[11px] text-[#a6adc8] block mb-1 font-mono">
                  จำนวนสมาชิก: <span className="text-[#cdd6f4] font-bold tabular-data">{teamSize} ท่าน</span>
                </label>
                <input
                  type="range"
                  min={2}
                  max={30}
                  value={teamSize}
                  onChange={(e) => setTeamSize(Number(e.target.value))}
                  className="w-full accent-[#cba6f7] cursor-pointer"
                />
              </div>
              <div>
                <label className="text-[11px] text-[#a6adc8] block mb-1 font-mono">
                  ระยะเวลาพัก: <span className="text-[#cdd6f4] font-bold tabular-data">{nights} คืน</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={7}
                  value={nights}
                  onChange={(e) => setNights(Number(e.target.value))}
                  className="w-full accent-[#cba6f7] cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#313244]">
              <div>
                <span className="text-[11px] text-[#a6adc8] block mb-0.5 font-mono">มูลค่ายอดจองรวม (GBV)</span>
                <p className="text-lg font-extrabold text-[#cdd6f4] tabular-data font-mono">
                  ฿{totalCost.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-[#a6e3a1] font-semibold block mb-0.5 font-mono">
                  คอมมิชชั่น B2B ที่ได้รับ
                </span>
                <p className="text-lg font-extrabold text-[#a6e3a1] tabular-data font-mono shadow-[0_0_15px_rgba(166,227,161,0.25)]">
                  +฿{commissionEarned.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons: Button-in-Button */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={matchedDestination.affiliate_booking_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex-1 py-3.5 pl-6 pr-3 bg-gradient-to-r from-[#a6e3a1] to-[#94e2d5] hover:from-[#b9f2b5] hover:to-[#a7eee2] text-[#11111b] text-xs sm:text-sm font-bold rounded-full transition-all duration-300 ease-spring text-center flex items-center justify-between shadow-[0_4px_24px_rgba(166,227,161,0.4)] active:scale-[0.98]"
            >
              <span>กดจองแพ็กเกจทริปกลุ่มทันที</span>
              <div className="w-8 h-8 rounded-full bg-[#11111b]/25 text-[#11111b] flex items-center justify-center shrink-0 transition-transform duration-300 ease-spring group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <svg className="w-3.5 h-3.5 stroke-[3]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                </svg>
              </div>
            </a>

            <button
              onClick={handleSendProposal}
              className="py-3.5 px-6 bg-[#313244] hover:bg-[#45475a] border border-[#45475a] text-[#cdd6f4] text-xs sm:text-sm font-semibold rounded-full transition-all duration-300 ease-spring cursor-pointer active:scale-95"
            >
              {proposalSent ? '✓ ออกใบเสนอราคาสำเร็จ' : 'ส่งออกใบเสนอราคาองค์กร'}
            </button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={onReset}
              className="text-xs text-[#a6adc8] hover:text-[#cdd6f4] transition-colors duration-200 cursor-pointer font-medium"
            >
              ← วางแผนทริปอื่นเพิ่มเติม
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

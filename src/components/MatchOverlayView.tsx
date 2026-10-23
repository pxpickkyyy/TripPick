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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center min-h-[calc(100dvh-5rem)] px-4 sm:px-6 py-8 sm:py-12 text-center relative z-20"
    >
      {/* Celebration Header */}
      <div className="mb-6 max-w-xl flex flex-col items-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#181825] border border-[#a6e3a1]/40 text-[#a6e3a1] text-xs font-semibold mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#a6e3a1]" />
          <span className="font-mono text-[10px] uppercase tracking-wider">
            100% UNANIMOUS CONSENSUS
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#cdd6f4] mb-1.5">
          ทริปออฟไซต์นี้... แมตช์แล้ว
        </h1>
        <p className="text-xs sm:text-sm text-[#a6adc8] max-w-md leading-relaxed text-balance">
          ทุกคนในทีมโหวตเห็นชอบตรงกัน 100% ไร้ข้อโต้แย้งในห้องแชท พร้อมเริ่มต้นปิดดีลและจัดเตรียมเดินทางได้ทันที
        </p>
      </div>

      {/* Main Matched Destination Card: Minimalist Solid Enclosure */}
      <div className="w-full max-w-xl p-2 rounded-2xl bg-[#181825] border border-[#313244] shadow-sm text-left">
        <div className="rounded-xl p-5 sm:p-6 bg-[#1e1e2e] border border-[#313244]">
          {/* Destination Image & Badges */}
          <div className="relative h-56 rounded-xl overflow-hidden mb-5 bg-[#11111b]">
            <img
              src={matchedDestination.hero_image}
              alt={matchedDestination.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1e1e2e] via-transparent to-transparent" />
            <div className="absolute bottom-3.5 left-3.5 right-3.5 flex justify-between items-end">
              <div>
                <span className="text-[10px] text-[#cdd6f4] font-medium bg-[#11111b] border border-[#313244] px-2 py-0.5 rounded inline-block mb-1">
                  {matchedDestination.city}, {matchedDestination.country}
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-[#cdd6f4] tracking-tight">
                  {matchedDestination.title}
                </h2>
              </div>
              <span className="px-2.5 py-0.5 rounded bg-[#181825] border border-[#f9e2af]/30 text-[#f9e2af] text-xs font-semibold tabular-data font-mono">
                ★ {matchedDestination.rating}
              </span>
            </div>
          </div>

          {/* Overview */}
          <p className="text-xs text-[#bac2de] leading-relaxed mb-4">
            {matchedDestination.overview}
          </p>

          {/* Business Perks Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
            {matchedDestination.business_amenities.slice(0, 4).map((a, i) => (
              <div key={i} className="text-xs p-2.5 rounded-lg bg-[#181825] border border-[#313244] text-[#cdd6f4] flex items-center justify-between">
                <span>{a}</span>
                <span className="text-[#a6e3a1] font-semibold text-[10px] font-mono uppercase">VERIFIED</span>
              </div>
            ))}
          </div>

          {/* MAKE ME MONEY: Financial Consensus Terminal */}
          <div className="p-4 rounded-xl bg-[#181825] border border-[#313244] mb-5">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#313244]">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#a6e3a1]" />
                <span className="text-xs text-[#a6e3a1] font-semibold font-mono uppercase tracking-wider">
                  MAKE ME MONEY // REVENUE
                </span>
              </div>
              <span className="text-[11px] text-[#a6adc8] font-mono">
                ส่วนแบ่งคอมมิชชั่น {matchedDestination.commission_percentage}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3.5 my-3">
              <div>
                <label className="text-[10px] text-[#a6adc8] block mb-1 font-mono">
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
                <label className="text-[10px] text-[#a6adc8] block mb-1 font-mono">
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

            <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-[#313244]">
              <div>
                <span className="text-[10px] text-[#a6adc8] block mb-0.5 font-mono">มูลค่ายอดจองรวม (GBV)</span>
                <p className="text-base sm:text-lg font-bold text-[#cdd6f4] tabular-data font-mono">
                  ฿{totalCost.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#a6e3a1] font-semibold block mb-0.5 font-mono">
                  คอมมิชชั่น B2B ที่ได้รับ
                </span>
                <p className="text-base sm:text-lg font-bold text-[#a6e3a1] tabular-data font-mono">
                  +฿{commissionEarned.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <a
              href={matchedDestination.affiliate_booking_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 px-5 bg-[#a6e3a1] hover:bg-[#94e2d5] text-[#11111b] text-xs sm:text-sm font-bold rounded-xl transition-colors text-center flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <span>กดจองแพ็กเกจทริปกลุ่มทันที</span>
              <svg className="w-3.5 h-3.5 stroke-[3]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            </a>

            <button
              onClick={handleSendProposal}
              className="py-3 px-5 bg-[#313244] hover:bg-[#45475a] border border-[#45475a] text-[#cdd6f4] text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer active:scale-95"
            >
              {proposalSent ? '✓ ออกใบเสนอราคาสำเร็จ' : 'ส่งออกใบเสนอราคาองค์กร'}
            </button>
          </div>

          <div className="mt-5 text-center">
            <button
              onClick={onReset}
              className="text-xs text-[#a6adc8] hover:text-[#cdd6f4] transition-colors cursor-pointer font-medium"
            >
              ← วางแผนทริปอื่นเพิ่มเติม
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

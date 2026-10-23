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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center min-h-dvh px-6 py-12 text-center"
    >
      {/* Celebration Header */}
      <div className="mb-6 max-w-xl">
        <span className="inline-block px-4 py-1.5 rounded-full bg-[#162720] text-emerald-300 text-xs font-semibold mb-3">
          สรุปผลสำเร็จ: เกิดฉันทามติของทีมแล้ว
        </span>
        <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
          ทริปออฟไซต์นี้... แมตช์แล้ว
        </h1>
        <p className="text-sm text-slate-300 mt-2">
          ทุกคนในทีมโหวตเห็นชอบตรงกัน 100% ไร้ข้อโต้แย้ง พร้อมเริ่มต้นทริปได้ทันที
        </p>
      </div>

      {/* Main Matched Destination Card */}
      <div className="w-full max-w-xl bg-[#131822] rounded-3xl p-6 sm:p-8 text-left">
        {/* Destination Image & Badges */}
        <div className="relative h-60 rounded-2xl overflow-hidden mb-6">
          <img
            src={matchedDestination.hero_image}
            alt={matchedDestination.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#070c18] opacity-50" />
          <div className="absolute bottom-5 left-5 right-5 flex justify-between items-end">
            <div>
              <span className="text-xs text-slate-200 font-medium bg-[#0b0e14] px-2.5 py-1 rounded">
                {matchedDestination.city}, {matchedDestination.country}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1.5">
                {matchedDestination.title}
              </h2>
            </div>
            <span className="px-3 py-1 rounded-xl bg-[#14231e] text-emerald-300 text-xs font-semibold tabular-data">
              คะแนน {matchedDestination.rating}
            </span>
          </div>
        </div>

        {/* Overview */}
        <p className="text-sm text-slate-300 leading-relaxed mb-6">
          {matchedDestination.overview}
        </p>

        {/* Business Perks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
          {matchedDestination.business_amenities.slice(0, 4).map((a, i) => (
            <div key={i} className="text-xs p-3 rounded-xl bg-[#0e121a] text-slate-200 flex items-center justify-between">
              <span>{a}</span>
              <span className="text-emerald-400 font-semibold text-xs">พร้อมบริการ</span>
            </div>
          ))}
        </div>

        {/* MAKE ME MONEY: Interactive Group Cost & Commission Box */}
        <div className="p-5 rounded-2xl bg-[#0e131c] mb-6">
          <div className="flex items-center justify-between pb-3 border-slate-800">
            <span className="text-xs text-emerald-400 font-semibold">
              กลไกสร้างรายได้: Make Me Money
            </span>
            <span className="text-xs text-slate-400">
              ส่วนแบ่งคอมมิชชั่น {matchedDestination.commission_percentage}%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 my-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">
                จำนวนสมาชิก: <span className="text-white font-semibold tabular-data">{teamSize} ท่าน</span>
              </label>
              <input
                type="range"
                min={2}
                max={30}
                value={teamSize}
                onChange={(e) => setTeamSize(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">
                ระยะเวลาพัก: <span className="text-white font-semibold tabular-data">{nights} คืน</span>
              </label>
              <input
                type="range"
                min={1}
                max={7}
                value={nights}
                onChange={(e) => setNights(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-slate-800">
            <div>
              <span className="text-xs text-slate-400 block mb-0.5">มูลค่ายอดจองรวม (GBV)</span>
              <p className="text-lg font-bold text-white tabular-data">{totalCost.toLocaleString()} บาท</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-emerald-400 font-semibold block mb-0.5">คอมมิชชั่นที่ TripPick ได้รับ</span>
              <p className="text-lg font-bold text-emerald-400 tabular-data">+{commissionEarned.toLocaleString()} บาท</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={matchedDestination.affiliate_booking_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-4 px-6 bg-[#10b981] hover:bg-[#059669] text-white text-sm font-semibold rounded-xl transition-colors duration-150 text-center"
          >
            กดจองแพ็กเกจทริปกลุ่มทันที
          </a>

          <button
            onClick={handleSendProposal}
            className="py-4 px-6 bg-[#1e2736] hover:bg-[#283448] text-white text-sm font-medium rounded-xl transition-colors duration-150 cursor-pointer"
          >
            {proposalSent ? 'ออกใบเสนอราคาสำเร็จ' : 'ส่งออกใบเสนอราคาองค์กร'}
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onReset}
            className="text-xs text-slate-400 hover:text-white transition-colors duration-150 cursor-pointer"
          >
            วางแผนทริปอื่นเพิ่มเติม
          </button>
        </div>
      </div>
    </motion.div>
  );
}

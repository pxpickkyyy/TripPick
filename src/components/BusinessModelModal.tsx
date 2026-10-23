import { motion } from 'framer-motion';

interface BusinessModelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BusinessModelModal({ isOpen, onClose }: BusinessModelModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl glass-panel-glow rounded-3xl p-6 md:p-8 border border-cyan-500/40 shadow-2xl text-left max-h-[92vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
              Competition Dossier &amp; Pitch Blueprint
            </span>
            <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight mt-1">
              Business &amp; Tourism: Make Me Money
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* 4 Criteria Summary */}
        <div className="my-6 space-y-6">
          {/* Section 1: Problem & Target Audience */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono text-[10px] font-bold">
                Criteria 1 (20 คะแนน)
              </span>
              <h3 className="text-sm font-bold text-white font-mono uppercase">
                The Problem &amp; Market Opportunity
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              <strong>The Deadlock:</strong> 78% of group vacations and corporate team retreats stall in endless WhatsApp/Slack debates. Teams waste 15+ hours comparing hotels, WiFi speeds, and per-person budgets, leading to booking abandonment.
            </p>
            <p className="text-xs text-slate-300 leading-relaxed font-sans mt-2">
              <strong>Target Audience:</strong> High-spending corporate teams, MICE event managers, digital nomad hubs, and travel agencies organizing 6 to 50-person trips.
            </p>
          </div>

          {/* Section 2: Complete Working Solution */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] font-bold">
                Criteria 2 (30 คะแนน)
              </span>
              <h3 className="text-sm font-bold text-white font-mono uppercase">
                Product Completeness &amp; Core Features
              </h3>
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5 font-mono">
              <li>✓ <strong>Real-time 4-letter Room Code</strong> sync with zero friction.</li>
              <li>✓ <strong>Tinder-swipe consensus mechanics</strong> with live emojis and veto capability.</li>
              <li>✓ <strong>AI Concierge with screen telemetry</strong> checking verified WiFi &amp; boardrooms.</li>
              <li>✓ <strong>Instant Match celebration overlay</strong> with live gross booking value (GBV) calculator.</li>
            </ul>
          </div>

          {/* Section 3: MAKE ME MONEY - Business Model */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-cyan-950/40 border border-emerald-500/40">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] font-bold">
                Criteria 3 (30 คะแนน)
              </span>
              <h3 className="text-sm font-bold text-emerald-400 font-mono uppercase">
                Revenue Streams ("Make Me Money")
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-3">
              <div className="p-3 rounded-xl bg-black/40 border border-slate-800">
                <span className="text-[10px] font-mono text-cyan-300 uppercase block font-bold">Stream 1</span>
                <h4 className="text-xs font-bold text-white mt-1">B2B OTA Commission</h4>
                <p className="text-[11px] text-slate-400 mt-1 font-mono">
                  10% - 15% take rate on Agoda/Booking.com/Expedia group bookings. (~$600 - $1,500 / match).
                </p>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-slate-800">
                <span className="text-[10px] font-mono text-emerald-300 uppercase block font-bold">Stream 2</span>
                <h4 className="text-xs font-bold text-white mt-1">Sponsored Pin Decks</h4>
                <p className="text-[11px] text-slate-400 mt-1 font-mono">
                  Boutique resorts &amp; tour operators pay $399 - $999/mo to be featured in corporate swipe decks.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-slate-800">
                <span className="text-[10px] font-mono text-amber-300 uppercase block font-bold">Stream 3</span>
                <h4 className="text-xs font-bold text-white mt-1">TripPick Enterprise</h4>
                <p className="text-[11px] text-slate-400 mt-1 font-mono">
                  $49/mo per company: Private SSO lobbies, automated expense invoices, and corporate RFP generator.
                </p>
              </div>
            </div>

            <div className="pt-2 text-xs font-mono text-slate-300 border-t border-slate-800">
              💡 <strong>Unit Economics:</strong> 100 corporate retreat matches / month = <strong>$85,000+ monthly recurring gross revenue</strong> with &lt; 5% infrastructure costs.
            </div>
          </div>

          {/* Section 4: 2-Minute Video Pitch Script */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-500/40 text-purple-300 font-mono text-[10px] font-bold">
                Criteria 4 (20 คะแนน)
              </span>
              <h3 className="text-sm font-bold text-white font-mono uppercase">
                Presentation &amp; 2-Minute Video Outline
              </h3>
            </div>
            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              <strong>0:00 - 0:30:</strong> Problem hook — Show chaotic Slack group chat trying to book an offsite.<br />
              <strong>0:30 - 1:15:</strong> Live Demo — Host generates room, team swipes on resorts, AI Concierge calculates budget.<br />
              <strong>1:15 - 1:45:</strong> Match Celebration &amp; Direct B2B booking revenue calculation.<br />
              <strong>1:45 - 2:00:</strong> Business model summary ($1.4T market, 12% commission, scalable SaaS).
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-mono text-xs font-bold uppercase rounded-xl transition-all cursor-pointer"
        >
          Got It, Back to TripPick
        </button>
      </motion.div>
    </div>
  );
}

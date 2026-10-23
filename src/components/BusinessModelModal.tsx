import { motion } from 'framer-motion';
import { useLanguage } from '../lib/i18n';

interface BusinessModelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BusinessModelModal({ isOpen, onClose }: BusinessModelModalProps) {
  const { language, t } = useLanguage();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#11111b]/90 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-2xl p-2 rounded-2xl bg-[#181825] border border-[#313244] shadow-md"
      >
        <div className="w-full max-h-[88vh] overflow-y-auto rounded-xl p-5 md:p-6 bg-[#1e1e2e] border border-[#313244] text-left">
          {/* Header */}
          <div className="flex items-start justify-between pb-3.5 border-b border-[#313244]">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#a6e3a1]" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#cba6f7] font-semibold">
                  {t.dossierEyebrow}
                </span>
              </div>
              <h2 className="text-lg md:text-xl font-bold text-[#cdd6f4] tracking-tight">
                {t.dossierTitle}
              </h2>
            </div>
            <button
              onClick={onClose}
              aria-label={t.closeBtn}
              className="w-7 h-7 rounded-lg bg-[#313244] hover:bg-[#45475a] border border-[#45475a] text-[#cdd6f4] flex items-center justify-center cursor-pointer transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 4 Criteria Summary */}
          <div className="my-4 space-y-3">
            {/* Section 1: Problem & Target Audience */}
            <div className="p-3.5 rounded-xl bg-[#181825] border border-[#313244]">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2 py-0.5 rounded bg-[#313244] text-[#cba6f7] font-mono text-[10px] font-semibold">
                  {language === 'th' ? 'เกณฑ์ข้อ 1 (20 คะแนน)' : 'Criterion 1 (20 Pts)'}
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-[#cdd6f4] tracking-tight">
                  {t.criteria1Title}
                </h3>
              </div>
              <p className="text-xs text-[#bac2de] leading-relaxed">
                {t.criteria1Desc}
              </p>
              <p className="text-xs text-[#a6adc8] leading-relaxed mt-1.5">
                <strong className="text-[#cdd6f4]">{language === 'th' ? 'กลุ่มเป้าหมาย:' : 'Target Audience:'}</strong> {language === 'th' ? 'องค์กรยุคใหม่ ทีมสายเทคโนโลยี ผู้จัดงานสัมมนา MICE ชุมชนทำงานทางไกล และกลุ่มท่องเที่ยวที่มีกำลังซื้อสูง (6 ถึง 50 ท่าน)' : 'Modern tech enterprises, MICE conference planners, remote work communities, and high-ticket travel groups (6 to 50 pax)'}
              </p>
            </div>

            {/* Section 2: Complete Working Solution */}
            <div className="p-3.5 rounded-xl bg-[#181825] border border-[#313244]">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2 py-0.5 rounded bg-[#313244] text-[#74c7ec] font-mono text-[10px] font-semibold">
                  {language === 'th' ? 'เกณฑ์ข้อ 2 (30 คะแนน)' : 'Criterion 2 (30 Pts)'}
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-[#cdd6f4] tracking-tight">
                  {t.criteria2Title}
                </h3>
              </div>
              <p className="text-xs text-[#bac2de] leading-relaxed mb-2">
                {t.criteria2Desc}
              </p>
              <ul className="text-xs text-[#bac2de] space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#a6e3a1] mt-1.5 shrink-0" />
                  <span><strong className="text-[#cdd6f4]">{language === 'th' ? 'ระบบเชื่อมต่อ Real-time' : 'Zero-Latency Realtime'}</strong> {language === 'th' ? 'ผ่านรหัสห้อง 4 หลัก เข้าร่วมพร้อมกันได้ทันที' : 'Synchronized via 4-character room codes with dynamic host failover'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#a6e3a1] mt-1.5 shrink-0" />
                  <span><strong className="text-[#cdd6f4]">{language === 'th' ? 'กลไกการโหวตแบบปัดการ์ด' : 'Card Swiping Engine'}</strong> {language === 'th' ? 'พร้อมการส่งการตอบสนองสดและสิทธิ์คัดค้านเด็ดขาด (Veto)' : 'Equipped with live reaction emojis and absolute executive Veto power'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#a6e3a1] mt-1.5 shrink-0" />
                  <span><strong className="text-[#cdd6f4]">{language === 'th' ? 'AI Concierge ผู้ช่วยอัจฉริยะ' : 'AI Concierge Assistant'}</strong> {language === 'th' ? 'วิเคราะห์สเปกสถานที่และงบประมาณแบบสด' : 'Live Starlink connectivity, boardroom SLA, and budget synthesis'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#a6e3a1] mt-1.5 shrink-0" />
                  <span><strong className="text-[#cdd6f4]">{language === 'th' ? 'หน้าสรุปฉันทามติ' : 'Consensus Resolution'}</strong> {language === 'th' ? 'พร้อมเครื่องคำนวณมูลค่ายอดจองและคอมมิชชั่นทันที' : 'Instant GBV calculation and 12% wholesale margin reconciliation'}</span>
                </li>
              </ul>
            </div>

            {/* Section 3: MAKE ME MONEY - Business Model */}
            <div className="p-3.5 rounded-xl bg-[#181825] border border-[#a6e3a1]/40">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded bg-[#a6e3a1]/20 text-[#a6e3a1] font-mono text-[10px] font-bold">
                  {language === 'th' ? 'เกณฑ์ข้อ 3 (30 คะแนน)' : 'Criterion 3 (30 Pts)'}
                </span>
                <h3 className="text-xs sm:text-sm font-extrabold text-[#a6e3a1] tracking-tight">
                  {t.criteria3Title}
                </h3>
              </div>
              <p className="text-xs text-[#bac2de] leading-relaxed mb-2.5">
                {t.criteria3Desc}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 my-2">
                <div className="p-3 rounded-lg bg-[#1e1e2e] border border-[#313244]">
                  <span className="text-[10px] font-mono text-[#a6adc8] uppercase tracking-wider block">CHANNEL 01</span>
                  <h4 className="text-xs font-bold text-[#cdd6f4] mt-0.5">{language === 'th' ? 'คอมมิชชั่น B2B MICE' : 'B2B Wholesale Take-Rate'}</h4>
                  <p className="text-[11px] text-[#a6adc8] mt-1 leading-relaxed tabular-nums">
                    {language === 'th' ? 'ส่วนแบ่ง 10% ถึง 15% จากยอดจองกลุ่มผ่านพันธมิตร (ประมาณ 20,000 - 45,000 บาทต่อกลุ่ม)' : '10% to 15% wholesale margin on group venue bookings (~฿20,000 - ฿45,000 per closed retreat)'}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[#1e1e2e] border border-[#313244]">
                  <span className="text-[10px] font-mono text-[#a6adc8] uppercase tracking-wider block">CHANNEL 02</span>
                  <h4 className="text-xs font-bold text-[#cdd6f4] mt-0.5">Sponsored Pin Decks</h4>
                  <p className="text-[11px] text-[#a6adc8] mt-1 leading-relaxed tabular-nums">
                    {language === 'th' ? 'รีสอร์ตจ่ายค่าโปรโมท 15,000 - 35,000 บาทต่อเดือน เพื่อขึ้นแสดงในการ์ดแรก' : 'Hotels & resorts pay ฿15,000 - ฿35,000/mo featured placement fee in top swiping slots'}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[#1e1e2e] border border-[#313244]">
                  <span className="text-[10px] font-mono text-[#a6adc8] uppercase tracking-wider block">CHANNEL 03</span>
                  <h4 className="text-xs font-bold text-[#cdd6f4] mt-0.5">TripPick Enterprise</h4>
                  <p className="text-[11px] text-[#a6adc8] mt-1 leading-relaxed tabular-nums">
                    {language === 'th' ? 'SaaS องค์กร 1,800 บาท/เดือน จัดการงบเบี้ยเลี้ยง ออกใบเสนอราคา และรายงานภาษี' : 'Enterprise SaaS at ฿1,800/mo for statutory tax reconciliation, audit trail, and ERP integration'}
                  </p>
                </div>
              </div>

              <div className="p-2.5 bg-[#1e1e2e] rounded-lg mt-2 text-xs text-[#cdd6f4] leading-relaxed font-mono tabular-nums border border-[#313244]">
                <strong className="text-[#a6e3a1]">{language === 'th' ? 'การประมาณการผลตอบแทน:' : 'Projected Platform Yield:'}</strong> {language === 'th' ? 'เพียง 100 การแมตช์ทริปบริษัทต่อเดือน สามารถสร้างรายได้รวมกว่า ฿2,800,000 ต่อเดือน โดยมีต้นทุนเซิร์ฟเวอร์ต่ำกว่า 5%' : '100 closed retreats per month yield over ฿2,800,000 gross revenue with sub-5% infrastructure overhead.'}
              </div>
            </div>

            {/* Section 4: 2-Minute Video Pitch Script */}
            <div className="p-3.5 rounded-xl bg-[#181825] border border-[#313244]">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2 py-0.5 rounded bg-[#313244] text-[#b4befe] font-mono text-[10px] font-semibold">
                  {language === 'th' ? 'เกณฑ์ข้อ 4 (20 คะแนน)' : 'Criterion 4 (20 Pts)'}
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-[#cdd6f4] tracking-tight">
                  {t.criteria4Title}
                </h3>
              </div>
              <p className="text-xs text-[#bac2de] leading-relaxed mb-2">
                {t.criteria4Desc}
              </p>
              <div className="text-xs text-[#bac2de] space-y-1 leading-relaxed tabular-nums font-mono text-[11px]">
                <p><strong className="text-[#cdd6f4]">0:00 - 0:25:</strong> {language === 'th' ? 'ชี้ปัญหา — ความล่าช้าของการถกเถียงในแชทกลุ่มจนแผนงานล่ม' : 'Hook & Problem — Tech teams waste 14 days arguing on Slack before retreats collapse'}</p>
                <p><strong className="text-[#cdd6f4]">0:25 - 0:55:</strong> {language === 'th' ? 'สาธิตการใช้งานจริง — สร้างห้อง, ปัดเลือกพร้อมกัน Real-time, AI ช่วยคำนวณงบ' : 'Live Demo — 4-digit code, zero-latency voting, Gemini autonomous 3-day agenda'}</p>
                <p><strong className="text-[#cdd6f4]">0:55 - 1:35:</strong> {language === 'th' ? 'นำเสนอตัวเลข Make Me Money — ชี้ชัดรายได้คอมมิชชั่นต่อทริป 20,000 - 45,000 บาท' : 'Make Me Money — 12% wholesale margin captures ฿32,400 net profit per closed retreat'}</p>
                <p><strong className="text-[#cdd6f4]">1:35 - 2:00:</strong> {language === 'th' ? 'สรุปคุณค่า — เปลี่ยนความเห็นต่างให้เป็นการตัดสินใจที่รวดเร็วและคุ้มค่า' : 'Enterprise Call to Action — Turning group indecision into booked retreats, instantly'}</p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-[#cba6f7] hover:bg-[#b4befe] text-[#11111b] text-xs font-bold rounded-xl transition-colors cursor-pointer active:scale-98"
          >
            {language === 'th' ? 'เข้าใจแล้ว กลับสู่ TripPick' : 'Understood, Back to TripPick'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

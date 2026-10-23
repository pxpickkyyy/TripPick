import { motion } from 'framer-motion';

interface BusinessModelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BusinessModelModal({ isOpen, onClose }: BusinessModelModalProps) {
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
                  COMPETITION DOSSIER // CRITERIA 100 PTS
                </span>
              </div>
              <h2 className="text-lg md:text-xl font-bold text-[#cdd6f4] tracking-tight">
                ซอฟต์แวร์เพื่อธุรกิจและการท่องเที่ยว : Make Me Money
              </h2>
            </div>
            <button
              onClick={onClose}
              aria-label="ปิดหน้าต่าง"
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
                  เกณฑ์ข้อ 1 (20 คะแนน)
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-[#cdd6f4] tracking-tight">
                  ความสำคัญและความเข้าใจปัญหาในตลาด
                </h3>
              </div>
              <p className="text-xs text-[#bac2de] leading-relaxed">
                <strong className="text-[#cdd6f4]">ปัญหาหลัก:</strong> กว่า 78% ของการจัดทริปบริษัทหรือท่องเที่ยวกลุ่มต้องล่มลงเนื่องจากหาข้อสรุปไม่ได้ แต่ละทริปเสียเวลาเฉลี่ยมากกว่า 18.5 ชั่วโมงในแอปแชทเพื่อถกเถียงเรื่องสถานที่ ความเร็วเน็ต และงบประมาณ
              </p>
              <p className="text-xs text-[#a6adc8] leading-relaxed mt-1.5">
                <strong className="text-[#cdd6f4]">กลุ่มเป้าหมาย:</strong> องค์กรยุคใหม่ ทีมสายเทคโนโลยี ผู้จัดงานสัมมนา MICE ชุมชนทำงานทางไกล และกลุ่มท่องเที่ยวที่มีกำลังซื้อสูง (6 ถึง 50 ท่าน)
              </p>
            </div>

            {/* Section 2: Complete Working Solution */}
            <div className="p-3.5 rounded-xl bg-[#181825] border border-[#313244]">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2 py-0.5 rounded bg-[#313244] text-[#74c7ec] font-mono text-[10px] font-semibold">
                  เกณฑ์ข้อ 2 (30 คะแนน)
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-[#cdd6f4] tracking-tight">
                  ความสมบูรณ์และการใช้งานได้จริงของผลงาน
                </h3>
              </div>
              <ul className="text-xs text-[#bac2de] space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#a6e3a1] mt-1.5 shrink-0" />
                  <span><strong className="text-[#cdd6f4]">ระบบเชื่อมต่อ Real-time</strong> ผ่านรหัสห้อง 4 หลัก เข้าร่วมพร้อมกันได้ทันที</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#a6e3a1] mt-1.5 shrink-0" />
                  <span><strong className="text-[#cdd6f4]">กลไกการโหวตแบบปัดการ์ด</strong> พร้อมการส่งการตอบสนองสดและสิทธิ์คัดค้านเด็ดขาด (Veto)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#a6e3a1] mt-1.5 shrink-0" />
                  <span><strong className="text-[#cdd6f4]">AI Concierge ผู้ช่วยอัจฉริยะ</strong> วิเคราะห์สเปกสถานที่และงบประมาณแบบสด</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#a6e3a1] mt-1.5 shrink-0" />
                  <span><strong className="text-[#cdd6f4]">หน้าสรุปฉันทามติ</strong> พร้อมเครื่องคำนวณมูลค่ายอดจองและคอมมิชชั่นทันที</span>
                </li>
              </ul>
            </div>

            {/* Section 3: MAKE ME MONEY - Business Model */}
            <div className="p-3.5 rounded-xl bg-[#181825] border border-[#a6e3a1]/40">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded bg-[#a6e3a1]/20 text-[#a6e3a1] font-mono text-[10px] font-bold">
                  เกณฑ์ข้อ 3 (30 คะแนน)
                </span>
                <h3 className="text-xs sm:text-sm font-extrabold text-[#a6e3a1] tracking-tight">
                  โครงสร้างรายได้ที่ชัดเจน (Make Me Money)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 my-2">
                <div className="p-3 rounded-lg bg-[#1e1e2e] border border-[#313244]">
                  <span className="text-[10px] font-mono text-[#a6adc8] uppercase tracking-wider block">CHANNEL 01</span>
                  <h4 className="text-xs font-bold text-[#cdd6f4] mt-0.5">คอมมิชชั่น B2B OTA</h4>
                  <p className="text-[11px] text-[#a6adc8] mt-1 leading-relaxed tabular-nums">
                    ส่วนแบ่ง 10% ถึง 15% จากยอดจองกลุ่มผ่านพันธมิตร (ประมาณ 20,000 - 45,000 บาทต่อกลุ่ม)
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[#1e1e2e] border border-[#313244]">
                  <span className="text-[10px] font-mono text-[#a6adc8] uppercase tracking-wider block">CHANNEL 02</span>
                  <h4 className="text-xs font-bold text-[#cdd6f4] mt-0.5">Sponsored Pin Decks</h4>
                  <p className="text-[11px] text-[#a6adc8] mt-1 leading-relaxed tabular-nums">
                    รีสอร์ตจ่ายค่าโปรโมท 15,000 - 35,000 บาทต่อเดือน เพื่อขึ้นแสดงในการ์ดแรก
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[#1e1e2e] border border-[#313244]">
                  <span className="text-[10px] font-mono text-[#a6adc8] uppercase tracking-wider block">CHANNEL 03</span>
                  <h4 className="text-xs font-bold text-[#cdd6f4] mt-0.5">TripPick Enterprise</h4>
                  <p className="text-[11px] text-[#a6adc8] mt-1 leading-relaxed tabular-nums">
                    SaaS องค์กร 1,800 บาท/เดือน จัดการงบเบี้ยเลี้ยง ออกใบเสนอราคา และรายงานภาษี
                  </p>
                </div>
              </div>

              <div className="p-2.5 bg-[#1e1e2e] rounded-lg mt-2 text-xs text-[#cdd6f4] leading-relaxed font-mono tabular-nums border border-[#313244]">
                <strong className="text-[#a6e3a1]">การประมาณการผลตอบแทน:</strong> เพียง 100 การแมตช์ทริปบริษัทต่อเดือน สามารถสร้างรายได้รวมกว่า ฿2,800,000 ต่อเดือน โดยมีต้นทุนเซิร์ฟเวอร์ต่ำกว่า 5%
              </div>
            </div>

            {/* Section 4: 2-Minute Video Pitch Script */}
            <div className="p-3.5 rounded-xl bg-[#181825] border border-[#313244]">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2 py-0.5 rounded bg-[#313244] text-[#b4befe] font-mono text-[10px] font-semibold">
                  เกณฑ์ข้อ 4 (20 คะแนน)
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-[#cdd6f4] tracking-tight">
                  โครงสร้างการนำเสนอและคลิปวิดีโอ 2 นาที
                </h3>
              </div>
              <div className="text-xs text-[#bac2de] space-y-1 leading-relaxed tabular-nums font-mono text-[11px]">
                <p><strong className="text-[#cdd6f4]">0:00 - 0:25:</strong> ชี้ปัญหา — ความล่าช้าของการถกเถียงในแชทกลุ่มจนแผนงานล่ม</p>
                <p><strong className="text-[#cdd6f4]">0:25 - 0:55:</strong> สาธิตการใช้งานจริง — สร้างห้อง, ปัดเลือกพร้อมกัน Real-time, AI ช่วยคำนวณงบ</p>
                <p><strong className="text-[#cdd6f4]">0:55 - 1:35:</strong> นำเสนอตัวเลข Make Me Money — ชี้ชัดรายได้คอมมิชชั่นต่อทริป 20,000 - 45,000 บาท</p>
                <p><strong className="text-[#cdd6f4]">1:35 - 2:00:</strong> สรุปคุณค่า — เปลี่ยนความเห็นต่างให้เป็นการตัดสินใจที่รวดเร็วและคุ้มค่า</p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-[#cba6f7] hover:bg-[#b4befe] text-[#11111b] text-xs font-bold rounded-xl transition-colors cursor-pointer active:scale-98"
          >
            เข้าใจแล้ว กลับสู่ TripPick
          </button>
        </div>
      </motion.div>
    </div>
  );
}

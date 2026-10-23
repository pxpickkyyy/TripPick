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
              เอกสารข้อมูลการแข่งขัน &amp; แผนธุรกิจ (Pitch Blueprint)
            </span>
            <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight mt-1">
              ซอฟต์แวร์เพื่อธุรกิจและการท่องเที่ยว : Make Me Money
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
                เกณฑ์ข้อ 1 (20 คะแนน)
              </span>
              <h3 className="text-sm font-bold text-white font-mono uppercase">
                ความสำคัญและความเข้าใจปัญหาในตลาด
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              <strong>ปัญหาหลัก:</strong> กว่า 78% ของการจัดทริปบริษัทหรือท่องเที่ยวกลุ่มต้องล่มลงเนื่องจาก "หาข้อสรุปไม่ได้" (Consensus Deadlock) แต่ละทริปเสียเวลาเฉลี่ยมากกว่า 18.5 ชั่วโมงในแชท Slack หรือ LINE เพื่อถกเถียงเรื่องสถานที่ ความเร็วเน็ต และงบประมาณ
            </p>
            <p className="text-xs text-slate-300 leading-relaxed font-sans mt-2">
              <strong>กลุ่มเป้าหมาย:</strong> องค์กรยุคใหม่ ทีมสายเทค ผู้จัดงานสัมมนา MICE ชุมชน Digital Nomad และกลุ่มนักท่องเที่ยวระดับบนที่มีกำลังซื้อสูง (6 ถึง 50 ท่าน)
            </p>
          </div>

          {/* Section 2: Complete Working Solution */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] font-bold">
                เกณฑ์ข้อ 2 (30 คะแนน)
              </span>
              <h3 className="text-sm font-bold text-white font-mono uppercase">
                ความสมบูรณ์และการใช้งานได้จริงของผลงาน
              </h3>
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5 font-mono">
              <li>✓ <strong>ระบบเชื่อมต่อแบบ Real-time</strong> ผ่านรหัสห้อง 4 หลัก เข้าใช้งานพร้อมกันได้ทันที</li>
              <li>✓ <strong>กลไกการปัดโหวตสไตล์ Tinder</strong> พร้อมส่งอีโมจิสดและสิทธิ์คัดค้านเด็ดขาด (Veto)</li>
              <li>✓ <strong>AI Concierge ขับเคลื่อนด้วย DeepSeek V4.1 Flash 1017</strong> วิเคราะห์สเปกสถานที่และงบประมาณแบบสดๆ</li>
              <li>✓ <strong>หน้าจอสรุปผลฉันทามติ (Match Overlay)</strong> พร้อมเครื่องคำนวณมูลค่ายอดจองและคอมมิชชั่นทันที</li>
            </ul>
          </div>

          {/* Section 3: MAKE ME MONEY - Business Model */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-cyan-950/40 border border-emerald-500/40">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] font-bold">
                เกณฑ์ข้อ 3 (30 คะแนน)
              </span>
              <h3 className="text-sm font-bold text-emerald-400 font-mono uppercase">
                โครงสร้างรายได้ที่ชัดเจน ("Make Me Money")
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-3">
              <div className="p-3 rounded-xl bg-black/40 border border-slate-800">
                <span className="text-[10px] font-mono text-cyan-300 uppercase block font-bold">ช่องทางที่ 1</span>
                <h4 className="text-xs font-bold text-white mt-1">คอมมิชชั่น B2B OTA</h4>
                <p className="text-[11px] text-slate-400 mt-1 font-mono">
                  รับส่วนแบ่ง 10% - 15% จากยอดจองกลุ่มผ่านพันธมิตร Agoda / Booking.com (~20,000 - 45,000 บาท/แมตช์)
                </p>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-slate-800">
                <span className="text-[10px] font-mono text-emerald-300 uppercase block font-bold">ช่องทางที่ 2</span>
                <h4 className="text-xs font-bold text-white mt-1">Sponsored Pin Decks</h4>
                <p className="text-[11px] text-slate-400 mt-1 font-mono">
                  รีสอร์ตหรูและผู้จัดทริปจ่ายค่าโปรโมท 15,000 - 35,000 บาท/เดือน เพื่อให้ขึ้นแสดงในการ์ดแรกๆ
                </p>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-slate-800">
                <span className="text-[10px] font-mono text-amber-300 uppercase block font-bold">ช่องทางที่ 3</span>
                <h4 className="text-xs font-bold text-white mt-1">TripPick Enterprise</h4>
                <p className="text-[11px] text-slate-400 mt-1 font-mono">
                  ค่าบริการรายเดือนองค์กร 1,800 บาท/เดือน: ระบบจัดการงบเบี้ยเลี้ยง ออกใบแจ้งหนี้ และส่งออกรายงานบริษัท
                </p>
              </div>
            </div>

            <div className="pt-2 text-xs font-mono text-slate-300 border-t border-slate-800">
              💡 <strong>ความคุ้มค่าทางเศรษฐศาสตร์:</strong> เพียง 100 การแมตช์ทริปบริษัทต่อเดือน = <strong>สร้างรายได้รวมกว่า 2,800,000+ บาท/เดือน</strong> โดยมีต้นทุนเซิร์ฟเวอร์ต่ำกว่า 5%
            </div>
          </div>

          {/* Section 4: 2-Minute Video Pitch Script */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-500/40 text-purple-300 font-mono text-[10px] font-bold">
                เกณฑ์ข้อ 4 (20 คะแนน)
              </span>
              <h3 className="text-sm font-bold text-white font-mono uppercase">
                โครงสร้างการนำเสนอและคลิปวิดีโอ 2 นาที
              </h3>
            </div>
            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              <strong>0:00 - 0:25:</strong> ชี้ปัญหา — ให้เห็นความวุ่นวายของการเถียงกันในแชทกลุ่มจนทริปล่ม<br />
              <strong>0:25 - 0:55:</strong> สาธิตการใช้งานจริง — สร้างห้อง, ปัดเลือกพร้อมกัน Real-time, AI ช่วยคำนวณงบ<br />
              <strong>0:55 - 1:35:</strong> นำเสนอตัวเลข Make Me Money — ชี้ชัดรายได้คอมมิชชั่นต่อทริป 20,000 - 45,000 บาท<br />
              <strong>1:35 - 2:00:</strong> สรุปคุณค่า — เปลี่ยนความลังเลให้เป็นการปิดยอดจองที่สร้างผลกำไรสูง
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-mono text-xs font-bold uppercase rounded-xl transition-all cursor-pointer"
        >
          เข้าใจแล้ว กลับสู่ TripPick
        </button>
      </motion.div>
    </div>
  );
}

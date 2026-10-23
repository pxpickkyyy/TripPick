import { motion } from 'framer-motion';

interface BusinessModelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BusinessModelModal({ isOpen, onClose }: BusinessModelModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b0e14]/90 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="w-full max-w-2xl bg-[#131822] rounded-2xl p-6 md:p-8 text-left max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4">
          <div>
            <span className="text-xs font-semibold text-[#10b981]">
              ข้อมูลการแข่งขันและแผนธุรกิจ
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-[#f8fafc] mt-1">
              ซอฟต์แวร์เพื่อธุรกิจและการท่องเที่ยว : Make Me Money
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="ปิดหน้าต่าง"
            className="text-[#94a3b8] hover:text-white p-1 cursor-pointer transition-colors duration-150"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 4 Criteria Summary */}
        <div className="my-6 space-y-4">
          {/* Section 1: Problem & Target Audience */}
          <div className="p-4 rounded-xl bg-[#0e121a]">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded bg-[#1a2230] text-[#10b981] text-xs font-medium">
                เกณฑ์ข้อ 1 (20 คะแนน)
              </span>
              <h3 className="text-sm font-semibold text-[#f8fafc]">
                ความสำคัญและความเข้าใจปัญหาในตลาด
              </h3>
            </div>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              <strong className="text-[#f8fafc]">ปัญหาหลัก:</strong> กว่า 78% ของการจัดทริปบริษัทหรือท่องเที่ยวกลุ่มต้องล่มลงเนื่องจากหาข้อสรุปไม่ได้ แต่ละทริปเสียเวลาเฉลี่ยมากกว่า 18.5 ชั่วโมงในแอปแชทเพื่อถกเถียงเรื่องสถานที่ ความเร็วเน็ต และงบประมาณ
            </p>
            <p className="text-xs text-[#94a3b8] leading-relaxed mt-2">
              <strong className="text-[#f8fafc]">กลุ่มเป้าหมาย:</strong> องค์กรยุคใหม่ ทีมสายเทคโนโลยี ผู้จัดงานสัมมนา MICE ชุมชนทำงานทางไกล และกลุ่มท่องเที่ยวที่มีกำลังซื้อสูง (6 ถึง 50 ท่าน)
            </p>
          </div>

          {/* Section 2: Complete Working Solution */}
          <div className="p-4 rounded-xl bg-[#0e121a]">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded bg-[#1a2230] text-[#10b981] text-xs font-medium">
                เกณฑ์ข้อ 2 (30 คะแนน)
              </span>
              <h3 className="text-sm font-semibold text-[#f8fafc]">
                ความสมบูรณ์และการใช้งานได้จริงของผลงาน
              </h3>
            </div>
            <ul className="text-xs text-[#94a3b8] space-y-2">
              <li className="flex items-start gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#10b981] mt-1.5 shrink-0" />
                <span><strong className="text-[#f8fafc]">ระบบเชื่อมต่อ Real-time</strong> ผ่านรหัสห้อง 4 หลัก เข้าร่วมพร้อมกันได้ทันที</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#10b981] mt-1.5 shrink-0" />
                <span><strong className="text-[#f8fafc]">กลไกการโหวตแบบปัดการ์ด</strong> พร้อมการส่งการตอบสนองสดและสิทธิ์คัดค้านเด็ดขาด (Veto)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#10b981] mt-1.5 shrink-0" />
                <span><strong className="text-[#f8fafc]">AI Concierge ผู้ช่วยอัจฉริยะ</strong> วิเคราะห์สเปกสถานที่และงบประมาณแบบสด</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#10b981] mt-1.5 shrink-0" />
                <span><strong className="text-[#f8fafc]">หน้าสรุปฉันทามติ</strong> พร้อมเครื่องคำนวณมูลค่ายอดจองและคอมมิชชั่นทันที</span>
              </li>
            </ul>
          </div>

          {/* Section 3: MAKE ME MONEY - Business Model */}
          <div className="p-4 rounded-xl bg-[#0e121a]">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded bg-[#1a2230] text-[#10b981] text-xs font-medium">
                เกณฑ์ข้อ 3 (30 คะแนน)
              </span>
              <h3 className="text-sm font-semibold text-[#10b981]">
                โครงสร้างรายได้ที่ชัดเจน (Make Me Money)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-3">
              <div className="p-3.5 rounded-lg bg-[#131822]">
                <span className="text-xs text-[#94a3b8] font-medium block">ช่องทางที่ 1</span>
                <h4 className="text-xs font-semibold text-white mt-1">คอมมิชชั่น B2B OTA</h4>
                <p className="text-xs text-[#94a3b8] mt-1.5 leading-relaxed tabular-nums">
                  ส่วนแบ่ง 10% ถึง 15% จากยอดจองกลุ่มผ่านพันธมิตร Agoda / Booking.com (ประมาณ 20,000 - 45,000 บาทต่อกลุ่ม)
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-[#131822]">
                <span className="text-xs text-[#94a3b8] font-medium block">ช่องทางที่ 2</span>
                <h4 className="text-xs font-semibold text-white mt-1">Sponsored Pin Decks</h4>
                <p className="text-xs text-[#94a3b8] mt-1.5 leading-relaxed tabular-nums">
                  รีสอร์ตและสถานที่สัมมนาจ่ายค่าโปรโมท 15,000 - 35,000 บาทต่อเดือน เพื่อขึ้นแสดงในการ์ดลำดับแรก
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-[#131822]">
                <span className="text-xs text-[#94a3b8] font-medium block">ช่องทางที่ 3</span>
                <h4 className="text-xs font-semibold text-white mt-1">TripPick Enterprise</h4>
                <p className="text-xs text-[#94a3b8] mt-1.5 leading-relaxed tabular-nums">
                  ค่าบริการรายเดือนองค์กร 1,800 บาทต่อเดือน จัดการงบเบี้ยเลี้ยง ออกใบเสนอราคา และรายงานภาษี
                </p>
              </div>
            </div>

            <div className="p-3 bg-[#131822] rounded-lg mt-3 text-xs text-[#f8fafc] leading-relaxed tabular-nums">
              <strong className="text-[#10b981]">การประมาณการผลตอบแทน:</strong> เพียง 100 การแมตช์ทริปบริษัทต่อเดือน สามารถสร้างรายได้รวมกว่า 2,800,000 บาทต่อเดือน โดยมีต้นทุนเซิร์ฟเวอร์ต่ำกว่า 5%
            </div>
          </div>

          {/* Section 4: 2-Minute Video Pitch Script */}
          <div className="p-4 rounded-xl bg-[#0e121a]">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded bg-[#1a2230] text-[#94a3b8] text-xs font-medium">
                เกณฑ์ข้อ 4 (20 คะแนน)
              </span>
              <h3 className="text-sm font-semibold text-[#f8fafc]">
                โครงสร้างการนำเสนอและคลิปวิดีโอ 2 นาที
              </h3>
            </div>
            <div className="text-xs text-[#94a3b8] space-y-1.5 leading-relaxed tabular-nums">
              <p><strong className="text-[#f8fafc]">0:00 - 0:25:</strong> ชี้ปัญหา — ความล่าช้าของการถกเถียงในแชทกลุ่มจนแผนงานล่ม</p>
              <p><strong className="text-[#f8fafc]">0:25 - 0:55:</strong> สาธิตการใช้งานจริง — สร้างห้อง, ปัดเลือกพร้อมกัน Real-time, AI ช่วยคำนวณงบ</p>
              <p><strong className="text-[#f8fafc]">0:55 - 1:35:</strong> นำเสนอตัวเลข Make Me Money — ชี้ชัดรายได้คอมมิชชั่นต่อทริป 20,000 - 45,000 บาท</p>
              <p><strong className="text-[#f8fafc]">1:35 - 2:00:</strong> สรุปคุณค่า — เปลี่ยนความเห็นต่างให้เป็นการตัดสินใจที่รวดเร็วและคุ้มค่า</p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-[#10b981] hover:bg-[#059669] text-white text-xs font-semibold rounded-xl transition-colors duration-150 cursor-pointer"
        >
          เข้าใจแล้ว กลับสู่ TripPick
        </button>
      </motion.div>
    </div>
  );
}

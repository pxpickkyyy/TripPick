import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchAiChatResponse, FIXED_AI_MODEL_NAME } from '../lib/ai';
import type { RoomContextInfo } from '../lib/ai';

interface ConciergeDrawerProps {
  roomContext: React.RefObject<RoomContextInfo>;
  isOpen: boolean;
  onToggle: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'concierge';
  text: string;
  time: string;
}

const QUICK_PROMPTS = [
  'ตรวจสอบความเร็วเน็ตและห้องประชุม',
  'คำนวณงบประมาณสำหรับ 12 ท่าน',
  'แนะนำกิจกรรมเชื่อมความสัมพันธ์ในทีม',
  'สรุปสมาชิกที่อยู่ในห้องขณะนี้'
];

function createChatMessage(sender: 'user' | 'concierge', text: string): Message {
  const timestamp = new Date();
  return {
    id: `${sender}_${timestamp.getTime()}_${Math.random().toString(36).slice(2, 7)}`,
    sender,
    text,
    time: timestamp.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
  };
}

export function ConciergeDrawer({ roomContext, isOpen, onToggle }: ConciergeDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init_1',
      sender: 'concierge',
      text: "สวัสดีครับ ผมคือ TripPick AI Concierge ขับเคลื่อนด้วย DeepSeek V4.1 Flash 1017 พร้อมช่วยคำนวณงบประมาณ วิเคราะห์สเปกสถานที่ และสนับสนุนการตัดสินใจของทีม มีเรื่องใดให้ช่วยแนะนำได้เลยครับ",
      time: 'เมื่อสักครู่'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isTyping) return;

    const userMsg = createChatMessage('user', text.trim());

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    try {
      const ctx = roomContext.current || {
        roomCode: '',
        roomStatus: 'waiting',
        users: [],
        progress: { swipedCount: 0, totalCount: 0, isWaitingForOthers: false }
      };

      const history = messages.map(m => ({ sender: m.sender, text: m.text }));
      const response = await fetchAiChatResponse(text, ctx, history);

      const aiMsg = createChatMessage('concierge', response);
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('Concierge response error:', err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Pill Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-40 py-2.5 px-4 rounded-full bg-[#10b981] hover:bg-[#059669] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors duration-150"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span>ผู้ช่วย AI</span>
        <span className="inline-block h-2 w-2 rounded-full bg-white opacity-80" />
      </motion.button>

      {/* Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 360 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 360 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-96 bg-[#131822] z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 bg-[#0e121a] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#1a2230] text-[#10b981] flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#f8fafc]">
                    TripPick AI Concierge
                  </h3>
                  <span className="text-xs text-[#10b981] flex items-center gap-1.5 tabular-nums">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
                    {FIXED_AI_MODEL_NAME}
                  </span>
                </div>
              </div>

              <button
                onClick={onToggle}
                aria-label="ปิดแชท"
                className="text-[#94a3b8] hover:text-white p-1 transition-colors duration-150 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Live Context Telemetry Banner */}
            <div className="px-4 py-2.5 bg-[#1a2230] text-xs text-[#94a3b8] flex items-center justify-between">
              <span className="text-[#10b981] font-medium">สถานที่บนจอ:</span>
              <span className="text-[#f8fafc] truncate max-w-[200px]">
                {roomContext.current?.currentDestination?.title || 'อยู่ในหน้าล็อบบี้'}
              </span>
            </div>

            {/* Messages Chat List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#131822]">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                      m.sender === 'user'
                        ? 'bg-[#10b981] text-white rounded-tr-sm'
                        : 'bg-[#0e121a] text-[#f8fafc] rounded-tl-sm'
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[11px] text-[#64748b] mt-1 px-1 tabular-nums">{m.time}</span>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0e121a] w-fit text-xs text-[#94a3b8]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                  <span>กำลังวิเคราะห์และเรียบเรียงคำตอบ...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            <div className="p-3 bg-[#0e121a] flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSendMessage(prompt)}
                  className="text-xs px-2.5 py-1.5 rounded-md bg-[#1a2230] hover:bg-[#242f42] text-[#f8fafc] transition-colors duration-150 text-left cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Footer */}
            <div className="p-3 bg-[#0b0e14]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="สอบถามอินเทอร์เน็ต ห้องประชุม ค่าน้ำมัน หรืองบ..."
                  className="flex-1 py-2 px-3 bg-[#1a2230] rounded-lg text-white text-xs placeholder:text-[#64748b] focus:outline-none focus:ring-1 focus:ring-[#10b981]"
                >
                </input>
                <button
                  type="submit"
                  disabled={!inputText.trim() || isTyping}
                  className="py-2 px-4 bg-[#10b981] hover:bg-[#059669] text-white rounded-lg text-xs font-semibold transition-colors duration-150 disabled:opacity-40 cursor-pointer"
                >
                  ส่ง
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

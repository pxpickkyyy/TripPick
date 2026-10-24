import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchAiChatResponse } from '../lib/ai';
import type { RoomContextInfo } from '../lib/ai';
import { useLanguage } from '../lib/i18n';

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

function createChatMessage(sender: 'user' | 'concierge', text: string, lang: 'th' | 'en'): Message {
  const timestamp = new Date();
  return {
    id: `${sender}_${timestamp.getTime()}_${Math.random().toString(36).slice(2, 7)}`,
    sender,
    text,
    time: timestamp.toLocaleTimeString(lang === 'th' ? 'th-TH' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
  };
}

export function ConciergeDrawer({ roomContext, isOpen, onToggle }: ConciergeDrawerProps) {
  const { language, t } = useLanguage();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init_1',
      sender: 'concierge',
      text: t.conciergeInitialGreeting,
      time: language === 'th' ? 'เมื่อสักครู่' : 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [prevLanguage, setPrevLanguage] = useState(language);
  if (prevLanguage !== language) {
    setPrevLanguage(language);
    setMessages((prev) =>
      prev.map((m) =>
        m.id === 'init_1'
          ? {
              ...m,
              text: t.conciergeInitialGreeting,
              time: language === 'th' ? 'เมื่อสักครู่' : 'Just now',
            }
          : m
      )
    );
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const quickPrompts = [
    t.conciergePrompt1,
    t.conciergePrompt2,
    t.conciergePrompt3,
    t.conciergePrompt4,
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isTyping) return;

    const userMsg = createChatMessage('user', text.trim(), language);

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    try {
      const ctx = roomContext.current || {
        roomCode: '',
        roomStatus: 'waiting',
        users: [],
        progress: { swipedCount: 0, totalCount: 0, isWaitingForOthers: false },
      };

      const history = messages.map((m) => ({ sender: m.sender, text: m.text }));
      const response = await fetchAiChatResponse(text, ctx, history, language);

      const aiMsg = createChatMessage('concierge', response, language);
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Concierge response error:', err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button (Docked Bottom-Left to prevent UI overlap with Revenue HUD) */}
      <motion.button
        data-testid="concierge-trigger"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', mass: 0.8, stiffness: 280, damping: 24 }}
        onClick={onToggle}
        className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-4 sm:left-5 z-40 py-2 px-3 sm:px-3.5 rounded-full bg-gradient-to-r from-[#cba6f7] to-[#fab387] text-[#11111b] text-xs font-extrabold flex items-center gap-1.5 sm:gap-2 cursor-pointer shadow-[0_10px_28px_rgba(203,166,247,0.3)] transition-all border border-[#cdd6f4]/20 no-print select-none"
        title="Open TripPick AI Concierge"
      >
        <svg className="w-4 h-4 text-[#11111b] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
        </svg>
        <span className="hidden sm:inline">{t.conciergeTitle}</span>
        <span className="sm:hidden font-mono font-bold">AI</span>
        <span className="w-1.5 h-1.5 rounded-full bg-[#11111b] animate-pulse shrink-0" />
      </motion.button>

      {/* Drawer Backdrop Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="concierge-backdrop"
            data-testid="concierge-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onToggle}
            className="fixed inset-0 bg-[#11111b]/70 backdrop-blur-sm z-[55] no-print cursor-pointer"
          />
        )}
      </AnimatePresence>

      {/* Drawer Overlay (Catppuccin Mocha Mantle + Base) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 340 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 340 }}
            transition={{ type: 'spring', mass: 0.8, stiffness: 280, damping: 24 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[380px] bg-[#181825]/98 backdrop-blur-[24px] border-l border-[#313244] z-[60] flex flex-col shadow-[0_0_64px_rgba(17,17,27,0.9)]"
          >
            {/* Header */}
            <div className="p-4 bg-[#11111b] border-b border-[#313244] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#cba6f7]/15 border border-[#cba6f7]/30 text-[#cba6f7] flex items-center justify-center font-bold">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#cdd6f4] tracking-tight">
                    {t.conciergeTitle}
                  </h3>
                  <span className="text-[10px] text-[#a6e3a1] font-mono flex items-center gap-1 font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#a6e3a1]" />
                    {t.conciergeStatus}
                  </span>
                </div>
              </div>

              <button
                data-testid="concierge-close-btn"
                onClick={onToggle}
                aria-label={language === 'th' ? 'ปิดแชท' : 'Close chat'}
                className="w-7 h-7 rounded-lg bg-[#1e1e2e] hover:bg-[#313244] border border-[#313244] text-[#cdd6f4] flex items-center justify-center cursor-pointer transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Live Context Banner */}
            <div className="px-3.5 py-1.5 bg-[#181825] border-b border-[#313244] text-[10px] text-[#a6adc8] flex items-center justify-between font-mono">
              <span className="text-[#cba6f7] font-semibold uppercase tracking-wider">FOCUS:</span>
              <span className="text-[#cdd6f4] truncate max-w-[200px]">
                {roomContext.current?.currentDestination?.title || (language === 'th' ? 'อยู่ในหน้าล็อบบี้' : 'In Waiting Lobby')}
              </span>
            </div>

            {/* Messages Chat List */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-[#1e1e2e]">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${
                      m.sender === 'user'
                        ? 'bg-[#cba6f7] text-[#11111b] font-medium'
                        : 'bg-[#181825] border border-[#313244] text-[#cdd6f4]'
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[10px] font-mono text-[#6c7086] mt-0.5 px-1 tabular-nums">{m.time}</span>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#181825] border border-[#313244] w-fit text-xs text-[#bac2de]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#cba6f7] animate-ping" />
                  <span className="text-[11px]">{language === 'th' ? 'กำลังประมวลผลคำตอบ...' : 'Generating response...'}</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            <div className="p-2.5 bg-[#181825] border-t border-[#313244] flex flex-wrap gap-1.5">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSendMessage(prompt)}
                  className="text-[10px] px-2.5 py-1 rounded-lg bg-[#1e1e2e] hover:bg-[#313244] border border-[#313244] text-[#bac2de] hover:text-[#cdd6f4] transition-colors text-left cursor-pointer active:scale-95"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Footer */}
            <div className="p-2.5 bg-[#11111b] border-t border-[#313244]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={t.conciergeInputPlaceholder}
                  className="flex-1 py-2 px-3 bg-[#1e1e2e] border border-[#313244] rounded-xl text-[#cdd6f4] text-xs placeholder:text-[#6c7086] focus:outline-none focus:border-[#cba6f7] transition-colors"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isTyping}
                  className="w-8 h-8 rounded-xl bg-[#cba6f7] hover:bg-[#b4befe] text-[#11111b] flex items-center justify-center shrink-0 transition-colors disabled:opacity-40 cursor-pointer active:scale-95"
                >
                  <svg className="w-4 h-4 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

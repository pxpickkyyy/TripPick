import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchAiChatResponse } from '../lib/ai';
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
  '📶 Check WiFi speed & boardrooms',
  '💰 Calculate 12-person budget',
  '🌴 Team adventure recommendations',
  '👥 Who is in our room right now?'
];

export function ConciergeDrawer({ roomContext, isOpen, onToggle }: ConciergeDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init_1',
      sender: 'concierge',
      text: "👋 Welcome! I'm your **TripPick AI Concierge**. I monitor live telemetry for the retreat cards on your screen, compute per-person budgets, and ensure your team offsite generates maximum ROI. Ask me anything!",
      time: 'Now'
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

    const userMsg: Message = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

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

      const aiMsg: Message = {
        id: 'ai_' + Date.now(),
        sender: 'concierge',
        text: response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
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
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-40 py-2.5 px-4 rounded-full bg-gradient-to-r from-cyan-600 to-emerald-600 text-white font-mono text-xs font-bold shadow-xl shadow-cyan-500/25 flex items-center gap-2 cursor-pointer border border-cyan-400/30"
      >
        <span className="text-base">🛎️</span>
        <span>AI Concierge</span>
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
      </motion.button>

      {/* Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 340 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 340 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-96 glass-panel-glow border-l border-slate-700/80 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center text-sm shadow">
                  🛎️
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                    TripPick Concierge
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span> Live Telemetry Active
                  </span>
                </div>
              </div>

              <button
                onClick={onToggle}
                className="text-slate-400 hover:text-white text-base font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Live Context Telemetry Banner */}
            <div className="p-2.5 bg-slate-900/90 border-b border-slate-800 text-[10px] font-mono text-slate-300">
              <span className="text-cyan-400 font-bold">Target on Screen: </span>
              {roomContext.current?.currentDestination?.title || 'Lobby Browsing'}
            </div>

            {/* Messages Chat List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                      m.sender === 'user'
                        ? 'bg-cyan-600 text-white rounded-tr-none'
                        : 'bg-slate-900/90 border border-slate-700 text-slate-200 rounded-tl-none font-sans'
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 mt-1 px-1">{m.time}</span>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-1 p-2 rounded-xl bg-slate-900/60 border border-slate-800 w-fit">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]"></span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            <div className="p-2 border-t border-slate-800 flex flex-wrap gap-1 bg-black/40">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSendMessage(prompt)}
                  className="text-[10px] font-mono px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 transition-colors text-left"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Footer */}
            <div className="p-3 border-t border-slate-800 bg-slate-950">
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
                  placeholder="Ask about WiFi, boardrooms, pricing..."
                  className="flex-1 py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isTyping}
                  className="py-2 px-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-40"
                >
                  Send
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

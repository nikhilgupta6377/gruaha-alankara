import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, User, Bot, Loader2, Volume2 } from 'lucide-react';
import { chatWithBuddy } from '../services/geminiService';

export default function BuddyChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'buddy', content: 'Hi! I am Buddy, your interior design assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const response = await chatWithBuddy(userMsg);
      setMessages(prev => [...prev, { role: 'buddy', content: response || 'Sorry, I encountered an error.' }]);
    } catch (error) {
      console.error('Buddy Chat Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 w-14 h-14 sm:w-16 sm:h-16 bg-accent text-black rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-50"
      >
        <MessageSquare size={24} className="sm:hidden" />
        <MessageSquare size={28} className="hidden sm:block" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-20 right-4 left-4 sm:left-auto sm:bottom-28 sm:right-8 sm:w-[400px] h-[500px] sm:h-[600px] glass rounded-3xl border border-white/10 shadow-2xl flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-accent/5">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-black">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-bold">Buddy</h3>
                  <p className="text-[10px] text-accent uppercase tracking-widest">AI Assistant</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
              {messages.map((msg, i) => (
                <div key={i} className={cn(
                  "flex items-start space-x-3",
                  msg.role === 'user' ? "flex-row-reverse space-x-reverse" : ""
                )}>
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                    msg.role === 'buddy' ? "bg-accent text-black" : "bg-white/10 text-white"
                  )}>
                    {msg.role === 'buddy' ? <Bot size={14} /> : <User size={14} />}
                  </div>
                  <div className={cn(
                    "p-4 rounded-2xl text-sm max-w-[80%]",
                    msg.role === 'buddy' ? "bg-white/5 text-white/80" : "bg-accent text-black font-medium"
                  )}>
                    {msg.content}
                    {msg.role === 'buddy' && (
                      <button 
                        onClick={() => speak(msg.content)}
                        className="mt-2 block text-accent hover:text-white transition-colors"
                      >
                        <Volume2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-center space-x-2 text-white/40 text-xs italic">
                  <Loader2 size={12} className="animate-spin" />
                  <span>Buddy is thinking...</span>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-6 border-t border-white/5">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask Buddy anything..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-sm focus:border-accent/50 outline-none transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-accent text-black rounded-xl hover:scale-105 transition-transform disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}

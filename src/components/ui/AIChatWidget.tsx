import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { useStore } from '../../store/useStore';

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatLog, setChatLog] = useState<{role: 'user' | 'assistant', text: string}[]>([
     { role: 'assistant', text: "Hi! I'm your AI Analyst. I can help fill out calculators or audit your strategy. Example:\\n\\n'I'm buying a phone case for $3.50, shipping is $4, target 30% margin.'\\n\\nOr:\\n\\n'Solana at $142, SL at $138, $25k account balance, 1.5% risk'" }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Try to determine which calculator is open based on page content
  // A bit hacky but works for a single-page app without react-router path based detection
  const determineContext = (): 'ecom_cost' | 'position_size' => {
     if (document.body.innerText.toLowerCase().includes("true cost")) return 'ecom_cost';
     return 'position_size';
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
     if (isOpen) {
        scrollToBottom();
     }
  }, [isOpen, chatLog]);

  const handleSend = async () => {
    if (!message.trim() || loading) return;

    const userText = message;
    setMessage('');
    setChatLog(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      const calcType = determineContext();
      
      const res = await fetch("/api/ai/parse", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userText, calculatorType: calcType })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
         setChatLog(prev => [...prev, { role: 'assistant', text: `Error: ${data.error || 'Failed to analyze'}` }]);
      } else {
         // Data is the JSON fields
         setChatLog(prev => [...prev, { role: 'assistant', text: `Got it! I've updated your calculator with the extracted parameters.` }]);
         
         // In a real app we'd dispatch this to a global store, or trigger a custom event
         if (calcType === 'ecom_cost') {
            const event = new CustomEvent('ai-fill-ecom', { detail: data });
            window.dispatchEvent(event);
         } else if (calcType === 'position_size') {
            const event = new CustomEvent('ai-fill-position', { detail: data });
            window.dispatchEvent(event);
         }
      }
    } catch (err: any) {
      setChatLog(prev => [...prev, { role: 'assistant', text: `Communication error.` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 p-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-full shadow-2xl transition-transform hover:scale-110 flex items-center justify-center group"
        >
          <Sparkles className="w-6 h-6 absolute opacity-0 group-hover:opacity-100 group-hover:animate-ping text-white" />
          <Bot className="w-6 h-6" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[360px] h-[500px] z-50 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-8">
           
           <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
             <div className="flex items-center gap-2">
               <div className="w-8 h-8 rounded-full bg-cyan-600/20 flex items-center justify-center">
                 <Bot className="w-4 h-4 text-cyan-500" />
               </div>
               <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white leading-tight">AI Financial Analyst</h3>
                  <p className="text-[10px] text-cyan-600 font-medium">Online • Context Aware</p>
               </div>
             </div>
             <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white hover:bg-slate-800 p-1 rounded-md transition-colors">
               <X className="w-5 h-5" />
             </button>
           </div>

           <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/50">
              {chatLog.map((log, i) => (
                 <div key={i} className={`flex ${log.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${log.role === 'user' ? 'bg-cyan-600 text-white rounded-tr-sm' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-sm shadow-sm'}`}>
                       {log.text.split('\n').map((line, k) => <div key={k} className="min-h-[1em]">{line}</div>)}
                    </div>
                 </div>
              ))}
              {loading && (
                 <div className="flex justify-start">
                    <div className="bg-white dark:bg-slate-800 text-slate-500 rounded-2xl p-3 border border-slate-200 dark:border-slate-700 rounded-tl-sm flex items-center gap-2">
                       <Sparkles className="w-4 h-4 animate-spin text-cyan-500" /> Thinking...
                    </div>
                 </div>
              )}
              <div ref={messagesEndRef} />
           </div>

           <div className="p-3 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <input 
                   type="text" 
                   value={message}
                   onChange={e => setMessage(e.target.value)}
                   onKeyDown={e => e.key === 'Enter' && handleSend()}
                   placeholder="Prompt calculation metrics..."
                   className="flex-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500 dark:text-white"
                   disabled={loading}
                />
                <button 
                  onClick={handleSend}
                  disabled={loading || !message.trim()}
                  className="bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-2 flex items-center justify-center gap-1 text-[9px] text-slate-500">
                 <AlertCircle className="w-3 h-3" /> Powered by Gemini
              </div>
           </div>

        </div>
      )}
    </>
  );
}

import React, { useState } from 'react';
import { api } from '../services/api';
import { Sparkles, X, Send, Bot, User, ArrowRight, Loader2 } from 'lucide-react';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({ isOpen, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; suggestions?: string[] }>>([
    {
      sender: 'ai',
      text: 'Hello! I am your NexStack Business AI Assistant. Ask me anything about your revenue, top selling items, or low stock alerts.',
      suggestions: ['How were my sales this week?', 'Which products will run out soon?', 'What is my best-selling product?']
    }
  ]);

  if (!isOpen) return null;

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || prompt;
    if (!textToSend.trim()) return;

    setMessages((prev) => [...prev, { sender: 'user', text: textToSend }]);
    if (!queryText) setPrompt('');
    setLoading(true);

    try {
      const res = await api.post('/ai/query', { prompt: textToSend });
      if (res.data.success) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: res.data.data.answer,
            suggestions: res.data.data.actionSuggestions
          }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'Sorry, I ran into an issue retrieving business analytics for your workspace.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl text-yellow-300 shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">NexStack AI Assistant</h3>
              <p className="text-xs text-indigo-400">Strictly Isolated Organization Context</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-indigo-600/30 text-indigo-400 border border-indigo-500/30'
              }`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[80%] rounded-2xl p-3.5 text-sm ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-tl-none'
              }`}>
                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-700/60 space-y-1.5">
                    <p className="text-xs font-semibold text-slate-400">Suggested Queries / Actions:</p>
                    {msg.suggestions.map((sug, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(sug)}
                        className="w-full text-left text-xs px-2.5 py-1.5 bg-slate-900/80 hover:bg-indigo-600/20 text-indigo-300 hover:text-indigo-200 border border-indigo-500/20 rounded-lg flex items-center justify-between transition"
                      >
                        <span>{sug}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-800/90 p-3.5 rounded-2xl rounded-tl-none border border-slate-700/60 flex items-center gap-2 text-sm text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                <span>Analyzing workspace data...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask AI about sales, stock, or items..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

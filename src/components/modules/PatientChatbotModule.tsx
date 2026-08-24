import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Send, Bot, User, Sparkles, Calendar, HelpCircle } from 'lucide-react';
import { askMedAI } from '../../services/azureOpenAI';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

export const PatientChatbotModule: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'ai', text: 'Hello James! I am your MedAI Health Assistant. How can I support you today? You can ask about your symptoms, medications, or upcoming appointments.', time: '10:00 AM' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (textToSend?: string) => {
    const q = textToSend || input;
    if (!q.trim()) return;

    const userMsg: ChatMessage = {
      sender: 'user',
      text: q,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const response = await askMedAI(q, 'patient');
      const aiMsg: ChatMessage = {
        sender: 'ai',
        text: response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      setMessages(prev => [...prev, { sender: 'ai', text: 'I am here to help. Please ask any questions about your care plan or symptoms.', time: 'Just now' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
            Medii Patient AI Companion <Bot className="text-primary-600" />
          </h1>
          <p className="text-sm text-slate-500">24/7 intelligent patient assistance powered by Medii Intelligence Engine.</p>
        </div>
      </div>

      <div className="glass-card p-4 h-[500px] flex flex-col justify-between border">
        {/* Chat area */}
        <div className="flex-1 overflow-y-auto space-y-3 p-2">
          {messages.map((m, i) => (
            <div key={i} className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.sender === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs shrink-0">
                  <Bot size={16} />
                </div>
              )}
              <div className={`p-3 rounded-2xl max-w-md text-xs ${
                m.sender === 'user' ? 'bg-primary-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'
              }`}>
                <p className="leading-relaxed">{m.text}</p>
                <span className={`text-[9px] block mt-1 ${m.sender === 'user' ? 'text-primary-200 text-right' : 'text-slate-400'}`}>
                  {m.time}
                </span>
              </div>
              {m.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs shrink-0 font-bold">
                  JW
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
              <Bot size={16} className="animate-spin text-primary-500" />
              MedAI is thinking...
            </div>
          )}
        </div>

        {/* Quick prompt buttons */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2 mb-3">
          {['When is my next lab test?', 'Explain my hypertension medication', 'What are side effects of Lisinopril?'].map(prompt => (
            <button
              key={prompt}
              onClick={() => sendMessage(prompt)}
              className="px-2.5 py-1 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg text-[11px] font-medium transition-all"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input box */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Type your health question here..."
            className="input-field text-xs flex-1"
          />
          <button onClick={() => sendMessage()} disabled={loading || !input.trim()} className="btn-primary text-xs px-4">
            <Send size={14} /> Send
          </button>
        </div>
      </div>
    </div>
  );
};

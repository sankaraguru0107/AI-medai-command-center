import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Send, X, Sparkles, RefreshCw, Copy, CheckCheck, ChevronDown } from 'lucide-react';
import { streamMedAI, AIContext, AzureMessage } from '../../services/azureOpenAI';
import { useAppStore } from '../../store/appStore';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_PROMPTS: Record<AIContext, string[]> = {
  clinical: [
    'Summarize patient condition',
    'Predict readmission risk',
    'Suggest treatment plan',
    'Check medication safety',
  ],
  rcm: [
    'Validate this claim',
    'Check prior auth status',
    'Identify denial risk',
    'Verify patient benefits',
  ],
  operations: [
    'Optimize bed assignment',
    'Predict capacity issues',
    'Analyze LOS trends',
    'Flag operational risks',
  ],
  security: [
    'Analyze recent threats',
    'Check for anomalies',
    'Review access logs',
    'Assess HIPAA risk',
  ],
  patient: [
    'Explain my diagnosis',
    'Review my medications',
    'When is my next visit?',
    'What to expect post-discharge',
  ],
  pharmacy: [
    'Check drug interactions',
    'Review dosing',
    'Flag contraindications',
    'Verify allergy profile',
  ],
};

const CONTEXT_LABELS: Record<AIContext, string> = {
  clinical: '🏥 Clinical',
  rcm: '💳 RCM',
  operations: '⚙️ Operations',
  security: '🔐 Security',
  patient: '👤 Patient',
  pharmacy: '💊 Pharmacy',
};

export const AIAssistantPanel: React.FC = () => {
  const { aiPanelOpen, setAIPanelOpen, user } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: `**Welcome to Medii Assistant** 🏥\n\nI'm your unified clinical AI copilot. I can help you with:\n\n• Patient condition summaries & risk prediction\n• Evidence-based treatment recommendations\n• Prior authorization & RCM support\n• Medication safety & allergy interaction checks\n• Real-time hospital operations intelligence\n\nSelect a context above or ask me anything.`,
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [context, setContext] = useState<AIContext>('clinical');
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const conversationHistory = useRef<AzureMessage[]>([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    let userText = text || input.trim();
    if (!userText) {
      const defaults: Record<AIContext, string> = {
        clinical: 'Summarize clinical risk & patient condition',
        rcm: 'Validate active patient claims and prior authorization',
        operations: 'Analyze hospital capacity and bed assignments',
        security: 'Scan recent SOC security alerts and HIPAA logs',
        patient: 'Explain patient care plan and medication schedule',
        pharmacy: 'Check drug interactions and contraindications',
      };
      userText = defaults[context] || 'Perform Medii AI intelligence scan';
    }
    if (isStreaming) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);

    conversationHistory.current.push({ role: 'user', content: userText });

    const assistantId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    }]);

    try {
      let fullContent = '';
      for await (const chunk of streamMedAI(userText, context, conversationHistory.current.slice(-8))) {
        fullContent += chunk;
        setMessages(prev =>
          prev.map(m => m.id === assistantId ? { ...m, content: fullContent } : m)
        );
      }
      conversationHistory.current.push({ role: 'assistant', content: fullContent });
    } catch (err) {
      setMessages(prev =>
        prev.map(m => m.id === assistantId
          ? { ...m, content: `⚠️ Notice: ${err instanceof Error ? err.message : 'Response error'}. Consulting Medii Intelligence Engine.` }
          : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearConversation = () => {
    conversationHistory.current = [];
    setMessages([{
      id: Date.now().toString(),
      role: 'assistant',
      content: 'Conversation cleared. How can I help you?',
      timestamp: new Date(),
    }]);
  };

  const renderContent = (content: string) => {
    return content
      .split('\n')
      .map((line, i) => {
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={i} className="font-extrabold text-slate-900 mt-2 mb-1">{line.slice(2, -2)}</p>;
        }
        if (line.startsWith('• ')) {
          return <p key={i} className="flex items-start gap-2 my-1"><span className="text-primary-600 font-bold mt-0.5">•</span><span>{line.slice(2)}</span></p>;
        }
        if (/^\d+\./.test(line)) {
          return <p key={i} className="my-1 pl-1 font-medium">{line}</p>;
        }
        if (line.trim() === '') return <div key={i} className="h-1.5" />;
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={i} className="my-0.5 leading-relaxed">
            {parts.map((part, j) =>
              part.startsWith('**') && part.endsWith('**')
                ? <strong key={j} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>
                : part
            )}
          </p>
        );
      });
  };

  return (
    <AnimatePresence>
      {aiPanelOpen && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 bottom-0 w-96 bg-white/95 backdrop-blur-2xl border-l border-slate-200/80 shadow-2xl z-40 flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-200/80 bg-gradient-to-r from-primary-500/10 via-primary-500/5 to-accent-teal/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-teal flex items-center justify-center shadow-md shadow-primary-500/20">
                  <Brain size={17} className="text-white animate-pulse" />
                </div>
                <div>
                  <div className="font-display font-extrabold text-slate-900 text-sm">Medii AI Copilot</div>
                  <div className="text-[11px] text-primary-600 font-bold">Medii Intelligence Engine</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={clearConversation} className="p-1.5 hover:bg-slate-200/60 rounded-xl text-slate-500 transition-colors" title="Clear">
                  <RefreshCw size={15} />
                </button>
                <button onClick={() => setAIPanelOpen(false)} className="p-1.5 hover:bg-slate-200/60 rounded-xl text-slate-500 transition-colors">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Context selector */}
            <div className="relative">
              <button
                onClick={() => setContextMenuOpen(!contextMenuOpen)}
                className="w-full flex items-center justify-between px-3.5 py-2 bg-white border border-slate-200/90 rounded-xl text-xs font-bold text-slate-800 hover:border-primary-400 transition-all shadow-xs"
              >
                <span className="flex items-center gap-2">
                  <Sparkles size={13} className="text-primary-600" />
                  Context: {CONTEXT_LABELS[context]}
                </span>
                <ChevronDown size={13} className="text-slate-400" />
              </button>
              <AnimatePresence>
                {contextMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute top-10 left-0 right-0 bg-white border border-slate-200 rounded-2xl shadow-glass-lg z-20 py-1.5 overflow-hidden"
                  >
                    {(Object.entries(CONTEXT_LABELS) as [AIContext, string][]).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => { setContext(key); setContextMenuOpen(false); }}
                        className={`w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-slate-50 transition-colors
                          ${context === key ? 'text-primary-600 bg-primary-50/60' : 'text-slate-700'}`}
                      >
                        {label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Quick prompts */}
          <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex gap-1.5 flex-wrap">
            {QUICK_PROMPTS[context].map(prompt => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                disabled={isStreaming}
                className="px-3 py-1 bg-primary-500/10 hover:bg-primary-500/20 text-primary-700 text-[11px] rounded-lg font-bold transition-all border border-primary-500/20 disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
            {messages.map(message => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold shadow-xs
                  ${message.role === 'assistant'
                    ? 'bg-gradient-to-tr from-primary-600 to-accent-teal text-white'
                    : 'bg-slate-800 text-white'}`}>
                  {message.role === 'assistant' ? '🤖' : user?.name?.charAt(0) || 'U'}
                </div>
                <div className={`flex-1 ${message.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className={`relative group max-w-full rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs
                    ${message.role === 'assistant'
                      ? 'bg-slate-50 border border-slate-200/90 text-slate-800 rounded-tl-sm'
                      : 'bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium rounded-tr-sm shadow-md shadow-primary-500/20'}`}>
                    {message.role === 'assistant' ? (
                      <div className="space-y-1">{renderContent(message.content)}</div>
                    ) : (
                      <p>{message.content}</p>
                    )}
                    {message.content === '' && isStreaming && (
                      <div className="flex gap-1 py-1">
                        <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    )}
                    {message.role === 'assistant' && message.content && (
                      <button
                        onClick={() => copyMessage(message.id, message.content)}
                        className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 hover:bg-slate-200/60 rounded-md transition-all"
                      >
                        {copiedId === message.id ? <CheckCheck size={12} className="text-emerald-600" /> : <Copy size={12} className="text-slate-400" />}
                      </button>
                    )}
                  </div>
                  <span className="text-[10px] font-medium text-slate-400 mt-1 px-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3.5 border-t border-slate-200/80 bg-white">
            <div className="flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask MedAI anything..."
                rows={1}
                className="flex-1 px-3.5 py-2.5 bg-slate-100/70 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 focus:bg-white resize-none max-h-24 scrollbar-thin shadow-inner"
                style={{ resize: 'none' }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={isStreaming}
                className="p-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-md shadow-primary-500/20"
                title="Send query (or click for automated AI scan)"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-[10px] font-semibold text-slate-400 mt-2 px-1 text-center">
              Powered by Medii Intelligence Engine · Clinical AI Assistant
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

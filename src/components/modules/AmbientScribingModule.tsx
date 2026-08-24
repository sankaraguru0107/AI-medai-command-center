import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Mic, MicOff, FileText, Copy, CheckCheck, RefreshCw, Zap, Save,
  Users, Search, UserCheck, X, ClipboardList, Info, AlertCircle, Play, Pause,
  Share2, ChevronRight, BookOpen, AlertTriangle, HelpCircle, Code, MessageSquare, Check
} from 'lucide-react';
import { askMedAI } from '../../services/azureOpenAI';

interface PatientConsult {
  id: string;
  name: string;
  mrn: string;
  age: number;
  gender: string;
  diagnosis: string;
  visitType: string;
  time: string;
}

const mockConsults: PatientConsult[] = [
  { id: 'c001', name: 'James Wilson', mrn: 'MRN-482109', age: 67, gender: 'Male', diagnosis: 'COPD Exacerbation', visitType: 'ICU Check-in', time: '10:00 AM' },
  { id: 'c002', name: 'Sarah Chen', mrn: 'MRN-334281', age: 54, gender: 'Female', diagnosis: 'Type 2 DM', visitType: 'Outpatient Follow-up', time: '11:30 AM' }
];

export const AmbientScribingModule: React.FC = () => {
  const [patients] = useState<PatientConsult[]>(mockConsults);
  const [selectedPatient, setSelectedPatient] = useState<PatientConsult>(mockConsults[0]);

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timer, setTimer] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [waveform, setWaveform] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<'SOAP' | 'Referral' | 'Discharge' | 'Coding'>('SOAP');

  // AI & Action States
  const [aiLoading, setAiLoading] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Edit fields
  const [soapS, setSoapS] = useState('67-year-old male presents with worsening shortness of breath and cough over 3 days.');
  const [soapO, setSoapO] = useState('BP 142/88, HR 98, Temp 101.2F, SpO2 87% on room air. Auscultation reveals bilateral wheezing.');
  const [soapA, setSoapA] = useState('Acute COPD exacerbation with hypoxic respiratory strain.');
  const [soapP, setSoapP] = useState('1. Supplemental O2 2L via nasal cannula.\n2. Albuterol/Ipratropium nebulizer q4h.\n3. IV Methylprednisolone 40mg.');

  // AI assistant drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiAssistantLoading, setAiAssistantLoading] = useState(false);

  const timerRef = useRef<any | null>(null);

  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
        // Generate random waveform heights
        setWaveform(prev => {
          const next = [...prev, Math.random() * 24 + 4];
          if (next.length > 20) next.shift();
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, isPaused]);

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setIsPaused(false);
      setTimer(0);
      setWaveform([]);
      setTranscript('Doctor: Good morning Mr. Wilson, how has your breathing been today?\nPatient: It\'s been really tight. I\'ve had a cough for 3 days and I\'m using my rescue inhaler every 2 hours.');
    } else {
      setIsRecording(false);
      triggerToast('Recording finalized. Analyzing conversation audio details...');
    }
  };

  const triggerToast = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const askAiAssistant = async (queryText?: string) => {
    const text = queryText || aiPrompt;
    if (!text.trim()) return;
    setAiAssistantLoading(true);
    setAiPrompt('');
    setDrawerOpen(true);
    try {
      const resp = await askMedAI(
        `Ambient scribe assistant. Patient: ${selectedPatient.name}. Transcript: ${transcript}. Query: ${text}`,
        'clinical'
      );
      setAiResponse(resp);
    } catch {
      setAiResponse('Unable to connect to Azure OpenAI Medical Documentation network.');
    } finally {
      setAiAssistantLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1700px] mx-auto relative">
      {/* Toast Notice */}
      <AnimatePresence>
        {actionNotice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-24 right-6 z-50 p-3 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-2">
              <CheckCheck size={16} /> {actionNotice}
            </div>
            <button onClick={() => setActionNotice(null)}>
              <X size={14} className="ml-2" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
            Ambient Scribing & AI Documentation Workspace <Brain className="text-violet-650" />
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time ambient consultation voice capturing, structured SOAP note generation, and integrated clinical billing auto-coding (ICD-10/CPT).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setDrawerOpen(true)} className="btn-primary text-xs flex items-center gap-1.5 shadow-md shadow-primary-500/20">
            <MessageSquare size={14} />
            <span>AI Documentation Assistant</span>
          </button>
          <button onClick={() => triggerToast('EHR connection verified')} className="btn-secondary text-xs flex items-center gap-1.5">
            <UserCheck size={14} />
            <span>Verify EHR Feed</span>
          </button>
        </div>
      </div>

      {/* Ambient Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Panel: Patient Selection (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="glass-card p-4 space-y-3">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase block tracking-wider">Scheduled Consultations</span>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
              <input type="text" placeholder="Search consults..." className="input-field text-xs pl-8" />
            </div>

            <div className="space-y-2">
              {patients.map(p => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPatient(p)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedPatient.id === p.id ? 'bg-primary-50 border-primary-300' : 'bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="font-bold text-xs text-slate-800">{p.name}</div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1 font-mono">
                    <span>{p.visitType}</span>
                    <span>{p.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-violet-50 border border-violet-100 rounded-2xl text-xs space-y-1 text-violet-900">
            <div className="font-bold flex items-center gap-1">
              <Info size={14} className="text-violet-650" /> Voice Commands Info
            </div>
            <p className="text-[11px] leading-relaxed opacity-90">
              Speak: <span className="font-bold">"Start Recording"</span>, <span className="font-bold">"Finalize SOAP Note"</span>, or <span className="font-bold">"Add medication Lisinopril 10mg daily"</span>.
            </p>
          </div>
        </div>

        {/* Center Panel: Live Waveform & Transcription (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-5 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2">
                <Mic size={16} className="text-primary-600" /> Live Consultation Recorder
              </h3>

              {isRecording && (
                <div className="flex items-center gap-1.5 text-xs text-rose-600 font-extrabold animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-rose-600" />
                  <span>RECORDING ({Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')})</span>
                </div>
              )}
            </div>

            {/* Recording Controls */}
            <div className="flex items-center justify-center gap-4 py-4">
              <button
                onClick={toggleRecording}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isRecording ? 'bg-rose-600 text-white animate-pulse' : 'bg-primary-600 text-white'
                }`}
              >
                {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
              </button>

              {isRecording && (
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all"
                >
                  {isPaused ? <Play size={16} /> : <Pause size={16} />}
                </button>
              )}
            </div>

            {/* Waveform graphic visualization */}
            {isRecording && waveform.length > 0 && (
              <div className="flex justify-center items-end gap-1.5 h-16 bg-slate-50 border rounded-xl p-3">
                {waveform.map((height, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-primary-500 rounded-full transition-all"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            )}

            {/* Live Transcription display */}
            <div className="p-4 bg-slate-50 border rounded-xl space-y-2 text-xs h-[180px] overflow-y-auto">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Live Voice Transcription</span>
              <p className="text-slate-700 whitespace-pre-line leading-relaxed font-mono">
                {transcript || 'No voice signal detected. Click the mic button above to initiate scribing.'}
              </p>
            </div>
          </div>

          {/* Bottom Documentation Tabbed Workspace */}
          <div className="glass-card p-5 space-y-4">
            <div className="flex border-b text-xs font-semibold overflow-x-auto gap-3 pb-1">
              {['SOAP', 'Referral', 'Discharge', 'Coding'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`pb-2 border-b-2 transition-all px-2 ${
                    activeTab === tab ? 'border-primary-600 text-primary-600 font-bold' : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
                >
                  {tab === 'SOAP' ? 'SOAP Note Document' : tab}
                </button>
              ))}
            </div>

            {activeTab === 'SOAP' && (
              <div className="space-y-3 text-xs font-semibold text-slate-700">
                <div>
                  <label className="block mb-1">Subjective (S)</label>
                  <textarea value={soapS} onChange={e => setSoapS(e.target.value)} rows={2} className="input-field text-xs" />
                </div>
                <div>
                  <label className="block mb-1">Objective (O)</label>
                  <textarea value={soapO} onChange={e => setSoapO(e.target.value)} rows={2} className="input-field text-xs" />
                </div>
                <div>
                  <label className="block mb-1">Assessment (A)</label>
                  <textarea value={soapA} onChange={e => setSoapA(e.target.value)} rows={2} className="input-field text-xs" />
                </div>
                <div>
                  <label className="block mb-1">Plan (P)</label>
                  <textarea value={soapP} onChange={e => setSoapP(e.target.value)} rows={3} className="input-field text-xs" />
                </div>
              </div>
            )}

            {activeTab === 'Referral' && (
              <div className="space-y-3 text-xs font-semibold text-slate-700">
                <div>
                  <label className="block mb-1">Referral Physician Address</label>
                  <input type="text" defaultValue="Dr. James Patel, FACC" className="input-field text-xs" />
                </div>
                <div>
                  <label className="block mb-1">Reason for Clinical Referral</label>
                  <textarea defaultValue="Follow-up diagnostic evaluation for pulmonary volume clearances and cardiac secondary prevention." rows={4} className="input-field text-xs" />
                </div>
              </div>
            )}

            {activeTab === 'Discharge' && (
              <div className="space-y-3 text-xs font-semibold text-slate-700">
                <div>
                  <label className="block mb-1">Discharge Instructions Summary</label>
                  <textarea defaultValue="Continue home oxygen at 2L/min. Use rescue inhaler PRN. Follow-up clinic appointment scheduled for 10:00 AM." rows={5} className="input-field text-xs" />
                </div>
              </div>
            )}

            {activeTab === 'Coding' && (
              <div className="space-y-3 text-xs">
                <span className="font-bold text-slate-800 block mb-2">Suggested Coding concept mapping (ICD-10 / CPT)</span>
                <div className="space-y-2">
                  {[
                    { code: 'J44.1', desc: 'COPD with acute exacerbation', type: 'ICD-10', conf: '98%' },
                    { code: '99214', desc: 'Outpatient visit level 4', type: 'CPT Code', conf: '94%' },
                  ].map((item, i) => (
                    <div key={i} className="p-3 bg-slate-50 border rounded-xl flex justify-between items-center">
                      <div>
                        <span className="font-bold text-slate-800">{item.code} — {item.desc}</span>
                        <span className="text-[10px] text-slate-400 block">{item.type}</span>
                      </div>
                      <span className="text-primary-600 font-bold">{item.conf} Confidence</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="pt-2 flex justify-end gap-2 text-xs font-bold border-t border-slate-100">
              <button onClick={() => triggerToast('Document draft saved successfully')} className="btn-secondary text-xs flex items-center gap-1">
                <Save size={14} /> Save Draft
              </button>
              <button onClick={() => triggerToast('Successfully finalized and signed EHR note')} className="btn-primary text-xs flex items-center gap-1 bg-emerald-600 border-none shadow-md shadow-emerald-500/20">
                <Check size={14} /> Sign & Export to EHR
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel: AI Scribe Insights & Decision recommendations (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-5 space-y-4 bg-gradient-to-br from-primary-50/40 to-teal-50/20">
            <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2 border-b pb-2">
              <Brain size={16} className="text-primary-600 animate-pulse" /> Scribe AI Insights
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-white border border-primary-100 rounded-xl space-y-1 shadow-xs">
                <span className="text-[9px] font-extrabold text-primary-600 uppercase">Working Diagnosis</span>
                <p className="font-bold text-slate-800 leading-normal">Acute COPD Exacerbation</p>
                <p className="text-[10px] text-slate-400">Differential: Cardiac asthma, Acute bronchitis.</p>
              </div>

              <div className="p-3 bg-white border border-primary-100 rounded-xl space-y-1 shadow-xs">
                <span className="text-[9px] font-extrabold text-primary-600 uppercase">Clinical Warning</span>
                <p className="font-bold text-slate-800 leading-normal text-rose-700">Severe Hypoxemia (SpO2 87%)</p>
                <p className="text-[10px] text-slate-400">Recommendation: Inpatient ICU monitoring is recommended.</p>
              </div>

              <div className="p-3 bg-white border rounded-xl flex justify-between items-center text-[11px] font-semibold text-slate-700">
                <span>AI Scribe Quality Score:</span>
                <span className="text-primary-600 font-extrabold">96% Compliant</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-5 space-y-3">
            <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-2">
              <ClipboardList size={16} className="text-teal-600" /> Document Quality Checks
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Missing Information:</span>
                <span className="font-bold text-rose-600">Smoking history missing</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Coding Audits:</span>
                <span className="font-bold text-emerald-600">All codes matched (J44.1)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Billing Readiness:</span>
                <span className="font-bold text-primary-600">Ready to Submit</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible AI assistant Drawer (Right Side) */}
      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 p-6"
            >
              <div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                      <Brain size={18} />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-slate-900 text-sm">Documentation AI Copilot</h3>
                      <p className="text-[10px] text-slate-400">Azure OpenAI Medical Scribe Network</p>
                    </div>
                  </div>
                  <button onClick={() => setDrawerOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                    <X size={18} />
                  </button>
                </div>

                <div className="mt-4 space-y-3 text-xs">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Scribe Queries</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Summarize consultation dialogue transcript',
                      'Generate progress note draft',
                      'Review active document billing readiness',
                      'Translate discharge instructions'
                    ].map(q => (
                      <button
                        key={q}
                        onClick={() => askAiAssistant(q)}
                        className="px-2.5 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg text-left text-[11px] font-medium transition-all"
                      >
                        {q}
                      </button>
                    ))}
                  </div>

                  {aiAssistantLoading && (
                    <div className="p-4 bg-slate-50 border rounded-xl flex items-center gap-2 text-xs text-slate-500">
                      <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
                      Ingesting transcription waveforms...
                    </div>
                  )}

                  {aiResponse && !aiAssistantLoading && (
                    <div className="p-4 bg-primary-50/50 border border-primary-100 rounded-xl space-y-2 text-xs">
                      <span className="font-bold text-primary-900 block">AI Clinical Response:</span>
                      <p className="text-slate-700 leading-relaxed whitespace-pre-line text-[11px]">{aiResponse}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={e => setAiPrompt(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && askAiAssistant()}
                    placeholder="Ask Scribe AI about formatting, codes, terms..."
                    className="input-field text-xs flex-1"
                  />
                  <button onClick={() => askAiAssistant()} disabled={aiAssistantLoading || !aiPrompt.trim()} className="btn-primary text-xs px-3">
                    Ask
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Baby, Heart, Activity, CheckCircle, Search, UserPlus, FileText, AlertTriangle,
  Clock, Shield, X, HelpCircle, RefreshCw, Layers, Sparkles, ChevronRight,
  MessageSquare, Settings, Flame, ShieldAlert, Monitor, Volume2, Plus, Play, Pause, Users, Brain
} from 'lucide-react';
import { MetricCard } from '../common/MetricCard';
import { askMedAI } from '../../services/azureOpenAI';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area
} from 'recharts';

interface MaternityPatient {
  id: string;
  name: string;
  age: number;
  mrn: string;
  room: string;
  gestation: string;
  gravidaPara: string; // e.g. G2 P1
  riskLevel: 'Critical' | 'Warning' | 'Normal';
  fhr: number;
  contractions: string;
  bp: string;
  obGyn: string;
  deliveryStatus: 'Active Labour' | 'Observation' | 'Imminent Delivery' | 'Emergency C-Section';
  vitals: { hr: number; temp: string; rr: number; spo2: number };
  labs: { protein: string; platelets: string; ast: string; alt: string; cr: string };
  progress: { dilation: number; effacement: number; station: number; membrane: string; oxytocin: string; analgesia: string };
  ctgData: { time: string; fhrValue: number; tocoValue: number }[];
  timeline: { event: string; time: string }[];
}

const mockMaternityPatients: MaternityPatient[] = [
  {
    id: 'mat001',
    name: 'Maria Rivera',
    age: 29,
    mrn: 'MRN-482109',
    room: 'L&D Suite 2',
    gestation: '38 Weeks 4 Days',
    gravidaPara: 'G2 P1',
    riskLevel: 'Critical',
    fhr: 140,
    contractions: 'Every 2-3 mins',
    bp: '148/92',
    obGyn: 'Dr. Emily Chen',
    deliveryStatus: 'Active Labour',
    vitals: { hr: 88, temp: '98.8°F', rr: 18, spo2: 98 },
    labs: { protein: '2+', platelets: '135,000', ast: '42 U/L', alt: '38 U/L', cr: '0.9 mg/dL' },
    progress: { dilation: 6, effacement: 80, station: 0, membrane: 'Ruptured (Clear)', oxytocin: '4 mU/min', analgesia: 'Epidural active' },
    timeline: [
      { event: 'Admission (3cm Dilation)', time: '06:30' },
      { event: 'Epidural Placed', time: '08:15' },
      { event: 'Amniotomy Performed', time: '09:00' },
      { event: 'Oxytocin Titration Initiated', time: '09:30' }
    ],
    ctgData: Array.from({ length: 20 }, (_, i) => ({
      time: `${i}:00`,
      fhrValue: 140 + Math.round(Math.random() * 8) - (i > 12 && i < 17 ? 25 : 0), // Simulating variable deceleration
      tocoValue: 10 + Math.round(Math.sin(i / 1.5) * 50) + (Math.sin(i / 1.5) < 0 ? -10 : 0)
    }))
  },
  {
    id: 'mat002',
    name: 'Elena Rostova',
    age: 32,
    mrn: 'MRN-334281',
    room: 'L&D Suite 5',
    gestation: '39 Weeks 1 Day',
    gravidaPara: 'G1 P0',
    riskLevel: 'Normal',
    fhr: 135,
    contractions: 'Every 4 mins',
    bp: '118/74',
    obGyn: 'Dr. James Park',
    deliveryStatus: 'Observation',
    vitals: { hr: 76, temp: '98.6°F', rr: 16, spo2: 99 },
    labs: { protein: 'Negative', platelets: '220,000', ast: '24 U/L', alt: '20 U/L', cr: '0.6 mg/dL' },
    progress: { dilation: 3, effacement: 50, station: -2, membrane: 'Intact', oxytocin: 'None', analgesia: 'None' },
    timeline: [
      { event: 'Admitted in Early Labour', time: '08:00' }
    ],
    ctgData: Array.from({ length: 20 }, (_, i) => ({
      time: `${i}:00`,
      fhrValue: 135 + Math.round(Math.random() * 6),
      tocoValue: 10 + Math.round(Math.sin(i / 2) * 35)
    }))
  }
];

export const MaternalModule: React.FC = () => {
  const [patients, setPatients] = useState<MaternityPatient[]>(mockMaternityPatients);
  const [selectedPatient, setSelectedPatient] = useState<MaternityPatient>(mockMaternityPatients[0]);

  // UI state
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // AI assistant drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const triggerToast = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const askAiObstetrician = async (queryText?: string) => {
    const text = queryText || aiPrompt;
    if (!text.trim()) return;
    setAiLoading(true);
    setAiPrompt('');
    setDrawerOpen(true);
    try {
      const resp = await askMedAI(
        `L&D telemetry cockpit. Patient: ${selectedPatient.name}. FHR: ${selectedPatient.fhr} bpm. Contractions: ${selectedPatient.contractions}. BP: ${selectedPatient.bp}. Urine protein: ${selectedPatient.labs.protein}. Query: ${text}`,
        'clinical'
      );
      setAiResponse(resp);
    } catch {
      setAiResponse('Unable to connect to Azure OpenAI Obstetric Support database.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1700px] mx-auto relative">
      {/* Toast */}
      <AnimatePresence>
        {actionNotice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-24 right-6 z-50 p-3 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-2">
              <CheckCircle size={16} /> {actionNotice}
            </div>
            <button onClick={() => setActionNotice(null)}>
              <X size={14} className="ml-2" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER: Unit status and quick metrics */}
      <div className="glass-card p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-rose-600 text-white text-[9px] font-extrabold rounded-lg flex items-center gap-1 animate-pulse">
                <span className="w-1 h-1 rounded-full bg-white" /> Live L&D Command Control
              </span>
              <span className="text-xs text-slate-400 font-medium">St. Jude Women's Health Pavilion</span>
            </div>
            <h1 className="text-3xl font-display font-extrabold text-white mt-2 leading-none">
              Maternal High-Risk & Fetal Monitoring Command Center
            </h1>
            <p className="text-sm text-slate-350 mt-2 max-w-3xl">
              Enterprise obstetrical dashboard monitoring cardiotocography (CTG) feeds, maternal vitals, labor progress curves, preeclampsia diagnostics, and fetal distress forecasts.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <div className="px-3 py-2 bg-white/10 rounded-xl border border-white/5 text-center">
              <div className="font-bold text-rose-400">1 Critical Case</div>
              <div className="text-[9px] text-slate-400">High-Risk Cases</div>
            </div>
            <div className="px-3 py-2 bg-white/10 rounded-xl border border-white/5 text-center">
              <div className="font-bold text-amber-400">8 Active</div>
              <div className="text-[9px] text-slate-400">Active Labour Cases</div>
            </div>
            <div className="px-3 py-2 bg-white/10 rounded-xl border border-white/5 text-center">
              <div className="font-bold text-teal-400">3/10 Rooms</div>
              <div className="text-[9px] text-slate-400">Available Suites</div>
            </div>
            <button onClick={() => setDrawerOpen(true)} className="btn-primary py-3 px-4 bg-rose-600 border-none hover:bg-rose-500 text-xs font-bold shadow-md shadow-rose-500/20">
              L&D AI Assistant
            </button>
          </div>
        </div>
      </div>

      {/* ZONE 1: Executive KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {[
          { label: 'Avg Fetal HR', val: '142 bpm', sub: 'Category I', trend: '+1 bpm', color: 'rose', icon: <Baby size={16} /> },
          { label: 'Variability', val: '15 bpm', sub: 'Moderate', trend: '6-25 range', color: 'teal', icon: <Heart size={16} /> },
          { label: 'Contraction Freq', val: '3 mins', sub: 'Active Labor', trend: 'Stable duration', color: 'amber', icon: <Activity size={16} /> },
          { label: 'Maternal BP', val: selectedPatient.bp, sub: 'Elevated Risk', trend: 'Hypertension audit', color: 'rose', icon: <Activity size={16} /> },
          { label: 'Preeclampsia Risk', val: selectedPatient.labs.protein === '2+' ? 'High (80%)' : 'Low', sub: 'Urine protein check', trend: 'Lab audited', color: 'rose', icon: <ShieldAlert size={16} /> },
          { label: 'High-Risk Patients', val: '1 Enrolled', sub: 'Room 202 Suite', trend: 'Continuous telemetry', color: 'rose', icon: <Users size={16} /> },
          { label: 'Emergency Case', val: 'Room 202 alert', sub: 'STAT C-Section prepped', trend: 'Cath lab ready', color: 'rose', icon: <AlertTriangle size={16} /> },
          { label: 'NICU Bed Readiness', val: '2 Level III ready', sub: 'Pediatrics standby', trend: 'Fully staffed', color: 'teal', icon: <CheckCircle size={16} /> }
        ].map((kpi, i) => (
          <div key={i} className="glass-card p-3 relative overflow-hidden flex flex-col justify-between">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-[9px] font-extrabold uppercase truncate max-w-[100px]">{kpi.label}</span>
              <span className={`text-${kpi.color}-600`}>{kpi.icon}</span>
            </div>
            <div>
              <div className="text-lg font-bold font-display text-slate-900 mt-1">{kpi.val}</div>
              <div className="text-[9px] text-slate-500 font-semibold">{kpi.sub}</div>
            </div>
            <div className="text-[9px] text-slate-400 border-t pt-1 mt-2 flex justify-between items-center">
              <span>{kpi.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ZONE 2: LIVE CARDIO-TOCOGRAPHY (CTG) VIEWER */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <div>
            <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2">
              <Monitor size={16} className="text-rose-600 animate-pulse" /> Live Cardiotocography (CTG) Real-time Monitor
            </h3>
            <p className="text-xs text-slate-450">Active Patient: <span className="font-bold text-slate-800">{selectedPatient.name}</span> ({selectedPatient.gestation}) · Fetal Sensor Signal: Optimal</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-xl">
              <Volume2 size={14} className="text-slate-500" />
              <span className="font-semibold text-slate-700">Fetal Heart Beat Sound: Active</span>
            </div>
            <div className="flex gap-1.5">
              {patients.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPatient(p)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    selectedPatient.id === p.id ? 'bg-rose-50 border border-rose-200 text-rose-900' : 'bg-slate-50 border hover:bg-slate-100 text-slate-650'
                  }`}
                >
                  {p.room} ({p.name})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dual CTG Waveforms (FHR top, Contractions bottom) */}
        <div className="grid grid-cols-1 gap-4">
          {/* Waveform 1: Fetal Heart Rate (FHR) Line Chart */}
          <div className="p-3 bg-slate-50 rounded-xl space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Fetal Heart Rate Waveform (FHR - bpm)</span>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selectedPatient.ctgData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#94a3b8' }} />
                  <YAxis domain={[90, 180]} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="fhrValue" stroke="#e11d48" strokeWidth={2} dot={false} name="FHR Vitals" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Waveform 2: Tocodynamometer Contraction Waveform */}
          <div className="p-3 bg-slate-50 rounded-xl space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Tocodynamometer Maternal Contraction Waveform (TOCO - mmHg)</span>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={selectedPatient.ctgData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorToco" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d97706" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#d97706" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#94a3b8' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="tocoValue" stroke="#d97706" strokeWidth={2} fillOpacity={1} fill="url(#colorToco)" name="TOCO Contractions" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* ZONE 3: ACTIVE PATIENT LIST (EXPANDABLE GRID) */}
      <div className="glass-card p-5 space-y-3">
        <h3 className="font-display font-bold text-slate-800 text-sm border-b pb-2">Active Labor & Delivery Room Registry</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b text-slate-400 font-semibold">
                <th className="pb-2">Room</th>
                <th className="pb-2">Patient</th>
                <th className="pb-2">Gestational Age</th>
                <th className="pb-2">Risk Level</th>
                <th className="pb-2">Baseline FHR</th>
                <th className="pb-2">Contractions</th>
                <th className="pb-2">Blood Pressure</th>
                <th className="pb-2">Attending OB</th>
                <th className="pb-2">Delivery Status</th>
                <th className="pb-2">Expand Details</th>
              </tr>
            </thead>
            <tbody className="divide-y text-slate-700 font-medium">
              {patients.map(p => (
                <React.Fragment key={p.id}>
                  <tr
                    onClick={() => setSelectedPatient(p)}
                    className={`cursor-pointer transition-all ${
                      selectedPatient.id === p.id ? 'bg-primary-50/50' : 'hover:bg-slate-50/50'
                    }`}
                  >
                    <td className="py-3 font-bold text-slate-800">{p.room}</td>
                    <td className="font-bold text-slate-900">{p.name}</td>
                    <td>{p.gestation}</td>
                    <td>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.riskLevel === 'Critical' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>{p.riskLevel}</span>
                    </td>
                    <td>{p.fhr} bpm</td>
                    <td>{p.contractions}</td>
                    <td>{p.bp}</td>
                    <td>{p.obGyn}</td>
                    <td>
                      <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold ${
                        p.deliveryStatus.includes('Emergency') ? 'bg-rose-100 text-rose-800 animate-pulse' : 'bg-slate-100 text-slate-700'
                      }`}>{p.deliveryStatus}</span>
                    </td>
                    <td>
                      <button onClick={(e) => { e.stopPropagation(); toggleRow(p.id); }} className="text-slate-400 hover:text-slate-700">
                        <ChevronRight size={16} className={`transform transition-all ${expandedRows.has(p.id) ? 'rotate-90' : ''}`} />
                      </button>
                    </td>
                  </tr>

                  {/* Expandable row content */}
                  {expandedRows.has(p.id) && (
                    <tr>
                      <td colSpan={10} className="bg-slate-50/40 p-4 border-b">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold text-slate-700">
                          <div><span className="text-slate-400 block">Maternal Gravida/Para:</span>{p.gravidaPara}</div>
                          <div><span className="text-slate-400 block">Dilation / Effacement:</span>{p.progress.dilation}cm / {p.progress.effacement}%</div>
                          <div><span className="text-slate-400 block">Fetal Station / Position:</span>{p.progress.station} station</div>
                          <div><span className="text-slate-400 block">Active Infusion:</span>{p.progress.oxytocin}</div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Grid: Labor Progress (Zone 4) & Summary (Zone 5) & AI Clinical Obstetric (Zone 6) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Labor Progress Panel (Zone 4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-5 space-y-4">
            <h3 className="font-display font-bold text-slate-800 text-sm border-b pb-2 flex items-center gap-1.5">
              <Clock size={16} className="text-teal-600" /> Labour Dilation Progress Timeline
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 border rounded-xl flex justify-between items-center font-bold text-slate-800">
                <div>
                  <span>Cervical Dilation: <span className="text-teal-600">{selectedPatient.progress.dilation} cm</span></span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Active stage (Phase 1)</span>
                </div>
                <span className="text-xs bg-teal-150 px-2 py-0.5 rounded text-teal-800">{selectedPatient.progress.effacement}% Effaced</span>
              </div>

              <div className="p-3 bg-slate-50 border rounded-xl font-bold text-slate-800 text-[11px] space-y-2">
                <span className="text-slate-400 block uppercase text-[9px] font-extrabold">Infusions & Analgesia Log</span>
                <div className="flex justify-between">
                  <span>Oxytocin (Pitocin):</span>
                  <span className="text-primary-600">{selectedPatient.progress.oxytocin}</span>
                </div>
                <div className="flex justify-between">
                  <span>Anesthetic / Analgesia:</span>
                  <span className="text-teal-600">{selectedPatient.progress.analgesia}</span>
                </div>
              </div>

              {/* Progress curve timeline */}
              <div className="pt-2 border-t text-[11px] text-slate-600 pl-4 border-l-2 border-slate-200 space-y-2">
                {selectedPatient.timeline.map((evt, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-teal-500 border-2 border-white" />
                    <span className="font-bold text-slate-800">{evt.event}</span> · {evt.time}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Maternal Clinical Summary (Zone 5) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-5 space-y-4">
            <h3 className="font-display font-bold text-slate-800 text-sm border-b pb-2">Maternal Clinical Summary</h3>
            <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
              <div>
                <span className="text-slate-400 block">Obstetric History</span>
                <span className="text-slate-800">{selectedPatient.gravidaPara} (G/P)</span>
              </div>
              <div>
                <span className="text-slate-400 block">Membrane Status</span>
                <span className="text-slate-800">{selectedPatient.progress.membrane}</span>
              </div>
              <div className="col-span-2 border-t pt-2 mt-1">
                <span className="text-rose-600 block text-[9px] font-extrabold uppercase">Laboratory range check results</span>
                <div className="grid grid-cols-2 gap-2 mt-1.5">
                  <div className="p-2 bg-slate-50 border rounded-lg">
                    <span className="text-[10px] text-slate-400 block">Urine Protein</span>
                    <span className="font-extrabold text-slate-800">{selectedPatient.labs.protein}</span>
                  </div>
                  <div className="p-2 bg-slate-50 border rounded-lg">
                    <span className="text-[10px] text-slate-400 block">Platelets Count</span>
                    <span className="font-extrabold text-slate-800">{selectedPatient.labs.platelets}</span>
                  </div>
                  <div className="p-2 bg-slate-50 border rounded-lg">
                    <span className="text-[10px] text-slate-400 block">ALT / AST</span>
                    <span className="font-extrabold text-slate-800">{selectedPatient.labs.alt} / {selectedPatient.labs.ast}</span>
                  </div>
                  <div className="p-2 bg-slate-50 border rounded-lg">
                    <span className="text-[10px] text-slate-400 block">Serum Creatinine</span>
                    <span className="font-extrabold text-slate-800">{selectedPatient.labs.cr}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Obstetric Assistant (Zone 6) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-5 bg-gradient-to-br from-rose-50/30 to-amber-50/20 border-rose-100 space-y-4">
            <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2 border-b pb-2">
              <Brain size={16} className="text-rose-600 animate-pulse" /> AI Clinical Obstetric Assistant
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-white border border-rose-100 rounded-xl space-y-1 shadow-xs">
                <span className="text-[9px] font-extrabold text-rose-600 uppercase">CTG Interpretation Feed</span>
                <p className="font-bold text-slate-800 leading-normal">
                  Category II Non-Reassuring FHR waveform. Variable deceleration event registered at 15-minute log check.
                </p>
              </div>

              <div className="p-3 bg-white border border-rose-100 rounded-xl space-y-1 shadow-xs">
                <span className="text-[9px] font-extrabold text-rose-600 uppercase">Preeclampsia Alert</span>
                <p className="font-bold text-slate-800 leading-normal text-rose-700">
                  Urine Protein 2+ and Severe BP 148/92 indicates early signs of preeclampsia.
                </p>
                <p className="text-[10px] text-slate-450">Recommendation: Initiate Magnesium Sulfate bolus validation check.</p>
              </div>

              <div className="p-3 bg-white border rounded-xl flex justify-between items-center text-[11px] font-semibold text-slate-700">
                <span>AI Clinical Confidence Score:</span>
                <span className="text-rose-600 font-extrabold">95% Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* L&D Unit Alert Center (Zone 8) */}
      <div className="glass-card p-5 space-y-3">
        <h3 className="font-display font-bold text-slate-800 text-sm border-b pb-2 flex items-center gap-2">
          <AlertTriangle size={16} className="text-rose-600 animate-pulse" /> Critical Obstetrical Alerts Log
        </h3>
        <div className="space-y-2 text-xs">
          {[
            { alert: 'Late Deceleration registered in room 202', type: 'Fetal Distress', severity: 'rose', time: '1m ago' },
            { alert: 'Maternal Blood Pressure spike: 148/92 mmHg', type: 'Hypertension Alert', severity: 'rose', time: '4m ago' },
            { alert: 'Epidural infusion rate validation required', type: 'Anesthesia check', severity: 'amber', time: '12m ago' }
          ].map((item, idx) => (
            <div key={idx} className={`p-3 rounded-xl border flex justify-between items-center ${
              item.severity === 'rose' ? 'bg-rose-50 border-rose-250 text-rose-900' : 'bg-amber-50 border-amber-250 text-amber-900'
            }`}>
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} className="shrink-0" />
                <span className="font-bold">{item.alert} ({item.type})</span>
              </div>
              <span className="text-[10px] opacity-70 font-mono">{item.time}</span>
            </div>
          ))}
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
                    <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                      <Baby size={18} />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-slate-900 text-sm">L&D Care Copilot</h3>
                      <p className="text-[10px] text-slate-400">Philips IntelliSpace Obstetrical Database</p>
                    </div>
                  </div>
                  <button onClick={() => setDrawerOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                    <X size={18} />
                  </button>
                </div>

                <div className="mt-4 space-y-3 text-xs">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Obstetric Queries</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Explain current CTG deceleration trend',
                      'Generate obstetric summary note',
                      'Magnesium sulfate dosing criteria',
                      'Predict delivery timeline curve'
                    ].map(q => (
                      <button
                        key={q}
                        onClick={() => askAiObstetrician(q)}
                        className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-lg text-left text-[11px] font-medium transition-all"
                      >
                        {q}
                      </button>
                    ))}
                  </div>

                  {aiLoading && (
                    <div className="p-4 bg-slate-50 border rounded-xl flex items-center gap-2 text-xs text-slate-500">
                      <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
                      Analyzing fetal decel graphs...
                    </div>
                  )}

                  {aiResponse && !aiLoading && (
                    <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-xl space-y-2 text-xs">
                      <span className="font-bold text-rose-900 block">AI Clinical Response:</span>
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
                    onKeyDown={e => e.key === 'Enter' && askAiObstetrician()}
                    placeholder="Ask L&D AI about FHR, TOCO, preeclampsia..."
                    className="input-field text-xs flex-1"
                  />
                  <button onClick={() => askAiObstetrician()} disabled={aiLoading || !aiPrompt.trim()} className="btn-primary text-xs px-3 bg-rose-600 hover:bg-rose-500 border-none">
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

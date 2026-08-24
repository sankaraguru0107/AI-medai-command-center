import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Monitor, Video, ShieldAlert, CheckCircle, Volume2, Eye,
  Radio, Zap, AlertTriangle, Play, Pause, Maximize2, Camera,
  Moon, Sun, ZoomIn, ZoomOut, PhoneCall, Mic, Sparkles, X,
  ShieldCheck, HeartPulse, User, RefreshCw, Send, Check
} from 'lucide-react';
import { MetricCard } from '../common/MetricCard';

export interface MonitoredPatient {
  id: string;
  room: string;
  patient: string;
  age: number;
  fallRiskScore: number; // Morse Scale (0-100)
  fallRiskLevel: 'High' | 'Moderate' | 'Low';
  poseStatus: 'Supine in Bed' | 'Sitting on Edge' | 'Reaching for Items' | 'Out of Bed Triggered';
  linePullingRisk: boolean;
  agitationScore: 'Low' | 'Moderate' | 'High';
  nightVision: boolean;
  vitals: { hr: number; spo2: number; resp: number; bp: string };
  assignedObserver: string;
  lastMovement: string;
}

const mockFeeds: MonitoredPatient[] = [
  {
    id: 'vc-1',
    room: 'Room 101',
    patient: 'James Wilson',
    age: 68,
    fallRiskScore: 75,
    fallRiskLevel: 'High',
    poseStatus: 'Sitting on Edge',
    linePullingRisk: false,
    agitationScore: 'Moderate',
    nightVision: false,
    vitals: { hr: 84, spo2: 96, resp: 18, bp: '132/84' },
    assignedObserver: 'Virtual RN Elena',
    lastMovement: '12s ago',
  },
  {
    id: 'vc-2',
    room: 'Room 102',
    patient: 'Sarah Chen',
    age: 45,
    fallRiskScore: 40,
    fallRiskLevel: 'Moderate',
    poseStatus: 'Supine in Bed',
    linePullingRisk: false,
    agitationScore: 'Low',
    nightVision: true,
    vitals: { hr: 72, spo2: 98, resp: 16, bp: '118/76' },
    assignedObserver: 'Virtual RN Elena',
    lastMovement: '2m ago',
  },
  {
    id: 'vc-3',
    room: 'Room 103',
    patient: 'Robert Kim',
    age: 59,
    fallRiskScore: 85,
    fallRiskLevel: 'High',
    poseStatus: 'Reaching for Items',
    linePullingRisk: true,
    agitationScore: 'High',
    nightVision: false,
    vitals: { hr: 96, spo2: 94, resp: 22, bp: '148/92' },
    assignedObserver: 'Virtual RN Carlos',
    lastMovement: '5s ago',
  },
  {
    id: 'vc-4',
    room: 'Room 204',
    patient: 'Maria Rivera',
    age: 74,
    fallRiskScore: 65,
    fallRiskLevel: 'High',
    poseStatus: 'Supine in Bed',
    linePullingRisk: false,
    agitationScore: 'Low',
    nightVision: false,
    vitals: { hr: 68, spo2: 97, resp: 14, bp: '126/80' },
    assignedObserver: 'Virtual RN Carlos',
    lastMovement: '45s ago',
  },
  {
    id: 'vc-5',
    room: 'Room 208',
    patient: 'Anthony Rossi',
    age: 61,
    fallRiskScore: 35,
    fallRiskLevel: 'Moderate',
    poseStatus: 'Supine in Bed',
    linePullingRisk: false,
    agitationScore: 'Low',
    nightVision: true,
    vitals: { hr: 74, spo2: 99, resp: 15, bp: '120/78' },
    assignedObserver: 'Virtual RN Maya',
    lastMovement: '1m ago',
  },
  {
    id: 'vc-6',
    room: 'Room 310',
    patient: 'Diana Lee',
    age: 82,
    fallRiskScore: 90,
    fallRiskLevel: 'High',
    poseStatus: 'Sitting on Edge',
    linePullingRisk: true,
    agitationScore: 'Moderate',
    nightVision: false,
    vitals: { hr: 88, spo2: 95, resp: 20, bp: '138/86' },
    assignedObserver: 'Virtual RN Maya',
    lastMovement: '8s ago',
  },
];

export const VirtualCareModule: React.FC = () => {
  const [patients, setPatients] = useState<MonitoredPatient[]>(mockFeeds);
  const [gridMode, setGridMode] = useState<'4' | '6' | 'single'>('6');
  const [activePatient, setActivePatient] = useState<MonitoredPatient>(mockFeeds[0]);
  const [filterType, setFilterType] = useState<string>('all');
  const [ptzZoom, setPtzZoom] = useState<number>(1);
  const [ptzPan, setPtzPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [verbalPromptSent, setVerbalPromptSent] = useState<string | null>(null);
  const [snapshotTaken, setSnapshotTaken] = useState<boolean>(false);
  const [isIntercomActive, setIsIntercomActive] = useState<boolean>(false);

  // Toggle Night Vision (Infrared)
  const toggleNightVision = (id: string) => {
    setPatients(prev =>
      prev.map(p => (p.id === id ? { ...p, nightVision: !p.nightVision } : p))
    );
  };

  // Trigger In-Room Deterrent Speaker
  const handleTriggerVerbalDeterrent = (message: string) => {
    setVerbalPromptSent(message);
    setTimeout(() => setVerbalPromptSent(null), 3500);
  };

  const handleTakeSnapshot = () => {
    setSnapshotTaken(true);
    setTimeout(() => setSnapshotTaken(false), 800);
  };

  const filteredPatients = patients.filter(p => {
    if (filterType === 'high-risk') return p.fallRiskLevel === 'High';
    if (filterType === 'edge') return p.poseStatus.includes('Edge') || p.poseStatus.includes('Out');
    if (filterType === 'lines') return p.linePullingRisk;
    return true;
  });

  const highRiskCount = patients.filter(p => p.fallRiskLevel === 'High').length;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1700px] mx-auto min-h-screen text-slate-800">
      {/* MODULE HEADER & COMMAND BAR */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5 bg-gradient-to-r from-white via-slate-50 to-primary-50/20 border-slate-200/90 shadow-glass"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-900 via-primary-900 to-primary-700 flex items-center justify-center text-white shadow-md shadow-primary-900/20">
              <Monitor size={24} className="text-primary-300" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-display text-2xl font-extrabold text-slate-900 tracking-tight">
                  Virtual Care & Tele-Sitter Remote Observation
                </h1>
                <span className="badge-success text-xs font-bold">
                  <Eye size={13} />
                  24/7 AI COMPUTER VISION ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Multi-camera tele-sitter matrix, automated bed-exit boundary detection, line pulling alerts, and 2-way audio broadcast.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            {/* Filter */}
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold shadow-xs"
            >
              <option value="all">All Cameras ({patients.length})</option>
              <option value="high-risk">High Fall Risk Only ({highRiskCount})</option>
              <option value="edge">Sitting on Bed Edge</option>
              <option value="lines">Line Pulling Risk</option>
            </select>

            {/* Grid layout selector */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setGridMode('6')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${gridMode === '6' ? 'bg-white shadow-xs text-primary-600' : 'text-slate-600'}`}
              >
                6-Grid
              </button>
              <button
                onClick={() => setGridMode('4')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${gridMode === '4' ? 'bg-white shadow-xs text-primary-600' : 'text-slate-600'}`}
              >
                4-Grid
              </button>
              <button
                onClick={() => setGridMode('single')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${gridMode === 'single' ? 'bg-white shadow-xs text-primary-600' : 'text-slate-600'}`}
              >
                Focus Zoom
              </button>
            </div>
          </div>
        </div>

        {/* Telemetry Strip */}
        <div className="mt-4 pt-3.5 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-slate-200/70 shadow-xs">
            <Monitor size={18} className="text-primary-600" />
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Observed Rooms</div>
              <div className="text-base font-extrabold text-slate-900">{patients.length} Live Feeds</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-slate-200/70 shadow-xs">
            <ShieldAlert size={18} className="text-emerald-600" />
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Fall Prevention</div>
              <div className="text-base font-extrabold text-emerald-700">100% (0 Falls)</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-slate-200/70 shadow-xs">
            <Eye size={18} className="text-teal-600" />
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Virtual RN Observers</div>
              <div className="text-base font-extrabold text-teal-700">3 Dedicated RNs</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-slate-200/70 shadow-xs">
            <Radio size={18} className="text-rose-600" />
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Stream Latency</div>
              <div className="text-base font-extrabold text-rose-700">34ms (HD 1080p)</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* VERBAL PROMPT NOTIFICATION POPUP */}
      <AnimatePresence>
        {verbalPromptSent && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-3.5 rounded-2xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-between shadow-xl"
          >
            <div className="flex items-center gap-2">
              <Volume2 size={18} className="animate-pulse" />
              <span>In-Room Speaker Broadcast Transmitted: "{verbalPromptSent}"</span>
            </div>
            <span className="text-[10px] bg-emerald-800 px-2 py-0.5 rounded font-mono">Delivered (40ms)</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CAMERA GRID / FOCUS LAYOUT */}
      {gridMode === 'single' ? (
        /* SINGLE FOCUS ZOOM VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Large Feed */}
          <div className="lg:col-span-8 space-y-4">
            <div className="glass-card-dark p-4 bg-slate-950 text-white border-slate-800 rounded-3xl relative overflow-hidden shadow-2xl">
              {/* Snapshot Flash Overlay */}
              {snapshotTaken && (
                <div className="absolute inset-0 bg-white z-50 animate-ping opacity-70 pointer-events-none" />
              )}

              {/* Top Video Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="font-display font-extrabold text-base text-slate-100">
                    {activePatient.room} — {activePatient.patient} ({activePatient.age}y)
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                    activePatient.fallRiskLevel === 'High' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    Morse Fall Score: {activePatient.fallRiskScore}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> LIVE HD
                  </span>
                  <button
                    onClick={() => toggleNightVision(activePatient.id)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300"
                    title="Toggle Infrared Night Vision"
                  >
                    {activePatient.nightVision ? <Sun size={14} /> : <Moon size={14} />}
                  </button>
                </div>
              </div>

              {/* Video Surface Simulator */}
              <div className={`relative h-96 my-3 rounded-2xl flex items-center justify-center border border-slate-800 overflow-hidden ${
                activePatient.nightVision ? 'bg-emerald-950/40' : 'bg-slate-900'
              }`}>
                {/* Visual Grid Lines / Room Boundary */}
                <div className="absolute inset-0 border-2 border-dashed border-emerald-500/30 rounded-2xl m-6 pointer-events-none flex items-center justify-center">
                  <span className="absolute top-2 left-2 text-[10px] font-mono text-emerald-400/60 uppercase">
                    AI Bed Safety Boundary (Geofence Active)
                  </span>
                </div>

                {/* AI Skeleton / Pose Recognition Box */}
                <div className={`p-4 rounded-xl border-2 backdrop-blur-xs flex flex-col items-center justify-center transition-all ${
                  activePatient.poseStatus.includes('Edge')
                    ? 'border-rose-500 bg-rose-950/30 text-rose-300 animate-pulse'
                    : 'border-emerald-500/60 bg-emerald-950/20 text-emerald-300'
                }`}>
                  <User size={48} className="mb-2 opacity-80" />
                  <span className="text-xs font-bold font-mono uppercase">{activePatient.poseStatus}</span>
                  <span className="text-[10px] opacity-75">Motion Confidence: 99.4%</span>
                </div>

                {/* Night vision grain overlay */}
                {activePatient.nightVision && (
                  <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />
                )}

                {/* Continuous Vitals Telemetry HUD */}
                <div className="absolute bottom-3 left-3 right-3 p-3 bg-slate-950/90 backdrop-blur-md rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 text-rose-400">
                      <HeartPulse size={14} /> HR: <strong className="text-white">{activePatient.vitals.hr}</strong> bpm
                    </span>
                    <span className="text-sky-400">
                      SpO2: <strong className="text-white">{activePatient.vitals.spo2}%</strong>
                    </span>
                    <span className="text-teal-400">
                      Resp: <strong className="text-white">{activePatient.vitals.resp}/m</strong>
                    </span>
                    <span className="text-slate-300">
                      BP: <strong className="text-white">{activePatient.vitals.bp}</strong>
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-400">Observer: {activePatient.assignedObserver}</span>
                </div>
              </div>

              {/* PTZ & Video Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTakeSnapshot}
                    className="btn-secondary text-xs py-1.5 px-3 bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
                  >
                    <Camera size={14} /> Snapshot
                  </button>
                  <button
                    onClick={() => setPtzZoom(prev => Math.min(3, prev + 0.5))}
                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 text-xs"
                    title="Zoom In"
                  >
                    <ZoomIn size={14} />
                  </button>
                  <button
                    onClick={() => setPtzZoom(prev => Math.max(1, prev - 0.5))}
                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 text-xs"
                    title="Zoom Out"
                  >
                    <ZoomOut size={14} />
                  </button>
                  <span className="text-xs font-mono text-slate-400">Zoom: {ptzZoom}x</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTriggerVerbalDeterrent("Patient Wilson, please stay in bed, your nurse is entering room 101 now.")}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20"
                  >
                    <Volume2 size={14} />
                    <span>Play Bed Exit Deterrent</span>
                  </button>
                  <button
                    onClick={() => handleTriggerVerbalDeterrent("Please keep your hands resting, IV lines must stay in place.")}
                    className="px-3 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    <Volume2 size={14} />
                    <span>Line Warning</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: High Risk Roster */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
              <ShieldAlert size={16} className="text-rose-600" />
              Observed Patients Roster ({patients.length})
            </h3>

            <div className="space-y-2">
              {patients.map(p => (
                <div
                  key={p.id}
                  onClick={() => setActivePatient(p)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    activePatient.id === p.id
                      ? 'bg-primary-50 border-primary-300 ring-2 ring-primary-500/20 shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <strong className="text-slate-900">{p.room} — {p.patient}</strong>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                      p.fallRiskLevel === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      Morse {p.fallRiskScore}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Status: <strong className={p.poseStatus.includes('Edge') ? 'text-rose-600' : 'text-slate-700'}>{p.poseStatus}</strong></span>
                    <span>{p.lastMovement}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* MULTI-CAMERA MATRIX (4-UP OR 6-UP GRID) */
        <div className={`grid gap-4 ${
          gridMode === '4'
            ? 'grid-cols-1 md:grid-cols-2'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}>
          {filteredPatients.map(patient => {
            const isHighRisk = patient.fallRiskLevel === 'High';
            const isEdgeAlert = patient.poseStatus.includes('Edge') || patient.poseStatus.includes('Out');

            return (
              <motion.div
                key={patient.id}
                whileHover={{ y: -3 }}
                className={`glass-card-dark p-4 bg-slate-950 text-white border rounded-2xl relative overflow-hidden transition-all shadow-lg ${
                  isEdgeAlert
                    ? 'border-rose-500 ring-2 ring-rose-500/40'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-100">{patient.room}</span>
                    <span className="text-slate-400">({patient.patient})</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> LIVE HD
                  </span>
                </div>

                {/* Video Window */}
                <div className={`relative h-48 my-2.5 rounded-xl border flex flex-col items-center justify-center overflow-hidden ${
                  patient.nightVision ? 'bg-emerald-950/40 border-emerald-900' : 'bg-slate-900 border-slate-800'
                }`}>
                  {/* Bed Perimeter Box */}
                  <div className="absolute inset-2 border border-dashed border-emerald-500/30 rounded-lg pointer-events-none" />

                  {/* AI Motion Center Box */}
                  <div className={`p-3 rounded-xl border flex flex-col items-center justify-center ${
                    isEdgeAlert
                      ? 'border-rose-500 bg-rose-950/40 text-rose-300 animate-pulse'
                      : 'border-slate-700 bg-slate-950/30 text-slate-300'
                  }`}>
                    <User size={32} className="mb-1 opacity-80" />
                    <span className="text-[11px] font-bold font-mono">{patient.poseStatus}</span>
                  </div>

                  {/* Line pulling warning badge */}
                  {patient.linePullingRisk && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-rose-600 text-white text-[9px] font-extrabold animate-pulse">
                      LINE RISK
                    </div>
                  )}

                  {/* Vitals HUD */}
                  <div className="absolute bottom-1.5 left-2 right-2 p-1.5 bg-slate-950/90 rounded-lg border border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-rose-400">HR: <strong>{patient.vitals.hr}</strong></span>
                    <span className="text-sky-400">SpO2: <strong>{patient.vitals.spo2}%</strong></span>
                    <span className="text-slate-400">{patient.lastMovement}</span>
                  </div>
                </div>

                {/* Bottom Controls */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    onClick={() => { setActivePatient(patient); setGridMode('single'); }}
                    className="text-primary-400 hover:text-primary-300 font-bold text-[11px] flex items-center gap-1"
                  >
                    <Maximize2 size={12} /> Focus Room
                  </button>

                  <button
                    onClick={() => handleTriggerVerbalDeterrent(`Patient ${patient.patient.split(' ')[1]}, please remain seated in bed.`)}
                    className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 rounded-lg font-bold text-[10px] flex items-center gap-1"
                  >
                    <Volume2 size={11} /> Speak to Room
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

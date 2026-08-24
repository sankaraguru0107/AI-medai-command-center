import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, Bell, PhoneCall, CheckCircle, AlertTriangle, ShieldAlert, ShieldCheck,
  UserCheck, Volume2, VolumeX, Radio, PhoneIncoming, Users, Clock,
  Mic, MicOff, Send, Sparkles, ChevronRight, X, Flame, Shield, ArrowUpRight
} from 'lucide-react';
import { MetricCard } from '../common/MetricCard';

export type CallPriority = 'Code Blue (Emergency)' | 'Rapid Response' | 'Fall Risk Alarm' | 'IV Pump / Clinical' | 'Urgent Assistance' | 'Standard Service';

export interface NurseCallItem {
  id: string;
  room: string;
  patient: string;
  age: number;
  acuity: string;
  priority: CallPriority;
  reason: string;
  elapsedSeconds: number;
  assignedNurse: string;
  source: 'Bedside Pillow Speaker' | 'Bathroom Pullcord' | 'AI Bed Exit Sensor' | 'IV Telemetry Pump';
  vitals?: { hr: number; spo2: number; bp: string };
  audioActive?: boolean;
}

const initialCalls: NurseCallItem[] = [
  {
    id: 'nc-1',
    room: 'ICU Bed 04',
    patient: 'James Wilson',
    age: 68,
    acuity: 'Critical',
    priority: 'Code Blue (Emergency)',
    reason: 'Sudden desaturation (SpO2 84%) & Vent Alarm',
    elapsedSeconds: 24,
    assignedNurse: 'Unassigned',
    source: 'Bedside Pillow Speaker',
    vitals: { hr: 138, spo2: 84, bp: '82/50' },
  },
  {
    id: 'nc-2',
    room: 'Room 206 (4A)',
    patient: 'Sarah Chen',
    age: 45,
    acuity: 'Moderate',
    priority: 'Fall Risk Alarm',
    reason: 'Smart Bed sensor tripped — patient attempting unassisted bed exit',
    elapsedSeconds: 48,
    assignedNurse: 'RN Sarah Jenkins',
    source: 'AI Bed Exit Sensor',
    vitals: { hr: 88, spo2: 98, bp: '124/78' },
  },
  {
    id: 'nc-3',
    room: 'Room 312 (4B)',
    patient: 'Robert Kim',
    age: 59,
    acuity: 'Step-down',
    priority: 'IV Pump / Clinical',
    reason: 'Channel A Occlusion — Heparin infusion paused',
    elapsedSeconds: 110,
    assignedNurse: 'RN David Vance',
    source: 'IV Telemetry Pump',
    vitals: { hr: 76, spo2: 97, bp: '130/82' },
  },
  {
    id: 'nc-4',
    room: 'Room 108 (4A)',
    patient: 'Maria Rivera',
    age: 74,
    acuity: 'Moderate',
    priority: 'Urgent Assistance',
    reason: 'Bathroom assistance requested — Fall precaution protocol',
    elapsedSeconds: 180,
    assignedNurse: 'Unassigned',
    source: 'Bathroom Pullcord',
    vitals: { hr: 72, spo2: 99, bp: '118/74' },
  },
];

const nurseStaffList = [
  { name: 'RN Sarah Jenkins', role: 'Charge Nurse', zone: 'Floor 4 East', status: 'In Room 206', load: 3 },
  { name: 'RN David Vance', role: 'Staff RN', zone: 'Floor 4 West', status: 'Available', load: 2 },
  { name: 'RN Maya Lin', role: 'Critical Care RN', zone: 'Medical ICU', status: 'Available', load: 1 },
  { name: 'RN Carlos Cruz', role: 'Staff RN', zone: 'Floor 4 East', status: 'Available', load: 2 },
  { name: 'PCA Priya Patel', role: 'Patient Care Tech', zone: 'Floor 4 (All)', status: 'Available', load: 4 },
];

export const NurseCallModule: React.FC = () => {
  const [calls, setCalls] = useState<NurseCallItem[]>(initialCalls);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [audioModalCall, setAudioModalCall] = useState<NurseCallItem | null>(null);
  const [isTalking, setIsTalking] = useState<boolean>(false);
  const [dispatchModalCall, setDispatchModalCall] = useState<NurseCallItem | null>(null);
  const [resolvedLog, setResolvedLog] = useState<{ room: string; patient: string; duration: string; time: string }[]>([
    { room: 'Room 204', patient: 'L. Park', duration: '45s', time: '10:42 AM' },
    { room: 'Room 310', patient: 'D. Lee', duration: '1m 12s', time: '10:35 AM' },
  ]);

  // Live timer tick
  useEffect(() => {
    const interval = setInterval(() => {
      setCalls(prev =>
        prev.map(c => ({
          ...c,
          elapsedSeconds: c.elapsedSeconds + 1,
        }))
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatElapsed = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return mins > 0 ? `${mins}m ${s}s` : `${s}s`;
  };

  const handleResolveCall = (id: string) => {
    const callToResolve = calls.find(c => c.id === id);
    if (callToResolve) {
      setResolvedLog(prev => [
        {
          room: callToResolve.room,
          patient: callToResolve.patient,
          duration: formatElapsed(callToResolve.elapsedSeconds),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        ...prev.slice(0, 9),
      ]);
    }
    setCalls(prev => prev.filter(c => c.id !== id));
  };

  const handleEscalateCall = (id: string) => {
    setCalls(prev =>
      prev.map(c =>
        c.id === id
          ? {
              ...c,
              priority: 'Code Blue (Emergency)',
              reason: `[ESCALATED CODE BLUE] ${c.reason}`,
              assignedNurse: 'Rapid Response Team (Paging All)',
            }
          : c
      )
    );
  };

  const handleAssignNurse = (nurseName: string) => {
    if (!dispatchModalCall) return;
    setCalls(prev =>
      prev.map(c =>
        c.id === dispatchModalCall.id
          ? {
              ...c,
              assignedNurse: nurseName,
            }
          : c
      )
    );
    setDispatchModalCall(null);
  };

  const filteredCalls = calls.filter(c => {
    if (selectedFilter === 'emergency') return c.priority.includes('Code Blue') || c.priority.includes('Rapid');
    if (selectedFilter === 'fall') return c.priority.includes('Fall');
    if (selectedFilter === 'clinical') return c.priority.includes('IV Pump');
    return true;
  });

  const emergencyCount = calls.filter(c => c.priority.includes('Code Blue') || c.priority.includes('Rapid')).length;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1700px] mx-auto min-h-screen text-slate-800">
      {/* MODULE HEADER & DISPATCH STATUS */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5 bg-gradient-to-r from-white via-slate-50 to-rose-50/20 border-slate-200/90 shadow-glass"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 via-rose-700 to-amber-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
                <Bell size={24} className="animate-pulse" />
              </div>
              {emergencyCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-600 border-2 border-white text-[9px] font-extrabold text-white items-center justify-center">
                    {emergencyCount}
                  </span>
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-display text-2xl font-extrabold text-slate-900 tracking-tight">
                  Nurse Call & Room Triage Dispatch System
                </h1>
                {emergencyCount > 0 ? (
                  <span className="badge-danger text-xs font-bold animate-pulse">
                    <Flame size={13} />
                    {emergencyCount} ACTIVE EMERGENCY ALARM
                  </span>
                ) : (
                  <span className="badge-success text-xs font-bold">
                    <ShieldCheck size={13} />
                    ALL CALLS TRIAGED
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Real-time pillow speaker call buttons, bathroom telemetry pullcords, smart bed exit sensors, and 2-way room audio broadcast.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Audio Alert Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
                soundEnabled
                  ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
            >
              {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
              <span>{soundEnabled ? 'Audible Chimes Active' : 'Chimes Muted'}</span>
            </button>

            {/* Quick Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${selectedFilter === 'all' ? 'bg-white shadow-xs text-primary-600' : 'text-slate-600'}`}
              >
                All Queue ({calls.length})
              </button>
              <button
                onClick={() => setSelectedFilter('emergency')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${selectedFilter === 'emergency' ? 'bg-white shadow-xs text-rose-600' : 'text-slate-600'}`}
              >
                Emergencies ({emergencyCount})
              </button>
              <button
                onClick={() => setSelectedFilter('fall')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${selectedFilter === 'fall' ? 'bg-white shadow-xs text-amber-600' : 'text-slate-600'}`}
              >
                Fall Alarms
              </button>
            </div>
          </div>
        </div>

        {/* SLA & Telemetry KPI Strip */}
        <div className="mt-4 pt-3.5 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-slate-200/70 shadow-xs">
            <Bell size={18} className="text-rose-600" />
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Active Inpatient Calls</div>
              <div className="text-base font-extrabold text-slate-900">{calls.length} Pending</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-slate-200/70 shadow-xs">
            <PhoneCall size={18} className="text-primary-600" />
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Avg Response Time</div>
              <div className="text-base font-extrabold text-primary-700">1.1 Mins <span className="text-[10px] text-emerald-600 font-bold">(&lt;3m SLA)</span></div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-slate-200/70 shadow-xs">
            <UserCheck size={18} className="text-emerald-600" />
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Staff On Duty</div>
              <div className="text-base font-extrabold text-emerald-700">16 RNs / PCAs</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-slate-200/70 shadow-xs">
            <Radio size={18} className="text-teal-600" />
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">RF Pager & Intercom</div>
              <div className="text-base font-extrabold text-teal-700">100% Synced</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* LIVE INPATIENT CALL DISPATCH BOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Call Queue */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
              <PhoneIncoming size={18} className="text-rose-600" />
              Live Room Call Queue ({filteredCalls.length})
            </h2>
            <span className="text-xs text-slate-500 font-medium">Sorted by Acuity & Elapsed Time</span>
          </div>

          <div className="space-y-3.5">
            <AnimatePresence mode="popLayout">
              {filteredCalls.map(call => {
                const isEmergency = call.priority.includes('Code Blue') || call.priority.includes('Rapid');
                const isSlaBreached = call.elapsedSeconds > 180;

                return (
                  <motion.div
                    key={call.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`p-4 md:p-5 rounded-2xl border-2 transition-all shadow-sm relative overflow-hidden ${
                      isEmergency
                        ? 'bg-rose-50/90 border-rose-300 ring-2 ring-rose-400/50'
                        : call.priority.includes('Fall')
                        ? 'bg-amber-50/70 border-amber-300'
                        : 'bg-white border-slate-200/90 hover:border-slate-300'
                    }`}
                  >
                    {/* Pulsing emergency beacon on left edge */}
                    {isEmergency && (
                      <div className="absolute left-0 top-0 bottom-0 w-2 bg-rose-600 animate-pulse" />
                    )}

                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      {/* Left: Patient & Call Details */}
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-display font-extrabold text-base text-slate-900">
                            {call.room}
                          </span>
                          <span className="font-bold text-sm text-slate-700">
                            — {call.patient} ({call.age}y)
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                            isEmergency
                              ? 'bg-rose-600 text-white border-rose-700 animate-pulse shadow-xs'
                              : call.priority.includes('Fall')
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-sky-100 text-sky-900 border-sky-300'
                          }`}>
                            {call.priority}
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                          {call.reason}
                        </p>

                        {/* Telemetry info line */}
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                          <span className="flex items-center gap-1 font-mono">
                            <Clock size={12} className={isSlaBreached ? 'text-rose-600' : 'text-slate-400'} />
                            <strong className={isSlaBreached ? 'text-rose-600 font-extrabold' : 'text-slate-700'}>
                              {formatElapsed(call.elapsedSeconds)} elapsed
                            </strong>
                            {isSlaBreached && <span className="text-rose-600 font-bold">(SLA Warning)</span>}
                          </span>

                          <span>•</span>
                          <span>Source: <strong>{call.source}</strong></span>

                          {call.vitals && (
                            <>
                              <span>•</span>
                              <span className="text-slate-700">
                                HR: <strong>{call.vitals.hr}</strong> | SpO2: <strong className={call.vitals.spo2 < 90 ? 'text-rose-600' : ''}>{call.vitals.spo2}%</strong> | BP: <strong>{call.vitals.bp}</strong>
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Right: Dispatch State & Actions */}
                      <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-end md:items-end justify-between gap-2 shrink-0">
                        <div className="text-right text-xs">
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Assigned Staff</div>
                          <div className={`font-bold ${call.assignedNurse === 'Unassigned' ? 'text-rose-600 font-extrabold' : 'text-slate-800'}`}>
                            {call.assignedNurse}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 pt-1">
                          {/* 2-Way Audio Button */}
                          <button
                            onClick={() => setAudioModalCall(call)}
                            title="Connect 2-Way Room Audio Intercom"
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
                          >
                            <Volume2 size={14} className="text-primary-600" />
                            <span className="hidden sm:inline">Audio Intercom</span>
                          </button>

                          {/* Dispatch Modal Button */}
                          <button
                            onClick={() => setDispatchModalCall(call)}
                            className="p-2 bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
                          >
                            <Users size={14} />
                            <span>{call.assignedNurse === 'Unassigned' ? 'Dispatch' : 'Reassign'}</span>
                          </button>

                          {/* Escalate Code Button */}
                          {!isEmergency && (
                            <button
                              onClick={() => handleEscalateCall(call.id)}
                              title="Escalate to Code Blue / Rapid Response"
                              className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
                            >
                              <Flame size={14} />
                            </button>
                          )}

                          {/* Resolve Call */}
                          <button
                            onClick={() => handleResolveCall(call.id)}
                            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-all"
                          >
                            <CheckCircle size={14} />
                            <span>Resolve</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredCalls.length === 0 && (
              <div className="glass-card p-10 text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle size={24} />
                </div>
                <h3 className="font-display font-bold text-slate-800 text-sm">All Nurse Calls Resolved</h3>
                <p className="text-xs text-slate-400">All inpatient telemetry call buttons are currently nominal with zero wait backlog.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Staff Roster & Resolved History */}
        <div className="lg:col-span-4 space-y-5">
          {/* On-Duty Nursing Staff Roster */}
          <div className="glass-card p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
              <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2">
                <Users size={16} className="text-primary-600" />
                Floor 4 Staffing & Skill Mix
              </h3>
              <span className="badge-success text-[10px] font-bold">5 Active</span>
            </div>

            <div className="space-y-2">
              {nurseStaffList.map((nurse, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{nurse.name}</div>
                    <div className="text-[10px] text-slate-400">{nurse.role} · {nurse.zone}</div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      nurse.status === 'Available' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {nurse.status}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5">{nurse.load} Active Patients</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resolved Call Audit Log */}
          <div className="glass-card p-5 space-y-3">
            <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-200/80 pb-2.5">
              <Clock size={16} className="text-emerald-600" />
              Recent Call Resolutions (Audit Log)
            </h3>

            <div className="space-y-2 text-xs">
              {resolvedLog.map((log, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-50 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800">{log.room}</span> ({log.patient})
                    <div className="text-[10px] text-slate-400">Resolved at {log.time}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">
                    TAT: {log.duration}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2-WAY ROOM AUDIO INTERCOM MODAL */}
      <AnimatePresence>
        {audioModalCall && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 text-white rounded-3xl shadow-2xl border border-slate-800 max-w-md w-full p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-md">
                    <Volume2 size={20} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white text-base">2-Way Room Audio Broadcast</h3>
                    <p className="text-xs text-slate-400">{audioModalCall.room} — {audioModalCall.patient}</p>
                  </div>
                </div>
                <button onClick={() => setAudioModalCall(null)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-800">
                  <X size={18} />
                </button>
              </div>

              {/* Live Audio Waveform Simulation */}
              <div className="h-24 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center gap-1.5 px-6">
                {[40, 65, 30, 85, 95, 45, 70, 90, 60, 40, 75, 55, 35].map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${isTalking ? h : Math.max(15, h * 0.3)}%` }}
                    className={`w-2 rounded-full transition-all duration-150 ${isTalking ? 'bg-emerald-400 animate-pulse' : 'bg-slate-700'}`}
                  />
                ))}
              </div>

              {/* Push to Talk Controls */}
              <div className="text-center space-y-3">
                <button
                  onMouseDown={() => setIsTalking(true)}
                  onMouseUp={() => setIsTalking(false)}
                  onTouchStart={() => setIsTalking(true)}
                  onTouchEnd={() => setIsTalking(false)}
                  className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                    isTalking
                      ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/30 scale-95'
                      : 'bg-primary-600 hover:bg-primary-500 text-white shadow-primary-500/20'
                  }`}
                >
                  {isTalking ? <Mic size={18} /> : <MicOff size={18} />}
                  <span>{isTalking ? 'TRANSMITTING VOICE TO ROOM...' : 'HOLD TO TALK TO PATIENT'}</span>
                </button>

                <p className="text-[11px] text-slate-400">
                  Audio connects directly to the bedside pillow speaker unit.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DISPATCH NURSE MODAL */}
      <AnimatePresence>
        {dispatchModalCall && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-display font-bold text-slate-900 text-base">Dispatch Floor Staff</h3>
                  <p className="text-xs text-slate-400">Assign nurse to {dispatchModalCall.room} ({dispatchModalCall.patient})</p>
                </div>
                <button onClick={() => setDispatchModalCall(null)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-2">
                {nurseStaffList.map((nurse, i) => (
                  <button
                    key={i}
                    onClick={() => handleAssignNurse(nurse.name)}
                    className="w-full p-3 rounded-xl bg-slate-50 hover:bg-primary-50 hover:border-primary-300 border border-slate-200 text-left flex items-center justify-between transition-all group"
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900 group-hover:text-primary-700">{nurse.name}</div>
                      <div className="text-[10px] text-slate-400">{nurse.role} · {nurse.zone}</div>
                    </div>
                    <span className="btn-primary text-[10px] py-1 px-2.5">
                      Assign
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

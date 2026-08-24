import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Monitor, Bell, PhoneCall, Video, Check, AlertTriangle, UserCheck } from 'lucide-react';
import { MetricCard } from '../common/MetricCard';

interface NurseCall {
  id: string;
  room: string;
  patient: string;
  reason: string;
  priority: 'Emergency' | 'High' | 'Normal';
  timeElapsed: string;
  assignedNurse: string;
}

const mockCalls: NurseCall[] = [
  { id: '1', room: 'ICU-4B', patient: 'James Wilson', reason: 'Severe Chest Discomfort & Shortness of Breath', priority: 'Emergency', timeElapsed: '45s ago', assignedNurse: 'Nurse Sarah Jenkins' },
  { id: '2', room: 'Bed 6A', patient: 'Sarah Chen', reason: 'Medication Assistance Needed', priority: 'Normal', timeElapsed: '3m ago', assignedNurse: 'Nurse David Vance' },
  { id: '3', room: 'Bed 3D', patient: 'Robert Kim', reason: 'Pain Relief Request', priority: 'High', timeElapsed: '1m ago', assignedNurse: 'Unassigned' }
];

export const NurseCallVirtualCareModule: React.FC = () => {
  const [calls, setCalls] = useState(mockCalls);
  const [activeTab, setActiveTab] = useState<'nurse-call' | 'virtual-care'>('nurse-call');

  const acknowledgeCall = (id: string) => {
    setCalls(calls.filter(c => c.id !== id));
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
            Nurse Call & Virtual Care Operations <MessageCircle className="text-rose-500" />
          </h1>
          <p className="text-sm text-slate-500">Real-time room telemetry call system and 24/7 video virtual care monitoring.</p>
        </div>
        <div className="flex gap-1 bg-white p-1 rounded-xl shadow-xs border">
          <button
            onClick={() => setActiveTab('nurse-call')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'nurse-call' ? 'bg-rose-500 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Nurse Call Queue ({calls.length})
          </button>
          <button
            onClick={() => setActiveTab('virtual-care')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'virtual-care' ? 'bg-primary-600 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Virtual Care Cameras
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="Active Calls" value={`${calls.length}`} subtitle="Real-time triage" icon={<Bell size={16} />} color="rose" delay={0} />
        <MetricCard title="Avg Response Time" value="1.4 mins" subtitle="Under 3 min target" icon={<PhoneCall size={16} />} color="blue" delay={0.05} />
        <MetricCard title="Monitored Beds" value="32 Rooms" subtitle="100% HD telemetry" icon={<Monitor size={16} />} color="teal" delay={0.1} />
        <MetricCard title="Staff On Duty" value="14 Nurses" subtitle="Fully staffed" icon={<UserCheck size={16} />} color="amber" delay={0.15} />
      </div>

      {activeTab === 'nurse-call' ? (
        <div className="glass-card p-5 space-y-4">
          <h3 className="font-bold text-sm text-slate-800 border-b pb-2">Pending Nurse Calls</h3>
          <div className="space-y-3">
            {calls.map(call => (
              <div
                key={call.id}
                className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                  call.priority === 'Emergency' ? 'bg-rose-50/80 border-rose-200' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{call.room} — {call.patient}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      call.priority === 'Emergency' ? 'bg-rose-600 text-white animate-pulse' :
                      call.priority === 'High' ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {call.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">{call.reason}</p>
                  <p className="text-[10px] text-slate-400">Time elapsed: {call.timeElapsed} · Assigned: {call.assignedNurse}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => acknowledgeCall(call.id)} className="btn-primary text-xs bg-emerald-600 hover:bg-emerald-700">
                    <Check size={14} /> Respond & Dispatch
                  </button>
                </div>
              </div>
            ))}
            {calls.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-400">All nurse calls have been acknowledged and resolved!</div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {['Room 101 - James Wilson', 'Room 102 - Sarah Chen', 'Room 103 - Robert Kim'].map((room, idx) => (
            <div key={idx} className="glass-card p-4 space-y-3 bg-slate-950 text-white border-slate-800">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-300">{room}</span>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> LIVE HD
                </span>
              </div>
              <div className="w-full h-36 bg-slate-900 rounded-xl flex flex-col items-center justify-center border border-slate-800 relative">
                <Video size={28} className="text-slate-600 mb-1" />
                <span className="text-[10px] text-slate-500">Continuous AI Motion & Fall Monitoring</span>
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
                <span>Vitals: SpO2 98% | HR 74</span>
                <button className="text-primary-400 hover:underline font-bold">2-Way Audio</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

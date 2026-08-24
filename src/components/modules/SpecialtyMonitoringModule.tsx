import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Activity, Baby, Droplets, FlaskConical, TestTube, TreePine, CheckCircle, AlertTriangle } from 'lucide-react';
import { MetricCard } from '../common/MetricCard';

interface SpecialtyProps {
  defaultSpecialty?: string;
}

export const SpecialtyMonitoringModule: React.FC<SpecialtyProps> = ({ defaultSpecialty = 'icu-sedation' }) => {
  const [selectedSpecialty, setSelectedSpecialty] = useState(defaultSpecialty);

  const specialties = [
    { id: 'icu-sedation', label: 'ICU Sedation (RASS)', icon: Brain, color: 'text-violet-600', val: '-2 Light Sedation', note: 'Propofol infusion 15 mcg/kg/min' },
    { id: 'chronic-care', label: 'Chronic Care RPM', icon: Activity, color: 'text-teal-600', val: 'Glucose 112 mg/dL', note: 'Continuous glucose monitor (CGM) synced' },
    { id: 'maternal', label: 'Maternal High-Risk', icon: Baby, color: 'text-rose-600', val: 'FHR 145 bpm', note: 'Normal variability, 0 decelerations' },
    { id: 'dialysis', label: 'Dialysis Monitor', icon: Droplets, color: 'text-sky-600', val: 'Ultrafiltration 800mL/hr', note: 'Kt/V efficiency ratio: 1.45 (Optimal)' },
    { id: 'chemo-toxicity', label: 'Chemo Toxicity', icon: FlaskConical, color: 'text-amber-600', val: 'Grade 1 Fatigue', note: 'ANC 2.1 x10^9/L - Cycle 3 Day 4' },
    { id: 'transfusion', label: 'Transfusion Monitor', icon: TestTube, color: 'text-red-600', val: '2 Units PRBC Blood', note: 'Crossmatch verified, zero allergic reaction' },
    { id: 'transplant', label: 'Organ Transplant', icon: TreePine, color: 'text-emerald-600', val: 'Tacrolimus 4.2 ng/mL', note: 'Allograft perfusion nominal' },
  ];

  const active = specialties.find(s => s.id === selectedSpecialty) || specialties[0];

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
            Specialty Clinical Telemetry Hub <Activity className="text-primary-600" />
          </h1>
          <p className="text-sm text-slate-500">Dedicated monitoring for high-acuity ICUs, chronic care RPMs, and maternal/transplant units.</p>
        </div>
      </div>

      {/* Specialty sub-nav pills */}
      <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl shadow-xs border">
        {specialties.map(s => {
          const Icon = s.icon;
          const isSel = selectedSpecialty === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setSelectedSpecialty(s.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                isSel ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon size={14} />
              {s.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard title="Current Telemetry Status" value={active.val} subtitle="Real-time wave data" icon={<active.icon size={16} />} color="blue" delay={0} />
        <MetricCard title="Care Protocol" value="Protocol 4-A" subtitle="Active order set" icon={<CheckCircle size={16} />} color="teal" delay={0.05} />
        <MetricCard title="Alert Threshold" value="Nominal" subtitle="Zero critical breaches" icon={<AlertTriangle size={16} />} color="emerald" delay={0.1} />
      </div>

      <div className="glass-card p-6 space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center ${active.color}`}>
              <active.icon size={22} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">{active.label} Telemetry Monitor</h3>
              <p className="text-xs text-slate-500">{active.note}</p>
            </div>
          </div>
          <span className="badge-success text-xs">Live Feed Active</span>
        </div>

        {/* Live waveform simulator */}
        <div className="w-full h-44 bg-slate-950 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden border border-slate-800">
          <div className="flex justify-between text-[11px] font-mono text-emerald-400 z-10">
            <span>WAVEFORM STREAM: {active.id.toUpperCase()}</span>
            <span className="animate-pulse">SAMPLING @ 250Hz</span>
          </div>

          <div className="w-full h-20 flex items-center justify-center relative z-10">
            <svg className="w-full h-full text-emerald-400 stroke-current fill-none" viewBox="0 0 500 100">
              <path
                d="M 0 50 Q 25 20, 50 50 T 100 50 T 125 10 T 140 90 T 155 50 T 200 50 T 250 50 T 275 20 T 300 50 T 325 10 T 340 90 T 355 50 T 500 50"
                strokeWidth="2"
              />
            </svg>
          </div>

          <div className="flex justify-between text-[10px] text-slate-500 font-mono z-10">
            <span>SENSORS: ONLINE</span>
            <span>GAIN: 1.0x</span>
            <span>IMPEDANCE: 2.1 kΩ</span>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { motion } from 'framer-motion';
import { TestTube, ShieldCheck, AlertCircle, CheckCircle } from 'lucide-react';
import { MetricCard } from '../common/MetricCard';

export const TransfusionModule: React.FC = () => {
  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
            Transfusion Safety & Blood Bank Telemetry <TestTube className="text-rose-600" />
          </h1>
          <p className="text-sm text-slate-500">2-RN Barcode crossmatch verification, reaction temperature alarms, and Hgb trigger safety.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="Pre-Transfusion Hgb" value="6.8 g/dL" subtitle="Trigger <7.0 met" icon={<TestTube size={16} />} color="rose" delay={0} />
        <MetricCard title="Crossmatch Status" value="A+ Compatible" subtitle="Unit #BB-90418" icon={<ShieldCheck size={16} />} color="emerald" delay={0.05} />
        <MetricCard title="Reaction Watch" value="Zero Pyrexia" subtitle="Temp 98.6°F unchanged" icon={<CheckCircle size={16} />} color="teal" delay={0.1} />
        <MetricCard title="Blood Bank Units" value="2 PRBC Ready" subtitle="Segment verified" icon={<CheckCircle size={16} />} color="blue" delay={0.15} />
      </div>

      <div className="glass-card p-5 space-y-4">
        <h3 className="font-bold text-sm text-slate-800 border-b pb-2">Active Blood Transfusion Verification</h3>
        <div className="space-y-3 text-xs">
          <div className="p-3 bg-slate-50 border rounded-xl flex justify-between items-center">
            <div>
              <p className="font-bold text-slate-800">Unit #PRBC-441098 (Blood Type A Positive)</p>
              <p className="text-[10px] text-slate-500">Patient: James Wilson · 2-Nurse Dual Verification Completed · Infusing @ 125 mL/hr</p>
            </div>
            <span className="badge-success text-[10px]">Verified & Transfusing</span>
          </div>
        </div>
      </div>
    </div>
  );
};

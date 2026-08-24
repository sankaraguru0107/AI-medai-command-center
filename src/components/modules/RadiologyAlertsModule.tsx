import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Clock, FileText } from 'lucide-react';
import { MetricCard } from '../common/MetricCard';

export const RadiologyAlertsModule: React.FC = () => {
  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
            Radiology Critical Findings Alert Radar <AlertTriangle className="text-rose-600" />
          </h1>
          <p className="text-sm text-slate-500">STAT critical imaging finding notifications and closed-loop physician receipt confirmation.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="Critical Findings" value="0 Pending" subtitle="100% notified <10 min" icon={<AlertTriangle size={16} />} color="rose" delay={0} />
        <MetricCard title="Avg Notification" value="4.2 mins" subtitle="Under 15 min SLA" icon={<Clock size={16} />} color="teal" delay={0.05} />
        <MetricCard title="Physician Sign-Off" value="100% Confirmed" subtitle="Closed-loop audit" icon={<CheckCircle size={16} />} color="emerald" delay={0.1} />
        <MetricCard title="AI PACS Scanner" value="Active" subtitle="Real-time OCR & NLP" icon={<FileText size={16} />} color="blue" delay={0.15} />
      </div>

      <div className="glass-card p-5 space-y-4">
        <h3 className="font-bold text-sm text-slate-800 border-b pb-2">STAT Radiology Notification Log</h3>
        <div className="space-y-3 text-xs">
          <div className="p-3 bg-slate-50 border rounded-xl flex justify-between items-center">
            <div>
              <p className="font-bold text-slate-800">CT Pulmonary Angiogram — Patient: James Wilson</p>
              <p className="text-[10px] text-slate-500">Finding: Small Segmental Pulmonary Embolism (RLL) · Notified: Dr. Emily Chen @ 10:14 AM (Confirmed in 2m)</p>
            </div>
            <span className="badge-success text-[10px]">Closed-Loop Acknowledged</span>
          </div>
        </div>
      </div>
    </div>
  );
};

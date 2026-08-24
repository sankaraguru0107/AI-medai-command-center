import React from 'react';
import { motion } from 'framer-motion';
import { TreePine, Activity, CheckCircle, Shield } from 'lucide-react';
import { MetricCard } from '../common/MetricCard';

export const TransplantModule: React.FC = () => {
  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
            Organ Transplant & Allograft Rejection Monitor <TreePine className="text-emerald-600" />
          </h1>
          <p className="text-sm text-slate-500">Immunosuppressant drug level tracking (Tacrolimus/Cyclosporine) and graft perfusion monitoring.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="Tacrolimus Trough" value="7.8 ng/mL" subtitle="Target 6-8 ng/mL met" icon={<Activity size={16} />} color="emerald" delay={0} />
        <MetricCard title="Rejection Risk Index" value="Low Risk" subtitle="Zero donor-specific Ag" icon={<Shield size={16} />} color="blue" delay={0.05} />
        <MetricCard title="Organ Perfusion" value="Nominal Flow" subtitle="Doppler velocity normal" icon={<CheckCircle size={16} />} color="teal" delay={0.1} />
        <MetricCard title="UNOS Status" value="Post-Transplant" subtitle="Day 42 post-renal TX" icon={<TreePine size={16} />} color="amber" delay={0.15} />
      </div>

      <div className="glass-card p-5 space-y-4">
        <h3 className="font-bold text-sm text-slate-800 border-b pb-2">Active Transplant Patient Log</h3>
        <div className="space-y-3 text-xs">
          <div className="p-3 bg-slate-50 border rounded-xl flex justify-between items-center">
            <div>
              <p className="font-bold text-slate-800">Renal Allograft Recipient — Robert Kim</p>
              <p className="text-[10px] text-slate-500">Serum Creatinine: 1.1 mg/dL (Baseline) · Tacrolimus 3mg BID · CMV PCR: Negative</p>
            </div>
            <span className="badge-success text-[10px]">Allograft Stable</span>
          </div>
        </div>
      </div>
    </div>
  );
};

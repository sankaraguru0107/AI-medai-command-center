import React from 'react';
import { useHackathonStore } from '../../../store/hackathonStore';

export const AnalyticsView: React.FC = () => {
  const { nationalResilienceScore } = useHackathonStore();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      <div>
        <h1 className="text-2xl font-display font-extrabold text-slate-900">National Resilience Analytics</h1>
        <p className="text-xs text-slate-500 mt-1">Aggregate health system resilience index, shortage prevention metrics & cost optimization</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase">National Resilience Index</span>
          <div className="text-4xl font-black text-sky-700">{nationalResilienceScore} / 100</div>
          <p className="text-xs text-emerald-700 font-semibold">+4.5 pts post-redistribution</p>
        </div>
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Stock-Outs Prevented</span>
          <div className="text-4xl font-black text-emerald-700">142 Incidents</div>
          <p className="text-xs text-slate-500 font-semibold">Past 30 Days across PHC network</p>
        </div>
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Emergency Cost Savings</span>
          <div className="text-4xl font-black text-amber-700">₹4.2 Crore</div>
          <p className="text-xs text-slate-500 font-semibold">Saved via cross-district sharing</p>
        </div>
      </div>
    </div>
  );
};

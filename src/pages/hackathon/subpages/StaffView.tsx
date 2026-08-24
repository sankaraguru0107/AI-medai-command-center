import React from 'react';

export const StaffView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      <div>
        <h1 className="text-2xl font-display font-extrabold text-slate-900">Staff & Workforce Intelligence</h1>
        <p className="text-xs text-slate-500 mt-1">Medical officers, nursing staff & specialist availability across PHC clusters</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase">Active Medical Officers</span>
          <div className="text-3xl font-black text-slate-900 mt-1">12,480 Doctors</div>
          <span className="text-xs text-emerald-700 font-semibold mt-1 block">94% Shift Coverage</span>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase">Nursing & Paramedical</span>
          <div className="text-3xl font-black text-slate-900 mt-1">42,900 Nurses</div>
          <span className="text-xs text-emerald-700 font-semibold mt-1 block">91% Shift Coverage</span>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase">Staff Deficit Risk</span>
          <div className="text-3xl font-black text-amber-700 mt-1">12 PHCs Flagged</div>
          <span className="text-xs text-amber-700 font-semibold mt-1 block">Nilgiris & Tribal Clusters</span>
        </div>
      </div>
    </div>
  );
};

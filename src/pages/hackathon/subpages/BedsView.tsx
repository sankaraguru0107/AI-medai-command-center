import React from 'react';

export const BedsView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      <div>
        <h1 className="text-2xl font-display font-extrabold text-slate-900">Bed Capacity Intelligence</h1>
        <p className="text-xs text-slate-500 mt-1">Real-time ICU and ward bed occupancy across primary & tertiary networks</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase">Total Capacity</span>
          <div className="text-3xl font-black text-slate-900 mt-1">142,500 Beds</div>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">Across 9 States</span>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase">Occupied Beds</span>
          <div className="text-3xl font-black text-amber-700 mt-1">102,600 Beds</div>
          <span className="text-[11px] text-amber-700 font-semibold mt-1 block">72% Overall Load</span>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase">Available Beds</span>
          <div className="text-3xl font-black text-sky-700 mt-1">39,900 Beds</div>
          <span className="text-[11px] text-sky-700 font-semibold mt-1 block">Ready for admission</span>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase">ICU Utilization</span>
          <div className="text-3xl font-black text-rose-700 mt-1">84.2%</div>
          <span className="text-[11px] text-rose-700 font-semibold mt-1 block">8 Districts &gt;90%</span>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900">ICU & Emergency Ward Hotspots</h3>
        <div className="space-y-3">
          {[
            { name: 'Government Medical College Madurai', icuUsed: 85, icuTotal: 90, status: 'Critical' },
            { name: 'District Hospital Coimbatore B', icuUsed: 42, icuTotal: 60, status: 'Stable' },
            { name: 'Primary Health Centre Valparai', icuUsed: 7, icuTotal: 8, status: 'Critical' },
          ].map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-sm text-slate-900">{item.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">ICU Beds: {item.icuUsed} / {item.icuTotal} occupied</div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                item.status === 'Critical' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

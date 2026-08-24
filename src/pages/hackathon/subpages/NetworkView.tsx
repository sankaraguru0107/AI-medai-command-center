import React, { useState } from 'react';
import { Search, Building2 } from 'lucide-react';
import { INDIAN_STATES, DEMO_FACILITIES } from '../../../data/hackathonData';

export const NetworkView: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Stable' | 'Warning' | 'Critical'>('All');

  const filteredFacilities = DEMO_FACILITIES.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase()) || f.district.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterStatus === 'All' || f.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-slate-900">Health Network Intelligence</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time monitoring across 2,438 Hospitals and Primary Health Centres
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search facility or district..."
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-sky-500 w-56 shadow-sm"
            />
          </div>
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 text-xs shadow-sm">
            {(['All', 'Stable', 'Warning', 'Critical'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  filterStatus === st ? 'bg-sky-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {INDIAN_STATES.slice(0, 3).map((st) => (
          <div key={st.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-base text-slate-900">{st.name} State Network</span>
              <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-xs font-bold">
                {st.resilienceScore}/100 Resilience
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>Hospitals: <span className="text-slate-900 font-bold">{st.hospitals}</span></div>
              <div>PHCs: <span className="text-slate-900 font-bold">{st.phcs}</span></div>
              <div>Occupancy: <span className="text-amber-700 font-bold">{st.bedOccupancyPercent}%</span></div>
              <div>Stock Level: <span className="text-teal-700 font-bold">{st.medicineAvailabilityPercent}%</span></div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Facility Directory</h3>
        <div className="space-y-3">
          {filteredFacilities.map((fac) => (
            <div key={fac.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between hover:border-slate-300 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shrink-0">
                  <Building2 size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900">{fac.name}</h4>
                    <span className="text-[10px] font-mono bg-slate-200 px-2 py-0.5 rounded text-slate-700">{fac.code}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {fac.type} • {fac.district}, {fac.state}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs text-slate-600">
                <div className="hidden sm:block">
                  Available Beds: <span className="text-sky-700 font-bold">{fac.availableBeds}/{fac.totalBeds}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                  fac.status === 'Critical' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {fac.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

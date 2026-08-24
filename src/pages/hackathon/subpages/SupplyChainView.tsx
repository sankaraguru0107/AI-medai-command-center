import React from 'react';
import { Truck } from 'lucide-react';

export const SupplyChainView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      <div>
        <h1 className="text-2xl font-display font-extrabold text-slate-900">Supply Chain & Logistics</h1>
        <p className="text-xs text-slate-500 mt-1">Cross-district fleet tracking, cold-chain monitoring & supplier dispatch</p>
      </div>

      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Active Medical Transports</h3>
        <div className="space-y-3">
          {[
            { id: 'SHP-9021', item: '500 Vials Ceftriaxone', from: 'DH Coimbatore B', to: 'PHC Valparai (PHC-024)', status: 'Dispatched EV Fleet', eta: '1h 15m' },
            { id: 'SHP-8820', item: '20 Oxygen Cylinders', from: 'Central Storage TN', to: 'GH Madurai', status: 'In Transit', eta: '2h 40m' },
          ].map((shp) => (
            <div key={shp.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-sky-100 text-sky-700">
                  <Truck size={20} />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">{shp.item}</div>
                  <div className="text-xs text-slate-500">{shp.from} → {shp.to}</div>
                </div>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold">{shp.status}</span>
                <div className="text-xs text-slate-500 font-mono mt-1">ETA: {shp.eta}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

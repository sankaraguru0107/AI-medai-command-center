import React from 'react';
import { Flame, Rocket } from 'lucide-react';
import { useHackathonStore } from '../../../store/hackathonStore';

export const EmergencyView: React.FC = () => {
  const { runSimulation, isSimulating } = useHackathonStore();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      <div>
        <h1 className="text-2xl font-display font-extrabold text-slate-900">Emergency Command Center</h1>
        <p className="text-xs text-slate-500 mt-1">High-priority surge response, emergency medical fleet dispatch & scenario trigger</p>
      </div>

      <div className="p-8 rounded-3xl bg-gradient-to-br from-amber-50 via-rose-50 to-white border border-rose-200 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-rose-700 font-bold text-xs uppercase tracking-wider">
            <Flame size={18} />
            <span>Emergency Surge Mode</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Run Hackathon Emergency Simulation</h2>
          <p className="text-xs text-slate-600 max-w-xl">
            Simulates a monsoon fever demand spike, medicine stock depletion, AI risk detection, automated redistribution proposal, and resilience restoration.
          </p>
        </div>

        <button
          onClick={runSimulation}
          disabled={isSimulating}
          className="px-6 py-4 rounded-2xl bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white font-black text-sm shadow-xl shadow-rose-500/20 flex items-center gap-3 shrink-0"
        >
          <Rocket size={20} />
          <span>{isSimulating ? 'Simulation Running...' : '🚀 Trigger Emergency Scenario'}</span>
        </button>
      </div>
    </div>
  );
};

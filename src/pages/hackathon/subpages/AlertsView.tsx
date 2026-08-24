import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useHackathonStore } from '../../../store/hackathonStore';

export const AlertsView: React.FC = () => {
  const { alerts, dismissAlert } = useHackathonStore();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      <div>
        <h1 className="text-2xl font-display font-extrabold text-slate-900">AI Incident Alerts</h1>
        <p className="text-xs text-slate-500 mt-1">Real-time risk warnings and automated early alert dispatch center</p>
      </div>

      <div className="space-y-4">
        {alerts.map((alt) => (
          <div key={alt.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${alt.severity === 'Critical' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                <AlertTriangle size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900">{alt.title}</h3>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">{alt.category}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{alt.location}</p>
                <div className="text-xs text-sky-700 font-semibold mt-2">Recommended: {alt.recommendedAction}</div>
              </div>
            </div>
            <button
              onClick={() => dismissAlert(alt.id)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold"
            >
              Acknowledge
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

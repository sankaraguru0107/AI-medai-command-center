import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, RefreshCw, Zap } from 'lucide-react';
import { MetricCard } from '../common/MetricCard';

export const ContrastProtocolModule: React.FC = () => {
  const [eGfr, setEGfr] = useState<number>(42);
  const [hasAllergy, setHasAllergy] = useState(true);
  const [protocolResult, setProtocolResult] = useState<string | null>(null);

  const evaluateProtocol = () => {
    if (eGfr < 30) {
      setProtocolResult('HIGH CIN RISK (eGFR < 30): Iodinated contrast contraindicated. Switch to non-contrast MRI/Ultrasound or IV hydration 12h pre/post.');
    } else if (hasAllergy) {
      setProtocolResult('PRE-MEDICATION REQUIRED: Prednisone 50mg (13h, 7h, 1h) + Diphenhydramine 50mg IV 1h prior to scan.');
    } else {
      setProtocolResult('LOW RISK: Approved for standard IV contrast protocol with normal hydration.');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto font-sans text-slate-900">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
            Contrast Allergy & Nephropathy Protocol <Shield className="text-sky-600" />
          </h1>
          <p className="text-sm text-slate-500">Automated eGFR screening, Contrast-Induced Nephropathy (CIN) risk scoring, and premedication algorithms.</p>
        </div>
        <button onClick={evaluateProtocol} className="btn-primary text-xs flex items-center gap-1.5">
          <Zap size={14} /> Calculate Contrast Safety
        </button>
      </div>

      {protocolResult && (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${eGfr < 30 ? 'bg-rose-50 border border-rose-200 text-rose-800' : 'bg-amber-50 border border-amber-200 text-amber-900'}`}>
          <AlertTriangle size={16} /> {protocolResult}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="eGFR Screening" value={`${eGfr} mL/min`} subtitle="Moderate Risk (30-59)" icon={<Shield size={16} />} color="amber" delay={0} />
        <MetricCard title="Premedication" value={hasAllergy ? 'Required' : 'None'} subtitle="13-Hour Steroid Protocol" icon={<AlertTriangle size={16} />} color="rose" delay={0.05} />
        <MetricCard title="CIN Risk Score" value={eGfr < 45 ? 'Elevated' : 'Low'} subtitle="Mehran Risk Score" icon={<Zap size={16} />} color="teal" delay={0.1} />
        <MetricCard title="Hydration Protocol" value="0.9% NS IV" subtitle="100 mL/hr Pre & Post" icon={<CheckCircle size={16} />} color="emerald" delay={0.15} />
      </div>

      <div className="glass-card p-5 space-y-4">
        <h3 className="font-bold text-sm text-slate-800 border-b pb-2">Contrast Safety Calculator</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Patient eGFR Value (mL/min/1.73m²)</label>
            <input
              type="number"
              value={eGfr}
              onChange={e => setEGfr(Number(e.target.value))}
              className="input-field text-xs"
            />
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 border rounded-xl">
            <div>
              <strong className="text-slate-800 block text-xs">Prior Contrast Reaction History</strong>
              <span className="text-[10px] text-slate-500">Hives, bronchospasm, or anaphylaxis</span>
            </div>
            <button
              onClick={() => setHasAllergy(!hasAllergy)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${hasAllergy ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-700'}`}
            >
              {hasAllergy ? 'Yes (Allergic)' : 'No (Clear)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

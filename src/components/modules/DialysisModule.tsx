import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Droplets, CheckCircle, AlertTriangle, Shield, RefreshCw } from 'lucide-react';
import { MetricCard } from '../common/MetricCard';

export const DialysisModule: React.FC = () => {
  const [ultrafiltrationRate, setUltrafiltrationRate] = useState<number>(10);
  const [ktV, setKtV] = useState<number>(1.4);
  const [sessionActive, setSessionActive] = useState(true);
  const [alertNotice, setAlertNotice] = useState<string | null>(null);

  const evaluateAdequacy = () => {
    if (ultrafiltrationRate > 13) {
      setAlertNotice('WARNING: High Ultrafiltration Rate (>13 mL/kg/h). High risk of myocardial stunning & intradialytic hypotension.');
    } else if (ktV < 1.2) {
      setAlertNotice('SUB-OPTIMAL DIALYSIS ADEQUACY: Kt/V < 1.2. Increase blood flow rate (Qb) or session duration.');
    } else {
      setAlertNotice('IDEAL DIALYSIS ADEQUACY: Kt/V 1.4, UF Rate within safe cardiovascular threshold.');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto font-sans text-slate-900">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
            Renal Dialysis Telemetry & Adequacy AI <Droplets className="text-sky-600" />
          </h1>
          <p className="text-sm text-slate-500">Real-time Kt/V adequacy calculation, ultrafiltration rate safety limits, and electrolyte balance tracking.</p>
        </div>
        <button onClick={evaluateAdequacy} className="btn-primary text-xs flex items-center gap-1.5">
          <RefreshCw size={14} /> Calculate Kt/V & Safety
        </button>
      </div>

      {alertNotice && (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${ultrafiltrationRate > 13 ? 'bg-rose-50 border border-rose-200 text-rose-800' : 'bg-emerald-50 border border-emerald-200 text-emerald-800'}`}>
          <AlertTriangle size={16} /> {alertNotice}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="Kt/V Adequacy" value={`${ktV}`} subtitle="Target >= 1.2" icon={<Droplets size={16} />} color="blue" delay={0} />
        <MetricCard title="UF Rate" value={`${ultrafiltrationRate} mL/kg/h`} subtitle="Safe Limit < 13" icon={<AlertTriangle size={16} />} color="teal" delay={0.05} />
        <MetricCard title="Blood Flow (Qb)" value="450 mL/min" subtitle="Arterial Access" icon={<CheckCircle size={16} />} color="emerald" delay={0.1} />
        <MetricCard title="Dialysate Temp" value="36.5 °C" subtitle="Isothermic Dialysis" icon={<Shield size={16} />} color="amber" delay={0.15} />
      </div>

      <div className="glass-card p-5 space-y-4">
        <h3 className="font-bold text-sm text-slate-800 border-b pb-2">Hemodialysis Machine Parameters</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Ultrafiltration Rate (mL/kg/h)</label>
            <input
              type="number"
              value={ultrafiltrationRate}
              onChange={e => setUltrafiltrationRate(Number(e.target.value))}
              className="input-field text-xs"
            />
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Kt/V Urea Single Pool Score</label>
            <input
              type="number"
              step="0.1"
              value={ktV}
              onChange={e => setKtV(Number(e.target.value))}
              className="input-field text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

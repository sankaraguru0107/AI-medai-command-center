import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FlaskConical, AlertTriangle, CheckCircle, Shield, Plus, Check } from 'lucide-react';
import { MetricCard } from '../common/MetricCard';

export const ChemoToxicityModule: React.FC = () => {
  const [ancCount, setAncCount] = useState<number>(2.4);
  const [ctcaeGrade, setCtcaeGrade] = useState<'Grade 1' | 'Grade 2' | 'Grade 3' | 'Grade 4'>('Grade 1');
  const [premedsDone, setPremedsDone] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  const calculateSafety = () => {
    if (ancCount < 1.0) {
      setCtcaeGrade('Grade 4');
      setNotice('CRITICAL NEUTROPENIA (ANC < 1.0). Hold chemotherapy infusion immediately and administer G-CSF.');
    } else if (ancCount < 1.5) {
      setCtcaeGrade('Grade 2');
      setNotice('WARNING: Mild Neutropenia (ANC < 1.5). Consider 20% dose reduction.');
    } else {
      setCtcaeGrade('Grade 1');
      setNotice('ANC levels safe for full dose chemotherapy cycle.');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto font-sans text-slate-900">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
            Chemotherapy Toxicity & ANC Monitoring (CTCAE) <FlaskConical className="text-amber-600" />
          </h1>
          <p className="text-sm text-slate-500">Common Terminology Criteria for Adverse Events (CTCAE v5.0) grading and neutropenia management.</p>
        </div>
        <button onClick={calculateSafety} className="btn-primary text-xs flex items-center gap-1.5">
          <FlaskConical size={14} /> Evaluate ANC Safety
        </button>
      </div>

      {notice && (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${ancCount < 1.0 ? 'bg-rose-50 border border-rose-200 text-rose-800' : 'bg-emerald-50 border border-emerald-200 text-emerald-800'}`}>
          <AlertTriangle size={16} /> {notice}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="ANC Count" value={`${ancCount} x10^9/L`} subtitle="Absolute Neutrophil Count" icon={<FlaskConical size={16} />} color="emerald" delay={0} />
        <MetricCard title="Toxicity Grade" value={ctcaeGrade} subtitle="CTCAE v5.0 Standard" icon={<AlertTriangle size={16} />} color="amber" delay={0.05} />
        <MetricCard title="Infusion Reaction" value="Zero Events" subtitle="Pre-meds administered" icon={<CheckCircle size={16} />} color="blue" delay={0.1} />
        <MetricCard title="Platelet Count" value="210,000/uL" subtitle="Above threshold" icon={<Shield size={16} />} color="teal" delay={0.15} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-5 space-y-4">
          <h3 className="font-bold text-sm text-slate-800 border-b pb-2">ANC Lab Calculator & Cycle Validator</h3>
          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Current ANC Count (x10^9/L)</label>
              <input
                type="number"
                step="0.1"
                value={ancCount}
                onChange={e => setAncCount(parseFloat(e.target.value) || 0)}
                className="input-field text-xs"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 border rounded-xl">
              <div>
                <strong className="text-slate-800 block text-xs">Pre-Infusion Medication Checklist</strong>
                <span className="text-[11px] text-slate-500">Dexamethasone + Ondansetron pre-meds</span>
              </div>
              <button
                onClick={() => setPremedsDone(!premedsDone)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${premedsDone ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}
              >
                {premedsDone ? '✓ Verified' : 'Pending'}
              </button>
            </div>
          </div>
        </div>

        <div className="glass-card p-5 space-y-4">
          <h3 className="font-bold text-sm text-slate-800 border-b pb-2">Oncology Infusion Safety Record</h3>
          <div className="p-3.5 bg-slate-50 border rounded-xl flex justify-between items-center text-xs">
            <div>
              <p className="font-bold text-slate-800">Sarah Chen (FOLFIRI Regimen - Cycle 3 Day 1)</p>
              <p className="text-[10px] text-slate-500">Pre-meds verified. Infusion rate: 100 mL/hr.</p>
            </div>
            <span className="badge-success text-[10px]">Infusion Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

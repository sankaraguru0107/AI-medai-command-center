import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Brain, AlertTriangle, TrendingDown, CheckCircle, ShieldAlert } from 'lucide-react';
import { MetricCard } from '../common/MetricCard';

export const UtilizationClinicalDecisionModule: React.FC = () => {
  const [selectedMed, setSelectedMed] = useState('Warfarin + Aspirin');
  const [checking, setChecking] = useState(false);
  const [interactionResult, setInteractionResult] = useState<string | null>(null);

  const checkDrugInteraction = async () => {
    setChecking(true);
    await new Promise(r => setTimeout(r, 700));
    setChecking(false);
    setInteractionResult('Major Risk: Concomitant use increases bleeding risk significantly. Monitor INR closely.');
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
            Utilization Mgmt & Clinical Decision Support <Brain className="text-primary-600" />
          </h1>
          <p className="text-sm text-slate-500">AI-driven length-of-stay optimization and real-time drug interaction safety checks.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="Avg Length of Stay" value="4.1 Days" subtitle="-0.8 days vs target" icon={<TrendingDown size={16} />} color="teal" delay={0} />
        <MetricCard title="CDSS Safety Alerts" value="99.8%" subtitle="Interaction accuracy" icon={<ShieldAlert size={16} />} color="rose" delay={0.05} />
        <MetricCard title="Bed Turnaround" value="2.3 Hrs" subtitle="Optimized discharge" icon={<BarChart3 size={16} />} color="blue" delay={0.1} />
        <MetricCard title="Guideline Compliance" value="97.2%" subtitle="AHA/ACC Protocols" icon={<CheckCircle size={16} />} color="amber" delay={0.15} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Drug-Drug Interaction Safety Advisor */}
        <div className="glass-card p-5 space-y-4">
          <h3 className="font-bold text-sm text-slate-800 border-b pb-2 flex items-center gap-2">
            <AlertTriangle className="text-amber-500" size={16} /> Clinical Drug Interaction Matrix
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Select Medication Combination</label>
              <select value={selectedMed} onChange={e => setSelectedMed(e.target.value)} className="input-field text-xs">
                <option value="Warfarin + Aspirin">Warfarin 5mg + Aspirin 81mg (High Risk)</option>
                <option value="Metformin + Contrast">Metformin 500mg + IV Contrast (Renal Watch)</option>
                <option value="Lisinopril + Spironolactone">Lisinopril 10mg + Spironolactone 25mg (Hyperkalemia)</option>
              </select>
            </div>

            <button onClick={checkDrugInteraction} disabled={checking} className="btn-primary text-xs w-full justify-center">
              {checking ? 'Evaluating CDSS Database...' : 'Run Clinical Safety Check'}
            </button>

            {interactionResult && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle size={14} className="text-amber-600" /> Interaction Warning
                </div>
                <p className="text-[11px] leading-relaxed">{interactionResult}</p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Length of Stay Optimizer */}
        <div className="glass-card p-5 space-y-4">
          <h3 className="font-bold text-sm text-slate-800 border-b pb-2 flex items-center gap-2">
            <BarChart3 className="text-primary-600" size={16} /> Length of Stay (LOS) Predictor
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-800">Cardiology Ward (Floor 4)</p>
                <p className="text-[10px] text-slate-500">Predicted LOS: 3.5 Days · Actual: 3.2 Days</p>
              </div>
              <span className="badge-success text-[10px]">On Target</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-800">Pulmonology (Floor 6)</p>
                <p className="text-[10px] text-slate-500">Predicted LOS: 4.8 Days · Actual: 5.4 Days</p>
              </div>
              <span className="badge-warning text-[10px]">Review Needed</span>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed pt-2">
              AI recommendation: Initiating home oxygen delivery protocol 24 hours prior to discharge reduces COPD readmission by 18%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

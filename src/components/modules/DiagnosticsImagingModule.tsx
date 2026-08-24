import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Microscope, FileText, CheckCircle, AlertTriangle, Eye, Sparkles, Send } from 'lucide-react';
import { MetricCard } from '../common/MetricCard';

export const DiagnosticsImagingModule: React.FC = () => {
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [findings, setFindings] = useState<string | null>(null);
  const [dispatched, setDispatched] = useState(false);

  const runAiAnalysis = () => {
    setAiAnalyzing(true);
    setFindings(null);
    setTimeout(() => {
      setAiAnalyzing(false);
      setFindings('AI Lesion Detection: 4mm pulmonary nodule identified in right upper lobe. Recommended CT Follow-up in 6 months (Fleischner 2024 guidelines).');
    }, 1000);
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto font-sans text-slate-900">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
            Diagnostics & Imaging AI Copilot <Microscope className="text-primary-600" />
          </h1>
          <p className="text-sm text-slate-500">Automated CADx lesion detection, PACS DICOM triage, and radiology critical finding notifications.</p>
        </div>
        <button onClick={runAiAnalysis} disabled={aiAnalyzing} className="btn-primary text-xs flex items-center gap-1.5">
          <Sparkles size={14} /> {aiAnalyzing ? 'Analyzing Scan...' : 'Run AI Scan Diagnostics'}
        </button>
      </div>

      {findings && (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-600" />
            <span>{findings}</span>
          </div>
          <button onClick={() => setDispatched(true)} className="btn-secondary text-xs px-3 py-1 bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-900 font-bold">
            {dispatched ? '✓ Dispatched to EHR' : 'Dispatch Alert to Pulmonology'}
          </button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="PACS Sync" value="Live" subtitle="DICOM Listener Port 104" icon={<Microscope size={16} />} color="teal" delay={0} />
        <MetricCard title="AI Lesion Detection" value="97.8%" subtitle="Sensitivity rate" icon={<Sparkles size={16} />} color="blue" delay={0.05} />
        <MetricCard title="Critical Findings" value="2 Active" subtitle="Triage queue" icon={<AlertTriangle size={16} />} color="rose" delay={0.1} />
        <MetricCard title="Turnaround Time" value="14 Mins" subtitle="Stat radiologist read" icon={<CheckCircle size={16} />} color="emerald" delay={0.15} />
      </div>

      <div className="glass-card p-5 space-y-4">
        <h3 className="font-bold text-sm text-slate-800 border-b pb-2 flex justify-between items-center">
          <span>PACS DICOM Scan Review Queue</span>
          <span className="badge-info text-[10px]">3 Scans Pending</span>
        </h3>
        <div className="space-y-3 text-xs">
          <div className="p-3.5 bg-slate-50 border rounded-xl flex justify-between items-center">
            <div>
              <p className="font-bold text-slate-800">James Wilson — Chest CT 3D Reconstruction</p>
              <p className="text-[10px] text-slate-500">Ordered by Emergency Dept · Latency 4m · DICOM Series 4</p>
            </div>
            <button onClick={runAiAnalysis} className="btn-primary text-xs flex items-center gap-1">
              <Eye size={14} /> View & AI Analyze
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

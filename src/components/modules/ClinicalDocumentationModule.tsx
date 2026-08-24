import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Wand2, Mic, CheckCircle, Sparkles, Copy, Download, Code } from 'lucide-react';
import { MetricCard } from '../common/MetricCard';

export const ClinicalDocumentationModule: React.FC = () => {
  const [dictating, setDictating] = useState(false);
  const [subjective, setSubjective] = useState('67-year-old male presents with worsening shortness of breath and cough over 3 days.');
  const [objective, setObjective] = useState('BP 142/88, HR 98, Temp 101.2F, SpO2 87% on room air. Auscultation reveals bilateral wheezing.');
  const [assessment, setAssessment] = useState('Acute COPD exacerbation with hypoxic respiratory strain.');
  const [plan, setPlan] = useState('1. Supplemental O2 2L via nasal cannula.\n2. Albuterol/Ipratropium nebulizer q4h.\n3. IV Methylprednisolone 40mg.');
  const [generating, setGenerating] = useState(false);
  const [aiCodes, setAiCodes] = useState<string[]>([]);

  const handleGenerateAI = async () => {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 900));
    setAiCodes(['J44.1 - COPD with acute exacerbation', 'R06.02 - Shortness of breath', 'Z99.81 - Dependence on supplemental oxygen']);
    setGenerating(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
            Clinical Documentation AI Copilot <Wand2 className="text-primary-600" />
          </h1>
          <p className="text-sm text-slate-500">Autonomous SOAP note generator with real-time ICD-10/CPT coding suggestions.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setDictating(!dictating)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              dictating ? 'bg-rose-500 text-white animate-pulse' : 'btn-secondary'
            }`}
          >
            <Mic size={14} /> {dictating ? 'Listening...' : 'Live Dictation'}
          </button>
          <button onClick={handleGenerateAI} disabled={generating} className="btn-primary text-xs flex items-center gap-1.5">
            <Sparkles size={14} /> {generating ? 'Analyzing...' : 'Generate Auto-Coding'}
          </button>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-5 lg:col-span-2 space-y-4">
          <h3 className="font-bold text-sm text-slate-800 border-b pb-2">Structured SOAP Note Builder</h3>
          
          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Subjective (S)</label>
              <textarea value={subjective} onChange={e => setSubjective(e.target.value)} rows={2} className="input-field text-xs" />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Objective (O)</label>
              <textarea value={objective} onChange={e => setObjective(e.target.value)} rows={2} className="input-field text-xs" />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Assessment (A)</label>
              <textarea value={assessment} onChange={e => setAssessment(e.target.value)} rows={2} className="input-field text-xs" />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Plan (P)</label>
              <textarea value={plan} onChange={e => setPlan(e.target.value)} rows={3} className="input-field text-xs" />
            </div>
          </div>
        </div>

        <div className="glass-card p-5 lg:col-span-1 space-y-4 bg-gradient-to-br from-primary-50/30 to-teal-50/30">
          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
            <Code size={16} className="text-primary-600" /> AI Coding & Billing Assistant
          </h3>

          {aiCodes.length > 0 ? (
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Suggested ICD-10 Codes</span>
              {aiCodes.map((code, i) => (
                <div key={i} className="p-2.5 bg-white border border-primary-100 rounded-xl text-xs font-semibold text-slate-800 flex justify-between items-center shadow-xs">
                  <span>{code}</span>
                  <CheckCircle size={14} className="text-emerald-500" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-slate-400 border border-dashed rounded-xl p-4">
              Click "Generate Auto-Coding" to analyze the SOAP note and output billable ICD-10 and CPT codes.
            </div>
          )}

          <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs space-y-1">
            <div className="flex justify-between font-bold text-slate-700">
              <span>E/M Code Level:</span>
              <span className="text-primary-600">Level 4 (CPT 99214)</span>
            </div>
            <p className="text-[10px] text-slate-400">High-complexity decision making supported by clinical vitals & nebulizer protocol.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

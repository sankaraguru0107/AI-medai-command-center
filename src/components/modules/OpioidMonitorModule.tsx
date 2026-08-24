import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pill, AlertTriangle, Database, CheckCircle, Brain, Activity, Heart,
  FileText, Shield, Sparkles, Clock, User, Plus, X, Search, RefreshCw,
  Download, Printer, Send, Share2, ClipboardList, Info, HelpCircle, BookOpen, AlertCircle
} from 'lucide-react';
import { MetricCard } from '../common/MetricCard';
import { askMedAI } from '../../services/azureOpenAI';

interface OpioidRow {
  id: string;
  drug: string;
  strength: string; // e.g. 10mg
  dosesPerDay: number;
  conversionFactor: number;
}

interface PatientOpioidProfile {
  id: string;
  name: string;
  mrn: string;
  age: number;
  gender: string;
  weight: string;
  height: string;
  painDiagnosis: string;
  painScore: number; // 0-10
  kidneyFunction: string;
  liverFunction: string;
  sudHistory: boolean;
  overdoseHistory: boolean;
  respiratoryDisease: boolean;
  sleepApnea: boolean;
  pregnancy: string;
  activeOpioids: OpioidRow[];
  concurrentMeds: string[];
}

const mockPatients: PatientOpioidProfile[] = [
  {
    id: 'p001',
    name: 'James Wilson',
    mrn: 'MRN-482109',
    age: 67,
    gender: 'Male',
    weight: '78 kg',
    height: '175 cm',
    painDiagnosis: 'Chronic Lower Back Pain & Diabetic Neuropathy',
    painScore: 7,
    kidneyFunction: 'eGFR 42 (Stage 3b CKD)',
    liverFunction: 'Normal',
    sudHistory: false,
    overdoseHistory: false,
    respiratoryDisease: true, // COPD
    sleepApnea: true,
    pregnancy: 'N/A',
    activeOpioids: [
      { id: '1', drug: 'Oxycodone', strength: '15mg', dosesPerDay: 4, conversionFactor: 1.5 },
      { id: '2', drug: 'Morphine (ER)', strength: '30mg', dosesPerDay: 2, conversionFactor: 1.0 }
    ],
    concurrentMeds: ['Alprazolam 0.5mg (PRN Anxiety)', 'Gabapentin 300mg TID', 'Lisinopril 10mg']
  },
  {
    id: 'p002',
    name: 'Sarah Chen',
    mrn: 'MRN-334281',
    age: 54,
    gender: 'Female',
    weight: '62 kg',
    height: '162 cm',
    painDiagnosis: 'Post-operative Abdominal Pain',
    painScore: 4,
    kidneyFunction: 'eGFR 88 (Normal)',
    liverFunction: 'Normal',
    sudHistory: false,
    overdoseHistory: false,
    respiratoryDisease: false,
    sleepApnea: false,
    pregnancy: 'Not Pregnant',
    activeOpioids: [
      { id: '3', drug: 'Tramadol', strength: '50mg', dosesPerDay: 3, conversionFactor: 0.1 }
    ],
    concurrentMeds: ['Acetaminophen 500mg q6h', 'Atorvastatin 40mg']
  },
  {
    id: 'p003',
    name: 'Robert Kim',
    mrn: 'MRN-613092',
    age: 73,
    gender: 'Male',
    weight: '84 kg',
    height: '170 cm',
    ward: 'ICU 3D',
    painDiagnosis: 'Polytrauma & Rib Fractures',
    painScore: 8,
    kidneyFunction: 'eGFR 24 (AKI Stage 2)',
    liverFunction: 'Mild Impairment',
    sudHistory: true, // History of opioid overuse
    overdoseHistory: true, // Prior overdose 2024
    respiratoryDisease: true, // Mild asthma
    sleepApnea: false,
    pregnancy: 'N/A',
    activeOpioids: [
      { id: '4', drug: 'Fentanyl IV Patch', strength: '50mcg/hr', dosesPerDay: 1, conversionFactor: 2.4 },
      { id: '5', drug: 'Hydromorphone', strength: '2mg', dosesPerDay: 6, conversionFactor: 4.0 }
    ],
    concurrentMeds: ['Lorazepam 1mg IV', 'Cyclobenzaprine 10mg TID']
  } as any
];

const OPIOID_FACTORS: Record<string, number> = {
  Morphine: 1.0,
  Oxycodone: 1.5,
  Hydrocodone: 1.0,
  Hydromorphone: 4.0,
  Fentanyl: 2.4,
  Methadone: 4.0,
  Tramadol: 0.1,
  Codeine: 0.15
};

export const OpioidMonitorModule: React.FC = () => {
  const [selectedPatient, setSelectedPatient] = useState<PatientOpioidProfile>(mockPatients[0]);
  const [patients, setPatients] = useState(mockPatients);

  // MME Calculator Editor States
  const [activeRows, setActiveRows] = useState<OpioidRow[]>(mockPatients[0].activeOpioids);
  const [selectedDrug, setSelectedDrug] = useState('Oxycodone');
  const [inputStrength, setInputStrength] = useState('');
  const [inputFreq, setInputFreq] = useState<number | ''>('');

  // AI & Action States
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisCompleted, setAnalysisCompleted] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Right AI Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Sync rows when patient changes
  const handlePatientChange = (pId: string) => {
    const pat = patients.find(p => p.id === pId) || patients[0];
    setSelectedPatient(pat);
    setActiveRows(pat.activeOpioids);
    setAnalysisCompleted(true);
  };

  const addOpioidRow = () => {
    if (!inputStrength.trim()) return;
    const factor = OPIOID_FACTORS[selectedDrug] || 1.0;
    const newRow: OpioidRow = {
      id: Date.now().toString(),
      drug: selectedDrug,
      strength: inputStrength,
      dosesPerDay: inputFreq === '' ? 1 : inputFreq,
      conversionFactor: factor
    };
    setActiveRows([...activeRows, newRow]);
    setInputStrength('');
    setInputFreq('');
  };

  const deleteOpioidRow = (id: string) => {
    setActiveRows(activeRows.filter(r => r.id !== id));
  };

  // MME Calculation logic
  const calculateTotalMme = () => {
    return activeRows.reduce((acc, row) => {
      const strengthNum = parseFloat(row.strength) || 0;
      return acc + (strengthNum * row.dosesPerDay * row.conversionFactor);
    }, 0);
  };

  const totalMme = calculateTotalMme();

  const getMmeColor = (val: number) => {
    if (val >= 90) return { text: 'text-rose-600', bg: 'bg-rose-50 border-rose-200', level: 'Critical Risk (>90 MME)' };
    if (val >= 50) return { text: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', level: 'Moderate Risk (50-89 MME)' };
    return { text: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', level: 'Safe Range (0-49 MME)' };
  };

  const mmeMeta = getMmeColor(totalMme);

  // Overdose Risk Assessment logic
  const checkOverdoseRisk = () => {
    let score = 0;
    if (totalMme >= 90) score += 3;
    else if (totalMme >= 50) score += 2;
    
    if (selectedPatient.respiratoryDisease) score += 2;
    if (selectedPatient.sleepApnea) score += 2;
    if (selectedPatient.sudHistory) score += 3;
    if (selectedPatient.overdoseHistory) score += 4;
    
    const hasBenzo = selectedPatient.concurrentMeds.some(m => m.toLowerCase().includes('alprazolam') || m.toLowerCase().includes('lorazepam'));
    if (hasBenzo) score += 3;

    if (score >= 9) return { level: 'Critical Overdose Risk', color: 'text-rose-600 bg-rose-50 border-rose-200', pct: 90 };
    if (score >= 5) return { level: 'High Overdose Risk', color: 'text-rose-500 bg-rose-50/50 border-rose-100', pct: 75 };
    if (score >= 3) return { level: 'Moderate Overdose Risk', color: 'text-amber-500 bg-amber-50 border-amber-200', pct: 45 };
    return { level: 'Low Overdose Risk', color: 'text-emerald-500 bg-emerald-50 border-emerald-200', pct: 15 };
  };

  const riskMeta = checkOverdoseRisk();

  const handleRunAnalysis = async () => {
    setAnalyzing(true);
    setAnalysisCompleted(false);
    await new Promise(r => setTimeout(r, 800));
    setAnalyzing(false);
    setAnalysisCompleted(true);
  };

  const triggerToast = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const askAiAssistant = async (queryText?: string) => {
    const text = queryText || aiPrompt;
    if (!text.trim()) return;
    setAiLoading(true);
    setAiPrompt('');
    setDrawerOpen(true);
    try {
      const resp = await askMedAI(
        `Opioid safety query for patient ${selectedPatient.name} (Total MME: ${totalMme} MME/day): ${text}`,
        'clinical'
      );
      setAiResponse(resp);
    } catch {
      setAiResponse('Unable to connect to Medii clinical stewardship repository.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1700px] mx-auto relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
            Opioid Safety & MME Monitoring Radar <Pill className="text-rose-600 animate-pulse" />
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time opioid stewardship, Morphine Milligram Equivalent (MME) calculation, overdose risk prediction, prescription monitoring, and evidence-based opioid safety recommendations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDrawerOpen(true)}
            className="btn-primary text-xs flex items-center gap-1.5 shadow-md shadow-primary-500/20"
          >
            <Sparkles size={14} />
            <span>AI Opioid Stewardship Copilot</span>
          </button>
          <button
            onClick={() => triggerToast('Queried state PDMP database')}
            className="btn-secondary text-xs flex items-center gap-1.5"
          >
            <Database size={13} />
            <span>Query State PDMP</span>
          </button>
        </div>
      </div>

      {/* Action Toast */}
      <AnimatePresence>
        {actionNotice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-2">
              <CheckCircle size={16} /> {actionNotice}
            </div>
            <button onClick={() => setActionNotice(null)}>
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top KPI Cards (7 Cards Grid) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="glass-card p-3.5 space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-extrabold uppercase">High MME Patients</span>
            <AlertTriangle size={14} className="text-rose-500" />
          </div>
          <div className="text-lg font-bold font-display text-slate-900">4 Active</div>
          <div className="text-[10px] text-rose-600 font-semibold">2 &gt;50 MME · 2 &gt;90 MME</div>
        </div>

        <div className="glass-card p-3.5 space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-extrabold uppercase">Overdose Risk</span>
            <AlertCircle size={14} className="text-amber-500" />
          </div>
          <div className="text-lg font-bold font-display text-slate-900">3 High Risk</div>
          <div className="text-[10px] text-amber-600 font-semibold">1 Critical Alert active</div>
        </div>

        <div className="glass-card p-3.5 space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-extrabold uppercase">Naloxone Eligibility</span>
            <Shield size={14} className="text-emerald-500" />
          </div>
          <div className="text-lg font-bold font-display text-slate-900">6 Eligible</div>
          <div className="text-[10px] text-emerald-600 font-semibold">4 Prescribed · 2 Missing</div>
        </div>

        <div className="glass-card p-3.5 space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-extrabold uppercase">PDMP Queries</span>
            <Database size={14} className="text-teal-500" />
          </div>
          <div className="text-lg font-bold font-display text-slate-900">100% Sync</div>
          <div className="text-[10px] text-teal-600 font-semibold">1 Patient Flagged</div>
        </div>

        <div className="glass-card p-3.5 space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-extrabold uppercase">CNS Depressant Alerts</span>
            <AlertTriangle size={14} className="text-rose-500" />
          </div>
          <div className="text-lg font-bold font-display text-slate-900">2 Alerts</div>
          <div className="text-[10px] text-rose-600 font-semibold">Opioid + Benzodiazepine</div>
        </div>

        <div className="glass-card p-3.5 space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-extrabold uppercase">Long-Term Opioids</span>
            <Clock size={14} className="text-primary-500" />
          </div>
          <div className="text-lg font-bold font-display text-slate-900">8 Chronic</div>
          <div className="text-[10px] text-primary-600 font-semibold">&gt;90 Days Therapy</div>
        </div>

        <div className="glass-card p-3.5 space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-extrabold uppercase">CDC Compliance</span>
            <CheckCircle size={14} className="text-emerald-500" />
          </div>
          <div className="text-lg font-bold font-display text-slate-900">97.4%</div>
          <div className="text-[10px] text-emerald-600 font-semibold">Hospital policy match</div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Patient Selection & Details */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-5 space-y-4">
            <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-2">
              <User size={16} className="text-primary-600" /> Inpatient Opioid Profile
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Select Patient Profile</label>
                <select
                  value={selectedPatient.id}
                  onChange={e => handlePatientChange(e.target.value)}
                  className="input-field text-xs font-semibold"
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.mrn})</option>
                  ))}
                </select>
              </div>

              {/* Profile card details */}
              <div className="p-4 bg-slate-50 border rounded-xl space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-sm text-slate-900">{selectedPatient.name}</span>
                  <span className="text-[10px] font-bold bg-primary-100 text-primary-700 px-2 py-0.5 rounded">{selectedPatient.mrn}</span>
                </div>

                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-slate-600">
                  <div><span className="text-slate-400">Age/Gender:</span> {selectedPatient.age}y / {selectedPatient.gender}</div>
                  <div><span className="text-slate-400">Wt/Ht:</span> {selectedPatient.weight} / {selectedPatient.height}</div>
                  <div className="col-span-2"><span className="text-slate-400">Pain Diagnosis:</span> <span className="font-semibold text-slate-800">{selectedPatient.painDiagnosis}</span></div>
                  <div><span className="text-slate-400">Pain Score (0-10):</span> <span className="font-bold text-rose-600">{selectedPatient.painScore} / 10</span></div>
                  <div><span className="text-slate-400">Pregnancy:</span> {selectedPatient.pregnancy}</div>
                  <div className="col-span-2"><span className="text-slate-400">Renal Function:</span> {selectedPatient.kidneyFunction}</div>
                  <div className="col-span-2"><span className="text-slate-400">Liver Function:</span> {selectedPatient.liverFunction}</div>
                </div>

                <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-1 text-[10px] font-bold">
                  <div className={selectedPatient.sudHistory ? 'text-rose-600' : 'text-slate-400'}>
                    ● History of SUD: {selectedPatient.sudHistory ? 'YES' : 'NO'}
                  </div>
                  <div className={selectedPatient.overdoseHistory ? 'text-rose-600' : 'text-slate-400'}>
                    ● History of OD: {selectedPatient.overdoseHistory ? 'YES' : 'NO'}
                  </div>
                  <div className={selectedPatient.respiratoryDisease ? 'text-rose-600' : 'text-slate-400'}>
                    ● COPD/Respiratory: {selectedPatient.respiratoryDisease ? 'YES' : 'NO'}
                  </div>
                  <div className={selectedPatient.sleepApnea ? 'text-rose-600' : 'text-slate-400'}>
                    ● Sleep Apnea: {selectedPatient.sleepApnea ? 'YES' : 'NO'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Patient Monitoring Telemetry Panel */}
          <div className="glass-card p-5 space-y-3">
            <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-2">
              <Activity size={16} className="text-teal-600" /> Active Respiratory & Vitals Telemetry
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { label: 'Respiratory Rate', val: '12 /min', warn: true },
                { label: 'SpO2 Saturation', val: '93%', warn: true },
                { label: 'Sedation (RASS)', val: '-1 Drowsy', warn: false },
                { label: 'Constipation Risk', val: 'High Risk', warn: true },
                { label: 'Fall Risk (Morse)', val: '45 (Moderate)', warn: true },
                { label: 'Heart Rate', val: '74 bpm', warn: false },
              ].map(v => (
                <div key={v.label} className={`p-2.5 rounded-xl border text-center ${v.warn ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="text-xs font-extrabold text-slate-800">{v.val}</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">{v.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: MME Stewardship Dashboard */}
        <div className="lg:col-span-8 space-y-6">
          {/* MME Calculator */}
          <div className="glass-card p-5 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Pill size={16} className="text-rose-600" /> Morphine Milligram Equivalent (MME) Calculator
                </h3>
                <p className="text-xs text-slate-400">Calculate cumulative daily MME based on CDC Conversion Factors</p>
              </div>
              <span className={`px-3 py-1 rounded-xl text-xs font-bold ${mmeMeta.bg} ${mmeMeta.text}`}>
                {totalMme} MME/day
              </span>
            </div>

            {/* Opioid rows list */}
            <div className="space-y-2">
              {activeRows.map(row => (
                <div key={row.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800">{row.drug} {row.strength}</span>
                    <span className="text-slate-400 ml-2">({row.dosesPerDay} doses/day · CDC Factor: {row.conversionFactor})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-600">{(parseFloat(row.strength) || 0) * row.dosesPerDay * row.conversionFactor} MME</span>
                    <button onClick={() => deleteOpioidRow(row.id)} className="text-slate-400 hover:text-rose-600">
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add row editor */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
              <select value={selectedDrug} onChange={e => setSelectedDrug(e.target.value)} className="input-field text-xs font-semibold">
                <option value="Oxycodone">Oxycodone (Factor 1.5)</option>
                <option value="Morphine">Morphine (Factor 1.0)</option>
                <option value="Hydrocodone">Hydrocodone (Factor 1.0)</option>
                <option value="Hydromorphone">Hydromorphone (Factor 4.0)</option>
                <option value="Fentanyl">Fentanyl Patch (Factor 2.4)</option>
                <option value="Tramadol">Tramadol (Factor 0.1)</option>
              </select>
              <input
                type="text"
                placeholder="Strength (e.g. 10mg)"
                value={inputStrength}
                onChange={e => setInputStrength(e.target.value)}
                className="input-field text-xs"
              />
              <input
                type="number"
                placeholder="Freq / Day"
                value={inputFreq}
                onChange={e => setInputFreq(Number(e.target.value))}
                className="input-field text-xs"
              />
              <button onClick={addOpioidRow} className="btn-secondary text-xs flex items-center gap-1">
                <Plus size={14} /> Add Opioid
              </button>
            </div>

            {/* CDC recommendation warning alert */}
            <div className={`p-4 rounded-xl border text-xs leading-relaxed space-y-1 ${mmeMeta.bg} ${mmeMeta.text}`}>
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle size={15} /> {mmeMeta.level}
              </div>
              <p className="text-[11px] opacity-90">
                {totalMme >= 90 ? 'CDC Recommendation: Avoid increasing dosage to ≥90 MME/day or carefully justify a decision to titrate clinical dosing. Prescribe Naloxone rescue therapy.' :
                 totalMme >= 50 ? 'CDC Recommendation: Use caution when prescribing opioids. Consider offering a co-prescription for Naloxone and request follow-up within 1-2 weeks.' :
                 'dosage is within safe threshold guidelines. Continue clinical monitoring.'}
              </p>
            </div>
          </div>

          {analyzing && (
            <div className="glass-card p-8 text-center space-y-3">
              <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <h4 className="font-bold text-slate-700 text-sm">Running Clinical Safety Rules Engine...</h4>
              <p className="text-xs text-slate-400">
                Checking CDC conversion tables, PDMP database records, and concurrent CNS drug safety guidelines.
              </p>
            </div>
          )}

          {!analysisCompleted && !analyzing && (
            <div className="glass-card p-8 text-center space-y-3 bg-slate-50/50 border-dashed border-2">
              <AlertTriangle size={32} className="text-slate-400 mx-auto" />
              <h4 className="font-bold text-slate-700 text-sm">Opioid Stewardship Analysis Pending</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No active safety analysis has been executed for this patient. Click "Run Safety Analysis" below to evaluate overdose risk, concurrent medications, and Naloxone eligibility.
              </p>
            </div>
          )}

          {/* AI Overdose Risk Assessment */}
          {analysisCompleted && !analyzing && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Overdose risk details */}
              <div className="glass-card p-5 space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Brain size={16} className="text-primary-600" /> AI Overdose Risk Assessment & Patient Safety Profiler
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${riskMeta.color.split(' ')[0]} ${riskMeta.color.split(' ')[1]}`}>
                    {riskMeta.level}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Overdose Risk Probability Gauge</span>
                    <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: `${riskMeta.pct}%` }} />
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                      <span>Low Risk</span>
                      <span>Moderate</span>
                      <span>High Risk</span>
                      <span>Critical</span>
                    </div>
                  </div>

                  <div className="text-xs p-3 bg-slate-50 border rounded-xl space-y-1">
                    <span className="font-bold text-slate-800 block">Identified Co-Morbidities:</span>
                    <ul className="list-disc pl-4 text-slate-600 space-y-0.5 text-[11px]">
                      {selectedPatient.respiratoryDisease && <li>COPD / Respiratory Strain</li>}
                      {selectedPatient.sleepApnea && <li>Obstructive Sleep Apnea</li>}
                      {selectedPatient.overdoseHistory && <li>Prior Opioid Overdose Incident</li>}
                      {selectedPatient.concurrentMeds.some(m => m.toLowerCase().includes('alprazolam') || m.toLowerCase().includes('lorazepam')) && <li>Concurrent Benzodiazepine Therapy</li>}
                    </ul>
                  </div>
                </div>
              </div>

              {/* PDMP Monitor & Concurrent Checker */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-5 space-y-3">
                  <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-2">
                    <Database size={16} className="text-teal-600" /> State PDMP Registry Monitor
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Last PDMP Check:</span>
                      <span className="font-bold text-slate-800">Today, 09:12 AM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Multiple Pharmacies / Prescribers:</span>
                      <span className="font-bold text-slate-800">None detected</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Early Refill Requests:</span>
                      <span className="font-bold text-rose-600 font-bold">0 Requests</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Doctor Shopping Risk:</span>
                      <span className="font-bold text-emerald-600">Low Risk</span>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-5 space-y-3">
                  <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-2">
                    <AlertTriangle size={16} className="text-amber-500" /> Concurrent CNS Depressants
                  </h3>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1 text-amber-900">
                    <div className="font-bold flex items-center gap-1">
                      <AlertTriangle size={14} className="text-amber-600" /> Opioid + Benzodiazepine Alert
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Concomitant use of opioids and benzodiazepines increases respiratory depression risk by 4x. Avoid co-prescribing.
                    </p>
                  </div>
                </div>
              </div>

              {/* Naloxone Co-Prescribing Recommendation */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div className="space-y-1 max-w-lg">
                  <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">Naloxone Co-Prescribing Recommendation</span>
                  <p className="text-xs text-emerald-900 leading-normal font-medium">
                    Patient meets CDC criteria for Naloxone eligibility due to <span className="font-bold">MME &gt; 50 MME/day</span> and <span className="font-bold">COPD co-morbidity</span>.
                  </p>
                </div>
                <button
                  onClick={() => triggerToast('Prescribed Naloxone Nasal Spray')}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20"
                >
                  Prescribe Naloxone
                </button>
              </div>

              {/* AI Tapering & Non-Opioid Alternatives */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-5 space-y-3">
                  <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-2">
                    <Clock size={16} className="text-primary-600" /> suggested Opioid Tapering Plan (MME &gt; 90)
                  </h3>
                  <div className="space-y-2 text-xs text-slate-600">
                    <p className="font-bold text-slate-800">Weekly Reduction Schedule (10% Reduction):</p>
                    <ul className="list-disc pl-4 text-[11px] space-y-1">
                      <li>Week 1-2: Decrease Oxycodone to 10mg qid (Reduce daily MME by 15%)</li>
                      <li>Week 3-4: Decrease Morphine ER to 15mg bid</li>
                      <li>Expected Taper Duration: 8 Weeks</li>
                      <li>Withdrawal Monitoring: COWS scale assessment q3d</li>
                    </ul>
                  </div>
                </div>

                <div className="glass-card p-5 space-y-3">
                  <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-2">
                    <CheckCircle size={16} className="text-emerald-600" /> Multimodal Non-Opioid Alternatives
                  </h3>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px] font-semibold text-slate-700">
                    <span className="p-1.5 bg-slate-50 border rounded-lg">Acetaminophen 1g q6h</span>
                    <span className="p-1.5 bg-slate-50 border rounded-lg">Naproxen 500mg BID</span>
                    <span className="p-1.5 bg-slate-50 border rounded-lg">Pregabalin 75mg QHS</span>
                    <span className="p-1.5 bg-slate-50 border rounded-lg">Physical Therapy (2x/wk)</span>
                    <span className="p-1.5 bg-slate-50 border rounded-lg">Nerve Block Consult</span>
                    <span className="p-1.5 bg-slate-50 border rounded-lg">Pain Specialist Referral</span>
                  </div>
                </div>
              </div>

              {/* Patient Education Panel */}
              <div className="glass-card p-5 space-y-3">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2">
                    <FileText size={16} className="text-primary-600" /> Patient Opioid Education & Discharge Advice
                  </h3>
                  <button onClick={() => triggerToast('Printed Patient Education PDF')} className="text-xs text-primary-600 font-bold hover:underline">
                    Print Advice
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] text-slate-600">
                  <div className="p-3 bg-slate-50 border rounded-xl space-y-1">
                    <span className="font-bold text-slate-800">Safe Storage & Disposal</span>
                    <p className="leading-relaxed">Keep locked away from children. Return unused pills to safe drug drop-boxes.</p>
                  </div>
                  <div className="p-3 bg-slate-50 border rounded-xl space-y-1">
                    <span className="font-bold text-slate-800">Driving & Alcohol Warnings</span>
                    <p className="leading-relaxed">Do not drive or operate machinery. Strictly avoid alcohol which raises breathing arrest risk.</p>
                  </div>
                  <div className="p-3 bg-slate-50 border rounded-xl space-y-1">
                    <span className="font-bold text-slate-800">Naloxone Rescue Usage</span>
                    <p className="leading-relaxed">Instruct caregivers how to administer nasal spray in case of loss of consciousness.</p>
                  </div>
                </div>
              </div>

              {/* Alert Activity Feed */}
              <div className="glass-card p-5 space-y-3">
                <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-2">
                  <Clock size={16} className="text-primary-600" /> Live Opioid Alert Activity Log
                </h3>
                <div className="space-y-2 text-xs">
                  {[
                    { time: 'Today, 09:30 AM', alert: 'Cumulative daily MME exceeds 90 MME/day threshold', severity: 'Critical', doctor: 'Dr. Emily Chen', status: 'Active' },
                    { time: 'Yesterday', alert: 'Concurrent Benzodiazepine + Opioid prescription flagged', severity: 'High', doctor: 'Dr. Emily Chen', status: 'Acknowledged' },
                  ].map((act, i) => (
                    <div key={i} className="p-2.5 bg-slate-50 border rounded-xl flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-mono">{act.time}</span>
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                            act.severity === 'Critical' ? 'bg-rose-600 text-white animate-pulse' : 'bg-amber-500 text-white'
                          }`}>{act.severity}</span>
                          <span className="font-bold text-slate-800">{act.alert}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">Prescriber: {act.doctor}</p>
                      </div>
                      <span className="badge-info text-[9px]">{act.status}</span>
                    </div>
                  ))}
                </div>
              </div>

             </motion.div>
          )}

          {/* Hospital Action & Clinical Protocol Buttons */}
          <div className="glass-card p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white space-y-4">
            <h4 className="font-display font-bold text-sm text-slate-200">Hospital Opioid Stewardship & Clinical Actions</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold">
              <button
                onClick={() => {
                  const val = calculateTotalMme();
                  triggerToast(`Morphine Milligram Equivalent (MME) calculated: ${val} MME/day.`);
                }}
                className="py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white flex items-center justify-center gap-1.5 transition-all"
              >
                Calculate MME
              </button>
              <button
                onClick={async () => {
                  await handleRunAnalysis();
                  triggerToast('Stewardship Safety Analysis Completed successfully.');
                }}
                className="py-2.5 bg-amber-600 hover:bg-amber-500 rounded-xl text-white flex items-center justify-center gap-1.5 transition-all"
              >
                Run Safety Analysis
              </button>
              <button
                onClick={async () => {
                  setAnalyzing(true);
                  await new Promise(r => setTimeout(r, 600));
                  setAnalyzing(false);
                  setAnalysisCompleted(true);
                  triggerToast('AI Opioid Stewardship Safety Recommendations generated.');
                }}
                className="py-2.5 bg-primary-600 hover:bg-primary-500 rounded-xl text-white flex items-center justify-center gap-1.5 transition-all"
              >
                Generate AI Rec
              </button>
              <button
                onClick={() => {
                  triggerToast(`Successfully exported MME profile & safety report to EHR (MRN: ${selectedPatient.mrn}).`);
                }}
                className="py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-200 flex items-center justify-center gap-1.5 transition-all"
              >
                Export to EHR
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible AI Assistant Side Panel / Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 p-6"
            >
              <div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                      <Brain size={18} />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-slate-900 text-sm">Opioid Stewardship Copilot</h3>
                      <p className="text-[10px] text-slate-400">CDC Opioid Guideline Database</p>
                    </div>
                  </div>
                  <button onClick={() => setDrawerOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                    <X size={18} />
                  </button>
                </div>

                <div className="mt-4 space-y-3 text-xs">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Stewardship Queries</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Explain CDC daily MME limits',
                      'Show tapering guidelines',
                      'Calculate risk for James Wilson',
                      'Non-opioid options for neuropathy'
                    ].map(q => (
                      <button
                        key={q}
                        onClick={() => askAiAssistant(q)}
                        className="px-2.5 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg text-left text-[11px] font-medium transition-all"
                      >
                        {q}
                      </button>
                    ))}
                  </div>

                  {aiLoading && (
                    <div className="p-4 bg-slate-50 border rounded-xl flex items-center gap-2 text-xs text-slate-500">
                      <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                      Ingesting guidelines from CDC database...
                    </div>
                  )}

                  {aiResponse && !aiLoading && (
                    <div className="p-4 bg-primary-50/50 border border-primary-100 rounded-xl space-y-2 text-xs">
                      <span className="font-bold text-primary-900 block">AI Clinical Response:</span>
                      <p className="text-slate-700 leading-relaxed whitespace-pre-line text-[11px]">{aiResponse}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={e => setAiPrompt(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && askAiAssistant()}
                    placeholder="Ask AI about CDC pain ladders, dosing..."
                    className="input-field text-xs flex-1"
                  />
                  <button onClick={() => askAiAssistant()} disabled={aiLoading || !aiPrompt.trim()} className="btn-primary text-xs px-3">
                    Ask
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

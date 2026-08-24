import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, AlertTriangle, ShieldCheck, CheckCircle, Activity, Heart,
  FileText, Zap, Search, RefreshCw, X, Download, Printer, Send, Share2,
  ChevronRight, Info, AlertCircle, ChevronDown, BookOpen, Clock, Stethoscope,
  Filter, Check, User, Pill, ArrowUpRight, ArrowDownRight, Sliders, MessageSquare, Layers
} from 'lucide-react';
import { MetricCard } from '../common/MetricCard';
import { askMedAI } from '../../services/azureOpenAI';

interface PatientProfile {
  id: string;
  name: string;
  mrn: string;
  age: number;
  gender: string;
  weight: string;
  height: string;
  ward: string;
  bed: string;
  diagnosis: string;
  doctor: string;
  bloodGroup: string;
  pregnancy: string;
  currentMeds: string[];
  allergies: { drug: string; reaction: string; severity: 'Critical' | 'High' | 'Moderate' }[];
  eGFR: number;
  creatinine: number;
  liverFunction: string;
  childPugh: string;
  vitals: {
    hr: number;
    bp: string;
    temp: string;
    rr: number;
    spo2: number;
    bmi: number;
    inr: number;
    hba1c: number;
    potassium: number;
    ast: number;
    alt: number;
    wbc: number;
    hb: number;
    platelets: number;
    sodium: number;
    troponin: number;
    crp: number;
  };
}

const mockPatients: PatientProfile[] = [
  {
    id: 'p001',
    name: 'James Wilson',
    mrn: 'MRN-482109',
    age: 67,
    gender: 'Male',
    weight: '78 kg',
    height: '175 cm',
    ward: 'Cardiology 4B',
    bed: 'Bed 4B-12',
    diagnosis: 'COPD Exacerbation & CHF (NYHA Class III)',
    doctor: 'Dr. Emily Chen, FACC',
    bloodGroup: 'A Positive',
    pregnancy: 'N/A',
    currentMeds: ['Warfarin 5mg QD', 'Aspirin 81mg QD', 'Lisinopril 10mg QD', 'Metformin 500mg BID', 'Furosemide 40mg QD'],
    allergies: [
      { drug: 'Penicillin', reaction: 'Anaphylaxis & Laryngeal Edema', severity: 'Critical' },
      { drug: 'Sulfa Drugs', reaction: 'Severe Urticarial Rash', severity: 'High' }
    ],
    eGFR: 42,
    creatinine: 1.8,
    liverFunction: 'Mildly Elevated Transaminases',
    childPugh: 'Class A (Score 5)',
    vitals: {
      hr: 98,
      bp: '142/88',
      temp: '101.2°F',
      rr: 24,
      spo2: 87,
      bmi: 25.5,
      inr: 2.8,
      hba1c: 7.4,
      potassium: 4.9,
      ast: 48,
      alt: 52,
      wbc: 14.2,
      hb: 11.4,
      platelets: 240,
      sodium: 138,
      troponin: 0.01,
      crp: 18.4
    }
  },
  {
    id: 'p002',
    name: 'Sarah Chen',
    mrn: 'MRN-334281',
    age: 54,
    gender: 'Female',
    weight: '62 kg',
    height: '162 cm',
    ward: 'Endocrinology 6A',
    bed: 'Bed 6A-04',
    diagnosis: 'Type 2 Diabetes Mellitus — Hyperglycemia',
    doctor: 'Dr. James Park, MD',
    bloodGroup: 'O Positive',
    pregnancy: 'Not Pregnant',
    currentMeds: ['Insulin Glargine 20u QHS', 'Metformin 1000mg BID', 'Atorvastatin 40mg QD'],
    allergies: [{ drug: 'Codeine', reaction: 'Severe Nausea & Vomiting', severity: 'Moderate' }],
    eGFR: 88,
    creatinine: 0.9,
    liverFunction: 'Normal Transaminases',
    childPugh: 'Class A (Score 5)',
    vitals: {
      hr: 82,
      bp: '128/76',
      temp: '98.6°F',
      rr: 16,
      spo2: 97,
      bmi: 23.6,
      inr: 1.0,
      hba1c: 9.1,
      potassium: 4.2,
      ast: 22,
      alt: 24,
      wbc: 7.8,
      hb: 13.2,
      platelets: 280,
      sodium: 140,
      troponin: 0.005,
      crp: 2.1
    }
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
    bed: 'Bed 3D-02',
    diagnosis: 'Severe Sepsis & Acute Kidney Injury (AKI Stage 2)',
    doctor: 'Dr. Sarah Jenkins, FCCP',
    bloodGroup: 'B Positive',
    pregnancy: 'N/A',
    currentMeds: ['Meropenem 1g IV q8h', 'Vancomycin 1.5g IV q12h', 'Norepinephrine 0.05 mcg/kg/min'],
    allergies: [{ drug: 'Heparin', reaction: 'HIT Type II (Thrombocytopenia)', severity: 'Critical' }],
    eGFR: 24,
    creatinine: 2.9,
    liverFunction: 'Moderate Transaminitis',
    childPugh: 'Class B (Score 8)',
    vitals: {
      hr: 104,
      bp: '108/64',
      temp: '102.4°F',
      rr: 28,
      spo2: 93,
      bmi: 29.1,
      inr: 1.6,
      hba1c: 6.8,
      potassium: 5.4,
      ast: 84,
      alt: 92,
      wbc: 18.9,
      hb: 9.8,
      platelets: 110,
      sodium: 134,
      troponin: 0.08,
      crp: 42.1
    }
  }
];

export const ClinicalDecisionModule: React.FC = () => {
  const [selectedPatient, setSelectedPatient] = useState<PatientProfile>(mockPatients[0]);

  // Medication Analysis Form State
  const [medName, setMedName] = useState('Amoxicillin-Clavulanate');
  const [dose, setDose] = useState('875/125 mg');
  const [frequency, setFrequency] = useState('BID (Twice daily)');
  const [route, setRoute] = useState('Oral');
  const [duration, setDuration] = useState('7 Days');
  const [prescriber, setPrescriber] = useState('Dr. Emily Chen');

  const [analyzing, setAnalyzing] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(true);

  // Collapsible AI Assistant Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Action status notification
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setAnalysisDone(false);
    await new Promise(r => setTimeout(r, 800));
    setAnalyzing(false);
    setAnalysisDone(true);
  };

  const handleClear = () => {
    setMedName('');
    setDose('');
    setFrequency('QD');
    setRoute('Oral');
    setDuration('');
    setAnalysisDone(false);
  };

  const handleLoadPrescription = () => {
    setMedName('Warfarin + Aspirin + Amoxicillin');
    setDose('5mg / 81mg / 875mg');
    setFrequency('Daily');
    setRoute('Oral');
    setDuration('14 Days');
    setAnalysisDone(true);
  };

  const triggerAction = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const queryAiAssistant = async (queryText?: string) => {
    const text = queryText || aiPrompt;
    if (!text.trim()) return;
    setAiLoading(true);
    setAiPrompt('');
    setDrawerOpen(true);
    try {
      const ans = await askMedAI(
        `CDSS Context for ${selectedPatient.name} (eGFR: ${selectedPatient.eGFR}, Cr: ${selectedPatient.creatinine}): ${text}`,
        'clinical'
      );
      setAiResponse(ans);
    } catch (e) {
      setAiResponse('Unable to connect to Azure OpenAI Medical Knowledge Engine.');
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
            Clinical Decision Support System (CDSS) <Brain className="text-primary-600 animate-pulse" />
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time AI powered clinical decision support for medication safety, diagnosis assistance, protocol compliance and evidence-based treatment recommendations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDrawerOpen(true)}
            className="btn-primary text-xs flex items-center gap-1.5 shadow-md shadow-primary-500/20"
          >
            <MessageSquare size={14} />
            <span>AI Clinical Assistant</span>
          </button>
          <button
            onClick={() => triggerAction('Refreshed CDSS Rules Engine')}
            className="btn-secondary text-xs flex items-center gap-1.5"
          >
            <RefreshCw size={13} />
            <span>Sync EHR</span>
          </button>
        </div>
      </div>

      {/* Action Notification Toast */}
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
            <span className="text-[10px] font-extrabold uppercase">Active Alerts</span>
            <AlertTriangle size={14} className="text-rose-500" />
          </div>
          <div className="text-lg font-bold font-display text-slate-900">48 Today</div>
          <div className="text-[10px] text-rose-600 font-semibold">6 Critical · -12% vs yesterday</div>
        </div>

        <div className="glass-card p-3.5 space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-extrabold uppercase">Drug Interactions</span>
            <Pill size={14} className="text-amber-500" />
          </div>
          <div className="text-lg font-bold font-display text-slate-900">14 Prevented</div>
          <div className="text-[10px] text-amber-600 font-semibold">4 High · 9 Mod · 18 Low</div>
        </div>

        <div className="glass-card p-3.5 space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-extrabold uppercase">Dose Adjustments</span>
            <Sliders size={14} className="text-teal-500" />
          </div>
          <div className="text-lg font-bold font-display text-slate-900">23 Modifiers</div>
          <div className="text-[10px] text-teal-600 font-semibold">12 Renal · 3 Hepatic · 8 Wt</div>
        </div>

        <div className="glass-card p-3.5 space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-extrabold uppercase">Guideline Adherence</span>
            <CheckCircle size={14} className="text-emerald-500" />
          </div>
          <div className="text-lg font-bold font-display text-slate-900">98.4%</div>
          <div className="text-[10px] text-emerald-600 font-semibold">99.2% Today Protocol</div>
        </div>

        <div className="glass-card p-3.5 space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-extrabold uppercase">Allergy Alerts</span>
            <AlertCircle size={14} className="text-rose-500" />
          </div>
          <div className="text-lg font-bold font-display text-slate-900">3 Active</div>
          <div className="text-[10px] text-rose-600 font-semibold">1 Critical (Penicillin)</div>
        </div>

        <div className="glass-card p-3.5 space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-extrabold uppercase">AI Recs Accepted</span>
            <Brain size={14} className="text-primary-500" />
          </div>
          <div className="text-lg font-bold font-display text-slate-900">93.3%</div>
          <div className="text-[10px] text-primary-600 font-semibold">42 Accepted / 3 Ignored</div>
        </div>

        <div className="glass-card p-3.5 space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-extrabold uppercase">High Risk Patients</span>
            <UsersIcon size={14} className="text-purple-500" />
          </div>
          <div className="text-lg font-bold font-display text-slate-900">12 Patients</div>
          <div className="text-[10px] text-purple-600 font-semibold">5 ICU · 3 ED · 4 Obs</div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Patient Selection & Summary */}
        <div className="lg:col-span-4 space-y-6">
          {/* Patient Selector Card */}
          <div className="glass-card p-5 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2">
                <User size={16} className="text-primary-600" /> Active Patient Selection
              </h3>
              <span className="badge-info text-[10px]">EHR Synced</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Select Patient Profile</label>
                <select
                  value={selectedPatient.id}
                  onChange={e => setSelectedPatient(mockPatients.find(p => p.id === e.target.value) || mockPatients[0])}
                  className="input-field text-xs font-semibold"
                >
                  {mockPatients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.mrn}) — {p.ward}</option>
                  ))}
                </select>
              </div>

              {/* Patient Card Details */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-sm text-slate-900">{selectedPatient.name}</span>
                  <span className="text-[10px] font-bold bg-primary-100 text-primary-700 px-2 py-0.5 rounded">{selectedPatient.mrn}</span>
                </div>

                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-slate-600">
                  <div><span className="text-slate-400">Age/Gender:</span> {selectedPatient.age}y / {selectedPatient.gender}</div>
                  <div><span className="text-slate-400">Wt/Ht:</span> {selectedPatient.weight} / {selectedPatient.height}</div>
                  <div><span className="text-slate-400">Location:</span> {selectedPatient.ward} ({selectedPatient.bed})</div>
                  <div><span className="text-slate-400">Blood Group:</span> {selectedPatient.bloodGroup}</div>
                  <div className="col-span-2"><span className="text-slate-400">Attending MD:</span> {selectedPatient.doctor}</div>
                  <div className="col-span-2"><span className="text-slate-400">Diagnosis:</span> <span className="font-semibold text-slate-800">{selectedPatient.diagnosis}</span></div>
                  <div><span className="text-slate-400">Pregnancy:</span> {selectedPatient.pregnancy}</div>
                  <div><span className="text-slate-400">Liver Class:</span> {selectedPatient.childPugh}</div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase block mb-1">Active Prescriptions ({selectedPatient.currentMeds.length})</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedPatient.currentMeds.map(m => (
                      <span key={m} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-medium text-slate-700">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[10px] font-extrabold text-rose-500 uppercase block mb-1">Documented Allergies</span>
                  <div className="space-y-1">
                    {selectedPatient.allergies.map(a => (
                      <div key={a.drug} className="p-1.5 bg-rose-50 border border-rose-200 rounded text-[10px] flex justify-between items-center text-rose-900 font-bold">
                        <span>{a.drug} ({a.reaction})</span>
                        <span className="bg-rose-600 text-white px-1.5 py-0.2 rounded text-[9px]">{a.severity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Compact Vitals & Labs Summary Grid */}
          <div className="glass-card p-5 space-y-3">
            <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-2">
              <Activity size={16} className="text-teal-600" /> Patient Vitals & Critical Biomarkers
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { label: 'Heart Rate', val: `${selectedPatient.vitals.hr} bpm`, warn: selectedPatient.vitals.hr > 95 },
                { label: 'Blood Pressure', val: selectedPatient.vitals.bp, warn: true },
                { label: 'Temperature', val: selectedPatient.vitals.temp, warn: true },
                { label: 'Resp Rate', val: `${selectedPatient.vitals.rr} /min`, warn: selectedPatient.vitals.rr > 20 },
                { label: 'SpO2 Saturation', val: `${selectedPatient.vitals.spo2}%`, warn: selectedPatient.vitals.spo2 < 90 },
                { label: 'BMI Index', val: `${selectedPatient.vitals.bmi}`, warn: false },
                { label: 'Creatinine', val: `${selectedPatient.creatinine} mg/dL`, warn: selectedPatient.creatinine > 1.2 },
                { label: 'eGFR Clearance', val: `${selectedPatient.eGFR} mL/min`, warn: selectedPatient.eGFR < 60 },
                { label: 'INR Ratio', val: `${selectedPatient.vitals.inr}`, warn: selectedPatient.vitals.inr > 2.5 },
                { label: 'HbA1c', val: `${selectedPatient.vitals.hba1c}%`, warn: selectedPatient.vitals.hba1c > 7.0 },
                { label: 'Potassium K+', val: `${selectedPatient.vitals.potassium} mEq/L`, warn: false },
                { label: 'AST / ALT', val: `${selectedPatient.vitals.ast}/${selectedPatient.vitals.alt} U/L`, warn: true },
              ].map(v => (
                <div key={v.label} className={`p-2 rounded-xl border text-center ${v.warn ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100'}`}>
                  <div className={`text-xs font-bold ${v.warn ? 'text-amber-800' : 'text-slate-800'}`}>{v.val}</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">{v.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Medication Safety Analysis & AI Reports */}
        <div className="lg:col-span-8 space-y-6">
          {/* Medication Safety Input Form */}
          <div className="glass-card p-5 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Pill size={16} className="text-primary-600" /> Multi-Drug Medication Safety Evaluator
                </h3>
                <p className="text-xs text-slate-400">Simulate order entry, check interactions, duplicate therapy, and renal/hepatic dosing</p>
              </div>
              <div className="flex gap-2">
                <button onClick={handleLoadPrescription} className="btn-secondary text-xs">
                  Load Current Prescription
                </button>
                <button onClick={handleClear} className="btn-secondary text-xs text-slate-500">
                  Clear
                </button>
              </div>
            </div>

            <form onSubmit={e => { e.preventDefault(); handleAnalyze(); }} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Medication Name / Combination</label>
                  <input
                    type="text"
                    value={medName}
                    onChange={e => setMedName(e.target.value)}
                    placeholder="e.g., Amoxicillin-Clavulanate / Warfarin + Aspirin"
                    className="input-field text-xs font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Dose & Unit</label>
                  <input
                    type="text"
                    value={dose}
                    onChange={e => setDose(e.target.value)}
                    placeholder="e.g., 875/125 mg"
                    className="input-field text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Frequency</label>
                  <select value={frequency} onChange={e => setFrequency(e.target.value)} className="input-field text-xs">
                    <option value="BID (Twice daily)">BID (Twice daily)</option>
                    <option value="QD (Once daily)">QD (Once daily)</option>
                    <option value="TID (Three times daily)">TID (Three times daily)</option>
                    <option value="QHS (Bedtime)">QHS (Bedtime)</option>
                    <option value="PRN (As needed)">PRN (As needed)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Route</label>
                  <select value={route} onChange={e => setRoute(e.target.value)} className="input-field text-xs">
                    <option value="Oral">Oral (PO)</option>
                    <option value="Intravenous">Intravenous (IV)</option>
                    <option value="Subcutaneous">Subcutaneous (SubQ)</option>
                    <option value="Inhalation">Inhalation</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Duration</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                    placeholder="e.g., 7 Days"
                    className="input-field text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Prescribing Physician</label>
                  <input
                    type="text"
                    value={prescriber}
                    onChange={e => setPrescriber(e.target.value)}
                    className="input-field text-xs"
                  />
                </div>
              </div>

              <button type="submit" disabled={analyzing} className="btn-primary text-xs w-full justify-center py-2.5 shadow-md shadow-primary-500/20">
                {analyzing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Analyzing Medication Safety Rules & Clinical Guidelines...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 font-bold">
                    <Zap size={14} /> Analyze Medication Safety & Clinical CDSS Rules
                  </div>
                )}
              </button>
            </form>
          </div>

          {/* AI Clinical Analysis Report */}
          {analysisDone && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Allergy Warning Box */}
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rose-800 font-extrabold text-xs">
                    <AlertCircle size={16} /> CRITICAL DRUG ALLERGY DETECTED
                  </div>
                  <span className="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-extrabold">CRITICAL SEVERITY</span>
                </div>
                <p className="text-xs text-rose-900 leading-relaxed font-medium">
                  Patient <span className="font-bold">{selectedPatient.name}</span> has a documented <span className="font-bold">Penicillin (Anaphylaxis & Laryngeal Edema)</span> allergy.
                  Prescribed medication <span className="font-bold">Amoxicillin-Clavulanate</span> belongs to the Penicillin beta-lactam class.
                </p>
                <div className="pt-2 border-t border-rose-200 flex items-center justify-between text-xs">
                  <span className="font-bold text-rose-800">Suggested Safe Alternative:</span>
                  <span className="font-extrabold text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-rose-200">
                    Azithromycin 500mg Day 1 then 250mg QD x 4 Days OR Doxycycline 100mg BID
                  </span>
                </div>
              </div>

              {/* Drug-Drug Interaction Report */}
              <div className="glass-card p-5 space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2">
                    <AlertTriangle size={16} className="text-amber-500" /> Drug-Drug Interaction Analysis
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold bg-rose-100 text-rose-800 px-2 py-0.5 rounded">Severity: Critical</span>
                    <span className="text-[10px] font-extrabold bg-primary-100 text-primary-700 px-2 py-0.5 rounded">Confidence: 98%</span>
                  </div>
                </div>

                <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2 text-xs">
                  <div className="font-bold text-slate-800 text-xs">Warfarin 5mg QD + Aspirin 81mg QD</div>
                  <p className="text-slate-700 leading-relaxed">
                    <span className="font-bold text-rose-700">Risk: Major Bleeding.</span> Concomitant administration of oral anticoagulant (Warfarin) and antiplatelet agent (Aspirin) synergistically increases major gastrointestinal and intracranial hemorrhage risk.
                  </p>
                  <div className="pt-2 border-t border-amber-200 grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                    <div>
                      <span className="font-bold text-slate-700 block">Clinical Recommendation:</span>
                      <p className="text-slate-600">Monitor INR every 24 hours. Consider replacing Aspirin with Clopidogrel 75mg daily if clinically indicated, or add PPI gastroprotection.</p>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700 block">Evidence & Guideline Source:</span>
                      <p className="text-slate-600">ACC/AHA 2024 Antithrombotic Guidelines & CHEST 2023 (Class I, Level A Evidence).</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Duplicate Therapy Detector */}
              <div className="glass-card p-5 space-y-3">
                <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-2">
                  <Layers size={16} className="text-amber-600" /> Duplicate Therapy Detector
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 border rounded-xl space-y-1">
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>Duplicate Antiplatelet / Anticoagulants</span>
                      <span className="badge-danger text-[9px]">High Risk</span>
                    </div>
                    <p className="text-[11px] text-slate-600">Warfarin + Aspirin active simultaneously. Discontinue redundant agent unless dual therapy protocol is documented.</p>
                  </div>
                  <div className="p-3 bg-slate-50 border rounded-xl space-y-1">
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>NSAID / Opioid / Antibiotic Duplication</span>
                      <span className="badge-success text-[9px]">Clear</span>
                    </div>
                    <p className="text-[11px] text-slate-600">No duplicate NSAID or dual-opioid therapy detected in active inpatient orders.</p>
                  </div>
                </div>
              </div>

              {/* Renal & Hepatic Dose Adjustment Panels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Renal Panel */}
                <div className="glass-card p-5 space-y-3">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2">
                      <Sliders size={16} className="text-teal-600" /> Renal Dose Adjustment
                    </h3>
                    <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded">eGFR: 42 mL/min</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-teal-50/50 border border-teal-100 rounded-xl space-y-1">
                      <div className="flex justify-between font-bold text-slate-800">
                        <span>Vancomycin IV Dosing Modifier</span>
                        <span className="text-teal-700 font-bold">Cr: 1.8 mg/dL</span>
                      </div>
                      <div className="text-[11px] text-slate-600">
                        Current Dose: <span className="line-through text-rose-600 font-bold">1,500mg IV q12h</span><br />
                        Recommended: <span className="font-bold text-emerald-700">1,000mg IV q24h</span>
                      </div>
                      <p className="text-[10px] text-slate-500 pt-1">
                        Adjustment Formula: Cockcroft-Gault CrCl (44.5 mL/min) · KDIGO 2024 CKD Guidelines.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Hepatic Panel */}
                <div className="glass-card p-5 space-y-3">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2">
                      <Activity size={16} className="text-amber-600" /> Hepatic Dose Adjustment
                    </h3>
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">Child-Pugh A</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl space-y-1">
                      <div className="flex justify-between font-bold text-slate-800">
                        <span>Atorvastatin Dosing Guidance</span>
                        <span className="text-amber-700 font-bold">AST 48 / ALT 52</span>
                      </div>
                      <div className="text-[11px] text-slate-600">
                        Current Dose: <span className="font-bold text-slate-800">40mg QD</span><br />
                        Recommended: <span className="font-bold text-emerald-700">Max 20mg QD</span> due to mild transaminitis.
                      </div>
                      <p className="text-[10px] text-slate-500 pt-1">
                        Re-check LFTs in 4 weeks. Discontinue if transaminases exceed 3x ULN.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Treatment Recommendation & Clinical Protocols Tracker */}
              <div className="glass-card p-5 space-y-4">
                <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2 border-b pb-3">
                  <Brain size={16} className="text-primary-600" /> Comprehensive AI Treatment Protocol & Evidence Plan
                </h3>

                <div className="p-4 bg-primary-50/60 border border-primary-100 rounded-xl space-y-3 text-xs">
                  <div>
                    <span className="font-bold text-primary-900 uppercase text-[10px] tracking-wider block">Recommended Action</span>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">Switch from Amoxicillin-Clavulanate to Azithromycin 500mg IV/PO & Monitor Warfarin INR</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-700">
                    <div>
                      <span className="font-bold text-slate-900 block">Monitoring Plan:</span>
                      <p className="text-[11px]">Check daily INR, CBC with differential, eGFR, and oxygen saturation q4h.</p>
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block">Follow-up Tests:</span>
                      <p className="text-[11px]">Repeat CMP in 48 hours, Sputum culture, and Chest X-ray in 72 hours.</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-primary-200 flex flex-wrap justify-between items-center text-[10px] text-slate-500">
                    <span>Evidence Source: ACC/AHA & IDSA Guidelines (2024)</span>
                    <span className="font-extrabold text-primary-700 bg-white px-2 py-0.5 rounded border">98% AI Confidence Score</span>
                  </div>
                </div>

                {/* Protocol Tracker Grid */}
                <div className="pt-2">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase block mb-2">Hospital Clinical Protocol Compliance Tracker</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                    {[
                      { name: 'Sepsis Bundle', status: 'Completed', color: 'badge-success' },
                      { name: 'Stroke Protocol', status: 'Completed', color: 'badge-success' },
                      { name: 'ACS Care', status: 'Completed', color: 'badge-success' },
                      { name: 'Diabetes Care', status: 'Pending', color: 'badge-warning' },
                      { name: 'Hypertension', status: 'Completed', color: 'badge-success' },
                      { name: 'CKD Protocol', status: 'Overdue', color: 'badge-danger' },
                      { name: 'Anticoagulant', status: 'Pending', color: 'badge-warning' },
                    ].map(proto => (
                      <div key={proto.name} className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-center">
                        <div className="text-[10px] font-bold text-slate-800 truncate">{proto.name}</div>
                        <span className={`mt-1 text-[9px] ${proto.color}`}>{proto.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Lab Result Analysis (Normal vs Abnormal Highlighting) */}
              <div className="glass-card p-5 space-y-3">
                <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-2">
                  <Stethoscope size={16} className="text-teal-600" /> Lab Result Analysis & Automatic Abnormal Range Highlighting
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  {[
                    { test: 'WBC Count', val: '14.2 x10^3/uL', status: 'HIGH', warn: true },
                    { test: 'Hemoglobin (Hb)', val: '11.4 g/dL', status: 'LOW', warn: true },
                    { test: 'Platelet Count', val: '240 x10^3/uL', status: 'Normal', warn: false },
                    { test: 'Serum Creatinine', val: '1.8 mg/dL', status: 'HIGH', warn: true },
                    { test: 'Potassium K+', val: '4.9 mEq/L', status: 'Normal', warn: false },
                    { test: 'Sodium Na+', val: '138 mEq/L', status: 'Normal', warn: false },
                    { test: 'INR Ratio', val: '2.8 Target', status: 'Elevated', warn: true },
                    { test: 'AST / ALT', val: '48 / 52 U/L', status: 'Mild High', warn: true },
                    { test: 'Troponin I', val: '0.01 ng/mL', status: 'Normal', warn: false },
                    { test: 'C-Reactive (CRP)', val: '18.4 mg/L', status: 'HIGH', warn: true },
                  ].map(lab => (
                    <div key={lab.test} className={`p-2.5 rounded-xl border ${lab.warn ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-100'}`}>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-500">{lab.test}</span>
                        <span className={`text-[9px] font-bold ${lab.warn ? 'text-rose-600' : 'text-emerald-600'}`}>{lab.status}</span>
                      </div>
                      <div className={`text-xs font-bold mt-1 ${lab.warn ? 'text-rose-800' : 'text-slate-800'}`}>{lab.val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Risk Scores Grid (Progress Indicators) */}
              <div className="glass-card p-5 space-y-4">
                <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-3">
                  <ShieldCheck size={16} className="text-purple-600" /> Multi-Dimensional AI Clinical Risk Stratification
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {[
                    { name: 'Bleeding Risk (HAS-BLED)', score: '4 / 6', percent: 65, color: 'bg-rose-500', level: 'High Risk' },
                    { name: 'Stroke Risk (CHA2DS2-VASc)', score: '5 / 9', percent: 75, color: 'bg-rose-500', level: 'High Risk' },
                    { name: 'Sepsis Risk (qSOFA)', score: '2 / 3', percent: 60, color: 'bg-amber-500', level: 'Moderate-High' },
                    { name: 'Fall Risk (Morse Scale)', score: '45 / 125', percent: 40, color: 'bg-amber-500', level: 'Moderate' },
                    { name: 'Acute Kidney Injury (AKI)', score: 'Stage 1 AKI', percent: 70, color: 'bg-rose-500', level: 'High Watch' },
                    { name: 'ASCVD 10-Year CV Risk', score: '22.4%', percent: 80, color: 'bg-rose-500', level: 'High Risk' },
                  ].map(risk => (
                    <div key={risk.name} className="p-3 bg-slate-50 border rounded-xl space-y-2">
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-slate-800 text-[11px]">{risk.name}</span>
                        <span className="text-primary-600 text-xs">{risk.score}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className={`h-full ${risk.color} rounded-full`} style={{ width: `${risk.percent}%` }} />
                      </div>
                      <span className="text-[10px] text-slate-500 font-semibold block text-right">{risk.level}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alert Activity Timeline */}
              <div className="glass-card p-5 space-y-3">
                <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-2">
                  <Clock size={16} className="text-primary-600" /> Live Clinical Alert Activity Timeline
                </h3>

                <div className="space-y-2 text-xs">
                  {[
                    { time: '09:40 AM', alert: 'Penicillin Allergy Conflict with Amoxicillin Order', severity: 'Critical', doctor: 'Dr. Emily Chen', action: 'Alternative Suggested (Azithromycin)', status: 'Active' },
                    { time: '08:15 AM', alert: 'Warfarin + Aspirin Co-administration Bleeding Alert', severity: 'High', doctor: 'Dr. Emily Chen', action: 'INR Monitoring Requested', status: 'Acknowledged' },
                    { time: '07:30 AM', alert: 'Vancomycin Renal Dosing Adjustment Triggered', severity: 'Moderate', doctor: 'Dr. Sarah Jenkins', action: 'Dose Modified to 1,000mg q24h', status: 'Completed' },
                  ].map((act, i) => (
                    <div key={i} className="p-3 bg-slate-50 border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-400">{act.time}</span>
                          <span className={`px-2 py-0.2 rounded text-[9px] font-bold ${
                            act.severity === 'Critical' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'
                          }`}>
                            {act.severity}
                          </span>
                          <span className="font-bold text-slate-800">{act.alert}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">Action: {act.action} · Physician: {act.doctor}</p>
                      </div>
                      <span className="badge-info text-[9px] self-start sm:self-auto">{act.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hospital Action Buttons */}
              <div className="glass-card p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white space-y-4">
                <h4 className="font-display font-bold text-sm text-slate-200">Hospital Physician Order & Clinical Actions</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold">
                  <button onClick={() => triggerAction('Accepted CDSS Recommendation')} className="py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white flex items-center justify-center gap-1.5 transition-all">
                    <Check size={14} /> Accept Recommendation
                  </button>
                  <button onClick={() => triggerAction('Rejected CDSS Recommendation')} className="py-2.5 bg-rose-600 hover:bg-rose-500 rounded-xl text-white flex items-center justify-center gap-1.5 transition-all">
                    <X size={14} /> Reject Recommendation
                  </button>
                  <button onClick={() => triggerAction('Modify Prescription Drawer Opened')} className="py-2.5 bg-amber-600 hover:bg-amber-500 rounded-xl text-white flex items-center justify-center gap-1.5 transition-all">
                    <Sliders size={14} /> Modify Prescription
                  </button>
                  <button onClick={() => triggerAction('Page Sent to Attending Physician')} className="py-2.5 bg-primary-600 hover:bg-primary-500 rounded-xl text-white flex items-center justify-center gap-1.5 transition-all">
                    <Send size={14} /> Notify Physician
                  </button>
                  <button onClick={() => triggerAction('Downloaded CDSS Report PDF')} className="py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-200 flex items-center justify-center gap-1.5 transition-all">
                    <Download size={14} /> Download Report
                  </button>
                  <button onClick={() => triggerAction('Printing CDSS Report')} className="py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-200 flex items-center justify-center gap-1.5 transition-all">
                    <Printer size={14} /> Print Report
                  </button>
                  <button onClick={() => triggerAction('Pushed Order to Epic/Cerner EHR Vault')} className="py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-200 flex items-center justify-center gap-1.5 transition-all">
                    <Send size={14} /> Send to EHR
                  </button>
                  <button onClick={() => triggerAction('Dispatched Order to Inpatient Pharmacy')} className="py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-200 flex items-center justify-center gap-1.5 transition-all">
                    <Share2 size={14} /> Share with Pharmacy
                  </button>
                </div>
              </div>
            </motion.div>
          )}
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
                      <h3 className="font-display font-bold text-slate-900 text-sm">CDSS AI Assistant</h3>
                      <p className="text-[10px] text-slate-400">Azure OpenAI GPT-4 Clinical Knowledge Base</p>
                    </div>
                  </div>
                  <button onClick={() => setDrawerOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                    <X size={18} />
                  </button>
                </div>

                <div className="mt-4 space-y-3 text-xs">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Quick Physician Queries</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Explain Warfarin + Aspirin alert',
                      'Suggest alternative for Penicillin allergy',
                      'Show ACC/AHA 2024 guidelines',
                      'Generate clinical summary'
                    ].map(q => (
                      <button
                        key={q}
                        onClick={() => queryAiAssistant(q)}
                        className="px-2.5 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg text-left text-[11px] font-medium transition-all"
                      >
                        {q}
                      </button>
                    ))}
                  </div>

                  {aiLoading && (
                    <div className="p-4 bg-slate-50 border rounded-xl flex items-center gap-2 text-xs text-slate-500">
                      <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                      Consulting Azure OpenAI Knowledge Base...
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
                    onKeyDown={e => e.key === 'Enter' && queryAiAssistant()}
                    placeholder="Ask AI about drugs, guidelines, dosing..."
                    className="input-field text-xs flex-1"
                  />
                  <button onClick={() => queryAiAssistant()} disabled={aiLoading || !aiPrompt.trim()} className="btn-primary text-xs px-3">
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

function UsersIcon(props: any) {
  return <User {...props} />;
}

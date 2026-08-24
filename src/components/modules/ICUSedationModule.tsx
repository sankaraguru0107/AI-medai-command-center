import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Activity, CheckCircle, AlertTriangle, Clock, User, Heart,
  FileText, Shield, Sparkles, X, Search, RefreshCw, Download, Printer, Send,
  Share2, ClipboardList, Info, HelpCircle, BookOpen, AlertCircle, Thermometer,
  Eye, Check, ShieldAlert, Zap, ArrowRight, TrendingUp, ChevronDown, MessageSquare
} from 'lucide-react';
import { MetricCard } from '../common/MetricCard';
import { askMedAI } from '../../services/azureOpenAI';

interface BedsidePatient {
  id: string;
  name: string;
  mrn: string;
  age: number;
  gender: string;
  weight: string;
  height: string;
  bmi: number;
  bloodGroup: string;
  bed: string;
  ward: string;
  admissionDate: string;
  los: string;
  primaryDiagnosis: string;
  secondaryDiagnosis: string;
  attending: string;
  assignedNurse: string;
  codeStatus: string;
  ventStatus: string;
  isolationStatus: string;
  allergies: string;
  currentMeds: { name: string; dose: string; rate: string; start: string; target: string; status: string }[];
  renalFunction: string;
  liverFunction: string;
  gcs: number;
  gcsBreakdown: { eye: number; motor: number; verbal: number };
  rass: number;
  camIcu: string;
  icdsc: number;
  pupilSize: string; // e.g. R 3mm / L 3mm
  pupilReaction: string; // e.g. Brisk
  seizureMonitor: string; // e.g. EEG Normal
  vitals: {
    hr: number;
    bp: string;
    map: number;
    rr: number;
    temp: string;
    spo2: number;
    etco2: number;
    cvp: number;
    icp: number;
    urineOutput: number;
    glucose: number;
  };
  ventilator: {
    mode: string;
    fio2: number;
    peep: number;
    rr: number;
    pPlat: number;
    pPeak: number;
    vt: number;
    mv: number;
    compliance: number;
    syncScore: number;
  };
  labs: {
    ph: string;
    pao2: number;
    paco2: number;
    hco3: number;
    lactate: number;
    creatinine: number;
    bun: number;
    k: number;
    na: number;
    mg: number;
    ca: number;
    hb: number;
    plt: number;
    wbc: number;
    crp: number;
  };
}

const mockIcuPatients: BedsidePatient[] = [
  {
    id: 'icu-12',
    name: 'Robert Vance',
    mrn: 'MRN-902148',
    age: 61,
    gender: 'Male',
    weight: '82 kg',
    height: '178 cm',
    bmi: 25.9,
    bloodGroup: 'B Positive',
    bed: 'ICU Bed-12',
    ward: 'ICU Pod A',
    admissionDate: '2026-07-20',
    los: '8 days',
    primaryDiagnosis: 'Severe ARDS secondary to COVID-19 Pneumonia',
    secondaryDiagnosis: 'Sepsis, Type 2 Diabetes Mellitus',
    attending: 'Dr. Marcus Vance, MD, FCCM',
    assignedNurse: 'Clara Jenkins, RN, CCRN',
    codeStatus: 'Full Code',
    ventStatus: 'Mechanically Ventilated',
    isolationStatus: 'Airborne / Contact Isolation',
    allergies: 'Penicillin (Anaphylaxis)',
    currentMeds: [
      { name: 'Propofol', dose: '45 mcg/kg/min', rate: '22 mL/hr', start: '07:00 AM', target: 'Sedation / Target RASS -2', status: 'Active' },
      { name: 'Fentanyl', dose: '100 mcg/hr', rate: '5 mL/hr', start: '07:00 AM', target: 'Analgesia / CPOT < 2', status: 'Active' },
      { name: 'Dexmedetomidine', dose: '0.4 mcg/kg/hr', rate: '8 mL/hr', start: '09:30 AM', target: 'Anxiolysis / Weaning Adjunct', status: 'Weaning' }
    ],
    renalFunction: 'eGFR 72 mL/min (Mild Decline)',
    liverFunction: 'Normal (Child-Pugh A)',
    gcs: 10,
    gcsBreakdown: { eye: 3, motor: 5, verbal: 2 },
    rass: -2,
    camIcu: 'Negative',
    icdsc: 1,
    pupilSize: 'R 3mm / L 3mm',
    pupilReaction: 'Brisk / Reactive',
    seizureMonitor: 'Continuous EEG Normal / No epileptiform activity',
    vitals: {
      hr: 78,
      bp: '118/72',
      map: 87,
      rr: 16,
      temp: '98.8°F',
      spo2: 96,
      etco2: 38,
      cvp: 8,
      icp: 12,
      urineOutput: 55,
      glucose: 110
    },
    ventilator: {
      mode: 'PRVC (Volume Targeted)',
      fio2: 40,
      peep: 10,
      rr: 16,
      pPlat: 22,
      pPeak: 26,
      vt: 410,
      mv: 6.5,
      compliance: 38,
      syncScore: 96
    },
    labs: {
      ph: '7.38',
      pao2: 92,
      paco2: 41,
      hco3: 24,
      lactate: 1.1,
      creatinine: 1.1,
      bun: 22,
      k: 4.2,
      na: 138,
      mg: 2.1,
      ca: 8.8,
      hb: 10.4,
      plt: 210,
      wbc: 11.2,
      crp: 14.8
    }
  },
  {
    id: 'icu-04',
    name: 'Elena Rostova',
    mrn: 'MRN-773419',
    age: 48,
    gender: 'Female',
    weight: '65 kg',
    height: '165 cm',
    bmi: 23.9,
    bloodGroup: 'A Negative',
    bed: 'ICU Bed-04',
    ward: 'ICU Pod B',
    admissionDate: '2026-07-24',
    los: '4 days',
    primaryDiagnosis: 'Post-Cardiac Arrest / Hypoxic Brain Injury',
    secondaryDiagnosis: 'Hypothermia Protocol Completed',
    attending: 'Dr. Sarah Jenkins, FCCP',
    assignedNurse: 'David Miller, RN',
    codeStatus: 'DNR / DNI',
    ventStatus: 'Mechanically Ventilated',
    isolationStatus: 'Standard Precautions',
    allergies: 'Sulfa Drugs (Severe Rash)',
    currentMeds: [
      { name: 'Midazolam', dose: '5 mg/hr', rate: '5 mL/hr', start: '10:00 PM', target: 'Deep Sedation / RASS -4', status: 'Active' },
      { name: 'Fentanyl', dose: '150 mcg/hr', rate: '7.5 mL/hr', start: '10:00 PM', target: 'Analgesia / Pain control', status: 'Active' }
    ],
    renalFunction: 'eGFR 48 mL/min (Stage 3 CKD)',
    liverFunction: 'Mildly Elevated LFTs',
    gcs: 6,
    gcsBreakdown: { eye: 2, motor: 3, verbal: 1 },
    rass: -4,
    camIcu: 'Unable to Assess (RASS < -3)',
    icdsc: 0,
    pupilSize: 'R 2mm / L 2mm',
    pupilReaction: 'Sluggish',
    seizureMonitor: 'Continuous EEG Normal / No epileptiform activity',
    vitals: {
      hr: 62,
      bp: '105/60',
      map: 75,
      rr: 14,
      temp: '97.9°F',
      spo2: 98,
      etco2: 35,
      cvp: 10,
      icp: 18,
      urineOutput: 35,
      glucose: 140
    },
    ventilator: {
      mode: 'Volume Control (VC)',
      fio2: 35,
      peep: 8,
      rr: 14,
      pPlat: 28,
      pPeak: 32,
      vt: 390,
      mv: 5.5,
      compliance: 32,
      syncScore: 82
    },
    labs: {
      ph: '7.34',
      pao2: 110,
      paco2: 44,
      hco3: 21,
      lactate: 1.8,
      creatinine: 1.6,
      bun: 32,
      k: 4.8,
      na: 142,
      mg: 1.8,
      ca: 8.2,
      hb: 9.1,
      plt: 154,
      wbc: 14.5,
      crp: 28.1
    }
  }
];

export const ICUSedationModule: React.FC = () => {
  const [selectedPatient, setSelectedPatient] = useState<BedsidePatient>(mockIcuPatients[0]);

  // Telemetry updates
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Interactive Checklist States
  const [bundleChecks, setBundleChecks] = useState({
    pain: true,
    sat: false,
    sbt: false,
    choice: true,
    delirium: true,
    mobility: false,
    family: true
  });

  const [nursingTasks, setNursingTasks] = useState({
    oral: true,
    eye: true,
    pressure: false,
    turning: true,
    nutrition: true,
    catheter: true,
    vent: true,
    mobility: false,
    med: true
  });

  // Action status toast
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Collapsible AI Assistant Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const triggerToast = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3000);
  };

  const askAiSteward = async (queryText?: string) => {
    const text = queryText || aiPrompt;
    if (!text.trim()) return;
    setAiLoading(true);
    setAiPrompt('');
    setDrawerOpen(true);
    try {
      const resp = await askMedAI(
        `ICU Sedation RASS context for patient ${selectedPatient.name} (RASS: ${selectedPatient.rass}, GCS: ${selectedPatient.gcs}): ${text}`,
        'clinical'
      );
      setAiResponse(resp);
    } catch {
      setAiResponse('Unable to connect to Azure OpenAI critical care support network.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1700px] mx-auto relative">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
              ICU Sedation & Delirium Telemetry (RASS) <Brain className="text-violet-600 animate-pulse" />
            </h1>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            AI-powered ICU sedation monitoring, neurological assessment, delirium surveillance, ventilator synchronization, sedation optimization and critical care decision support.
          </p>
        </div>

        {/* ICU Bed status row */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-mono text-slate-700">
            TIME: {currentTime}
          </div>
          <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-700">
            ICU OCCUPANCY: <span className="text-primary-600 font-extrabold">88% (14/16 Beds)</span>
          </div>
          <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-700 flex items-center gap-1.5">
            <Activity size={14} className="text-emerald-500 animate-pulse" />
            MONITOR: <span className="text-slate-800 font-extrabold">{selectedPatient.bed} (Philips MX800)</span>
          </div>
          <button onClick={() => setDrawerOpen(true)} className="btn-primary text-xs flex items-center gap-1 shadow-md shadow-primary-500/20">
            <MessageSquare size={14} /> AI Assistant
          </button>
        </div>
      </div>

      {/* Action Toast Notification */}
      <AnimatePresence>
        {actionMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-24 right-6 z-50 p-3 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-2">
              <CheckCircle size={16} /> {actionMessage}
            </div>
            <button onClick={() => setActionMessage(null)}>
              <X size={14} className="ml-2" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top 8 KPI Dashboard Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="glass-card p-3.5 space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-slate-400">Current RASS</span>
          <div className="text-lg font-bold font-display text-slate-900">{selectedPatient.rass} Score</div>
          <div className="text-[9px] text-emerald-600 font-semibold">Target: -2 (Goal Met)</div>
        </div>

        <div className="glass-card p-3.5 space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-slate-400">BIS Monitor</span>
          <div className="text-lg font-bold font-display text-slate-900">{selectedPatient.id === 'icu-12' ? '62' : '45'} Index</div>
          <div className="text-[9px] text-teal-600 font-semibold">Optimal Target: 40-60</div>
        </div>

        <div className="glass-card p-3.5 space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-slate-400">Delirium (CAM)</span>
          <div className="text-lg font-bold font-display text-slate-900">{selectedPatient.camIcu}</div>
          <div className="text-[9px] text-slate-500 font-semibold">Next due: 14:00 PM</div>
        </div>

        <div className="glass-card p-3.5 space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-slate-400">Sedation Vacation</span>
          <div className="text-lg font-bold font-display text-slate-900">Pending</div>
          <div className="text-[9px] text-amber-600 font-semibold">SBT Schedule Overdue</div>
        </div>

        <div className="glass-card p-3.5 space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-slate-400">CPOT Pain Score</span>
          <div className="text-lg font-bold font-display text-slate-900">1 / 8 Score</div>
          <div className="text-[9px] text-emerald-600 font-semibold">Goal Met (CPOT &lt; 2)</div>
        </div>

        <div className="glass-card p-3.5 space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-slate-400">Vent Sync Score</span>
          <div className="text-lg font-bold font-display text-slate-900">{selectedPatient.ventilator.syncScore}% Sync</div>
          <div className="text-[9px] text-emerald-600 font-semibold">Synchrony: Excellent</div>
        </div>

        <div className="glass-card p-3.5 space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-slate-400">AI Sedation Risk</span>
          <div className="text-lg font-bold font-display text-slate-900">Low Risk</div>
          <div className="text-[9px] text-primary-600 font-semibold">Confidence: 94%</div>
        </div>

        <div className="glass-card p-3.5 space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-slate-400">ICU Safety Alerts</span>
          <div className="text-lg font-bold font-display text-slate-900">1 Alert</div>
          <div className="text-[9px] text-rose-600 font-semibold">1 Pending Review</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Patient Selection & Demographics Card (Left Column) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-5 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2">
                <User size={16} className="text-primary-600" /> Active Bedside Profile
              </h3>
              <select
                value={selectedPatient.id}
                onChange={e => setSelectedPatient(mockIcuPatients.find(p => p.id === e.target.value) || mockIcuPatients[0])}
                className="input-field text-xs font-semibold max-w-[150px]"
              >
                {mockIcuPatients.map(p => (
                  <option key={p.id} value={p.id}>{p.bed} ({p.name})</option>
                ))}
              </select>
            </div>

            {/* Demographics details */}
            <div className="p-4 bg-slate-50 border rounded-xl space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-slate-900">{selectedPatient.name}</span>
                <span className="text-[10px] font-bold bg-primary-100 text-primary-700 px-2 py-0.5 rounded">{selectedPatient.mrn}</span>
              </div>

              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-slate-600">
                <div><span className="text-slate-400">Age / Gender:</span> {selectedPatient.age}y / {selectedPatient.gender}</div>
                <div><span className="text-slate-400">BMI / Wt / Ht:</span> {selectedPatient.bmi} / {selectedPatient.weight} / {selectedPatient.height}</div>
                <div><span className="text-slate-400">Blood Group:</span> {selectedPatient.bloodGroup}</div>
                <div><span className="text-slate-400">Admission / LOS:</span> {selectedPatient.admissionDate} ({selectedPatient.los})</div>
                <div className="col-span-2"><span className="text-slate-400">IntensivistAttending:</span> {selectedPatient.attending}</div>
                <div className="col-span-2"><span className="text-slate-400">Assigned RN:</span> {selectedPatient.assignedNurse}</div>
                <div className="col-span-2 border-t pt-1 mt-1"><span className="text-slate-400">Diagnosis:</span> <span className="font-semibold text-slate-800">{selectedPatient.primaryDiagnosis}</span></div>
                <div className="col-span-2"><span className="text-slate-400">Vent Status:</span> <span className="font-semibold text-slate-800">{selectedPatient.ventStatus}</span></div>
                <div className="col-span-2"><span className="text-slate-400">Isolation Precautions:</span> <span className="text-rose-600 font-bold">{selectedPatient.isolationStatus}</span></div>
                <div className="col-span-2"><span className="text-slate-400">Allergies:</span> <span className="text-rose-600 font-bold">{selectedPatient.allergies}</span></div>
              </div>

              <div className="pt-2 border-t border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase">
                Active Infusions:
                <div className="mt-1 space-y-1">
                  {selectedPatient.currentMeds.map(m => (
                    <div key={m.name} className="p-1.5 bg-white border border-slate-200 rounded flex justify-between font-semibold text-slate-800 text-[10px]">
                      <span>{m.name} (@ {m.dose})</span>
                      <span className="text-primary-600 font-extrabold">{m.rate}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Telemetry Vitals Monitoring Panel */}
          <div className="glass-card p-5 space-y-3">
            <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-2">
              <Activity size={16} className="text-teal-600" /> Bedside Vital Signs Telemetry
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { label: 'Heart Rate', val: `${selectedPatient.vitals.hr} bpm`, norm: '60 - 100', status: 'Normal', warn: false },
                { label: 'BP (MAP)', val: `${selectedPatient.vitals.bp} (${selectedPatient.vitals.map})`, norm: 'MAP > 65', status: 'Normal', warn: false },
                { label: 'Resp Rate', val: `${selectedPatient.vitals.rr} /min`, norm: '12 - 20', status: 'Normal', warn: false },
                { label: 'Temperature', val: selectedPatient.vitals.temp, norm: '98.6°F', status: 'Normal', warn: false },
                { label: 'SpO2 Saturation', val: `${selectedPatient.vitals.spo2}%`, norm: '> 92%', status: 'Normal', warn: false },
                { label: 'EtCO2 Level', val: `${selectedPatient.vitals.etco2} mmHg`, norm: '35 - 45', status: 'Normal', warn: false },
                { label: 'ICP Pressure', val: `${selectedPatient.vitals.icp} mmHg`, norm: '< 15', status: 'Optimal', warn: false },
                { label: 'Urine Output', val: `${selectedPatient.vitals.urineOutput} mL/hr`, norm: '> 30', status: 'Normal', warn: false },
              ].map(v => (
                <div key={v.label} className={`p-2.5 rounded-xl border ${v.warn ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold mb-0.5">
                    <span>{v.label}</span>
                    <span className={v.warn ? 'text-rose-600' : 'text-emerald-600'}>{v.status}</span>
                  </div>
                  <div className="text-xs font-extrabold text-slate-800">{v.val}</div>
                  <div className="text-[8px] text-slate-400">Range: {v.norm}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Clinical Assessment & Dosing Optimization (Right Column) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Sedation & RASS Assessment Monitor */}
          <div className="glass-card p-5 space-y-4">
            <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2 border-b pb-3">
              <Brain size={16} className="text-violet-600" /> Sedation Monitoring & RASS Assessment Goal Tracker
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Radial or Slider representation */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">Current RASS Score:</span>
                  <span className="px-2 py-0.5 bg-violet-600 text-white rounded font-bold">{selectedPatient.rass}</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden relative">
                  {/* Highlight Target range -2 to -1 */}
                  <div className="absolute left-[30%] right-[50%] h-full bg-emerald-200 opacity-60" />
                  {/* Current value indicator */}
                  <div
                    className="h-full bg-violet-600 rounded-full"
                    style={{ width: `${((selectedPatient.rass + 5) / 9) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                  <span>-5 Coma</span>
                  <span>-2 Light</span>
                  <span>0 Alert</span>
                  <span>+4 Combative</span>
                </div>
              </div>

              {/* Dosing goals metadata */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Sedation Goal:</span>
                  <span className="font-bold text-slate-800">-2 Light Sedation</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Sedation Goal Status:</span>
                  <span className="font-bold text-emerald-600">Sedation Goal Met</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Last RASS Assessment:</span>
                  <span className="font-bold text-slate-700">Today, 09:30 AM (Passed)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Next Assessment Due:</span>
                  <span className="font-bold text-slate-700">Today, 13:30 PM</span>
                </div>
              </div>
            </div>
          </div>

          {/* BIS Monitor & Delirium Surveillance Panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* BIS Panel */}
            <div className="glass-card p-5 space-y-3">
              <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-2">
                <Activity size={16} className="text-teal-600" /> BIS Monitor & Depth of Anesthesia
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Bispectral Index (BIS):</span>
                  <span className="font-bold text-slate-800">{selectedPatient.id === 'icu-12' ? '62' : '45'} Index</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Deep Sedation Range:</span>
                  <span className="font-bold text-slate-800">40 - 60</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">AI Interpretation:</span>
                  <span className="font-bold text-slate-700">Optimal deep-to-moderate sedation depth</span>
                </div>
              </div>
            </div>

            {/* Delirium Panel */}
            <div className="glass-card p-5 space-y-3">
              <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-2">
                <Shield size={16} className="text-violet-600" /> Delirium (CAM-ICU & ICDSC)
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">CAM-ICU Screen Status:</span>
                  <span className="font-bold text-emerald-600">{selectedPatient.camIcu}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ICDSC Delirium Score:</span>
                  <span className="font-bold text-slate-800">{selectedPatient.icdsc} / 8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Positive Features:</span>
                  <span className="font-bold text-slate-700">Inattention / Fluctuating Course</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pain Management (CPOT) & Ventilator Synchrony */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CPOT Pain Panel */}
            <div className="glass-card p-5 space-y-3">
              <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-2">
                <ShieldAlert size={16} className="text-amber-500" /> CPOT Critical Care Pain Score
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">CPOT Assessment:</span>
                  <span className="font-bold text-slate-800">1 / 8 Score</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pain Scales (Numeric / Behavioral):</span>
                  <span className="font-bold text-slate-800">NPS 2 / BPS 3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Analgesic Status:</span>
                  <span className="font-bold text-emerald-600">Goal Met (CPOT &lt; 2)</span>
                </div>
              </div>
            </div>

            {/* Ventilator Panel */}
            <div className="glass-card p-5 space-y-3">
              <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-2">
                <Activity size={16} className="text-primary-600" /> Mechanical Ventilator Synchrony
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Mode / FiO2 / PEEP:</span>
                  <span className="font-bold text-slate-800">{selectedPatient.ventilator.mode} / {selectedPatient.ventilator.fio2}% / {selectedPatient.ventilator.peep} cmH2O</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Plateau / Peak Pressures:</span>
                  <span className="font-bold text-slate-800">{selectedPatient.ventilator.pPlat} / {selectedPatient.ventilator.pPeak} cmH2O</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Synchrony Score:</span>
                  <span className="font-bold text-emerald-600">{selectedPatient.ventilator.syncScore}% (Excellent Sync)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Neurological & Pupil Assessment */}
          <div className="glass-card p-5 space-y-3">
            <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-2">
              <Eye size={16} className="text-violet-600" /> Advanced Neurological & Pupil Assessment
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border rounded-xl">
                <span className="text-slate-400 block mb-0.5">GCS Score</span>
                <span className="font-extrabold text-slate-800 text-sm">{selectedPatient.gcs} / 15</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">E{selectedPatient.gcsBreakdown.eye} V{selectedPatient.gcsBreakdown.verbal} M{selectedPatient.gcsBreakdown.motor}</span>
              </div>
              <div className="p-3 bg-slate-50 border rounded-xl">
                <span className="text-slate-400 block mb-0.5">Pupil Size</span>
                <span className="font-extrabold text-slate-800 text-sm">{selectedPatient.pupilSize}</span>
              </div>
              <div className="p-3 bg-slate-50 border rounded-xl">
                <span className="text-slate-400 block mb-0.5">Pupil Reaction</span>
                <span className="font-extrabold text-slate-800 text-sm">{selectedPatient.pupilReaction}</span>
              </div>
              <div className="p-3 bg-slate-50 border rounded-xl">
                <span className="text-slate-400 block mb-0.5">Seizure Monitoring</span>
                <span className="font-extrabold text-slate-800 text-sm">{selectedPatient.seizureMonitor}</span>
              </div>
            </div>
          </div>

          {/* Sedation Medications Table */}
          <div className="glass-card p-5 space-y-3">
            <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-2">
              <FileText size={16} className="text-primary-600" /> Active ICU Sedation & Analgesia Medications
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b text-slate-400 font-bold">
                    <th className="pb-2">Medication</th>
                    <th className="pb-2">Dose / Rate</th>
                    <th className="pb-2">Route</th>
                    <th className="pb-2">Start Time</th>
                    <th className="pb-2">Target Effect</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-700">
                  {selectedPatient.currentMeds.map((med, i) => (
                    <tr key={i} className="py-2">
                      <td className="py-2.5 font-bold text-slate-800">{med.name}</td>
                      <td>{med.dose} (@ {med.rate})</td>
                      <td>IV Infusion</td>
                      <td>{med.start}</td>
                      <td>{med.target}</td>
                      <td>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          med.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>{med.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Clinical Recommendations & Predictive Analytics */}
          <div className="glass-card p-5 space-y-4">
            <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2 border-b pb-3">
              <Sparkles size={16} className="text-primary-600" /> AI ICU Clinical Recommendations & Predictive Analytics
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-primary-50/60 border border-primary-100 rounded-xl space-y-2 text-xs">
                <span className="font-bold text-primary-900 text-[10px] uppercase block tracking-wider">Clinical Guideline Optimization Recommendation</span>
                <p className="font-bold text-slate-800 text-sm leading-normal">
                  Initiate Dexmedetomidine weaning protocol. Propofol infusion is stable; verify extubation readiness via spontaneous breathing trial (SBT).
                </p>
                <p className="text-[10px] text-slate-500 pt-1">
                  Evidence: SCCM Guidelines (2024) · Confidence Score: 95%
                </p>
              </div>

              {/* Predictive analytics */}
              <div className="p-4 bg-slate-50 border rounded-xl space-y-2 text-xs">
                <span className="font-bold text-slate-800 text-[10px] uppercase block mb-1">AI ICU Predictive analytics</span>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-slate-600">
                  <div>Delirium Risk: <span className="text-emerald-600 font-bold">12% (Low)</span></div>
                  <div>Extubation Success: <span className="text-emerald-600 font-bold">88% (High)</span></div>
                  <div>Readmission Risk: <span className="text-emerald-600 font-bold">8% (Low)</span></div>
                  <div>ICU Mortality: <span className="text-emerald-600 font-bold">4% (Low)</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Checklist grids (ABCDEF bundle & Nursing tasks) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ABCDEF bundle */}
            <div className="glass-card p-5 space-y-3">
              <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-2">
                <ClipboardList size={16} className="text-primary-600" /> ABCDEF ICU Checklist Bundle Compliance
              </h3>

              <div className="grid grid-cols-1 gap-2 text-xs">
                {[
                  { key: 'pain', label: 'A: Pain Assessment & Management' },
                  { key: 'sat', label: 'B: Spontaneous Awakening Trial (SAT)' },
                  { key: 'sbt', label: 'C: Spontaneous Breathing Trial (SBT)' },
                  { key: 'choice', label: 'D: Choice of Sedation / Target Effect' },
                  { key: 'delirium', label: 'E: Delirium Assessment & Monitoring' },
                  { key: 'mobility', label: 'F: Early Mobility & Physical Therapy' },
                ].map(item => (
                  <div key={item.key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={(bundleChecks as any)[item.key]}
                      onChange={e => setBundleChecks({ ...bundleChecks, [item.key]: e.target.checked })}
                      className="w-4 h-4 rounded accent-primary-600 cursor-pointer"
                    />
                    <span className="font-medium text-slate-700">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Nursing tasks */}
            <div className="glass-card p-5 space-y-3">
              <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-2">
                <CheckCircle size={16} className="text-teal-600" /> Nursing Care Checklist & Interventions
              </h3>

              <div className="grid grid-cols-1 gap-2 text-xs">
                {[
                  { key: 'oral', label: 'Chlorhexidine Oral Hygiene Care' },
                  { key: 'eye', label: 'Ocular Lubrication Eye Care' },
                  { key: 'pressure', label: 'Pressure Injury Prevention Check' },
                  { key: 'turning', label: '2-Hour Patient Turning Schedule' },
                  { key: 'nutrition', label: 'Enteral Tube Nutrition Flow Rate' },
                  { key: 'catheter', label: 'Catheter-Associated Infection Check' },
                ].map(item => (
                  <div key={item.key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={(nursingTasks as any)[item.key]}
                      onChange={e => setNursingTasks({ ...nursingTasks, [item.key]: e.target.checked })}
                      className="w-4 h-4 rounded accent-teal-600 cursor-pointer"
                    />
                    <span className="font-medium text-slate-700">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ICU Lab results table */}
          <div className="glass-card p-5 space-y-3">
            <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-2">
              <ClipboardList size={16} className="text-teal-600" /> ICU Lab Results (ABG & Chemistries)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
              {[
                { label: 'Arterial pH', val: selectedPatient.labs.ph, status: 'Normal', warn: false },
                { label: 'PaO2', val: `${selectedPatient.labs.pao2} mmHg`, status: 'Normal', warn: false },
                { label: 'PaCO2', val: `${selectedPatient.labs.paco2} mmHg`, status: 'Normal', warn: false },
                { label: 'HCO3', val: `${selectedPatient.labs.hco3} mEq/L`, status: 'Normal', warn: false },
                { label: 'Lactate', val: `${selectedPatient.labs.lactate} mmol/L`, status: 'Normal', warn: false },
                { label: 'Creatinine', val: `${selectedPatient.labs.creatinine} mg/dL`, status: selectedPatient.labs.creatinine > 1.2 ? 'HIGH' : 'Normal', warn: selectedPatient.labs.creatinine > 1.2 },
                { label: 'BUN', val: `${selectedPatient.labs.bun} mg/dL`, status: 'Normal', warn: false },
                { label: 'Potassium K+', val: `${selectedPatient.labs.k} mEq/L`, status: 'Normal', warn: false },
                { label: 'Sodium Na+', val: `${selectedPatient.labs.na} mEq/L`, status: 'Normal', warn: false },
                { label: 'Hemoglobin', val: `${selectedPatient.labs.hb} g/dL`, status: 'Normal', warn: false },
                { label: 'Platelets', val: `${selectedPatient.labs.plt} k/uL`, status: 'Normal', warn: false },
                { label: 'WBC Count', val: `${selectedPatient.labs.wbc} k/uL`, status: 'Normal', warn: false },
              ].map(lab => (
                <div key={lab.label} className={`p-2 rounded-xl border ${lab.warn ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold mb-0.5">
                    <span>{lab.label}</span>
                    <span className={lab.warn ? 'text-rose-600' : 'text-slate-400'}>{lab.status}</span>
                  </div>
                  <div className={`text-xs font-bold ${lab.warn ? 'text-rose-800' : 'text-slate-800'}`}>{lab.val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons panel */}
          <div className="glass-card p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white space-y-4">
            <h4 className="font-display font-bold text-sm text-slate-200">ICU Bedside Physician Clinical Actions</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold">
              <button onClick={() => triggerToast('Updated RASS score target')} className="py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white flex items-center justify-center gap-1.5 transition-all">
                Update RASS Goal
              </button>
              <button onClick={() => triggerToast('Recorded CAM-ICU assessment')} className="py-2.5 bg-amber-600 hover:bg-amber-500 rounded-xl text-white flex items-center justify-center gap-1.5 transition-all">
                Record CAM-ICU
              </button>
              <button onClick={() => triggerToast('Sedation vacation sequence initiated')} className="py-2.5 bg-rose-600 hover:bg-rose-500 rounded-xl text-white flex items-center justify-center gap-1.5 transition-all">
                Sedation Vacation
              </button>
              <button onClick={() => triggerToast('Pushed ICU nursing note to EHR vault')} className="py-2.5 bg-primary-600 hover:bg-primary-500 rounded-xl text-white flex items-center justify-center gap-1.5 transition-all">
                Export to EHR
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible AI assistant Drawer (Right Side) */}
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
                      <h3 className="font-display font-bold text-slate-900 text-sm">Critical Care AI Assistant</h3>
                      <p className="text-[10px] text-slate-400">ACCM/SCCM Clinical Protocol Repository</p>
                    </div>
                  </div>
                  <button onClick={() => setDrawerOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                    <X size={18} />
                  </button>
                </div>

                <div className="mt-4 space-y-3 text-xs">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Bedside Assistant Prompts</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Summarize patient bedside telemetry',
                      'Explain optimal RASS goals',
                      'Explain BIS depth interpretation',
                      'Suggest wean schedule'
                    ].map(q => (
                      <button
                        key={q}
                        onClick={() => askAiSteward(q)}
                        className="px-2.5 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg text-left text-[11px] font-medium transition-all"
                      >
                        {q}
                      </button>
                    ))}
                  </div>

                  {aiLoading && (
                    <div className="p-4 bg-slate-50 border rounded-xl flex items-center gap-2 text-xs text-slate-500">
                      <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
                      Ingesting telemetry feed...
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
                    onKeyDown={e => e.key === 'Enter' && askAiSteward()}
                    placeholder="Ask AI about ventilator sync, sedation goals..."
                    className="input-field text-xs flex-1"
                  />
                  <button onClick={() => askAiSteward()} disabled={aiLoading || !aiPrompt.trim()} className="btn-primary text-xs px-3">
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

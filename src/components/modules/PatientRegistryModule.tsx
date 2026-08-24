import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, UserPlus, SlidersHorizontal, Eye, Heart, Activity, Brain, X,
  AlertCircle, Plus, Trash2, Thermometer, ShieldAlert, CheckCircle2, ChevronRight,
  ClipboardList, Pill, Microscope, FileText, Calendar, DollarSign, Clock, Download,
  Printer, Send, Share2, Info, UserCheck, AlertTriangle
} from 'lucide-react';
import { MetricCard } from '../common/MetricCard';
import { askMedAI } from '../../services/azureOpenAI';

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  mrn: string;
  phone: string;
  nationalId: string;
  weight: string;
  height: string;
  diagnosis: string;
  secondaryDiagnosis: string;
  bed: string;
  department: string;
  risk: number;
  status: 'critical' | 'warning' | 'stable' | 'recovered';
  admittedAt: string;
  dischargedAt: string;
  physician: string;
  assignedNurse: string;
  insurance: string;
  emergencyContact: string;
  allergies: string[];
  medications: { name: string; dose: string; freq: string; route: string; doctor: string }[];
  vitals: {
    hr: number;
    bp: string;
    temp: string;
    rr: number;
    spo2: number;
    glucose: number;
    pain: number;
    newsScore: number;
  };
  labs: {
    ph: string;
    wbc: string;
    hb: string;
    plt: string;
    cr: number;
    egfr: number;
    k: number;
    na: number;
    ca: number;
    crp: number;
    troponin: number;
    ast: number;
    alt: number;
  };
  radiology: { type: string; desc: string; report: string; aiFindings: string; date: string }[];
  procedures: { name: string; doctor: string; date: string; complications: string }[];
  history: { illness: string; date: string; notes: string }[];
  appointments: { date: string; doctor: string; dept: string; status: string }[];
}

const INITIAL_PATIENTS: Patient[] = [
  { 
    id: 'p001', 
    name: 'James Wilson', 
    age: 67, 
    gender: 'Male',
    mrn: 'MRN-482109', 
    phone: '555-0199',
    nationalId: 'US-9842189',
    weight: '82 kg',
    height: '178 cm',
    diagnosis: 'COPD Exacerbation', 
    secondaryDiagnosis: 'CHF NYHA Class III, Stage 3b CKD',
    bed: 'ICU-4B', 
    department: 'ICU',
    risk: 78, 
    status: 'critical', 
    admittedAt: '2026-06-24',
    dischargedAt: 'N/A',
    physician: 'Dr. Emily Chen',
    assignedNurse: 'Clara Jenkins, RN',
    insurance: 'Medicare Plan B (Sub ID: #94218-A)',
    emergencyContact: 'Sarah Wilson (Spouse) — 555-0122',
    allergies: ['Penicillin (Anaphylaxis)', 'Sulfa Drugs (Rash)'],
    medications: [
      { name: 'Albuterol Nebulizer', dose: '2.5mg', freq: 'q4h', route: 'Inhalation', doctor: 'Dr. Emily Chen' },
      { name: 'Prednisone', dose: '40mg', freq: 'Daily', route: 'Oral', doctor: 'Dr. Emily Chen' },
      { name: 'Warfarin', dose: '5mg', freq: 'Daily', route: 'Oral', doctor: 'Dr. Emily Chen' },
      { name: 'Aspirin', dose: '81mg', freq: 'Daily', route: 'Oral', doctor: 'Dr. Emily Chen' }
    ],
    vitals: { hr: 98, bp: '142/88', temp: '101.2°F', rr: 24, spo2: 87, glucose: 110, pain: 6, newsScore: 6 },
    labs: { ph: '7.34', wbc: '14.2', hb: '11.4', plt: '240', cr: 1.8, egfr: 42, k: 4.9, na: 138, ca: 8.8, crp: 18.4, troponin: 0.01, ast: 48, alt: 52 },
    radiology: [
      { type: 'Chest X-Ray', desc: 'Bilateral infiltrates & hyperinflation', report: 'Bilateral hyperlucency with flattened diaphragms and peribronchial cuffing, consistent with acute COPD exacerbation.', aiFindings: '94% probability of pneumonia overlay. Moderate cardiomegaly.', date: '2026-06-24' }
    ],
    procedures: [
      { name: 'Arterial Line Insertion', doctor: 'Dr. Emily Chen', date: '2026-06-24', complications: 'None' }
    ],
    history: [
      { illness: 'Severe COPD', date: '2020-04-12', notes: 'Chronic oxygen dependent (2L/min)' },
      { illness: 'Hypertension', date: '2015-08-30', notes: 'Controlled with Lisinopril' }
    ],
    appointments: [
      { date: '2026-07-15 10:00 AM', doctor: 'Dr. Emily Chen', dept: 'Pulmonology Outpatient', status: 'Scheduled' }
    ]
  },
  { 
    id: 'p002', 
    name: 'Sarah Chen', 
    age: 54, 
    gender: 'Female',
    mrn: 'MRN-334281', 
    phone: '555-0248',
    nationalId: 'US-8421890',
    weight: '68 kg',
    height: '162 cm',
    diagnosis: 'Type 2 DM — Hyperglycemia', 
    secondaryDiagnosis: 'Hyperlipidemia, Chronic Neuropathy',
    bed: 'MS-6A', 
    department: 'Med/Surg',
    risk: 42, 
    status: 'warning', 
    admittedAt: '2026-06-22',
    dischargedAt: 'N/A',
    physician: 'Dr. James Park',
    assignedNurse: 'Sarah Wilson, RN',
    insurance: 'Blue Cross PPO (Sub ID: #BC-84920)',
    emergencyContact: 'Albert Chen (Son) — 555-0988',
    allergies: ['Codeine (Severe Nausea)'],
    medications: [
      { name: 'Insulin Glargine', dose: '20 units', freq: 'qHS', route: 'SubQ', doctor: 'Dr. James Park' },
      { name: 'Metformin', dose: '1000mg', freq: 'BID', route: 'Oral', doctor: 'Dr. James Park' }
    ],
    vitals: { hr: 82, bp: '128/76', temp: '98.6°F', rr: 16, spo2: 97, glucose: 245, pain: 2, newsScore: 2 },
    labs: { ph: '7.40', wbc: '7.8', hb: '13.2', plt: '280', cr: 0.9, egfr: 88, k: 4.2, na: 140, ca: 9.1, crp: 2.1, troponin: 0.005, ast: 22, alt: 24 },
    radiology: [
      { type: 'Foot MRI', desc: 'Diabetic neuropathic evaluation', report: 'No evidence of osteomyelitis. Mild subcutaneous edema in the left metatarsal head region.', aiFindings: 'No soft tissue abscess detected.', date: '2026-06-23' }
    ],
    procedures: [],
    history: [
      { illness: 'Type 2 Diabetes', date: '2012-10-14', notes: 'Managed with oral agents, recently added basal insulin' }
    ],
    appointments: []
  }
];

export const PatientRegistryModule: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [selectedPatient, setSelectedPatient] = useState<Patient>(INITIAL_PATIENTS[0]);

  // Search/Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Tabs state
  const [activeTab, setActiveTab] = useState<'Overview' | 'History' | 'Medications' | 'Laboratory' | 'Radiology' | 'Timeline'>('Overview');

  // Right AI panel states
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // New patient modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    gender: 'Male',
    mrn: '',
    phone: '',
    nationalId: '',
    diagnosis: '',
    bed: '',
    department: 'Med/Surg',
    physician: 'Dr. Emily Chen'
  });

  const handleRegisterPatient = (e: React.FormEvent) => {
    e.preventDefault();
    const created: Patient = {
      id: `p00${patients.length + 1}`,
      name: newPatient.name,
      age: Number(newPatient.age) || 30,
      gender: newPatient.gender as any,
      mrn: newPatient.mrn || `MRN-${Math.round(Math.random() * 100000)}`,
      phone: newPatient.phone,
      nationalId: newPatient.nationalId,
      weight: '70 kg',
      height: '170 cm',
      diagnosis: newPatient.diagnosis,
      secondaryDiagnosis: 'Under Investigation',
      bed: newPatient.bed || 'Triage',
      department: newPatient.department,
      risk: 25,
      status: 'stable',
      admittedAt: new Date().toISOString().split('T')[0],
      dischargedAt: 'N/A',
      physician: newPatient.physician,
      assignedNurse: 'Clara Jenkins, RN',
      insurance: 'Medicare',
      emergencyContact: 'Next of kin — 555-0000',
      allergies: [],
      medications: [],
      vitals: { hr: 75, bp: '120/80', temp: '98.6°F', rr: 14, spo2: 98, glucose: 100, pain: 0, newsScore: 0 },
      labs: { ph: '7.40', wbc: '6.0', hb: '14.0', plt: '200', cr: 0.8, egfr: 90, k: 4.0, na: 138, ca: 9.0, crp: 1.0, troponin: 0.01, ast: 25, alt: 25 },
      radiology: [],
      procedures: [],
      history: [],
      appointments: []
    };
    setPatients([...patients, created]);
    setSelectedPatient(created);
    setModalOpen(false);
    triggerToast(`Successfully registered patient ${newPatient.name} & auto-allocated ${newPatient.bed || 'Triage Bed'}.`);
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
        `EHR context for ${selectedPatient.name} (MRN: ${selectedPatient.mrn}, age: ${selectedPatient.age}, primary dx: ${selectedPatient.diagnosis}, creatinine: ${selectedPatient.labs.cr}). Query: ${text}`,
        'clinical'
      );
      setAiResponse(resp);
    } catch {
      setAiResponse('Unable to connect to Medii Clinical Knowledge Base.');
    } finally {
      setAiLoading(false);
    }
  };

  // Filter logic
  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.mrn.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = filterDept === 'All' || p.department === filterDept;
    const matchesStatus = filterStatus === 'All' || p.status === filterStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6 max-w-[1700px] mx-auto relative">
      {/* Toast Notice */}
      <AnimatePresence>
        {actionNotice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-24 right-6 z-50 p-3 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} /> {actionNotice}
            </div>
            <button onClick={() => setActionNotice(null)}>
              <X size={14} className="ml-2" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
            Enterprise Electronic Health Record (EHR) <UserCheck className="text-primary-600 animate-pulse" />
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Hospital-grade EHR workspace matching Epic, Cerner, and MEDITECH standards for patient charts, medication profiles, lab registries, and AI documentation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setModalOpen(true)} className="btn-primary text-xs flex items-center gap-1.5 shadow-md shadow-primary-500/20">
            <UserPlus size={14} />
            <span>Register New Patient</span>
          </button>
          <button onClick={() => setDrawerOpen(true)} className="btn-secondary text-xs flex items-center gap-1.5">
            <Brain size={14} />
            <span>EHR Chart Assistant</span>
          </button>
        </div>
      </div>

      {/* EHR Workspace 4-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Panel: Advanced Search & Patient List (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="glass-card p-4 space-y-4">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Advanced EHR Patient Lookup</span>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search MRN or Name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="input-field text-xs pl-9"
              />
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-700 block mb-1">Ward / Department</label>
                <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="input-field text-xs">
                  <option value="All">All Departments</option>
                  <option value="ICU">Intensive Care (ICU)</option>
                  <option value="Med/Surg">Med/Surg Ward</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-700 block mb-1">Severity / Status</label>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input-field text-xs">
                  <option value="All">All Statuses</option>
                  <option value="critical">Critical</option>
                  <option value="warning">Warning / Observation</option>
                  <option value="stable">Stable</option>
                </select>
              </div>
            </div>
          </div>

          {/* Patients Listing */}
          <div className="glass-card p-3 space-y-2 max-h-[400px] overflow-y-auto">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block px-1">Lookup Results ({filteredPatients.length})</span>
            {filteredPatients.map(p => (
              <div
                key={p.id}
                onClick={() => setSelectedPatient(p)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedPatient.id === p.id ? 'bg-primary-50 border-primary-300' : 'bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800 text-xs">{p.name}</span>
                  <span className={`px-2 py-0.2 rounded text-[9px] font-bold ${
                    p.status === 'critical' ? 'bg-rose-100 text-rose-800' : p.status === 'warning' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>{p.status}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 font-mono">
                  <span>{p.mrn}</span>
                  <span>{p.bed} · {p.department}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center Panel: Master Profile & Vitals (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Master Profile Header Card */}
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-start justify-between border-b pb-3">
              <div className="flex gap-3">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-primary-500 to-accent-indigo flex items-center justify-center text-white font-extrabold text-xl shadow-sm">
                  {selectedPatient.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display font-extrabold text-slate-900 text-base">{selectedPatient.name}</h2>
                    <span className="text-[10px] font-bold bg-primary-100 text-primary-800 px-2 py-0.5 rounded-lg">{selectedPatient.mrn}</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Primary Dx: <span className="font-bold text-slate-800">{selectedPatient.diagnosis}</span></p>
                </div>
              </div>

              <div className="text-right text-xs">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase inline-block ${
                  selectedPatient.status === 'critical' ? 'bg-rose-100 text-rose-800 animate-pulse' : selectedPatient.status === 'warning' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {selectedPatient.status}
                </span>
                <p className="text-[10px] text-slate-400 mt-1 font-mono">Admitted: {selectedPatient.admittedAt}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div><span className="text-slate-400 block">Age / Gender</span><span className="font-bold text-slate-800">{selectedPatient.age}y / {selectedPatient.gender}</span></div>
              <div><span className="text-slate-400 block">Wt / Ht</span><span className="font-bold text-slate-800">{selectedPatient.weight} / {selectedPatient.height}</span></div>
              <div><span className="text-slate-400 block">Bed / Ward</span><span className="font-bold text-slate-800">{selectedPatient.bed} · {selectedPatient.department}</span></div>
              <div><span className="text-slate-400 block">Attending MD</span><span className="font-bold text-slate-800">{selectedPatient.physician}</span></div>
              <div className="col-span-2"><span className="text-slate-400 block">Insurance Provider</span><span className="font-bold text-slate-800">{selectedPatient.insurance}</span></div>
              <div className="col-span-2"><span className="text-slate-400 block">Emergency Contact</span><span className="font-bold text-slate-800">{selectedPatient.emergencyContact}</span></div>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <span className="text-[10px] font-extrabold text-rose-500 uppercase block mb-1">Known Allergies</span>
              <div className="flex flex-wrap gap-1">
                {selectedPatient.allergies.map(all => (
                  <span key={all} className="px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-900 rounded text-[10px] font-bold">
                    {all}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Vitals summary cards */}
          <div className="glass-card p-5 space-y-3">
            <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-2">
              <Activity size={16} className="text-teal-600" /> Patient Vitals & Clinical Scoring (NEWS)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                { label: 'Heart Rate', val: `${selectedPatient.vitals.hr} bpm`, norm: '60 - 100', warn: selectedPatient.vitals.hr > 95 },
                { label: 'Blood Pressure', val: selectedPatient.vitals.bp, norm: '< 120/80', warn: true },
                { label: 'Temperature', val: selectedPatient.vitals.temp, norm: '98.6°F', warn: selectedPatient.vitals.temp.includes('101') },
                { label: 'Resp Rate', val: `${selectedPatient.vitals.rr} /min`, norm: '12 - 20', warn: selectedPatient.vitals.rr > 20 },
                { label: 'SpO2 Saturation', val: `${selectedPatient.vitals.spo2}%`, norm: '> 92%', warn: selectedPatient.vitals.spo2 < 90 },
                { label: 'Blood Sugar', val: `${selectedPatient.vitals.glucose} mg/dL`, norm: '70 - 140', warn: selectedPatient.vitals.glucose > 180 },
                { label: 'Pain Score', val: `${selectedPatient.vitals.pain} / 10`, norm: '< 3', warn: selectedPatient.vitals.pain > 4 },
                { label: 'NEWS Score', val: `${selectedPatient.vitals.newsScore} (High)`, norm: '< 3', warn: selectedPatient.vitals.newsScore > 4 }
              ].map(vit => (
                <div key={vit.label} className={`p-2.5 rounded-xl border text-center ${vit.warn ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100'}`}>
                  <div className={`text-xs font-extrabold ${vit.warn ? 'text-amber-800' : 'text-slate-800'}`}>{vit.val}</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">{vit.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Tabbed Interface Workspace */}
          <div className="glass-card p-5 space-y-4">
            <div className="flex border-b text-xs font-semibold overflow-x-auto gap-3 pb-1">
              {['Overview', 'History', 'Medications', 'Laboratory', 'Radiology', 'Timeline'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`pb-2 border-b-2 transition-all px-2 ${
                    activeTab === tab ? 'border-primary-600 text-primary-600 font-bold' : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab contents */}
            {activeTab === 'Overview' && (
              <div className="space-y-3 text-xs">
                <span className="font-bold text-slate-800 block">General Clinical Review Summary</span>
                <p className="text-slate-600 leading-relaxed">
                  Patient admitted on <span className="font-bold">{selectedPatient.admittedAt}</span> with primary diagnosis of <span className="font-bold">{selectedPatient.diagnosis}</span>. Active clinical care is managed by <span className="font-bold">{selectedPatient.physician}</span> in the <span className="font-bold">{selectedPatient.department}</span> unit.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-slate-50 border rounded-xl">
                    <span className="font-bold text-slate-700 block mb-1">Attending Physician Note</span>
                    <p className="text-[11px] text-slate-500">Monitor pulmonary volumes and check ABG results in the morning shift.</p>
                  </div>
                  <div className="p-3 bg-slate-50 border rounded-xl">
                    <span className="font-bold text-slate-700 block mb-1">Discharge Planning status</span>
                    <p className="text-[11px] text-slate-500 text-rose-600 font-bold">Unready due to active hypoxemia and elevated WBC count.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'History' && (
              <div className="space-y-3 text-xs">
                <span className="font-bold text-slate-800 block">Past Medical History Registry</span>
                <div className="space-y-2">
                  {selectedPatient.history.map((hist, i) => (
                    <div key={i} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="flex justify-between font-bold text-slate-700">
                        <span>{hist.illness}</span>
                        <span className="font-mono text-[10px] text-slate-400">{hist.date}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">{hist.notes}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'Medications' && (
              <div className="space-y-3 text-xs">
                <span className="font-bold text-slate-800 block">Active Medication Profile</span>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b text-slate-400">
                        <th className="pb-1">Medication</th>
                        <th className="pb-1">Dose / Freq</th>
                        <th className="pb-1">Route</th>
                        <th className="pb-1">Prescriber</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-slate-700">
                      {selectedPatient.medications.map((med, i) => (
                        <tr key={i} className="py-1">
                          <td className="py-2 font-bold text-slate-800">{med.name}</td>
                          <td>{med.dose} (@ {med.freq})</td>
                          <td>{med.route}</td>
                          <td>{med.doctor}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'Laboratory' && (
              <div className="space-y-3 text-xs">
                <span className="font-bold text-slate-800 block">Latest Laboratory Results (Chem & CBC)</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { test: 'WBC Count', val: selectedPatient.labs.wbc, unit: 'k/uL', warn: true },
                    { test: 'Hemoglobin', val: selectedPatient.labs.hb, unit: 'g/dL', warn: true },
                    { test: 'Platelets', val: selectedPatient.labs.plt, unit: 'k/uL', warn: false },
                    { test: 'Creatinine', val: selectedPatient.labs.cr, unit: 'mg/dL', warn: selectedPatient.labs.cr > 1.2 },
                    { test: 'eGFR Clearance', val: selectedPatient.labs.egfr, unit: 'mL/min', warn: selectedPatient.labs.egfr < 60 },
                    { test: 'Potassium K+', val: selectedPatient.labs.k, unit: 'mEq/L', warn: false },
                    { test: 'Troponin I', val: selectedPatient.labs.troponin, unit: 'ng/mL', warn: false },
                    { test: 'C-Reactive (CRP)', val: selectedPatient.labs.crp, unit: 'mg/L', warn: true }
                  ].map(lab => (
                    <div key={lab.test} className={`p-2 rounded-xl border ${lab.warn ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-100'}`}>
                      <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold mb-0.5">
                        <span>{lab.test}</span>
                        <span className={lab.warn ? 'text-rose-600' : 'text-slate-400'}>{lab.warn ? 'ABNORMAL' : 'Normal'}</span>
                      </div>
                      <div className={`text-xs font-bold ${lab.warn ? 'text-rose-800' : 'text-slate-800'}`}>{lab.val} {lab.unit}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'Radiology' && (
              <div className="space-y-3 text-xs">
                <span className="font-bold text-slate-800 block">Radiology & PACS Imaging Archives</span>
                {selectedPatient.radiology.map((rad, i) => (
                  <div key={i} className="p-3 bg-slate-50 border rounded-xl space-y-2">
                    <div className="flex justify-between font-bold text-slate-700">
                      <span>{rad.type} ({rad.desc})</span>
                      <span className="font-mono text-slate-400">{rad.date}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-normal">{rad.report}</p>
                    <div className="p-2 bg-primary-50/50 border border-primary-100 rounded text-[10px] text-primary-800 font-bold">
                      AI PACS Findings: {rad.aiFindings}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'Timeline' && (
              <div className="space-y-3 text-xs">
                <span className="font-bold text-slate-800 block">Patient EHR Activity Timeline Log</span>
                <div className="space-y-2 text-[11px] text-slate-600 pl-4 border-l-2 border-slate-200">
                  <div className="relative"><span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />Patient Admitted by Dr. Emily Chen on {selectedPatient.admittedAt}</div>
                  <div className="relative"><span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-primary-500 border-2 border-white" />Chest X-ray Ordered and PACS report generated</div>
                  <div className="relative"><span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-white" />Allergy warning triggered: Penicillin conflict check executed</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: AI Patient Summary & Risk Scores (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="glass-card p-5 space-y-4 bg-gradient-to-br from-primary-50/40 to-teal-50/20">
            <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2 border-b pb-2">
              <Brain size={16} className="text-primary-600 animate-pulse" /> AI Patient Summary (Epic Style)
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-white border border-primary-100 rounded-xl space-y-1 shadow-xs">
                <span className="text-[9px] font-extrabold text-primary-600 uppercase">Clinical Summary Insight</span>
                <p className="font-bold text-slate-800 leading-normal">
                  Elderly patient presenting with severe hypoxemic respiratory strain secondary to acute COPD exacerbation. Stage 3b CKD limits beta-lactam and high NSAID dosing.
                </p>
              </div>

              <div className="p-3 bg-white border border-rose-100 rounded-xl space-y-1 shadow-xs">
                <span className="text-[9px] font-extrabold text-rose-600 uppercase">Discharge Readiness Score</span>
                <p className="font-bold text-slate-800 leading-normal text-rose-700">
                  0% READY FOR DISCHARGE
                </p>
                <p className="text-[10px] text-slate-400">Reason: Active hypoxemia (SpO2 87% on RA) and pending pulmonary wean protocol.</p>
              </div>

              <div className="p-3 bg-white border rounded-xl flex justify-between items-center text-[11px] font-semibold text-slate-700">
                <span>AI Clinical Confidence Score:</span>
                <span className="text-primary-600 font-extrabold">98% Verified</span>
              </div>
            </div>
          </div>

          {/* Clinical Risk Scores (Gauges) */}
          <div className="glass-card p-5 space-y-3">
            <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-2">
              <ShieldAlert size={16} className="text-rose-600 animate-pulse" /> Clinical Risk Scores
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { name: 'Fall Risk', score: 'High (65%)', color: 'text-rose-600' },
                { name: 'Sepsis Risk', score: 'Moderate (42%)', color: 'text-amber-600' },
                { name: 'Readmission', score: 'High (78%)', color: 'text-rose-600' },
                { name: 'Stroke Risk', score: 'Low (12%)', color: 'text-emerald-600' }
              ].map(risk => (
                <div key={risk.name} className="p-2.5 bg-slate-50 border rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 block">{risk.name}</span>
                  <span className={`font-extrabold text-[11px] ${risk.color}`}>{risk.score}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Action Triggers */}
          <div className="glass-card p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-3">
            <span className="text-[10px] font-extrabold text-slate-300 uppercase block">Physician EHR Actions</span>
            <div className="grid grid-cols-1 gap-1.5 text-xs font-semibold">
              <button onClick={() => triggerToast('EHR Laboratory Order Created')} className="py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white text-center transition-all">
                Order Labs (ABG / Chem)
              </button>
              <button onClick={() => triggerToast('EHR Radiology PACS Order Created')} className="py-2 bg-amber-600 hover:bg-amber-500 rounded-lg text-white text-center transition-all">
                Order Chest Radiology
              </button>
              <button onClick={() => triggerToast('Generated clinical round note')} className="py-2 bg-primary-600 hover:bg-primary-500 rounded-lg text-white text-center transition-all">
                Generate Round Note
              </button>
              <button onClick={() => triggerToast('Exported chart PDF summary')} className="py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 text-center transition-all">
                Export Chart PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* New Patient Registration Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white p-6 rounded-2xl max-w-md w-full border shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-display font-bold text-slate-900 text-sm">Register EHR Patient</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
            </div>

            <form onSubmit={handleRegisterPatient} className="space-y-3 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1">Patient Name</label>
                <input
                  type="text"
                  required
                  value={newPatient.name}
                  onChange={e => setNewPatient({ ...newPatient, name: e.target.value })}
                  placeholder="e.g. Robert Vance"
                  className="input-field text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1">Age</label>
                  <input
                    type="number"
                    required
                    value={newPatient.age}
                    onChange={e => setNewPatient({ ...newPatient, age: e.target.value })}
                    placeholder="e.g. 61"
                    className="input-field text-xs"
                  />
                </div>
                <div>
                  <label className="block mb-1">Gender</label>
                  <select
                    value={newPatient.gender}
                    onChange={e => setNewPatient({ ...newPatient, gender: e.target.value })}
                    className="input-field text-xs"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1">Diagnosis</label>
                <input
                  type="text"
                  required
                  value={newPatient.diagnosis}
                  onChange={e => setNewPatient({ ...newPatient, diagnosis: e.target.value })}
                  placeholder="e.g. Severe ARDS secondary to COVID-19"
                  className="input-field text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1">ICU Bed / Ward Number</label>
                  <input
                    type="text"
                    required
                    value={newPatient.bed}
                    onChange={e => setNewPatient({ ...newPatient, bed: e.target.value })}
                    placeholder="e.g. Bed-12"
                    className="input-field text-xs"
                  />
                </div>
                <div>
                  <label className="block mb-1">Department</label>
                  <select
                    value={newPatient.department}
                    onChange={e => setNewPatient({ ...newPatient, department: e.target.value })}
                    className="input-field text-xs"
                  >
                    <option value="ICU">ICU</option>
                    <option value="Med/Surg">Med/Surg</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn-primary w-full justify-center text-xs py-2.5">
                Register & Allocate Bed
              </button>
            </form>
          </motion.div>
        </div>
      )}

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
                      <h3 className="font-display font-bold text-slate-900 text-sm">Medii EHR Clinical Assistant</h3>
                      <p className="text-[10px] text-slate-400">Medii Clinical Knowledge Base</p>
                    </div>
                  </div>
                  <button onClick={() => setDrawerOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                    <X size={18} />
                  </button>
                </div>

                <div className="mt-4 space-y-3 text-xs">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block">EHR Quick Prompts</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Explain lab results for this patient',
                      'Generate medical round note draft',
                      'Review patient readmission risk factors',
                      'Review active medications for interactions'
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
                      <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
                      Ingesting EHR charts...
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
                    placeholder="Ask AI about this patient's chart, labs..."
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

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Heart, CheckCircle, TrendingUp, Search, UserPlus, FileText,
  RefreshCw, RefreshCw as SyncIcon, Brain, AlertTriangle, Shield, Check, X,
  Clock, Battery, Wifi, Database, Plus, ChevronRight, MessageSquare, Trash2, ArrowUpRight
} from 'lucide-react';
import { MetricCard } from '../common/MetricCard';
import { askMedAI } from '../../services/azureOpenAI';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area
} from 'recharts';

interface RPMPatient {
  id: string;
  name: string;
  age: number;
  gender: string;
  mrn: string;
  condition: string;
  avgGlucose: number;
  glucoseTIR: number; // Time In Range %
  bp: string;
  bpStatus: 'Controlled' | 'Stage 1 HTN' | 'Stage 2 HTN' | 'Critical';
  adherence: number; // Medication adherence %
  riskScore: number; // 30-day readmission risk
  status: 'critical' | 'warning' | 'stable';
  assignedDoctor: string;
  devices: { name: string; type: 'Cellular' | 'Bluetooth'; battery: number; signal: 'Optimal' | 'Low' | 'Disconnected' }[];
  telemetryData: { day: string; glucose: number; systolic: number; diastolic: number }[];
}

const mockRPMPatients: RPMPatient[] = [
  {
    id: 'p101',
    name: 'James Wilson',
    age: 67,
    gender: 'Male',
    mrn: 'MRN-482109',
    condition: 'Type 2 DM / Hypertension',
    avgGlucose: 114,
    glucoseTIR: 92,
    bp: '122/78',
    bpStatus: 'Controlled',
    adherence: 98,
    riskScore: 12,
    status: 'stable',
    assignedDoctor: 'Dr. Emily Chen',
    devices: [
      { name: 'Cellular Glucometer', type: 'Cellular', battery: 85, signal: 'Optimal' },
      { name: 'Bluetooth BP Cuff', type: 'Bluetooth', battery: 92, signal: 'Optimal' },
      { name: 'Cellular Weight Scale', type: 'Cellular', battery: 40, signal: 'Optimal' }
    ],
    telemetryData: [
      { day: 'Mon', glucose: 108, systolic: 124, diastolic: 76 },
      { day: 'Tue', glucose: 115, systolic: 122, diastolic: 78 },
      { day: 'Wed', glucose: 120, systolic: 120, diastolic: 80 },
      { day: 'Thu', glucose: 110, systolic: 128, diastolic: 82 },
      { day: 'Fri', glucose: 105, systolic: 121, diastolic: 79 },
      { day: 'Sat', glucose: 114, systolic: 122, diastolic: 78 },
      { day: 'Sun', glucose: 114, systolic: 122, diastolic: 78 }
    ]
  },
  {
    id: 'p102',
    name: 'Sarah Chen',
    age: 54,
    gender: 'Female',
    mrn: 'MRN-334281',
    condition: 'Type 2 DM / Nephropathy',
    avgGlucose: 168,
    glucoseTIR: 65,
    bp: '138/88',
    bpStatus: 'Stage 1 HTN',
    adherence: 82,
    riskScore: 42,
    status: 'warning',
    assignedDoctor: 'Dr. James Park',
    devices: [
      { name: 'Cellular Glucometer', type: 'Cellular', battery: 12, signal: 'Low' },
      { name: 'Bluetooth BP Cuff', type: 'Bluetooth', battery: 60, signal: 'Optimal' }
    ],
    telemetryData: [
      { day: 'Mon', glucose: 155, systolic: 134, diastolic: 86 },
      { day: 'Tue', glucose: 162, systolic: 138, diastolic: 88 },
      { day: 'Wed', glucose: 178, systolic: 140, diastolic: 90 },
      { day: 'Thu', glucose: 165, systolic: 136, diastolic: 84 },
      { day: 'Fri', glucose: 152, systolic: 132, diastolic: 82 },
      { day: 'Sat', glucose: 168, systolic: 138, diastolic: 88 },
      { day: 'Sun', glucose: 168, systolic: 138, diastolic: 88 }
    ]
  },
  {
    id: 'p103',
    name: 'Elena Rostova',
    age: 61,
    gender: 'Female',
    mrn: 'MRN-928421',
    condition: 'Gestational Diabetes',
    avgGlucose: 195,
    glucoseTIR: 48,
    bp: '148/96',
    bpStatus: 'Stage 2 HTN',
    adherence: 74,
    riskScore: 78,
    status: 'critical',
    assignedDoctor: 'Dr. Sarah Jenkins',
    devices: [
      { name: 'Cellular Glucometer', type: 'Cellular', battery: 94, signal: 'Optimal' },
      { name: 'Bluetooth BP Cuff', type: 'Bluetooth', battery: 88, signal: 'Optimal' }
    ],
    telemetryData: [
      { day: 'Mon', glucose: 185, systolic: 144, diastolic: 92 },
      { day: 'Tue', glucose: 190, systolic: 146, diastolic: 94 },
      { day: 'Wed', glucose: 210, systolic: 150, diastolic: 98 },
      { day: 'Thu', glucose: 205, systolic: 148, diastolic: 96 },
      { day: 'Fri', glucose: 195, systolic: 142, diastolic: 92 },
      { day: 'Sat', glucose: 195, systolic: 148, diastolic: 96 },
      { day: 'Sun', glucose: 195, systolic: 148, diastolic: 96 }
    ]
  }
];

export const ChronicCareModule: React.FC = () => {
  const [patients, setPatients] = useState<RPMPatient[]>(mockRPMPatients);
  const [selectedPatient, setSelectedPatient] = useState<RPMPatient>(mockRPMPatients[0]);

  // Operational states
  const [searchQuery, setSearchQuery] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // AI assistant drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // New patient modal
  const [modalOpen, setModalOpen] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    gender: 'Male',
    mrn: '',
    condition: 'Type 2 DM',
    glucose: '120',
    bp: '120/80',
    physician: 'Dr. Emily Chen'
  });

  const triggerToast = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const askAiSteward = async (queryText?: string) => {
    const text = queryText || aiPrompt;
    if (!text.trim()) return;
    setAiLoading(true);
    setAiPrompt('');
    setDrawerOpen(true);
    try {
      const resp = await askMedAI(
        `Chronic care RPM dashboard. Patient: ${selectedPatient.name} (${selectedPatient.condition}), avg glucose: ${selectedPatient.avgGlucose} mg/dL, BP: ${selectedPatient.bp}, adherence: ${selectedPatient.adherence}%. Query: ${text}`,
        'clinical'
      );
      setAiResponse(resp);
    } catch {
      setAiResponse('Unable to connect to Azure OpenAI RPM Stewardship database.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleRegisterRPM = (e: React.FormEvent) => {
    e.preventDefault();
    const created: RPMPatient = {
      id: `p10${patients.length + 1}`,
      name: newPatient.name,
      age: Number(newPatient.age) || 45,
      gender: newPatient.gender,
      mrn: newPatient.mrn || `MRN-${Math.round(Math.random() * 100000)}`,
      condition: newPatient.condition,
      avgGlucose: Number(newPatient.glucose) || 120,
      glucoseTIR: 85,
      bp: newPatient.bp,
      bpStatus: 'Controlled',
      adherence: 90,
      riskScore: 15,
      status: 'stable',
      assignedDoctor: newPatient.physician,
      devices: [
        { name: 'Cellular Glucometer', type: 'Cellular', battery: 100, signal: 'Optimal' },
        { name: 'Bluetooth BP Cuff', type: 'Bluetooth', battery: 100, signal: 'Optimal' }
      ],
      telemetryData: [
        { day: 'Mon', glucose: 118, systolic: 122, diastolic: 78 },
        { day: 'Tue', glucose: 122, systolic: 120, diastolic: 80 }
      ]
    };
    setPatients([...patients, created]);
    setSelectedPatient(created);
    setModalOpen(false);
    triggerToast(`Registered patient ${newPatient.name} & paired RPM cellular hubs.`);
  };

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.mrn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-[1700px] mx-auto relative">
      {/* Toast */}
      <AnimatePresence>
        {actionNotice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-24 right-6 z-50 p-3 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-2">
              <CheckCircle size={16} /> {actionNotice}
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
            Chronic Care Remote Patient Monitoring (RPM) <Activity className="text-teal-600" />
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Continuous Glucose Monitor (CGM) telemetry, home blood pressure logs, and glycemic target tracking.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setModalOpen(true)} className="btn-primary text-xs flex items-center gap-1.5 shadow-md shadow-primary-500/20">
            <UserPlus size={14} />
            <span>Enroll New RPM Patient</span>
          </button>
          <button onClick={() => setDrawerOpen(true)} className="btn-secondary text-xs flex items-center gap-1.5">
            <Brain size={14} />
            <span>RPM AI Assistant</span>
          </button>
        </div>
      </div>

      {/* Zone 1: Operational KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Avg CGM Glucose"
          value={`${selectedPatient.avgGlucose} mg/dL`}
          subtitle={`Time in Range: ${selectedPatient.glucoseTIR}%`}
          icon={<Activity size={16} />}
          color={selectedPatient.avgGlucose > 150 ? 'rose' : 'teal'}
          delay={0}
        />
        <MetricCard
          title="Blood Pressure"
          value={selectedPatient.bp}
          subtitle={`Status: ${selectedPatient.bpStatus}`}
          icon={<Heart size={16} />}
          color={selectedPatient.bpStatus.includes('Stage') || selectedPatient.bpStatus.includes('Critical') ? 'rose' : 'teal'}
          delay={0.05}
        />
        <MetricCard
          title="Care Compliance Adherence"
          value={`${selectedPatient.adherence}%`}
          subtitle="Prescribed daily readings"
          icon={<CheckCircle size={16} />}
          color={selectedPatient.adherence < 80 ? 'amber' : 'blue'}
          delay={0.1}
        />
        <MetricCard
          title="Readmission Risk Score"
          value={`${selectedPatient.riskScore}%`}
          subtitle="30-day forecast risk"
          icon={<TrendingUp size={16} />}
          color={selectedPatient.riskScore > 50 ? 'rose' : 'emerald'}
          delay={0.15}
        />
      </div>

      {/* Main Interactive Workspace (Zone 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Patient Selector (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="glass-card p-4 space-y-3">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase block tracking-wider">RPM Active Cohort</span>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search MRN or Name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="input-field text-xs pl-8"
              />
            </div>

            <div className="space-y-2">
              {filteredPatients.map(p => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPatient(p)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedPatient.id === p.id ? 'bg-primary-50 border-primary-300' : 'bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex justify-between font-bold text-xs text-slate-800">
                    <span>{p.name}</span>
                    <span className={`w-2 h-2 rounded-full ${p.status === 'critical' ? 'bg-rose-500' : p.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 font-mono">
                    <span>{p.condition}</span>
                    <span>Risk: {p.riskScore}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center: Selected Patient Telemetry (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Vitals Telemetry Chart */}
          <div className="glass-card p-5 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Activity size={16} className="text-primary-600 animate-pulse" /> Continuous Glucose Monitor (CGM) Telemetry
                </h3>
                <p className="text-xs text-slate-400">Time range: Last 7 days · Fasting target limit: 140 mg/dL</p>
              </div>
              <span className="badge-info text-xs">7-Day History</span>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={selectedPatient.telemetryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGlucose" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0c90e6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#0c90e6" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} />
                  <YAxis domain={[60, 240]} tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="glucose" name="CGM Glucose (mg/dL)" stroke="#0c90e6" fillOpacity={1} fill="url(#colorGlucose)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Blood Pressure Daily Trend line */}
          <div className="glass-card p-5 space-y-4">
            <h3 className="font-display font-bold text-slate-800 text-xs border-b pb-2">Blood Pressure Telemetry Trends</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selectedPatient.telemetryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis domain={[60, 180]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="systolic" name="Systolic (mmHg)" stroke="#e11d48" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="diastolic" name="Diastolic (mmHg)" stroke="#7c3aed" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right: Device status inventory (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="glass-card p-5 space-y-4">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Paired RPM Devices</span>
            <div className="space-y-3">
              {selectedPatient.devices.map(dev => (
                <div key={dev.name} className="p-3 bg-slate-50 border rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between items-center font-bold text-slate-800">
                    <span>{dev.name}</span>
                    <span className={`px-2 py-0.2 rounded text-[9px] ${dev.signal === 'Optimal' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                      {dev.signal}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                    <span className="flex items-center gap-1"><Wifi size={12} /> {dev.type}</span>
                    <span className="flex items-center gap-1"><Battery size={12} /> {dev.battery}% battery</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI care stewardship suggestions */}
          <div className="glass-card p-5 bg-gradient-to-br from-primary-50/40 to-teal-50/20 space-y-4">
            <h4 className="font-display font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <Brain size={16} className="text-primary-650" /> AI Care Adjustments
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-white border border-primary-100 rounded-lg">
                <span className="text-[9px] font-extrabold text-primary-600 block">CGM Out-of-Range Risk</span>
                <p className="text-slate-700 leading-normal mt-0.5">
                  Glycemic spikes detected post-lunch. Recommend adjusting pre-meal insulin bolus target ratios.
                </p>
              </div>
              <div className="p-2.5 bg-white border border-rose-100 rounded-lg">
                <span className="text-[9px] font-extrabold text-rose-600 block">Critical Battery alert</span>
                <p className="text-slate-700 leading-normal mt-0.5">
                  Sarah Chen's glucometer hub is at 12% battery charge capacity. Trigger auto-delivery battery replacement alert.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cohort Patient Registry Table (Zone 4) */}
      <div className="glass-card p-5 space-y-3">
        <h3 className="font-display font-bold text-slate-800 text-sm border-b pb-2">Operational Patient Registry Log</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b text-slate-400">
                <th className="pb-2">Patient</th>
                <th className="pb-2">Age / Gender</th>
                <th className="pb-2">Condition</th>
                <th className="pb-2">Avg Glucose</th>
                <th className="pb-2">Blood Pressure</th>
                <th className="pb-2">Time-in-Range (TIR)</th>
                <th className="pb-2">Adherence</th>
                <th className="pb-2">Readmission Risk</th>
                <th className="pb-2">Attending Doctor</th>
              </tr>
            </thead>
            <tbody className="divide-y text-slate-700 font-medium">
              {patients.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-all">
                  <td className="py-3 font-bold text-slate-900">{p.name}</td>
                  <td>{p.age}y / {p.gender}</td>
                  <td>{p.condition}</td>
                  <td className={p.avgGlucose > 150 ? 'text-rose-600 font-bold' : 'text-slate-800'}>{p.avgGlucose} mg/dL</td>
                  <td>{p.bp}</td>
                  <td>{p.glucoseTIR}%</td>
                  <td>{p.adherence}%</td>
                  <td className={p.riskScore > 50 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>{p.riskScore}%</td>
                  <td>{p.assignedDoctor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Patient Registration Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white p-6 rounded-2xl max-w-md w-full border shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-display font-bold text-slate-900 text-xs">Enroll RPM Patient</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
            </div>

            <form onSubmit={handleRegisterRPM} className="space-y-3 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1">Patient Name</label>
                <input
                  type="text"
                  required
                  value={newPatient.name}
                  onChange={e => setNewPatient({ ...newPatient, name: e.target.value })}
                  placeholder="e.g. Elena Rostova"
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
                    placeholder="e.g. 54"
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
                <label className="block mb-1">Condition</label>
                <input
                  type="text"
                  required
                  value={newPatient.condition}
                  onChange={e => setNewPatient({ ...newPatient, condition: e.target.value })}
                  placeholder="e.g. Type 2 DM / Hypertension"
                  className="input-field text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1">Avg Glucose</label>
                  <input
                    type="number"
                    required
                    value={newPatient.glucose}
                    onChange={e => setNewPatient({ ...newPatient, glucose: e.target.value })}
                    placeholder="e.g. 120"
                    className="input-field text-xs"
                  />
                </div>
                <div>
                  <label className="block mb-1">Blood Pressure</label>
                  <input
                    type="text"
                    required
                    value={newPatient.bp}
                    onChange={e => setNewPatient({ ...newPatient, bp: e.target.value })}
                    placeholder="e.g. 120/80"
                    className="input-field text-xs"
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary w-full justify-center text-xs py-2.5">
                Enroll Patient & Sync Hubs
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
                      <h3 className="font-display font-bold text-slate-900 text-sm">RPM Care Copilot</h3>
                      <p className="text-[10px] text-slate-400">Azure OpenAI Remote Patient Care</p>
                    </div>
                  </div>
                  <button onClick={() => setDrawerOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                    <X size={18} />
                  </button>
                </div>

                <div className="mt-4 space-y-3 text-xs">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Clinical Queries</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Summarize chronic care metrics',
                      'Generate medical round note draft',
                      'Analyze glycemic spikes',
                      'Review blood pressure logs'
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
                      Auditing remote telemetry logs...
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
                    placeholder="Ask RPM AI about glucose, BP, device battery..."
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

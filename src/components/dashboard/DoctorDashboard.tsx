import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, AlertTriangle, Brain, FileText, Heart, Stethoscope, User, Users,
  ChevronRight, Upload, X, CheckCircle, Pill, FileUp, Sparkles, Image, ShieldCheck
} from 'lucide-react';
import { MetricCard } from '../common/MetricCard';
import { VitalsChart, RiskDonut } from '../charts';
import { askMedAI } from '../../services/azureOpenAI';
import { useAppStore } from '../../store/appStore';

const initialPatients = [
  { id: 'p001', name: 'James Wilson', age: 67, mrn: 'MRN-4821', diagnosis: 'COPD Exacerbation', bed: '4B', risk: 78, status: 'critical', vitals: { hr: 98, spo2: 87, bp: '142/88', temp: '101.2°F' } },
  { id: 'p002', name: 'Sarah Chen', age: 54, mrn: 'MRN-3342', diagnosis: 'Type 2 DM — Hyperglycemia', bed: '6A', risk: 52, status: 'stable', vitals: { hr: 82, spo2: 97, bp: '128/76', temp: '98.6°F' } },
  { id: 'p003', name: 'Maria Rivera', age: 41, mrn: 'MRN-5519', diagnosis: 'Post-op Appendectomy', bed: '2C', risk: 22, status: 'stable', vitals: { hr: 72, spo2: 99, bp: '118/72', temp: '98.8°F' } },
  { id: 'p004', name: 'Robert Kim', age: 73, mrn: 'MRN-6130', diagnosis: 'Sepsis — Day 3', bed: '3D', risk: 85, status: 'warning', vitals: { hr: 104, spo2: 93, bp: '108/64', temp: '102.4°F' } },
  { id: 'p005', name: 'Linda Thompson', age: 59, mrn: 'MRN-7084', diagnosis: 'CHF Decompensation', bed: '5A', risk: 68, status: 'warning', vitals: { hr: 92, spo2: 94, bp: '156/94', temp: '99.1°F' } },
];

const vitalsHistory = Array.from({ length: 10 }, (_, i) => ({
  time: `${9 + i}:00`,
  hr: 95 + Math.round(Math.sin(i * 0.7) * 8 + Math.random() * 6),
  spo2: 88 + Math.round(Math.sin(i * 0.5) * 3),
}));

const statusColors = { critical: 'badge-danger', warning: 'badge-warning', stable: 'badge-success' };
const statusDot = { critical: 'bg-rose-500', warning: 'bg-amber-500', stable: 'bg-emerald-500' };

export const DoctorDashboard: React.FC = () => {
  const { setActiveModule, setActiveDashboard } = useAppStore();
  const [patients, setPatients] = useState(initialPatients);
  const [selectedPatient, setSelectedPatient] = useState(initialPatients[0]);
  const [aiNote, setAiNote] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [recordType, setRecordType] = useState<'scan' | 'medication' | 'lab' | 'clinical'>('scan');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadNotes, setUploadNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Patient uploaded records
  const [uploadedRecords, setUploadedRecords] = useState<Record<string, any[]>>({
    p001: [
      { id: 'UPL-1', title: 'Chest X-Ray PA View', type: 'scan', date: 'Apr 11, 2026', notes: 'Bilateral lung fields clear. No effusions.' },
      { id: 'UPL-2', title: 'Lisinopril 10mg Prescription', type: 'medication', date: 'Apr 09, 2026', notes: 'Daily oral morning intake.' }
    ]
  });

  const generateAISummary = async () => {
    setLoadingAI(true);
    setAiNote('');
    try {
      const result = await askMedAI(
        `Summarize patient condition and provide clinical recommendations: ${JSON.stringify(selectedPatient)}`,
        'clinical'
      );
      setAiNote(result);
    } catch (e) {
      setAiNote('Notice generating summary. Consulting Medii Clinical Copilot.');
    } finally {
      setLoadingAI(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle) return;
    setUploading(true);
    await new Promise(r => setTimeout(r, 800)); // Simulate upload & AI scanning
    const newRecord = {
      id: `UPL-${Date.now().toString().slice(-4)}`,
      title: uploadTitle,
      type: recordType,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      notes: uploadNotes || 'Document processed and saved to patient EHR.'
    };

    setUploadedRecords(prev => ({
      ...prev,
      [selectedPatient.id]: [newRecord, ...(prev[selectedPatient.id] || [])]
    }));

    setUploading(false);
    setUploadSuccess(true);
    setTimeout(() => {
      setUploadSuccess(false);
      setShowUploadModal(false);
      setUploadTitle('');
      setUploadNotes('');
      setSelectedFile(null);
    }, 1200);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px]">
      <motion.div 
        initial={{ opacity: 0, y: -8 }} 
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Doctor Clinical Command Center</h1>
          <p className="text-sm text-slate-500 mt-0.5">Dr. Emily Chen · Internal Medicine & Clinical Diagnostics</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowUploadModal(true)}
            className="btn-primary text-xs flex items-center gap-1.5 shadow-md shadow-primary-500/20"
          >
            <Upload size={14} />
            <span>Upload Patient Record / Scan</span>
          </button>
          <button 
            onClick={() => {
              setActiveModule('patients');
              setActiveDashboard('patients');
            }}
            className="btn-secondary text-xs flex items-center gap-1.5"
          >
            <Users size={14} />
            <span>Patient Registry</span>
            <ChevronRight size={12} className="text-slate-400" />
          </button>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="My Patients" value={`${patients.length}`} subtitle="Active admits" icon={<Users size={16} />} color="blue" delay={0} />
        <MetricCard title="Critical Cases" value="2" subtitle="Require attention" icon={<AlertTriangle size={16} />} color="rose" badge="Action needed" badgeType="danger" delay={0.05} />
        <MetricCard title="AI Risk Alerts" value="3" subtitle="High-risk patients" icon={<Brain size={16} />} color="amber" delay={0.1} />
        <MetricCard title="Notes & Uploads" value={`${(uploadedRecords[selectedPatient.id] || []).length + 8}`} subtitle="EHR synchronized" icon={<FileText size={16} />} color="teal" delay={0.15} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient list */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card p-5">
          <h3 className="font-display font-semibold text-slate-800 mb-4">Patient Roster</h3>
          <div className="space-y-2">
            {patients.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedPatient(p)}
                className={`w-full text-left p-3 rounded-xl border transition-all
                  ${selectedPatient.id === p.id ? 'bg-primary-50 border-primary-200 shadow-sm' : 'hover:bg-surface-50 border-transparent'}`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500">
                    {p.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-700 truncate">{p.name}</span>
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot[p.status as keyof typeof statusDot]}`} />
                    </div>
                    <div className="text-xs text-slate-400 truncate">{p.diagnosis}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold" style={{ color: p.risk >= 70 ? '#e11d48' : p.risk >= 40 ? '#d97706' : '#059669' }}>
                      {p.risk}
                    </div>
                    <div className="text-[10px] text-slate-400">risk</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Patient detail */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="lg:col-span-2 space-y-4">
          {/* Header */}
          <div className="glass-card p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-xl font-bold text-primary-600">
                  {selectedPatient.name.charAt(0)}
                </div>
                <div>
                  <h2 className="font-display font-bold text-slate-900 text-lg">{selectedPatient.name}</h2>
                  <p className="text-sm text-slate-500">{selectedPatient.mrn} · Age {selectedPatient.age} · Bed {selectedPatient.bed}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedPatient.diagnosis}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <RiskDonut score={selectedPatient.risk} label="Risk" size={80} />
                <span className={statusColors[selectedPatient.status as keyof typeof statusColors]}>
                  {selectedPatient.status}
                </span>
              </div>
            </div>

            {/* Vitals grid */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Heart Rate', value: `${selectedPatient.vitals.hr}`, unit: 'bpm', warn: selectedPatient.vitals.hr > 100 },
                { label: 'SpO2', value: `${selectedPatient.vitals.spo2}`, unit: '%', warn: selectedPatient.vitals.spo2 < 92 },
                { label: 'Blood Pressure', value: selectedPatient.vitals.bp, unit: '', warn: false },
                { label: 'Temperature', value: selectedPatient.vitals.temp, unit: '', warn: parseFloat(selectedPatient.vitals.temp) > 100.4 },
              ].map(v => (
                <div key={v.label} className={`p-3 rounded-xl text-center ${v.warn ? 'bg-rose-50 border border-rose-200' : 'bg-surface-50'}`}>
                  <div className={`text-lg font-bold font-display ${v.warn ? 'text-rose-600' : 'text-slate-700'}`}>
                    {v.value}<span className="text-xs font-normal ml-0.5">{v.unit}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{v.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Uploaded Patient Records & Scans List */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold text-slate-800 text-sm flex items-center gap-2">
                <FileUp size={16} className="text-primary-600" />
                Uploaded Records & Scans ({selectedPatient.name})
              </h3>
              <button
                onClick={() => setShowUploadModal(true)}
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                + Add Record
              </button>
            </div>

            <div className="space-y-2">
              {(uploadedRecords[selectedPatient.id] || []).length > 0 ? (
                uploadedRecords[selectedPatient.id].map(rec => (
                  <div key={rec.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        rec.type === 'scan' ? 'bg-teal-100 text-teal-700' :
                        rec.type === 'medication' ? 'bg-amber-100 text-amber-700' : 'bg-primary-100 text-primary-700'
                      }`}>
                        {rec.type === 'scan' ? <Image size={16} /> : rec.type === 'medication' ? <Pill size={16} /> : <FileText size={16} />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">{rec.title}</div>
                        <div className="text-[10px] text-slate-500">{rec.notes}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-semibold text-slate-400 block">{rec.date}</span>
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Synced</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-xs text-slate-400 border border-dashed rounded-xl">
                  No custom scans or medication records uploaded yet. Click "Upload Patient Record / Scan" to add one.
                </div>
              )}
            </div>
          </div>

          {/* Vitals chart */}
          <div className="glass-card p-5">
            <h3 className="font-display font-semibold text-slate-800 mb-3">Vitals Trend — Today</h3>
            <VitalsChart data={vitalsHistory} metrics={['hr', 'spo2']} height={160} />
          </div>

          {/* AI Summary */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Brain size={16} className="text-primary-500" />
                <h3 className="font-display font-semibold text-slate-800">AI Clinical Copilot Analysis</h3>
              </div>
              <button onClick={generateAISummary} disabled={loadingAI} className="btn-primary text-xs">
                {loadingAI ? 'Analyzing...' : 'Generate Summary'}
              </button>
            </div>
            {loadingAI && (
              <div className="flex items-center gap-2 py-4 text-sm text-slate-500">
                <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                Medii Clinical AI is analyzing patient EHR and telemetry...
              </div>
            )}
            {aiNote && !loadingAI && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-xs text-slate-600 leading-relaxed bg-primary-50 rounded-xl p-4 border border-primary-100"
              >
                {aiNote.split('\n').map((line, i) => (
                  <p key={i} className={`${line.startsWith('**') ? 'font-bold text-slate-800 mt-2' : ''} ${line.startsWith('•') ? 'ml-2' : ''}`}>
                    {line.replace(/\*\*/g, '')}
                  </p>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Upload Modal Dialog */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 relative overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                    <Upload size={18} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-slate-900 text-base">Upload Patient Record / Scan</h3>
                    <p className="text-xs text-slate-400">Add DICOM, Medication log, or PDF report for {selectedPatient.name}</p>
                  </div>
                </div>
                <button onClick={() => setShowUploadModal(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                  <X size={18} />
                </button>
              </div>

              {uploadSuccess ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                    <CheckCircle size={28} />
                  </div>
                  <h4 className="text-lg font-bold text-slate-800">Upload Completed!</h4>
                  <p className="text-xs text-slate-500">Record successfully ingested and indexed for AI Copilot retrieval.</p>
                </div>
              ) : (
                <form onSubmit={handleUploadSubmit} className="mt-4 space-y-4">
                  {/* Target patient selector */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Target Patient</label>
                    <select
                      value={selectedPatient.id}
                      onChange={e => setSelectedPatient(patients.find(p => p.id === e.target.value) || selectedPatient)}
                      className="input-field text-xs"
                    >
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.mrn}) - Bed {p.bed}</option>
                      ))}
                    </select>
                  </div>

                  {/* Category tabs */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1.5">Document Category</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: 'scan', label: 'Scan / DICOM', icon: Image },
                        { id: 'medication', label: 'Medication', icon: Pill },
                        { id: 'lab', label: 'Lab Report', icon: Activity },
                        { id: 'clinical', label: 'Clinical Note', icon: FileText },
                      ].map(cat => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setRecordType(cat.id as any)}
                          className={`p-2 rounded-xl text-center flex flex-col items-center gap-1 border transition-all text-xs font-medium ${
                            recordType === cat.id ? 'bg-primary-50 border-primary-500 text-primary-700 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          <cat.icon size={16} />
                          <span className="text-[10px]">{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Record Title / Description</label>
                    <input
                      type="text"
                      placeholder="e.g., MRI Brain Scan 3D / Lisinopril 20mg Log"
                      value={uploadTitle}
                      onChange={e => setUploadTitle(e.target.value)}
                      className="input-field text-xs"
                      required
                    />
                  </div>

                  {/* Drag and drop file simulator */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">File Attachment (DICOM, PDF, PNG)</label>
                    <div className="border-2 border-dashed border-slate-200 hover:border-primary-400 bg-slate-50 rounded-xl p-4 text-center cursor-pointer transition-all">
                      <FileUp size={24} className="text-primary-500 mx-auto mb-1" />
                      <p className="text-xs font-semibold text-slate-700">Click to browse or drop file here</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Supports DICOM, PDF, JPG up to 100MB</p>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Clinical Impressions / Notes</label>
                    <textarea
                      rows={2}
                      placeholder="Enter physician observations or dosing instructions..."
                      value={uploadNotes}
                      onChange={e => setUploadNotes(e.target.value)}
                      className="input-field text-xs"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button type="button" onClick={() => setShowUploadModal(false)} className="btn-secondary text-xs flex-1">
                      Cancel
                    </button>
                    <button type="submit" disabled={uploading} className="btn-primary text-xs flex-1">
                      {uploading ? 'Processing & Indexing...' : 'Upload & Process Record'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

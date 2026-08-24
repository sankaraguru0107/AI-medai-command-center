import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Activity,
  Pill,
  Sparkles,
  Download,
  Calendar,
  Eye,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Search,
  BookOpen
} from 'lucide-react';
import { MetricCard } from '../common/MetricCard';

interface Report {
  id: string;
  title: string;
  category: 'clinical' | 'lab' | 'discharge';
  date: string;
  author: string;
  summary: string;
  status: 'Reviewed' | 'Pending Signoff';
  criticalNotes?: string;
}

interface Scan {
  id: string;
  name: string;
  type: string;
  date: string;
  facility: string;
  aiFindings: string;
  status: string;
  technician: string;
  imageUrl?: string;
}

interface MedPlan {
  name: string;
  dosage: string;
  frequency: string;
  purpose: string;
  adherence: number[]; // Adherence % for Mon-Sun
  notes: string;
}

const mockReports: Report[] = [
  {
    id: 'RPT-802',
    title: 'Discharge Summary - Cardiology Ward',
    category: 'discharge',
    date: 'Apr 05, 2026',
    author: 'Dr. Emily Chen, FACC',
    status: 'Reviewed',
    summary: 'Patient discharged following successful stabilization after transient ischemic episode. Prescribed Lisinopril for blood pressure control and scheduled for follow-up telemetry.',
    criticalNotes: 'Monitor heart rate daily. Emergency contact if systolic BP exceeds 160mmHg.'
  },
  {
    id: 'RPT-794',
    title: 'Comprehensive Metabolic Panel (CMP)',
    category: 'lab',
    date: 'Apr 10, 2026',
    author: 'Quest Diagnostics Lab 4',
    status: 'Reviewed',
    summary: 'Sodium, Potassium, and Chloride levels are within reference margins. Glucose level slightly elevated at 104 mg/dL. Renal function panels are fully nominal.',
  },
  {
    id: 'RPT-755',
    title: 'Post-Discharge 3-Day Home Vitals Review',
    category: 'clinical',
    date: 'Apr 08, 2026',
    author: 'Care Coach Sarah Jenkins, RN',
    status: 'Pending Signoff',
    summary: 'Telehealth review of home vitals logs. Average blood pressure 122/78 mmHg, average oxygen saturation 98.4%. Patient reports mild fatigue in the evenings.',
  }
];

const mockScans: Scan[] = [
  {
    id: 'SCN-101',
    name: 'Chest X-Ray 2-View PA & Lateral',
    type: 'Radiology / X-Ray',
    date: 'Apr 06, 2026',
    facility: 'MedAI Diagnostics Center',
    aiFindings: 'Lungs are clear bilaterally. No pleural effusion or pneumothorax. Cardiothoracic ratio is upper limits of normal. Calcified aortic knob noted.',
    status: 'Normal findings - AI Confirmed',
    technician: 'Marcus Broadus, RT(R)'
  },
  {
    id: 'SCN-102',
    name: 'Brain MRI without Contrast',
    type: 'MRI Scan',
    date: 'Apr 02, 2026',
    facility: 'University Imaging Hub',
    aiFindings: 'No acute intracranial hemorrhage or large territory infarct. Mild chronic microvascular ischemic changes appropriate for patient age. Ventricles are normal.',
    status: 'Stable / Unchanged',
    technician: 'Sarah Gellar, RT(MR)'
  }
];

const mockMeds: MedPlan[] = [
  {
    name: 'Metformin 500mg',
    dosage: '1 Tablet',
    frequency: 'Twice daily with breakfast and dinner',
    purpose: 'Type 2 Diabetes mellitus glycemic control',
    adherence: [100, 100, 100, 100, 50, 100, 100],
    notes: 'Do not take on empty stomach to minimize gastrointestinal upset.'
  },
  {
    name: 'Lisinopril 10mg',
    dosage: '1 Tablet',
    frequency: 'Once daily in the morning',
    purpose: 'Essential Hypertension treatment',
    adherence: [100, 100, 100, 100, 100, 100, 100],
    notes: 'Monitor for dry cough or lightheadedness upon standing.'
  },
  {
    name: 'Atorvastatin 40mg',
    dosage: '1 Tablet',
    frequency: 'Once daily at bedtime',
    purpose: 'Hypercholesterolemia management',
    adherence: [100, 50, 100, 100, 100, 50, 100],
    notes: 'Report any unexplained muscle pain or weakness immediately.'
  }
];

export const PostDischargeModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'reports' | 'scans' | 'meds'>('reports');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [selectedScan, setSelectedScan] = useState<Scan | null>(null);

  const filteredReports = mockReports.filter(r =>
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredScans = mockScans.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.aiFindings.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
            Post-Discharge Follow-Up Hub <Sparkles size={18} className="text-primary-500" />
          </h1>
          <p className="text-sm text-slate-500">View diagnostic reports, radiology scans, and daily medication plans for patient engagement.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="dot-live" />
          <span className="text-xs font-semibold text-slate-600">Active Care Plan Logs</span>
        </div>
      </div>

      {/* Tabs Navigator */}
      <div className="flex border-b border-slate-200 gap-1 bg-white p-1 rounded-xl shadow-xs">
        <button
          onClick={() => { setActiveTab('reports'); setSearchTerm(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'reports' ? 'bg-primary-50 text-primary-600' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <FileText size={16} />
          Patient Reports
        </button>
        <button
          onClick={() => { setActiveTab('scans'); setSearchTerm(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'scans' ? 'bg-teal-50 text-teal-600' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Activity size={16} />
          Scan Reports
        </button>
        <button
          onClick={() => { setActiveTab('meds'); setSearchTerm(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'meds' ? 'bg-amber-50 text-amber-600' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Pill size={16} />
          Medication Report
        </button>
      </div>

      {/* Tab: Patient Reports */}
      {activeTab === 'reports' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            <div className="space-y-3">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className={`glass-card p-4 cursor-pointer border transition-all ${
                    selectedReport?.id === report.id ? 'border-primary-500 bg-primary-50/20' : 'hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-primary-600 uppercase tracking-wider bg-primary-50 px-2 py-0.5 rounded">
                          {report.category}
                        </span>
                        <span className="text-xs text-slate-400">{report.date}</span>
                      </div>
                      <h3 className="font-semibold text-slate-800 text-sm mt-1.5">{report.title}</h3>
                      <p className="text-xs text-slate-500 mt-1">Signed: {report.author}</p>
                    </div>
                    <span className={`badge text-[10px] ${
                      report.status === 'Reviewed' ? 'badge-success' : 'badge-warning'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                </div>
              ))}
              {filteredReports.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs">No patient reports match the query.</div>
              )}
            </div>
          </div>

          {/* Report Viewer / Details Sidepanel */}
          <div className="lg:col-span-1">
            {selectedReport ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 border border-primary-100 bg-white sticky top-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="font-display font-semibold text-slate-800 text-sm">Report View</h4>
                  <span className="text-xs text-slate-400 font-bold">{selectedReport.id}</span>
                </div>

                <div className="mt-4 space-y-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Title</span>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">{selectedReport.title}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Author & Date</span>
                    <p className="text-xs text-slate-600 mt-0.5">{selectedReport.author} | {selectedReport.date}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Clinical Summary</span>
                    <p className="text-xs text-slate-700 leading-relaxed mt-1 p-3 bg-slate-50 rounded-xl">
                      {selectedReport.summary}
                    </p>
                  </div>

                  {selectedReport.criticalNotes && (
                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl">
                      <div className="flex items-center gap-1.5 text-rose-700 text-xs font-semibold mb-1">
                        <AlertCircle size={14} /> Critical Care Note
                      </div>
                      <p className="text-[11px] text-rose-600 leading-normal">{selectedReport.criticalNotes}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button className="btn-primary text-xs flex-1 py-2">
                      <Download size={13} /> Download PDF
                    </button>
                    <button className="btn-secondary text-xs py-2">
                      <Eye size={13} /> Fullscreen
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="glass-card p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200">
                Select a report from the list to view clinical summaries, author credentials, and notes.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Scan Reports */}
      {activeTab === 'scans' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search scans & imaging..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredScans.map((scan) => (
                <div
                  key={scan.id}
                  onClick={() => setSelectedScan(scan)}
                  className={`glass-card p-4 cursor-pointer border transition-all ${
                    selectedScan?.id === scan.id ? 'border-teal-500 bg-teal-50/10' : 'hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                      <Activity size={20} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{scan.date}</span>
                  </div>
                  <h3 className="font-semibold text-slate-800 text-sm">{scan.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{scan.facility}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-lg">
                      {scan.type}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">ID: {scan.id}</span>
                  </div>
                </div>
              ))}
              {filteredScans.length === 0 && (
                <div className="col-span-2 text-center py-8 text-slate-400 text-xs">No scan reports match the query.</div>
              )}
            </div>
          </div>

          {/* Scan Viewer Panel */}
          <div className="lg:col-span-1">
            {selectedScan ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 border border-teal-100 bg-white sticky top-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="font-display font-semibold text-slate-800 text-sm">Scan Details</h4>
                  <span className="text-xs text-teal-600 font-bold">{selectedScan.id}</span>
                </div>

                <div className="mt-4 space-y-4">
                  {/* Mock Radiograph Image Placeholder */}
                  <div className="w-full h-40 bg-slate-950 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden border border-slate-800">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 opacity-90" />
                    <div className="relative z-10 text-center p-3">
                      <div className="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-400 mx-auto mb-1.5">
                        <Activity size={16} className="animate-pulse" />
                      </div>
                      <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase block">Radiology Scan Image</span>
                      <span className="text-[9px] text-slate-500 mt-1 block">DICOM Layer Verified</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Diagnosis Type</span>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">{selectedScan.name}</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">AI Findings Summary</span>
                    <div className="p-3 bg-teal-50/50 border border-teal-100 rounded-xl mt-1">
                      <div className="flex items-center gap-1.5 text-teal-800 text-xs font-semibold mb-1">
                        <Sparkles size={13} /> Medii Clinical AI Analysis
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">{selectedScan.aiFindings}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Facility & staff</span>
                    <p className="text-xs text-slate-600 mt-0.5">{selectedScan.facility} (Tech: {selectedScan.technician})</p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button className="btn-primary text-xs flex-1 py-2 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 shadow-teal-500/20">
                      <Download size={13} /> View DICOM
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="glass-card p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200">
                Select a scan report to view image, technician notes, and AI findings.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Medication Report */}
      {activeTab === 'meds' && (
        <div className="space-y-6">
          {/* Adherence Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card p-5 bg-gradient-to-br from-amber-50/40 to-orange-50/40">
              <span className="text-xs font-bold text-slate-400 uppercase">Adherence Rating</span>
              <h2 className="text-3xl font-display font-bold text-slate-800 mt-1">92.4%</h2>
              <p className="text-xs text-slate-500 mt-1">On-track for optimal care plan compliance.</p>
            </div>
            <div className="glass-card p-5">
              <span className="text-xs font-bold text-slate-400 uppercase">Next Scheduled Intake</span>
              <h2 className="text-xl font-semibold text-slate-800 mt-2">Tonight at 9:00 PM</h2>
              <p className="text-xs text-amber-600 font-medium mt-1">Atorvastatin 40mg (1 Pill)</p>
            </div>
            <div className="glass-card p-5">
              <span className="text-xs font-bold text-slate-400 uppercase">Pharmacy Delivery</span>
              <h2 className="text-xl font-semibold text-slate-800 mt-2">Nominal refills</h2>
              <p className="text-xs text-slate-500 mt-1">Refills automatically synced via FHIR api.</p>
            </div>
          </div>

          <div className="glass-card p-5">
            <h3 className="font-display font-semibold text-slate-800 text-sm mb-4">Medications Compliance Log</h3>
            <div className="space-y-4">
              {mockMeds.map((med, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1 md:max-w-md">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-slate-800 text-sm">{med.name}</h4>
                      <span className="text-[10px] text-slate-400 font-semibold px-2 py-0.5 bg-slate-200 rounded">
                        {med.dosage}
                      </span>
                    </div>
                    <p className="text-xs text-primary-600 font-medium">{med.frequency}</p>
                    <p className="text-xs text-slate-500">{med.purpose}</p>
                    <p className="text-xs text-slate-400 italic mt-1">{med.notes}</p>
                  </div>

                  {/* Weekly compliance visualizer */}
                  <div className="space-y-1.5 min-w-[200px]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Weekly Intake Compliance</span>
                    <div className="flex gap-1.5">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, dIdx) => {
                        const status = med.adherence[dIdx];
                        return (
                          <div key={dIdx} className="flex-1 flex flex-col items-center">
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white ${
                              status === 100 ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}>
                              ✓
                            </div>
                            <span className="text-[9px] text-slate-400 font-semibold mt-1">{day}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

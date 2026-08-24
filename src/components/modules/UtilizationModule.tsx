import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, TrendingDown, Clock, CheckCircle, AlertTriangle, ShieldCheck,
  Brain, FileText, Check, Plus, DollarSign, ChevronRight, X, Sparkles,
  ArrowUpRight, Users, Building2, Calendar, ShieldAlert
} from 'lucide-react';
import { MetricCard } from '../common/MetricCard';
import { askMedAI } from '../../services/azureOpenAI';

export interface DischargeBarrier {
  id: string;
  patient: string;
  room: string;
  age: number;
  losDays: number;
  targetLos: number;
  drg: string;
  specialty: string;
  barrierCategory: 'DME Equipment' | 'SNF / Rehab Bed' | 'Home Health Auth' | 'Payer Prior Auth' | 'Social Work' | 'Clinical Clearance';
  barrierDescription: string;
  assignedOwner: string;
  status: 'Active Barrier' | 'Escalated' | 'Pending Verification' | 'Resolved';
  excessCostExposure: number;
}

const initialBarriers: DischargeBarrier[] = [
  {
    id: 'b-1',
    patient: 'James Wilson',
    room: 'ICU Bed 04 (MICU)',
    age: 68,
    losDays: 6,
    targetLos: 4.5,
    drg: 'DRG 189 - Respiratory Failure w/ MCC',
    specialty: 'Critical Care',
    barrierCategory: 'DME Equipment',
    barrierDescription: 'Waiting on DME home oxygen concentrator & bipap machine setup for afternoon transport.',
    assignedOwner: 'CM Sarah Jenkins',
    status: 'Active Barrier',
    excessCostExposure: 2775,
  },
  {
    id: 'b-2',
    patient: 'Maria Rivera',
    room: 'Room 206 (4A)',
    age: 74,
    losDays: 8,
    targetLos: 5.2,
    drg: 'DRG 470 - Major Joint Replacement',
    specialty: 'Orthopedics',
    barrierCategory: 'SNF / Rehab Bed',
    barrierDescription: 'Sub-acute rehabilitation bed acceptance pending at Pinecrest Manor.',
    assignedOwner: 'SW Elena Rostova',
    status: 'Active Barrier',
    excessCostExposure: 5180,
  },
  {
    id: 'b-3',
    patient: 'Robert Kim',
    room: 'Room 312 (4B)',
    age: 59,
    losDays: 5,
    targetLos: 3.8,
    drg: 'DRG 291 - Heart Failure w/ MCC',
    specialty: 'Cardiology',
    barrierCategory: 'Payer Prior Auth',
    barrierDescription: 'Payer Peer-to-Peer scheduled with Medical Director for continued stay approval.',
    assignedOwner: 'Dr. Emily Chen / Case Mgmt',
    status: 'Escalated',
    excessCostExposure: 2220,
  },
  {
    id: 'b-4',
    patient: 'David Vance',
    room: 'Room 108 (4A)',
    age: 62,
    losDays: 4,
    targetLos: 3.0,
    drg: 'DRG 683 - Renal Failure w/ CC',
    specialty: 'Nephrology',
    barrierCategory: 'Home Health Auth',
    barrierDescription: 'Home IV antibiotic nursing infusion visit authorization requested from commercial payer.',
    assignedOwner: 'CM Maya Lin',
    status: 'Active Barrier',
    excessCostExposure: 1850,
  },
  {
    id: 'b-5',
    patient: 'Hannah Sterling',
    room: 'Room 415 (ONC)',
    age: 34,
    losDays: 7,
    targetLos: 6.0,
    drg: 'DRG 843 - Neutropenia / Toxicity',
    specialty: 'Oncology',
    barrierCategory: 'Clinical Clearance',
    barrierDescription: 'Awaiting 48-hour final blood culture clearance to confirm negative growth.',
    assignedOwner: 'Dr. Marcus Brody',
    status: 'Pending Verification',
    excessCostExposure: 1850,
  },
];

const specialtyGmlos = [
  { specialty: 'Critical Care (ICU)', alos: 5.2, gmlos: 4.8, variance: '+0.4d', excessDays: 14, costExposure: '$25,900', color: 'text-rose-600' },
  { specialty: 'Cardiology / Cath', alos: 2.9, gmlos: 2.8, variance: '+0.1d', excessDays: 4, costExposure: '$7,400', color: 'text-amber-600' },
  { specialty: 'Orthopedics', alos: 2.4, gmlos: 2.5, variance: '-0.1d', excessDays: 0, costExposure: '$0 (Efficient)', color: 'text-emerald-600' },
  { specialty: 'General Surgery', alos: 3.6, gmlos: 3.2, variance: '+0.4d', excessDays: 12, costExposure: '$22,200', color: 'text-rose-600' },
  { specialty: 'Internal Medicine', alos: 4.3, gmlos: 3.8, variance: '+0.5d', excessDays: 22, costExposure: '$40,700', color: 'text-rose-600' },
  { specialty: 'Oncology', alos: 6.1, gmlos: 5.7, variance: '+0.4d', excessDays: 8, costExposure: '$14,800', color: 'text-amber-600' },
];

export const UtilizationModule: React.FC = () => {
  const [barriers, setBarriers] = useState<DischargeBarrier[]>(initialBarriers);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showAddBarrierModal, setShowAddBarrierModal] = useState<boolean>(false);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  // New Barrier Form State
  const [newPatient, setNewPatient] = useState<string>('');
  const [newRoom, setNewRoom] = useState<string>('');
  const [newCategory, setNewCategory] = useState<DischargeBarrier['barrierCategory']>('DME Equipment');
  const [newDesc, setNewDesc] = useState<string>('');
  const [newOwner, setNewOwner] = useState<string>('Case Management');

  const handleResolveBarrier = (id: string) => {
    setBarriers(prev =>
      prev.map(b => (b.id === id ? { ...b, status: 'Resolved' } : b))
    );
  };

  const handleCreateBarrier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatient.trim()) return;

    const newEntry: DischargeBarrier = {
      id: `b-${Date.now()}`,
      patient: newPatient.trim(),
      room: newRoom.trim() || 'Room Unassigned',
      age: 65,
      losDays: 4,
      targetLos: 3.5,
      drg: 'DRG General Inpatient',
      specialty: 'General Medicine',
      barrierCategory: newCategory,
      barrierDescription: newDesc.trim() || 'Standard discharge barrier resolution in progress.',
      assignedOwner: newOwner,
      status: 'Active Barrier',
      excessCostExposure: 1850,
    };

    setBarriers(prev => [newEntry, ...prev]);
    setShowAddBarrierModal(false);
    setNewPatient('');
    setNewRoom('');
    setNewDesc('');
  };

  const handleRunAICaseReview = async (barrier: DischargeBarrier) => {
    setAiLoading(true);
    try {
      const prompt = `Act as an expert Hospital Utilization Reviewer & Case Manager.
Patient: ${barrier.patient}, ${barrier.age}y, ${barrier.room}
DRG: ${barrier.drg}
Current LOS: ${barrier.losDays} days (GMLOS Target: ${barrier.targetLos}d)
Active Barrier: ${barrier.barrierCategory} - ${barrier.barrierDescription}

Generate a concise 3-point strategy to:
1. Expedite barrier resolution today.
2. Outline key clinical documentation points for insurance authorization/peer-to-peer.
3. Prevent avoidable bed-day write-offs.`;

      const res = await askMedAI(prompt, 'operations');
      setAiAnalysis(res);
    } catch {
      setAiAnalysis(`• DME Escalation: Contact primary medical supply distributor with STAT courier dispatch order for delivery by 14:00.\n• Payer Prior Auth: Reference InterQual acute inpatient criteria citing high oxygen demand requiring home titration.\n• Step-down: Secure attending physician verbal discharge clearance to initiate transport.`);
    } finally {
      setAiLoading(false);
    }
  };

  const filteredBarriers = barriers.filter(b => {
    if (selectedCategory === 'All') return true;
    return b.barrierCategory === selectedCategory;
  });

  const activeBarrierCount = barriers.filter(b => b.status !== 'Resolved').length;
  const totalCostExposure = barriers
    .filter(b => b.status !== 'Resolved')
    .reduce((acc, b) => acc + b.excessCostExposure, 0);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1700px] mx-auto min-h-screen text-slate-800">
      {/* MODULE HEADER & FINANCIAL METRICS */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5 bg-gradient-to-r from-white via-slate-50 to-teal-50/20 border-slate-200/90 shadow-glass"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 via-teal-700 to-primary-700 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <BarChart3 size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-display text-2xl font-extrabold text-slate-900 tracking-tight">
                  Utilization Management & Length of Stay (LOS) Hub
                </h1>
                <span className="badge-info text-xs font-bold">
                  <ShieldCheck size={13} />
                  CMS TWO-MIDNIGHT COMPLIANT
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Discharge barrier resolution pipeline, ALOS vs GMLOS variance analytics, and avoidable bed-day cost optimization.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowAddBarrierModal(true)}
              className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 shadow-teal-600/20"
            >
              <Plus size={15} />
              <span>Log Discharge Barrier</span>
            </button>

            <button
              onClick={() => handleRunAICaseReview(barriers[0])}
              disabled={aiLoading}
              className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 border-teal-200 text-teal-700 bg-teal-50/50 hover:bg-teal-100"
            >
              <Brain size={14} className="text-teal-600" />
              <span>AI Case Management Copilot</span>
            </button>
          </div>
        </div>

        {/* Aggregate KPI Strip */}
        <div className="mt-4 pt-3.5 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-slate-200/70 shadow-xs">
            <BarChart3 size={18} className="text-teal-600" />
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Hospital Avg LOS</div>
              <div className="text-base font-extrabold text-slate-900">3.84 Days <span className="text-[10px] text-amber-600 font-bold">(+0.34d GMLOS)</span></div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-slate-200/70 shadow-xs">
            <Clock size={18} className="text-amber-600" />
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Extended LOS (&gt;7d)</div>
              <div className="text-base font-extrabold text-amber-700">4 Active Cases</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-slate-200/70 shadow-xs">
            <AlertTriangle size={18} className="text-rose-600" />
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Pending Barriers</div>
              <div className="text-base font-extrabold text-rose-700">{activeBarrierCount} In-Progress</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-slate-200/70 shadow-xs">
            <DollarSign size={18} className="text-emerald-600" />
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Avoidable Cost Exposure</div>
              <div className="text-base font-extrabold text-emerald-700">${totalCostExposure.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* AI CASE MANAGEMENT COPILOT INSIGHTS */}
      {(aiLoading || aiAnalysis) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="glass-card p-4 bg-teal-50/90 border border-teal-200 rounded-2xl flex items-start gap-3 text-xs"
        >
          <div className="p-2 bg-teal-600 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
            <Brain size={16} />
          </div>
          <div className="flex-1 space-y-1">
            <div className="font-bold text-teal-900 flex items-center justify-between">
              <span>MedAI Case Management & Discharge Appeal Recommendations</span>
              <button onClick={() => setAiAnalysis(null)} className="text-teal-500 hover:text-teal-800 font-bold">
                <X size={14} />
              </button>
            </div>
            {aiLoading ? (
              <div className="flex items-center gap-2 text-teal-700">
                <div className="w-3.5 h-3.5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                <span>Generating clinical criteria, payer justification, and transfer logistics...</span>
              </div>
            ) : (
              <p className="text-slate-700 leading-relaxed whitespace-pre-line font-medium">{aiAnalysis}</p>
            )}
          </div>
        </motion.div>
      )}

      {/* ALOS vs GMLOS BENCHMARK MATRIX */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
          <div>
            <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2">
              <BarChart3 size={16} className="text-teal-600" />
              Specialty ALOS vs CMS Geometric Mean (GMLOS) Performance
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Target benchmarks calculated based on DRG case-mix index.</p>
          </div>
          <span className="text-xs font-bold text-slate-600">Avoidable Day Benchmark: $1,850 / Day</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {specialtyGmlos.map(item => (
            <div key={item.specialty} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="font-bold text-xs text-slate-900 truncate">{item.specialty}</div>
              <div className="flex items-baseline justify-between">
                <span className="text-base font-extrabold font-display text-slate-900">{item.alos}d</span>
                <span className={`text-xs font-extrabold ${item.color}`}>{item.variance}</span>
              </div>
              <div className="pt-2 border-t border-slate-200/60 text-[10px] flex justify-between text-slate-500">
                <span>GMLOS: {item.gmlos}d</span>
                <span className="font-bold text-slate-700">{item.costExposure}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ACTIVE DISCHARGE BARRIER MANAGEMENT KANBAN / TABLE */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2">
                <Clock size={16} className="text-rose-600" />
                Active Inpatient Discharge Barrier Tracker ({filteredBarriers.length})
              </h3>
              <span className="badge-warning text-[10px] font-bold">
                {activeBarrierCount} Open Barriers
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live barriers preventing safe patient discharge: DME delivery, SNF beds, home nursing auth, and physician orders.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold shadow-xs"
            >
              <option value="All">All Barrier Types</option>
              <option value="DME Equipment">DME Equipment</option>
              <option value="SNF / Rehab Bed">SNF / Rehab Bed</option>
              <option value="Payer Prior Auth">Payer Prior Auth</option>
              <option value="Home Health Auth">Home Health Auth</option>
              <option value="Clinical Clearance">Clinical Clearance</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Patient & Location</th>
                <th className="py-2.5 px-3">DRG & Specialty</th>
                <th className="py-2.5 px-3">LOS vs Target</th>
                <th className="py-2.5 px-3">Barrier Classification</th>
                <th className="py-2.5 px-3">Clinical Barrier Details</th>
                <th className="py-2.5 px-3">Assigned Owner</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredBarriers.map(b => {
                const isResolved = b.status === 'Resolved';
                return (
                  <tr key={b.id} className={`transition-colors ${isResolved ? 'bg-emerald-50/40 opacity-75' : 'hover:bg-slate-50/80'}`}>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{b.patient} ({b.age}y)</div>
                      <div className="text-[10px] text-slate-400 font-mono">{b.room}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">{b.specialty}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[160px]">{b.drg}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <strong className="text-slate-900">{b.losDays}d</strong>
                        <span className="text-[10px] text-slate-400">/ {b.targetLos}d tgt</span>
                        {b.losDays > b.targetLos && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px] font-extrabold">
                            +{Math.round((b.losDays - b.targetLos) * 10) / 10}d
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-semibold text-[11px]">
                        {b.barrierCategory}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <p className="text-xs text-slate-700 max-w-xs">{b.barrierDescription}</p>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-xs font-semibold text-slate-800">{b.assignedOwner}</span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleRunAICaseReview(b)}
                          title="Generate AI Strategy"
                          className="p-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-xs font-bold"
                        >
                          <Brain size={13} />
                        </button>

                        {!isResolved ? (
                          <button
                            onClick={() => handleResolveBarrier(b.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] inline-flex items-center gap-1 shadow-xs transition-all"
                          >
                            <Check size={12} /> Clear Barrier
                          </button>
                        ) : (
                          <span className="badge-success text-[10px]">Cleared</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* LOG DISCHARGE BARRIER MODAL */}
      <AnimatePresence>
        {showAddBarrierModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                    <Plus size={18} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-slate-900 text-base">Log Discharge Barrier</h3>
                    <p className="text-xs text-slate-400">Track pending logistics to prevent avoidable bed days</p>
                  </div>
                </div>
                <button onClick={() => setShowAddBarrierModal(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateBarrier} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Patient Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Eleanor Vance"
                      value={newPatient}
                      onChange={e => setNewPatient(e.target.value)}
                      className="input-field text-xs"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Room / Unit</label>
                    <input
                      type="text"
                      placeholder="e.g. Room 204 (4A)"
                      value={newRoom}
                      onChange={e => setNewRoom(e.target.value)}
                      className="input-field text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Barrier Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="input-field text-xs"
                  >
                    <option value="DME Equipment">DME Medical Equipment (O2, Bed, Wheelchair)</option>
                    <option value="SNF / Rehab Bed">SNF / Sub-Acute Rehab Bed Acceptance</option>
                    <option value="Payer Prior Auth">Payer Prior Auth / Peer-to-Peer Review</option>
                    <option value="Home Health Auth">Home Health Agency Nursing Authorization</option>
                    <option value="Social Work">Social Work / Guardianship / Transportation</option>
                    <option value="Clinical Clearance">Clinical / Lab / Wound Check Clearance</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Barrier Description & Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Specific barrier hold notes..."
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    className="input-field text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Assigned Owner</label>
                  <input
                    type="text"
                    value={newOwner}
                    onChange={e => setNewOwner(e.target.value)}
                    className="input-field text-xs"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setShowAddBarrierModal(false)} className="btn-secondary text-xs flex-1">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary text-xs flex-1 justify-center bg-teal-600 hover:bg-teal-700">
                    Save Discharge Barrier
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

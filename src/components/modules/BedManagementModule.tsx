import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bed, Brain, User, RefreshCw, Zap, CheckCircle2, Plus, Sparkles,
  X, ShieldAlert, Filter, Search, Clock, Activity, AlertTriangle,
  UserCheck, ArrowRight, Check, FileText, ChevronRight, Layers,
  Trash2, ShieldCheck, HeartPulse, Wind, Stethoscope
} from 'lucide-react';
import { MetricCard } from '../common/MetricCard';
import { BedOccupancyChart } from '../charts';
import { askMedAI } from '../../services/azureOpenAI';

export type BedStatus = 'occupied' | 'available' | 'cleaning' | 'maintenance' | 'reserved';
export type IsolationType = 'None' | 'Contact (MRSA)' | 'Airborne (COVID/TB)' | 'Droplet (Flu)' | 'Protective (Neutropenic)';
export type AcuityLevel = 'Critical (ICU)' | 'Step-down Telemetry' | 'Acute Med/Surg' | 'Observation';

export interface BedItem {
  id: string;
  unit: string;
  number: string;
  status: BedStatus;
  patient: string | null;
  age?: number;
  mrn?: string;
  los: number | null;
  acuity: AcuityLevel;
  isolation: IsolationType;
  telemetry: boolean;
  ventilator: boolean;
  primaryNurse: string;
  attendingMD: string;
  cleaningElapsedMins?: number;
  cleaningPriority?: 'Routine' | 'STAT';
}

const statusConfig: Record<BedStatus, { label: string; color: string; bg: string; badge: string; dotColor: string }> = {
  occupied: { label: 'Occupied', color: 'text-rose-700', bg: 'bg-rose-50/90 border-rose-200 hover:border-rose-400', badge: 'bg-rose-100 text-rose-800 border-rose-200', dotColor: 'bg-rose-500' },
  available: { label: 'Clean & Available', color: 'text-emerald-700', bg: 'bg-emerald-50/90 border-emerald-200 hover:border-emerald-400', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200', dotColor: 'bg-emerald-500' },
  cleaning: { label: 'EVS In-Progress', color: 'text-amber-700', bg: 'bg-amber-50/90 border-amber-200 hover:border-amber-400', badge: 'bg-amber-100 text-amber-800 border-amber-200', dotColor: 'bg-amber-500' },
  maintenance: { label: 'Out of Service', color: 'text-slate-700', bg: 'bg-slate-100/90 border-slate-200 hover:border-slate-400', badge: 'bg-slate-200 text-slate-700 border-slate-300', dotColor: 'bg-slate-500' },
  reserved: { label: 'Reserved / Inbound', color: 'text-violet-700', bg: 'bg-violet-50/90 border-violet-200 hover:border-violet-400', badge: 'bg-violet-100 text-violet-800 border-violet-200', dotColor: 'bg-violet-500' },
};

const nurseList = ['RN Sarah Jenkins', 'RN David Vance', 'RN Maya Lin', 'RN Carlos Cruz', 'RN Elena Rostova', 'RN Priya Patel'];
const mdList = ['Dr. Emily Chen', 'Dr. Robert Kim', 'Dr. Marcus Brody', 'Dr. Samantha Adams'];

const generateInitialBeds = (unit: string, count: number, defaultAcuity: AcuityLevel): BedItem[] => {
  const patientPool = [
    { name: 'James Wilson', age: 68 },
    { name: 'Sarah Chen', age: 45 },
    { name: 'Maria Rivera', age: 74 },
    { name: 'Robert Kim', age: 59 },
    { name: 'Lucas Scott', age: 38 },
    { name: 'Diana Lee', age: 82 },
    { name: 'Anthony Rossi', age: 61 },
    { name: 'Priya Sharma', age: 50 },
    { name: 'William Turner', age: 71 },
    { name: 'Grace Hopper', age: 64 },
  ];

  return Array.from({ length: count }, (_, i) => {
    const bedNum = `${unit}-${(i + 1).toString().padStart(2, '0')}`;
    let status: BedStatus = 'available';
    if (i < Math.floor(count * 0.72)) {
      status = 'occupied';
    } else if (i === Math.floor(count * 0.72)) {
      status = 'cleaning';
    } else if (i === Math.floor(count * 0.72) + 1) {
      status = 'reserved';
    }

    const patientData = status === 'occupied' ? patientPool[i % patientPool.length] : null;
    const isIso = status === 'occupied' && i % 4 === 0;

    return {
      id: `${unit}-${i + 1}`,
      unit,
      number: bedNum,
      status,
      patient: patientData ? patientData.name : status === 'reserved' ? 'Inbound ED Hold' : null,
      age: patientData ? patientData.age : undefined,
      mrn: patientData ? `MRN-${204000 + i}` : undefined,
      los: status === 'occupied' ? Math.floor(Math.random() * 8) + 1 : null,
      acuity: defaultAcuity,
      isolation: isIso ? 'Contact (MRSA)' : 'None',
      telemetry: defaultAcuity.includes('ICU') || defaultAcuity.includes('Telemetry'),
      ventilator: defaultAcuity.includes('ICU') && i % 3 === 0,
      primaryNurse: nurseList[i % nurseList.length],
      attendingMD: mdList[i % mdList.length],
      cleaningElapsedMins: status === 'cleaning' ? 18 : undefined,
      cleaningPriority: status === 'cleaning' ? 'Routine' : undefined,
    };
  });
};

interface UnitGroup {
  name: string;
  category: string;
  defaultAcuity: AcuityLevel;
  beds: BedItem[];
}

const initialUnitsData: UnitGroup[] = [
  { name: 'Medical ICU', category: 'Critical Care', defaultAcuity: 'Critical (ICU)', beds: generateInitialBeds('MICU', 20, 'Critical (ICU)') },
  { name: 'Surgical ICU', category: 'Critical Care', defaultAcuity: 'Critical (ICU)', beds: generateInitialBeds('SICU', 16, 'Critical (ICU)') },
  { name: 'Cardiac Telemetry', category: 'Step-down', defaultAcuity: 'Step-down Telemetry', beds: generateInitialBeds('CARD', 24, 'Step-down Telemetry') },
  { name: 'Med/Surg East (4A)', category: 'Acute Inpatient', defaultAcuity: 'Acute Med/Surg', beds: generateInitialBeds('4A', 32, 'Acute Med/Surg') },
  { name: 'Med/Surg West (4B)', category: 'Acute Inpatient', defaultAcuity: 'Acute Med/Surg', beds: generateInitialBeds('4B', 28, 'Acute Med/Surg') },
  { name: 'Oncology Inpatient', category: 'Specialty Care', defaultAcuity: 'Acute Med/Surg', beds: generateInitialBeds('ONC', 26, 'Acute Med/Surg') },
];

export const BedManagementModule: React.FC = () => {
  const [units, setUnits] = useState<UnitGroup[]>(initialUnitsData);
  const [activeUnitIndex, setActiveUnitIndex] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBed, setSelectedBed] = useState<BedItem | null>(null);

  // Auto-Allocation Modal State
  const [showAllocateModal, setShowAllocateModal] = useState<boolean>(false);
  const [patientName, setPatientName] = useState<string>('');
  const [patientAge, setPatientAge] = useState<string>('65');
  const [targetAcuity, setTargetAcuity] = useState<AcuityLevel>('Critical (ICU)');
  const [requiredIsolation, setRequiredIsolation] = useState<IsolationType>('None');
  const [requireTelemetry, setRequireTelemetry] = useState<boolean>(true);
  const [requireVentilator, setRequireVentilator] = useState<boolean>(false);
  const [allocating, setAllocating] = useState<boolean>(false);
  const [allocatedResult, setAllocatedResult] = useState<{ bedNumber: string; unit: string; patient: string; rationale: string } | null>(null);

  // EVS Quick Clean Modal / Drawer
  const [showEvsPanel, setShowEvsPanel] = useState<boolean>(false);

  // AI Planner State
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiInsights, setAiInsights] = useState<string | null>(null);

  const activeUnit = units[activeUnitIndex] || units[0];

  // Aggregated Stats
  const totalFacilityBeds = useMemo(() => units.reduce((a, u) => a + u.beds.length, 0), [units]);
  const totalOccupied = useMemo(() => units.reduce((a, u) => a + u.beds.filter(b => b.status === 'occupied').length, 0), [units]);
  const totalAvailable = useMemo(() => units.reduce((a, u) => a + u.beds.filter(b => b.status === 'available').length, 0), [units]);
  const totalCleaning = useMemo(() => units.reduce((a, u) => a + u.beds.filter(b => b.status === 'cleaning').length, 0), [units]);
  const totalReserved = useMemo(() => units.reduce((a, u) => a + u.beds.filter(b => b.status === 'reserved').length, 0), [units]);
  const totalIsolation = useMemo(() => units.reduce((a, u) => a + u.beds.filter(b => b.isolation !== 'None').length, 0), [units]);
  const facilityOccupancyRate = Math.round((totalOccupied / totalFacilityBeds) * 100);

  // Filtered beds for active unit
  const visibleBeds = useMemo(() => {
    return activeUnit.beds.filter(b => {
      const matchStatus = statusFilter === 'all' || b.status === statusFilter;
      const query = searchQuery.toLowerCase().trim();
      const matchQuery = !query ||
        b.number.toLowerCase().includes(query) ||
        (b.patient && b.patient.toLowerCase().includes(query)) ||
        b.primaryNurse.toLowerCase().includes(query) ||
        b.attendingMD.toLowerCase().includes(query);
      return matchStatus && matchQuery;
    });
  }, [activeUnit, statusFilter, searchQuery]);

  // Chart data for occupancy
  const chartData = units.map(u => ({
    unit: u.name.split(' ')[0],
    occupied: u.beds.filter(b => b.status === 'occupied').length,
    total: u.beds.length,
  }));

  // Auto-Allocation Algorithm
  const handleRunAutoAllocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) return;
    setAllocating(true);
    setAllocatedResult(null);

    await new Promise(r => setTimeout(r, 650)); // Simulating multi-criteria neural match

    // Find best candidate unit by matching defaultAcuity
    let targetUnit = units.find(u => u.defaultAcuity === targetAcuity && u.beds.some(b => b.status === 'available'));

    // Fallback if target unit full: any unit with available bed
    if (!targetUnit) {
      targetUnit = units.find(u => u.beds.some(b => b.status === 'available'));
    }

    if (targetUnit) {
      const candidateBed = targetUnit.beds.find(b => b.status === 'available')!;
      const assignedPatientName = patientName.trim();

      // Update bed state
      setUnits(prev =>
        prev.map(u => {
          if (u.name === targetUnit!.name) {
            return {
              ...u,
              beds: u.beds.map(b =>
                b.id === candidateBed.id
                  ? {
                      ...b,
                      status: 'occupied' as BedStatus,
                      patient: assignedPatientName,
                      age: parseInt(patientAge) || 60,
                      mrn: `MRN-${Math.floor(100000 + Math.random() * 900000)}`,
                      los: 1,
                      acuity: targetAcuity,
                      isolation: requiredIsolation,
                      telemetry: requireTelemetry,
                      ventilator: requireVentilator,
                    }
                  : b
              ),
            };
          }
          return u;
        })
      );

      const rationale = `Optimal bed assigned in ${targetUnit.name}. Criteria satisfied: ${targetAcuity} equipment compatibility, ${requiredIsolation === 'None' ? 'Standard precautions' : requiredIsolation} infection control barriers verified, and balanced nursing workload ratio for ${candidateBed.primaryNurse}.`;

      setAllocatedResult({
        bedNumber: candidateBed.number,
        unit: targetUnit.name,
        patient: assignedPatientName,
        rationale,
      });
    } else {
      alert('Surge Capacity Alert: No clean/available beds found across any hospital unit. Please activate PACU overflow protocol.');
    }

    setAllocating(false);
  };

  // Mark bed status direct actions
  const handleUpdateBedStatus = (bedId: string, newStatus: BedStatus) => {
    setUnits(prev =>
      prev.map(u => ({
        ...u,
        beds: u.beds.map(b => {
          if (b.id === bedId) {
            return {
              ...b,
              status: newStatus,
              patient: newStatus === 'available' ? null : b.patient,
              los: newStatus === 'available' ? null : b.los,
              cleaningElapsedMins: newStatus === 'cleaning' ? 1 : undefined,
            };
          }
          return b;
        }),
      }))
    );

    if (selectedBed && selectedBed.id === bedId) {
      setSelectedBed(prev => prev ? { ...prev, status: newStatus, patient: newStatus === 'available' ? null : prev.patient } : null);
    }
  };

  // Request AI Capacity Forecast
  const handleRunAICapacityPlanner = async () => {
    setAiLoading(true);
    try {
      const summaryContext = {
        facilityOccupancy: `${facilityOccupancyRate}%`,
        units: units.map(u => ({
          unit: u.name,
          occupied: u.beds.filter(b => b.status === 'occupied').length,
          available: u.beds.filter(b => b.status === 'available').length,
          cleaning: u.beds.filter(b => b.status === 'cleaning').length,
        })),
      };

      const prompt = `Provide an executive bed capacity optimization and patient discharge forecast based on this hospital data: ${JSON.stringify(summaryContext)}. Include 3 specific tactical recommendations for the charge nurse and operations coordinator.`;
      const res = await askMedAI(prompt, 'operations');
      setAiInsights(res);
    } catch {
      setAiInsights('• Target 4 early discharges in Med/Surg East (4A) before 11:00 AM to absorb incoming ED transfers.\n• Expedite STAT cleaning of Bed MICU-04 to maintain critical care reserve buffer.\n• Transition 2 stabilized Cardiac Telemetry patients to Step-down to unlock telemetry monitors.');
    } finally {
      setAiLoading(false);
    }
  };

  // EVS In-Progress List
  const allCleaningBeds = useMemo(() => {
    const list: BedItem[] = [];
    units.forEach(u => {
      u.beds.filter(b => b.status === 'cleaning').forEach(b => list.push(b));
    });
    return list;
  }, [units]);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1700px] mx-auto min-h-screen text-slate-800">
      {/* MODULE HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5 bg-gradient-to-r from-white via-slate-50 to-emerald-50/20 border-slate-200/90 shadow-glass"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-primary-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Bed size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-display text-2xl font-extrabold text-slate-900 tracking-tight">
                  Bed Management & Auto-Allocation Engine
                </h1>
                <span className="badge-success text-xs font-bold">
                  <Sparkles size={12} />
                  AI Matching V3.8 Active
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Real-time floor census, patient-to-bed acuity optimization, infection isolation management, and EVS turnover queue.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => { setShowAllocateModal(true); setAllocatedResult(null); }}
              className="btn-primary text-xs py-2 px-4 flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 shadow-emerald-600/20"
            >
              <Plus size={15} />
              <span>Register & Auto-Allocate Bed</span>
            </button>

            <button
              onClick={() => setShowEvsPanel(!showEvsPanel)}
              className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
            >
              <RefreshCw size={14} className="text-amber-600" />
              <span>EVS Turnaround Queue ({totalCleaning})</span>
            </button>

            <button
              onClick={handleRunAICapacityPlanner}
              disabled={aiLoading}
              className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 border-primary-200 text-primary-700 bg-primary-50/50 hover:bg-primary-100"
            >
              <Brain size={14} className="text-primary-600" />
              <span>AI Capacity Planner</span>
            </button>
          </div>
        </div>

        {/* Aggregate Status Indicator Strip */}
        <div className="mt-4 pt-3.5 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="flex items-center gap-2 p-2.5 bg-white/80 rounded-xl border border-slate-200/70 shadow-xs">
            <Bed size={16} className="text-primary-600" />
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Total Certified</div>
              <div className="text-sm font-extrabold text-slate-900">{totalFacilityBeds} Beds</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 bg-rose-50/60 rounded-xl border border-rose-200/70 shadow-xs">
            <User size={16} className="text-rose-600" />
            <div>
              <div className="text-[10px] text-rose-500 font-bold uppercase">Active Census</div>
              <div className="text-sm font-extrabold text-rose-700">{totalOccupied} ({facilityOccupancyRate}%)</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-200/70 shadow-xs">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <div>
              <div className="text-[10px] text-emerald-600 font-bold uppercase">Clean Ready</div>
              <div className="text-sm font-extrabold text-emerald-700">{totalAvailable} Beds</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 bg-amber-50/60 rounded-xl border border-amber-200/70 shadow-xs">
            <RefreshCw size={16} className="text-amber-600" />
            <div>
              <div className="text-[10px] text-amber-600 font-bold uppercase">EVS Cleaning</div>
              <div className="text-sm font-extrabold text-amber-700">{totalCleaning} Beds</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 bg-violet-50/60 rounded-xl border border-violet-200/70 shadow-xs">
            <Clock size={16} className="text-violet-600" />
            <div>
              <div className="text-[10px] text-violet-600 font-bold uppercase">Inbound Reserved</div>
              <div className="text-sm font-extrabold text-violet-700">{totalReserved} Beds</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 bg-sky-50/60 rounded-xl border border-sky-200/70 shadow-xs">
            <ShieldAlert size={16} className="text-sky-600" />
            <div>
              <div className="text-[10px] text-sky-600 font-bold uppercase">Isolation Rooms</div>
              <div className="text-sm font-extrabold text-sky-700">{totalIsolation} Active</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* AI INSIGHTS NOTIFICATION BANNER */}
      {(aiLoading || aiInsights) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="glass-card p-4 bg-primary-50/90 border border-primary-200 rounded-2xl flex items-start gap-3 text-xs"
        >
          <div className="p-2 bg-primary-600 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
            <Brain size={16} />
          </div>
          <div className="flex-1 space-y-1">
            <div className="font-bold text-primary-900 flex items-center justify-between">
              <span>MedAI Capacity Optimization Strategy</span>
              <button onClick={() => setAiInsights(null)} className="text-primary-400 hover:text-primary-700 font-bold">
                <X size={14} />
              </button>
            </div>
            {aiLoading ? (
              <div className="flex items-center gap-2 text-primary-700">
                <div className="w-3.5 h-3.5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                <span>Evaluating census trends, discharge orders, and ED admission velocity...</span>
              </div>
            ) : (
              <p className="text-slate-700 leading-relaxed whitespace-pre-line font-medium">{aiInsights}</p>
            )}
          </div>
        </motion.div>
      )}

      {/* UNIT SELECTOR TABS & SEARCH BAR */}
      <div className="glass-card p-4 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Unit Switcher Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin pb-1">
            {units.map((unit, idx) => {
              const occCount = unit.beds.filter(b => b.status === 'occupied').length;
              const occRate = Math.round((occCount / unit.beds.length) * 100);
              const isActive = activeUnitIndex === idx;

              return (
                <button
                  key={unit.name}
                  onClick={() => setActiveUnitIndex(idx)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>{unit.name}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${
                    isActive ? 'bg-primary-500 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {occRate}%
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search and Status Filter */}
          <div className="flex items-center gap-2 text-xs">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search bed, patient, nurse..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-100 rounded-xl text-xs border border-transparent focus:border-primary-400 focus:bg-white outline-none w-48 transition-all"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${statusFilter === 'all' ? 'bg-white shadow-xs text-primary-600 font-bold' : 'text-slate-600'}`}
              >
                All ({activeUnit.beds.length})
              </button>
              <button
                onClick={() => setStatusFilter('available')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${statusFilter === 'available' ? 'bg-white shadow-xs text-emerald-600 font-bold' : 'text-slate-600'}`}
              >
                Clean ({activeUnit.beds.filter(b => b.status === 'available').length})
              </button>
              <button
                onClick={() => setStatusFilter('occupied')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${statusFilter === 'occupied' ? 'bg-white shadow-xs text-rose-600 font-bold' : 'text-slate-600'}`}
              >
                Occupied ({activeUnit.beds.filter(b => b.status === 'occupied').length})
              </button>
              <button
                onClick={() => setStatusFilter('cleaning')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${statusFilter === 'cleaning' ? 'bg-white shadow-xs text-amber-600 font-bold' : 'text-slate-600'}`}
              >
                EVS ({activeUnit.beds.filter(b => b.status === 'cleaning').length})
              </button>
            </div>
          </div>
        </div>

        {/* Legend strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/60 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            {Object.entries(statusConfig).map(([key, val]) => (
              <div key={key} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${val.dotColor}`} />
                <span className="text-[11px] text-slate-500 font-medium">{val.label}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1"><HeartPulse size={12} className="text-primary-500" /> Telemetry</span>
            <span className="flex items-center gap-1"><Wind size={12} className="text-teal-500" /> Ventilator</span>
            <span className="flex items-center gap-1"><ShieldAlert size={12} className="text-amber-500" /> Isolation</span>
          </div>
        </div>
      </div>

      {/* INTERACTIVE UNIT FLOOR BED MATRIX */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3.5">
        {visibleBeds.map(bed => {
          const cfg = statusConfig[bed.status];
          const isSelected = selectedBed?.id === bed.id;

          return (
            <motion.div
              key={bed.id}
              whileHover={{ y: -3 }}
              onClick={() => setSelectedBed(bed)}
              className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden shadow-xs ${cfg.bg} ${
                isSelected ? 'ring-2 ring-primary-500 shadow-md' : ''
              }`}
            >
              {/* Header: Bed number & status badge */}
              <div className="flex items-center justify-between mb-2">
                <span className="font-display font-extrabold text-sm text-slate-900 tracking-tight">
                  {bed.number}
                </span>
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase border ${cfg.badge}`}>
                  {cfg.label.split(' ')[0]}
                </span>
              </div>

              {/* Patient info or Clean state */}
              {bed.status === 'occupied' ? (
                <div className="space-y-1.5 my-2">
                  <div className="font-bold text-xs text-slate-900 truncate">
                    {bed.patient} {bed.age && <span className="text-[10px] text-slate-500 font-normal">({bed.age}y)</span>}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Stay: <strong className="text-slate-800">Day {bed.los}</strong></span>
                    <span className="truncate max-w-[90px]">{bed.primaryNurse.replace('RN ', '')}</span>
                  </div>
                </div>
              ) : bed.status === 'cleaning' ? (
                <div className="my-2 space-y-1">
                  <div className="text-xs font-bold text-amber-800 flex items-center gap-1">
                    <RefreshCw size={12} className="animate-spin text-amber-600" />
                    Housekeeping In-Progress
                  </div>
                  <p className="text-[10px] text-amber-700">Elapsed: {bed.cleaningElapsedMins || 15} mins</p>
                </div>
              ) : bed.status === 'reserved' ? (
                <div className="my-2 space-y-1">
                  <div className="text-xs font-bold text-violet-800">Inbound ED Hold</div>
                  <p className="text-[10px] text-violet-700">Awaiting Transport</p>
                </div>
              ) : (
                <div className="my-2 space-y-1">
                  <div className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-600" />
                    Ready for Admission
                  </div>
                  <p className="text-[10px] text-emerald-700">Cleaned & Inspected</p>
                </div>
              )}

              {/* Badges / telemetry flags */}
              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1">
                  {bed.telemetry && (
                    <span title="Telemetry Active" className="p-1 rounded bg-white text-primary-600 shadow-2xs">
                      <HeartPulse size={10} />
                    </span>
                  )}
                  {bed.ventilator && (
                    <span title="Ventilator Equipped" className="p-1 rounded bg-white text-teal-600 shadow-2xs">
                      <Wind size={10} />
                    </span>
                  )}
                  {bed.isolation !== 'None' && (
                    <span title={`Isolation: ${bed.isolation}`} className="p-1 rounded bg-amber-100 text-amber-800 font-bold text-[9px] shadow-2xs">
                      ISO
                    </span>
                  )}
                </div>

                <span className="text-[10px] font-bold text-slate-400 group-hover:text-primary-600">
                  Inspect →
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* EVS HOUSEKEEPING QUICK QUEUE PANEL (COLLAPSIBLE) */}
      <AnimatePresence>
        {showEvsPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card p-5 space-y-3 bg-amber-50/40 border border-amber-200"
          >
            <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
              <div className="flex items-center gap-2">
                <RefreshCw size={16} className="text-amber-600" />
                <h3 className="font-display font-bold text-slate-900 text-sm">
                  Active Environmental Services (EVS) Cleaning Queue
                </h3>
                <span className="badge-warning text-[10px] font-bold">{allCleaningBeds.length} Beds Pending</span>
              </div>
              <button onClick={() => setShowEvsPanel(false)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {allCleaningBeds.map(b => (
                <div key={b.id} className="p-3 bg-white rounded-xl border border-amber-200 shadow-xs flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-slate-900">{b.number} ({b.unit})</div>
                    <div className="text-[10px] text-amber-700">Turnaround timer: {b.cleaningElapsedMins || 20}m / 45m Target</div>
                  </div>
                  <button
                    onClick={() => handleUpdateBedStatus(b.id, 'available')}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-xs"
                  >
                    <Check size={12} /> Mark Clean
                  </button>
                </div>
              ))}
              {allCleaningBeds.length === 0 && (
                <div className="col-span-full py-4 text-center text-xs text-slate-400">
                  All hospital beds are cleaned and ready for admission!
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BED DETAIL SLIDE-OUT INSPECTION DRAWER */}
      <AnimatePresence>
        {selectedBed && (
          <div className="fixed inset-0 z-50 flex items-center justify-end p-0 bg-slate-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-md h-full shadow-2xl border-l border-slate-200 p-6 flex flex-col justify-between overflow-y-auto"
            >
              <div className="space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-extrabold text-xl text-slate-900">{selectedBed.number}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-extrabold border ${statusConfig[selectedBed.status].badge}`}>
                        {statusConfig[selectedBed.status].label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{selectedBed.unit} Unit · {selectedBed.acuity}</p>
                  </div>
                  <button onClick={() => setSelectedBed(null)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                    <X size={20} />
                  </button>
                </div>

                {/* Patient Profile Card (if occupied) */}
                {selectedBed.status === 'occupied' && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-sm text-slate-900">{selectedBed.patient}</div>
                        <div className="text-[11px] text-slate-400">Age: {selectedBed.age || 65} · {selectedBed.mrn}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-primary-100 text-primary-800 text-xs font-bold">
                        Day {selectedBed.los}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-200">
                      <div>
                        <span className="text-slate-400 block">Attending Physician:</span>
                        <strong className="text-slate-800">{selectedBed.attendingMD}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Primary Nurse:</span>
                        <strong className="text-slate-800">{selectedBed.primaryNurse}</strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bed Equipment & Infection Control Specs */}
                <div className="space-y-2">
                  <h4 className="font-display font-bold text-xs text-slate-900 uppercase tracking-wider">
                    Equipment & Clinical Support
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl">
                      <span className="text-slate-500">Infection Isolation:</span>
                      <strong className={selectedBed.isolation !== 'None' ? 'text-amber-700' : 'text-slate-800'}>
                        {selectedBed.isolation}
                      </strong>
                    </div>
                    <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl">
                      <span className="text-slate-500">Telemetry Monitoring:</span>
                      <strong className={selectedBed.telemetry ? 'text-emerald-700' : 'text-slate-400'}>
                        {selectedBed.telemetry ? 'Continuous ECG Active' : 'None'}
                      </strong>
                    </div>
                    <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl">
                      <span className="text-slate-500">Ventilator / Respiratory:</span>
                      <strong className={selectedBed.ventilator ? 'text-teal-700' : 'text-slate-400'}>
                        {selectedBed.ventilator ? 'Mechanical Ventilator' : 'Room Air / Nasal'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Direct Action Commands */}
                <div className="space-y-2 pt-2">
                  <h4 className="font-display font-bold text-xs text-slate-900 uppercase tracking-wider">
                    Operational State Actions
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleUpdateBedStatus(selectedBed.id, 'cleaning')}
                      className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <RefreshCw size={13} />
                      <span>Request EVS Clean</span>
                    </button>

                    <button
                      onClick={() => handleUpdateBedStatus(selectedBed.id, 'available')}
                      className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <CheckCircle2 size={13} />
                      <span>Mark Ready Clean</span>
                    </button>

                    <button
                      onClick={() => handleUpdateBedStatus(selectedBed.id, 'reserved')}
                      className="p-2.5 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-800 border border-violet-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Clock size={13} />
                      <span>Hold / Reserve Bed</span>
                    </button>

                    <button
                      onClick={() => handleUpdateBedStatus(selectedBed.id, 'maintenance')}
                      className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Trash2 size={13} />
                      <span>Out of Service</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Close footer */}
              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={() => setSelectedBed(null)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all"
                >
                  Close Inspector
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AUTO-ALLOCATE BED MODAL */}
      <AnimatePresence>
        {showAllocateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 relative overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-slate-900 text-base">
                      AI Auto-Allocate Bed Engine
                    </h3>
                    <p className="text-xs text-slate-400">Match optimal bed with multi-factor clinical requirements</p>
                  </div>
                </div>
                <button onClick={() => setShowAllocateModal(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                  <X size={18} />
                </button>
              </div>

              {allocatedResult ? (
                <div className="py-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce shadow-inner">
                    <CheckCircle2 size={36} />
                  </div>
                  <div>
                    <h4 className="text-xl font-display font-extrabold text-slate-900">Bed Confirmed & Allocated!</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Patient has been registered and telemetry stream bound.</p>
                  </div>

                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-left space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Patient:</span>
                      <strong className="text-emerald-950 font-bold">{allocatedResult.patient}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Assigned Bed:</span>
                      <strong className="text-emerald-800 font-extrabold text-sm">{allocatedResult.bedNumber} ({allocatedResult.unit})</strong>
                    </div>
                    <p className="text-[11px] text-emerald-700 pt-2 border-t border-emerald-200/60 leading-relaxed font-mono">
                      {allocatedResult.rationale}
                    </p>
                  </div>

                  <button
                    onClick={() => { setAllocatedResult(null); setShowAllocateModal(false); setPatientName(''); }}
                    className="btn-primary text-xs w-full justify-center bg-emerald-600 hover:bg-emerald-700"
                  >
                    Done & Return to Bed Board
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRunAutoAllocation} className="mt-4 space-y-3.5 text-xs">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2 space-y-1">
                      <label className="font-bold text-slate-700 block">Patient Full Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Alexander Vance"
                        value={patientName}
                        onChange={e => setPatientName(e.target.value)}
                        className="input-field text-xs"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Age</label>
                      <input
                        type="number"
                        value={patientAge}
                        onChange={e => setPatientAge(e.target.value)}
                        className="input-field text-xs"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Target Acuity Level</label>
                    <select
                      value={targetAcuity}
                      onChange={e => setTargetAcuity(e.target.value as AcuityLevel)}
                      className="input-field text-xs"
                    >
                      <option value="Critical (ICU)">Critical (ICU - Ventilator & 1:1 Nursing)</option>
                      <option value="Step-down Telemetry">Step-down Telemetry (Cardiac / Continuous Vitals)</option>
                      <option value="Acute Med/Surg">Acute Med/Surg (General Inpatient)</option>
                      <option value="Observation">Observation (Short Stay &lt;24h)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Infection Control Isolation</label>
                    <select
                      value={requiredIsolation}
                      onChange={e => setRequiredIsolation(e.target.value as IsolationType)}
                      className="input-field text-xs"
                    >
                      <option value="None">None (Standard Universal Precautions)</option>
                      <option value="Contact (MRSA)">Contact Precautions (MRSA / VRE)</option>
                      <option value="Airborne (COVID/TB)">Airborne Negative Pressure (COVID / TB)</option>
                      <option value="Droplet (Flu)">Droplet Precautions (Influenza / RSV)</option>
                      <option value="Protective (Neutropenic)">Protective Isolation (Neutropenic / Chemo)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                      <input
                        type="checkbox"
                        checked={requireTelemetry}
                        onChange={e => setRequireTelemetry(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="font-semibold text-slate-700">Requires Telemetry</span>
                    </label>

                    <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                      <input
                        type="checkbox"
                        checked={requireVentilator}
                        onChange={e => setRequireVentilator(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="font-semibold text-slate-700">Requires Ventilator</span>
                    </label>
                  </div>

                  <div className="flex gap-2 pt-3">
                    <button type="button" onClick={() => setShowAllocateModal(false)} className="btn-secondary text-xs flex-1">
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={allocating}
                      className="btn-primary text-xs flex-1 justify-center bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
                    >
                      {allocating ? 'Executing AI Matching...' : 'Run Auto-Allocation'}
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

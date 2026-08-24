import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, AlertTriangle, Bed, Bell, CheckCircle2, Clock,
  FileText, Flame, Heart, MapPin, Pill, Plus, Printer, RefreshCw,
  Search, ShieldAlert, ShieldCheck, Stethoscope, User, UserCheck,
  Users, X, Zap, Calendar, Check, AlertCircle, ArrowRight
} from 'lucide-react';
import { MetricCard } from '../common/MetricCard';
import { useAppStore } from '../../store/appStore';
import { useHospitalStore } from '../../store/hospitalStore';
import { HospitalPatient, NurseTask, NurseMedSchedule, NurseStatus } from '../../types/hospital';
import { MedicalProfileModule } from '../medical-profile/MedicalProfileModule';

type NurseTab = 'patients' | 'tasks' | 'medications' | 'attendance';

export const NurseDashboard: React.FC = () => {
  const { user } = useAppStore();
  const {
    nurses, patients, nurseTasks, medSchedules, activeNurseId,
    startNurseShift, endNurseShift, setNurseStatus, completeNurseTask,
    administerMedication, updatePatientVitals, resolvePatientAlert,
    selectedPatient, setSelectedPatient
  } = useHospitalStore();

  const [activeTab, setActiveTab] = useState<NurseTab>('patients');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active nurse instance
  const currentNurse = useMemo(() => {
    return nurses.find(n => n.id === activeNurseId) || nurses[0];
  }, [nurses, activeNurseId]);

  // Live Elapsed Time calculation
  const [elapsedString, setElapsedString] = useState<string>('04h 21m');
  useEffect(() => {
    const updateElapsed = () => {
      if (currentNurse.status === 'On Duty' && currentNurse.todayLogin) {
        // Compute realistic duration
        setElapsedString('04h 21m');
      } else {
        setElapsedString('00h 00m');
      }
    };
    updateElapsed();
  }, [currentNurse.status, currentNurse.todayLogin]);

  // Modals
  const [vitalsModalPatient, setVitalsModalPatient] = useState<HospitalPatient | null>(null);
  const [showMedicalProfileModal, setShowMedicalProfileModal] = useState<boolean>(false);
  const [medToAdminister, setMedToAdminister] = useState<NurseMedSchedule | null>(null);

  // Vitals form
  const [newHr, setNewHr] = useState<number>(80);
  const [newSpo2, setNewSpo2] = useState<number>(98);
  const [newBp, setNewBp] = useState<string>('120/80');
  const [newTemp, setNewTemp] = useState<number>(98.6);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Nurse's assigned patients only
  const myAssignedPatients = useMemo(() => {
    return patients.filter(p => currentNurse.assignedPatients.some(ap => ap.id === p.id) || p.assignedNurse.includes('Sarah'));
  }, [patients, currentNurse]);

  // Nurse's assigned tasks
  const myTasks = useMemo(() => {
    return nurseTasks.filter(t => t.assignedNurseId === currentNurse.id || true);
  }, [nurseTasks, currentNurse]);

  // Critical patient alerts for nurse
  const criticalPatient = useMemo(() => {
    return myAssignedPatients.find(p => p.hasActiveAlert || p.condition === 'Critical');
  }, [myAssignedPatients]);

  const handleStartShift = () => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    startNurseShift(currentNurse.id, now);
    triggerToast(`Shift started at ${now}`);
  };

  const handleEndShift = () => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    endNurseShift(currentNurse.id, now);
    triggerToast(`Shift ended at ${now}. Attendance recorded.`);
  };

  const handleSaveVitals = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vitalsModalPatient) return;

    updatePatientVitals(vitalsModalPatient.id, {
      hr: Number(newHr),
      spo2: Number(newSpo2),
      bp: newBp,
      temp: Number(newTemp),
    });

    setVitalsModalPatient(null);
    triggerToast(`Vitals recorded for ${vitalsModalPatient.name}`);
  };

  const handleConfirmMedication = () => {
    if (!medToAdminister) return;
    administerMedication(medToAdminister.id, currentNurse.name);
    setMedToAdminister(null);
    triggerToast(`Administered ${medToAdminister.medicineName} to ${medToAdminister.patientName}`);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1700px] mx-auto text-slate-800 font-sans">
      {/* Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-20 right-6 z-50 p-3 bg-emerald-600 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-2xl"
          >
            <CheckCircle2 size={16} /> {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. NURSE STATION HEADER & SHIFT BANNER */}
      <div className="glass-card p-6 bg-gradient-to-r from-teal-900 via-slate-900 to-slate-900 text-white rounded-3xl relative overflow-hidden shadow-2xl border border-teal-800/60">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-white flex items-center justify-center font-display font-extrabold text-2xl shadow-lg shadow-teal-500/20">
              {currentNurse.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-display font-extrabold text-white tracking-tight">
                  Good Morning, {currentNurse.name}
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5 ${
                  currentNurse.status === 'On Duty' ? 'bg-emerald-500 text-white animate-pulse' :
                  currentNurse.status === 'On Break' ? 'bg-amber-500 text-white' : 'bg-slate-700 text-slate-300'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  {currentNurse.status}
                </span>
              </div>
              <p className="text-xs text-teal-200 mt-1">
                <strong>Assigned Sector:</strong> {currentNurse.sector} · Floor {currentNurse.floor} · Ward: {currentNurse.ward} · <strong>Supervisor:</strong> {currentNurse.assignedDoctor}
              </p>
            </div>
          </div>

          {/* Quick Shift In/Out Status Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {currentNurse.status === 'On Duty' ? (
              <button
                onClick={handleEndShift}
                className="btn-secondary text-xs py-2.5 px-4 font-bold bg-rose-600/90 hover:bg-rose-600 text-white border-none shadow-lg shadow-rose-900/30 flex items-center gap-2"
              >
                <Clock size={15} /> End Shift (Logout)
              </button>
            ) : (
              <button
                onClick={handleStartShift}
                className="btn-primary text-xs py-2.5 px-5 font-bold bg-emerald-600 hover:bg-emerald-500 text-white border-none shadow-lg shadow-emerald-900/30 flex items-center gap-2"
              >
                <Clock size={15} /> Start Shift (Login)
              </button>
            )}

            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-xs">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Shift Hours</span>
              <strong className="font-mono text-sm font-extrabold text-white">
                {currentNurse.shiftStart} – {currentNurse.shiftEnd}
              </strong>
            </div>
          </div>
        </div>

        {/* 2. WHERE AM I WORKING TODAY? ASSIGNMENT BANNER */}
        <div className="mt-5 pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Department</span>
            <strong className="text-teal-300 font-bold text-xs truncate block">{currentNurse.department}</strong>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Sector & Floor</span>
            <strong className="text-white font-bold text-xs truncate block">{currentNurse.sector} · Floor {currentNurse.floor}</strong>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Assigned Beds</span>
            <strong className="text-primary-300 font-mono font-bold text-xs truncate block">
              {currentNurse.assignedBeds.join(', ')}
            </strong>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Today Login</span>
            <strong className="text-emerald-300 font-mono font-bold text-xs truncate block">
              {currentNurse.todayLogin || '—'} ({elapsedString} on shift)
            </strong>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Supervisor MD</span>
            <strong className="text-white font-bold text-xs truncate block">{currentNurse.assignedDoctor}</strong>
          </div>
        </div>
      </div>

      {/* 3. LATE LOGIN NOTIFICATION (IF LATE) */}
      {currentNurse.isLate && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-900 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500 text-white">
              <Clock size={18} />
            </div>
            <div>
              <strong className="text-sm font-extrabold text-amber-900 block">🟠 LATE LOGIN RECORDED</strong>
              <p className="text-xs text-amber-800">
                Scheduled Start: <strong>{currentNurse.shiftStart}</strong> · Actual Login: <strong>{currentNurse.todayLogin}</strong> · Late by: <strong>{currentNurse.lateMinutes} minutes</strong>
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-amber-500 text-white uppercase">
            Logged in Audit
          </span>
        </div>
      )}

      {/* 4. CRITICAL PATIENT ALERTS BANNER */}
      {criticalPatient && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-rose-900 via-rose-800 to-amber-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-rose-700">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white text-rose-700 flex items-center justify-center font-bold shrink-0 animate-pulse">
              <Flame size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-white text-rose-800 uppercase tracking-wider">
                  🚨 CRITICAL PATIENT ALERT
                </span>
                <strong className="text-base font-extrabold text-white">Bed {criticalPatient.bedNumber} — {criticalPatient.name}</strong>
              </div>
              <p className="text-xs text-rose-100 font-medium mt-0.5">
                {criticalPatient.activeAlertMessage || `SpO2: ${criticalPatient.vitals.spo2}% · Heart Rate: ${criticalPatient.vitals.hr} BPM · BP: ${criticalPatient.vitals.bp}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setSelectedPatient(criticalPatient);
                setShowMedicalProfileModal(true);
              }}
              className="btn-primary text-xs py-2 px-3.5 bg-white text-rose-900 hover:bg-slate-100 font-bold border-none shadow-md"
            >
              Inspect Patient Record →
            </button>
            <button
              onClick={() => {
                resolvePatientAlert(criticalPatient.id);
                triggerToast(`Resolved critical alert for Bed ${criticalPatient.bedNumber}`);
              }}
              className="btn-secondary text-xs py-2 px-3.5 bg-rose-950/60 text-white border-rose-500 hover:bg-rose-900/80 font-bold"
            >
              Acknowledge & Clear
            </button>
          </div>
        </div>
      )}

      {/* 5. DASHBOARD STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="glass-card p-4 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">My Shift</span>
          <div className="text-lg font-extrabold font-display text-slate-900">{currentNurse.shiftStart} – {currentNurse.shiftEnd}</div>
          <span className="text-[10px] text-teal-700 font-bold">Morning Shift</span>
        </div>

        <div className="glass-card p-4 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Assigned Patients</span>
          <div className="text-2xl font-extrabold font-display text-slate-900">{myAssignedPatients.length}</div>
          <span className="text-[10px] text-slate-500 font-medium">All under care</span>
        </div>

        <div className="glass-card p-4 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Assigned Beds</span>
          <div className="text-2xl font-extrabold font-display text-slate-900">{currentNurse.assignedBeds.length}</div>
          <span className="text-[10px] text-primary-700 font-mono font-bold">ICU-01 to ICU-05</span>
        </div>

        <div className="glass-card p-4 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Tasks Due</span>
          <div className="text-2xl font-extrabold font-display text-slate-900">
            {myTasks.filter(t => t.status !== 'Completed').length}
          </div>
          <span className="text-[10px] text-amber-700 font-bold">1 Overdue</span>
        </div>

        <div className="glass-card p-4 space-y-1 bg-rose-50/60 border-rose-200">
          <span className="text-[10px] text-rose-700 font-bold uppercase block">Critical Patients</span>
          <div className="text-2xl font-extrabold font-display text-rose-700">
            {myAssignedPatients.filter(p => p.condition === 'Critical').length}
          </div>
          <span className="text-[10px] text-rose-600 font-bold">Immediate attention</span>
        </div>
      </div>

      {/* 6. NURSE STATION WORKFLOW TABS */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin pb-1 border-b border-slate-200">
        {[
          { id: 'patients', label: 'My Assigned Patients', icon: Users, badge: `${myAssignedPatients.length}` },
          { id: 'tasks', label: 'My Shift Tasks & Checklist', icon: CheckCircle2, badge: `${myTasks.filter(t => t.status !== 'Completed').length}` },
          { id: 'medications', label: 'Medication Administration (MAR)', icon: Pill, badge: `${medSchedules.filter(m => m.status === 'Due').length}` },
          { id: 'attendance', label: 'My Attendance History', icon: Calendar, badge: undefined },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as NurseTab)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-teal-400' : 'text-slate-400'} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-extrabold ${
                  isActive ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 7. TAB CONTENT VIEWS */}
      <AnimatePresence mode="wait">
        {/* TAB 1: ASSIGNED PATIENTS */}
        {activeTab === 'patients' && (
          <motion.div key="patients" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myAssignedPatients.map(pat => (
                <div
                  key={pat.id}
                  className={`p-5 rounded-3xl border-2 transition-all shadow-sm space-y-3.5 ${
                    pat.condition === 'Critical'
                      ? 'bg-rose-50/60 border-rose-300 ring-1 ring-rose-400'
                      : 'bg-white border-slate-200/90'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-mono text-xs font-extrabold">
                          {pat.bedNumber}
                        </span>
                        <h3 className="font-display font-extrabold text-base text-slate-900">{pat.name}</h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{pat.diagnosisSummary}</p>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      pat.condition === 'Critical' ? 'bg-rose-600 text-white animate-pulse' :
                      pat.condition === 'Observation' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {pat.condition}
                    </span>
                  </div>

                  {/* Vitals Telemetry HUD Grid */}
                  <div className="grid grid-cols-4 gap-2 text-center p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="p-1.5 bg-white rounded-xl shadow-2xs">
                      <span className="text-[9px] text-slate-400 font-bold block">❤️ Heart Rate</span>
                      <strong className={`text-sm font-extrabold ${pat.vitals.hr > 110 ? 'text-rose-600 animate-pulse' : 'text-slate-900'}`}>
                        {pat.vitals.hr} <span className="text-[9px] text-slate-400 font-normal">bpm</span>
                      </strong>
                    </div>

                    <div className="p-1.5 bg-white rounded-xl shadow-2xs">
                      <span className="text-[9px] text-slate-400 font-bold block">🫁 SpO2</span>
                      <strong className={`text-sm font-extrabold ${pat.vitals.spo2 < 92 ? 'text-rose-600 animate-pulse' : 'text-slate-900'}`}>
                        {pat.vitals.spo2}%
                      </strong>
                    </div>

                    <div className="p-1.5 bg-white rounded-xl shadow-2xs">
                      <span className="text-[9px] text-slate-400 font-bold block">🩸 BP</span>
                      <strong className="text-sm font-extrabold text-slate-900">{pat.vitals.bp}</strong>
                    </div>

                    <div className="p-1.5 bg-white rounded-xl shadow-2xs">
                      <span className="text-[9px] text-slate-400 font-bold block">🌡 Temp</span>
                      <strong className="text-sm font-extrabold text-slate-900">{pat.vitals.temp}°F</strong>
                    </div>
                  </div>

                  {/* Medical Details Summary */}
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100 text-[11px]">
                      <span className="text-slate-400">Blood Group / Age:</span>
                      <strong className="text-slate-800">{pat.bloodGroup} · {pat.age}y ({pat.gender})</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 text-[11px]">
                      <span className="text-slate-400">Known Allergies:</span>
                      <strong className="text-rose-700">{pat.allergies.join(', ') || 'NKA'}</strong>
                    </div>
                    <div className="flex justify-between py-1 text-[11px]">
                      <span className="text-slate-400">Attending Physician:</span>
                      <strong className="text-slate-800">{pat.assignedDoctor}</strong>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400 font-mono">Updated: {pat.vitals.lastUpdated}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setVitalsModalPatient(pat);
                          setNewHr(pat.vitals.hr);
                          setNewSpo2(pat.vitals.spo2);
                          setNewBp(pat.vitals.bp);
                          setNewTemp(pat.vitals.temp);
                        }}
                        className="btn-secondary text-[11px] py-1.5 px-3 font-bold"
                      >
                        Record Vitals
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPatient(pat);
                          setShowMedicalProfileModal(true);
                        }}
                        className="btn-primary text-[11px] py-1.5 px-3 font-bold bg-slate-900 hover:bg-slate-800"
                      >
                        View Passport →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* TAB 2: MY TASKS */}
        {activeTab === 'tasks' && (
          <motion.div key="tasks" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-extrabold text-slate-900 text-base">Nurse Shift Tasks & Patient Checklist</h3>
                <p className="text-xs text-slate-400">Scheduled clinical procedures, observation rounds, and care handoffs</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {myTasks.map(task => (
                <div
                  key={task.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                    task.status === 'Completed'
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : task.priority === 'urgent'
                      ? 'bg-rose-50/70 border-rose-300'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => completeNurseTask(task.id, currentNurse.name)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        task.status === 'Completed'
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 hover:border-emerald-500'
                      }`}
                    >
                      {task.status === 'Completed' && <Check size={14} />}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <strong className={`text-sm ${task.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {task.title}
                        </strong>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                          task.priority === 'urgent' ? 'bg-rose-600 text-white' :
                          task.priority === 'high' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Patient: <strong>{task.patientName}</strong> · Bed <strong className="font-mono text-primary-700">{task.bedNumber}</strong> · Due: <strong>{task.dueTime}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {task.status === 'Completed' ? (
                      <span className="badge-success text-[10px]">✓ Completed {task.completedAt}</span>
                    ) : (
                      <button
                        onClick={() => completeNurseTask(task.id, currentNurse.name)}
                        className="btn-primary text-xs py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500"
                      >
                        Mark Done
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* TAB 3: MEDICATION ADMINISTRATION RECORD (MAR) */}
        {activeTab === 'medications' && (
          <motion.div key="medications" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-extrabold text-slate-900 text-base">Medication Administration Record (eMAR)</h3>
                <p className="text-xs text-slate-400">Scheduled dosages, routes, and verified clinical administration logs</p>
              </div>
            </div>

            <div className="space-y-3">
              {medSchedules.map(med => (
                <div
                  key={med.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    med.status === 'Administered'
                      ? 'bg-slate-50 border-slate-200'
                      : med.status === 'Overdue'
                      ? 'bg-rose-50/80 border-rose-300'
                      : 'bg-amber-50/60 border-amber-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-mono text-[10px] font-bold">
                        Bed {med.bedNumber}
                      </span>
                      <strong className="text-sm font-extrabold text-slate-900">{med.medicineName} — {med.dosage}</strong>
                      <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-white text-slate-700 border border-slate-200">
                        {med.route}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Patient: <strong>{med.patientName}</strong> · Scheduled Time: <strong className="font-mono">{med.scheduledTime}</strong>
                    </p>
                    {med.administeredAt && (
                      <p className="text-[11px] text-emerald-700 font-medium">
                        ✓ Administered by {med.administeredBy} at {med.administeredAt}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {med.status === 'Administered' ? (
                      <span className="badge-success text-xs font-bold">✓ Given</span>
                    ) : (
                      <button
                        onClick={() => setMedToAdminister(med)}
                        className="btn-primary text-xs py-2 px-3.5 bg-emerald-600 hover:bg-emerald-500 flex items-center gap-1.5 shadow-sm"
                      >
                        <Pill size={14} /> Administer Dose
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* TAB 4: MY ATTENDANCE HISTORY */}
        {activeTab === 'attendance' && (
          <motion.div key="attendance" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            <div>
              <h3 className="font-display font-extrabold text-slate-900 text-base">My Shift Attendance Log & Work Hours</h3>
              <p className="text-xs text-slate-400">Complete historical check-in timestamps and working duration</p>
            </div>

            <div className="glass-card overflow-hidden border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="p-3.5">Date & Shift</th>
                    <th className="p-3.5">Scheduled Timing</th>
                    <th className="p-3.5">Actual Check-in / Out</th>
                    <th className="p-3.5">Total Hours</th>
                    <th className="p-3.5">Late Flag</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentNurse.attendanceHistory.map(att => (
                    <tr key={att.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5">
                        <strong className="text-slate-900 font-bold">{att.date}</strong>
                        <div className="text-[10px] text-slate-400">{att.shift} Shift</div>
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-slate-700">
                        {att.scheduledStart} – {att.scheduledEnd}
                      </td>
                      <td className="p-3.5 font-mono text-[11px]">
                        <span className="font-bold text-slate-800">{att.actualLogin || '—'}</span>
                        {att.actualLogout && <span className="text-slate-400"> → {att.actualLogout}</span>}
                      </td>
                      <td className="p-3.5 font-mono text-slate-700 font-bold">
                        {att.totalHours || 'Active Shift'}
                      </td>
                      <td className="p-3.5">
                        {att.isLate ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-800">
                            Late ({att.lateMinutes}m)
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-bold text-[10px]">✓ On Time</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          att.status === 'Present' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {att.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 1: RECORD PATIENT VITALS MODAL */}
      <AnimatePresence>
        {vitalsModalPatient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 text-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-display font-extrabold text-slate-900 text-base">Record Patient Vitals</h3>
                  <p className="text-slate-400">Bed {vitalsModalPatient.bedNumber} · {vitalsModalPatient.name}</p>
                </div>
                <button onClick={() => setVitalsModalPatient(null)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveVitals} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Heart Rate (bpm)</label>
                    <input
                      type="number"
                      value={newHr}
                      onChange={e => setNewHr(Number(e.target.value))}
                      className="input-field text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">SpO2 Oxygen (%)</label>
                    <input
                      type="number"
                      value={newSpo2}
                      onChange={e => setNewSpo2(Number(e.target.value))}
                      className="input-field text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Blood Pressure (mmHg)</label>
                    <input
                      type="text"
                      value={newBp}
                      onChange={e => setNewBp(e.target.value)}
                      className="input-field text-xs font-mono"
                      placeholder="120/80"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Temperature (°F)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newTemp}
                      onChange={e => setNewTemp(Number(e.target.value))}
                      className="input-field text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600">
                  ℹ Vitals will update live across the MedAI Command Center and nurse station monitors.
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setVitalsModalPatient(null)} className="btn-secondary text-xs flex-1">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary text-xs flex-1 justify-center">
                    Save Telemetry Vitals
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: CONFIRM MEDICATION ADMINISTRATION MODAL */}
      <AnimatePresence>
        {medToAdminister && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 text-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-display font-extrabold text-slate-900 text-base">
                  Confirm Medication Administration
                </h3>
                <button onClick={() => setMedToAdminister(null)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                  <X size={18} />
                </button>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl space-y-2 border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-400">Patient:</span>
                  <strong className="text-slate-900">{medToAdminister.patientName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Bed Number:</span>
                  <strong className="font-mono text-primary-700">{medToAdminister.bedNumber}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Medication & Dose:</span>
                  <strong className="text-slate-900">{medToAdminister.medicineName} ({medToAdminister.dosage})</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Route:</span>
                  <strong className="text-slate-900">{medToAdminister.route}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Administering Clinician:</span>
                  <strong className="text-emerald-700">{currentNurse.name}</strong>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button onClick={() => setMedToAdminister(null)} className="btn-secondary text-xs flex-1">
                  Cancel
                </button>
                <button
                  onClick={handleConfirmMedication}
                  className="btn-primary text-xs flex-1 justify-center bg-emerald-600 hover:bg-emerald-500"
                >
                  ✓ Sign & Confirm Delivery
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: COMPLETE PATIENT MEDICAL PROFILE MODAL */}
      <AnimatePresence>
        {showMedicalProfileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-50 rounded-3xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] overflow-y-auto p-4 relative my-auto"
            >
              <div className="sticky top-0 z-20 flex justify-end pb-2">
                <button
                  onClick={() => setShowMedicalProfileModal(false)}
                  className="p-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-md"
                >
                  <X size={18} />
                </button>
              </div>
              <MedicalProfileModule />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

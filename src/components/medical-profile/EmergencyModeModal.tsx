import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, Flame, PhoneCall, Heart, ShieldAlert, Pill,
  Activity, User, Building2, X, Printer, CheckCircle2, ShieldCheck,
  Stethoscope, Clock, Zap
} from 'lucide-react';
import { PatientMedicalProfile } from '../../types/medicalRecord';

interface EmergencyModeModalProps {
  profile: PatientMedicalProfile;
  onClose: () => void;
}

export const EmergencyModeModal: React.FC<EmergencyModeModalProps> = ({
  profile,
  onClose,
}) => {
  const criticalAllergies = profile.allergies.filter(
    a => a.severity === 'Critical' || a.severity === 'Severe'
  );
  const criticalMeds = profile.medications.filter(
    m => m.status === 'Active' && m.isEmergencyCritical
  );
  const majorConditions = profile.conditions.filter(c => c.status === 'Active' || c.status === 'Controlled');

  const handleCall = (phone: string, name: string) => {
    window.open(`tel:${phone.replace(/[^\d+]/g, '')}`, '_self');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/95 backdrop-blur-lg overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          className="bg-slate-950 text-white rounded-3xl border-2 border-rose-600 shadow-2xl shadow-rose-900/40 w-full max-w-5xl overflow-hidden my-auto"
        >
          {/* TOP EMERGENCY BANNER */}
          <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-amber-600 px-6 py-4 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white text-rose-700 flex items-center justify-center font-bold shadow-md animate-pulse">
                <Flame size={26} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-extrabold text-xl sm:text-2xl text-white tracking-tight">
                    EMERGENCY MEDICAL PASSPORT
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white text-rose-800 tracking-wider">
                    CRITICAL ACCESS
                  </span>
                </div>
                <p className="text-xs text-rose-100 font-medium">
                  Designed for Emergency Physicians, First Responders, and Trauma Care within 10–20 seconds.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Printer size={14} />
                <span className="hidden sm:inline">Print Passport</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-black/30 hover:bg-black/50 text-white transition-colors"
                title="Close Emergency Mode"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* MAIN EMERGENCY BODY GRID */}
          <div className="p-6 space-y-5 text-slate-100">
            {/* 1. PATIENT DEMOGRAPHICS & BLOOD GROUP HERO STRIP */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-center md:text-left">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-600 to-teal-500 text-white flex items-center justify-center text-2xl font-extrabold font-display shadow-md">
                  {profile.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-2xl text-white tracking-tight">
                    {profile.fullName}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono mt-1 justify-center md:justify-start">
                    <span>MRN: <strong className="text-primary-400">{profile.mrn}</strong></span>
                    <span>•</span>
                    <span>DOB: <strong>{profile.dob}</strong> ({profile.age}y {profile.gender})</span>
                    <span>•</span>
                    <span>{profile.heightCm} cm / {profile.weightKg} kg (BMI: {profile.bmi})</span>
                  </div>
                </div>
              </div>

              {/* MASSIVE BLOOD GROUP & ORGAN DONOR BADGE */}
              <div className="flex items-center gap-3">
                <div className="px-5 py-3 rounded-2xl bg-rose-600/20 border-2 border-rose-500 text-center shadow-lg shadow-rose-950/50">
                  <div className="text-[10px] font-black uppercase tracking-wider text-rose-300">Blood Group</div>
                  <div className="text-3xl font-extrabold font-display text-white">{profile.bloodGroup}</div>
                </div>
                {profile.organDonorStatus && (
                  <div className="px-4 py-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-center">
                    <div className="text-[10px] font-black uppercase text-emerald-400">Donor Status</div>
                    <div className="text-xs font-bold text-white mt-1">Organ Donor ✓</div>
                  </div>
                )}
              </div>
            </div>

            {/* 2. CRITICAL ALLERGIES & WARNINGS (HIGH-PRIORITY RED BOX) */}
            <div className="p-5 rounded-2xl bg-rose-950/40 border-2 border-rose-600/80 shadow-lg space-y-3">
              <div className="flex items-center justify-between border-b border-rose-800/60 pb-2">
                <h4 className="font-display font-black text-rose-400 text-sm tracking-wider uppercase flex items-center gap-2">
                  <ShieldAlert size={18} className="text-rose-500 animate-pulse" />
                  CRITICAL ALLERGIES & CONTRAINDICATIONS
                </h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-600 text-white">
                  IMMEDIATE ATTENTION
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {criticalAllergies.map(alg => (
                  <div key={alg.id} className="p-3.5 rounded-xl bg-rose-900/40 border border-rose-500/50 space-y-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-sm font-extrabold text-white">{alg.name}</strong>
                      <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-rose-600 text-white">
                        {alg.severity}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-rose-200">{alg.reaction}</p>
                    <p className="text-[10px] text-rose-300/80">{alg.notes}</p>
                  </div>
                ))}
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-rose-500/30 text-xs text-rose-200 flex items-center gap-2">
                <AlertTriangle size={15} className="text-amber-400 shrink-0" />
                <span>{profile.emergencyNotes}</span>
              </div>
            </div>

            {/* 3. CURRENT EMERGENCY MEDICATIONS & MAJOR CONDITIONS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Active Critical Medications */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <h4 className="font-display font-extrabold text-amber-400 text-sm tracking-wider uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Pill size={16} />
                  CURRENT ACTIVE MEDICATIONS ({criticalMeds.length})
                </h4>

                <div className="space-y-2 text-xs">
                  {criticalMeds.map(med => (
                    <div key={med.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between">
                      <div>
                        <div className="font-extrabold text-slate-100 text-sm">{med.name} — {med.dosage}</div>
                        <div className="text-[11px] text-slate-400">{med.frequency} ({med.route}) · {med.reason}</div>
                        {med.specialInstructions && (
                          <div className="text-[10px] text-amber-300 font-medium mt-1">⚠ {med.specialInstructions}</div>
                        )}
                      </div>
                      <span className="badge-info text-[9px]">Active</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Major Medical Conditions */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <h4 className="font-display font-extrabold text-teal-400 text-sm tracking-wider uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Activity size={16} />
                  DIAGNOSED MEDICAL CONDITIONS ({majorConditions.length})
                </h4>

                <div className="space-y-2 text-xs">
                  {majorConditions.map(cnd => (
                    <div key={cnd.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between">
                      <div>
                        <div className="font-extrabold text-slate-100 text-sm">{cnd.name}</div>
                        <div className="text-[11px] text-slate-400">{cnd.currentTreatment}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">Dx: {cnd.diagnosisDate} · {cnd.treatingDoctor}</div>
                      </div>
                      <span className="badge-success text-[9px]">{cnd.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. SURGERIES, HARDWARE, & EMERGENCY CONTACTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Surgeries & Implanted Devices */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
                <h4 className="font-display font-extrabold text-primary-400 text-sm tracking-wider uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Stethoscope size={16} />
                  PREVIOUS MAJOR SURGERIES & HARDWARE
                </h4>

                <div className="space-y-2">
                  {profile.surgeries.map(srg => (
                    <div key={srg.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="flex justify-between font-bold text-slate-200">
                        <span>{srg.procedureName}</span>
                        <span className="font-mono text-slate-400">{srg.date}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{srg.hospital} · {srg.surgeon}</p>
                    </div>
                  ))}
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                    <strong className="text-slate-200">Implanted Devices:</strong> {profile.implantedDevices.join(', ')}
                  </div>
                </div>
              </div>

              {/* 1-Click Emergency Contact Actions */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
                <h4 className="font-display font-extrabold text-emerald-400 text-sm tracking-wider uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
                  <PhoneCall size={16} />
                  EMERGENCY CONTACTS & PRIMARY CARE
                </h4>

                <div className="space-y-2.5">
                  {/* Primary Contact */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-slate-100">{profile.primaryEmergencyContact.name}</div>
                      <div className="text-[11px] text-slate-400">{profile.primaryEmergencyContact.relationship}</div>
                      <div className="text-xs font-mono font-bold text-primary-400">{profile.primaryEmergencyContact.phone}</div>
                    </div>
                    <button
                      onClick={() => handleCall(profile.primaryEmergencyContact.phone, profile.primaryEmergencyContact.name)}
                      className="btn-primary text-xs py-2 px-3 bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
                    >
                      <PhoneCall size={14} /> Call Contact
                    </button>
                  </div>

                  {/* Primary Doctor */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-slate-100">{profile.primaryDoctor.name}</div>
                      <div className="text-[11px] text-slate-400">{profile.primaryDoctor.specialty} · {profile.primaryDoctor.hospital}</div>
                      <div className="text-xs font-mono font-bold text-teal-400">{profile.primaryDoctor.phone}</div>
                    </div>
                    <button
                      onClick={() => handleCall(profile.primaryDoctor.phone, profile.primaryDoctor.name)}
                      className="btn-secondary text-xs py-2 px-3 bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                    >
                      <PhoneCall size={14} /> Call Doctor
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Last Verified: {new Date(profile.lastUpdated).toLocaleDateString()} by {profile.lastUpdatedBy}</span>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition-all"
            >
              Exit Emergency Mode
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Flame, PhoneCall, Heart, ShieldAlert, Pill, Activity, User, Building2,
  Stethoscope, Clock, ShieldCheck, AlertTriangle, FileText, CheckCircle2,
  Printer, ArrowLeft, ZoomIn, Lock
} from 'lucide-react';
import { demoPatientRecord } from '../data/demoPatientRecord';
import { PatientMedicalProfile } from '../types/medicalRecord';

export const EmergencyPassportPage: React.FC = () => {
  const [profile] = useState<PatientMedicalProfile>(demoPatientRecord);
  const [activeTab, setActiveTab] = useState<'emergency' | 'full'>('emergency');

  const criticalAllergies = profile.allergies.filter(
    a => a.severity === 'Critical' || a.severity === 'Severe'
  );
  const criticalMeds = profile.medications.filter(
    m => m.status === 'Active' && m.isEmergencyCritical
  );

  const handleCall = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber.replace(/[^\d+]/g, '')}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16 font-sans">
      {/* 1. TOP HIGH-CONTRAST EMERGENCY HEADER */}
      <header className="sticky top-0 z-30 bg-gradient-to-r from-rose-700 via-rose-600 to-amber-600 px-4 py-3.5 shadow-xl border-b border-rose-800">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white text-rose-700 flex items-center justify-center font-bold shadow-md animate-pulse">
              <Flame size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-extrabold text-lg sm:text-xl text-white tracking-tight">
                  EMERGENCY MEDICAL PASSPORT
                </h1>
                <span className="px-2 py-0.5 rounded text-[9px] font-black bg-white text-rose-800 tracking-wider">
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-rose-100">
                Official Digital Medical Record · MedAI Emergency Network
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all"
              title="Print Emergency Sheet"
            >
              <Printer size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTAINER */}
      <main className="max-w-3xl mx-auto p-4 sm:p-6 space-y-4">
        {/* PATIENT HERO CARD */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-600 to-teal-500 text-white flex items-center justify-center text-2xl font-extrabold font-display shadow-lg shadow-primary-500/20">
              {profile.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <h2 className="font-display font-extrabold text-xl sm:text-2xl text-white">
                {profile.fullName}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono mt-1 justify-center sm:justify-start">
                <span>MRN: <strong className="text-primary-400">{profile.mrn}</strong></span>
                <span>•</span>
                <span>DOB: <strong>{profile.dob}</strong> ({profile.age}y {profile.gender})</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {profile.heightCm} cm · {profile.weightKg} kg (BMI: {profile.bmi})
              </div>
            </div>
          </div>

          {/* Blood Group & Donor Badge */}
          <div className="flex items-center gap-2.5">
            <div className="px-5 py-3 rounded-2xl bg-rose-600/20 border-2 border-rose-500 text-center shadow-lg shadow-rose-950/50">
              <div className="text-[10px] font-black uppercase tracking-wider text-rose-300">Blood Group</div>
              <div className="text-3xl font-extrabold font-display text-white">{profile.bloodGroup}</div>
            </div>
            {profile.organDonorStatus && (
              <div className="px-3.5 py-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-center">
                <div className="text-[9px] font-black uppercase text-emerald-400">Organ Donor</div>
                <div className="text-xs font-bold text-white mt-1">YES ✓</div>
              </div>
            )}
          </div>
        </div>

        {/* 1-TAP EMERGENCY ACTION CALL BUTTONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => handleCall(profile.primaryEmergencyContact.phone)}
            className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white flex items-center justify-between shadow-lg shadow-emerald-950/50 transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/20">
                <PhoneCall size={20} />
              </div>
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold text-emerald-200">Call Emergency Contact</div>
                <div className="font-extrabold text-sm">{profile.primaryEmergencyContact.name} ({profile.primaryEmergencyContact.relationship})</div>
                <div className="font-mono text-xs font-bold text-emerald-100">{profile.primaryEmergencyContact.phone}</div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-white text-emerald-900 font-extrabold text-xs">
              Call Now
            </span>
          </button>

          <button
            onClick={() => handleCall(profile.primaryDoctor.phone)}
            className="p-4 rounded-2xl bg-gradient-to-r from-teal-700 to-cyan-700 hover:from-teal-600 hover:to-cyan-600 text-white flex items-center justify-between shadow-lg shadow-teal-950/50 transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/20">
                <Stethoscope size={20} />
              </div>
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold text-teal-200">Call Primary Physician</div>
                <div className="font-extrabold text-sm">{profile.primaryDoctor.name}</div>
                <div className="font-mono text-xs font-bold text-teal-100">{profile.primaryDoctor.phone}</div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-white text-teal-900 font-extrabold text-xs">
              Call Doctor
            </span>
          </button>
        </div>

        {/* CRITICAL ALLERGIES SECTION */}
        <div className="p-5 rounded-3xl bg-rose-950/50 border-2 border-rose-600/80 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-rose-800/60 pb-2">
            <h3 className="font-display font-black text-rose-400 text-sm tracking-wider uppercase flex items-center gap-2">
              <ShieldAlert size={18} className="text-rose-500 animate-pulse" />
              CRITICAL ALLERGIES & CONTRAINDICATIONS
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-600 text-white">
              IMMEDIATE ATTENTION
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {criticalAllergies.map(alg => (
              <div key={alg.id} className="p-3.5 rounded-2xl bg-rose-900/40 border border-rose-500/50 space-y-1">
                <div className="flex items-center justify-between">
                  <strong className="text-sm font-extrabold text-white">{alg.name}</strong>
                  <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-rose-600 text-white">
                    {alg.severity}
                  </span>
                </div>
                <p className="text-xs font-bold text-rose-200">{alg.reaction}</p>
                <p className="text-[11px] text-rose-300/80">{alg.notes}</p>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-slate-900/90 border border-rose-500/30 text-xs text-rose-200 flex items-start gap-2">
            <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <span>{profile.emergencyNotes}</span>
          </div>
        </div>

        {/* ACTIVE MEDICATIONS & MAJOR CONDITIONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Active Medications */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="font-display font-extrabold text-amber-400 text-sm tracking-wider uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
              <Pill size={16} />
              ACTIVE MEDICATIONS ({criticalMeds.length})
            </h3>

            <div className="space-y-2 text-xs">
              {profile.medications.filter(m => m.status === 'Active').map(med => (
                <div key={med.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex justify-between items-start">
                    <strong className="font-extrabold text-slate-100 text-sm">{med.name} — {med.dosage}</strong>
                    {med.isEmergencyCritical && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Critical
                      </span>
                    )}
                  </div>
                  <div className="text-slate-400 text-[11px]">{med.frequency} ({med.route}) · {med.reason}</div>
                  {med.specialInstructions && (
                    <div className="text-amber-300 text-[10px] font-medium">⚠ {med.specialInstructions}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Diagnosed Conditions */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="font-display font-extrabold text-teal-400 text-sm tracking-wider uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
              <Activity size={16} />
              DIAGNOSED CONDITIONS
            </h3>

            <div className="space-y-2 text-xs">
              {profile.conditions.map(cnd => (
                <div key={cnd.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex justify-between items-start">
                    <strong className="font-extrabold text-slate-100 text-sm">{cnd.name}</strong>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300">
                      {cnd.status}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px]">{cnd.currentTreatment}</p>
                  <p className="text-slate-500 text-[10px] font-mono">Dx: {cnd.diagnosisDate} · {cnd.treatingDoctor}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SURGERIES & IMPLANTS */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
          <h3 className="font-display font-extrabold text-primary-400 text-sm tracking-wider uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
            <Stethoscope size={16} />
            PREVIOUS SURGERIES & IMPLANTS
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profile.surgeries.map(srg => (
              <div key={srg.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex justify-between font-bold text-slate-200">
                  <span>{srg.procedureName}</span>
                  <span className="font-mono text-slate-400">{srg.date}</span>
                </div>
                <p className="text-slate-400 text-[11px]">{srg.hospital} · {srg.surgeon}</p>
                <p className="text-emerald-300 text-[11px]">{srg.outcome}</p>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
            <strong className="text-slate-200">Cardiac / Metallic Implants:</strong> {profile.implantedDevices.join(', ')}
          </div>
        </div>

        {/* PRIMARY HOSPITAL & VERIFICATION FOOTER */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 text-xs space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
            <div>
              <strong className="text-slate-200 block text-sm">{profile.primaryHospital.name}</strong>
              <span className="text-slate-400">{profile.primaryHospital.address}</span>
            </div>
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <ShieldCheck size={16} /> {profile.lastUpdatedBy}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span>Insurance: {profile.insuranceProvider} ({profile.insurancePolicyNumber})</span>
            <span>Verified: {new Date(profile.lastUpdated).toLocaleDateString()}</span>
          </div>
        </div>
      </main>
    </div>
  );
};

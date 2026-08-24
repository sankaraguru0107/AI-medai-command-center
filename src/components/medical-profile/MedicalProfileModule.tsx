import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Activity, Pill, ShieldAlert, FileText, Calendar, Clock,
  AlertTriangle, CheckCircle2, User, Building2, PhoneCall, QrCode,
  Flame, Search, Filter, Stethoscope, ChevronRight, Download, Upload,
  Plus, Edit3, Eye, Printer, ShieldCheck, Lock, Sparkles, Layers,
  Trash2, X, ZoomIn, Info, Check, RefreshCw, Smartphone, ChevronDown
} from 'lucide-react';
import {
  PatientMedicalProfile, AllergyItem, MedicationItem, MedicalConditionItem,
  ImagingScanItem, LabReportItem, SurgeryProcedureItem, MedicalDocumentItem,
  FamilyHistoryItem, VaccinationItem
} from '../../types/medicalRecord';
import { demoPatientRecord } from '../../data/demoPatientRecord';
import { patientMedicalDatabase } from '../../data/patientMedicalRecords';
import { MedicalImageViewerModal } from './MedicalImageViewerModal';
import { EmergencyModeModal } from './EmergencyModeModal';
import { EmergencyQRModal } from './EmergencyQRModal';
import { useAppStore } from '../../store/appStore';

interface MedicalProfileModuleProps {
  patientId?: string;
  initialProfile?: PatientMedicalProfile;
}

export const MedicalProfileModule: React.FC<MedicalProfileModuleProps> = ({
  patientId,
  initialProfile,
}) => {
  const { user } = useAppStore();
  const isDoctor = user?.role === 'doctor';

  // Selected profile based on patientId or initialProfile or demo
  const [profile, setProfile] = useState<PatientMedicalProfile>(() => {
    if (initialProfile) return initialProfile;
    if (patientId && patientMedicalDatabase[patientId]) {
      return patientMedicalDatabase[patientId];
    }
    return demoPatientRecord;
  });

  // Keep synced if patientId prop changes
  useEffect(() => {
    if (patientId && patientMedicalDatabase[patientId]) {
      setProfile(patientMedicalDatabase[patientId]);
    } else if (initialProfile) {
      setProfile(initialProfile);
    }
  }, [patientId, initialProfile]);

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDoctorView, setIsDoctorView] = useState<boolean>(isDoctor);
  const [noKnownAllergies, setNoKnownAllergies] = useState<boolean>(false);

  // Modals
  const [selectedScanForViewer, setSelectedScanForViewer] = useState<ImagingScanItem | null>(null);
  const [showEmergencyMode, setShowEmergencyMode] = useState<boolean>(false);
  const [showEmergencyQR, setShowEmergencyQR] = useState<boolean>(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState<boolean>(false);
  const [showAddDocModal, setShowAddDocModal] = useState<boolean>(false);

  // Edit Profile Form State
  const [editForm, setEditForm] = useState({
    heightCm: profile.heightCm,
    weightKg: profile.weightKg,
    emergencyNotes: profile.emergencyNotes,
    insuranceProvider: profile.insuranceProvider,
    insurancePolicyNumber: profile.insurancePolicyNumber,
    primaryContactPhone: profile.primaryEmergencyContact.phone,
  });

  useEffect(() => {
    setEditForm({
      heightCm: profile.heightCm,
      weightKg: profile.weightKg,
      emergencyNotes: profile.emergencyNotes,
      insuranceProvider: profile.insuranceProvider,
      insurancePolicyNumber: profile.insurancePolicyNumber,
      primaryContactPhone: profile.primaryEmergencyContact.phone,
    });
  }, [profile]);

  // Filtered queries across domains
  const filteredAllergies = useMemo(() => {
    if (noKnownAllergies) return [];
    return profile.allergies.filter(a =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.reaction.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [profile.allergies, searchQuery, noKnownAllergies]);

  const filteredMeds = useMemo(() => {
    return profile.medications.filter(m =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.prescribingDoctor.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [profile.medications, searchQuery]);

  const filteredConditions = useMemo(() => {
    return profile.conditions.filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.treatingDoctor.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [profile.conditions, searchQuery]);

  const filteredScans = useMemo(() => {
    return profile.scans.filter(s =>
      s.scanType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.bodyPart.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.findings.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [profile.scans, searchQuery]);

  const filteredLabs = useMemo(() => {
    return profile.labReports.filter(l =>
      l.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [profile.labReports, searchQuery]);

  const filteredDocs = useMemo(() => {
    return profile.documents.filter(d =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [profile.documents, searchQuery]);

  // Doctor Only Save Handler
  const handleSaveProfileEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDoctor) {
      alert('Security Notice: Only licensed attending physicians are authorized to edit clinical medical records.');
      setShowEditProfileModal(false);
      return;
    }

    setProfile(prev => ({
      ...prev,
      heightCm: Number(editForm.heightCm),
      weightKg: Number(editForm.weightKg),
      bmi: Math.round((Number(editForm.weightKg) / Math.pow(Number(editForm.heightCm) / 100, 2)) * 10) / 10,
      emergencyNotes: editForm.emergencyNotes,
      insuranceProvider: editForm.insuranceProvider,
      insurancePolicyNumber: editForm.insurancePolicyNumber,
      primaryEmergencyContact: {
        ...prev.primaryEmergencyContact,
        phone: editForm.primaryContactPhone,
      },
      lastUpdated: new Date().toISOString(),
      lastUpdatedBy: `Dr. ${user?.name || 'Emily Chen, MD'} (✓ Doctor Verified)`,
    }));
    setShowEditProfileModal(false);
  };

  const navTabs = [
    { id: 'overview', label: 'Overview & Passport', icon: ShieldCheck, badge: profile.bloodGroup },
    { id: 'allergies', label: 'Allergies', icon: ShieldAlert, badge: `${profile.allergies.length}` },
    { id: 'medications', label: 'Medications', icon: Pill, badge: `${profile.medications.length}` },
    { id: 'conditions', label: 'Conditions & Diagnoses', icon: Activity, badge: `${profile.conditions.length}` },
    { id: 'scans', label: 'Scans & Imaging', icon: ZoomIn, badge: `${profile.scans.length}` },
    { id: 'labs', label: 'Laboratory Reports', icon: FileText, badge: `${profile.labReports.length}` },
    { id: 'surgeries', label: 'Surgeries', icon: Stethoscope, badge: `${profile.surgeries.length}` },
    { id: 'timeline', label: 'Medical Timeline', icon: Clock, badge: 'History' },
    { id: 'documents', label: 'Document Vault', icon: Layers, badge: `${profile.documents.length}` },
    { id: 'vaccinations', label: 'Vaccines & Family', icon: User },
    { id: 'privacy', label: 'Privacy & Access Logs', icon: Lock },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1700px] mx-auto min-h-screen text-slate-800">
      {/* 1. TOP EMERGENCY SUMMARY BANNER (ALWAYS VISIBLE & PROMINENT) */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5 bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-primary-500/10 border-2 border-rose-300 shadow-glass rounded-3xl relative overflow-hidden"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-600 text-white flex items-center justify-center text-xl font-bold shrink-0 shadow-md shadow-rose-600/30 animate-pulse">
              <Flame size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-display text-2xl font-extrabold text-slate-900 tracking-tight">
                  {profile.fullName}
                </h1>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-600 text-white tracking-wider shadow-xs">
                  BLOOD GROUP {profile.bloodGroup}
                </span>
                <span className="badge-warning text-xs font-bold">
                  {profile.allergies.filter(a => a.severity === 'Critical').length} Critical Allergies
                </span>
                {isDoctor ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white flex items-center gap-1 shadow-xs">
                    <Check size={12} /> DOCTOR AUTHORIZED (EDIT ENABLED)
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700 flex items-center gap-1">
                    <Lock size={12} /> READ-ONLY CLINICAL PASSPORT
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                <strong>Patient:</strong> {profile.fullName} ({profile.age}y {profile.gender}) · <strong>MRN:</strong> {profile.mrn} · <strong>Emergency Contact:</strong> {profile.primaryEmergencyContact.name} ({profile.primaryEmergencyContact.phone})
              </p>
            </div>
          </div>

          {/* Quick Emergency Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowEmergencyMode(true)}
              className="btn-primary text-xs py-2.5 px-4 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-lg shadow-rose-600/30 flex items-center gap-2"
            >
              <Flame size={16} className="animate-pulse" />
              <span className="font-extrabold">🚨 Activate Emergency Mode</span>
            </button>

            <button
              onClick={() => setShowEmergencyQR(true)}
              className="btn-secondary text-xs py-2.5 px-3.5 flex items-center gap-1.5 border-slate-300"
            >
              <QrCode size={15} className="text-primary-600" />
              <span>Emergency QR</span>
            </button>

            {/* DOCTOR ONLY EDIT BUTTON */}
            {isDoctor && (
              <button
                onClick={() => setShowEditProfileModal(true)}
                className="btn-primary text-xs py-2.5 px-3.5 flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white border-none shadow-md shadow-emerald-900/20 font-bold"
              >
                <Edit3 size={14} />
                <span>Edit Medical Record (MD Verified)</span>
              </button>
            )}
          </div>
        </div>

        {/* Emergency Quick-Glance Pill Badges */}
        <div className="mt-4 pt-3.5 border-t border-rose-200/60 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-white/80 border border-slate-200/80">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Blood Group</span>
            <strong className="text-rose-600 font-extrabold text-sm">{profile.bloodGroup}</strong>
          </div>

          <div className="p-2.5 rounded-xl bg-white/80 border border-slate-200/80">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Primary Contact</span>
            <strong className="text-slate-900 font-bold text-xs truncate block">{profile.primaryEmergencyContact.name}</strong>
            <span className="text-[10px] text-slate-500 font-mono">{profile.primaryEmergencyContact.phone}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/80 border border-slate-200/80">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Critical Allergies</span>
            <strong className="text-rose-700 font-bold text-xs truncate block">
              {profile.allergies.map(a => a.name.split(' ')[0]).join(', ') || 'No Known Allergies'}
            </strong>
          </div>

          <div className="p-2.5 rounded-xl bg-white/80 border border-slate-200/80">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Active Medications</span>
            <strong className="text-slate-900 font-bold text-xs">{profile.medications.length} Prescriptions</strong>
          </div>

          <div className="p-2.5 rounded-xl bg-white/80 border border-slate-200/80">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Primary Doctor</span>
            <strong className="text-primary-700 font-bold text-xs truncate block">{profile.primaryDoctor.name}</strong>
          </div>

          <div className="p-2.5 rounded-xl bg-white/80 border border-slate-200/80">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Last MD Verification</span>
            <strong className="text-emerald-700 font-bold text-[11px] truncate block">{profile.lastUpdatedBy}</strong>
          </div>
        </div>
      </motion.div>

      {/* 2. SEARCH & CLINICAL DOMAIN TABS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin pb-1 border-b border-slate-200 w-full">
          {navTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-rose-400' : 'text-slate-400'} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-extrabold ${
                    isActive ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-card p-3 flex items-center gap-3">
        <Search size={16} className="text-slate-400 ml-2 shrink-0" />
        <input
          type="text"
          placeholder="Search allergies, medications, conditions, imaging reports, lab results..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-transparent text-xs font-medium outline-none text-slate-800 placeholder-slate-400"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="p-1 rounded-md text-slate-400 hover:text-slate-600">
            <X size={14} />
          </button>
        )}
      </div>

      {/* 3. TAB VIEWS */}
      <AnimatePresence mode="wait">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-6">
            {/* Patient Physical Details & Emergency Instructions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-card p-5 space-y-3">
                <h3 className="font-display font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <User size={16} className="text-primary-600" />
                  Demographics & Physical Profile
                </h3>
                <div className="space-y-2 text-xs divide-y divide-slate-100">
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-400">Date of Birth:</span>
                    <strong className="text-slate-800">{profile.dob} ({profile.age} years)</strong>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-400">Biological Sex:</span>
                    <strong className="text-slate-800">{profile.gender}</strong>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-400">Height / Weight:</span>
                    <strong className="text-slate-800">{profile.heightCm} cm / {profile.weightKg} kg</strong>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-400">Calculated BMI:</span>
                    <strong className="text-slate-800">{profile.bmi} kg/m²</strong>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-400">Organ Donor Status:</span>
                    <strong className={profile.organDonorStatus ? 'text-emerald-600 font-bold' : 'text-slate-600'}>
                      {profile.organDonorStatus ? '✓ Registered Organ Donor' : 'Not Registered'}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="glass-card p-5 space-y-3">
                <h3 className="font-display font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <PhoneCall size={16} className="text-emerald-600" />
                  Emergency Contacts
                </h3>
                <div className="space-y-2.5 text-xs">
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-1">
                    <div className="flex justify-between items-center">
                      <strong className="text-slate-900 font-bold">{profile.primaryEmergencyContact.name}</strong>
                      <span className="badge-success text-[10px]">Primary ({profile.primaryEmergencyContact.relationship})</span>
                    </div>
                    <p className="font-mono text-emerald-700 font-bold">{profile.primaryEmergencyContact.phone}</p>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Hospital Emergency Line</span>
                    <p className="font-bold text-slate-900">{profile.primaryHospital.name}</p>
                    <p className="font-mono text-slate-600">{profile.primaryHospital.emergencyLine}</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-5 space-y-3 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                <h3 className="font-display font-extrabold text-white text-sm flex items-center gap-2">
                  <Flame size={16} className="text-rose-400" />
                  Emergency Clinical Directive
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {profile.emergencyNotes}
                </p>
                <div className="pt-2 border-t border-slate-700/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Insurance: {profile.insuranceProvider}</span>
                  <span className="font-mono text-primary-300">{profile.insurancePolicyNumber}</span>
                </div>
              </div>
            </div>

            {/* Quick Grid: Critical Allergies + Active Medications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Allergies Card */}
              <div className="glass-card p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <h3 className="font-display font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <ShieldAlert size={16} className="text-rose-600" />
                    Critical Known Allergies ({profile.allergies.length})
                  </h3>
                  <button onClick={() => setActiveTab('allergies')} className="text-primary-600 text-xs font-bold hover:underline">
                    View All →
                  </button>
                </div>

                <div className="space-y-2">
                  {profile.allergies.map(alg => (
                    <div key={alg.id} className="p-3 bg-rose-50/70 border border-rose-200 rounded-2xl flex items-start justify-between gap-3 text-xs">
                      <div>
                        <strong className="text-rose-950 font-bold block">{alg.name}</strong>
                        <p className="text-rose-800 text-[11px] mt-0.5">Reaction: {alg.reaction}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-rose-600 text-white shrink-0">
                        {alg.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Medications Card */}
              <div className="glass-card p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <h3 className="font-display font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <Pill size={16} className="text-primary-600" />
                    Current Inpatient & Daily Medications ({profile.medications.length})
                  </h3>
                  <button onClick={() => setActiveTab('medications')} className="text-primary-600 text-xs font-bold hover:underline">
                    View All →
                  </button>
                </div>

                <div className="space-y-2">
                  {profile.medications.map(med => (
                    <div key={med.id} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-start justify-between gap-3 text-xs">
                      <div>
                        <strong className="text-slate-900 font-bold block">{med.name} — {med.dosage}</strong>
                        <p className="text-slate-500 text-[11px] mt-0.5">{med.frequency} · {med.route}</p>
                        <p className="text-primary-600 text-[10px] font-semibold mt-0.5">For: {med.reason}</p>
                      </div>
                      <span className="badge-info text-[10px] shrink-0 font-mono">
                        {med.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: ALLERGIES */}
        {activeTab === 'allergies' && (
          <motion.div key="allergies" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            <div className="space-y-3">
              {filteredAllergies.map(alg => (
                <div key={alg.id} className="glass-card p-4 rounded-2xl border-2 border-rose-200 bg-rose-50/40 flex items-start justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-sm font-extrabold text-slate-900">{alg.name}</strong>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-rose-600 text-white">
                        {alg.severity}
                      </span>
                      <span className="badge-info text-[10px]">{alg.type}</span>
                    </div>
                    <p className="text-rose-900 font-medium"><strong>Clinical Reaction:</strong> {alg.reaction}</p>
                    {alg.notes && <p className="text-slate-600 text-[11px]"><strong>Notes:</strong> {alg.notes}</p>}
                    <p className="text-[10px] text-slate-400">Verified by: {alg.verifiedBy || 'Attending Physician'}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* TAB 3: MEDICATIONS */}
        {activeTab === 'medications' && (
          <motion.div key="medications" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMeds.map(med => (
                <div key={med.id} className="glass-card p-4 rounded-2xl space-y-2 text-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <strong className="text-sm font-extrabold text-slate-900">{med.name}</strong>
                      <span className="text-primary-700 font-bold block text-xs">{med.dosage} · {med.frequency}</span>
                    </div>
                    <span className="badge-success text-[10px]">{med.status}</span>
                  </div>

                  <div className="space-y-1 pt-1 border-t border-slate-100 text-[11px]">
                    <div><strong>Route:</strong> {med.route}</div>
                    <div><strong>Clinical Indication:</strong> {med.reason}</div>
                    <div><strong>Prescribing Doctor:</strong> {med.prescribingDoctor}</div>
                    {med.specialInstructions && <div className="text-amber-800 font-medium"><strong>Instructions:</strong> {med.specialInstructions}</div>}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* TAB 4: CONDITIONS & DIAGNOSES */}
        {activeTab === 'conditions' && (
          <motion.div key="conditions" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            <div className="space-y-3">
              {filteredConditions.map(cnd => (
                <div key={cnd.id} className="glass-card p-4 rounded-2xl space-y-2 text-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <strong className="text-sm font-extrabold text-slate-900">{cnd.name}</strong>
                      <span className="font-mono text-[10px] text-slate-400 ml-2">ICD-10: {cnd.icd10Code}</span>
                    </div>
                    <span className="badge-warning text-[10px]">{cnd.severity}</span>
                  </div>
                  <p className="text-slate-700"><strong>Current Treatment:</strong> {cnd.currentTreatment}</p>
                  {cnd.notes && <p className="text-slate-500 text-[11px]">{cnd.notes}</p>}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* TAB 5: SCANS & IMAGING (PACS DICOM VIEWER INTEGRATION) */}
        {activeTab === 'scans' && (
          <motion.div key="scans" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredScans.map(scan => (
                <div key={scan.id} className="glass-card p-4 rounded-2xl space-y-3 text-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <strong className="text-sm font-extrabold text-slate-900">{scan.scanType} — {scan.bodyPart}</strong>
                      <p className="text-[10px] font-mono text-slate-400">{scan.date} · {scan.facility}</p>
                    </div>
                    <span className="badge-info text-[10px]">{scan.images.length} Image(s)</span>
                  </div>

                  {/* Thumbnail */}
                  <div
                    onClick={() => setSelectedScanForViewer(scan)}
                    className="h-44 bg-slate-950 rounded-xl overflow-hidden cursor-pointer relative group flex items-center justify-center"
                  >
                    <img src={scan.images[0]?.url} alt={scan.scanType} className="h-full w-full object-contain" />
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-xs">
                      <ZoomIn size={18} /> Inspect High-Res Series in PACS Viewer
                    </div>
                  </div>

                  <p className="text-slate-700 text-[11px]"><strong>Impression:</strong> {scan.impression}</p>

                  <button
                    onClick={() => setSelectedScanForViewer(scan)}
                    className="btn-primary text-xs py-1.5 w-full justify-center"
                  >
                    Open Fullscreen PACS DICOM Viewer →
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* TAB 6: LAB REPORTS */}
        {activeTab === 'labs' && (
          <motion.div key="labs" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            <div className="glass-card overflow-hidden border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="p-3.5">Test Name</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Result</th>
                    <th className="p-3.5">Reference Range</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLabs.map(lab => (
                    <tr key={lab.id} className="hover:bg-slate-50/80">
                      <td className="p-3.5 font-bold text-slate-900">{lab.testName}</td>
                      <td className="p-3.5 text-slate-500">{lab.category}</td>
                      <td className="p-3.5 font-extrabold text-slate-900 font-mono">{lab.resultValue} {lab.unit}</td>
                      <td className="p-3.5 text-slate-500 font-mono">{lab.referenceRange}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          lab.status === 'High' ? 'bg-rose-100 text-rose-800' :
                          lab.status === 'Low' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {lab.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400 font-mono">{lab.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* TAB 7: SURGERIES */}
        {activeTab === 'surgeries' && (
          <motion.div key="surgeries" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            <div className="space-y-3">
              {profile.surgeries.map(srg => (
                <div key={srg.id} className="glass-card p-4 rounded-2xl space-y-2 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <strong className="text-sm font-extrabold text-slate-900">{srg.procedureName}</strong>
                      <p className="text-[10px] font-mono text-slate-400">{srg.date} · {srg.hospital}</p>
                    </div>
                    <span className="badge-info text-[10px]">{srg.anesthesiaType}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-[11px]">
                    <div><strong>Surgeon:</strong> {srg.surgeon}</div>
                    <div><strong>Indication:</strong> {srg.indicationReason}</div>
                    <div><strong>Outcome:</strong> {srg.outcome}</div>
                    {srg.implantedHardware && <div><strong>Implants:</strong> {srg.implantedHardware}</div>}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* OTHER TABS */}
        {activeTab === 'timeline' && (
          <motion.div key="timeline" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            <div className="p-4 glass-card space-y-3">
              {profile.timeline.map(item => (
                <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3 text-xs">
                  <span className="font-mono font-bold text-primary-700 shrink-0">{item.date}</span>
                  <div>
                    <strong className="text-slate-900 block font-bold">{item.title}</strong>
                    <p className="text-slate-600 mt-0.5">{item.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 1: PACS DICOM VIEWER MODAL */}
      <AnimatePresence>
        {selectedScanForViewer && (
          <MedicalImageViewerModal
            scan={selectedScanForViewer}
            onClose={() => setSelectedScanForViewer(null)}
          />
        )}
      </AnimatePresence>

      {/* MODAL 2: EMERGENCY MODE MODAL */}
      <AnimatePresence>
        {showEmergencyMode && (
          <EmergencyModeModal
            profile={profile}
            onClose={() => setShowEmergencyMode(false)}
          />
        )}
      </AnimatePresence>

      {/* MODAL 3: EMERGENCY QR CODE MODAL */}
      <AnimatePresence>
        {showEmergencyQR && (
          <EmergencyQRModal
            profile={profile}
            onClose={() => setShowEmergencyQR(false)}
          />
        )}
      </AnimatePresence>

      {/* MODAL 4: DOCTOR ONLY EDIT MODAL */}
      <AnimatePresence>
        {showEditProfileModal && isDoctor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 text-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Stethoscope size={18} className="text-primary-600" />
                  <h3 className="font-display font-extrabold text-slate-900 text-base">
                    Physician Medical Record Editor
                  </h3>
                </div>
                <button onClick={() => setShowEditProfileModal(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                  <X size={18} />
                </button>
              </div>

              <p className="text-[11px] text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 font-semibold">
                ✓ Verified Attending Physician: {user?.name || 'Dr. Emily Chen, MD'}. Changes will be cryptographically signed in the clinical audit log.
              </p>

              <form onSubmit={handleSaveProfileEdit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Height (cm)</label>
                    <input
                      type="number"
                      value={editForm.heightCm}
                      onChange={e => setEditForm({ ...editForm, heightCm: Number(e.target.value) })}
                      className="input-field text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Weight (kg)</label>
                    <input
                      type="number"
                      value={editForm.weightKg}
                      onChange={e => setEditForm({ ...editForm, weightKg: Number(e.target.value) })}
                      className="input-field text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Emergency Directive & Clinical Notes</label>
                  <textarea
                    rows={3}
                    value={editForm.emergencyNotes}
                    onChange={e => setEditForm({ ...editForm, emergencyNotes: e.target.value })}
                    className="input-field text-xs resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Insurance Provider</label>
                    <input
                      type="text"
                      value={editForm.insuranceProvider}
                      onChange={e => setEditForm({ ...editForm, insuranceProvider: e.target.value })}
                      className="input-field text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Policy Number</label>
                    <input
                      type="text"
                      value={editForm.insurancePolicyNumber}
                      onChange={e => setEditForm({ ...editForm, insurancePolicyNumber: e.target.value })}
                      className="input-field text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Primary Contact Phone</label>
                  <input
                    type="text"
                    value={editForm.primaryContactPhone}
                    onChange={e => setEditForm({ ...editForm, primaryContactPhone: e.target.value })}
                    className="input-field text-xs font-mono"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setShowEditProfileModal(false)} className="btn-secondary text-xs flex-1">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary text-xs flex-1 justify-center bg-emerald-600 hover:bg-emerald-500">
                    ✓ Sign & Save Record
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

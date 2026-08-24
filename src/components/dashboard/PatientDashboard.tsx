import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Calendar, Heart, MessageCircle, Pill, FileText, Brain, Zap,
  Flame, QrCode, ShieldAlert, ArrowRight, ShieldCheck, Stethoscope,
  Layers, Clock, PhoneCall, CheckCircle2, ChevronRight, User
} from 'lucide-react';
import { MetricCard } from '../common/MetricCard';
import { VitalsChart } from '../charts';
import { askMedAI } from '../../services/azureOpenAI';
import { useAppStore } from '../../store/appStore';
import { demoPatientRecord } from '../../data/demoPatientRecord';
import { EmergencyModeModal } from '../medical-profile/EmergencyModeModal';
import { EmergencyQRModal } from '../medical-profile/EmergencyQRModal';

const vitalsData = Array.from({ length: 12 }, (_, i) => ({
  time: `Day ${i + 1}`,
  hr: 72 + Math.sin(i * 0.7) * 8 + Math.random() * 3,
  spo2: 97 + Math.sin(i * 0.4) * 1,
})).map(d => ({ ...d, hr: Math.round(d.hr), spo2: Math.round(d.spo2 * 10) / 10 }));

const medications = [
  { name: 'Metformin 500mg', schedule: 'Twice daily with meals', nextDose: '12:00 PM', status: 'due' },
  { name: 'Lisinopril 10mg', schedule: 'Once daily morning', nextDose: 'Tomorrow 8:00 AM', status: 'taken' },
  { name: 'Atorvastatin 40mg', schedule: 'Once daily evening', nextDose: 'Tonight 9:00 PM', status: 'upcoming' },
];

const appointments = [
  { type: 'Cardiology Follow-up', doctor: 'Dr. Emily Chen', date: 'Apr 15, 2026', time: '10:30 AM', location: 'Building A, Room 204' },
  { type: 'Lab Work (HbA1c)', doctor: 'Quest Diagnostics', date: 'Apr 12, 2026', time: '8:00 AM', location: 'Lab Center' },
  { type: 'Telehealth Check-in', doctor: 'Dr. James Park', date: 'Apr 20, 2026', time: '2:00 PM', location: 'Video Call' },
];

export const PatientDashboard: React.FC = () => {
  const { setActiveModule, setActiveDashboard } = useAppStore();
  const [question, setQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showEmergencyMode, setShowEmergencyMode] = useState(false);
  const [showEmergencyQR, setShowEmergencyQR] = useState(false);

  const profile = demoPatientRecord;

  const askQuestion = async (q?: string) => {
    const query = q || question;
    if (!query) return;
    setAiLoading(true);
    setQuestion('');
    try {
      const ans = await askMedAI(query, 'patient');
      setAiAnswer(ans);
    } finally {
      setAiLoading(false);
    }
  };

  const handleNavigateToMedicalProfile = () => {
    setActiveModule('medical-profile');
    setActiveDashboard('medical-profile');
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto text-slate-800">
      {/* 1. PATIENT HEADER WITH GREETING & STATUS */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="glass-card p-6 bg-gradient-to-r from-primary-50 via-teal-50/50 to-white border-slate-200/90 shadow-glass rounded-3xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-600 via-primary-500 to-accent-teal flex items-center justify-center text-white text-xl font-display font-extrabold shadow-md shadow-primary-500/20">
                JW
              </div>
              <div>
                <h1 className="text-xl font-display font-extrabold text-slate-900">Good morning, James!</h1>
                <p className="text-xs text-slate-500 font-medium">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} · MRN: {profile.mrn}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="badge-success text-xs font-bold">Care Plan Active</span>
                  <span className="badge-info text-xs font-bold">2 Appointments Upcoming</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowEmergencyMode(true)}
                className="btn-primary text-xs py-2 px-3.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 shadow-rose-600/30 flex items-center gap-1.5"
              >
                <Flame size={14} className="animate-pulse" />
                <span>🚨 Emergency Mode</span>
              </button>
              <button
                onClick={() => setShowEmergencyQR(true)}
                className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
              >
                <QrCode size={14} className="text-primary-600" />
                <span>QR Passport</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. EMERGENCY MEDICAL SUMMARY CARD (HIGHLIGHTED IN PATIENT HUB) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass-card p-5 bg-gradient-to-r from-rose-50/70 via-amber-50/50 to-primary-50/40 border-2 border-rose-200/90 rounded-3xl shadow-sm space-y-3.5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-200/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-600 text-white shadow-xs">
              <Flame size={18} />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-slate-900 text-base">
                Emergency Medical Summary & Health Passport
              </h3>
              <p className="text-xs text-slate-500">
                Critical medical information immediately accessible to emergency doctors and first responders.
              </p>
            </div>
          </div>

          <button
            onClick={handleNavigateToMedicalProfile}
            className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 shadow-md shrink-0"
          >
            <span>View Complete Medical Profile</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Quick Health Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-xs">
          <div className="p-3 bg-white/90 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Blood Group</span>
            <strong className="text-rose-600 font-extrabold text-base font-display">{profile.bloodGroup}</strong>
          </div>

          <div className="p-3 bg-white/90 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Allergies</span>
            <strong className="text-amber-700 font-extrabold text-sm block truncate">2 Critical</strong>
          </div>

          <div className="p-3 bg-white/90 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Conditions</span>
            <strong className="text-slate-800 font-extrabold text-sm block truncate">3 Active</strong>
          </div>

          <div className="p-3 bg-white/90 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Medications</span>
            <strong className="text-slate-800 font-extrabold text-sm block truncate">5 Prescribed</strong>
          </div>

          <div className="p-3 bg-white/90 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Surgeries</span>
            <strong className="text-slate-800 font-extrabold text-sm block truncate">2 Previous</strong>
          </div>

          <div className="p-3 bg-white/90 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Medical Docs</span>
            <strong className="text-primary-600 font-extrabold text-sm block truncate">{profile.documents.length} Vaulted</strong>
          </div>

          <div className="p-3 bg-white/90 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Imaging Scans</span>
            <strong className="text-teal-600 font-extrabold text-sm block truncate">{profile.scans.length} Ready</strong>
          </div>
        </div>
      </motion.div>

      {/* 3. VITALS METRICS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <MetricCard title="Heart Rate" value="74 bpm" subtitle="Resting · Normal" icon={<Heart size={18} />} color="rose" delay={0.1} />
        <MetricCard title="Blood Pressure" value="124/78" subtitle="Controlled" icon={<Activity size={18} />} color="blue" delay={0.15} />
        <MetricCard title="Next Appt" value="Apr 12" subtitle="HbA1c Lab work" icon={<Calendar size={18} />} color="teal" delay={0.2} />
        <MetricCard title="Medications" value="3" subtitle="1 due at noon" icon={<Pill size={18} />} color="amber" badge="1 Due" badgeType="warning" delay={0.25} />
      </div>

      {/* 4. VITALS TREND CHART */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-bold text-slate-800 text-sm">Biometric Vitals Stream — Last 12 Days</h3>
            <p className="text-xs text-slate-400">Continuous telemetry data synced with home Bluetooth monitor.</p>
          </div>
          <span className="badge-success text-[10px] font-bold">Nominal Range</span>
        </div>
        <VitalsChart data={vitalsData} metrics={['hr', 'spo2']} height={170} />
      </motion.div>

      {/* 5. MEDICATIONS & APPOINTMENTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Medications list */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2">
              <Pill size={16} className="text-amber-600" />
              My Daily Medications
            </h3>
            <button onClick={handleNavigateToMedicalProfile} className="text-xs text-primary-600 font-bold hover:underline">
              All Rx ({profile.medications.length}) →
            </button>
          </div>

          <div className="space-y-2.5">
            {medications.map((med, i) => (
              <div key={i} className={`p-3 rounded-2xl border transition-all ${med.status === 'due' ? 'bg-amber-50/80 border-amber-200' : med.status === 'taken' ? 'bg-emerald-50/80 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800">{med.name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{med.schedule}</p>
                    <p className="text-[11px] text-slate-600 font-medium mt-1">Next: {med.nextDose}</p>
                  </div>
                  <span className={`badge text-[10px] font-bold ${med.status === 'due' ? 'badge-warning' : med.status === 'taken' ? 'badge-success' : 'badge-neutral'}`}>
                    {med.status === 'due' ? '⚠ Due Now' : med.status === 'taken' ? '✓ Taken' : 'Upcoming'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Appointments */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2">
              <Calendar size={16} className="text-primary-600" />
              Upcoming Clinical Appointments
            </h3>
          </div>

          <div className="space-y-2.5">
            {appointments.map((appt, i) => (
              <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800">{appt.type}</p>
                    <p className="text-[11px] text-slate-400">{appt.doctor}</p>
                    <p className="text-xs text-primary-600 font-bold mt-1">{appt.date} at {appt.time}</p>
                    <p className="text-[10px] text-slate-400">{appt.location}</p>
                  </div>
                  <Calendar size={16} className="text-primary-400 shrink-0 mt-0.5" />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* 6. ASK YOUR HEALTH AI ASSISTANT */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="glass-card p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary-50 text-primary-600">
              <Brain size={16} />
            </div>
            <div>
              <h3 className="font-display font-bold text-slate-800 text-sm">Ask Your MedAI Health Assistant</h3>
              <p className="text-[11px] text-slate-400">Ask questions about your prescriptions, lab findings, or medical history.</p>
            </div>
          </div>
          <span className="badge-info text-[10px] font-bold">GPT-4 Medical Vault</span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {['Explain my MRI scan findings', 'What does HbA1c 7.2% mean?', 'Why am I taking Metformin?', 'Emergency symptoms to watch for'].map(q => (
            <button key={q} onClick={() => askQuestion(q)} className="px-2.5 py-1 bg-slate-100 hover:bg-primary-50 hover:text-primary-700 text-slate-600 text-xs rounded-xl font-medium transition-all">
              {q}
            </button>
          ))}
        </div>

        <div className="flex gap-2 pt-1">
          <input
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && askQuestion()}
            placeholder="Ask anything about your health records or prescriptions..."
            className="input-field flex-1 text-xs"
          />
          <button onClick={() => askQuestion()} disabled={!question || aiLoading} className="btn-primary text-xs px-4">
            <Zap size={13} /> Ask AI
          </button>
        </div>

        {(aiLoading || aiAnswer) && (
          <div className="p-4 bg-gradient-to-br from-primary-50 to-teal-50/50 border border-primary-100 rounded-2xl text-xs space-y-1">
            <p className="font-bold text-primary-900">MedAI Health Assistant Response:</p>
            {aiLoading ? (
              <div className="flex gap-1 py-1">
                {[0, 150, 300].map(d => <span key={d} className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
              </div>
            ) : (
              <p className="text-slate-700 leading-relaxed whitespace-pre-line font-medium">{aiAnswer}</p>
            )}
          </div>
        )}
      </motion.div>

      {/* MODALS */}
      {showEmergencyMode && (
        <EmergencyModeModal profile={profile} onClose={() => setShowEmergencyMode(false)} />
      )}

      {showEmergencyQR && (
        <EmergencyQRModal profile={profile} onClose={() => setShowEmergencyQR(false)} />
      )}
    </div>
  );
};

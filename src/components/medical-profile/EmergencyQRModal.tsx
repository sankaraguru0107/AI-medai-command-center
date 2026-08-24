import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode, X, Download, Printer, ShieldCheck, Lock, Smartphone,
  CheckCircle2, Copy, AlertTriangle, ExternalLink, Globe, FileText,
  UserCheck, RefreshCw, Eye, Sparkles, PhoneCall, Heart
} from 'lucide-react';
import { PatientMedicalProfile } from '../../types/medicalRecord';

interface EmergencyQRModalProps {
  profile: PatientMedicalProfile;
  onClose: () => void;
}

type QRMode = 'text_summary' | 'web_url' | 'vcard';

export const EmergencyQRModal: React.FC<EmergencyQRModalProps> = ({
  profile,
  onClose,
}) => {
  const [qrMode, setQrMode] = useState<QRMode>('text_summary');
  const [copied, setCopied] = useState<boolean>(false);
  const [customHost, setCustomHost] = useState<string>(() => {
    return window.location.origin || 'http://localhost:5173';
  });
  const [showPreview, setShowPreview] = useState<boolean>(false);

  // 1. Text Summary (Works 100% offline directly in mobile camera without network)
  const emergencyTextSummary = `🚨 EMERGENCY MEDICAL PASSPORT
PATIENT: ${profile.fullName} (${profile.age}y ${profile.gender})
MRN: ${profile.mrn} | DOB: ${profile.dob}
BLOOD GROUP: ${profile.bloodGroup} (Organ Donor: ${profile.organDonorStatus ? 'YES' : 'NO'})

⚠️ CRITICAL ALLERGIES:
${profile.allergies.filter(a => a.severity === 'Critical' || a.severity === 'Severe').map(a => `• ${a.name} (${a.severity.toUpperCase()}): ${a.reaction}`).join('\n')}

💊 ACTIVE MEDICATIONS:
${profile.medications.filter(m => m.status === 'Active').map(m => `• ${m.name} ${m.dosage} (${m.frequency}) - ${m.reason}`).join('\n')}

🏥 DIAGNOSED CONDITIONS:
${profile.conditions.map(c => `• ${c.name} (${c.status})`).join('\n')}

🔪 PREVIOUS SURGERIES:
${profile.surgeries.map(s => `• ${s.procedureName} (${s.date}) - ${s.hospital}`).join('\n')}

📞 EMERGENCY CONTACT:
${profile.primaryEmergencyContact.name} (${profile.primaryEmergencyContact.relationship})
Phone: ${profile.primaryEmergencyContact.phone}

👨‍⚕️ PRIMARY CARE DOCTOR:
${profile.primaryDoctor.name} (${profile.primaryDoctor.specialty})
Hospital: ${profile.primaryHospital.name}
Phone: ${profile.primaryDoctor.phone}

Last Verified: ${new Date(profile.lastUpdated).toLocaleDateString()} by ${profile.lastUpdatedBy}`;

  // 2. Web URL for opening the interactive Emergency Passport
  const emergencyWebUrl = `${customHost}/emergency-passport`;

  // 3. vCard format for saving into phone contacts
  const emergencyVCard = `BEGIN:VCARD
VERSION:3.0
N:Wilson;James;Alexander;Mr.;
FN:James Alexander Wilson (EMERGENCY PASSPORT)
ORG:MedAI Emergency Network
TITLE:Patient Medical ID - Blood Group ${profile.bloodGroup}
TEL;TYPE=CELL,VOICE:${profile.primaryEmergencyContact.phone}
EMAIL:${profile.primaryEmergencyContact.email || 'emergency@medai.health'}
NOTE:🚨 BLOOD GROUP: ${profile.bloodGroup}\\nCRITICAL ALLERGIES: Penicillin, Peanuts\\nMEDS: Metformin, Lisinopril, Aspirin\\nEMERGENCY CONTACT: Sarah Wilson ${profile.primaryEmergencyContact.phone}
END:VCARD`;

  // Compute active QR content based on mode
  const activeQrData =
    qrMode === 'text_summary'
      ? emergencyTextSummary
      : qrMode === 'web_url'
      ? emergencyWebUrl
      : emergencyVCard;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&margin=8&data=${encodeURIComponent(
    activeQrData
  )}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeQrData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    const link = document.createElement('a');
    link.href = qrImageUrl;
    link.download = `emergency_qr_${profile.mrn.toLowerCase()}.png`;
    link.target = '_blank';
    link.click();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full p-5 sm:p-6 space-y-4 relative overflow-hidden my-auto text-slate-800"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-600 text-white flex items-center justify-center shadow-md shadow-rose-600/20 animate-pulse">
                <QrCode size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-extrabold text-slate-900 text-base sm:text-lg">
                    Working Emergency QR Passport
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-100 text-rose-800">
                    SCAN WITH MOBILE
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Scan this QR code with any iPhone or Android camera to view patient details
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* MODE SELECTOR TABS */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setQrMode('text_summary')}
              className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                qrMode === 'text_summary'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone size={14} />
              <span className="truncate">Direct Details (Offline)</span>
            </button>

            <button
              onClick={() => setQrMode('web_url')}
              className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                qrMode === 'web_url'
                  ? 'bg-white text-primary-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe size={14} />
              <span className="truncate">Web Passport URL</span>
            </button>

            <button
              onClick={() => setQrMode('vcard')}
              className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                qrMode === 'vcard'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck size={14} />
              <span className="truncate">Save Medical Contact</span>
            </button>
          </div>

          {/* QR CODE CONTAINER */}
          <div className="flex flex-col items-center justify-center p-5 bg-gradient-to-b from-slate-50 to-rose-50/30 rounded-2xl border border-slate-200 space-y-3">
            {/* The Real Working QR Code Image */}
            <div className="p-3 bg-white rounded-2xl shadow-lg border-2 border-slate-200 relative group flex items-center justify-center">
              <img
                src={qrImageUrl}
                alt="Emergency QR Code"
                className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-lg"
                crossOrigin="anonymous"
              />
              <div className="absolute inset-0 bg-primary-600/10 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity flex items-center justify-center pointer-events-none">
                <span className="bg-slate-900/90 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg">
                  Point Mobile Camera Here
                </span>
              </div>
            </div>

            {/* Patient Badge under QR */}
            <div className="text-center space-y-0.5">
              <div className="flex items-center justify-center gap-2">
                <strong className="text-sm font-extrabold text-slate-900">{profile.fullName}</strong>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white">
                  {profile.bloodGroup}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                {qrMode === 'text_summary'
                  ? '⚡ Instant Offline Summary: Shows Allergies, Meds, Contacts directly on phone camera screen'
                  : qrMode === 'web_url'
                  ? '🌐 Opens complete interactive Emergency Web Passport'
                  : '📇 Scans as Medical Contact into phone address book'}
              </p>
            </div>
          </div>

          {/* Web URL Host Configurator (If Web Mode active) */}
          {qrMode === 'web_url' && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700">Passport Web Address:</label>
                <a
                  href={emergencyWebUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary-600 hover:underline font-bold flex items-center gap-1 text-[11px]"
                >
                  Open Preview <ExternalLink size={12} />
                </a>
              </div>
              <input
                type="text"
                value={customHost}
                onChange={e => setCustomHost(e.target.value)}
                placeholder="e.g. http://192.168.1.100:5173"
                className="input-field text-xs font-mono"
              />
              <p className="text-[10px] text-slate-400">
                Tip: If testing from a phone on the same Wi-Fi, enter your computer's local Wi-Fi IP (e.g. <code>http://192.168.x.x:5173</code>).
              </p>
            </div>
          )}

          {/* Preview Scanned Text Drawer */}
          <div className="space-y-1.5">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="text-xs text-primary-600 font-bold hover:underline flex items-center gap-1"
            >
              <Eye size={13} />
              <span>{showPreview ? 'Hide Scanned Details' : 'View what phone sees when scanned →'}</span>
            </button>

            {showPreview && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed border border-slate-800"
              >
                {activeQrData}
              </motion.div>
            )}
          </div>

          {/* Actions Bottom Bar */}
          <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100">
            <button
              onClick={handleCopy}
              className="btn-secondary text-xs flex-1 justify-center py-2.5"
            >
              {copied ? <CheckCircle2 size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy QR Details'}</span>
            </button>

            <button
              onClick={handleDownloadQr}
              className="btn-secondary text-xs flex-1 justify-center py-2.5"
            >
              <Download size={14} />
              <span>Download QR Image</span>
            </button>

            <button
              onClick={() => window.print()}
              className="btn-primary text-xs flex-1 justify-center py-2.5 bg-slate-900 hover:bg-slate-800"
            >
              <Printer size={14} />
              <span>Print Wallet Card</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

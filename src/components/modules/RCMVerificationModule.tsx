import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, CheckCircle2, AlertCircle, CreditCard, Search, RefreshCw, Zap } from 'lucide-react';
import { MetricCard } from '../common/MetricCard';

interface PayerRecord {
  id: string;
  patientName: string;
  payer: string;
  policyNumber: string;
  status: 'Active Coverage' | 'Pending Review' | 'Terminated';
  copay: string;
  deductibleMet: string;
  coinsurance: string;
  lastVerified: string;
}

const mockPayers: PayerRecord[] = [
  { id: '1', patientName: 'James Wilson', payer: 'Blue Cross Blue Shield PPO', policyNumber: 'BC-90418241', status: 'Active Coverage', copay: '$30 Primary / $50 Specialist', deductibleMet: '$1,250 / $2,000', coinsurance: '20%', lastVerified: 'Today, 08:30 AM' },
  { id: '2', patientName: 'Sarah Chen', payer: 'Aetna Choice POS II', policyNumber: 'AET-771092', status: 'Active Coverage', copay: '$20 Primary / $40 Specialist', deductibleMet: '$2,000 / $2,000 (Met)', coinsurance: '10%', lastVerified: 'Yesterday' },
  { id: '3', patientName: 'Robert Kim', payer: 'Medicare Part B + Supplemental', policyNumber: 'MED-4410982', status: 'Pending Review', copay: '$0 Copay', deductibleMet: '$240 / $240 (Met)', coinsurance: '0%', lastVerified: '3 days ago' }
];

export const RCMVerificationModule: React.FC = () => {
  const [records, setRecords] = useState(mockPayers);
  const [selected, setSelected] = useState(mockPayers[0]);
  const [verifying, setVerifying] = useState(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);

  const runEligibilityVerification = async () => {
    setVerifying(true);
    setVerifiedSuccess(false);
    await new Promise(r => setTimeout(r, 1000));
    setVerifying(false);
    setVerifiedSuccess(true);
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
            Real-Time Benefits & Insurance Verification <ShieldCheck className="text-primary-600" />
          </h1>
          <p className="text-sm text-slate-500">Instant EDI 270/271 clearinghouse integration for co-pay and deductible validation.</p>
        </div>
        <button onClick={runEligibilityVerification} disabled={verifying} className="btn-primary text-xs flex items-center gap-2">
          <RefreshCw size={14} className={verifying ? 'animate-spin' : ''} />
          <span>{verifying ? 'Verifying EDI 270...' : 'Run Real-Time Verification'}</span>
        </button>
      </div>

      {verifiedSuccess && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 size={16} /> EDI 271 Eligibility Response Verified: Patient coverage is active with 0 prior auth requirements.
          </div>
          <span className="text-[10px] bg-emerald-100 px-2 py-0.5 rounded font-bold">200 OK</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="Verified Today" value="142" subtitle="98.5% automated" icon={<ShieldCheck size={16} />} color="blue" delay={0} />
        <MetricCard title="Active Policies" value="96%" subtitle="Clean EDI status" icon={<CheckCircle2 size={16} />} color="teal" delay={0.05} />
        <MetricCard title="Copay Accuracy" value="99.2%" subtitle="Zero disputes" icon={<CreditCard size={16} />} color="amber" delay={0.1} />
        <MetricCard title="Payer Latency" value="1.2s" subtitle="Direct Clearinghouse" icon={<Zap size={16} />} color="rose" delay={0.15} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-5 lg:col-span-1 space-y-3">
          <h3 className="font-semibold text-sm text-slate-800">Patient Eligibility Queue</h3>
          <div className="space-y-2">
            {records.map(r => (
              <div
                key={r.id}
                onClick={() => setSelected(r)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  selected.id === r.id ? 'bg-primary-50 border-primary-300' : 'hover:bg-slate-50 border-slate-100'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="font-bold text-xs text-slate-800">{r.patientName}</span>
                  <span className="badge-success text-[10px]">{r.status}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{r.payer}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{r.policyNumber}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6 lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <div>
              <h3 className="font-display font-bold text-base text-slate-900">{selected.patientName}</h3>
              <p className="text-xs text-slate-500">{selected.payer} · Policy #{selected.policyNumber}</p>
            </div>
            <span className="badge-info text-xs">{selected.lastVerified}</span>
          </div>

          <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Co-pay Schedule</span>
              <p className="text-xs font-bold text-slate-800 mt-1">{selected.copay}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Deductible Progress</span>
              <p className="text-xs font-bold text-slate-800 mt-1">{selected.deductibleMet}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Co-Insurance</span>
              <p className="text-xs font-bold text-slate-800 mt-1">{selected.coinsurance}</p>
            </div>
          </div>

          <div className="p-4 bg-primary-50/50 border border-primary-100 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-primary-900 flex items-center gap-1.5">
              <Zap size={14} className="text-primary-600" /> AI Payer Rule Summary
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Patient has active outpatient coverage. In-network specialist visits require standard copay. No pre-certification required for diagnostic routine labs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

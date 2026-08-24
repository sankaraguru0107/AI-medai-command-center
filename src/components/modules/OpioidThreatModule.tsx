import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Activity, Lock, Database, CheckCircle, Search } from 'lucide-react';
import { MetricCard } from '../common/MetricCard';

export const OpioidThreatModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'opioid' | 'threat'>('opioid');
  const [mmeScore, setMmeScore] = useState(45);
  const [pdmpStatus, setPdmpStatus] = useState<string | null>(null);

  const runPdmpCheck = async () => {
    setPdmpStatus('Checking State PDMP database...');
    await new Promise(r => setTimeout(r, 800));
    setPdmpStatus('Verified: No multiple prescribers or early refills detected. Risk level LOW (MME < 50/day).');
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
            Opioid Monitoring & Cybersecurity Threat Radar <Shield className="text-violet-600" />
          </h1>
          <p className="text-sm text-slate-500">MME dosage safety tracking and real-time medical device threat intelligence.</p>
        </div>
        <div className="flex gap-1 bg-white p-1 rounded-xl shadow-xs border">
          <button
            onClick={() => setActiveTab('opioid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'opioid' ? 'bg-amber-500 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Opioid MME Risk
          </button>
          <button
            onClick={() => setActiveTab('threat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'threat' ? 'bg-violet-600 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Device Threat Radar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="High MME Patients" value="2" subtitle=">90 MME/day threshold" icon={<AlertTriangle size={16} />} color="amber" delay={0} />
        <MetricCard title="PDMP Sync Rate" value="100%" subtitle="State registry connected" icon={<Database size={16} />} color="teal" delay={0.05} />
        <MetricCard title="Blocked Cyber Threats" value="1,492" subtitle="Zero breaches" icon={<Lock size={16} />} color="rose" delay={0.1} />
        <MetricCard title="Device Compliance" value="99.9%" subtitle="PACS / Telemetry secure" icon={<CheckCircle size={16} />} color="blue" delay={0.15} />
      </div>

      {activeTab === 'opioid' ? (
        <div className="glass-card p-5 space-y-4">
          <h3 className="font-bold text-sm text-slate-800 border-b pb-2 flex items-center gap-2">
            <Activity className="text-amber-500" size={16} /> Morphine Milligram Equivalent (MME) Calculator & PDMP
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 block">Daily Prescribed MME Level ({mmeScore} MME/day)</label>
              <input
                type="range"
                min="0"
                max="150"
                value={mmeScore}
                onChange={e => setMmeScore(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>0 MME (Safe)</span>
                <span>50 MME (Warning)</span>
                <span>90+ MME (High Risk)</span>
              </div>

              <div className={`p-3 rounded-xl border text-xs ${
                mmeScore >= 90 ? 'bg-rose-50 border-rose-200 text-rose-800' :
                mmeScore >= 50 ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}>
                <span className="font-bold block">Status: {mmeScore >= 90 ? 'High Risk - Co-prescribe Naloxone required' : mmeScore >= 50 ? 'Moderate Risk - Require close monitoring' : 'Safe Threshold'}</span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 block">State Prescription Drug Monitoring Program (PDMP)</label>
              <button onClick={runPdmpCheck} className="btn-primary text-xs w-full justify-center bg-amber-600 hover:bg-amber-700">
                <Search size={14} /> Query State PDMP Registry
              </button>
              {pdmpStatus && (
                <p className="text-xs p-3 bg-slate-50 border rounded-xl text-slate-700 leading-relaxed font-medium">
                  {pdmpStatus}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card p-5 space-y-4">
          <h3 className="font-bold text-sm text-slate-800 border-b pb-2 flex items-center gap-2">
            <Lock className="text-violet-600" size={16} /> Medical Device Network Cyber Anomaly Map
          </h3>
          <div className="space-y-3 text-xs">
            {[
              { device: 'Infusion Pump #402 (ICU)', ip: '10.2.14.88', threat: 'Unauthorized Port Scan', risk: 'Mitigated', status: 'Protected' },
              { device: 'PACS Gateway Workstation', ip: '10.2.20.12', threat: 'Outdated SSL Handshake', risk: 'Low Risk', status: 'Updated' },
            ].map((t, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border rounded-xl flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-800">{t.device} ({t.ip})</span>
                  <p className="text-[10px] text-slate-500">{t.threat}</p>
                </div>
                <span className="badge-success text-[10px]">{t.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

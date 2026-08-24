import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Shield, AlertTriangle, CheckCircle, Server } from 'lucide-react';
import { MetricCard } from '../common/MetricCard';

export const ThreatDetectionModule: React.FC = () => {
  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
            Cybersecurity Threat & Anomaly Detection Radar <Lock className="text-violet-600" />
          </h1>
          <p className="text-sm text-slate-500">Real-time medical device IoT security scanning, port intrusion prevention, and HIPAA audit.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="Anomalies Detected" value="0 Critical" subtitle="100% network cleared" icon={<Shield size={16} />} color="emerald" delay={0} />
        <MetricCard title="Monitored IoT Devices" value="1,840 Devices" subtitle="Infusion pumps, PACS, EHR" icon={<Server size={16} />} color="blue" delay={0.05} />
        <MetricCard title="Blocked Attacks" value="1,492 Requests" subtitle="Edge firewall active" icon={<Lock size={16} />} color="violet" delay={0.1} />
        <MetricCard title="HIPAA Audit Status" value="100% Clean" subtitle="Zero unauthorized access" icon={<CheckCircle size={16} />} color="teal" delay={0.15} />
      </div>

      <div className="glass-card p-5 space-y-4">
        <h3 className="font-bold text-sm text-slate-800 border-b pb-2">Medical IoT Device Cyber Radar</h3>
        <div className="space-y-3 text-xs">
          <div className="p-3 bg-slate-50 border rounded-xl flex justify-between items-center">
            <div>
              <p className="font-bold text-slate-800">Infusion Pump Network Array #04 (ICU)</p>
              <p className="text-[10px] text-slate-500">IP: 10.4.12.89 · Firmware v4.2.1 · Zero Vulns</p>
            </div>
            <span className="badge-success text-[10px]">Secure</span>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, AlertTriangle, Bed, Brain, CreditCard, Heart,
  Lock, TrendingUp, Users, Zap, BarChart3, Shield
} from 'lucide-react';
import { MetricCard } from '../common/MetricCard';
import { AlertFeed } from '../common/AlertFeed';
import { VitalsChart, BedOccupancyChart, TrendChart, ClaimsDistribution } from '../charts';
import { useAppStore, generateDemoAlerts } from '../../store/appStore';

const vitalsData = Array.from({ length: 20 }, (_, i) => ({
  time: `${8 + Math.floor(i / 2)}:${i % 2 === 0 ? '00' : '30'}`,
  hr: 72 + Math.round(Math.sin(i * 0.4) * 8 + Math.random() * 4),
  spo2: 97 + Math.round(Math.sin(i * 0.3) * 1.5),
}));

const bedData = [
  { unit: 'ICU', occupied: 18, total: 20 },
  { unit: 'Med/Surg', occupied: 42, total: 55 },
  { unit: 'ED', occupied: 28, total: 35 },
  { unit: 'OR', occupied: 8, total: 12 },
  { unit: 'Peds', occupied: 14, total: 20 },
  { unit: 'OB', occupied: 11, total: 18 },
];

const claimsData = [
  { name: 'Approved', value: 62 },
  { name: 'Pending', value: 18 },
  { name: 'Denied', value: 12 },
  { name: 'Appeal', value: 8 },
];

const admissionsTrend = Array.from({ length: 14 }, (_, i) => ({
  date: `Apr ${i + 1}`,
  admissions: 38 + Math.round(Math.sin(i * 0.5) * 6 + Math.random() * 4),
  discharges: 35 + Math.round(Math.sin(i * 0.4) * 5 + Math.random() * 4),
  readmissions: 4 + Math.round(Math.random() * 3),
}));

export const OverviewDashboard: React.FC = () => {
  const { setAlerts, alerts } = useAppStore();

  useEffect(() => {
    if (alerts.length === 0) {
      setAlerts(generateDemoAlerts());
    }
  }, []);

  return (
    <div className="space-y-6 p-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-slate-900 tracking-tight">Command Overview</h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Real-time hospital operations · {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full w-fit">
          <span className="dot-live" />
          <span className="text-xs font-bold text-emerald-700">All Systems Operational</span>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard title="Total Patients" value="487" subtitle="Active census" trend={3.2} trendLabel="vs yesterday" icon={<Users size={18} />} color="blue" delay={0} />
        <MetricCard title="Bed Occupancy" value="83%" subtitle="142 / 160 beds" trend={-1.4} icon={<Bed size={18} />} color="teal" badge="High" badgeType="warning" delay={0.05} />
        <MetricCard title="Active Alerts" value="12" subtitle="3 critical" icon={<AlertTriangle size={18} />} color="rose" badge="3 Critical" badgeType="danger" delay={0.1} />
        <MetricCard title="Claims Today" value="$2.4M" subtitle="284 submissions" trend={7.1} icon={<CreditCard size={18} />} color="emerald" delay={0.15} />
        <MetricCard title="AI Queries" value="1,847" subtitle="Last 24 hours" trend={12.4} icon={<Brain size={18} />} color="violet" delay={0.2} />
        <MetricCard title="Security Score" value="94/100" subtitle="HIPAA compliant" icon={<Shield size={18} />} color="amber" badge="Good" badgeType="success" delay={0.25} />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts panel */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
            <h2 className="font-display font-extrabold text-slate-900 text-sm flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600">
                <AlertTriangle size={17} />
              </div>
              Active Alerts
            </h2>
            <span className="badge-danger">Live</span>
          </div>
          <AlertFeed maxItems={8} />
        </div>

        {/* Charts column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bed occupancy */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
              <h2 className="font-display font-extrabold text-slate-900 text-sm flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-primary-500/10 text-primary-600">
                  <Bed size={17} />
                </div>
                Bed Occupancy by Unit
              </h2>
              <span className="text-xs font-semibold text-slate-400">Live Stream</span>
            </div>
            <BedOccupancyChart data={bedData} height={190} />
          </div>

          {/* Admissions trend */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
              <h2 className="font-display font-extrabold text-slate-900 text-sm flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-600">
                  <TrendingUp size={17} />
                </div>
                14-Day Admissions Trend
              </h2>
            </div>
            <TrendChart
              data={admissionsTrend}
              lines={[
                { key: 'admissions', label: 'Admissions' },
                { key: 'discharges', label: 'Discharges', color: '#0d9488' },
                { key: 'readmissions', label: 'Readmissions', color: '#e11d48' },
              ]}
              height={190}
            />
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Claims distribution */}
        <div className="glass-card p-6">
          <h2 className="font-display font-extrabold text-slate-900 text-sm mb-4 pb-3 border-b border-slate-100 flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-primary-500/10 text-primary-600">
              <CreditCard size={17} />
            </div>
            Claims Status
          </h2>
          <ClaimsDistribution data={claimsData} />
        </div>

        {/* Quick stats */}
        <div className="glass-card p-6">
          <h2 className="font-display font-extrabold text-slate-900 text-sm mb-4 pb-3 border-b border-slate-100 flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600">
              <Zap size={17} />
            </div>
            Operational Metrics
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Avg Length of Stay', value: '4.2 days', change: '-0.3', good: true },
              { label: 'Door-to-Doc Time', value: '18 min', change: '-2', good: true },
              { label: 'LWBS Rate', value: '2.1%', change: '+0.4', good: false },
              { label: 'Patient Satisfaction', value: '91%', change: '+1.5', good: true },
              { label: 'Staff Utilization', value: '87%', change: '+2.1', good: true },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-100/60 last:border-0">
                <span className="text-xs font-semibold text-slate-600">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-slate-900">{item.value}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item.good ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                    {item.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Module status */}
        <div className="glass-card p-6">
          <h2 className="font-display font-extrabold text-slate-900 text-sm mb-4 pb-3 border-b border-slate-100 flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-600">
              <Activity size={17} />
            </div>
            Module Health
          </h2>
          <div className="space-y-3">
            {[
              { name: 'Clinical AI Copilot', status: 'online', load: 82 },
              { name: 'RCM Engine', status: 'online', load: 45 },
              { name: 'FHIR Integration', status: 'online', load: 61 },
              { name: 'Security AI', status: 'online', load: 34 },
              { name: 'Patient Engagement', status: 'warning', load: 90 },
              { name: 'Ambient Scribing', status: 'online', load: 55 },
            ].map(m => (
              <div key={m.name} className="flex items-center gap-2.5">
                <div className={`w-2 h-2 rounded-full shrink-0
                  ${m.status === 'online' ? 'bg-emerald-500 shadow-xs shadow-emerald-500/50' : m.status === 'warning' ? 'bg-amber-500 animate-pulse' : 'bg-rose-500'}`} />
                <span className="text-xs font-bold text-slate-700 flex-1 truncate">{m.name}</span>
                <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60">
                  <div
                    className={`h-full rounded-full transition-all ${m.load > 80 ? 'bg-amber-500' : 'bg-primary-500'}`}
                    style={{ width: `${m.load}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-500 w-7 text-right">{m.load}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Activity */}
        <div className="glass-card p-6">
          <h2 className="font-display font-extrabold text-slate-900 text-sm mb-4 pb-3 border-b border-slate-100 flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-600">
              <Brain size={17} />
            </div>
            AI Activity Log
          </h2>
          <div className="space-y-2.5">
            {[
              { action: 'Risk score updated', patient: 'J. Wilson', time: '2m ago', type: 'risk' },
              { action: 'Prior auth approved', patient: 'M. Rivera', time: '5m ago', type: 'auth' },
              { action: 'Drug interaction flagged', patient: 'R. Kim', time: '8m ago', type: 'alert' },
              { action: 'Note transcribed', patient: 'S. Chen', time: '11m ago', type: 'doc' },
              { action: 'Claim validated', patient: 'T. Nguyen', time: '15m ago', type: 'claim' },
              { action: 'Anomaly detected', patient: 'P. Patel', time: '22m ago', type: 'security' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5 py-1">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0
                  ${item.type === 'alert' ? 'bg-rose-500' :
                    item.type === 'risk' ? 'bg-amber-500' :
                    item.type === 'auth' ? 'bg-emerald-500' : 'bg-primary-500'}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">{item.action}</p>
                  <p className="text-[11px] font-medium text-slate-500">{item.patient} · {item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

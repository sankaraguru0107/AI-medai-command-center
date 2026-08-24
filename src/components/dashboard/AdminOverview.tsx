import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, AlertTriangle, Bed, Brain, CreditCard,
  Heart, Lock, Users, TrendingUp, Zap
} from 'lucide-react';
import { MetricCard } from '../common/MetricCard';
import { AlertFeed } from '../common/AlertFeed';
import { VitalsChart, BedOccupancyChart, TrendChart, ClaimsDistribution } from '../charts';
import { useAppStore, generateDemoAlerts } from '../../store/appStore';

// Demo data
const vitalsData = Array.from({ length: 12 }, (_, i) => ({
  time: `${8 + i}:00`,
  hr: 68 + Math.round(Math.sin(i * 0.6) * 12 + Math.random() * 8),
  spo2: 96 + Math.round(Math.sin(i * 0.4) * 2),
}));

const bedData = [
  { unit: 'ICU', occupied: 18, total: 20 },
  { unit: 'Med/Surg', occupied: 42, total: 55 },
  { unit: 'ED', occupied: 28, total: 35 },
  { unit: 'PICU', occupied: 10, total: 12 },
  { unit: 'Maternity', occupied: 14, total: 18 },
  { unit: 'Oncology', occupied: 22, total: 28 },
];

const admissionTrend = Array.from({ length: 14 }, (_, i) => ({
  date: `${i + 1}/Apr`,
  admissions: 28 + Math.round(Math.random() * 12),
  discharges: 25 + Math.round(Math.random() * 10),
  transfers: 6 + Math.round(Math.random() * 4),
}));

const claimsData = [
  { name: 'Approved', value: 62 },
  { name: 'Pending', value: 18 },
  { name: 'Denied', value: 12 },
  { name: 'In Review', value: 8 },
];

const recentActivity = [
  { time: '2m ago', event: 'Critical alert: ICU Bed 4B — SpO2 critical', type: 'critical', user: 'System AI' },
  { time: '8m ago', event: 'Prior auth approved: MRI Brain — Patient Rivera', type: 'success', user: 'Auth Engine' },
  { time: '14m ago', event: 'Drug interaction flagged: Warfarin + Amoxicillin', type: 'warning', user: 'Med Safety AI' },
  { time: '22m ago', event: 'New patient admitted: James Wilson (ID: MRN-4821)', type: 'info', user: 'Admissions' },
  { time: '35m ago', event: 'Security alert: Unusual EHR access from 203.0.113.42', type: 'warning', user: 'SOC AI' },
  { time: '41m ago', event: 'Claim submitted: $4,280 — Procedure 99213', type: 'info', user: 'RCM Bot' },
  { time: '1h ago', event: 'Bed turnover completed: Unit 3C, Bed 8', type: 'success', user: 'Ops System' },
  { time: '1h ago', event: 'Clinical note generated: Dr. Chen — Patient Kim', type: 'info', user: 'Clinical AI' },
];

const typeColors = {
  critical: 'bg-rose-500',
  warning: 'bg-amber-500',
  success: 'bg-emerald-500',
  info: 'bg-blue-500',
};

export const AdminOverview: React.FC = () => {
  const { setAlerts } = useAppStore();

  useEffect(() => {
    setAlerts(generateDemoAlerts());
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-[1600px]">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Command Overview</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time hospital operations · {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-medium text-emerald-700">
            <span className="dot-live" />
            All Systems Operational
          </div>
        </div>
      </motion.div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard title="Total Patients" value="248" subtitle="Active admits" trend={3.2} trendLabel="vs yesterday" icon={<Users size={16} />} color="blue" delay={0} />
        <MetricCard title="Bed Occupancy" value="84%" subtitle="168 / 200 beds" trend={-1.8} icon={<Bed size={16} />} color="teal" badge="High" badgeType="warning" delay={0.05} />
        <MetricCard title="Active Alerts" value="6" subtitle="2 critical" icon={<AlertTriangle size={16} />} color="rose" badge="2 Critical" badgeType="danger" delay={0.1} />
        <MetricCard title="Claims Today" value="$142K" subtitle="38 submitted" trend={8.5} icon={<CreditCard size={16} />} color="violet" delay={0.15} />
        <MetricCard title="AI Assists" value="1,284" subtitle="Last 24 hours" trend={12.4} icon={<Brain size={16} />} color="amber" delay={0.2} />
        <MetricCard title="Security Score" value="94/100" subtitle="HIPAA compliant" trend={1.2} icon={<Lock size={16} />} color="emerald" badge="Secure" badgeType="success" delay={0.25} />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bed occupancy */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-semibold text-slate-800">Bed Occupancy by Unit</h3>
                <p className="text-xs text-slate-400 mt-0.5">Real-time capacity across all units</p>
              </div>
              <span className="badge-warning">84% capacity</span>
            </div>
            <BedOccupancyChart data={bedData} />
          </motion.div>

          {/* Admissions trend */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="glass-card p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-semibold text-slate-800">Admission Trends — April 2026</h3>
                <p className="text-xs text-slate-400 mt-0.5">Daily admissions, discharges, and transfers</p>
              </div>
              <span className="badge-info">14-day view</span>
            </div>
            <TrendChart
              data={admissionTrend}
              xKey="date"
              lines={[
                { key: 'admissions', label: 'Admissions' },
                { key: 'discharges', label: 'Discharges' },
                { key: 'transfers', label: 'Transfers' },
              ]}
            />
          </motion.div>

          {/* Bottom row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Claims distribution */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card p-5"
            >
              <h3 className="font-display font-semibold text-slate-800 mb-1">Claims Distribution</h3>
              <p className="text-xs text-slate-400 mb-3">Today's RCM pipeline</p>
              <ClaimsDistribution data={claimsData} />
            </motion.div>

            {/* Vitals sample */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="glass-card p-5"
            >
              <h3 className="font-display font-semibold text-slate-800 mb-1">ICU — Avg Vitals</h3>
              <p className="text-xs text-slate-400 mb-3">Heart rate & SpO2 today</p>
              <VitalsChart data={vitalsData} metrics={['hr', 'spo2']} />
            </motion.div>
          </div>
        </div>

        {/* Right column — alerts + activity */}
        <div className="space-y-6">
          {/* Active alerts */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-slate-800">Active Alerts</h3>
              <span className="badge-danger">6 unresolved</span>
            </div>
            <AlertFeed maxItems={6} compact />
          </motion.div>

          {/* Module status */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
            className="glass-card p-5"
          >
            <h3 className="font-display font-semibold text-slate-800 mb-4">Module Status</h3>
            <div className="space-y-2.5">
              {[
                { name: 'Clinical AI Copilots', status: 'online', metric: '1,284 assists/day' },
                { name: 'Prior Auth Engine', status: 'online', metric: '98% auto-approval' },
                { name: 'FHIR Gateway', status: 'online', metric: '2.4M msgs/day' },
                { name: 'Med Safety AI', status: 'online', metric: '23 flags today' },
                { name: 'SOC Monitor', status: 'warning', metric: '1 active threat' },
                { name: 'Ambient Scribing', status: 'online', metric: '42 active sessions' },
              ].map((mod) => (
                <div key={mod.name} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full shrink-0
                    ${mod.status === 'online' ? 'bg-emerald-400' :
                      mod.status === 'warning' ? 'bg-amber-400' : 'bg-rose-400'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-slate-700 truncate">{mod.name}</div>
                    <div className="text-[10px] text-slate-400">{mod.metric}</div>
                  </div>
                  <span className={`text-[10px] font-semibold capitalize
                    ${mod.status === 'online' ? 'text-emerald-600' :
                      mod.status === 'warning' ? 'text-amber-600' : 'text-rose-600'}`}>
                    {mod.status}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Activity timeline */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-5"
          >
            <h3 className="font-display font-semibold text-slate-800 mb-4">Activity Timeline</h3>
            <div className="relative">
              <div className="absolute left-2 top-0 bottom-0 w-px bg-surface-200" />
              <div className="space-y-3 pl-6">
                {recentActivity.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.04 }}
                    className="relative"
                  >
                    <div className={`absolute -left-6 top-1.5 w-2 h-2 rounded-full border-2 border-white ${typeColors[item.type as keyof typeof typeColors]}`} />
                    <div>
                      <p className="text-xs text-slate-700 leading-snug">{item.event}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-slate-400">{item.time}</span>
                        <span className="text-[10px] text-slate-400">·</span>
                        <span className="text-[10px] text-primary-500 font-medium">{item.user}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

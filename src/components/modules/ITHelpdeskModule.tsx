import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Server, CheckCircle, AlertTriangle } from 'lucide-react';
import { MetricCard } from '../common/MetricCard';

export const ITHelpdeskModule: React.FC = () => {
  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
            IT Helpdesk & Ticket Resolution AI <Settings className="text-slate-700" />
          </h1>
          <p className="text-sm text-slate-500">Autonomous EHR/PACS system ticket resolution bot and IT incident queue management.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="Active Tickets" value="1 Open" subtitle="100% SLA compliant" icon={<AlertTriangle size={16} />} color="blue" delay={0} />
        <MetricCard title="Auto-Resolution Rate" value="88.4%" subtitle="Resolved by AI Bot" icon={<CheckCircle size={16} />} color="emerald" delay={0.05} />
        <MetricCard title="Avg Resolution Time" value="1.8 Mins" subtitle="Instant triage" icon={<Server size={16} />} color="teal" delay={0.1} />
        <MetricCard title="System Availability" value="99.99%" subtitle="PACS & EHR online" icon={<CheckCircle size={16} />} color="rose" delay={0.15} />
      </div>

      <div className="glass-card p-5 space-y-4">
        <h3 className="font-bold text-sm text-slate-800 border-b pb-2">IT Helpdesk Queue</h3>
        <div className="space-y-3 text-xs">
          <div className="p-3 bg-slate-50 border rounded-xl flex justify-between items-center">
            <div>
              <p className="font-bold text-slate-800">INC-901: Epic Hyperspace Slow Login (Building B)</p>
              <p className="text-[10px] text-slate-500">Priority: High · Assigned: AI Auto-Resolver · Time: 8 mins ago</p>
            </div>
            <span className="badge-warning text-[10px]">In Progress</span>
          </div>
        </div>
      </div>
    </div>
  );
};

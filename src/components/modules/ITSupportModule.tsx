import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, MessageCircle, Server, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { MetricCard } from '../common/MetricCard';

export const ITSupportModule: React.FC = () => {
  const [tickets, setTickets] = useState([
    { id: 'INC-901', title: 'Epic Hyperspace Slow Login (Building B)', priority: 'High', status: 'In Progress', time: '10 mins ago' },
    { id: 'INC-882', title: 'DICOM Router Listener Timeout', priority: 'Medium', status: 'Auto-Resolved', time: '1 hour ago' }
  ]);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
            IT Helpdesk & Clinical App Support AI <Settings className="text-slate-700" />
          </h1>
          <p className="text-sm text-slate-500">Autonomous EHR/PACS system uptime monitoring and ticket resolution AI.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="System Uptime" value="99.99%" subtitle="EHR & PACS online" icon={<Server size={16} />} color="teal" delay={0} />
        <MetricCard title="Open IT Tickets" value="1 Ticket" subtitle="100% SLA compliant" icon={<AlertTriangle size={16} />} color="blue" delay={0.05} />
        <MetricCard title="Auto-Resolved AI" value="88.4%" subtitle="Zero IT intervention" icon={<CheckCircle size={16} />} color="amber" delay={0.1} />
        <MetricCard title="Avg Resolution" value="1.8 Mins" subtitle="Instant bot response" icon={<RefreshCw size={16} />} color="rose" delay={0.15} />
      </div>

      <div className="glass-card p-5 space-y-4">
        <h3 className="font-bold text-sm text-slate-800 border-b pb-2">Active IT Incident Queue</h3>
        <div className="space-y-3 text-xs">
          {tickets.map(t => (
            <div key={t.id} className="p-3 bg-slate-50 border rounded-xl flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-800">{t.id}: {t.title}</span>
                <p className="text-[10px] text-slate-400">Reported: {t.time}</p>
              </div>
              <span className={`badge text-[10px] ${t.status === 'Auto-Resolved' ? 'badge-success' : 'badge-warning'}`}>
                {t.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Brain, CheckCircle, Database, RefreshCw, Server, Zap, XCircle } from 'lucide-react';
import { MetricCard } from '../common/MetricCard';
import { TrendChart } from '../charts';
import { askMedAI } from '../../services/azureOpenAI';

const endpoints = [
  { id: 'e1', name: 'Epic EHR FHIR R4', type: 'EHR', status: 'connected', lastSync: '2m ago', records: '48,291', version: 'R4' },
  { id: 'e2', name: 'Cerner PowerChart', type: 'EHR', status: 'connected', lastSync: '5m ago', records: '22,847', version: 'R4' },
  { id: 'e3', name: 'Quest Diagnostics HL7', type: 'Lab', status: 'connected', lastSync: '1m ago', records: '12,448', version: 'HL7 v2.5' },
  { id: 'e4', name: 'Radiology PACS', type: 'Imaging', status: 'warning', lastSync: '15m ago', records: '8,102', version: 'DICOM' },
  { id: 'e5', name: 'Pharmacy System', type: 'Pharmacy', status: 'connected', lastSync: '3m ago', records: '31,200', version: 'NCPDP' },
  { id: 'e6', name: 'CMS Medicare API', type: 'Payer', status: 'error', lastSync: '2h ago', records: '—', version: 'FHIR R4' },
];

const syncTrend = Array.from({ length: 12 }, (_, i) => ({
  time: `${i * 2}h`,
  records: 800 + Math.round(Math.random() * 400),
  errors: Math.round(Math.random() * 15),
}));

const recentMessages = [
  { id: 'm1', type: 'ADT^A01', desc: 'Patient Admit — J. Wilson', source: 'Epic', time: '1m ago', status: 'processed' },
  { id: 'm2', type: 'ORU^R01', desc: 'Lab Result — Glucose 287', source: 'Quest', time: '2m ago', status: 'processed' },
  { id: 'm3', type: 'SIU^S12', desc: 'Schedule Appointment', source: 'Epic', time: '4m ago', status: 'processed' },
  { id: 'm4', type: 'RDE^O11', desc: 'Pharmacy Order — Metformin', source: 'Pharmacy', time: '7m ago', status: 'processed' },
  { id: 'm5', type: 'ORM^O01', desc: 'Radiology Order — MRI Brain', source: 'Epic', time: '12m ago', status: 'failed' },
];

export const FHIRModule: React.FC = () => {
  const [aiResult, setAiResult] = useState('');
  const [loading, setLoading] = useState(false);

  const runAI = async (action: string) => {
    setLoading(true);
    try {
      const res = await askMedAI(`${action}. System status: ${endpoints.map(e => `${e.name}: ${e.status}`).join(', ')}`, 'operations');
      setAiResult(res);
    } finally { setLoading(false); }
  };

  const connected = endpoints.filter(e => e.status === 'connected').length;

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">FHIR / HL7 Integration Engine</h1>
          <p className="text-sm text-slate-400">Interoperability layer · {connected}/{endpoints.length} endpoints connected</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => runAI('Analyze integration health and identify data quality issues')} className="btn-primary text-xs">
            <Brain size={13} />AI Health Check
          </button>
          <button className="btn-secondary text-xs"><RefreshCw size={13} />Sync All</button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Connected" value={`${connected}/${endpoints.length}`} icon={<Database size={16} />} color="emerald" delay={0} />
        <MetricCard title="Records Today" value="1,248" subtitle="Synced records" trend={8.2} icon={<Activity size={16} />} color="blue" delay={0.05} />
        <MetricCard title="Errors" value="3" subtitle="Last 24h" icon={<XCircle size={16} />} color="rose" delay={0.1} />
        <MetricCard title="Msg/Min" value="42" subtitle="Throughput" icon={<Server size={16} />} color="teal" delay={0.15} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5">
          <h3 className="font-display font-semibold text-slate-800 text-sm mb-4">Integration Endpoints</h3>
          <div className="space-y-2">
            {endpoints.map(ep => (
              <div key={ep.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors
                ${ep.status === 'connected' ? 'bg-emerald-50 border-emerald-200' :
                  ep.status === 'warning' ? 'bg-amber-50 border-amber-200' :
                  'bg-rose-50 border-rose-200'}`}>
                <div className={`w-2 h-2 rounded-full shrink-0 ${ep.status === 'connected' ? 'bg-emerald-500 dot-live' : ep.status === 'warning' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-700 truncate">{ep.name}</p>
                  <p className="text-xs text-slate-400">Last sync: {ep.lastSync} · {ep.records} records</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-slate-500 font-medium">{ep.version}</p>
                  <span className={`text-[10px] font-semibold ${ep.status === 'connected' ? 'text-emerald-600' : ep.status === 'warning' ? 'text-amber-600' : 'text-rose-600'}`}>
                    {ep.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card p-5">
            <h3 className="font-display font-semibold text-slate-800 text-sm mb-3">Sync Activity — 24h</h3>
            <TrendChart data={syncTrend} lines={[{ key: 'records', label: 'Records' }, { key: 'errors', label: 'Errors', color: '#e11d48' }]} xKey="time" height={140} />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5">
            <h3 className="font-display font-semibold text-slate-800 text-sm mb-3">Recent Messages</h3>
            <div className="space-y-2">
              {recentMessages.map(msg => (
                <div key={msg.id} className="flex items-center gap-2.5">
                  {msg.status === 'processed' ? <CheckCircle size={12} className="text-emerald-500 shrink-0" /> : <XCircle size={12} className="text-rose-500 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-700 truncate"><span className="font-mono font-medium text-primary-600">{msg.type}</span> — {msg.desc}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">{msg.time}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {['Check data quality', 'Find mapping errors', 'Analyze throughput'].map(action => (
                <button key={action} onClick={() => runAI(action)} disabled={loading}
                  className="px-2.5 py-1 bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs rounded-lg font-medium flex items-center gap-1 disabled:opacity-50">
                  <Zap size={10} />{action}
                </button>
              ))}
            </div>

            {(loading || aiResult) && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 bg-primary-50 border border-primary-100 rounded-xl">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Brain size={12} className="text-primary-500" />
                  <span className="text-xs font-semibold text-primary-700">AI Integration Analysis</span>
                </div>
                {loading ? <div className="flex gap-1">{[0,150,300].map(d=><span key={d} className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{animationDelay:`${d}ms`}}/>)}</div>
                : <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">{aiResult}</p>}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
